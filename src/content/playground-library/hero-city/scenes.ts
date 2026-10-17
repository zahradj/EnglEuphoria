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

/* =============================================================================
 * A1 Unit 7 Lesson 3: "Listen to the Hero Helper Song"
 * Objective: I can understand hero rules: "You must help. You mustn't run on the road."
 * Story frame: Zippy stops the friends at a red light on a city street (busy afternoon, golden shop awnings); the
 *   heroes learn the rules of the city, and Captain Spark's helper song.
 * Practice ladder: Revise (Remember? L2 who can) → Present (I do: the rule — must = do it, mustn't = don't do it; one
 *   rule per card) → we do (echo) → Read and Match → you do (Red Light, Green Light ★ on the city road; the song;
 *   Must or Mustn't? sort; Tick or Cross; Rule Bingo; Treasure Radar for the lost cape) → Reading (Reader p6-7, Read
 *   and Match) → Phonics a_e magic e (Word Build, Blend & Read, twister) → Free (make a rule for your home) → check.
 * The listening game is never "who said it?" (blueprint: L3).
 * ========================================================================= */

export const LESSON_A1U7L3_TITLE = 'Listen to the Hero Helper Song';
export const LESSON_A1U7L3_OBJECTIVE = 'I can understand hero rules: "You must help. You mustn\'t run on the road."';

const RULE = {
  wait: item('rule-wait'), runRoad: item('rule-run-road'), help: item('rule-help'), shout: item('rule-shout'),
  share: item('rule-share'), litter: item('rule-litter'), light: item('traffic-light'),
};
/** "The Hero Helper Song" (scripts/songs.json a1u7l3-hero-helper-song, kids-song-writer gate PASS, 112 BPM, one take). */
const SONG_A1U7L3 = '/lep1/audio/hero-helper-song-a1u7l3.mp3?v=1';
const HERO_CHORUS: { who: CharKey; text: string }[] = [
  { who: 'spark', text: 'We can help, help, help!' },
  { who: 'spark', text: 'Be kind and help, help, help!' },
];
const SONG_A1U7L3_LYRICS: { who: CharKey; text: string }[] = [
  ...HERO_CHORUS,
  { who: 'zippy', text: 'Stop! You must stop at the light,' },
  { who: 'zippy', text: 'Then look to the left and the right!' },
  { who: 'zippy', text: 'You mustn’t run on the road,' },
  { who: 'zippy', text: 'You must walk nice and slow!' },
  ...HERO_CHORUS,
  { who: 'mia', text: 'You must help your friend today,' },
  { who: 'mia', text: 'Help them work and help them play!' },
  { who: 'mia', text: 'You mustn’t shout, you mustn’t run,' },
  { who: 'mia', text: 'Be kind to everyone!' },
  ...HERO_CHORUS,
];
/** Line times measured on take 3 (docs/songs/a1u7l3-hero-helper-song-take3.words.json, score 0.95); the first entry
 *  includes the intro. */
const SONG_A1U7L3_MS = [10560, 6600, 4060, 3220, 3120, 6080, 2500, 7100, 3660, 3260, 3080, 6360, 2300, 2500];

