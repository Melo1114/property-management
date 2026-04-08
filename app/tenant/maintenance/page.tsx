"use client";

import { useState, FormEvent } from "react";
import { useMyLeases, useMaintenance } from "@/hooks";
import { maintenanceApi } from "@/lib/api";
import type { Lease, MaintenanceRequest } from "@/lib/types";

const PRIORITIES = [
  { value:"LOW",    label:"Low",    color:"#2D6A4F", bg:"#D8F3DC" },
  { value:"MEDIUM", label:"Medium", color:"#92400E", bg:"#FEF3C7" },
  { value:"HIGH",   label:"High",   color:"#C2410C", bg:"#FFEDD5" },
  { value:"URGENT", label:"Urgent", color:"#991B1B", bg:"#FEE2E2" },
];

const STATUS_STEPS = ["OPEN","IN_PROGRESS","RESOLVED"] as const;

const STATUS_STYLE: Record<string, { bg:string; text:string; label:string }> = {
  OPEN:        { bg:"#EFF6FF", text:"#1D4ED8", label:"Open" },
  IN_PROGRESS: { bg:"#FEF3C7", text:"#92400E", label:"In progress" },
  RESOLVED:    { bg:"#D8F3DC", text:"#2D6A4F", label:"Resolved" },
  CANCELLED:   { bg:"#FEE2E2", text:"#991B1B", label:"Cancelled" },
};

