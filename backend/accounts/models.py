from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    ADMIN            = "Admin",           "Administrator"
    PROPERTY_MANAGER = "PropertyManager", "Property Manager"
    TENANT           = "Tenant",          "Tenant"
    VENDOR           = "Vendor",          "Vendor"
    ACCOUNTANT       = "Accountant",      "Accountant"


class User(AbstractUser):
    email        = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address      = models.TextField(blank=True)
    role         = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.TENANT,
    )

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        ordering            = ["-date_joined"]
        verbose_name        = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    @property
    def is_admin(self):
        return self.role == Role.ADMIN

    @property
    def is_property_manager(self):
        return self.role == Role.PROPERTY_MANAGER

    @property
    def is_tenant(self):
        return self.role == Role.TENANT

    @property
    def is_vendor(self):
        return self.role == Role.VENDOR

    @property
    def is_accountant(self):
        return self.role == Role.ACCOUNTANT
