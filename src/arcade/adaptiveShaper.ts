// Deterministic difficulty + scaffolding shaping.
import type { LearnerIntelligence } from '@/intelligence/types';
import type { ReinforcementTarget } from '@/coherence/types';

export interface ShapeInput {
  intelligence?: LearnerIntelligence;
  target: ReinforcementTarget | null;
  defaultTier?: number;
}

export interface Shape {
  difficulty_tier: 1 | 2 | 3 | 4 | 5;
  scaffolding_boost: 0 | 1 | 2;
  est_seconds: number;
  is_boss: boolean;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function shape(input: ShapeInput, ceilingSeconds: number): Shape {
  const intel = input.intelligence;
  const baseTier = intel?.adaptive_support.current_difficulty_tier ?? input.defaultTier ?? 2;
  const momentum = intel?.engagement_state.momentum ?? 'medium';
  const fatigue = intel?.engagement_state.fatigue_score ?? 30;

  let tier = baseTier;
  if (momentum === 'low' || fatigue > 70) tier -= 1;
  if (momentum === 'high' && (input.target?.priority ?? 0.5) < 0.4) tier += 1;
  tier = clamp(tier, 1, 5);

  let scaffolding: 0 | 1 | 2 = 0;
  if (tier <= 2 || momentum === 'low') scaffolding = 2;
  else if (tier === 3) scaffolding = 1;

  // Time budget shrinks as fatigue grows; bosses get a bit more time.
  const isBoss = (input.target?.priority ?? 0) >= 0.85 && tier >= 4;
  const fatigueFactor = 1 - clamp(fatigue, 0, 100) / 250; // 1.0..0.6
  const bossFactor = isBoss ? 1.2 : 1.0;
  const est = Math.round(ceilingSeconds * fatigueFactor * bossFactor);

  return {
    difficulty_tier: tier as 1 | 2 | 3 | 4 | 5,
    scaffolding_boost: scaffolding,
    est_seconds: clamp(est, 45, ceilingSeconds),
    is_boss: isBoss,
  };
}
