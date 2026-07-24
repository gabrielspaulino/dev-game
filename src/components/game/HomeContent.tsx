"use client";

import { useEffect, useState, useCallback } from "react";
import type { UserProgress, Question } from "@/lib/types";
import type { TrackStyle } from "@/lib/track-styles";
import type { TrackStats } from "@/app/actions/questions";
import { getTrackStyle } from "@/lib/track-styles";
import type { DifficultyTier } from "@/lib/types";
import {
  loadProgress,
  completeQuiz,
  getAnsweredSlugs,
  selectTopic,
  getCurrentDifficulty,
  DEFAULT_PROGRESS,
} from "@/lib/progress";
import { fetchQuizQuestions } from "@/app/actions/questions";
import { RoadmapScreen } from "./RoadmapScreen";
import { DailyQuiz } from "./DailyQuiz";
import { QuizResultScreen } from "./QuizResultScreen";

type Screen = "loading" | "roadmap" | "quiz" | "result" | "error";

const QUIZ_SIZE = 10;

interface QuizState {
  questions: Question[];
  category: string;
  trackStyle: TrackStyle;
  difficulty: DifficultyTier;
}

interface QuizResult {
  xpEarned: number;
  correctCount: number;
  totalQuestions: number;
  category: string;
  trackStyle: TrackStyle;
}

interface HomeContentProps {
  trackStats: TrackStats[];
}

export function HomeContent({ trackStats }: HomeContentProps) {
  const [screen, setScreen] = useState<Screen>("loading");
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProgress();
    setProgress(p);
    setScreen("roadmap");
  }, []);

  const handleStartQuiz = useCallback(async (category: string) => {
    setIsLoadingQuiz(true);
    setErrorMsg(null);
    try {
      const current = loadProgress();
      const updated = selectTopic(current, category);
      setProgress(updated);

      const difficulty = getCurrentDifficulty(updated, category);
      const excludeSlugs = getAnsweredSlugs(updated, category);
      let questions = await fetchQuizQuestions(category, QUIZ_SIZE, excludeSlugs, difficulty);

      if (questions.length === 0) {
        questions = await fetchQuizQuestions(category, QUIZ_SIZE, [], difficulty);
      }

      if (questions.length === 0) {
        setIsLoadingQuiz(false);
        return;
      }

      const trackStyle = getTrackStyle(category);
      setQuiz({ questions, category, trackStyle, difficulty });
      setScreen("quiz");
    } catch {
      setErrorMsg("Could not load questions. Check your connection and try again.");
      setScreen("error");
    } finally {
      setIsLoadingQuiz(false);
    }
  }, []);

  const handleQuizComplete = useCallback(
    (xpEarned: number, correctCount: number, totalQuestions: number) => {
      if (!quiz) return;
      const slugs = quiz.questions.map((q) => q.id);
      const current = loadProgress();
      const updated = completeQuiz(
        current,
        xpEarned,
        quiz.category,
        slugs,
        quiz.difficulty,
        correctCount,
      );
      setProgress(updated);
      setQuizResult({
        xpEarned,
        correctCount,
        totalQuestions,
        category: quiz.category,
        trackStyle: quiz.trackStyle,
      });
      setScreen("result");
    },
    [quiz],
  );

  const handleResultContinue = useCallback(() => {
    setQuiz(null);
    setQuizResult(null);
    setScreen("roadmap");
  }, []);

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
        streak={progress.streak}
        onContinue={handleResultContinue}
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
    <RoadmapScreen progress={progress} trackStats={trackStats} onStartQuiz={handleStartQuiz} />
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
