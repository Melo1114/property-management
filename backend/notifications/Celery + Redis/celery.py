import os
from celery import Celery

# Tell Celery which Django settings module to use
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

app = Celery("backend")

# Pull all Celery config from Django settings, namespaced under CELERY_*
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks.py in every app listed in INSTALLED_APPS
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Sanity-check task. Run with: celery -A backend call backend.celery.debug_task"""
    print(f"Request: {self.request!r}")
