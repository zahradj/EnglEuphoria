/**
 * SPEECH POLICY — the one place that decides how EVERY recorded/generated voice
 * in Engleuphoria must sound. Universal: all hubs (Playground, Academy, Success),
 * lesson dialogue, games, placement tests, storybooks, homework.
 *
 *   1. NO ACCENT.   Every voice a student or teacher hears must be a native,
 *      standard (General American) speaker — no regional accent and no foreign
 *      accent. Change REQUIRED_ACCENT to retarget the whole product.
 *   2. ACCURATE PRONUNCIATION.  Text is cleaned before it is spoken
 *      (normalizeForSpeech) so numbers, abbreviations, ALL-CAPS words, hyphenated
 *      reduplications ("yo-yo"), symbols and emoji are read the way a teacher
 *      would say them, and delivery settings are kept in the range where the
 *      pronunciation stays stable (safeVoiceSettings).
 *   3. NEVER spell out a sound.  Isolated phonics sounds come ONLY from recorded
 *      files (see CLAUDE.md); speechRisks() flags "sss", "/h/" etc.
 *
 * MIRROR: supabase/functions/_shared/speechPolicy.ts must stay byte-identical to
 * this file (Deno cannot import from src/). voicePolicy.test.ts enforces that.
 * Quality audit: .claude/skills/lesson-quality-gate (Engine 6), `npm run audit:voice`.
 */

/** "No accent" = standard native General American. */
export const REQUIRED_ACCENT = 'american';

export type VoiceGender = 'female' | 'male' | 'neutral';

export interface VoiceProfile {
  id: string;
  name: string;
  /** Accent as labelled in the ElevenLabs voice library. Re-verified by `npm run audit:voice`. */
  accent: string;
  gender: VoiceGender;
}

/** Every ElevenLabs voice the codebase has used, with its library accent label. */
export const VOICE_PROFILES: VoiceProfile[] = [
  // ---- approved: native General American
  { id: 'jsCqWAovK2LkecY7zXl4', name: 'Freya', accent: 'american', gender: 'female' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', accent: 'american', gender: 'female' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', accent: 'american', gender: 'female' },
  { id: 'piTKgcLEGmPE4e6mEKli', name: 'Nicole', accent: 'american', gender: 'female' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', accent: 'american', gender: 'female' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', accent: 'american', gender: 'female' },
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', accent: 'american', gender: 'female' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', accent: 'american', gender: 'female' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', accent: 'american', gender: 'male' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', accent: 'american', gender: 'male' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', accent: 'american', gender: 'male' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', accent: 'american', gender: 'male' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', accent: 'american', gender: 'male' },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', accent: 'american', gender: 'neutral' },
  // ---- NOT approved: carry an accent
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', accent: 'british', gender: 'female' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', accent: 'british', gender: 'female' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', accent: 'british', gender: 'male' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', accent: 'british', gender: 'male' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', accent: 'australian', gender: 'male' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', accent: 'swedish', gender: 'female' },
  { id: 'zrHiDhphv9ZnVXBqCLjz', name: 'Mimi', accent: 'swedish', gender: 'female' },
];

const BY_ID = new Map(VOICE_PROFILES.map((v) => [v.id, v]));

export type VoiceStatus = 'approved' | 'accented' | 'unverified';

/** approved = labelled with the required accent; accented = labelled with another accent;
 *  unverified = a custom/library voice we have no accent label for (audit it before relying on it). */
export function voiceStatus(voiceId: string | null | undefined): VoiceStatus {
  const p = voiceId ? BY_ID.get(voiceId) : undefined;
  if (!p) return 'unverified';
  return p.accent === REQUIRED_ACCENT ? 'approved' : 'accented';
}

export const isApprovedVoice = (voiceId: string | null | undefined): boolean => voiceStatus(voiceId) === 'approved';

/** An accented voice is replaced by the closest approved one (same gender, similar energy). */
export const ACCENTED_VOICE_REPLACEMENT: Record<string, string> = {
  pFZP5JQG7iQjIQuC4Bku: 'cgSgspJ2msm6clMCkdW9', // Lily (British)     -> Jessica
  zrHiDhphv9ZnVXBqCLjz: 'MF3mGyEYCl7XYWbV9V6O', // Mimi (Swedish)     -> Elli (child-like)
  XB0fDUnXU5powFXDhCwa: 'EXAVITQu4vr4xnSDxMaL', // Charlotte (Swedish)-> Sarah
  Xb7hH8MSUJpSbSDYk0k2: 'FGY2WhTYpPnrIDTdsKH5', // Alice (British)    -> Laura
  JBFqnCBsd6RMkjVDRZzb: 'nPczCjzI2devNBz1zQrb', // George (British)   -> Brian
  onwK4e9ZLuTAKqWW03F9: 'nPczCjzI2devNBz1zQrb', // Daniel (British)   -> Brian
  IKne3meq5aSn9XLyUdCD: 'TX3LPaxmHKxFdv7VOQHJ', // Charlie (Aus.)     -> Liam
};

