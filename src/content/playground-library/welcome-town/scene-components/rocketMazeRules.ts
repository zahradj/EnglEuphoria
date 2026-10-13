/* Pure rules for RocketMazeScene (kept out of the component so tests can import them). */

export type Dir = 'up' | 'down' | 'left' | 'right';
export const DIRS: Dir[] = ['up', 'down', 'left', 'right'];
const STEP: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/** The square one step away, or null when it is off the map. */
export function cellAfter([c, r]: [number, number], d: Dir, cols: number, rows: number): [number, number] | null {
  const n: [number, number] = [c + STEP[d][0], r + STEP[d][1]];
  return n[0] < 0 || n[1] < 0 || n[0] >= cols || n[1] >= rows ? null : n;
}

export const isBlocked = ([c, r]: [number, number], rocks: Set<string>) => rocks.has(`${c},${r}`);

/** Does this route (every step a legal move, no rock) end exactly on the target? */
export function routeReaches(start: [number, number], route: Dir[], target: [number, number], rocks: [number, number][], cols: number, rows: number): boolean {
  const set = new Set(rocks.map(([c, r]) => `${c},${r}`));
  let p: [number, number] = start;
  for (const d of route) {
    const n = cellAfter(p, d, cols, rows);
    if (!n || isBlocked(n, set)) return false;
    p = n;
  }
  return p[0] === target[0] && p[1] === target[1];
}

/** Shortest number of moves from start to target around the rocks (-1 = impossible). */
export function shortestPath(start: [number, number], target: [number, number], rocks: [number, number][], cols: number, rows: number): number {
  const set = new Set(rocks.map(([c, r]) => `${c},${r}`));
  const seen = new Set([`${start[0]},${start[1]}`]);
  let frontier: [number, number][] = [start];
  for (let d = 0; frontier.length; d++) {
    const next: [number, number][] = [];
    for (const p of frontier) {
      if (p[0] === target[0] && p[1] === target[1]) return d;
      for (const dir of DIRS) {
        const n = cellAfter(p, dir, cols, rows);
        if (n && !isBlocked(n, set) && !seen.has(`${n[0]},${n[1]}`)) { seen.add(`${n[0]},${n[1]}`); next.push(n); }
      }
    }
    frontier = next;
  }
  return -1;
}
