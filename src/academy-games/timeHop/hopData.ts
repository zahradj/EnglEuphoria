import { IRREGULAR_VERBS, type Verb } from '../verbForge/verbData';

/**
 * Time Hop — the verbs (present ↔ past simple), the -ed spelling rules and the time-signal sentences.
 *
 * Why it is built this way (docs/research/time-hop.md):
 *  - Only TWO forms, so the learner can hold them as a PAIR: present (blue) and past (orange), the same colours as Verb Forge.
 *  - Irregular verbs are learned as pairs and matched both ways (retrieval in both directions), then spaced (Leitner).
 *  - Regular verbs: the four spelling rules (+ed, +d, y→ied, double the last letter) are taught as a rule, then tested.
 *  - Time words (every day / yesterday) decide the form, so the sentence stage trains the cue, not just the word.
 *  - Subjects are I / we / you / they only, so no third-person -s (she goes) is needed yet.
 */

export type SpellKind = 'ed' | 'd' | 'ied' | 'double';

export interface RegularVerb { base: string; past: string; kind: SpellKind }
const r = (base: string, past: string, kind: SpellKind): RegularVerb => ({ base, past, kind });

export const REGULAR_SPELLING: RegularVerb[] = [
  r('walk', 'walked', 'ed'), r('play', 'played', 'ed'), r('open', 'opened', 'ed'), r('jump', 'jumped', 'ed'),
  r('help', 'helped', 'ed'), r('cook', 'cooked', 'ed'), r('clean', 'cleaned', 'ed'), r('watch', 'watched', 'ed'),
  r('like', 'liked', 'd'), r('live', 'lived', 'd'), r('dance', 'danced', 'd'), r('love', 'loved', 'd'), r('move', 'moved', 'd'), r('smile', 'smiled', 'd'),
  r('study', 'studied', 'ied'), r('try', 'tried', 'ied'), r('carry', 'carried', 'ied'), r('cry', 'cried', 'ied'), r('worry', 'worried', 'ied'),
  r('stop', 'stopped', 'double'), r('plan', 'planned', 'double'), r('hop', 'hopped', 'double'), r('shop', 'shopped', 'double'), r('drop', 'dropped', 'double'),
];

export const SPELL_RULES: Record<SpellKind, { title: string; rule: string; example: string }> = {
  ed: { title: 'Most verbs', rule: 'Add -ed.', example: 'walk → walked' },
  d: { title: 'Verbs ending in e', rule: 'Add only -d.', example: 'like → liked' },
  ied: { title: 'Consonant + y', rule: 'Change y to i, then add -ed.', example: 'study → studied' },
  double: { title: 'Short word: consonant–vowel–consonant', rule: 'Double the last letter, then add -ed.', example: 'stop → stopped' },
};

/** Wrong spellings a learner might write (the rule applied to the wrong kind of verb). */
export function spellingOptions(v: RegularVerb): string[] {
  const b = v.base;
  const last = b[b.length - 1];
  const pool = [`${b}ed`, `${b}d`, /[^aeiou]y$/.test(b) ? `${b.slice(0, -1)}ied` : `${b}${last}ed`, `${b}${last}ed`, `${b.slice(0, -1)}ed`];
  const wrong = [...new Set(pool)].filter((w) => w !== v.past && w !== b);
  // keep the two decoys that look most like the real word: shortest edit first, stable order
  return [v.past, wrong[0], wrong[1]].filter(Boolean) as string[];
}

/** Irregular pairs for matching and recall: the base and the past simple. */
export const HOP_IRREGULAR: Verb[] = IRREGULAR_VERBS.filter((x) => x.past !== x.base);
export const HOP_SAME: Verb[] = IRREGULAR_VERBS.filter((x) => x.past === x.base);

/** Every verb of the recall stop, as a plain pair. */
export interface Pair { base: string; past: string; regular: boolean }
export const HOP_PAIRS: Pair[] = [
  ...IRREGULAR_VERBS.map((x) => ({ base: x.base, past: x.past, regular: false })),
  ...REGULAR_SPELLING.map((x) => ({ base: x.base, past: x.past, regular: true })),
];
export const pairByBase = (base: string) => HOP_PAIRS.find((p) => p.base === base);

export interface SignalRound {
  base: string;
  /** Contains "___" for the gap. */
  text: string;
  tense: 'present' | 'past';
  /** The time words that decide it. */
  signal: string;
}

export const SIGNALS: SignalRound[] = [
  { base: 'go', text: 'We ___ to school every day.', tense: 'present', signal: 'every day' },
  { base: 'go', text: 'We ___ to the beach yesterday.', tense: 'past', signal: 'yesterday' },
  { base: 'eat', text: 'I ___ breakfast at seven every morning.', tense: 'present', signal: 'every morning' },
  { base: 'eat', text: 'I ___ pizza last night.', tense: 'past', signal: 'last night' },
  { base: 'see', text: 'They ___ their friends on Saturdays.', tense: 'present', signal: 'on Saturdays' },
  { base: 'see', text: 'They ___ a big dog two days ago.', tense: 'past', signal: 'two days ago' },
  { base: 'buy', text: 'I usually ___ my lunch at school.', tense: 'present', signal: 'usually' },
  { base: 'buy', text: 'I ___ a new phone last week.', tense: 'past', signal: 'last week' },
  { base: 'play', text: 'We always ___ football after class.', tense: 'present', signal: 'always' },
  { base: 'play', text: 'We ___ football last Sunday.', tense: 'past', signal: 'last Sunday' },
  { base: 'write', text: 'I never ___ letters on paper.', tense: 'present', signal: 'never' },
  { base: 'write', text: 'I ___ a long email yesterday.', tense: 'past', signal: 'yesterday' },
  { base: 'take', text: 'You ___ the bus every Monday.', tense: 'present', signal: 'every Monday' },
  { base: 'take', text: 'You ___ my pen last Friday.', tense: 'past', signal: 'last Friday' },
];

export const signalAnswer = (s: SignalRound) => {
  const p = pairByBase(s.base)!;
  return s.tense === 'present' ? p.base : p.past;
};
export const signalOptions = (s: SignalRound): [string, string] => {
  const p = pairByBase(s.base)!;
  return [p.base, p.past];
};

/** Every word the game says (baked as recorded clips, voice 'teacher'). */
export function hopLines(): string[] {
  const out = new Set<string>();
  for (const p of HOP_PAIRS) { out.add(p.base); out.add(p.past); }
  for (const s of SIGNALS) out.add(s.text.replace('___', signalAnswer(s)));
  return [...out];
}
