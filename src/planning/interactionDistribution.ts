// Interaction Distribution Plan.
// Ensures lessons balance reading / listening / speaking / writing / thinking /
// collaboration / reflection — never collapsing into worksheet drilling.

import type {
  InteractionDistribution,
  PedagogicalFlowMap,
} from './types';

export function buildInteractionDistribution(
  flow: PedagogicalFlowMap,
): InteractionDistribution {
  const dist: InteractionDistribution = {
    reading: 0,
    listening: 0,
    speaking: 0,
    writing: 0,
    thinking: 0,
    collaboration: 0,
    reflection: 0,
  };

  for (const stage of flow) {
    if (stage.modalities.length === 0) continue;
    // Split the stage's slide_count across its declared modalities.
    const each = stage.slide_count / stage.modalities.length;
    for (const m of stage.modalities) {
      dist[m] = +(dist[m] + each).toFixed(2);
    }
  }

  return dist;
}
