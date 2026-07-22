// Speaking memory reinforcement.
// Tags entries that MUST surface through speaking, never just recognition.

import type { LearnerIntelligence } from '@/intelligence/types';
import type { ReviewQueueEntry } from './types';

export function reinforceSpeaking(
  queue: ReviewQueueEntry[],
  intel: LearnerIntelligence,
): ReviewQueueEntry[] {
  const fragile =
    intel.speaking_confidence.tier === 'shy' ||
    intel.speaking_confidence.tier === 'emerging';

  return queue.map((e) => {
    const speakingGap = 1 - (e.item.speaking_retention ?? 0);
    const must =
      e.must_be_spoken ||
      (fragile && (e.item.skill_kind === 'vocab' || e.item.skill_kind === 'grammar') && speakingGap > 0.4);
    return {
      ...e,
      must_be_spoken: must,
      target_recall_level: must && e.target_recall_level < 3 ? 3 : e.target_recall_level,
    };
  });
}
