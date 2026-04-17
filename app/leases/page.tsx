"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leasesApi } from "@/lib/api";
import type { Lease, LeaseStatus } from "@/lib/types";

const STATUS_STYLES: Record<LeaseStatus, string> = {
  Active: "bg-green-100 text-green-800",
  Expired: "bg-gray-100 text-gray-800",
  Terminated: "bg-red-100 text-red-800",
  Pending: "bg-yellow-100 text-yellow-800",
};

function LeaseTable({ status }: { status?: LeaseStatus }) {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await leasesApi.list(status);
        if (!cancelled) {
          setLeases(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            (err as { response?: { data?: { detail?: string } } })?.response
              ?.data?.detail ?? "Failed to load leases.";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [status]);

  if (loading) {
    return (
      <p className="py-4 text-sm text-muted-foreground">Loading leases…</p>
    );
  }

  if (error) {
    return <p className="py-4 text-sm text-red-500">{error}</p>;
  }

  if (leases.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No leases yet.{" "}
        <Link href="/leases/new" className="underline">
          Create your first lease
        </Link>
        .
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tenant</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>End</TableHead>
          <TableHead>Rent</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leases.map((lease) => (
          <TableRow key={lease.id}>
            <TableCell className="font-medium">{lease.tenant_name}</TableCell>
            <TableCell>
              {lease.unit_detail?.property} · {lease.unit_detail?.unit_number}
            </TableCell>
            <TableCell>{lease.start_date}</TableCell>
            <TableCell>{lease.end_date}</TableCell>
            <TableCell>R {lease.monthly_rent}</TableCell>
            <TableCell>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  STATUS_STYLES[lease.status]
                }`}
              >
                {lease.status}
              </span>
            </TableCell>
            <TableCell>
              <Link
                href={`/leases/${lease.id}/edit`}
                className="text-sm text-primary hover:underline"
              >
                Edit
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function LeasesPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Leases</h1>
          <Link
            href="/leases/new"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Lease
          </Link>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Leases</CardTitle>
                <CardDescription>Every lease on record</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaseTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Leases</CardTitle>
                <CardDescription>Currently running</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaseTable status="Active" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Leases</CardTitle>
                <CardDescription>Awaiting activation</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaseTable status="Pending" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expired">
            <Card>
              <CardHeader>
                <CardTitle>Expired Leases</CardTitle>
                <CardDescription>No longer active</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaseTable status="Expired" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
