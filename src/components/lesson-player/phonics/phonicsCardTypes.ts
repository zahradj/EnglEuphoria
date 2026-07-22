// PhonicsCard — shared types & helpers consumed by the three hub skins.
//
// Pedagogy contract (same across all 3 hub skins):
//   Hear  → big audio of the phoneme, autoplays once on mount
//   See   → grapheme(s) shown huge, highlighted inside 2–3 example words
//   Say   → record-and-mimic (uses existing phonetic mimic engine)
//   Do    → ONE micro-interaction (tap-the-sound | blend | minimal-pair | trace)
//
// The visual surface, copy register, and motion language differ per hub —
// each hub renders its own component but consumes this same data shape.

export type PhonicsBeat = 'hear' | 'see' | 'say' | 'do';

export interface PhonicsCardData {
  /** Target grapheme(s), e.g. "sh", "ai", "silent-e". */
  grapheme: string;
  /** Target phoneme in IPA, e.g. "/ʃ/". */
  phoneme: string;
  /** Plain-English description of the mouth shape (Playground) or articulation (Success). */
  mouth_hint?: string;
  /** Audio URL of the isolated phoneme. */
  phoneme_audio_url?: string;
  /** 2–3 example words with the target grapheme. */
  examples: Array<{
    word: string;
    audio_url?: string;
    image_url?: string;
    /** Start/end index of the target grapheme inside `word`, for highlighting. */
    highlight: [number, number];
  }>;
  /** Optional "do" step config. If omitted, falls back to repeat-after-audio. */
  do_step?: PhonicsDoStep;
  /** Progression rail metadata. */
  progression?: {
    unit_label: string;     // e.g. "Sound 12 of 44"
    phase_label: string;    // e.g. "Digraphs"
  };
}

export type PhonicsDoStep =
  | { kind: 'phoneme_isolation'; pictures: Array<{ word: string; image_url?: string; starts_with_target: boolean }> }
  | { kind: 'blending_animation'; letters: string[]; word: string; word_audio_url?: string }
  | { kind: 'minimal_pair_tap'; pair: [string, string]; correct: string; audio_url?: string }
  | { kind: 'grapheme_hunt'; sentence: string; target_grapheme: string }
  | { kind: 'decoding_probe'; items: Array<{ word: string; is_pseudoword: boolean }> };

export const BEAT_ORDER: PhonicsBeat[] = ['hear', 'see', 'say', 'do'];

/** Wraps the target grapheme inside `word` with <mark>…</mark> for visual highlighting. */
export function highlightWord(word: string, range: [number, number]): { before: string; target: string; after: string } {
  const [start, end] = range;
  return {
    before: word.slice(0, start),
    target: word.slice(start, end),
    after: word.slice(end),
  };
}
