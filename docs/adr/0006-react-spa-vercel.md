# ADR-0006: React SPA Hosted on Vercel

**Status**: Accepted  
**Date**: 2025-07-18

## Context

DevLeap needs a frontend deployment strategy that is fast to set up, globally distributed, and capable of supporting PWA features in the future.

## Decision

The frontend is a **React 18 Single Page Application** built with:
- **Vite** (build tool)
- **TypeScript** (strict mode)
- **React Router** (client-side routing)
- **TanStack Query** (remote state management)
- **React Hook Form + Zod** (forms and validation)

Deployed to **Vercel**:
- CDN-served static assets.
- Automatic preview deployments for pull requests.
- Zero server maintenance.

## Alternatives considered

**Next.js SSR**: Server-side rendering adds complexity and server costs without clear benefit at this stage. The app is authenticated — SEO value of SSR is minimal.

**Remix**: Full-stack framework that would require changing our deployment model significantly.

**Self-hosted Nginx**: More control, more operational burden. Not worth it at MVP stage.

## Positive consequences

- Instant global CDN distribution.
- Zero-config preview deployments for every PR.
- Simple rollback via Vercel's deployment history.
- No server costs for the frontend.
- PWA manifest and service worker can be added without changing the hosting model.

## Negative consequences

- Vercel is a vendor — migrating to another host requires updating build configuration.
- SPA routing requires `vercel.json` rewrite rules for deep links.
- Initial page load requires JS execution before content is visible (acceptable for an authenticated app).
