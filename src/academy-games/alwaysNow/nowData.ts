/**
 * Always or Now — present simple vs present continuous.
 *
 * Why it is built this way (docs/research/always-or-now.md):
 *  - The choice is made by CUES, so cue words are trained first (always, every day / now, right now, Look!, Listen!).
 *  - Present simple = a habit or fact (teal). Present continuous = happening now (pink). Same two colours everywhere.
 *  - The spelling slips that cost marks (-s / -es / -ies and -ing doubling / dropping e) are drilled on their own.
 *  - State verbs (know, like, want, love, need ...) are not used with -ing: a short club of sentences to learn by contrast.
 *  - Last, typed recall with spaced review (Leitner), choosing the form from the cue, as in a test.
 * Everything the game says is a pre-baked recorded clip (see hopLines-style baking in scripts/generate-voice-cache.mjs).
 */

export type Tense = 'simple' | 'continuous';

export const TENSE = {
  simple: { label: 'Present simple', short: 'Always', hex: '#2dd4bf', soft: 'rgba(45,212,191,.16)', idea: 'habits, routines, facts' },
  continuous: { label: 'Present continuous', short: 'Now', hex: '#f472b6', soft: 'rgba(244,114,182,.16)', idea: 'happening now, around now' },
} as const;

/* ---------------------------------------------------------------- 1 · cue words */

export interface Cue { text: string; tense: Tense }
export const CUES: Cue[] = [
  { text: 'always', tense: 'simple' }, { text: 'usually', tense: 'simple' }, { text: 'often', tense: 'simple' }, { text: 'sometimes', tense: 'simple' },
  { text: 'never', tense: 'simple' }, { text: 'every day', tense: 'simple' }, { text: 'every week', tense: 'simple' }, { text: 'on Mondays', tense: 'simple' },
  { text: 'now', tense: 'continuous' }, { text: 'right now', tense: 'continuous' }, { text: 'at the moment', tense: 'continuous' },
  { text: 'Look!', tense: 'continuous' }, { text: 'Listen!', tense: 'continuous' }, { text: 'today', tense: 'continuous' },
];
// "today" is kept out of the sort on purpose: it can go with either tense.
export const SORT_CUES = CUES.filter((c) => c.text !== 'today');

/* ---------------------------------------------------------------- 2 · scene check */

export interface GateRound {
  id: string;
  /** One line of scene, shown above the sentence. */
  context: string;
  /** Contains "___". */
  text: string;
  base: string;
  simple: string;
  continuous: string;
  tense: Tense;
  /** The cue words that decide it. */
  cue: string;
}
const g = (id: string, context: string, text: string, base: string, simple: string, continuous: string, tense: Tense, cue: string): GateRound => ({ id, context, text, base, simple, continuous, tense, cue });

