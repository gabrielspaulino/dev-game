"use client";

import type { UserProgress } from "./types";

const STORAGE_KEY = "devgame_progress";
const MAX_HEARTS = 5;

export const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  streak: 0,
  hearts: MAX_HEARTS,
  lastPlayedDate: null,
  completedLessons: {},
  selectedTopicId: null,
  dailyQuizCompletedDate: null,
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

export function completeDailyQuiz(progress: UserProgress, xpEarned: number): UserProgress {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  const isAlreadyDoneToday = progress.dailyQuizCompletedDate === today;
  const newXp = progress.xp + (isAlreadyDoneToday ? 0 : xpEarned);

  let newStreak = progress.streak;
  if (!isAlreadyDoneToday) {
    if (progress.lastPlayedDate === yesterday) {
      newStreak = progress.streak + 1;
    } else if (progress.lastPlayedDate !== today) {
      newStreak = 1;
    }
  }

  const updated: UserProgress = {
    ...progress,
    xp: newXp,
    streak: newStreak,
    lastPlayedDate: today,
    dailyQuizCompletedDate: today,
  };
  saveProgress(updated);
  return updated;
}

export function getStreakEncouragement(streak: number): string {
  if (streak === 0) return "Start your daily learning streak today! 🚀";
  if (streak === 1) return "Day 1 complete! Keep the momentum going tomorrow! 🔥";
  if (streak < 3) return `${streak}-day streak! You're building a powerful habit! 💪`;
  if (streak < 7) return `${streak}-day streak! You're on fire! 🔥 Keep learning!`;
  if (streak < 30) return `Unstoppable! ${streak} days of continuous learning! 🏆`;
  return `Legendary Engineer! ${streak}-day streak! ⚡`;
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
