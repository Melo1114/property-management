from rest_framework.routers import DefaultRouter

from .views import LeaseViewSet


router = DefaultRouter()
router.register("leases", LeaseViewSet, basename="lease")

urlpatterns = router.urls

