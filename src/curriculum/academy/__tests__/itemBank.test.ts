// Deploy gate for the Academy item bank (new words and chunks per Season, per episode). Fix the data, never the check.
// The Oxford reference used while writing the lists is private and not stored; these are the structural, repo-only rules.
import { describe, expect, it } from 'vitest';
import { ACADEMY_ITEMS, ACADEMY_SEASONS, ACADEMY_LESSON_BLUEPRINTS, normalizeItem, validateItems } from '..';

describe('Academy item bank', () => {
  it('has a complete list for every Season and no errors', () => {
    const errors = validateItems(ACADEMY_SEASONS, ACADEMY_ITEMS).filter((i) => i.severity === 'error');
    expect(errors).toEqual([]);
  });

  it('matches the lesson blueprints: items per episode equal the allocated count', () => {
    for (const b of ACADEMY_LESSON_BLUEPRINTS) {
      if (b.episode.no > 6) continue;
      const list = ACADEMY_ITEMS[b.seasonId]?.[`E${b.episode.no}` as 'E1'] ?? [];
      expect(list.length).toBe(b.newItems.count);
    }
  });

  it('never repeats an item anywhere in the roadmap, and never lists an item above its Season level', () => {
    const rank = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 } as const;
    const seen = new Set<string>();
    for (const s of ACADEMY_SEASONS) {
      const si = ACADEMY_ITEMS[s.id];
      for (const k of ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'] as const) {
        for (const [text, level] of si[k]) {
          const n = normalizeItem(text);
          expect(seen.has(n)).toBe(false);
          seen.add(n);
          expect(rank[level]).toBeLessThanOrEqual(rank[s.level]);
        }
      }
    }
    expect(seen.size).toBe(ACADEMY_SEASONS.reduce((n, s) => n + s.newItemBudget, 0));
  });

  it('keeps receptive items in E1/E5 and productive items in E2/E6', () => {
    for (const s of ACADEMY_SEASONS) {
      const si = ACADEMY_ITEMS[s.id];
      si.E1.concat(si.E5).forEach(([, , mode]) => expect(mode).toBe('r'));
      si.E2.concat(si.E6).forEach(([, , mode]) => expect(mode).toBe('p'));
    }
  });
});
