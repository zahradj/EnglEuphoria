import type { QAIssue, QALesson } from '../types';

export function validateJsonStructural(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];

  if (!lesson.hub) issues.push(err('STRUCT_MISSING_HUB', 'Lesson is missing `hub`.'));
  if (!lesson.cefr) issues.push(err('STRUCT_MISSING_CEFR', 'Lesson is missing `cefr`.'));
  if (!Array.isArray(lesson.slides) || lesson.slides.length === 0) {
    issues.push(err('STRUCT_NO_SLIDES', 'Lesson has no slides array.'));
    return issues;
  }

  const slideIds = new Set<string>();
  for (const [idx, slide] of lesson.slides.entries()) {
    if (!slide.id) {
      issues.push(err('STRUCT_SLIDE_MISSING_ID', `Slide #${idx} has no id.`, { slideId: String(idx) }));
    } else if (slideIds.has(slide.id)) {
      issues.push(err('STRUCT_DUPLICATE_SLIDE_ID', `Duplicate slide id "${slide.id}".`, { slideId: slide.id }));
    } else {
      slideIds.add(slide.id);
    }
    if (!slide.kind) {
      issues.push(err('STRUCT_SLIDE_MISSING_KIND', `Slide "${slide.id ?? idx}" has no kind.`, { slideId: slide.id }));
    }

    const actIds = new Set<string>();
    for (const a of slide.activities ?? []) {
      if (!a.id) {
        issues.push(err('STRUCT_ACTIVITY_MISSING_ID', `Activity missing id in slide "${slide.id}".`, { slideId: slide.id }));
      } else if (actIds.has(a.id)) {
        issues.push(err('STRUCT_DUPLICATE_ACTIVITY_ID', `Duplicate activity id "${a.id}".`, { slideId: slide.id, activityId: a.id }));
      } else {
        actIds.add(a.id);
      }
      if (!a.type) {
        issues.push(err('STRUCT_ACTIVITY_MISSING_TYPE', `Activity "${a.id}" missing type.`, { slideId: slide.id, activityId: a.id }));
      }
      if (a.content === null) {
        issues.push(err('STRUCT_ACTIVITY_NULL_CONTENT', `Activity "${a.id}" has null content.`, { slideId: slide.id, activityId: a.id }));
      }
    }
  }

  return issues;
}

function err(code: string, message: string, locator?: QAIssue['locator']): QAIssue {
  return {
    code,
    domain: 'structural',
    severity: 'block',
    message,
    locator,
    auto_repairable: false,
  };
}
