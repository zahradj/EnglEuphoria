import type { LessonContext } from '@/orchestrator/types';
import type { ValidatorResult } from '../types';
import { resolvePolicy } from '../policy';

export function speakingIntegrationValidator(ctx: LessonContext): ValidatorResult {
  const policy = resolvePolicy(ctx.hub, ctx.cefr).speaking;
  const issues: ValidatorResult['issues'] = [];

  const stages = new Set(ctx.activities.map((a) => String(a.stage).toLowerCase()));
  const hasProduce = stages.has('produce');
  if (policy.requireProduceStage && !hasProduce) {
    issues.push({
      code: 'speaking.no_produce',
      message: 'No produce-stage activity present.',
      severity: 'error',
      repairHint: 'add_speaking_opportunity',
    });
  }

  const hasShadowing = ctx.activities.some(
    (a) => String(a.type).toLowerCase() === 'shadowing',
  );
  if (policy.requireShadowingAtOrAbove && !hasShadowing) {
    issues.push({
      code: 'speaking.no_shadowing',
      message: `Shadowing required at ${policy.requireShadowingAtOrAbove}+ and missing.`,
      severity: 'warning',
      repairHint: 'add_speaking_opportunity',
    });
  }

  const pronFocus = ctx.pronunciation?.focus?.pronunciation_focus ?? null;
  const pronExercised =
    !!pronFocus &&
    ctx.activities.some((a) =>
      JSON.stringify(a.content ?? '').toLowerCase().includes(String(pronFocus).toLowerCase()),
    );
  if (pronFocus && !pronExercised) {
    issues.push({
      code: 'speaking.pron_focus_unused',
      message: `Pronunciation focus "${pronFocus}" never surfaces in activities.`,
      severity: 'warning',
      repairHint: 'add_speaking_opportunity',
    });
  }

  const hasError = issues.some((i) => i.severity === 'error');
  return {
    validator: 'speakingIntegration',
    verdict: hasError ? 'repair' : issues.length ? 'repair' : 'pass',
    issues,
    metrics: {
      produce: hasProduce,
      shadowing: hasShadowing,
      pronFocus: pronFocus ?? '',
      pronExercised,
    },
  };
}
