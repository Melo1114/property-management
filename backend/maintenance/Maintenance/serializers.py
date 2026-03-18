from rest_framework import serializers
from accounts.models import Role
from .models import MaintenanceComment, MaintenanceRequest


class MaintenanceCommentSerializer(serializers.ModelSerializer):
    author_username  = serializers.CharField(source="author.username",    read_only=True)
    author_full_name = serializers.CharField(source="author.get_full_name", read_only=True)

    class Meta:
        model  = MaintenanceComment
        fields = [
            "id", "request", "author", "author_username",
            "author_full_name", "body", "created_at",
        ]
        read_only_fields = ["id", "author", "created_at"]

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    unit_detail          = serializers.SerializerMethodField(read_only=True)
    reported_by_username = serializers.CharField(source="reported_by.username",     read_only=True)
    reported_by_name     = serializers.CharField(source="reported_by.get_full_name", read_only=True)
    assigned_to_username = serializers.CharField(source="assigned_to.username",     read_only=True)
    assigned_to_name     = serializers.CharField(source="assigned_to.get_full_name", read_only=True)
    comments             = MaintenanceCommentSerializer(many=True, read_only=True)

    class Meta:
        model  = MaintenanceRequest
        fields = [
            "id", "unit", "unit_detail",
            "reported_by", "reported_by_username", "reported_by_name",
            "title", "description", "priority", "status",
            "assigned_to", "assigned_to_username", "assigned_to_name",
            "comments", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "reported_by",
            "status",       # status is changed only through workflow actions
            "assigned_to",  # assigned only through /assign/ action
            "created_at", "updated_at",
        ]

    def get_unit_detail(self, obj):
        unit = obj.unit
        return {
            "id":            unit.id,
            "unit_number":   unit.unit_number,
            "property_name": unit.property.name,
            "property_id":   unit.property.id,
        }

    def create(self, validated_data):
        validated_data["reported_by"] = self.context["request"].user
        return super().create(validated_data)


# ── Workflow Action Serializers ───────────────────────────────────────────────

class AssignMaintenanceSerializer(serializers.Serializer):
    """
    Used for POST /maintenance-requests/<id>/assign/
    Validates that the assignee is a Vendor.
    """
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=__import__("django.contrib.auth", fromlist=["get_user_model"])
                 .get_user_model().objects.filter(role=Role.VENDOR)
    )
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_assigned_to(self, user):
        if user.role != Role.VENDOR:
            raise serializers.ValidationError(
                f"{user.get_full_name()} is not a Vendor. Only Vendors can be assigned."
            )
        return user

    def update(self, instance, validated_data):
        if instance.status == MaintenanceRequest.Status.CANCELLED:
            raise serializers.ValidationError(
                "Cannot assign a cancelled maintenance request."
            )
        if instance.status == MaintenanceRequest.Status.RESOLVED:
            raise serializers.ValidationError(
                "Cannot re-assign an already resolved request."
            )
        instance.assigned_to = validated_data["assigned_to"]
        instance.status      = MaintenanceRequest.Status.IN_PROGRESS
        instance.save()

        # Optionally attach a comment with notes
        notes = validated_data.get("notes", "").strip()
        if notes:
            MaintenanceComment.objects.create(
                request=instance,
                author=self.context["request"].user,
                body=f"[Assigned to {instance.assigned_to.get_full_name()}] {notes}",
            )
        return instance


class ResolveMaintenanceSerializer(serializers.Serializer):
    """
    Used for PATCH /maintenance-requests/<id>/resolve/
    Only the assigned vendor (or Admin/PM) can mark as resolved.
    Resolution note is required.
    """
    resolution_note = serializers.CharField(
        min_length=10,
        error_messages={"min_length": "Please provide a resolution note (min 10 characters)."}
    )

    def validate(self, attrs):
        instance = self.instance
        if instance.status != MaintenanceRequest.Status.IN_PROGRESS:
            raise serializers.ValidationError(
                f"Only IN_PROGRESS requests can be resolved. Current status: {instance.status}."
            )
        return attrs

    def update(self, instance, validated_data):
        instance.status = MaintenanceRequest.Status.RESOLVED
        instance.save()

        MaintenanceComment.objects.create(
            request=instance,
            author=self.context["request"].user,
            body=f"[Resolved] {validated_data['resolution_note']}",
        )
        return instance


class CancelMaintenanceSerializer(serializers.Serializer):
    """
    Used for PATCH /maintenance-requests/<id>/cancel/
    Admin & PM only. Cancels an OPEN or IN_PROGRESS request.
    """
    reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        instance = self.instance
        if instance.status in (
            MaintenanceRequest.Status.RESOLVED,
            MaintenanceRequest.Status.CANCELLED,
        ):
            raise serializers.ValidationError(
                f"Cannot cancel a request with status '{instance.status}'."
            )
        return attrs

    def update(self, instance, validated_data):
        instance.status = MaintenanceRequest.Status.CANCELLED
        instance.save()

        reason = validated_data.get("reason", "").strip()
        if reason:
            MaintenanceComment.objects.create(
                request=instance,
                author=self.context["request"].user,
                body=f"[Cancelled] {reason}",
            )
        return instance
