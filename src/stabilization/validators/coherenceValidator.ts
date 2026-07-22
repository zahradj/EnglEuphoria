import type { LessonContext } from '@/orchestrator/types';
import type { ValidatorResult } from '../types';
import { resolvePolicy } from '../policy';

function tokenize(s: string): string[] {
  return (s ?? '').toLowerCase().match(/[a-z]{3,}/g) ?? [];
}

export function coherenceValidator(ctx: LessonContext): ValidatorResult {
  const policy = resolvePolicy(ctx.hub, ctx.cefr).coherence;
  const issues: ValidatorResult['issues'] = [];

  const binder = (ctx.plan?.blueprint?.target_vocab ?? []).slice(0, 5);
  const corpus = ctx.activities.map((a) => tokenize(JSON.stringify(a.content))).flat();
  const binderReuses = binder.reduce(
    (n, t) => n + corpus.filter((w) => w === t.toLowerCase()).length,
    0,
  );

  const targetVocab = ctx.plan?.blueprint?.target_vocab ?? [];
  const recycleViolations: string[] = [];
  for (const v of targetVocab) {
    const count = corpus.filter((w) => w === v.toLowerCase()).length;
    if (count < policy.minVocabRecyclingPerWord) recycleViolations.push(`${v}:${count}`);
  }

  // Crude topic drift: ratio of unique non-binder content tokens to total tokens.
  const unique = new Set(corpus).size;
  const drift = corpus.length === 0 ? 0 : Math.min(1, unique / corpus.length);

  if (binderReuses < policy.minBinderTokenReuse) {
    issues.push({
      code: 'coherence.binder_underused',
      message: `Binder tokens reused ${binderReuses} (< ${policy.minBinderTokenReuse}).`,
      severity: 'warning',
      repairHint: 'add_recycling_slot',
    });
  }
  if (recycleViolations.length) {
    issues.push({
      code: 'coherence.vocab_recycling_low',
      message: `Vocab under-recycled: ${recycleViolations.join(', ')}.`,
      severity: 'error',
      repairHint: 'add_recycling_slot',
    });
  }
  if (drift > policy.maxTopicDrift) {
    issues.push({
      code: 'coherence.topic_drift_high',
      message: `Topic drift ${drift.toFixed(2)} > ${policy.maxTopicDrift}.`,
      severity: 'warning',
      repairHint: 'swap_repetitive_activity',
    });
  }

  const hasError = issues.some((i) => i.severity === 'error');
  return {
    validator: 'coherence',
    verdict: hasError ? 'repair' : 'pass',
    issues,
    metrics: { binderReuses, drift: Number(drift.toFixed(3)), recycleViolations: recycleViolations.length },
  };
}
