// lib/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Axios instance with two interceptors:
//   1. Request:  attach `Authorization: Bearer <token>` to every request
//   2. Response: on 401, attempt silent token refresh, then retry original request
//
// All API functions are exported from this file — import from here, not axios directly.

import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isTokenExpired,
} from "./auth";
import type {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterPayload,
  Property,
  Unit,
  Lease,
  Invoice,
  Payment,
  MaintenanceRequest,
  MaintenanceComment,
  Notification,
  DashboardReport,
  RentRollReport,
  OccupancyReport,
  OverdueReport,
  StripeCheckoutResult,
  PayFastCheckoutResult,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

// ── Axios instance ────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Request interceptor: attach access token ──────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: silent token refresh on 401 ────────────────────────

let isRefreshing = false;
// Queue of requests waiting for the refresh to complete
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject:  (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else       resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const original = error.config;

    // Only attempt refresh on 401 and only once per request
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Don't retry the refresh endpoint itself — that would loop
    if (original.url?.includes("/auth/token/refresh/")) {
      clearTokens();
      document.cookie = "access_token=; path=/; max-age=0";
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another request is already refreshing — queue this one
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing    = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken || isTokenExpired(refreshToken)) {
      clearTokens();
      document.cookie = "access_token=; path=/; max-age=0";
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post<AuthTokens>(
        `${BASE_URL}/auth/token/refresh/`,
        { refresh: refreshToken }
      );
      setTokens(data.access, data.refresh ?? refreshToken);
      processQueue(null, data.access);
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      document.cookie = "access_token=; path=/; max-age=0";
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthTokens & { role: string; full_name: string }>(
      "/auth/login/",
      { username: credentials.email, password: credentials.password }
    ),

  register: (payload: RegisterPayload) =>
    api.post<{ message: string; user: User }>("/auth/register/", payload),

  refresh: (refresh: string) =>
    api.post<AuthTokens>("/auth/token/refresh/", { refresh }),

  me: () => api.get<User>("/auth/me/"),

  getUsers: () => api.get<User[]>("/auth/users/"),

  getTenants: (search?: string) =>
    api.get<User[]>("/auth/tenants/", { params: { search } }),

  getTenant: (id: number) => api.get<User>(`/auth/tenants/${id}/`),

  updateTenant: (id: number, data: Partial<User>) =>
    api.patch<User>(`/auth/tenants/${id}/`, data),

  deleteTenant: (id: number) => api.delete(`/auth/tenants/${id}/`),
};

// ─────────────────────────────────────────────────────────────────────────────
//  PROPERTIES ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const propertiesApi = {
  list: (search?: string) =>
    api.get<Property[]>("/properties/", { params: { search } }),

  get: (id: number) => api.get<Property>(`/properties/${id}/`),

  create: (data: Partial<Property>) => api.post<Property>("/properties/", data),

  update: (id: number, data: Partial<Property>) =>
    api.patch<Property>(`/properties/${id}/`, data),

  delete: (id: number) => api.delete(`/properties/${id}/`),

  // Units
  listUnits: (params?: { property?: number; status?: string }) =>
    api.get<Unit[]>("/properties/units/", { params }),

  getUnit: (id: number) => api.get<Unit>(`/properties/units/${id}/`),

  createUnit: (data: Partial<Unit>) =>
    api.post<Unit>("/properties/units/", data),

  updateUnit: (id: number, data: Partial<Unit>) =>
    api.patch<Unit>(`/properties/units/${id}/`, data),

  deleteUnit: (id: number) => api.delete(`/properties/units/${id}/`),

  availableUnits: () => api.get<Unit[]>("/properties/units/available/"),
};

// ─────────────────────────────────────────────────────────────────────────────
//  LEASES ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const leasesApi = {
  list: (status?: string) =>
    api.get<Lease[]>("/leases/", { params: { status } }),

  get: (id: number) => api.get<Lease>(`/leases/${id}/`),

  create: (data: Partial<Lease>) => api.post<Lease>("/leases/", data),

  update: (id: number, data: Partial<Lease>) =>
    api.patch<Lease>(`/leases/${id}/`, data),

  delete: (id: number) => api.delete(`/leases/${id}/`),

  myLeases: () => api.get<Lease[]>("/leases/my/"),

  updateStatus: (id: number, status: string) =>
    api.patch<Lease>(`/leases/${id}/status/`, { status }),
};

