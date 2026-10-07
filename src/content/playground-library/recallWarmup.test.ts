import { describe, expect, it } from 'vitest';
import { SCENE_LESSON_REGISTRY } from './sceneLessonRegistry';

// Owner's rule (2026-10-07): every lesson after the very first opens with a short
// "Remember?" warm-up of the lesson before (listen and click / listen and match).
const keys = Object.keys(SCENE_LESSON_REGISTRY).filter((k) => k !== '1-1');

describe('Remember? warm-up', () => {
  it.each(keys)('lesson %s opens with a recall of the lesson before', (key) => {
    const scenes = SCENE_LESSON_REGISTRY[key];
    const at = scenes.findIndex((s) => s.kind === 'recall-warmup');
    expect(at, 'add a recall-warmup scene near the start').toBeGreaterThan(0);
    expect(at, 'keep it in the first pages (after the title / hello song)').toBeLessThanOrEqual(3);
    expect(scenes.filter((s) => s.kind === 'recall-warmup').length).toBe(1);
    const r = scenes[at] as Extract<(typeof scenes)[number], { kind: 'recall-warmup' }>;
    expect(r.items.length).toBeGreaterThanOrEqual(3);
    expect(r.items.length).toBeLessThanOrEqual(5);
    if (r.mode === 'shadow') for (const it of r.items) expect(it.img, 'shadow mode needs sticker pictures').not.toMatch(/\/scenes\//);
  });
});
