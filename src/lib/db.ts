import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

type Db = ReturnType<typeof drizzle>;

const globalForDb = globalThis as unknown as {
  _db: Db | undefined;
};

export function getDb(): Db {
  if (globalForDb._db) return globalForDb._db;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const client = postgres(url, { max: 5 });
  const instance = drizzle(client);

  if (process.env.NODE_ENV !== "production") {
    globalForDb._db = instance;
  }

  return instance;
}
