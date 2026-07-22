/**
 * Thin adapter around `useGameIntelligence` for the vocab-games engine.
 * Provides a sane default `GameIntelligenceContext` so games can opt-in with a
 * single line and still get live difficulty adaptation + scaffolding boosts.
 */
import { useGameIntelligence } from './useGameIntelligence';
import type { DifficultyTier, GameIntelligenceContext, GameItem } from './types';

export interface UseVocabGameIntelligenceArgs {
  cefr?: string;
  words: string[];
  ctx?: GameIntelligenceContext;
  initialTier?: DifficultyTier;
}

export function useVocabGameIntelligence({
  cefr = 'A1',
  words,
  ctx,
  initialTier = 3,
}: UseVocabGameIntelligenceArgs) {
  const baseline: GameItem[] = words.map((w) => ({
    id: w,
    payload: w,
    provenance: 'target',
    value: 1,
  }));

  const fallbackCtx: GameIntelligenceContext = {
    cefr: cefr as any,
    target: null,
    intelligence: {
      learner_profile: { interests: [], age_band: 'teen' as any },
      error_patterns: [],
      review_priority: [],
      adaptive_support: { scaffolding: 0, hints_enabled: false } as any,
      engagement_state: { fatigue: 0, momentum: 0 } as any,
      speaking_confidence: { level: 0.5 } as any,
    } as any,
    round_size: words.length,
  };

  return useGameIntelligence({
    ctx: ctx ?? fallbackCtx,
    initialTier,
    baseline,
  });
}
