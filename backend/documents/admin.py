from django.contrib import admin

from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("name", "kind", "content_type", "object_id", "uploaded_by", "created_at")
    list_filter = ("kind", "content_type")
    search_fields = ("name", "uploaded_by__username")
