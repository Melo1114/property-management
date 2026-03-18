from django.db import models
from rest_framework import permissions, viewsets

from .models import Lease
from .serializers import LeaseSerializer


class LeaseViewSet(viewsets.ModelViewSet):
    serializer_class = LeaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Lease.objects.select_related("unit", "unit__property", "tenant")
        if user.is_staff or user.is_superuser:
            return qs
        # Owners see leases for their properties; tenants see their leases
        return qs.filter(
            models.Q(unit__property__owner=user) | models.Q(tenant=user)
        )
