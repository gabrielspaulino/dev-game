"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TOPICS } from "@/lib/game-data";
import { loadProgress } from "@/lib/progress";
import type { UserProgress } from "@/lib/types";

// Stagger positions for the winding path
const STAGGER = ["ml-4", "ml-20", "ml-36", "ml-20", "ml-4"];

export function SkillTree() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!progress) return <SkillTreeSkeleton />;

  let globalLessonIndex = 0;

  return (
    <div className="mx-auto max-w-sm px-4 py-8 space-y-10">
      {TOPICS.map((topic, topicIdx) => {
        // Check if the whole topic is locked (all lessons of prev topic must be done)
        const prevTopic = TOPICS[topicIdx - 1];
        const topicUnlocked =
          topicIdx === 0 ||
          (prevTopic?.lessons.every((l) => progress.completedLessons[l.id]) ??
            false);

        return (
          <section key={topic.id} aria-label={topic.title}>
            {/* Unit banner */}
            <div
              className={`mb-6 rounded-2xl border-2 p-4 ${
                topicUnlocked
                  ? `${topic.borderClass} bg-slate-800`
                  : "border-slate-700 bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">{topic.icon}</span>
                <div>
                  <div
                    className={`text-xs font-bold uppercase tracking-widest ${
                      topicUnlocked ? topic.textClass : "text-slate-500"
                    }`}
                  >
                    Unit {topicIdx + 1}
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      topicUnlocked ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {topic.title}
                  </div>
                  <div className="text-sm text-slate-400">{topic.description}</div>
                </div>
              </div>
            </div>

            {/* Lesson nodes */}
            <div className="flex flex-col gap-4">
              {topic.lessons.map((lesson, lessonIdx) => {
                const staggerClass =
                  STAGGER[globalLessonIndex % STAGGER.length] ?? "ml-16";
                globalLessonIndex++;

                const isDone = !!progress.completedLessons[lesson.id];
                const isUnlocked =
                  topicUnlocked &&
                  (lessonIdx === 0 ||
                    !!progress.completedLessons[
                      topic.lessons[lessonIdx - 1]!.id
                    ]);
                const isCurrent = isUnlocked && !isDone;

                return (
                  <div key={lesson.id} className={staggerClass}>
                    <LessonNode
                      topic={topic}
                      lesson={lesson}
                      isDone={isDone}
                      isUnlocked={isUnlocked}
                      isCurrent={isCurrent}
                      topicId={topic.id}
                    />
                  </div>
                );
              })}
            </div>

            {/* Trophy at end of completed unit */}
            {topic.lessons.every((l) => progress.completedLessons[l.id]) && (
              <div className="mt-6 flex justify-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-4xl">🏆</span>
                  <span className="text-xs font-medium text-yellow-400">
                    Unit complete!
                  </span>
                </div>
              </div>
            )}
          </section>
        );
      })}

      {/* Footer */}
      <div className="pb-8 text-center text-xs text-slate-600">
        {Object.keys(progress.completedLessons).length} /{" "}
        {TOPICS.reduce((a, t) => a + t.lessons.length, 0)} lessons complete ·{" "}
        {progress.xp} XP total
      </div>
    </div>
  );
}

interface LessonNodeProps {
  topic: (typeof TOPICS)[0];
  lesson: (typeof TOPICS)[0]["lessons"][0];
  isDone: boolean;
  isUnlocked: boolean;
  isCurrent: boolean;
  topicId: string;
}

function LessonNode({
  topic,
  lesson,
  isDone,
  isUnlocked,
  isCurrent,
  topicId,
}: LessonNodeProps) {
  const href = `/lesson/${topicId}/${lesson.id}`;

  const button = (
    <div className="group flex flex-col items-center gap-2">
      {/* Tooltip label */}
      <div
        className={`rounded-xl px-3 py-1.5 text-center shadow-lg transition-all ${
          isCurrent
            ? `${topic.bgClass} text-white`
            : isDone
              ? "bg-slate-700 text-slate-300"
              : "bg-slate-800 text-slate-500"
        }`}
      >
        <div className="text-xs font-bold">{lesson.title}</div>
        {isCurrent && (
          <div className="text-xs opacity-80">+{lesson.xpReward} XP</div>
        )}
      </div>

      {/* Circle button */}
      <div
        className={`relative flex h-16 w-16 items-center justify-center rounded-full border-4 text-2xl shadow-lg transition-all duration-200 ${
          isDone
            ? `${topic.bgClass} border-transparent`
            : isCurrent
              ? `border-4 ${topic.borderClass} bg-slate-800 ${topic.textClass} ring-4 ring-offset-2 ring-offset-slate-900 animate-pulse-ring`
              : "border-slate-700 bg-slate-800 text-slate-600"
        } ${isUnlocked ? "cursor-pointer group-hover:scale-110 group-hover:shadow-xl" : "cursor-not-allowed opacity-50"}`}
      >
        {isDone ? (
          <span className="text-white">✓</span>
        ) : isUnlocked ? (
          <span>{lesson.icon}</span>
        ) : (
          <span>🔒</span>
        )}
      </div>
    </div>
  );

  if (!isUnlocked) return button;

  return <Link href={href}>{button}</Link>;
}

function SkillTreeSkeleton() {
  return (
    <div className="mx-auto max-w-sm px-4 py-8 space-y-10 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-24 rounded-2xl bg-slate-800" />
          {[1, 2, 3].map((j) => (
            <div
              key={j}
              className="ml-12 h-16 w-16 rounded-full bg-slate-800"
              style={{ marginLeft: `${(j * 20) % 80}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
