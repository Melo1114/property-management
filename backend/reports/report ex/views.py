"""
reports/views.py
─────────────────
All four report views fixed and upgraded with PDF/Excel export.

Fixes applied vs original:
  1. is_staff/is_superuser     → user.role checks
  2. property__owner / owner   → property__manager / manager
  3. Unit.Status.VACANT        → "Available" (our UnitStatus uses AVAILABLE not VACANT)
  4. unit.tenant               → no direct FK; resolved via active Lease
  5. unit.rent_amount          → unit.monthly_rent
  6. Lease.Status.ACTIVE       → LeaseStatus.ACTIVE (separate TextChoices class)

Export usage:
  GET /api/reports/dashboard/             → JSON
  GET /api/reports/dashboard/?format=pdf  → PDF download
  GET /api/reports/dashboard/?format=excel → Excel download
  (same pattern for all 4 endpoints)
"""

from decimal import Decimal

from django.db.models import Q, Sum, F
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminOrPropertyManager, IsAdminOrAccountant
from leases.models import Lease, LeaseStatus
from maintenance.models import MaintenanceRequest
from payments.models import Invoice, Payment
from properties.models import Property, Unit, UnitStatus

from .export_service import export_pdf, export_excel


# ── Role-scoped querysets ─────────────────────────────────────────────────────

def _property_qs(user):
    """FIX: filter by `manager` not `owner`."""
    if user.role in ("Admin", "PropertyManager", "Accountant"):
        return Property.objects.all()
    return Property.objects.filter(manager=user)


def _unit_qs(user):
    """FIX: filter by `property__manager` not `property__owner`."""
    if user.role in ("Admin", "PropertyManager", "Accountant"):
        return Unit.objects.all()
    return Unit.objects.filter(property__manager=user)


def _invoice_qs(user):
    """FIX: manager not owner; tenants see their own invoices."""
    if user.role in ("Admin", "PropertyManager", "Accountant"):
        return Invoice.objects.all()
    return Invoice.objects.filter(
        Q(lease__unit__property__manager=user) | Q(lease__tenant=user)
    )


def _export_or_json(request, report_type: str, data: dict) -> Response:
    """
    Check ?format= query param.
    Returns PDF / Excel download, or falls through to JSON Response.
    """
    fmt = request.query_params.get("format", "json").lower()
    if fmt == "pdf":
        return export_pdf(report_type, data)
    if fmt in ("excel", "xlsx"):
        return export_excel(report_type, data)
    return Response(data)


# ── Views ─────────────────────────────────────────────────────────────────────

class DashboardReportView(APIView):
    """
    GET /api/reports/dashboard/
    GET /api/reports/dashboard/?format=pdf
    GET /api/reports/dashboard/?format=excel

    Admin, PM, Accountant only — portfolio-wide summary.
    """
    permission_classes = [IsAdminOrAccountant | IsAdminOrPropertyManager]

    def get(self, request):
        user       = request.user
        properties = _property_qs(user)
        units      = _unit_qs(user)

        total_properties = properties.count()
        total_units      = units.count()
        # FIX: UnitStatus.OCCUPIED / AVAILABLE (not Unit.Status.OCCUPIED/VACANT)
        occupied_units    = units.filter(status=UnitStatus.OCCUPIED).count()
        vacant_units      = units.filter(status=UnitStatus.AVAILABLE).count()
        maintenance_units = units.filter(status=UnitStatus.MAINTENANCE).count()

        open_maintenance = MaintenanceRequest.objects.filter(
            unit__property__in=properties,
            status__in=[
                MaintenanceRequest.Status.OPEN,
                MaintenanceRequest.Status.IN_PROGRESS,
            ],
        ).count()

        today = timezone.now().date()
        overdue_qs = (
            _invoice_qs(user)
            .filter(due_date__lt=today)
            .exclude(status__in=[Invoice.Status.PAID, Invoice.Status.CANCELLED])
            .annotate(
                paid=Coalesce(
                    Sum(
                        "payments__amount",
                        filter=Q(payments__status=Payment.Status.COMPLETED),
                    ),
                    Decimal("0"),
                )
            )
            .annotate(balance=F("amount") - F("paid"))
            .filter(balance__gt=0)
        )
        overdue_count = overdue_qs.count()
        overdue_total = sum(
            (inv.balance for inv in overdue_qs), Decimal("0")
        )

        data = {
            "total_properties":          total_properties,
            "total_units":               total_units,
            "occupied_units":            occupied_units,
            "vacant_units":              vacant_units,
            "maintenance_units":         maintenance_units,
            "open_maintenance_requests": open_maintenance,
            "overdue_invoices_count":    overdue_count,
            "overdue_invoices_total":    str(overdue_total),
        }
        return _export_or_json(request, "dashboard", data)