export const GATES: GateRound[] = [
  g('g1', 'Saturday is the best day.', 'Every Saturday, my brother ___ football.', 'play', 'plays', 'is playing', 'simple', 'Every Saturday'),
  g('g2', 'Ms Lee loves her job.', 'My teacher ___ English every day.', 'teach', 'teaches', 'is teaching', 'simple', 'every day'),
  g('g3', 'Tom is a good student.', 'He usually ___ his homework before dinner.', 'do', 'does', 'is doing', 'simple', 'usually'),
  g('g4', 'We have a routine.', 'We always ___ breakfast at seven.', 'eat', 'eat', 'are eating', 'simple', 'always'),
  g('g5', 'The shop has a timetable.', 'The shop ___ at nine on Mondays.', 'open', 'opens', 'is opening', 'simple', 'on Mondays'),
  g('g6', 'Anna has two jobs.', 'She often ___ the bus to work.', 'take', 'takes', 'is taking', 'simple', 'often'),
  g('g7', 'Dad is very tidy.', 'Every morning, my dad ___ the dishes.', 'wash', 'washes', 'is washing', 'simple', 'Every morning'),
  g('g8', 'Mum is in the kitchen.', 'Right now she ___ dinner.', 'cook', 'cooks', 'is cooking', 'continuous', 'Right now'),
  g('g9', 'It is quiet in the hall.', 'Listen! Someone ___ at the door.', 'knock', 'knocks', 'is knocking', 'continuous', 'Listen!'),
  g('g10', 'Look at the sky.', 'Look! It ___.', 'rain', 'rains', 'is raining', 'continuous', 'Look!'),
  g('g11', 'Dan is in the garden.', 'He ___ football at the moment.', 'play', 'plays', 'is playing', 'continuous', 'at the moment'),
  g('g12', 'The students are in class.', 'They ___ a test now.', 'take', 'take', 'are taking', 'continuous', 'now'),
  g('g13', 'My sister is in her room.', 'She ___ to music right now.', 'listen', 'listens', 'is listening', 'continuous', 'right now'),
  g('g14', 'The kids are in the pool.', 'They ___ at the moment.', 'swim', 'swim', 'are swimming', 'continuous', 'at the moment'),
];
/** Funny Reporter: silly scenes, same job (read the cue, choose the tense). */
export const FUNNY: GateRound[] = [
  g('f1', 'Breaking news from the zoo!', 'Look! A penguin ___ a bike.', 'ride', 'rides', 'is riding', 'continuous', 'Look!'),
  g('f2', 'A very strange farm.', 'Every night, the cow ___ the piano.', 'play', 'plays', 'is playing', 'simple', 'Every night'),
  g('f3', 'Live from the moon!', 'Right now an astronaut ___ pizza.', 'eat', 'eats', 'is eating', 'continuous', 'Right now'),
  g('f4', 'My cat is famous.', 'My cat always ___ my homework.', 'eat', 'eats', 'is eating', 'simple', 'always'),
  g('f5', 'The bakery next door is wild.', 'Listen! The bread ___ a song.', 'sing', 'sings', 'is singing', 'continuous', 'Listen!'),
  g('f6', 'Our dog has a secret life.', 'On Sundays, our dog ___ a suit and tie.', 'wear', 'wears', 'is wearing', 'simple', 'On Sundays'),
  g('f7', 'Look out of the window.', 'A dragon ___ in the garden at the moment.', 'dance', 'dances', 'is dancing', 'continuous', 'at the moment'),
  g('f8', 'The robot teacher is odd.', 'Our robot usually ___ the lesson in a funny voice.', 'give', 'gives', 'is giving', 'simple', 'usually'),
  g('f9', 'Dinner time at the castle.', 'Now the king ___ spaghetti with his crown.', 'wear', 'wears', 'is wearing', 'continuous', 'Now'),
  g('f10', 'My brother is a champion.', 'Every week, my brother ___ a banana race.', 'win', 'wins', 'is winning', 'simple', 'Every week'),
];

/** Monster Contrast: the habit and the "right now" side by side. `context` is the other half of the contrast (shown, not spoken). */
export const MONSTERS: GateRound[] = [
  g('m1', 'Zog usually eats rocks.', 'But today he ___ a sock.', 'eat', 'eats', 'is eating', 'continuous', 'today'),
  g('m2', 'Right now Mimi is painting her face green.', 'But every day she ___ it blue.', 'paint', 'paints', 'is painting', 'simple', 'every day'),
  g('m3', 'Blob always sleeps in the bath.', 'But right now he ___ in the fridge.', 'sleep', 'sleeps', 'is sleeping', 'continuous', 'right now'),
  g('m4', 'At the moment Pip is dancing on the roof.', 'But usually she ___ in the garden.', 'dance', 'dances', 'is dancing', 'simple', 'usually'),
  g('m5', 'Grub often drinks soup with a straw.', 'But at the moment he ___ it with a spoon.', 'drink', 'drinks', 'is drinking', 'continuous', 'at the moment'),
  g('m6', 'Look! Fizz is jumping over the car.', 'But on Mondays she ___ under it.', 'jump', 'jumps', 'is jumping', 'simple', 'on Mondays'),
  g('m7', 'Rex never wears socks.', 'But now he ___ four hats.', 'wear', 'wears', 'is wearing', 'continuous', 'now'),
  g('m8', 'Listen! Moxie is singing in the kitchen.', 'But every night she ___ in the shower.', 'sing', 'sings', 'is singing', 'simple', 'every night'),
];

