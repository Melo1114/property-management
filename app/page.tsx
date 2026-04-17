import Link from "next/link"
import { Home } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { Overview } from "@/components/overview"
import { RecentActivity } from "@/components/recent-activity"
import { PropertiesList } from "@/components/properties-list"
import { UserNav } from "@/components/user-nav"
import { DashboardKpis } from "@/components/dashboard-kpis"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6" />
            <span className="hidden sm:inline-block">AurumKeys</span>
          </div>
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 pt-6 sm:p-6 sm:pt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Link
            href="/properties/add"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Add Property
          </Link>
        </div>

        <DashboardKpis />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly rent collected over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <Overview />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates across your properties</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
            <CardDescription>Manage your property portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <PropertiesList />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
