// Playground required-coverage validator.
// HARD-blocks if the lesson lacks ANY of: phonics/trace, listening, speaking.
// Also blocks any banned activity type (debate / opinion / reflection-essay).

import type { QAIssue, QALesson } from '@/qa/types';
import { PLAYGROUND_ACTIVITY_PROFILE } from '../types';

export function validateSpeakingFloor(lesson: QALesson): QAIssue[] {
  if (lesson.hub !== 'Playground') return [];
  const issues: QAIssue[] = [];

  const allTypes = new Set<string>();
  for (const slide of lesson.slides ?? []) {
    for (const a of slide.activities ?? []) {
      if (typeof a.type === 'string') allTypes.add(a.type);
    }
  }

  // Banned types
  for (const t of allTypes) {
    if (PLAYGROUND_ACTIVITY_PROFILE.banned.includes(t)) {
      issues.push({
        code: 'PG_ACTIVITY_BANNED',
        domain: 'activity',
        severity: 'block',
        message: `Playground lesson contains banned activity type "${t}".`,
        suggestion: 'Replace with story-driven, matching, drag_drop, or trace activity.',
        auto_repairable: true,
      });
    }
  }

  // Required coverage (any-of groups)
  for (const group of PLAYGROUND_ACTIVITY_PROFILE.required) {
    const options = group.split('|');
    const hasAny = options.some((o) => allTypes.has(o));
    if (!hasAny) {
      issues.push({
        code: 'PG_REQUIRED_COVERAGE_MISSING',
        domain: 'activity',
        severity: 'block',
        message: `Playground lesson missing required activity from group: ${options.join(' | ')}.`,
        suggestion: `Add at least one of: ${options.join(', ')}.`,
        auto_repairable: true,
      });
    }
  }

  return issues;
}
