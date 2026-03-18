"use client";

// components/maintenance-list.tsx

import { useMaintenance } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import type { MaintenancePriority, MaintenanceStatus } from "@/lib/types";

interface Props {
  status?: string;
}

const PRIORITY_VARIANT: Record<
  MaintenancePriority,
  "default" | "secondary" | "destructive" | "outline"
> = {
  LOW:    "secondary",
  MEDIUM: "outline",
  HIGH:   "default",
  URGENT: "destructive",
};

const STATUS_VARIANT: Record<
  MaintenanceStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  OPEN:        "outline",
  IN_PROGRESS: "default",
  RESOLVED:    "secondary",
  CANCELLED:   "secondary",
};

export function MaintenanceList({ status }: Props) {
  const {
    data: requests,
    isLoading,
    error,
    resolveRequest,
    cancelRequest,
  } = useMaintenance({ status });

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
        Failed to load requests: {error}
      </p>
    );
  }

  const list = requests ?? [];

  if (list.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No maintenance requests found.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Property / Unit</TableHead>
          <TableHead>Reported By</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((req) => (
          <TableRow key={req.id}>
            <TableCell className="font-medium">
              <Link
                href={`/maintenance/${req.id}`}
                className="hover:underline text-primary"
              >
                {req.title}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {req.unit_detail.property_name} — Unit {req.unit_detail.unit_number}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {req.reported_by_name}
            </TableCell>
            <TableCell>
              <Badge variant={PRIORITY_VARIANT[req.priority]}>
                {req.priority}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[req.status]}>
                {req.status.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {new Date(req.created_at).toLocaleDateString()}
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
                    <Link href={`/maintenance/${req.id}`}>View Details</Link>
                  </DropdownMenuItem>
                  {req.status === "IN_PROGRESS" && (
                    <DropdownMenuItem
                      onClick={() => {
                        const note = prompt("Enter resolution note:");
                        if (note && note.length >= 10) {
                          resolveRequest(req.id, note);
                        }
                      }}
                    >
                      Mark Resolved
                    </DropdownMenuItem>
                  )}
                  {req.status !== "RESOLVED" && req.status !== "CANCELLED" && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        const reason = prompt("Cancellation reason (optional):");
                        cancelRequest(req.id, reason ?? undefined);
                      }}
                    >
                      Cancel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
