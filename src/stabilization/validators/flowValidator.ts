import type { LessonContext } from '@/orchestrator/types';
import type { ValidatorResult } from '../types';
import { resolvePolicy } from '../policy';
import { CANONICAL_ORDER, normalizeStage, stageRank } from '../stageNormalize';

export function flowValidator(ctx: LessonContext): ValidatorResult {
  const policy = resolvePolicy(ctx.hub, ctx.cefr).flow;
  const issues: ValidatorResult['issues'] = [];

  const stages = ctx.activities.map((a) => normalizeStage(a.stage as string));
  const present = new Set(stages.filter(Boolean) as string[]);

  const missing = policy.requiredStages.filter((s) => !present.has(s));
  if (missing.length) {
    issues.push({
      code: 'flow.missing_stages',
      message: `Missing stages: ${missing.join(', ')}`,
      severity: missing.includes('production') || missing.includes('reflection') ? 'error' : 'warning',
      repairHint: missing.includes('production') ? 'add_speaking_opportunity' : 'inject_reflection',
    });
  }

  // Monotonicity: stages should not regress significantly.
  let regressions = 0;
  let lastRank = -1;
  for (const s of stages) {
    if (!s) continue;
    const r = CANONICAL_ORDER.indexOf(s);
    if (r === -1) continue;
    if (r < lastRank) regressions++;
    lastRank = Math.max(lastRank, r);
  }
  if (regressions > 1) {
    issues.push({
      code: 'flow.scaffolding_regression',
      message: `GRR regressions: ${regressions}`,
      severity: 'warning',
      repairHint: 'resequence_activities',
    });
  }

  if (policy.requireReflection && !present.has('reflection')) {
    issues.push({
      code: 'flow.no_reflection',
      message: 'Reflection / closure missing.',
      severity: 'warning',
      repairHint: 'inject_reflection',
    });
  }

  const hasError = issues.some((i) => i.severity === 'error');
  return {
    validator: 'flow',
    verdict: hasError ? 'repair' : issues.length ? 'repair' : 'pass',
    issues,
    metrics: { stagesPresent: present.size, regressions, _rankUsed: stageRank('hook') },
  };
}
