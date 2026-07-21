/**
 * Development seed script.
 *
 * Run with: npm run db:seed
 *
 * This script inserts minimal data to demonstrate the application flow.
 * Stage 0: empty — real seed data is added in Stage 2 (Learning Catalog).
 */

import "dotenv/config";

async function seed(): Promise<void> {
  console.log("🌱 Running seed script (Stage 0 — no data yet)...");
  console.log("✅ Seed complete.");
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
