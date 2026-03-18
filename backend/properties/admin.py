from django.contrib import admin

from .models import Property, Unit


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "city", "state", "country")
    search_fields = ("name", "city", "state", "country", "owner__username")


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ("unit_number", "property", "status", "rent_amount", "tenant")
    list_filter = ("status", "property")
    search_fields = ("unit_number", "property__name", "tenant__username")

from django.contrib import admin

# Register your models here.
