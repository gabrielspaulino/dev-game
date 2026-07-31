"use server";

import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function reportQuestion(
  questionSlug: string,
  reason: string,
  comment: string | null,
  userAnswer: string | null,
) {
  if (!questionSlug || !reason) return { error: "Missing required fields." };

  try {
    await getDb().execute(
      sql`INSERT INTO question_reports (question_slug, reason, comment, user_answer)
          VALUES (${questionSlug}, ${reason}, ${comment}, ${userAnswer})`,
    );
    return { error: null };
  } catch {
    return { error: "Failed to submit report." };
  }
}
