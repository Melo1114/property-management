from django.db import models
from rest_framework import permissions, viewsets

from .models import MaintenanceComment, MaintenanceRequest
from .serializers import MaintenanceCommentSerializer, MaintenanceRequestSerializer


class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = MaintenanceRequest.objects.select_related(
            "unit",
            "unit__property",
            "reported_by",
            "assigned_to",
        ).prefetch_related("comments", "comments__author")
        if user.is_staff or user.is_superuser:
            return qs
        return qs.filter(
            models.Q(unit__property__owner=user)
            | models.Q(reported_by=user)
            | models.Q(assigned_to=user)
        )


class MaintenanceCommentViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = MaintenanceComment.objects.select_related(
            "request", "request__unit", "request__unit__property", "author"
        )
        if user.is_staff or user.is_superuser:
            return qs
        return qs.filter(
            models.Q(request__unit__property__owner=user)
            | models.Q(request__reported_by=user)
            | models.Q(request__assigned_to=user)
        )
