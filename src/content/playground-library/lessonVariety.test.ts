import { describe, expect, it } from 'vitest';
import { SCENE_LESSON_REGISTRY } from './sceneLessonRegistry';
import { GRANDFATHERED, VARIETY_ENFORCED_FROM, checkLessonVariety } from './lessonVariety';

// Owner's standing rule (2026-10-04): every new lesson varies its games,
// pictures, settings and look, and records the app research behind it.
// Older lessons are grandfathered (VARIETY_ENFORCED_FROM).
const keys = Object.keys(SCENE_LESSON_REGISTRY);
const enforced = keys.filter((k) => {
  const [u, l] = k.split('-').map(Number);
  if (GRANDFATHERED.includes(k)) return false;
  return u > VARIETY_ENFORCED_FROM.unit || (u === VARIETY_ENFORCED_FROM.unit && l >= VARIETY_ENFORCED_FROM.lesson);
});

describe('Lesson Variety Engine', () => {
  it.each(enforced)('lesson %s is varied and researched', (key) => {
    const [u, l] = key.split('-').map(Number);
    const at = (k: string) => (SCENE_LESSON_REGISTRY[k] ? { key: k, scenes: SCENE_LESSON_REGISTRY[k] } : undefined);
    const prev = l > 1 ? at(`${u}-${l - 1}`) : at(`${u - 1}-6`);
    const issues = checkLessonVariety(key, SCENE_LESSON_REGISTRY[key], prev, at(`${u - 1}-${l}`));
    expect(issues.map((i) => `${i.code}: ${i.message}`)).toEqual([]);
  });
});
