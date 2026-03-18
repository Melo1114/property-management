from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


def document_upload_to(instance, filename):
    """Store under documents/{content_type_app}_{content_type_model}/{object_id}/{filename}"""
    ct = instance.content_type
    prefix = f"documents/{ct.app_label}_{ct.model}"
    if instance.object_id:
        prefix = f"{prefix}/{instance.object_id}"
    return f"{prefix}/{filename}"


class Document(models.Model):
    class Kind(models.TextChoices):
        LEASE_AGREEMENT = "LEASE_AGREEMENT", "Lease agreement"
        INVOICE = "INVOICE", "Invoice / receipt"
        PROPERTY_PHOTO = "PROPERTY_PHOTO", "Property photo"
        MAINTENANCE_PHOTO = "MAINTENANCE_PHOTO", "Maintenance photo / attachment"
        OTHER = "OTHER", "Other"

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to={
            "model__in": ["lease", "invoice", "property", "maintenancerequest"],
        },
    )
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_documents",
    )
    file = models.FileField(upload_to=document_upload_to)
    name = models.CharField(max_length=255, blank=True)  # Optional display name
    kind = models.CharField(
        max_length=30,
        choices=Kind.choices,
        default=Kind.OTHER,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name or self.file.name
