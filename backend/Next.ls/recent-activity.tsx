"use client";

// components/recent-activity.tsx

import { useMaintenance, useInvoices } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Wrench } from "lucide-react";

export function RecentActivity() {
  const { data: maintenance, isLoading: loadingM } = useMaintenance();
  const { data: invoices,    isLoading: loadingI } = useInvoices({ status: "SENT" });

  if (loadingM || loadingI) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Combine recent maintenance + overdue invoices into a unified feed
  const maintenanceItems = (maintenance ?? [])
    .slice(0, 5)
    .map((r) => ({
      id:    `m-${r.id}`,
      icon:  <Wrench className="h-4 w-4 text-orange-500" />,
      title: r.title,
      sub:   `${r.unit_detail.property_name} — Unit ${r.unit_detail.unit_number}`,
      badge: r.status.replace("_", " "),
      date:  new Date(r.created_at),
    }));

  const invoiceItems = (invoices ?? [])
    .filter((inv) => {
      const due = new Date(inv.due_date);
      return due < new Date();
    })
    .slice(0, 5)
    .map((inv) => ({
      id:    `i-${inv.id}`,
      icon:  <AlertCircle className="h-4 w-4 text-destructive" />,
      title: `Rent overdue — R ${parseFloat(inv.balance).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`,
      sub:   `${inv.lease_detail.property_name} — Unit ${inv.lease_detail.unit_number}`,
      badge: "OVERDUE",
      date:  new Date(inv.due_date),
    }));

  const feed = [...maintenanceItems, ...invoiceItems]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  if (feed.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No recent activity.
      </p>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4 pr-4">
        {feed.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              {item.icon}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
              <p className="text-xs text-muted-foreground">
                {item.date.toLocaleDateString()}
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {item.badge}
            </Badge>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
