/* =============================================================================
 * Jungle Adventure — A1 Unit 2 (plan: docs/a1-unit-2-jungle.md, owner-approved 2026-10-13: "Ok")
 *
 * Reuses Welcome Town's Scene type, CharKey/CAST/VOICE_KEY and SceneRenderer — Jungle Adventure is a new WORLD, not a
 * new engine. Unit objective: describe a jungle animal in 4 sentences (what it is, looks like, can, can't), ask
 * "Can it…?" and read the story "The Jungle Rescue" (one story for the unit, a few pages each lesson).
 * Every lesson: sound → a phonics game (different each lesson) → Blend & Read → tongue twister; no game twice in the unit.
 *
 * Lesson 1 (rebuilt 2026-10-13): 8 animals + how they look ("It's an elephant. It's big and grey."). Removed from the
 * first version: the "Who says…?" page and the "pick any animal" page (A1 rule), "I am a lion" (Pre-A1 level).
 * Research (mechanics only): Cambridge Pre A1 Starters word list ("animal" words) and can-do "give very basic
 * descriptions … colour, size"; Kid's Box 1 wild animals (name → describe → ask); Khan Academy Kids / Lingokids safari
 * games. Better: in Safari Snap the later rounds give only the DESCRIPTION ("It's small and blue!"), so the child wins
 * by understanding the looks words, not just the name; the photos stay in the album.
 * ========================================================================= */

import { CAST, VOICE_KEY, type CharKey, type Scene } from '../welcome-town/scenes';

export type { CharKey, Scene };
export { CAST, VOICE_KEY };

const J = '/jungle-adventure';
const bgTitle = `${J}/scenes/bg-jungle-title.png`;
const bgWide = `${J}/scenes/bg-jungle-wide.png`;
const bgLeoDen = `${J}/scenes/bg-jungle-leo-den.png`;
const bgCocoVines = `${J}/scenes/bg-jungle-coco-vines.png`;
const bgWillowNest = `${J}/scenes/bg-jungle-willow-nest.png`;
const bgPathAnimals = `${J}/scenes/bg-jungle-path-animals.png`;
const bgFriends = `${J}/scenes/bg-jungle-friends.png`;
const WT = '/welcome-town';
const wtSpr = (who: string) => `${WT}/sprites/${who}-wave.png`;
const item = (n: string) => `/lep1/items/item-${n}.png`;

/** The Jungle Rescue — Canva pictures (scripts/canva-art-request.json, holder design pages 15-26). */
export const jungleRescue = (n: number) => `${J}/scenes/bg-jungle-rescue-${n}-wide.png`;

/** The unit's reading strand (plan §4): Leo and Pip visit Coco; Kip is stuck on a rock; who can help? */
export const JUNGLE_RESCUE: { img: string; lines: { who?: CharKey; text: string }[] }[] = [
  { img: jungleRescue(1), lines: [{ text: 'Look! The jungle! It is big and green.' }] },
  { img: jungleRescue(2), lines: [{ who: 'coco', text: 'Hi, Leo! Hi, Pip! I am Coco. I am a monkey.' }] },
  { img: jungleRescue(3), lines: [{ text: 'Look! A snake. It is long. An elephant. It is big.' }] },
  { img: jungleRescue(4), lines: [{ who: 'coco', text: 'I can climb! I can swing!' }, { who: 'pip', text: 'I can’t climb!' }] },
  { img: jungleRescue(5), lines: [{ text: 'Kip is on a rock.' }, { text: 'Help! Help! I am stuck!' }] },
  { img: jungleRescue(6), lines: [{ who: 'willow', text: 'I can fly. But I am small. I can’t help Kip.' }] },
  { img: jungleRescue(7), lines: [{ who: 'pip', text: 'Can a fish help?' }, { text: 'I can swim. I can’t lift Kip!' }] },
  { img: jungleRescue(8), lines: [{ text: 'I can swim! Can I help?' }, { text: 'No! Your teeth!' }] },
  { img: jungleRescue(9), lines: [{ text: 'I am big. I can walk in the river.' }] },
  { img: jungleRescue(10), lines: [{ text: 'The elephant lifts Kip with its long nose.' }] },
  { img: jungleRescue(11), lines: [{ text: 'Thank you!' }, { who: 'coco', text: 'Thank you, Elephant!' }] },
  { img: jungleRescue(12), lines: [{ who: 'leo', text: 'Lunch! Chips for all!' }, { who: 'coco', text: 'Thank you, friends!' }] },
];

export const LESSON_A1U2L1_TITLE = 'Jungle Animals';
export const LESSON_A1U2L1_OBJECTIVE = 'I can name 8 jungle animals and say what they look like: "It\'s an elephant. It\'s big and grey."';

const ANIMALS = {
  elephant: { label: 'elephant', img: item('elephant'), say: 'It’s an elephant. It’s big and grey.' },
  snake: { label: 'snake', img: item('snake'), say: 'It’s a snake. It’s long and green.' },
  crocodile: { label: 'crocodile', img: item('alligator'), say: 'It’s a crocodile. It’s big and green.' },
  monkey: { label: 'monkey', img: item('coco-cheer'), say: 'It’s a monkey. It’s brown.' },
  frog: { label: 'frog', img: item('frog'), say: 'It’s a frog. It’s small and green.' },
  bird: { label: 'bird', img: item('bird'), say: 'It’s a bird. It’s small and blue.' },
  lion: { label: 'lion', img: item('lion'), say: 'It’s a lion. It’s big and yellow.' },
  fish: { label: 'fish', img: item('fish'), say: 'It’s a fish. It’s small and orange.' },
};

