// lib/types.ts
// ─────────────────────────────────────────────────────────────────────────────
// TypeScript interfaces that mirror every Django model in the backend.
// Keep these in sync with the API responses.

// ── Auth ──────────────────────────────────────────────────────────────────────

export type Role =
  | "Admin"
  | "PropertyManager"
  | "Tenant"
  | "Vendor"
  | "Accountant";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  role: Role;
  date_joined: string;
  is_active?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  role: Role;
  password: string;
  password2: string;
}

// JWT payload embedded in the access token
export interface JWTPayload {
  user_id: number;
  email: string;
  role: Role;
  full_name: string;
  exp: number;
  iat: number;
}

// ── Properties ────────────────────────────────────────────────────────────────

export type PropertyType = "Residential" | "Commercial" | "MixedUse";
export type UnitStatus = "Available" | "Occupied" | "Maintenance";

export interface Property {
  id: number;
  manager: number | null;
  manager_name: string | null;
  name: string;
  property_type: PropertyType;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  description: string;
  is_active: boolean;
  total_units: number;
  available_units: number;
  created_at: string;
  updated_at: string;
  units?: Unit[]; // only on detail view
}

export interface Unit {
  id: number;
  property: number;
  unit_number: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  size_sqm: string | null;
  monthly_rent: string;
  deposit: string;
  status: UnitStatus;
  description: string;
  created_at: string;
  updated_at: string;
}

// ── Leases ────────────────────────────────────────────────────────────────────

export type LeaseStatus = "Active" | "Expired" | "Terminated" | "Pending";

export interface Lease {
  id: number;
  tenant: number;
  tenant_name: string;
  unit: number;
  unit_detail: {
    id: number;
    unit_number: string;
    property: string;
  };
  start_date: string;
  end_date: string;
  monthly_rent: string;
  deposit: string;
  status: LeaseStatus;
  days_remaining: number;
  is_expiring_soon: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

// ── Payments ──────────────────────────────────────────────────────────────────

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";
export type PaymentMethod = "MANUAL" | "CARD" | "BANK_TRANSFER" | "OTHER";

export interface Invoice {
  id: number;
  lease: number;
  lease_detail: {
    lease_id: number;
    unit_id: number;
    property_name: string;
    unit_number: string;
    tenant_id: number;
  };
  due_date: string;
  amount: string;
  description: string;
  period_start: string | null;
  period_end: string | null;
  status: InvoiceStatus;
  amount_paid: string;
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  invoice: number;
  amount: string;
  status: PaymentStatus;
  method: PaymentMethod;
  reference: string;
  created_at: string;
  processed_by: number | null;
}

export interface StripeCheckoutResult {
  session_id: string;
  checkout_url: string;
}

export interface PayFastCheckoutResult {
  payfast_url: string;
  payload: Record<string, string>;
}

// ── Maintenance ───────────────────────────────────────────────────────────────

export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type MaintenanceStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CANCELLED";

export interface MaintenanceComment {
  id: number;
  request: number;
  author: number;
  author_username: string;
  author_full_name: string;
  body: string;
  created_at: string;
}

export interface MaintenanceRequest {
  id: number;
  unit: number;
  unit_detail: {
    id: number;
    unit_number: string;
    property_name: string;
    property_id: number;
  };
  reported_by: number;
  reported_by_username: string;
  reported_by_name: string;
  assigned_to: number | null;
  assigned_to_username: string | null;
  assigned_to_name: string | null;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  comments: MaintenanceComment[];
  created_at: string;
  updated_at: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationKind =
  | "MAINTENANCE_NEW"
  | "MAINTENANCE_UPDATED"
  | "INVOICE_SENT"
  | "PAYMENT_RECEIVED"
  | "OTHER";

export interface Notification {
  id: number;
  title: string;
  message: string;
  kind: NotificationKind;
  read: boolean;
  created_at: string;
  target_id: number | null;
  target_type: string;
}

// ── Reports ───────────────────────────────────────────────────────────────────

export interface DashboardReport {
  total_properties: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  maintenance_units: number;
  open_maintenance_requests: number;
  overdue_invoices_count: number;
  overdue_invoices_total: string;
}

export interface RentRollItem {
  property_id: number;
  property_name: string;
  unit_id: number;
  unit_number: string;
  status: UnitStatus;
  monthly_rent: string;
  tenant_id: number | null;
  tenant_name: string | null;
  lease_id: number | null;
  lease_end_date: string | null;
}

export interface RentRollReport {
  rent_roll: RentRollItem[];
  count: number;
}

export interface OccupancyReport {
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  maintenance_units: number;
  occupancy_rate_percent: number;
}

export interface OverdueInvoice {
  invoice_id: number;
  due_date: string;
  amount: string;
  balance: string;
  status: InvoiceStatus;
  property_name: string;
  unit_number: string;
  tenant_id: number;
  tenant_name: string;
}

export interface OverdueReport {
  overdue_invoices: OverdueInvoice[];
  count: number;
  total_overdue: string;
}

// ── API helpers ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  [key: string]: string | string[] | undefined;
}
