"use client";

import { useState, FormEvent } from "react";
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
import { propertiesApi } from "@/lib/api";
import type { PropertyType } from "@/lib/types";

const PROPERTY_TYPES: PropertyType[] = ["Residential", "Commercial", "MixedUse"];

export default function NewPropertyPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("Residential");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("South Africa");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setGlobalError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await propertiesApi.create({
        name,
        property_type: propertyType,
        address,
        city,
        province,
        postal_code: postalCode,
        country,
        description,
      });
      router.push("/properties");
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
      title="Add property"
      description="Create a new property listing. You can add units to it after creation."
      backHref="/properties"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {globalError && <ErrorBox message={globalError} />}

        <FormSection title="Property details">
          <FormGrid>
            <FieldGroup
              label="Name"
              htmlFor="name"
              required
              error={fieldErrors.name}
            >
              <Input
                id="name"
                placeholder="e.g. Sandton Heights"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FieldGroup>

            <FieldGroup
              label="Type"
              htmlFor="type"
              required
              error={fieldErrors.property_type}
            >
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                required
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FieldGroup>
          </FormGrid>

          <FieldGroup
            label="Description"
            htmlFor="description"
            error={fieldErrors.description}
          >
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Optional notes about the property"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FieldGroup>
        </FormSection>

        <FormSection title="Location">
          <FieldGroup
            label="Street address"
            htmlFor="address"
            required
            error={fieldErrors.address}
          >
            <Input
              id="address"
              placeholder="123 Rivonia Road"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </FieldGroup>

          <FormGrid>
            <FieldGroup
              label="City"
              htmlFor="city"
              required
              error={fieldErrors.city}
            >
              <Input
                id="city"
                placeholder="Johannesburg"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </FieldGroup>

            <FieldGroup
              label="Province / State"
              htmlFor="province"
              required
              error={fieldErrors.province}
            >
              <Input
                id="province"
                placeholder="Gauteng"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
              />
            </FieldGroup>
          </FormGrid>

          <FormGrid>
            <FieldGroup
              label="Postal code"
              htmlFor="postal"
              required
              error={fieldErrors.postal_code}
            >
              <Input
                id="postal"
                placeholder="2196"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </FieldGroup>

            <FieldGroup
              label="Country"
              htmlFor="country"
              required
              error={fieldErrors.country}
            >
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </FieldGroup>
          </FormGrid>
        </FormSection>

        <FormActions
          submitLabel="Create property"
          loading={loading}
          onCancel={() => router.push("/properties")}
        />
      </form>
    </FormShell>
  );
}
