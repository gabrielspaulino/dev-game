"use client";

import { useEffect, useState, useCallback } from "react";
import type { UserProgress, Question, DifficultyTier } from "@/lib/types";
import type { TrackStyle } from "@/lib/track-styles";
import type { SkillStats } from "@/app/actions/questions";
import { getTrackStyle } from "@/lib/track-styles";
import {
  loadProgress,
  completeQuiz,
  getAnsweredSlugs,
  selectTopic,
  getCurrentSlot,
  DEFAULT_PROGRESS,
  isLevelComplete,
  isCategoryComplete,
  getLevelAccuracy,
  getSkillAccuracyForLevel,
  getImprovementAreas,
  getBlockingLevel,
  restartLevel,
  restartCategory,
} from "@/lib/progress";
import { fetchQuizQuestions } from "@/app/actions/questions";
import { useAuth } from "@/components/AuthProvider";
import { RoadmapScreen } from "./RoadmapScreen";
import { DailyQuiz } from "./DailyQuiz";
import { QuizResultScreen } from "./QuizResultScreen";
import { LevelCompleteScreen } from "./LevelCompleteScreen";

type Screen = "loading" | "roadmap" | "quiz" | "result" | "level-complete" | "error";

const QUIZ_SIZE = 10;

interface QuizState {
  questions: Question[];
  skillCode: string;
  trackStyle: TrackStyle;
  difficulty: DifficultyTier;
  category: string;
}

interface QuizResult {
  xpEarned: number;
  correctCount: number;
  totalQuestions: number;
  trackStyle: TrackStyle;
  difficulty: DifficultyTier;
}

interface LevelCompleteState {
  category: string;
  difficulty: DifficultyTier;
  trackStyle: TrackStyle;
}

interface HomeContentProps {
  skillStats: SkillStats[];
}

