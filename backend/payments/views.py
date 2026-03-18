from django.db import models
from rest_framework import permissions, viewsets

from .models import Invoice, Payment
from .serializers import InvoiceSerializer, PaymentSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Invoice.objects.select_related(
            "lease",
            "lease__unit",
            "lease__unit__property",
            "lease__tenant",
        )
        if user.is_staff or user.is_superuser:
            return qs
        # Owners see invoices for their properties, tenants see their invoices
        return qs.filter(
            models.Q(lease__unit__property__owner=user)
            | models.Q(lease__tenant=user)
        )


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Payment.objects.select_related(
            "invoice",
            "invoice__lease",
            "invoice__lease__unit",
            "invoice__lease__unit__property",
            "invoice__lease__tenant",
        )
        if user.is_staff or user.is_superuser:
            return qs
        return qs.filter(
            models.Q(invoice__lease__unit__property__owner=user)
            | models.Q(invoice__lease__tenant=user)
        )

