"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useInvoices } from "@/hooks"

interface TransactionsListProps {
  type?: "income" | "expense" | "all"
  recurring?: boolean
}

const statusClass: Record<string, string> = {
  PAID: "bg-green-50 text-green-700 border-green-200",
  SENT: "bg-blue-50 text-blue-700 border-blue-200",
  PARTIALLY_PAID: "bg-yellow-50 text-yellow-700 border-yellow-200",
  DRAFT: "bg-gray-50 text-gray-500 border-gray-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
}

export function TransactionsList({ type = "all" }: TransactionsListProps) {
  const { data: invoices, isLoading, error } = useInvoices()

  if (isLoading) return <p className="py-4 text-sm text-muted-foreground">Loading invoices…</p>
  if (error) return <p className="py-4 text-sm text-red-500">{error}</p>

  if (type === "expense") {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        Expense tracking is not yet configured. Only rent income is tracked at this stage.
      </p>
    )
  }

  if (!invoices || invoices.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">No invoices found.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Due Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Property / Unit</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell>{new Date(inv.due_date).toLocaleDateString("en-ZA")}</TableCell>
            <TableCell className="font-medium">{inv.description || `Invoice #${inv.id}`}</TableCell>
            <TableCell>
              <div className="grid gap-0.5">
                <span className="text-sm">{inv.lease_detail.property_name}</span>
                <span className="text-xs text-muted-foreground">Unit {inv.lease_detail.unit_number}</span>
              </div>
            </TableCell>
            <TableCell className="text-green-600">
              R {parseFloat(inv.amount).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
            </TableCell>
            <TableCell>
              R {parseFloat(inv.amount_paid).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
            </TableCell>
            <TableCell className={parseFloat(inv.balance) > 0 ? "text-red-600" : "text-muted-foreground"}>
              R {parseFloat(inv.balance).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={statusClass[inv.status] ?? ""}>
                {inv.status.replace("_", " ")}
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
                  <DropdownMenuItem>View Invoice</DropdownMenuItem>
                  <DropdownMenuItem>Record Payment</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
