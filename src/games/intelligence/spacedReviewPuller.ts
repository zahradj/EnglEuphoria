// Spaced Review Puller — pulls due items from LearnerIntelligence.review_priority
// (backed by memory_items + SM-2+ scheduler in src/memory/).
//
// Only items whose due_at ≤ now are eligible. Ties broken by priority DESC.
// Games call this to inject 20–40% "review" items alongside fresh target items.

import type { GameItem } from './types';
import type { ReviewItem } from '@/intelligence/types';

export function pullSpacedReview(
  reviewQueue: ReviewItem[],
  limit: number,
  nowIso: string = new Date().toISOString(),
): GameItem[] {
  const now = Date.parse(nowIso);
  const due = reviewQueue
    .filter((r) => Date.parse(r.due_at) <= now)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, Math.max(0, limit));

  return due.map((r) => ({
    id: `review_${r.item_type}_${slug(r.item_key)}`,
    payload: r.item_key,
    meta: { item_type: r.item_type, priority: r.priority, due_at: r.due_at },
    provenance: 'spaced_review',
    value: Math.min(0.95, 0.6 + r.priority / 10),
  }));
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}
