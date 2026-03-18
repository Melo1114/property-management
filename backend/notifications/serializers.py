from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "kind",
            "read",
            "created_at",
            "target_id",
            "target_type",
        ]
        read_only_fields = ["id", "title", "message", "kind", "created_at", "target_id", "target_type"]
