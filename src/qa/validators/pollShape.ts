// Poll shape (Rule 4).
// `pct` in poll options implies real data. If `distribution_source` !== "real_data",
// the value must be renamed to `label_distribution`. Generation-time normalizer in
// src/utils/normalizePoll.ts handles the rename; this validator catches leftovers.

import type { QAIssue, QALesson } from '../types';

export function validatePollShape(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  for (const slide of lesson.slides ?? []) {
    for (const act of slide.activities ?? []) {
      if (!/poll/i.test(act.type ?? '')) continue;
      const options: any[] = act.content?.options ?? [];
      for (const o of options) {
        if (o == null) continue;
        const hasPct = Object.prototype.hasOwnProperty.call(o, 'pct');
        if (!hasPct) continue;
        const source = act.content?.distribution_source ?? o.distribution_source;
        if (source !== 'real_data') {
          issues.push({
            code: 'POLL_PCT_WITHOUT_SOURCE',
            domain: 'structural',
            severity: 'block',
            message: `Poll option uses "pct" without distribution_source="real_data" (activity ${act.id}).`,
            locator: { slideId: slide.id, activityId: act.id },
            suggestion: 'Rename "pct" to "label_distribution" and set distribution_source="illustrative", or supply real polling data with source="real_data".',
            auto_repairable: true,
          });
        }
      }
    }
  }
  return issues;
}
