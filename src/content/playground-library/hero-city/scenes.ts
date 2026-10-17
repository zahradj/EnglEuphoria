/* =============================================================================
 * Hero City — A1 Unit 7 (plan: docs/a1-unit-7-hero-city.md, owner-approved 2026-10-17: "go")
 *
 * Reuses Welcome Town's Scene type, CharKey/CAST/VOICE_KEY and SceneRenderer — Hero City is a new WORLD, not a new engine.
 * Unit objective: say what I can do well ("I can run fast."), ask a friend and find the right helper ("Can you lift it?
 * No, I can't, but Leo can!"), say a hero rule ("You mustn't run on the road."), and help a citizen ("What's the
 * matter?" "I've got a cold." "Can I help you?"); read "Captain Spark Saves the Day" (one story, a few pages a lesson).
 * Every lesson: sound → a phonics game (different each lesson) → Blend & Read → tongue twister; no game twice in the unit.
 * Phonics: ai (L1), ay (L2), a_e magic e (L3), long-a sort (L4) — all with the recorded ai sound, no new recording.
 * Research (mechanics only, sources in docs/research/playground-a1u7-research.md): Twinkl can/can't A1 ("assigning
 * superhero powers"), MES English Super Hero Project, British Council "School rules", Community Helpers Play & Learn,
 * Khan Academy Kids community-helper books, SplashLearn vowel-team games.
 * Art: Gemini art bot (scripts/art-targets.json) in the Playground brand shades only (yellow and orange, owner
 * 2026-10-17). Captain Spark is a girl hero; Zippy is her small robot helper ("it"). Heroes help, they never fight.
 * Everyone is fully covered (long-sleeved hero suits, capes); Leo and Pip are boys, never in a dress or skirt.
 * ========================================================================= */

import { CAST, VOICE_KEY, type CharKey, type ReaderPage, type Scene } from '../welcome-town/scenes';
import { SEA } from '../ocean/scenes';

export type { CharKey, Scene };
export { CAST, VOICE_KEY };

const S = '/lep1/scenes';
const item = (n: string) => `/lep1/items/item-${n}.png`;
const bgSquare = `${S}/bg-a1u7-square-wide.png`;
const bgRoad = `${S}/bg-a1u7-road-wide.png`;
const bgTower = `${S}/bg-a1u7-tower-wide.png`;
const bgTrials = `${S}/bg-a1u7-trials-wide.png`;
const bgHQ = `${S}/bg-a1u7-hq-wide.png`;
const WT = '/welcome-town';
const SONG_HELLO = `${WT}/audio/hello-song.mp3?v=1`;
const SONG_GOODBYE = `${WT}/audio/goodbye-song.mp3?v=3`;

/** Captain Spark Saves the Day — story pictures; pages 4-12 come with Lessons 2-5. */
export const sparkPage = (n: number) => `${S}/bg-a1u7-story-${n}-wide.png`;

/** The cast of Hero City (cut-out stickers). */
export const HERO = {
  spark: item('spark-wave'), sparkFly: item('spark-fly'), sparkCold: item('spark-cold'), sparkCheer: item('spark-cheer'),
  sparkPoint: item('spark-point'), zippy: item('zippy'), zippyStop: item('zippy-stop'),
  leoFast: item('leo-fast'), miaClimb: item('mia-climb'), pipHigh: item('pip-high'), biscuitSwim: item('biscuit-swim'),
  leoLift: item('leo-lift'), pipTry: item('pip-try'), leo: item('leo-hero'), mia: item('mia-hero'), pip: item('pip-hero'),
  bigBox: item('big-box'), kitten: item('kitten'), ladder: item('ladder'), cape: item('hero-cape'), badge: item('hero-badge'),
};
const BISCUIT = item('dog');

/** The unit's reading strand (plan §4). */
export const SPARK_STORY: ReaderPage[] = [
  { img: sparkPage(1), lines: [{ text: 'This is Hero City. It is a sunny day.' }], check: { who: 'pip', question: 'What is the weather like?', answer: 'Sunny', options: [{ label: 'Rainy' }, { label: 'Sunny' }, { label: 'Snowy' }] } },
  { img: sparkPage(2), lines: [{ text: 'This is Captain Spark. She can fly fast!' }], check: { who: 'mia', question: 'What can Captain Spark do?', answer: 'Fly fast', options: [{ label: 'Fly fast', img: HERO.sparkFly }, { label: 'Swim well', img: HERO.biscuitSwim }, { label: 'Climb well', img: HERO.miaClimb }] } },
  { img: sparkPage(3), lines: [{ text: 'Leo can run fast. Mia can climb well.' }], check: { who: 'pip', question: 'Who can climb well?', answer: 'Mia', options: [{ label: 'Leo', img: HERO.leoFast }, { label: 'Mia', img: HERO.miaClimb }, { label: 'Pip', img: HERO.pipHigh }] } },
  { img: sparkPage(4), lines: [{ text: 'Can Pip lift the box? No, he can’t. But Leo can!' }], check: { who: 'mia', question: 'Who can lift the box?', answer: 'Leo', options: [{ label: 'Pip', img: HERO.pipTry }, { label: 'Leo', img: HERO.leoLift }] } },
  { img: sparkPage(5), lines: [{ text: 'Biscuit can swim well. He can save the boat.' }], check: { who: 'leo', question: 'What can Biscuit do?', answer: 'Swim well', options: [{ label: 'Fly fast' }, { label: 'Swim well' }, { label: 'Climb well' }] } },
  { img: sparkPage(6), lines: [{ text: 'Stop! You must wait. You mustn’t run on the road.' }], check: { who: 'pip', question: 'What must the friends do?', answer: 'Wait', options: [{ label: 'Run' }, { label: 'Wait' }, { label: 'Jump' }] } },
  { img: sparkPage(7), lines: [{ text: 'The friends wait. They are kind and safe.' }], check: { who: 'mia', question: 'Are the friends safe?', answer: 'Yes, they are.', options: [{ label: 'Yes, they are.' }, { label: 'No, they aren’t.' }] } },
  { img: sparkPage(8), lines: [{ text: 'What’s the matter? I’ve got a cold.' }], check: { who: 'leo', question: 'What’s the matter with Captain Spark?', answer: 'A cold', options: [{ label: 'A cold', img: HERO.sparkCold }, { label: 'A headache', img: item('cit-headache') }, { label: 'Toothache', img: item('cit-toothache') }] } },
  { img: sparkPage(9), lines: [{ text: 'Can I help you? Yes, please!' }], check: { who: 'pip', question: 'What does Mia give Captain Spark?', answer: 'A tissue', options: [{ label: 'A tissue', img: item('tissues') }, { label: 'A plaster', img: item('plaster') }, { label: 'A box', img: HERO.bigBox }] } },
  { img: sparkPage(10), lines: [{ text: 'The kitten is on the tower! Who can help?' }], check: { who: 'mia', question: 'Where is the kitten?', answer: 'On the tower', options: [{ label: 'On the bridge' }, { label: 'On the tower' }, { label: 'On the road' }] } },
  { img: sparkPage(11), lines: [{ text: 'Mia can climb well. Leo and Pip help.' }], check: { who: 'leo', question: 'Who can climb well?', answer: 'Mia', options: [{ label: 'Mia', img: HERO.miaClimb }, { label: 'Leo', img: HERO.leoLift }, { label: 'Biscuit', img: HERO.biscuitSwim }] } },
  { img: sparkPage(12), lines: [{ text: 'We can all be heroes! Hooray!' }], check: { who: 'pip', question: 'Who can be a hero?', answer: 'We can all be heroes!', options: [{ label: 'Only Captain Spark.' }, { label: 'We can all be heroes!' }] } },
];

