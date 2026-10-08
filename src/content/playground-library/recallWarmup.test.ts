import { describe, expect, it } from 'vitest';
import { SCENE_LESSON_REGISTRY } from './sceneLessonRegistry';
import { getWelcomeTownLesson } from './welcomeTownLessonRegistry';
import { LESSON_A1U2L1_SCENES } from './jungle-adventure/scenes';
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
  ...(['wt-rich-1-2', 'wt-rich-1-3', 'wt-rich-1-4', 'wt-a2-rich-1-2', 'wt-a2-rich-1-3', 'castle-rich-9-2', 'castle-rich-9-3'].map((k) => {
    const [fmt, u, l] = [k.replace(/-\d+-\d+$/, ''), Number(k.split('-').at(-2)), Number(k.split('-').at(-1))];
    return [k, getWelcomeTownLesson(fmt, u, l)?.scenes ?? []] as [string, readonly AnyScene[]];
  })),
  ['jungle-rich-2-1', LESSON_A1U2L1_SCENES],
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
