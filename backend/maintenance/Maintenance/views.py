from django.db import models as db_models
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import (
    IsAdminOrPropertyManager,
    IsVendor,
    IsTenant,
)
from .models import MaintenanceComment, MaintenanceRequest
from .serializers import (
    AssignMaintenanceSerializer,
    CancelMaintenanceSerializer,
    MaintenanceCommentSerializer,
    MaintenanceRequestSerializer,
    ResolveMaintenanceSerializer,
)


class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    """
    Workflow:  submit (Tenant) → assign (Admin/PM) → resolve (Vendor)

    GET    /api/maintenance-requests/           — filtered by role
    POST   /api/maintenance-requests/           — Tenant submits new request
    GET    /api/maintenance-requests/<id>/      — retrieve detail
    PATCH  /api/maintenance-requests/<id>/      — Admin/PM: update title/description/priority
    DELETE /api/maintenance-requests/<id>/      — Admin only

    POST   /api/maintenance-requests/<id>/assign/  — Admin/PM assigns vendor
    PATCH  /api/maintenance-requests/<id>/resolve/ — Vendor (or Admin/PM) resolves
    PATCH  /api/maintenance-requests/<id>/cancel/  — Admin/PM cancels
    """
    serializer_class   = MaintenanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = MaintenanceRequest.objects.select_related(
            "unit",
            "unit__property",
            "reported_by",
            "assigned_to",
        ).prefetch_related("comments", "comments__author")

        # ── Role-scoped queryset ──────────────────────────────────────────
        if user.role in ("Admin", "PropertyManager"):
            # Admin & PM see everything
            return qs

        if user.role == "Vendor":
            # Vendors see only requests assigned to them
            return qs.filter(assigned_to=user)

        if user.role == "Tenant":
            # Tenants see only their own submitted requests
            return qs.filter(reported_by=user)

        if user.role == "Accountant":
            # Accountants have read-only visibility of all requests
            return qs

        return qs.none()

    def get_permissions(self):
        """
        Override permissions per action:
        - create: Tenants (and Admin/PM) can submit
        - destroy: Admin only
        - assign/cancel: Admin/PM only
        - resolve: Vendor or Admin/PM
        - everything else: IsAuthenticated (queryset scoping handles the rest)
        """
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        if self.action == "destroy":
            from accounts.permissions import IsAdmin
            return [IsAdmin()]
        if self.action in ("assign", "cancel"):
            return [IsAdminOrPropertyManager()]
        if self.action == "resolve":
            return [permissions.IsAuthenticated()]  # scoped in the action itself
        return [permissions.IsAuthenticated()]

    # ── Workflow Actions ──────────────────────────────────────────────────────

    @action(detail=True, methods=["post"], url_path="assign")
    def assign(self, request, pk=None):
        """
        POST /api/maintenance-requests/<id>/assign/
        Body: { "assigned_to": <vendor_user_id>, "notes": "..." }

        Transitions: OPEN / IN_PROGRESS → IN_PROGRESS
        Assigns a vendor and optionally logs a comment.
        """
        instance   = self.get_object()
        serializer = AssignMaintenanceSerializer(
            instance, data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            MaintenanceRequestSerializer(instance, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["patch"], url_path="resolve")
    def resolve(self, request, pk=None):
        """
        PATCH /api/maintenance-requests/<id>/resolve/
        Body: { "resolution_note": "..." }

        Transitions: IN_PROGRESS → RESOLVED
        Only the assigned vendor or an Admin/PM may resolve.
        """
        instance = self.get_object()
        user     = request.user

        # Vendors can only resolve requests assigned to them
        if user.role == "Vendor" and instance.assigned_to != user:
            return Response(
                {"detail": "You can only resolve requests assigned to you."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ResolveMaintenanceSerializer(
            instance, data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            MaintenanceRequestSerializer(instance, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["patch"], url_path="cancel")
    def cancel(self, request, pk=None):
        """
        PATCH /api/maintenance-requests/<id>/cancel/
        Body: { "reason": "..." }

        Transitions: OPEN / IN_PROGRESS → CANCELLED
        Admin & PM only.
        """
        instance   = self.get_object()
        serializer = CancelMaintenanceSerializer(
            instance, data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            MaintenanceRequestSerializer(instance, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )


class MaintenanceCommentViewSet(viewsets.ModelViewSet):
    """
    GET    /api/maintenance-comments/        — list comments visible to the user
    POST   /api/maintenance-comments/        — add a comment (any authenticated user)
    GET    /api/maintenance-comments/<id>/   — retrieve single comment
    PATCH  /api/maintenance-comments/<id>/   — edit own comment only
    DELETE /api/maintenance-comments/<id>/   — delete own comment (or Admin)
    """
    serializer_class   = MaintenanceCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = MaintenanceComment.objects.select_related(
            "request",
            "request__unit",
            "request__unit__property",
            "author",
        )

        if user.role in ("Admin", "PropertyManager", "Accountant"):
            return qs

        if user.role == "Vendor":
            return qs.filter(request__assigned_to=user)

        if user.role == "Tenant":
            return qs.filter(request__reported_by=user)

        return qs.none()

    def update(self, request, *args, **kwargs):
        """Only the comment author (or Admin) can edit a comment."""
        instance = self.get_object()
        if instance.author != request.user and request.user.role != "Admin":
            return Response(
                {"detail": "You can only edit your own comments."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Only the comment author (or Admin) can delete a comment."""
        instance = self.get_object()
        if instance.author != request.user and request.user.role != "Admin":
            return Response(
                {"detail": "You can only delete your own comments."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)
