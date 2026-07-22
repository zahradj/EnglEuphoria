// Scaffolding ladder — picks the highest sustainable rung for the learner.

import type { SpeakingRung } from './types';
import type { HubSpeakingProfile } from './hubProfiles';

const RUNG_ORDER: SpeakingRung[] = ['repetition', 'cued', 'guided', 'free', 'spontaneous'];

export interface LadderInputs {
  current_rung: SpeakingRung;
  fluency: number;          // 0..1
  confidence: number;       // 0..1
  growth_trend: 'up' | 'flat' | 'down';
  bravery_count_7d: number;
  profile: HubSpeakingProfile;
}

function rungIndex(r: SpeakingRung) {
  return RUNG_ORDER.indexOf(r);
}

/**
 * Selects the next rung for the upcoming lesson.
 * Promotes only when combined fluency+confidence are high AND trend is up,
 * or when bravery signals are strong. Demotes when both are low.
 * Always clamped to the hub's max_rung.
 */
export function selectNextRung(input: LadderInputs): SpeakingRung {
  const ceilingIdx = rungIndex(input.profile.max_rung);
  const cur = rungIndex(input.current_rung);

  const fc = (input.fluency + input.confidence) / 2;
  const braveSignal = Math.min(1, input.bravery_count_7d / 6);

  let target = cur;
  if (fc >= 0.75 && (input.growth_trend === 'up' || braveSignal >= 0.5)) {
    target = cur + 1;
  } else if (fc >= 0.85 && braveSignal >= 0.7) {
    target = cur + 2; // rare leap
  } else if (fc < 0.35 && input.growth_trend === 'down') {
    target = cur - 1;
  }

  target = Math.max(0, Math.min(ceilingIdx, target));
  return RUNG_ORDER[target];
}

export function reachableRungs(currentRung: SpeakingRung, profile: HubSpeakingProfile): SpeakingRung[] {
  const ceilingIdx = rungIndex(profile.max_rung);
  const cur = rungIndex(currentRung);
  return RUNG_ORDER.slice(0, Math.min(ceilingIdx, cur + 1) + 1);
}
