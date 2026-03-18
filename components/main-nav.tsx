import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { DollarSign, FileText, Home, PenToolIcon as Tool, Users, PieChart } from "lucide-react"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
        <span className="flex items-center gap-1">
          <PieChart className="h-4 w-4" />
          Dashboard
        </span>
      </Link>
      <Link
        href="/properties"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <span className="flex items-center gap-1">
          <Home className="h-4 w-4" />
          Properties
        </span>
      </Link>
      <Link href="/tenants" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          Tenants
        </span>
      </Link>
      <Link
        href="/maintenance"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <span className="flex items-center gap-1">
          <Tool className="h-4 w-4" />
          Maintenance
        </span>
      </Link>
      <Link
        href="/accounting"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <span className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          Accounting
        </span>
      </Link>
      <Link href="/reports" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        <span className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          Reports
        </span>
      </Link>
    </nav>
  )
}
