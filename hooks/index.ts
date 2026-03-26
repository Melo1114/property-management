"use client";

// hooks/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// All data-fetching hooks in one place.
// Each hook returns { data, isLoading, error, refetch, ...mutators }.
//
// Pattern used:
//   - useState for data + loading + error
//   - useEffect to fetch on mount (+ deps)
//   - Explicit mutator functions that call the API then refetch
//
// No extra libraries needed (no SWR / react-query).

import { useCallback, useEffect, useState } from "react";
import {
  authApi,
  downloadBlob,
  leasesApi,
  maintenanceApi,
  notificationsApi,
  paymentsApi,
  propertiesApi,
  reportsApi,
  type ReportFormat,
} from "@/lib/api";
import type {
  DashboardReport,
  Invoice,
  Lease,
  MaintenanceRequest,
  Notification,
  OccupancyReport,
  OverdueReport,
  Payment,
  Property,
  RentRollReport,
  Unit,
  User,
} from "@/lib/types";

// ── Shared fetch wrapper ──────────────────────────────────────────────────────

type FetchState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

function useFetch<T>(
  fetcher: () => Promise<{ data: T }>,
  deps: unknown[] = []
) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { data } = await fetcher();
      setState({ data, isLoading: false, error: null });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "An error occurred";
      setState({ data: null, isLoading: false, error: msg });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...state, refetch: fetch };
}

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export function useDashboard() {
  return useFetch<DashboardReport>(() => reportsApi.dashboard("json") as Promise<{ data: DashboardReport }>);
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROPERTIES
// ─────────────────────────────────────────────────────────────────────────────

export function useProperties(search?: string) {
  const result = useFetch<Property[]>(
    () => propertiesApi.list(search),
    [search]
  );

  const createProperty = useCallback(
    async (data: Partial<Property>) => {
      await propertiesApi.create(data);
      result.refetch();
    },
    [result]
  );

  const updateProperty = useCallback(
    async (id: number, data: Partial<Property>) => {
      await propertiesApi.update(id, data);
      result.refetch();
    },
    [result]
  );

  const deleteProperty = useCallback(
    async (id: number) => {
      await propertiesApi.delete(id);
      result.refetch();
    },
    [result]
  );

  return { ...result, createProperty, updateProperty, deleteProperty };
}

export function useProperty(id: number) {
  return useFetch<Property>(() => propertiesApi.get(id), [id]);
}

// ── Units ─────────────────────────────────────────────────────────────────────

export function useUnits(params?: { property?: number; status?: string }) {
  const result = useFetch<Unit[]>(
    () => propertiesApi.listUnits(params),
    [params?.property, params?.status]
  );

  const createUnit = useCallback(
    async (data: Partial<Unit>) => {
      await propertiesApi.createUnit(data);
      result.refetch();
    },
    [result]
  );

  const updateUnit = useCallback(
    async (id: number, data: Partial<Unit>) => {
      await propertiesApi.updateUnit(id, data);
      result.refetch();
    },
    [result]
  );

  const deleteUnit = useCallback(
    async (id: number) => {
      await propertiesApi.deleteUnit(id);
      result.refetch();
    },
    [result]
  );

  return { ...result, createUnit, updateUnit, deleteUnit };
}

// ─────────────────────────────────────────────────────────────────────────────
//  TENANTS
// ─────────────────────────────────────────────────────────────────────────────

export function useTenants(search?: string) {
  const result = useFetch<User[]>(
    () => authApi.getTenants(search),
    [search]
  );

  const updateTenant = useCallback(
    async (id: number, data: Partial<User>) => {
      await authApi.updateTenant(id, data);
      result.refetch();
    },
    [result]
  );

  const deleteTenant = useCallback(
    async (id: number) => {
      await authApi.deleteTenant(id);
      result.refetch();
    },
    [result]
  );

  return { ...result, updateTenant, deleteTenant };
}

export function useTenant(id: number) {
  return useFetch<User>(() => authApi.getTenant(id), [id]);
}

// ─────────────────────────────────────────────────────────────────────────────
//  LEASES
// ─────────────────────────────────────────────────────────────────────────────

export function useLeases(status?: string) {
  const result = useFetch<Lease[]>(
    () => leasesApi.list(status),
    [status]
  );

  const createLease = useCallback(
    async (data: Partial<Lease>) => {
      await leasesApi.create(data);
      result.refetch();
    },
    [result]
  );

  const updateLease = useCallback(
    async (id: number, data: Partial<Lease>) => {
      await leasesApi.update(id, data);
      result.refetch();
    },
    [result]
  );

  const terminateLease = useCallback(
    async (id: number) => {
      await leasesApi.updateStatus(id, "Terminated");
      result.refetch();
    },
    [result]
  );

  return { ...result, createLease, updateLease, terminateLease };
}

/** For tenants: fetch only their own leases */
export function useMyLeases() {
  return useFetch<Lease[]>(() => leasesApi.myLeases());
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────

export function useInvoices(params?: { lease?: number; status?: string }) {
  const result = useFetch<Invoice[]>(
    () => paymentsApi.listInvoices(params),
    [params?.lease, params?.status]
  );

  const createInvoice = useCallback(
    async (data: Partial<Invoice>) => {
      await paymentsApi.createInvoice(data);
      result.refetch();
    },
    [result]
  );

  return { ...result, createInvoice };
}

export function usePayments(params?: { invoice?: number; status?: string }) {
  return useFetch<Payment[]>(
    () => paymentsApi.listPayments(params),
    [params?.invoice, params?.status]
  );
}

/** For tenants: their own payment history */
export function useMyPayments() {
  return useFetch<Payment[]>(() => paymentsApi.myPayments());
}

/**
 * Initiate a Stripe checkout and redirect to Stripe.
 * Returns a function you can call with an invoice ID.
 */
export function useStripeCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = useCallback(async (invoiceId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await paymentsApi.stripeCheckout(invoiceId);
      window.location.href = data.checkout_url;
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Checkout failed"
      );
      setIsLoading(false);
    }
  }, []);

  return { checkout, isLoading, error };
}

