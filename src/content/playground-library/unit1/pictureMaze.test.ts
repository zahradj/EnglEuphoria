import { describe, expect, it } from 'vitest';
import { MAZE_COLS, MAZE_LAYOUTS, MAZE_ROWS, mazeCells, mazeNeighbours } from './mazeLayouts';
import { SCENE_LESSON_REGISTRY } from '../sceneLessonRegistry';

describe('Picture Maze', () => {
  it.each(MAZE_LAYOUTS.map((l, i) => [i, l] as const))('layout %i: right size, one start, three picture ends, all reachable', (_i, layout) => {
    expect(layout).toHaveLength(MAZE_ROWS);
    layout.forEach((row) => expect(row).toHaveLength(MAZE_COLS));
    const { start, goals, open } = mazeCells(layout);
    expect(goals.filter((g) => g !== undefined)).toHaveLength(3);
    const seen = new Set([start]); const q = [start];
    while (q.length) { const c = q.shift()!; for (const n of mazeNeighbours(c)) if (open(n) && !seen.has(n)) { seen.add(n); q.push(n); } }
    const openCount = layout.join('').split('').filter((ch) => ch !== '#').length;
    expect(seen.size).toBe(openCount);
    // each picture can be reached without walking through another picture
    for (const g of goals) {
      const ok = new Set([start]); const qq = [start];
      while (qq.length) { const c = qq.shift()!; for (const n of mazeNeighbours(c)) if (open(n) && !ok.has(n) && (n === g || !goals.includes(n))) { ok.add(n); qq.push(n); } }
      expect(ok.has(g)).toBe(true);
    }
  });
  it('every maze page has 3 different pictures and rounds that point at them', () => {
    const mazes = Object.values(SCENE_LESSON_REGISTRY).flat().filter((s) => s.kind === 'picture-maze');
    expect(mazes.length).toBeGreaterThan(5);
    for (const m of mazes) {
      if (m.kind !== 'picture-maze') continue;
      expect(new Set(m.items.map((i) => i.label)).size).toBe(3);
      for (const r of m.rounds) expect(m.items[r]).toBeDefined();
    }
  });
});

describe('Extra practice: no game twice in a unit (owner 2026-10-12: "don\'t repeat the games in the same unit")', () => {
  const units = new Map<string, string[]>();
  for (const k of Object.keys(SCENE_LESSON_REGISTRY)) { const [u, l] = k.split('-'); if (Number(l) <= 6 || k === '10-7') units.set(u, [...(units.get(u) ?? []), k]); }
  it.each([...units.entries()])('unit %s', (_u, keys) => {
    const lessonGames = new Map<string, Set<string>>();
    const extras: [string, string][] = [];
    for (const k of keys) for (const s of SCENE_LESSON_REGISTRY[k]) {
      if (s.id.includes('-xp-')) extras.push([k, s.kind]);
      else (lessonGames.get(s.kind) ?? lessonGames.set(s.kind, new Set()).get(s.kind)!).add(k);
    }
    const seen = new Set<string>(); const problems: string[] = [];
    for (const [k, kind] of extras) {
      if (seen.has(kind)) problems.push(`${k}: ${kind} already used as extra practice in this unit`);
      if (lessonGames.has(kind)) problems.push(`${k}: ${kind} is already a game in ${[...lessonGames.get(kind)!].join(', ')}`);
      seen.add(kind);
    }
    expect(problems).toEqual([]);
  });
});
