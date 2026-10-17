// Pure logic of Stress Beats: the written stress, how long a "hold" is, the L1 note choice. No React here (unit-tested).
export interface L1Note { generic: string; es?: string; fr?: string; it?: string; ar?: string; tr?: string }
export interface BeatsPair { word: string; syllables: string[]; sentence: string }
export interface BeatsItem {
  word: string;
  /** the syllables as written, in order: ['em', 'bar', 'rassed'] (they join back into the word) */
  syllables: string[];
  /** 0-based index of the stressed syllable */
  stressIndex: number;
  sentence: string;
  /** the -ed / -ing partner (exCITed / exCITing): the stress stays on the same syllable */
  pair?: BeatsPair;
  /** a false-friend or pronunciation note; shown in the student's language when we have it, else the generic line */
  l1Note?: L1Note;
}
/** how long the strong pad must be held in the accent lane (a double tap also counts: the tap-only way) */
export const HOLD_MS = 330;
export const DOUBLE_TAP_MS = 520;
export const isHold = (ms: number) => ms >= HOLD_MS;

/** em·BAR·rassed */
export const markStress = (syllables: string[], stress: number): string => syllables.map((s, k) => (k === stress ? s.toUpperCase() : s.toLowerCase())).join('·');

/** the note to show: the student's language when known, else the generic line */
export function noteFor(n: L1Note | undefined, lang: string | undefined): { text: string; own: boolean } | undefined {
  if (!n) return undefined;
  const code = (lang ?? '').slice(0, 2).toLowerCase() as keyof L1Note;
  const own = code && code !== ('en' as string) && typeof n[code] === 'string' && n[code]!.trim() ? n[code]! : undefined;
  return own ? { text: own, own: true } : { text: n.generic, own: false };
}

export function checkItem(it: BeatsItem): string[] {
  const p: string[] = [];
  const j = it.syllables.join('').toLowerCase();
  if (it.syllables.length < 2 || it.syllables.length > 4) p.push(`${it.word}: a word on the pads has 2-4 syllables`);
  if (j !== it.word.toLowerCase()) p.push(`${it.word}: the syllables join into "${j}"`);
  if (it.stressIndex < 0 || it.stressIndex >= it.syllables.length) p.push(`${it.word}: the stress is outside the word`);
  if (!new RegExp(`\\b${it.word}\\b`, 'i').test(it.sentence)) p.push(`${it.word}: the sentence does not contain the word`);
  if (it.pair) {
    const pj = it.pair.syllables.join('').toLowerCase();
    if (pj !== it.pair.word.toLowerCase()) p.push(`${it.pair.word}: the syllables join into "${pj}"`);
    if (it.pair.syllables.length <= it.stressIndex) p.push(`${it.pair.word}: the stressed syllable is missing`);
    if (it.pair.syllables.slice(0, it.stressIndex + 1).join('').toLowerCase() !== it.syllables.slice(0, it.stressIndex + 1).join('').toLowerCase()) p.push(`${it.pair.word}: the stress must stay on the same syllable as ${it.word}`);
    if (!new RegExp(`\\b${it.pair.word}\\b`, 'i').test(it.pair.sentence)) p.push(`${it.pair.word}: the sentence does not contain the word`);
  }
  if (it.l1Note && !it.l1Note.generic.trim()) p.push(`${it.word}: an L1 note needs a generic line`);
  return p;
}
