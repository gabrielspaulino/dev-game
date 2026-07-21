# ADR-0003 — Full-Stack Next.js Application Deployed on Vercel

**Status:** Accepted  
**Date:** 2026-07-21

## Context

We need to choose a framework and deployment platform. The product needs a React frontend, server-rendered pages, and a backend API. The deployment must be simple and cost-effective for an early-stage product.

## Decision

We will use **Next.js 15 with the App Router** as the full-stack framework, deployed on **Vercel**.

- Frontend: React Server Components and Client Components.
- Backend API: Next.js Route Handlers under `/api/v1/`.
- Server-side logic: Node.js runtime inside the same project.
- Deployment: Single Vercel project.

## Alternatives Considered

- **Separate Spring Boot backend:** Introduces a second deployment (Render or similar), cross-origin complexity, and a different language ecosystem. Eliminated.
- **Express server on Fly.io / Railway:** More control but more operational overhead. Loses Vercel's zero-config deployment, preview URLs, and edge network.
- **Remix:** Similar full-stack capabilities but smaller ecosystem and fewer examples for this use case.
- **Next.js on Vercel (selected):** Industry-standard for TypeScript full-stack apps. Excellent Vercel integration with preview deployments, serverless functions, and edge network.

## Positive Consequences

- One repository, one deployment, one language (TypeScript).
- Vercel preview deployments for every PR.
- Server Components reduce client JavaScript.
- Route Handlers provide clean HTTP API boundaries.
- Strong TypeScript support throughout.

## Negative Consequences

- Serverless execution model requires stateless design (mitigated by design rules in `AGENTS.md`).
- Cold starts on infrequently-hit routes.
- Vercel pricing scales with usage; must be monitored.

## Follow-up Actions

- Add serverless constraints to `AGENTS.md` and enforce in code review.
- Document which routes use which runtime (Node.js vs Edge).
- Configure Vercel project settings (ADR-0003).
