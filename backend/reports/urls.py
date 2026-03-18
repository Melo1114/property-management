from django.urls import path

from .views import (
    DashboardReportView,
    OccupancyReportView,
    OverdueReportView,
    RentRollReportView,
)

urlpatterns = [
    path("reports/dashboard/", DashboardReportView.as_view(), name="reports-dashboard"),
    path("reports/rent-roll/", RentRollReportView.as_view(), name="reports-rent-roll"),
    path("reports/occupancy/", OccupancyReportView.as_view(), name="reports-occupancy"),
    path("reports/overdue/", OverdueReportView.as_view(), name="reports-overdue"),
]
