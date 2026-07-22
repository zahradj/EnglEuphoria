// Emotional memory reinforcement.
// Wraps review entries with recurring characters / arcs from narrative_state.

import type { LearnerIntelligence } from '@/intelligence/types';
import type { ReviewQueueEntry } from './types';

export interface EmotionalAnchor {
  characterName?: string;
  arcTitle?: string;
  lastBeat?: string;
}

export function buildEmotionalAnchor(intel: LearnerIntelligence): EmotionalAnchor {
  const ch = intel.narrative_state.active_characters[0];
  return {
    characterName: ch?.name,
    arcTitle: intel.narrative_state.current_arc?.title,
    lastBeat: intel.narrative_state.last_beat?.summary,
  };
}

export function attachAnchors(
  queue: ReviewQueueEntry[],
  anchor: EmotionalAnchor,
): ReviewQueueEntry[] {
  if (!anchor.characterName && !anchor.arcTitle) return queue;
  return queue.map((e) => ({
    ...e,
    item: {
      ...e.item,
      last_context: {
        ...(e.item.last_context ?? {}),
        character: anchor.characterName,
        arc: anchor.arcTitle,
        beat: anchor.lastBeat,
      },
    },
  }));
}
