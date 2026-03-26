// lib/auth.ts
// ─────────────────────────────────────────────────────────────────────────────
// Token storage (localStorage) and JWT decode utilities.
// All storage access is guarded against SSR (typeof window check).

import type { JWTPayload, Role } from "./types";

const ACCESS_KEY  = "pm_access";
const REFRESH_KEY = "pm_refresh";

// ── Storage ───────────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ── JWT Decode ────────────────────────────────────────────────────────────────

/**
 * Decode a JWT payload without verifying the signature.
 * Signature verification happens on the backend — this is only
 * used to read claims (role, user_id, exp) for client-side logic.
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const base64 = token.split(".")[1];
    const json   = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenPayload(): JWTPayload | null {
  const token = getAccessToken();
  return token ? decodeToken(token) : null;
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  // Add 10s buffer to avoid edge-case expiry between check and use
  return payload.exp * 1000 < Date.now() + 10_000;
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

// ── Role helpers ──────────────────────────────────────────────────────────────

export function getUserRole(): Role | null {
  const payload = getTokenPayload();
  return payload?.role ?? null;
}

export function hasRole(...roles: Role[]): boolean {
  const role = getUserRole();
  return role !== null && roles.includes(role);
}

export const isAdmin           = () => hasRole("Admin");
export const isPropertyManager = () => hasRole("Admin", "PropertyManager");
export const isTenant          = () => hasRole("Tenant");
export const isVendor          = () => hasRole("Vendor");
export const isAccountant      = () => hasRole("Admin", "Accountant");
