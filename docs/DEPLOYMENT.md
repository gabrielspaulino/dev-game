# Deployment Guide — DevLeap

## Architecture overview

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend | Vercel | SPA, CDN-served |
| Backend | Render | Docker container (or native Java) |
| Database & Auth | Supabase | Managed PostgreSQL + JWT auth |

## Supabase configuration

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your project URL (`https://<ref>.supabase.co`) and keys.

### 2. Collect backend credentials

From the Supabase dashboard → Settings → API:
- `SUPABASE_URL` = your project URL
- `SUPABASE_JWT_ISSUER` = `https://<ref>.supabase.co/auth/v1`
- `SUPABASE_JWT_AUDIENCE` = `authenticated`

From Settings → Database:
- `DEVLEARN_DB_URL` (or `DATABASE_URL` / `SPRING_DATASOURCE_URL`) = JDBC URL (format: `jdbc:postgresql://db.<ref>.supabase.co:5432/postgres`)
- `DATABASE_USERNAME` (or `SPRING_DATASOURCE_USERNAME`) = `postgres`
- `DATABASE_PASSWORD` (or `SPRING_DATASOURCE_PASSWORD`) = your database password

**Never commit these values.**

### 3. Collect frontend credentials

From Settings → API:
- `VITE_SUPABASE_URL` = your project URL
- `VITE_SUPABASE_ANON_KEY` = anon/public key (safe to expose in frontend)

**Never use the service role key in the frontend.**

### 4. Configure Auth providers

In Supabase → Authentication → Providers, enable Email/Password.

Set the Site URL to your production frontend domain.

Set Redirect URLs to include your production and staging domains.

## Backend deployment (Render)

### 1. Create a Render service

1. Create a new Web Service from your GitHub repository.
2. Root directory: `backend`
3. Build command: `./mvnw -B -DskipTests clean package`
4. Start command: `java -jar target/*.jar`
5. Environment: Java 21 (select in Render's environment settings)

### 2. Set environment variables in Render

```
PORT=8080
SPRING_PROFILES_ACTIVE=prod
DEVLEARN_DB_URL=jdbc:postgresql://...
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
SUPABASE_URL=...
SUPABASE_JWT_ISSUER=...
SUPABASE_JWT_AUDIENCE=authenticated
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
LOG_LEVEL=INFO
```

### 3. Health check

Render health check path: `/api/actuator/health`

### 4. Database migrations

Flyway runs automatically on application startup. No manual steps needed.

If a migration fails at startup, the application will not start — check Render logs.

### 5. Rollback strategy

To roll back a deployment:
1. Revert the Git commit with `git revert`.
2. Ensure the reverted migration is backward compatible (see `AGENTS.md` database rules).
3. Push the revert — Render auto-deploys.

Or use Render's "Deploy a specific commit" feature to pin to a known-good revision.

## Frontend deployment (Vercel)

### 1. Create a Vercel project

1. Import your GitHub repository to Vercel.
2. Root directory: `artifacts/frontend`
3. Build command: `pnpm build`
4. Output directory: `dist`
5. Install command: `pnpm install --frozen-lockfile`

### 2. Set environment variables in Vercel

```
VITE_API_BASE_URL=https://your-backend.onrender.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Configure rewrites

`artifacts/frontend/vercel.json` configures SPA routing (all paths → `/index.html`).

### 4. Preview deployments

Vercel automatically creates preview deployments for every pull request. Add preview URLs to Supabase's allowed redirect URLs.

## CORS configuration

The backend restricts CORS to `CORS_ALLOWED_ORIGINS`. In production this must be set to the exact Vercel deployment URL. In development it is `http://localhost:5173`.

## Health checks

| Endpoint | Description |
|----------|-------------|
| `GET /api/healthz` | Simple up/down check |
| `GET /api/actuator/health` | Spring Actuator health (includes DB connectivity) |
| `GET /api/actuator/info` | Application info (version, build) |

## Database migrations

- Flyway applies all pending migrations automatically on startup.
- Migrations in `backend/src/main/resources/db/migration/` are versioned: `V{n}__{description}.sql`.
- Never edit a migration that has been applied in any environment.
- Write new migrations to correct or extend the schema.
- For zero-downtime deployments: apply additive migrations (add columns/tables) before deploying code that uses them.

## Environment differences

| Aspect | Local | Staging | Production |
|--------|-------|---------|-----------|
| Database | Docker Compose | Supabase (separate project) | Supabase |
| Auth | Fake JWT (dev profile) | Supabase | Supabase |
| CORS | localhost | staging domain | production domain |
| Logs | DEBUG | INFO | INFO |
| Seed data | Yes (`seed` profile) | No | No |

## Production checklist

Before going live:
- [ ] `SPRING_PROFILES_ACTIVE=prod` is set (never `dev` or `seed`).
- [ ] All required environment variables are set and validated.
- [ ] CORS is restricted to the production frontend domain only.
- [ ] Database password is strong and rotated from default.
- [ ] Supabase service role key is NOT in any frontend environment variable.
- [ ] Health check endpoint responds correctly.
- [ ] All Flyway migrations applied successfully.
- [ ] Backend logs show no startup errors.
- [ ] Frontend loads and can communicate with the backend.
- [ ] Login flow works end-to-end.
- [ ] Swagger UI is not exposed in production (configure in prod profile).
