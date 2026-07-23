import type {
  QuestionCandidateRepository,
  UserMasteryRepository,
  UserHistoryRepository,
  SessionPersistencePort,
} from "./ports";
import type { SessionPlan, SelectedQuestion, UserSkillMastery } from "./types";
import { filterEligible } from "./eligibility";
import { rankCandidates } from "./ranking";
import { selectDiverse } from "./diversity";
import { getMixCounts } from "./session-planner";

export class QuestionSelectionService {
  constructor(
    private readonly candidateRepo: QuestionCandidateRepository,
    private readonly masteryRepo: UserMasteryRepository,
    private readonly historyRepo: UserHistoryRepository,
    private readonly sessionPersistence: SessionPersistencePort,
  ) {}

  async assembleSession(
    plan: SessionPlan,
    now: Date,
  ): Promise<{ sessionId: string; questions: SelectedQuestion[] }> {
    const candidates = plan.lessonId
      ? await this.candidateRepo.findPublishedByLesson(plan.lessonId)
      : await this.candidateRepo.findPublishedBySkills(plan.skillFocus ?? [], "pt-BR");

    const allSkillIds = [...new Set(candidates.flatMap((c) => c.skillIds))];

    const [masteryList, recentlyAnswered] = await Promise.all([
      this.masteryRepo.getSkillMasteries(plan.userId, allSkillIds),
      this.historyRepo.getRecentlyAnsweredQuestionIds(plan.userId, 24),
    ]);

    const masteryMap = new Map<string, UserSkillMastery>();
    for (const m of masteryList) {
      masteryMap.set(m.skillId, m);
    }

    const questionIds = candidates.map((c) => c.questionId);
    const history = await this.historyRepo.getQuestionHistory(plan.userId, questionIds);

    const eligible = filterEligible(candidates, history, recentlyAnswered, now);

    const focusSkillIds = new Set(plan.skillFocus ?? []);
    const ranked = rankCandidates(eligible, masteryMap, history, focusSkillIds, now);

    const selected = selectDiverse(ranked, plan.targetQuestionCount, masteryMap);

    const mixCounts = getMixCounts(plan);

    const sessionId = await this.sessionPersistence.createSession({
      userId: plan.userId,
      sessionType: plan.sessionType,
      lessonId: plan.lessonId,
      sessionDate: now.toISOString().slice(0, 10),
      questionCount: selected.length,
      planConfig: {
        mix: plan.mix,
        targetCounts: mixCounts,
        actualCount: selected.length,
      },
      questions: selected,
    });

    return { sessionId, questions: selected };
  }
}
