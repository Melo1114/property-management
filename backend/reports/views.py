from decimal import Decimal
from django.db.models import Q, Sum, F
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from leases.models import Lease
from maintenance.models import MaintenanceRequest
from payments.models import Invoice, Payment
from properties.models import Property, Unit


def _property_queryset(user):
    if user.is_staff or user.is_superuser:
        return Property.objects.all()
    return Property.objects.filter(owner=user)


def _unit_queryset(user):
    if user.is_staff or user.is_superuser:
        return Unit.objects.all()
    return Unit.objects.filter(property__owner=user)


def _invoice_queryset(user):
    if user.is_staff or user.is_superuser:
        return Invoice.objects.all()
    return Invoice.objects.filter(
        Q(lease__unit__property__owner=user) | Q(lease__tenant=user)
    )


class DashboardReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        properties = _property_queryset(user)
        units = _unit_queryset(user)

        total_properties = properties.count()
        total_units = units.count()
        occupied_units = units.filter(status=Unit.Status.OCCUPIED).count()
        vacant_units = units.filter(status=Unit.Status.VACANT).count()
        maintenance_units = units.filter(status=Unit.Status.MAINTENANCE).count()

        maintenance_requests = MaintenanceRequest.objects.filter(
            unit__property__in=properties,
            status__in=[MaintenanceRequest.Status.OPEN, MaintenanceRequest.Status.IN_PROGRESS],
        )
        open_maintenance_count = maintenance_requests.count()

        today = timezone.now().date()
        overdue_qs = _invoice_queryset(user).filter(
            due_date__lt=today,
        ).exclude(
            status__in=[Invoice.Status.PAID, Invoice.Status.CANCELLED],
        ).annotate(
            paid=Coalesce(
                Sum("payments__amount", filter=Q(payments__status=Payment.Status.COMPLETED)),
                Decimal("0"),
            ),
        ).annotate(
            balance=F("amount") - F("paid"),
        ).filter(balance__gt=0)

        overdue_invoice_count = overdue_qs.count()
        overdue_total = sum((inv.balance for inv in overdue_qs), Decimal("0"))

        return Response({
            "total_properties": total_properties,
            "total_units": total_units,
            "occupied_units": occupied_units,
            "vacant_units": vacant_units,
            "maintenance_units": maintenance_units,
            "open_maintenance_requests": open_maintenance_count,
            "overdue_invoices_count": overdue_invoice_count,
            "overdue_invoices_total": str(overdue_total),
        })


class RentRollReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        units = _unit_queryset(user).select_related("property", "tenant")
        property_id = request.query_params.get("property")
        if property_id is not None:
            units = units.filter(property_id=int(property_id))

        roll = []
        for unit in units:
            active_lease = (
                Lease.objects.filter(unit=unit, status=Lease.Status.ACTIVE)
                .select_related("tenant")
                .first()
            )
            roll.append({
                "property_id": unit.property_id,
                "property_name": unit.property.name,
                "unit_id": unit.id,
                "unit_number": unit.unit_number,
                "status": unit.status,
                "rent_amount": str(unit.rent_amount),
                "tenant_id": unit.tenant_id,
                "tenant_username": unit.tenant.username if unit.tenant else None,
                "lease_id": active_lease.id if active_lease else None,
                "lease_end_date": str(active_lease.end_date) if active_lease else None,
            })
        return Response({"rent_roll": roll})


class OccupancyReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        units = _unit_queryset(user)
        property_id = request.query_params.get("property")
        if property_id is not None:
            units = units.filter(property_id=int(property_id))

        total = units.count()
        occupied = units.filter(status=Unit.Status.OCCUPIED).count()
        rate = (occupied / total * 100) if total else 0

        return Response({
            "total_units": total,
            "occupied_units": occupied,
            "vacant_units": units.filter(status=Unit.Status.VACANT).count(),
            "maintenance_units": units.filter(status=Unit.Status.MAINTENANCE).count(),
            "occupancy_rate_percent": round(rate, 2),
        })


class OverdueReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        qs = (
            _invoice_queryset(user)
            .filter(due_date__lt=today)
            .exclude(status__in=[Invoice.Status.PAID, Invoice.Status.CANCELLED])
            .annotate(
                paid=Coalesce(
                    Sum("payments__amount", filter=Q(payments__status=Payment.Status.COMPLETED)),
                    Decimal("0"),
                ),
            )
            .annotate(balance=F("amount") - F("paid"))
            .filter(balance__gt=0)
            .select_related("lease", "lease__unit", "lease__unit__property", "lease__tenant")
        )

        overdue = [
            {
                "invoice_id": inv.id,
                "due_date": str(inv.due_date),
                "amount": str(inv.amount),
                "balance": str(inv.balance),
                "status": inv.status,
                "property_name": inv.lease.unit.property.name,
                "unit_number": inv.lease.unit.unit_number,
                "tenant_id": inv.lease.tenant_id,
                "tenant_username": getattr(inv.lease.tenant, "username", None),
            }
            for inv in qs
        ]
        total = sum(Decimal(item["balance"]) for item in overdue)
        return Response({
            "overdue_invoices": overdue,
            "count": len(overdue),
            "total_overdue": str(total),
        })
