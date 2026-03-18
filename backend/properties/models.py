from django.conf import settings
from django.db import models


class Property(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="properties",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default="USA")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name


class Unit(models.Model):
    class Status(models.TextChoices):
        VACANT = "VACANT", "Vacant"
        OCCUPIED = "OCCUPIED", "Occupied"
        MAINTENANCE = "MAINTENANCE", "Under maintenance"

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="units",
    )
    unit_number = models.CharField(max_length=50)
    floor = models.IntegerField(blank=True, null=True)
    bedrooms = models.PositiveIntegerField(default=0)
    bathrooms = models.PositiveIntegerField(default=0)
    square_feet = models.PositiveIntegerField(blank=True, null=True)
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.VACANT,
    )
    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="rented_units",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("property", "unit_number")

    def __str__(self) -> str:
        return f"{self.property.name} - {self.unit_number}"