export const gateAnswer = (r: GateRound) => (r.tense === 'simple' ? r.simple : r.continuous);
export const gateSentence = (r: GateRound) => r.text.replace('___', gateAnswer(r));

/* ---------------------------------------------------------------- 3 · spelling */

export interface SpellRound { id: string; base: string; kind: 's' | 'ing'; correct: string; frame: string; rule: string }
const sp = (id: string, base: string, kind: 's' | 'ing', correct: string, frame: string, rule: string): SpellRound => ({ id, base, kind, correct, frame, rule });

export const SPELLS: SpellRound[] = [
  sp('s1', 'watch', 's', 'watches', 'She ___ TV every evening.', 'After ch, sh, s, x, z, o: add -es.'),
  sp('s2', 'study', 's', 'studies', 'He ___ English at night.', 'Consonant + y: change y to i, add -es.'),
  sp('s3', 'go', 's', 'goes', 'My dad ___ to work by car.', 'After ch, sh, s, x, z, o: add -es.'),
  sp('s4', 'fix', 's', 'fixes', 'The mechanic ___ cars.', 'After ch, sh, s, x, z, o: add -es.'),
  sp('s5', 'play', 's', 'plays', 'My sister ___ the guitar.', 'Vowel + y: just add -s.'),
  sp('s6', 'carry', 's', 'carries', 'She ___ a heavy bag to school.', 'Consonant + y: change y to i, add -es.'),
  sp('i1', 'run', 'ing', 'running', 'Look! The boy is ___.', 'Short word, consonant–vowel–consonant: double the last letter.'),
  sp('i2', 'make', 'ing', 'making', 'Mum is ___ a cake.', 'Ends in -e: drop the e, add -ing.'),
  sp('i3', 'swim', 'ing', 'swimming', 'They are ___ in the sea.', 'Short word, consonant–vowel–consonant: double the last letter.'),
  sp('i4', 'write', 'ing', 'writing', 'He is ___ an email.', 'Ends in -e: drop the e, add -ing.'),
  sp('i5', 'sit', 'ing', 'sitting', 'The cat is ___ on the sofa.', 'Short word, consonant–vowel–consonant: double the last letter.'),
  sp('i6', 'play', 'ing', 'playing', 'We are ___ in the park.', 'Most verbs: just add -ing.'),
];

/** The correct spelling and two plausible wrong ones. */
export function spellOptions(r: SpellRound): string[] {
  const b = r.base;
  const last = b[b.length - 1];
  const pool = r.kind === 's'
    ? [`${b}s`, `${b}es`, /y$/.test(b) ? `${b.slice(0, -1)}ies` : `${b}ies`]
    : [`${b}ing`, `${b}${last}ing`, /e$/.test(b) ? `${b.slice(0, -1)}ing` : `${b}eing`];
  const wrong = [...new Set(pool)].filter((w) => w !== r.correct);
  return [r.correct, wrong[0], wrong[1]].filter(Boolean) as string[];
}
export const spellSentence = (r: SpellRound) => r.frame.replace('___', r.correct);

/* ---------------------------------------------------------------- 4 · state verbs */

export interface StativeRound { id: string; right: string; wrong: string; verb: string }
export const STATIVES: StativeRound[] = [
  { id: 'v1', verb: 'know', right: 'I know the answer.', wrong: 'I am knowing the answer.' },
  { id: 'v2', verb: 'like', right: 'She likes pizza.', wrong: 'She is liking pizza.' },
  { id: 'v3', verb: 'want', right: 'We want some water.', wrong: 'We are wanting some water.' },
  { id: 'v4', verb: 'love', right: 'He loves his dog.', wrong: 'He is loving his dog.' },
  { id: 'v5', verb: 'need', right: 'They need help.', wrong: 'They are needing help.' },
  { id: 'v6', verb: 'understand', right: 'I understand the question.', wrong: 'I am understanding the question.' },
  { id: 'v7', verb: 'hate', right: 'My sister hates spiders.', wrong: 'My sister is hating spiders.' },
  { id: 'v8', verb: 'have', right: 'He has a new bike.', wrong: 'He is having a new bike.' },
];

