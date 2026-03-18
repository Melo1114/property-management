from django.contrib import admin

from .models import Invoice, Payment


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "lease",
        "due_date",
        "amount",
        "status",
    )
    list_filter = ("status", "due_date")
    search_fields = ("id", "lease__unit__unit_number", "lease__tenant__username")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "invoice",
        "amount",
        "status",
        "method",
        "created_at",
        "processed_by",
    )
    list_filter = ("status", "method")
    search_fields = ("id", "invoice__id", "processed_by__username")

