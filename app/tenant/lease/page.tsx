"use client";

import { useMyLeases } from "@/hooks";
import type { Lease } from "@/lib/types";

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

function durationMonths(start: string, end: string): number {
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) /
    (1000 * 60 * 60 * 24 * 30.44)
  );
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  Active:     { bg: "#D8F3DC", text: "#2D6A4F", label: "Active" },
  Pending:    { bg: "#EFF6FF", text: "#1D4ED8", label: "Pending" },
  Expired:    { bg: "#FEE2E2", text: "#991B1B", label: "Expired" },
  Terminated: { bg: "#FEE2E2", text: "#991B1B", label: "Terminated" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { bg: "#F3F4F6", text: "#374151", label: status };
  return (
    <span style={{
      background: s.bg, color: s.text,
      fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 12,
    }}>
      {s.label}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "13px 0", borderBottom: "1px solid #F3F4F6", fontSize: 14,
    }}>
      <span style={{ color: "#9CA3AF", fontWeight: 500 }}>{label}</span>
      <span style={{ color: "#1F2937", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default function TenantLeasePage() {
  const { data: leases, loading } = useMyLeases();

  const activeLease = (leases as Lease[] ?? []).find((l) => l.status === "Active")
    ?? (leases as Lease[] ?? [])[0];

  const leaseEnd     = activeLease ? daysUntil(activeLease.end_date) : null;
  const leaseExpiring = leaseEnd !== null && leaseEnd <= 30 && leaseEnd >= 0;
  const isExpired     = leaseEnd !== null && leaseEnd < 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap');
        .lease-page { font-family: var(--font-body, 'DM Sans', system-ui); max-width: 720px; }
        .skeleton { background: #F3F4F6; border-radius: 8px; animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      <div className="lease-page">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "2px",
                        textTransform: "uppercase", color: "#F4842C", marginBottom: 6 }}>
            Tenant portal
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32,
                       fontWeight: 700, color: "#1A3D2B", letterSpacing: "-0.5px" }}>
            My lease
          </h1>
          {activeLease && !loading && (
            <p style={{ fontSize: 15, color: "#6B7280", marginTop: 6 }}>
              {activeLease.unit_detail.property} · Unit {activeLease.unit_detail.unit_number}
            </p>
          )}
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: "#fff", border: "1.5px solid #E5E7EB",
                                    borderRadius: 12, padding: 24 }}>
                <div className="skeleton" style={{ height: 20, width: "40%", marginBottom: 16 }}/>
                {[1,2,3].map((j) => (
                  <div key={j} className="skeleton" style={{ height: 16, marginBottom: 12,
                                                              width: j % 2 === 0 ? "60%" : "80%" }}/>
                ))}
              </div>
            ))}
          </div>
        ) : !activeLease ? (
          <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 12,
                        padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1F2937", marginBottom: 8 }}>
              No lease found
            </div>
            <div style={{ fontSize: 14, color: "#9CA3AF" }}>
              You don&apos;t have an active lease. Contact your property manager for assistance.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Expiry / expired banner */}
            {(leaseExpiring || isExpired) && (
              <div style={{
                background: isExpired ? "#FEF2F2" : "#FEF3EA",
                border: `1px solid ${isExpired ? "#FECACA" : "#F4842C"}`,
                borderRadius: 10, padding: "12px 16px", fontSize: 14,
                color: isExpired ? "#DC2626" : "#92400E",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     style={{ flexShrink: 0 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                {isExpired
                  ? <>Your lease expired on <strong>{formatDate(activeLease.end_date)}</strong>. Contact your property manager.</>
                  : <>Your lease expires in <strong>{leaseEnd} day{leaseEnd !== 1 ? "s" : ""}</strong> on <strong>{formatDate(activeLease.end_date)}</strong>. Contact your property manager to renew.</>
                }
              </div>
            )}

            {/* Status + duration strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {[
                { label: "Status",    value: <StatusBadge status={activeLease.status} /> },
                { label: "Duration",  value: `${durationMonths(activeLease.start_date, activeLease.end_date)} months` },
                { label: "Days left", value: leaseEnd !== null && leaseEnd >= 0
                    ? `${leaseEnd} day${leaseEnd !== 1 ? "s" : ""}`
                    : "Ended" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: "#fff", border: "1.5px solid #E5E7EB",
                  borderRadius: 12, padding: "16px 18px",
                  borderTop: "3px solid #2D6A4F",
                }}>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 8,
                                textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 600 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#1F2937" }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Lease details card */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB",
                          borderRadius: 12, padding: "22px 24px" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1F2937", marginBottom: 4 }}>
                Lease details
              </div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>
                Reference #{activeLease.id}
              </div>

              <DetailRow label="Property"   value={activeLease.unit_detail.property} />
              <DetailRow label="Unit"       value={`Unit ${activeLease.unit_detail.unit_number}`} />
              <DetailRow label="Start date" value={formatDate(activeLease.start_date)} />
              <DetailRow label="End date"   value={formatDate(activeLease.end_date)} />
            </div>

            {/* Financials card */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB",
                          borderRadius: 12, padding: "22px 24px" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1F2937", marginBottom: 16 }}>
                Financials
              </div>

              <DetailRow label="Monthly rent" value={formatRand(activeLease.monthly_rent)} />
              <DetailRow label="Security deposit" value={formatRand(activeLease.deposit ?? "0")} />
            </div>

            {/* Notes card */}
            {activeLease.notes && (
              <div style={{ background: "#fff", border: "1.5px solid #E5E7EB",
                            borderRadius: 12, padding: "22px 24px" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1F2937", marginBottom: 12 }}>
                  Notes & special terms
                </div>
                <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.75, margin: 0 }}>
                  {activeLease.notes}
                </p>
              </div>
            )}

            {/* Contact prompt */}
            <div style={{ background: "#F0FAF3", border: "1px solid #D8F3DC",
                          borderRadius: 12, padding: "16px 20px",
                          display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#2D6A4F",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82 19.79 19.79 0 012 1.18 2 2 0 014 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1A3D2B", marginBottom: 2 }}>
                  Need to make changes?
                </div>
                <div style={{ fontSize: 13, color: "#2D6A4F" }}>
                  Contact your property manager to request amendments, renewals, or termination.
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
