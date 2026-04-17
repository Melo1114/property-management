"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  FormShell,
  FormGrid,
  FormSection,
  FieldGroup,
  FormActions,
  ErrorBox,
  parseApiErrors,
} from "@/components/ui/form-shell";
import { maintenanceApi, propertiesApi } from "@/lib/api";
import type { Unit } from "@/lib/types";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function NewMaintenanceRequestPage() {
  const router = useRouter();

  const [units, setUnits] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");

  const [loading, setLoading] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadUnits() {
      try {
        const res = await propertiesApi.listUnits();
        if (!cancelled) {
          const list = Array.isArray(res.data) ? res.data : [];
          setUnits(list);
          if (list.length > 0) setUnitId(String(list[0].id));
        }
      } catch {
        if (!cancelled) setGlobalError("Failed to load units.");
      } finally {
        if (!cancelled) setUnitsLoading(false);
      }
    }

    loadUnits();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!unitId) {
      setGlobalError("Please select a unit.");
      return;
    }

    setGlobalError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await maintenanceApi.create({
        unit: Number(unitId),
        title,
        description,
        priority,
      });
      router.push("/maintenance");
    } catch (err) {
      const { fieldErrors: fe, globalError: ge } = parseApiErrors(err);
      setFieldErrors(fe);
      setGlobalError(ge);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell
      title="New maintenance request"
      description="Report a maintenance issue for one of your units."
      backHref="/maintenance"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {globalError && <ErrorBox message={globalError} />}

        <FormSection title="Request details">
          <FieldGroup
            label="Unit"
            htmlFor="unit"
            required
            error={fieldErrors.unit}
          >
            <select
              id="unit"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              required
              disabled={unitsLoading || units.length === 0}
            >
              {unitsLoading && <option>Loading units…</option>}
              {!unitsLoading && units.length === 0 && (
                <option value="">No units available</option>
              )}
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  Unit {u.unit_number}
                </option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup
            label="Title"
            htmlFor="title"
            required
            error={fieldErrors.title}
          >
            <Input
              id="title"
              placeholder="e.g. Leaking kitchen tap"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FieldGroup>

          <FieldGroup
            label="Description"
            htmlFor="description"
            error={fieldErrors.description}
          >
            <textarea
              id="description"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Describe the issue in detail so the vendor knows what to bring."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FieldGroup>

          <FormGrid>
            <FieldGroup
              label="Priority"
              htmlFor="priority"
              required
              error={fieldErrors.priority}
            >
              <select
                id="priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                required
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </FieldGroup>
          </FormGrid>
        </FormSection>

        <FormActions
          submitLabel="Submit request"
          loading={loading}
          onCancel={() => router.push("/maintenance")}
        />
      </form>
    </FormShell>
  );
}
