// Personalization — injects learner interests into game item copy and
// distractor selection. Interests come from LearnerProfileLite.interests
// (populated by onboarding + Interest Injection cache).
//
// Rules:
//   - NEVER substitute the linguistic target (headword, target grammar frame).
//   - ONLY personalize surrounding context: setting, characters, distractors.
//   - Playground: concrete interests only (football, dinosaurs, cats, space).
//   - Success: professional interests welcome (career, travel, cooking).
//
// This module returns a DERIVED item list, not a mutation.

import type { GameItem } from './types';
import type { LearnerIntelligence } from '@/intelligence/types';

/** Simple template markers: {interest}, {interest_verb}, {interest_place}. */
const INTEREST_SETTINGS: Record<string, { place: string; verb: string }> = {
  football: { place: 'stadium', verb: 'kick' },
  soccer: { place: 'stadium', verb: 'kick' },
  dinosaurs: { place: 'museum', verb: 'roar' },
  space: { place: 'spaceship', verb: 'launch' },
  cats: { place: 'garden', verb: 'purr' },
  dogs: { place: 'park', verb: 'bark' },
  cooking: { place: 'kitchen', verb: 'cook' },
  travel: { place: 'airport', verb: 'travel' },
  music: { place: 'concert', verb: 'sing' },
  gaming: { place: 'arcade', verb: 'play' },
  reading: { place: 'library', verb: 'read' },
  art: { place: 'studio', verb: 'draw' },
};

export function personalizeItems(
  items: GameItem[],
  intel: Pick<LearnerIntelligence, 'learner_profile'>,
): { items: GameItem[]; interestsUsed: string[] } {
  const interests = (intel.learner_profile.interests ?? [])
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s in INTEREST_SETTINGS);

  if (interests.length === 0) {
    return { items, interestsUsed: [] };
  }

  const used = new Set<string>();
  const rotated = items.map((it, idx) => {
    const interest = interests[idx % interests.length];
    const spec = INTEREST_SETTINGS[interest];
    used.add(interest);
    // Only annotate — the game renderer reads `meta.setting` / `meta.theme`
    // and swaps context. The linguistic payload stays untouched.
    return {
      ...it,
      meta: {
        ...(it.meta ?? {}),
        setting: spec.place,
        theme_verb: spec.verb,
        interest,
      },
      provenance: it.provenance === 'baseline' ? 'interest_swap' : it.provenance,
    } as GameItem;
  });

  return { items: rotated, interestsUsed: [...used] };
}
