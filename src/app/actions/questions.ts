"use server";

import { db } from "@/lib/db";
import { skills, questions, questionVersions, questionOptions } from "@db/schema";
import { eq, and, inArray, notInArray, desc, sql } from "drizzle-orm";
import type { Question } from "@/lib/types";

export interface TrackStats {
  category: string;
  questionCount: number;
}

export async function getTrackStats(): Promise<TrackStats[]> {
  const rows = await db
    .select({
      category: skills.category,
      count: sql<number>`count(distinct ${questions.id})::int`,
    })
    .from(questions)
    .innerJoin(skills, eq(questions.primarySkillId, skills.id))
    .where(eq(questions.status, "PUBLISHED"))
    .groupBy(skills.category)
    .orderBy(skills.category);

  return rows.map((r) => ({ category: r.category, questionCount: r.count }));
}

export async function fetchQuizQuestions(
  category: string,
  count: number = 5,
  excludeSlugs: string[] = [],
): Promise<Question[]> {
  const categorySkillIds = await db
    .select({ id: skills.id })
    .from(skills)
    .where(eq(skills.category, category));

  if (categorySkillIds.length === 0) return [];

  const ids = categorySkillIds.map((s) => s.id);

  const filters = [inArray(questions.primarySkillId, ids), eq(questions.status, "PUBLISHED")];
  if (excludeSlugs.length > 0) {
    filters.push(notInArray(questions.slug, excludeSlugs));
  }

  const questionRows = await db
    .select({
      id: questions.id,
      slug: questions.slug,
    })
    .from(questions)
    .where(and(...filters))
    .orderBy(sql`RANDOM()`)
    .limit(count);

  if (questionRows.length === 0) return [];

  const result: Question[] = [];

  for (const q of questionRows) {
    const [version] = await db
      .select({
        id: questionVersions.id,
        prompt: questionVersions.prompt,
        content: questionVersions.content,
        correctAnswer: questionVersions.correctAnswer,
        explanation: questionVersions.generalExplanation,
      })
      .from(questionVersions)
      .where(eq(questionVersions.questionId, q.id))
      .orderBy(desc(questionVersions.versionNumber))
      .limit(1);

    if (!version) continue;

    const opts = await db
      .select({
        optionKey: questionOptions.optionKey,
        content: questionOptions.content,
      })
      .from(questionOptions)
      .where(eq(questionOptions.questionVersionId, version.id))
      .orderBy(questionOptions.displayOrder);

    const correctKey = (version.correctAnswer as { ids: string[] }).ids[0]!;
    const correctIndex = opts.findIndex((o) => o.optionKey === correctKey);
    const code = (version.content as { code?: string })?.code;

    result.push({
      id: q.slug,
      type: "multiple-choice",
      prompt: version.prompt,
      code: code || undefined,
      options: opts.map((o) => o.content),
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      explanation: version.explanation,
    });
  }

  return result;
}
