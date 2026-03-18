"use client";

// components/overview.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Dashboard stat cards that replace the hardcoded values.
// Called from dashboard/page.tsx — keep the same export name.

import { useDashboard } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, DollarSign, PenToolIcon as Tool, Users } from "lucide-react";

export function Overview() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-sm text-destructive">
        Failed to load dashboard data.
      </p>
    );
  }

  const occupancyRate =
    data.total_units > 0
      ? Math.round((data.occupied_units / data.total_units) * 100)
      : 0;

  const cards = [
    {
      title: "Total Properties",
      value: data.total_properties,
      sub:   `${data.total_units} total units`,
      icon:  <Home className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      sub:   `${data.occupied_units} occupied · ${data.vacant_units} available`,
      icon:  <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Open Maintenance",
      value: data.open_maintenance_requests,
      sub:   "Open or in-progress requests",
      icon:  <Tool className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Overdue Rent",
      value: `R ${parseFloat(data.overdue_invoices_total).toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
      })}`,
      sub:   `${data.overdue_invoices_count} invoice${data.overdue_invoices_count !== 1 ? "s" : ""} overdue`,
      icon:  <DollarSign className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
