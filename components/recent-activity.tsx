"use client"

import { Bell } from "lucide-react"
import { useNotifications } from "@/hooks"

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return "Just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 172800) return "Yesterday"
  return `${Math.floor(diff / 86400)} days ago`
}

export function RecentActivity() {
  const { data: notifications, isLoading } = useNotifications()

  if (isLoading) {
    return <p className="py-4 text-sm text-muted-foreground">Loading activity…</p>
  }
  if (!notifications || notifications.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">No recent activity yet.</p>
  }

  return (
    <div className="space-y-6">
      {notifications.slice(0, 5).map((n) => (
        <div key={n.id} className="flex items-start gap-4">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
              n.read ? "bg-muted" : "bg-primary/10 border-primary/20"
            }`}
          >
            <Bell className={`h-4 w-4 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className={`text-sm leading-none ${n.read ? "font-medium" : "font-semibold"}`}>
              {n.title}
            </p>
            <p className="truncate text-sm text-muted-foreground">{n.message}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
        </div>
      ))}
    </div>
  )
}
