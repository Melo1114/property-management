from django.utils import timezone
from rest_framework import serializers

from properties.models import Unit
from .models import Lease


class LeaseSerializer(serializers.ModelSerializer):
    unit_detail = serializers.SerializerMethodField(read_only=True)
    tenant_detail = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lease
        fields = [
            "id",
            "unit",
            "tenant",
            "start_date",
            "end_date",
            "rent_amount",
            "security_deposit",
            "status",
            "created_at",
            "updated_at",
            "unit_detail",
            "tenant_detail",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        start = attrs.get("start_date") or getattr(self.instance, "start_date", None)
        end = attrs.get("end_date") or getattr(self.instance, "end_date", None)
        if start and end and end <= start:
            raise serializers.ValidationError(
                {"end_date": "End date must be after start date."}
            )

        unit = attrs.get("unit") or getattr(self.instance, "unit", None)
        tenant = attrs.get("tenant") or getattr(self.instance, "tenant", None)
        status = attrs.get("status") or getattr(
            self.instance,
            "status",
            Lease.Status.DRAFT,
        )

        # Ensure only one ACTIVE lease per unit at a time
        if unit and status == Lease.Status.ACTIVE:
            qs = Lease.objects.filter(unit=unit, status=Lease.Status.ACTIVE)
            if self.instance is not None:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"unit": "This unit already has an active lease."}
                )

        if status == Lease.Status.ACTIVE and tenant is None:
            raise serializers.ValidationError(
                {"tenant": "Active leases must have a tenant."}
            )

        return attrs

    def _update_unit_occupancy(self, lease: Lease) -> None:
        unit: Unit = lease.unit
        if lease.status == Lease.Status.ACTIVE:
            unit.tenant = lease.tenant
            unit.status = Unit.Status.OCCUPIED
        elif lease.status == Lease.Status.TERMINATED:
            # Only clear if this lease is the current tenant
            if unit.tenant == lease.tenant:
                unit.tenant = None
                unit.status = Unit.Status.VACANT
        unit.save(update_fields=["tenant", "status", "updated_at"])

    def create(self, validated_data):
        lease = super().create(validated_data)
        if lease.status == Lease.Status.ACTIVE:
            self._update_unit_occupancy(lease)
        return lease

    def update(self, instance, validated_data):
        old_status = instance.status
        lease = super().update(instance, validated_data)
        if lease.status != old_status:
            self._update_unit_occupancy(lease)
        return lease

    def get_unit_detail(self, obj: Lease):
        unit = obj.unit
        return {
            "id": unit.id,
            "property_name": unit.property.name,
            "unit_number": unit.unit_number,
        }

    def get_tenant_detail(self, obj: Lease):
        tenant = obj.tenant
        if tenant is None:
            return None
        return {
            "id": tenant.id,
            "username": tenant.username,
            "email": tenant.email,
        }

