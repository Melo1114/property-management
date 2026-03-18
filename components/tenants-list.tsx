import Image from "next/image"
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

const tenants = [
  {
    id: "1",
    name: "Robert Johnson",
    email: "robert.j@example.com",
    phone: "(555) 123-4567",
    property: "Oakwood Apartments",
    unit: "5C",
    status: "Active",
    leaseEnd: "12/31/2023",
  },
  {
    id: "2",
    name: "Sarah Davis",
    email: "sarah.d@example.com",
    phone: "(555) 234-5678",
    property: "Riverside Condos",
    unit: "2B",
    status: "Active",
    leaseEnd: "03/15/2024",
  },
  {
    id: "3",
    name: "Thomas Wilson",
    email: "thomas.w@example.com",
    phone: "(555) 345-6789",
    property: "Oakwood Apartments",
    unit: "2C",
    status: "Active",
    leaseEnd: "05/01/2024",
  },
  {
    id: "4",
    name: "Olivia Martinez",
    email: "olivia.m@example.com",
    phone: "(555) 456-7890",
    property: "Oakwood Apartments",
    unit: "3B",
    status: "Pending",
    leaseEnd: "N/A",
  },
  {
    id: "5",
    name: "James Taylor",
    email: "james.t@example.com",
    phone: "(555) 567-8901",
    property: "Sunset Villas",
    unit: "1A",
    status: "Active",
    leaseEnd: "08/31/2024",
  },
]

export function TenantsList() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tenant</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Property</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Lease End</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tenants.map((tenant) => (
          <TableRow key={tenant.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Image
                    src={`/placeholder.svg?height=40&width=40&text=${tenant.name.charAt(0)}`}
                    alt={tenant.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                {tenant.name}
              </div>
            </TableCell>
            <TableCell>
              <div className="grid gap-0.5">
                <span className="text-sm">{tenant.email}</span>
                <span className="text-xs text-muted-foreground">{tenant.phone}</span>
              </div>
            </TableCell>
            <TableCell>{tenant.property}</TableCell>
            <TableCell>{tenant.unit}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  tenant.status === "Active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }
              >
                {tenant.status}
              </Badge>
            </TableCell>
            <TableCell>{tenant.leaseEnd}</TableCell>
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
                  <DropdownMenuItem>
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Payment History</DropdownMenuItem>
                  <DropdownMenuItem>Maintenance Requests</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete
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
