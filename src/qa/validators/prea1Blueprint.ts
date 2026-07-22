// Pre-A1 Blueprint QA validator — HARD-blocks reading-dependent activities
// AND enforces the per-lesson speaking-floor + TPR minimum from the
// PREA1_UNIT_BLUEPRINT for non-reader learners.
//
// Backed by src/planning/prea1Blueprint.ts.

import type { QAIssue, QALesson } from '../types';
import {
  PREA1_FORBIDDEN_ACTIVITIES,
  PREA1_UNIT_BLUEPRINT,
  validatePrea1Blueprint,
  type Prea1LessonSpec,
} from '@/planning/prea1Blueprint';

const SPEAKING_TYPES = new Set([
  'echo', 'mimic', 'point_and_say', 'song_gesture',
  'speaking_mission', 'shadowing', 'repeat_after_audio',
]);
const TPR_TYPES = new Set([
  'tpr_action', 'song_gesture', 'syllable_clap',
]);

/** Map Playground lesson_kind → lesson_number in the 6-lesson arc. */
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

function specFor(lesson: QALesson): Prea1LessonSpec | null {
  const n = kindToLessonNumber(lesson.lesson_kind);
  if (!n) return null;
  return PREA1_UNIT_BLUEPRINT.find((s) => s.lesson_number === n) ?? null;
}

export function validatePrea1BlueprintQA(lesson: QALesson): QAIssue[] {
  if (lesson.cefr !== 'Pre-A1') return [];

  const issues: QAIssue[] = [];
  const allActs = (lesson.slides ?? []).flatMap((s) =>
    (s.activities ?? []).map((a) => ({ slideId: s.id, ...a })),
  );

  // 1. Forbidden reading-dependent activities (HARD)
  for (const slide of lesson.slides ?? []) {
    const acts = slide.activities ?? [];
    const violations = validatePrea1Blueprint(acts.map((a) => ({ type: a.type })));
    for (const v of violations) {
      const [, badType] = v.split(':');
      const target = acts.find((a) => a.type === badType);
      issues.push({
        code: 'PREA1_FORBIDDEN_ACTIVITY',
        domain: 'age',
        severity: 'block',
        message: `Pre-A1 non-readers cannot do "${badType}". Reading-dependent activities are forbidden at this level.`,
        locator: { slideId: slide.id, activityId: target?.id },
        suggestion: `Replace with a picture/audio-only activity (listen_match, echo, picture_bingo, point_and_say, tpr_action).`,
        auto_repairable: true,
      });
    }
  }

  // 2. Per-lesson floors from the unit blueprint (HARD)
  const spec = specFor(lesson);
  if (spec) {
    const speakingCount = allActs.filter((a) => SPEAKING_TYPES.has(a.type)).length;
    if (speakingCount < spec.speaking_floor) {
      issues.push({
        code: 'PREA1_SPEAKING_FLOOR_UNMET',
        domain: 'age',
        severity: 'block',
        message: `Pre-A1 L${spec.lesson_number} requires ≥${spec.speaking_floor} speaking tasks (got ${speakingCount}).`,
        suggestion: `Add echo / mimic / point_and_say / song_gesture activities.`,
        auto_repairable: true,
      });
    }
    const tprCount = allActs.filter((a) => TPR_TYPES.has(a.type)).length;
    if (tprCount < spec.tpr_min) {
      issues.push({
        code: 'PREA1_TPR_MIN_UNMET',
        domain: 'age',
        severity: 'block',
        message: `Pre-A1 L${spec.lesson_number} requires ≥${spec.tpr_min} TPR resets (got ${tprCount}).`,
        suggestion: `Insert tpr_action / song_gesture / syllable_clap every 3rd activity.`,
        auto_repairable: true,
      });
    }
  }

  // 3. Text-density guard (HARD): Pre-A1 non-readers cannot decode printed
  //    prose. Any activity `content` string field over 5 words is a leak,
  //    regardless of activity type. Vocab headwords (single words) are fine.
  const TEXT_FIELDS = ['prompt', 'text', 'sentence', 'question', 'instruction'];
  const WORD_CAP = 5;
  for (const slide of lesson.slides ?? []) {
    for (const a of slide.activities ?? []) {
      const c = (a as any).content;
      if (!c || typeof c !== 'object') continue;
      for (const f of TEXT_FIELDS) {
        const v = c[f];
        if (typeof v !== 'string') continue;
        const words = v.trim().split(/\s+/).filter(Boolean);
        if (words.length > WORD_CAP) {
          issues.push({
            code: 'PREA1_PRINTED_PROSE_LEAK',
            domain: 'age',
            severity: 'block',
            message: `Pre-A1 activity "${a.id}" has printed prose in content.${f} (${words.length} words). Non-readers cannot decode text over ${WORD_CAP} words.`,
            locator: { slideId: slide.id, activityId: a.id, path: `content.${f}` },
            suggestion: `Replace long prompts with an audio prompt, image, or ≤${WORD_CAP}-word chunk.`,
            auto_repairable: true,
          });
        }
      }
    }
  }

  return issues;
}

export { PREA1_FORBIDDEN_ACTIVITIES };
