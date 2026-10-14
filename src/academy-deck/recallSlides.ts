// Builds the "Remember?" game of a lesson from the spaced recall plan (src/curriculum/academy/recall.ts), so the player brings back what is DUE,
// not what the author remembered to include. Docs: docs/academy-recall-spacing-progression.md. Pure; no React.
import { MAX_REMEMBER_ITEMS, recallPlan, type RecallNode } from '../curriculum/academy';
import type { HearPickSlide } from './types';

/** One item per earlier lesson in turn (nearest gap first), so every gap in the plan is represented; at most `n` items. */
export function dueItems(nodes: readonly RecallNode[], lessonId: string, n: number, cap = MAX_REMEMBER_ITEMS): string[] {
  const plan = recallPlan(nodes, lessonId, cap);
  if (!plan) return [];
  const queues = plan.due.map((d) => [...d.items]);
  const out: string[] = [];
  while (out.length < n && queues.some((q) => q.length)) for (const q of queues) { const x = q.shift(); if (x !== undefined && out.length < n) out.push(x); }
  return out;
}

/** Hear-and-pick rounds for the due items: the guide says an item, the student picks it from three (the other options are other due items, rotating). */
export function recallRounds(nodes: readonly RecallNode[], lessonId: string, n: number, cap?: number): HearPickSlide['rounds'] {
  const items = dueItems(nodes, lessonId, Math.max(n, 3), cap);
  if (items.length < 3) return [];
  return items.slice(0, n).map((say, i) => ({ say, options: [items[(i + 1) % items.length], say, items[(i + 2) % items.length]].filter((o, k, a) => a.indexOf(o) === k), answer: say }));
}
