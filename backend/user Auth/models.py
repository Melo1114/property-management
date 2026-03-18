from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    ADMIN            = "Admin",            "Administrator"
    PROPERTY_MANAGER = "PropertyManager",  "Property Manager"
    TENANT           = "Tenant",           "Tenant"
    VENDOR           = "Vendor",           "Vendor"
    ACCOUNTANT       = "Accountant",       "Accountant"


class User(AbstractUser):
    """
    Custom user model. Extends AbstractUser so Django's built-in auth
    (admin panel, password hashing, etc.) all work out of the box.
    The `role` field is the single source of truth for permissions.
    """
    email        = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address      = models.TextField(blank=True)
    role         = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.TENANT,
    )

    USERNAME_FIELD  = "email"          # Login with email, not username
    REQUIRED_FIELDS = ["username"]     # Still required for createsuperuser

    class Meta:
        db_table   = "users"
        ordering   = ["-date_joined"]
        verbose_name        = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    # ── Convenience role-check properties ──────────────────────────────────
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
