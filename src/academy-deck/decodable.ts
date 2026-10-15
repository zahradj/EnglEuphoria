// Decodability check for Pre-A1 reading pages (owner 2026-10-12): every word a student must READ is either blendable from the sounds taught so far or a taught whole word.
// Sounds here are single letters (s, a, t, p ...); digraphs come later. Pure functions, no React.
import type { DeckScript, Slide } from './types';

const clean = (w: string): string => w.toLowerCase().replace(/[^a-z']/g, '');

/** Every letter of the word is one of the taught sounds. */
export const isBlendable = (word: string, sounds: string[]): boolean => {
  const w = clean(word);
  return w.length > 0 && [...w].every((ch) => sounds.map((s) => s.toLowerCase()).includes(ch));
};

/** The words of a text that a Pre-A1 student cannot read yet (neither blendable nor a taught sight word). */
export function undecodable(text: string, sounds: string[], sight: string[]): string[] {
  const known = sight.map((w) => clean(w));
  return text.split(/\s+/).map(clean).filter((w) => w && !known.includes(w) && !isBlendable(w, sounds));
}

/** The text a slide asks the student to read: blend words, reader lines. */
export function readingTexts(slide: Slide): string[] {
  if (slide.kind === 'blend') return slide.rounds.map((r) => r.word);
  if (slide.kind === 'reader') return slide.lines.map((l) => l.text);
  if (slide.kind === 'passage') return slide.lines;
  return [];
}

/** All problems of a Pre-A1 deck: reading text that is not decodable from the sounds taught, and blend rounds whose letters do not spell the word. */
export function decodabilityProblems(script: DeckScript): string[] {
  const sounds = script.taughtSounds ?? [];
  const sight = script.sightWords ?? [];
  const out: string[] = [];
  for (const s of script.slides) {
    if (s.kind === 'blend') s.rounds.forEach((r) => { if (r.letters.join('').toLowerCase() !== clean(r.word)) out.push(`${s.id}: letters ${r.letters.join('')} do not spell ${r.word}`); });
    for (const t of readingTexts(s)) {
      const bad = undecodable(t, sounds, sight);
      if (bad.length) out.push(`${s.id}: "${t}" has words not yet decodable: ${bad.join(', ')}`);
    }
  }
  return out;
}
