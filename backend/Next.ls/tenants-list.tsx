"use client";

// components/tenants-list.tsx

import { useState } from "react";
import { useTenants } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search } from "lucide-react";
import Link from "next/link";
import type { User } from "@/lib/types";

export function TenantsList() {
  const [search, setSearch] = useState("");
  const { data: tenants, isLoading, error, deleteTenant } = useTenants(
    search || undefined
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Failed to load tenants: {error}
      </p>
    );
  }

  const list = tenants ?? [];

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tenants..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No tenants found.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((tenant: User) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/tenants/${tenant.id}`}
                    className="hover:underline text-primary"
                  >
                    {tenant.first_name} {tenant.last_name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {tenant.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {tenant.phone_number || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={tenant.is_active ? "default" : "secondary"}>
                    {tenant.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/tenants/${tenant.id}`}>View</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/tenants/${tenant.id}/edit`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          if (
                            confirm(
                              `Remove tenant "${tenant.first_name} ${tenant.last_name}"?`
                            )
                          ) {
                            deleteTenant(tenant.id);
                          }
                        }}
                      >
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
