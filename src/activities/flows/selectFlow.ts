// Cycle 4 — deterministic ESA flow router.
// Picks one flow per lesson based on hub + CEFR + (optional) intelligence signal.

import { BOOMERANG, ESA_FLOWS, PATCHWORK, STRAIGHT_ARROW, type EsaFlow } from './esaFlows';

export interface SelectFlowInput {
  hub: 'playground' | 'academy' | 'success';
  cefr: 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  /** Optional flag — true when this is the unit's mastery / consolidation lesson (lesson 6). */
  isUnitConsolidation?: boolean;
  /** Optional flag — true when intelligence has recurrent error patterns to remediate. */
  hasRecurrentErrors?: boolean;
}

export function selectFlow(input: SelectFlowInput): EsaFlow {
  const { hub, cefr, isUnitConsolidation, hasRecurrentErrors } = input;

  if (isUnitConsolidation && cefr !== 'Pre-A1' && cefr !== 'A1') return PATCHWORK;

  // Beginners → Straight Arrow regardless of hub.
  if (cefr === 'Pre-A1' || cefr === 'A1') return STRAIGHT_ARROW;

  // A2 / B1 → Boomerang (especially when recurrent errors exist or for Academy/Success hubs).
  if ((cefr === 'A2' || cefr === 'B1') && hub !== 'playground') return BOOMERANG;
  if ((cefr === 'A2' || cefr === 'B1') && hasRecurrentErrors) return BOOMERANG;

  // B2 / C1 → Patchwork interleaving.
  if (cefr === 'B2' || cefr === 'C1') return PATCHWORK;

  return STRAIGHT_ARROW;
}

export { ESA_FLOWS };
