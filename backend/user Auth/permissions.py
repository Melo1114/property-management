from rest_framework.permissions import BasePermission
from .models import Role


class IsAdmin(BasePermission):
    """Only Administrators."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == Role.ADMIN
        )


class IsPropertyManager(BasePermission):
    """Only Property Managers."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == Role.PROPERTY_MANAGER
        )


class IsTenant(BasePermission):
    """Only Tenants."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == Role.TENANT
        )


class IsVendor(BasePermission):
    """Only Vendors."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == Role.VENDOR
        )


class IsAccountant(BasePermission):
    """Only Accountants."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == Role.ACCOUNTANT
        )


class IsAdminOrPropertyManager(BasePermission):
    """Admins or Property Managers — used for most management endpoints."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (Role.ADMIN, Role.PROPERTY_MANAGER)
        )


class IsAdminOrAccountant(BasePermission):
    """Admins or Accountants — used for financial/report endpoints."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (Role.ADMIN, Role.ACCOUNTANT)
        )


class IsAdminOrPropertyManagerOrTenant(BasePermission):
    """Admins, PMs, or Tenants — for mixed-access endpoints like documents."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (
                Role.ADMIN, Role.PROPERTY_MANAGER, Role.TENANT
            )
        )
