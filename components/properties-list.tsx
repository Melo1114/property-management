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
import { useProperties } from "@/hooks"

export function PropertiesList() {
  const { data: properties, isLoading, error, deleteProperty } = useProperties()

  if (isLoading) return <p className="py-4 text-sm text-muted-foreground">Loading properties…</p>
  if (error) return <p className="py-4 text-sm text-red-500">{error}</p>
  if (!properties || properties.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No properties yet.{" "}
        <Link href="/properties/add" className="underline">Add your first property</Link>.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Units</TableHead>
          <TableHead>Available</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => (
          <TableRow key={property.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-lg font-bold text-muted-foreground">
                  {property.name.charAt(0)}
                </div>
                {property.name}
              </div>
            </TableCell>
            <TableCell>{property.address}, {property.city}</TableCell>
            <TableCell>{property.total_units}</TableCell>
            <TableCell>{property.available_units}</TableCell>
            <TableCell>{property.property_type}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  property.is_active
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-500 border-gray-200"
                }
              >
                {property.is_active ? "Active" : "Inactive"}
              </Badge>
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
                    <Link href={`/properties/${property.id}/edit`}>
                      <PencilIcon className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => confirm(`Delete "${property.name}"?`) && deleteProperty(property.id)}
                  >
                    <TrashIcon className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
