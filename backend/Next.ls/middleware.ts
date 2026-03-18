// middleware.ts  (project root — same level as app/)
// ─────────────────────────────────────────────────────────────────────────────
// Runs on every matched request BEFORE the page renders.
// Responsibilities:
//   1. Redirect unauthenticated users to /login
//   2. Redirect authenticated users away from /login
//   3. Block role-restricted routes (e.g. Tenant can't access /admin)
//
// NOTE: middleware runs on the Edge runtime — no Node APIs.
//       We can only read cookies or request headers here.
//       localStorage is NOT accessible; we use a cookie for the access token
//       written by the auth context on login.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Route config ──────────────────────────────────────────────────────────────

/** Routes anyone can visit without a token */
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

/** Routes only Admin or PropertyManager may access */
const ADMIN_PM_ONLY = [
  "/properties",
  "/tenants",
  "/accounting",
  "/reports",
  "/vendors",
];

/** Routes only Tenants may access */
const TENANT_ONLY = ["/tenant"];

/** Routes only Vendors may access */
const VENDOR_ONLY = ["/vendor"];

// ── JWT decode (edge-safe) ────────────────────────────────────────────────────

interface JWTPayload {
  user_id: number;
  email: string;
  role: string;
  exp: number;
}

function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64 = token.split(".")[1];
    // Edge runtime has atob
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JWTPayload;
  } catch {
    return null;
  }
}

function isExpired(payload: JWTPayload): boolean {
  return payload.exp * 1000 < Date.now() + 10_000;
}

// ── Middleware ────────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read the access token we store in an httpOnly-style cookie named "pm_access"
  // The auth-context writes this via document.cookie on login.
  const token = request.cookies.get("pm_access")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // ── 1. Unauthenticated user hitting a protected route ──────────────────────
  if (!token || !decodeJWT(token) || isExpired(decodeJWT(token)!)) {
    if (!isPublicRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Token is valid from here
  const payload = decodeJWT(token)!;
  const role = payload.role;

  // ── 2. Authenticated user hitting /login → redirect to dashboard ───────────
  if (pathname === "/login" || pathname === "/register") {
    const dest =
      role === "Tenant" ? "/tenant/dashboard"
      : role === "Vendor" ? "/vendor/dashboard"
      : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ── 3. Role-based access control ──────────────────────────────────────────

  const isAdminOrPM = role === "Admin" || role === "PropertyManager";

  // Admin-only or PM routes
  if (
    ADMIN_PM_ONLY.some((r) => pathname.startsWith(r)) &&
    !isAdminOrPM &&
    role !== "Accountant"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Tenant-only routes
  if (TENANT_ONLY.some((r) => pathname.startsWith(r)) && role !== "Tenant") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Vendor-only routes
  if (VENDOR_ONLY.some((r) => pathname.startsWith(r)) && role !== "Vendor") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// ── Matcher: run middleware on all routes except static files ─────────────────
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|images|fonts).*)",
  ],
};
