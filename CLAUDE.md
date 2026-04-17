# Project Instructions for Claude

## Critical Working Rules

1. **ALWAYS review code thoroughly before replying.** Do not push changes that haven't been verified against the full code path. Trace end-to-end logic before committing.

2. **Never assume a fix is correct without verification.** When fixing a bug, check ALL related files (e.g., cookie names, route names, API endpoints) for consistency.

3. **Check for related bugs in the same area.** If fixing one issue (e.g., cookie mismatch), search for similar mismatches elsewhere in the codebase.

4. **Verify all referenced routes/files exist.** Before committing links to `/foo`, verify `app/foo/page.tsx` exists. Before referencing a cookie, verify it's set consistently across auth-context, middleware, and api interceptors.

## Project Architecture

- **Frontend:** Next.js 16.2.1 App Router + React 19 (deployed to Azure)
- **Backend:** Django REST Framework
- **Auth:** JWT tokens stored in localStorage + cookie named **`access_token`** (NOT `pm_access`)
- **Deployment:** GitHub Actions CI/CD → Azure App Service
- **API base URL:** `NEXT_PUBLIC_API_URL` env var, falls back to `http://localhost:8000/api`

## Known Naming Conventions

- Auth cookie name: **`access_token`** (used by middleware.ts, api.ts, auth-context.tsx)
- Django API returns paginated responses with `{count, next, previous, results: [...]}` envelope
  - Handled automatically by response interceptor in `lib/api.ts`

## Pre-Commit Checklist for Auth/Routing Changes

- [ ] Cookie name matches in: `middleware.ts`, `context/auth-context.tsx`, `lib/api.ts`
- [ ] All `<Link href="/foo">` references have a corresponding `app/foo/page.tsx`
- [ ] PUBLIC_PATHS in middleware includes all routes that should work unauthenticated
- [ ] Middleware correctly skips RSC requests (checks RSC header, Next-Router-State-Tree, _rsc param)
- [ ] API response interceptor correctly handles paginated Django responses
