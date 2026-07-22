// Interleaving engine — mix skill kinds across a review batch.
// Avoids isolated-topic review. Respects cognitive-load cap.

import type { ReviewQueueEntry, SkillKind } from './types';

export interface InterleaveOptions {
  maxItems: number;            // hard cap from planner / hub profile
  minKindDiversity: number;    // e.g. 3 — at least 3 different skill kinds when possible
}

export function interleave(
  queue: ReviewQueueEntry[],
  opts: InterleaveOptions,
): { selected: ReviewQueueEntry[]; mix: SkillKind[] } {
  // Group by kind preserving priority order
  const groups = new Map<SkillKind, ReviewQueueEntry[]>();
  for (const e of queue) {
    const arr = groups.get(e.item.skill_kind) ?? [];
    arr.push(e);
    groups.set(e.item.skill_kind, arr);
  }

  const kinds = Array.from(groups.keys());
  const selected: ReviewQueueEntry[] = [];

  // Round-robin across kinds so the batch is mixed
  let idx = 0;
  while (selected.length < opts.maxItems && kinds.some((k) => (groups.get(k) ?? []).length > 0)) {
    const k = kinds[idx % kinds.length];
    const next = groups.get(k)?.shift();
    if (next) selected.push(next);
    idx += 1;
  }

  const mix = Array.from(new Set(selected.map((e) => e.item.skill_kind)));
  return { selected, mix };
}
