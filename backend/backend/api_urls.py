"""Canonical resource routes, all mounted once at /api/."""

from django.urls import path
from rest_framework.routers import DefaultRouter

from accounts.views import UserDetailView, UserListView
from leases.views import LeaseViewSet
from maintenance.views import MaintenanceCommentViewSet, MaintenanceRequestViewSet
from notifications.views import NotificationViewSet
from payments.views import InvoiceViewSet, PaymentViewSet
from properties.views import PropertyViewSet, UnitViewSet


router = DefaultRouter()
router.register("properties", PropertyViewSet, basename="property")
router.register("units", UnitViewSet, basename="unit")
router.register("leases", LeaseViewSet, basename="lease")
router.register("invoices", InvoiceViewSet, basename="invoice")
router.register("payments", PaymentViewSet, basename="payment")
router.register("maintenance", MaintenanceRequestViewSet, basename="maintenance-request")
router.register("maintenance-comments", MaintenanceCommentViewSet, basename="maintenance-comment")
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
] + router.urls
