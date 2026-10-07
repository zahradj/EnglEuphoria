/** Where an anchor floats (% of the scene). Four anchors: two left, two right of the letter card,
 *  staggered in height with a wide gap between them; three: two left, one right; two: one each side. */
export type SoundSide = 'center' | 'left' | 'right';

/** Where the letter card sits (% of the scene width). */
export function letterX(side: SoundSide = 'center', narrow = false): number {
  return narrow || side === 'center' ? 50 : side === 'left' ? 24 : 76;
}

export function anchorSpot(i: number, n: number, narrow = false, side: SoundSide = 'center'): { x: number; y: number } {
  // Sound on one side: all the words float on the OPPOSITE side, scattered (not a row, not a grid).
  if (!narrow && side !== 'center') {
    const base: [number, number][] =
      n >= 4 ? [[68, 30], [86, 38], [67, 67], [87, 71]] : n === 3 ? [[68, 30], [87, 47], [69, 69]] : [[70, 36], [86, 66]];
    const [x, y] = base[Math.min(i, base.length - 1)];
    return { x: side === 'left' ? x : 100 - x, y };
  }
  const leftCount = Math.ceil(n / 2);
  const left = i < leftCount;
  const idx = left ? i : i - leftCount;
  const count = left ? leftCount : n - leftCount;
  // Narrow (phone) screens: the letter card takes the middle third, so the words sit in the four corners around it.
  if (narrow) return { x: left ? 18 : 82, y: count === 1 ? 46 : [22, 72][idx] ?? 46 };
  const ys = count === 1 ? [46] : [30, 64];
  const xs = left ? [13, 25] : [87, 75];
  // stagger the x so the two pictures on a side never sit directly above each other
  return { x: xs[idx % 2], y: ys[idx] ?? 46 };
}
