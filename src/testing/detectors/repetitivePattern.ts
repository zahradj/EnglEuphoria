// Detector: repetitive activity-type n-grams (windows of 3 identical).
import type { DetectorFailure } from '../types';
import { normalizeLesson, fail } from './_shared';

export function detectRepetitivePattern(lesson: any): DetectorFailure[] {
  const { activities } = normalizeLesson(lesson);
  const failures: DetectorFailure[] = [];
  for (let i = 0; i < activities.length - 2; i++) {
    const [a, b, c] = [activities[i], activities[i + 1], activities[i + 2]];
    if (a.type && a.type === b.type && b.type === c.type) {
      failures.push(
        fail(
          'repetitivePattern',
          'repetitive_pattern',
          `3 consecutive "${a.type}" activities (slides ${a.index}-${c.index})`,
          { slideIndex: a.index, severity: 'warn', evidence: { type: a.type, indices: [a.index, b.index, c.index] } },
        ),
      );
    }
  }
  // Type diversity check: <3 unique types in a 6+ activity lesson
  if (activities.length >= 6) {
    const unique = new Set(activities.map((a) => a.type)).size;
    if (unique < 3) {
      failures.push(
        fail('repetitivePattern', 'activity_diversity', `Only ${unique} unique activity types across ${activities.length} activities`, {
          severity: 'warn',
          evidence: { unique, total: activities.length },
        }),
      );
    }
  }
  return failures;
}
