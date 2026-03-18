from django.conf import settings
from django.db import models

from leases.models import Lease


class Invoice(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SENT = "SENT", "Sent"
        PARTIALLY_PAID = "PARTIALLY_PAID", "Partially paid"
        PAID = "PAID", "Paid"
        CANCELLED = "CANCELLED", "Cancelled"

    lease = models.ForeignKey(
        Lease,
        on_delete=models.PROTECT,
        related_name="invoices",
    )
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    period_start = models.DateField(blank=True, null=True)
    period_end = models.DateField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-due_date"]

    def __str__(self) -> str:
        return f"Invoice #{self.pk} for lease {self.lease_id}"

    @property
    def amount_paid(self):
        return (
            self.payments.filter(status=Payment.Status.COMPLETED).aggregate(
                total=models.Sum("amount")
            )["total"]
            or 0
        )

    @property
    def balance(self):
        return self.amount - self.amount_paid


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        COMPLETED = "COMPLETED", "Completed"
        FAILED = "FAILED", "Failed"

    class Method(models.TextChoices):
        MANUAL = "MANUAL", "Manual"
        CARD = "CARD", "Card"
        BANK_TRANSFER = "BANK_TRANSFER", "Bank transfer"
        OTHER = "OTHER", "Other"

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.COMPLETED,
    )
    method = models.CharField(
        max_length=20,
        choices=Method.choices,
        default=Method.MANUAL,
    )
    reference = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_payments",
    )

    def __str__(self) -> str:
        return f"Payment #{self.pk} for invoice {self.invoice_id}"

