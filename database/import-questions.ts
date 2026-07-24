import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { skills, questions, questionVersions, questionOptions } from "./schema";

// ── CLI args ──

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: npx tsx database/import-questions.ts <path-to-json>");
  console.error("Example: npx tsx database/import-questions.ts questions.json");
  process.exit(1);
}

const url = process.env["DIRECT_DATABASE_URL"];
if (!url) throw new Error("DIRECT_DATABASE_URL is required in .env");

const client = postgres(url, { max: 1 });
const db = drizzle(client);

// ── Types & validation ──

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "EXPERT"] as const;
const REASONING_LEVELS = ["RECOGNIZE", "APPLY", "ANALYZE", "COMBINE"] as const;
const QUESTION_TYPES = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "CODE_OUTPUT",
  "BUG_IDENTIFICATION",
  "ORDERING",
  "CODE_COMPLETION",
  "ARCHITECTURE_SCENARIO",
] as const;

interface QuestionInput {
  slug: string;
  skill: { code: string; name: string; category: string };
  difficulty: (typeof DIFFICULTIES)[number];
  reasoningLevel: (typeof REASONING_LEVELS)[number];
  questionType?: (typeof QUESTION_TYPES)[number];
  prompt: string;
  code?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function validate(data: unknown): QuestionInput[] {
  if (!Array.isArray(data)) {
    throw new Error("JSON root must be an array of questions");
  }

  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const q = data[i];
    const prefix = `questions[${i}]`;

    if (!q || typeof q !== "object") {
      errors.push(`${prefix}: must be an object`);
      continue;
    }

    if (typeof q.slug !== "string" || !q.slug) errors.push(`${prefix}.slug: required string`);
    if (!q.skill || typeof q.skill !== "object") {
      errors.push(`${prefix}.skill: required object with { code, name, category }`);
    } else {
      if (typeof q.skill.code !== "string" || !q.skill.code)
        errors.push(`${prefix}.skill.code: required string`);
      if (typeof q.skill.name !== "string" || !q.skill.name)
        errors.push(`${prefix}.skill.name: required string`);
      if (typeof q.skill.category !== "string" || !q.skill.category)
        errors.push(`${prefix}.skill.category: required string`);
    }
    if (!DIFFICULTIES.includes(q.difficulty))
      errors.push(`${prefix}.difficulty: must be one of ${DIFFICULTIES.join(", ")}`);
    if (!REASONING_LEVELS.includes(q.reasoningLevel))
      errors.push(`${prefix}.reasoningLevel: must be one of ${REASONING_LEVELS.join(", ")}`);
    if (q.questionType !== undefined && !QUESTION_TYPES.includes(q.questionType))
      errors.push(`${prefix}.questionType: must be one of ${QUESTION_TYPES.join(", ")}`);
    if (typeof q.prompt !== "string" || !q.prompt) errors.push(`${prefix}.prompt: required string`);
    if (q.code !== undefined && typeof q.code !== "string")
      errors.push(`${prefix}.code: must be a string if provided`);
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6)
      errors.push(`${prefix}.options: required array with 2-6 items`);
    else if (q.options.some((o: unknown) => typeof o !== "string"))
      errors.push(`${prefix}.options: all items must be strings`);
    if (typeof q.correctIndex !== "number" || q.correctIndex < 0)
      errors.push(`${prefix}.correctIndex: required non-negative number`);
    else if (Array.isArray(q.options) && q.correctIndex >= q.options.length)
      errors.push(
        `${prefix}.correctIndex: ${q.correctIndex} is out of bounds (options has ${q.options.length} items)`,
      );
    if (typeof q.explanation !== "string" || !q.explanation)
      errors.push(`${prefix}.explanation: required string`);
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed:\n  ${errors.join("\n  ")}`);
  }

  return data as QuestionInput[];
}

// ── Import logic ──

const OPTION_KEYS = ["A", "B", "C", "D", "E", "F"];

async function importQuestions(items: QuestionInput[]) {
  console.log(`Importing ${items.length} questions...`);

  const skillCache = new Map<string, string>();
  let inserted = 0;
  let skipped = 0;

  for (const q of items) {
    const existing = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.slug, q.slug));
    if (existing.length > 0) {
      skipped++;
      continue;
    }

    let skillId = skillCache.get(q.skill.code);
    if (!skillId) {
      const existingSkill = await db
        .select({ id: skills.id })
        .from(skills)
        .where(eq(skills.code, q.skill.code));
      if (existingSkill.length > 0) {
        skillId = existingSkill[0]!.id;
      } else {
        const [newSkill] = await db
          .insert(skills)
          .values({
            code: q.skill.code,
            name: q.skill.name,
            category: q.skill.category,
          })
          .returning({ id: skills.id });
        skillId = newSkill!.id;
      }
      skillCache.set(q.skill.code, skillId);
    }

    const [question] = await db
      .insert(questions)
      .values({
        slug: q.slug,
        primarySkillId: skillId,
        questionType: q.questionType ?? "SINGLE_CHOICE",
        difficulty: q.difficulty,
        reasoningLevel: q.reasoningLevel,
        status: "PUBLISHED",
        publishedAt: new Date(),
      })
      .returning({ id: questions.id });

    const [version] = await db
      .insert(questionVersions)
      .values({
        questionId: question!.id,
        versionNumber: 1,
        prompt: q.prompt,
        content: q.code ? { code: q.code } : {},
        correctAnswer: { ids: [OPTION_KEYS[q.correctIndex]!] },
        generalExplanation: q.explanation,
      })
      .returning({ id: questionVersions.id });

    await db.insert(questionOptions).values(
      q.options.map((text, i) => ({
        questionVersionId: version!.id,
        optionKey: OPTION_KEYS[i]!,
        content: text,
        displayOrder: i + 1,
      })),
    );

    inserted++;
  }

  console.log(`Done: ${inserted} inserted, ${skipped} skipped (slug already exists)`);
}

// ── Main ──

try {
  const raw = readFileSync(resolve(filePath), "utf-8");
  const data = JSON.parse(raw);
  const validated = validate(data);
  await importQuestions(validated);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end();
}
