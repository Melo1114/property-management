"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, PencilIcon, TrashIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLeases, useTenants } from "@/hooks"
import type { Lease } from "@/lib/types"

export function TenantsList() {
  const { data: tenants, isLoading, error, deleteTenant } = useTenants()
  const { data: leases } = useLeases()

  const leaseFor = (tenantId: number): Lease | undefined =>
    (leases ?? []).find((l) => l.tenant === tenantId && l.status === "Active") ??
    (leases ?? []).find((l) => l.tenant === tenantId)

  if (isLoading) return <p className="py-4 text-sm text-muted-foreground">Loading tenants…</p>
  if (error) return <p className="py-4 text-sm text-red-500">{error}</p>
  if (!tenants || tenants.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No tenants yet.{" "}
        <Link href="/tenants/new" className="underline">Add your first tenant</Link>.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tenant</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Property / Unit</TableHead>
          <TableHead>Lease Status</TableHead>
          <TableHead>Lease End</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tenants.map((tenant) => {
          const lease = leaseFor(tenant.id)
          const displayName = tenant.first_name
            ? `${tenant.first_name} ${tenant.last_name}`
            : tenant.username
          return (
            <TableRow key={tenant.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground">
                    {(tenant.first_name?.[0] ?? tenant.username?.[0] ?? "?").toUpperCase()}
                  </div>
                  {displayName}
                </div>
              </TableCell>
              <TableCell>
                <div className="grid gap-0.5">
                  <span className="text-sm">{tenant.email}</span>
                  {tenant.phone_number && (
                    <span className="text-xs text-muted-foreground">{tenant.phone_number}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {lease ? (
                  <div className="grid gap-0.5">
                    <span className="text-sm">{lease.unit_detail.property}</span>
                    <span className="text-xs text-muted-foreground">Unit {lease.unit_detail.unit_number}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No lease</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    lease?.status === "Active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : lease?.status === "Pending"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                  }
                >
                  {lease?.status ?? "No lease"}
                </Badge>
              </TableCell>
              <TableCell>
                {lease?.end_date
                  ? new Date(lease.end_date).toLocaleDateString("en-ZA")
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/tenants/${tenant.id}/edit`}>
                        <PencilIcon className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => confirm(`Remove "${displayName}"?`) && deleteTenant(tenant.id)}
                    >
                      <TrashIcon className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