export const LESSON_A1U2L1_SCENES: Scene[] = [
  { id: 'ja-title', kind: 'title-card', bg: bgTitle, level: 'A1', unit: 'Unit 2', lessonLabel: 'Lesson 1', title: 'Jungle Animals', subtitle: 'Who lives in the jungle? Big, small, long…', cta: '\u{1F334} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): Unit 1 — introducing a friend (listen-only: the child hears, then clicks).
    id: 'ja-recall-warmup', kind: 'recall-warmup', bg: bgWide, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 1 · Welcome Town',
    teacher: 'Guided: listen — who is it? Click the friend, then say it too: This is my friend Leo!',
    items: [
      { word: 'Leo', say: 'This is my friend Leo. He is seven.', img: wtSpr('leo') },
      { word: 'Mia', say: 'This is my friend Mia. She is six.', img: wtSpr('mia') },
      { word: 'Willow', say: 'This is my friend Willow. She is happy.', img: wtSpr('willow') },
    ],
  },
  /* Present: the animals (two small sets, then the looks) */
  {
    id: 'ja-animals-1', kind: 'prea1', teacher: 'Present: listen and say each animal — It’s an elephant! Show it with your arms.',
    scene: {
      id: 'ja-animals-1', kind: 'listen-repeat-cards', bg: bgWide, teacher: 'Listen and say it!',
      cards: [
        { who: 'pip', sentence: 'It’s an elephant.', img: ANIMALS.elephant.img, imgLabel: 'elephant' },
        { who: 'pip', sentence: 'It’s a snake.', img: ANIMALS.snake.img, imgLabel: 'snake' },
        { who: 'pip', sentence: 'It’s a crocodile.', img: ANIMALS.crocodile.img, imgLabel: 'crocodile' },
        { who: 'pip', sentence: 'It’s a monkey.', img: ANIMALS.monkey.img, imgLabel: 'monkey' },
      ],
    },
  },
  {
    id: 'ja-animals-2', kind: 'prea1', teacher: 'Present: four more — the frog, the bird, the lion and the fish. Listen and say.',
    scene: {
      id: 'ja-animals-2', kind: 'listen-repeat-cards', bg: bgWide, teacher: 'Listen and say it!',
      cards: [
        { who: 'pip', sentence: 'It’s a frog.', img: ANIMALS.frog.img, imgLabel: 'frog' },
        { who: 'pip', sentence: 'It’s a bird.', img: ANIMALS.bird.img, imgLabel: 'bird' },
        { who: 'pip', sentence: 'It’s a lion.', img: ANIMALS.lion.img, imgLabel: 'lion' },
        { who: 'pip', sentence: 'It’s a fish.', img: ANIMALS.fish.img, imgLabel: 'fish' },
      ],
    },
  },
  {
    id: 'ja-looks', kind: 'vocab-spot', bg: jungleRescue(3),
    teacher: 'Present: how do they look? Tap each arrow, listen, then say the sentence: The elephant is big.',
    items: [
      { label: 'big', sentence: 'The elephant is big.', emoji: '\u{1F418}', left: '60%', top: '40%', color: '#64748B', who: 'pip' },
      { label: 'long', sentence: 'The snake is long.', emoji: '\u{1F40D}', left: '78%', top: '16%', color: '#16A34A', who: 'pip' },
      { label: 'small', sentence: 'Coco is small.', emoji: '\u{1F412}', left: '36%', top: '58%', color: '#B45309', who: 'pip' },
      { label: 'grey', sentence: 'The elephant is grey.', emoji: '\u{1FA76}', left: '68%', top: '62%', color: '#475569', who: 'pip' },
    ],
  },
  { id: 'ja-echo', kind: 'echo', bg: bgWide, who: 'pip', textSide: 'top', teacher: 'Guided: say it like Pip — loud, then quiet!', word: 'It’s big and grey.' },
  {
    id: 'ja-shadows', kind: 'prea1', teacher: 'Guided: Shadow Match! Drag each animal onto its shadow (or tap it, then the shadow) and say it: It’s a snake!',
    scene: {
      id: 'ja-shadows', kind: 'shadow-match', bg: bgWide, who: 'pip',
      teacher: 'Drag each animal onto its shadow. Say it!',
      items: [
        { label: 'elephant', img: ANIMALS.elephant.img, line: ANIMALS.elephant.say },
        { label: 'snake', img: ANIMALS.snake.img, line: ANIMALS.snake.say },
        { label: 'crocodile', img: ANIMALS.crocodile.img, line: ANIMALS.crocodile.say },
        { label: 'monkey', img: ANIMALS.monkey.img, line: ANIMALS.monkey.say },
        { label: 'frog', img: ANIMALS.frog.img, line: ANIMALS.frog.say },
        { label: 'bird', img: ANIMALS.bird.img, line: ANIMALS.bird.say },
      ],
    },
  },
  {
    id: 'ja-hello-song', kind: 'song', bg: bgFriends, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Sing hello to the jungle friends — wave!',
    durationSeconds: 20, bigWord: 'Hello',
    songUrl: `${WT}/audio/hello-song.mp3?v=1`,
    lineDurationsMs: [3640, 4120, 4320, 7982],
    lyrics: [
      { who: 'marigold', text: 'Hello, hello, hello to you!' },
      { who: 'pip', text: 'Hi, hi, hi! And hi to you!' },
      { who: 'marigold', text: 'What’s your name? What’s your name?' },
      { who: 'pip', text: 'Say your name! Say your name!' },
    ],
  },
  /* ★ Signature: Safari Snap — first the name, then only the looks */
  {
    id: 'ja-safari-snap', kind: 'prea1', teacher: 'Guided → Free: Safari Snap! Listen and take the photo. The last rounds give only how it looks — listen well! Say a sentence with every photo.',
    scene: {
      id: 'ja-safari-snap', kind: 'photo-snap', bg: bgWide, who: 'pip',
      teacher: 'Listen and take a photo of the animal! Say it with each photo.',
      spots: [
        { x: 30, y: 74, size: 16 },
        { x: 56, y: 84, size: 15 },
        { x: 82, y: 72, size: 15 },
        { x: 22, y: 50, size: 11 },
        { x: 63, y: 54, size: 11 },
        { x: 84, y: 26, size: 9 },
      ],
      animals: [
        { label: 'elephant', img: ANIMALS.elephant.img, say: ANIMALS.elephant.say },
        { label: 'snake', img: ANIMALS.snake.img, say: ANIMALS.snake.say },
        { label: 'crocodile', img: ANIMALS.crocodile.img, say: ANIMALS.crocodile.say },
        { label: 'monkey', img: ANIMALS.monkey.img, say: ANIMALS.monkey.say },
        { label: 'frog', img: ANIMALS.frog.img, say: ANIMALS.frog.say, scale: 0.7 },
        { label: 'bird', img: ANIMALS.bird.img, say: ANIMALS.bird.say, scale: 0.7 },
      ],
      rounds: [
        { target: 1, line: 'Take a photo of the snake!', place: [0, 1, 2, 3, 4, 5] },
        { target: 2, line: 'Take a photo of the crocodile!', place: [2, 0, 1, 5, 3, 4] },
        { target: 0, line: 'It’s big and grey! Take a photo!', place: [1, 2, 0, 4, 5, 3] },
        { target: 5, line: 'It’s small and blue! Take a photo!', place: [0, 3, 2, 1, 4, 5] },
        { target: 4, line: 'It’s small and green! Take a photo!', place: [2, 1, 0, 3, 5, 4] },
        { target: 3, line: 'It’s brown! Take a photo!', place: [1, 0, 2, 4, 3, 5] },
      ],
      doneLine: 'Look at your jungle photos! Super safari!',
    },
  },
  {
    id: 'ja-move-break', kind: 'prea1', teacher: 'Brain break: move like the animals with Pip.',
    scene: {
      id: 'ja-move-break', kind: 'tpr-actions', mode: 'break', bg: bgWide, who: 'pip', teacher: 'Move like the animals!',
      rounds: [
        { line: 'Be a big elephant! Stomp, stomp!', emoji: '\u{1F418}' },
        { line: 'Be a long snake! Wiggle, wiggle!', emoji: '\u{1F40D}' },
        { line: 'Be a small frog! Hop, hop!', emoji: '\u{1F438}' },
        { line: 'Be a monkey! Ooh ooh!', emoji: '\u{1F412}' },
      ],
    },
  },
  /* Reading: The Jungle Rescue, pages 1-3 */
  {
    id: 'ja-reader', kind: 'reader', bg: jungleRescue(1), title: 'The Jungle Rescue', doneLine: 'Leo and Pip are in the jungle! What happens next? Find out next time!',
    teacher: 'Reading: listen while the words light up, then the student reads each page. Tap any word to hear it.',
    pages: JUNGLE_RESCUE.slice(0, 3),
  },
  {
    id: 'ja-read-match', kind: 'picture-match', prompt: 'Read and match',
    teacher: 'Reading: read each sentence and drag it under its picture. Then read it aloud.',
    items: [
      { word: 'It is big and grey.', img: ANIMALS.elephant.img },
      { word: 'It is long and green.', img: ANIMALS.snake.img },
      { word: 'It is small and blue.', img: ANIMALS.bird.img },
      { word: 'It is brown.', img: ANIMALS.monkey.img },
    ],
    bg: bgWide,
  },
  /* Phonics: short i → Brick Crush → Blend & Read → tongue twister */
  {
    id: 'ja-sound-i', kind: 'sound-model', bg: bgWide, who: 'pip', letter: 'I', phoneme: '/i/', sound: 'i', soundSide: 'center',
    teacher: 'Present: /i/ — a short, quick sound, like a little “i!”. Insect, ink, igloo. Find the /i/ words.',
    anchors: [
      { word: 'insect', emoji: '\u{1F41B}', img: item('insect') },
      { word: 'ink', emoji: '\u{1F58B}\u{FE0F}', img: item('ink') },
      { word: 'igloo', emoji: '\u{1F9CA}', img: item('igloo') },
    ],
  },
  {
    id: 'ja-brick-i', kind: 'prea1', teacher: 'Reading: Brick Crush! Listen to the sound, then smash every brick with that letter — i, a or o.',
    scene: { id: 'ja-brick-i', kind: 'brick-crush', bg: bgWide, teacher: 'Listen to the sound, then tap every brick with that letter.', who: 'pip', letters: ['I', 'A', 'O'], rows: 4, cols: 7, goal: 14, seconds: 60 },
  },
  {
    id: 'ja-blend', kind: 'sound-blend', bg: bgWide,
    teacher: 'Reading: say each sound, blend, find the picture — then read the sentence.',
    rounds: [
      { word: 'big', img: ANIMALS.elephant.img, sentence: 'An elephant. It is big.' },
      { word: 'pig', img: item('pig'), sentence: 'It is a big pig.' },
      { word: 'zip', img: item('zip'), sentence: 'Zip it, Pip!' },
    ],
  },
  { id: 'ja-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgWide, who: 'pip', focus: 'i', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, then faster.', line: 'Six big pigs sit still.' },
  /* Free: talk about an animal */
  {
    id: 'ja-free-talk', kind: 'join-stage', bg: bgFriends, teacher: 'Free: Coco asks — the student picks any animal and says two sentences about it, then asks Coco.', cast: ['coco', 'pip'],
    turns: [
      { who: 'coco', line: 'Which animal do you like?' },
      { who: 'student', line: 'I like the … It’s …' },
      { who: 'coco', line: 'Oh! Is it big or small?' },
      { who: 'student', line: 'It’s … and … . And you, Coco?' },
      { who: 'coco', line: 'I like the frog. It’s small and green!' },
    ],
  },
  { id: 'ja-i-can', kind: 'meet', focus: ['jungle'], bg: bgFriends, who: 'coco', cardSide: 'left', teacher: 'Check: say it and get your passport stamp!', line: 'I can name jungle animals and say how they look!', repeat: 'It’s big and grey!' },
  {
    id: 'ja-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the safari sticker in their Sticker Book.',
    scene: {
      id: 'ja-sticker', kind: 'sticker-reward', bg: bgFriends, who: 'pip', teacher: 'Sticker time!',
      line: 'Super safari! Here is your sticker.',
      sticker: { img: ANIMALS.elephant.img, label: 'Jungle explorer' },
    },
  },
  {
    id: 'ja-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ja-home-mission', kind: 'home-mission', bg: bgFriends, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned 8 jungle animals and how they look (big, small, long, colours) and read the first pages of "The Jungle Rescue". Ask them to draw an animal and tell you about it.',
      steps: [
        { emoji: '\u{1F58D}\u{FE0F}', say: 'Draw a jungle animal.' },
        { emoji: '\u{1F5E3}\u{FE0F}', say: 'Say two sentences: It’s a snake. It’s long.' },
        { emoji: '\u{1F4D6}', say: 'Read page 1 of the story to your family.' },
      ],
    },
  },
  {
    id: 'ja-goodbye-song', kind: 'song', bg: bgFriends, title: '\u{1F3B5} Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${WT}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'pip', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },
  { id: 'ja-finale', kind: 'finale', bg: bgFriends, who: 'pip', line: 'You can name 8 jungle animals and say how they look! See you in the jungle! \u{1F334}' },
];

/* =============================================================================
 * A1 Unit 2 Lesson 2: "What Can Animals Do?" (built 2026-10-12)
 *
 * Plan (src/curriculum/roadmap/a1LessonPlans.ts, unit 2 lesson 2 — start there, not here):
 *   Objective: I can say what a jungle animal can and can't do: "A monkey can climb. It can't fly."
 *   New: climb, swing, It can't…  ·  Re-used: lion, monkey, bird, fish; run, jump, swim, fly; It can…
 *   Phonics: ch (chip, chick, lunch, bench) · Home mission: mime an animal, say what it can and can't do.
 * Story frame: Jungle Games Day — the friends race an obstacle course to the golden banana at the waterfall
 *   (new setting and plot shape vs Lesson 1's "meet the friends" path; new pictures, warm sunny daylight).
 * Practice ladder (blueprint §3g, owner 2026-10-12 "enough guided practice and free practice"):
 *   Present: action scene, "swing" word page, watch & copy, "can't" word page.
 *   Guided (teacher notes start "Guided:"): watch & copy, listen & tap, drag & match, Obstacle Run picks + "say it",
 *     quick-fire.  Free ("Free:"): Q & A stage, spin & say with own can't sentence, "What can YOU do?", Obstacle Run
 *     finale (own sentences about any friend).  Check: true / false (the plan's listening evidence, 4 of 5).
 * Research (lesson-variety-engine; mechanics only, never content): EnglishClub / British Council TeachingEnglish
 *   can / can't ability games ("Who can…?", mime and say), Cambridge Pre A1 Starters / A1 Movers listen-and-choose and
 *   "Can a … ?" tasks, Wordwall maze-chase route progress, Khan Academy Kids cause-and-effect feedback, Lingokids action
 *   games (watch and do). Better than them: the language IS the move in the Obstacle Run (a station only opens for the
 *   friend who CAN), a wrong pick is a funny visible "I can't…" instead of a red cross, flags stay on the course, and
 *   the game ends in the child's own sentences. New mechanic: `obstacle-run` (unit1/scene-components/ObstacleRunScene.tsx).
 * Trimmed 2026-10-13 to the Unit 2 plan (docs/a1-unit-2-jungle.md §5.2): 32 → 24 pages. Removed the two "any answer is
 *   right" choice pages, the sing-back, the payoff cinematic and the extra-time freeze + memory (Memory belongs to L6, no
 *   game twice in the unit). Added: listen-only Remember? of Lesson 1's looks, The Jungle Rescue pp. 3-5 (Reader),
 *   /ch/ sound model, Sound Pop (ch vs c vs h), Blend & Read with story sentences, twister "Chip the chimp chews chips."
 * Safe animal facts only in generic sentences (monkey climb/swing, can't fly; fish swim, can't run; lion run, can't
 *   swing; bird fly; frog jump). First-person "I can't…" lines belong to one character, not to a species.
 * ========================================================================= */

