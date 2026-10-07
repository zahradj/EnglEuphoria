/** Where an anchor floats (% of the scene). Four anchors: two left, two right of the letter card,
 *  staggered in height with a wide gap between them; three: two left, one right; two: one each side. */
export function anchorSpot(i: number, n: number, narrow = false): { x: number; y: number } {
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
