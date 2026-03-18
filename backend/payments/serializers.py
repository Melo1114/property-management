from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from .models import Invoice, Payment


class InvoiceSerializer(serializers.ModelSerializer):
    lease_detail = serializers.SerializerMethodField(read_only=True)
    amount_paid = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    balance = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Invoice
        fields = [
            "id",
            "lease",
            "due_date",
            "amount",
            "description",
            "period_start",
            "period_end",
            "status",
            "created_at",
            "updated_at",
            "lease_detail",
            "amount_paid",
            "balance",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_lease_detail(self, obj: Invoice):
        lease = obj.lease
        unit = lease.unit
        return {
            "lease_id": lease.id,
            "unit_id": unit.id,
            "property_name": unit.property.name,
            "unit_number": unit.unit_number,
            "tenant_id": lease.tenant_id,
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["amount_paid"] = str(instance.amount_paid)
        data["balance"] = str(instance.balance)
        return data


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "invoice",
            "amount",
            "status",
            "method",
            "reference",
            "created_at",
            "processed_by",
        ]
        read_only_fields = ["id", "created_at", "processed_by"]

    def validate_amount(self, value: Decimal):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate(self, attrs):
        invoice = attrs.get("invoice") or getattr(self.instance, "invoice", None)
        amount = attrs.get("amount") or getattr(self.instance, "amount", None)
        status = attrs.get("status") or getattr(
            self.instance,
            "status",
            Payment.Status.COMPLETED,
        )
        if invoice and amount and status == Payment.Status.COMPLETED:
            remaining = invoice.balance
            if self.instance is not None and self.instance.status == Payment.Status.COMPLETED:
                remaining += self.instance.amount
            if amount > remaining:
                raise serializers.ValidationError(
                    {"amount": "Payment exceeds invoice remaining balance."}
                )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            validated_data["processed_by"] = user

        payment = super().create(validated_data)

        invoice = payment.invoice
        if payment.status == Payment.Status.COMPLETED:
            if invoice.balance == 0:
                invoice.status = Invoice.Status.PAID
            else:
                invoice.status = Invoice.Status.PARTIALLY_PAID
            invoice.save(update_fields=["status", "updated_at"])

        return payment

