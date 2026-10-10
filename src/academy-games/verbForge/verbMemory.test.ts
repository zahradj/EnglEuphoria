import { describe, expect, it } from 'vitest';
import { INTERVAL_DAYS, MAX_BOX, cardKey, isDue, pickVerbs, readVault, review, summarize, verbBox, writeVault, type Vault } from './verbMemory';

const DAY = 24 * 60 * 60 * 1000;
const T0 = 1_800_000_000_000;
const verbs = ['go', 'see', 'eat', 'take', 'give'].map((base) => ({ base }));

describe('Memory Vault (Leitner boxes, per form)', () => {
  it('a first right answer lands in box 2 and is due tomorrow; a slip goes to box 1 (again today)', () => {
    const v1 = review({}, cardKey('go', 'past'), true, T0);
    expect(v1['go:past']).toEqual({ box: 2, due: T0 + INTERVAL_DAYS[2] * DAY });
    const v2 = review({}, cardKey('go', 'past'), false, T0);
    expect(v2['go:past']).toEqual({ box: 1, due: T0 });
  });

  it('right answers climb one box at a time up to gold, a slip falls back to the embers', () => {
    let v: Vault = {};
    const seen: number[] = [];
    for (let k = 0; k < 6; k++) { v = review(v, 'go:past', true, T0); seen.push(v['go:past'].box); }
    expect(seen).toEqual([2, 3, 4, 5, 5, 5]);
    expect(seen[seen.length - 1]).toBe(MAX_BOX);
    expect(review(v, 'go:past', false, T0)['go:past'].box).toBe(1);
  });

  it('spaces the reviews: tomorrow, 3 days, a week, two weeks', () => {
    expect(INTERVAL_DAYS).toEqual([0, 0, 1, 3, 7, 14]);
  });

  it('knows a verb only as well as its weakest form', () => {
    let v: Vault = review({}, 'go:past', true, T0);
    v = review(v, 'go:past', true, T0); // box 3
    v = review(v, 'go:pp', false, T0);   // box 1
    expect(verbBox(v, 'go')).toBe(1);
    expect(verbBox({}, 'go')).toBe(0);
  });

  it('isDue: never-seen is due; a card is due when its day has come', () => {
    const v = review({}, 'go:past', true, T0);
    expect(isDue(v, 'see:past', T0)).toBe(true);
    expect(isDue(v, 'go:past', T0 + 1000)).toBe(false);
    expect(isDue(v, 'go:past', T0 + DAY + 1)).toBe(true);
  });

  it('picks due and weakest verbs first, then new ones, then the rest', () => {
    let v: Vault = {};
    v = review(v, 'go:past', false, T0); v = review(v, 'go:pp', false, T0);          // go: box 1, due now
    v = review(v, 'see:past', true, T0); v = review(v, 'see:pp', true, T0);          // see: box 2, due tomorrow
    const order = pickVerbs(verbs, v, 5, T0 + 5).map((x) => x.base);
    expect(order[0]).toBe('go');                       // due and weakest
    expect(order.slice(1, 4).sort()).toEqual(['eat', 'give', 'take']); // new
    expect(order[4]).toBe('see');                      // known, not due: last
    expect(pickVerbs(verbs, v, 2, T0 + 5)).toHaveLength(2);
  });

  it('summarizes the boxes and what is due', () => {
    let v: Vault = {};
    v = review(v, 'go:past', false, T0); v = review(v, 'go:pp', false, T0);
    v = review(v, 'see:past', true, T0); v = review(v, 'see:pp', true, T0);
    const s = summarize(verbs, v, T0 + 5);
    expect(s.total).toBe(5);
    expect(s.boxes[0]).toBe(3);
    expect(s.boxes[1]).toBe(1);
    expect(s.boxes[2]).toBe(1);
    expect(s.due).toBe(1);
    expect(s.mastered).toBe(0);
  });

  it('reads and writes through storage and survives broken storage', () => {
    const mem: Record<string, string> = {};
    const storage = { getItem: (k: string) => mem[k] ?? null, setItem: (k: string, val: string) => { mem[k] = val; } };
    const v = review({}, 'go:past', true, T0);
    writeVault(v, storage);
    expect(readVault(storage)).toEqual(v);
    expect(readVault({ getItem: () => { throw new Error('blocked'); } })).toEqual({});
    expect(readVault({ getItem: () => '{not json' })).toEqual({});
    expect(() => writeVault(v, { setItem: () => { throw new Error('full'); } })).not.toThrow();
  });
});
