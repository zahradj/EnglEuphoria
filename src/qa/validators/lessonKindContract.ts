// Lesson-kind contract validator (Playground only).
//
// Checks that a generated lesson honors the per-L# blueprint contract:
//   - required activity types are present
//   - forbidden activity types are absent
//   - media recipe is satisfied (storybook pages for L5, etc.)
//   - L5 carries a storybook style declaration
//
// No-op when:
//   - lesson.hub !== 'Playground'
//   - lesson.lesson_kind is missing (legacy / non-contract lessons)

import {
  getPlaygroundLessonContract,
} from '@/planning/playgroundLessonContract';
import type { QAIssue, QALesson } from '../types';

export function validateLessonKindContract(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  if (String(lesson.hub).toLowerCase() !== 'playground') return issues;

  const kind = (lesson as any).lesson_kind;
  const contract = getPlaygroundLessonContract(kind);
  if (!contract) return issues; // no contract to enforce

  const presentTypes = new Set<string>();
  for (const s of lesson.slides ?? []) {
    for (const a of s.activities ?? []) {
      if (a?.type) presentTypes.add(String(a.type));
    }
  }

  // 1. Required activity types
  for (const req of contract.required_activity_types) {
    if (!presentTypes.has(req)) {
      issues.push({
        code: 'KIND_REQUIRED_ACTIVITY_MISSING',
        domain: 'activity',
        severity: 'block',
        message: `Lesson kind "${contract.kind}" (L${contract.lesson_number}) requires activity type "${req}" but none was generated.`,
        suggestion: `Add a "${req}" activity to satisfy the ${contract.kind} blueprint contract.`,
        auto_repairable: true,
      });
    }
  }

  // 2. Forbidden activity types
  for (const slide of lesson.slides ?? []) {
    for (const a of slide.activities ?? []) {
      if (contract.forbidden_activity_types.includes(a.type as never)) {
        issues.push({
          code: 'KIND_FORBIDDEN_ACTIVITY_PRESENT',
          domain: 'activity',
          severity: 'block',
          message: `Activity type "${a.type}" is forbidden in lesson kind "${contract.kind}" (L${contract.lesson_number}).`,
          locator: { slideId: slide.id, activityId: a.id },
          suggestion: 'Remove this activity or swap it for one of the required types.',
          auto_repairable: true,
        });
      }
    }
  }

  // 3. Media recipe underfilled — storybook pages (L5 is the canonical case)
  const recipe = contract.media_recipe;
  if (recipe.storybook_pages > 0) {
    const storyPageCount = countStoryPages(lesson);
    if (storyPageCount < recipe.storybook_pages) {
      issues.push({
        code: 'KIND_MEDIA_RECIPE_UNDERFILLED',
        domain: 'activity',
        severity: 'block',
        message: `Lesson kind "${contract.kind}" requires ${recipe.storybook_pages} storybook pages; only ${storyPageCount} were generated.`,
        auto_repairable: true,
      });
    }

    // 3b. Storybook style declaration (read from media_plan if present)
    const mediaPlan = (lesson as any).media_plan;
    if (mediaPlan && !mediaPlan.storybook_style) {
      issues.push({
        code: 'KIND_STORYBOOK_STYLE_MISSING',
        domain: 'narrative',
        severity: 'block',
        message: 'L5 storybook lesson is missing a storybook_style on media_plan.',
        suggestion: 'Run media planner (pickStorybookStyle) before publish.',
        auto_repairable: true,
      });
    }
  }

  return issues;
}

function countStoryPages(lesson: QALesson): number {
  let n = 0;
  for (const s of lesson.slides ?? []) {
    for (const a of s.activities ?? []) {
      if (a.type === 'interactive_story' || a.type === 'story_reconstruction') n++;
      const content = a?.content;
      if (content && Array.isArray((content as any).pages)) {
        n += (content as any).pages.length;
      }
    }
  }
  return n;
}
