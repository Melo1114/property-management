from rest_framework.routers import DefaultRouter
from .views import MaintenanceCommentViewSet, MaintenanceRequestViewSet

router = DefaultRouter()
router.register(
    "maintenance-requests",
    MaintenanceRequestViewSet,
    basename="maintenance-request",
)
router.register(
    "maintenance-comments",
    MaintenanceCommentViewSet,
    basename="maintenance-comment",
)

# The router auto-generates these endpoints from @action decorators:
#
# POST   /api/maintenance/maintenance-requests/<id>/assign/
# PATCH  /api/maintenance/maintenance-requests/<id>/resolve/
# PATCH  /api/maintenance/maintenance-requests/<id>/cancel/

urlpatterns = router.urls
