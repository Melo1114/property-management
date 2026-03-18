import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, PencilIcon, TrashIcon, RepeatIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TransactionsListProps {
  type?: "income" | "expense" | "all"
  recurring?: boolean
}

const transactions = [
  {
    id: "1",
    date: "06/01/2023",
    description: "Rent Payment - Apt 5C",
    property: "Oakwood Apartments",
    category: "Rent",
    amount: 1450,
    type: "income",
    status: "Completed",
    recurring: true,
  },
  {
    id: "2",
    date: "06/01/2023",
    description: "Rent Payment - Apt 2B",
    property: "Riverside Condos",
    category: "Rent",
    amount: 1200,
    type: "income",
    status: "Completed",
    recurring: true,
  },
  {
    id: "3",
    date: "06/02/2023",
    description: "Plumbing Repair - Apt 3B",
    property: "Oakwood Apartments",
    category: "Maintenance",
    amount: 350,
    type: "expense",
    status: "Completed",
    recurring: false,
  },
  {
    id: "4",
    date: "06/03/2023",
    description: "Landscaping Service",
    property: "Sunset Villas",
    category: "Maintenance",
    amount: 200,
    type: "expense",
    status: "Completed",
    recurring: true,
  },
  {
    id: "5",
    date: "06/05/2023",
    description: "Rent Payment - Unit 1A",
    property: "Sunset Villas",
    category: "Rent",
    amount: 1600,
    type: "income",
    status: "Completed",
    recurring: true,
  },
  {
    id: "6",
    date: "06/05/2023",
    description: "Property Insurance",
    property: "All Properties",
    category: "Insurance",
    amount: 750,
    type: "expense",
    status: "Completed",
    recurring: true,
  },
  {
    id: "7",
    date: "06/10/2023",
    description: "Late Fee - Apt 4D",
    property: "Riverside Condos",
    category: "Fees",
    amount: 50,
    type: "income",
    status: "Completed",
    recurring: false,
  },
  {
    id: "8",
    date: "06/15/2023",
    description: "HVAC Maintenance",
    property: "Meadow View Townhomes",
    category: "Maintenance",
    amount: 420,
    type: "expense",
    status: "Completed",
    recurring: false,
  },
]

export function TransactionsList({ type = "all", recurring }: TransactionsListProps) {
  // Filter transactions based on props
  const filteredTransactions = transactions.filter((transaction) => {
    if (type !== "all" && transaction.type !== type) return false
    if (recurring !== undefined && transaction.recurring !== recurring) return false
    return true
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Property</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTransactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.date}</TableCell>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {transaction.description}
                {transaction.recurring && <RepeatIcon className="h-4 w-4 text-muted-foreground" />}
              </div>
            </TableCell>
            <TableCell>{transaction.property}</TableCell>
            <TableCell>{transaction.category}</TableCell>
            <TableCell className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
              {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  transaction.type === "income"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }
              >
                {transaction.type === "income" ? "Income" : "Expense"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {transaction.status}
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
                  {transaction.recurring && <DropdownMenuItem>Manage Recurring Schedule</DropdownMenuItem>}
                  <DropdownMenuItem>Add to Report</DropdownMenuItem>
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
