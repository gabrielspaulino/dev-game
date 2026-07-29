"use client";

import type { UserProgress, DifficultyTier, CategoryDifficultyStats } from "./types";
import { SKILL_ORDER } from "./track-styles";

const STORAGE_KEY = "devgame_progress";
const MAX_HEARTS = 5;
export const QUESTIONS_PER_SLOT = 7;
const DIFFICULTIES: DifficultyTier[] = ["EASY", "MEDIUM", "HARD"];

function localToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function localYesterday(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  streak: 0,
  hearts: MAX_HEARTS,
  lastPlayedDate: null,
  completedLessons: {},
  selectedTopicId: null,
  dailyQuizCompletedDate: null,
  answeredSlugs: {},
  quizzesCompletedToday: 0,
  questionsAnsweredToday: 0,
  difficultyStats: {},
  slotProgress: {},
};

export function loadProgress(): UserProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as UserProgress;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function selectTopic(progress: UserProgress, topicId: string): UserProgress {
  const updated: UserProgress = {
    ...progress,
    selectedTopicId: topicId,
  };
  saveProgress(updated);
  return updated;
}

function slotKey(skillCode: string, difficulty: DifficultyTier): string {
  return `${skillCode}:${difficulty}`;
}

export interface CurrentSlot {
  skillCode: string;
  difficulty: DifficultyTier;
}

export function getCurrentSlot(progress: UserProgress, category: string): CurrentSlot | null {
  const skills = SKILL_ORDER[category];
  if (!skills || skills.length === 0) return null;

  for (const difficulty of DIFFICULTIES) {
    for (const skill of skills) {
      const count = progress.slotProgress[slotKey(skill, difficulty)] ?? 0;
      if (count < QUESTIONS_PER_SLOT) {
        return { skillCode: skill, difficulty };
      }
    }
  }

  return { skillCode: skills[0]!, difficulty: "HARD" };
}

export function getCategoryProgress(progress: UserProgress, category: string): number {
  const skills = SKILL_ORDER[category];
  if (!skills || skills.length === 0) return 0;

  let total = 0;
  for (const difficulty of DIFFICULTIES) {
    for (const skill of skills) {
      total += Math.min(QUESTIONS_PER_SLOT, progress.slotProgress[slotKey(skill, difficulty)] ?? 0);
    }
  }
  return total;
}

export function getCategoryTotal(category: string): number {
  const skills = SKILL_ORDER[category];
  if (!skills) return 0;
  return skills.length * DIFFICULTIES.length * QUESTIONS_PER_SLOT;
}

export function completeQuiz(
  progress: UserProgress,
  xpEarned: number,
  skillCode: string,
  slugs: string[],
  difficulty: DifficultyTier,
  correctCount: number,
): UserProgress {
  const today = localToday();
  const yesterday = localYesterday();

  const newXp = progress.xp + xpEarned;

  let newStreak = progress.streak;
  if (progress.lastPlayedDate === yesterday) {
    newStreak = progress.streak + 1;
  } else if (progress.lastPlayedDate !== today) {
    newStreak = 1;
  }

  const existingSlugs = progress.answeredSlugs[skillCode] ?? [];
  const mergedSlugs = [...new Set([...existingSlugs, ...slugs])];

  const quizzesToday =
    progress.dailyQuizCompletedDate === today ? progress.quizzesCompletedToday + 1 : 1;

  const newQuestions = mergedSlugs.length - existingSlugs.length;
  const questionsToday =
    progress.dailyQuizCompletedDate === today
      ? progress.questionsAnsweredToday + newQuestions
      : newQuestions;

  const prevStats = progress.difficultyStats[skillCode] ?? defaultCategoryStats();
  const tierStats = prevStats[difficulty];
  const updatedCategoryStats: CategoryDifficultyStats = {
    ...prevStats,
    [difficulty]: {
      answered: tierStats.answered + slugs.length,
      correct: tierStats.correct + correctCount,
    },
  };

  const key = slotKey(skillCode, difficulty);
  const prevSlot = progress.slotProgress[key] ?? 0;

  const updated: UserProgress = {
    ...progress,
    xp: newXp,
    streak: newStreak,
    lastPlayedDate: today,
    dailyQuizCompletedDate: today,
    quizzesCompletedToday: quizzesToday,
    questionsAnsweredToday: questionsToday,
    answeredSlugs: { ...progress.answeredSlugs, [skillCode]: mergedSlugs },
    difficultyStats: { ...progress.difficultyStats, [skillCode]: updatedCategoryStats },
    slotProgress: { ...progress.slotProgress, [key]: prevSlot + slugs.length },
  };
  saveProgress(updated);
  return updated;
}

function defaultCategoryStats(): CategoryDifficultyStats {
  return {
    EASY: { answered: 0, correct: 0 },
    MEDIUM: { answered: 0, correct: 0 },
    HARD: { answered: 0, correct: 0 },
  };
}

export function getAnsweredSlugs(progress: UserProgress, skillCode: string): string[] {
  return progress.answeredSlugs[skillCode] ?? [];
}

export function getStreakEncouragement(streak: number): string {
  if (streak === 0) return "Start your daily commit streak today.";
  if (streak === 1) return "Day 1 shipped. Keep the momentum going.";
  if (streak < 3) return `${streak}-day streak. Building a solid habit.`;
  if (streak < 7) return `${streak}-day streak. You're on fire. Keep pushing.`;
  if (streak < 30) return `${streak} days of continuous commits. Unstoppable.`;
  return `Legendary streak: ${streak} days. You're a machine.`;
}

export function completeLesson(
  progress: UserProgress,
  lessonId: string,
  xpEarned: number,
  heartsLost: number,
): UserProgress {
  const today = localToday();
  const yesterday = localYesterday();

  const isAlreadyDone = progress.completedLessons[lessonId];
  const newXp = progress.xp + (isAlreadyDone ? 0 : xpEarned);

  let newStreak = progress.streak;
  if (progress.lastPlayedDate === yesterday) {
    newStreak = progress.streak + 1;
  } else if (progress.lastPlayedDate !== today) {
    newStreak = 1;
  }

  const newHearts = Math.max(0, Math.min(MAX_HEARTS, progress.hearts - heartsLost));

  const updated: UserProgress = {
    ...progress,
    xp: newXp,
    streak: newStreak,
    hearts: newHearts,
    lastPlayedDate: today,
    completedLessons: { ...progress.completedLessons, [lessonId]: true },
  };

  saveProgress(updated);
  return updated;
}

export function loseHeart(progress: UserProgress): UserProgress {
  const updated = { ...progress, hearts: Math.max(0, progress.hearts - 1) };
  saveProgress(updated);
  return updated;
}

export function isLessonUnlocked(
  topicIndex: number,
  lessonIndex: number,
  _topicId: string,
  lessons: { id: string }[],
  progress: UserProgress,
): boolean {
  if (topicIndex === 0 && lessonIndex === 0) return true;
  if (lessonIndex > 0) {
    return !!progress.completedLessons[lessons[lessonIndex - 1]!.id];
  }
  return true;
}

export { MAX_HEARTS };
