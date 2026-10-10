/**
 * Verb Forge — the verbs, the pattern families and the sentences.
 *
 * Why it is built this way (research summary, see docs/research/verb-forge.md):
 *  - Group irregular verbs by PATTERN and by SOUND FAMILY (sing-sang-sung, know-knew-known, buy-bought-bought) instead
 *    of one long list: eight families are easier to hold than sixty loose verbs.
 *  - Start with the most frequent verbs, practise them in sentences, and test by RETRIEVAL (recall), not by re-reading.
 *  - Space the reviews (Leitner boxes, per FORM: a learner may know "went" and still miss "gone").
 *  - Colour code the three forms everywhere: base = blue, past simple = orange, past participle = green.
 *
 * Left out on purpose: read / lead / wind (their past forms are spelled like another word, and a text-to-speech voice
 * cannot be trusted with them), get (got vs gotten differs between American and British English), learn / dream /
 * burn (two accepted spellings), be (two past forms).
 */

export type VerbPattern = 'AAA' | 'ABB' | 'ABC' | 'ABA' | 'REG';
export type FamilyId = 'same' | 'sing' | 'know' | 'ought' | 'speak' | 'write' | 'kept' | 'told' | 'run' | 'odd';

export interface Verb {
  base: string;
  past: string;
  pp: string;
  pattern: VerbPattern;
  family: FamilyId | 'regular';
}

const v = (base: string, past: string, pp: string, pattern: VerbPattern, family: Verb['family']): Verb => ({ base, past, pp, pattern, family });

export const IRREGULAR_VERBS: Verb[] = [
  // same - same - same
  v('cut', 'cut', 'cut', 'AAA', 'same'), v('put', 'put', 'put', 'AAA', 'same'), v('hit', 'hit', 'hit', 'AAA', 'same'), v('let', 'let', 'let', 'AAA', 'same'),
  v('set', 'set', 'set', 'AAA', 'same'), v('shut', 'shut', 'shut', 'AAA', 'same'), v('hurt', 'hurt', 'hurt', 'AAA', 'same'), v('cost', 'cost', 'cost', 'AAA', 'same'),
  // i - a - u
  v('sing', 'sang', 'sung', 'ABC', 'sing'), v('drink', 'drank', 'drunk', 'ABC', 'sing'), v('swim', 'swam', 'swum', 'ABC', 'sing'),
  v('begin', 'began', 'begun', 'ABC', 'sing'), v('ring', 'rang', 'rung', 'ABC', 'sing'),
  // -ow / -ew / -own
  v('know', 'knew', 'known', 'ABC', 'know'), v('grow', 'grew', 'grown', 'ABC', 'know'), v('throw', 'threw', 'thrown', 'ABC', 'know'),
  v('blow', 'blew', 'blown', 'ABC', 'know'), v('draw', 'drew', 'drawn', 'ABC', 'know'), v('fly', 'flew', 'flown', 'ABC', 'know'),
  // -ought / -aught
  v('buy', 'bought', 'bought', 'ABB', 'ought'), v('bring', 'brought', 'brought', 'ABB', 'ought'), v('think', 'thought', 'thought', 'ABB', 'ought'),
  v('fight', 'fought', 'fought', 'ABB', 'ought'), v('catch', 'caught', 'caught', 'ABB', 'ought'), v('teach', 'taught', 'taught', 'ABB', 'ought'),
  // -oke / -oken
  v('speak', 'spoke', 'spoken', 'ABC', 'speak'), v('break', 'broke', 'broken', 'ABC', 'speak'), v('wake', 'woke', 'woken', 'ABC', 'speak'), v('choose', 'chose', 'chosen', 'ABC', 'speak'),
  // i - o - i(d)den
  v('write', 'wrote', 'written', 'ABC', 'write'), v('drive', 'drove', 'driven', 'ABC', 'write'), v('ride', 'rode', 'ridden', 'ABC', 'write'),
  // short vowel + t
  v('keep', 'kept', 'kept', 'ABB', 'kept'), v('sleep', 'slept', 'slept', 'ABB', 'kept'), v('feel', 'felt', 'felt', 'ABB', 'kept'), v('leave', 'left', 'left', 'ABB', 'kept'),
  // -old
  v('tell', 'told', 'told', 'ABB', 'told'), v('sell', 'sold', 'sold', 'ABB', 'told'),
  // come - came - come
  v('come', 'came', 'come', 'ABA', 'run'), v('run', 'ran', 'run', 'ABA', 'run'), v('become', 'became', 'become', 'ABA', 'run'),
  // the odd ones: learn each with its own picture
  v('go', 'went', 'gone', 'ABC', 'odd'), v('see', 'saw', 'seen', 'ABC', 'odd'), v('eat', 'ate', 'eaten', 'ABC', 'odd'), v('take', 'took', 'taken', 'ABC', 'odd'),
  v('give', 'gave', 'given', 'ABC', 'odd'), v('do', 'did', 'done', 'ABC', 'odd'), v('wear', 'wore', 'worn', 'ABC', 'odd'), v('forget', 'forgot', 'forgotten', 'ABC', 'odd'),
  v('fall', 'fell', 'fallen', 'ABC', 'odd'), v('make', 'made', 'made', 'ABB', 'odd'), v('say', 'said', 'said', 'ABB', 'odd'), v('pay', 'paid', 'paid', 'ABB', 'odd'),
  v('find', 'found', 'found', 'ABB', 'odd'), v('have', 'had', 'had', 'ABB', 'odd'), v('meet', 'met', 'met', 'ABB', 'odd'), v('win', 'won', 'won', 'ABB', 'odd'),
  v('lose', 'lost', 'lost', 'ABB', 'odd'), v('hear', 'heard', 'heard', 'ABB', 'odd'), v('send', 'sent', 'sent', 'ABB', 'odd'), v('build', 'built', 'built', 'ABB', 'odd'),
];

