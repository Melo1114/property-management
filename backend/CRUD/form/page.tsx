"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FormShell, FormGrid, FormSection, FieldGroup, FormActions, ErrorBox, parseApiErrors,
} from "@/components/ui/form-shell";
import { useProperties } from "@/hooks";
import type { PropertyType } from "@/lib/types";

const SA_PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape",
];

export default function NewPropertyPage() {
  const router = useRouter();
  const { createProperty } = useProperties();

  const [name,         setName]         = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [address,      setAddress]      = useState("");
  const [city,         setCity]         = useState("");
  const [province,     setProvince]     = useState("");
  const [postalCode,   setPostalCode]   = useState("");
  const [country,      setCountry]      = useState("South Africa");
  const [description,  setDescription]  = useState("");

  const [loading,     setLoading]     = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await createProperty({
        name,
        property_type: propertyType as PropertyType,
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
      description="Create a new property in your portfolio."
      backHref="/properties"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {globalError && <ErrorBox message={globalError} />}

        {/* Basic info */}
        <FormSection title="Basic information">
          <FieldGroup label="Property name" htmlFor="name" required error={fieldErrors.name}>
            <Input
              id="name"
              placeholder="e.g. Sandton Heights"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FieldGroup>

          <FieldGroup label="Property type" required error={fieldErrors.property_type}>
            <Select
              value={propertyType}
              onValueChange={(v) => setPropertyType(v as PropertyType)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="MixedUse">Mixed use</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </FormSection>

        {/* Location */}
        <FormSection title="Location">
          <FieldGroup label="Street address" htmlFor="address" required error={fieldErrors.address}>
            <Input
              id="address"
              placeholder="123 Main Road"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </FieldGroup>

          <FormGrid>
            <FieldGroup label="City" htmlFor="city" required error={fieldErrors.city}>
              <Input
                id="city"
                placeholder="Johannesburg"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </FieldGroup>

            <FieldGroup label="Province" required error={fieldErrors.province}>
              <Select value={province} onValueChange={setProvince} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select province…" />
                </SelectTrigger>
                <SelectContent>
                  {SA_PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>

            <FieldGroup label="Postal code" htmlFor="postal" error={fieldErrors.postal_code}>
              <Input
                id="postal"
                placeholder="2196"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                maxLength={10}
              />
            </FieldGroup>

            <FieldGroup label="Country" htmlFor="country" error={fieldErrors.country}>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </FieldGroup>
          </FormGrid>
        </FormSection>

        {/* Details */}
        <FormSection title="Details">
          <FieldGroup label="Description" htmlFor="desc" error={fieldErrors.description}>
            <Textarea
              id="desc"
              placeholder="Optional notes about this property…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </FieldGroup>
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
