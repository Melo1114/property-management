#!/bin/bash
set -e

python manage.py migrate --noinput
echo "from django.contrib.auth import get_user_model; U = get_user_model(); U.objects.filter(username='admin').delete(); U.objects.create_superuser(username='admin', email='admin@aurumkeys.co.za', password='Aurumkeys@2025!')" | python manage.py shell

# Start Celery worker in background
celery -A backend worker --loglevel=info &

# Start Celery beat in background
celery -A backend beat --loglevel=info \
  --scheduler django_celery_beat.schedulers:DatabaseScheduler &

# Start Gunicorn (foreground)
exec gunicorn backend.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 2 \
  --timeout 120
