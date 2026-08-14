// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  LESSON_1_SCENES,
  LESSON_2_SCENES,
  LESSON_3_SCENES,
  LESSON_4_SCENES,
  LESSON_5_SCENES,
  LESSON_6_SCENES,
  LESSON_U2L1_SCENES,
  LESSON_U2L2_SCENES,
  LESSON_U2L3_SCENES,
  LESSON_U2L4_SCENES,
  LESSON_U2L5_SCENES,
  LESSON_U2L6_SCENES,
  LESSON_U3L1_SCENES,
  LESSON_U3L2_SCENES,
} from './scenes';
import { validateLesson, formatValidationResult, type ValidationContext } from './sceneValidator';

const LESSONS: { ctx: ValidationContext; scenes: unknown[] }[] = [
  { ctx: { lessonNumber: 1, targetLetters: ['H', 'M'] }, scenes: LESSON_1_SCENES },
  { ctx: { lessonNumber: 2, targetLetters: ['N', 'W'] }, scenes: LESSON_2_SCENES },
  { ctx: { lessonNumber: 3, targetLetters: ['S', 'A'] }, scenes: LESSON_3_SCENES },
  { ctx: { lessonNumber: 4 }, scenes: LESSON_4_SCENES },
  { ctx: { lessonNumber: 5 }, scenes: LESSON_5_SCENES },
  { ctx: { lessonNumber: 6 }, scenes: LESSON_6_SCENES },
  { ctx: { lessonNumber: 'U2L1' }, scenes: LESSON_U2L1_SCENES },
  { ctx: { lessonNumber: 'U2L2' }, scenes: LESSON_U2L2_SCENES },
  { ctx: { lessonNumber: 'U2L3' }, scenes: LESSON_U2L3_SCENES },
  { ctx: { lessonNumber: 'U2L4' }, scenes: LESSON_U2L4_SCENES },
  { ctx: { lessonNumber: 'U2L5' }, scenes: LESSON_U2L5_SCENES },
  { ctx: { lessonNumber: 'U2L6' }, scenes: LESSON_U2L6_SCENES },
  { ctx: { lessonNumber: 'U3L1' }, scenes: LESSON_U3L1_SCENES },
  { ctx: { lessonNumber: 'U3L2' }, scenes: LESSON_U3L2_SCENES },
];

describe('Playground scene validation', () => {
  for (const { ctx, scenes } of LESSONS) {
    it(`Lesson ${ctx.lessonNumber} has no structural errors`, () => {
      const result = validateLesson(scenes, ctx);
      if (result.warnings.length) console.warn(formatValidationResult(ctx, result));
      if (!result.ok) {
        throw new Error(formatValidationResult(ctx, result));
      }
      expect(result.ok).toBe(true);
    });
  }
});
