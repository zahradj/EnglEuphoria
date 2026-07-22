// JSON / structural integrity guard. Runs FIRST in the QA pipeline.
// Hard-blocks unparseable, truncated, placeholder, or empty-required content
// so broken AI output (e.g. "[\n{a") can never reach downstream engines.

import type { QAIssue, QALesson } from '../types';

const PLACEHOLDER_RX =
  /(lorem ipsum|todo:|\[insert|__error|generation_failed|new sentence here|example here|placeholder|xxx{2,})/i;

export function validateJsonIntegrity(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];

  if (!lesson || typeof lesson !== 'object') {
    issues.push({
      code: 'JSON_LESSON_MALFORMED',
      domain: 'structural',
      severity: 'block',
      message: 'Lesson payload is not a valid object.',
      auto_repairable: false,
    });
    return issues;
  }

  if (!Array.isArray(lesson.slides) || lesson.slides.length === 0) {
    issues.push({
      code: 'JSON_NO_SLIDES',
      domain: 'structural',
      severity: 'block',
      message: 'Lesson has no slides array or is empty.',
      auto_repairable: false,
    });
    return issues;
  }

  for (const slide of lesson.slides) {
    if (!slide || typeof slide !== 'object') {
      issues.push({
        code: 'JSON_SLIDE_MALFORMED',
        domain: 'structural',
        severity: 'block',
        message: 'A slide is not a valid object.',
        auto_repairable: false,
      });
      continue;
    }
    if (!slide.id || !slide.kind) {
      issues.push({
        code: 'JSON_SLIDE_MISSING_KEYS',
        domain: 'structural',
        severity: 'block',
        message: `Slide is missing required keys (id/kind): ${JSON.stringify(slide).slice(0, 80)}`,
        locator: { slideId: slide.id },
        auto_repairable: true,
      });
    }

    // Scan all string leaves for truncation / placeholder leaks.
    walkStrings(slide, (s, path) => {
      const trimmed = s.trim();
      if (trimmed.length === 0) return;
      if (PLACEHOLDER_RX.test(trimmed)) {
        issues.push({
          code: 'JSON_PLACEHOLDER_LEAK',
          domain: 'structural',
          severity: 'block',
          message: `Placeholder text leaked into slide content at ${path}: "${trimmed.slice(0, 60)}".`,
          locator: { slideId: slide.id, path },
          auto_repairable: true,
        });
      }
      // Truncation heuristic: stray opening brace / bracket / unmatched quote
      // at the END of a string is almost always a parse-snapshot artifact.
      if (/[{[]\s*[A-Za-z]?$/.test(trimmed) && trimmed.length < 12) {
        issues.push({
          code: 'JSON_TRUNCATED_VALUE',
          domain: 'structural',
          severity: 'block',
          message: `Truncated value detected at ${path}: "${trimmed}".`,
          locator: { slideId: slide.id, path },
          auto_repairable: true,
        });
      }
    });

    // Activities must have id+type and a non-null content.
    for (const a of slide.activities ?? []) {
      if (!a?.id || !a?.type) {
        issues.push({
          code: 'JSON_ACTIVITY_MISSING_KEYS',
          domain: 'structural',
          severity: 'block',
          message: 'Activity missing required keys (id/type).',
          locator: { slideId: slide.id, activityId: a?.id },
          auto_repairable: true,
        });
      }
      if (a?.content == null) {
        issues.push({
          code: 'JSON_ACTIVITY_EMPTY_CONTENT',
          domain: 'structural',
          severity: 'block',
          message: `Activity "${a?.id ?? '?'}" has empty content.`,
          locator: { slideId: slide.id, activityId: a?.id },
          auto_repairable: true,
        });
      }
      if (a?.content && typeof a.content === 'object' && '__error' in a.content) {
        issues.push({
          code: 'JSON_ACTIVITY_GENERATION_FAILED',
          domain: 'structural',
          severity: 'block',
          message: `Activity "${a.id}" carries a generation-failure marker.`,
          locator: { slideId: slide.id, activityId: a.id },
          auto_repairable: true,
        });
      }
    }
  }

  return issues;
}

function walkStrings(node: any, visit: (s: string, path: string) => void, path = '$') {
  if (node == null) return;
  if (typeof node === 'string') return visit(node, path);
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkStrings(v, visit, `${path}[${i}]`));
    return;
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) walkStrings(v, visit, `${path}.${k}`);
  }
}
