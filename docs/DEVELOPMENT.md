# Development Guide — DevLeap

## Local requirements

| Tool | Version | Notes |
|------|---------|-------|
| Java | 21 | OpenJDK or any distribution |
| Maven | 3.9+ | Or use `./mvnw` (wrapper downloads Maven automatically) |
| Node.js | 22 LTS | |
| pnpm | 9+ | `npm install -g pnpm` |
| Docker | 24+ | For local PostgreSQL |
| Docker Compose | 2.x | Included with Docker Desktop |

## Configuration

### Backend (`backend/.env.example` → `backend/.env`)

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```bash
PORT=8080
SPRING_PROFILES_ACTIVE=dev
DATABASE_URL=jdbc:postgresql://localhost:5432/devlearn_dev
DATABASE_USERNAME=devlearn
DATABASE_PASSWORD=devlearn_local_dev_only
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_ISSUER=https://your-project.supabase.co/auth/v1
SUPABASE_JWT_AUDIENCE=authenticated
CORS_ALLOWED_ORIGINS=http://localhost:5173
LOG_LEVEL=DEBUG
```

### Frontend (`artifacts/frontend/.env.example` → `artifacts/frontend/.env.local`)

```bash
cp artifacts/frontend/.env.example artifacts/frontend/.env.local
```

Edit `artifacts/frontend/.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Local database

Start PostgreSQL with Docker Compose:

```bash
docker-compose up -d

# Check it's running
docker-compose ps

# Stop
docker-compose down

# Stop and remove data
docker-compose down -v
```

Database credentials (local dev only):
- Host: `localhost:5432`
- Database: `devlearn_dev`
- Username: `devlearn`
- Password: `devlearn_local_dev_only`

## Commands

### Backend

```bash
cd backend

# Start development server (auto-applies Flyway migrations on startup)
./mvnw spring-boot:run

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev,seed

# Compile only
./mvnw compile

# Run unit tests
./mvnw test

# Run all tests including integration (requires Docker)
./mvnw verify

# Run specific test class
./mvnw test -Dtest=SessionServiceTest

# Check migration status
./mvnw flyway:info

# Apply migrations manually
./mvnw flyway:migrate

# Clean and rebuild
./mvnw clean install

# Build Docker image
docker build -t devlearn-backend ./backend
```

### Frontend

```bash
cd artifacts/frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Type check
pnpm typecheck

# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run end-to-end tests
pnpm test:e2e

# Lint
pnpm lint

# Build for production
pnpm build
```

### Codegen (update TypeScript API types from OpenAPI spec)

```bash
# After changing lib/api-spec/openapi.yaml
pnpm --filter @workspace/api-spec run codegen
```

## Environment profiles

| Profile | Purpose |
|---------|---------|
| `dev` | Local development — verbose logging, CORS open to localhost |
| `test` | Integration tests — Testcontainers PostgreSQL |
| `prod` | Production — minimal logging, strict CORS |
| `seed` | Dev only — loads sample data on startup |

Never enable `seed` or `dev` profiles in production.

## Swagger UI (local)

After starting the backend:

```
http://localhost:8080/api/swagger-ui.html
http://localhost:8080/api/v3/api-docs
```

## Coding standards

### Backend (Java)

- Follow standard Java naming conventions.
- Use records for DTOs when fields are fixed and immutable.
- Use `Optional<T>` consistently — never return `null` from application/domain methods.
- Maximum method length: ~30 lines. Extract if longer.
- No business logic in controllers. Controllers map HTTP ↔ use case DTOs only.
- Annotate JPA entities with `@JpaEntity` naming conventions (suffix `JpaEntity`).
- Prefer constructor injection (`@RequiredArgsConstructor` via Lombok).
- Document all non-obvious decisions with inline comments.

### Frontend (TypeScript)

- Strict mode — no `any`.
- Hooks in `src/hooks/`, pages in `src/pages/`, components in `src/components/`.
- API calls in `src/lib/api/` using TanStack Query hooks.
- Forms via React Hook Form + Zod validation.
- No fetch/axios calls directly inside React components.

## Debugging

### Backend

Add breakpoints in IntelliJ IDEA:
1. Run → Edit Configurations → Maven → `spring-boot:run`.
2. Set VM args: `-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005`.
3. Attach debugger on port 5005.

Or use the built-in JVM debugging:
```bash
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
```

### Frontend

Use browser DevTools. TanStack Query DevTools is included in development mode.

## Development workflow

1. Pull latest from `main`.
2. Create a feature branch: `git checkout -b feat/your-feature`.
3. Follow the mandatory change process in `AGENTS.md`.
4. Run tests before committing.
5. Open a pull request — CI must pass.