/** The voice to actually synthesize with: accented voices are swapped for an approved one;
 *  approved and unverified voices pass through unchanged. */
export function approvedVoiceId(voiceId: string): string {
  return ACCENTED_VOICE_REPLACEMENT[voiceId] ?? voiceId;
}

/** Delivery settings kept in the range where pronunciation stays accurate and consistent.
 *  Very low stability / high style ("cartoon" settings) makes ElevenLabs drift, mispronounce
 *  and sound foreign. */
export interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  speed?: number;
}
export const SETTINGS_LIMITS = { minStability: 0.5, maxStyle: 0.4 } as const;

export function safeVoiceSettings<T extends VoiceSettings>(settings: T): T {
  const out = { ...settings };
  if (typeof out.stability === 'number') out.stability = Math.max(SETTINGS_LIMITS.minStability, out.stability);
  if (typeof out.style === 'number') out.style = Math.min(SETTINGS_LIMITS.maxStyle, out.style);
  return out;
}

/** Only Turbo/Flash v2.5 accept a language lock; sending it to other models is an API error. */
export function languageLock(modelId: string): { language_code?: string } {
  return /^eleven_(turbo|flash)_v2_5/.test(modelId) ? { language_code: 'en' } : {};
}

/** The default model guesses the language from the text, so a line of one or two
 *  words can be read as another language: "hat" came out as German /hat/, "wand"
 *  as /vand/. Even the English-locked v2.5 model still did that (2026-10-02
 *  sound-level audit), so short lines use the English-ONLY Turbo v2 model, with
 *  each word's dictionary pronunciation as a <phoneme> tag (pronunciations.ts). */
export const DEFAULT_TTS_MODEL = 'eleven_multilingual_v2';
export const SHORT_LINE_TTS_MODEL = 'eleven_turbo_v2';
export const SHORT_LINE_MAX_WORDS = 2;
/** Clip-cache version for short lines, so their old (mispronounced) clips are re-recorded. */
export const SHORT_LINE_CLIP_VERSION = 'v14s';

export function isShortLine(text: string): boolean {
  const words = text.replace(/[^\p{L}\p{N}'’\s-]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= SHORT_LINE_MAX_WORDS;
}

export function ttsModelFor(text: string): string {
  return isShortLine(text) ? SHORT_LINE_TTS_MODEL : DEFAULT_TTS_MODEL;
}

/* ------------------------------------------------------------------ pronunciation */

/** Words a TTS reads wrongly as written -> how a teacher would say them. Keys are lowercase. */
export const SPOKEN_FORMS: Record<string, string> = {
  'yo-yo': 'yo yo',
  yoyo: 'yo yo',
  ok: 'okay',
  'tv': 'T V',
  'e.g.': 'for example',
  'i.e.': 'that is',
  'etc.': 'and so on',
  vs: 'versus',
  mr: 'Mister',
  mrs: 'Missus',
  ms: 'Miss',
  dr: 'Doctor',
};

/** ALL-CAPS tokens that really are spoken as letters. Anything else in caps is a shouted word. */
const SPELLED_ACRONYMS = new Set(['ABC', 'USA', 'UK', 'TV', 'DVD', 'CEO', 'PDF', 'FAQ', 'ESL', 'CD', 'PC', 'ID', 'DJ', 'UFO']);

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ORDINAL_ONES = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth'];

export function numberToWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999) return String(n);
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : '');
  const rest = n % 100;
  return `${ONES[Math.floor(n / 100)]} hundred${rest ? ` ${numberToWords(rest)}` : ''}`;
}

const capitalizeLike = (original: string, replacement: string) =>
  original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()
    ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
    : replacement;

/**
 * Clean text so a TTS voice pronounces it the way a teacher would say it.
 * Text that already carries markup (SSML such as <phoneme>) is passed through untouched.
 */
