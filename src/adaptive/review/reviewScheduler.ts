import type { ReviewQueueItem, SkillMasteryRecord, ErrorPattern } from '../types';

export interface ReviewSchedulerInput {
  mastery: SkillMasteryRecord[];
  errors: ErrorPattern[];
  now?: Date;
  max_items?: number;
}

const PRIORITY: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

const DOMAIN_TO_TYPE: Record<string, ReviewQueueItem['item_type']> = {
  vocabulary: 'vocab',
  grammar: 'grammar',
  pronunciation: 'pronunciation',
};

export function buildReviewQueue(input: ReviewSchedulerInput): ReviewQueueItem[] {
  const now = input.now ?? new Date();
  const max = input.max_items ?? 12;
  const items: ReviewQueueItem[] = [];

  for (const m of input.mastery) {
    const type = DOMAIN_TO_TYPE[m.skill_domain];
    if (!type) continue;
    const interval = sm2Interval(m);
    const due = new Date(now.getTime() + interval * 24 * 3600 * 1000);
    items.push({
      item_type: type,
      item_key: m.skill_key,
      priority: PRIORITY[m.review_priority] ?? 1,
      due_at: due.toISOString(),
    });
  }

  for (const e of input.errors) {
    if (e.frequency < 2) continue;
    const type: ReviewQueueItem['item_type'] =
      e.category === 'pronunciation_substitution' || e.category === 'word_stress'
        ? 'pronunciation'
        : 'grammar';
    items.push({
      item_type: type,
      item_key: e.pattern_key,
      priority: e.severity === 'high' ? 4 : e.severity === 'medium' ? 3 : 2,
      due_at: now.toISOString(),
    });
  }

  return items
    .sort((a, b) => b.priority - a.priority || a.due_at.localeCompare(b.due_at))
    .slice(0, max);
}

// Modified SM-2: interval shrinks with low mastery/confidence
function sm2Interval(m: SkillMasteryRecord): number {
  const q = (m.mastery + m.confidence) / 200; // 0-1
  if (q < 0.4) return 0; // due now
  if (q < 0.6) return 1;
  if (q < 0.75) return 3;
  if (q < 0.85) return 7;
  return 14;
}
