// Vocabulary Recycling Plan.
// Each target word must surface across multiple pedagogical stages.

import type {
  LessonBlueprint,
  PedagogicalFlowMap,
  PedagogicalStage,
  VocabRecyclingPlan,
} from './types';

const MIN_STAGE_APPEARANCES = 3;

const PREFERRED_STAGES: PedagogicalStage[] = [
  'input',
  'controlled',
  'communicative',
  'production',
  'reflection',
];

export function buildVocabRecyclingPlan(
  blueprint: LessonBlueprint,
  flow: PedagogicalFlowMap,
): VocabRecyclingPlan[] {
  const availableStages = flow
    .map((s) => s.stage)
    .filter((s) => PREFERRED_STAGES.includes(s));

  return blueprint.target_vocab.map((word, i) => {
    // Rotate starting stage so words spread across the lesson naturally.
    const appearances: PedagogicalStage[] = [];
    for (let k = 0; k < Math.max(MIN_STAGE_APPEARANCES, 3); k++) {
      const stage = availableStages[(i + k) % availableStages.length];
      if (!appearances.includes(stage)) appearances.push(stage);
    }
    return { word, appearances };
  });
}
