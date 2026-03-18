from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from rest_framework import permissions, viewsets
from rest_framework.parsers import FormParser, MultiPartParser

from leases.models import Lease
from maintenance.models import MaintenanceRequest
from payments.models import Invoice
from properties.models import Property

from .models import Document
from .serializers import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, *viewsets.ModelViewSet.parser_classes]

    def get_queryset(self):
        user = self.request.user
        qs = Document.objects.select_related("content_type", "uploaded_by")

        if user.is_staff or user.is_superuser:
            qs = qs
        else:
            lease_ct = ContentType.objects.get(app_label="leases", model="lease")
            invoice_ct = ContentType.objects.get(app_label="payments", model="invoice")
            property_ct = ContentType.objects.get(app_label="properties", model="property")
            maintenance_ct = ContentType.objects.get(app_label="maintenance", model="maintenancerequest")

            lease_ids = Lease.objects.filter(
                Q(unit__property__owner=user) | Q(tenant=user)
            ).values_list("id", flat=True)
            invoice_ids = Invoice.objects.filter(
                Q(lease__unit__property__owner=user) | Q(lease__tenant=user)
            ).values_list("id", flat=True)
            property_ids = Property.objects.filter(owner=user).values_list("id", flat=True)
            maintenance_ids = MaintenanceRequest.objects.filter(
                Q(unit__property__owner=user)
                | Q(reported_by=user)
                | Q(assigned_to=user)
            ).values_list("id", flat=True)

            qs = qs.filter(
                Q(content_type=lease_ct, object_id__in=lease_ids)
                | Q(content_type=invoice_ct, object_id__in=invoice_ids)
                | Q(content_type=property_ct, object_id__in=property_ids)
                | Q(content_type=maintenance_ct, object_id__in=maintenance_ids)
            )

        # Optional filter by related object
        if (lease_id := self.request.query_params.get("lease")) is not None:
            ct = ContentType.objects.get(app_label="leases", model="lease")
            qs = qs.filter(content_type=ct, object_id=int(lease_id))
        if (invoice_id := self.request.query_params.get("invoice")) is not None:
            ct = ContentType.objects.get(app_label="payments", model="invoice")
            qs = qs.filter(content_type=ct, object_id=int(invoice_id))
        if (property_id := self.request.query_params.get("property")) is not None:
            ct = ContentType.objects.get(app_label="properties", model="property")
            qs = qs.filter(content_type=ct, object_id=int(property_id))
        if (mr_id := self.request.query_params.get("maintenance_request")) is not None:
            ct = ContentType.objects.get(app_label="maintenance", model="maintenancerequest")
            qs = qs.filter(content_type=ct, object_id=int(mr_id))

        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