export const REGULAR_VERBS: Verb[] = [
  v('walk', 'walked', 'walked', 'REG', 'regular'), v('play', 'played', 'played', 'REG', 'regular'), v('open', 'opened', 'opened', 'REG', 'regular'),
  v('like', 'liked', 'liked', 'REG', 'regular'), v('live', 'lived', 'lived', 'REG', 'regular'), v('study', 'studied', 'studied', 'REG', 'regular'),
  v('try', 'tried', 'tried', 'REG', 'regular'), v('stop', 'stopped', 'stopped', 'REG', 'regular'), v('plan', 'planned', 'planned', 'REG', 'regular'),
];

export const ALL_VERBS: Verb[] = [...IRREGULAR_VERBS, ...REGULAR_VERBS];
export const verbByBase = (base: string) => ALL_VERBS.find((x) => x.base === base);

export interface Family {
  id: FamilyId;
  /** Short name, used as the forge's name: "the SING forge". */
  name: string;
  /** The change in one line. */
  rule: string;
  /** The memory hook. */
  hook: string;
}

export const FAMILIES: Record<FamilyId, Family> = {
  same: { id: 'same', name: 'CUT', rule: 'cut – cut – cut', hook: 'Nothing changes. Three forms, one word.' },
  sing: { id: 'sing', name: 'SING', rule: 'i → a → u', hook: 'Say it as a song: sing, sang, sung. The vowel climbs i, a, u.' },
  know: { id: 'know', name: 'KNOW', rule: '-ow → -ew → -own', hook: 'The 3rd form is the 1st form plus n: know → known, grow → grown.' },
  ought: { id: 'ought', name: 'BOUGHT', rule: '2nd = 3rd = -ought / -aught', hook: 'One word fits twice: bought, bought. Think of the ought sound in "thought".' },
  speak: { id: 'speak', name: 'SPEAK', rule: '-oke → -oken', hook: 'The 3rd form is the 2nd form plus n: spoke → spoken, broke → broken.' },
  write: { id: 'write', name: 'WRITE', rule: 'i → o → i + (t)en', hook: 'The 3rd form ends in -en and the vowel goes back to i: write, wrote, written.' },
  kept: { id: 'kept', name: 'KEPT', rule: '2nd = 3rd, a short vowel + t', hook: 'The long sound gets short and a t arrives: keep → kept, sleep → slept.' },
  told: { id: 'told', name: 'TOLD', rule: '2nd = 3rd = -old', hook: 'tell → told, sell → sold: the e turns into o and ends in -ld.' },
  run: { id: 'run', name: 'COME', rule: '1st = 3rd', hook: 'It comes back! The 3rd form is the same as the 1st: come, came, come.' },
  odd: { id: 'odd', name: 'ODD', rule: 'learn each one with its own picture', hook: 'No family. Make a tiny story for each: "We went to Spain. We have gone."' },
};

