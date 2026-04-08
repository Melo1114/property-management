"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FormShell, FormGrid, FormSection, FieldGroup, FormActions, ErrorBox, parseApiErrors,
} from "@/components/ui/form-shell";
import { useLeases } from "@/hooks";
import { propertiesApi, authApi } from "@/lib/api";
import type { Unit, User } from "@/lib/types";

export default function NewLeasePage() {
  const router = useRouter();
  const { createLease } = useLeases();

  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [tenants,        setTenants]        = useState<User[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [unitId,      setUnitId]      = useState("");
  const [tenantId,    setTenantId]    = useState("");
  const [startDate,   setStartDate]   = useState("");
  const [endDate,     setEndDate]     = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [deposit,     setDeposit]     = useState("");
  const [notes,       setNotes]       = useState("");

  const [loading,     setLoading]     = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      propertiesApi.availableUnits(),
      authApi.getTenants(),
    ])
      .then(([unitsRes, tenantsRes]) => {
        setAvailableUnits(unitsRes.data);
        setTenants(tenantsRes.data);
      })
      .catch(() => setGlobalError("Failed to load units or tenants. Please refresh."))
      .finally(() => setLoadingOptions(false));
  }, []);

  useEffect(() => {
    if (!unitId) return;
    const unit = availableUnits.find((u) => String(u.id) === unitId);
    if (unit) {
      setMonthlyRent(unit.monthly_rent);
      setDeposit(unit.deposit ?? "");
    }
  }, [unitId, availableUnits]);

  function validate(): string {
    if (!unitId)    return "Please select a unit.";
    if (!tenantId)  return "Please select a tenant.";
    if (!startDate) return "Please set a start date.";
    if (!endDate)   return "Please set an end date.";
    if (endDate <= startDate) return "End date must be after start date.";
    if (!monthlyRent || Number(monthlyRent) <= 0) return "Monthly rent must be greater than 0.";
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
      await createLease({
        unit:         Number(unitId),
        tenant:       Number(tenantId),
        start_date:   startDate,
        end_date:     endDate,
        monthly_rent: monthlyRent,
        deposit:      deposit || "0",
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

  const selectedUnit = availableUnits.find((u) => String(u.id) === unitId);

  return (
    <FormShell
      title="New lease"
      description="Link a tenant to an available unit and set the lease terms."
      backHref="/leases"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {globalError && <ErrorBox message={globalError} />}

        <FormSection title="Parties">
          <FieldGroup label="Unit" required error={fieldErrors.unit}>
            <Select
              value={unitId}
              onValueChange={setUnitId}
              disabled={loadingOptions}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingOptions ? "Loading units…" : "Select available unit…"
                } />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.length === 0 && !loadingOptions && (
                  <SelectItem value="none" disabled>
                    No available units
                  </SelectItem>
                )}
                {availableUnits.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    Unit {u.unit_number} – R{parseFloat(u.monthly_rent).toLocaleString("en-ZA")}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>

          {selectedUnit && (
            <div className="rounded-lg bg-muted/40 border px-4 py-3 text-sm grid grid-cols-3 gap-x-6 gap-y-1">
              <span className="text-muted-foreground">Bedrooms</span>
              <span className="text-muted-foreground">Bathrooms</span>
              <span className="text-muted-foreground">Size</span>
              <span className="font-medium">{selectedUnit.bedrooms}</span>
              <span className="font-medium">{selectedUnit.bathrooms}</span>
              <span className="font-medium">{selectedUnit.size_sqm ? `${selectedUnit.size_sqm} m²` : "—"}</span>
            </div>
          )}

          <FieldGroup label="Tenant" required error={fieldErrors.tenant}>
            <Select
              value={tenantId}
              onValueChange={setTenantId}
              disabled={loadingOptions}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingOptions ? "Loading tenants…" : "Select tenant…"
                } />
              </SelectTrigger>
              <SelectContent>
                {tenants.length === 0 && !loadingOptions && (
                  <SelectItem value="none" disabled>
                    No tenants found
                  </SelectItem>
                )}
                {tenants.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.first_name
                      ? `${t.first_name} ${t.last_name ?? ""}`.trim()
                      : t.username}{" "}
                    <span className="text-muted-foreground">– {t.email}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
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

          {startDate && endDate && endDate > startDate && (
            <p className="text-xs text-muted-foreground">
              Duration:{" "}
              {Math.round(
                (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                (1000 * 60 * 60 * 24 * 30.44)
              )}{" "}
              months
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
                placeholder="8500.00"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                required
              />
            </FieldGroup>

            <FieldGroup
              label="Deposit (R)" htmlFor="deposit" error={fieldErrors.deposit}
            >
              <Input
                id="deposit"
                type="number"
                min="0"
                step="0.01"
                placeholder="17000.00"
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
              placeholder="Optional – special conditions, inclusions, terms…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </FieldGroup>
        </FormSection>

        <FormActions
          submitLabel="Create lease"
          loading={loading}
          onCancel={() => router.push("/leases")}
        />
      </form>
    </FormShell>
  );
}
