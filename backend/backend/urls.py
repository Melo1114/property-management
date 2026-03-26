from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/",          include("accounts.urls")),
    path("api/properties/",    include("properties.urls")),
    path("api/leases/",        include("leases.urls")),
    path("api/payments/",      include("payments.urls")),
    path("api/maintenance/",   include("maintenance.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/documents/",     include("documents.urls")),
    path("api/reports/",       include("reports.urls")),
]

# Serve media files in local dev only — Azure Blob handles this in production
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
