"use client";

import { useState } from "react";
import { useMyLeases, useInvoices, useMyPayments,
         useStripeCheckout, usePayFastCheckout } from "@/hooks";
import type { Lease, Invoice, Payment } from "@/lib/types";

function formatRand(v: string | number | undefined): string {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  return `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-ZA", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
}

const INV_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT:          { bg:"#F3F4F6", text:"#374151", label:"Draft" },
  SENT:           { bg:"#EFF6FF", text:"#1D4ED8", label:"Sent" },
  PARTIALLY_PAID: { bg:"#FEF3C7", text:"#92400E", label:"Part paid" },
  PAID:           { bg:"#D8F3DC", text:"#2D6A4F", label:"Paid" },
  CANCELLED:      { bg:"#FEE2E2", text:"#991B1B", label:"Cancelled" },
};

const PAY_METHOD: Record<string, string> = {
  MANUAL:"Manual", CARD:"Card", BANK_TRANSFER:"EFT", OTHER:"Other",
};

function StatusBadge({ status }: { status: string }) {
  const s = INV_STATUS[status] ?? { bg:"#F3F4F6", text:"#374151", label:status };
  return (
    <span style={{
      background:s.bg, color:s.text, fontSize:11, fontWeight:700,
      padding:"3px 9px", borderRadius:12,
    }}>{s.label}</span>
  );
}

function InvoiceCard({ inv }: { inv: Invoice }) {
  const { checkout: stripeCheckout, isLoading: stripeLoading } = useStripeCheckout();
  const { checkout: pfCheckout,    isLoading: pfLoading }      = usePayFastCheckout();

  const balance   = parseFloat(inv.balance);
  const isPaid    = inv.status === "PAID";
  const isCancelled = inv.status === "CANCELLED";
  const daysLeft  = daysUntil(inv.due_date);
  const isOverdue = daysLeft < 0 && !isPaid && !isCancelled;
  const isDueSoon = daysLeft >= 0 && daysLeft <= 7 && !isPaid && !isCancelled;

  const borderColor = isOverdue  ? "#DC2626"
                    : isDueSoon  ? "#F4842C"
                    : isPaid     ? "#2D6A4F"
                    : "#E5E7EB";

  return (
    <div style={{
      background:"#fff", border:`1.5px solid ${borderColor}`,
      borderRadius:12, padding:"20px 22px",
      ...(isOverdue ? { boxShadow:"0 0 0 3px rgba(220,38,38,0.06)" } : {}),
    }}>
      {/* Top row */}
      <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"flex-start", marginBottom:14 }}>
        <div>
          <div style={{ fontSize:13, color:"#9CA3AF", marginBottom:3 }}>
            Invoice #{inv.id} · Due {formatDate(inv.due_date)}
          </div>
          {inv.description && (
            <div style={{ fontSize:14, color:"#374151" }}>{inv.description}</div>
          )}
          {(inv.period_start && inv.period_end) && (
            <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>
              Period: {formatDate(inv.period_start)} – {formatDate(inv.period_end)}
            </div>
          )}
        </div>
        <StatusBadge status={inv.status} />
      </div>

      {/* Amounts */}
      <div style={{ display:"flex", gap:24, marginBottom:14 }}>
        <div>
          <div style={{ fontSize:11, color:"#9CA3AF", marginBottom:2 }}>Total</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#1F2937" }}>
            {formatRand(inv.amount)}
          </div>
        </div>
        <div>
          <div style={{ fontSize:11, color:"#9CA3AF", marginBottom:2 }}>Paid</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#2D6A4F" }}>
            {formatRand(inv.amount_paid)}
          </div>
        </div>
        {balance > 0 && (
          <div>
            <div style={{ fontSize:11, color:"#9CA3AF", marginBottom:2 }}>Outstanding</div>
            <div style={{ fontSize:18, fontWeight:700, color: isOverdue ? "#DC2626" : "#F4842C" }}>
              {formatRand(inv.balance)}
            </div>
          </div>
        )}
      </div>

      {isOverdue && (
        <div style={{ background:"#FEF2F2", border:"1px solid #FECACA",
                      borderRadius:8, padding:"8px 12px", fontSize:13,
                      color:"#DC2626", marginBottom:14 }}>
          This invoice is {Math.abs(daysLeft)} day{Math.abs(daysLeft)!==1?"s":""} overdue.
        </div>
      )}
      {isDueSoon && (
        <div style={{ background:"#FEF3EA", border:"1px solid #F4842C",
                      borderRadius:8, padding:"8px 12px", fontSize:13,
                      color:"#92400E", marginBottom:14 }}>
          Due in {daysLeft} day{daysLeft!==1?"s":""}.
        </div>
      )}

      {/* Pay buttons */}
      {!isPaid && !isCancelled && balance > 0 && (
        <div style={{ display:"flex", gap:10 }}>
          <button
            onClick={() => pfCheckout(inv.id)}
            disabled={pfLoading || stripeLoading}
            style={{
              flex:1, padding:"10px 12px",
              background: pfLoading ? "#F3F4F6" : "#2D6A4F",
              color: pfLoading ? "#9CA3AF" : "#fff",
              border:"none", borderRadius:9,
              fontSize:13, fontWeight:600, cursor: pfLoading ? "not-allowed" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              fontFamily:"inherit", transition:"background .15s",
            }}
          >
            {pfLoading ? "Redirecting…" : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Pay via PayFast
              </>
            )}
          </button>

          <button
            onClick={() => stripeCheckout(inv.id)}
            disabled={stripeLoading || pfLoading}
            style={{
              flex:1, padding:"10px 12px",
              background: stripeLoading ? "#F3F4F6" : "#F4842C",
              color: stripeLoading ? "#9CA3AF" : "#fff",
              border:"none", borderRadius:9,
              fontSize:13, fontWeight:600, cursor: stripeLoading ? "not-allowed" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              fontFamily:"inherit", transition:"background .15s",
            }}
          >
            {stripeLoading ? "Redirecting…" : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Pay via Stripe
              </>
            )}
          </button>
        </div>
      )}

      {isPaid && (
        <div style={{ display:"flex", alignItems:"center", gap:8,
                      color:"#2D6A4F", fontSize:13, fontWeight:600 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Paid in full
        </div>
      )}
    </div>
  );
}

export default function TenantPaymentsPage() {
  const [tab, setTab] = useState<"invoices" | "history">("invoices");

  const { data: leases } = useMyLeases();
  const activeLease = (leases as Lease[] ?? []).find((l) => l.status === "Active")
    ?? (leases as Lease[] ?? [])[0];

  const { data: invoices, loading: invLoading } = useInvoices(
    activeLease ? { lease: activeLease.id } : undefined
  );
  const { data: payments, loading: payLoading } = useMyPayments();

  const outstanding = (invoices as Invoice[] ?? [])
    .filter((inv) => !["PAID","CANCELLED"].includes(inv.status))
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const paid = (invoices as Invoice[] ?? [])
    .filter((inv) => inv.status === "PAID");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap');
        .pay-page { font-family: var(--font-body,'DM Sans',system-ui); max-width: 760px; }
        .tab-bar  { display:flex; gap:4px; background:#F3F4F6; border-radius:10px;
                    padding:4px; margin-bottom:24px; width:fit-content; }
        .tab-btn  { padding:8px 20px; border:none; border-radius:8px; font-size:14px;
                    font-weight:500; cursor:pointer; transition:background .15s,color .15s;
                    background:transparent; color:#6B7280; font-family:inherit; }
        .tab-btn.active { background:#fff; color:#1F2937;
                          box-shadow:0 1px 4px rgba(0,0,0,0.08); font-weight:600; }
        .skeleton { height:20px; background:#F3F4F6; border-radius:6px;
                    animation:pulse 1.5s ease-in-out infinite; margin-bottom:10px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      <div className="pay-page">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:"2px",
                        textTransform:"uppercase", color:"#F4842C", marginBottom:6 }}>
            Tenant portal
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:32,
                       color:"#1A3D2B", fontWeight:700, letterSpacing:"-0.5px" }}>
            Payments
          </h1>
          {activeLease && (
            <p style={{ fontSize:15, color:"#6B7280", marginTop:6 }}>
              {activeLease.unit_detail.property} · Unit {activeLease.unit_detail.unit_number}
            </p>
          )}
        </div>

        {/* Summary strip */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
                      gap:14, marginBottom:28 }}>
          {[
            { label:"Outstanding invoices", value:String(outstanding.length),
              color:"#F4842C" },
            { label:"Total due",
              value: formatRand(outstanding.reduce((s,i) => s+parseFloat(i.balance),0)),
              color: outstanding.length > 0 ? "#DC2626" : "#2D6A4F" },
            { label:"Payments made",  value:String((payments as Payment[]??[]).length),
              color:"#2D6A4F" },
          ].map((s) => (
            <div key={s.label} style={{
              background:"#fff", border:"1.5px solid #E5E7EB",
              borderRadius:10, padding:"16px 18px",
              borderTop:`3px solid ${s.color}`,
            }}>
              <div style={{ fontSize:12, color:"#9CA3AF", marginBottom:6,
                            textTransform:"uppercase", letterSpacing:"0.6px",
                            fontWeight:600 }}>
                {s.label}
              </div>
              <div style={{ fontSize:22, fontWeight:700, color:"#1F2937" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-btn${tab==="invoices"?" active":""}`}
                  onClick={() => setTab("invoices")}>
            Invoices {outstanding.length > 0 && (
              <span style={{ marginLeft:6, background:"#F4842C", color:"#fff",
                             fontSize:11, fontWeight:700, padding:"1px 7px",
                             borderRadius:10 }}>
                {outstanding.length}
              </span>
            )}
          </button>
          <button className={`tab-btn${tab==="history"?" active":""}`}
                  onClick={() => setTab("history")}>
            Payment history
          </button>
        </div>

        {/* Invoices tab */}
        {tab === "invoices" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {invLoading ? (
              [1,2,3].map((i) => (
                <div key={i} style={{ background:"#fff", border:"1.5px solid #E5E7EB",
                                      borderRadius:12, padding:22 }}>
                  <div className="skeleton" style={{ width:"40%", marginBottom:14 }}/>
                  <div className="skeleton" style={{ width:"30%" }}/>
                </div>
              ))
            ) : !activeLease ? (
              <div style={{ textAlign:"center", padding:"48px 0", color:"#9CA3AF", fontSize:15 }}>
                No active lease found.
              </div>
            ) : (invoices as Invoice[])?.length === 0 ? (
              <div style={{ textAlign:"center", padding:"48px 0", color:"#9CA3AF", fontSize:15 }}>
                No invoices on your lease yet.
              </div>
            ) : (
              <>
                {outstanding.length > 0 && (
                  <>
                    <div style={{ fontSize:13, fontWeight:600, color:"#374151",
                                  marginBottom:4 }}>
                      Outstanding
                    </div>
                    {outstanding.map((inv) => <InvoiceCard key={inv.id} inv={inv} />)}
                  </>
                )}
                {paid.length > 0 && (
                  <>
                    <div style={{ fontSize:13, fontWeight:600, color:"#374151",
                                  marginTop:8, marginBottom:4 }}>
                      Paid
                    </div>
                    {paid.map((inv) => <InvoiceCard key={inv.id} inv={inv} />)}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* History tab */}
        {tab === "history" && (
          <div style={{ background:"#fff", border:"1.5px solid #E5E7EB",
                        borderRadius:12, overflow:"hidden" }}>
            {payLoading ? (
              <div style={{ padding:22 }}>
                {[1,2,3].map((i) => (
                  <div key={i} className="skeleton" style={{ marginBottom:12 }}/>
                ))}
              </div>
            ) : (payments as Payment[])?.length === 0 ? (
              <div style={{ textAlign:"center", padding:"48px 0",
                            color:"#9CA3AF", fontSize:15 }}>
                No payment history yet.
              </div>
            ) : (
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#F9FAFB" }}>
                    {["Reference","Invoice","Amount","Method","Date","Status"].map((h) => (
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left",
                                           fontSize:11, fontWeight:600, color:"#6B7280",
                                           borderBottom:"1.5px solid #E5E7EB" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(payments as Payment[]).map((p) => (
                    <tr key={p.id} style={{ borderBottom:"1px solid #F3F4F6" }}>
                      <td style={{ padding:"11px 14px", fontFamily:"monospace",
                                   fontSize:11, color:"#6B7280" }}>
                        PAY-{p.id}
                      </td>
                      <td style={{ padding:"11px 14px", color:"#374151" }}>
                        INV-{p.invoice}
                      </td>
                      <td style={{ padding:"11px 14px", fontWeight:600, color:"#2D6A4F" }}>
                        {formatRand(p.amount)}
                      </td>
                      <td style={{ padding:"11px 14px", color:"#6B7280" }}>
                        {PAY_METHOD[p.method] ?? p.method}
                      </td>
                      <td style={{ padding:"11px 14px", color:"#6B7280", whiteSpace:"nowrap" }}>
                        {formatDate(p.created_at)}
                      </td>
                      <td style={{ padding:"11px 14px" }}>
                        <span style={{
                          background: p.status==="COMPLETED" ? "#D8F3DC"
                                    : p.status==="FAILED"    ? "#FEE2E2" : "#F3F4F6",
                          color:      p.status==="COMPLETED" ? "#2D6A4F"
                                    : p.status==="FAILED"    ? "#991B1B" : "#374151",
                          fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:10,
                        }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  );
}
