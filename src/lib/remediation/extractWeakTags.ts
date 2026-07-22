import type { QuizItemResult, QuizResultPayload } from './types';
import { PASS_THRESHOLD } from './constants';

/**
 * Aggregate per-question results from a Unit Quiz into a `QuizResultPayload`
 * grouped by `skill_tag`. A tag is considered "failed" when the learner got
 * any item carrying that tag wrong — this gives the remedial generator a
 * conservative, targeted view of weaknesses.
 */
export function extractWeakTags(items: QuizItemResult[]): QuizResultPayload {
  const total = items.length;
  const score = items.filter((i) => i.correct).length;
  const percent = total === 0 ? 0 : Math.round((score / total) * 100);

  const failedSet = new Set<string>();
  const passedSet = new Set<string>();
  for (const it of items) {
    const tag = (it.skill_tag || '').trim();
    if (!tag) continue;
    if (it.correct) passedSet.add(tag);
    else failedSet.add(tag);
  }
  // A tag that was failed even once should NOT appear in passed_tags.
  for (const t of failedSet) passedSet.delete(t);

  return {
    score,
    total,
    percent,
    passed: percent >= PASS_THRESHOLD,
    passed_tags: [...passedSet].sort(),
    failed_tags: [...failedSet].sort(),
  };
}
