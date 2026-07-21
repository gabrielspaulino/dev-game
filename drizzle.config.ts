import type { Config } from "drizzle-kit";

// Migrations use the DIRECT connection (not pooled) to avoid
// pgBouncer transaction-mode limitations during DDL.
const directUrl = process.env["DIRECT_DATABASE_URL"];

if (!directUrl) {
  throw new Error("DIRECT_DATABASE_URL is required to run migrations");
}

const config: Config = {
  schema: "./database/schema/index.ts",
  out: "./database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: directUrl,
  },
  verbose: true,
  strict: true,
};

export default config;
