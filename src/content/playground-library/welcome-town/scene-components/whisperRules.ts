/* Pure rules for WhisperTubeScene (kept out of the component so tests can import them). */

/** The words of a sentence as shown on the chips (punctuation stays on the word). */
export const wordsOf = (s: string) => s.trim().split(/\s+/).filter(Boolean);
/** A word without punctuation or case, for comparing. */
export const bare = (w: string) => w.toLowerCase().replace(/’/g, "'").replace(/[^\p{L}\p{N}']/gu, '');

/** Index of the one word that changed between what was said and what was heard (-1 if none / not one word). */
export function changedWord(said: string, heard: string): number {
  const a = wordsOf(said); const b = wordsOf(heard);
  if (a.length !== b.length) return -1;
  const diff = a.map((w, i) => (bare(w) === bare(b[i]) ? -1 : i)).filter((i) => i >= 0);
  return diff.length === 1 ? diff[0] : -1;
}

/** The fix choices: the right word, the misheard word and any extras — in a fixed, alphabetical order. */
export function fixChoices(said: string, heard: string, extras: string[] = []): { choices: string[]; answer: number } {
  const i = changedWord(said, heard);
  if (i < 0) return { choices: [], answer: -1 };
  const right = bare(wordsOf(said)[i]); const wrong = bare(wordsOf(heard)[i]);
  const choices = [...new Set([right, wrong, ...extras.map(bare)])].filter(Boolean).sort();
  return { choices, answer: choices.indexOf(right) };
}
