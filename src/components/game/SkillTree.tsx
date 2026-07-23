"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TOPICS } from "@/lib/game-data";
import { loadProgress } from "@/lib/progress";
import type { UserProgress } from "@/lib/types";

const STAGGER = ["ml-4", "ml-20", "ml-36", "ml-20", "ml-4"];

export function SkillTree() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!progress) return <SkillTreeSkeleton />;

  let globalLessonIndex = 0;

  return (
    <div className="mx-auto max-w-sm space-y-10 px-4 py-8">
      {TOPICS.map((topic, topicIdx) => {
        const prevTopic = TOPICS[topicIdx - 1];
        const topicUnlocked =
          topicIdx === 0 ||
          (prevTopic?.lessons.every((l) => progress.completedLessons[l.id]) ?? false);

        return (
          <section key={topic.id} aria-label={topic.title}>
            <div
              className={`mb-6 rounded-2xl border-2 p-4 ${
                topicUnlocked
                  ? `${topic.borderClass} bg-surface-raised`
                  : "bg-surface-raised/50 border-line"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">{topic.icon}</span>
                <div>
                  <div
                    className={`font-mono text-xs font-bold uppercase tracking-widest ${
                      topicUnlocked ? topic.textClass : "text-fg-faint"
                    }`}
                  >
                    Module {topicIdx + 1}
                  </div>
                  <div
                    className={`text-lg font-bold ${topicUnlocked ? "text-fg" : "text-fg-faint"}`}
                  >
                    {topic.title}
                  </div>
                  <div className="text-sm text-fg-muted">{topic.description}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {topic.lessons.map((lesson, lessonIdx) => {
                const staggerClass = STAGGER[globalLessonIndex % STAGGER.length] ?? "ml-16";
                globalLessonIndex++;

                const isDone = !!progress.completedLessons[lesson.id];
                const isUnlocked =
                  topicUnlocked &&
                  (lessonIdx === 0 ||
                    !!progress.completedLessons[topic.lessons[lessonIdx - 1]!.id]);
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

            {topic.lessons.every((l) => progress.completedLessons[l.id]) && (
              <div className="mt-6 flex justify-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-4xl">🏆</span>
                  <span className="font-mono text-xs font-medium text-yellow-600 dark:text-yellow-400">
                    Module shipped!
                  </span>
                </div>
              </div>
            )}
          </section>
        );
      })}

      <div className="pb-8 text-center font-mono text-xs text-fg-faint">
        {Object.keys(progress.completedLessons).length} /{" "}
        {TOPICS.reduce((a, t) => a + t.lessons.length, 0)} modules complete · {progress.xp} XP total
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

function LessonNode({ topic, lesson, isDone, isUnlocked, isCurrent, topicId }: LessonNodeProps) {
  const href = `/lesson/${topicId}/${lesson.id}`;

  const button = (
    <div className="group flex flex-col items-center gap-2">
      <div
        className={`rounded-xl px-3 py-1.5 text-center shadow-lg transition-all ${
          isCurrent
            ? `${topic.bgClass} text-white`
            : isDone
              ? "bg-surface-inset text-fg-secondary"
              : "bg-surface-raised text-fg-faint"
        }`}
      >
        <div className="text-xs font-bold">{lesson.title}</div>
        {isCurrent && <div className="font-mono text-xs opacity-80">+{lesson.xpReward} XP</div>}
      </div>

      <div
        className={`relative flex h-16 w-16 items-center justify-center rounded-full border-4 text-2xl shadow-lg transition-all duration-200 ${
          isDone
            ? `${topic.bgClass} border-transparent`
            : isCurrent
              ? `border-4 ${topic.borderClass} bg-surface-raised ${topic.textClass} animate-pulse-ring ring-4 ring-offset-2 ring-offset-surface`
              : "border-line-strong bg-surface-raised text-fg-faint"
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
    <div className="mx-auto max-w-sm animate-pulse space-y-10 px-4 py-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-24 rounded-2xl bg-surface-raised" />
          {[1, 2, 3].map((j) => (
            <div
              key={j}
              className="ml-12 h-16 w-16 rounded-full bg-surface-raised"
              style={{ marginLeft: `${(j * 20) % 80}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
