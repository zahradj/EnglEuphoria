import { describe, expect, it } from 'vitest';
import { routeReaches, shortestPath } from './rocketMazeRules';
import * as SM from '../../space-mission/scenes';

describe('rocket maze rules', () => {
  it('follows a route and stops at rocks and edges', () => {
    expect(routeReaches([0, 3], ['up', 'up', 'right'], [1, 1], [], 5, 4)).toBe(true);
    expect(routeReaches([0, 3], ['up', 'right'], [1, 2], [[0, 2]], 5, 4)).toBe(false);
    expect(routeReaches([0, 0], ['up'], [0, 0], [], 5, 4)).toBe(false);
    expect(shortestPath([0, 0], [4, 0], [[2, 0]], 5, 4)).toBe(6);
  });
  it('every Space lesson maze can be solved, and every listen route reaches its target', () => {
    const scenes = Object.entries(SM).filter(([k]) => /^LESSON_A1U3L\d_SCENES$/.test(k)).flatMap(([, v]) => v as { kind: string }[]);
    const mazes = scenes.filter((s) => s.kind === 'rocket-maze') as unknown as { id: string; cols: number; rows: number; missions: { mode: string; start: [number, number]; target: [number, number]; route?: ('up' | 'down' | 'left' | 'right')[]; rocks?: [number, number][] }[] }[];
    expect(mazes.length).toBeGreaterThan(0);
    for (const m of mazes) for (const x of m.missions) {
      expect(shortestPath(x.start, x.target, x.rocks ?? [], m.cols, m.rows), `${m.id}`).toBeGreaterThan(0);
      if (x.mode === 'listen') expect(routeReaches(x.start, x.route ?? [], x.target, x.rocks ?? [], m.cols, m.rows), `${m.id} route`).toBe(true);
    }
  });
});
