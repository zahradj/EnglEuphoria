import type { AdaptationContext, AdaptationValidationReport, CEFR, Hub } from './types';

const HUB_CEFR_CEILING: Record<Hub, CEFR> = {
  Playground: 'B1',
  Academy: 'C1',
  Success: 'C1',
};

const CEFR_ORDER: CEFR[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];

export function validateAdaptation(
  ctx: AdaptationContext,
  previousDifficultyTier?: number,
): AdaptationValidationReport {
  const issues: AdaptationValidationReport['issues'] = [];

  const ceiling = HUB_CEFR_CEILING[ctx.profile.hub];
  if (CEFR_ORDER.indexOf(ctx.profile.cefr_level) > CEFR_ORDER.indexOf(ceiling)) {
    issues.push({
      code: 'cefr_above_hub_ceiling',
      message: `${ctx.profile.cefr_level} exceeds ${ctx.profile.hub} ceiling (${ceiling}).`,
      severity: 'error',
    });
  }

  if (previousDifficultyTier !== undefined) {
    const delta = Math.abs(ctx.difficulty.challenge_tier - previousDifficultyTier);
    if (delta > 2) {
      issues.push({
        code: 'difficulty_jump_too_large',
        message: `Difficulty tier changed by ${delta} (max 2).`,
        severity: 'error',
      });
    }
  }

  // Review-only lessons need at least one new input adjustment line
  const hasNewInput = ctx.adjustments.some((a) => a.startsWith('PRE-TEACH') || a.startsWith('REINFORCE'));
  if (!hasNewInput && ctx.review_queue.length > 0 && ctx.review_queue.every((i) => i.priority >= 3)) {
    issues.push({
      code: 'review_only_no_new_input',
      message: 'Lesson is review-heavy without any new input or reinforcement target.',
      severity: 'warning',
    });
  }

  return { ok: issues.every((i) => i.severity !== 'error'), issues };
}
