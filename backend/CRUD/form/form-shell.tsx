/**
 * components/ui/form-shell.tsx
 * ─────────────────────────────
 * Lightweight form layout helpers used by all add/edit pages.
 * Zero new dependencies — built on top of existing shadcn primitives.
 */
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// ── FormShell ─────────────────────────────────────────────────────────────────

export function FormShell({
  title,
  description,
  backHref,
  children,
}: {
  title:        string;
  description?: string;
  backHref:     string;
  children:     React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      {/* Back link */}
      <button
        type="button"
        onClick={() => router.push(backHref)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back
      </button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

// ── FieldGroup ────────────────────────────────────────────────────────────────

export function FieldGroup({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label:    string;
  htmlFor?: string;
  error?:   string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

// ── FormGrid ──────────────────────────────────────────────────────────────────

export function FormGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {children}
    </div>
  );
}

// ── FormSection ───────────────────────────────────────────────────────────────

export function FormSection({
  title,
  children,
}: {
  title:    string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </div>
  );
}

// ── ErrorBox ──────────────────────────────────────────────────────────────────

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  );
}

// ── FormActions ───────────────────────────────────────────────────────────────

export function FormActions({
  submitLabel,
  loading,
  onCancel,
}: {
  submitLabel: string;
  loading:     boolean;
  onCancel:    () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={loading}
        className="min-w-[120px] bg-[#2D6A4F] hover:bg-[#1A3D2B] text-white"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Saving…
          </span>
        ) : submitLabel}
      </Button>
    </div>
  );
}

// ── parseApiErrors ────────────────────────────────────────────────────────────
// Converts DRF validation error response into a flat field→message map.

export function parseApiErrors(
  err: unknown
): { fieldErrors: Record<string, string>; globalError: string } {
  const data = (err as { response?: { data?: Record<string, unknown> } })
    ?.response?.data;

  if (!data) return { fieldErrors: {}, globalError: "An unexpected error occurred." };

  const fieldErrors: Record<string, string> = {};
  let globalError = "";

  Object.entries(data).forEach(([key, value]) => {
    const msg = Array.isArray(value) ? value[0] : String(value);
    if (key === "detail" || key === "non_field_errors") {
      globalError = msg;
    } else {
      fieldErrors[key] = msg;
    }
  });

  if (!globalError && Object.keys(fieldErrors).length === 0) {
    globalError = "Save failed. Please check the form and try again.";
  }

  return { fieldErrors, globalError };
}