const bgObstacle = `${J}/scenes/bg-jungle-obstacle-course.png`;
const bgActions = `${J}/scenes/bg-jungle-actions.png`;
const bgCocoSwing = `${J}/scenes/bg-jungle-coco-swing.png`;
const bgCocoCantFly = `${J}/scenes/bg-jungle-coco-cant-fly.png`;
const bgWaterfall = `${J}/scenes/bg-jungle-waterfall-party.png`;
const it = (n: string) => `/lep1/items/item-${n}.png`;
const SONG_A1U2L2 = `${J}/audio/jungle-can-song-a1u2l2.mp3?v=1`;
const SONG_A1U2L2_LYRICS: { who: CharKey; text: string }[] = [
  { who: 'coco', text: 'Climb and swing and swim and fly,' },
  { who: 'leo', text: 'Jungle friends, let’s try, let’s try!' },
  { who: 'coco', text: 'A monkey can climb, yes, it can!' },
  { who: 'willow', text: 'A monkey can’t fly, no, it can’t!' },
  { who: 'leo', text: 'A fish can swim, yes, it can!' },
  { who: 'coco', text: 'A fish can’t run, no, it can’t!' },
  { who: 'willow', text: 'A lion can run, yes, it can!' },
  { who: 'coco', text: 'A lion can’t swing, no, it can’t!' },
  { who: 'coco', text: 'Climb and swing and swim and fly,' },
  { who: 'leo', text: 'Jungle friends, let’s try, let’s try!' },
];
// take 3 (docs/songs/a1u2l2-jungle-can-scores.txt, score 0.93): line starts measured from the transcript
const SONG_A1U2L2_MS = [10460, 6120, 2400, 6170, 2400, 6420, 2200, 6360, 2180, 2590];

// the five animals on bg-jungle-actions.png (measured on a % grid of the picture)
const CLIMB_SPOT = { left: '16%', top: '33%' };
const RUN_SPOT = { left: '45%', top: '62%' };
const FLY_SPOT = { left: '67%', top: '28%' };
const JUMP_SPOT = { left: '60%', top: '77%' };
const SWIM_SPOT = { left: '82%', top: '84%' };

export const LESSON_A1U2L2_TITLE = 'What Can Animals Do?';
export const LESSON_A1U2L2_OBJECTIVE = 'I can say what a jungle animal can and can\'t do: "A monkey can climb. It can\'t fly."';