export const PATTERNS: { id: VerbPattern; label: string; rule: string }[] = [
  { id: 'AAA', label: 'A – A – A', rule: 'all three forms are the same' },
  { id: 'ABB', label: 'A – B – B', rule: 'the 2nd and 3rd forms are the same' },
  { id: 'ABC', label: 'A – B – C', rule: 'all three forms are different' },
  { id: 'ABA', label: 'A – B – A', rule: 'the 3rd form comes back to the 1st' },
  { id: 'REG', label: '+ed regular', rule: 'add -ed (or -d, -ied, double the letter)' },
];

/** The words of a family, in order. */
export const familyVerbs = (id: FamilyId) => IRREGULAR_VERBS.filter((x) => x.family === id);

/** Past-simple / present-perfect sentences for the last stop. `answer` is the form shown in the gap. */
export interface SentenceRound {
  base: string;
  /** Contains "___" for the gap. */
  text: string;
  form: 'past' | 'pp';
  /** The words that give it away; shown in the colour of the form when the round is answered. */
  clue: string;
  /** One line of why. */
  why: string;
}

export const SENTENCES: SentenceRound[] = [
  { base: 'go', text: 'Last summer we ___ to Spain.', form: 'past', clue: 'Last summer', why: 'A finished time (last summer) → 2nd form.' },
  { base: 'eat', text: 'She has already ___ the pizza.', form: 'pp', clue: 'has already', why: 'has + already → 3rd form.' },
  { base: 'give', text: 'He ___ me a gift yesterday.', form: 'past', clue: 'yesterday', why: 'A finished time (yesterday) → 2nd form.' },
  { base: 'ride', text: 'I have never ___ a horse.', form: 'pp', clue: 'have never', why: 'have + never → 3rd form.' },
  { base: 'break', text: 'They ___ the window last night.', form: 'past', clue: 'last night', why: 'A finished time (last night) → 2nd form.' },
  { base: 'see', text: 'Have you ___ my message?', form: 'pp', clue: 'Have you', why: 'Have you … ? → 3rd form.' },
  { base: 'sing', text: 'She ___ a beautiful song at the party.', form: 'past', clue: 'at the party', why: 'One finished moment at a party → 2nd form.' },
  { base: 'break', text: 'Look! The glass has ___!', form: 'pp', clue: 'has', why: 'has + 3rd form: the result is visible now.' },
  { base: 'take', text: 'Who ___ my phone this morning?', form: 'past', clue: 'this morning', why: 'A finished morning → 2nd form.' },
  { base: 'write', text: 'She has ___ ten emails today.', form: 'pp', clue: 'has', why: 'has + 3rd form: today is not finished.' },
  { base: 'win', text: 'He ___ the race last Saturday.', form: 'past', clue: 'last Saturday', why: 'A finished time (last Saturday) → 2nd form.' },
  { base: 'begin', text: 'Has the film ___ yet?', form: 'pp', clue: 'Has', why: 'Has … yet? → 3rd form.' },
];

/** Plausible wrong forms: the regular -ed spelling a learner would guess, and the other irregular form. */
export function regularised(base: string): string {
  if (/e$/.test(base)) return `${base}d`;
  if (/[^aeiou]y$/.test(base)) return `${base.slice(0, -1)}ied`;
  return `${base}ed`;
}

/** The three forms of a sentence round's gap: base, past, pp - de-duplicated, with a regular-ed decoy when forms collapse. */
export function sentenceOptions(round: SentenceRound): string[] {
  const x = verbByBase(round.base)!;
  const out = [x.base, x.past, x.pp];
  const uniq = Array.from(new Set(out));
  if (uniq.length < 3) uniq.push(regularised(x.base));
  return uniq.slice(0, 3);
}

export const answerOf = (round: SentenceRound) => {
  const x = verbByBase(round.base)!;
  return round.form === 'past' ? x.past : x.pp;
};

/** Every word the game says aloud (baked as recorded clips by scripts/generate-voice-cache.mjs, voice 'teacher'). */
export function verbForgeLines(): string[] {
  const out = new Set<string>();
  for (const x of ALL_VERBS) { out.add(x.base); out.add(x.past); out.add(x.pp); }
  for (const s of SENTENCES) out.add(s.text.replace('___', answerOf(s)));
  return [...out];
}
