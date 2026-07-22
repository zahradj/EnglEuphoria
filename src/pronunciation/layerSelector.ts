// Decides which pronunciation layers are appropriate for the current request.

import type { Hub } from '@/governance/types';
import type { LessonPlan } from '@/planning/types';
import { PRONUNCIATION_HUB_PROFILES } from './hubProfiles';
import { isEarlyReader } from './earlyReaderTrack';
import type { PronunciationLayer } from './types';

export interface LayerDecision {
  hub: Hub;
  active_layers: PronunciationLayer[];
  reason: string;
}

export function decideLayers(plan: LessonPlan, lessonKind: 'normal' | 'standalone_phonics' | 'booster'): LayerDecision {
  const hub = plan.lesson_state.hub;
  const cefr = plan.lesson_state.cefr;
  const profile = PRONUNCIATION_HUB_PROFILES[hub];
  const earlyReader = isEarlyReader({ hub, cefr });

  if (lessonKind === 'standalone_phonics') {
    if (!profile.allowed_layers.includes('standalone')) {
      return { hub, active_layers: [], reason: `Standalone phonics is not allowed in the ${hub} hub.` };
    }
    // Early-reader gate: Academy/Success only unlock standalone for Pre-A1/A1 learners.
    if (profile.early_reader_unlocks.includes('standalone') && !earlyReader) {
      return {
        hub,
        active_layers: [],
        reason: `Standalone phonics in ${hub} is reserved for early-reader learners (Pre-A1/A1).`,
      };
    }
    return { hub, active_layers: ['standalone'], reason: 'Dedicated phonics lesson.' };
  }

  if (lessonKind === 'booster') {
    if (!profile.allowed_layers.includes('booster')) {
      return { hub, active_layers: [], reason: `Booster lessons are not available in the ${hub} hub.` };
    }
    return { hub, active_layers: ['booster'], reason: 'Pronunciation/fluency workshop.' };
  }

  // Normal lesson — always integrated + micro when allowed.
  const layers: PronunciationLayer[] = [];
  if (profile.allowed_layers.includes('integrated')) layers.push('integrated');
  if (profile.allowed_layers.includes('micro')) layers.push('micro');
  // Early-reader inside a normal lesson: also surface a "micro phonics moment"
  // for Academy/Success learners who still can't decode.
  if (earlyReader && hub !== 'playground' && !layers.includes('micro')) {
    layers.push('micro');
  }
  return {
    hub,
    active_layers: layers,
    reason: earlyReader && hub !== 'playground'
      ? 'Embedded pronunciation + early-reader micro-phonics support.'
      : 'Embedded pronunciation support for a normal lesson.',
  };
}
