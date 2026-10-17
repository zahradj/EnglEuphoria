// Owner: "the season theme should be one, and the episodes should be related to it, progressive and systematic."
// One theme per Season; each of its 8 episodes ties to that theme (or names the Season) and the 8 build as a cumulative stack.
import { describe, expect, it } from 'vitest';
import { ACADEMY_LESSON_BLUEPRINTS as BPS, ACADEMY_SEASONS } from '../index';
import { PRE_A1_ARCS, SEASON_ARCS } from '../arcs';
import { PA1_SEASONS } from '../preA1';
import { chaptersFor } from '../seasonArc';

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

describe('Every Season carries an essential question and eight chapters (academy-season-arc)', () => {
  const withChapters = ACADEMY_SEASONS; // global: every Season, A1-C1
  it('B1-S01 has an essential question and eight distinct chapters, each with a sub-question and a difficulty step', () => {
    const s = ACADEMY_SEASONS.find((x) => x.id === 'B1-S01')!;
    expect(s.essentialQuestion?.trim().length).toBeGreaterThan(10);
    expect(s.chapters).toHaveLength(8);
    expect(withChapters.map((x) => x.id)).toContain('B1-S01');
  });
  for (const s of withChapters) {
    it(`${s.id}: chapters are distinct, the last answers the essential question, and each blueprint carries its chapter`, () => {
      expect(s.chapters).toHaveLength(8);
      expect(new Set(s.chapters!.map((c) => c.title.toLowerCase())).size).toBe(8);
      for (const c of s.chapters!) { expect(c.question.endsWith('?'), `${s.id} ${c.title}`).toBe(true); expect(c.step.length).toBeGreaterThan(10); }
      const anchors = [s.theme, s.title, ...s.lexicalFields, ...s.functions, s.structures[0].label].join(' ').toLowerCase();
      const mid = s.chapters!.slice(0, 7).filter((c) => anchors.split(/\W+/).filter((w) => w.length > 3).some((w) => `${c.title} ${c.question}`.toLowerCase().includes(w)));
      expect(mid.length, `${s.id} chapters tie to the theme (the Remix may only name the Season)`).toBeGreaterThanOrEqual(6);
      expect(s.chapters![7].question).toBe(s.essentialQuestion);
      const eps = BPS.filter((b) => b.seasonId === s.id);
      eps.forEach((e, i) => expect(e.chapter?.title, `${e.id} chapter`).toBe(s.chapters![i].title));
    });
  }
});

describe('Hand-written arcs (owner 2026-10-17: write them for all levels)', () => {
  it('every A1-C1 Season has a hand-written arc (B1-S01 is written inline), none is the derived default', () => {
    const missing = ACADEMY_SEASONS.filter((s) => s.id !== 'B1-S01' && !SEASON_ARCS[s.id]).map((s) => s.id);
    expect(missing, `Seasons still on the derived default: ${missing.join(', ')}`).toEqual([]);
    for (const s of ACADEMY_SEASONS) {
      const derived = chaptersFor({ title: s.title, theme: s.theme, release: s.release, canDo: s.canDo, functions: s.functions, structures: s.structures, lexicalFields: s.lexicalFields });
      expect(s.chapters!.map((c) => c.title).join('|'), `${s.id} still has the derived chapter titles`).not.toBe(derived.map((c) => c.title).join('|'));
    }
  });
  it('arcs only name Seasons that exist', () => {
    const ids = new Set(ACADEMY_SEASONS.map((s) => s.id));
    for (const id of Object.keys(SEASON_ARCS)) expect(ids.has(id), id).toBe(true);
  });
});

describe('Pre-A1 Season arcs', () => {
  for (const s of PA1_SEASONS) {
    it(`${s.id} "${s.title}": a hand-written essential question and eight distinct chapters, the last answering it`, () => {
      const arc = PRE_A1_ARCS[s.id];
      expect(arc, `${s.id} arc`).toBeTruthy();
      expect(arc.chapters).toHaveLength(8);
      expect(new Set(arc.chapters.map((c) => c.title.toLowerCase())).size).toBe(8);
      expect(arc.chapters[7].question).toBe(arc.essentialQuestion);
      for (const c of arc.chapters) { expect(c.question.endsWith('?'), c.title).toBe(true); expect(c.step.length).toBeGreaterThan(10); }
    });
  }
});
