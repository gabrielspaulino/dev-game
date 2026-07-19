# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability, please **do not** create a public GitHub issue.

Email: security@devleap.dev (or open a private security advisory on GitHub).

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if known)

We will respond within 48 hours and aim to release a fix within 14 days.

## Security principles

1. **Authentication**: All authenticated endpoints require a valid Supabase JWT. Tokens are validated by the backend — never trust client-asserted identity.
2. **Authorization**: Role-based access control (USER, ADMIN) enforced on every endpoint.
3. **Input validation**: All inputs validated with Bean Validation (backend) and Zod (frontend) before use.
4. **No sensitive data in logs**: Tokens, passwords, and PII are never logged.
5. **No secrets in source code**: Use environment variables exclusively.
6. **CORS**: Restricted to explicitly configured origins.
7. **Headers**: Secure HTTP headers via Spring Security.
8. **Payload limits**: Request body size limits enforced.
9. **Idempotency**: XP and streak grants are idempotent — duplicate requests cannot grant rewards twice.

## Threat model

See `SECURITY.md` sections below for a brief threat model.

### Authentication bypass
- **Threat**: Attacker sends requests with forged or expired JWT.
- **Control**: Backend validates token signature and expiry with Supabase JWT public key.

### Privilege escalation
- **Threat**: Regular user accesses admin endpoints.
- **Control**: Role check on every admin endpoint; role derived from validated token, not client input.

### XP farming
- **Threat**: User replays session completion request to earn XP multiple times.
- **Control**: Idempotency key on XP transaction ledger; duplicate keys are rejected.

### Session hijacking
- **Threat**: User modifies another user's session answers.
- **Control**: Backend verifies session ownership before processing any answer.

### SQL injection
- **Threat**: Malicious input in query parameters or request bodies.
- **Control**: All DB access via JPA/Hibernate with parameterized queries; raw SQL prohibited in application code.

### Insecure direct object references
- **Threat**: User accesses another user's data via guessed UUIDs.
- **Control**: Every query filters by authenticated user's internal ID.

## Supported versions

| Version | Supported |
|---------|-----------|
| main    | ✅ Yes     |
