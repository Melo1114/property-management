from django.urls import path
from .views import (
    PropertyListCreateView,
    PropertyDetailView,
    UnitListCreateView,
    UnitDetailView,
    AvailableUnitListView,
)

urlpatterns = [
    # ── Properties ────────────────────────────────────────────────────
    path("",          PropertyListCreateView.as_view(), name="property-list-create"),
    path("<int:pk>/", PropertyDetailView.as_view(),     name="property-detail"),

    # ── Units ─────────────────────────────────────────────────────────
    path("units/",               UnitListCreateView.as_view(),  name="unit-list-create"),
    path("units/<int:pk>/",      UnitDetailView.as_view(),      name="unit-detail"),
    path("units/available/",     AvailableUnitListView.as_view(), name="unit-available"),
]
