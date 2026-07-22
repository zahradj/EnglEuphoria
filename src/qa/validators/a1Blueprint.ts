// A1 Blueprint QA validator — HARD-blocks advanced writing/debate types,
// enforces ≤8-word sentence cap, speaking floor, and the writing gate.
//
// Backed by src/planning/a1Blueprint.ts.

import type { QAIssue, QALesson } from '../types';
import {
  A1_FORBIDDEN_ACTIVITIES,
  A1_WRITING_GATED_TYPES,
  A1_UNIT_BLUEPRINT,
  A1_MAX_SENTENCE_WORDS,
  type A1LessonSpec,
} from '@/planning/a1Blueprint';

const SPEAKING_TYPES = new Set([
  'echo', 'mimic', 'point_and_say', 'song_gesture',
  'speaking_mission', 'shadowing', 'repeat_after_audio',
  'pronunciation', 'storytelling',
]);

function kindToLessonNumber(kind?: string): number | null {
  switch (kind) {
    case 'discovery': return 1;
    case 'expansion': return 2;
    case 'extension': return 3;
    case 'practice': return 4;
    case 'storybook': return 5;
    case 'review':
    case 'mastery_quiz': return 6;
    default: return null;
  }
}

function specFor(lesson: QALesson): A1LessonSpec | null {
  const n = kindToLessonNumber(lesson.lesson_kind);
  if (!n) return null;
  return A1_UNIT_BLUEPRINT.find((s) => s.lesson_number === n) ?? null;
}

export function validateA1BlueprintQA(lesson: QALesson): QAIssue[] {
  if (lesson.cefr !== 'A1' || lesson.hub !== 'Playground') return [];

  const issues: QAIssue[] = [];
  const spec = specFor(lesson);
  const allActs = (lesson.slides ?? []).flatMap((s) =>
    (s.activities ?? []).map((a) => ({ slideId: s.id, ...a })),
  );

  // 1. Forbidden activities + writing gate (HARD)
  for (const slide of lesson.slides ?? []) {
    for (const a of slide.activities ?? []) {
      if (A1_FORBIDDEN_ACTIVITIES.includes(a.type)) {
        issues.push({
          code: 'A1_FORBIDDEN_ACTIVITY',
          domain: 'age',
          severity: 'block',
          message: `A1 early readers cannot do "${a.type}". Advanced writing/opinion activities are forbidden at this level.`,
          locator: { slideId: slide.id, activityId: a.id },
          suggestion: `Replace with matching, drag_drop, echo, point_and_say, or short guided reading.`,
          auto_repairable: true,
        });
      }
      if (A1_WRITING_GATED_TYPES.includes(a.type) && spec && !spec.allow_writing) {
        issues.push({
          code: 'A1_WRITING_GATE_VIOLATION',
          domain: 'age',
          severity: 'block',
          message: `A1 L${spec.lesson_number} does not permit "${a.type}" — free/sentence writing is gated to L4+.`,
          locator: { slideId: slide.id, activityId: a.id },
          suggestion: `Move writing tasks to L4+ or replace with a word-level trace/matching activity.`,
          auto_repairable: true,
        });
      }
    }
  }

  // 2. Speaking floor (HARD)
  if (spec) {
    const speakingCount = allActs.filter((a) => SPEAKING_TYPES.has(a.type)).length;
    if (speakingCount < spec.speaking_floor) {
      issues.push({
        code: 'A1_SPEAKING_FLOOR_UNMET',
        domain: 'age',
        severity: 'block',
        message: `A1 L${spec.lesson_number} requires ≥${spec.speaking_floor} speaking tasks (got ${speakingCount}).`,
        suggestion: `Add echo / point_and_say / speaking_mission activities.`,
        auto_repairable: true,
      });
    }
  }

  // 3. Sentence-length cap (HARD): ≤ 8 words in any content string field.
  const TEXT_FIELDS = ['prompt', 'text', 'sentence', 'question', 'instruction'];
  for (const slide of lesson.slides ?? []) {
    for (const a of slide.activities ?? []) {
      const c = (a as any).content;
      if (!c || typeof c !== 'object') continue;
      for (const f of TEXT_FIELDS) {
        const v = c[f];
        if (typeof v !== 'string') continue;
        const words = v.trim().split(/\s+/).filter(Boolean);
        if (words.length > A1_MAX_SENTENCE_WORDS) {
          issues.push({
            code: 'A1_SENTENCE_TOO_LONG',
            domain: 'age',
            severity: 'block',
            message: `A1 activity "${a.id}" has ${words.length} words in content.${f}. Cap is ${A1_MAX_SENTENCE_WORDS} words for early readers.`,
            locator: { slideId: slide.id, activityId: a.id, path: `content.${f}` },
            suggestion: `Shorten to ≤${A1_MAX_SENTENCE_WORDS} words or split across multiple prompts.`,
            auto_repairable: true,
          });
        }
      }
    }
  }

  return issues;
}