/* ---------------------------------------------------------------- 5 · typed recall */

export interface RecallRound { id: string; text: string; base: string; answer: string; tense: Tense; cue: string }
const rc = (id: string, text: string, base: string, answer: string, tense: Tense, cue: string): RecallRound => ({ id, text, base, answer, tense, cue });

export const RECALLS: RecallRound[] = [
  rc('r1', 'Every day I ___ to school.', 'walk', 'walk', 'simple', 'Every day'),
  rc('r2', 'Look! The dog ___.', 'run', 'is running', 'continuous', 'Look!'),
  rc('r3', 'She ___ TV on Fridays.', 'watch', 'watches', 'simple', 'on Fridays'),
  rc('r4', 'Right now they ___ outside.', 'play', 'are playing', 'continuous', 'Right now'),
  rc('r5', 'He usually ___ at night.', 'study', 'studies', 'simple', 'usually'),
  rc('r6', 'We ___ lunch at the moment.', 'eat', 'are eating', 'continuous', 'at the moment'),
  rc('r7', 'I always ___ in my notebook.', 'write', 'write', 'simple', 'always'),
  rc('r8', 'Listen! Someone ___.', 'sing', 'is singing', 'continuous', 'Listen!'),
  rc('r9', 'My mum ___ to work every day.', 'drive', 'drives', 'simple', 'every day'),
  rc('r10', 'They ___ in the sea now.', 'swim', 'are swimming', 'continuous', 'now'),
];
export const recallSentence = (r: RecallRound) => r.text.replace('___', r.answer);

/* ---------------------------------------------------------------- Silly Judge */

export interface JudgeRound { id: string; text: string; ok: boolean; /** the corrected sentence (= text when ok) */ fixed: string; wrongForm: string; rightForm: string; tense: Tense; cue: string }
const jd = (id: string, text: string, ok: boolean, fixed: string, wrongForm: string, rightForm: string, tense: Tense, cue: string): JudgeRound => ({ id, text, ok, fixed, wrongForm, rightForm, tense, cue });

export const JUDGES: JudgeRound[] = [
  jd('j1', 'Look! The cat sleeps on the roof.', false, 'Look! The cat is sleeping on the roof.', 'sleeps', 'is sleeping', 'continuous', 'Look!'),
  jd('j2', 'Every day, the fish swims to school.', true, 'Every day, the fish swims to school.', 'swims', 'swims', 'simple', 'Every day'),
  jd('j3', 'Right now my teacher dances on the table.', false, 'Right now my teacher is dancing on the table.', 'dances', 'is dancing', 'continuous', 'Right now'),
  jd('j4', 'My robot always makes pancakes at night.', true, 'My robot always makes pancakes at night.', 'makes', 'makes', 'simple', 'always'),
  jd('j5', 'Listen! The tree is singing a song.', true, 'Listen! The tree is singing a song.', 'is singing', 'is singing', 'continuous', 'Listen!'),
  jd('j6', 'Every Monday, the dragon is taking a bath.', false, 'Every Monday, the dragon takes a bath.', 'is taking', 'takes', 'simple', 'Every Monday'),
  jd('j7', 'At the moment, a banana drives my car.', false, 'At the moment, a banana is driving my car.', 'drives', 'is driving', 'continuous', 'At the moment'),
  jd('j8', 'The monkeys usually eat their breakfast with spoons.', true, 'The monkeys usually eat their breakfast with spoons.', 'eat', 'eat', 'simple', 'usually'),
];

/** Every line the game says aloud (baked as recorded clips, voice 'teacher'). */
export function nowLines(): string[] {
  const out = new Set<string>();
  for (const c of SORT_CUES) out.add(c.text);
  for (const r of [...GATES, ...FUNNY, ...MONSTERS]) out.add(gateSentence(r));
  for (const r of JUDGES) out.add(r.fixed);
  for (const r of SPELLS) out.add(spellSentence(r));
  for (const r of STATIVES) out.add(r.right);
  for (const r of RECALLS) out.add(recallSentence(r));
  return [...out];
}
