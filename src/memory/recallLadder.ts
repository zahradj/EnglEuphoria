// Passive → Active recall escalation.
// Picks next RecallLevel per item based on mastery deltas.

import type { ReviewQueueEntry, RecallLevel } from './types';

export function escalateRecallLevel(entry: ReviewQueueEntry): ReviewQueueEntry {
  const item = entry.item;
  const active = item.active_mastery ?? 0;
  const passive = item.passive_mastery ?? 0;
  const gap = passive - active;

  let level: RecallLevel = item.recall_level ?? 1;

  // If passive >> active, push toward active production
  if (gap > 0.3) level = clamp(level + 1);
  // High active mastery — push to spontaneous
  if (active >= 0.85) level = clamp(level + 1);
  // Very weak — drop back to recognition
  if (active < 0.2 && passive < 0.3) level = 1;
  // Speaking-required items must reach ≥3
  if (entry.must_be_spoken && level < 3) level = 3;

  return { ...entry, target_recall_level: level };
}

function clamp(n: number): RecallLevel {
  return Math.max(1, Math.min(5, n)) as RecallLevel;
}