export function normalizeForSpeech(input: string): string {
  if (!input) return '';
  if (/<[a-z][^>]*>/i.test(input)) return input; // SSML: the author controls it
  let s = input.normalize('NFC');
  s = s.replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"');
  s = s.replace(/[\p{Extended_Pictographic}️‍]/gu, ' '); // emoji are never spoken
  s = s.replace(/[*_`#~]+/g, ' ').replace(/\s+/g, ' ');

  // lexicon of known tricky words / abbreviations (whole word, case-insensitive)
  const keys = Object.keys(SPOKEN_FORMS).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  s = s.replace(new RegExp(`(?<![\\p{L}\\p{N}])(${keys.join('|')})\\.?(?![\\p{L}\\p{N}])`, 'giu'), (m, word: string) => {
    const spoken = SPOKEN_FORMS[word.toLowerCase()];
    return spoken ? capitalizeLike(word, spoken) : m;
  });

  s = s.replace(/&/g, ' and ').replace(/%/g, ' percent ');
  s = s.replace(/(\p{L}{2,})\/(\p{L}{2,})/gu, '$1 or $2'); // he/she -> he or she (not /h/ sound notation)
  s = s.replace(/(\p{L})-(?=\p{L})/gu, '$1 '); // yo-yo, T-shirt -> separate words
  s = s.replace(/[–—]/g, ', '); // dashes -> a natural pause

  s = s.replace(/\b(\d{1,3})(?:st|nd|rd|th)\b/gi, (m, d: string) => {
    const n = Number(d);
    if (n <= 20) return ORDINAL_ONES[n];
    const w = numberToWords(n);
    return w.replace(/y$/, 'ie') + 'th';
  });
  s = s.replace(/(?<![\d.,])\b\d{1,3}\b(?![\d,.]*\d)/g, (m) => numberToWords(Number(m)));

  // SHOUTED words are words, not spelled letters ("SAT" -> "sat"); real acronyms stay.
  // Capitalised only where a sentence begins.
  s = s.replace(/\b[A-Z]{3,}\b/g, (w, offset: number, whole: string) => {
    if (SPELLED_ACRONYMS.has(w)) return w;
    const lower = w.toLowerCase();
    const before = whole.slice(0, offset).trimEnd();
    const startsSentence = before === '' || /[.!?"'(]$/.test(before);
    return startsSentence ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
  });

  s = s.replace(/\.{2,}|…/g, ', ').replace(/,\s*,/g, ',').replace(/,\s*([.!?])/g, '$1').replace(/,\s*$/g, '.');
  return s.replace(/\s+([,.!?;:])/g, '$1').replace(/\s+/g, ' ').trim();
}

export type SpeechRiskCode =
  | 'spelled-sound'      // "sss", "mmm" — a TTS cannot say an isolated sound; use the recorded file
  | 'phoneme-notation'   // "/h/", "/sh/" — would be read as "slash h slash"
  | 'digits'
  | 'emoji'
  | 'all-caps-word'
  | 'abbreviation'
  | 'symbol'
  | 'non-latin-script'   // a TTS may switch language/accent
  | 'url-or-email';

export interface SpeechRisk { code: SpeechRiskCode; match: string }

/** Everything in `text` a TTS would mispronounce. Run on the RAW text to see what normalization fixes,
 *  or on the normalized text to find what still needs a human (spelled-sound, phoneme-notation, ...). */
export function speechRisks(text: string): SpeechRisk[] {
  const risks: SpeechRisk[] = [];
  const add = (code: SpeechRiskCode, re: RegExp) => {
    for (const m of text.matchAll(re)) risks.push({ code, match: m[0] });
  };
  add('spelled-sound', /\b([a-z])\1{2,}\b/gi);
  add('phoneme-notation', /\/[a-z]{1,3}\//gi);
  add('digits', /\d+/g);
  add('emoji', /[\p{Extended_Pictographic}]/gu);
  add('all-caps-word', /\b[A-Z]{3,}\b/g);
  add('abbreviation', /\b(?:Mr|Mrs|Ms|Dr|vs|etc|e\.g|i\.e)\b\.?/g);
  add('symbol', /[&%@#=+<>|\\]/g);
  add('non-latin-script', /[\p{Script=Cyrillic}\p{Script=Hebrew}\p{Script=Arabic}\p{Script=Devanagari}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/gu);
  add('url-or-email', /\bhttps?:\/\/\S+|\b\S+@\S+\.\S+/g);
  return risks;
}

/** Risks that survive normalization — these are real problems, not just formatting. */
export const unresolvedSpeechRisks = (text: string): SpeechRisk[] => speechRisks(normalizeForSpeech(text));
