/* Pure rules for CrosswordScene: lay a few short words out as a small crossword (kept out of the component so tests
 * can import it). Deterministic: the same words always give the same grid. */

export type Placed = { word: string; row: number; col: number; across: boolean; index: number };
export type Layout = { rows: number; cols: number; placed: Placed[]; cells: Map<string, string> };

const key = (r: number, c: number) => `${r},${c}`;

function fits(cells: Map<string, string>, word: string, row: number, col: number, across: boolean): number {
  let crossings = 0;
  const dr = across ? 0 : 1; const dc = across ? 1 : 0;
  // the cells just before and after the word must be empty
  if (cells.has(key(row - dr, col - dc)) || cells.has(key(row + dr * word.length, col + dc * word.length))) return -1;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i; const c = col + dc * i;
    const here = cells.get(key(r, c));
    if (here) {
      if (here !== word[i]) return -1;
      crossings++;
    } else {
      // no letter may touch the word from the side (that would make a fake word)
      if (cells.has(key(r + dc, c + dr)) || cells.has(key(r - dc, c - dr))) return -1;
    }
  }
  return crossings;
}

/** Place each word crossing one already placed (perpendicular). Words that cannot cross anything are left out. */
function layoutInOrder(list: string[], order: number[]): Layout {
  const cells = new Map<string, string>();
  const placed: Placed[] = [];
  const put = (word: string, row: number, col: number, across: boolean, index: number) => {
    for (let i = 0; i < word.length; i++) cells.set(key(row + (across ? 0 : i), col + (across ? i : 0)), word[i]);
    placed.push({ word, row, col, across, index });
  };
  if (!order.length) return { rows: 0, cols: 0, placed, cells };
  put(list[order[0]], 0, 0, true, order[0]);
  const left = order.slice(1).map((i) => ({ w: list[i], i }));
  for (let pass = 0; pass < 3 && left.length; pass++) {
    for (let k = 0; k < left.length; k++) {
      const { w, i } = left[k];
      let best: { row: number; col: number; across: boolean } | null = null;
      for (const p of placed) {
        for (let a = 0; a < p.word.length && !best; a++) {
          for (let b = 0; b < w.length && !best; b++) {
            if (p.word[a] !== w[b]) continue;
            const across = !p.across;
            const row = p.across ? p.row - b : p.row + a;
            const col = p.across ? p.col + a : p.col - b;
            if (fits(cells, w, row, col, across) > 0) best = { row, col, across };
          }
        }
        if (best) break;
      }
      if (best) { put(w, best.row, best.col, best.across, i); left.splice(k, 1); k--; }
    }
  }
  // move the grid to start at 0,0
  let minR = Infinity; let minC = Infinity; let maxR = -Infinity; let maxC = -Infinity;
  for (const k of cells.keys()) { const [r, c] = k.split(',').map(Number); minR = Math.min(minR, r); minC = Math.min(minC, c); maxR = Math.max(maxR, r); maxC = Math.max(maxC, c); }
  const shifted = new Map<string, string>();
  for (const [k, v] of cells) { const [r, c] = k.split(',').map(Number); shifted.set(key(r - minR, c - minC), v); }
  return { rows: maxR - minR + 1, cols: maxC - minC + 1, placed: placed.map((p) => ({ ...p, row: p.row - minR, col: p.col - minC })).sort((x, y) => x.index - y.index), cells: shifted };
}

/** The grid cells of one placed word, in order. */
export const cellsOf = (p: Placed) => Array.from({ length: p.word.length }, (_, i) => key(p.row + (p.across ? 0 : i), p.col + (p.across ? i : 0)));

const permutations = (n: number): number[][] => {
  if (n <= 1) return [[0].slice(0, n)];
  const out: number[][] = [];
  for (const p of permutations(n - 1)) for (let i = 0; i <= p.length; i++) out.push([...p.slice(0, i), n - 1, ...p.slice(i)]);
  return out;
};

/** Best crossword for the words: every word order is tried (fine for up to 7 words); most words placed wins, then
 *  the smallest, squarest grid. Words that cannot cross anything are left out. */
export function layoutCrossword(words: string[]): Layout {
  const list = words.map((w) => w.toUpperCase().replace(/[^A-Z]/g, '')).filter(Boolean);
  let best: Layout | null = null;
  const score = (l: Layout) => l.placed.length * 1000 - Math.max(l.rows, l.cols) * 10 - l.rows * l.cols / 10;
  for (const order of permutations(Math.min(list.length, 7))) {
    const l = layoutInOrder(list, order);
    if (!best || score(l) > score(best)) best = l;
  }
  return best ?? { rows: 0, cols: 0, placed: [], cells: new Map() };
}
