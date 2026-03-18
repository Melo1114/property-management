import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const incomeData = [
  { category: "Rental Income", amount: 24580 },
  { category: "Late Fees", amount: 350 },
  { category: "Application Fees", amount: 200 },
  { category: "Parking Fees", amount: 450 },
  { category: "Other Income", amount: 125 },
]

const expenseData = [
  { category: "Maintenance & Repairs", amount: 3250 },
  { category: "Property Management", amount: 2458 },
  { category: "Property Insurance", amount: 1500 },
  { category: "Property Taxes", amount: 2800 },
  { category: "Utilities", amount: 850 },
  { category: "Landscaping", amount: 400 },
  { category: "Legal & Professional Fees", amount: 250 },
]

export function ProfitLossReport() {
  // Calculate totals
  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0)
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0)
  const netIncome = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        This statement summarizes the revenues, costs, and expenses incurred during the specified time period.
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Income</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70%]">Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomeData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right">${item.amount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50">
              <TableCell className="font-bold">Total Income</TableCell>
              <TableCell className="text-right font-bold">${totalIncome.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Expenses</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70%]">Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenseData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right">${item.amount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50">
              <TableCell className="font-bold">Total Expenses</TableCell>
              <TableCell className="text-right font-bold">${totalExpenses.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="border-t pt-4">
        <Table>
          <TableBody>
            <TableRow className="bg-muted">
              <TableCell className="font-bold text-lg">Net Income</TableCell>
              <TableCell className="text-right font-bold text-lg text-green-600">
                ${netIncome.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
