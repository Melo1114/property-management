"use client"

import { AlertCircle, DollarSign, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboard, useInvoices, useLeases } from "@/hooks"

export function AccountingKpis() {
  const { data: dashboard, isLoading: dLoading } = useDashboard()
  const { data: invoices,  isLoading: iLoading } = useInvoices()
  const { data: leases,    isLoading: lLoading } = useLeases()
  const isLoading = dLoading || iLoading || lLoading

  const totalCollected = (invoices ?? []).reduce(
    (sum, inv) => sum + parseFloat(inv.amount_paid || "0"), 0
  )
  const totalOutstanding = (invoices ?? []).reduce(
    (sum, inv) => sum + parseFloat(inv.balance || "0"), 0
  )
  const activeLeases  = (leases ?? []).filter((l) => l.status === "Active").length
  const overdueCount  = dashboard?.overdue_invoices_count ?? 0

  const fmt = (n: number) =>
    `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "—" : fmt(totalCollected)}</div>
          <p className="text-xs text-muted-foreground">All paid invoices</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "—" : fmt(totalOutstanding)}</div>
          <p className="text-xs text-muted-foreground">Unpaid invoice balances</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "—" : activeLeases}</div>
          <p className="text-xs text-muted-foreground">Currently active leases</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "—" : overdueCount}</div>
          <p className="text-xs text-muted-foreground">Require immediate attention</p>
        </CardContent>
      </Card>
    </div>
  )
}
