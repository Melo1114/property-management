"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, PencilIcon, TrashIcon, ImageIcon, CheckCircle, Camera } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

interface MaintenanceListProps {
  type?: "open" | "inprogress" | "completed" | "all"
}

const maintenanceRequests = [
  {
    id: "1",
    issue: "Leaky faucet",
    property: "Oakwood Apartments",
    unit: "2A",
    tenant: "Robert Johnson",
    priority: "Medium",
    status: "Completed",
    dateSubmitted: "05/10/2023",
    dateCompleted: "05/12/2023",
    assignedTo: "John Smith",
    completionProof: "/placeholder.svg?height=400&width=600&text=Completed+Repair",
    description: "Tenant reported water leaking from kitchen faucet. Replaced washer and tightened connections.",
  },
  {
    id: "2",
    issue: "AC not working",
    property: "Riverside Condos",
    unit: "4D",
    tenant: "Sarah Davis",
    priority: "High",
    status: "In Progress",
    dateSubmitted: "05/11/2023",
    dateCompleted: null,
    assignedTo: "Mike Johnson",
    completionProof: null,
    description: "AC unit not cooling properly. Tenant reports temperature remains high even when AC is running.",
  },
  {
    id: "3",
    issue: "Broken dishwasher",
    property: "Sunset Villas",
    unit: "1B",
    tenant: "James Taylor",
    priority: "Medium",
    status: "Open",
    dateSubmitted: "05/09/2023",
    dateCompleted: null,
    assignedTo: null,
    completionProof: null,
    description: "Dishwasher not draining properly and making loud noise during cycle.",
  },
  {
    id: "4",
    issue: "Clogged toilet",
    property: "Oakwood Apartments",
    unit: "3C",
    tenant: "Thomas Wilson",
    priority: "High",
    status: "Open",
    dateSubmitted: "05/11/2023",
    dateCompleted: null,
    assignedTo: null,
    completionProof: null,
    description: "Toilet clogged and overflowing. Tenant has tried plunger without success.",
  },
  {
    id: "5",
    issue: "Broken window",
    property: "Meadow View Townhomes",
    unit: "5A",
    tenant: "Emily Brown",
    priority: "Medium",
    status: "Open",
    dateSubmitted: "05/10/2023",
    dateCompleted: null,
    assignedTo: null,
    completionProof: null,
    description: "Window in living room has crack in glass. No immediate safety concern but needs replacement.",
  },
]

export function MaintenanceList({ type = "all" }: MaintenanceListProps) {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [proofImage, setProofImage] = useState<string | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  // Filter maintenance requests based on type
  const filteredRequests = maintenanceRequests.filter((request) => {
    if (type === "all") return true
    return request.status.toLowerCase().replace(/\s+/g, "") === type
  })

  const handleUploadProof = (requestId: string) => {
    // In a real app, this would trigger a file upload
    // For this mockup, we'll just simulate adding a proof image
    const updatedRequests = maintenanceRequests.map((request) => {
      if (request.id === requestId) {
        return {
          ...request,
          completionProof: "/placeholder.svg?height=400&width=600&text=Maintenance+Completed",
          status: "Completed",
          dateCompleted: new Date().toLocaleDateString(),
        }
      }
      return request
    })

    // Close dialog and show success message
    setUploadDialogOpen(false)
    alert("Proof uploaded successfully!")
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Issue</TableHead>
            <TableHead>Property/Unit</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Submitted</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.issue}</TableCell>
              <TableCell>
                <div className="grid gap-0.5">
                  <span className="text-sm">{request.property}</span>
                  <span className="text-xs text-muted-foreground">Unit {request.unit}</span>
                </div>
              </TableCell>
              <TableCell>{request.tenant}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    request.priority === "High"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : request.priority === "Medium"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                  }
                >
                  {request.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    request.status === "Open"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : request.status === "In Progress"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-green-50 text-green-700 border-green-200"
                  }
                >
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>{request.dateSubmitted}</TableCell>
              <TableCell>
                {request.assignedTo || <span className="text-muted-foreground text-sm">Not assigned</span>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {request.completionProof && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedRequest(request)
                        setProofImage(request.completionProof)
                      }}
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span className="sr-only">View proof</span>
                    </Button>
                  )}

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
                      <DropdownMenuItem onClick={() => setSelectedRequest(request)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem>
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>Assign Vendor</DropdownMenuItem>

                      {request.status === "Open" && <DropdownMenuItem>Mark as In Progress</DropdownMenuItem>}

                      {(request.status === "Open" || request.status === "In Progress") && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRequest(request)
                            setUploadDialogOpen(true)
                          }}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Upload Completion Proof
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Maintenance Request Details Dialog */}
      {selectedRequest && (
        <Dialog
          open={!!selectedRequest && !uploadDialogOpen}
          onOpenChange={(open) => !open && setSelectedRequest(null)}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Maintenance Request Details</DialogTitle>
              <DialogDescription>
                Request #{selectedRequest.id} - {selectedRequest.issue}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Property:</div>
                <div className="col-span-3">
                  {selectedRequest.property} - Unit {selectedRequest.unit}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Tenant:</div>
                <div className="col-span-3">{selectedRequest.tenant}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Status:</div>
                <div className="col-span-3">
                  <Badge
                    variant="outline"
                    className={
                      selectedRequest.status === "Open"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : selectedRequest.status === "In Progress"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-green-50 text-green-700 border-green-200"
                    }
                  >
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Dates:</div>
                <div className="col-span-3">
                  Submitted: {selectedRequest.dateSubmitted}
                  {selectedRequest.dateCompleted && <div>Completed: {selectedRequest.dateCompleted}</div>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="font-medium">Description:</div>
                <div className="col-span-3">{selectedRequest.description}</div>
              </div>

              {selectedRequest.assignedTo && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Assigned To:</div>
                  <div className="col-span-3">{selectedRequest.assignedTo}</div>
                </div>
              )}

              {selectedRequest.completionProof && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <div className="font-medium">Completion Proof:</div>
                  <div className="col-span-3">
                    <div className="border rounded-md overflow-hidden">
                      <Image
                        src={selectedRequest.completionProof || "/placeholder.svg"}
                        alt="Completion proof"
                        width={500}
                        height={300}
                        className="object-cover w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              {(selectedRequest.status === "Open" || selectedRequest.status === "In Progress") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadDialogOpen(true)
                    // Keep the selected request
                  }}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Proof
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Proof Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Completion Proof</DialogTitle>
            <DialogDescription>Upload a photo showing the completed maintenance work.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex flex-col items-center gap-2">
                <Camera className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Drag and drop an image, or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports JPG, PNG, HEIC - Max 10MB</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Mark as completed</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add notes about the completion"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedRequest && handleUploadProof(selectedRequest.id)}>Upload & Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Proof Image Dialog */}
      <Dialog open={!!proofImage} onOpenChange={(open) => !open && setProofImage(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Completion Proof</DialogTitle>
            <DialogDescription>Photo evidence of completed maintenance work</DialogDescription>
          </DialogHeader>

          {proofImage && (
            <div className="py-4">
              <div className="border rounded-md overflow-hidden">
                <Image
                  src={proofImage || "/placeholder.svg"}
                  alt="Completion proof"
                  width={650}
                  height={400}
                  className="object-cover w-full"
                />
              </div>

              {selectedRequest?.dateCompleted && (
                <p className="text-sm text-muted-foreground mt-2">
                  Completed on {selectedRequest.dateCompleted} by {selectedRequest.assignedTo}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setProofImage(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