export const LESSON_A1U2L2_SCENES: Scene[] = [
  { id: 'ja2-title', kind: 'title-card', bg: bgObstacle, level: 'A1', unit: 'Unit 2', lessonLabel: 'Lesson 2', title: 'What Can Animals Do?', subtitle: 'Jungle Games Day: climb, swing, swim and fly!', cta: '\u{1F3C1} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 1's animals and looks, listen-only — the child hears the looks and clicks.
    id: 'ja2-recall-warmup', kind: 'recall-warmup', bg: bgWide, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 2 · Lesson 1 · Jungle Animals',
    teacher: 'Guided: listen — which animal is it? Click it, then say both sentences: It’s an elephant. It’s big and grey.',
    items: [
      { word: 'elephant', say: 'It’s big and grey.', img: it('elephant') },
      { word: 'snake', say: 'It’s long and green.', img: it('snake') },
      { word: 'bird', say: 'It’s small and blue.', img: it('bird') },
      { word: 'monkey', say: 'It’s brown.', img: it('coco-cheer') },
    ],
  },
  /* 3 Story opener */
  {
    id: 'ja2-intro', kind: 'cinematic', bg: bgObstacle, title: 'Jungle Games Day', subtitle: 'Race to the waterfall!', narrator: 'coco',
    script: [
      { who: 'coco', line: 'Today is Jungle Games Day!' },
      { who: 'leo', line: 'Look! The golden banana is at the waterfall!' },
      { who: 'willow', line: 'We can win it together. Every friend can do something different!' },
    ],
    cta: '\u{1F34C} LET’S RACE!',
  },
  /* 4 Input: the action words in one jungle picture, one arrow at a time */
  {
    id: 'ja2-vocab-actions', kind: 'vocab-spot', bg: bgActions,
    teacher: 'Look at each animal! Tap the arrow to hear what it can do.',
    items: [
      { label: 'Climb', sentence: 'A monkey can climb.', emoji: '\u{1F9D7}', ...CLIMB_SPOT, color: '#8B5A2B', who: 'coco' },
      { label: 'Run', sentence: 'A lion can run.', emoji: '\u{1F3C3}', ...RUN_SPOT, color: '#C97A2F', who: 'leo' },
      { label: 'Fly', sentence: 'A bird can fly.', emoji: '\u{1F54A}\u{FE0F}', ...FLY_SPOT, color: '#4FA9E0', who: 'willow' },
      { label: 'Jump', sentence: 'A frog can jump.', emoji: '\u{1F438}', ...JUMP_SPOT, color: '#3FA34D', who: 'pip' },
      { label: 'Swim', sentence: 'A fish can swim.', emoji: '\u{1F41F}', ...SWIM_SPOT, color: '#F08A24', who: 'mia' },
    ],
  },
  /* 5 Input: the second new word on its own page */
  {
    id: 'ja2-word-swing', kind: 'meet', look: 'word', word: 'swing', focus: ['swing'], bg: bgCocoSwing, who: 'coco', cardSide: 'right',
    teacher: 'Point to Coco on the vine. Listen, then swing your arms and say it!',
    line: 'Wheee! I can swing! A monkey can swing!', repeat: 'A monkey can swing!',
  },
  /* 6 Guided: watch and copy, one action at a time */
  {
    id: 'ja2-move', kind: 'prea1', teacher: 'Guided: watch and copy! Do each action and say the sentence.',
    scene: {
      id: 'ja2-move', kind: 'tpr-actions', mode: 'learn', bg: bgActions, who: 'leo',
      teacher: 'Guided: watch and copy! Do each action and say the sentence.',
      rounds: [
        { line: 'Climb, climb, climb! A monkey can climb!', emoji: '\u{1F9D7}' },
        { line: 'Swing, swing, swing! A monkey can swing!', emoji: '\u{1F412}', img: it('coco-swing') },
        { line: 'Run, run, run! A lion can run!', emoji: '\u{1F981}', img: it('leo-run') },
        { line: 'Fly, fly, fly! A bird can fly!', emoji: '\u{1F426}', img: it('willow-fly') },
        { line: 'Swim, swim, swim! A fish can swim!', emoji: '\u{1F41F}', img: it('fish-swim') },
        { line: 'Jump, jump, jump! A frog can jump!', emoji: '\u{1F438}', img: it('jungle-frog-jump') },
      ],
    },
  },
  /* 7 Guided: listen and tap (first game) */
  {
    id: 'ja2-who-can', kind: 'listen-tap', bg: bgActions, teacher: 'Guided: listen to "Who can…?", then tap the animal and say "A monkey can climb!"',
    targets: [
      { label: 'Monkey', ...CLIMB_SPOT, color: '#8B5A2B' },
      { label: 'Lion', ...RUN_SPOT, color: '#C97A2F' },
      { label: 'Bird', ...FLY_SPOT, color: '#4FA9E0' },
      { label: 'Frog', ...JUMP_SPOT, color: '#3FA34D' },
      { label: 'Fish', ...SWIM_SPOT, color: '#F08A24' },
    ],
    rounds: [
      { prompt: 'Who can fly?', answerLabel: 'Bird', who: 'willow' },
      { prompt: 'Who can swim?', answerLabel: 'Fish', who: 'mia' },
      { prompt: 'Who can climb?', answerLabel: 'Monkey', who: 'coco' },
      { prompt: 'Who can jump?', answerLabel: 'Frog', who: 'pip' },
      { prompt: 'Who can run?', answerLabel: 'Lion', who: 'leo' },
    ],
  },
  /* 8 The sentence page: can't (one structure, its own picture) */
  {
    id: 'ja2-word-cant', kind: 'meet', look: 'word', word: 'can’t', wordNote: '\u{1F6AB} can + not =', focus: ['can’t'], bg: bgCocoCantFly, who: 'coco', cardSide: 'right',
    teacher: 'Coco flaps her arms… nothing happens! Point to Willow (she can fly) and to Coco (she can’t). Listen, then say it with a head shake.',
    line: 'A monkey can climb. It can’t fly!', repeat: 'It can’t fly!',
  },
  /* 9 Guided: drag the word to the animal doing it */
  {
    id: 'ja2-drag-actions', kind: 'drag-match', bg: bgActions, teacher: 'Guided: drag each action word to the animal doing it, then say the sentence: "A fish can swim!"',
    items: [
      { label: 'climb', color: '#8B5A2B', who: 'coco', targetLeft: CLIMB_SPOT.left, targetTop: CLIMB_SPOT.top },
      { label: 'run', color: '#C97A2F', who: 'leo', targetLeft: RUN_SPOT.left, targetTop: RUN_SPOT.top },
      { label: 'fly', color: '#4FA9E0', who: 'willow', targetLeft: FLY_SPOT.left, targetTop: FLY_SPOT.top },
      { label: 'jump', color: '#3FA34D', who: 'pip', targetLeft: JUMP_SPOT.left, targetTop: JUMP_SPOT.top },
      { label: 'swim', color: '#F08A24', who: 'mia', targetLeft: SWIM_SPOT.left, targetTop: SWIM_SPOT.top },
    ],
  },
  /* 10 The lesson song (after the words and the first game, owner 2026-10-10) */
  {
    id: 'ja2-song', kind: 'song', bg: bgActions, title: '\u{1F3B5} Jungle Friends, Let’s Try! \u{1F3B5}',
    teacher: 'Sing and move! Thumbs up on "yes, it can", shake your head on "no, it can’t".',
    durationSeconds: 47, bigWord: 'can’t', songUrl: SONG_A1U2L2, lineDurationsMs: SONG_A1U2L2_MS, lyrics: SONG_A1U2L2_LYRICS,
  },
  /* 11 ★ Signature game: Jungle Obstacle Run (guided picks + "say it", free finale) */
  {
    id: 'ja2-obstacle-run', kind: 'prea1',
    teacher: 'Guided, then Free: send the friend who CAN pass each obstacle and say the sentence; at the end the student picks any friend and makes their own can / can’t sentences (tap ✓ for each one).',
    scene: {
      id: 'ja2-obstacle-run', kind: 'obstacle-run', bg: bgObstacle, who: 'mia',
      teacher: 'Guided, then Free: send the friend who CAN pass each obstacle and say the sentence; at the end the student picks any friend and makes their own can / can’t sentences (tap ✓ for each one).',
      friends: [
        { name: 'Leo', img: it('leo-run'), voice: 'leo', frame: 'A lion can ___. It can’t ___.' },
        { name: 'Coco', img: it('coco-swing'), voice: 'bella', frame: 'A monkey can ___. It can’t ___.' },
        { name: 'Willow', img: it('willow-fly'), voice: 'willow', frame: 'A bird can ___. It can’t ___.' },
        { name: 'Fish', img: it('fish-swim'), voice: 'pip', frame: 'A fish can ___. It can’t ___.' },
      ],
      stations: [
        { action: 'run', left: '18%', top: '64%', ask: 'The long path! Who can run fast?', options: [0, 3], answer: 0, sentence: 'A lion can run!' },
        { action: 'climb', left: '27%', top: '38%', ask: 'The tall tree! Who can climb it?', options: [3, 1, 0], answer: 1, sentence: 'A monkey can climb!' },
        { action: 'swim', left: '44%', top: '57%', ask: 'The river! Who can swim across?', options: [2, 3, 1], answer: 3, sentence: 'A fish can swim!' },
        { action: 'swing', left: '72%', top: '42%', ask: 'The big gap! Who can swing on the vines?', options: [0, 1, 3], answer: 1, sentence: 'A monkey can swing!' },
        { action: 'fly', left: '90%', top: '30%', ask: 'The top of the waterfall! Who can fly up?', options: [1, 0, 2], answer: 2, sentence: 'A bird can fly!' },
      ],
      freePrompt: 'Your turn! Pick a friend. What can it do? What can’t it do?',
      freeGoal: 3,
      doneLine: 'We got the golden banana! Super sentences!',
    },
  },
  /* 12 Free (less controlled): the teacher asks, the child answers in two sentences */
  {
    id: 'ja2-qa-stage', kind: 'join-stage', bg: bgFriends,
    teacher: 'Free: the friends ask, the student answers with TWO sentences (a can AND a can’t) — any true answer is right.',
    cast: ['coco', 'leo', 'willow'],
    turns: [
      { who: 'coco', line: 'What can a fish do?' },
      { who: 'student', line: 'A fish can swim. It can’t run!' },
      { who: 'leo', line: 'What can a monkey do?' },
      { who: 'student', line: 'A monkey can climb. It can’t fly!' },
      { who: 'willow', line: 'Your turn! Ask me: What can a bird do?' },
      { who: 'student', line: 'What can a bird do?' },
      { who: 'willow', line: 'A bird can fly!' },
    ],
  },
  /* 13 Free: spin and say (the wheel picks the animal, the child adds their own can't sentence) */
  {
    id: 'ja2-spin', kind: 'spin-wheel', bg: bgActions, title: 'Spin! What can it do?',
    teacher: 'Free: have the student spin, say the sentence, then add their own "It can’t…" sentence ("A frog can jump. It can’t fly!"). If you prefer, do the activity without the spinner.',
    items: [
      { label: 'A monkey can climb!', ...CLIMB_SPOT },
      { label: 'A lion can run!', ...RUN_SPOT },
      { label: 'A bird can fly!', ...FLY_SPOT },
      { label: 'A frog can jump!', ...JUMP_SPOT },
      { label: 'A fish can swim!', ...SWIM_SPOT },
    ],
    wheelAt: { left: '30%', top: '72%' },
  },

  /* Reading: The Jungle Rescue pages 4-5 */
  {
    id: 'ja2-reader', kind: 'reader', bg: jungleRescue(4), title: 'The Jungle Rescue', doneLine: 'Oh no! Kip is stuck on a rock! Who can help? Find out next time!',
    teacher: 'Reading: page 3 again, then the new pages. Listen while the words light up, then the student reads. Tap any word to hear it.',
    pages: JUNGLE_RESCUE.slice(2, 5),
  },
  /* Phonics: ch → Sound Pop → Blend & Read → tongue twister */
  {
    id: 'ja2-sound-ch', kind: 'sound-model', bg: bgWide, who: 'coco', letter: 'CH', phoneme: '/ch/', sound: 'ch', soundSide: 'center',
    teacher: 'Present: c + h make ONE new sound, /ch/ — like a little train: ch-ch-ch! Chips, chick, cheese, chair.',
    anchors: [
      { word: 'chips', emoji: '\u{1F35F}', img: it('chip') },
      { word: 'chick', emoji: '\u{1F424}', img: it('chick') },
      { word: 'cheese', emoji: '\u{1F9C0}', img: it('cheese') },
      { word: 'chair', emoji: '\u{1FA91}', img: it('chair') },
    ],
  },
  {
    id: 'ja2-sound-pop', kind: 'prea1', teacher: 'Reading: Sound Pop! Pop only the balloons that start with /ch/ — not /c/, not /h/!',
    scene: {
      id: 'ja2-sound-pop', kind: 'sound-pop', bg: bgWide, who: 'mia', goal: 5, seconds: 45,
      teacher: 'Pop only the CH balloons! /ch/ like chick!',
      targets: [{ letter: 'CH', phoneme: '/ch/' }],
      items: [
        { word: 'chick', letter: 'CH', img: it('chick'), emoji: '\u{1F424}' },
        { word: 'chips', letter: 'CH', img: it('chip'), emoji: '\u{1F35F}' },
        { word: 'cheese', letter: 'CH', img: it('cheese'), emoji: '\u{1F9C0}' },
        { word: 'cat', letter: 'C', img: it('cat'), emoji: '\u{1F431}' },
        { word: 'hat', letter: 'H', img: it('hat-green'), emoji: '\u{1F452}' },
        { word: 'hen', letter: 'H', img: it('hen'), emoji: '\u{1F414}' },
      ],
    },
  },
  {
    id: 'ja2-blend-ch', kind: 'sound-blend', bg: bgWide, look: 'frog',
    teacher: 'Reading: tap each lily pad and say the sound (/ch/ /i/ /p/) — ch is ONE sound! Blend, find the picture, then read the sentence.',
    rounds: [
      { word: 'chip', sounds: ['ch', 'i', 'p'], img: it('chip'), sentence: 'Lunch! Chips for all!' },
      { word: 'chick', sounds: ['ch', 'i', 'ck'], img: it('chick'), sentence: 'Look! A chick. It is small.' },
      { word: 'lunch', sounds: ['l', 'u', 'n', 'ch'], img: it('lunchbox'), sentence: 'It is my lunch.' },
    ],
  },
  { id: 'ja2-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgWide, who: 'coco', focus: 'ch', teacher: 'Reading: quick reading! Listen to Coco, then say it slow, then faster.', line: 'Chip the chimp chews chips.' },
  /* 16 Guided: quick fire */
  {
    id: 'ja2-quick-fire', kind: 'prea1', teacher: 'Guided: quick fire! Say the whole sentence before the ring runs out.',
    scene: {
      id: 'ja2-quick-fire', kind: 'rapid-recall', bg: bgActions, who: 'leo', seconds: 5,
      teacher: 'Guided: quick fire! Say the whole sentence before the ring runs out.',
      cards: [
        { img: it('fish-swim'), word: 'swim', say: 'A fish can swim.' },
        { img: it('coco-swing'), word: 'swing', say: 'A monkey can swing.' },
        { img: it('willow-fly'), word: 'fly', say: 'A bird can fly.' },
        { img: it('jungle-frog-jump'), word: 'jump', say: 'A frog can jump.' },
        { img: it('leo-run'), word: 'run', say: 'A lion can run.' },
      ],
    },
  },

  /* 18 Check (the plan's listening evidence: 4 of 5) */
  {
    id: 'ja2-check', kind: 'true-false', bg: bgWaterfall,
    teacher: 'Check: the student listens to each sentence and says TRUE or FALSE (aim: 4 of 5). For a false one, ask them to say the true sentence.',
    rounds: [
      { who: 'coco', statement: 'A monkey can climb.', isTrue: true },
      { who: 'leo', statement: 'A fish can run.', isTrue: false },
      { who: 'willow', statement: 'A bird can fly.', isTrue: true },
      { who: 'coco', statement: 'A monkey can fly.', isTrue: false },
      { who: 'leo', statement: 'A lion can’t swing.', isTrue: true },
    ],
  },


  /* 21 Sticker  22 Home Mission */
  {
    id: 'ja2-sticker', kind: 'prea1', teacher: 'Sticker time! First the student says the lesson sentence ("A monkey can climb. It can’t fly!"), then opens the pack.',
    scene: {
      id: 'ja2-sticker', kind: 'sticker-reward', bg: bgWaterfall, who: 'leo',
      teacher: 'Sticker time! First the student says the lesson sentence ("A monkey can climb. It can’t fly!"), then opens the pack.',
      line: 'You can say what animals can and can’t do! Here is the golden banana.',
      sticker: { img: it('banana-trophy'), label: 'Jungle Games champion!' },
    },
  },
  {
    id: 'ja2-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ja2-home-mission', kind: 'home-mission', bg: bgFriends, who: 'willow',
      teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned to say what animals can and can’t do: "A monkey can climb. It can’t fly." New words: climb, swing, can’t. Ask them to show you an animal and tell you about it.',
      steps: [
        { emoji: '\u{1F412}', say: 'Be an animal for your family. Move like it!' },
        { emoji: '\u{1F44D}', say: 'Say what it can do: A monkey can climb!' },
        { emoji: '\u{1F44E}', say: 'Say what it can’t do: It can’t fly!' },
      ],
    },
  },


  /* Closing routine goodbye + celebration */
  {
    id: 'ja2-goodbye-song', kind: 'song', bg: bgFriends, title: '\u{1F3B5} Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: '/welcome-town/audio/goodbye-song.mp3?v=3',
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'coco', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'leo', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'willow', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'coco', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },
  { id: 'ja2-finale', kind: 'finale', bg: bgWaterfall, who: 'coco', line: 'You can say what animals can and can’t do — and read about Kip! Who can help him? ✨\u{1F34C}' },
];

