"use client";

// app/register/page.tsx

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types";

type Step = 1 | 2 | 3;

const ROLES: { value: Role; label: string; desc: string }[] = [
  { value: "Admin",           label: "Administrator",   desc: "Full system access" },
  { value: "PropertyManager", label: "Property Manager", desc: "Manage properties & tenants" },
  { value: "Tenant",          label: "Tenant",          desc: "View lease & make payments" },
  { value: "Accountant",      label: "Accountant",      desc: "Financial reports & records" },
];

function strengthScore(pw: string) {
  return [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/, /.{8,}/].filter(r => r.test(pw)).length;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  const [role,      setRole]      = useState<Role | "">("");
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [username,  setUsername]  = useState("");
  const [address,   setAddress]   = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);

  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function next() {
    setError(null);
    if (step === 1 && !role) { setError("Please select a role to continue."); return; }
    if (step === 2 && (!firstName || !lastName || !email || !username)) {
      setError("Please fill in all required fields."); return;
    }
    setStep(s => (s + 1) as Step);
  }

  function back() { setError(null); setStep(s => (s - 1) as Step); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm)       { setError("Passwords do not match."); return; }
    if (password.length < 8)        { setError("Password must be at least 8 characters."); return; }
    if (strengthScore(password) < 2) { setError("Please choose a stronger password."); return; }
    setLoading(true);
    try {
      await authApi.register({
        username, email, first_name: firstName, last_name: lastName,
        phone_number: phone, address, role: role as Role,
        password, password2: confirm,
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2800);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string | string[]> } })?.response?.data;
      if (data) {
        const first = Object.values(data)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const pct   = step === 1 ? 33 : step === 2 ? 66 : 100;
  const score = strengthScore(password);
  const strengthColor = score <= 1 ? "#E24B4A" : score <= 2 ? "#EF9F27" : "#1D9E75";
  const strengthLabel = score <= 1 ? "Weak" : score <= 2 ? "Fair" : score <= 3 ? "Good" : "Strong";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-20px);}to{opacity:1;transform:translateX(0);}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.88);}to{opacity:1;transform:scale(1);}}

        .rr{display:flex;min-height:100vh;font-family:'DM Sans',sans-serif;}
        .rr-panel{position:relative;width:40%;overflow:hidden;background:linear-gradient(155deg,#1A4731 0%,#2E7D52 60%,#1B5E3B 100%);display:flex;flex-direction:column;animation:slideIn 0.5s ease both;}
        .rr-panel-bg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}
        .rr-panel-inner{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:space-between;min-height:100vh;padding:44px 48px;}
        .rr-logo{display:flex;align-items:center;gap:10px;}
        .rr-logo-mark{width:36px;height:36px;background:#E8621A;border-radius:9px;display:flex;align-items:center;justify-content:center;}
        .rr-logo-text{font-size:18px;font-weight:600;color:#fff;letter-spacing:-0.3px;}
        .rr-mid{flex:1;display:flex;flex-direction:column;justify-content:center;padding:40px 0 24px;}
        .rr-ph{font-family:'Playfair Display',serif;font-size:clamp(26px,2.8vw,40px);font-weight:700;color:#fff;line-height:1.18;letter-spacing:-0.4px;margin-bottom:18px;}
        .rr-ps{font-size:14px;color:rgba(255,255,255,0.65);line-height:1.75;}
        .rr-checklist{display:flex;flex-direction:column;gap:12px;margin-top:28px;}
        .rr-ci{display:flex;align-items:center;gap:12px;}
        .rr-cicon{width:26px;height:26px;border-radius:50%;background:rgba(232,98,26,0.2);border:1px solid rgba(232,98,26,0.4);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .rr-ct{font-size:13px;color:rgba(255,255,255,0.75);}
        .rr-pfooter{font-size:12px;color:rgba(255,255,255,0.4);}

        .rr-form-panel{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 32px;background:#fff;min-height:100vh;}
        .rr-card{width:100%;max-width:480px;animation:fadeUp 0.45s 0.1s ease both;}
        .rr-mob-logo{display:none;align-items:center;gap:8px;margin-bottom:24px;}

        .rr-prog{margin-bottom:28px;}
        .rr-prog-steps{display:flex;justify-content:space-between;margin-bottom:10px;}
        .rr-step-lbl{font-size:11px;font-weight:500;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;}
        .rr-step-lbl.active{color:#1A4731;}
        .rr-bar{height:4px;background:#E5E7EB;border-radius:99px;overflow:hidden;}
        .rr-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#E8621A,#F5894A);transition:width 0.4s ease;}

        .rr-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#111827;margin-bottom:4px;letter-spacing:-0.4px;}
        .rr-sub{font-size:13px;color:#6B7280;margin-bottom:24px;}

        .rr-error{display:flex;align-items:flex-start;gap:8px;background:#FFF5F0;border:1px solid #FCDCC8;border-radius:9px;padding:10px 14px;font-size:13px;color:#9A3412;margin-bottom:16px;line-height:1.5;}

        .rr-role-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .rr-role-card{border:1.5px solid #E5E7EB;border-radius:10px;padding:14px 16px;cursor:pointer;transition:border-color 0.15s,background 0.15s;background:#FAFAFA;}
        .rr-role-card:hover{border-color:#2D7A52;background:#F0F9F4;}
        .rr-role-card.sel{border-color:#2D7A52;background:#F0F9F4;}
        .rr-role-check{width:18px;height:18px;border-radius:50%;border:2px solid #D1D5DB;margin-bottom:10px;display:flex;align-items:center;justify-content:center;transition:border-color 0.15s,background 0.15s;}
        .rr-role-card.sel .rr-role-check{border-color:#2D7A52;background:#2D7A52;}
        .rr-role-name{font-size:13px;font-weight:600;color:#374151;margin-bottom:2px;}
        .rr-role-card.sel .rr-role-name{color:#1A4731;}
        .rr-role-desc{font-size:11px;color:#9CA3AF;}

        .rr-fields{display:flex;flex-direction:column;gap:14px;}
        .rr-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .rr-field{display:flex;flex-direction:column;gap:5px;}
        .rr-label{font-size:12px;font-weight:500;color:#374151;}
        .rr-label-opt{color:#9CA3AF;font-weight:400;}
        .rr-input{width:100%;padding:10px 13px;font-size:13px;font-family:'DM Sans',sans-serif;color:#111827;background:#F9FAFB;border:1.5px solid #D1D5DB;border-radius:8px;outline:none;transition:border-color 0.15s,background 0.15s;}
        .rr-input:focus{border-color:#E8621A;background:#fff;}
        .rr-input::placeholder{color:#9CA3AF;}
        .rr-pw-wrap{position:relative;}
        .rr-pw-wrap .rr-input{padding-right:40px;}
        .rr-eye{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#9CA3AF;display:flex;align-items:center;padding:2px;}
        .rr-eye:hover{color:#6B7280;}

        .rr-strength{margin-top:5px;}
        .rr-sbar{display:flex;gap:4px;margin-bottom:3px;}
        .rr-sseg{flex:1;height:3px;border-radius:99px;background:#E5E7EB;transition:background 0.2s;}
        .rr-slabel{font-size:11px;color:#9CA3AF;}

        .rr-nav{display:flex;gap:10px;margin-top:22px;}
        .rr-back{padding:11px 18px;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;color:#374151;background:#fff;border:1.5px solid #D1D5DB;border-radius:8px;cursor:pointer;transition:background 0.15s;white-space:nowrap;}
        .rr-back:hover{background:#F3F4F6;}
        .rr-next{flex:1;padding:12px;font-size:14px;font-weight:600;font-family:'DM Sans',sans-serif;color:#fff;background:#E8621A;border:none;border-radius:9px;cursor:pointer;transition:background 0.15s,transform 0.12s,box-shadow 0.15s;box-shadow:0 3px 12px rgba(232,98,26,0.25);}
        .rr-next:hover:not(:disabled){background:#CF5717;transform:translateY(-1px);box-shadow:0 6px 18px rgba(232,98,26,0.35);}
        .rr-next:active:not(:disabled){transform:translateY(0);}
        .rr-next:disabled{background:#F0A07A;cursor:not-allowed;box-shadow:none;}
        .rr-spin-row{display:flex;align-items:center;justify-content:center;gap:7px;}
        .rr-spin{width:16px;height:16px;animation:spin 0.8s linear infinite;}

        .rr-signin{margin-top:18px;text-align:center;font-size:13px;color:#6B7280;}
        .rr-signin-link{color:#E8621A;font-weight:500;text-decoration:none;}
        .rr-signin-link:hover{text-decoration:underline;}

        .rr-success{text-align:center;padding:20px 0;animation:scaleIn 0.4s ease both;}
        .rr-sicon{width:64px;height:64px;border-radius:50%;background:#F0F9F4;border:2px solid #2D7A52;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;}
        .rr-sh{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;color:#111827;margin-bottom:8px;}
        .rr-sp{font-size:14px;color:#6B7280;line-height:1.6;}
        .rr-footer{margin-top:40px;font-size:12px;color:#9CA3AF;text-align:center;}

        @media(max-width:768px){
          .rr-panel{display:none;}
          .rr-form-panel{padding:28px 20px;}
          .rr-row{grid-template-columns:1fr;}
          .rr-role-grid{grid-template-columns:1fr;}
          .rr-mob-logo{display:flex!important;}
        }
      `}</style>

      <div className="rr">
        {/* — Green panel — */}
        <div className="rr-panel">
          <svg className="rr-panel-bg" viewBox="0 0 420 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <circle cx="370" cy="80" r="180" fill="#1B6640" opacity="0.2"/>
            <circle cx="370" cy="80" r="110" fill="#1B6640" opacity="0.2"/>
            <circle cx="50" cy="760" r="100" fill="#E8621A" opacity="0.07"/>
            <rect x="25"  y="520" width="62"  height="380" rx="4" fill="#1B6640" opacity="0.5"/>
            <rect x="110" y="460" width="88"  height="440" rx="4" fill="#1B6640" opacity="0.45"/>
            <rect x="225" y="495" width="68"  height="405" rx="4" fill="#1B6640" opacity="0.48"/>
            <rect x="318" y="535" width="115" height="365" rx="4" fill="#1B6640" opacity="0.38"/>
            {[0,1,2,3,4,5].map(row => [0,1].map(col => (
              <rect key={`w${row}${col}`} x={122+col*27} y={475+row*44} width="15" height="25" rx="2" fill={row+col<4?"#E8A060":"#FFFFFF"} opacity="0.44"/>
            )))}
          </svg>
          <div className="rr-panel-inner">
            <div className="rr-logo">
              <div className="rr-logo-mark">
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none"><path d="M14 3L3 11v14h7v-8h8v8h7V11L14 3z" fill="white"/></svg>
              </div>
              <span className="rr-logo-text">PropertyPro</span>
            </div>
            <div className="rr-mid">
              <h2 className="rr-ph">Start managing<br/>smarter today.</h2>
              <p className="rr-ps">Join thousands of property professionals<br/>already on PropertyPro.</p>
              <div className="rr-checklist">
                {["Automated lease renewals & reminders","Real-time payment tracking","Maintenance request workflow","Exportable reports & dashboards"].map(t => (
                  <div className="rr-ci" key={t}>
                    <div className="rr-cicon">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#E8621A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="rr-ct">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="rr-pfooter">© {new Date().getFullYear()} PropertyPro</p>
          </div>
        </div>

        {/* — Form panel — */}
        <div className="rr-form-panel">
          <div className="rr-card">
            <div className="rr-mob-logo">
              <div className="rr-logo-mark" style={{ width:30, height:30 }}>
                <svg width="17" height="17" viewBox="0 0 28 28" fill="none"><path d="M14 3L3 11v14h7v-8h8v8h7V11L14 3z" fill="white"/></svg>
              </div>
              <span style={{ fontSize:16, fontWeight:600, color:"#1A4731" }}>PropertyPro</span>
            </div>

            {success ? (
              <div className="rr-success">
                <div className="rr-sicon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14l6 6L23 8" stroke="#2D7A52" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 className="rr-sh">Account created!</h2>
                <p className="rr-sp">Your account has been set up successfully.<br/>Redirecting you to sign in…</p>
              </div>
            ) : (
              <>
                <div className="rr-prog">
                  <div className="rr-prog-steps">
                    {["Role","Details","Password"].map((l, i) => (
                      <span key={l} className={`rr-step-lbl ${step > i ? "active" : ""}`}>{i+1}. {l}</span>
                    ))}
                  </div>
                  <div className="rr-bar"><div className="rr-fill" style={{ width:`${pct}%` }}/></div>
                </div>

                {step === 1 && <><h2 className="rr-title">Choose your role</h2><p className="rr-sub">Select how you&apos;ll use PropertyPro</p></>}
                {step === 2 && <><h2 className="rr-title">Your details</h2><p className="rr-sub">Tell us a bit about yourself</p></>}
                {step === 3 && <><h2 className="rr-title">Secure your account</h2><p className="rr-sub">Create a strong password to finish</p></>}

                {error && (
                  <div className="rr-error">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:1 }}>
                      <circle cx="8" cy="8" r="7" stroke="#E8621A" strokeWidth="1.5"/>
                      <path d="M8 5v3.5M8 11h.01" stroke="#E8621A" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {error}
                  </div>
                )}

                {step === 1 && (
                  <div className="rr-role-grid">
                    {ROLES.map(r => (
                      <div key={r.value} className={`rr-role-card ${role === r.value ? "sel" : ""}`} onClick={() => setRole(r.value)}>
                        <div className="rr-role-check">
                          {role === r.value && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <p className="rr-role-name">{r.label}</p>
                        <p className="rr-role-desc">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {step === 2 && (
                  <div className="rr-fields">
                    <div className="rr-row">
                      <div className="rr-field">
                        <label className="rr-label" htmlFor="fn">First name</label>
                        <input id="fn" type="text" autoComplete="given-name" required className="rr-input" placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)}/>
                      </div>
                      <div className="rr-field">
                        <label className="rr-label" htmlFor="ln">Last name</label>
                        <input id="ln" type="text" autoComplete="family-name" required className="rr-input" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)}/>
                      </div>
                    </div>
                    <div className="rr-field">
                      <label className="rr-label" htmlFor="em">Email address</label>
                      <input id="em" type="email" autoComplete="email" required className="rr-input" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)}/>
                    </div>
                    <div className="rr-row">
                      <div className="rr-field">
                        <label className="rr-label" htmlFor="un">Username</label>
                        <input id="un" type="text" autoComplete="username" required className="rr-input" placeholder="janesmith" value={username} onChange={e => setUsername(e.target.value)}/>
                      </div>
                      <div className="rr-field">
                        <label className="rr-label" htmlFor="ph">Phone <span className="rr-label-opt">(optional)</span></label>
                        <input id="ph" type="tel" autoComplete="tel" className="rr-input" placeholder="071 234 5678" value={phone} onChange={e => setPhone(e.target.value)}/>
                      </div>
                    </div>
                    <div className="rr-field">
                      <label className="rr-label" htmlFor="addr">Address <span className="rr-label-opt">(optional)</span></label>
                      <input id="addr" type="text" autoComplete="street-address" className="rr-input" placeholder="123 Main St, Cape Town" value={address} onChange={e => setAddress(e.target.value)}/>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <form className="rr-fields" onSubmit={submit}>
                    <div className="rr-field">
                      <label className="rr-label" htmlFor="pw">Password</label>
                      <div className="rr-pw-wrap">
                        <input id="pw" type={showPass ? "text" : "password"} autoComplete="new-password" required className="rr-input" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)}/>
                        <button type="button" className="rr-eye" onClick={() => setShowPass(v => !v)} aria-label="Toggle">
                          {showPass
                            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20C7 20 2.73 16.39 1 12c.78-1.93 2-3.6 3.52-4.9M9.9 4.24A9.12 9.12 0 0112 4c5 0 9.27 3.11 11 8a10.5 10.5 0 01-1.46 2.76"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          }
                        </button>
                      </div>
                      {password && (
                        <div className="rr-strength">
                          <div className="rr-sbar">
                            {[1,2,3,4].map(n => (
                              <div key={n} className="rr-sseg" style={{ background: n <= score ? strengthColor : undefined }}/>
                            ))}
                          </div>
                          <span className="rr-slabel">{strengthLabel}</span>
                        </div>
                      )}
                    </div>
                    <div className="rr-field">
                      <label className="rr-label" htmlFor="cf">Confirm password</label>
                      <input id="cf" type={showPass ? "text" : "password"} autoComplete="new-password" required className="rr-input" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)}
                        style={confirm && password !== confirm ? { borderColor:"#E24B4A" } : confirm && password === confirm ? { borderColor:"#1D9E75" } : {}}
                      />
                    </div>
                    <div className="rr-nav">
                      <button type="button" className="rr-back" onClick={back}>← Back</button>
                      <button type="submit" className="rr-next" disabled={loading}>
                        {loading
                          ? <span className="rr-spin-row"><svg className="rr-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Creating…</span>
                          : "Create account"
                        }
                      </button>
                    </div>
                  </form>
                )}

                {step < 3 && (
                  <div className="rr-nav">
                    {step > 1 && <button className="rr-back" onClick={back}>← Back</button>}
                    <button className="rr-next" onClick={next}>
                      {step === 1 ? "Continue" : "Next step →"}
                    </button>
                  </div>
                )}

                <p className="rr-signin">
                  Already have an account?{" "}
                  <Link href="/login" className="rr-signin-link">Sign in</Link>
                </p>
              </>
            )}
          </div>
          {!success && <p className="rr-footer">© {new Date().getFullYear()} PropertyPro · All rights reserved</p>}
        </div>
      </div>
    </>
  );
}
