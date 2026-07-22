// Per-CEFR vocabulary budgets + band lexicon.
// Used by the planner (sizing target_vocab) and QA (vocabBandLevel validator)
// so a Pre-A1 lesson can never receive A2 words and an A2 lesson is not
// flooded with Pre-A1 baby words.

import type { Cefr, Hub } from '../types';

export interface VocabBudget {
  /** Minimum NEW target words per lesson at this level. */
  perLessonMin: number;
  /** Hard maximum NEW target words per lesson at this level. */
  perLessonMax: number;
  /** Hard maximum NEW target words per 7-lesson unit. */
  perUnitMax: number;
  /** Max syllables allowed in a target word (echoes CEFR_CAPS). */
  maxSyllables: number;
}

export const CEFR_VOCAB_BUDGETS: Record<Cefr, VocabBudget> = {
  'Pre-A1': { perLessonMin: 2, perLessonMax: 3,  perUnitMax: 12, maxSyllables: 2 },
  A1:       { perLessonMin: 4, perLessonMax: 6,  perUnitMax: 20, maxSyllables: 3 },
  A2:       { perLessonMin: 6, perLessonMax: 8,  perUnitMax: 30, maxSyllables: 4 },
  B1:       { perLessonMin: 8, perLessonMax: 10, perUnitMax: 40, maxSyllables: 5 },
  B2:       { perLessonMin: 10, perLessonMax: 12, perUnitMax: 50, maxSyllables: 6 },
  C1:       { perLessonMin: 12, perLessonMax: 15, perUnitMax: 60, maxSyllables: 8 },
};

/**
 * Effective budget — Playground stays at the lower bound of the band even
 * at higher CEFRs (kids need tighter recycling).
 */
export function getVocabBudget(cefr: Cefr, hub: Hub): VocabBudget {
  const base = CEFR_VOCAB_BUDGETS[cefr];
  if (hub === 'playground') {
    return {
      ...base,
      perLessonMax: Math.min(base.perLessonMax, base.perLessonMin + 1),
      perUnitMax: Math.round(base.perUnitMax * 0.7),
    };
  }
  return base;
}

// ---------------------------------------------------------------------------
// Seed CEFR band lexicon.
//
// Drawn from Cambridge English Vocabulary Profile public bands + the
// curriculum-standards/cambridgeYLE.ts seed. Every word appears in EXACTLY
// ONE band — the lowest CEFR where it is canonically introduced.
//
// This list is intentionally seed-sized: classifyWord() returns 'unknown' for
// anything not listed, and unknown words are ALLOWED by validators (they
// can't be classified, so we don't punish them). The list only needs to grow
// enough to catch obvious cross-level drift.
// ---------------------------------------------------------------------------

const PRE_A1_WORDS = [
  // colors
  'red','blue','green','yellow','black','white','orange','pink','brown',
  // numbers
  'one','two','three','four','five','six','seven','eight','nine','ten',
  // family
  'mum','mummy','dad','daddy','baby','boy','girl',
  // animals (Animal Adventure Academy seed)
  'cat','dog','cow','pig','duck','fish','car','monkey','snake','tiger',
  'octopus','crab','bird','bear','rabbit','frog',
  // food
  'apple','banana','cake','milk','water','egg','bread',
  // body
  'eye','nose','ear','mouth','hand','foot','hair','leg','arm',
  // basic verbs (very high-frequency, concrete)
  'go','run','sit','stand','jump','look','see','play','eat','drink','sleep',
  // pronouns / function (allowed at any level but anchored here)
  'i','you','he','she','it','we','they','my','your',
  // determiners
  'a','an','the','this','that',
  // greetings
  'hi','hello','bye','goodbye','yes','no','please',
  // descriptors (most basic)
  'big','small','hot','cold',
  // school basics
  'book','pen','bag','chair','table',
];

const A1_WORDS = [
  // family extended
  'mother','father','sister','brother','friend','family','grandma','grandpa',
  // home / rooms
  'house','home','room','kitchen','bedroom','bathroom','garden','door','window',
  // food extended
  'rice','pasta','cheese','meat','chicken','juice','tea','coffee','sugar','salt',
  'breakfast','lunch','dinner','sandwich',
  // clothes
  'shirt','trousers','dress','shoe','hat','coat','sock',
  // time
  'today','tomorrow','yesterday','morning','afternoon','evening','night',
  'monday','tuesday','wednesday','thursday','friday','saturday','sunday',
  // weather
  'sunny','rainy','cloudy','windy','snow','rain',
  // verbs
  'like','have','want','need','make','do','read','write','speak','listen',
  'walk','swim','dance','sing','cook','watch','help','open','close','buy',
  // school
  'school','teacher','student','class','lesson','homework','pencil','desk',
  // descriptors
  'happy','sad','tired','hungry','thirsty','new','old','good','bad','nice',
  // numbers / quantity
  'eleven','twelve','many','some','any',
];

