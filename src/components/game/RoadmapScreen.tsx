"use client";

import type { UserProgress } from "@/lib/types";
import type { TrackStyle } from "@/lib/track-styles";
import type { SkillStats } from "@/app/actions/questions";
import { getTrackStyle, CATEGORY_ORDER, SKILL_ORDER } from "@/lib/track-styles";
import { getStreakEncouragement } from "@/lib/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Icon, FireIcon, CheckCircleIcon } from "@/components/Icons";

interface RoadmapScreenProps {
  progress: UserProgress;
  skillStats: SkillStats[];
  onStartQuiz: (skillCode: string) => void;
}

const XP_PER_LEVEL = 100;
export const QUESTIONS_PER_SKILL = 20;
export const DAILY_GOAL = 10;

interface CategoryGroup {
  category: string;
  style: TrackStyle;
  skills: SkillStats[];
}

function groupAndOrder(skillStats: SkillStats[]): CategoryGroup[] {
  const byCategory = new Map<string, SkillStats[]>();
  for (const s of skillStats) {
    const list = byCategory.get(s.category) ?? [];
    list.push(s);
    byCategory.set(s.category, list);
  }

  const categories = [...byCategory.keys()].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return categories.map((category) => {
    const skills = byCategory.get(category)!;
    const order = SKILL_ORDER[category];
    if (order) {
      skills.sort((a, b) => {
        const ai = order.indexOf(a.skillCode);
        const bi = order.indexOf(b.skillCode);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
    }
    return { category, style: getTrackStyle(category), skills };
  });
}

export function RoadmapScreen({ progress, skillStats, onStartQuiz }: RoadmapScreenProps) {
  const level = Math.floor(progress.xp / XP_PER_LEVEL) + 1;
  const xpInLevel = progress.xp % XP_PER_LEVEL;
  const xpPct = (xpInLevel / XP_PER_LEVEL) * 100;

  const today = new Date().toISOString().slice(0, 10);
  const questionsToday =
    progress.dailyQuizCompletedDate === today ? progress.questionsAnsweredToday : 0;

  const groups = groupAndOrder(skillStats);

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

        <div className="space-y-6">
          {groups.map((group) => (
            <CategorySection
              key={group.category}
              group={group}
              progress={progress}
              onStartQuiz={onStartQuiz}
            />
          ))}
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

function CategorySection({
  group,
  progress,
  onStartQuiz,
}: {
  group: CategoryGroup;
  progress: UserProgress;
  onStartQuiz: (skillCode: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon name={group.style.icon} className="h-5 w-5 text-fg-secondary" />
        <h3 className={`font-mono text-sm font-bold ${group.style.textClass}`}>{group.category}</h3>
      </div>
      <div className="space-y-2">
        {group.skills.map((skill) => {
          const answered = (progress.answeredSlugs[skill.skillCode] ?? []).length;
          const pct = Math.min(100, Math.round((answered / QUESTIONS_PER_SKILL) * 100));

          return (
            <SkillCard
              key={skill.skillCode}
              skill={skill}
              style={group.style}
              progressPct={pct}
              isSelected={progress.selectedTopicId === skill.skillCode}
              onStart={() => onStartQuiz(skill.skillCode)}
            />
          );
        })}
      </div>
    </div>
  );
}

function SkillCard({
  skill,
  style,
  progressPct,
  isSelected,
  onStart,
}: {
  skill: SkillStats;
  style: TrackStyle;
  progressPct: number;
  isSelected: boolean;
  onStart: () => void;
}) {
  return (
    <button
      onClick={onStart}
      className={`w-full rounded-xl border-2 px-4 py-3 text-left transition-all duration-150 active:scale-[0.98] ${
        isSelected
          ? `${style.borderClass} bg-surface-raised`
          : "border-line-strong bg-surface-raised hover:border-fg-muted"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-fg">{skill.skillName}</span>
            {isSelected && (
              <span className={`font-mono text-xs font-medium ${style.textClass}`}>current</span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-inset">
              <div
                className={`h-full rounded-full ${style.bgClass} transition-all duration-500`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="font-mono text-xs text-fg-faint">{progressPct}%</span>
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
