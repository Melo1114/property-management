"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useInvoices } from "@/hooks"
import type { Invoice } from "@/lib/types"

function buildMonthlyRevenue(invoices: Invoice[]) {
  const now = new Date()
  const months: { key: string; name: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      name: d.toLocaleString("en-ZA", { month: "short" }),
    })
  }
  const totals: Record<string, number> = {}
  months.forEach(({ key }) => { totals[key] = 0 })
  invoices.forEach((inv) => {
    const key = inv.due_date.slice(0, 7)
    if (key in totals) totals[key] += parseFloat(inv.amount_paid || "0")
  })
  return months.map(({ key, name }) => ({ name, revenue: totals[key] }))
}

export function Overview() {
  const { data: invoices, isLoading } = useInvoices({ status: "PAID" })

  if (isLoading) {
    return (
      <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
        Loading chart…
      </div>
    )
  }

  const chartData = buildMonthlyRevenue(invoices ?? [])
  const hasData = chartData.some((d) => d.revenue > 0)

  if (!hasData) {
    return (
      <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
        No payment data yet. Revenue will appear here once invoices are paid.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number) =>
            `R ${value.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`
          }
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} name="Rent Collected" />
      </BarChart>
    </ResponsiveContainer>
  )
}
