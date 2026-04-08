"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input }   from "@/components/ui/input";
import {
  FormShell, FormGrid, FormSection, FieldGroup, FormActions, ErrorBox, parseApiErrors,
} from "@/components/ui/form-shell";
import { authApi } from "@/lib/api";

export default function NewTenantPage() {
  const router = useRouter();

  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [username,   setUsername]   = useState("");
  const [email,      setEmail]      = useState("");
  const [phone,      setPhone]      = useState("");
  const [address,    setAddress]    = useState("");
  const [password,   setPassword]   = useState("");
  const [password2,  setPassword2]  = useState("");
  const [showPass,   setShowPass]   = useState(false);

  const [loading,     setLoading]     = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): string {
    if (password.length < 8)      return "Password must be at least 8 characters.";
    if (password !== password2)   return "Passwords do not match.";
    return "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setGlobalError(err); return; }

    setGlobalError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await authApi.register({
        first_name:   firstName,
        last_name:    lastName,
        username,
        email,
        phone_number: phone,
        address,
        role:         "Tenant",
        password,
        password2,
      });
      router.push("/tenants");
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
      title="Add tenant"
      description="Create a new tenant account. They can log in immediately after creation."
      backHref="/tenants"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {globalError && <ErrorBox message={globalError} />}

        <FormSection title="Personal details">
          <FormGrid>
            <FieldGroup
              label="First name" htmlFor="first" required error={fieldErrors.first_name}
            >
              <Input
                id="first"
                placeholder="Sipho"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </FieldGroup>

            <FieldGroup
              label="Last name" htmlFor="last" required error={fieldErrors.last_name}
            >
              <Input
                id="last"
                placeholder="Dlamini"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </FieldGroup>
          </FormGrid>

          <FieldGroup label="Username" htmlFor="uname" required error={fieldErrors.username}>
            <Input
              id="uname"
              placeholder="sipho_d"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              required
            />
          </FieldGroup>
        </FormSection>

        <FormSection title="Contact information">
          <FieldGroup label="Email address" htmlFor="email" required error={fieldErrors.email}>
            <Input
              id="email"
              type="email"
              placeholder="sipho@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FieldGroup>

          <FormGrid>
            <FieldGroup label="Phone number" htmlFor="phone" error={fieldErrors.phone_number}>
              <Input
                id="phone"
                type="tel"
                placeholder="082 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FieldGroup>
          </FormGrid>

          <FieldGroup label="Address" htmlFor="address" error={fieldErrors.address}>
            <Input
              id="address"
              placeholder="123 Main Road, Johannesburg"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </FieldGroup>
        </FormSection>

        <FormSection title="Account password">
          <p className="text-xs text-muted-foreground -mt-2">
            The tenant will use this password to log in. Minimum 8 characters.
          </p>

          <FormGrid>
            <FieldGroup label="Password" htmlFor="pw" required error={fieldErrors.password}>
              <div className="relative">
                <Input
                  id="pw"
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </FieldGroup>

            <FieldGroup label="Confirm password" htmlFor="pw2" required error={fieldErrors.password2}>
              <Input
                id="pw2"
                type={showPass ? "text" : "password"}
                placeholder="Repeat password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
            </FieldGroup>
          </FormGrid>
        </FormSection>

        <FormActions
          submitLabel="Create tenant"
          loading={loading}
          onCancel={() => router.push("/tenants")}
        />
      </form>
    </FormShell>
  );
}