/* =============================================================================
 * A1 Unit 2 Lesson 3: "Can It…?" (built 2026-10-13, plan docs/a1-unit-2-jungle.md §5.3)
 *
 * Objective: I can ask "Can it…?" and answer "Yes, it can. / No, it can't."  Evidence: Who Can? buzzer (4 of 5) and the
 * child asks the teacher 2 questions (Flip & Ask, interview with Coco). Reading: The Jungle Rescue pp. 5-7 (who can help
 * Kip? Willow can fly but is small; the fish can swim but can't lift Kip). Phonics: ck (duck, clock, socks, chick).
 * Research (mechanics only): Cambridge Starters "Can you…? Yes, I can / No, I can't" (coursebook unit), British Council
 * TeachingEnglish can/can't mime, Kahoot / game-show buzzers. Better: in Can It? the animal really tries and flops, so the
 * answer is SEEN; in Flip & Ask the child is the one asking. Plan swaps (no new art needed, same purpose): Ring Toss → Word
 * Build for ck (ck is an END sound: du_ → ck / ch / sh), Peek-Pop → Flip & Ask (the child asks "Can a frog jump?").
 * ========================================================================= */

const bgStage = '/lep1/scenes/bg-u5l6-stage-wide.png';
const SONG_A1U2L3 = `${J}/audio/can-it-song-a1u2l3.mp3?v=1`;
const SONG_A1U2L3_LYRICS: { who: CharKey; text: string }[] = [
  { who: 'coco', text: 'Elephant, snake and crocodile,' },
  { who: 'coco', text: 'Ask them, ask them, with a smile!' },
  { who: 'pip', text: 'Can an elephant swim? Yes, it can!' },
  { who: 'pip', text: 'Can an elephant fly? No, it can’t!' },
  { who: 'willow', text: 'Can a snake climb a tree? Yes, it can!' },
  { who: 'willow', text: 'Can a snake run fast? No, it can’t!' },
  { who: 'leo', text: 'Can a crocodile swim? Yes, it can!' },
  { who: 'leo', text: 'Can a crocodile fly? No, it can’t!' },
  { who: 'coco', text: 'Elephant, snake and crocodile,' },
  { who: 'coco', text: 'Ask them, ask them, with a smile!' },
];
// take 3 (docs/songs/a1u2l3-jungle-can-it-scores.txt, score 0.93): line starts measured from the transcript.
// Transcript check: "snake run a tree" (sung "climb"?) and "elephants they can crocodile" in the last chorus — owner to listen.
const SONG_A1U2L3_MS = [10460, 6300, 2200, 6100, 2460, 6120, 2560, 3360, 1340, 6355];

const JA_FACES = [
  { label: 'elephant', name: 'the elephant', img: it('elephant') },
  { label: 'crocodile', name: 'the crocodile', img: it('alligator') },
  { label: 'snake', name: 'the snake', img: it('snake') },
  { label: 'bird', name: 'the bird', img: it('bird') },
  { label: 'frog', name: 'the frog', img: it('frog') },
  { label: 'monkey', name: 'the monkey', img: it('coco-cheer') },
];

export const LESSON_A1U2L3_TITLE = 'Can It…?';
export const LESSON_A1U2L3_OBJECTIVE = 'I can ask "Can it…?" and answer "Yes, it can." / "No, it can\'t." — about the elephant, the snake, the crocodile and friends.';

export const LESSON_A1U2L3_SCENES: Scene[] = [
  { id: 'ja3-title', kind: 'title-card', bg: jungleRescue(6), level: 'A1', unit: 'Unit 2', lessonLabel: 'Lesson 3', title: 'Can It…?', subtitle: 'Who can help Kip? Ask and find out!', cta: '\u{2753} LET’S ASK!' },
  {
    id: 'ja3-recall-warmup', kind: 'recall-warmup', bg: bgWide, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 2 · Lesson 2 · What Can Animals Do?',
    teacher: 'Guided: listen — who can do it? Click it and say the sentence: A monkey can climb!',
    items: [
      { word: 'monkey', say: 'It can climb.', img: it('coco-cheer') },
      { word: 'fish', say: 'It can swim. It can’t run.', img: it('fish') },
      { word: 'bird', say: 'It can fly.', img: it('bird') },
      { word: 'frog', say: 'It can jump.', img: it('frog') },
    ],
  },
  /* Present: the question and the two short answers, each on its story picture */
  { id: 'ja3-model-yes', kind: 'meet', focus: ['Yes, it can'], bg: jungleRescue(6), who: 'willow', cardSide: 'right', teacher: 'Present: the question goes UP, the answer comes down. Thumbs up for “Yes, it can!”', line: 'Can a bird fly? Yes, it can!', repeat: 'Yes, it can!' },
  { id: 'ja3-model-no', kind: 'meet', focus: ['No, it can’t'], bg: jungleRescue(7), who: 'pip', cardSide: 'left', teacher: 'Present: thumbs down and a head shake for “No, it can’t!” — a strong T at the end.', line: 'Can a fish fly? No, it can’t!', repeat: 'No, it can’t!' },
  { id: 'ja3-echo', kind: 'echo', bg: bgWide, who: 'pip', textSide: 'top', teacher: 'Guided: ask like Pip — the voice goes UP at the end.', word: 'Can it swim?' },
  {
    id: 'ja3-can-it', kind: 'prea1', teacher: 'Guided: Can It? Pip asks; the student answers with a thumbs up “Yes, it can!” or thumbs down “No, it can’t!” — then watch what happens.',
    scene: {
      id: 'ja3-can-it', kind: 'can-it', bg: bgWide, who: 'pip',
      teacher: 'Thumbs up: Yes, it can! Thumbs down: No, it can’t!',
      animals: [{ word: 'elephant', img: it('elephant') }, { word: 'crocodile', img: it('alligator') }, { word: 'snake', img: it('snake') }, { word: 'frog', img: it('frog') }, { word: 'bird', img: it('bird') }, { word: 'fish', img: it('fish') }],
      rounds: [
        { animal: 0, action: 'swim', can: true, real: 'swim', ask: 'Can an elephant swim?', answer: 'Yes! An elephant can swim!' },
        { animal: 1, action: 'fly', can: false, real: 'swim', ask: 'Can a crocodile fly?', answer: 'No! A crocodile can’t fly. It can swim!' },
        { animal: 2, action: 'run', can: false, real: 'swim', ask: 'Can a snake run?', answer: 'No! A snake can’t run. It can swim!' },
        { animal: 3, action: 'jump', can: true, real: 'jump', ask: 'Can a frog jump?', answer: 'Yes! A frog can jump!' },
        { animal: 5, action: 'walk', can: false, real: 'swim', ask: 'Can a fish walk?', answer: 'No! A fish can’t walk. It can swim!' },
        { animal: 4, action: 'fly', can: true, real: 'fly', ask: 'Can a bird fly?', answer: 'Yes! A bird can fly!' },
      ],
      doneLine: 'Super answers! Yes, it can! No, it can’t!',
    },
  },
  {
    id: 'ja3-song', kind: 'song', bg: bgWide, title: '\u{1F3B5} Ask Them! \u{1F3B5}',
    teacher: 'Sing! The question goes up — thumbs up on “Yes, it can!”, head shake on “No, it can’t!”',
    durationSeconds: 47, bigWord: 'Can it?', songUrl: SONG_A1U2L3, lineDurationsMs: SONG_A1U2L3_MS, lyrics: SONG_A1U2L3_LYRICS,
  },
  {
    id: 'ja3-who-can', kind: 'prea1', teacher: 'Guided: Who Can? Buzzer Show! Listen to the question, press the buzzer under the animal that CAN, then say the sentence.',
    scene: {
      id: 'ja3-who-can', kind: 'buzzer-show', bg: bgStage, who: 'pip',
      teacher: 'Listen! Who can do it? Press the right buzzer, then say it.',
      intro: 'Who can do it? Press the buzzer!',
      podiums: [{ x: 22.8, y: 72.5, by: 55.5 }, { x: 49.5, y: 72.5, by: 55.5 }, { x: 76.3, y: 72.5, by: 55.5 }],
      faces: JA_FACES,
      rounds: [
        { faces: [0, 3, 2], answer: 1, line: 'Who can fly?', reply: 'Yes! The bird can fly!', say: 'The bird can fly.' },
        { faces: [5, 1, 4], answer: 0, line: 'Who can climb a tree?', reply: 'Yes! The monkey can climb!', say: 'The monkey can climb.' },
        { faces: [3, 4, 1], answer: 2, line: 'Who can swim? It is big and green!', reply: 'Yes! The crocodile can swim!', say: 'The crocodile can swim.' },
        { faces: [2, 0, 5], answer: 1, line: 'Who can walk in the river? It is big and grey!', reply: 'Yes! The elephant can!', say: 'The elephant can walk in the river.' },
        { faces: [4, 2, 3], answer: 0, line: 'Who can jump? It is small and green!', reply: 'Yes! The frog can jump!', say: 'The frog can jump.' },
      ],
      doneLine: 'Buzzer champion! You know who can!',
    },
  },
  {
    id: 'ja3-move-break', kind: 'prea1', teacher: 'Brain break: Pip asks — the student answers and does it!',
    scene: {
      id: 'ja3-move-break', kind: 'tpr-actions', mode: 'break', bg: bgWide, who: 'pip', teacher: 'Can you do it? Show me!',
      rounds: [
        { line: 'Can you jump? Yes, I can! Jump, jump!', emoji: '\u{1F998}' },
        { line: 'Can you swim? Yes, I can! Swim, swim!', emoji: '\u{1F3CA}' },
        { line: 'Can you fly? No, I can’t! Flap, flap… no!', emoji: '\u{1F426}' },
        { line: 'Can you climb? Yes, I can! Climb, climb!', emoji: '\u{1F9D7}' },
      ],
    },
  },
  /* Reading: The Jungle Rescue pages 5-7 */
  {
    id: 'ja3-reader', kind: 'reader', bg: jungleRescue(5), title: 'The Jungle Rescue', doneLine: 'Willow can’t help. The fish can’t help. Who can help Kip? Find out next time!',
    teacher: 'Reading: page 5 again, then the new pages. Listen while the words light up, then the student reads.',
    pages: JUNGLE_RESCUE.slice(4, 7),
  },
  {
    id: 'ja3-read-check', kind: 'prea1', teacher: 'Reading: look at the picture, READ the sentence — tick or cross? Then say the true sentence.',
    scene: {
      id: 'ja3-read-check', kind: 'tick-cross', bg: bgWide, who: 'pip',
      teacher: 'Read it. Is it right? Tick or cross!',
      rounds: [
        { img: jungleRescue(5), sentence: 'Kip is on a rock.', isTrue: true },
        { img: jungleRescue(6), sentence: 'Willow can fly.', isTrue: true },
        { img: jungleRescue(6), sentence: 'Willow is big.', isTrue: false },
        { img: jungleRescue(7), sentence: 'The fish can lift Kip.', isTrue: false },
        { img: jungleRescue(3), sentence: 'The snake is long.', isTrue: true },
      ],
    },
  },
  /* Phonics: ck → Word Build → Blend & Read → tongue twister */
  {
    id: 'ja3-sound-ck', kind: 'sound-model', bg: bgWide, who: 'pip', letter: 'CK', phoneme: '/k/', sound: 'k', soundSide: 'center',
    teacher: 'Present: c + k at the END of a word say /k/ — duck, clock, socks, chick. Listen for the end!',
    anchors: [
      { word: 'duck', emoji: '\u{1F986}', img: it('duck-yellow') },
      { word: 'clock', emoji: '\u{1F570}\u{FE0F}', img: it('clock') },
      { word: 'socks', emoji: '\u{1F9E6}', img: it('socks-red') },
      { word: 'chick', emoji: '\u{1F424}', img: it('chick') },
    ],
  },
  {
    id: 'ja3-word-build', kind: 'word-build', bg: bgWide,
    teacher: 'Reading: which ending is missing? ck, ch or sh? Pick it, then read the word.',
    rounds: [
      { word: 'duck', tiles: ['d', 'u', 'ck'], blankIndex: 2, answer: 'ck', choices: ['ck', 'ch', 'sh'], img: it('duck-yellow'), emoji: '\u{1F986}' },
      { word: 'clock', tiles: ['c', 'l', 'o', 'ck'], blankIndex: 3, answer: 'ck', choices: ['sh', 'ck', 'ch'], img: it('clock'), emoji: '\u{1F570}\u{FE0F}' },
      { word: 'fish', tiles: ['f', 'i', 'sh'], blankIndex: 2, answer: 'sh', choices: ['ck', 'ch', 'sh'], img: it('fish'), emoji: '\u{1F41F}' },
      { word: 'chick', tiles: ['ch', 'i', 'ck'], blankIndex: 2, answer: 'ck', choices: ['ch', 'ck', 'sh'], img: it('chick'), emoji: '\u{1F424}' },
    ],
  },
  {
    id: 'ja3-blend', kind: 'sound-blend', bg: bgWide, look: 'slide',
    teacher: 'Reading: blend the word (ck is ONE sound), find the picture — then read the sentence.',
    rounds: [
      { word: 'duck', sounds: ['d', 'u', 'ck'], img: it('duck-yellow'), sentence: 'A duck can swim.' },
      { word: 'rock', sounds: ['r', 'o', 'ck'], img: it('stone'), sentence: 'Kip is on a rock.' },
      { word: 'chick', sounds: ['ch', 'i', 'ck'], img: it('chick'), sentence: 'A chick can’t swim.' },
    ],
  },
  { id: 'ja3-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgWide, who: 'pip', focus: 'ck', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, then faster.', line: 'A duck on a rock eats a snack.' },
  /* Free: the child asks */
  {
    id: 'ja3-flip-ask', kind: 'prea1', teacher: 'Free: Flip & Ask! The student flips a card and ASKS the question (🔊 = the model). The teacher answers “Yes, it can! / No, it can’t!” — then swap.',
    scene: {
      id: 'ja3-flip-ask', kind: 'flip-say', bg: bgWide, who: 'pip', title: 'Flip a card and ask!',
      teacher: 'Flip a card. Ask the question!',
      cards: [
        { label: 'frog', img: it('frog'), say: 'Can a frog jump?' },
        { label: 'snake', img: it('snake'), say: 'Can a snake fly?' },
        { label: 'elephant', img: it('elephant'), say: 'Can an elephant swim?' },
        { label: 'crocodile', img: it('alligator'), say: 'Can a crocodile climb?' },
        { label: 'bird', img: it('bird'), say: 'Can a bird swim?' },
        { label: 'monkey', img: it('coco-cheer'), say: 'Can a monkey swing?' },
      ],
      doneLine: 'Great questions! You can ask!',
    },
  },
  {
    id: 'ja3-interview', kind: 'join-stage', bg: bgFriends, teacher: 'Free: the student interviews Coco (the teacher answers as Coco), then Coco asks the student.', cast: ['coco', 'pip'],
    turns: [
      { who: 'coco', line: 'Ask me! What can I do?' },
      { who: 'student', line: 'Coco, can you climb?' },
      { who: 'coco', line: 'Yes, I can! Ask me again!' },
      { who: 'student', line: 'Can you fly?' },
      { who: 'coco', line: 'No, I can’t! Now my turn: can you swim?' },
      { who: 'student', line: 'Yes, I can. / No, I can’t.' },
    ],
  },
  { id: 'ja3-i-can', kind: 'meet', focus: ['Can it'], bg: bgFriends, who: 'coco', cardSide: 'left', teacher: 'Check: say it and get your passport stamp!', line: 'I can ask “Can it swim?” and answer “Yes, it can!”', repeat: 'Can it swim?' },
  {
    id: 'ja3-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the question sticker in their Sticker Book.',
    scene: {
      id: 'ja3-sticker', kind: 'sticker-reward', bg: bgFriends, who: 'pip', teacher: 'Sticker time!',
      line: 'Super questions! Here is your sticker.',
      sticker: { img: it('alligator'), label: 'Question champion' },
    },
  },
  {
    id: 'ja3-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ja3-home-mission', kind: 'home-mission', bg: bgFriends, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned to ask "Can it…?" and answer "Yes, it can. / No, it can\'t." Let them ask you three questions about animals and sing "Ask Them!".',
      steps: [
        { emoji: '\u{2753}', say: 'Ask a grown-up: Can a fish fly?' },
        { emoji: '\u{1F44D}', say: 'Answer: Yes, it can! No, it can’t!' },
        { emoji: '\u{1F3B5}', say: 'Sing the song Ask Them!' },
      ],
    },
  },
  {
    id: 'ja3-goodbye-song', kind: 'song', bg: bgFriends, title: '\u{1F3B5} Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: '/welcome-town/audio/goodbye-song.mp3?v=3',
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'coco', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'leo', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'willow', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'coco', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },
  { id: 'ja3-finale', kind: 'finale', bg: bgFriends, who: 'coco', line: 'You can ask “Can it…?” and answer! Who can help Kip? Find out next time! \u{1F418}' },
];

