import { Download, Filter, Home } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FinancialOverview } from "@/components/financial-overview"
import { TransactionsList } from "@/components/transactions-list"
import { DateRangePicker } from "@/components/date-range-picker"
import { PropertySelector } from "@/components/property-selector"
import { IncomeDistribution } from "@/components/income-distribution"
import { ReportGenerator } from "@/components/report-generator"
import { AccountingKpis } from "@/components/accounting-kpis"

export default function AccountingPage() {
  return (
    <div className="flex min-h-screen">
      <div className="group fixed left-0 top-0 h-full w-16 hover:w-64 bg-background border-r z-20 transition-all duration-300 overflow-hidden">
        <div className="flex h-16 items-center px-4 border-b">
          <div className="flex items-center gap-2 font-semibold whitespace-nowrap">
            <Home className="h-6 w-6 flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">AurumKeys</span>
          </div>
        </div>
        <div className="py-4">
          <MainNav className="flex-col items-start space-y-4 px-4" />
          <div className="mt-auto pt-4 px-4">
            <UserNav />
          </div>
        </div>
      </div>

      <main className="flex-1 ml-16 space-y-4 p-4 pt-6 sm:p-6 sm:pt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>

        <AccountingKpis />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-2">
                <DateRangePicker />
                <PropertySelector />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" /> More Filters
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-7">
              <Card className="md:col-span-7 lg:col-span-4">
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                  <CardDescription>Monthly income breakdown</CardDescription>
                </CardHeader>
                <CardContent><FinancialOverview /></CardContent>
              </Card>
              <Card className="md:col-span-7 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Income Distribution</CardTitle>
                  <CardDescription>Revenue by property</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]"><IncomeDistribution /></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Invoice History</CardTitle>
                  <CardDescription>All rent invoices and payments</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent><TransactionsList /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportGenerator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
