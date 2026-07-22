import type {
  AdaptationContext,
  EngagementState,
  ErrorPattern,
  LearnerProfile,
  SkillMasteryRecord,
} from './types';
import { resolveDifficulty } from './difficulty/difficultyResolver';
import { buildReviewQueue } from './review/reviewScheduler';
import { resolveSpeakingSupport } from './speaking/speakingSupportResolver';
import { adjustLessonPlan } from './personalization/lessonAdjuster';
import { validateAdaptation } from './validator';
import { buildAdaptationSystemPrompt } from './promptInjector';

export * from './types';
export { buildAdaptationSystemPrompt } from './promptInjector';
export { HUB_ADAPTATION_PROFILES, getHubAdaptationProfile } from './hubAdaptationProfiles';
export { buildLearnerProfile } from './profile/profileBuilder';
export { updateLearnerProfile } from './profile/profileUpdater';
export { recomputeMastery, isMastered } from './mastery/masteryCalculator';
export { aggregateErrorPatterns } from './errors/patternAggregator';
export { scoreEngagement } from './engagement/engagementScorer';
export { adjustLessonPlan } from './personalization/lessonAdjuster';
export { validateAdaptation } from './validator';
export { buildReviewQueue } from './review/reviewScheduler';
export { resolveDifficulty } from './difficulty/difficultyResolver';
export { resolveSpeakingSupport } from './speaking/speakingSupportResolver';

export interface RunAdaptationInput {
  profile: LearnerProfile;
  mastery: SkillMasteryRecord[];
  errors: ErrorPattern[];
  engagement: EngagementState;
  previousDifficultyTier?: number;
}

export interface RunAdaptationOutput {
  context: AdaptationContext;
  systemPrompt: string;
  validation: ReturnType<typeof validateAdaptation>;
}

/**
 * Pure orchestrator. No AI calls. Consumed by the lesson generator
 * AFTER planner + governance, BEFORE narrative/activity/pronunciation prompts.
 */
export function runAdaptation(input: RunAdaptationInput): RunAdaptationOutput {
  const difficulty = resolveDifficulty({
    profile: input.profile,
    mastery: input.mastery,
    engagement: input.engagement,
  });

  const review_queue = buildReviewQueue({
    mastery: input.mastery,
    errors: input.errors,
  });

  const speaking = resolveSpeakingSupport({
    profile: input.profile,
    engagement: input.engagement,
    difficulty,
  });

  const adjustments = adjustLessonPlan({
    profile: input.profile,
    mastery: input.mastery,
    errors: input.errors,
    difficulty,
    review_queue,
  });

  const context: AdaptationContext = {
    profile: input.profile,
    mastery: input.mastery,
    difficulty,
    review_queue,
    engagement: input.engagement,
    speaking,
    errors: input.errors,
    adjustments,
    generated_at: new Date().toISOString(),
  };

  const validation = validateAdaptation(context, input.previousDifficultyTier);
  const systemPrompt = buildAdaptationSystemPrompt(context);

  return { context, systemPrompt, validation };
}
