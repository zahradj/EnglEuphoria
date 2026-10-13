/** Tic-Tac-Toe Duel rules (pure, no React / audio — tested in ticTacToe.test.ts). */
export const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
export const ORDER = [4, 0, 2, 6, 8, 1, 3, 5, 7];
export const EMPTY = [0, 0, 0, 0, 0, 0, 0, 0, 0];

export const wins = (b: number[], who: number) => LINES.some((l) => l.every((i) => b[i] === who));
/** The friend's square: block the child's line of two, else the first free square in ORDER — never a square that
 *  would give the friend three in a row. -1 = no safe square. */
export function friendMove(b: number[]): number {
  const free = ORDER.filter((i) => b[i] === 0);
  const safe = free.filter((i) => { const t = [...b]; t[i] = 2; return !wins(t, 2); });
  if (!safe.length) return -1;
  const block = safe.find((i) => { const t = [...b]; t[i] = 1; return wins(t, 1); });
  return block ?? safe[0];
}
