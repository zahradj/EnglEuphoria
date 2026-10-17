import { describe, it, expect } from 'vitest';
import { ACADEMY_SEASONS, ACADEMY_LESSON_BLUEPRINTS } from '../index';
import { L1_WATCH, L1_WATCH_LEVELS, l1WatchFor } from '../l1Watch';

const LANGS = ['ar', 'es', 'fr', 'tr', 'it'];

describe('Home-language watch lists', () => {
  it('every Season of a covered level has 2-4 entries with a teaching action and an evidence mark', () => {
    for (const s of ACADEMY_SEASONS.filter((x) => L1_WATCH_LEVELS.includes(x.level))) {
      const list = l1WatchFor(s.id);
      expect(list.length, s.id).toBeGreaterThanOrEqual(2);
      expect(list.length, s.id).toBeLessThanOrEqual(4);
      for (const it of list) {
        expect(it.langs.length, s.id).toBeGreaterThan(0);
        it.langs.forEach((l) => expect(LANGS, s.id).toContain(l));
        expect(it.watch.length, s.id).toBeGreaterThan(15);
        expect(it.teach.length, s.id).toBeGreaterThan(15);
        expect(['V', 'V-weak', 'K'], s.id).toContain(it.evidence);
      }
    }
  });
  it('only lists Seasons that exist', () => {
    const ids = new Set(ACADEMY_SEASONS.map((s) => s.id));
    Object.keys(L1_WATCH).forEach((id) => expect(ids.has(id), id).toBe(true));
  });
  it('is carried on every lesson blueprint of the Season', () => {
    const bp = ACADEMY_LESSON_BLUEPRINTS.filter((b) => b.seasonId === 'A1-S01');
    expect(bp.length).toBe(8);
    bp.forEach((b) => expect(b.l1Watch).toEqual(l1WatchFor('A1-S01')));
  });
  it('never uses browser speech or claims every student has the problem', () => {
    const all = JSON.stringify(L1_WATCH);
    expect(all).not.toMatch(/speechSynthesis|all students|every student/i);
  });
});
