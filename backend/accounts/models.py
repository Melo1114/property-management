from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        OWNER = "OWNER", "Owner"
        MANAGER = "MANAGER", "Property Manager"
        TENANT = "TENANT", "Tenant"
        STAFF = "STAFF", "Staff"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.TENANT)
    phone_number = models.CharField(max_length=20, blank=True)

    def __str__(self) -> str:  # type: ignore[override]
        return f"{self.username} ({self.role})"

