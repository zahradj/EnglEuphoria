// Deploy gate for the Academy LESSON blueprints (one per 60-minute Live Session). Fix the data, never the check.
import { describe, expect, it } from 'vitest';
import { ACADEMY_CAST_NAMES, ACADEMY_LESSON_BLUEPRINTS, ACADEMY_SEASONS, MAX_ITEMS_PER_SESSION, allocateItems, EPISODES, RUN_OF_SHOW } from '..';

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

describe('Academy lesson blueprints: item focus (unit AND lesson related)', () => {
  it('every introducing lesson names what its new items must relate to; E7/E8 name none', () => {
    for (const b of ACADEMY_LESSON_BLUEPRINTS) {
      if (b.episode.no <= 6) {
        expect(b.itemFocus.length).toBeGreaterThan(20);
        expect(b.itemFocus.toLowerCase()).toContain(b.episode.no === 1 || b.episode.no === 5 ? 'receptive' : b.episode.no === 2 ? 'core productive' : b.episode.no === 3 ? 'structure' : b.episode.no === 4 ? 'functional' : 'skin');
      } else {
        expect(b.itemFocus).toMatch(/^none/);
      }
    }
  });
});

describe('Academy lesson blueprints: progressive stack inside each unit', () => {
  it('lesson n builds on ALL earlier lessons of its unit: L2 = L1 + new, L3 = L1 + L2 + new ...', () => {
    for (const s of ACADEMY_SEASONS) {
      const bps = ACADEMY_LESSON_BLUEPRINTS.filter((b) => b.seasonId === s.id);
      let running = 0;
      bps.forEach((b, i) => {
        const no = i + 1;
        expect(b.buildsOn.lessonIds).toEqual(bps.slice(0, i).map((x) => x.id));
        expect(b.buildsOn.itemsBefore).toBe(running);
        running += b.newItems.count;
        expect(b.buildsOn.itemsAfter).toBe(running);
        expect(b.buildsOn.inputKnownWordsMinPct).toBeGreaterThanOrEqual(95);
        if (no === 1) expect(b.buildsOn.lessonIds).toHaveLength(0);
        if (no >= 2) expect(b.buildsOn.mustReuse).toContain(`lessons 1-${no - 1}`);
        // Remember? covers every earlier lesson of the unit
        for (const id of b.buildsOn.lessonIds) expect(b.assessment.rememberFrom).toContain(id);
      });
      expect(running).toBe(s.newItemBudget);
      // the stack only grows: structures known never shrink
      for (let i = 1; i < bps.length; i++) {
        expect(bps[i].buildsOn.structuresAfter.length).toBeGreaterThanOrEqual(bps[i - 1].buildsOn.structuresAfter.length);
      }
      expect(bps[7].buildsOn.itemsAfter).toBe(s.newItemBudget);
      expect(bps[7].buildsOn.structuresAfter).toEqual(s.structures.map((x) => x.id));
    }
  });

  it('labels the stack in plain words', () => {
    const [e1, e2, e3] = ACADEMY_LESSON_BLUEPRINTS;
    expect(e1.buildsOn.stack).toBe('L1 = new');
    expect(e2.buildsOn.stack).toBe('L2 = L1 + new');
    expect(e3.buildsOn.stack).toBe('L3 = L1 + L2 + new');
  });
});

describe('Academy cast (owner rule: lessons use only the Academy characters from the cast vault)', () => {
  it('every Season hook features at least one cast member, and no lesson uses anyone else', () => {
    for (const s of ACADEMY_SEASONS) expect(s.cast.length).toBeGreaterThan(0);
    for (const b of ACADEMY_LESSON_BLUEPRINTS) {
      expect(b.cast.appears.length).toBeGreaterThanOrEqual(2);
      expect(new Set(b.cast.appears.map((a) => a.name)).size).toBe(b.cast.appears.length);
      b.cast.appears.forEach((a) => expect(ACADEMY_CAST_NAMES).toContain(a.name));
      expect(b.cast.appears.some((a) => a.name === 'Vee')).toBe(true);
    }
  });
});
