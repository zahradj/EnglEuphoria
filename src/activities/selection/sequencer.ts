// Sequencer — applies cognitive-load corrections to a selected slot list.
// Selection already considers pacing; sequencer enforces hard caps post-hoc.

import type { GenerationContext } from '../types';
import type { SelectedSlot } from './activitySelector';
import { ACTIVITY_CATALOG } from '../catalog/activityCatalog';
import type { ActivityType } from '../types';

/** Stage → preferred speaking swap-in (fluency ladder rung-appropriate). */
const SPEAKING_SWAP_BY_STAGE: Record<string, ActivityType> = {
  hook: 'echo_repetition' as ActivityType,
  context: 'echo_repetition' as ActivityType,
  input: 'echo_repetition' as ActivityType,
  discovery: 'pronunciation' as ActivityType,
  controlled: 'pronunciation' as ActivityType,
  communicative: 'roleplay' as ActivityType,
  production: 'speaking_mission' as ActivityType,
  reflection: 'opinion' as ActivityType,
};

/** Hub speaking floor (% of activities that must include speaking modality). */
const HUB_SPEAKING_FLOOR: Record<string, number> = {
  playground: 0.4,
  academy: 0.35,
  success: 0.35,
};

export function enforcePacing(
  slots: SelectedSlot[],
  ctx: GenerationContext,
): SelectedSlot[] {
  const maxRecep = ctx.plan.cognitive_load.max_consecutive_receptive;
  const maxSame = ctx.plan.cognitive_load.max_consecutive_same_modality;
  const speakEvery = ctx.plan.cognitive_load.speaking_every_n_slides;

  let recepStreak = 0;
  let lastModality = '';
  let sameModalityStreak = 0;
  let sinceSpeaking = 0;

  const out = slots.map((slot) => {
    const entry = ACTIVITY_CATALOG[slot.type];
    const isProductive = entry.productive;
    const dominantModality = entry.modalities[0] ?? 'thinking';

    if (!isProductive) recepStreak++;
    else recepStreak = 0;

    if (dominantModality === lastModality) sameModalityStreak++;
    else sameModalityStreak = 1;
    lastModality = dominantModality;

    // Hard swap: if too many slides since last speaking, replace this slot
    // with a stage-appropriate speaking type. This guarantees pacing.
    if (sinceSpeaking >= speakEvery && !entry.modalities.includes('speaking')) {
      const swap = SPEAKING_SWAP_BY_STAGE[slot.stage];
      if (swap && ACTIVITY_CATALOG[swap]) {
        slot.type = swap;
        (slot as any).__swapped_for_speaking = true;
      }
    }

    const finalEntry = ACTIVITY_CATALOG[slot.type];
    if (finalEntry.modalities.includes('speaking')) sinceSpeaking = 0;
    else sinceSpeaking++;

    if (recepStreak > maxRecep) (slot as any).__needs_productive_break = true;
    if (sameModalityStreak > maxSame) (slot as any).__needs_modality_break = true;
    return slot;
  });

  // Hub speaking floor: guarantee ≥ floor % of slots include speaking modality.
  const hub = ctx.plan.blueprint?.hub ?? 'playground';
  const floor = HUB_SPEAKING_FLOOR[hub] ?? 0.35;
  const target = Math.ceil(out.length * floor);
  let speakingCount = out.filter((s) => ACTIVITY_CATALOG[s.type]?.modalities.includes('speaking')).length;
  if (speakingCount < target) {
    // Convert reflection/hook slots (lowest cognitive-value non-speaking) first.
    const swapPriority: string[] = ['reflection', 'hook', 'context', 'controlled'];
    for (const stage of swapPriority) {
      if (speakingCount >= target) break;
      for (const slot of out) {
        if (speakingCount >= target) break;
        if (slot.stage !== stage) continue;
        const entry = ACTIVITY_CATALOG[slot.type];
        if (entry?.modalities.includes('speaking')) continue;
        const swap = SPEAKING_SWAP_BY_STAGE[slot.stage];
        if (swap && ACTIVITY_CATALOG[swap]) {
          slot.type = swap;
          (slot as any).__swapped_for_speaking = true;
          speakingCount++;
        }
      }
    }
  }

  return out;
}

