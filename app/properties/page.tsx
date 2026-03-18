import Link from "next/link"
import { Home, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { PropertiesList } from "@/components/properties-list"
import { UserNav } from "@/components/user-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PropertiesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6" />
            <span className="hidden sm:inline-block">PropertyPro</span>
          </div>
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 pt-6 sm:p-6 sm:pt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/properties/add"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Properties</TabsTrigger>
            <TabsTrigger value="apartments">Apartments</TabsTrigger>
            <TabsTrigger value="houses">Houses</TabsTrigger>
            <TabsTrigger value="condos">Condos</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Portfolio</CardTitle>
                <CardDescription>Manage all your properties in one place</CardDescription>
              </CardHeader>
              <CardContent>
                <PropertiesList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="apartments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Apartments</CardTitle>
                <CardDescription>Manage your apartment properties</CardDescription>
              </CardHeader>
              <CardContent>
                <PropertiesList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="houses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Houses</CardTitle>
                <CardDescription>Manage your house properties</CardDescription>
              </CardHeader>
              <CardContent>
                <PropertiesList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="condos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Condos</CardTitle>
                <CardDescription>Manage your condo properties</CardDescription>
              </CardHeader>
              <CardContent>
                <PropertiesList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
