"use client";

import Link from "next/link";
import { useMyLeases, useInvoices, useMaintenance, useNotifications } from "@/hooks";
import { useAuthContext } from "@/context/auth-context";
import type { Lease, Invoice } from "@/lib/types";

function formatRand(v: string | number | undefined): string {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  return `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-ZA", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, accent, href,
}: {
  label: string; value: string; sub?: string;
  accent?: "green" | "orange" | "red"; href?: string;
}) {
  const accentColor =
    accent === "orange" ? "#F4842C" :
    accent === "red"    ? "#DC2626" : "#2D6A4F";

  const card = (
    <div style={{
      background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 12,
      padding: "20px 22px",
      borderTop: `3px solid ${accentColor}`,
      transition: "box-shadow 0.15s",
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280",
                    textTransform: "uppercase", letterSpacing: "0.8px",
                    marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#1F2937",
                    lineHeight: 1.1, marginBottom: 6 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 13, color: "#9CA3AF" }}>{sub}</div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        {card}
      </Link>
    );
  }
  return card;
}

// ── Notification row ──────────────────────────────────────────────────────────
function NotifRow({
  title, message, time, read,
}: {
  title: string; message: string; time: string; read: boolean;
}) {
  return (
    <div style={{
      display: "flex", gap: 12, padding: "14px 0",
      borderBottom: "1px solid #F3F4F6",
      opacity: read ? 0.65 : 1,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
        background: read ? "#E5E7EB" : "#F4842C",
        marginTop: 6,
      }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1F2937",
                      marginBottom: 2 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
          {message}
        </div>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
          {new Date(time).toLocaleString("en-ZA", {
            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TenantDashboard() {
  const { user } = useAuthContext();
  const { data: leases,        loading: lLoading } = useMyLeases();
  const { data: notifications, loading: nLoading, markRead } = useNotifications();
  const { data: maintenance,   loading: mLoading } = useMaintenance();

  const activeLease = (leases as Lease[] ?? []).find((l) => l.status === "Active")
    ?? (leases as Lease[] ?? [])[0];

  const { data: invoices, loading: iLoading } = useInvoices(
    activeLease ? { lease: activeLease.id } : undefined
  );

  const nextDueInvoice = (invoices as Invoice[] ?? [])
    .filter((inv) => !["PAID", "CANCELLED"].includes(inv.status))
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

  const openMaintenance = (maintenance ?? []).filter(
    (m) => !["RESOLVED", "CANCELLED"].includes(m.status)
  ).length;

  const greeting = user?.first_name
    ? `Welcome back, ${user.first_name}`
    : "Welcome back";

  const leaseEnd     = activeLease ? daysUntil(activeLease.end_date) : null;
  const leaseExpiring = leaseEnd !== null && leaseEnd <= 30 && leaseEnd >= 0;

  const recentNotifs = (notifications ?? []).slice(0, 6);

  const anyLoading = lLoading || nLoading || mLoading || iLoading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap');
        .t-dash { font-family: var(--font-body, 'DM Sans', system-ui, sans-serif); max-width: 960px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .card { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 12px; padding: 22px; }
        .card-title { font-size: 15px; font-weight: 600; color: #1F2937; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
        .card-link { font-size: 12px; font-weight: 500; color: #2D6A4F; text-decoration: none; }
        .card-link:hover { text-decoration: underline; }
        .alert-banner { background: #FEF3EA; border: 1px solid #F4842C; border-radius: 10px; padding: 12px 16px; font-size: 14px; color: #92400E; margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
        .skeleton { height: 24px; background: #F3F4F6; border-radius: 6px; animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @media (max-width: 640px) { .dash-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="t-dash">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "2px",
                        textTransform: "uppercase", color: "#F4842C", marginBottom: 6 }}>
            Tenant portal
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32,
                       fontWeight: 700, color: "#1A3D2B", letterSpacing: "-0.5px" }}>
            {greeting}
          </h1>
          {activeLease && (
            <p style={{ fontSize: 15, color: "#6B7280", marginTop: 6 }}>
              {activeLease.unit_detail.property} · Unit {activeLease.unit_detail.unit_number}
            </p>
          )}
        </div>

        {/* Expiry alert */}
        {leaseExpiring && (
          <div className="alert-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Your lease expires in {leaseEnd} day{leaseEnd !== 1 ? "s" : ""} on{" "}
            <strong>{formatDate(activeLease!.end_date)}</strong>. Contact your property manager to renew.
          </div>
        )}

        {/* KPI strip */}
        <div className="kpi-grid">
          {anyLoading ? (
            [1,2,3,4].map((i) => (
              <div key={i} style={{ background:"#fff", border:"1.5px solid #E5E7EB",
                                    borderRadius:12, padding:"20px 22px" }}>
                <div className="skeleton" style={{ width:"60%", marginBottom:10 }}/>
                <div className="skeleton" style={{ width:"40%", height:32 }}/>
              </div>
            ))
          ) : (
            <>
              <KpiCard
                label="Monthly rent"
                value={formatRand(activeLease?.monthly_rent)}
                sub={activeLease ? `Due on lease invoices` : "No active lease"}
                accent="green"
              />
              <KpiCard
                label="Next payment due"
                value={nextDueInvoice ? formatRand(nextDueInvoice.balance) : "All clear"}
                sub={nextDueInvoice ? formatDate(nextDueInvoice.due_date) : "No outstanding invoices"}
                accent={nextDueInvoice && daysUntil(nextDueInvoice.due_date) <= 7 ? "orange" : "green"}
                href="/tenant/payments"
              />
              <KpiCard
                label="Open requests"
                value={String(openMaintenance)}
                sub={openMaintenance === 0 ? "No open issues" : "Active maintenance requests"}
                accent={openMaintenance > 0 ? "orange" : "green"}
                href="/tenant/maintenance"
              />
              <KpiCard
                label="Lease status"
                value={activeLease?.status ?? "—"}
                sub={leaseEnd !== null ? `${leaseEnd} days remaining` : ""}
                accent={leaseExpiring ? "orange" : "green"}
                href="/tenant/lease"
              />
            </>
          )}
        </div>

        {/* Detail grid */}
        <div className="dash-grid">
          {/* Lease summary */}
          <div className="card">
            <div className="card-title">
              Lease summary
              <Link href="/tenant/lease" className="card-link">View details →</Link>
            </div>
            {lLoading || !activeLease ? (
              [1,2,3,4].map((i) => (
                <div key={i} className="skeleton" style={{ marginBottom: 10 }}/>
              ))
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  ["Property", activeLease.unit_detail.property],
                  ["Unit",     activeLease.unit_detail.unit_number],
                  ["Start",    formatDate(activeLease.start_date)],
                  ["End",      formatDate(activeLease.end_date)],
                  ["Rent",     formatRand(activeLease.monthly_rent)],
                  ["Deposit",  formatRand(activeLease.deposit)],
                ].map(([label, val]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between",
                                            fontSize:14, borderBottom:"1px solid #F9FAFB",
                                            paddingBottom:8 }}>
                    <span style={{ color:"#9CA3AF" }}>{label}</span>
                    <span style={{ color:"#1F2937", fontWeight:500 }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="card">
            <div className="card-title">
              Notifications
              {(notifications ?? []).some((n) => !n.read) && (
                <span style={{
                  background:"#F4842C", color:"#fff", fontSize:11,
                  fontWeight:700, padding:"2px 8px", borderRadius:10,
                }}>
                  {(notifications ?? []).filter((n) => !n.read).length} new
                </span>
              )}
            </div>
            {nLoading ? (
              [1,2,3].map((i) => (
                <div key={i} className="skeleton" style={{ marginBottom:10, height:48 }}/>
              ))
            ) : recentNotifs.length === 0 ? (
              <div style={{ fontSize:14, color:"#9CA3AF", padding:"20px 0",
                            textAlign:"center" }}>
                No notifications yet
              </div>
            ) : (
              recentNotifs.map((n) => (
                <div key={n.id} onClick={() => !n.read && markRead(n.id)}
                     style={{ cursor: n.read ? "default" : "pointer" }}>
                  <NotifRow
                    title={n.title}
                    message={n.message}
                    time={n.created_at}
                    read={n.read}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
