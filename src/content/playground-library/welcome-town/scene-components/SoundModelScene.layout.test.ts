import { describe, it, expect } from 'vitest';
import { anchorSpot, letterX } from './soundAnchors';

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

  it('phone: the words sit in the four corners around the letter (never over the middle third)', () => {
    for (const n of [2, 3, 4]) for (let i = 0; i < n; i++) {
      const p = anchorSpot(i, n, true);
      expect(p.x < 30 || p.x > 70, `n=${n} i=${i}`).toBe(true);
    }
    const four = [0, 1, 2, 3].map((i) => anchorSpot(i, 4, true));
    expect(four.map((p) => p.y)).toEqual([22, 72, 22, 72]);
  });

  it('sound on the left: the letter card is left and ALL the words float on the right (and mirrored)', () => {
    for (const n of [2, 3, 4]) {
      for (let i = 0; i < n; i++) {
        expect(anchorSpot(i, n, false, 'left').x, `left n=${n} i=${i}`).toBeGreaterThan(50);
        expect(anchorSpot(i, n, false, 'right').x, `right n=${n} i=${i}`).toBeLessThan(50);
      }
    }
    expect(letterX('left')).toBeLessThan(35);
    expect(letterX('right')).toBeGreaterThan(65);
    expect(letterX('center')).toBe(50);
    expect(letterX('left', true)).toBe(50); // phones always use the centred layout
  });

  it('one-sided layouts keep the words apart and clear of the buttons', () => {
    for (const side of ['left', 'right'] as const) for (const n of [2, 3, 4]) {
      const s = Array.from({ length: n }, (_, i) => anchorSpot(i, n, false, side));
      for (let a = 0; a < s.length; a++) {
        expect(s[a].y).toBeGreaterThan(25); expect(s[a].y).toBeLessThan(72);
        for (let b = a + 1; b < s.length; b++) {
          expect(Math.hypot(Math.abs(s[a].x - s[b].x) * 12.8, Math.abs(s[a].y - s[b].y) * 7.2), `${side} n=${n} ${a},${b}`).toBeGreaterThan(14);
        }
      }
    }
  });
});
