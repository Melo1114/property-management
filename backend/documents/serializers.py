from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from .models import Document


ALLOWED_CONTENT_TYPES = {
    "lease": "leases.lease",
    "invoice": "payments.invoice",
    "property": "properties.property",
    "maintenance_request": "maintenance.maintenancerequest",
}


class DocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField(read_only=True)
    content_type_label = serializers.SerializerMethodField(read_only=True)
    content_type = serializers.PrimaryKeyRelatedField(
        queryset=ContentType.objects.all(),
        required=False,
    )

    class Meta:
        model = Document
        fields = [
            "id",
            "content_type",
            "object_id",
            "uploaded_by",
            "file",
            "file_url",
            "name",
            "kind",
            "created_at",
            "content_type_label",
        ]
        read_only_fields = ["id", "uploaded_by", "created_at"]

    def get_file_url(self, obj: Document):
        request = self.context.get("request")
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None

    def get_content_type_label(self, obj: Document):
        if obj.content_type_id:
            return f"{obj.content_type.app_label}.{obj.content_type.model}"
        return None

    def validate(self, attrs):
        # Allow content_type_model (string) for easier API: "lease"|"invoice"|"property"|"maintenance_request"
        data = self.initial_data
        if hasattr(self, "_context") and self.context.get("request"):
            data = {**data, **self.context["request"].data}
        content_type_model = data.get("content_type_model")
        if content_type_model and content_type_model in ALLOWED_CONTENT_TYPES:
            app_label, model = ALLOWED_CONTENT_TYPES[content_type_model].split(".")
            attrs["content_type"] = ContentType.objects.get(app_label=app_label, model=model)
        if not attrs.get("content_type"):
            raise serializers.ValidationError(
                {"content_type": "Set content_type (id) or content_type_model (lease, invoice, property, maintenance_request)."}
            )
        object_id = attrs.get("object_id") or data.get("object_id")
        if object_id is not None:
            attrs["object_id"] = int(object_id)
        if not attrs.get("object_id"):
            raise serializers.ValidationError({"object_id": "Required."})
        return attrs

    def validate_content_type(self, value):
        if value is None:
            return value
        key = f"{value.app_label}.{value.model}"
        if key not in ALLOWED_CONTENT_TYPES.values():
            raise serializers.ValidationError(
                "Document can only be attached to Lease, Invoice, Property, or MaintenanceRequest."
            )
        return value

    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            validated_data["uploaded_by"] = user
        return super().create(validated_data)
