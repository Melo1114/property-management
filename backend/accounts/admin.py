from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    # Use email as the login identifier in the admin create form
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "first_name", "last_name",
                       "role", "phone_number", "address",
                       "password1", "password2"),
        }),
    )

    fieldsets = (
        (None,                    {"fields": ("username", "password")}),
        ("Personal info",         {"fields": ("first_name", "last_name", "email",
                                              "phone_number", "address")}),
        ("Role",                  {"fields": ("role",)}),
        ("Permissions",           {"fields": ("is_active", "is_staff", "is_superuser",
                                              "groups", "user_permissions")}),
        ("Important dates",       {"fields": ("last_login", "date_joined")}),
    )

    list_display  = ("email", "username", "first_name", "last_name", "role", "is_active")
    list_filter   = ("role", "is_staff", "is_superuser", "is_active")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering      = ("-date_joined",)
