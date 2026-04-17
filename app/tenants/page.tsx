import Link from "next/link"
import { Home, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TenantsList } from "@/components/tenants-list"

export default function TenantsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/tenants/new"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Link>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Tenants</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="former">Former</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Directory</CardTitle>
                <CardDescription>Manage all your tenants in one place</CardDescription>
              </CardHeader>
              <CardContent>
                <TenantsList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Tenants</CardTitle>
                <CardDescription>Currently renting properties</CardDescription>
              </CardHeader>
              <CardContent>
                <TenantsList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Tenants</CardTitle>
                <CardDescription>Applications in process</CardDescription>
              </CardHeader>
              <CardContent>
                <TenantsList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="former" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Former Tenants</CardTitle>
                <CardDescription>Previous renters</CardDescription>
              </CardHeader>
              <CardContent>
                <TenantsList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