export const LESSON_A1U7L3_SCENES: Scene[] = [
  { id: 'hc3-title', kind: 'title-card', bg: sparkPage(6), level: 'A1', unit: 'Unit 7', lessonLabel: 'Lesson 3', title: 'The Hero Helper Song!', subtitle: 'You must help. You mustn’t run on the road!', cta: '\u{1F6A6} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 2 — who can, who can't. Click mode: the friends' helper pictures.
    id: 'hc3-recall-warmup', kind: 'recall-warmup', bg: bgSquare, who: 'pip', mode: 'click',
    fromLabel: 'Lesson 2 · Can You Lift It?',
    teacher: 'Guided: Pip says who can or can’t — the student finds the picture and says it: Pip can’t lift it, but Leo can!',
    items: [
      { word: 'can lift', say: 'Leo can lift the box.', img: HERO.leoLift },
      { word: 'can’t lift', say: 'Pip can’t lift the box.', img: HERO.pipTry },
      { word: 'swim well', say: 'Biscuit can swim well.', img: HERO.biscuitSwim },
      { word: 'fly', say: 'Captain Spark can fly.', img: HERO.sparkFly },
    ],
  },
  { id: 'hc3-meet-road', kind: 'meet', focus: ['road', 'stop'], bg: sparkPage(6), who: 'zippy', cardSide: 'right', teacher: 'Present: the friends are at the road. The light is red. Zippy holds up his hand — Stop! Hold up your hand too.', line: 'Beep! Stop! This is the road. Heroes are safe!', repeat: 'Stop! The road!' },
  { id: 'hc3-rule-must', kind: 'meet', focus: ['must'], bg: bgRoad, who: 'spark', cardSide: 'left', teacher: 'The rule (say it, the student repeats): MUST = do it! You must + action: You must stop. You must help. Nod your head on must.', line: 'You must stop. You must help. Must means: do it!', repeat: 'You must … !' },
  {
    id: 'hc3-must-cards', kind: 'prea1', teacher: 'Present (I do → you do): one rule per card. Say it, the student says it and nods: You must wait!',
    scene: {
      id: 'hc3-must-cards', kind: 'listen-repeat-cards', bg: bgRoad, teacher: 'Listen and say it! Nod: do it!',
      cards: [
        { who: 'mia', sentence: 'You must stop at the red light.', img: RULE.light, imgLabel: 'stop' },
        { who: 'mia', sentence: 'You must wait.', img: RULE.wait, imgLabel: 'wait' },
        { who: 'leo', sentence: 'You must help.', img: RULE.help, imgLabel: 'help' },
        { who: 'leo', sentence: 'You must be kind.', img: RULE.share, imgLabel: 'kind' },
      ],
    },
  },
  { id: 'hc3-rule-mustnt', kind: 'meet', focus: ['mustn’t'], bg: bgRoad, who: 'spark', cardSide: 'left', teacher: 'The rule (say it, the student repeats): MUSTN’T = don’t do it! You mustn’t + action. Shake your head and wag your finger on mustn’t. (Say it: MUS-n’t — no t in the middle.)', line: 'You mustn’t run on the road. Mustn’t means: don’t do it!', repeat: 'You mustn’t … !' },
  {
    id: 'hc3-mustnt-cards', kind: 'prea1', teacher: 'Present (I do → you do): one rule per card. Say it, the student says it and shakes their head: You mustn’t shout!',
    scene: {
      id: 'hc3-mustnt-cards', kind: 'listen-repeat-cards', bg: bgRoad, teacher: 'Listen and say it! Shake your head: don’t do it!',
      cards: [
        { who: 'pip', sentence: 'You mustn’t run on the road.', img: RULE.runRoad, imgLabel: 'run on the road' },
        { who: 'pip', sentence: 'You mustn’t shout.', img: RULE.shout, imgLabel: 'shout' },
        { who: 'pip', sentence: 'You mustn’t drop paper.', img: RULE.litter, imgLabel: 'drop paper' },
      ],
    },
  },
  { id: 'hc3-echo', kind: 'echo', bg: sparkPage(6), who: 'zippy', textSide: 'top', teacher: 'Guided (we do): say it like Zippy — a robot voice, then a hero voice! Wag your finger.', word: 'You mustn’t run on the road!' },
  {
    id: 'hc3-match', kind: 'picture-match', look: 'cards', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each rule and drags it under its picture (or taps the rule, then the picture), then reads it aloud.',
    items: [
      { word: 'You must wait.', img: RULE.wait },
      { word: 'You must help.', img: RULE.help },
      { word: 'You mustn’t run on the road.', img: RULE.runRoad },
      { word: 'You mustn’t shout.', img: RULE.shout },
      { word: 'You must be kind.', img: RULE.share },
    ],
    bg: bgRoad,
  },
  {
    id: 'hc3-red-green', kind: 'red-green', bg: bgRoad, who: 'zippy', runner: HERO.pip, title: 'Red Light, Green Light: the hero road!',
    teacher: 'You do (signature game, listening): on green, the student taps the rule they hear and Pip walks on (they can do the action too!). On red — you MUST stop! Do not tap until it turns green.',
    cards: [{ label: 'wait', img: RULE.wait }, { label: 'help', img: RULE.help }, { label: 'be kind', img: RULE.share }, { label: 'don’t shout', img: RULE.shout }],
    rounds: [
      { light: 'green', say: 'Green light! You must help!', answer: 1, steps: 2 },
      { light: 'red', say: 'Red light! You must stop!' },
      { light: 'green', say: 'Green light! You must be kind!', answer: 2, steps: 2 },
      { light: 'green', say: 'Green light! You mustn’t shout!', answer: 3, steps: 2 },
      { light: 'red', say: 'Red light! You must wait!' },
      { light: 'green', say: 'Green light! You must wait at the road!', answer: 0, steps: 2 },
      { light: 'green', say: 'Green light! You must help!', answer: 1, steps: 2 },
    ],
    doneLine: 'Pip is safe across the road! Super listening, hero!',
  },
  {
    id: 'hc3-song', kind: 'song', bg: sparkPage(7), title: '\u{1F3B5} The Hero Helper Song \u{1F3B5}',
    teacher: 'Song: sing along and do the actions — hand up for "stop", look left and right, walk slowly on the spot, wag your finger on "mustn’t", hand on your heart for "help" and "kind".',
    bigWord: 'help', songUrl: SONG_A1U7L3, lineDurationsMs: SONG_A1U7L3_MS, lyrics: SONG_A1U7L3_LYRICS,
  },
  {
    id: 'hc3-sort', kind: 'prea1', teacher: 'Guided: Must or mustn’t? Catch each picture in the right net — and say the rule: You must help! / You mustn’t shout!',
    scene: {
      id: 'hc3-sort', kind: 'catch-sort', bg: bgRoad, goal: 6, seconds: 60,
      teacher: 'Do it or don’t do it? Catch it in the right net and say the rule!',
      left: { label: 'You must', emoji: '\u{1F44D}' }, right: { label: 'You mustn’t', emoji: '\u{1F44E}' },
      items: [
        { word: 'wait', img: RULE.wait, emoji: '\u{1F6A6}', target: 'left' },
        { word: 'run on the road', img: RULE.runRoad, emoji: '\u{1F3C3}', target: 'right' },
        { word: 'help', img: RULE.help, emoji: '\u{1F91D}', target: 'left' },
        { word: 'shout', img: RULE.shout, emoji: '\u{1F4E2}', target: 'right' },
        { word: 'be kind', img: RULE.share, emoji: '\u{1F49B}', target: 'left' },
        { word: 'drop paper', img: RULE.litter, emoji: '\u{1F4C4}', target: 'right' },
      ],
    },
  },
  {
    id: 'hc3-flip', kind: 'prea1', teacher: 'Free: flip a rule card and say the rule — then say WHY in English or with a mime (It’s safe! / It’s kind!).',
    scene: {
      id: 'hc3-flip', kind: 'flip-say', bg: bgRoad, who: 'pip', title: 'Flip a rule card and say it!',
      teacher: 'Flip a card. Say the rule!',
      cards: [
        { label: 'wait', img: RULE.wait, say: 'You must wait at the red light.' },
        { label: 'run', img: RULE.runRoad, say: 'You mustn’t run on the road.' },
        { label: 'help', img: RULE.help, say: 'You must help.' },
        { label: 'shout', img: RULE.shout, say: 'You mustn’t shout.' },
        { label: 'share', img: RULE.share, say: 'You must be kind.' },
        { label: 'paper', img: RULE.litter, say: 'You mustn’t drop paper.' },
      ],
      doneLine: 'Great rules! You can say must and mustn’t!',
    },
  },
  { id: 'hc3-echo-must', kind: 'echo', bg: sparkPage(7), who: 'mia', textSide: 'top', teacher: 'Guided: say it with Mia — nod on must, hand on your heart on help!', word: 'You must help. You must be kind!' },
  {
    id: 'hc3-tick', kind: 'prea1', teacher: 'Reading: read the sentence, look at the picture — is the hero following the rule? Tick or cross? (Cambridge Starters "look and read")',
    scene: {
      id: 'hc3-tick', kind: 'tick-cross', bg: bgRoad, who: 'mia', teacher: 'Read and look. Yes or no?',
      rounds: [
        { img: RULE.wait, sentence: 'Mia is waiting at the red light.', isTrue: true },
        { img: RULE.runRoad, sentence: 'Pip is walking slowly.', isTrue: false },
        { img: RULE.help, sentence: 'Leo is helping.', isTrue: true },
        { img: RULE.shout, sentence: 'Pip is quiet.', isTrue: false },
        { img: RULE.litter, sentence: 'The paper is in the bin.', isTrue: false },
      ],
    },
  },
  {
    id: 'hc3-bingo', kind: 'sticker-bingo', bg: bgSquare, who: 'zippy', title: 'Rule Bingo! Listen and stamp!',
    teacher: 'Guided (listen — the lesson’s evidence): Zippy says a rule — the student stamps the picture and says the rule again. Three in a row: Bingo!',
    cells: [
      { label: 'wait', img: RULE.wait, say: 'You must wait at the red light.' },
      { label: 'run', img: RULE.runRoad, say: 'You mustn’t run on the road.' },
      { label: 'help', img: RULE.help, say: 'You must help a grandma.' },
      { label: 'shout', img: RULE.shout, say: 'You mustn’t shout.' },
      { label: 'share', img: RULE.share, say: 'You must be kind. Share!' },
      { label: 'litter', img: RULE.litter, say: 'You mustn’t drop paper.' },
      { label: 'stop', img: RULE.light, say: 'Red light! You must stop.' },
      { label: 'Zippy', img: HERO.zippyStop, say: 'Zippy says: Stop! You must wait!' },
      { label: 'cheer', img: HERO.sparkCheer, say: 'You must be a happy hero!' },
    ],
    calls: [0, 4, 8, 2, 6, 1, 3],
    doneLine: 'Bingo! You know the hero rules!',
  },
  {
    id: 'hc3-radar', kind: 'hot-cold', bg: bgSquare, who: 'spark', title: 'Hero Radar: where is it?',
    teacher: 'Listening game: something is lost in the city square. The student taps to search and listens — Cold! Warm! Hot! When it pops out, they say the sentence.',
    rounds: [
      { label: 'cape', img: HERO.cape, x: 78, y: 72, find: 'Where is Captain Spark’s cape? Find it!', say: 'Here it is! It’s her cape!' },
      { label: 'badge', img: HERO.badge, x: 20, y: 80, find: 'Where is the hero badge? Find it!', say: 'Here it is! The hero badge!' },
      { label: 'Zippy', img: HERO.zippy, x: 55, y: 35, find: 'Where is Zippy? Find him!', say: 'Here he is! Hello, Zippy!' },
    ],
    doneLine: 'You found everything! Thank you, hero!',
  },
  /* Reading: pages 6-7 */
  {
    id: 'hc3-reader', kind: 'reader', bg: bgRoad, title: 'Captain Spark Saves the Day', doneLine: 'The friends are safe and kind! What happens next? See you next time!',
    teacher: 'Reading: first read pages 4-5 again quickly, then the new pages. Listen while the words light up, then the student reads. Tap any word to hear it.',
    pages: SPARK_STORY.slice(3, 7),
  },
  {
    id: 'hc3-read-match', kind: 'picture-match', look: 'polaroids', prompt: 'Read and match',
    teacher: 'Reading: read each sentence from the story and drag it under its picture. Then read it aloud.',
    items: [
      { word: 'Stop! You must wait.', img: sparkPage(6) },
      { word: 'The friends wait.', img: sparkPage(7) },
      { word: 'He can save the boat.', img: sparkPage(5) },
    ],
    bg: bgRoad,
  },
  /* Phonics: a_e magic e → Word Build → Blend & Read → tongue twister */
  {
    id: 'hc3-sound-ae', kind: 'sound-model', bg: bgSquare, who: 'pip', letter: 'A_E', phoneme: '/eɪ/', sound: 'ai', soundSide: 'center', magic: true,
    teacher: 'Present: magic e! Put an e at the end and the a says its name: cap → cape, mad → made. Save, cape, cake. Say: cape, cape, cape!',
    anchors: [
      { word: 'cape', emoji: '\u{1F9B8}', img: HERO.cape },
      { word: 'cake', emoji: '\u{1F382}', img: item('cake') },
      { word: 'wave', emoji: '\u{1F44B}', img: item('wave-hand') },
    ],
  },
  {
    id: 'hc3-word-build', kind: 'word-build', bg: bgSquare, magic: true,
    teacher: 'Reading: magic e! Add the e and the a says its name. Pick the missing letter, then read the word.',
    rounds: [
      { word: 'cape', tiles: ['c', 'a', 'p', 'e'], blankIndex: 3, answer: 'e', choices: ['e', 'a', 's'], img: HERO.cape, emoji: '\u{1F9B8}' },
      { word: 'cake', tiles: ['c', 'a', 'k', 'e'], blankIndex: 3, answer: 'e', choices: ['t', 'e', 'o'], img: item('cake'), emoji: '\u{1F382}' },
      { word: 'save', tiles: ['s', 'a', 'v', 'e'], blankIndex: 1, answer: 'a', choices: ['a', 'i', 'u'], img: HERO.biscuitSwim, emoji: '\u{1F6DF}' },
      { word: 'wave', tiles: ['w', 'a', 'v', 'e'], blankIndex: 3, answer: 'e', choices: ['e', 'y', 'n'], img: item('wave-hand'), emoji: '\u{1F44B}' },
    ],
  },
  {
    id: 'hc3-blend', kind: 'sound-blend', bg: bgSquare, look: 'gumball',
    teacher: 'Reading: say each sound (s, a_e, v — the magic e makes the a say its name), blend the word, find the picture — then read the sentence.',
    rounds: [
      { word: 'save', sounds: ['s', 'a_e', 'v'], img: HERO.biscuitSwim, sentence: 'Biscuit can save the boat.' },
      { word: 'cape', sounds: ['c', 'a_e', 'p'], img: HERO.cape, sentence: 'Captain Spark has got an orange cape.' },
      { word: 'brave', sounds: ['b', 'r', 'a_e', 'v'], img: HERO.sparkCheer, sentence: 'Heroes are brave and kind.' },
    ],
  },
  { id: 'hc3-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgSquare, who: 'pip', focus: 'a', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, faster — then hero speed!', line: 'Brave Kate saves the cake.' },
  /* Free: make a rule */
  {
    id: 'hc3-my-rule', kind: 'join-stage', bg: bgHQ, teacher: 'Free: the student makes rules for their home (or the classroom): one You must… and one You mustn’t… . Captain Spark asks; the student explains.', cast: ['spark'],
    turns: [
      { who: 'spark', line: 'Make a rule for your home! You must …' },
      { who: 'student', line: 'You must … !' },
      { who: 'spark', line: 'Good rule! And you mustn’t …?' },
      { who: 'student', line: 'You mustn’t … !' },
      { who: 'spark', line: 'Super rules! You are a hero at home!' },
    ],
  },
  { id: 'hc3-i-can', kind: 'meet', focus: ['must', 'mustn’t'], bg: sparkPage(7), who: 'spark', cardSide: 'left', teacher: 'Check: 4 of 5 rules understood from listening (Rule Bingo, Tick or Cross). Teach-back: the student says the rule — must = do it, mustn’t = don’t do it.', line: 'You know the hero rules! You must help. You mustn’t run on the road!', repeat: 'You must … . You mustn’t … .' },
  {
    id: 'hc3-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Hero City sticker in their Sticker Book.',
    scene: {
      id: 'hc3-sticker', kind: 'sticker-reward', bg: bgSquare, who: 'pip', teacher: 'Sticker time!',
      line: 'Safe hero! Here is your sticker.',
      sticker: { img: HERO.zippyStop, label: 'Hero rules' },
    },
  },
  petPal('hc3-pet-pal', 2, 'I want to fix my toys! I want a toolbox!', [{ label: 'toolbox', img: item('toolbox') }, { label: 'cape', img: HERO.cape }, { label: 'apple', img: item('apple') }], 0, 'A toolbox! Thank you! I can fix it!'),
  {
    id: 'hc3-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'hc3-home-mission', kind: 'home-mission', bg: bgSquare, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned hero rules: "You must help. You mustn\'t run on the road." and sang the Hero Helper Song. This week, make one family rule together in English and put it on the fridge.',
      steps: [
        { emoji: '\u{1F3B5}', say: 'Sing the Hero Helper Song.' },
        { emoji: '\u{1F4DD}', say: 'Make one family rule: You must … / You mustn’t … .' },
        { emoji: '\u{1F6A6}', say: 'At the road: Stop! Look left and right!' },
      ],
    },
  },
  goodbyeSong('hc3-goodbye-song', bgSquare),
  { id: 'hc3-finale', kind: 'finale', bg: sparkPage(7), who: 'spark', line: 'You know the hero rules! See you in Hero City! \u{1F6A6}' },
];

