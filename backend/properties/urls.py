from rest_framework.routers import DefaultRouter

from .views import PropertyViewSet, UnitViewSet


router = DefaultRouter()
router.register("properties", PropertyViewSet, basename="property")
router.register("units", UnitViewSet, basename="unit")

urlpatterns = router.urls

