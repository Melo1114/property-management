from django.contrib import admin

from .models import MaintenanceComment, MaintenanceRequest


@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "unit",
        "reported_by",
        "priority",
        "status",
        "assigned_to",
        "created_at",
    )
    list_filter = ("status", "priority")
    search_fields = ("title", "description", "unit__unit_number", "reported_by__username")


@admin.register(MaintenanceComment)
class MaintenanceCommentAdmin(admin.ModelAdmin):
    list_display = ("request", "author", "created_at")
    search_fields = ("body", "author__username")
