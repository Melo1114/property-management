from rest_framework import serializers

from .models import MaintenanceComment, MaintenanceRequest


class MaintenanceCommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = MaintenanceComment
        fields = ["id", "request", "author", "author_username", "body", "created_at"]
        read_only_fields = ["id", "author", "created_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            validated_data["author"] = user
        return super().create(validated_data)


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    unit_detail = serializers.SerializerMethodField(read_only=True)
    reported_by_username = serializers.CharField(
        source="reported_by.username", read_only=True
    )
    assigned_to_username = serializers.CharField(
        source="assigned_to.username", read_only=True
    )
    comments = MaintenanceCommentSerializer(many=True, read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = [
            "id",
            "unit",
            "reported_by",
            "title",
            "description",
            "priority",
            "status",
            "assigned_to",
            "created_at",
            "updated_at",
            "unit_detail",
            "reported_by_username",
            "assigned_to_username",
            "comments",
        ]
        read_only_fields = ["id", "reported_by", "created_at", "updated_at"]

    def get_unit_detail(self, obj: MaintenanceRequest):
        unit = obj.unit
        return {
            "id": unit.id,
            "property_name": unit.property.name,
            "unit_number": unit.unit_number,
        }

    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            validated_data["reported_by"] = user
        return super().create(validated_data)