/* =============================================================================
 * A1 Unit 2 Lesson 4: "Talk About Animals!" (built 2026-10-13, plan docs/a1-unit-2-jungle.md §5.4)
 *
 * Objective: I can describe an animal in 4 sentences and ask "Can it…?". Evidence: Animal Riddle (the child gives a
 * 4-clue riddle) + the Field Guide card the child builds and reads. The child is the expert: Coco says wrong things
 * ("The elephant is small and green!") and the child corrects her. New: "It's got a long tail / a long nose."
 * Reading: The Jungle Rescue pp. 7-9 (the crocodile can swim — "No! Your teeth!"; the elephant is big). Phonics: sh.
 * Research (mechanics only): "What Am I?" riddle cards (TES / games4esl: I am… I have… I can…), Cambridge Starters
 * "describe … colour, size", Kid's Box 1 wild-animals description. Better: the child builds and reads a 4-sentence card
 * checked against the real animal (Field Guide, new kind `field-guide`), and corrects a friend's mistakes.
 * Plan swap: "Mixed-up Animal" → Field Guide (no new part art; it is exactly the unit's 4-sentence description).
 * ========================================================================= */

export const LESSON_A1U2L4_TITLE = 'Talk About Animals!';
export const LESSON_A1U2L4_OBJECTIVE = 'I can describe an animal in 4 sentences — "It\'s a crocodile. It\'s big and green. It can swim. It can\'t fly." — and ask "Can it…?".';

const FG = (name: string, img: string, size: [string, string[]], colour: [string, string[]], can: [string, string[]], cant: [string, string[]]) => ({
  name, img,
  lines: [
    { frame: 'It’s ___.', answer: size[0], options: size[1], no: `No! It isn’t ${size[1].find((o) => o !== size[0])}!` },
    { frame: 'It’s ___.', answer: colour[0], options: colour[1], no: 'No! Look at the colour!' },
    { frame: 'It can ___.', answer: can[0], options: can[1], no: 'No! It can’t do that!' },
    { frame: 'It can’t ___.', answer: cant[0], options: cant[1], no: 'Oh, but it can do that!' },
  ],
});

