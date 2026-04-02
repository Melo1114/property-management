#!/bin/bash
set -e

python manage.py migrate --noinput
python manage.py createsuperuser --noinput || true

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
