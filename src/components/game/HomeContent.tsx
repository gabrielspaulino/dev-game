"use client";

import { useEffect, useState, useCallback } from "react";
import type { UserProgress, Question } from "@/lib/types";
import type { TrackStyle } from "@/lib/track-styles";
import type { TrackStats } from "@/app/actions/questions";
import { getTrackStyle } from "@/lib/track-styles";
import {
  loadProgress,
  completeQuiz,
  getAnsweredSlugs,
  selectTopic,
  DEFAULT_PROGRESS,
} from "@/lib/progress";
import { fetchQuizQuestions } from "@/app/actions/questions";
import { RoadmapScreen } from "./RoadmapScreen";
import { DailyQuiz } from "./DailyQuiz";
import { QuizResultScreen } from "./QuizResultScreen";

type Screen = "loading" | "roadmap" | "quiz" | "result";

const QUIZ_SIZE = 5;

interface QuizState {
  questions: Question[];
  category: string;
  trackStyle: TrackStyle;
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

  useEffect(() => {
    const p = loadProgress();
    setProgress(p);
    setScreen("roadmap");
  }, []);

  const handleStartQuiz = useCallback(async (category: string) => {
    setIsLoadingQuiz(true);
    try {
      const current = loadProgress();
      const updated = selectTopic(current, category);
      setProgress(updated);

      const excludeSlugs = getAnsweredSlugs(updated, category);
      let questions = await fetchQuizQuestions(category, QUIZ_SIZE, excludeSlugs);

      if (questions.length === 0) {
        questions = await fetchQuizQuestions(category, QUIZ_SIZE, []);
      }

      if (questions.length === 0) {
        setIsLoadingQuiz(false);
        return;
      }

      const trackStyle = getTrackStyle(category);
      setQuiz({ questions, category, trackStyle });
      setScreen("quiz");
    } finally {
      setIsLoadingQuiz(false);
    }
  }, []);

  const handleQuizComplete = useCallback(
    (xpEarned: number, correctCount: number, totalQuestions: number) => {
      if (!quiz) return;
      const slugs = quiz.questions.map((q) => q.id);
      const current = loadProgress();
      const updated = completeQuiz(current, xpEarned, quiz.category, slugs);
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
