import { describe, expect, it } from 'vitest';
import { FALLBACK_PACKS, familyPacks, findPack, packsFromRows, type PackHub } from './packCatalog';

const HUBS: PackHub[] = ['playground', 'academy', 'professional'];

describe('lesson-pack catalogue (the numbers every page shows)', () => {
  it('has the EUR 150 family pack: Family 20 in Playground', () => {
    const p = FALLBACK_PACKS.find((x) => x.familyOnly && x.hub === 'playground' && x.sessions === 20);
    expect(p).toMatchObject({ name: 'Family 20', price: 150 });
  });

  it('has family packs of 20 / 30 / 40 lessons in every hub', () => {
    for (const hub of HUBS) expect(familyPacks([], hub).map((p) => p.sessions)).toEqual([20, 30, 40]);
  });

  it('family packs cost the same per lesson as the hub’s 20-lesson pack (no extra discount, as the migrations say)', () => {
    for (const hub of HUBS) {
      const perLesson = findPack([], hub, 20).price / 20;
      for (const f of familyPacks([], hub)) expect(f.price / f.sessions).toBeCloseTo(perLesson, 5);
    }
  });

  it('regular packs start at 5 lessons in every hub (5 / 10 / 20)', () => {
    for (const hub of HUBS) {
      expect(FALLBACK_PACKS.filter((p) => !p.familyOnly && p.hub === hub).map((p) => p.sessions)).toEqual([5, 10, 20]);
    }
  });

  it('prices follow the lesson (25 minutes), not the old 55-minute hour: Academy and Success are NOT double any more', () => {
    expect(findPack([], 'academy', 20).price).toBe(145);
    expect(findPack([], 'professional', 20).price).toBe(195);
    expect(findPack([], 'playground', 20).price).toBe(150);
  });

  it('reads database rows, skips rows it cannot use, and prefers them over the fallback', () => {
    const rows = [
      { id: 'a', name: 'Starter', student_level: 'academy', session_count: 5, price_eur: '40.00', original_price_eur: '40.00', savings_eur: '0', family_only: false },
      { id: 'b', name: 'Family 20', student_level: 'playground', session_count: 20, price_eur: '150.00', original_price_eur: '150.00', savings_eur: '0', family_only: true },
      { id: 'c', name: 'Mystery', student_level: 'unknown-hub', session_count: 5, price_eur: '1', original_price_eur: '1', savings_eur: '0', family_only: false },
      { id: 'd', name: 'Broken', student_level: 'academy', session_count: 0, price_eur: 'x', original_price_eur: '1', savings_eur: '0', family_only: false },
    ];
    const packs = packsFromRows(rows);
    expect(packs.map((p) => p.id)).toEqual(['a', 'b']);
    expect(findPack(packs, 'academy', 5).price).toBe(40); // database wins
    expect(findPack(packs, 'academy', 10).price).toBe(72.5); // not in the rows -> fallback
    expect(familyPacks(packs, 'playground').map((p) => p.sessions)).toEqual([20]); // database family packs win too
  });
});
