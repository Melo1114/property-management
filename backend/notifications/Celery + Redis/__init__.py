# This makes the Celery app available as `backend.celery_app`
# and ensures it is loaded when Django starts so that
# @shared_task decorators in any app use this instance.
from .celery import app as celery_app

__all__ = ("celery_app",)
