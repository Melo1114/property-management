from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from maintenance.models import MaintenanceRequest
from payments.models import Payment

from .models import Notification
from .services import notify_user, send_notification_email


@receiver(pre_save, sender=MaintenanceRequest)
def _store_previous_maintenance_status(sender, instance, **kwargs):
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
    if created:
        owner = instance.unit.property.owner
        title = "New maintenance request"
        message = f'"{instance.title}" for {instance.unit.property.name} - {instance.unit.unit_number} (reported by {instance.reported_by.username}).'
        notify_user(
            owner,
            title,
            message,
            kind=Notification.Kind.MAINTENANCE_NEW,
            target_id=instance.pk,
            target_type="maintenance_request",
        )
        if owner.email:
            send_notification_email(
                subject=f"[Property Management] {title}",
                message_plain=message,
                recipient_list=[owner.email],
            )
    else:
        # Status changed to RESOLVED: notify reporter
        prev = getattr(instance, "_previous_status", None)
        if prev != MaintenanceRequest.Status.RESOLVED and instance.status == MaintenanceRequest.Status.RESOLVED:
            reporter = instance.reported_by
            title = "Maintenance request resolved"
            message = f'"{instance.title}" for {instance.unit.property.name} - {instance.unit.unit_number} has been marked resolved.'
            notify_user(
                reporter,
                title,
                message,
                kind=Notification.Kind.MAINTENANCE_UPDATED,
                target_id=instance.pk,
                target_type="maintenance_request",
            )
            if reporter.email:
                send_notification_email(
                    subject=f"[Property Management] {title}",
                    message_plain=message,
                    recipient_list=[reporter.email],
                )


@receiver(post_save, sender=Payment)
def on_payment_saved(sender, instance, created, **kwargs):
    if not created or instance.status != Payment.Status.COMPLETED:
        return
    invoice = instance.invoice
    lease = invoice.lease
    tenant = lease.tenant
    owner = lease.unit.property.owner
    title = "Payment received"
    message = f"Payment of {instance.amount} received for invoice (lease: {lease.unit.property.name} - {lease.unit.unit_number})."
    # Notify property owner
    notify_user(
        owner,
        title,
        message,
        kind=Notification.Kind.PAYMENT_RECEIVED,
        target_id=invoice.pk,
        target_type="invoice",
    )
    if owner.email:
        send_notification_email(
            subject=f"[Property Management] {title}",
            message_plain=message,
            recipient_list=[owner.email],
        )
    # Notify tenant (payment confirmation)
    tenant_title = "Payment recorded"
    tenant_message = f"Your payment of {instance.amount} for invoice (due {invoice.due_date}) has been recorded."
    notify_user(
        tenant,
        tenant_title,
        tenant_message,
        kind=Notification.Kind.PAYMENT_RECEIVED,
        target_id=invoice.pk,
        target_type="invoice",
    )
    if tenant.email:
        send_notification_email(
            subject=f"[Property Management] {tenant_title}",
            message_plain=tenant_message,
            recipient_list=[tenant.email],
        )
