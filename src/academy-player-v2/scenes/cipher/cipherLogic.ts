// Pure logic of the Participle Cipher (Wordle-style feedback). No React here.
export type Mark = 'green' | 'yellow' | 'grey';
export interface CipherCard {
  /** the context sentence with a ___ gap: "I have never ___ a rainbow like this." */
  sentence: string;
  base: string;
  past: string;
  participle: string;
  /** an extra clue line shown with the first-letter hint after three misses */
  clue?: string;
}

/** green = right letter, right place; yellow = in the word elsewhere; grey = not (left over); duplicates counted like Wordle */
export function marksOf(guess: string, answer: string): Mark[] {
  const g = guess.toLowerCase(); const a = answer.toLowerCase();
  const out: Mark[] = Array.from({ length: g.length }, () => 'grey');
  const left: Record<string, number> = {};
  for (let i = 0; i < a.length; i++) { if (g[i] === a[i]) out[i] = 'green'; else left[a[i]] = (left[a[i]] ?? 0) + 1; }
  for (let i = 0; i < g.length; i++) {
    if (out[i] === 'green') continue;
    if ((left[g[i]] ?? 0) > 0) { out[i] = 'yellow'; left[g[i]]--; }
  }
  return out;
}

/** what a full guess is: the answer, the past simple (right verb, wrong form), the base form, or something else */
export function classify(guess: string, c: CipherCard): 'right' | 'past' | 'base' | 'other' {
  const g = guess.toLowerCase();
  if (g === c.participle.toLowerCase()) return 'right';
  if (g === c.past.toLowerCase()) return 'past';
  if (g === c.base.toLowerCase()) return 'base';
  return 'other';
}

const RANK: Record<Mark, number> = { grey: 0, yellow: 1, green: 2 };
/** the best mark each letter has earned on the on-screen keyboard */
export function keyStates(rows: { guess: string; marks: Mark[] }[]): Record<string, Mark> {
  const s: Record<string, Mark> = {};
  for (const r of rows) r.guess.split('').forEach((ch, i) => { if (!s[ch] || RANK[r.marks[i]] > RANK[s[ch]]) s[ch] = r.marks[i]; });
  return s;
}

/** the sentence with the gap filled */
export const fillGap = (c: CipherCard, word: string = c.participle) => c.sentence.replace('___', word);
