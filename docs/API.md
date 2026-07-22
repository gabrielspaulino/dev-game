# API Reference

## Conventions

- All endpoints are versioned under `/api/v1/`.
- Request and response bodies use JSON.
- Authentication uses a Bearer token in the `Authorization` header.
- All server errors return a safe JSON body — never a stack trace.

## Authentication

Include the Supabase access token as a Bearer token:

```
Authorization: Bearer <access_token>
```

Endpoints marked **Public** do not require authentication.

## Error Format

All errors return:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable message.",
  "timestamp": "2026-01-01T10:00:00.000Z",
  "path": "/api/v1/...",
  "correlationId": "uuid-v4",
  "validationErrors": [{ "field": "email", "message": "Invalid email address." }]
}
```

`validationErrors` is always present but may be an empty array.

## Common Error Codes

| Code               | HTTP Status | Meaning                                       |
| ------------------ | ----------- | --------------------------------------------- |
| `UNAUTHORIZED`     | 401         | Missing or invalid authentication             |
| `FORBIDDEN`        | 403         | Authenticated but not authorized              |
| `NOT_FOUND`        | 404         | Resource not found                            |
| `CONFLICT`         | 409         | State conflict (e.g., session already exists) |
| `VALIDATION_ERROR` | 422         | Input validation failed                       |
| `INTERNAL_ERROR`   | 500         | Unexpected server error                       |

## Correlation IDs

Every request receives a correlation ID in the response header:

```
X-Correlation-Id: <uuid>
```

Pass `X-Correlation-Id` or `X-Request-Id` in the request to use your own ID (useful for distributed tracing).

## Pagination

Paginated endpoints accept:

- `?page=1` — 1-indexed page number
- `?limit=20` — results per page (max 100)

Response includes:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

## Idempotency

Endpoints that create resources and must be safe to retry accept an `Idempotency-Key` header. If a request with the same key is replayed, the original response is returned without side effects.

## Endpoints

### Health

#### GET /api/v1/health

**Public.** Returns application and service status.

**Response 200 — Healthy:**

```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": "2026-01-15T10:00:00.000Z",
  "services": {
    "database": "connected"
  }
}
```

**Response 503 — Degraded:**

```json
{
  "status": "degraded",
  "version": "0.1.0",
  "timestamp": "2026-01-15T10:00:00.000Z",
  "services": {
    "database": "disconnected"
  }
}
```

---

_The following endpoints are planned and will be documented as each stage is implemented._

### Users (Stage 1)

- `GET /api/v1/me` — Get the authenticated user's profile
- `PATCH /api/v1/me` — Update profile

### Learning Paths (Stage 2)

- `GET /api/v1/learning-paths` — List available learning paths
- `GET /api/v1/learning-paths/{id}` — Get a learning path with modules and skills

### Placement Tests (Stage 2)

- `POST /api/v1/placement-tests` — Start a placement test

### Daily Sessions (Stage 3)

- `GET /api/v1/daily-sessions/current` — Get today's session (or null)
- `POST /api/v1/daily-sessions` — Create today's session
- `GET /api/v1/daily-sessions/{id}` — Get a session with questions
- `POST /api/v1/daily-sessions/{id}/answers` — Submit an answer
- `POST /api/v1/daily-sessions/{id}/complete` — Complete the session

### Progress (Stage 5)

- `GET /api/v1/progress` — Skill mastery overview
- `GET /api/v1/stats` — XP, level, streak statistics
- `GET /api/v1/history` — Completed session history

### Administration (Stage 2+)

- `GET /api/v1/admin/questions` — List questions
- `POST /api/v1/admin/questions` — Create a question
- `PATCH /api/v1/admin/questions/{id}` — Update a question

## How Route Handlers Call Use Cases

```
Route Handler
  1. resolveCorrelationId(headers)
  2. parseInput(schema, body)       ← Zod validation
  3. resolveIdentity(request)       ← Auth check
  4. use case = new MyUseCase(deps) ← Dependency injection
  5. result = await use case.execute(input)
  6. return NextResponse.json(result)
  catch AppError → toErrorResponse(err, path, correlationId)
```
