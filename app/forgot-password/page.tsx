"use client";

// app/forgot-password/page.tsx

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // For now, just show success message
      // In a real app, this would call your backend password reset endpoint
      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "An error occurred. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }

        .pp-root { display:flex; min-height:100vh; }

        /* — Green panel — */
        .pp-panel {
          position: relative;
          width: 58%;
          overflow: hidden;
          background: linear-gradient(150deg, #1A4731 0%, #2E7D52 55%, #1B5E3B 100%);
          display: flex;
          flex-direction: column;
          animation: slideIn 0.5s ease both;
        }
        .pp-panel-bg {
          position: absolute; inset: 0; width: 100%; height: 100%;
          pointer-events: none;
        }
        .pp-panel-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          justify-content: space-between;
          min-height: 100vh;
          padding: 44px 56px;
        }
        .pp-logo { display:flex; align-items:center; gap:10px; }
        .pp-logo-mark {
          width:36px; height:36px; background:#E8621A;
          border-radius:9px; display:flex; align-items:center; justify-content:center;
        }
        .pp-logo-text { font-size:19px; font-weight:600; color:#fff; letter-spacing:-0.3px; }

        .pp-headline { flex:1; display:flex; flex-direction:column; justify-content:center; padding:48px 0 32px; }
        .pp-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(34px, 3.5vw, 50px);
          font-weight: 700; color: #fff;
          line-height: 1.15; letter-spacing: -0.5px;
          margin-bottom: 20px;
        }
        .pp-sub { font-size:15px; color:rgba(255,255,255,0.68); line-height:1.75; }

        .pp-tag {
          display:inline-flex; align-items:center; gap:6px;
          background:rgba(232,98,26,0.18); border:1px solid rgba(232,98,26,0.35);
          border-radius:20px; padding:5px 12px;
          font-size:12px; color:rgba(255,255,255,0.85);
          margin-bottom:24px; width:fit-content;
        }
        .pp-tag-dot { width:6px; height:6px; border-radius:50%; background:#E8621A; }

        .pp-stats { display:flex; gap:40px; }
        .pp-stat { display:flex; flex-direction:column; gap:2px; }
        .pp-stat-num { font-family:'Playfair Display',serif; font-size:24px; font-weight:700; color:#fff; }
        .pp-stat-label { font-size:11px; color:rgba(255,255,255,0.55); text-transform:uppercase; letter-spacing:0.6px; }

        /* — Form panel — */
        .pp-form-panel {
          flex:1; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          padding:40px 32px; background:#fff;
          min-height:100vh;
        }
        .pp-form-card {
          width:100%; max-width:400px;
          animation: fadeUp 0.5s 0.15s ease both;
        }
        .pp-form-title {
          font-family:'Playfair Display',serif;
          font-size:30px; font-weight:700;
          color:#111827; margin-bottom:6px; letter-spacing:-0.4px;
        }
        .pp-form-sub { font-size:14px; color:#6B7280; margin-bottom:32px; line-height:1.5; }

        .pp-error {
          display:flex; align-items:flex-start; gap:8px;
          background:#FFF5F0; border:1px solid #FCDCC8;
          border-radius:9px; padding:11px 14px;
          font-size:13px; color:#9A3412;
          margin-bottom:20px; line-height:1.5;
        }

        .pp-success {
          display:flex; align-items:flex-start; gap:8px;
          background:#F0FDF4; border:1px solid #DCFCE7;
          border-radius:9px; padding:11px 14px;
          font-size:13px; color:#166534;
          margin-bottom:20px; line-height:1.5;
        }

        .pp-form { display:flex; flex-direction:column; gap:20px; }

        .pp-field { display:flex; flex-direction:column; gap:6px; }
        .pp-label { font-size:13px; font-weight:500; color:#374151; }

        .pp-input {
          width:100%; padding:11px 14px;
          font-size:14px; font-family:'DM Sans',sans-serif;
          color:#111827; background:#F9FAFB;
          border:1.5px solid #D1D5DB; border-radius:9px;
          outline:none; transition:border-color 0.15s, background 0.15s;
        }
        .pp-input:focus { border-color:#E8621A; background:#fff; }
        .pp-input::placeholder { color:#9CA3AF; }

        .pp-submit {
          width:100%; padding:13px;
          font-size:15px; font-weight:600; font-family:'DM Sans',sans-serif;
          color:#fff; background:#E8621A;
          border:none; border-radius:10px; cursor:pointer;
          transition:background 0.15s, transform 0.12s, box-shadow 0.15s;
          box-shadow:0 3px 14px rgba(232,98,26,0.28);
          letter-spacing:0.1px; margin-top:4px;
        }
        .pp-submit:hover:not(:disabled) {
          background:#CF5717; transform:translateY(-1px);
          box-shadow:0 6px 20px rgba(232,98,26,0.38);
        }
        .pp-submit:active:not(:disabled) { transform:translateY(0); }
        .pp-submit:disabled { background:#F0A07A; cursor:not-allowed; box-shadow:none; }

        .pp-back-link {
          display:inline-flex; align-items:center; gap:6px;
          font-size:13px; color:#E8621A; text-decoration:none; font-weight:500;
          margin-top:24px; transition:gap 0.15s;
        }
        .pp-back-link:hover { gap:8px; }

        .pp-footer { margin-top:44px; font-size:12px; color:#9CA3AF; text-align:center; }

        /* Responsive */
        @media (max-width:768px) {
          .pp-root { flex-direction: column; }
          .pp-panel { display:none; width:100%; }
          .pp-form-panel {
            padding:32px 20px;
            min-height: auto;
            justify-content: flex-start;
            padding-top: 60px;
          }
          .pp-mobile-logo { display:flex !important; }
          .pp-form-card { max-width: 100%; }
          .pp-panel-content { padding: 32px 24px; }
          .pp-headline { padding: 24px 0 16px; }
          .pp-h1 { font-size: clamp(24px, 5vw, 34px); margin-bottom: 12px; }
          .pp-stats { gap: 20px; }
          .pp-stat-num { font-size: 20px; }
        }

        @media (max-width:480px) {
          .pp-form-panel { padding: 24px 16px; padding-top: 50px; }
          .pp-panel-content { padding: 20px 16px; }
          .pp-form-title { font-size: 24px; }
          .pp-form-sub { font-size: 13px; }
          .pp-stats { flex-direction: column; gap: 12px; }
        }

        .pp-mobile-logo {
          display:none; align-items:center; gap:8px; margin-bottom:32px;
        }
      `}</style>

      <div className="pp-root">

        {/* — Green panel — */}
        <div className="pp-panel">
          <svg className="pp-panel-bg" viewBox="0 0 520 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <circle cx="480" cy="100" r="220" fill="#1B6640" opacity="0.2"/>
            <circle cx="480" cy="100" r="140" fill="#1B6640" opacity="0.2"/>
            <circle cx="480" cy="100" r="70"  fill="#1B6640" opacity="0.25"/>
            <circle cx="80" cy="700" r="90" fill="#E8621A" opacity="0.08"/>
            <rect x="40"  y="500" width="75"  height="400" rx="4" fill="#1B6640" opacity="0.55"/>
            <rect x="55"  y="420" width="45"  height="80"  rx="2" fill="#1B6640" opacity="0.55"/>
            <rect x="135" y="460" width="105" height="440" rx="4" fill="#1B6640" opacity="0.48"/>
            <rect x="265" y="400" width="85"  height="500" rx="4" fill="#1B6640" opacity="0.52"/>
            <rect x="375" y="480" width="155" height="420" rx="4" fill="#1B6640" opacity="0.42"/>
          </svg>

          <div className="pp-panel-content">
            <div className="pp-logo">
              <div className="pp-logo-mark">
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                  <path d="M14 3L3 11v14h7v-8h8v8h7V11L14 3z" fill="white"/>
                </svg>
              </div>
              <span className="pp-logo-text">PropertyPro</span>
            </div>

            <div className="pp-headline">
              <div className="pp-tag">
                <span className="pp-tag-dot"/>
                Trusted by 500+ property managers
              </div>
              <h1 className="pp-h1">
                Manage your<br/>
                portfolio with<br/>
                confidence.
              </h1>
              <p className="pp-sub">
                Leases, payments, maintenance,<br/>
                and tenants — all in one place.
              </p>
            </div>

            <div className="pp-stats">
              {[
                { n: "12k+", label: "Properties" },
                { n: "98%",  label: "Uptime" },
                { n: "4.9★", label: "Rating" },
              ].map(s => (
                <div className="pp-stat" key={s.label}>
                  <span className="pp-stat-num">{s.n}</span>
                  <span className="pp-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* — Form panel — */}
        <div className="pp-form-panel">
          <div className="pp-form-card">

            <div className="pp-mobile-logo">
              <div className="pp-logo-mark">
                <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                  <path d="M14 3L3 11v14h7v-8h8v8h7V11L14 3z" fill="white"/>
                </svg>
              </div>
              <span style={{ fontSize:"17px", fontWeight:600, color:"#1A4731" }}>PropertyPro</span>
            </div>

            <h2 className="pp-form-title">Reset your password</h2>
            <p className="pp-form-sub">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
              <div className="pp-error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:1 }}>
                  <circle cx="8" cy="8" r="7" stroke="#E8621A" strokeWidth="1.5"/>
                  <path d="M8 5v3.5M8 11h.01" stroke="#E8621A" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {submitted && (
              <div className="pp-success">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:1 }}>
                  <circle cx="8" cy="8" r="7" stroke="#22c55e" strokeWidth="1.5"/>
                  <path d="M11 6l-4.5 4-2-2" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Check your email for a password reset link. It may take a few minutes to arrive.
              </div>
            )}

            {!submitted && (
              <form className="pp-form" onSubmit={handleSubmit}>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pp-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <button type="submit" className="pp-submit" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            )}

            <Link href="/login" className="pp-back-link">
              ← Back to sign in
            </Link>
          </div>

          <p className="pp-footer">
            © {new Date().getFullYear()} PropertyPro · All rights reserved
          </p>
        </div>

      </div>
    </>
  );
}