// ─────────────────────────────────────────────────────────────────────────────
//  PAYMENTS ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const paymentsApi = {
  // Invoices
  listInvoices: (params?: { lease?: number; status?: string }) =>
    api.get<Invoice[]>("/payments/invoices/", { params }),

  getInvoice: (id: number) => api.get<Invoice>(`/payments/invoices/${id}/`),

  createInvoice: (data: Partial<Invoice>) =>
    api.post<Invoice>("/payments/invoices/", data),

  updateInvoice: (id: number, data: Partial<Invoice>) =>
    api.patch<Invoice>(`/payments/invoices/${id}/`, data),

  // Stripe checkout — returns session_id + checkout_url
  stripeCheckout: (invoiceId: number, frontendBaseUrl?: string) =>
    api.post<StripeCheckoutResult>(
      `/payments/invoices/${invoiceId}/stripe-checkout/`,
      { frontend_base_url: frontendBaseUrl ?? window.location.origin }
    ),

  // PayFast checkout — returns payfast_url + signed payload
  payfastCheckout: (invoiceId: number, frontendBaseUrl?: string) =>
    api.post<PayFastCheckoutResult>(
      `/payments/invoices/${invoiceId}/payfast-checkout/`,
      { frontend_base_url: frontendBaseUrl ?? window.location.origin }
    ),

  // Payments
  listPayments: (params?: { invoice?: number; status?: string }) =>
    api.get<Payment[]>("/payments/payments/", { params }),

  getPayment: (id: number) => api.get<Payment>(`/payments/payments/${id}/`),

  createPayment: (data: Partial<Payment>) =>
    api.post<Payment>("/payments/payments/", data),

  updatePaymentStatus: (id: number, status: string, notes?: string) =>
    api.patch<Payment>(`/payments/payments/${id}/`, { status, notes }),

  myPayments: () => api.get<Payment[]>("/payments/my/"),
};

// ─────────────────────────────────────────────────────────────────────────────
//  MAINTENANCE ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const maintenanceApi = {
  list: (params?: { status?: string; priority?: string }) =>
    api.get<MaintenanceRequest[]>("/maintenance/maintenance-requests/", {
      params,
    }),

  get: (id: number) =>
    api.get<MaintenanceRequest>(`/maintenance/maintenance-requests/${id}/`),

  create: (data: {
    unit: number;
    title: string;
    description?: string;
    priority?: string;
  }) => api.post<MaintenanceRequest>("/maintenance/maintenance-requests/", data),

  update: (id: number, data: Partial<MaintenanceRequest>) =>
    api.patch<MaintenanceRequest>(
      `/maintenance/maintenance-requests/${id}/`,
      data
    ),

  delete: (id: number) =>
    api.delete(`/maintenance/maintenance-requests/${id}/`),

  // Workflow actions
  assign: (id: number, vendorId: number, notes?: string) =>
    api.post<MaintenanceRequest>(
      `/maintenance/maintenance-requests/${id}/assign/`,
      { assigned_to: vendorId, notes }
    ),

  resolve: (id: number, resolutionNote: string) =>
    api.patch<MaintenanceRequest>(
      `/maintenance/maintenance-requests/${id}/resolve/`,
      { resolution_note: resolutionNote }
    ),

  cancel: (id: number, reason?: string) =>
    api.patch<MaintenanceRequest>(
      `/maintenance/maintenance-requests/${id}/cancel/`,
      { reason }
    ),

  // Comments
  addComment: (requestId: number, body: string) =>
    api.post<MaintenanceComment>("/maintenance/maintenance-comments/", {
      request: requestId,
      body,
    }),

  deleteComment: (commentId: number) =>
    api.delete(`/maintenance/maintenance-comments/${commentId}/`),
};

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATIONS ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: () => api.get<Notification[]>("/notifications/notifications/"),

  markRead: (id: number) =>
    api.post<Notification>(
      `/notifications/notifications/${id}/mark_read/`
    ),

  markAllRead: () =>
    api.post("/notifications/notifications/mark_all_read/"),
};

// ─────────────────────────────────────────────────────────────────────────────
//  REPORTS ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export type ReportFormat = "json" | "pdf" | "excel";

export const reportsApi = {
  dashboard: (format: ReportFormat = "json") =>
    format === "json"
      ? api.get<DashboardReport>("/reports/dashboard/")
      : api.get(`/reports/dashboard/?format=${format}`, {
          responseType: "blob",
        }),

  rentRoll: (format: ReportFormat = "json", propertyId?: number) =>
    format === "json"
      ? api.get<RentRollReport>("/reports/rent-roll/", {
          params: { property: propertyId },
        })
      : api.get(`/reports/rent-roll/?format=${format}`, {
          params: { property: propertyId },
          responseType: "blob",
        }),

  occupancy: (format: ReportFormat = "json", propertyId?: number) =>
    format === "json"
      ? api.get<OccupancyReport>("/reports/occupancy/", {
          params: { property: propertyId },
        })
      : api.get(`/reports/occupancy/?format=${format}`, {
          params: { property: propertyId },
          responseType: "blob",
        }),

  overdue: (format: ReportFormat = "json") =>
    format === "json"
      ? api.get<OverdueReport>("/reports/overdue/")
      : api.get(`/reports/overdue/?format=${format}`, {
          responseType: "blob",
        }),
};

// ── Blob download helper ──────────────────────────────────────────────────────

/**
 * Trigger a browser file download from a Blob response.
 * Use after calling any reportsApi method with format='pdf' or 'excel'.
 *
 * @example
 * const res = await reportsApi.rentRoll("pdf");
 * downloadBlob(res.data, "rent_roll.pdf");
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default api;
