/**
 * Sound Lab — the minimal pairs.
 *
 * Plan (docs/academy-master-plan.md, "pronunciation as the spine"): ears first. A learner who cannot HEAR a difference
 * cannot produce it, so every lock is trained as listening first: hear one word and choose it, then say whether two
 * words are the same or different, in several voices. Saying it comes last, is private and never scored by a machine.
 *
 * The four contrasts are the ones that cost most learners of English with Arabic, French and Spanish as a first language
 * (and many others) the most misunderstandings. Each lock trains exactly ONE contrast.
 *
 * Words are common, American-English minimal pairs whose single-word reading is not ambiguous (left out on purpose:
 * live, lead, wind, mouth, bass, vase: a text-to-speech voice cannot be trusted with them).
 */
export type Voice = 'teacher' | 'leo' | 'willow';
/** Three approved American recorded voices (a woman, a man, another woman): hearing one sound in several voices is what makes the ear generalise. */
export const SOUND_LAB_VOICES: Voice[] = ['teacher', 'leo', 'willow'];

export interface Contrast {
  id: 'ih-ee' | 'p-b' | 'b-v' | 'th-s';
  /** Lock name on the map. */
  name: string;
  /** The two sounds, in the same order as the two words of each pair. */
  a: { ipa: string; label: string; how: string };
  b: { ipa: string; label: string; how: string };
  /** One line about the difference, shown after a mistake: what to LISTEN for (never a score). */
  listenFor: string;
  /** The one thing to change when you say it. */
  oneFix: string;
  /** Pairs: [wordWithSoundA, wordWithSoundB]. */
  pairs: [string, string][];
}

export const CONTRASTS: Contrast[] = [
  {
    id: 'ih-ee',
    name: 'Short or long i',
    a: { ipa: 'ɪ', label: 'short /ɪ/', how: 'short and relaxed, lips loose' },
    b: { ipa: 'iː', label: 'long /iː/', how: 'long and tight, lips stretched in a smile' },
    listenFor: 'Is the vowel short and quick (ship), or long and smiling (sheep)?',
    oneFix: 'For the long sound, stretch your lips into a smile and hold it a little longer.',
    pairs: [['ship', 'sheep'], ['bit', 'beat'], ['sit', 'seat'], ['fill', 'feel'], ['chip', 'cheap'], ['slip', 'sleep'], ['hit', 'heat'], ['dip', 'deep']],
  },
  {
    id: 'p-b',
    name: 'P or B',
    a: { ipa: 'p', label: '/p/', how: 'a puff of air, no voice' },
    b: { ipa: 'b', label: '/b/', how: 'voice from the start, no puff' },
    listenFor: 'Does the word start with a puff of air (pack), or with a voiced hum (back)?',
    oneFix: 'Hold a tissue in front of your mouth: it should flutter for /p/ and stay still for /b/.',
    pairs: [['pack', 'back'], ['pet', 'bet'], ['pair', 'bear'], ['pig', 'big'], ['park', 'bark'], ['pull', 'bull'], ['rope', 'robe'], ['cap', 'cab']],
  },
  {
    id: 'b-v',
    name: 'B or V',
    a: { ipa: 'b', label: '/b/', how: 'both lips close, then pop' },
    b: { ipa: 'v', label: '/v/', how: 'top teeth touch the bottom lip, air keeps flowing' },
    listenFor: 'Do the lips pop closed (ban), or do the teeth rest on the lip with a buzz (van)?',
    oneFix: 'For /v/ put your top teeth on your bottom lip and keep the air moving; the lips never close.',
    pairs: [['ban', 'van'], ['best', 'vest'], ['berry', 'very'], ['boat', 'vote'], ['curb', 'curve'], ['bet', 'vet'], ['bat', 'vat'], ['marble', 'marvel']],
  },
  {
    id: 'th-s',
    name: 'TH or S',
    a: { ipa: 'θ', label: '/θ/ (th)', how: 'tongue tip between the teeth, soft air' },
    b: { ipa: 's', label: '/s/', how: 'tongue behind the teeth, a hiss' },
    listenFor: 'Is it a soft, breathy sound (think), or a sharp hiss (sink)?',
    oneFix: 'For th, let the tip of your tongue touch your teeth. For s, keep it hidden behind them.',
    pairs: [['think', 'sink'], ['thank', 'sank'], ['thick', 'sick'], ['thumb', 'some'], ['myth', 'miss'], ['path', 'pass'], ['worth', 'worse'], ['theme', 'seem']],
  },
];

export const contrastById = (id: Contrast['id']) => CONTRASTS.find((c) => c.id === id)!;

/** Which side of a pair a word is on (0 = first sound, 1 = second sound). */
export const sideOf = (c: Contrast, word: string): 0 | 1 | -1 => {
  for (const [a, b] of c.pairs) { if (word === a) return 0; if (word === b) return 1; }
  return -1;
};

/** Every (voice, word) the game says aloud: all words of all pairs in all three voices. */
export function soundLabLines(): [Voice, string][] {
  const out: [Voice, string][] = [];
  for (const c of CONTRASTS) for (const [a, b] of c.pairs) for (const w of [a, b]) for (const v of SOUND_LAB_VOICES) out.push([v, w]);
  return out;
}
