/**
 * Twister Lab — the tongue twisters.
 *
 * Everything the game says is REGISTERED here and recorded in advance (static clips in public/audio-cache, baked by
 * scripts/generate-voice-cache.mjs): no AI, no live voice, no speech recognition. The game never judges the student's
 * voice. Spelling is checked by a plain, fixed algorithm (spellCheck.ts) against the text registered below.
 *
 * Learning method (classic tongue-twister teaching, see docs/research/twister-lab.md): (1) hear it, chunk by chunk and at
 * speed; (2) build it from its chunks; (3) write it from memory and fix the spelling; (4) say it slowly, then at a normal
 * pace, then fast, and listen to yourself. Clear beats fast.
 *
 * Twisters are traditional or written for this game (American English words only: no "lorry").
 */
export type TwisterVoice = 'teacher' | 'leo';
/** Two approved American recorded voices: a woman and a man. */
export const TWISTER_VOICES: TwisterVoice[] = ['teacher', 'leo'];

export interface Twister {
  id: string;
  /** Short name for the map. */
  title: string;
  level: 'A1' | 'A2' | 'B1';
  /** The sound it trains, e.g. "sh and s". */
  sound: string;
  /** What to do with your mouth, one line (never a score). */
  tip: string;
  /** The full text, with punctuation. */
  text: string;
  /** The text cut into chunks for learning step by step (joined with spaces they give `text`). */
  chunks: string[];
  /** Letters to colour in the text (the trained sound's spelling), longest first. */
  focus: string[];
  /** One spelling reminder for the words students most often get wrong in this twister. */
  spellingTips: { word: string; tip: string }[];
}

export const TWISTERS: Twister[] = [
  {
    id: 'seashells', title: 'Seashells', level: 'A1', sound: 'sh and s',
    tip: 'For sh, round your lips and push air through. For s, pull your lips back and hiss.',
    text: 'She sells seashells by the seashore.',
    chunks: ['She sells', 'seashells', 'by the seashore.'],
    focus: ['sh', 's'],
    spellingTips: [{ word: 'seashells', tip: 'one word: sea + shells' }, { word: 'seashore', tip: 'one word: sea + shore' }],
  },
  {
    id: 'snails', title: 'Slippery snails', level: 'A1', sound: 's',
    tip: 'Keep the tip of your tongue behind your top teeth and let the air hiss.',
    text: 'Six slippery snails slid slowly seaward.',
    chunks: ['Six slippery snails', 'slid slowly seaward.'],
    focus: ['s'],
    spellingTips: [{ word: 'slippery', tip: 'double p' }, { word: 'seaward', tip: 'sea + ward' }],
  },
  {
    id: 'peter-piper', title: 'Peter Piper', level: 'A2', sound: 'p',
    tip: 'For p, close your lips and let a small puff of air out. Hold your hand in front of your mouth to feel it.',
    text: 'Peter Piper picked a peck of pickled peppers.',
    chunks: ['Peter Piper picked', 'a peck of', 'pickled peppers.'],
    focus: ['p'],
    spellingTips: [{ word: 'peppers', tip: 'double p' }, { word: 'pickled', tip: 'ck, then led' }],
  },
  {
    id: 'betty-botter', title: 'Betty Botter', level: 'A2', sound: 'b',
    tip: 'For b, close your lips and use your voice at once: a soft hum, no puff of air.',
    text: 'Betty Botter bought some butter but she said the butter is bitter.',
    chunks: ['Betty Botter bought some butter', 'but she said', 'the butter is bitter.'],
    focus: ['b'],
    spellingTips: [{ word: 'bought', tip: 'ough, then t' }, { word: 'butter', tip: 'double t' }, { word: 'bitter', tip: 'double t' }],
  },
  {
    id: 'thin-thieves', title: 'Thin thieves', level: 'A2', sound: 'th',
    tip: 'For th, put the tip of your tongue lightly between your teeth and blow soft air.',
    text: 'Three thin thieves thought three thick thoughts.',
    chunks: ['Three thin thieves', 'thought', 'three thick thoughts.'],
    focus: ['th'],
    spellingTips: [{ word: 'thieves', tip: 'i before e' }, { word: 'thought', tip: 'ough, then t' }],
  },
  {
    id: 'woodchuck', title: 'Woodchuck', level: 'B1', sound: 'w and ch',
    tip: 'For w, round your lips like a tiny circle. For ch, start with t and open into sh.',
    text: 'How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
    chunks: ['How much wood', 'would a woodchuck chuck', 'if a woodchuck', 'could chuck wood?'],
    focus: ['ch', 'w'],
    spellingTips: [{ word: 'woodchuck', tip: 'one word: wood + chuck' }, { word: 'would', tip: 'would, could: ould' }, { word: 'could', tip: 'would, could: ould' }],
  },
  {
    id: 'red-leather', title: 'Red leather', level: 'B1', sound: 'r and l',
    tip: 'For r, curl your tongue back without touching anything. For l, touch the tip of your tongue behind your top teeth.',
    text: 'Red leather, yellow leather, red leather, yellow leather.',
    chunks: ['Red leather,', 'yellow leather,', 'red leather,', 'yellow leather.'],
    focus: ['r', 'l'],
    spellingTips: [{ word: 'leather', tip: 'ea, then ther' }, { word: 'yellow', tip: 'double l' }],
  },
  {
    id: 'fred-ted', title: 'Fred and Ted', level: 'B1', sound: 'f and d',
    tip: 'For f, put your top teeth on your bottom lip and blow. For d, tap your tongue behind your top teeth.',
    text: 'Fred fed Ted bread and Ted fed Fred bread.',
    chunks: ['Fred fed Ted bread', 'and Ted fed Fred bread.'],
    focus: ['f', 'd'],
    spellingTips: [{ word: 'bread', tip: 'ea, as in head' }],
  },
];

export const twisterById = (id: string) => TWISTERS.find((t) => t.id === id);

/** Words of a text as the game compares them: lower case, no punctuation. */
export function wordsOf(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
}

/** Every (voice, line) the game says aloud: each twister whole and each chunk, in both voices. */
export function twisterLines(): [TwisterVoice, string][] {
  const out: [TwisterVoice, string][] = [];
  for (const t of TWISTERS) for (const line of [t.text, ...t.chunks]) for (const v of TWISTER_VOICES) out.push([v, line]);
  return out;
}
