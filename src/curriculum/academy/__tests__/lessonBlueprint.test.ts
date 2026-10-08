// Deploy gate for the Academy LESSON blueprints (one per 60-minute Live Session). Fix the data, never the check.
import { describe, expect, it } from 'vitest';
import { ACADEMY_LESSON_BLUEPRINTS, ACADEMY_SEASONS, MAX_ITEMS_PER_SESSION, allocateItems, EPISODES, RUN_OF_SHOW } from '..';

describe('Academy lesson blueprints', () => {
  it('has one blueprint per session: 560, unique ids, correct order', () => {
    expect(ACADEMY_LESSON_BLUEPRINTS).toHaveLength(560);
    expect(new Set(ACADEMY_LESSON_BLUEPRINTS.map((b) => b.id)).size).toBe(560);
    expect(ACADEMY_LESSON_BLUEPRINTS[0].id).toBe('A1-S01-E1');
    expect(ACADEMY_LESSON_BLUEPRINTS[559].id).toBe('C1-S16-E8');
  });

  it('allocates every Season budget exactly, never above the per-session cap, and nothing in E7/E8', () => {
    for (const s of ACADEMY_SEASONS) {
      const bps = ACADEMY_LESSON_BLUEPRINTS.filter((b) => b.seasonId === s.id);
      expect(bps).toHaveLength(8);
      expect(bps.reduce((n, b) => n + b.newItems.count, 0)).toBe(s.newItemBudget);
      bps.forEach((b) => expect(b.newItems.count).toBeLessThanOrEqual(MAX_ITEMS_PER_SESSION));
      expect(bps[6].newItems.count).toBe(0);
      expect(bps[7].newItems.count).toBe(0);
      expect(bps[6].structures).toHaveLength(0);
      expect(bps[7].structures).toHaveLength(0);
    }
  });

  it('introduces structures only in Pattern Lab (E3) and Side Quest (E6)', () => {
    for (const b of ACADEMY_LESSON_BLUEPRINTS) {
      if (b.structures.length) expect(['pattern-lab', 'side-quest']).toContain(b.episode.type);
    }
  });

  it('has an "I can" objective, a full 60-minute run of show, and every comfort control', () => {
    const minutes = RUN_OF_SHOW.reduce((n, s) => n + s.minutes, 0);
    expect(minutes).toBe(60);
    for (const b of ACADEMY_LESSON_BLUEPRINTS) {
      expect(b.objective).toMatch(/^I can /);
      expect(b.runOfShow.reduce((n, s) => n + s.minutes, 0)).toBe(60);
      expect(b.runOfShow.filter((s) => s.core).reduce((n, s) => n + s.minutes, 0)).toBe(51);
      expect(b.mission.take2).toBe(true);
      expect(b.mission.dial).toEqual(['chill', 'normal', 'push']);
      expect(b.comfort.length).toBeGreaterThanOrEqual(9);
      expect(b.release.privateFirst).toBe(true);
    }
  });

  it('chains the Last-Time card: every session after the first points at the one before it', () => {
    ACADEMY_LESSON_BLUEPRINTS.forEach((b, i) => {
      if (i === 0) expect(b.recapFromLessonId).toBeNull();
      else expect(b.recapFromLessonId).toBe(ACADEMY_LESSON_BLUEPRINTS[i - 1].id);
    });
  });

  it('puts the checkpoint and the level check on the Finale only, and Big Remix on every 2nd Season', () => {
    for (const b of ACADEMY_LESSON_BLUEPRINTS) {
      if (b.episode.type !== 'finale') expect(b.assessment.checkpoint).toBe(false);
      if (b.assessment.levelCheck) expect(b.episode.type).toBe('finale');
      if (b.assessment.bigRemix) expect(b.seasonNo % 2).toBe(0);
    }
    expect(ACADEMY_LESSON_BLUEPRINTS.filter((b) => b.assessment.levelCheck)).toHaveLength(5);
  });

  it('allocateItems honours the cap and the total', () => {
    const w = [0.14, 0.2, 0.1, 0.18, 0.16, 0.22, 0, 0];
    for (const budget of [60, 69, 70, 75, 80, 84]) {
      const a = allocateItems(budget, w);
      expect(a.reduce((n, x) => n + x, 0)).toBe(budget);
      a.forEach((x) => expect(x).toBeLessThanOrEqual(MAX_ITEMS_PER_SESSION));
    }
    expect(allocateItems(84, w).slice(0, 6)).toEqual([14, 14, 14, 14, 14, 14]);
  });

  it('keeps the episode metadata consistent with the approved rules', () => {
    expect(EPISODES['remix'].weight).toBe(0);
    expect(EPISODES['finale'].weight).toBe(0);
    expect(EPISODES['word-lab'].itemKind).toBe('core-productive');
    expect(EPISODES['side-quest'].itemKind).toBe('core-productive');
  });
});
