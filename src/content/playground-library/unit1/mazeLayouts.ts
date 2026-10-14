/* Picture Maze layouts (PictureMazeScene.tsx), kept apart so tests can check them without the audio stack. */
/** '#' hedge, '.' path, 'S' start, '1'..'3' the picture ends. Every cell is reachable (pictureMaze.test.ts). */
export const MAZE_LAYOUTS: string[][] = [
  ['1..#....2', '.#.#.##.#', 'S#...#...', '.##.#..#.', '....#.#.3'],
  ['....#.#.3', '.##.#..#.', 'S#...#...', '.#.#.##.#', '1..#....2'],
];
export const MAZE_ROWS = 5;
export const MAZE_COLS = 9;

export function mazeCells(layout: string[]) {
  let start = 0; const goals: number[] = [];
  layout.forEach((row, r) => [...row].forEach((ch, c) => {
    const i = r * MAZE_COLS + c;
    if (ch === 'S') start = i;
    if (ch >= '1' && ch <= '3') goals[Number(ch) - 1] = i;
  }));
  const open = (i: number) => { const ch = layout[Math.floor(i / MAZE_COLS)]?.[i % MAZE_COLS]; return ch !== undefined && ch !== '#'; };
  return { start, goals, open };
}
export function mazeNeighbours(i: number) {
  const r = Math.floor(i / MAZE_COLS), c = i % MAZE_COLS;
  return [r > 0 ? i - MAZE_COLS : -1, r < MAZE_ROWS - 1 ? i + MAZE_COLS : -1, c > 0 ? i - 1 : -1, c < MAZE_COLS - 1 ? i + 1 : -1].filter((n) => n >= 0);
}

