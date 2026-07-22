// Resolve difficulty tier for a single item, capped by CEFR ceiling.
import type { Cefr } from '@/governance/types';
import type { AdaptationContext } from '@/adaptive/types';

const CEFR_TIER_CAP: Record<Cefr, number> = {
  'Pre-A1': 1, 'A1': 2, 'A2': 3, 'B1': 4, 'B2': 4, 'C1': 5,
};

export function resolveDifficultyTier(
  cefr: Cefr,
  adaptive?: AdaptationContext,
  recallStrength = 0.5,
): number {
  const baseTier = adaptive?.difficulty?.challenge_tier ?? 2;
  const recallNudge = recallStrength >= 0.8 ? 1 : recallStrength <= 0.3 ? -1 : 0;
  const proposed = baseTier + recallNudge;
  return Math.max(1, Math.min(CEFR_TIER_CAP[cefr] ?? 3, proposed));
}
