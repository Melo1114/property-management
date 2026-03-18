from django.db.models import Q
from rest_framework import permissions, viewsets

from .models import Property, Unit
from .serializers import PropertySerializer, UnitSerializer


class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Property.objects.all()
        if not user.is_staff and not user.is_superuser:
            qs = qs.filter(owner=user)
        return qs


class UnitViewSet(viewsets.ModelViewSet):
    serializer_class = UnitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Unit.objects.select_related("property", "tenant")
        if not user.is_staff and not user.is_superuser:
            qs = qs.filter(
                Q(property__owner=user) | Q(tenant=user),
            )
        return qs
