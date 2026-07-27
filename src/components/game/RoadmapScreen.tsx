"use client";

import type { UserProgress } from "@/lib/types";
import type { TrackStyle } from "@/lib/track-styles";
import type { SkillStats } from "@/app/actions/questions";
import { getTrackStyle, CATEGORY_ORDER, SKILL_ORDER } from "@/lib/track-styles";
import {
  getStreakEncouragement,
  getCategoryProgress,
  getCategoryTotal,
  getCurrentSlot,
} from "@/lib/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Icon, FireIcon, CheckCircleIcon } from "@/components/Icons";

interface RoadmapScreenProps {
  progress: UserProgress;
  skillStats: SkillStats[];
  onStartQuiz: (category: string) => void;
}

const XP_PER_LEVEL = 100;
export const DAILY_GOAL = 10;

interface CategoryEntry {
  category: string;
  style: TrackStyle;
  hasQuestions: boolean;
}

function buildCategories(skillStats: SkillStats[]): CategoryEntry[] {
  const categoriesWithQuestions = new Set(skillStats.map((s) => s.category));

  const allCategories = new Set([...CATEGORY_ORDER, ...categoriesWithQuestions]);

  return [...allCategories]
    .sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    })
    .filter((c) => SKILL_ORDER[c])
    .map((category) => ({
      category,
      style: getTrackStyle(category),
      hasQuestions: categoriesWithQuestions.has(category),
    }));
}

function getSlotLabel(
  progress: UserProgress,
  category: string,
  skillStats: SkillStats[],
): string | null {
  const slot = getCurrentSlot(progress, category);
  if (!slot) return null;

  const skillName = skillStats.find((s) => s.skillCode === slot.skillCode)?.skillName;
  if (!skillName) return null;

  const diffLabel = slot.difficulty.charAt(0) + slot.difficulty.slice(1).toLowerCase();
  return `${skillName} · ${diffLabel}`;
}

export function RoadmapScreen({ progress, skillStats, onStartQuiz }: RoadmapScreenProps) {
  const level = Math.floor(progress.xp / XP_PER_LEVEL) + 1;
  const xpInLevel = progress.xp % XP_PER_LEVEL;
  const xpPct = (xpInLevel / XP_PER_LEVEL) * 100;

  const today = new Date().toISOString().slice(0, 10);
  const questionsToday =
    progress.dailyQuizCompletedDate === today ? progress.questionsAnsweredToday : 0;

  const categories = buildCategories(skillStats);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-line bg-surface-overlay">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <span className="font-mono text-lg font-bold text-fg">
            <span className="text-fg-muted">&lt;</span>
            LearningStack
            <span className="text-fg-muted"> /&gt;</span>
          </span>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4">
          <div className="flex items-center gap-2">
            <FireIcon className="h-7 w-7 text-orange-500" />
            <div>
              <div className="font-mono text-xl font-black text-orange-600 dark:text-orange-400">
                {progress.streak}
              </div>
              <div className="font-mono text-xs text-fg-muted">streak</div>
            </div>
          </div>
          <div className="h-10 w-px bg-line" />
          <div>
            <div className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
              Lv.{level}
            </div>
            <div className="font-mono text-xs text-fg-muted">{progress.xp} XP</div>
          </div>
          <div className="ml-auto flex-1">
            <div className="mb-1 text-right font-mono text-xs text-fg-faint">
              {xpInLevel}/{XP_PER_LEVEL}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-inset">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>
        </div>

        {progress.streak > 0 && (
          <p className="mb-6 text-center text-sm text-fg-muted">
            {getStreakEncouragement(progress.streak)}
          </p>
        )}

        <DailyGoal questionsAnsweredToday={questionsToday} />

        <h2 className="mb-1 font-mono text-lg font-bold text-fg">{"// choose_your_stack"}</h2>
        <p className="mb-4 text-sm text-fg-muted">
          Pick a topic and start a quiz with random questions.
        </p>

        <div className="space-y-3">
          {categories.map((entry) => {
            const answered = getCategoryProgress(progress, entry.category);
            const total = getCategoryTotal(entry.category);
            const pct = total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;
            const slotLabel = getSlotLabel(progress, entry.category, skillStats);

            return (
              <CategoryCard
                key={entry.category}
                category={entry.category}
                style={entry.style}
                progressPct={pct}
                answered={answered}
                total={total}
                slotLabel={slotLabel}
                isSelected={progress.selectedTopicId === entry.category}
                onStart={() => onStartQuiz(entry.category)}
              />
            );
          })}
        </div>

        {skillStats.length === 0 && (
          <div className="rounded-2xl border border-line bg-surface-raised p-8 text-center">
            <p className="font-mono text-fg-muted">No questions available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  style,
  progressPct,
  answered,
  total,
  slotLabel,
  isSelected,
  onStart,
}: {
  category: string;
  style: TrackStyle;
  progressPct: number;
  answered: number;
  total: number;
  slotLabel: string | null;
  isSelected: boolean;
  onStart: () => void;
}) {
  return (
    <button
      onClick={onStart}
      className={`w-full rounded-xl border-2 px-4 py-4 text-left transition-all duration-150 active:scale-[0.98] ${
        isSelected
          ? `${style.borderClass} bg-surface-raised`
          : "border-line-strong bg-surface-raised hover:border-fg-muted"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon name={style.icon} className={`h-6 w-6 ${style.textClass}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-fg">{category}</span>
            {isSelected && (
              <span className={`font-mono text-xs font-medium ${style.textClass}`}>current</span>
            )}
          </div>
          {slotLabel && <span className="font-mono text-xs text-fg-faint">{slotLabel}</span>}
          <div className="mt-1.5 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-inset">
              <div
                className={`h-full rounded-full ${style.bgClass} transition-all duration-500`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="font-mono text-xs text-fg-faint">
              {answered}/{total}
            </span>
          </div>
        </div>
        <span className={`font-mono text-sm font-bold ${style.textClass}`}>&gt;</span>
      </div>
    </button>
  );
}

function DailyGoal({ questionsAnsweredToday }: { questionsAnsweredToday: number }) {
  const completed = Math.min(questionsAnsweredToday, DAILY_GOAL);
  const goalReached = questionsAnsweredToday >= DAILY_GOAL;
  const pct = Math.round((completed / DAILY_GOAL) * 100);

  return (
    <div className="mb-6 rounded-2xl border border-line bg-surface-raised p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-fg">{"// daily_goal"}</span>
        <div className="flex items-center gap-1.5">
          {goalReached && <CheckCircleIcon className="h-4 w-4 text-emerald-500" />}
          <span
            className={`font-mono text-sm font-bold ${goalReached ? "text-emerald-600 dark:text-emerald-400" : "text-fg-muted"}`}
          >
            {questionsAnsweredToday}/{DAILY_GOAL}
          </span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-inset">
        <div
          className={`h-full rounded-full transition-all duration-500 ${goalReached ? "bg-emerald-500" : "bg-amber-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 font-mono text-xs text-fg-faint">
        {goalReached
          ? "Goal reached! Keep going or come back tomorrow."
          : `Answer ${DAILY_GOAL - questionsAnsweredToday} more to hit today's goal.`}
      </p>
    </div>
  );
}
