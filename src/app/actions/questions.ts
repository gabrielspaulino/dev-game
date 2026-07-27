"use server";

import { getDb } from "@/lib/db";
import { skills, questions, questionVersions, questionOptions } from "@db/schema";
import { eq, and, inArray, notInArray, sql } from "drizzle-orm";
import type { Question, DifficultyTier } from "@/lib/types";

export interface SkillStats {
  skillCode: string;
  skillName: string;
  category: string;
  questionCount: number;
}

export async function getSkillStats(): Promise<SkillStats[]> {
  const rows = await getDb()
    .select({
      skillCode: skills.code,
      skillName: skills.name,
      category: skills.category,
      count: sql<number>`count(${questions.id})::int`,
    })
    .from(skills)
    .leftJoin(
      questions,
      and(eq(questions.primarySkillId, skills.id), eq(questions.status, "PUBLISHED")),
    )
    .groupBy(skills.code, skills.name, skills.category)
    .orderBy(skills.category, skills.code);

  return rows.map((r) => ({
    skillCode: r.skillCode,
    skillName: r.skillName,
    category: r.category,
    questionCount: r.count,
  }));
}

export async function fetchQuizQuestions(
  skillCode: string,
  count: number = 10,
  excludeSlugs: string[] = [],
  difficulty?: DifficultyTier,
): Promise<Question[]> {
  const db = getDb();

  const skillRow = await db
    .select({ id: skills.id })
    .from(skills)
    .where(eq(skills.code, skillCode));

  if (skillRow.length === 0) return [];

  const filters = [
    eq(questions.primarySkillId, skillRow[0]!.id),
    eq(questions.status, "PUBLISHED"),
  ];
  if (difficulty) {
    filters.push(eq(questions.difficulty, difficulty));
  }
  if (excludeSlugs.length > 0) {
    filters.push(notInArray(questions.slug, excludeSlugs));
  }

  const questionRows = await db
    .select({ id: questions.id, slug: questions.slug })
    .from(questions)
    .where(and(...filters))
    .orderBy(sql`RANDOM()`)
    .limit(count);

  if (questionRows.length === 0) return [];

  const questionIds = questionRows.map((q) => q.id);

  const allVersions = await db
    .select({
      questionId: questionVersions.questionId,
      id: questionVersions.id,
      prompt: questionVersions.prompt,
      content: questionVersions.content,
      correctAnswer: questionVersions.correctAnswer,
      explanation: questionVersions.generalExplanation,
      versionNumber: questionVersions.versionNumber,
    })
    .from(questionVersions)
    .where(inArray(questionVersions.questionId, questionIds));

  const latestVersionByQuestion = new Map<string, (typeof allVersions)[number]>();
  for (const v of allVersions) {
    const existing = latestVersionByQuestion.get(v.questionId);
    if (!existing || v.versionNumber > existing.versionNumber) {
      latestVersionByQuestion.set(v.questionId, v);
    }
  }

  const versionIds = [...latestVersionByQuestion.values()].map((v) => v.id);

  const allOptions =
    versionIds.length > 0
      ? await db
          .select({
            questionVersionId: questionOptions.questionVersionId,
            optionKey: questionOptions.optionKey,
            content: questionOptions.content,
            displayOrder: questionOptions.displayOrder,
          })
          .from(questionOptions)
          .where(inArray(questionOptions.questionVersionId, versionIds))
          .orderBy(questionOptions.displayOrder)
      : [];

  const optionsByVersion = new Map<string, typeof allOptions>();
  for (const opt of allOptions) {
    const list = optionsByVersion.get(opt.questionVersionId) ?? [];
    list.push(opt);
    optionsByVersion.set(opt.questionVersionId, list);
  }

  const result: Question[] = [];

  for (const q of questionRows) {
    const version = latestVersionByQuestion.get(q.id);
    if (!version) continue;

    const opts = optionsByVersion.get(version.id) ?? [];
    const code = (version.content as { code?: string })?.code;
    const answer = version.correctAnswer as { ids?: string[]; text?: string[] };

    if (opts.length === 0 && answer.text) {
      result.push({
        id: q.slug,
        type: "typing",
        prompt: version.prompt,
        code: code || undefined,
        acceptedAnswers: answer.text,
        explanation: version.explanation,
      });
    } else {
      const correctKey = answer.ids?.[0] ?? "";
      const correctIndex = opts.findIndex((o) => o.optionKey === correctKey);

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
  }

  return result;
}
