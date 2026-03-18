"""
notifications/tasks.py
─────────────────────
Async tasks (called by signals):
  • send_email_task          — fire-and-forget email delivery
  • create_notification_task — async in-app notification creation

Scheduled tasks (run by django-celery-beat):
  • check_expiring_leases    — daily: notify tenants + PMs of leases expiring ≤30 days
  • check_rent_due           — daily: remind tenants of upcoming rent (7 days out)
  • check_overdue_payments   — daily: alert PMs of payments not received past due date
  • check_stale_maintenance  — daily: alert PMs of OPEN requests older than 3 days
"""

import logging
from datetime import date, timedelta

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


# ── Primitive async helpers ───────────────────────────────────────────────────

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_task(self, subject, message_plain, recipient_list):
    """
    Async email delivery with automatic retry (up to 3 times, 60s apart).
    Called by signals instead of sending email synchronously in the request cycle.
    """
    if not recipient_list:
        return
    try:
        send_mail(
            subject=subject,
            message=message_plain,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@example.com"),
            recipient_list=recipient_list,
            fail_silently=False,
        )
        logger.info("Email sent to %s | subject: %s", recipient_list, subject)
    except Exception as exc:
        logger.warning("Email failed (%s), retrying... [%s]", exc, recipient_list)
        raise self.retry(exc=exc)


@shared_task
def create_notification_task(user_id, title, message, kind="OTHER", target_id=None, target_type=""):
    """
    Async in-app notification creation.
    Accepts primitive types only (IDs, strings) — Celery serialises to JSON.
    """
    from notifications.models import Notification
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.get(pk=user_id)
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            kind=kind,
            target_id=target_id,
            target_type=target_type or "",
        )
        logger.info("Notification created for user_id=%s | %s", user_id, title)
    except Exception as exc:
        logger.error("Failed to create notification for user_id=%s: %s", user_id, exc)


# ── Scheduled tasks ───────────────────────────────────────────────────────────

@shared_task
def check_expiring_leases():
    """
    Scheduled: runs daily.
    Finds leases expiring within the next 30 days (status=Active).
    Notifies both the Tenant and the Property Manager.

    Beat schedule entry (add to settings.py CELERY_BEAT_SCHEDULE):
        "check-expiring-leases": {
            "task": "notifications.tasks.check_expiring_leases",
            "schedule": crontab(hour=8, minute=0),   # 08:00 UTC daily
        }
    """
    from leases.models import Lease, LeaseStatus
    from notifications.models import Notification

    today      = date.today()
    threshold  = today + timedelta(days=30)

    expiring = Lease.objects.filter(
        status=LeaseStatus.ACTIVE,
        end_date__gte=today,
        end_date__lte=threshold,
    ).select_related("tenant", "unit", "unit__property", "unit__property__manager")

    notified = 0
    for lease in expiring:
        days_left = (lease.end_date - today).days
        unit_str  = f"{lease.unit.property.name} – Unit {lease.unit.unit_number}"

        # ── Notify Tenant ──────────────────────────────────────────────
        tenant_msg = (
            f"Your lease for {unit_str} expires in {days_left} day(s) "
            f"(on {lease.end_date}). Please contact your property manager to arrange renewal."
        )
        create_notification_task.delay(
            user_id=lease.tenant.id,
            title="Lease expiring soon",
            message=tenant_msg,
            kind=Notification.Kind.OTHER,
            target_id=lease.id,
            target_type="lease",
        )
        if lease.tenant.email:
            send_email_task.delay(
                subject="[Property Management] Lease Expiry Notice",
                message_plain=tenant_msg,
                recipient_list=[lease.tenant.email],
            )

        # ── Notify Property Manager ────────────────────────────────────
        manager = lease.unit.property.manager
        if manager:
            pm_msg = (
                f"Lease for {unit_str} (tenant: {lease.tenant.get_full_name()}) "
                f"expires in {days_left} day(s) on {lease.end_date}."
            )
            create_notification_task.delay(
                user_id=manager.id,
                title="Lease expiring soon",
                message=pm_msg,
                kind=Notification.Kind.OTHER,
                target_id=lease.id,
                target_type="lease",
            )
            if manager.email:
                send_email_task.delay(
                    subject="[Property Management] Lease Expiry Notice",
                    message_plain=pm_msg,
                    recipient_list=[manager.email],
                )
        notified += 1

    logger.info("check_expiring_leases: %d leases flagged", notified)
    return {"leases_flagged": notified}


@shared_task
def check_rent_due():
    """
    Scheduled: runs daily.
    Finds active leases where rent is due in exactly 7 days and reminds the tenant.
    Uses lease start_date + monthly interval to approximate the next due date.

    Beat schedule entry:
        "check-rent-due": {
            "task": "notifications.tasks.check_rent_due",
            "schedule": crontab(hour=8, minute=15),
        }
    """
    from leases.models import Lease, LeaseStatus
    from notifications.models import Notification

    today         = date.today()
    reminder_date = today + timedelta(days=7)

    # Approximate: rent is due on the same day-of-month as lease start_date
    active_leases = Lease.objects.filter(
        status=LeaseStatus.ACTIVE,
    ).select_related("tenant", "unit", "unit__property")

    notified = 0
    for lease in active_leases:
        due_day = lease.start_date.day
        # Clamp to valid day (e.g. Feb has no day 31)
        import calendar
        max_day = calendar.monthrange(reminder_date.year, reminder_date.month)[1]
        effective_day = min(due_day, max_day)

        if reminder_date.day == effective_day:
            unit_str = f"{lease.unit.property.name} – Unit {lease.unit.unit_number}"
            msg = (
                f"Reminder: your rent of R{lease.monthly_rent} for {unit_str} "
                f"is due in 7 days on the {due_day}."
            )
            create_notification_task.delay(
                user_id=lease.tenant.id,
                title="Rent due in 7 days",
                message=msg,
                kind=Notification.Kind.INVOICE_SENT,
                target_id=lease.id,
                target_type="lease",
            )
            if lease.tenant.email:
                send_email_task.delay(
                    subject="[Property Management] Rent Due Reminder",
                    message_plain=msg,
                    recipient_list=[lease.tenant.email],
                )
            notified += 1

    logger.info("check_rent_due: %d reminders sent", notified)
    return {"reminders_sent": notified}


