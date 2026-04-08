"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FormShell, FormGrid, FormSection, FieldGroup, FormActions, ErrorBox, parseApiErrors,
} from "@/components/ui/form-shell";
import { useLeases } from "@/hooks";
import { leasesApi } from "@/lib/api";
import type { Lease, LeaseStatus } from "@/lib/types";

export default function EditLeasePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id     = Number(params.id);

  const { updateLease } = useLeases();

  const [fetching,    setFetching]    = useState(true);
  const [lease,       setLease]       = useState<Lease | null>(null);

  const [startDate,   setStartDate]   = useState("");
  const [endDate,     setEndDate]     = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [deposit,     setDeposit]     = useState("");
  const [status,      setStatus]      = useState<LeaseStatus>("Active");
  const [notes,       setNotes]       = useState("");

  const [loading,     setLoading]     = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    leasesApi.get(id)
      .then(({ data }) => {
        setLease(data);
        setStartDate(data.start_date);
        setEndDate(data.end_date);
        setMonthlyRent(data.monthly_rent);
        setDeposit(data.deposit ?? "0");
        setStatus(data.status);
        setNotes(data.notes ?? "");
      })
      .catch(() => setGlobalError("Could not load lease."))
      .finally(() => setFetching(false));
  }, [id]);

  function validate(): string {
    if (!startDate) return "Start date is required.";
    if (!endDate)   return "End date is required.";
    if (endDate <= startDate) return "End date must be after start date.";
    if (!monthlyRent || Number(monthlyRent) <= 0)
      return "Monthly rent must be greater than 0.";
    return "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valErr = validate();
    if (valErr) { setGlobalError(valErr); return; }

    setGlobalError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await updateLease(id, {
        start_date:   startDate,
        end_date:     endDate,
        monthly_rent: monthlyRent,
        deposit,
        status,
        notes,
      });
      router.push("/leases");
    } catch (err) {
      const { fieldErrors: fe, globalError: ge } = parseApiErrors(err);
      setFieldErrors(fe);
      setGlobalError(ge);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <FormShell title="Edit lease" backHref="/leases">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </FormShell>
    );
  }

  if (!lease && !fetching) {
    return (
      <FormShell title="Edit lease" backHref="/leases">
        <p className="text-sm text-muted-foreground">Lease not found.</p>
      </FormShell>
    );
  }

  const durationMonths = startDate && endDate && endDate > startDate
    ? Math.round(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24 * 30.44)
      )
    : null;

  return (
    <FormShell
      title="Edit lease"
      description={
        lease
          ? `${lease.unit_detail.property} · Unit ${lease.unit_detail.unit_number} – ${lease.tenant_name}`
          : "Edit lease terms."
      }
      backHref="/leases"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {globalError && <ErrorBox message={globalError} />}

        <FormSection title="Parties (read-only)">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Unit
              </p>
              <p className="font-medium">
                {lease?.unit_detail.property} · Unit {lease?.unit_detail.unit_number}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Tenant
              </p>
              <p className="font-medium">{lease?.tenant_name}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            To change the unit or tenant, terminate this lease and create a new one.
          </p>
        </FormSection>

        <FormSection title="Lease status">
          <FieldGroup label="Status" required error={fieldErrors.status}>
            <Select value={status} onValueChange={(v) => setStatus(v as LeaseStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>

          {(status === "Terminated" || status === "Expired") && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              Setting status to <strong>{status}</strong> will mark this lease as ended.
              The unit will become available for new leases.
            </div>
          )}
        </FormSection>

        <FormSection title="Lease term">
          <FormGrid>
            <FieldGroup
              label="Start date" htmlFor="start" required error={fieldErrors.start_date}
            >
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </FieldGroup>

            <FieldGroup
              label="End date" htmlFor="end" required error={fieldErrors.end_date}
            >
              <Input
                id="end"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </FieldGroup>
          </FormGrid>

          {durationMonths !== null && (
            <p className="text-xs text-muted-foreground">
              Duration: {durationMonths} month{durationMonths !== 1 ? "s" : ""}
            </p>
          )}
        </FormSection>

        <FormSection title="Financials">
          <FormGrid>
            <FieldGroup
              label="Monthly rent (R)" htmlFor="rent" required
              error={fieldErrors.monthly_rent}
            >
              <Input
                id="rent"
                type="number"
                min="0"
                step="0.01"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                required
              />
            </FieldGroup>

            <FieldGroup label="Deposit (R)" htmlFor="dep" error={fieldErrors.deposit}>
              <Input
                id="dep"
                type="number"
                min="0"
                step="0.01"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
              />
            </FieldGroup>
          </FormGrid>
        </FormSection>

        <FormSection title="Notes">
          <FieldGroup label="Notes" htmlFor="notes" error={fieldErrors.notes}>
            <Textarea
              id="notes"
              placeholder="Optional – special terms, inclusions, amendments…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </FieldGroup>
        </FormSection>

        <FormActions
          submitLabel="Save changes"
          loading={loading}
          onCancel={() => router.push("/leases")}
        />
      </form>
    </FormShell>
  );
}
