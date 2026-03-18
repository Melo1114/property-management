from django.db import models
from django.conf import settings


class PropertyType(models.TextChoices):
    RESIDENTIAL = "Residential", "Residential"
    COMMERCIAL  = "Commercial",  "Commercial"
    MIXED_USE   = "MixedUse",   "Mixed Use"


class Property(models.Model):
    """
    A real estate property managed by a PropertyManager or Admin.
    One manager can own/manage many properties.
    """
    manager      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="managed_properties",
        limit_choices_to={"role__in": ["Admin", "PropertyManager"]},
    )
    name         = models.CharField(max_length=255)
    property_type = models.CharField(
        max_length=20,
        choices=PropertyType.choices,
        default=PropertyType.RESIDENTIAL,
    )
    address      = models.TextField()
    city         = models.CharField(max_length=100)
    province     = models.CharField(max_length=100)
    postal_code  = models.CharField(max_length=10)
    country      = models.CharField(max_length=100, default="South Africa")
    description  = models.TextField(blank=True)
    is_active    = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table  = "properties"
        ordering  = ["-created_at"]
        verbose_name        = "Property"
        verbose_name_plural = "Properties"

    def __str__(self):
        return f"{self.name} ({self.property_type})"

    @property
    def total_units(self):
        return self.units.count()

    @property
    def available_units(self):
        return self.units.filter(status=UnitStatus.AVAILABLE).count()


class UnitStatus(models.TextChoices):
    AVAILABLE   = "Available",   "Available"
    OCCUPIED    = "Occupied",    "Occupied"
    MAINTENANCE = "Maintenance", "Under Maintenance"


class Unit(models.Model):
    """
    An individual rentable unit within a Property.
    A Unit can only have one active Lease at a time.
    """
    property    = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="units",
    )
    unit_number  = models.CharField(max_length=20)
    floor        = models.PositiveIntegerField(default=1)
    bedrooms     = models.PositiveIntegerField(default=1)
    bathrooms    = models.PositiveIntegerField(default=1)
    size_sqm     = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)
    deposit      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status       = models.CharField(
        max_length=20,
        choices=UnitStatus.choices,
        default=UnitStatus.AVAILABLE,
    )
    description  = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table        = "units"
        ordering        = ["property", "unit_number"]
        unique_together = [["property", "unit_number"]]
        verbose_name        = "Unit"
        verbose_name_plural = "Units"

    def __str__(self):
        return f"Unit {self.unit_number} — {self.property.name}"
