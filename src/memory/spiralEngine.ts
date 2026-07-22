// Spiral curriculum reinforcement.
// Resurfaces past skills at higher CEFR complexity in new communicative contexts.
// Respects Hub × CEFR matrix.

import type { Hub, Cefr } from '@/governance/types';
import type { ReviewQueueEntry } from './types';

// Stage 0 = base introduction
// Stage 1 = + time/place expansion
// Stage 2 = + subordination / linking
// Stage 3 = + aspect/perspective shifts
// Stage 4 = + discourse/idiomatic mastery
const STAGE_CONTEXTS: Record<number, string> = {
  0: 'plain statement in familiar context',
  1: 'add time/place details',
  2: 'combine with another clause using when/while/because',
  3: 'shift aspect (perfect/continuous) or perspective (reported speech)',
  4: 'use in extended discourse with discourse markers and natural register',
};

const HUB_CEFR_CEILING: Record<Hub, Cefr> = {
  playground: 'B1',
  academy: 'C1',
  success: 'C1',
};

const CEFR_RANK: Record<Cefr, number> = {
  'Pre-A1': 0, 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5,
};

export function planSpiralEscalations(
  queue: ReviewQueueEntry[],
  hub: Hub,
  cefr: Cefr,
): ReviewQueueEntry[] {
  const ceiling = CEFR_RANK[HUB_CEFR_CEILING[hub]];
  const here = CEFR_RANK[cefr];

  return queue.map((e) => {
    const item = e.item;
    if (item.skill_kind !== 'grammar' && item.skill_kind !== 'communication_function') return e;
    // Only escalate if mastery is solid at the current stage
    if ((item.active_mastery ?? 0) < 0.7) return e;
    // Don't escalate past hub ceiling
    if (here >= ceiling) return e;

    const fromStage = item.spiral_stage ?? 0;
    const toStage = Math.min(4, fromStage + 1);
    if (toStage === fromStage) return e;

    return {
      ...e,
      spiral_escalation: {
        fromStage,
        toStage,
        newContext: STAGE_CONTEXTS[toStage],
      },
    };
  });
}