/**
 * Initiate a PayFast checkout.
 * Returns a function that auto-submits a hidden form to PayFast.
 */
export function usePayFastCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = useCallback(async (invoiceId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await paymentsApi.payfastCheckout(invoiceId);
      // Build and auto-submit a hidden form to PayFast
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.payfast_url;
      Object.entries(data.payload).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type  = "hidden";
        input.name  = key;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Checkout failed"
      );
      setIsLoading(false);
    }
  }, []);

  return { checkout, isLoading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAINTENANCE
// ─────────────────────────────────────────────────────────────────────────────

export function useMaintenance(params?: {
  status?: string;
  priority?: string;
}) {
  const result = useFetch<MaintenanceRequest[]>(
    () => maintenanceApi.list(params),
    [params?.status, params?.priority]
  );

  const createRequest = useCallback(
    async (data: {
      unit: number;
      title: string;
      description?: string;
      priority?: string;
    }) => {
      await maintenanceApi.create(data);
      result.refetch();
    },
    [result]
  );

  const assignVendor = useCallback(
    async (requestId: number, vendorId: number, notes?: string) => {
      await maintenanceApi.assign(requestId, vendorId, notes);
      result.refetch();
    },
    [result]
  );

  const resolveRequest = useCallback(
    async (requestId: number, resolutionNote: string) => {
      await maintenanceApi.resolve(requestId, resolutionNote);
      result.refetch();
    },
    [result]
  );

  const cancelRequest = useCallback(
    async (requestId: number, reason?: string) => {
      await maintenanceApi.cancel(requestId, reason);
      result.refetch();
    },
    [result]
  );

  const addComment = useCallback(
    async (requestId: number, body: string) => {
      await maintenanceApi.addComment(requestId, body);
      result.refetch();
    },
    [result]
  );

  return {
    ...result,
    createRequest,
    assignVendor,
    resolveRequest,
    cancelRequest,
    addComment,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const result = useFetch<Notification[]>(
    () => notificationsApi.list()
  );

  const unreadCount = (result.data ?? []).filter((n) => !n.read).length;

  const markRead = useCallback(
    async (id: number) => {
      await notificationsApi.markRead(id);
      result.refetch();
    },
    [result]
  );

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead();
    result.refetch();
  }, [result]);

  return { ...result, unreadCount, markRead, markAllRead };
}

// ─────────────────────────────────────────────────────────────────────────────
//  REPORTS
// ─────────────────────────────────────────────────────────────────────────────

export function useRentRoll(propertyId?: number) {
  const result = useFetch<RentRollReport>(
    () => reportsApi.rentRoll("json", propertyId) as Promise<{ data: RentRollReport }>,
    [propertyId]
  );

  const exportReport = useCallback(
    async (format: "pdf" | "excel") => {
      const res = await reportsApi.rentRoll(format, propertyId);
      const ext = format === "pdf" ? "pdf" : "xlsx";
      downloadBlob(res.data as Blob, `rent_roll.${ext}`);
    },
    [propertyId]
  );

  return { ...result, exportReport };
}

export function useOccupancyReport(propertyId?: number) {
  const result = useFetch<OccupancyReport>(
    () => reportsApi.occupancy("json", propertyId) as Promise<{ data: OccupancyReport }>,
    [propertyId]
  );

  const exportReport = useCallback(
    async (format: "pdf" | "excel") => {
      const res = await reportsApi.occupancy(format, propertyId);
      const ext = format === "pdf" ? "pdf" : "xlsx";
      downloadBlob(res.data as Blob, `occupancy_report.${ext}`);
    },
    [propertyId]
  );

  return { ...result, exportReport };
}

export function useOverdueReport() {
  const result = useFetch<OverdueReport>(
    () => reportsApi.overdue("json") as Promise<{ data: OverdueReport }>
  );

  const exportReport = useCallback(async (format: "pdf" | "excel") => {
    const res = await reportsApi.overdue(format);
    const ext = format === "pdf" ? "pdf" : "xlsx";
    downloadBlob(res.data as Blob, `overdue_report.${ext}`);
  }, []);

  return { ...result, exportReport };
}
