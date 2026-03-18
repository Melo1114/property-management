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

const properties = [
  {
    id: "1",
    name: "Oakwood Apartments",
    address: "123 Main St, Anytown, USA",
    units: 12,
    occupancy: "92%",
    type: "Apartment",
    status: "Active",
  },
  {
    id: "2",
    name: "Riverside Condos",
    address: "456 Oak St, Anytown, USA",
    units: 8,
    occupancy: "100%",
    type: "Condo",
    status: "Active",
  },
  {
    id: "3",
    name: "Sunset Villas",
    address: "789 Pine St, Anytown, USA",
    units: 6,
    occupancy: "83%",
    type: "Single Family",
    status: "Active",
  },
  {
    id: "4",
    name: "Meadow View Townhomes",
    address: "101 Elm St, Anytown, USA",
    units: 10,
    occupancy: "90%",
    type: "Townhouse",
    status: "Active",
  },
  {
    id: "5",
    name: "Harbor Point Apartments",
    address: "202 Cedar St, Anytown, USA",
    units: 15,
    occupancy: "93%",
    type: "Apartment",
    status: "Active",
  },
]

export function PropertiesList() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Units</TableHead>
          <TableHead>Occupancy</TableHead>
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
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                  <Image
                    src={`/placeholder.svg?height=40&width=40&text=${property.name.charAt(0)}`}
                    alt={property.name}
                    width={40}
                    height={40}
                    className="rounded-md"
                  />
                </div>
                {property.name}
              </div>
            </TableCell>
            <TableCell>{property.address}</TableCell>
            <TableCell>{property.units}</TableCell>
            <TableCell>{property.occupancy}</TableCell>
            <TableCell>{property.type}</TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {property.status}
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
                  <DropdownMenuItem>
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>View Tenants</DropdownMenuItem>
                  <DropdownMenuItem>Maintenance History</DropdownMenuItem>
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
