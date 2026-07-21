# Security

## Authentication Model

Authentication is delegated to Supabase Auth. The browser authenticates against Supabase and receives a short-lived JWT. The JWT is sent to the server on each API request.

The `IdentityProvider` port validates the JWT server-side. The `SupabaseIdentityProvider` adapter verifies the token with the Supabase JWT secret and extracts the external user ID. The application maps this to an internal user ID.

**The domain always operates on internal user IDs — never on Supabase user IDs.**

## Authorization Model

- **USER role:** Default role. Access to own data only.
- **ADMIN role:** Access to administrative endpoints. Stored server-side; never trusted from the client.

Authorization is enforced in application use cases:
1. Resolve the authenticated identity from the token.
2. Load the internal user and their role from the database.
3. Check role in the use case before performing the action.

## Trust Boundaries

| Boundary | Trust Level |
|----------|-------------|
| Browser | Untrusted — validate all input |
| Authorization header (JWT) | Validated by IdentityProvider |
| Internal user ID (from DB) | Trusted |
| Client-sent XP, correctness, level | Never trusted |
| Database | Trusted, but validate constraints |

## Secret Management

| Variable | Location | Exposure |
|----------|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Never browser, never `NEXT_PUBLIC_` |
| `DATABASE_URL` | Server only | Never browser |
| `DIRECT_DATABASE_URL` | Server only | Never browser |
| `SUPABASE_JWT_*` | Server only | Never browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser safe | Designed to be public |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser safe | Designed to be public |

## Common Web Threats

### XSS
- React escapes all rendered values by default.
- Do not use `dangerouslySetInnerHTML` unless sanitized.
- Content Security Policy headers should be configured at the Vercel level.

### CSRF
- Next.js App Router Route Handlers do not use cookies for auth (Bearer token in `Authorization` header). CSRF is not applicable to the API.
- If cookie-based sessions are introduced, SameSite=Strict and CSRF tokens must be used.

### Input Validation
- All Route Handler inputs are validated with Zod before reaching use cases.
- Validation errors return 422 with field-level details.

### SQL Injection
- Drizzle ORM uses parameterized queries. Raw SQL is prohibited without explicit review.

### Safe Redirects
- Auth redirect URLs are validated against an allowlist. Never redirect to user-supplied URLs.

## Resource Ownership

Every use case that reads or modifies a user-owned resource must verify that the authenticated user owns the resource:

```ts
if (session.userId !== currentUser.id) throw new ForbiddenError("...");
```

## Administrative Access

- Admin routes are protected by the ADMIN role check in the use case.
- UI-only protection (hiding admin links) is not sufficient — server-side checks are mandatory.
- Admin actions are logged with the admin's user ID and a timestamp.

## Logging Restrictions

Never log:
- Access tokens or refresh tokens
- Authorization headers
- Session cookies
- Passwords
- Secret keys
- Full request bodies that may contain the above

## Dependency Security

- `npm audit` is run in CI.
- Dependencies are kept up to date.
- Only necessary dependencies are added. Each new dependency is reviewed for:
  - Security history
  - Maintenance status
  - Bundle impact

## Initial Threat Model

| Threat | Mitigation |
|--------|-----------|
| Unauthorized data access | Authentication + ownership checks in use cases |
| Privilege escalation | Role stored server-side; never trusted from client |
| Duplicate XP / streak fraud | Idempotency keys + DB unique constraints |
| Injection attacks | Zod validation + Drizzle parameterized queries |
| Secret leakage | Strict environment variable rules; CI secret scanning |
| Replay attacks | Short-lived JWTs; Supabase refresh token rotation |
| Admin takeover | Admin role enforced server-side on every admin request |