@shared_task
def check_overdue_payments():
    """
    Scheduled: runs daily.
    Finds leases where no Completed payment exists for the current month.
    Alerts the Property Manager.

    Beat schedule entry:
        "check-overdue-payments": {
            "task": "notifications.tasks.check_overdue_payments",
            "schedule": crontab(hour=9, minute=0),
        }
    """
    from leases.models import Lease, LeaseStatus
    from payments.models import Payment
    from notifications.models import Notification

    today         = date.today()
    month_start   = today.replace(day=1)

    active_leases = Lease.objects.filter(
        status=LeaseStatus.ACTIVE,
    ).select_related("tenant", "unit", "unit__property", "unit__property__manager")

    overdue_count = 0
    for lease in active_leases:
        # Rent is due on the same day as start_date — skip if not yet due
        due_day = lease.start_date.day
        import calendar
        max_day = calendar.monthrange(today.year, today.month)[1]
        effective_due = today.replace(day=min(due_day, max_day))

        if today < effective_due:
            continue  # Not yet due this month

        # Check if a completed payment exists for this month
        paid_this_month = Payment.objects.filter(
            lease=lease,
            status="Completed",
            payment_date__gte=month_start,
            payment_date__lte=today,
        ).exists()

        if not paid_this_month:
            unit_str = f"{lease.unit.property.name} – Unit {lease.unit.unit_number}"
            manager  = lease.unit.property.manager

            # Notify tenant
            tenant_msg = (
                f"Your rent payment of R{lease.monthly_rent} for {unit_str} "
                f"is overdue. Please make payment as soon as possible."
            )
            create_notification_task.delay(
                user_id=lease.tenant.id,
                title="Rent payment overdue",
                message=tenant_msg,
                kind=Notification.Kind.INVOICE_SENT,
                target_id=lease.id,
                target_type="lease",
            )
            if lease.tenant.email:
                send_email_task.delay(
                    subject="[Property Management] Overdue Rent Notice",
                    message_plain=tenant_msg,
                    recipient_list=[lease.tenant.email],
                )

            # Notify property manager
            if manager:
                pm_msg = (
                    f"Rent overdue: {unit_str} — "
                    f"tenant {lease.tenant.get_full_name()} has not paid "
                    f"R{lease.monthly_rent} for {today.strftime('%B %Y')}."
                )
                create_notification_task.delay(
                    user_id=manager.id,
                    title="Tenant rent overdue",
                    message=pm_msg,
                    kind=Notification.Kind.PAYMENT_RECEIVED,
                    target_id=lease.id,
                    target_type="lease",
                )
                if manager.email:
                    send_email_task.delay(
                        subject="[Property Management] Overdue Rent Alert",
                        message_plain=pm_msg,
                        recipient_list=[manager.email],
                    )
            overdue_count += 1

    logger.info("check_overdue_payments: %d overdue leases found", overdue_count)
    return {"overdue_leases": overdue_count}


@shared_task
def check_stale_maintenance():
    """
    Scheduled: runs daily.
    Flags OPEN maintenance requests that haven't been assigned after 3 days.
    Alerts Property Managers to take action.

    Beat schedule entry:
        "check-stale-maintenance": {
            "task": "notifications.tasks.check_stale_maintenance",
            "schedule": crontab(hour=9, minute=30),
        }
    """
    from maintenance.models import MaintenanceRequest
    from notifications.models import Notification
    from django.utils import timezone

    threshold = timezone.now() - timedelta(days=3)

    stale = MaintenanceRequest.objects.filter(
        status=MaintenanceRequest.Status.OPEN,
        assigned_to__isnull=True,
        created_at__lte=threshold,
    ).select_related("unit", "unit__property", "unit__property__manager", "reported_by")

    alerted = 0
    for request in stale:
        manager = request.unit.property.manager
        if not manager:
            continue

        days_open = (timezone.now() - request.created_at).days
        msg = (
            f'Maintenance request "{request.title}" for '
            f"{request.unit.property.name} – Unit {request.unit.unit_number} "
            f"has been OPEN and unassigned for {days_open} day(s). "
            f"Please assign a vendor."
        )
        create_notification_task.delay(
            user_id=manager.id,
            title="Unassigned maintenance request",
            message=msg,
            kind=Notification.Kind.MAINTENANCE_UPDATED,
            target_id=request.id,
            target_type="maintenance_request",
        )
        if manager.email:
            send_email_task.delay(
                subject="[Property Management] Unassigned Maintenance Alert",
                message_plain=msg,
                recipient_list=[manager.email],
            )
        alerted += 1

    logger.info("check_stale_maintenance: %d stale requests flagged", alerted)
    return {"stale_requests": alerted}
