from rest_framework.routers import DefaultRouter

from .views import MaintenanceCommentViewSet, MaintenanceRequestViewSet

router = DefaultRouter()
router.register("maintenance-requests", MaintenanceRequestViewSet, basename="maintenance-request")
router.register("maintenance-comments", MaintenanceCommentViewSet, basename="maintenance-comment")

urlpatterns = router.urls
