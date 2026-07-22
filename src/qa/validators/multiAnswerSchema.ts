// Multi-answer schema standardization.
// Forbids legacy `answer: "a,b"` shapes; requires `answers: string[]`
// for fill_blank / matching / sound_discrimination / drag_drop / dictation.

import type { QAActivity, QAIssue, QALesson } from '../types';

const MULTI_TYPES = /fill_blank|matching|sound_discrimination|drag_drop|dictation_builder|listen_and_match/i;

export function validateMultiAnswerSchema(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  for (const slide of lesson.slides ?? []) {
    for (const act of slide.activities ?? []) {
      if (!MULTI_TYPES.test(act.type || '')) continue;
      walkItems(act, (item, path) => {
        const hasLegacy =
          typeof item.answer === 'string' && /,|;|\|/.test(item.answer);
        if (hasLegacy) {
          issues.push({
            code: 'MULTI_ANSWER_SCHEMA_INVALID',
            domain: 'structural',
            severity: 'block',
            message: `Legacy comma-string answer at ${path} (activity ${act.id}). Use "answers": string[] instead.`,
            locator: { slideId: slide.id, activityId: act.id, path },
            suggestion: 'Replace "answer": "a,b" with "answers": ["a","b"].',
            auto_repairable: true,
          });
        }
        if (Array.isArray(item.answers)) {
          for (const a of item.answers) {
            if (typeof a !== 'string' || !a.trim()) {
              issues.push({
                code: 'MULTI_ANSWER_SCHEMA_INVALID',
                domain: 'structural',
                severity: 'block',
                message: `Empty or non-string entry in answers[] at ${path} (activity ${act.id}).`,
                locator: { slideId: slide.id, activityId: act.id, path },
                auto_repairable: true,
              });
              break;
            }
          }
        }
      });
    }
  }
  return issues;
}

function walkItems(act: QAActivity, fn: (item: any, path: string) => void) {
  const content = act.content ?? {};
  const buckets = ['items', 'sentences', 'pairs', 'questions', 'options'];
  for (const b of buckets) {
    const arr = content[b];
    if (Array.isArray(arr)) {
      arr.forEach((it, i) => fn(it, `content.${b}[${i}]`));
    }
  }
}
