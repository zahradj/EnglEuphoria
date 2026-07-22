// Optional metadata (Rule ✨): difficulty_level, skill_tag, xp_value.
// SOFT — emits `warn` so the repair pipeline can backfill, never blocks publish.
//
// Cycle 4 — added a HARD defense-in-depth gate:
//   ACTIVITY_ANALYTICAL_AT_PREA1 — blocks analytical activities at Pre-A1 / A1.
//   The selector should never let one through, but if a downstream tool
//   constructs a lesson manually we still want to block it.

import type { QAIssue, QALesson } from '../types';
import { isAnalyticalLocked } from '@/activities/catalog/activityAnnotations';
import type { ActivityType } from '@/activities/types';

const REQUIRED_META = ['difficulty_level', 'skill_tag', 'xp_value'] as const;

const CEFR_TO_LITE: Record<string, 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | null> = {
  'Pre-A1': 'Pre-A1', 'A1': 'A1', 'A2': 'A2', 'B1': 'B1', 'B2': 'B2', 'C1': 'C1',
};

export function validateActivityMetadata(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const rawCefr =
    (lesson as any).cefr ??
    (lesson as any).state?.cefr ??
    (lesson as any).lesson_state?.cefr ??
    '';
  const cefr = CEFR_TO_LITE[rawCefr] ?? null;

  for (const slide of lesson.slides ?? []) {
    for (const act of slide.activities ?? []) {
      const missing = REQUIRED_META.filter((k) => (act as any)[k] === undefined);
      if (missing.length > 0) {
        issues.push({
          code: 'META_INCOMPLETE',
          domain: 'activity',
          severity: 'warn',
          message: `Activity ${act.id} is missing metadata: ${missing.join(', ')}.`,
          locator: { slideId: slide.id, activityId: act.id },
          suggestion: 'Add difficulty_level (CEFR), skill_tag (vocab|grammar|reading|speaking|listening|phonics), and xp_value from the gamification engine.',
          auto_repairable: true,
        });
      }

      if (cefr && isAnalyticalLocked(act.type as ActivityType, cefr)) {
        issues.push({
          code: 'ACTIVITY_ANALYTICAL_AT_PREA1',
          domain: 'activity',
          severity: 'block',
          message: `Activity ${act.id} (${act.type}) is analytical and forbidden at ${cefr}. Use input-based or guided-output alternatives.`,
          locator: { slideId: slide.id, activityId: act.id },
          suggestion: 'Replace fill_blank/tense_transform/grammar_sort with substitution_drill, sentence_builder, or chunk_builder.',
          auto_repairable: true,
        });
      }
    }
  }
  return issues;
}
