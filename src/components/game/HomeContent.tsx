"use client";

import { useEffect, useState, useCallback } from "react";
import type { UserProgress } from "@/lib/types";
import {
  loadProgress,
  saveProgress,
  selectTopic,
  completeDailyQuiz,
  DEFAULT_PROGRESS,
} from "@/lib/progress";
import { TopicSelection } from "./TopicSelection";
import { DailyQuiz } from "./DailyQuiz";
import { QuizResultScreen } from "./QuizResultScreen";
import { Dashboard } from "./Dashboard";

type Screen = "loading" | "topic-selection" | "daily-quiz" | "result" | "dashboard";

interface QuizResult {
  xpEarned: number;
  correctCount: number;
  totalQuestions: number;
}

export function HomeContent() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const p = loadProgress();
    setProgress(p);

    const today = new Date().toISOString().slice(0, 10);

    if (!p.selectedTopicId) {
      setScreen("topic-selection");
    } else if (p.dailyQuizCompletedDate === today) {
      setScreen("dashboard");
    } else {
      setScreen("daily-quiz");
    }
  }, []);

  const handleTopicSelect = useCallback((trackId: string) => {
    const current = loadProgress();
    const updated = selectTopic(current, trackId);
    setProgress(updated);
    setScreen("daily-quiz");
  }, []);

  const handleQuizComplete = useCallback(
    (xpEarned: number, correctCount: number, totalQuestions: number) => {
      const current = loadProgress();
      const updated = completeDailyQuiz(current, xpEarned);
      setProgress(updated);
      setQuizResult({ xpEarned, correctCount, totalQuestions });
      setScreen("result");
    },
    [],
  );

  const handleResultContinue = useCallback(() => {
    setScreen("dashboard");
  }, []);

  const handleChangeTopic = useCallback(() => {
    const current = loadProgress();
    const updated: UserProgress = { ...current, selectedTopicId: null };
    saveProgress(updated);
    setProgress(updated);
    setScreen("topic-selection");
  }, []);

  if (screen === "loading") {
    return <LoadingSkeleton />;
  }

  if (screen === "topic-selection") {
    return <TopicSelection onSelect={handleTopicSelect} />;
  }

  if (screen === "daily-quiz" && progress.selectedTopicId) {
    return <DailyQuiz trackId={progress.selectedTopicId} onComplete={handleQuizComplete} />;
  }

  if (screen === "result" && quizResult && progress.selectedTopicId) {
    return (
      <QuizResultScreen
        trackId={progress.selectedTopicId}
        xpEarned={quizResult.xpEarned}
        correctCount={quizResult.correctCount}
        totalQuestions={quizResult.totalQuestions}
        streak={progress.streak}
        onContinue={handleResultContinue}
      />
    );
  }

  return <Dashboard progress={progress} onChangeTopic={handleChangeTopic} />;
}

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-400" />
    </div>
  );
}