function PriorityBadge({ priority }: { priority: string }) {
  const p = PRIORITIES.find((x) => x.value === priority)
         ?? { bg:"#F3F4F6", color:"#374151", label:priority };
  return (
    <span style={{
      background:p.bg, color:p.color,
      fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:12,
    }}>{p.label}</span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { bg:"#F3F4F6", text:"#374151", label:status };
  return (
    <span style={{
      background:s.bg, color:s.text,
      fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:12,
    }}>{s.label}</span>
  );
}

function StatusTracker({ status }: { status: string }) {
  const idx = STATUS_STEPS.indexOf(status as typeof STATUS_STEPS[number]);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, margin:"12px 0 4px" }}>
      {STATUS_STEPS.map((step, i) => {
        const done   = idx > i;
        const active = idx === i;
        return (
          <div key={step} style={{ display:"flex", alignItems:"center", flex:1 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
              <div style={{
                width:28, height:28, borderRadius:"50%", flexShrink:0,
                background: done||active ? "#2D6A4F" : "#E5E7EB",
                display:"flex", alignItems:"center", justifyContent:"center",
                border: active ? "2.5px solid #F4842C" : "none",
                transition:"background .2s",
              }}>
                {done ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                       stroke="white" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <div style={{ width:8, height:8, borderRadius:"50%",
                                background: active ? "#F4842C" : "#9CA3AF" }}/>
                )}
              </div>
              <div style={{ fontSize:10, color: done||active ? "#2D6A4F" : "#9CA3AF",
                            fontWeight: active ? 700 : 400, marginTop:4, whiteSpace:"nowrap" }}>
                {STATUS_STYLE[step]?.label ?? step}
              </div>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div style={{ flex:1, height:2, background: done ? "#2D6A4F" : "#E5E7EB",
                            margin:"0 4px 16px", transition:"background .2s" }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RequestCard({ req }: { req: MaintenanceRequest }) {
  const [open,    setOpen]    = useState(false);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);

  async function submitComment() {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await maintenanceApi.addComment(req.id, comment.trim());
      setComment("");
    } catch {
      alert("Failed to post comment.");
    } finally {
      setPosting(false);
    }
  }

  const isResolved = req.status === "RESOLVED";

  return (
    <div style={{
      background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:12,
      overflow:"hidden",
      ...(isResolved ? { opacity:0.75 } : {}),
    }}>
      <div
        style={{ padding:"18px 20px", cursor:"pointer" }}
        onClick={() => setOpen((o) => !o)}
      >
        <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"flex-start", gap:12 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:15, fontWeight:600, color:"#1F2937",
                          marginBottom:4 }}>
              {req.title}
            </div>
            <div style={{ fontSize:12, color:"#9CA3AF" }}>
              Submitted {new Date(req.created_at).toLocaleDateString("en-ZA", {
                day:"2-digit", month:"short", year:"numeric",
              })}
              {req.assigned_to_name && (
                <> · Assigned to <strong style={{ color:"#374151" }}>{req.assigned_to_name}</strong></>
              )}
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
            <PriorityBadge priority={req.priority} />
            <StatusBadge   status={req.status} />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"
                 style={{ transform:`rotate(${open?180:0}deg)`, transition:"transform .2s" }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        {!["CANCELLED"].includes(req.status) && (
          <StatusTracker status={req.status} />
        )}
      </div>

      {open && (
        <div style={{ borderTop:"1px solid #F3F4F6", padding:"18px 20px",
                      background:"#FAFAFA" }}>
          <div style={{ fontSize:14, color:"#374151", lineHeight:1.7,
                        marginBottom:20 }}>
            {req.description}
          </div>

          {req.comments.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#9CA3AF",
                            textTransform:"uppercase", letterSpacing:"0.8px",
                            marginBottom:12 }}>
                Updates
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {req.comments.map((c) => (
                  <div key={c.id} style={{
                    background:"#fff", border:"1px solid #E5E7EB",
                    borderRadius:8, padding:"12px 14px",
                  }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#374151",
                                  marginBottom:4 }}>
                      {c.author_name ?? c.author_username}
                      <span style={{ color:"#9CA3AF", fontWeight:400, marginLeft:8 }}>
                        {new Date(c.created_at).toLocaleDateString("en-ZA", {
                          day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit",
                        })}
                      </span>
                    </div>
                    <div style={{ fontSize:13, color:"#4B5563", lineHeight:1.6 }}>
                      {c.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isResolved && (
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:"#9CA3AF",
                            textTransform:"uppercase", letterSpacing:"0.8px",
                            marginBottom:8 }}>
                Add update
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Provide more detail or follow up…"
                style={{
                  width:"100%", padding:"10px 12px",
                  border:"1.5px solid #E5E7EB", borderRadius:8,
                  fontSize:13, fontFamily:"inherit", color:"#374151",
                  background:"#fff", outline:"none", resize:"vertical",
                  minHeight:72, boxSizing:"border-box",
                  transition:"border-color .2s",
                }}
                onFocus={(e) => e.target.style.borderColor="#F4842C"}
                onBlur={(e)  => e.target.style.borderColor="#E5E7EB"}
              />
              <button
                onClick={submitComment}
                disabled={!comment.trim() || posting}
                style={{
                  marginTop:8, padding:"9px 18px",
                  background: posting || !comment.trim() ? "#F3F4F6" : "#2D6A4F",
                  color: posting || !comment.trim() ? "#9CA3AF" : "#fff",
                  border:"none", borderRadius:8,
                  fontSize:13, fontWeight:600, cursor:"pointer",
                  fontFamily:"inherit", transition:"background .15s",
                }}
              >
                {posting ? "Posting…" : "Post update"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TenantMaintenancePage() {
  const [showForm, setShowForm] = useState(false);
  const [title,    setTitle]    = useState("");
  const [desc,     setDesc]     = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string|null>(null);

  const { data: leases } = useMyLeases();
  const activeLease = (leases as Lease[]??[]).find((l) => l.status === "Active")
    ?? (leases as Lease[]??[])[0];

  const { data: requests, loading, createRequest } = useMaintenance();

  const open     = (requests ?? []).filter((r) => !["RESOLVED","CANCELLED"].includes(r.status));
  const resolved = (requests ?? []).filter((r) =>  ["RESOLVED","CANCELLED"].includes(r.status));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!activeLease) { setSubmitError("No active lease found."); return; }
    if (!title.trim())   { setSubmitError("Please enter a title."); return; }

    setSubmitError(null);
    setSubmitting(true);
    try {
      await createRequest({
        unit:        activeLease.unit,
        title:       title.trim(),
        description: desc.trim(),
        priority,
      });
      setTitle(""); setDesc(""); setPriority("MEDIUM");
      setShowForm(false);
    } catch (err: unknown) {
      const detail = (err as {response?:{data?:{detail?:string}}})?.response?.data?.detail;
      setSubmitError(detail ?? "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap');
        .maint-page { font-family:var(--font-body,'DM Sans',system-ui); max-width:760px; }
        .form-field { margin-bottom:16px; }
        .form-field label { display:block; font-size:13px; font-weight:500; color:#6B7280; margin-bottom:6px; }
        .form-field input, .form-field textarea, .form-field select {
          width:100%; padding:10px 13px; border:1.5px solid #E5E7EB; border-radius:9px;
          font-size:14px; font-family:inherit; color:#1F2937; background:#F9FAFB;
          outline:none; transition:border-color .2s,background .2s; box-sizing:border-box;
        }
        .form-field input:focus, .form-field textarea:focus, .form-field select:focus {
          border-color:#F4842C; background:#FEF3EA;
        }
        .form-field textarea { min-height:96px; resize:vertical; }
        .priority-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
        .pri-btn { padding:8px 4px; border:1.5px solid #E5E7EB; border-radius:8px;
                   font-size:12px; font-weight:600; cursor:pointer; text-align:center;
                   transition:border-color .15s, background .15s; background:#fff;
                   font-family:inherit; }
        .skeleton { height:80px; background:#F3F4F6; border-radius:12px;
                    animation:pulse 1.5s ease-in-out infinite; margin-bottom:12px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      <div className="maint-page">
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"flex-start", marginBottom:28 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:"2px",
                          textTransform:"uppercase", color:"#F4842C", marginBottom:6 }}>
              Tenant portal
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:32,
                         color:"#1A3D2B", fontWeight:700, letterSpacing:"-0.5px" }}>
              Maintenance
            </h1>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{
              padding:"10px 20px",
              background: showForm ? "#F3F4F6" : "#2D6A4F",
              color: showForm ? "#6B7280" : "#fff",
              border:"none", borderRadius:9,
              fontSize:14, fontWeight:600, cursor:"pointer",
              fontFamily:"inherit", display:"flex", alignItems:"center", gap:8,
              transition:"background .15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {showForm
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>
              }
            </svg>
            {showForm ? "Cancel" : "New request"}
          </button>
        </div>

        {/* Submit form */}
        {showForm && (
          <div style={{
            background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:12,
            padding:"24px 24px 20px", marginBottom:24,
          }}>
            <div style={{ fontSize:16, fontWeight:600, color:"#1F2937", marginBottom:20 }}>
              Submit a maintenance request
            </div>
            {submitError && (
              <div style={{ background:"#FEF2F2", border:"1px solid #FECACA",
                            borderRadius:8, padding:"10px 14px", fontSize:13,
                            color:"#DC2626", marginBottom:16 }}>
                {submitError}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Title *</label>
                <input
                  required
                  placeholder="e.g. Leaking tap in bathroom"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Description <span style={{ fontWeight:400, color:"#9CA3AF" }}>(optional)</span></label>
                <textarea
                  placeholder="Describe the issue in detail – location, when it started, severity…"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Priority</label>
                <div className="priority-grid">
                  {PRIORITIES.map((p) => (
                    <button
                      type="button"
                      key={p.value}
                      className="pri-btn"
                      onClick={() => setPriority(p.value)}
                      style={{
                        borderColor: priority === p.value ? p.color : "#E5E7EB",
                        background:  priority === p.value ? p.bg : "#fff",
                        color:       priority === p.value ? p.color : "#6B7280",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                style={{
                  padding:"11px 24px",
                  background: submitting || !title.trim() ? "#F3F4F6" : "#F4842C",
                  color: submitting || !title.trim() ? "#9CA3AF" : "#fff",
                  border:"none", borderRadius:9,
                  fontSize:14, fontWeight:600, cursor:"pointer",
                  fontFamily:"inherit", transition:"background .15s",
                }}
              >
                {submitting ? "Submitting…" : "Submit request"}
              </button>
            </form>
          </div>
        )}

        {/* Open requests */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize:13, fontWeight:600, color:"#374151",
                        marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
            Open requests
            {open.length > 0 && (
              <span style={{ background:"#F4842C", color:"#fff", fontSize:11,
                             fontWeight:700, padding:"2px 8px", borderRadius:10 }}>
                {open.length}
              </span>
            )}
          </div>

          {loading ? (
            [1,2].map((i) => <div key={i} className="skeleton"/>)
          ) : open.length === 0 ? (
            <div style={{ background:"#fff", border:"1.5px solid #E5E7EB",
                          borderRadius:12, padding:"32px 24px", textAlign:"center",
                          color:"#9CA3AF", fontSize:14 }}>
              No open maintenance requests.
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {open.map((r) => <RequestCard key={r.id} req={r as MaintenanceRequest}/>)}
            </div>
          )}
        </div>

        {/* Resolved requests */}
        {resolved.length > 0 && (
          <div style={{ marginTop:28 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#9CA3AF", marginBottom:12 }}>
              Resolved / cancelled
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {resolved.map((r) => <RequestCard key={r.id} req={r as MaintenanceRequest}/>)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