export function HomeContent({ skillStats }: HomeContentProps) {
  const { progress: cachedProgress, syncProgress } = useAuth();
  const [screen, setScreen] = useState<Screen>("loading");
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [levelComplete, setLevelComplete] = useState<LevelCompleteState | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (cachedProgress) {
      setProgress(cachedProgress);
      setScreen("roadmap");
    }
  }, [cachedProgress]);

  const showLevelComplete = useCallback((category: string, difficulty: DifficultyTier) => {
    setLevelComplete({
      category,
      difficulty,
      trackStyle: getTrackStyle(category),
    });
    setScreen("level-complete");
  }, []);

  const handleStartQuiz = useCallback(
    async (category: string) => {
      setIsLoadingQuiz(true);
      setErrorMsg(null);
      try {
        const current = loadProgress();
        const updated = selectTopic(current, category);
        setProgress(updated);
        syncProgress();

        if (isCategoryComplete(updated, category)) {
          setIsLoadingQuiz(false);
          showLevelComplete(category, "HARD");
          return;
        }

        const blockedAt = getBlockingLevel(updated, category);
        if (blockedAt) {
          setIsLoadingQuiz(false);
          showLevelComplete(category, blockedAt);
          return;
        }

        const slot = getCurrentSlot(updated, category);
        if (!slot) {
          setIsLoadingQuiz(false);
          return;
        }

        const { skillCode, difficulty } = slot;
        const excludeSlugs = getAnsweredSlugs(updated, skillCode);
        let questions = await fetchQuizQuestions(skillCode, QUIZ_SIZE, excludeSlugs, difficulty);

        if (questions.length === 0) {
          questions = await fetchQuizQuestions(skillCode, QUIZ_SIZE, [], difficulty);
        }

        if (questions.length === 0) {
          setIsLoadingQuiz(false);
          return;
        }

        const trackStyle = getTrackStyle(category);
        setQuiz({ questions, skillCode, trackStyle, difficulty, category });
        setScreen("quiz");
      } catch {
        setErrorMsg("Could not load questions. Check your connection and try again.");
        setScreen("error");
      } finally {
        setIsLoadingQuiz(false);
      }
    },
    [syncProgress, showLevelComplete],
  );

  const handleQuizComplete = useCallback(
    (xpEarned: number, correctCount: number, totalQuestions: number) => {
      if (!quiz) return;
      const slugs = quiz.questions.map((q) => q.id);
      const current = loadProgress();

      const wasLevelDone = isLevelComplete(current, quiz.category, quiz.difficulty);

      const updated = completeQuiz(
        current,
        xpEarned,
        quiz.skillCode,
        slugs,
        quiz.difficulty,
        correctCount,
      );
      setProgress(updated);
      syncProgress();

      const isLevelDoneNow = isLevelComplete(updated, quiz.category, quiz.difficulty);

      if (!wasLevelDone && isLevelDoneNow) {
        showLevelComplete(quiz.category, quiz.difficulty);
        return;
      }

      setQuizResult({
        xpEarned,
        correctCount,
        totalQuestions,
        trackStyle: quiz.trackStyle,
        difficulty: quiz.difficulty,
      });
      setScreen("result");
    },
    [quiz, syncProgress, showLevelComplete],
  );

  const handleResultContinue = useCallback(() => {
    setQuiz(null);
    setQuizResult(null);
    setScreen("roadmap");
  }, []);

  const handleLevelAdvance = useCallback(() => {
    setLevelComplete(null);
    setScreen("roadmap");
  }, []);

  const handleLevelRestart = useCallback(() => {
    if (!levelComplete) return;
    const current = loadProgress();

    let updated: UserProgress;
    if (
      levelComplete.difficulty === "HARD" &&
      isCategoryComplete(current, levelComplete.category)
    ) {
      updated = restartCategory(current, levelComplete.category);
    } else {
      updated = restartLevel(current, levelComplete.category, levelComplete.difficulty);
    }

    setProgress(updated);
    syncProgress();
    setLevelComplete(null);
    setScreen("roadmap");
  }, [levelComplete, syncProgress]);

  if (screen === "loading" || isLoadingQuiz) {
    return <LoadingSkeleton />;
  }

  if (screen === "quiz" && quiz) {
    return (
      <DailyQuiz
        questions={quiz.questions}
        trackStyle={quiz.trackStyle}
        onComplete={handleQuizComplete}
      />
    );
  }

  if (screen === "result" && quizResult) {
    return (
      <QuizResultScreen
        trackStyle={quizResult.trackStyle}
        xpEarned={quizResult.xpEarned}
        correctCount={quizResult.correctCount}
        totalQuestions={quizResult.totalQuestions}
        difficulty={quizResult.difficulty}
        streak={progress.streak}
        onContinue={handleResultContinue}
      />
    );
  }

  if (screen === "level-complete" && levelComplete) {
    const currentProgress = loadProgress();
    const roadmapDone = isCategoryComplete(currentProgress, levelComplete.category);
    const accuracy = getLevelAccuracy(
      currentProgress,
      levelComplete.category,
      levelComplete.difficulty,
    );
    const skillAccuracies = getSkillAccuracyForLevel(
      currentProgress,
      levelComplete.category,
      levelComplete.difficulty,
    );
    const improvements = roadmapDone
      ? getImprovementAreas(currentProgress, levelComplete.category)
      : [];

    return (
      <LevelCompleteScreen
        category={levelComplete.category}
        difficulty={levelComplete.difficulty}
        trackStyle={levelComplete.trackStyle}
        accuracy={accuracy}
        skillAccuracies={skillAccuracies}
        isRoadmapComplete={roadmapDone}
        improvementAreas={improvements}
        onAdvance={handleLevelAdvance}
        onRestart={handleLevelRestart}
      />
    );
  }

  if (screen === "error") {
    return (
      <ErrorScreen
        message={errorMsg ?? "Something went wrong."}
        onRetry={() => setScreen("roadmap")}
      />
    );
  }

  return (
    <RoadmapScreen progress={progress} skillStats={skillStats} onStartQuiz={handleStartQuiz} />
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface">
      <div className="font-mono text-lg text-fg-muted">
        <span className="text-emerald-500">$</span> loading
        <span className="animate-blink">_</span>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <div className="font-mono text-4xl text-red-500">!</div>
      <h1 className="mt-4 font-mono text-xl font-bold text-fg">Connection failed</h1>
      <p className="mt-2 max-w-sm text-sm text-fg-muted">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 rounded-2xl bg-emerald-500 px-8 py-3 font-mono text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-400 active:scale-95"
      >
        {"> retry"}
      </button>
    </div>
  );
}
