/**
 * Database client singleton.
 *
 * Reuses the Drizzle client across requests within the same warm function
 * instance to avoid creating a new connection on every invocation.
 *
 * Architecture Decision: Drizzle ORM with postgres.js driver.
 * See: docs/adr/0005-database-access-and-migrations.md
 *
 * Connection notes:
 * - Uses the pooled DATABASE_URL at runtime (Supabase pgBouncer).
 * - Uses DIRECT_DATABASE_URL only for migrations (drizzle-kit).
 * - max: 1 is appropriate for serverless environments where many
 *   function instances may run concurrently. Increase only with care.
 */

import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../../database/schema";

const connectionString = process.env["DATABASE_URL"];

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required.");
}

// Singleton pattern: reuse the client within a warm serverless instance.
// In development, Next.js hot-reloads may create multiple instances, but
// the connection limit prevents runaway connections.
const globalForDb = globalThis as unknown as {
  _devgameDb: ReturnType<typeof drizzle> | undefined;
  _devgamePg: ReturnType<typeof postgres> | undefined;
};

if (!globalForDb._devgamePg) {
  globalForDb._devgamePg = postgres(connectionString, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

if (!globalForDb._devgameDb) {
  globalForDb._devgameDb = drizzle(globalForDb._devgamePg, { schema });
}

export const db = globalForDb._devgameDb;
export type Database = typeof db;
