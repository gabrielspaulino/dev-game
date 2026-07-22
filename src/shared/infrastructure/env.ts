/**
 * Environment variable validation.
 *
 * This module validates and exports all environment variables used by the
 * application. It fails at startup when mandatory server-side variables are
 * missing so the problem is surfaced immediately rather than at request time.
 *
 * Rules:
 * - Server-only variables must never be prefixed with NEXT_PUBLIC_.
 * - Browser-safe variables must use NEXT_PUBLIC_.
 * - This file must only be imported in server-side code.
 */

import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  // Node
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database (optional — app runs without a DB, only DB-dependent features degrade)
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid PostgreSQL URL")
    .optional(),
  DIRECT_DATABASE_URL: z
    .string()
    .url("DIRECT_DATABASE_URL must be a valid PostgreSQL URL")
    .optional(),

  // Supabase (server-only)
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL").optional(),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY must not be empty")
    .optional(),
  SUPABASE_JWT_ISSUER: z.string().optional(),
  SUPABASE_JWT_AUDIENCE: z.string().optional(),

  // Auth
  AUTH_REDIRECT_URL: z.string().url().optional(),

  // Logging
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),

  // Feature flags
  ENABLE_LOCAL_AUTH: z
    .string()
    .transform((v) => v === "true")
    .default("false"),
  FEATURE_ADMIN_PANEL: z
    .string()
    .transform((v) => v !== "false")
    .default("true"),
});

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

function validateEnv() {
  const serverResult = serverEnvSchema.safeParse(process.env);

  if (!serverResult.success) {
    const formatted = serverResult.error.errors
      .map((e) => `  ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(
      `❌ Invalid environment variables:\n${formatted}\n\nFix your .env.local file.`,
    );
  }

  const env = serverResult.data;

  // Safety check: local auth must never be enabled in production
  if (env.NODE_ENV === "production" && env.ENABLE_LOCAL_AUTH) {
    throw new Error(
      "❌ ENABLE_LOCAL_AUTH=true is not allowed in production. " +
        "This is a development-only feature.",
    );
  }

  return env;
}

// Validate once at module load time. In Next.js this runs during the
// build and at server startup for serverless functions.
export const env = validateEnv();

// Re-export the client env schema for use in client components
export type ClientEnv = z.infer<typeof clientEnvSchema>;
