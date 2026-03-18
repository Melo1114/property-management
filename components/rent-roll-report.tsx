import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const rentRollData = [
  {
    id: "1",
    unit: "5C",
    property: "Oakwood Apartments",
    tenant: "Robert Johnson",
    leaseStart: "01/01/2023",
    leaseEnd: "12/31/2023",
    monthlyRent: 1450,
    status: "Current",
    balance: 0,
  },
  {
    id: "2",
    unit: "2B",
    property: "Riverside Condos",
    tenant: "Sarah Davis",
    leaseStart: "03/15/2023",
    leaseEnd: "03/15/2024",
    monthlyRent: 1200,
    status: "Current",
    balance: 0,
  },
  {
    id: "3",
    unit: "2C",
    property: "Oakwood Apartments",
    tenant: "Thomas Wilson",
    leaseStart: "05/01/2023",
    leaseEnd: "05/01/2024",
    monthlyRent: 1350,
    status: "Current",
    balance: 0,
  },
  {
    id: "4",
    unit: "3B",
    property: "Oakwood Apartments",
    tenant: "Olivia Martinez",
    leaseStart: "Pending",
    leaseEnd: "Pending",
    monthlyRent: 1400,
    status: "Application",
    balance: 0,
  },
  {
    id: "5",
    unit: "1A",
    property: "Sunset Villas",
    tenant: "James Taylor",
    leaseStart: "09/01/2022",
    leaseEnd: "08/31/2023",
    monthlyRent: 1600,
    status: "Current",
    balance: 0,
  },
  {
    id: "6",
    unit: "4D",
    property: "Riverside Condos",
    tenant: "Emily Brown",
    leaseStart: "02/15/2023",
    leaseEnd: "02/15/2024",
    monthlyRent: 1250,
    status: "Past Due",
    balance: 1250,
  },
  {
    id: "7",
    unit: "3A",
    property: "Meadow View Townhomes",
    tenant: "Michael Garcia",
    leaseStart: "04/01/2023",
    leaseEnd: "04/01/2024",
    monthlyRent: 1550,
    status: "Current",
    balance: 0,
  },
]

export function RentRollReport() {
  // Calculate totals
  const totalUnits = rentRollData.length
  const occupiedUnits = rentRollData.filter((unit) => unit.status !== "Vacant" && unit.status !== "Application").length
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100)
  const totalMonthlyRent = rentRollData.reduce((sum, unit) => sum + unit.monthlyRent, 0)
  const totalOutstanding = rentRollData.reduce((sum, unit) => sum + unit.balance, 0)

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        This report provides a comprehensive overview of all rental units, current tenants, lease terms, and payment
        status.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-muted p-3 rounded-md">
          <div className="text-sm font-medium">Total Units</div>
          <div className="text-2xl font-bold">{totalUnits}</div>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <div className="text-sm font-medium">Occupancy</div>
          <div className="text-2xl font-bold">{occupancyRate}%</div>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <div className="text-sm font-medium">Monthly Rent</div>
          <div className="text-2xl font-bold">${totalMonthlyRent.toLocaleString()}</div>
        </div>
        <div className="bg-muted p-3 rounded-md">
          <div className="text-sm font-medium">Outstanding</div>
          <div className="text-2xl font-bold text-red-600">${totalOutstanding.toLocaleString()}</div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unit</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Lease Period</TableHead>
            <TableHead>Monthly Rent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rentRollData.map((unit) => (
            <TableRow key={unit.id}>
              <TableCell className="font-medium">{unit.unit}</TableCell>
              <TableCell>{unit.property}</TableCell>
              <TableCell>{unit.tenant}</TableCell>
              <TableCell>
                {unit.leaseStart === "Pending" ? (
                  "Pending"
                ) : (
                  <>
                    {unit.leaseStart} to {unit.leaseEnd}
                  </>
                )}
              </TableCell>
              <TableCell>${unit.monthlyRent}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    unit.status === "Current"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : unit.status === "Past Due"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }
                >
                  {unit.status}
                </Badge>
              </TableCell>
              <TableCell className={unit.balance > 0 ? "text-red-600 font-medium" : ""}>${unit.balance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
