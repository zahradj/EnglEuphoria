// Cognitive Load Plan — pacing, fatigue, modality alternation.

import { HUB_PLANNING_PROFILES } from './hubProfiles';
import type { CognitiveLoadPlan, LessonBlueprint } from './types';

export function buildCognitiveLoadPlan(
  blueprint: LessonBlueprint,
): CognitiveLoadPlan {
  // Start from the hub profile and let blueprint signals tighten the budget.
  const base = HUB_PLANNING_PROFILES[blueprint.hub].cognitive_load;

  // Heavy grammar focus -> tighter speaking cadence to keep lesson communicative.
  const heavyGrammar = blueprint.grammar_focus.length >= 2;

  return {
    ...base,
    speaking_every_n_slides: heavyGrammar
      ? Math.max(2, base.speaking_every_n_slides - 1)
      : base.speaking_every_n_slides,
  };
}
