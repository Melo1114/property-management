"use client";

// app/login/page.tsx

import { useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/context/auth-context";

export default function LoginPage() {
  const { login } = useAuthContext();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Invalid email or password.";
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

        @keyframes spin    { to { transform: rotate(360deg); } }
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

        /* Floating card on panel */
        .pp-float-card {
          position:absolute; bottom:56px; left:56px; right:56px;
          background:rgba(255,255,255,0.07);
          backdrop-filter:blur(12px);
          border:1px solid rgba(255,255,255,0.15);
          border-radius:16px; padding:20px 24px;
          display:flex; align-items:center; gap:16px;
        }
        .pp-float-avatar {
          width:40px; height:40px; border-radius:50%;
          background:linear-gradient(135deg,#E8621A,#F5894A);
          display:flex; align-items:center; justify-content:center;
          font-size:16px; font-weight:600; color:#fff; flex-shrink:0;
        }
        .pp-float-text { flex:1; }
        .pp-float-name { font-size:13px; font-weight:600; color:#fff; margin-bottom:2px; }
        .pp-float-desc { font-size:12px; color:rgba(255,255,255,0.6); line-height:1.4; }
        .pp-float-badge {
          background:#E8621A; color:#fff; font-size:11px; font-weight:600;
          padding:4px 10px; border-radius:20px; white-space:nowrap;
        }

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
        .pp-form-sub { font-size:14px; color:#6B7280; margin-bottom:32px; }

        .pp-error {
          display:flex; align-items:flex-start; gap:8px;
          background:#FFF5F0; border:1px solid #FCDCC8;
          border-radius:9px; padding:11px 14px;
          font-size:13px; color:#9A3412;
          margin-bottom:20px; line-height:1.5;
        }

        .pp-form { display:flex; flex-direction:column; gap:20px; }

        .pp-field { display:flex; flex-direction:column; gap:6px; }
        .pp-label { font-size:13px; font-weight:500; color:#374151; }
        .pp-label-row { display:flex; justify-content:space-between; align-items:center; }
        .pp-forgot { font-size:12px; color:#E8621A; text-decoration:none; font-weight:500; }
        .pp-forgot:hover { text-decoration:underline; }

        .pp-input {
          width:100%; padding:11px 14px;
          font-size:14px; font-family:'DM Sans',sans-serif;
          color:#111827; background:#F9FAFB;
          border:1.5px solid #D1D5DB; border-radius:9px;
          outline:none; transition:border-color 0.15s, background 0.15s;
        }
        .pp-input:focus { border-color:#E8621A; background:#fff; }
        .pp-input::placeholder { color:#9CA3AF; }

        .pp-pw-wrap { position:relative; }
        .pp-pw-wrap .pp-input { padding-right:44px; }
        .pp-eye {
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer;
          display:flex; align-items:center; color:#9CA3AF;
          padding:4px;
        }
        .pp-eye:hover { color:#6B7280; }

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

        .pp-spinner-row { display:flex; align-items:center; justify-content:center; gap:8px; }
        .pp-spin { width:18px; height:18px; animation:spin 0.8s linear infinite; }

        .pp-divider { display:flex; align-items:center; gap:12px; margin:28px 0 20px; }
        .pp-divider-line { flex:1; height:1px; background:#E5E7EB; }
        .pp-divider-text { font-size:12px; color:#9CA3AF; white-space:nowrap; }

        .pp-register-link {
          display:block; width:100%; padding:12px;
          font-size:14px; font-weight:600; font-family:'DM Sans',sans-serif;
          color:#1A4731; text-align:center; text-decoration:none;
          border:1.5px solid #2D7A52; border-radius:10px;
          transition:background 0.15s, color 0.15s;
        }
        .pp-register-link:hover { background:#F0F9F4; }

        .pp-footer { margin-top:44px; font-size:12px; color:#9CA3AF; text-align:center; }

        /* Responsive */
        @media (max-width:768px) {
          .pp-panel { display:none; }
          .pp-form-panel { padding:32px 20px; }
          .pp-mobile-logo { display:flex !important; }
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
            {[0,1,2,3,4,5,6,7].map(row =>
              [0,1,2].map(col => (
                <rect key={`w-${row}-${col}`}
                  x={147 + col * 28} y={475 + row * 44}
                  width="16" height="26" rx="2"
                  fill={row + col < 6 ? "#E8A060" : "#FFFFFF"}
                  opacity="0.5"
                />
              ))
            )}
            {[0,1,2,3,4].map(row =>
              [0,1,2,3].map(col => (
                <rect key={`wr-${row}-${col}`}
                  x={387 + col * 30} y={500 + row * 44}
                  width="18" height="26" rx="2"
                  fill={row * 4 + col < 8 ? "#FFFFFF" : "#E8A060"}
                  opacity="0.4"
                />
              ))
            )}
            <rect x="0" y="895" width="520" height="5" fill="#1B6640" opacity="0.4"/>
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

            <h2 className="pp-form-title">Welcome back</h2>
            <p className="pp-form-sub">Sign in to your account to continue</p>

            {error && (
              <div className="pp-error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:1 }}>
                  <circle cx="8" cy="8" r="7" stroke="#E8621A" strokeWidth="1.5"/>
                  <path d="M8 5v3.5M8 11h.01" stroke="#E8621A" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <form className="pp-form" onSubmit={handleSubmit}>
              <div className="pp-field">
                <label className="pp-label" htmlFor="email">Email address</label>
                <input
                  id="email" type="email" autoComplete="email" required
                  className="pp-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="pp-field">
                <div className="pp-label-row">
                  <label className="pp-label" htmlFor="password">Password</label>
                  <Link href="/forgot-password" className="pp-forgot">Forgot password?</Link>
                </div>
                <div className="pp-pw-wrap">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password" required
                    className="pp-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" className="pp-eye" onClick={() => setShowPass(v => !v)} aria-label="Toggle password">
                    {showPass
                      ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20C7 20 2.73 16.39 1 12c.78-1.93 2-3.6 3.52-4.9M9.9 4.24A9.12 9.12 0 0112 4c5 0 9.27 3.11 11 8a10.5 10.5 0 01-1.46 2.76"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <button type="submit" className="pp-submit" disabled={loading}>
                {loading
                  ? <span className="pp-spinner-row">
                      <svg className="pp-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Signing in…
                    </span>
                  : "Sign in"
                }
              </button>
            </form>

            <div className="pp-divider">
              <span className="pp-divider-line"/>
              <span className="pp-divider-text">New to PropertyPro?</span>
              <span className="pp-divider-line"/>
            </div>

            <Link href="/register" className="pp-register-link">
              Create an account
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