const A2_WORDS = [
  // travel / places
  'station','airport','hotel','restaurant','museum','market','park','beach','mountain',
  'bus','train','plane','ticket','map','trip','holiday','tourist',
  // jobs
  'doctor','nurse','engineer','driver','farmer','waiter','manager','worker','job','office',
  // shopping / money
  'shop','price','cheap','expensive','money','pay','sell','cost',
  // health / body extended
  'headache','medicine','hospital','sick','healthy','exercise',
  // feelings
  'angry','bored','excited','nervous','surprised','worried','interested',
  // hobbies
  'hobby','sport','music','movie','game','painting','dancing','reading',
  // verbs
  'travel','arrive','leave','stay','wait','start','finish','remember','forget','explain',
  'choose','prepare','enjoy','share','invite','meet','visit','order',
  // descriptors
  'famous','popular','difficult','easy','important','interesting','boring','quiet','noisy',
  // connectors / function
  'because','but','also','before','after','while',
];

const B1_WORDS = [
  'environment','community','culture','tradition','technology','internet','website','article',
  'opinion','reason','example','advice','suggestion','problem','solution','decision','plan',
  'experience','adventure','challenge','goal','achievement','project','responsibility',
  'colleague','manager','customer','client','meeting','schedule','deadline','budget',
  'volunteer','organization','charity','government','election',
  'develop','improve','consider','suggest','recommend','manage','organize','prepare',
  'discuss','describe','explain','complain','recover','recognize','realize','depend','include',
  'although','however','therefore','despite','meanwhile','instead','besides',
];

const B2_WORDS = [
  'sustainable','controversial','significant','sufficient','virtually','particularly',
  'consequence','approach','perspective','assumption','implication','contradiction',
  'evidence','argument','hypothesis','principle','strategy','priority','impact','outcome',
  'innovation','infrastructure','globalization','diversity','inequality','privacy','security',
  'negotiate','collaborate','evaluate','demonstrate','establish','maintain','acquire',
  'overcome','enhance','reduce','expand','illustrate','justify',
  'nevertheless','furthermore','moreover','consequently','accordingly','whereas',
];

const C1_WORDS = [
  'paradigm','rhetoric','nuance','contingency','feasibility','viability','idiosyncrasy',
  'precedent','jurisdiction','deliberation','ambiguity','equilibrium','disparity','autonomy',
  'discrepancy','prerequisite','cohesion','ramification','plausibility','catalyst',
  'epitomize','undermine','culminate','perpetuate','reconcile','exacerbate','synthesize',
  'mitigate','substantiate','articulate','presuppose','underscore',
  'notwithstanding','albeit','insofar','heretofore','vis-à-vis',
];

function toMap(): Map<string, Cefr> {
  const m = new Map<string, Cefr>();
  for (const w of PRE_A1_WORDS) m.set(w.toLowerCase(), 'Pre-A1');
  for (const w of A1_WORDS)    if (!m.has(w.toLowerCase())) m.set(w.toLowerCase(), 'A1');
  for (const w of A2_WORDS)    if (!m.has(w.toLowerCase())) m.set(w.toLowerCase(), 'A2');
  for (const w of B1_WORDS)    if (!m.has(w.toLowerCase())) m.set(w.toLowerCase(), 'B1');
  for (const w of B2_WORDS)    if (!m.has(w.toLowerCase())) m.set(w.toLowerCase(), 'B2');
  for (const w of C1_WORDS)    if (!m.has(w.toLowerCase())) m.set(w.toLowerCase(), 'C1');
  return m;
}

export const CEFR_BAND_LEXICON: ReadonlyMap<string, Cefr> = toMap();

const CEFR_ORDER: Cefr[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];

export function cefrRank(c: Cefr): number {
  return CEFR_ORDER.indexOf(c);
}

/** Returns the canonical CEFR for `word`, or 'unknown' if not in the seed list. */
export function classifyWord(word: string): Cefr | 'unknown' {
  if (!word) return 'unknown';
  const key = word.trim().toLowerCase().replace(/[^\p{L}\p{M}'-]/gu, '');
  if (!key) return 'unknown';
  return CEFR_BAND_LEXICON.get(key) ?? 'unknown';
}

/** True if the word is at or below the target CEFR (unknown words pass). */
export function isWordAtOrBelow(word: string, target: Cefr): boolean {
  const c = classifyWord(word);
  if (c === 'unknown') return true;
  return cefrRank(c) <= cefrRank(target);
}

/** How many bands below the target the word sits. Unknown → 0. */
export function bandsBelow(word: string, target: Cefr): number {
  const c = classifyWord(word);
  if (c === 'unknown') return 0;
  return Math.max(0, cefrRank(target) - cefrRank(c));
}
