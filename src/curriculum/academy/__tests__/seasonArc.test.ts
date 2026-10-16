// Owner: "the season theme should be one, and the episodes should be related to it, progressive and systematic."
// One theme per Season; each of its 8 episodes ties to that theme (or names the Season) and the 8 build as a cumulative stack.
import { describe, expect, it } from 'vitest';
import { ACADEMY_LESSON_BLUEPRINTS as BPS, ACADEMY_SEASONS } from '../index';

const words = (t: string) => t.toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter((w) => w.length > 2);

describe('Season arc: one theme, eight related, progressive episodes', () => {
  for (const s of ACADEMY_SEASONS) {
    const eps = BPS.filter((b) => b.seasonId === s.id);
    it(`${s.id} "${s.title}": 8 episodes, tied to the theme, cumulative`, () => {
      expect(eps.map((e) => e.episode.no)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      const anchor = new Set([s.title, s.theme, s.release, ...s.lexicalFields, ...s.functions, ...s.structures.map((x) => x.label)].flatMap(words).filter((w) => w.length > 3));
      const titleWords = words(s.title);
      eps.forEach((e, i) => {
        const text = words(`${e.objective} ${e.itemFocus} ${e.mission.job} ${e.dailyTen.focus}`);
        const related = text.some((w) => anchor.has(w)) || titleWords.every((w) => text.includes(w));
        expect(related, `${e.id} is not tied to the Season theme`).toBe(true);
        expect(e.clue.no, `${e.id} clue number`).toBe(i + 1);
        expect(e.buildsOn.lessonIds, `${e.id} builds on every earlier episode`).toEqual(eps.slice(0, i).map((x) => x.id));
        if (i > 0) expect(e.buildsOn.itemsBefore, `${e.id} starts where the last ended`).toBe(eps[i - 1].buildsOn.itemsAfter);
        if (e.episode.no >= 7) expect(e.newItems.count, `${e.id} has no new language`).toBe(0);
      });
      expect(eps[7].buildsOn.itemsAfter, 'the whole Season budget is taught').toBe(s.newItemBudget);
    });
  }
});