/* =============================================================================
 * A1 Unit 7 Lesson 4: "Offer to Help: Give, Show, Tell"
 * Objective: I can find out what's wrong and help: "What's the matter?" "I've got a headache." "Can I help you?"
 * Story frame: Captain Spark has a cold on a bench in the square — today the CHILD is the city's hero (late afternoon,
 *   warm light); the citizens of Hero City need help one by one.
 * Practice ladder: Revise (Remember? L3 rules) → Present (I do: What's the matter? + one problem per card; the rule:
 *   ask "What's the matter?", answer "I've got a…", offer "Can I help you?"; the help: Here's a…) → we do (echo) →
 *   Read and Match → you do (Hero Mission ★: ask, listen, pick the help, offer; Hero Clinic roleplay; First-aid Go
 *   Fish; Chat Chain) → Reading (Reader p8-9, Team Flags) → Phonics long a sort (Crossword, Blend & Read, twister) →
 *   Free (help the teacher) → check.
 * ========================================================================= */

export const LESSON_A1U7L4_TITLE = 'Offer to Help: Give, Show, Tell';
export const LESSON_A1U7L4_OBJECTIVE = 'I can find out what\'s wrong and help: "What\'s the matter?" "I\'ve got a headache." "Can I help you?"';

const CIT = {
  headache: item('cit-headache'), cold: item('cit-cold'), toothache: item('cit-toothache'), tummy: item('cit-tummy'),
  bags: item('cit-bags'), bike: item('cit-bike'), kitten: item('cit-kitten'),
};
const HELP = { tissue: item('tissues'), water: item('water-glass'), plaster: item('plaster'), phone: item('phone-call'), toolbox: item('toolbox'), ladder: HERO.ladder };

