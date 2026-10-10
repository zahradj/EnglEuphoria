import { wordsOf } from './twisterData';

/**
 * Spelling correction for the tongue-twister game. A plain, fixed algorithm (no AI, no network, no dictionary service):
 * the student's text is lined up word by word with the registered twister, then each word is marked
 *   ok · spelling (a slip in the letters: shown with the fix) · wrong (a different word) · missing,
 * and extra words the student added are listed. The same input always gives the same answer.
 */
export type WordStatus = 'ok' | 'spelling' | 'wrong' | 'missing';

export interface LetterMark { ch: string; fix: boolean }
export interface WordResult {
  expected: string;
  typed?: string;
  status: WordStatus;
  /** For spelling slips: the correct word with the letters to fix marked, and the letters typed in error. */
  marks?: LetterMark[];
  note?: string;
}
export interface SpellResult {
  words: WordResult[];
  extra: string[];
  /** Words that are not exactly right (spelling + wrong + missing) plus extra words. */
  errors: number;
  allRight: boolean;
}

/** Edit distance between two words. */
export function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

/** The correct word, letter by letter, with the letters the student must change or add marked. */
export function letterMarks(typed: string, expected: string): LetterMark[] {
  const n = typed.length, m = expected.length;
  const dp = Array.from({ length: n + 1 }, (_, i) => [i, ...Array(m).fill(0)] as number[]);
  for (let j = 1; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (typed[i - 1] === expected[j - 1] ? 0 : 1));
  const marks: LetterMark[] = Array.from(expected, (ch) => ({ ch, fix: false }));
  let i = n, j = m;
  while (j > 0) {
    if (i > 0 && dp[i][j] === dp[i - 1][j - 1] + (typed[i - 1] === expected[j - 1] ? 0 : 1)) { marks[j - 1].fix = typed[i - 1] !== expected[j - 1]; i--; j--; }
    else if (dp[i][j] === dp[i][j - 1] + 1) { marks[j - 1].fix = true; j--; }
    else i--; // a letter the student typed that does not belong: nothing to mark in the correct word
  }
  return marks;
}

const similarLimit = (w: string) => (w.length >= 6 ? 2 : 1);

type Step = { kind: 'pair'; i: number; j: number } | { kind: 'join'; i: number; j: number } | { kind: 'missing'; i: number } | { kind: 'extra'; j: number };

export function checkSpelling(typedText: string, expectedText: string): SpellResult {
  const E = wordsOf(expectedText);
  const T = wordsOf(typedText);
  const known = new Set(E);
  const pairCost = (e: string, t: string) => {
    if (e === t) return 0;
    if (known.has(t)) return 2; // another word of the twister: a different word, not a typo
    return levenshtein(e, t) <= similarLimit(e) ? 1 : 2;
  };

  const INF = 1e9;
  const dp = Array.from({ length: E.length + 1 }, () => Array<number>(T.length + 1).fill(INF));
  const how = Array.from({ length: E.length + 1 }, () => Array<Step | null>(T.length + 1).fill(null));
  dp[0][0] = 0;
  for (let i = 0; i <= E.length; i++) {
    for (let j = 0; j <= T.length; j++) {
      const here = dp[i][j];
      if (here >= INF) continue;
      const relax = (ni: number, nj: number, cost: number, step: Step) => { if (here + cost < dp[ni][nj]) { dp[ni][nj] = here + cost; how[ni][nj] = step; } };
      if (i < E.length && j < T.length) relax(i + 1, j + 1, pairCost(E[i], T[j]), { kind: 'pair', i, j });
      if (i < E.length && j + 1 < T.length && T[j] + T[j + 1] === E[i]) relax(i + 1, j + 2, 1, { kind: 'join', i, j });
      if (i < E.length) relax(i + 1, j, 2, { kind: 'missing', i });
      if (j < T.length) relax(i, j + 1, 2, { kind: 'extra', j });
    }
  }

  const words: WordResult[] = E.map((expected) => ({ expected, status: 'missing' as WordStatus }));
  const extra: string[] = [];
  let i = E.length, j = T.length;
  while (i > 0 || j > 0) {
    const step = how[i][j];
    if (!step) break;
    if (step.kind === 'pair') {
      const e = E[step.i], t = T[step.j];
      const cost = pairCost(e, t);
      words[step.i] = cost === 0 ? { expected: e, typed: t, status: 'ok' } : cost === 1 ? { expected: e, typed: t, status: 'spelling', marks: letterMarks(t, e) } : { expected: e, typed: t, status: 'wrong' };
      i = step.i; j = step.j;
    } else if (step.kind === 'join') {
      words[step.i] = { expected: E[step.i], typed: `${T[step.j]} ${T[step.j + 1]}`, status: 'spelling', marks: Array.from(E[step.i], (ch) => ({ ch, fix: false })), note: 'Write it as one word.' };
      i = step.i; j = step.j;
    } else if (step.kind === 'missing') {
      words[step.i] = { expected: E[step.i], status: 'missing' };
      i = step.i;
    } else {
      extra.unshift(T[step.j]);
      j = step.j;
    }
  }

  const errors = words.filter((w) => w.status !== 'ok').length + extra.length;
  return { words, extra, errors, allRight: errors === 0 };
}
