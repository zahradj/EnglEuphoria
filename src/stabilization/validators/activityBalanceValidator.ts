import type { LessonContext } from '@/orchestrator/types';
import type { ValidatorResult } from '../types';
import { resolvePolicy } from '../policy';

const PRODUCTIVE = new Set(['speaking', 'writing', 'roleplay', 'shadowing', 'realworld_task']);

export function activityBalanceValidator(ctx: LessonContext): ValidatorResult {
  const policy = resolvePolicy(ctx.hub, ctx.cefr).activityBalance;
  const issues: ValidatorResult['issues'] = [];

  let maxRun = 0;
  let run = 1;
  for (let i = 1; i < ctx.activities.length; i++) {
    if (ctx.activities[i].type === ctx.activities[i - 1].type) {
      run++;
      maxRun = Math.max(maxRun, run);
    } else {
      run = 1;
    }
  }

  const productive = ctx.activities.filter((a) =>
    PRODUCTIVE.has(String(a.type).toLowerCase()),
  ).length;
  const ratio = productive / Math.max(ctx.activities.length, 1);

  const speaking = ctx.activities.filter((a) =>
    (a.modalities ?? []).includes('speaking'),
  ).length;

  if (maxRun > policy.maxConsecutiveSameType) {
    issues.push({
      code: 'balance.repetitive',
      message: `Run of ${maxRun} identical activity types.`,
      severity: 'error',
      repairHint: 'swap_repetitive_activity',
    });
  }
  if (ratio < policy.minProductiveRatio) {
    issues.push({
      code: 'balance.low_productive',
      message: `Productive ratio ${ratio.toFixed(2)} < ${policy.minProductiveRatio}.`,
      severity: 'warning',
      repairHint: 'add_speaking_opportunity',
    });
  }
  if (speaking < policy.minSpeakingOpportunities) {
    issues.push({
      code: 'balance.low_speaking',
      message: `Speaking opportunities ${speaking} < ${policy.minSpeakingOpportunities}.`,
      severity: 'error',
      repairHint: 'add_speaking_opportunity',
    });
  }

  const hasError = issues.some((i) => i.severity === 'error');
  return {
    validator: 'activityBalance',
    verdict: hasError ? 'repair' : issues.length ? 'repair' : 'pass',
    issues,
    metrics: { maxRun, productiveRatio: Number(ratio.toFixed(3)), speakingOpportunities: speaking },
  };
}
