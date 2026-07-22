// Tracks how many times each target word has appeared across activities.

import type { ActivitySpec, GenerationContext } from '../types';

export function vocabAppearancesFrom(activities: ActivitySpec[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of activities) {
    for (const w of a.target_vocab_used || []) {
      out[w] = (out[w] ?? 0) + 1;
    }
  }
  return out;
}

export function underRecycledWords(ctx: GenerationContext, threshold = 3): string[] {
  return ctx.plan.blueprint.target_vocab.filter(
    (w) => (ctx.vocabAppearances[w] ?? 0) < threshold,
  );
}

export function buildVocabDirectives(ctx: GenerationContext): string {
  const debt = underRecycledWords(ctx);
  if (!debt.length) {
    return 'Vocab recycling: all target words have sufficient coverage; use any naturally.';
  }
  return `Vocab recycling priority — MUST use these under-recycled target words in this activity (in meaningful context, not as a list): ${debt.join(', ')}.`;
}
