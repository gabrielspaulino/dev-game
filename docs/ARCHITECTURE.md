# Architecture

## System Overview

dev-game is a full-stack Next.js application deployed as a single project on Vercel. The frontend (React) and backend (Node.js Route Handlers) live in the same repository and are deployed together.

The codebase is organized as a **modular monolith** following hexagonal architecture principles. Business modules have clear internal boundaries and are designed so they could be extracted into separate services in the future — but there is no requirement to do so.

## Deployment Model

```
Browser
  ↓ HTTPS
Vercel Edge Network
  ↓ routes to
Next.js App (Vercel Serverless Functions)
  ├── React Server Components (SSR)
  ├── React Client Components (browser hydration)
  └── Route Handlers (API endpoints at /api/v1/...)
      ↓
Application Use Cases
      ↓
Infrastructure Adapters
      ↓
PostgreSQL (Supabase)
```

## Dependency Rule

```
UI + Framework Adapters
       ↓
Application Use Cases
       ↓
    Domain

Infrastructure Adapters implement Ports ← defined by Application/Domain
```

**The reverse dependency must not occur.**

Domain and application code must not import from:
- Next.js request/response objects
- React
- Supabase
- Drizzle ORM
- Vercel
- Any external provider

## Business Modules

Each module lives in `src/modules/<name>/` and may contain:

```
src/modules/<name>/
├── domain/         # Entities, value objects, domain services, events
├── application/    # Use cases, DTOs, command/query objects
├── ports/          # Interfaces: repositories, gateways, services
├── adapters/       # Implementations of ports (Drizzle, Supabase, etc.)
└── infrastructure/ # Module-specific configuration
```

### Modules

| Module | Responsibility |
|--------|---------------|
| `identity` | Authentication, token validation, identity provider abstraction |
| `users` | Internal user accounts, roles, profile |
| `learning` | Learning paths, modules, lessons, skills |
| `questions` | Question bank, options, skill associations |
| `sessions` | Daily session lifecycle: generation, answering, completion |
| `progress` | Skill mastery, user progress, session history |
| `gamification` | XP transactions, user levels, streaks, achievements |
| `administration` | Admin use cases for question and content management |

### Cross-Module Dependencies

Modules communicate only through explicitly defined ports. A module must not import from another module's `domain`, `application`, or `infrastructure` layers directly. Dependencies must be declared and reviewed.

Allowed dependencies (examples):
- `sessions` → `questions` (read questions for session assembly)
- `sessions` → `gamification` (trigger XP award on completion)
- `sessions` → `progress` (update skill mastery on completion)

## Route Handler Request Flow

```
HTTP Request
  → Middleware (auth, CORS, rate limiting)
  → Route Handler (src/app/api/v1/...)
    1. Resolve correlation ID
    2. Parse and validate request input (Zod)
    3. Resolve authenticated identity
    4. Call application use case
    5. Map result to HTTP response
    6. Map AppErrors to documented status codes
  → HTTP Response
```

Route Handlers must not:
- Contain business rules
- Access the database directly
- Expose ORM records
- Trust client-supplied values (XP, role, correctness)

## Server and Client Component Boundary

- **Server Components** (default): Data fetching, server-rendered pages, heavy computation.
- **Client Components** (`"use client"`): Interactive UI, browser state, event handlers.

Never import server-only modules (`db`, `env`, `logger`) in Client Components.
Use the `server-only` package to enforce this at build time.

## Authentication Flow

1. Browser authenticates through Supabase Auth (client SDK).
2. Supabase returns an access token (JWT).
3. The token is sent in the `Authorization` header on API requests.
4. The `IdentityProvider` port validates the token on the server.
5. `SupabaseIdentityProvider` (adapter) extracts the external identity.
6. The `users` module resolves or creates the internal user.
7. Use cases operate using the internal user ID — never the Supabase user ID.

The domain must not depend on Supabase user objects. The `IdentityProvider` port abstracts the auth provider so it can be replaced (Auth0, Clerk, Keycloak, etc.) without changing business rules.

## Persistence Flow

```
Route Handler / Server Component
  → Application Use Case
    → Repository Port (interface)
      → Drizzle Adapter (implementation)
        → postgres.js driver
          → PostgreSQL (Supabase)
```

Repository ports are interfaces defined in `src/modules/<name>/ports/`.
Drizzle implementations live in `src/modules/<name>/adapters/`.
Domain objects must not be Drizzle records — map at the adapter boundary.

## External Provider Adapters

| Concern | Port | Initial Adapter |
|---------|------|-----------------|
| Authentication | `IdentityProvider` | `SupabaseIdentityProvider` |
| Database | Repository interfaces | `DrizzleXxxRepository` |
| Time | `Clock` | `SystemClock` |
| Randomness | `QuestionSelector` | `RandomQuestionSelector` |
| Notifications | `NotificationGateway` | (not yet implemented) |
| Background jobs | `JobPort` | (not yet implemented) |

## Serverless Constraints

- No persistent in-memory state between requests.
- No filesystem writes for application data.
- No in-memory locks — use database transactions and constraints.
- DB connections are pooled through Supabase pgBouncer.
- ORM client is reused within a warm function instance via a global singleton.
- Migrations run via `npm run db:migrate` with a direct connection, never during user requests.

## Portability Strategy

- Auth provider: replace `SupabaseIdentityProvider` with any `IdentityProvider` implementation.
- Database: replace Drizzle adapters; domain code is unaffected.
- Deployment: Route Handlers are replaceable with Express/Fastify handlers; the application layer is framework-agnostic.

## Scalability Considerations

- Horizontal scaling is handled by Vercel's serverless infrastructure.
- Session generation is idempotent and safe under concurrent requests.
- XP awards use idempotency keys to prevent duplicate rewards.
- Database operations that must be atomic use Drizzle transactions.

## Known Limitations

- Connection count grows with concurrent serverless instances. Supabase pgBouncer mitigates this.
- No real-time features in MVP (WebSockets, SSE).
- Background jobs (streak reminders, scheduled reports) require external infrastructure.

## Future Evolution

- Background jobs: Vercel Cron or a managed queue (BullMQ, Trigger.dev).
- Real-time: WebSockets or Server-Sent Events for live session feedback.
- Module extraction: Any business module can be extracted into a standalone service by replacing its adapters with HTTP clients.
- Multi-tenant: The domain model supports multiple learning paths and can be extended for organizations.
