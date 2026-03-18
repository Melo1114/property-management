"use client";

// components/properties-list.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useProperties } from "@/hooks";
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
import type { Property } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  Residential: "Residential",
  Commercial:  "Commercial",
  MixedUse:    "Mixed Use",
};

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? "default" : "secondary"}>
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

export function PropertiesList() {
  const [search, setSearch] = useState("");
  const { data: properties, isLoading, error, deleteProperty } = useProperties(search || undefined);

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
      <p className="text-sm text-destructive">Failed to load properties: {error}</p>
    );
  }

  const list = properties ?? [];

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search properties..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No properties found.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-center">Units</TableHead>
              <TableHead className="text-center">Available</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((property: Property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/properties/${property.id}`}
                    className="hover:underline text-primary"
                  >
                    {property.name}
                  </Link>
                </TableCell>
                <TableCell>{TYPE_LABELS[property.property_type] ?? property.property_type}</TableCell>
                <TableCell className="text-muted-foreground">
                  {property.city}, {property.province}
                </TableCell>
                <TableCell className="text-center">{property.total_units}</TableCell>
                <TableCell className="text-center">{property.available_units}</TableCell>
                <TableCell>
                  <StatusBadge active={property.is_active} />
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
                        <Link href={`/properties/${property.id}`}>View</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/properties/${property.id}/edit`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          if (confirm(`Delete "${property.name}"?`)) {
                            deleteProperty(property.id);
                          }
                        }}
                      >
                        Delete
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
