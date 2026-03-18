from django.conf import settings
from django.db import models


class Lease(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        ACTIVE = "ACTIVE", "Active"
        TERMINATED = "TERMINATED", "Terminated"

    unit = models.ForeignKey(
        "properties.Unit",
        on_delete=models.PROTECT,
        related_name="leases",
    )
    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="leases",
    )
    start_date = models.DateField()
    end_date = models.DateField()
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    security_deposit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self) -> str:
        return f"Lease for {self.unit} to {self.tenant} ({self.start_date} - {self.end_date})"

