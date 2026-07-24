"use client";

import type { UserProgress, DifficultyTier, CategoryDifficultyStats } from "./types";

const STORAGE_KEY = "devgame_progress";
const MAX_HEARTS = 5;
const TIER_SIZE = 17;
const ADVANCE_THRESHOLD = 0.8;

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

export function completeQuiz(
  progress: UserProgress,
  xpEarned: number,
  category: string,
  slugs: string[],
  difficulty: DifficultyTier,
  correctCount: number,
): UserProgress {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  const newXp = progress.xp + xpEarned;

  let newStreak = progress.streak;
  if (progress.lastPlayedDate === yesterday) {
    newStreak = progress.streak + 1;
  } else if (progress.lastPlayedDate !== today) {
    newStreak = 1;
  }

  const existingSlugs = progress.answeredSlugs[category] ?? [];
  const mergedSlugs = [...new Set([...existingSlugs, ...slugs])];

  const quizzesToday =
    progress.dailyQuizCompletedDate === today ? progress.quizzesCompletedToday + 1 : 1;

  const newQuestions = mergedSlugs.length - existingSlugs.length;
  const questionsToday =
    progress.dailyQuizCompletedDate === today
      ? progress.questionsAnsweredToday + newQuestions
      : newQuestions;

  const prevStats = progress.difficultyStats[category] ?? defaultCategoryStats();
  const tierStats = prevStats[difficulty];
  const updatedCategoryStats: CategoryDifficultyStats = {
    ...prevStats,
    [difficulty]: {
      answered: tierStats.answered + slugs.length,
      correct: tierStats.correct + correctCount,
    },
  };

  const updated: UserProgress = {
    ...progress,
    xp: newXp,
    streak: newStreak,
    lastPlayedDate: today,
    dailyQuizCompletedDate: today,
    quizzesCompletedToday: quizzesToday,
    questionsAnsweredToday: questionsToday,
    answeredSlugs: { ...progress.answeredSlugs, [category]: mergedSlugs },
    difficultyStats: { ...progress.difficultyStats, [category]: updatedCategoryStats },
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

export function getCurrentDifficulty(progress: UserProgress, category: string): DifficultyTier {
  const stats = progress.difficultyStats[category] ?? defaultCategoryStats();
  const easy = stats.EASY;
  const medium = stats.MEDIUM;

  if (
    easy.answered >= TIER_SIZE &&
    easy.answered > 0 &&
    easy.correct / easy.answered >= ADVANCE_THRESHOLD
  ) {
    if (
      medium.answered >= TIER_SIZE &&
      medium.answered > 0 &&
      medium.correct / medium.answered >= ADVANCE_THRESHOLD
    ) {
      return "HARD";
    }
    return "MEDIUM";
  }
  return "EASY";
}

export function getAnsweredSlugs(progress: UserProgress, category: string): string[] {
  return progress.answeredSlugs[category] ?? [];
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
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  const isAlreadyDone = progress.completedLessons[lessonId];
  const newXp = progress.xp + (isAlreadyDone ? 0 : xpEarned);

  // Streak logic
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
  // First lesson of a non-first topic: need to complete all lessons of previous topic handled by caller
  return true;
}

export { MAX_HEARTS };
