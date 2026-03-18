from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdminOrPropertyManager, IsTenant
from .models import Property, Unit
from .serializers import (
    PropertySerializer,
    PropertyDetailSerializer,
    UnitSerializer,
)


# ── Property Views ────────────────────────────────────────────────────────────

class PropertyListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/properties/  — Admin & PM: list all properties
    POST /api/properties/  — Admin & PM: create a property
    """
    queryset         = Property.objects.filter(is_active=True).select_related("manager")
    serializer_class = PropertySerializer
    permission_classes  = [IsAdminOrPropertyManager]
    filter_backends     = [filters.SearchFilter, filters.OrderingFilter]
    search_fields       = ["name", "city", "province", "property_type"]
    ordering_fields     = ["name", "created_at"]

    def perform_create(self, serializer):
        # Auto-assign manager to the requesting user if not explicitly provided
        if not serializer.validated_data.get("manager"):
            serializer.save(manager=self.request.user)
        else:
            serializer.save()


class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/properties/<id>/  — Admin & PM: retrieve with nested units
    PATCH  /api/properties/<id>/  — Admin & PM: partial update
    DELETE /api/properties/<id>/  — Admin & PM: soft delete (sets is_active=False)
    """
    queryset           = Property.objects.all().select_related("manager").prefetch_related("units")
    permission_classes = [IsAdminOrPropertyManager]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return PropertyDetailSerializer
        return PropertySerializer

    def perform_destroy(self, instance):
        # Soft delete — preserve history
        instance.is_active = False
        instance.save()


# ── Unit Views ────────────────────────────────────────────────────────────────

class UnitListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/units/         — Admin & PM: list all units
    GET  /api/units/?property=<id>  — filter by property
    POST /api/units/         — Admin & PM: create a unit
    """
    serializer_class   = UnitSerializer
    permission_classes = [IsAdminOrPropertyManager]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ["unit_number", "status", "property__name"]
    ordering_fields    = ["monthly_rent", "created_at", "status"]

    def get_queryset(self):
        qs = Unit.objects.all().select_related("property")
        property_id = self.request.query_params.get("property")
        status      = self.request.query_params.get("status")
        if property_id:
            qs = qs.filter(property_id=property_id)
        if status:
            qs = qs.filter(status=status)
        return qs


class UnitDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/units/<id>/  — retrieve unit detail
    PATCH  /api/units/<id>/  — Admin & PM: update unit
    DELETE /api/units/<id>/  — Admin & PM: delete unit
    """
    queryset           = Unit.objects.all().select_related("property")
    serializer_class   = UnitSerializer
    permission_classes = [IsAdminOrPropertyManager]


class AvailableUnitListView(generics.ListAPIView):
    """
    GET /api/units/available/
    Tenants can see available units (for self-service applications).
    """
    queryset           = Unit.objects.filter(status="Available").select_related("property")
    serializer_class   = UnitSerializer
    permission_classes = [IsAuthenticated]
