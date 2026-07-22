import type { LessonContext } from '@/orchestrator/types';
import type { ValidatorResult } from '../types';
import { resolvePolicy } from '../policy';

export function retentionValidator(ctx: LessonContext): ValidatorResult {
  const policy = resolvePolicy(ctx.hub, ctx.cefr).retention;
  const issues: ValidatorResult['issues'] = [];

  const reviewTargets = ctx.plan?.blueprint?.review_targets ?? [];
  const corpus = ctx.activities.map((a) => JSON.stringify(a.content ?? '')).join(' ').toLowerCase();
  const callbacks = reviewTargets.filter((t) => corpus.includes(String(t).toLowerCase())).length;

  if (callbacks < policy.minPreviousUnitCallbacks) {
    issues.push({
      code: 'retention.no_callbacks',
      message: `Previous-unit callbacks ${callbacks} < ${policy.minPreviousUnitCallbacks}.`,
      severity: 'warning',
      repairHint: 'add_recycling_slot',
    });
  }

  const srsItems = (ctx.adaptive as any)?.reviewQueue ?? (ctx.adaptive as any)?.srs ?? [];
  if (policy.surfaceSrsTargets && Array.isArray(srsItems) && srsItems.length > 0) {
    const surfaced = srsItems.filter((it: any) =>
      corpus.includes(String(it?.lemma ?? it?.id ?? '').toLowerCase()),
    ).length;
    if (surfaced === 0) {
      issues.push({
        code: 'retention.srs_not_surfaced',
        message: `${srsItems.length} SRS items queued but none surfaced.`,
        severity: 'warning',
        repairHint: 'add_recycling_slot',
      });
    }
  }

  return {
    validator: 'retention',
    verdict: issues.length ? 'repair' : 'pass',
    issues,
    metrics: { callbacks, srsQueued: Array.isArray(srsItems) ? srsItems.length : 0 },
  };
}
