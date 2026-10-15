import { describe, expect, it } from 'vitest';
import { SCENE_LESSON_REGISTRY } from './sceneLessonRegistry';
import { getWelcomeTownLesson } from './welcomeTownLessonRegistry';
import { LESSON_A1U2L1_SCENES, LESSON_A1U2L2_SCENES, LESSON_A1U2L3_SCENES, LESSON_A1U2L4_SCENES, LESSON_A1U2L5_SCENES, LESSON_A1U2L6_SCENES, LESSON_A1U2L7_SCENES } from './jungle-adventure/scenes';
import * as SPACE from './space-mission/scenes';
import * as FOOD from './food-festival/scenes';
import * as MONSTER from './monster-town/scenes';
import type { RecallWarmupSceneData } from './RecallWarmupScene';

// Owner's rule (2026-10-07, universal): every lesson after the first of its track opens
// with a short "Remember?" warm-up of the lesson before (listen and click / listen and
// match). See docs/playground-lesson-blueprint.md §3f.
type AnyScene = { id: string; kind: string };

/** A1/A2 lessons whose opener was authored as a review game before the rule (counts as the warm-up). */
const AUTHORED_REVIEW_OPENERS = new Set(['mc2-review-rooms', 'mc3-warmup-match']);

const lessons: [string, readonly AnyScene[]][] = [
  // Pre-A1: every lesson but the very first.
  ...Object.entries(SCENE_LESSON_REGISTRY).filter(([k]) => k !== '1-1'),
  // A1 / A2 worlds (the first lesson of each track has nothing before it).
  ...(['wt-rich-1-2', 'wt-rich-1-3', 'wt-rich-1-4', 'wt-rich-1-5', 'wt-rich-1-6', 'wt-rich-1-7', 'wt-a2-rich-1-2', 'wt-a2-rich-1-3', 'castle-rich-9-2', 'castle-rich-9-3', 'castle-rich-9-4'].map((k) => {
    const [fmt, u, l] = [k.replace(/-\d+-\d+$/, ''), Number(k.split('-').at(-2)), Number(k.split('-').at(-1))];
    return [k, getWelcomeTownLesson(fmt, u, l)?.scenes ?? []] as [string, readonly AnyScene[]];
  })),
  ['jungle-rich-2-1', LESSON_A1U2L1_SCENES],
  ['jungle-rich-2-2', LESSON_A1U2L2_SCENES],
  ['jungle-rich-2-3', LESSON_A1U2L3_SCENES],
  ['jungle-rich-2-4', LESSON_A1U2L4_SCENES],
  ['jungle-rich-2-5', LESSON_A1U2L5_SCENES],
  ['jungle-rich-2-6', LESSON_A1U2L6_SCENES],
  ['jungle-rich-2-7', LESSON_A1U2L7_SCENES],
  ['space-rich-3-1', SPACE.LESSON_A1U3L1_SCENES],
  ['space-rich-3-2', SPACE.LESSON_A1U3L2_SCENES],
  ['space-rich-3-3', SPACE.LESSON_A1U3L3_SCENES],
  ['space-rich-3-4', SPACE.LESSON_A1U3L4_SCENES],
  ['space-rich-3-5', SPACE.LESSON_A1U3L5_SCENES],
  ['space-rich-3-6', SPACE.LESSON_A1U3L6_SCENES],
  ['space-rich-3-7', SPACE.LESSON_A1U3L7_SCENES],
  ['food-rich-4-1', FOOD.LESSON_A1U4L1_SCENES],
  ['food-rich-4-2', FOOD.LESSON_A1U4L2_SCENES],
  ['food-rich-4-3', FOOD.LESSON_A1U4L3_SCENES],
  ['food-rich-4-4', FOOD.LESSON_A1U4L4_SCENES],
  ['food-rich-4-5', FOOD.LESSON_A1U4L5_SCENES],
  ['food-rich-4-6', FOOD.LESSON_A1U4L6_SCENES],
  ['food-rich-4-7', FOOD.LESSON_A1U4L7_SCENES],
  ['monster-rich-5-1', MONSTER.LESSON_A1U5L1_SCENES],
  ['monster-rich-5-2', MONSTER.LESSON_A1U5L2_SCENES],
  ['monster-rich-5-3', MONSTER.LESSON_A1U5L3_SCENES],
  ['monster-rich-5-4', MONSTER.LESSON_A1U5L4_SCENES],
  ['monster-rich-5-5', MONSTER.LESSON_A1U5L5_SCENES],
  ['monster-rich-5-6', MONSTER.LESSON_A1U5L6_SCENES],
  ['monster-rich-5-7', MONSTER.LESSON_A1U5L7_SCENES],
];

describe('Remember? warm-up', () => {
  it.each(lessons)('lesson %s opens with a recall of the lesson before', (_key, scenes) => {
    expect(scenes.length).toBeGreaterThan(0);
    const at = scenes.findIndex((s) => s.kind === 'recall-warmup' || AUTHORED_REVIEW_OPENERS.has(s.id));
    expect(at, 'add a recall-warmup scene near the start').toBeGreaterThan(0);
    expect(at, 'keep it in the first pages (after the title / hello song)').toBeLessThanOrEqual(3);
    const recalls = scenes.filter((s) => s.kind === 'recall-warmup') as unknown as RecallWarmupSceneData[];
    expect(recalls.length).toBeLessThanOrEqual(1);
    for (const r of recalls) {
      expect(r.items.length).toBeGreaterThanOrEqual(2);
      expect(r.items.length).toBeLessThanOrEqual(5);
      if (r.mode === 'shadow') for (const it of r.items) expect(it.img, 'shadow mode needs sticker pictures').not.toMatch(/\/scenes\//);
    }
  });
});
