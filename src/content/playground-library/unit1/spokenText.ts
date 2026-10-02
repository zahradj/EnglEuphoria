/**
 * What a line SOUNDS like, as opposed to how it is shown on screen.
 *
 * Every voiced line goes through `spokenText()` before it reaches the voice
 * service, both in the app (`speak()` in audio.ts) and in the clip baker
 * (scripts/generate-voice-cache.mjs), so both land on the same clip file.
 * Captions keep the original text.
 *
 * The rules come from the 2026-10-02 pronunciation audit (every baked clip
 * transcribed and compared with its text; docs/voice-audit/):
 * - ALL-CAPS words get read as acronyms or with the wrong vowel
 *   (SAT → "sought", PIN → "pine", KITE → "Kaiti", AT → "H-I"), so they are
 *   lower-cased.
 * - Emoji are dropped; blanks ("___") were read as nonsense words
 *   ("I am Bobby years old"), so they become a pause.
 * - "(-ed)" style hints are dropped.
 * - "read" is present tense ("reed") except in past-tense recap lines.
 * - RETAKE: single words whose recording came out wrong ("car" → "yeah",
 *   "web" → "hiya"). A full stop changes the clip's key, so a fresh take is
 *   recorded, and gives a calm, falling "say the word" intonation.
 *
 * Changing a rule here changes clip file names, so the affected lines are
 * re-recorded by the bake-voice workflow (it runs when this file changes).
 */

const KEEP_CAPS = new Set(['OK', 'TV', 'UK', 'USA', 'ABC', 'DJ']);

/** Lines (exact text) that get a fresh recording; see the audit report. */
const RETAKE = new Set([
  'toy', 'hat', 'Hat', 'wand', 'mouse', 'nut', 'Nut', 'wind', 'ant', 'Ant',
  'Four', 'bag', 'Bag', 'Ten', 'two', 'Duck', 'car', 'teddy', 'balloon',
  'moon', 'Table', 'On', 'In', 'He', 'are', 'chick', 'web', 'Sad', 'sad',
  'mat', 'kite', 'doll', 'bat', 'sat', 'sit', 'pin', 'pip', 'at',
]);

const PAST_LINE = /\b(did|said|met|yesterday|learned|explored|found|was|were|[a-z]{3,}ed)\b/i;

export function spokenText(text: string): string {
  let t = text.trim();
  t = t.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}\u{1F3FB}-\u{1F3FF}]/gu, '');
  t = t.replace(/\s*\(\s*-\w+\s*\)/g, '');
  t = t.replace(/_{2,}/g, '…');
  t = t.replace(/\b[A-Z]{2,}\b/g, (w) => (KEEP_CAPS.has(w) ? w : w.toLowerCase()));
  // A line that now starts lower-case (it was all caps) reads better capitalised.
  if (/^[a-z]/.test(t) && /[A-Z]/.test(text.trim()[0] ?? '')) t = t[0].toUpperCase() + t.slice(1);
  // "read" is present tense ("reed") unless the line is a recap in the past
  // ("You said hello … and read two real words").
  if (!PAST_LINE.test(t)) t = t.replace(/\bread\b/g, 'reed').replace(/\bRead\b/g, 'Reed');
  t = t.replace(/\s{2,}/g, ' ').trim();
  if (RETAKE.has(t) || RETAKE.has(t.toLowerCase())) t = `${t}.`;
  return t;
}