export const LESSON_A1U7L4_SCENES: Scene[] = [
  { id: 'hc4-title', kind: 'title-card', bg: sparkPage(8), level: 'A1', unit: 'Unit 7', lessonLabel: 'Lesson 4', title: 'Can I Help You?', subtitle: 'What’s the matter? I’ve got a cold!', cta: '\u{1F9B8} BE A HERO!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 3 — hero rules. Click mode: the rule pictures.
    id: 'hc4-recall-warmup', kind: 'recall-warmup', bg: bgRoad, who: 'pip', mode: 'click',
    fromLabel: 'Lesson 3 · Hero Rules',
    teacher: 'Guided: Pip says a rule — the student finds the picture and says the rule again: You must wait!',
    items: [
      { word: 'wait', say: 'You must wait at the red light.', img: RULE.wait },
      { word: 'run', say: 'You mustn’t run on the road.', img: RULE.runRoad },
      { word: 'help', say: 'You must help.', img: RULE.help },
      { word: 'shout', say: 'You mustn’t shout.', img: RULE.shout },
    ],
  },
  { id: 'hc4-meet-spark', kind: 'meet', focus: ['cold'], bg: sparkPage(8), who: 'spark', cardSide: 'left', teacher: 'Present: Captain Spark is on the bench. Achoo! She has got a cold. She can’t fly today. Today YOU are the hero!', line: 'Achoo! I’ve got a cold. I can’t fly today. Can you be the hero?', repeat: 'I’ve got a cold.' },
  { id: 'hc4-rule', kind: 'meet', focus: ['What’s the matter', 'I’ve got'], bg: sparkPage(8), who: 'mia', cardSide: 'right', teacher: 'The rule (say it, the student repeats): a friend looks sad or ill — ASK "What’s the matter?". They answer "I’ve got a headache." Then OFFER: "Can I help you?" — "Yes, please!" Act it out: worried face, hand out.', line: 'What’s the matter? — I’ve got a cold. — Can I help you? — Yes, please!', repeat: 'What’s the matter? Can I help you?' },
  {
    id: 'hc4-problems', kind: 'prea1', teacher: 'Present (I do → you do): one problem per card. The citizen says it, the student says it and mimes it: I’ve got a headache!',
    scene: {
      id: 'hc4-problems', kind: 'listen-repeat-cards', bg: bgSquare, teacher: 'Listen and say it! Show it!',
      cards: [
        { who: 'pip', sentence: 'I’ve got a headache.', img: CIT.headache, imgLabel: 'headache' },
        { who: 'leo', sentence: 'I’ve got a cold.', img: CIT.cold, imgLabel: 'cold' },
        { who: 'mia', sentence: 'I’ve got toothache.', img: CIT.toothache, imgLabel: 'toothache' },
        { who: 'pip', sentence: 'I’ve got a tummy ache.', img: CIT.tummy, imgLabel: 'tummy ache' },
      ],
    },
  },
  {
    id: 'hc4-helps', kind: 'prea1', teacher: 'Present (I do → you do): one way to help per card. Say it, the student says it and gives it with their hand: Here’s a tissue!',
    scene: {
      id: 'hc4-helps', kind: 'listen-repeat-cards', bg: bgSquare, teacher: 'Listen and say it! Give it!',
      cards: [
        { who: 'mia', sentence: 'Here’s a tissue.', img: HELP.tissue, imgLabel: 'tissue' },
        { who: 'mia', sentence: 'Here’s some water.', img: HELP.water, imgLabel: 'water' },
        { who: 'leo', sentence: 'Here’s a plaster.', img: HELP.plaster, imgLabel: 'plaster' },
        { who: 'leo', sentence: 'I can call the doctor.', img: HELP.phone, imgLabel: 'call the doctor' },
        { who: 'pip', sentence: 'I can carry your bags.', img: CIT.bags, imgLabel: 'carry' },
      ],
    },
  },
  { id: 'hc4-echo', kind: 'echo', bg: sparkPage(9), who: 'mia', textSide: 'top', teacher: 'Guided (we do): ask like a kind hero — a worried face, a soft voice!', word: 'What’s the matter? Can I help you?' },
  {
    id: 'hc4-match', kind: 'picture-match', look: 'chalk', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under the citizen who says it (or taps the sentence, then the picture), then reads it aloud.',
    items: [
      { word: 'I’ve got a headache.', img: CIT.headache },
      { word: 'I’ve got a cold.', img: CIT.cold },
      { word: 'I’ve got toothache.', img: CIT.toothache },
      { word: 'I’ve got a tummy ache.', img: CIT.tummy },
      { word: 'My bags are heavy.', img: CIT.bags },
    ],
    bg: bgSquare,
  },
  { id: 'hc4-model', kind: 'meet', focus: ['Can I help you'], bg: sparkPage(9), who: 'mia', cardSide: 'right', teacher: 'Present (I do → we do): watch Mia help Captain Spark — she asks, listens, then offers. Act it out together: the teacher sneezes, the student asks.', line: 'What’s the matter? Can I help you? Here’s a tissue!', repeat: 'Can I help you? Here’s a tissue.' },
  {
    id: 'hc4-mission', kind: 'hero-mission', bg: bgSquare, who: 'spark', title: 'Hero Mission: help the city!',
    teacher: 'You do (signature game): the student is the city’s hero. Tap a person with a “!” — ASK What’s the matter? (🎤), listen, pick the right help from the hero bag, then OFFER it aloud (🎤). Every helped person gets a gold star and the city wakes up.',
    citizens: [
      { name: 'Ben', img: CIT.headache, left: 14, top: 62, size: 13, problem: 'I’ve got a headache.', help: 'water', offer: 'Can I help you? Here’s some water. Sit down!', thanks: 'Thank you, hero! I feel better!' },
      { name: 'Grandpa Joe', img: CIT.cold, left: 32, top: 70, size: 14, problem: 'Achoo! I’ve got a cold.', help: 'tissue', offer: 'Can I help you? Here’s a tissue.', thanks: 'Thank you! Achoo! You are kind!' },
      { name: 'Lily', img: CIT.toothache, left: 50, top: 62, size: 13, problem: 'Ouch! I’ve got toothache.', help: 'call the doctor', offer: 'Can I help you? I can call the dentist.', thanks: 'Thank you, hero!' },
      { name: 'Grandma Rose', img: CIT.bags, left: 68, top: 70, size: 14, problem: 'My bags are very heavy!', help: 'carry', offer: 'Can I help you? I can carry your bags.', thanks: 'Oh, thank you, strong hero!' },
      { name: 'Sam', img: CIT.bike, left: 86, top: 62, size: 13, problem: 'Oh no! My bike is broken.', help: 'toolbox', offer: 'Can I help you? I can fix your bike!', thanks: 'Yay! Thank you, hero!' },
    ],
    helps: [
      { label: 'water', img: HELP.water },
      { label: 'tissue', img: HELP.tissue },
      { label: 'call the doctor', img: HELP.phone },
      { label: 'carry', img: item('shopping-bag') },
      { label: 'toolbox', img: HELP.toolbox },
      { label: 'plaster', img: HELP.plaster },
    ],
    doneLine: 'Everyone is happy! You are the hero of Hero City!',
  },
  helloSong('hc4-hello-song', bgSquare),
  {
    id: 'hc4-clinic', kind: 'roleplay', bg: bgHQ, cast: ['pip', 'mia'],
    teacher: 'Roleplay (the Hero Clinic): play it with the teacher — first the student is Mia (the helper), then swap and the student is Pip. Use a real tissue or a cup for fun!',
    script: [
      { who: 'mia', line: 'Hello, Pip! What’s the matter?' },
      { who: 'pip', line: 'I’ve got a headache.', repeat: true },
      { who: 'mia', line: 'Oh no! Can I help you?' },
      { who: 'pip', line: 'Yes, please!', repeat: true },
      { who: 'mia', line: 'Sit down. Here’s some water.' },
      { who: 'pip', line: 'Thank you, Mia! You are a hero!', repeat: true },
    ],
  },
  {
    id: 'hc4-go-fish', kind: 'go-fish', bg: bgHQ, who: 'zippy', friendImg: HERO.zippy, title: 'Hero Bag Go Fish with Zippy!',
    teacher: 'Free: the student asks Zippy “Have you got a plaster?” — “Yes! Here you are.” or “No! Go fish!”. Then Zippy asks and the student answers truthfully: Yes, I have. / No, I haven’t. Go fish!',
    cards: [
      { label: 'plaster', img: HELP.plaster }, { label: 'tissue', img: HELP.tissue }, { label: 'toolbox', img: HELP.toolbox },
      { label: 'ladder', img: HELP.ladder }, { label: 'cape', img: HERO.cape }, { label: 'badge', img: HERO.badge },
      { label: 'phone', img: HELP.phone },
    ],
    childHand: ['plaster', 'tissue', 'toolbox', 'cape'],
    friendHand: ['plaster', 'ladder', 'badge'],
    pond: ['ladder', 'tissue', 'badge', 'toolbox', 'phone', 'cape', 'phone'],
    doneLine: 'Your hero bag is full! Super asking!',
  },
  {
    id: 'hc4-chat', kind: 'chat-chain', bg: sparkPage(9), partner: 'spark', title: 'Chat with Captain Spark',
    intro: 'Achoo! Hello, hero!',
    teacher: 'Guided: Captain Spark talks, the student picks the reply that fits and SAYS it, then taps “I said it”.',
    turns: [
      { who: 'spark', line: 'Achoo! Achoo!' },
      { who: 'student', line: 'What’s the matter?', wrong: ['What is it matter?', 'How old are you?'] },
      { who: 'spark', line: 'I’ve got a cold.' },
      { who: 'student', line: 'Can I help you?', wrong: ['Can you help I?', 'I can’t help.'] },
      { who: 'spark', line: 'Yes, please!' },
      { who: 'student', line: 'Here’s a tissue.', wrong: ['Here’s a box.', 'I’ve got a tissue cold.'] },
      { who: 'spark', line: 'Thank you! You are a real hero!' },
    ],
  },
  { id: 'hc4-echo-offer', kind: 'echo', bg: sparkPage(9), who: 'pip', textSide: 'top', teacher: 'Guided: say it with Pip — hold out your hand on “Here’s”!', word: 'Can I help you? Here’s some water!' },
  {
    id: 'hc4-which-help', kind: 'listen-tap', bg: bgSquare,
    teacher: 'You do (listening — the lesson’s evidence): a citizen says what’s wrong. Tap the best help, then offer it: Can I help you? Here’s a tissue!',
    targets: [
      { label: 'tissue', left: '18%', top: '55%', color: '#FE6A2F', img: HELP.tissue },
      { label: 'water', left: '39%', top: '55%', color: '#F59E0B', img: HELP.water },
      { label: 'plaster', left: '61%', top: '55%', color: '#FB923C', img: HELP.plaster },
      { label: 'toolbox', left: '82%', top: '55%', color: '#FEAF15', img: HELP.toolbox },
    ],
    rounds: [
      { prompt: 'Achoo! I’ve got a cold!', answerLabel: 'tissue', who: 'leo' },
      { prompt: 'Ouch! I’ve got a cut on my finger!', answerLabel: 'plaster', who: 'mia' },
      { prompt: 'My bike is broken!', answerLabel: 'toolbox', who: 'pip' },
      { prompt: 'I’ve got a headache. I’m hot!', answerLabel: 'water', who: 'leo' },
    ],
  },
  /* Reading: pages 8-9 */
  {
    id: 'hc4-reader', kind: 'reader', bg: bgSquare, title: 'Captain Spark Saves the Day', doneLine: 'The friends help Captain Spark! What happens next? See you next time!',
    teacher: 'Reading: first read pages 6-7 again quickly, then the new pages. Listen while the words light up, then the student reads. Tap any word to hear it.',
    pages: SPARK_STORY.slice(5, 9),
  },
  {
    id: 'hc4-read-match', kind: 'picture-match', look: 'polaroids', prompt: 'Read and match',
    teacher: 'Reading: read each sentence from the story and drag it under its picture. Then read it aloud.',
    items: [
      { word: 'I’ve got a cold.', img: sparkPage(8) },
      { word: 'Can I help you? Yes, please!', img: sparkPage(9) },
      { word: 'The friends wait.', img: sparkPage(7) },
    ],
    bg: bgSquare,
  },
  {
    id: 'hc4-flags', kind: 'flag-race', bg: bgSquare, who: 'spark', title: 'Team Flags: you vs your teacher',
    teacher: 'Team reading game, student vs teacher: on the student’s turn they read and answer; on the teacher’s turn the student READS the question to the teacher. Each right answer moves your flag up your hill. Nobody slides back.',
    rounds: [
      { ask: 'What’s the matter with Captain Spark?', choices: ['She’s got a cold.', 'She’s got a box.'], answer: 0 },
      { ask: 'Can Captain Spark fly today?', choices: ['Yes, she can.', 'No, she can’t.'], answer: 1 },
      { ask: 'What does Mia give her?', choices: ['A tissue.', 'A ladder.'], answer: 0 },
      { ask: 'What does Pip give her?', choices: ['A cake.', 'Some water.'], answer: 1 },
      { ask: 'Can I help you?', choices: ['Yes, please!', 'I’ve got a cold.'], answer: 0 },
      { ask: 'At the road, you must …', choices: ['run.', 'wait.'], answer: 1 },
    ],
    doneLine: 'Your flag is on the top! Super reading!',
  },
  /* Phonics: long a sort (ai / ay / a_e) → Crossword → Blend & Read → tongue twister */
  {
    id: 'hc4-sound-review', kind: 'sound-model', bg: bgSquare, who: 'pip', letter: 'ai ay a_e', phoneme: '/eɪ/', sound: 'ai', soundSide: 'center',
    teacher: 'Review: three ways to write /eɪ/! ai in the middle (rain), ay at the end (play), a_e with magic e (cape). Say each word and point to the letters.',
    anchors: [
      { word: 'rain', emoji: '\u{1F327}\u{FE0F}', img: item('rain') },
      { word: 'play', emoji: '\u{26BD}', img: item('ball-red') },
      { word: 'cape', emoji: '\u{1F9B8}', img: HERO.cape },
    ],
  },
  {
    id: 'hc4-crossword', kind: 'crossword', bg: bgHQ, who: 'zippy', title: 'Hero Crossword: ai, ay, a_e',
    teacher: 'Spelling game: tap a picture, then tap the letters to fill its squares. Crossing letters help! Say each word when it is done — is it ai, ay or a_e?',
    words: [
      { word: 'rain', img: item('rain'), say: 'Rain! ai in the middle.' },
      { word: 'train', img: item('train'), say: 'Train! ai in the middle.' },
      { word: 'tray', img: item('tray'), say: 'Tray! ay at the end.' },
      { word: 'cake', img: item('cake'), say: 'Cake! Magic e!' },
      { word: 'cape', img: HERO.cape, say: 'Cape! Magic e!' },
      { word: 'snail', img: item('snail'), say: 'Snail! ai in the middle.' },
    ],
    doneLine: 'You did the whole crossword!',
  },
  {
    id: 'hc4-blend', kind: 'sound-blend', bg: bgSquare, look: 'frog',
    teacher: 'Reading: say each sound, blend the word, find the picture — then read the sentence. ai, ay or a_e?',
    rounds: [
      { word: 'snail', sounds: ['s', 'n', 'ai', 'l'], img: item('snail'), sentence: 'The snail is slow.' },
      { word: 'tray', sounds: ['t', 'r', 'ay'], img: item('tray'), sentence: 'Here’s some water on a tray.' },
      { word: 'cake', sounds: ['c', 'a_e', 'k'], img: item('cake'), sentence: 'Can I help you make a cake?' },
    ],
  },
  { id: 'hc4-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgSquare, who: 'pip', focus: 'a', teacher: 'Reading: the unit’s tongue twister! Listen to Pip, then say it slow, faster — then hero speed!', line: 'Brave Jay may save the train in the rain.' },
  /* Free: help the teacher */
  {
    id: 'hc4-help-me', kind: 'join-stage', bg: bgHQ, teacher: 'Free: the teacher acts out a problem (sneeze, hold the head, a heavy bag…). The student asks, listens and offers help in their own words. Then swap!', cast: ['spark'],
    turns: [
      { who: 'spark', line: 'Ouch! Oh dear…' },
      { who: 'student', line: 'What’s the matter?' },
      { who: 'spark', line: 'I’ve got a headache.' },
      { who: 'student', line: 'Can I help you? Here’s … / I can … .' },
      { who: 'spark', line: 'Yes, please! Thank you, hero!' },
    ],
  },
  { id: 'hc4-i-can', kind: 'meet', focus: ['matter', 'help'], bg: sparkPage(9), who: 'spark', cardSide: 'left', teacher: 'Check: the student helps 4 citizens (asks, understands and offers the right help). Teach-back: the student says the steps — ask What’s the matter?, listen, offer Can I help you?', line: 'You can ask what’s the matter — and you can help!', repeat: 'What’s the matter? Can I help you?' },
  {
    id: 'hc4-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Hero City sticker in their Sticker Book.',
    scene: {
      id: 'hc4-sticker', kind: 'sticker-reward', bg: bgSquare, who: 'pip', teacher: 'Sticker time!',
      line: 'Kind hero! Here is your sticker.',
      sticker: { img: HERO.sparkCheer, label: 'City hero' },
    },
  },
  petPal('hc4-pet-pal', 3, 'Ouch! I’ve got a cut on my paw! I want a plaster!', [{ label: 'plaster', img: HELP.plaster }, { label: 'toolbox', img: HELP.toolbox }, { label: 'cake', img: item('cake') }], 0, 'A plaster! Thank you! I feel better!'),
  {
    id: 'hc4-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'hc4-home-mission', kind: 'home-mission', bg: bgSquare, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned to ask "What\'s the matter?", to understand "I\'ve got a headache / a cold" and to offer help: "Can I help you?". This week, pretend to have a small problem and let your child ask and help you in English.',
      steps: [
        { emoji: '\u{2753}', say: 'Ask someone at home: What’s the matter?' },
        { emoji: '\u{1F64B}', say: 'Offer help: Can I help you?' },
        { emoji: '\u{1F91D}', say: 'Help with one thing today!' },
      ],
    },
  },
  goodbyeSong('hc4-goodbye-song', bgSquare),
  { id: 'hc4-finale', kind: 'finale', bg: sparkPage(9), who: 'spark', line: 'You are a real hero! See you in Hero City! \u{1F9B8}' },
];

