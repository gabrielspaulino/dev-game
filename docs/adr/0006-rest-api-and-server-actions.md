# ADR-0006 — REST Route Handlers as the Primary API Pattern

**Status:** Accepted  
**Date:** 2026-07-21

## Context

Next.js 13+ introduced Server Actions as a way to call server-side functions directly from Client Components. We need to decide whether to use Server Actions, traditional REST Route Handlers, or both for the backend API.

## Decision

We will use **REST Route Handlers** as the primary API pattern (`src/app/api/v1/...`).

Server Actions may be used only for simple, form-based mutations where they provide a clear benefit (e.g., a settings form that uses progressive enhancement). They must not contain business logic.

## Alternatives Considered

- **Server Actions only:** Simpler for simple forms, but harder to test (require the Next.js runtime), harder to document (no OpenAPI), and harder to consume from non-browser clients.
- **REST Route Handlers only (selected):** Standard HTTP semantics. Testable with any HTTP client. Documentable with OpenAPI. Works from browser, mobile, and external tools.
- **tRPC:** Type-safe RPC, excellent TypeScript integration. Adds a dependency and a new mental model. Eliminates OpenAPI compatibility. Good option for the future if the team grows and wants type-safe client-server calls without codegen.

## Decision Rationale

Route Handlers provide:

- Clear request/response contract documentable in `docs/API.md`.
- Standard HTTP verbs and status codes.
- Testable without the Next.js framework.
- Future compatibility with mobile clients or partner integrations.

## Positive Consequences

- API is self-documenting through HTTP conventions.
- Route Handlers are thin — they delegate to use cases immediately.
- Tests are straightforward — call the handler, check the response.
- API versioning is explicit (`/api/v1/`).

## Negative Consequences

- More verbose than Server Actions for simple forms.
- No automatic form progressive enhancement (can be added per-form with Server Actions when beneficial).

## Follow-up Actions

- Enforce Route Handlers must not contain business logic (only validation, identity resolution, use case call, response mapping).
- Document all endpoints in `docs/API.md`.