export const LESSON_A1U2L4_SCENES: Scene[] = [
  { id: 'ja4-title', kind: 'title-card', bg: jungleRescue(9), level: 'A1', unit: 'Unit 2', lessonLabel: 'Lesson 4', title: 'Talk About Animals!', subtitle: 'Be the jungle expert: say it in 4 sentences', cta: '\u{1F4D2} LET’S TALK!' },
  {
    id: 'ja4-recall-warmup', kind: 'recall-warmup', bg: bgWide, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 2 · Lesson 3 · Can It…?',
    teacher: 'Guided: listen — who is it? Click it, then ask Pip a question about it: Can it fly?',
    items: [
      { word: 'bird', say: 'It can fly, but it is small.', img: it('bird') },
      { word: 'fish', say: 'It can swim. It can’t walk.', img: it('fish') },
      { word: 'crocodile', say: 'It can swim. It is big and green.', img: it('alligator') },
      { word: 'monkey', say: 'It can climb and swing.', img: it('coco-cheer') },
    ],
  },
  /* Present: it's got … (one chunk, its own story picture each) */
  { id: 'ja4-model-nose', kind: 'meet', focus: ['long nose'], bg: jungleRescue(10), who: 'pip', cardSide: 'left', teacher: 'Present: point to the elephant’s trunk — its long nose! Listen, then say it with a long arm.', line: 'Look! The elephant has got a long nose. It’s got a long nose!', repeat: 'It’s got a long nose!' },
  { id: 'ja4-model-tail', kind: 'meet', focus: ['long tail'], bg: jungleRescue(8), who: 'pip', cardSide: 'left', teacher: 'Present: point to the crocodile’s tail. It’s got a long tail!', line: 'The crocodile has got a long tail. It’s got a long tail!', repeat: 'It’s got a long tail!' },
  { id: 'ja4-echo', kind: 'echo', bg: bgWide, who: 'pip', textSide: 'top', teacher: 'Guided: say it like Pip — a long, long tail!', word: 'It’s got a long tail.' },
  /* ★ Animal Riddle: four clues, the child guesses */
  {
    id: 'ja4-riddle', kind: 'prea1', teacher: 'Guided: Animal Riddle! Listen to the four clues and pick the animal. Then say the four sentences yourself.',
    scene: {
      id: 'ja4-riddle', kind: 'animal-riddle', bg: bgWide, who: 'pip', ask: 'What animal is it?', teacher: 'Listen to the clues. What animal is it?',
      animals: [
        { label: 'elephant', img: it('elephant'), say: 'I’m an elephant! I’ve got a long nose!' },
        { label: 'crocodile', img: it('alligator'), say: 'I’m a crocodile! I’ve got a long tail!' },
        { label: 'snake', img: it('snake'), say: 'I’m a snake! I’m long!' },
        { label: 'monkey', img: it('coco-cheer'), say: 'I’m a monkey! I can climb!' },
        { label: 'frog', img: it('frog'), say: 'I’m a frog! I can jump!' },
        { label: 'bird', img: it('bird'), say: 'I’m a bird! I can fly!' },
      ],
      rounds: [
        { answer: 0, options: [0, 3, 4], clues: ['It’s big.', 'It’s grey.', 'It’s got a long nose.', 'It can’t fly.'] },
        { answer: 1, options: [2, 1, 4], clues: ['It’s green.', 'It’s big.', 'It’s got a long tail.', 'It can swim.'] },
        { answer: 5, options: [3, 5, 2], clues: ['It’s small.', 'It’s blue.', 'It can fly.', 'It can’t swim.'] },
        { answer: 2, options: [2, 0, 4], clues: ['It’s long.', 'It’s green.', 'It can climb a tree.', 'It can’t run.'] },
      ],
      doneLine: 'Riddle champion! Now YOU make a riddle!',
    },
  },
  {
    id: 'ja4-sing-back', kind: 'song', bg: bgWide, title: '\u{1F3B5} Ask Them! \u{1F3B5}',
    teacher: 'Sing-back: the student sings the questions, the teacher sings the answers — then swap!',
    durationSeconds: 47, bigWord: 'Can it?', songUrl: SONG_A1U2L3, lineDurationsMs: SONG_A1U2L3_MS, lyrics: SONG_A1U2L3_LYRICS,
  },
  /* ★ Field Guide: the child writes the 4-sentence card */
  {
    id: 'ja4-field-guide', kind: 'field-guide', bg: bgWide, who: 'pip', title: 'My Jungle Field Guide',
    teacher: 'Free (guided): build each animal’s card — pick the right word for every sentence, then read the whole card aloud and tap ✓.',
    animals: [
      FG('elephant', it('elephant'), ['big', ['big', 'small']], ['grey', ['grey', 'green', 'blue']], ['swim', ['swim', 'fly']], ['fly', ['fly', 'walk']]),
      FG('crocodile', it('alligator'), ['big', ['small', 'big']], ['green', ['brown', 'green', 'grey']], ['swim', ['fly', 'swim']], ['climb', ['swim', 'climb']]),
      FG('frog', it('frog'), ['small', ['big', 'small']], ['green', ['green', 'grey', 'yellow']], ['jump', ['jump', 'fly']], ['fly', ['jump', 'fly']]),
    ],
    doneLine: 'Your field guide is ready! You are a jungle expert!',
  },
  {
    id: 'ja4-move-break', kind: 'prea1', teacher: 'Brain break: be the animals with Pip!',
    scene: {
      id: 'ja4-move-break', kind: 'tpr-actions', mode: 'break', bg: bgWide, who: 'pip', teacher: 'Show me!',
      rounds: [
        { line: 'Make a long nose! Swing it like an elephant!', emoji: '\u{1F418}' },
        { line: 'Make a long tail! Swish, swish!', emoji: '\u{1F40A}' },
        { line: 'Be small! Be big!', emoji: '\u{2195}\u{FE0F}' },
        { line: 'Swim like a crocodile! Snap, snap!', emoji: '\u{1F30A}' },
      ],
    },
  },
  /* Reading: The Jungle Rescue pages 7-9 */
  {
    id: 'ja4-reader', kind: 'reader', bg: jungleRescue(8), title: 'The Jungle Rescue', doneLine: 'The elephant is big. Can it help Kip? Find out in the storybook!',
    teacher: 'Reading: page 7 again, then the new pages. Listen while the words light up, then the student reads.',
    pages: JUNGLE_RESCUE.slice(6, 9),
  },
  {
    id: 'ja4-build', kind: 'sentence-build', bg: bgWide, teacher: 'Reading: put the words of the story in order, then read the sentence.',
    rounds: [
      { words: ['I', 'can', 'swim!'], emoji: '\u{1F40A}' },
      { words: ['Can', 'I', 'help?'], emoji: '\u{2753}' },
      { words: ['I', 'am', 'big.'], emoji: '\u{1F418}' },
      { words: ['It', 'can', 'walk', 'in', 'the', 'river.'], emoji: '\u{1F30A}' },
    ],
  },
  /* Phonics: sh → Sound Mole → Blend & Read → tongue twister */
  {
    id: 'ja4-sound-sh', kind: 'sound-model', bg: bgWide, who: 'willow', letter: 'SH', phoneme: '/sh/', sound: 'sh', soundSide: 'center',
    teacher: 'Present: s + h make ONE quiet sound, /sh/ — finger on your lips: shhh! Ship, shell, sheep, shoe.',
    anchors: [
      { word: 'ship', emoji: '\u{1F6A2}', img: it('ship') },
      { word: 'shell', emoji: '\u{1F41A}', img: it('shell') },
      { word: 'sheep', emoji: '\u{1F411}', img: it('sheep') },
      { word: 'shoe', emoji: '\u{1F45F}', img: it('shoe') },
    ],
  },
  {
    id: 'ja4-sound-mole', kind: 'prea1', teacher: 'Reading: Sound Moles! Hear /sh/, then bonk every mole whose picture starts with /sh/ — not /s/!',
    scene: {
      id: 'ja4-sound-mole', kind: 'sound-mole', bg: bgWide, who: 'willow', teacher: 'Hear the sound, then bonk every mole whose picture starts with it!',
      rounds: [
        { letter: 'sh', pictures: [{ word: 'ship', img: it('ship') }, { word: 'shell', img: it('shell') }, { word: 'sheep', img: it('sheep') }, { word: 'sun', img: it('sun') }, { word: 'socks', img: it('socks-red') }] },
      ],
    },
  },
  {
    id: 'ja4-blend', kind: 'sound-blend', bg: bgWide, look: 'gumball',
    teacher: 'Reading: blend the word (sh is ONE sound), find the picture — then read the sentence.',
    rounds: [
      { word: 'fish', sounds: ['f', 'i', 'sh'], img: it('fish'), sentence: 'A fish can swim. It can’t lift Kip.' },
      { word: 'ship', sounds: ['sh', 'i', 'p'], img: it('ship'), sentence: 'Look! A big ship.' },
      { word: 'shell', sounds: ['sh', 'e', 'll'], img: it('shell'), sentence: 'It’s a small shell.' },
    ],
  },
  { id: 'ja4-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgWide, who: 'willow', focus: 'sh', teacher: 'Reading: quick reading! Listen to Willow, then say it slow, then faster.', line: 'Shy fish swish and splash.' },
  /* Free: the child is the expert */
  {
    id: 'ja4-expert', kind: 'join-stage', bg: bgFriends, teacher: 'Free: Coco gets it wrong on purpose — the student corrects her in whole sentences.', cast: ['coco', 'pip'],
    turns: [
      { who: 'coco', line: 'The elephant is small and green!' },
      { who: 'student', line: 'No! It’s big and grey!' },
      { who: 'coco', line: 'The snake can run!' },
      { who: 'student', line: 'No! It can’t run. It can climb.' },
      { who: 'coco', line: 'The crocodile has got a short tail!' },
      { who: 'student', line: 'No! It’s got a long tail!' },
    ],
  },
  {
    id: 'ja4-my-riddle', kind: 'join-stage', bg: bgFriends, teacher: 'Free: the student picks an animal in secret and gives four clues; the teacher guesses. Then the student asks the teacher one “Can it…?” question.', cast: ['coco', 'pip'],
    turns: [
      { who: 'coco', line: 'Your turn! Give me a riddle — four clues!' },
      { who: 'student', line: 'It’s … It’s … It can … It can’t …' },
      { who: 'coco', line: 'Is it a …? Ask me a question too!' },
      { who: 'student', line: 'Can it …?' },
    ],
  },
  { id: 'ja4-i-can', kind: 'meet', focus: ['4 sentences'], bg: bgFriends, who: 'coco', cardSide: 'left', teacher: 'Check: say it and get your passport stamp!', line: 'I can talk about an animal in 4 sentences!', repeat: 'It’s big. It’s grey. It can swim. It can’t fly.' },
  {
    id: 'ja4-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the expert sticker in their Sticker Book.',
    scene: {
      id: 'ja4-sticker', kind: 'sticker-reward', bg: bgFriends, who: 'pip', teacher: 'Sticker time!',
      line: 'Jungle expert! Here is your sticker.',
      sticker: { img: it('frog'), label: 'Jungle expert' },
    },
  },
  {
    id: 'ja4-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ja4-home-mission', kind: 'home-mission', bg: bgFriends, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned to describe an animal in 4 sentences ("It\'s big. It\'s grey. It can swim. It can\'t fly.") and "It\'s got a long tail." Let them give you an animal riddle — guess the animal!',
      steps: [
        { emoji: '\u{1F914}', say: 'Give your family an animal riddle: four clues.' },
        { emoji: '\u{1F4D2}', say: 'Draw your favourite animal and write: It’s big.' },
        { emoji: '\u{1F4D6}', say: 'Read pages 7 to 9 of the story.' },
      ],
    },
  },
  {
    id: 'ja4-goodbye-song', kind: 'song', bg: bgFriends, title: '\u{1F3B5} Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: '/welcome-town/audio/goodbye-song.mp3?v=3',
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'coco', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'leo', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'willow', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'coco', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },
  { id: 'ja4-finale', kind: 'finale', bg: bgFriends, who: 'coco', line: 'You are a jungle expert! Next time: can the elephant help Kip? \u{1F418}' },
];

/* =============================================================================
 * A1 Unit 2 Lesson 5: "Storybook: The Jungle Rescue" (built 2026-10-13, plan docs/a1-unit-2-jungle.md §5.5)
 *
 * Objective: I can read "The Jungle Rescue" with help and say who can help and why. Evidence: at the pause the child
 * chooses who helps Kip, then retells: "The elephant. It is big. It can walk in the river." Whole book in the Reader
 * (pp. 1-8, the pause, pp. 9-12), Rescue Map (draw-path: take Pip to the animal described), Odd One Out (which one is
 * different — and why), act it out (the child is the elephant), phonics review of the unit's sounds, Blend & Read, twister.
 * Research (mechanics only): Oxford Reading Tree one growing story; Blue's Clues pause before the answer; Cambridge
 * story retell. Better: the child decides at the pause with the unit language (who CAN help) and then retells why.
 * A stills film of the book needs an approved scenario first (kids-video-scenario) — not in this lesson.
 * ========================================================================= */

