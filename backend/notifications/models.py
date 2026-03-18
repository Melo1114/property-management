from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Kind(models.TextChoices):
        MAINTENANCE_NEW = "MAINTENANCE_NEW", "New maintenance request"
        MAINTENANCE_UPDATED = "MAINTENANCE_UPDATED", "Maintenance request updated"
        INVOICE_SENT = "INVOICE_SENT", "Invoice sent"
        PAYMENT_RECEIVED = "PAYMENT_RECEIVED", "Payment received"
        OTHER = "OTHER", "Other"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    kind = models.CharField(
        max_length=30,
        choices=Kind.choices,
        default=Kind.OTHER,
    )
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    # Optional link to related object for frontend deep-linking
    target_id = models.PositiveIntegerField(null=True, blank=True)
    target_type = models.CharField(max_length=50, blank=True)  # e.g. "maintenance_request", "invoice"

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.title} for {self.user_id}"