/* =============================================================================
 * A1 Unit 7 Lesson 5: "Storybook: Captain Spark Saves the Day"
 * Objective: I can follow a hero story and say who helped and how.
 * Story frame: the whole book, read in the golden bell-tower park (late afternoon sun); at the pause the child chooses
 *   the plan to save the kitten — and says why (Mia can climb well!).
 * Practice ladder: Revise (Remember? L4 problems) → Predict → the story words → Read and Match → Reader p1-10 (pages
 *   the child knows are read ALONE) → the pause (branching choice) → Reader p11-12 → Story Order (retell) → Jigsaw →
 *   Who is missing? → Hero Clues (tile reveal) → Build the Tower (story questions) → act it out → Phonics review (Sound
 *   Pop: ai / ay / a_e) → Blend & Read → twister → Free (retell, talk with Captain Spark) → check.
 * Story GIFs (Canva) only after a written scenario, a preview GIF and the owner's OK — still pictures until then.
 * ========================================================================= */

export const LESSON_A1U7L5_TITLE = 'Storybook: Captain Spark Saves the Day';
export const LESSON_A1U7L5_OBJECTIVE = 'I can follow a hero story and say who helped and how.';

export const LESSON_A1U7L5_SCENES: Scene[] = [
  { id: 'hc5-title', kind: 'title-card', bg: sparkPage(10), level: 'A1', unit: 'Unit 7', lessonLabel: 'Lesson 5', title: 'Captain Spark Saves the Day', subtitle: 'Read the whole hero story!', cta: '\u{1F4D6} LET’S READ!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 4 — what's the matter? Click mode: the citizens' pictures.
    id: 'hc5-recall-warmup', kind: 'recall-warmup', bg: bgSquare, who: 'pip', mode: 'click',
    fromLabel: 'Lesson 4 · Can I Help You?',
    teacher: 'Guided: Pip says what’s wrong — the student finds the person and offers help: Can I help you? Here’s a tissue!',
    items: [
      { word: 'headache', say: 'I’ve got a headache.', img: CIT.headache },
      { word: 'cold', say: 'I’ve got a cold.', img: CIT.cold },
      { word: 'toothache', say: 'I’ve got toothache.', img: CIT.toothache },
      { word: 'bags', say: 'My bags are heavy.', img: CIT.bags },
    ],
  },
  { id: 'hc5-predict', kind: 'meet', focus: ['tower', 'kitten'], bg: sparkPage(10), who: 'mia', cardSide: 'right', teacher: 'Predict (I do): look at the tower — a kitten at the top! Captain Spark can’t fly today. Ask: Who can help? Leo? Mia? Biscuit? Let the student guess — we find out in the story!', line: 'Look! A kitten on the tower! Who can help?', repeat: 'Who can help?' },
  {
    id: 'hc5-story-words', kind: 'prea1', teacher: 'Present (I do → we do): the new story words. Point, say, act: climb with your hands, hold a ladder, cuddle a kitten.',
    scene: {
      id: 'hc5-story-words', kind: 'listen-repeat-cards', bg: bgTower, teacher: 'New story words — listen and say!',
      cards: [
        { who: 'mia', sentence: 'the tower', img: sparkPage(10), imgLabel: 'tower' },
        { who: 'mia', sentence: 'a kitten', img: HERO.kitten, imgLabel: 'kitten' },
        { who: 'leo', sentence: 'a ladder', img: HERO.ladder, imgLabel: 'ladder' },
        { who: 'pip', sentence: 'She can climb well.', img: HERO.miaClimb, imgLabel: 'climb' },
        { who: 'pip', sentence: 'We can all be heroes!', img: HERO.sparkCheer, imgLabel: 'heroes' },
      ],
    },
  },
  { id: 'hc5-echo', kind: 'echo', bg: sparkPage(10), who: 'mia', textSide: 'top', teacher: 'Guided (we do): say it like Mia — worried, then brave!', word: 'The kitten is on the tower! Who can help?' },
  {
    id: 'hc5-match', kind: 'picture-match', look: 'polaroids', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its picture (or taps the sentence, then the picture), then reads it aloud.',
    items: [
      { word: 'a kitten', img: HERO.kitten },
      { word: 'a ladder', img: HERO.ladder },
      { word: 'She can climb well.', img: HERO.miaClimb },
      { word: 'He can lift it.', img: HERO.leoLift },
      { word: 'She can fly fast.', img: HERO.sparkFly },
    ],
    bg: bgTower,
  },
  {
    id: 'hc5-reader-1', kind: 'reader', bg: sparkPage(1), title: 'Captain Spark Saves the Day', doneLine: 'The kitten is on the tower! Who can help? Let’s think!',
    teacher: 'Reading: pages 1-10 — the student reads pages they know ALONE (🔊 only for help). Evidence: 4 pages read alone.',
    pages: SPARK_STORY.slice(0, 10),
  },
  {
    id: 'hc5-pause', kind: 'choice', bg: sparkPage(10), who: 'spark', teacher: 'Pause (branching choice — the child chooses Captain Spark’s plan): who can save the kitten? The student chooses and SAYS why: Mia! She can climb well! (Leo can lift, but he can’t climb the tower; Biscuit can swim, but the kitten isn’t in the water.)',
    prompt: 'Who can save the kitten?',
    options: [
      { label: 'Mia — she can climb well!', emoji: '\u{1F42D}', correct: true },
      { label: 'Biscuit — he can swim well!', emoji: '\u{1F436}' },
      { label: 'Pip — he can’t climb well.', emoji: '\u{1F98A}' },
    ],
  },
  {
    id: 'hc5-reader-2', kind: 'reader', bg: sparkPage(11), title: 'Captain Spark Saves the Day — the end', doneLine: 'The end! You read the whole story!',
    teacher: 'Reading: the last two pages. The student reads alone first; 🔊 only for help.',
    pages: SPARK_STORY.slice(10, 12),
  },
  { id: 'hc5-thanks', kind: 'meet', focus: ['heroes'], bg: sparkPage(12), who: 'spark', cardSide: 'left', teacher: 'Guided: Captain Spark thanks everyone. Ask: Who climbed? (Mia) Who held the ladder? (Leo and Pip) What did they find? (the compass piece!)', line: 'Thank you, friends! Mia can climb well. Leo and Pip help. We can all be heroes!', repeat: 'We can all be heroes!' },
  { id: 'hc5-echo-2', kind: 'echo', bg: sparkPage(12), who: 'pip', textSide: 'top', teacher: 'Guided: say the last line with Pip — arms up like a hero!', word: 'We can all be heroes! Hooray!' },
  { id: 'hc5-echo-3', kind: 'echo', bg: sparkPage(11), who: 'leo', textSide: 'top', teacher: 'Guided: say who helped — climb with your hands on “Mia”, hold the ladder on “Leo and Pip”!', word: 'Mia can climb well. Leo and Pip help.' },
  {
    id: 'hc5-read-match', kind: 'picture-match', look: 'frames', prompt: 'Read and match',
    teacher: 'Reading: read each sentence from the story and drag it under its picture. Then read it aloud.',
    items: [
      { word: 'The kitten is on the tower!', img: sparkPage(10) },
      { word: 'Leo and Pip help.', img: sparkPage(11) },
      { word: 'We can all be heroes!', img: sparkPage(12) },
      { word: 'She can fly fast!', img: sparkPage(2) },
    ],
    bg: bgTower,
  },
  {
    id: 'hc5-story-order', kind: 'prea1', teacher: 'Guided: put the story pictures in order, then retell it: first, then, then, at the end! Evidence: retells 3 pictures.',
    scene: {
      id: 'hc5-story-order', kind: 'story-order', bg: bgTower, who: 'pip', teacher: 'Put the pictures in order, then tell the story!',
      frames: [
        { img: sparkPage(2), caption: 'Captain Spark can fly fast.' },
        { img: sparkPage(4), caption: 'Leo can lift the box.' },
        { img: sparkPage(8), caption: 'Captain Spark has got a cold.' },
        { img: sparkPage(11), caption: 'Mia can climb well.' },
        { img: sparkPage(12), caption: 'We can all be heroes!' },
      ],
    },
  },
  { id: 'hc5-jigsaw', kind: 'jigsaw-puzzle', bg: bgTower, teacher: 'Build the story picture — then read its page: Mia can climb well. Leo and Pip help.', image: sparkPage(11), rows: 2, cols: 3 },
  {
    id: 'hc5-whos-missing', kind: 'whats-missing', bg: bgTower, title: 'Who is missing?',
    teacher: 'Guided: look at the story heroes — one flies away! Say who is missing and what they can do: Mia is missing. She can climb well!',
    rounds: [
      { items: [{ word: 'Mia', img: HERO.miaClimb }, { word: 'Leo', img: HERO.leoLift }, { word: 'Biscuit', img: HERO.biscuitSwim }, { word: 'Captain Spark', img: HERO.sparkFly }], missing: 0 },
      { items: [{ word: 'Zippy', img: HERO.zippy }, { word: 'Pip', img: HERO.pipHigh }, { word: 'the kitten', img: HERO.kitten }, { word: 'Leo', img: HERO.leoFast }], missing: 2 },
    ],
  },
  {
    id: 'hc5-clues', kind: 'prea1', teacher: 'Guided: Hero Clues! Who is it in the story? Tiles open one by one — the student listens to the story clue and guesses early, then says the story sentence.',
    scene: {
      id: 'hc5-clues', kind: 'tile-reveal', bg: bgTower, who: 'pip',
      teacher: 'Who is it in the story? Guess early!',
      rounds: [
        { img: HERO.sparkCold, word: 'Captain Spark', line: 'She can fly fast. Today she has got a cold. Who is it?', options: [{ label: 'Mia', img: HERO.mia }, { label: 'Captain Spark', img: HERO.spark }, { label: 'Zippy', img: HERO.zippy }] },
        { img: HERO.leoLift, word: 'Leo', line: 'He is strong. He can lift the box. Who is it?', options: [{ label: 'Leo', img: HERO.leo }, { label: 'Pip', img: HERO.pip }, { label: 'Biscuit', img: item('dog') }] },
        { img: HERO.biscuitSwim, word: 'Biscuit', line: 'He can swim well. He saves the boat. Who is it?', options: [{ label: 'Zippy', img: HERO.zippy }, { label: 'Biscuit', img: item('dog') }, { label: 'Mia', img: HERO.mia }] },
      ],
    },
  },
  {
    id: 'hc5-tower', kind: 'world-builder', bg: bgTower, who: 'spark', title: 'Build the Hero Park!',
    teacher: 'Guided: story questions — every right answer builds a piece of the hero park by the tower. Say the answer aloud — then name the new piece!',
    pieces: [
      { label: 'ladder', img: HERO.ladder, x: 30, y: 58, size: 12 },
      { label: 'bench', img: item('bench'), x: 62, y: 74, size: 14 },
      { label: 'cape', img: HERO.cape, x: 80, y: 55, size: 10 },
      { label: 'badge', img: HERO.badge, x: 14, y: 70, size: 8 },
      { label: 'kitten', img: HERO.kitten, x: 46, y: 72, size: 9 },
      { label: 'Zippy', img: HERO.zippy, x: 50, y: 28, size: 10 },
    ],
    rounds: [
      { ask: 'Who can fly fast?', choices: ['Captain Spark can.', 'Pip can.'], answer: 0 },
      { ask: 'Can Pip lift the box?', choices: ['Yes, he can.', 'No, he can’t.'], answer: 1 },
      { ask: 'At the road, you must …', choices: ['wait.', 'run.'], answer: 0 },
      { ask: 'What’s the matter with Captain Spark?', choices: ['She’s got a cold.', 'She’s got a box.'], answer: 0 },
      { ask: 'Who climbs the tower?', choices: ['Biscuit.', 'Mia.'], answer: 1 },
      { ask: 'Who can be a hero?', choices: ['We can all be heroes!', 'Only Zippy.'], answer: 0 },
    ],
    doneLine: 'The hero park is ready! You know the whole story!',
  },
  {
    id: 'hc5-act-out', kind: 'join-stage', bg: sparkPage(11), teacher: 'Guided: act it out! The student is Mia and says her lines; the teacher is Captain Spark. Then swap.', cast: ['spark', 'mia'],
    turns: [
      { who: 'spark', line: 'Achoo! The kitten is on the tower! I can’t fly today.' },
      { who: 'student', line: 'I can help! I can climb well!' },
      { who: 'spark', line: 'Leo and Pip, can you hold the ladder?' },
      { who: 'student', line: 'Here’s the kitten! It’s safe!' },
      { who: 'spark', line: 'Thank you, Mia! We can all be heroes!' },
    ],
  },
  /* Phonics review: Sound Pop (ai / ay / a_e) → Blend & Read → twister */
  {
    id: 'hc5-sound-pop', kind: 'prea1', teacher: 'Reading (review of the unit sounds; creative idea: hero badges pop up over the city — catch the ones with the long a sound): pop every word with /eɪ/ — ai, ay or a_e — and say it.',
    scene: {
      id: 'hc5-sound-pop', kind: 'sound-pop', bg: bgTower, who: 'pip', goal: 6, seconds: 60,
      teacher: 'Pop the words with the long a sound!',
      targets: [{ letter: 'ai', phoneme: '/eɪ/' }],
      items: [
        { word: 'rain', letter: 'ai', img: item('rain'), emoji: '\u{1F327}\u{FE0F}' },
        { word: 'tray', letter: 'ai', img: item('tray'), emoji: '\u{1F37D}\u{FE0F}' },
        { word: 'cape', letter: 'ai', img: HERO.cape, emoji: '\u{1F9B8}' },
        { word: 'snail', letter: 'ai', img: item('snail'), emoji: '\u{1F40C}' },
        { word: 'cake', letter: 'ai', img: item('cake'), emoji: '\u{1F382}' },
        { word: 'train', letter: 'ai', img: item('train'), emoji: '\u{1F682}' },
        { word: 'cat', letter: 'a', img: item('cat'), emoji: '\u{1F431}' },
        { word: 'hat', letter: 'a', img: item('hat'), emoji: '\u{1F452}' },
        { word: 'pen', letter: 'e', img: item('pen'), emoji: '\u{1F58A}\u{FE0F}' },
      ],
    },
  },
  {
    id: 'hc5-blend', kind: 'sound-blend', bg: sparkPage(12), look: 'train',
    teacher: 'Reading: blend the story words — then read the whole sentence from the story!',
    rounds: [
      { word: 'day', sounds: ['d', 'ay'], img: item('sun'), sentence: 'It is a sunny day.' },
      { word: 'save', sounds: ['s', 'a_e', 'v'], img: HERO.biscuitSwim, sentence: 'He can save the boat.' },
      { word: 'wait', sounds: ['w', 'ai', 't'], img: RULE.wait, sentence: 'The friends wait.' },
    ],
  },
  { id: 'hc5-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: sparkPage(12), who: 'spark', focus: 'a', teacher: 'Reading: the story twister! Listen to Captain Spark, then say it slow, faster — then hero speed!', line: 'Brave Mia may save the kitten today.' },
  {
    id: 'hc5-retell', kind: 'join-stage', bg: sparkPage(12), teacher: 'Free: the student tells the story to Pip with the pictures — 3 pictures at least (first, then, at the end). Pip only asks; the student tells.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'Tell me the story! What happens first?' },
      { who: 'student', line: 'First, Captain Spark can fly fast …' },
      { who: 'pip', line: 'And then?' },
      { who: 'student', line: 'Then she has got a cold … Mia can climb well …' },
      { who: 'pip', line: 'And at the end?' },
      { who: 'student', line: 'We can all be heroes!' },
    ],
  },
  {
    id: 'hc5-talk-spark', kind: 'join-stage', bg: sparkPage(2), teacher: 'Free: a mini-conversation with Captain Spark — the student answers about the story and about themselves.', cast: ['spark'],
    turns: [
      { who: 'spark', line: 'Who is your favourite hero in the story?' },
      { who: 'student', line: 'My favourite hero is … . He / She can … !' },
      { who: 'spark', line: 'And you? How can you help at home?' },
      { who: 'student', line: 'I can … !' },
      { who: 'spark', line: 'You are a hero too!' },
    ],
  },
  { id: 'hc5-i-can', kind: 'meet', focus: ['story'], bg: sparkPage(12), who: 'spark', cardSide: 'left', teacher: 'Check: the student read 4 pages alone, chose Mia at the pause and said why, and retold 3 pictures — then the hero badge!', line: 'You can read the whole story and say who helped — super reader!', repeat: 'I can read the hero story.' },
  {
    id: 'hc5-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Hero City sticker in their Sticker Book.',
    scene: {
      id: 'hc5-sticker', kind: 'sticker-reward', bg: sparkPage(12), who: 'pip', teacher: 'Sticker time!',
      line: 'Super reader! Here is your sticker.',
      sticker: { img: HERO.miaClimb, label: 'Story hero' },
    },
  },
  petPal('hc5-pet-pal', 4, 'I want a friend from the story! I want the kitten!', [{ label: 'kitten', img: HERO.kitten }, { label: 'ladder', img: HERO.ladder }, { label: 'box', img: HERO.bigBox }], 0, 'A kitten friend! Woof! Thank you!'),
  {
    id: 'hc5-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'hc5-home-mission', kind: 'home-mission', bg: sparkPage(12), who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child read the whole story "Captain Spark Saves the Day" and chose who could save the kitten. This week, let your child tell you the story with the pictures (first, then, at the end).',
      steps: [
        { emoji: '\u{1F4D6}', say: 'Tell the story with the pictures.' },
        { emoji: '\u{1F431}', say: 'Who saves the kitten? Say why!' },
        { emoji: '\u{1F9B8}', say: 'Say: We can all be heroes!' },
      ],
    },
  },
  goodbyeSong('hc5-goodbye-song', sparkPage(12)),
  { id: 'hc5-finale', kind: 'finale', bg: sparkPage(12), who: 'spark', line: 'You read the whole hero story! See you next time! \u{1F4D6}' },
];

