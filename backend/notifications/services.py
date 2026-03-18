import logging

from django.core.mail import send_mail
from django.conf import settings

from .models import Notification

logger = logging.getLogger(__name__)


def notify_user(user, title, message, kind=Notification.Kind.OTHER, target_id=None, target_type=""):
    """Create an in-app notification for a user."""
    Notification.objects.create(
        user=user,
        title=title,
        message=message,
        kind=kind,
        target_id=target_id,
        target_type=target_type or "",
    )


def send_notification_email(subject, message_plain, recipient_list, fail_silently=True):
    """Send an email. Uses console backend in dev if not configured."""
    if not recipient_list:
        return
    try:
        send_mail(
            subject=subject,
            message=message_plain,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@example.com"),
            recipient_list=recipient_list,
            fail_silently=fail_silently,
        )
    except Exception as e:
        logger.warning("Failed to send notification email: %s", e)