class RentRollReportView(APIView):
    """
    GET /api/reports/rent-roll/
    GET /api/reports/rent-roll/?format=pdf
    GET /api/reports/rent-roll/?format=excel
    GET /api/reports/rent-roll/?property=<id>   (filter by property)

    Admin, PM, Accountant — one row per unit showing tenant + rent.
    """
    permission_classes = [IsAdminOrAccountant | IsAdminOrPropertyManager]

    def get(self, request):
        user  = request.user
        units = _unit_qs(user).select_related("property")

        property_id = request.query_params.get("property")
        if property_id:
            units = units.filter(property_id=int(property_id))

        roll = []
        for unit in units:
            # FIX: Unit has no direct tenant FK — resolve via active Lease
            active_lease = (
                Lease.objects.filter(
                    unit=unit,
                    status=LeaseStatus.ACTIVE,   # FIX: LeaseStatus not Lease.Status
                )
                .select_related("tenant")
                .first()
            )
            roll.append({
                "property_id":   unit.property_id,
                "property_name": unit.property.name,
                "unit_id":       unit.id,
                "unit_number":   unit.unit_number,
                "status":        unit.status,
                # FIX: monthly_rent not rent_amount
                "monthly_rent":  str(unit.monthly_rent),
                "tenant_id":     active_lease.tenant_id if active_lease else None,
                "tenant_name":   active_lease.tenant.get_full_name() if active_lease else None,
                "lease_id":      active_lease.id if active_lease else None,
                "lease_end_date": str(active_lease.end_date) if active_lease else None,
            })

        data = {"rent_roll": roll, "count": len(roll)}
        return _export_or_json(request, "rent_roll", data)


class OccupancyReportView(APIView):
    """
    GET /api/reports/occupancy/
    GET /api/reports/occupancy/?format=pdf
    GET /api/reports/occupancy/?format=excel
    GET /api/reports/occupancy/?property=<id>

    Portfolio-wide or per-property occupancy breakdown.
    """
    permission_classes = [IsAdminOrAccountant | IsAdminOrPropertyManager]

    def get(self, request):
        user  = request.user
        units = _unit_qs(user)

        property_id = request.query_params.get("property")
        if property_id:
            units = units.filter(property_id=int(property_id))

        total      = units.count()
        occupied   = units.filter(status=UnitStatus.OCCUPIED).count()
        vacant     = units.filter(status=UnitStatus.AVAILABLE).count()   # FIX: AVAILABLE
        maintenance = units.filter(status=UnitStatus.MAINTENANCE).count()
        rate        = round((occupied / total * 100), 2) if total else 0

        data = {
            "total_units":            total,
            "occupied_units":         occupied,
            "vacant_units":           vacant,
            "maintenance_units":      maintenance,
            "occupancy_rate_percent": rate,
        }
        return _export_or_json(request, "occupancy", data)


class OverdueReportView(APIView):
    """
    GET /api/reports/overdue/
    GET /api/reports/overdue/?format=pdf
    GET /api/reports/overdue/?format=excel

    All invoices past due date with outstanding balance.
    Admins/PMs/Accountants see all; Tenants see their own.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user  = request.user
        today = timezone.now().date()

        qs = (
            _invoice_qs(user)
            .filter(due_date__lt=today)
            .exclude(status__in=[Invoice.Status.PAID, Invoice.Status.CANCELLED])
            .annotate(
                paid=Coalesce(
                    Sum(
                        "payments__amount",
                        filter=Q(payments__status=Payment.Status.COMPLETED),
                    ),
                    Decimal("0"),
                )
            )
            .annotate(balance=F("amount") - F("paid"))
            .filter(balance__gt=0)
            .select_related(
                "lease",
                "lease__unit",
                "lease__unit__property",
                "lease__tenant",
            )
        )

        overdue = [
            {
                "invoice_id":    inv.id,
                "due_date":      str(inv.due_date),
                "amount":        str(inv.amount),
                "balance":       str(inv.balance),
                "status":        inv.status,
                "property_name": inv.lease.unit.property.name,
                "unit_number":   inv.lease.unit.unit_number,
                "tenant_id":     inv.lease.tenant_id,
                "tenant_name":   inv.lease.tenant.get_full_name(),
            }
            for inv in qs
        ]
        total = sum(Decimal(item["balance"]) for item in overdue)

        data = {
            "overdue_invoices": overdue,
            "count":            len(overdue),
            "total_overdue":    str(total),
        }
        return _export_or_json(request, "overdue", data)
