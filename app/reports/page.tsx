"use client"

import { useEffect, useState } from "react"
import { Download, Home } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ReportGenerator } from "@/components/report-generator"
import { reportsApi, downloadBlob, type ReportFormat } from "@/lib/api"

interface DashboardStats {
  total_properties?: number
  total_units?: number
  occupied_units?: number
  total_tenants?: number
  monthly_revenue?: number
  outstanding_balance?: number
}

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      try {
        const res = await reportsApi.dashboard("json")
        if (!cancelled) {
          setStats(res.data as DashboardStats)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            (err as { response?: { data?: { detail?: string } } })?.response
              ?.data?.detail ?? "Failed to load dashboard stats."
          setError(msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadStats()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleDownload(
    reportName: "rent-roll" | "occupancy" | "overdue" | "dashboard",
    format: ReportFormat,
  ) {
    const key = `${reportName}-${format}`
    setDownloading(key)
    try {
      let res
      if (reportName === "rent-roll") res = await reportsApi.rentRoll(format)
      else if (reportName === "occupancy") res = await reportsApi.occupancy(format)
      else if (reportName === "overdue") res = await reportsApi.overdue(format)
      else res = await reportsApi.dashboard(format)

      const ext = format === "pdf" ? "pdf" : "xlsx"
      downloadBlob(res.data as Blob, `${reportName}.${ext}`)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Failed to download report."
      setError(msg)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="group fixed left-0 top-0 h-full w-16 hover:w-64 bg-background border-r z-20 transition-all duration-300 overflow-hidden">
        <div className="flex h-16 items-center px-4 border-b">
          <div className="flex items-center gap-2 font-semibold whitespace-nowrap">
            <Home className="h-6 w-6 flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              AurumKeys
            </span>
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
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Properties</CardDescription>
              <CardTitle className="text-2xl">
                {loading ? "…" : stats?.total_properties ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Occupied Units</CardDescription>
              <CardTitle className="text-2xl">
                {loading
                  ? "…"
                  : `${stats?.occupied_units ?? 0} / ${stats?.total_units ?? 0}`}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Monthly Revenue</CardDescription>
              <CardTitle className="text-2xl">
                {loading ? "…" : `R ${(stats?.monthly_revenue ?? 0).toLocaleString()}`}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Outstanding</CardDescription>
              <CardTitle className="text-2xl">
                {loading ? "…" : `R ${(stats?.outstanding_balance ?? 0).toLocaleString()}`}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="download" className="space-y-4">
          <TabsList>
            <TabsTrigger value="download">Download Reports</TabsTrigger>
            <TabsTrigger value="generate">Generate Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="download" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Reports</CardTitle>
                <CardDescription>
                  Download PDF or Excel copies of your key property reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: "rent-roll", label: "Rent Roll" },
                  { key: "occupancy", label: "Occupancy" },
                  { key: "overdue", label: "Overdue Payments" },
                  { key: "dashboard", label: "Dashboard Snapshot" },
                ].map((r) => (
                  <div
                    key={r.key}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border rounded-md p-3"
                  >
                    <span className="font-medium">{r.label}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={downloading === `${r.key}-pdf`}
                        onClick={() =>
                          handleDownload(
                            r.key as "rent-roll" | "occupancy" | "overdue" | "dashboard",
                            "pdf",
                          )
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {downloading === `${r.key}-pdf` ? "Downloading…" : "PDF"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={downloading === `${r.key}-excel`}
                        onClick={() =>
                          handleDownload(
                            r.key as "rent-roll" | "occupancy" | "overdue" | "dashboard",
                            "excel",
                          )
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {downloading === `${r.key}-excel` ? "Downloading…" : "Excel"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate" className="space-y-4">
            <ReportGenerator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
