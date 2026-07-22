import type { LessonContext } from '@/orchestrator/types';
import type { ValidatorResult } from '../types';
import { resolvePolicy } from '../policy';

function tokenCount(s: string): number {
  return (s ?? '').trim().split(/\s+/).filter(Boolean).length;
}

export function cognitiveLoadValidator(ctx: LessonContext): ValidatorResult {
  const policy = resolvePolicy(ctx.hub, ctx.cefr).cognitive;
  const issues: ValidatorResult['issues'] = [];

  const targetVocab = new Set((ctx.plan?.blueprint?.target_vocab ?? []).map((v) => v.toLowerCase()));

  let overloadedSlides = 0;
  let longInstructions = 0;
  let endFatigue = 0;
  const total = ctx.activities.length || 1;

  ctx.activities.forEach((a, i) => {
    const text = JSON.stringify(a.content ?? {});
    const tokens = tokenCount(text);
    if (tokens > policy.maxTokensPerSlide) overloadedSlides++;

    const instr = (a.content as any)?.instructions ?? (a.content as any)?.prompt ?? '';
    if (tokenCount(String(instr)) > policy.maxInstructionTokens) longInstructions++;

    const newVocab = (a.target_vocab_used ?? []).filter((v) => !targetVocab.has(v.toLowerCase())).length;
    if (newVocab > policy.maxNewVocabPerSlide) overloadedSlides++;

    // End-of-lesson fatigue check: last third should not be hardest.
    if (i / total > 0.66) {
      const difficulty = tokens / Math.max(policy.maxTokensPerSlide, 1);
      if (difficulty > policy.endFatigueCeiling) endFatigue++;
    }
  });

  if (overloadedSlides > 0) {
    issues.push({
      code: 'cognitive.slide_overload',
      message: `${overloadedSlides} overloaded slide(s).`,
      severity: 'error',
      repairHint: 'compress_instructions',
    });
  }
  if (longInstructions > 0) {
    issues.push({
      code: 'cognitive.long_instructions',
      message: `${longInstructions} slide(s) with long instructions.`,
      severity: 'warning',
      repairHint: 'compress_instructions',
    });
  }
  if (endFatigue > 0) {
    issues.push({
      code: 'cognitive.end_fatigue',
      message: `Lesson ends with ${endFatigue} high-load slide(s).`,
      severity: 'warning',
      repairHint: 'resequence_activities',
    });
  }

  const hasError = issues.some((i) => i.severity === 'error');
  return {
    validator: 'cognitiveLoad',
    verdict: hasError ? 'repair' : issues.length ? 'repair' : 'pass',
    issues,
    metrics: { overloadedSlides, longInstructions, endFatigue },
  };
}