export const LESSON_A1U2L5_TITLE = 'Storybook: The Jungle Rescue';
export const LESSON_A1U2L5_OBJECTIVE = 'I can read "The Jungle Rescue" with help and say who can help Kip and why: "The elephant. It is big. It can walk in the river."';

export const LESSON_A1U2L5_SCENES: Scene[] = [
  { id: 'ja5-title', kind: 'title-card', bg: jungleRescue(10), level: 'A1', unit: 'Unit 2', lessonLabel: 'Lesson 5', title: 'The Jungle Rescue', subtitle: 'Read the whole story — who can help Kip?', cta: '\u{1F4D6} LET’S READ!' },
  {
    id: 'ja5-recall-warmup', kind: 'recall-warmup', bg: bgWide, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 2 · Lesson 4 · Talk About Animals!',
    teacher: 'Guided: listen to the riddle — which animal is it? Click it and add one more sentence.',
    items: [
      { word: 'elephant', say: 'It’s big. It’s got a long nose.', img: it('elephant') },
      { word: 'crocodile', say: 'It’s green. It’s got a long tail.', img: it('alligator') },
      { word: 'snake', say: 'It’s long. It can climb a tree.', img: it('snake') },
      { word: 'frog', say: 'It’s small and green. It can jump.', img: it('frog') },
    ],
  },
  { id: 'ja5-predict', kind: 'meet', focus: ['help'], bg: jungleRescue(5), who: 'pip', cardSide: 'left', teacher: 'Present: Kip is stuck! Ask the student: who can help? Willow? The fish? Let them guess before reading.', line: 'Oh no! Kip is on a rock. Who can help Kip?', repeat: 'Who can help?' },
  {
    id: 'ja5-book-1', kind: 'reader', bg: bgWide, title: 'The Jungle Rescue', doneLine: 'Stop! Who can help Kip? You choose!',
    teacher: 'Reading: the student reads pages 1-8 (listen first only where needed). Tap any word to hear it.',
    pages: JUNGLE_RESCUE.slice(0, 8),
  },
  {
    id: 'ja5-pause', kind: 'choice', bg: jungleRescue(8), who: 'pip',
    teacher: 'The pause: the student chooses who can help Kip — and says why. A wrong friend: ask “Can it…?” and look at the story again.',
    prompt: 'Who can help Kip? Why?',
    options: [
      { label: 'Willow — she can fly', emoji: '\u{1F426}' },
      { label: 'The fish — it can swim', emoji: '\u{1F41F}' },
      { label: 'The elephant — it is big', emoji: '\u{1F418}', correct: true },
    ],
  },
  {
    id: 'ja5-book-2', kind: 'reader', bg: bgWide, title: 'The Jungle Rescue', doneLine: 'The end! The elephant can help — and Kip is safe!',
    teacher: 'Reading: the student reads pages 9-12, the happy end.',
    pages: JUNGLE_RESCUE.slice(8, 12),
  },
  {
    id: 'ja5-rescue-map', kind: 'prea1', teacher: 'Guided: Rescue Map! Listen to the description and draw a line from Pip to the right animal. Then say who it is.',
    scene: {
      id: 'ja5-rescue-map', kind: 'draw-path', bg: bgWide, who: 'pip', walker: 'pip',
      teacher: 'Listen and draw a line from Pip to the animal!',
      start: { x: 9, y: 84 },
      spots: [
        { label: 'elephant', img: it('elephant'), x: 74, y: 70, size: 13 },
        { label: 'bird', img: it('bird'), x: 46, y: 36, size: 8 },
        { label: 'crocodile', img: it('alligator'), x: 52, y: 82, size: 12 },
        { label: 'fish', img: it('fish'), x: 30, y: 58, size: 8 },
      ],
      rounds: [
        { line: 'Take Pip to the animal that can fly. But it is small!', target: 1, reply: 'It’s the bird. It can fly!' },
        { line: 'Take Pip to the animal with a long tail. It can swim!', target: 2, reply: 'It’s the crocodile. It can swim!' },
        { line: 'Now take Pip to the animal that can help Kip. It is big and grey!', target: 0, reply: 'It’s the elephant! It can walk in the river!' },
      ],
    },
  },
  {
    id: 'ja5-song', kind: 'song', bg: bgWide, title: '\u{1F3B5} Ask Them! \u{1F3B5}',
    teacher: 'Story song: sing the questions and answers — thumbs up, head shake!',
    durationSeconds: 47, bigWord: 'Can it?', songUrl: SONG_A1U2L3, lineDurationsMs: SONG_A1U2L3_MS, lyrics: SONG_A1U2L3_LYRICS,
  },
  {
    id: 'ja5-odd', kind: 'prea1', teacher: 'Guided: Odd One Out! Which one is different? Tap it, then say why: The bird can fly. The others can swim.',
    scene: {
      id: 'ja5-odd', kind: 'odd-one-out', bg: bgWide, who: 'pip',
      teacher: 'Which one is different? Tap it and say why!',
      rounds: [
        { items: [{ label: 'elephant', img: it('elephant') }, { label: 'crocodile', img: it('alligator') }, { label: 'bird', img: it('bird') }, { label: 'fish', img: it('fish') }], odd: 2, line: 'The bird can fly. The others can swim!' },
        { items: [{ label: 'snake', img: it('snake') }, { label: 'elephant', img: it('elephant') }, { label: 'frog', img: it('frog') }, { label: 'crocodile', img: it('alligator') }], odd: 1, line: 'The elephant is grey. The others are green!' },
        { items: [{ label: 'bird', img: it('bird') }, { label: 'frog', img: it('frog') }, { label: 'elephant', img: it('elephant') }, { label: 'fish', img: it('fish') }], odd: 2, line: 'The elephant is big. The others are small!' },
      ],
    },
  },
  {
    id: 'ja5-act-out', kind: 'join-stage', bg: jungleRescue(9), teacher: 'Free: act it out! The student is the elephant (long-nose arm!), the teacher is Coco.', cast: ['coco', 'pip'],
    turns: [
      { who: 'coco', line: 'Help! Kip is on a rock! Can you help?' },
      { who: 'student', line: 'I am big. I can walk in the river.' },
      { who: 'coco', line: 'Can you lift Kip?' },
      { who: 'student', line: 'Yes, I can! I’ve got a long nose.' },
      { who: 'coco', line: 'Thank you, Elephant!' },
      { who: 'student', line: 'Lunch! Chips for all!' },
    ],
  },
  /* Phonics review: the unit's sounds → Blend & Read → twister */
  {
    id: 'ja5-sound-pick', kind: 'prea1', teacher: 'Reading: Sound Pick! Hear the sound, pick the picture that starts with it — i, ch or sh.',
    scene: {
      id: 'ja5-sound-pick', kind: 'sound-pick', bg: bgWide, who: 'pip', teacher: 'Which one starts with this sound?',
      rounds: [
        { sound: 'ch', options: [{ word: 'ship', img: it('ship') }, { word: 'chick', img: it('chick') }, { word: 'igloo', img: it('igloo') }], answer: 1 },
        { sound: 'sh', options: [{ word: 'sheep', img: it('sheep') }, { word: 'chair', img: it('chair') }, { word: 'ink', img: it('ink') }], answer: 0 },
        { sound: 'i', options: [{ word: 'cheese', img: it('cheese') }, { word: 'shell', img: it('shell') }, { word: 'insect', img: it('insect') }], answer: 2 },
      ],
    },
  },
  {
    id: 'ja5-blend', kind: 'sound-blend', bg: bgWide,
    teacher: 'Reading: blend the word from the story, find the picture — then read the story sentence.',
    rounds: [
      { word: 'big', img: it('elephant'), sentence: 'I am big. I can walk in the river.' },
      { word: 'swim', sounds: ['s', 'w', 'i', 'm'], img: it('fish-swim'), sentence: 'I can swim. I can’t lift Kip!' },
      { word: 'chip', sounds: ['ch', 'i', 'p'], img: it('chip'), sentence: 'Lunch! Chips for all!' },
    ],
  },
  { id: 'ja5-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgWide, who: 'pip', focus: 'i|ck', teacher: 'Reading: the story twister! Listen to Pip, then say it slow, then faster.', line: 'Big Kip sits on a big rock.' },
  /* Free: retell — who can help and why */
  {
    id: 'ja5-retell', kind: 'join-stage', bg: jungleRescue(11), teacher: 'Free: the student retells the story — who can’t help and why, who can help and why.', cast: ['pip', 'coco'],
    turns: [
      { who: 'pip', line: 'Where is Kip?' },
      { who: 'student', line: 'Kip is on a rock.' },
      { who: 'pip', line: 'Can Willow help? Why?' },
      { who: 'student', line: 'No. She can fly, but she is small.' },
      { who: 'pip', line: 'Who can help Kip? Why?' },
      { who: 'student', line: 'The elephant. It is big. It can walk in the river.' },
    ],
  },
  { id: 'ja5-i-can', kind: 'meet', focus: ['read'], bg: jungleRescue(12), who: 'coco', cardSide: 'left', teacher: 'Check: say it and get your passport stamp!', line: 'I can read The Jungle Rescue and say who can help!', repeat: 'The elephant can help!' },
  {
    id: 'ja5-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the story sticker in their Sticker Book.',
    scene: {
      id: 'ja5-sticker', kind: 'sticker-reward', bg: jungleRescue(12), who: 'pip', teacher: 'Sticker time!',
      line: 'You read the whole story! Here is your sticker.',
      sticker: { img: it('elephant'), label: 'The Jungle Rescue' },
    },
  },
  {
    id: 'ja5-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ja5-home-mission', kind: 'home-mission', bg: bgFriends, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child read the whole story "The Jungle Rescue". Let them read it to you and ask: "Who can help Kip? Why?"',
      steps: [
        { emoji: '\u{1F4D6}', say: 'Read the story to your family.' },
        { emoji: '\u{2753}', say: 'Ask them: Who can help Kip?' },
        { emoji: '\u{1F418}', say: 'Act it out: you are the elephant!' },
      ],
    },
  },
  {
    id: 'ja5-goodbye-song', kind: 'song', bg: bgFriends, title: '\u{1F3B5} Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: '/welcome-town/audio/goodbye-song.mp3?v=3',
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'coco', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'leo', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'willow', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'coco', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },
  { id: 'ja5-finale', kind: 'finale', bg: jungleRescue(12), who: 'coco', line: 'You read the whole story! Kip is safe! Thank you, friends! \u{1F418}\u{1F412}' },
];
