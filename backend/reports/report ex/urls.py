from django.urls import path

from .views import (
    DashboardReportView,
    OccupancyReportView,
    OverdueReportView,
    RentRollReportView,
)

urlpatterns = [
    path("dashboard/", DashboardReportView.as_view(), name="reports-dashboard"),
    path("rent-roll/",  RentRollReportView.as_view(),  name="reports-rent-roll"),
    path("occupancy/",  OccupancyReportView.as_view(), name="reports-occupancy"),
    path("overdue/",    OverdueReportView.as_view(),   name="reports-overdue"),
]
