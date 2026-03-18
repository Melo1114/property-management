from rest_framework import serializers

from .models import Property, Unit


class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = [
            "id",
            "name",
            "description",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "postal_code",
            "country",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user is not None and user.is_authenticated:
            return Property.objects.create(owner=user, **validated_data)
        return super().create(validated_data)


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = [
            "id",
            "property",
            "unit_number",
            "floor",
            "bedrooms",
            "bathrooms",
            "square_feet",
            "rent_amount",
            "status",
            "tenant",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

