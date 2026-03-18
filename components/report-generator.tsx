"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Printer } from "lucide-react"
import { RentRollReport } from "@/components/rent-roll-report"
import { ProfitLossReport } from "@/components/profit-loss-report"
import { DateRangePicker } from "@/components/date-range-picker"
import { PropertySelector } from "@/components/property-selector"

export function ReportGenerator() {
  const [reportType, setReportType] = useState("rent-roll")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = () => {
    setIsGenerating(true)

    // Simulate report generation delay
    setTimeout(() => {
      setIsGenerating(false)

      // In a real app, this would generate and download a PDF or Excel file
      // For this mockup, we'll just show an alert
      alert("Report downloaded successfully!")
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Reports</CardTitle>
        <CardDescription>Create and download property management reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <DateRangePicker />
          <PropertySelector />
        </div>

        <Tabs defaultValue="rent-roll" className="w-full" onValueChange={setReportType}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rent-roll">Rent Roll</TabsTrigger>
            <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          </TabsList>
          <TabsContent value="rent-roll" className="border rounded-md p-4 mt-4">
            <RentRollReport />
          </TabsContent>
          <TabsContent value="profit-loss" className="border rounded-md p-4 mt-4">
            <ProfitLossReport />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating}>
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Download Report"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
