import { describe, it, expect } from 'vitest';
import { anchorSpot } from './soundAnchors';

/** A1 sound lessons: the four words float two on the left and two on the right of the letter card. */
describe('A1 sound-model anchor layout', () => {
  const spots = (n: number) => Array.from({ length: n }, (_, i) => anchorSpot(i, n));

  it('four words: two left, two right, clear of the centre letter card', () => {
    const s = spots(4);
    expect(s.slice(0, 2).every((p) => p.x < 35)).toBe(true);
    expect(s.slice(2).every((p) => p.x > 65)).toBe(true);
  });

  it('no two words are close to each other (pictures never overlap)', () => {
    for (const n of [2, 3, 4]) {
      const s = spots(n);
      for (let a = 0; a < s.length; a++) for (let b = a + 1; b < s.length; b++) {
        const dx = Math.abs(s[a].x - s[b].x) * 12.8; // % of a 1280-wide scene → px / 10
        const dy = Math.abs(s[a].y - s[b].y) * 7.2;  // % of a 720-high scene → px / 10
        expect(Math.hypot(dx, dy), `n=${n} words ${a},${b}`).toBeGreaterThan(14); // > 140 px apart
      }
    }
  });

  it('stays inside the scene, below the teacher line and above the buttons', () => {
    for (const n of [2, 3, 4]) for (const p of spots(n)) {
      expect(p.x).toBeGreaterThan(8); expect(p.x).toBeLessThan(92);
      expect(p.y).toBeGreaterThan(25); expect(p.y).toBeLessThan(70);
    }
  });
});
