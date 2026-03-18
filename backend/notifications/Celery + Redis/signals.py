"""
notifications/signals.py
────────────────────────
Signals fire synchronously in the request cycle.
Heavy work (email sending, notification creation) is offloaded
to Celery tasks via .delay() so the HTTP response is never blocked.

Fixes applied vs original:
  1. unit.property.owner  → unit.property.manager  (correct FK field name)
  2. instance.invoice     → instance.lease          (Payment links to Lease, not Invoice)
  3. Payment.Status.COMPLETED → string "Completed"  (matches PaymentStatus TextChoices)
  4. Synchronous send_notification_email calls → send_email_task.delay()
  5. notify_user calls → create_notification_task.delay()
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from maintenance.models import MaintenanceRequest
from payments.models import Payment
from .models import Notification
from .tasks import create_notification_task, send_email_task


# ── Maintenance Signals ───────────────────────────────────────────────────────

@receiver(pre_save, sender=MaintenanceRequest)
def _store_previous_maintenance_status(sender, instance, **kwargs):
    """Cache the previous status on the instance before save."""
    if instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            instance._previous_status = old.status
        except sender.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None


@receiver(post_save, sender=MaintenanceRequest)
def on_maintenance_request_saved(sender, instance, created, **kwargs):
    # ── New request submitted ─────────────────────────────────────────────
    if created:
        # FIX: use `manager` not `owner`
        manager = instance.unit.property.manager
        if not manager:
            return

        title   = "New maintenance request"
        message = (
            f'"{instance.title}" submitted for '
            f"{instance.unit.property.name} – {instance.unit.unit_number} "
            f"(reported by {instance.reported_by.get_full_name()})."
        )

        create_notification_task.delay(
            user_id=manager.id,
            title=title,
            message=message,
            kind=Notification.Kind.MAINTENANCE_NEW,
            target_id=instance.pk,
            target_type="maintenance_request",
        )
        if manager.email:
            send_email_task.delay(
                subject=f"[Property Management] {title}",
                message_plain=message,
                recipient_list=[manager.email],
            )
        return

    # ── Request resolved ──────────────────────────────────────────────────
    prev = getattr(instance, "_previous_status", None)
    if (
        prev != MaintenanceRequest.Status.RESOLVED
        and instance.status == MaintenanceRequest.Status.RESOLVED
    ):
        reporter = instance.reported_by
        title    = "Maintenance request resolved"
        message  = (
            f'"{instance.title}" for '
            f"{instance.unit.property.name} – {instance.unit.unit_number} "
            f"has been marked resolved."
        )

        create_notification_task.delay(
            user_id=reporter.id,
            title=title,
            message=message,
            kind=Notification.Kind.MAINTENANCE_UPDATED,
            target_id=instance.pk,
            target_type="maintenance_request",
        )
        if reporter.email:
            send_email_task.delay(
                subject=f"[Property Management] {title}",
                message_plain=message,
                recipient_list=[reporter.email],
            )

    # ── Request assigned ──────────────────────────────────────────────────
    prev_assigned = getattr(instance, "_previous_assigned_to_id", None)
    if instance.assigned_to and prev_assigned != instance.assigned_to_id:
        vendor  = instance.assigned_to
        title   = "Maintenance task assigned to you"
        message = (
            f'You have been assigned: "{instance.title}" '
            f"at {instance.unit.property.name} – {instance.unit.unit_number}. "
            f"Priority: {instance.priority}."
        )

        create_notification_task.delay(
            user_id=vendor.id,
            title=title,
            message=message,
            kind=Notification.Kind.MAINTENANCE_UPDATED,
            target_id=instance.pk,
            target_type="maintenance_request",
        )
        if vendor.email:
            send_email_task.delay(
                subject=f"[Property Management] {title}",
                message_plain=message,
                recipient_list=[vendor.email],
            )


@receiver(pre_save, sender=MaintenanceRequest)
def _store_previous_assigned_to(sender, instance, **kwargs):
    """Cache assigned_to_id before save so we can detect assignment changes."""
    if instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            instance._previous_assigned_to_id = old.assigned_to_id
        except sender.DoesNotExist:
            instance._previous_assigned_to_id = None
    else:
        instance._previous_assigned_to_id = None


# ── Payment Signals ───────────────────────────────────────────────────────────

@receiver(post_save, sender=Payment)
def on_payment_saved(sender, instance, created, **kwargs):
    # FIX: check string "Completed" not Payment.Status.COMPLETED (no nested class)
    if not created or instance.status != "Completed":
        return

    # FIX: Payment links to lease directly, not invoice
    lease   = instance.lease
    tenant  = lease.tenant
    # FIX: property manager, not owner
    manager = lease.unit.property.manager

    unit_str = f"{lease.unit.property.name} – {lease.unit.unit_number}"

    # ── Notify Property Manager ───────────────────────────────────────────
    if manager:
        pm_title   = "Payment received"
        pm_message = (
            f"Payment of R{instance.amount} received for {unit_str} "
            f"(tenant: {tenant.get_full_name()}, ref: {instance.reference_number})."
        )
        create_notification_task.delay(
            user_id=manager.id,
            title=pm_title,
            message=pm_message,
            kind=Notification.Kind.PAYMENT_RECEIVED,
            target_id=instance.pk,
            target_type="payment",
        )
        if manager.email:
            send_email_task.delay(
                subject=f"[Property Management] {pm_title}",
                message_plain=pm_message,
                recipient_list=[manager.email],
            )

    # ── Notify Tenant ─────────────────────────────────────────────────────
    tenant_title   = "Payment recorded"
    tenant_message = (
        f"Your payment of R{instance.amount} for {unit_str} "
        f"has been recorded. Reference: {instance.reference_number}."
    )
    create_notification_task.delay(
        user_id=tenant.id,
        title=tenant_title,
        message=tenant_message,
        kind=Notification.Kind.PAYMENT_RECEIVED,
        target_id=instance.pk,
        target_type="payment",
    )
    if tenant.email:
        send_email_task.delay(
            subject=f"[Property Management] {tenant_title}",
            message_plain=tenant_message,
            recipient_list=[tenant.email],
        )
