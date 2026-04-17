"use client"

import { AlertCircle, Home, PenToolIcon as Tool, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboard } from "@/hooks"

export function DashboardKpis() {
  const { data, isLoading } = useDashboard()

  const totalProperties = data?.total_properties ?? 0
  const occupancyRate =
    data && data.total_units > 0
      ? Math.round((data.occupied_units / data.total_units) * 100)
      : 0
  const openMaintenance = data?.open_maintenance_requests ?? 0
  const overdueCount = data?.overdue_invoices_count ?? 0
  const overdueTotal = data
    ? `R ${parseFloat(data.overdue_invoices_total).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`
    : "R 0.00"

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "—" : totalProperties}</div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Loading…" : `${data?.total_units ?? 0} total units`}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "—" : `${occupancyRate}%`}</div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Loading…" : `${data?.occupied_units ?? 0} of ${data?.total_units ?? 0} units occupied`}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Maintenance</CardTitle>
          <Tool className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "—" : openMaintenance}</div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Loading…" : "Active requests"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "—" : overdueCount}</div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Loading…" : `${overdueTotal} outstanding`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
