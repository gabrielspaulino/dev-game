export interface ModuleCompletionConfig {
  averageMasteryThreshold: number;
  minimumSkillMastery: number;
  challengeMinScorePercent: number;
}

export const DEFAULT_MODULE_COMPLETION_CONFIG: ModuleCompletionConfig = {
  averageMasteryThreshold: 70,
  minimumSkillMastery: 50,
  challengeMinScorePercent: 75,
};

export interface CourseCompletionConfig {
  averageMasteryThreshold: number;
  minimumSkillMastery: number;
  finalAssessmentMinScorePercent: number;
  finalAssessmentQuestionCount: { min: number; max: number };
  masteryThreshold: number;
}

export const DEFAULT_COURSE_COMPLETION_CONFIG: CourseCompletionConfig = {
  averageMasteryThreshold: 70,
  minimumSkillMastery: 50,
  finalAssessmentMinScorePercent: 75,
  finalAssessmentQuestionCount: { min: 20, max: 30 },
  masteryThreshold: 85,
};

export type CourseStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "MASTERED";

export interface SkillMasterySnapshot {
  skillId: string;
  mastery: number;
}

export interface ModuleEvaluation {
  allMandatoryLessonsCompleted: boolean;
  skillMasteries: SkillMasterySnapshot[];
  challengeScorePercent: number | null;
}

export function evaluateModuleCompletion(
  evaluation: ModuleEvaluation,
  config: ModuleCompletionConfig,
): { isComplete: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (!evaluation.allMandatoryLessonsCompleted) {
    reasons.push("Not all mandatory lessons are completed");
  }

  if (evaluation.skillMasteries.length > 0) {
    const avg =
      evaluation.skillMasteries.reduce((s, m) => s + m.mastery, 0) /
      evaluation.skillMasteries.length;
    if (avg < config.averageMasteryThreshold) {
      reasons.push(`Average mastery ${Math.round(avg)} is below ${config.averageMasteryThreshold}`);
    }

    const belowMin = evaluation.skillMasteries.filter(
      (m) => m.mastery < config.minimumSkillMastery,
    );
    if (belowMin.length > 0) {
      reasons.push(
        `${belowMin.length} skill(s) below minimum mastery of ${config.minimumSkillMastery}`,
      );
    }
  }

  if (evaluation.challengeScorePercent === null) {
    reasons.push("Module challenge not attempted");
  } else if (evaluation.challengeScorePercent < config.challengeMinScorePercent) {
    reasons.push(
      `Challenge score ${evaluation.challengeScorePercent}% is below ${config.challengeMinScorePercent}%`,
    );
  }

  return { isComplete: reasons.length === 0, reasons };
}

export interface CourseEvaluation {
  allMandatoryModulesCompleted: boolean;
  skillMasteries: SkillMasterySnapshot[];
  finalAssessmentScorePercent: number | null;
}

export function evaluateCourseCompletion(
  evaluation: CourseEvaluation,
  config: CourseCompletionConfig,
): { isComplete: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (!evaluation.allMandatoryModulesCompleted) {
    reasons.push("Not all mandatory modules are completed");
  }

  if (evaluation.skillMasteries.length > 0) {
    const avg =
      evaluation.skillMasteries.reduce((s, m) => s + m.mastery, 0) /
      evaluation.skillMasteries.length;
    if (avg < config.averageMasteryThreshold) {
      reasons.push(`Average mastery ${Math.round(avg)} is below ${config.averageMasteryThreshold}`);
    }

    const belowMin = evaluation.skillMasteries.filter(
      (m) => m.mastery < config.minimumSkillMastery,
    );
    if (belowMin.length > 0) {
      reasons.push(
        `${belowMin.length} skill(s) below minimum mastery of ${config.minimumSkillMastery}`,
      );
    }
  }

  if (evaluation.finalAssessmentScorePercent === null) {
    reasons.push("Final assessment not attempted");
  } else if (evaluation.finalAssessmentScorePercent < config.finalAssessmentMinScorePercent) {
    reasons.push(
      `Final assessment score ${evaluation.finalAssessmentScorePercent}% is below ${config.finalAssessmentMinScorePercent}%`,
    );
  }

  return { isComplete: reasons.length === 0, reasons };
}

export function canAchieveMastery(
  skillMasteries: SkillMasterySnapshot[],
  config: CourseCompletionConfig,
): boolean {
  if (skillMasteries.length === 0) return false;
  const avg = skillMasteries.reduce((s, m) => s + m.mastery, 0) / skillMasteries.length;
  return avg >= config.masteryThreshold;
}