/* =============================================================================
 * A1 Unit 7 Lesson 6: "Extra Practice: Hero Mission Match!"
 * Objective: I can use abilities, help and rules quickly and correctly.
 * Story frame: Hero HQ game day (a sunny hall over the golden city) — a hero badge for every game won (achievements).
 * Games (different from L1-L5, accuracy before speed): Simon Says (hero rules), Hero Jeopardy (quiz board), Hero
 * Dominoes, Hero Memory, Hero Tic-Tac-Toe, Save the Balloon, Pass the Present, Echo Cave, Hero Chests, Rapid Recall,
 * Twister Race, Blend & Read, the child as Captain Spark, free talk with Zippy.
 * ========================================================================= */

export const LESSON_A1U7L6_TITLE = 'Extra Practice: Hero Mission Match!';
export const LESSON_A1U7L6_OBJECTIVE = 'I can use abilities, help and rules quickly and correctly.';

export const LESSON_A1U7L6_SCENES: Scene[] = [
  { id: 'hc6-title', kind: 'title-card', bg: bgHQ, level: 'A1', unit: 'Unit 7', lessonLabel: 'Lesson 6', title: 'Hero Mission Match!', subtitle: 'Win a hero badge in every game!', cta: '\u{1F3C5} GAME DAY!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 5 — the story. Shadow mode: the story heroes have clearly different outlines.
    id: 'hc6-recall-warmup', kind: 'recall-warmup', bg: bgHQ, who: 'pip', mode: 'shadow',
    fromLabel: 'Lesson 5 · Captain Spark Saves the Day',
    teacher: 'Guided: Pip says a line from the story — the student finds the hero’s shadow and says the line again.',
    items: [
      { word: 'Captain Spark', say: 'She can fly fast!', img: HERO.sparkFly },
      { word: 'Leo', say: 'Leo can lift the box!', img: HERO.leoLift },
      { word: 'Biscuit', say: 'Biscuit can swim well.', img: HERO.biscuitSwim },
      { word: 'Mia', say: 'Mia can climb well.', img: HERO.miaClimb },
      { word: 'Zippy', say: 'Stop! You must wait.', img: HERO.zippyStop },
    ],
  },
  { id: 'hc6-meet', kind: 'meet', focus: ['hero'], bg: bgHQ, who: 'spark', cardSide: 'left', teacher: 'Present: Captain Spark is better — today is game day at Hero HQ! Every game won = a hero badge. Remind the student: right first, fast later.', line: 'I feel better! Welcome to Hero HQ — let’s play hero games!', repeat: 'Let’s play hero games!' },
  { id: 'hc6-rules', kind: 'meet', focus: ['can', 'must'], bg: bgHQ, who: 'zippy', cardSide: 'right', teacher: 'The rules of the unit (say them, the student repeats each): I can … fast / well. Can you …? No, I can’t, but … can. You must / mustn’t … . What’s the matter? Can I help you?', line: 'I can run fast. Can you fly? You must help. Can I help you?', repeat: 'can · must · Can I help you?' },
  {
    id: 'hc6-simon', kind: 'prea1', teacher: 'Simon Says — hero rules! Only move when Captain Spark says “Simon says”. No Simon? Freeze — and say why: You mustn’t!',
    scene: {
      id: 'hc6-simon', kind: 'tpr-actions', mode: 'learn', bg: bgHQ, who: 'leo', teacher: 'Simon says… do it! No Simon? Freeze!',
      rounds: [
        { line: 'Simon says: you must jump high!', emoji: '\u{1F998}', img: HERO.pipHigh },
        { line: 'Simon says: run fast on the spot!', emoji: '\u{1F3C3}', img: HERO.leoFast },
        { line: 'Shout very loudly! … No! You mustn’t shout!', emoji: '\u{1F910}', img: RULE.shout },
        { line: 'Simon says: you must wait — stand still!', emoji: '\u{1F6A6}', img: RULE.wait },
        { line: 'Simon says: swim well with your arms!', emoji: '\u{1F3CA}', img: HERO.biscuitSwim },
        { line: 'Run on the road! … No! You mustn’t!', emoji: '\u{1F6AB}', img: RULE.runRoad },
        { line: 'Simon says: fly fast like Captain Spark!', emoji: '\u{1F9B8}', img: HERO.sparkFly },
      ],
    },
  },
  {
    id: 'hc6-match', kind: 'picture-match', look: 'portholes', prompt: 'Read and match',
    teacher: 'Read and match (warm-up): the student reads each sentence and drags it under its picture, then reads it aloud.',
    items: [
      { word: 'He can run fast.', img: HERO.leoFast },
      { word: 'You mustn’t run on the road.', img: RULE.runRoad },
      { word: 'I’ve got a cold.', img: HERO.sparkCold },
      { word: 'You must wait.', img: RULE.wait },
      { word: 'She can climb well.', img: HERO.miaClimb },
    ],
    bg: bgHQ,
  },
  {
    id: 'hc6-jeopardy', kind: 'quiz-board', bg: bgHQ, who: 'spark', title: 'Hero Jeopardy!',
    teacher: 'Game: the student picks any tile — harder questions are worth more points. Answer, then say it aloud. One tile is Zippy’s bonus: double points!',
    categories: [
      { name: 'Powers', emoji: '\u{1F4AA}', tiles: [{ ask: 'What can he do?', choices: ['He can run fast.', 'He can fly.'], answer: 0, img: HERO.leoFast }, { ask: 'Can Mia climb well?', choices: ['Yes, she can.', 'No, she can’t.'], answer: 0, img: HERO.miaClimb }, { ask: 'Pip can’t lift it…', choices: ['but Leo can!', 'and Leo can’t.'], answer: 0, img: HERO.pipTry }] },
      { name: 'Rules', emoji: '\u{1F6A6}', tiles: [{ ask: 'Red light! You must …', choices: ['stop.', 'run.'], answer: 0, img: RULE.light }, { ask: 'You … shout.', choices: ['mustn’t', 'must'], answer: 0, img: RULE.shout }, { ask: 'You must … your friends.', choices: ['help', 'shout at'], answer: 0, img: RULE.help }] },
      { name: 'Help', emoji: '\u{1F91D}', tiles: [{ ask: 'Achoo!', choices: ['What’s the matter?', 'How old are you?'], answer: 0, img: CIT.cold }, { ask: 'I’ve got a cold.', choices: ['Here’s a tissue.', 'Here’s a cake.'], answer: 0 }, { ask: 'My bags are heavy!', choices: ['Can I help you?', 'Can you fly?'], answer: 0, img: CIT.bags }] },
      { name: 'Story', emoji: '\u{1F4D6}', tiles: [{ ask: 'Who can fly fast?', choices: ['Captain Spark.', 'Biscuit.'], answer: 0, img: sparkPage(2) }, { ask: 'Who saves the boat?', choices: ['Biscuit.', 'Pip.'], answer: 0, img: sparkPage(5) }, { ask: 'Who climbs the tower?', choices: ['Mia.', 'Zippy.'], answer: 0, img: sparkPage(11) }] },
    ],
    boom: [2, 1],
    doneLine: 'The board is finished! Hero Jeopardy champion!',
  },
  {
    id: 'hc6-dominoes', kind: 'dominoes', bg: bgHQ, who: 'pip', title: 'Hero Dominoes!',
    teacher: 'Reading: look at the picture at the end of the chain — find the domino that talks about it, read it aloud and play it.',
    start: { img: HERO.leoFast, label: 'Leo running' },
    steps: [
      { text: 'Leo can run fast.', img: HERO.miaClimb, label: 'Mia climbing' },
      { text: 'Mia can climb well.', img: HERO.biscuitSwim, label: 'Biscuit swimming' },
      { text: 'Biscuit can swim well.', img: RULE.wait, label: 'waiting' },
      { text: 'You must wait.', img: HERO.sparkCold, label: 'Captain Spark' },
      { text: 'What’s the matter? I’ve got a cold.', img: HERO.sparkCheer, label: 'cheering' },
      { text: 'We can all be heroes!', img: HERO.badge, label: 'badge' },
    ],
    doneLine: 'The chain is finished! Super hero sentences!',
  },
  {
    id: 'hc6-memory', kind: 'memory', bg: bgHQ, teacher: 'Find the sentence and its picture! Say the sentence to keep the pair.',
    pairs: [
      { id: 'run', label: 'He can run fast.', emoji: '\u{1F3C3}', img: HERO.leoFast },
      { id: 'climb', label: 'She can climb well.', emoji: '\u{1F9D7}', img: HERO.miaClimb },
      { id: 'wait', label: 'You must wait.', emoji: '\u{1F6A6}', img: RULE.wait },
      { id: 'shout', label: 'You mustn’t shout.', emoji: '\u{1F910}', img: RULE.shout },
      { id: 'cold', label: 'I’ve got a cold.', emoji: '\u{1F927}', img: HERO.sparkCold },
      { id: 'lift', label: 'He can lift it.', emoji: '\u{1F4AA}', img: HERO.leoLift },
    ],
  },
  helloSong('hc6-hello-song', bgHQ),
  {
    id: 'hc6-tic-tac-toe', kind: 'tic-tac-toe', bg: bgHQ, who: 'zippy', opponentImg: HERO.zippy, title: 'Hero Tic-Tac-Toe with Zippy!',
    teacher: 'Game: the student answers to claim a square — then Zippy takes one. Three in a row wins!',
    squares: [
      { ask: 'Can you swim well?', choices: ['Yes, I can. / No, I can’t.', 'Yes, I swim can.', 'I am swim.'], answer: 0 },
      { ask: 'Can Pip lift the box?', choices: ['No, he can’t, but Leo can!', 'Yes, he lift.', 'Pip is box.'], answer: 0, img: HERO.pipTry },
      { ask: 'At the road, you must …', choices: ['wait.', 'run.', 'shout.'], answer: 0 },
      { ask: 'I’ve got a headache.', choices: ['Can I help you?', 'Can you fly?', 'Hooray!'], answer: 0, img: CIT.headache },
      { ask: 'You … drop paper.', choices: ['mustn’t', 'must', 'can'], answer: 0, img: RULE.litter },
      { ask: 'What can you do well?', choices: ['I can climb well.', 'I well climb.', 'I can well.'], answer: 0 },
      { ask: 'Can I help you?', choices: ['Yes, please!', 'Yes, I can’t.', 'Help is.'], answer: 0 },
      { ask: 'Captain Spark can fly …', choices: ['fast.', 'well fast.', 'slowly fast.'], answer: 0, img: HERO.sparkFly },
      { ask: 'What’s the matter?', choices: ['I’ve got toothache.', 'I can run.', 'Yes, please.'], answer: 0, img: CIT.toothache },
    ],
    doneLine: 'Three in a row! Hero champion!',
  },
  {
    id: 'hc6-balloon', kind: 'save-balloon', bg: bgSquare, who: 'pip', balloonImg: HERO.zippy, title: 'Save Zippy! Spell the hero word!',
    teacher: 'Reading: listen to the sentence, look at the picture — tap the letters to spell the word. Every right letter lifts Zippy over the city!',
    rounds: [
      { word: 'help', img: RULE.help, sentence: 'You must help.' },
      { word: 'fast', img: HERO.leoFast, sentence: 'Leo can run fast.' },
      { word: 'cape', img: HERO.cape, sentence: 'Captain Spark has got a cape.' },
      { word: 'wait', img: RULE.wait, sentence: 'You must wait at the road.' },
    ],
    doneLine: 'Zippy is over the city! Super spelling!',
  },
  {
    id: 'hc6-parcel', kind: 'pass-parcel', bg: bgHQ, who: 'spark', title: 'Pass the Hero Present!',
    teacher: 'Guided: every right answer tears one layer off the present. What is inside?',
    rounds: [
      { ask: 'Can you help?', choices: ['Yes, I can!', 'Yes, I do.', 'Help can.'], answer: 0 },
      { ask: 'Achoo! I’ve got a cold.', choices: ['Here’s a tissue.', 'Here’s a box.', 'Run fast!'], answer: 0, img: CIT.cold },
      { ask: 'You mustn’t …', choices: ['run on the road.', 'help.', 'wait.'], answer: 0 },
      { ask: 'Who can climb well?', choices: ['Mia can.', 'Biscuit can.', 'The box can.'], answer: 0 },
    ],
    prize: { img: HERO.badge, label: 'a golden hero badge' },
    doneLine: 'A golden hero badge! It’s for you!',
  },
  {
    id: 'hc6-echo-cave', kind: 'echo-cave', bg: bgHQ, who: 'spark', title: 'Hero Echo: who needs help?',
    teacher: 'Game: a friend calls from a door — left, middle or right (speakers or headphones help). The student taps where the voice came from and offers help: Can I help you, Pip?',
    rounds: [
      { voice: 'pip', img: HERO.pip, at: 0, line: 'Help! I can’t lift the box!', reply: 'Can I help you, Pip? Leo can lift it!' },
      { voice: 'mia', img: HERO.mia, at: 2, line: 'Achoo! I’ve got a cold!', reply: 'Can I help you, Mia? Here’s a tissue!' },
      { voice: 'leo', img: HERO.leo, at: 1, line: 'Ouch! I’ve got a headache!', reply: 'Can I help you, Leo? Here’s some water!' },
      { voice: 'spark', img: HERO.spark, at: 2, line: 'The kitten is on the tower!', reply: 'Mia can climb well! She can help!' },
    ],
    doneLine: 'You found every voice — and helped them all!',
  },
  {
    id: 'hc6-chests', kind: 'chest-quest', bg: bgHQ, who: 'zippy', title: 'Hero Chests!', goal: 60,
    teacher: 'Guided: every right answer opens a hero chest and the badges fill the jar. Can we reach 60?',
    rounds: [
      { ask: 'Can a fish run?', choices: ['No, it can’t.', 'Yes, it can.'], answer: 0, img: item('fish'), prizes: ['10', '20', '⭐'] },
      { ask: 'What’s the matter with Grandpa Joe?', choices: ['He’s got a cold.', 'He can fly.'], answer: 0, img: CIT.cold, prizes: ['20', '×2', '10'] },
      { ask: 'Red light!', choices: ['You must stop.', 'You must run.'], answer: 0, img: RULE.light, prizes: ['10', '20', '×2'] },
      { ask: 'Can Pip lift it?', choices: ['No, he can’t, but Leo can.', 'Yes, he is.'], answer: 0, img: HERO.pipTry, prizes: ['⭐', '10', '20'] },
    ],
    doneLine: 'Look at the jar! Super hero answers!',
  },
  {
    id: 'hc6-rapid', kind: 'prea1', teacher: 'Rapid Recall: a picture flashes — say the hero sentence before the ring closes! Right first, then fast.',
    scene: {
      id: 'hc6-rapid', kind: 'rapid-recall', bg: bgHQ, who: 'pip', seconds: 4,
      teacher: 'Say it before the ring closes!',
      cards: [
        { img: HERO.leoFast, word: 'run fast', say: 'He can run fast!' },
        { img: HERO.miaClimb, word: 'climb well', say: 'She can climb well!' },
        { img: RULE.wait, word: 'wait', say: 'You must wait!' },
        { img: RULE.shout, word: 'shout', say: 'You mustn’t shout!' },
        { img: HERO.sparkCold, word: 'a cold', say: 'I’ve got a cold!' },
        { img: HERO.biscuitSwim, word: 'swim well', say: 'He can swim well!' },
      ],
    },
  },
  { id: 'hc6-echo', kind: 'echo', bg: bgHQ, who: 'zippy', textSide: 'top', teacher: 'Guided: a question chain — the student asks, the teacher answers, then swap. Faster each time!', word: 'Can you fly? No, I can’t, but Captain Spark can!' },
  /* Reading */
  {
    id: 'hc6-reader', kind: 'reader', bg: sparkPage(4), title: 'Captain Spark Saves the Day — read and ask', doneLine: 'Great reading! Great questions!',
    teacher: 'Reading: the student reads pages 4-6 alone, then ASKS the teacher one question about each page (Can Pip lift the box? What must you do?).',
    pages: SPARK_STORY.slice(3, 6),
  },
  /* Phonics: twister race → Blend & Read */
  { id: 'hc6-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgHQ, who: 'pip', focus: 'a', teacher: 'Twister Race: say the unit twister at all three speeds — can you beat Pip?', line: 'Brave Jay may save the train in the rain.' },
  {
    id: 'hc6-blend', kind: 'sound-blend', bg: bgHQ, look: 'slide',
    teacher: 'Reading: blend each word, find the picture — then read the sentence fast!',
    rounds: [
      { word: 'tail', sounds: ['t', 'ai', 'l'], img: item('tail'), sentence: 'Pip has got an orange tail.' },
      { word: 'say', sounds: ['s', 'ay'], img: HERO.sparkPoint, sentence: 'Captain Spark can say the rules.' },
      { word: 'brave', sounds: ['b', 'r', 'a_e', 'v'], img: HERO.sparkCheer, sentence: 'Heroes are brave and kind.' },
    ],
  },
  /* Free */
  {
    id: 'hc6-be-spark', kind: 'join-stage', bg: bgHQ, teacher: 'Free: the student is Captain Spark! They ask Zippy (the teacher) about the city: what’s wrong, who can help, and give a rule.', cast: ['zippy'],
    turns: [
      { who: 'zippy', line: 'Beep! Captain Spark! A grandma has got heavy bags!' },
      { who: 'student', line: 'Who can help? … can carry the bags!' },
      { who: 'zippy', line: 'Beep! A boy wants to run on the road!' },
      { who: 'student', line: 'Stop! You mustn’t run on the road!' },
      { who: 'zippy', line: 'Super hero! Beep beep!' },
    ],
  },
  {
    id: 'hc6-talk-zippy', kind: 'join-stage', bg: bgHQ, teacher: 'Free: a mini-conversation with Zippy about the student — what they can do well, a rule at home, how they help.', cast: ['zippy'],
    turns: [
      { who: 'zippy', line: 'Beep! What can you do well?' },
      { who: 'student', line: 'I can … well!' },
      { who: 'zippy', line: 'What must you do at home?' },
      { who: 'student', line: 'I must … !' },
      { who: 'zippy', line: 'How can you help your family?' },
      { who: 'student', line: 'I can … !' },
    ],
  },
  { id: 'hc6-echo-2', kind: 'echo', bg: bgSquare, who: 'mia', textSide: 'top', teacher: 'Guided: the helper chain — ask, answer, offer. Say it with Mia, then say it to the teacher!', word: 'What’s the matter? I’ve got a cold. Can I help you?' },
  { id: 'hc6-teach-back', kind: 'meet', focus: ['rules'], bg: bgHQ, who: 'zippy', cardSide: 'right', teacher: 'Teach-back: the student explains the unit’s rules to Zippy in their own words — fast / well at the end, can’t … but … can, must = do it, mustn’t = don’t do it, What’s the matter? → Can I help you?', line: 'Beep! Teach me the hero rules! What does mustn’t mean?', repeat: 'Mustn’t means: don’t do it!' },
  { id: 'hc6-i-can', kind: 'meet', focus: ['hero'], bg: bgHQ, who: 'spark', cardSide: 'left', teacher: 'Check: accuracy in the games (not speed) — count the badges together. Which game was hard? Practise its sentences once more.', line: 'Look at your hero badges! You can use the hero words — right and fast!', repeat: 'I can use the hero words!' },
  {
    id: 'hc6-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Hero City sticker in their Sticker Book.',
    scene: {
      id: 'hc6-sticker', kind: 'sticker-reward', bg: bgHQ, who: 'pip', teacher: 'Sticker time!',
      line: 'Game day champion! Here is your sticker.',
      sticker: { img: HERO.badge, label: 'Hero badge' },
    },
  },
  petPal('hc6-pet-pal', 4, 'I want to play the hero games! I want a hero badge!', [{ label: 'badge', img: HERO.badge }, { label: 'tissue', img: HELP.tissue }, { label: 'shell', img: SEA.shell }], 0, 'A hero badge! Now I am a hero too! Woof!'),
  {
    id: 'hc6-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'hc6-home-mission', kind: 'home-mission', bg: bgHQ, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child practised everything from Hero City in games: what they can do well, "Can you…?", hero rules with must / mustn\'t and offering help. This week, play Simon Says with hero rules together.',
      steps: [
        { emoji: '\u{1F9B8}', say: 'Play Simon Says with hero rules.' },
        { emoji: '\u{1F6A6}', say: 'Say one rule: You must … / You mustn’t … .' },
        { emoji: '\u{1F91D}', say: 'Help someone and say: Can I help you?' },
      ],
    },
  },
  goodbyeSong('hc6-goodbye-song', bgHQ),
  { id: 'hc6-finale', kind: 'finale', bg: bgHQ, who: 'spark', line: 'Game day champion! Next time: the Super Helper Boss Test! \u{1F3C5}' },
];
