"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/context/auth-context";
import { useNotifications } from "@/hooks";

const NAV_ITEMS = [
  {
    href:  "/tenant/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href:  "/tenant/lease",
    label: "My lease",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 22V12h6v10"/>
      </svg>
    ),
  },
  {
    href:  "/tenant/payments",
    label: "Payments",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    href:  "/tenant/maintenance",
    label: "Maintenance",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
];

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const { unreadCount } = useNotifications();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --green-deep:   #1A3D2B;
          --green-mid:    #2D6A4F;
          --green-accent: #40916C;
          --green-light:  #D8F3DC;
          --green-pale:   #F0FAF3;
          --orange:       #F4842C;
          --orange-lt:    #FEF3EA;
          --white:        #FFFFFF;
          --gray-50:      #F9FAFB;
          --gray-100:     #F3F4F6;
          --gray-200:     #E5E7EB;
          --gray-400:     #9CA3AF;
          --gray-600:     #4B5563;
          --gray-800:     #1F2937;
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body:    'DM Sans', system-ui, sans-serif;
        }

        body { font-family: var(--font-body); background: var(--gray-50); }

        .t-shell { display: flex; min-height: 100vh; }

        /* ── Side nav ── */
        .t-nav {
          position: fixed; left: 0; top: 0;
          height: 100%; width: 64px;
          background: var(--green-deep);
          z-index: 30;
          transition: width 0.28s ease;
          overflow: hidden;
          display: flex; flex-direction: column;
        }
        .t-nav:hover { width: 220px; }

        .t-nav-brand {
          height: 64px; padding: 0 20px;
          display: flex; align-items: center; gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }

        .t-brand-icon {
          width: 28px; height: 28px;
          background: var(--orange);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .t-brand-name {
          font-family: var(--font-display);
          font-size: 15px;
          color: white;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.18s ease;
        }
        .t-nav:hover .t-brand-name { opacity: 1; }

        .t-nav-links {
          flex: 1;
          padding: 16px 0;
          display: flex; flex-direction: column; gap: 2px;
        }

        .t-nav-link {
          display: flex; align-items: center; gap: 14px;
          padding: 11px 20px;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 14px; font-weight: 500;
          border-radius: 0;
          transition: color 0.15s, background 0.15s;
          white-space: nowrap;
          position: relative;
        }
        .t-nav-link:hover { color: white; background: rgba(255,255,255,0.06); }
        .t-nav-link.active {
          color: white;
          background: rgba(244,132,44,0.15);
        }
        .t-nav-link.active::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px; background: var(--orange); border-radius: 0 2px 2px 0;
        }
        .t-link-label {
          opacity: 0; transition: opacity 0.18s ease;
          flex: 1;
        }
        .t-nav:hover .t-link-label { opacity: 1; }

        .t-notif-badge {
          background: var(--orange);
          color: white;
          font-size: 10px; font-weight: 700;
          min-width: 17px; height: 17px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.18s ease;
        }
        .t-nav:hover .t-notif-badge { opacity: 1; }
        .t-notif-dot {
          position: absolute;
          top: 8px; right: 14px;
          width: 7px; height: 7px;
          background: var(--orange);
          border-radius: 50%;
          border: 1.5px solid var(--green-deep);
        }
        .t-nav:hover .t-notif-dot { display: none; }

        .t-nav-footer {
          padding: 16px 0;
          border-top: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }

        .t-user-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 20px;
          cursor: pointer;
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          white-space: nowrap;
          transition: color 0.15s;
        }
        .t-user-row:hover { color: white; }

        .t-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--green-accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: white;
          flex-shrink: 0;
        }

        .t-user-info { opacity: 0; transition: opacity 0.18s ease; }
        .t-nav:hover .t-user-info { opacity: 1; }

        .t-logout-btn {
          display: flex; align-items: center; gap: 14px;
          padding: 10px 20px;
          color: rgba(255,255,255,0.4);
          background: none; border: none;
          font-family: var(--font-body);
          font-size: 13px; cursor: pointer;
          width: 100%; text-align: left;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .t-logout-btn:hover { color: rgba(255,255,255,0.75); }

        /* ── Main ── */
        .t-main {
          flex: 1;
          margin-left: 64px;
          padding: 32px;
          min-height: 100vh;
        }

        @media (max-width: 640px) {
          .t-main { padding: 20px 16px; }
        }
      `}</style>

      <div className="t-shell">
        {/* Side nav */}
        <nav className="t-nav">
          {/* Brand */}
          <div className="t-nav-brand">
            <div className="t-brand-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
              </svg>
            </div>
            <span className="t-brand-name">AurumKeys</span>
          </div>

          {/* Nav links */}
          <div className="t-nav-links">
            {NAV_ITEMS.map((item) => {
              const isNotif  = item.href === "/tenant/dashboard";
              const isActive = pathname === item.href ||
                               (item.href !== "/tenant/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`t-nav-link${isActive ? " active" : ""}`}
                >
                  <span style={{ flexShrink: 0, position: "relative" }}>
                    {item.icon}
                    {isNotif && unreadCount > 0 && (
                      <span className="t-notif-dot" />
                    )}
                  </span>
                  <span className="t-link-label">{item.label}</span>
                  {isNotif && unreadCount > 0 && (
                    <span className="t-notif-badge">{unreadCount}</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="t-nav-footer">
            <div className="t-user-row">
              <div className="t-avatar">
                {(user?.first_name?.[0] ?? user?.email?.[0] ?? "T").toUpperCase()}
              </div>
              <div className="t-user-info">
                <div style={{ color: "white", fontSize: 13, fontWeight: 500 }}>
                  {user?.first_name
                    ? `${user.first_name} ${user.last_name ?? ""}`.trim()
                    : user?.email}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
                  Tenant
                </div>
              </div>
            </div>
            <button className="t-logout-btn" onClick={logout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                   style={{ flexShrink: 0 }}>
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="t-link-label">Sign out</span>
            </button>
          </div>
        </nav>

        {/* Page content */}
        <main className="t-main">{children}</main>
      </div>
    </>
  );
}
