import { describe, expect, it } from 'vitest';
import { LEVELS, PLAYGROUND_CURRICULUM, type PlaygroundLevel } from '../roadmap/playgroundCurriculum';

/* The Playground ladder Pre-A1 → B2 (owner 2026-10-15): 5 levels × 10 units × 7 lessons, one world per unit. */
const levels = Object.keys(PLAYGROUND_CURRICULUM) as PlaygroundLevel[];

describe('Playground curriculum Pre-A1 → B2', () => {
  it('has the five levels with a profile each', () => {
    expect(levels).toEqual(['Pre-A1', 'A1', 'A2', 'B1', 'B2']);
    expect(LEVELS.map((l) => l.level)).toEqual(levels);
  });

  for (const level of levels) {
    const units = PLAYGROUND_CURRICULUM[level];
    it(`${level}: 10 units × 7 lessons, numbered in order`, () => {
      expect(units.map((u) => u.unit)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      for (const u of units) {
        expect(u.level).toBe(level);
        expect(u.lessons.map((l) => l.lesson), `${level} U${u.unit}`).toEqual([1, 2, 3, 4, 5, 6, 7]);
        for (const l of u.lessons) expect(l.title.trim().length, `${level} U${u.unit}L${l.lesson}`).toBeGreaterThan(3);
      }
    });
    it(`${level}: lesson titles are unique and every unit ends in a test`, () => {
      const titles = units.flatMap((u) => u.lessons.map((l) => l.title));
      expect(new Set(titles).size).toBe(titles.length);
      for (const u of units) expect(u.lessons[6].title, `${level} U${u.unit}`).toMatch(/Test|Hero/);
    });
  }

  it('no world is used twice across the whole ladder', () => {
    const worlds = levels.flatMap((l) => PLAYGROUND_CURRICULUM[l].map((u) => u.world.toLowerCase()));
    expect(new Set(worlds).size).toBe(worlds.length);
  });

  it('A2-B2 units name their grammar, writing task and speaking task, and objectives say "I can"', () => {
    for (const level of ['A2', 'B1', 'B2'] as const) {
      for (const u of PLAYGROUND_CURRICULUM[level]) {
        expect(u.grammar.length, `${level} U${u.unit}`).toBeGreaterThanOrEqual(2);
        expect(u.writing).not.toBe('—');
        expect(u.speakingTask.length).toBeGreaterThan(5);
        for (const l of u.lessons) expect(l.objective, `${level} U${u.unit}L${l.lesson}`).toMatch(/^I can /);
      }
    }
  });
});
