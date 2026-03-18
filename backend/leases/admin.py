from django.contrib import admin

from .models import Lease


@admin.register(Lease)
class LeaseAdmin(admin.ModelAdmin):
    list_display = (
        "unit",
        "tenant",
        "start_date",
        "end_date",
        "rent_amount",
        "status",
    )
    list_filter = ("status", "start_date", "end_date")
    search_fields = ("unit__unit_number", "unit__property__name", "tenant__username")

from django.contrib import admin

# Register your models here.