const helloSong = (id: string, bg: string): Scene => ({
  id, kind: 'song', bg, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Sing hello to Captain Spark — wave!',
  durationSeconds: 20, bigWord: 'Hello', songUrl: SONG_HELLO, lineDurationsMs: [3640, 4120, 4320, 7982],
  lyrics: [
    { who: 'marigold', text: 'Hello, hello, hello to you!' },
    { who: 'pip', text: 'Hi, hi, hi! And hi to you!' },
    { who: 'marigold', text: 'What’s your name? What’s your name?' },
    { who: 'pip', text: 'Say your name! Say your name!' },
  ],
});
const goodbyeSong = (id: string, bg: string): Scene => ({
  id, kind: 'song', bg, title: '\u{1F3B5} Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
  durationSeconds: 20, bigWord: 'Goodbye', songUrl: SONG_GOODBYE, lineDurationsMs: [3600, 4120, 4020, 8322],
  lyrics: [
    { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
    { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
    { who: 'marigold', text: '\u{1F3EB} Welcome Town School is happy today' },
    { who: 'pip', text: '\u{1F496} Byeeee, friends! See you soon!' },
  ],
});

/** Biscuit's shelf: Units 1-6, then one more Hero City treat each lesson. */
const PET_EARLIER = [
  { label: 'star', img: item('star-gold') }, { label: 'apple', img: item('apple') }, { label: 'cake', img: item('cake') },
  { label: 'ball', img: item('ball-red') }, { label: 'hat', img: item('hat') }, { label: 'present', img: item('gift') },
  { label: 'medal', img: item('hero-medal') }, { label: 'banana', img: item('banana') }, { label: 'rainbow medal', img: item('medal-rainbow') },
  { label: 'rocket', img: item('rocket') }, { label: 'moon', img: item('moon') }, { label: 'kite', img: item('kite') },
  { label: 'scarf', img: item('scarf') }, { label: 'robot', img: item('beep') }, { label: 'sunglasses', img: item('sunglasses') },
  { label: 'gold star', img: item('star-gold') },
  { label: 'sandwich', img: item('sandwich') }, { label: 'cookie', img: item('cookie') }, { label: 'cheese', img: item('cheese') },
  { label: 'pizza', img: item('pizza-slice') }, { label: 'soup', img: item('soup') }, { label: 'cake', img: item('cake') },
  { label: 'balloon', img: item('balloon-red') }, { label: 'glasses', img: item('glasses') }, { label: 'boots', img: item('boots') },
  { label: 'shell', img: SEA.shell }, { label: 'boat', img: '/magic-castle/stickers/boat.png' }, { label: 'dish', img: item('dish') }, { label: 'coat', img: item('coat-blue') },
];
const PET_HERO: { label: string; img: string }[] = [{ label: 'cape', img: HERO.cape }, { label: 'badge', img: HERO.badge }, { label: 'toolbox', img: item('toolbox') }, { label: 'plaster', img: item('plaster') }];
const petPal = (id: string, n: number, line: string, choices: { label: string; img: string }[], answer: number, say: string): Scene => ({
  id, kind: 'pet-pal', bg: bgSquare, who: 'leo', title: 'Pet Pal: Biscuit in Hero City',
  teacher: 'Routine (1 minute): Biscuit the puppy says what he wants. The student listens, taps it and says it. It goes on his shelf and he grows — the shelf keeps everything from earlier lessons.',
  pet: { name: 'Biscuit', img: BISCUIT },
  earlier: [...PET_EARLIER, ...PET_HERO.slice(0, n)],
  rounds: [{ line, choices, answer, say }],
  doneLine: 'Biscuit is so happy! See you next time!',
});

/* =============================================================================
 * A1 Unit 7 Lesson 1: "Superhero Powers: I Can Help!"
 * Objective: I can say what I can do well: "I can run fast. I can swim well."
 * Story frame: the sixth piece of the Golden Compass points to Hero City — a sunny golden city; the friends meet
 *   Captain Spark and train in the Hero Training Park (morning sun, orange flags).
 * Practice ladder: Revise (Remember? Unit 6 sea animals doing things; can / can't in one quick round) → Present (I do:
 *   one power per card, "I can run fast."; the rule: can + action + fast / well) → we do (echo) → Read and Match →
 *   you do (Hero Trials ★: choose, answer, find; Power Wheel; Odd One Out; Draw That: your own hero power) → Reading
 *   (Reader p1-3, Read and Match, Yes or No?) → Phonics ai (Word Splat, Blend & Read, twister) → Free (What can you
 *   do well? + the child asks Captain Spark) → check.
 * ========================================================================= */

export const LESSON_A1U7L1_TITLE = 'Superhero Powers: I Can Help!';
export const LESSON_A1U7L1_OBJECTIVE = 'I can say what I can do well: "I can run fast. I can swim well."';

export const LESSON_A1U7L1_SCENES: Scene[] = [
  { id: 'hc-title', kind: 'title-card', bg: sparkPage(1), level: 'A1', unit: 'Unit 7', lessonLabel: 'Lesson 1', title: 'Superhero Powers!', subtitle: 'I can run fast. I can swim well — and Captain Spark!', cta: '\u{1F9B8} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): Unit 6 — sea animals doing things. Shadow mode: five clearly different outlines.
    id: 'hc-recall-warmup', kind: 'recall-warmup', bg: bgSquare, who: 'pip', mode: 'shadow',
    fromLabel: 'Unit 6 · Ocean Explorers',
    teacher: 'Guided: Pip says what a sea animal is doing — the student finds its shadow and says the sentence again.',
    items: [
      { word: 'crab', say: 'The crab is walking.', img: item('crab-walking') },
      { word: 'turtle', say: 'The turtle is eating.', img: item('turtle-eating') },
      { word: 'starfish', say: 'The starfish is sleeping.', img: item('starfish-sleeping') },
      { word: 'octopus', say: 'Bub is hiding.', img: item('bub-hiding') },
      { word: 'whale', say: 'The whale is diving.', img: item('whale-diving') },
    ],
  },
  { id: 'hc-meet-city', kind: 'meet', focus: ['Hero City'], bg: sparkPage(1), who: 'pip', cardSide: 'right', teacher: 'Present: the compass points to Hero City! Point to the train and the tower. Say: Look — Hero City!', line: 'Look! The compass points to Hero City!', repeat: 'This is Hero City.' },
  { id: 'hc-meet-spark', kind: 'meet', focus: ['fly fast'], bg: sparkPage(2), who: 'spark', cardSide: 'left', teacher: 'Present: this is Captain Spark. She is a hero — she helps people. She can fly fast! Fly your hand across the screen.', line: 'Hi! I’m Captain Spark. I can fly fast!', repeat: 'She can fly fast!' },
  {
    id: 'hc-can-quick', kind: 'prea1', teacher: 'Revise (fast): the student already knows can / can’t (Unit 2). One quick round — say it and do it.',
    scene: {
      id: 'hc-can-quick', kind: 'listen-repeat-cards', bg: bgTrials, teacher: 'Listen and say it! Do the action!',
      cards: [
        { who: 'pip', sentence: 'I can run.', img: HERO.leoFast, imgLabel: 'run' },
        { who: 'pip', sentence: 'I can jump.', img: HERO.pipHigh, imgLabel: 'jump' },
        { who: 'mia', sentence: 'I can climb.', img: HERO.miaClimb, imgLabel: 'climb' },
        { who: 'mia', sentence: 'I can’t fly.', img: HERO.mia, imgLabel: 'can’t fly' },
      ],
    },
  },
  { id: 'hc-rule', kind: 'meet', focus: ['fast', 'well'], bg: bgTrials, who: 'spark', cardSide: 'left', teacher: 'The rule (say it, the student repeats): I can + action + fast / well. FAST is about speed (run fast, fly fast). WELL means you are good at it (swim well, climb well). Fast and well come at the END.', line: 'I can run fast. I can swim well. Fast and well come at the end!', repeat: 'I can … fast. I can … well.' },
  {
    id: 'hc-powers', kind: 'prea1', teacher: 'Present (I do → you do): one power per card. Say it, the student says it and does the action: I can run fast!',
    scene: {
      id: 'hc-powers', kind: 'listen-repeat-cards', bg: bgTrials, teacher: 'Listen and say it! Show the power!',
      cards: [
        { who: 'leo', sentence: 'I can run fast.', img: HERO.leoFast, imgLabel: 'run fast' },
        { who: 'mia', sentence: 'I can climb well.', img: HERO.miaClimb, imgLabel: 'climb well' },
        { who: 'pip', sentence: 'I can jump high.', img: HERO.pipHigh, imgLabel: 'jump high' },
        { who: 'leo', sentence: 'I can swim well.', img: HERO.biscuitSwim, imgLabel: 'swim well' },
        { who: 'leo', sentence: 'I am strong. I can lift it!', img: HERO.leoLift, imgLabel: 'lift' },
      ],
    },
  },
  { id: 'hc-meet-help', kind: 'meet', focus: ['help'], bg: bgSquare, who: 'spark', cardSide: 'left', teacher: 'Present (we do): heroes HELP. Say it together and put your hand on your heart: I can help!', line: 'Heroes help people. I can help!', repeat: 'I can help!' },
  { id: 'hc-echo', kind: 'echo', bg: bgTrials, who: 'leo', textSide: 'top', teacher: 'Guided (we do): say it like Leo — a whisper, then FAST like a hero!', word: 'I can run fast!' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'hc-match', kind: 'picture-match', look: 'chalk', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its hero (or taps the sentence, then the picture), then reads it aloud.',
    items: [
      { word: 'I can run fast.', img: HERO.leoFast },
      { word: 'I can climb well.', img: HERO.miaClimb },
      { word: 'I can jump high.', img: HERO.pipHigh },
      { word: 'I can swim well.', img: HERO.biscuitSwim },
      { word: 'I can fly fast.', img: HERO.sparkFly },
      { word: 'I can lift it.', img: HERO.leoLift },
    ],
    bg: bgTrials,
  },
  {
    id: 'hc-trials', kind: 'prea1', teacher: 'You do (signature game): the Hero Trials! Three trials — choose the hero, answer about you, find the power. Win the badges for the hero medal.',
    scene: {
      id: 'hc-trials', kind: 'hero-trials', bg: bgTrials, who: 'mia',
      teacher: 'Win the three hero badges: choose, answer, find!',
      hero: { img: HERO.spark, name: 'Captain Spark' }, medal: '\u{1F3C5}',
      skills: [{ key: 'who', label: 'Who can?', icon: '\u{1F9B8}' }, { key: 'me', label: 'Me!', icon: '\u{1F4AC}' }, { key: 'find', label: 'Find it', icon: '\u{1F50D}' }],
      items: [
        { skill: 'who', ask: 'Who can run fast?', reply: 'Leo can run fast!', options: [{ label: 'Leo', img: HERO.leoFast }, { label: 'Mia', img: HERO.miaClimb }, { label: 'Biscuit', img: HERO.biscuitSwim }], answer: 0 },
        { skill: 'who', ask: 'Who can swim well?', reply: 'Biscuit can swim well!', options: [{ label: 'Pip', img: HERO.pipHigh }, { label: 'Biscuit', img: HERO.biscuitSwim }, { label: 'Leo', img: HERO.leoLift }], answer: 1 },
        { skill: 'me', ask: 'Can you run fast?', reply: 'Yes, I can! I can run fast!', options: [{ label: 'a', text: 'I can fast run.' }, { label: 'b', text: 'Yes, I can run fast!' }, { label: 'c', text: 'I am run fast.' }], answer: 1 },
        { skill: 'me', ask: 'What can you do well?', reply: 'I can swim well!', options: [{ label: 'a', text: 'I can swim well.' }, { label: 'b', text: 'I well swim.' }, { label: 'c', text: 'I can well.' }], answer: 0 },
        { skill: 'find', ask: 'Find: jump high!', reply: 'Pip can jump high!', options: [{ label: 'climb', img: HERO.miaClimb }, { label: 'lift', img: HERO.leoLift }, { label: 'jump high', img: HERO.pipHigh }], answer: 2 },
        { skill: 'find', ask: 'Find: fly fast!', reply: 'Captain Spark can fly fast!', options: [{ label: 'fly fast', img: HERO.sparkFly }, { label: 'run fast', img: HERO.leoFast }, { label: 'swim well', img: HERO.biscuitSwim }], answer: 0 },
      ],
      doneLine: 'Three badges! You are a real hero!',
    },
  },
  helloSong('hc-hello-song', bgSquare),
  {
    id: 'hc-power-wheel', kind: 'spin-wheel', bg: bgTrials, title: 'Power Wheel!',
    teacher: 'You do (speaking): spin the Power Wheel — say the power with fast / well as YOUR sentence: I can run fast! If you can’t, say: I can’t … . If you prefer, do the activity without the spinner.',
    items: [
      { label: 'I can run fast.', left: '18%', top: '30%', img: HERO.leoFast },
      { label: 'I can swim well.', left: '18%', top: '70%', img: HERO.biscuitSwim },
      { label: 'I can climb well.', left: '82%', top: '30%', img: HERO.miaClimb },
      { label: 'I can jump high.', left: '82%', top: '70%', img: HERO.pipHigh },
      { label: 'I can help.', left: '50%', top: '84%', img: HERO.spark },
    ],
    wheelAt: { left: '50%', top: '45%' },
  },
  {
    id: 'hc-odd', kind: 'prea1', teacher: 'Reading: which one is different? Read the names, think about the power — tap the odd one and say why: Leo can’t fly!',
    scene: {
      id: 'hc-odd', kind: 'odd-one-out', bg: bgSquare, who: 'leo',
      teacher: 'Which one can’t do it? Tap it and say why!',
      rounds: [
        { items: [{ label: 'Captain Spark', img: HERO.sparkFly }, { label: 'Willow', img: item('willow-fly') }, { label: 'Zippy', img: HERO.zippy }, { label: 'Leo', img: HERO.leoFast }], odd: 3, line: 'Leo! Leo can’t fly. Captain Spark, Willow and Zippy can fly!' },
        { items: [{ label: 'fish', img: item('fish') }, { label: 'Leo', img: HERO.leoFast }, { label: 'Biscuit', img: item('dog') }, { label: 'Pip', img: HERO.pip }], odd: 0, line: 'The fish! A fish can’t run. Leo, Biscuit and Pip can run fast!' },
        { items: [{ label: 'turtle', img: item('turtle') }, { label: 'whale', img: item('whale') }, { label: 'Biscuit', img: HERO.biscuitSwim }, { label: 'kitten', img: HERO.kitten }], odd: 3, line: 'The kitten! A kitten can’t swim well. Turtles, whales and Biscuit can swim well!' },
      ],
    },
  },
  {
    id: 'hc-draw-that', kind: 'draw-guess', bg: bgTrials, who: 'spark', title: 'Draw That! What can the hero do?',
    teacher: 'Game: take turns. The drawer sees a secret power and draws it (no words!); the other one taps the picture and says it: You can fly fast! Last round: the student draws THEIR OWN hero power and says it.',
    rounds: [
      { drawer: 'teacher', secret: 0, options: [
        { label: 'fly fast', img: HERO.sparkFly, say: 'You can fly fast!' },
        { label: 'swim well', img: HERO.biscuitSwim, say: 'You can swim well!' },
        { label: 'jump high', img: HERO.pipHigh, say: 'You can jump high!' },
        { label: 'climb well', img: HERO.miaClimb, say: 'You can climb well!' },
      ], doodle: ['M 260 330 L 520 270 L 760 300', 'M 520 270 m -45 0 a 45 45 0 1 0 90 0 a 45 45 0 1 0 -90 0', 'M 470 280 Q 380 380 300 420 Q 400 360 470 330', 'M 180 360 L 120 360', 'M 200 400 L 130 410', 'M 190 320 L 130 310'] },
      { drawer: 'student', secret: 1, options: [
        { label: 'fly fast', img: HERO.sparkFly, say: 'You can fly fast!' },
        { label: 'swim well', img: HERO.biscuitSwim, say: 'You can swim well!' },
        { label: 'jump high', img: HERO.pipHigh, say: 'You can jump high!' },
        { label: 'climb well', img: HERO.miaClimb, say: 'You can climb well!' },
      ] },
      { drawer: 'student', secret: 3, options: [
        { label: 'run fast', img: HERO.leoFast, say: 'You can run fast!' },
        { label: 'lift it', img: HERO.leoLift, say: 'You can lift it! You are strong!' },
        { label: 'jump high', img: HERO.pipHigh, say: 'You can jump high!' },
        { label: 'climb well', img: HERO.miaClimb, say: 'You can climb well!' },
      ] },
    ],
    doneLine: 'Super drawing! Now tell me: what is YOUR hero power?',
  },
  {
    id: 'hc-who-can', kind: 'listen-tap', bg: bgTrials,
    teacher: 'You do (listening): Captain Spark says what a friend can do — tap the friend, then say it: Mia can climb well.',
    targets: [
      { label: 'Leo', left: '18%', top: '55%', color: '#FE6A2F', img: HERO.leoFast },
      { label: 'Mia', left: '39%', top: '55%', color: '#F59E0B', img: HERO.miaClimb },
      { label: 'Pip', left: '61%', top: '55%', color: '#FB923C', img: HERO.pipHigh },
      { label: 'Biscuit', left: '82%', top: '55%', color: '#FEAF15', img: HERO.biscuitSwim },
    ],
    rounds: [
      { prompt: 'He can jump high. Who is it?', answerLabel: 'Pip', who: 'spark' },
      { prompt: 'She can climb well. Who is it?', answerLabel: 'Mia', who: 'spark' },
      { prompt: 'He can swim well. Who is it?', answerLabel: 'Biscuit', who: 'spark' },
      { prompt: 'He can run fast. Who is it?', answerLabel: 'Leo', who: 'spark' },
    ],
  },
  /* Reading: Captain Spark Saves the Day, pages 1-3 */
  {
    id: 'hc-reader', kind: 'reader', bg: bgSquare, title: 'Captain Spark Saves the Day', doneLine: 'Leo is fast and Mia climbs well! What happens next? See you next time!',
    teacher: 'Reading: listen while the words light up, then the student reads each page. Tap any word to hear it.',
    pages: SPARK_STORY.slice(0, 3),
  },
  {
    id: 'hc-read-match', kind: 'picture-match', look: 'frames', prompt: 'Read and match',
    teacher: 'Reading: read each sentence from the story and drag it under its picture. Then read it aloud.',
    items: [
      { word: 'It is a sunny day.', img: sparkPage(1) },
      { word: 'She can fly fast!', img: sparkPage(2) },
      { word: 'Mia can climb well.', img: sparkPage(3) },
    ],
    bg: bgSquare,
  },
  {
    id: 'hc-yes-no', kind: 'true-false', bg: bgSquare, img: sparkPage(3), read: true,
    teacher: 'Reading: look at the picture, READ each sentence — yes or no? (🔊 only if the student needs help.)',
    rounds: [
      { who: 'pip', statement: 'Leo can run fast.', isTrue: true },
      { who: 'pip', statement: 'Mia can climb well.', isTrue: true },
      { who: 'mia', statement: 'Leo can fly.', isTrue: false },
      { who: 'mia', statement: 'It is a rainy day.', isTrue: false },
      { who: 'leo', statement: 'Pip and Biscuit are happy.', isTrue: true },
    ],
  },
  /* Phonics: ai → Word Splat → Blend & Read → tongue twister */
  {
    id: 'hc-sound-ai', kind: 'sound-model', bg: bgSquare, who: 'pip', letter: 'AI', phoneme: '/eɪ/', sound: 'ai', soundSide: 'center',
    teacher: 'Present: a and i together say /eɪ/ — like the name of the letter A! Rain, train, paint. Say: ai, ai, rain!',
    anchors: [
      { word: 'rain', emoji: '\u{1F327}\u{FE0F}', img: item('rain') },
      { word: 'train', emoji: '\u{1F682}', img: item('train') },
      { word: 'paint', emoji: '\u{1F3A8}', img: item('paint') },
    ],
  },
  {
    id: 'hc-splat', kind: 'word-splat', bg: bgSquare, who: 'spark', title: 'Word Splat! Listen and splat the word!',
    teacher: 'Reading: Captain Spark says a word — the student splats it and reads it aloud. The ai words and today’s sight words.',
    words: ['rain', 'train', 'paint', 'tail', 'snail', 'can', 'fast', 'well', 'help', 'she'],
    rounds: ['rain', 'can', 'train', 'fast', 'paint', 'well', 'snail', 'help'],
    doneLine: 'Splat! You can read them!',
  },
  {
    id: 'hc-blend', kind: 'sound-blend', bg: bgSquare, look: 'train',
    teacher: 'Reading: say each sound (r, ai, n — blend them), blend the word, find the picture — then read the sentence.',
    rounds: [
      { word: 'rain', sounds: ['r', 'ai', 'n'], img: item('rain'), sentence: 'I can run fast in the rain.' },
      { word: 'train', sounds: ['t', 'r', 'ai', 'n'], img: item('train'), sentence: 'The train is fast.' },
      { word: 'paint', sounds: ['p', 'ai', 'n', 't'], img: item('paint'), sentence: 'I can paint well.' },
    ],
  },
  { id: 'hc-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgSquare, who: 'pip', focus: 'ai', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, faster — then train speed!', line: 'Paint the train in the rain.' },
  /* Free: what can you do well? The child asks Captain Spark */
  {
    id: 'hc-free-talk', kind: 'join-stage', bg: bgSquare, teacher: 'Free: Captain Spark asks what the student can do well — they answer with fast / well and one more power. Then they ask her.', cast: ['spark'],
    turns: [
      { who: 'spark', line: 'What can you do well?' },
      { who: 'student', line: 'I can … well! I can … fast!' },
      { who: 'spark', line: 'Super! Now ask me!' },
      { who: 'student', line: 'What can you do well?' },
      { who: 'spark', line: 'I can fly fast. And I can help!' },
    ],
  },
  {
    id: 'hc-my-hero', kind: 'join-stage', bg: bgHQ, teacher: 'Free: the student designs their own hero! Name, power and how: My hero is … . She / He can … fast / well. Zippy asks.', cast: ['zippy'],
    turns: [
      { who: 'zippy', line: 'Beep! Make a hero! What is your hero’s name?' },
      { who: 'student', line: 'My hero is … !' },
      { who: 'zippy', line: 'What can your hero do?' },
      { who: 'student', line: 'He / She can … fast / well!' },
      { who: 'zippy', line: 'Wow! A super hero! Beep beep!' },
    ],
  },
  { id: 'hc-i-can', kind: 'meet', focus: ['well', 'fast'], bg: sparkPage(2), who: 'spark', cardSide: 'left', teacher: 'Check: the student says 3 true sentences about themselves with fast / well — then the hero badge! Teach-back: the student says the rule (fast / well come at the end).', line: 'You can say what you can do well — and fast!', repeat: 'I can run fast. I can swim well.' },
  {
    id: 'hc-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Hero City sticker in their Sticker Book.',
    scene: {
      id: 'hc-sticker', kind: 'sticker-reward', bg: bgSquare, who: 'pip', teacher: 'Sticker time!',
      line: 'Super hero! Here is your sticker.',
      sticker: { img: HERO.spark, label: 'Hero power' },
    },
  },
  petPal('hc-pet-pal', 0, 'I want to be a hero! I want a cape!', [{ label: 'cape', img: HERO.cape }, { label: 'shell', img: SEA.shell }, { label: 'cake', img: item('cake') }], 0, 'A cape! Thank you! I can fly… no, I can’t!'),
  {
    id: 'hc-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'hc-home-mission', kind: 'home-mission', bg: bgSquare, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned to say what they can do well: "I can run fast. I can swim well." This week, ask: "What can you do well?" and let your child tell you one thing.',
      steps: [
        { emoji: '\u{1F9B8}', say: 'Tell your family one thing you can do well.' },
        { emoji: '\u{1F3C3}', say: 'Say: I can run fast!' },
        { emoji: '\u{2753}', say: 'Ask: What can you do well?' },
      ],
    },
  },
  goodbyeSong('hc-goodbye-song', bgSquare),
  { id: 'hc-finale', kind: 'finale', bg: sparkPage(2), who: 'spark', line: 'You can say what you can do well! See you in Hero City! \u{1F9B8}' },
];

/* =============================================================================
 * A1 Unit 7 Lesson 2: "Can You Lift It? Can't and Can!"
 * Objective: I can ask a friend and compare: "Can you lift it?" "No, I can't, but Leo can!"
 * Story frame: a big box blocks the stone bridge and a toy boat floats away — who can help? (midday sun on the bridge).
 * Practice ladder: Revise (Remember? L1 powers) → Present (I do: lift, carry, fix, save — one per card; the rule: Can
 *   you…? Yes, I can. / No, I can't, but … can!) → we do (echo) → Read and Match → you do (Can It? ★ with heroes: ask
 *   each hero, send the one who can; Hot Badge; Wobbly Tower; Whisper Tube) → Reading (Reader p4-5, Read and Match,
 *   Yes or No?) → Phonics ay (Letter Bubbles, Blend & Read, twister) → Free (ask the teacher 3 questions) → check.
 * ========================================================================= */

export const LESSON_A1U7L2_TITLE = 'Can You Lift It? Can’t and Can!';
export const LESSON_A1U7L2_OBJECTIVE = 'I can ask a friend and compare: "Can you lift it?" "No, I can\'t, but Leo can!"';

export const LESSON_A1U7L2_SCENES: Scene[] = [
  { id: 'hc2-title', kind: 'title-card', bg: sparkPage(4), level: 'A1', unit: 'Unit 7', lessonLabel: 'Lesson 2', title: 'Can You Lift It?', subtitle: 'No, I can’t — but Leo can!', cta: '\u{1F4AA} LET’S HELP!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 1 — hero powers. Click mode: the powers are pictures of the friends.
    id: 'hc2-recall-warmup', kind: 'recall-warmup', bg: bgTrials, who: 'pip', mode: 'click',
    fromLabel: 'Lesson 1 · Superhero Powers',
    teacher: 'Guided: Pip says a power — the student finds the hero and says the sentence: He can run fast.',
    items: [
      { word: 'run fast', say: 'I can run fast!', img: HERO.leoFast },
      { word: 'climb well', say: 'I can climb well!', img: HERO.miaClimb },
      { word: 'jump high', say: 'I can jump high!', img: HERO.pipHigh },
      { word: 'swim well', say: 'I can swim well!', img: HERO.biscuitSwim },
    ],
  },
  { id: 'hc2-meet-bridge', kind: 'meet', focus: ['box'], bg: sparkPage(4), who: 'mia', cardSide: 'right', teacher: 'Present: oh no — a big box on the bridge! The train can’t go. Point to the box. Who can help?', line: 'Oh no! A big box on the bridge! Who can help?', repeat: 'A big box!' },
  {
    id: 'hc2-verbs', kind: 'prea1', teacher: 'Present (I do → you do): one helper word per card. Say it, the student says it and mimes it: lift!',
    scene: {
      id: 'hc2-verbs', kind: 'listen-repeat-cards', bg: bgSquare, teacher: 'Listen and say it! Do the action!',
      cards: [
        { who: 'leo', sentence: 'I can lift the box.', img: HERO.leoLift, imgLabel: 'lift' },
        { who: 'mia', sentence: 'I can carry the bags.', img: item('cit-bags'), imgLabel: 'carry' },
        { who: 'pip', sentence: 'I can fix the bike.', img: item('cit-bike'), imgLabel: 'fix' },
        { who: 'leo', sentence: 'I can save the boat.', img: HERO.biscuitSwim, imgLabel: 'save' },
        { who: 'leo', sentence: 'I am strong!', img: HERO.leoLift, imgLabel: 'strong' },
      ],
    },
  },
  { id: 'hc2-rule', kind: 'meet', focus: ['Can you', 'but'], bg: sparkPage(4), who: 'spark', cardSide: 'left', teacher: 'The rule (say it, the student repeats): ask "Can you …?" — answer "Yes, I can." or "No, I can’t." Can’t do it? Find a friend who CAN: "No, I can’t, but Leo can!" Point to yourself, shake your head, then point to Leo.', line: 'Can you lift it? No, I can’t, but Leo can!', repeat: 'Can you …? Yes, I can. / No, I can’t, but … can!' },
  { id: 'hc2-meet-pip', kind: 'meet', focus: ['can’t'], bg: sparkPage(4), who: 'pip', cardSide: 'right', teacher: 'Present (I do): Pip tries — he can’t! Then Leo lifts it. Act it out: push, push… then flex your arms like Leo.', line: 'Can I lift the box? No, I can’t! But Leo can!', repeat: 'No, I can’t, but Leo can!' },
  { id: 'hc2-echo', kind: 'echo', bg: sparkPage(4), who: 'leo', textSide: 'top', teacher: 'Guided (we do): ask like a hero — Can you lift it? — first a whisper, then a strong voice!', word: 'Can you lift it?' },
  {
    id: 'hc2-match', kind: 'picture-match', look: 'polaroids', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its picture (or taps the sentence, then the picture), then reads it aloud.',
    items: [
      { word: 'He can lift the box.', img: HERO.leoLift },
      { word: 'He can’t lift the box.', img: HERO.pipTry },
      { word: 'She can carry the bags.', img: item('cit-bags') },
      { word: 'He can save the boat.', img: HERO.biscuitSwim },
      { word: 'She can climb well.', img: HERO.miaClimb },
    ],
    bg: bgSquare,
  },
  {
    id: 'hc2-can-it', kind: 'prea1', teacher: 'You do (signature game): Can you…? The student ASKS each hero (Pip, can you fly?), the hero tries — and answers. Then the student says who CAN: No, he can’t, but Captain Spark can!',
    scene: {
      id: 'hc2-can-it', kind: 'can-it', bg: bgTrials, who: 'pip',
      teacher: 'Ask the hero: Can you …? Thumbs up: Yes, I can! Thumbs down: No, I can’t, but … can!',
      animals: [{ word: 'Pip', img: HERO.pip }, { word: 'Mia', img: HERO.mia }, { word: 'Leo', img: HERO.leo }, { word: 'Biscuit', img: item('dog') }, { word: 'Captain Spark', img: HERO.spark }],
      rounds: [
        { animal: 0, action: 'fly', can: false, real: 'jump', ask: 'Pip, can you fly?', answer: 'No, I can’t fly, but Captain Spark can!' },
        { animal: 2, action: 'run', can: true, real: 'run', ask: 'Leo, can you run fast?', answer: 'Yes, I can! I can run fast!' },
        { animal: 1, action: 'swim', can: false, real: 'run', ask: 'Mia, can you swim well?', answer: 'No, I can’t, but Biscuit can!' },
        { animal: 3, action: 'fly', can: false, real: 'swim', ask: 'Biscuit, can you fly?', answer: 'No, I can’t fly, but Zippy can!' },
        { animal: 4, action: 'fly', can: true, real: 'fly', ask: 'Captain Spark, can you fly?', answer: 'Yes, I can! I can fly fast!' },
        { animal: 0, action: 'jump', can: true, real: 'jump', ask: 'Pip, can you jump high?', answer: 'Yes, I can! I can jump high!' },
      ],
      doneLine: 'Super questions! Yes, I can! No, I can’t, but … can!',
    },
  },
  {
    id: 'hc2-hot-badge', kind: 'hot-coconut', bg: bgSquare, who: 'spark', coconutImg: HERO.badge, title: 'Hot Badge! Pass it — then answer!',
    teacher: 'Free: tap Pass! — where the hero badge stops, that friend answers the question (the student answers for them). Quick, but right first!',
    seats: [
      { name: 'You', img: '' },
      { name: 'Leo', img: HERO.leo },
      { name: 'Mia', img: HERO.mia },
      { name: 'Pip', img: HERO.pip },
      { name: 'Captain Spark', img: HERO.spark },
    ],
    rounds: [
      { ask: 'Leo, can you lift the box?', choices: ['Yes, I can!', 'No, I can’t.'], answer: 0, stop: 1 },
      { ask: 'Pip, can you lift the box?', choices: ['Yes, I can!', 'No, I can’t, but Leo can!'], answer: 1, stop: 3 },
      { ask: 'Captain Spark, can you fly?', choices: ['Yes, I can!', 'No, I can’t.'], answer: 0, stop: 4 },
      { ask: 'Mia, can you fly?', choices: ['Yes, I can!', 'No, I can’t, but Captain Spark can!'], answer: 1, stop: 2 },
      { ask: 'Can you help?', choices: ['Yes, I can!', 'Yes, I can’t!'], answer: 0, stop: 0 },
    ],
    doneLine: 'Hot badge, cool heroes! Great answers!',
  },
  helloSong('hc2-hello-song', bgSquare),
  {
    id: 'hc2-tower', kind: 'tower-pull', bg: sparkPage(4), who: 'leo', title: 'Lift the Box Tower!',
    teacher: 'Game: the student picks a block and answers its question. Right — the block slides out and goes on top. Wrong — the tower wobbles, try again. It never falls!',
    rounds: [
      { ask: 'Can Pip lift the box?', choices: ['Yes, he can.', 'No, he can’t.', 'Yes, I am.'], answer: 1 },
      { ask: 'Can Leo lift the box?', choices: ['Yes, he can.', 'No, he can’t.', 'He is box.'], answer: 0 },
      { ask: 'Pip can’t lift it, …', choices: ['and Leo can’t.', 'but Leo can!', 'but Leo is.'], answer: 1 },
      { ask: 'Who can swim well?', choices: ['Biscuit can.', 'Biscuit can’t.', 'Biscuit is swim.'], answer: 0 },
      { ask: 'Can you fix a bike?', choices: ['Yes, I can. / No, I can’t.', 'Yes, I fix.', 'I am a bike.'], answer: 0 },
      { ask: 'Mia can’t lift it. She is …', choices: ['small.', 'a box.', 'fast box.'], answer: 0 },
      { ask: 'Leo can lift it. He is …', choices: ['strong!', 'sleepy.', 'a bridge.'], answer: 0 },
    ],
    doneLine: 'A super tower — and the bridge is clear!',
  },
  {
    id: 'hc2-whisper', kind: 'whisper-tube', bg: bgSquare, who: 'spark', title: 'Hero Whispers: one word is wrong!',
    teacher: 'Listening game: a friend whispers down the tube; the other friend gets ONE word wrong. The student taps the wrong word, picks the right one and says the whole sentence.',
    rounds: [
      { from: 'leo', to: 'mia', fromImg: HERO.leo, toImg: HERO.mia, said: 'I can lift the box.', heard: 'I can lift the fox.', choices: ['socks'] },
      { from: 'mia', to: 'pip', fromImg: HERO.mia, toImg: HERO.pip, said: 'Can you fix the bike?', heard: 'Can you fix the kite?', choices: ['light'] },
      { from: 'pip', to: 'spark', fromImg: HERO.pip, toImg: HERO.spark, said: 'No, I can’t, but Leo can!', heard: 'No, I can’t, but Leo can’t!', choices: ['cat'] },
      { from: 'spark', to: 'leo', fromImg: HERO.spark, toImg: HERO.leo, said: 'Biscuit can swim well.', heard: 'Biscuit can swim bell.', choices: ['tell'] },
    ],
    doneLine: 'No more mix-ups! Super hero ears!',
  },
  {
    id: 'hc2-race', kind: 'answer-race', bg: bgTrials, who: 'spark', look: 'race', racer: HERO.leoFast, title: 'Hero Race: who can help?',
    teacher: 'You do (listening + reading): a citizen needs help — read the answers and pick the hero who CAN. Every right answer moves Leo forward on the track.',
    rounds: [
      { ask: 'The boat is in the water! Who can swim well?', choices: ['Biscuit can!', 'Mia can’t.', 'Leo is fast.'], answer: 0 },
      { ask: 'The box is big. Who can lift it?', choices: ['Pip can.', 'Leo can!', 'The box can.'], answer: 1 },
      { ask: 'The kite is in the tree. Who can climb well?', choices: ['Biscuit can’t.', 'Mia can!', 'Zippy is.'], answer: 1 },
      { ask: 'The balloon is very high. Who can fly?', choices: ['Captain Spark can!', 'Leo can.', 'Pip can run.'], answer: 0 },
      { ask: 'Pip can’t lift it…', choices: ['but Leo can!', 'and Leo can’t.', 'but Leo is.'], answer: 0 },
    ],
    doneLine: 'Leo wins the race — and you found every helper!',
  },
  {
    id: 'hc2-balloons', kind: 'balloon-match', bg: bgSquare, who: 'mia', title: 'Hero Balloons: read and pop!',
    teacher: 'Reading game: the student reads a balloon (tap it to hear it), then taps the hero it describes. The balloon floats down and pops! Read it aloud.',
    pairs: [
      { text: 'He can’t lift the box.', img: HERO.pipTry, label: 'Pip' },
      { text: 'He can lift the box.', img: HERO.leoLift, label: 'Leo' },
      { text: 'She can climb well.', img: HERO.miaClimb, label: 'Mia' },
      { text: 'He can swim well.', img: HERO.biscuitSwim, label: 'Biscuit' },
    ],
    doneLine: 'Pop! You can read about the heroes!',
  },
  { id: 'hc2-echo-but', kind: 'echo', bg: sparkPage(4), who: 'pip', textSide: 'top', teacher: 'Guided: say it with Pip — shake your head on “can’t”, point to Leo on “Leo can”!', word: 'No, I can’t, but Leo can!' },
  /* Reading: pages 4-5 */
  {
    id: 'hc2-reader', kind: 'reader', bg: bgSquare, title: 'Captain Spark Saves the Day', doneLine: 'Leo is strong and Biscuit swims well! What happens next? See you next time!',
    teacher: 'Reading: first read pages 1-3 again quickly, then the new pages. Listen while the words light up, then the student reads. Tap any word to hear it.',
    pages: SPARK_STORY.slice(0, 5),
  },
  {
    id: 'hc2-read-match', kind: 'picture-match', look: 'cards', prompt: 'Read and match',
    teacher: 'Reading: read each sentence from the story and drag it under its picture. Then read it aloud.',
    items: [
      { word: 'Leo can run fast.', img: sparkPage(3) },
      { word: 'But Leo can!', img: sparkPage(4) },
      { word: 'He can save the boat.', img: sparkPage(5) },
    ],
    bg: bgSquare,
  },
  {
    id: 'hc2-story-gaps', kind: 'grammar-gap', bg: bgSquare, title: 'Read and Choose: the hero story',
    teacher: 'Reading (Cambridge Starters style): read the sentence from the story and choose the missing word. Then read it all.',
    rounds: [
      { before: 'Leo can run', after: '.', choices: ['fast', 'box'], answer: 'fast', img: sparkPage(3) },
      { before: 'Can Pip lift the box? No, he', after: '.', choices: ['can’t', 'can'], answer: 'can’t', img: sparkPage(4) },
      { before: 'But Leo', after: '!', choices: ['can', 'can’t'], answer: 'can', img: sparkPage(4) },
      { before: 'Biscuit can swim', after: '.', choices: ['well', 'high'], answer: 'well', img: sparkPage(5) },
    ],
  },
  /* Phonics: ay → Letter Bubbles → Blend & Read → tongue twister */
  {
    id: 'hc2-sound-ay', kind: 'sound-model', bg: bgSquare, who: 'pip', letter: 'AY', phoneme: '/eɪ/', sound: 'ai', soundSide: 'center',
    teacher: 'Present: a and y together say /eɪ/ too — the same sound as ai! ay is at the END of a word: play, day, say. Say: ay, ay, play!',
    anchors: [
      { word: 'play', emoji: '\u{26BD}', img: item('ball-red') },
      { word: 'tray', emoji: '\u{1F37D}\u{FE0F}', img: item('tray') },
      { word: 'hay', emoji: '\u{1F33E}', img: item('hay') },
    ],
  },
  {
    id: 'hc2-bubbles', kind: 'letter-bubbles', bg: bgSquare, who: 'zippy', title: 'Letter Bubbles: spell the ay word!',
    teacher: 'Reading: pop the letter bubbles in the right order to spell the word, then read it aloud. ay is always at the end!',
    words: [
      { word: 'play', img: item('ball-red'), say: 'I can play well.' },
      { word: 'tray', img: item('tray'), say: 'Leo can carry the tray.' },
      { word: 'hay', img: item('hay'), say: 'The hay is yellow.' },
      { word: 'clay', img: item('clay'), say: 'I can play with clay.' },
    ],
    doneLine: 'Pop, pop! You can spell ay words!',
  },
  {
    id: 'hc2-blend', kind: 'sound-blend', bg: bgSquare, look: 'slide',
    teacher: 'Reading: say each sound (d, ay — blend them), blend the word, find the picture — then read the sentence.',
    rounds: [
      { word: 'day', sounds: ['d', 'ay'], img: item('sun'), sentence: 'It is a sunny day.' },
      { word: 'play', sounds: ['p', 'l', 'ay'], img: item('ball-red'), sentence: 'Can you play with me?' },
      { word: 'stay', sounds: ['s', 't', 'ay'], img: item('bench'), sentence: 'Stay here, Biscuit!' },
    ],
  },
  { id: 'hc2-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgSquare, who: 'pip', focus: 'ay', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, faster — then hero speed!', line: 'Stay and play all day.' },
  /* Free: the child asks */
  {
    id: 'hc2-ask-me', kind: 'join-stage', bg: bgSquare, teacher: 'Free: the student asks the teacher (or Captain Spark) 3 “Can you …?” questions, and answers hers. When the answer is No, add a friend who can: No, I can’t, but … can!', cast: ['spark'],
    turns: [
      { who: 'spark', line: 'Ask me! Can you …?' },
      { who: 'student', line: 'Can you swim well?' },
      { who: 'spark', line: 'No, I can’t, but Biscuit can! Now you. Can you fly?' },
      { who: 'student', line: 'No, I can’t, but … can!' },
      { who: 'spark', line: 'Great! You found a helper!' },
    ],
  },
  { id: 'hc2-i-can', kind: 'meet', focus: ['but'], bg: sparkPage(5), who: 'spark', cardSide: 'left', teacher: 'Check: the student asks 3 questions and answers with “but … can”. Teach-back: the student says the rule (Can you…? Yes, I can. / No, I can’t, but … can).', line: 'You can ask a friend — and find who can help, but…', repeat: 'No, I can’t, but Leo can!' },
  {
    id: 'hc2-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Hero City sticker in their Sticker Book.',
    scene: {
      id: 'hc2-sticker', kind: 'sticker-reward', bg: bgSquare, who: 'pip', teacher: 'Sticker time!',
      line: 'Strong hero! Here is your sticker.',
      sticker: { img: HERO.leoLift, label: 'Strong helper' },
    },
  },
  petPal('hc2-pet-pal', 1, 'I want something shiny for heroes! I want a badge!', [{ label: 'badge', img: HERO.badge }, { label: 'box', img: HERO.bigBox }, { label: 'boat', img: '/magic-castle/stickers/boat.png' }], 0, 'A hero badge! Thank you!'),
  {
    id: 'hc2-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'hc2-home-mission', kind: 'home-mission', bg: bgSquare, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned to ask "Can you lift it?" and to answer "No, I can\'t, but Leo can!". This week, let your child ask you 3 "Can you…?" questions — answer, and say who CAN when you can\'t.',
      steps: [
        { emoji: '\u{2753}', say: 'Ask your family 3 questions: Can you …?' },
        { emoji: '\u{1F44E}', say: 'If they say No, find someone who can: … but Mum can!' },
        { emoji: '\u{1F4AA}', say: 'Help carry something at home!' },
      ],
    },
  },
  goodbyeSong('hc2-goodbye-song', bgSquare),
  { id: 'hc2-finale', kind: 'finale', bg: sparkPage(5), who: 'spark', line: 'You can ask: Can you…? See you in Hero City! \u{1F4AA}' },
];
