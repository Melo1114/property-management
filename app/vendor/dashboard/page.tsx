"use client";

import Link from "next/link";
import { useMaintenance } from "@/hooks";
import { useAuthContext } from "@/context/auth-context";
import type { MaintenanceRequest } from "@/lib/types";

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "green" | "orange" | "red";
}) {
  const accentColor =
    accent === "orange"
      ? "#F4842C"
      : accent === "red"
      ? "#DC2626"
      : "#2D6A4F";

  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #E5E7EB",
        borderRadius: 12,
        padding: "20px 22px",
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#6B7280",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#1F2937",
          lineHeight: 1.1,
          marginBottom: 6,
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 13, color: "#9CA3AF" }}>{sub}</div>}
    </div>
  );
}

const PRIORITY_STYLES: Record<string, { bg: string; color: string }> = {
  URGENT: { bg: "#FEE2E2", color: "#991B1B" },
  HIGH: { bg: "#FEF3C7", color: "#92400E" },
  MEDIUM: { bg: "#DBEAFE", color: "#1E40AF" },
  LOW: { bg: "#F3F4F6", color: "#374151" },
};

export default function VendorDashboardPage() {
  const { user, logout } = useAuthContext();
  const { data: requests, isLoading } = useMaintenance();

  const list: MaintenanceRequest[] = Array.isArray(requests) ? requests : [];

  const assigned = list.filter((r) => r.status === "OPEN");
  const inProgress = list.filter((r) => r.status === "IN_PROGRESS");
  const completed = list.filter((r) => r.status === "RESOLVED");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F9FAFB",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #E5E7EB",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "#E8621A",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 3L3 11v14h7v-8h8v8h7V11L14 3z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1F2937" }}>
              Vendor Portal
            </div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>
              {user?.first_name ? `Welcome, ${user.first_name}` : "Welcome"}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          style={{
            padding: "8px 16px",
            border: "1.5px solid #E5E7EB",
            borderRadius: 8,
            background: "#fff",
            fontSize: 13,
            fontWeight: 500,
            color: "#374151",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </header>

      <main style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#1F2937",
            marginBottom: 8,
          }}
        >
          My assigned work
        </h1>
        <p style={{ color: "#6B7280", marginBottom: 32 }}>
          Review and manage maintenance requests assigned to you.
        </p>

        {/* KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <KpiCard
            label="Assigned"
            value={String(assigned.length)}
            sub="Waiting to start"
            accent="orange"
          />
          <KpiCard
            label="In progress"
            value={String(inProgress.length)}
            sub="Currently active"
          />
          <KpiCard
            label="Completed"
            value={String(completed.length)}
            sub="Resolved by me"
          />
        </div>

        {/* Requests list */}
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #E5E7EB",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#1F2937",
              marginBottom: 16,
            }}
          >
            All requests
          </h2>

          {isLoading && (
            <p style={{ color: "#6B7280", fontSize: 14 }}>
              Loading requests…
            </p>
          )}

          {!isLoading && list.length === 0 && (
            <p style={{ color: "#6B7280", fontSize: 14 }}>
              No maintenance requests assigned to you yet.
            </p>
          )}

          {!isLoading && list.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {list.map((r) => {
                const priorityStyle =
                  PRIORITY_STYLES[r.priority] ?? PRIORITY_STYLES.MEDIUM;
                return (
                  <div
                    key={r.id}
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 10,
                      padding: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            background: priorityStyle.bg,
                            color: priorityStyle.color,
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 12,
                            textTransform: "uppercase",
                            letterSpacing: "0.4px",
                          }}
                        >
                          {r.priority}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#9CA3AF",
                          }}
                        >
                          {r.status.replace("_", " ")}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#1F2937",
                          marginBottom: 4,
                        }}
                      >
                        {r.title}
                      </div>
                      {r.description && (
                        <div style={{ fontSize: 13, color: "#6B7280" }}>
                          {r.description}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 12,
                          color: "#9CA3AF",
                          marginTop: 6,
                        }}
                      >
                        Reported {formatDate(r.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link
            href="/maintenance"
            style={{
              fontSize: 13,
              color: "#E8621A",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            View all maintenance requests →
          </Link>
        </div>
      </main>
    </div>
  );
}
