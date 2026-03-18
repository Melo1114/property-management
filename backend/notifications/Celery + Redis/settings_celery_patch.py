# ═══════════════════════════════════════════════════════════════════════════
# ADD THESE BLOCKS TO YOUR EXISTING settings.py
# ═══════════════════════════════════════════════════════════════════════════

# ── 1. Add to INSTALLED_APPS (after "notifications") ──────────────────────
#
#     "django_celery_beat",     # stores periodic task schedules in DB
#     "django_celery_results",  # stores task results in DB (optional)
#
# ─────────────────────────────────────────────────────────────────────────

from celery.schedules import crontab  # add this import at top of settings.py

# ── 2. Celery Configuration ────────────────────────────────────────────────
CELERY_BROKER_URL        = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND    = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
CELERY_ACCEPT_CONTENT    = ["json"]
CELERY_TASK_SERIALIZER   = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE          = "UTC"

# Store task results in the database (requires django-celery-results)
CELERY_RESULT_BACKEND    = "django-db"

# ── 3. Periodic Task Schedule (django-celery-beat) ─────────────────────────
CELERY_BEAT_SCHEDULE = {
    # Check for leases expiring within 30 days — runs daily at 08:00 UTC
    "check-expiring-leases": {
        "task":     "notifications.tasks.check_expiring_leases",
        "schedule": crontab(hour=8, minute=0),
    },
    # Remind tenants of rent due in 7 days — runs daily at 08:15 UTC
    "check-rent-due": {
        "task":     "notifications.tasks.check_rent_due",
        "schedule": crontab(hour=8, minute=15),
    },
    # Flag overdue payments — runs daily at 09:00 UTC
    "check-overdue-payments": {
        "task":     "notifications.tasks.check_overdue_payments",
        "schedule": crontab(hour=9, minute=0),
    },
    # Flag unassigned maintenance requests older than 3 days — runs daily at 09:30 UTC
    "check-stale-maintenance": {
        "task":     "notifications.tasks.check_stale_maintenance",
        "schedule": crontab(hour=9, minute=30),
    },
}
