from rest_framework import serializers
from .models import Property, Unit


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Unit
        fields = [
            "id", "property", "unit_number", "floor",
            "bedrooms", "bathrooms", "size_sqm",
            "monthly_rent", "deposit", "status",
            "description", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class UnitInlineSerializer(serializers.ModelSerializer):
    """Lightweight unit representation nested inside PropertyDetailSerializer."""
    class Meta:
        model  = Unit
        fields = [
            "id", "unit_number", "floor",
            "bedrooms", "bathrooms",
            "monthly_rent", "status",
        ]


class PropertySerializer(serializers.ModelSerializer):
    """Used for list and create."""
    total_units     = serializers.IntegerField(read_only=True)
    available_units = serializers.IntegerField(read_only=True)
    manager_name    = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = Property
        fields = [
            "id", "manager", "manager_name", "name",
            "property_type", "address", "city", "province",
            "postal_code", "country", "description",
            "is_active", "total_units", "available_units",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_manager_name(self, obj):
        return obj.manager.get_full_name() if obj.manager else None


class PropertyDetailSerializer(PropertySerializer):
    """Used for retrieve — includes nested units."""
    units = UnitInlineSerializer(many=True, read_only=True)

    class Meta(PropertySerializer.Meta):
        fields = PropertySerializer.Meta.fields + ["units"]
