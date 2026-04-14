"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, MoreHorizontal } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMaintenance } from "@/hooks"
import type { MaintenanceRequest } from "@/lib/types"

interface MaintenanceListProps {
  type?: "open" | "inprogress" | "completed" | "all"
}

const statusFilter: Record<string, string> = {
  open: "OPEN", inprogress: "IN_PROGRESS", completed: "RESOLVED", all: "",
}
const priorityClass: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 border-red-200",
  URGENT: "bg-red-50 text-red-700 border-red-200",
  MEDIUM: "bg-yellow-50 text-yellow-700 border-yellow-200",
  LOW: "bg-blue-50 text-blue-700 border-blue-200",
}
const statusClass: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-yellow-50 text-yellow-700 border-yellow-200",
  RESOLVED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-gray-50 text-gray-500 border-gray-200",
}
const statusLabel: Record<string, string> = {
  OPEN: "Open", IN_PROGRESS: "In Progress", RESOLVED: "Resolved", CANCELLED: "Cancelled",
}

export function MaintenanceList({ type = "all" }: MaintenanceListProps) {
  const apiStatus = statusFilter[type]
  const { data: requests, isLoading, error, resolveRequest } =
    useMaintenance(apiStatus ? { status: apiStatus } : undefined)

  const [selected, setSelected] = useState<MaintenanceRequest | null>(null)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolveNote, setResolveNote] = useState("")

  if (isLoading) return <p className="py-4 text-sm text-muted-foreground">Loading requests…</p>
  if (error) return <p className="py-4 text-sm text-red-500">{error}</p>
  if (!requests || requests.length === 0)
    return <p className="py-4 text-sm text-muted-foreground">No maintenance requests found.</p>

  const handleResolve = async () => {
    if (!selected) return
    await resolveRequest(selected.id, resolveNote)
    setResolveOpen(false)
    setResolveNote("")
    setSelected(null)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Issue</TableHead>
            <TableHead>Property / Unit</TableHead>
            <TableHead>Reported By</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-medium">{req.title}</TableCell>
              <TableCell>
                <div className="grid gap-0.5">
                  <span className="text-sm">{req.unit_detail.property_name}</span>
                  <span className="text-xs text-muted-foreground">Unit {req.unit_detail.unit_number}</span>
                </div>
              </TableCell>
              <TableCell>{req.reported_by_name}</TableCell>
              <TableCell>
                <Badge variant="outline" className={priorityClass[req.priority] ?? ""}>
                  {req.priority.charAt(0) + req.priority.slice(1).toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={statusClass[req.status] ?? ""}>
                  {statusLabel[req.status] ?? req.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(req.created_at).toLocaleDateString("en-ZA")}</TableCell>
              <TableCell>
                {req.assigned_to_name ?? (
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                )}
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
                    <DropdownMenuItem onClick={() => setSelected(req)}>
                      View Details
                    </DropdownMenuItem>
                    {(req.status === "OPEN" || req.status === "IN_PROGRESS") && (
                      <DropdownMenuItem onClick={() => { setSelected(req); setResolveOpen(true) }}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Resolved
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selected && !resolveOpen && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selected.title}</DialogTitle>
              <DialogDescription>Request #{selected.id} — {statusLabel[selected.status]}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4 text-sm">
              <div className="grid grid-cols-4 gap-2">
                <span className="font-medium">Property:</span>
                <span className="col-span-3">{selected.unit_detail.property_name} — Unit {selected.unit_detail.unit_number}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <span className="font-medium">Reported by:</span>
                <span className="col-span-3">{selected.reported_by_name}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <span className="font-medium">Priority:</span>
                <span className="col-span-3">{selected.priority}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <span className="font-medium">Description:</span>
                <span className="col-span-3">{selected.description}</span>
              </div>
              {selected.comments.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  <span className="font-medium">Comments:</span>
                  <div className="col-span-3 space-y-1">
                    {selected.comments.map((c) => (
                      <div key={c.id} className="rounded-md bg-muted p-2 text-xs">
                        <span className="font-medium">{c.author_full_name}:</span> {c.body}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setSelected(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {resolveOpen && selected && (
        <Dialog open onOpenChange={() => { setResolveOpen(false); setSelected(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark as Resolved</DialogTitle>
              <DialogDescription>Describe how "{selected.title}" was resolved.</DialogDescription>
            </DialogHeader>
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Resolution notes…"
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setResolveOpen(false); setSelected(null) }}>Cancel</Button>
              <Button onClick={handleResolve} disabled={!resolveNote.trim()}>
                <CheckCircle className="mr-2 h-4 w-4" /> Confirm Resolved
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
