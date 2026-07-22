// Playground low-text-density validator.
// SOFT-warns slides whose body_text exceeds the Playground char ceiling.
// HARD-blocks egregious overruns (>2x ceiling) — those are not Playground content.

import type { QAIssue, QALesson } from '@/qa/types';
import { PLAYGROUND_PACING } from '../types';

export function validateLowTextDensity(lesson: QALesson): QAIssue[] {
  if (lesson.hub !== 'Playground') return [];
  const issues: QAIssue[] = [];
  const ceiling = PLAYGROUND_PACING.maxTextLengthChars;

  for (const slide of lesson.slides ?? []) {
    const body = (slide.body_text ?? '').trim();
    if (!body) continue;
    const len = body.length;
    if (len > ceiling * 2) {
      issues.push({
        code: 'PG_TEXT_DENSITY_BLOCK',
        domain: 'activity',
        severity: 'block',
        message: `Playground slide ${slide.id} has ${len} chars of body text (hard cap ${ceiling * 2}). Convert to images + audio + short prompt.`,
        locator: { slideId: slide.id },
        suggestion: 'Replace long paragraphs with imagery, single instructions, or chunked activities.',
        auto_repairable: true,
      });
    } else if (len > ceiling) {
      issues.push({
        code: 'PG_TEXT_DENSITY_WARN',
        domain: 'activity',
        severity: 'warn',
        message: `Playground slide ${slide.id} has ${len} chars (soft cap ${ceiling}).`,
        locator: { slideId: slide.id },
        suggestion: 'Trim to ≤140 characters; pair with image/audio.',
        auto_repairable: true,
      });
    }
  }
  return issues;
}
