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
  { id: 'ja-meet-coco', kind: 'meet', focus: ['small'], bg: bgCocoVines, who: 'coco', cardSide: 'left', teacher: 'Present: meet Coco! She lives in the jungle. Point: small, brown.', line: 'Hi! I’m Coco. I’m small and brown!', repeat: 'Small and brown!' },
  { id: 'ja-meet-snake', kind: 'meet', focus: ['long'], bg: jungleRescue(3), who: 'pip', cardSide: 'left', teacher: 'Present: show “long” with your arms — wide, wide, wide! Then say it.', line: 'Look! A snake! It’s long and green.', repeat: 'It’s long!' },
  { id: 'ja-echo', kind: 'echo', bg: bgWide, who: 'pip', textSide: 'top', teacher: 'Guided: say it like Pip — loud, then quiet!', word: 'It’s big and grey.' },
  { id: 'ja-echo-2', kind: 'echo', bg: bgWide, who: 'coco', textSide: 'top', teacher: 'Guided: say it with Coco — a long, long voice for “long”!', word: 'It’s long and green.' },
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
    id: 'ja-mystery-bag', kind: 'prea1', teacher: 'Guided: Who is in the bag? Look at the shape, tap the animal — then say it with its colour: It’s a grey elephant!',
    scene: {
      id: 'ja-mystery-bag', kind: 'mystery-bag', bg: bgWide, who: 'leo',
      question: 'Who is in the bag?', doneText: 'You found every animal!',
      teacher: 'Look at the shape. Who is in the bag? Tap it and say it!',
      rounds: [
        { img: ANIMALS.elephant.img, toyWord: 'ELEPHANT', colorWord: 'GREY', colorHex: '#94A3B8', options: [{ toyWord: 'ELEPHANT', img: ANIMALS.elephant.img }, { toyWord: 'LION', img: ANIMALS.lion.img }, { toyWord: 'FROG', img: ANIMALS.frog.img }] },
        { img: ANIMALS.snake.img, toyWord: 'SNAKE', colorWord: 'GREEN', colorHex: '#16A34A', options: [{ toyWord: 'BIRD', img: ANIMALS.bird.img }, { toyWord: 'SNAKE', img: ANIMALS.snake.img }, { toyWord: 'MONKEY', img: ANIMALS.monkey.img }] },
        { img: ANIMALS.bird.img, toyWord: 'BIRD', colorWord: 'BLUE', colorHex: '#3B82F6', options: [{ toyWord: 'FISH', img: ANIMALS.fish.img }, { toyWord: 'CROCODILE', img: ANIMALS.crocodile.img }, { toyWord: 'BIRD', img: ANIMALS.bird.img }] },
        { img: ANIMALS.lion.img, toyWord: 'LION', colorWord: 'YELLOW', colorHex: '#EAB308', options: [{ toyWord: 'LION', img: ANIMALS.lion.img }, { toyWord: 'SNAKE', img: ANIMALS.snake.img }, { toyWord: 'ELEPHANT', img: ANIMALS.elephant.img }] },
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
    // Hidden-object picture made for this game (Canva, 2026-10-13): eight animals, each partly hidden.
    id: 'ja-i-spy', kind: 'i-spy', bg: `${J}/scenes/bg-jungle-ispy-wide.png`, who: 'pip', guide: item('pip-binoculars'),
    teacher: 'Guided: I Spy! Pip gives a clue — the student moves the binoculars to the animal, then says it: It’s a frog!',
    rounds: [
      { clue: 'I spy something small and green!', spot: { left: 47, top: 78, r: 4 }, answer: 'It’s a frog!' },
      { clue: 'I spy something big and grey!', spot: { left: 82, top: 42, r: 8 }, answer: 'It’s an elephant!' },
      { clue: 'I spy something small and blue!', spot: { left: 80.7, top: 15, r: 3.5 }, answer: 'It’s a bird!' },
      { clue: 'I spy something long and green — in a tree!', spot: { left: 46.5, top: 18, r: 6 }, answer: 'It’s a snake!' },
      { clue: 'I spy something big and yellow!', spot: { left: 27, top: 43, r: 6 }, answer: 'It’s a lion!' },
      { clue: 'I spy something small and orange!', spot: { left: 63, top: 85, r: 4 }, answer: 'It’s a fish!' },
    ],
    doneLine: 'Super spying! You found every animal!',
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
  { id: 'ja-jigsaw', kind: 'jigsaw-puzzle', bg: bgWide, teacher: 'Build the story picture — then read its page!', image: jungleRescue(3), rows: 2, cols: 3 },
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
    id: 'ja-first-sound', kind: 'first-sound', bg: bgWide, prompt: 'Catch the fish with the first sound!',
    teacher: 'Reading: hear the animal, catch the fish with its first sound (the recorded sound plays). Snake — /s/!',
    rounds: [
      { word: 'snake', letter: 's', choices: ['s', 'm', 'l'], img: ANIMALS.snake.img },
      { word: 'monkey', letter: 'm', choices: ['b', 'm', 'f'], img: ANIMALS.monkey.img },
      { word: 'lion', letter: 'l', choices: ['l', 's', 'b'], img: ANIMALS.lion.img },
      { word: 'bird', letter: 'b', choices: ['f', 'm', 'b'], img: ANIMALS.bird.img },
      { word: 'frog', letter: 'f', choices: ['f', 'l', 's'], img: ANIMALS.frog.img },
    ],
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
  {
    id: 'ja-guess-me', kind: 'join-stage', bg: bgFriends, teacher: 'Free: the student thinks of an animal and describes it in two sentences — Pip guesses. Then swap!', cast: ['pip'],
    turns: [
      { who: 'student', line: 'It’s long. It’s green.' },
      { who: 'pip', line: 'Is it a snake?' },
      { who: 'student', line: 'Yes! Now you, Pip!' },
      { who: 'pip', line: 'It’s big. It’s grey.' },
      { who: 'student', line: 'It’s an elephant!' },
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
    id: 'ja-move-break-2', kind: 'prea1', teacher: 'Brain break: big and small with Coco!',
    scene: {
      id: 'ja-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgFriends, who: 'pip', teacher: 'Big and small!',
      rounds: [
        { line: 'Be big like an elephant! Arms up, up, up!', emoji: '\u{1F418}' },
        { line: 'Be small like a frog! Down, down, down!', emoji: '\u{1F438}' },
        { line: 'Be long like a snake! Lie down and stretch!', emoji: '\u{1F40D}' },
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
  { id: 'ja2-echo-cant', kind: 'echo', bg: bgCocoCantFly, who: 'coco', textSide: 'top', teacher: 'Guided: say it with Coco — shake your head on “can’t”!', word: 'I can’t fly!' },
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
  {
    id: 'ja2-catch', kind: 'prea1', teacher: 'Guided: can or can’t? Catch each card in the right basket and say the sentence: A fish can swim! / A fish can’t fly!',
    scene: {
      id: 'ja2-catch', kind: 'catch-sort', bg: bgActions, goal: 6, seconds: 50,
      teacher: 'Can or can’t? Catch it in the right basket and say it!',
      left: { label: 'It can!', emoji: '\u{1F44D}' }, right: { label: 'It can’t!', emoji: '\u{1F44E}' },
      items: [
        { word: 'fish · swim', emoji: '\u{1F41F}', target: 'left' },
        { word: 'fish · run', emoji: '\u{1F41F}', target: 'right' },
        { word: 'bird · fly', emoji: '\u{1F426}', target: 'left' },
        { word: 'monkey · fly', emoji: '\u{1F412}', target: 'right' },
        { word: 'monkey · climb', emoji: '\u{1F412}', target: 'left' },
        { word: 'lion · swing', emoji: '\u{1F981}', target: 'right' },
        { word: 'frog · jump', emoji: '\u{1F438}', target: 'left' },
      ],
    },
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
  {
    id: 'ja2-claw', kind: 'prea1', teacher: 'Guided: Jungle Grabber! Listen, grab the animal that CAN do it, then say: A monkey can climb!',
    scene: {
      id: 'ja2-claw', kind: 'claw-machine', bg: '/lep1/scenes/bg-u3l6-claw-machine-wide.png', who: 'leo', clawImg: '/lep1/items/item-claw.png',
      teacher: 'Grab the animal that can do it — then say the sentence!',
      glass: { x: 49, y: 43, w: 50, h: 52 },
      toys: [
        { label: 'monkey', img: it('coco-swing'), x: 12, size: 9 },
        { label: 'fish', img: it('fish-swim'), x: 31, size: 9 },
        { label: 'lion', img: it('leo-run'), x: 50, size: 9 },
        { label: 'bird', img: it('willow-fly'), x: 69, size: 9 },
        { label: 'frog', img: it('jungle-frog-jump'), x: 88, size: 9 },
      ],
      rounds: [
        { target: 0, line: 'Get the animal that can climb!', reply: 'A monkey! A monkey can climb!' },
        { target: 1, line: 'Get the animal that can swim!', reply: 'A fish! A fish can swim!' },
        { target: 3, line: 'Get the animal that can fly!', reply: 'A bird! A bird can fly!' },
        { target: 4, line: 'Get the animal that can jump!', reply: 'A frog! A frog can jump!' },
      ],
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
  {
    id: 'ja2-you-can', kind: 'join-stage', bg: bgFriends, teacher: 'Free: What can YOU do? The friends ask, the student answers about themself — any true answer is right.', cast: ['coco', 'leo'],
    turns: [
      { who: 'coco', line: 'I can climb! Can you climb?' },
      { who: 'student', line: 'Yes! I can climb. / No, I can’t climb.' },
      { who: 'leo', line: 'I can run fast! What can you do?' },
      { who: 'student', line: 'I can … I can’t …' },
    ],
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
  {
    id: 'ja2-balloon', kind: 'save-balloon', bg: bgWide, who: 'coco', balloonImg: it('coco-cheer'), title: 'Save the Balloon! Spell the word!',
    teacher: 'Reading: listen to the sentence, look at the picture — tap the letters to spell the word (ch is two letters!). Every right letter lifts Coco’s balloon.',
    rounds: [
      { word: 'chips', img: it('chip'), sentence: 'Lunch! Chips for all!' },
      { word: 'chick', img: it('chick'), sentence: 'Look! A chick. It is small.' },
      { word: 'fish', img: it('fish'), sentence: 'A fish can swim.' },
      { word: 'lunch', img: it('lunchbox'), sentence: 'It is my lunch.' },
    ],
    doneLine: 'Coco’s balloon is over the hill! Super spelling!',
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
  {
    id: 'ja2-maze', kind: 'prea1', teacher: 'Guided: take Pip through the maze to the animal you hear — then say the sentence.',
    scene: {
      id: 'ja2-maze', kind: 'picture-maze', bg: bgWide, who: 'leo', walker: wtSpr('pip'), title: 'Who can do it? Find the animal!', layout: 1,
      teacher: 'Take Pip to the animal that can do it. Then say the sentence.',
      items: [
        { label: 'animal that can fly', img: it('willow-fly'), say: 'A bird can fly!' },
        { label: 'animal that can swim', img: it('fish-swim'), say: 'A fish can swim!' },
        { label: 'animal that can run', img: it('leo-run'), say: 'A lion can run!' },
      ],
      rounds: [1, 0, 2], doneLine: 'You found them all! Super sentences!',
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
  {
    id: 'ja2-move-break-2', kind: 'prea1', teacher: 'Brain break: Can you do it? Do it — or shake your head and say “I can’t!”',
    scene: {
      id: 'ja2-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgActions, who: 'leo', teacher: 'Can you do it?',
      rounds: [
        { line: 'Can you jump? Jump, jump! I can jump!', emoji: '\u{1F998}' },
        { line: 'Can you swing? Swing your arms! I can swing!', emoji: '\u{1F412}' },
        { line: 'Can you fly? Flap, flap… I can’t fly!', emoji: '\u{1F426}' },
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
  { id: 'ja3-echo-answers', kind: 'echo', bg: bgWide, who: 'coco', textSide: 'top', teacher: 'Guided: thumbs up for the first, thumbs down for the second — say both with Coco.', word: 'Yes, it can! No, it can’t!' },
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
    id: 'ja3-who-helps', kind: 'prea1', teacher: 'Free: who can fly up to Kip? The student ASKS at each hiding place “Can it fly?”, then taps to look and answers “No, it can’t!” / “Yes, it can!”.',
    scene: {
      id: 'ja3-who-helps', kind: 'lift-flap', bg: bgWide, who: 'pip',
      teacher: 'Ask: Can it fly? Then look!',
      question: 'Who can fly?',
      notYet: 'Not yet! Look in the other places first!',
      spots: [
        { x: 18, y: 76, size: 13, ask: 'Can it fly?', reveal: 'A frog! No, it can’t fly. It can jump.', cover: { img: it('stone'), label: 'rock' }, under: { img: it('frog'), label: 'frog' } },
        { x: 40, y: 70, size: 12, ask: 'Can it fly?', reveal: 'A snake! No, it can’t fly.', cover: { img: it('leaf'), label: 'leaf' }, under: { img: it('snake'), label: 'snake' } },
        { x: 62, y: 76, size: 13, ask: 'Can it fly?', reveal: 'A fish! No, it can’t fly. It can swim.', cover: { img: it('gift'), label: 'box' }, under: { img: it('fish'), label: 'fish' } },
        { x: 84, y: 64, size: 20, ask: 'Can it fly?', reveal: 'A bird! Yes, it can! It can fly!', target: true, cover: { img: it('tree'), label: 'tree' }, under: { img: it('bird'), label: 'bird' } },
      ],
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
  {
    id: 'ja3-chat', kind: 'chat-chain', bg: bgFriends, partner: 'coco', title: 'Chat with Coco',
    intro: 'Hi! Let’s talk about animals!',
    teacher: 'Guided: Coco asks, the student picks the answer that fits and SAYS it, then taps “I said it”.',
    turns: [
      { who: 'coco', line: 'Can a fish swim?' },
      { who: 'student', line: 'Yes, it can!', wrong: ['No, it can’t!', 'It is big.'] },
      { who: 'coco', line: 'Can a fish fly?' },
      { who: 'student', line: 'No, it can’t!', wrong: ['Yes, it can!', 'I am a fish.'] },
      { who: 'coco', line: 'Now you ask me!' },
      { who: 'student', line: 'Can a monkey climb?', wrong: ['A monkey climb?', 'Monkey can?'] },
      { who: 'coco', line: 'Yes, it can! I can climb!' },
    ],
  },
  {
    id: 'ja3-coconut', kind: 'hot-coconut', bg: bgWide, who: 'coco', title: 'Hot Coconut! Pass it — then answer!',
    teacher: 'Free: tap Pass! — where the coconut stops, the student answers the “Can it…?” question: Yes, it can! / No, it can’t!',
    seats: [
      { name: 'You', img: '' },
      { name: 'Coco', img: it('coco-cheer') },
      { name: 'Leo', img: it('leo-run') },
      { name: 'Willow', img: it('willow-fly') },
      { name: 'Pip', img: wtSpr('pip') },
    ],
    rounds: [
      { ask: 'Can a fish fly?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 1, stop: 2 },
      { ask: 'Can a monkey climb?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 0, stop: 0 },
      { ask: 'Can an elephant swim?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 0, stop: 3 },
      { ask: 'Can a snake run?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 1, stop: 1 },
      { ask: 'Can a bird fly?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 0, stop: 0 },
    ],
    doneLine: 'Hot coconut champion!',
  },
  { id: 'ja3-meet-kip', kind: 'meet', focus: ['help'], bg: jungleRescue(5), who: 'pip', cardSide: 'left', teacher: 'Present: Kip needs help! Ask with Pip — the voice goes up.', line: 'Kip is on a rock! Can a bird help? Can a fish help?', repeat: 'Can it help?' },
  /* Reading: The Jungle Rescue pages 5-7 */
  {
    id: 'ja3-reader', kind: 'reader', bg: jungleRescue(5), title: 'The Jungle Rescue', doneLine: 'Willow can’t help. The fish can’t help. Who can help Kip? Find out next time!',
    teacher: 'Reading: page 5 again, then the new pages. Listen while the words light up, then the student reads.',
    pages: JUNGLE_RESCUE.slice(4, 7),
  },
  {
    id: 'ja3-help-kip', kind: 'join-stage', bg: jungleRescue(7), teacher: 'Free: after the story — Pip asks, the student answers in two sentences (Yes/No + why).', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'Can Willow help Kip?' },
      { who: 'student', line: 'No, she can’t. She is small.' },
      { who: 'pip', line: 'Can the fish lift Kip?' },
      { who: 'student', line: 'No, it can’t. It can swim.' },
      { who: 'pip', line: 'Who can help? What do you think?' },
      { who: 'student', line: 'I think … can help!' },
    ],
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
  {
    id: 'ja3-splat', kind: 'word-splat', bg: bgWide, who: 'coco', title: 'Word Splat! Listen and splat the word!',
    teacher: 'Reading: Coco says a word — the student splats it and reads it aloud.',
    words: ['can', 'can’t', 'it', 'yes', 'no', 'help', 'is', 'on', 'a', 'the'],
    rounds: ['can', 'help', 'can’t', 'yes', 'it', 'no', 'on'],
    doneLine: 'Splat! You can read them!',
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
    id: 'ja3-blocks', kind: 'letter-blocks', bg: bgWide, mode: 'sounds', model: false,
    prompt: 'Build the word — sound by sound!',
    teacher: 'Reading: listen, put the sound blocks in order (ck is ONE block), blend them and read the word.',
    rounds: [
      { blocks: ['d', 'u', 'ck'], word: 'duck', img: it('duck-yellow') },
      { blocks: ['r', 'o', 'ck'], word: 'rock', img: it('stone') },
      { blocks: ['s', 'o', 'ck'], word: 'sock', img: it('socks-red') },
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
    id: 'ja3-move-break-2', kind: 'prea1', teacher: 'Brain break: Yes or no? Thumbs up and do it — or thumbs down and freeze!',
    scene: {
      id: 'ja3-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgWide, who: 'leo', teacher: 'Yes or no? Show me!',
      rounds: [
        { line: 'Can a frog jump? Yes, it can! Jump!', emoji: '\u{1F438}' },
        { line: 'Can a fish run? No, it can’t! Freeze!', emoji: '\u{1F41F}' },
        { line: 'Can a bird fly? Yes, it can! Fly!', emoji: '\u{1F426}' },
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
  { id: 'ja4-model-coco', kind: 'meet', focus: ['long tail'], bg: bgCocoVines, who: 'coco', cardSide: 'left', teacher: 'Present: Coco has got a long tail too! Point to it and say the sentence.', line: 'Look! I’ve got a long tail! I can swing!', repeat: 'It’s got a long tail.' },
  { id: 'ja4-echo', kind: 'echo', bg: bgWide, who: 'pip', textSide: 'top', teacher: 'Guided: say it like Pip — a long, long tail!', word: 'It’s got a long tail.' },
  { id: 'ja4-echo-nose', kind: 'echo', bg: jungleRescue(10), who: 'pip', textSide: 'top', teacher: 'Guided: make a long nose with your arm and say it with Pip!', word: 'It’s got a long nose.' },
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
    id: 'ja4-guess', kind: 'prea1', teacher: 'Free: Guess the Animal! The student ASKS “Is it big?” / “Can it fly?” / “Has it got a long tail?” until one animal is left — then says its 4 sentences.',
    scene: {
      id: 'ja4-guess', kind: 'secret-card', bg: bgWide, who: 'pip',
      teacher: 'Ask Pip! Is it green? Is it a snake? Then describe it!',
      cards: [
        { colorWord: 'Grey', colorHex: '#94A3B8', shape: 'circle', img: it('elephant'), word: 'elephant' },
        { colorWord: 'Green', colorHex: '#16A34A', shape: 'circle', img: it('alligator'), word: 'crocodile' },
        { colorWord: 'Blue', colorHex: '#3B82F6', shape: 'circle', img: it('bird'), word: 'bird' },
        { colorWord: 'Brown', colorHex: '#92400E', shape: 'circle', img: it('coco-cheer'), word: 'monkey' },
        { colorWord: 'Yellow', colorHex: '#EAB308', shape: 'circle', img: it('lion'), word: 'lion' },
      ],
      rounds: [{ secret: 1 }, { secret: 3 }],
    },
  },
  {
    id: 'ja4-bingo', kind: 'sticker-bingo', bg: bgWide, who: 'coco', title: 'Jungle Bingo! Listen and stamp!',
    teacher: 'Guided: Coco describes an animal — the student stamps it and says the animal: It’s an elephant! Three in a row: Bingo!',
    cells: [
      { label: 'elephant', img: it('elephant'), say: 'It’s big and grey. It’s got a long nose.' },
      { label: 'bird', img: it('bird'), say: 'It’s small and blue. It can fly.' },
      { label: 'snake', img: it('snake'), say: 'It’s long and green. It can’t run.' },
      { label: 'crocodile', img: it('alligator'), say: 'It’s got a long tail. It can swim.' },
      { label: 'monkey', img: it('coco-cheer'), say: 'It’s brown. It can climb and swing.' },
      { label: 'frog', img: it('frog'), say: 'It’s small and green. It can jump.' },
      { label: 'lion', img: it('lion'), say: 'It’s big and yellow. It can run.' },
      { label: 'fish', img: it('fish'), say: 'It’s orange. It can’t walk.' },
      { label: 'chick', img: it('chick'), say: 'It’s small and yellow. It can’t swim.' },
    ],
    calls: [3, 0, 5, 7, 2, 6, 8],
    doneLine: 'Bingo! Super listening!',
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
    id: 'ja4-read-do', kind: 'read-do', bg: bgWide, title: 'Read and do!', cast: ['coco', 'leo', 'willow', 'pip'],
    teacher: 'Reading: the student reads the card (🔊 is only for help), taps the thing, then the friend. “Wave” and “Say thank you”: they do it too!',
    things: [
      { label: 'banana', img: it('banana') },
      { label: 'chips', img: it('chip') },
      { label: 'shell', img: it('shell') },
      { label: 'fish', img: it('fish') },
    ],
    rounds: [
      { text: 'Give Coco the banana.', thing: 0, to: 0, reply: 'A banana! Thank you!' },
      { text: 'Give Leo the chips.', thing: 1, to: 1, reply: 'Chips! Yum! Thank you!' },
      { text: 'Wave to Willow.', to: 2, reply: 'Hello! I can fly!' },
      { text: 'Give Pip the shell.', thing: 2, to: 3, reply: 'A small shell! Thank you!' },
      { text: 'Give Willow the fish.', thing: 3, to: 2, reply: 'A fish? It can swim! Thank you!' },
    ],
    doneLine: 'You read it and you did it! Super reader!',
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
  {
    id: 'ja4-whos-missing', kind: 'prea1', teacher: 'Reading: the story animals on the photo wall — lights off! Who is missing? Say: The crocodile is missing!',
    scene: {
      id: 'ja4-whos-missing', kind: 'whos-missing', bg: jungleRescue(9), who: 'pip',
      look: 'Look at the story animals!', ask: 'Who is missing?',
      teacher: 'Look at the animals. Lights off! Who is missing?',
      faces: [
        { label: 'elephant', name: 'the elephant', img: it('elephant'), at: [50, 50] as [number, number], w: 96, aspect: 895 / 827 },
        { label: 'crocodile', name: 'the crocodile', img: it('alligator'), at: [50, 50] as [number, number], w: 96, aspect: 1 },
        { label: 'bird', name: 'the bird', img: it('bird'), at: [50, 50] as [number, number], w: 96, aspect: 704 / 910 },
        { label: 'fish', name: 'the fish', img: it('fish'), at: [50, 50] as [number, number], w: 96, aspect: 1 },
        { label: 'monkey', name: 'the monkey', img: it('coco-cheer'), at: [50, 50] as [number, number], w: 96, aspect: 1 },
      ],
      rounds: [
        { wall: [0, 1, 2], missing: 1, options: [1, 3, 4] },
        { wall: [3, 4, 0, 2], missing: 3, options: [2, 3, 0] },
        { wall: [4, 2, 1, 0], missing: 0, options: [0, 1, 4] },
      ],
      doneLine: 'All the animals are back! Hello, jungle!',
    },
  },
  {
    id: 'ja4-photo-talk', kind: 'join-stage', bg: jungleRescue(3), teacher: 'Free: look at the picture — the student talks about the elephant AND the snake, 4 sentences each if they can.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'Tell me about the elephant!' },
      { who: 'student', line: 'It’s big. It’s grey. It’s got a long nose. It can’t fly.' },
      { who: 'pip', line: 'And the snake?' },
      { who: 'student', line: 'It’s long. It’s green. It can climb. It can’t run.' },
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
    id: 'ja4-sound-game', kind: 'letter-game', bg: bgWide, who: 'willow', mode: 'sound',
    teacher: 'SH, CH or S? Listen and tap!',
    rounds: [
      { letter: 'SH', phoneme: '/sh/', choices: ['S', 'SH', 'CH'] },
      { letter: 'CH', phoneme: '/ch/', choices: ['CH', 'SH', 'C'] },
      { letter: 'S', phoneme: '/s/', choices: ['SH', 'H', 'S'] },
      { letter: 'SH', phoneme: '/sh/', choices: ['CH', 'SH', 'H'] },
    ],
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
    id: 'ja4-move-break-2', kind: 'prea1', teacher: 'Brain break: Pip describes — the student becomes that animal!',
    scene: {
      id: 'ja4-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgWide, who: 'pip', teacher: 'Be the animal!',
      rounds: [
        { line: 'It’s big. It’s got a long nose. Be it!', emoji: '\u{1F418}' },
        { line: 'It’s small. It can jump. Be it!', emoji: '\u{1F438}' },
        { line: 'It’s long. It can’t run. Be it!', emoji: '\u{1F40D}' },
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
  { id: 'ja5-echo-help', kind: 'echo', bg: jungleRescue(5), who: 'pip', textSide: 'top', teacher: 'Guided: say Kip’s line with a worried voice — loud!', word: 'Help! Help! I am stuck!' },
  {
    id: 'ja5-book-1', kind: 'reader', bg: bgWide, title: 'The Jungle Rescue', doneLine: 'Oh no! Kip is stuck! Let’s read on!',
    teacher: 'Reading: part 1 — the student reads pages 1-5 (listen first only where needed). Tap any word to hear it.',
    pages: JUNGLE_RESCUE.slice(0, 5),
  },
  { id: 'ja5-meet-willow', kind: 'meet', focus: ['small'], bg: jungleRescue(6), who: 'willow', cardSide: 'right', teacher: 'Present: Willow wants to help — but can she? Listen and say why not.', line: 'I can fly. But I am small. I can’t help Kip.', repeat: 'I can’t help.' },
  {
    id: 'ja5-book-1b', kind: 'reader', bg: bgWide, title: 'The Jungle Rescue', doneLine: 'Stop! Who can help Kip? You choose!',
    teacher: 'Reading: part 2 — pages 6-8. Who tries to help? Why can’t they?',
    pages: JUNGLE_RESCUE.slice(5, 8),
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
  { id: 'ja5-echo-thanks', kind: 'echo', bg: jungleRescue(11), who: 'coco', textSide: 'top', teacher: 'Guided: say it with Coco — a big, happy thank you!', word: 'Thank you, Elephant!' },
  {
    id: 'ja5-story-order', kind: 'prea1', teacher: 'Guided: put the story pictures in order, then tell it: first, then, then, at the end!',
    scene: {
      id: 'ja5-story-order', kind: 'story-order', bg: bgWide, who: 'pip', teacher: 'Put the pictures in order, then tell the story!',
      frames: [
        { img: jungleRescue(2), caption: 'Hi! I am Coco. I am a monkey.' },
        { img: jungleRescue(5), caption: 'Kip is on a rock. Help!' },
        { img: jungleRescue(6), caption: 'I can fly. But I am small.', who: 'willow' },
        { img: jungleRescue(10), caption: 'The elephant lifts Kip with its long nose.' },
        { img: jungleRescue(12), caption: 'Lunch! Chips for all!', who: 'leo' },
      ],
    },
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
    id: 'ja5-whats-missing', kind: 'whats-missing', bg: bgWide, title: 'Who is missing?',
    teacher: 'Guided: look at the story animals — one hides! Say who is missing: The crocodile is missing!',
    rounds: [
      { items: [{ word: 'elephant', img: it('elephant') }, { word: 'crocodile', img: it('alligator') }, { word: 'fish', img: it('fish') }, { word: 'bird', img: it('bird') }], missing: 1 },
      { items: [{ word: 'fish', img: it('fish') }, { word: 'elephant', img: it('elephant') }, { word: 'monkey', img: it('coco-cheer') }, { word: 'snake', img: it('snake') }], missing: 1 },
    ],
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
    id: 'ja5-story-gaps', kind: 'grammar-gap', bg: bgWide, title: 'Read and Choose',
    teacher: 'Reading: read the sentence from the story and choose the missing word. Then read it all.',
    rounds: [
      { before: 'Kip is on a', after: '.', choices: ['rock', 'tree'], answer: 'rock', img: jungleRescue(5) },
      { before: 'I can fly. But I am', after: '.', choices: ['big', 'small'], answer: 'small', img: jungleRescue(6) },
      { before: 'I am big. I can', after: 'in the river.', choices: ['walk', 'fly'], answer: 'walk', img: jungleRescue(9) },
      { before: 'The elephant lifts Kip with its long', after: '.', choices: ['tail', 'nose'], answer: 'nose', img: jungleRescue(10) },
    ],
  },
  {
    id: 'ja5-dominoes', kind: 'dominoes', bg: bgWide, who: 'pip', title: 'Story Dominoes!',
    teacher: 'Reading: look at the story picture at the end of the chain — find the domino with its sentence, read it aloud and play it.',
    start: { img: jungleRescue(2), label: 'Coco' },
    steps: [
      { text: 'Hi! I am Coco. I am a monkey.', img: jungleRescue(5), label: 'Kip on the rock' },
      { text: 'Kip is on a rock. Help!', img: jungleRescue(6), label: 'Willow' },
      { text: 'I can fly. But I am small.', img: jungleRescue(7), label: 'the fish' },
      { text: 'I can swim. I can’t lift Kip!', img: jungleRescue(10), label: 'the elephant' },
      { text: 'The elephant lifts Kip with its long nose.', img: jungleRescue(12), label: 'lunch' },
    ],
    doneLine: 'You told the whole story! Super reading!',
  },
  {
    id: 'ja5-move-break', kind: 'prea1', teacher: 'Brain break: act the story with your body!',
    scene: {
      id: 'ja5-move-break', kind: 'tpr-actions', mode: 'break', bg: bgWide, who: 'pip', teacher: 'Act the story!',
      rounds: [
        { line: 'Be Kip on the rock: Help! Help!', emoji: '\u{1F198}' },
        { line: 'Be Willow: flap, flap! I am small!', emoji: '\u{1F426}' },
        { line: 'Be the elephant: lift Kip with your long nose!', emoji: '\u{1F418}' },
        { line: 'Clap: Thank you, Elephant!', emoji: '\u{1F44F}' },
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
  {
    id: 'ja5-why-not', kind: 'join-stage', bg: jungleRescue(8), teacher: 'Free: Leo asks why the friends can’t help — the student answers in two short sentences.', cast: ['leo'],
    turns: [
      { who: 'leo', line: 'Can the fish help Kip?' },
      { who: 'student', line: 'No, it can’t. It can swim, but it can’t lift Kip.' },
      { who: 'leo', line: 'Can the crocodile help?' },
      { who: 'student', line: 'No! Its teeth!' },
    ],
  },
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
  { id: 'ja5-meet-lunch', kind: 'meet', focus: ['Thank you'], bg: jungleRescue(12), who: 'leo', cardSide: 'left', teacher: 'Present: the happy end — say thank you to a friend who helped you!', line: 'Lunch! Chips for all! Thank you, friends!', repeat: 'Thank you, friends!' },
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
    id: 'ja5-move-break-2', kind: 'prea1', teacher: 'Brain break: the jungle party dance!',
    scene: {
      id: 'ja5-move-break-2', kind: 'tpr-actions', mode: 'break', bg: jungleRescue(12), who: 'leo', teacher: 'Party dance!',
      rounds: [
        { line: 'Kip is safe! Jump for joy!', emoji: '\u{1F389}' },
        { line: 'Swing like Coco!', emoji: '\u{1F412}' },
        { line: 'Eat the chips: yum, yum!', emoji: '\u{1F35F}' },
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

/* =============================================================================
 * A1 Unit 2 Lesson 6: "Jungle Game Day" (extra practice, built 2026-10-13, plan docs/a1-unit-2-jungle.md §5.6)
 *
 * Objective: I can use all the Unit 2 language quickly and read its sentences fast. Different games from Unit 1's
 * Game Day (variety rule, same slot): River Crossing ★ (stepping-stones: hop on the animal described), Memory
 * (description ↔ animal), Sort Basket (can swim / can't swim), Jungle Charades, Tile Reveal, the Twister Race (the four
 * Unit 2 twisters), Blend & Read, a free chat. Research (mechanics only): classroom "jump on the stone" floor game,
 * Wordwall image quiz / memory / group sort, charades. Better: every move needs the unit sentence (can / can't / looks).
 * ========================================================================= */

export const LESSON_A1U2L6_TITLE = 'Extra Practice: Jungle Game Day!';
export const LESSON_A1U2L6_OBJECTIVE = 'I can use all the Unit 2 language quickly — animals, looks, can / can\'t, "Can it…?" — and read its sentences fast.';

export const LESSON_A1U2L6_SCENES: Scene[] = [
  { id: 'ja6-title', kind: 'title-card', bg: bgObstacle, level: 'A1', unit: 'Unit 2', lessonLabel: 'Lesson 6', title: 'Jungle Game Day!', subtitle: 'Cross the river, guess, act and race!', cta: '\u{1F3AE} LET’S PLAY!' },
  {
    id: 'ja6-recall-warmup', kind: 'recall-warmup', bg: bgWide, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 2 · Lesson 5 · The Jungle Rescue',
    teacher: 'Guided: Pip reads a line from the story — the student finds the picture, then reads the line too.',
    items: [
      { word: 'rock', say: 'Help! Help! I am stuck!', img: jungleRescue(5) },
      { word: 'fish', say: 'I can swim. I can’t lift Kip!', img: jungleRescue(7) },
      { word: 'elephant', say: 'The elephant lifts Kip with its long nose.', img: jungleRescue(10) },
      { word: 'lunch', say: 'Lunch! Chips for all!', img: jungleRescue(12) },
    ],
  },
  { id: 'ja6-meet', kind: 'meet', focus: ['Let’s play'], bg: bgObstacle, who: 'leo', cardSide: 'left', teacher: 'Present: it’s Jungle Game Day! Everything from Unit 2 — fast and fun.', line: 'It’s Jungle Game Day! Ready? Let’s play!', repeat: 'Let’s play!' },
  {
    id: 'ja6-board', kind: 'prea1', teacher: 'Guided: Jungle Word Board! Roll, hop, read the sentence on the square aloud — or answer its question. Ladders go up, slides go down.',
    scene: {
      id: 'ja6-board', kind: 'word-board', bg: bgWide, who: 'pip', walker: wtSpr('pip'), title: 'Jungle Board! Roll, read and answer!',
      teacher: 'Roll, read the square aloud or answer its question, then tap "I said it!".',
      ask: 'Read it, or answer it!',
      words: [
        { label: 'elephant', img: it('elephant'), text: 'It’s big and grey.', say: 'It’s big and grey.' },
        { label: 'fly', img: it('bird'), text: 'Can a bird fly?', say: 'Can a bird fly?' },
        { label: 'snake', img: it('snake'), text: 'It’s long and green.', say: 'It’s long and green.' },
        { label: 'swim', img: it('fish'), text: 'A fish can’t run.', say: 'A fish can’t run.' },
        { label: 'monkey', img: it('coco-cheer'), text: 'Can a monkey climb?', say: 'Can a monkey climb?' },
        { label: 'nose', img: it('elephant'), text: 'It’s got a long nose.', say: 'It’s got a long nose.' },
        { label: 'frog', img: it('frog'), text: 'What can a frog do?', say: 'What can a frog do?' },
        { label: 'crocodile', img: it('alligator'), text: 'It’s got a long tail.', say: 'It’s got a long tail.' },
        { label: 'lion', img: it('lion'), text: 'Can a lion swing?', say: 'Can a lion swing?' },
      ],
      doneLine: 'You reached the golden banana! Super reading!',
    },
  },
  /* ★ River Crossing: hop on the animal described */
  {
    id: 'ja6-river', kind: 'prea1', teacher: 'Guided: River Crossing! Listen to Pip and hop on the right animal stone — then say the sentence.',
    scene: {
      id: 'ja6-river', kind: 'stepping-stones', bg: bgWide, stoneImg: it('stone'), who: 'pip', walker: 'pip',
      teacher: 'Listen! Hop on the right animal stone.',
      rounds: [
        { line: 'Hop on the animal that can fly!', options: [{ label: 'elephant', img: it('elephant') }, { label: 'bird', img: it('bird') }, { label: 'snake', img: it('snake') }], answer: 1, reply: 'Yes! A bird can fly!' },
        { line: 'Hop on the animal with a long nose!', options: [{ label: 'elephant', img: it('elephant') }, { label: 'frog', img: it('frog') }, { label: 'fish', img: it('fish') }], answer: 0, reply: 'Yes! The elephant has got a long nose!' },
        { line: 'Hop on the animal that can’t walk. It can swim!', options: [{ label: 'monkey', img: it('coco-cheer') }, { label: 'frog', img: it('frog') }, { label: 'fish', img: it('fish') }], answer: 2, reply: 'Yes! A fish can’t walk. It can swim!' },
        { line: 'Hop on the animal that is long and green. It can climb!', options: [{ label: 'crocodile', img: it('alligator') }, { label: 'snake', img: it('snake') }, { label: 'bird', img: it('bird') }], answer: 1, reply: 'Yes! The snake can climb a tree!' },
        { line: 'Hop on the animal that is small and green. It can jump!', options: [{ label: 'frog', img: it('frog') }, { label: 'crocodile', img: it('alligator') }, { label: 'elephant', img: it('elephant') }], answer: 0, reply: 'Yes! A frog can jump!' },
      ],
      goal: { img: it('banana-trophy'), label: 'golden banana', line: 'You crossed the river! Here is the golden banana!' },
    },
  },
  {
    id: 'ja6-memory', kind: 'memory', bg: bgWide, teacher: 'Reading: Memory! Find the sentence and its animal. Read the sentence aloud when you find a pair.',
    pairs: [
      { id: 'elephant', label: 'It’s got a long nose.', emoji: '\u{1F418}', img: it('elephant') },
      { id: 'crocodile', label: 'It’s got a long tail.', emoji: '\u{1F40A}', img: it('alligator') },
      { id: 'bird', label: 'It can fly.', emoji: '\u{1F426}', img: it('bird') },
      { id: 'frog', label: 'It can jump.', emoji: '\u{1F438}', img: it('frog') },
    ],
  },
  { id: 'ja6-echo', kind: 'echo', bg: bgObstacle, who: 'leo', textSide: 'top', teacher: 'Game Day voice! Ask with Leo — slow, then fast.', word: 'Can it swim? Can it fly?' },
  {
    id: 'ja6-race', kind: 'answer-race', look: 'gates', bg: bgObstacle, who: 'leo', racer: it('pip-run'),
    title: 'Catch the answer! Run through the right gate!',
    teacher: 'Guided: Leo asks — the student taps the gate with the right answer, then says it.',
    rounds: [
      { ask: 'Can a bird fly?', choices: ['Yes, it can.', 'No, it can’t.', 'It’s grey.'], answer: 0 },
      { ask: 'Can a fish run?', choices: ['Yes, it can.', 'It’s small.', 'No, it can’t.'], answer: 2 },
      { ask: 'What can a monkey do?', choices: ['It can climb.', 'It can’t swim.', 'It’s long.'], answer: 0 },
      { ask: 'Is the elephant small?', choices: ['Yes, it is.', 'No! It’s big.', 'It can fly.'], answer: 1 },
      { ask: 'What’s it got?', choices: ['A long nose.', 'It can jump.', 'Yes, it can.'], answer: 0 },
    ],
    doneLine: 'You caught every answer!',
  },
  {
    id: 'ja6-song', kind: 'song', bg: bgObstacle, title: '\u{1F3B5} Ask Them! \u{1F3B5}',
    teacher: 'Game Day song: sing the questions and answers — thumbs up, head shake!',
    durationSeconds: 47, bigWord: 'Can it?', songUrl: SONG_A1U2L3, lineDurationsMs: SONG_A1U2L3_MS, lyrics: SONG_A1U2L3_LYRICS,
  },
  {
    id: 'ja6-sort', kind: 'sort-basket', bg: bgWide, title: 'Can it swim?',
    teacher: 'Guided: sort the animals — can it swim or can’t it? Say the sentence: A crocodile can swim!',
    baskets: [{ label: 'It can swim', emoji: '\u{1F30A}' }, { label: 'It can’t swim', emoji: '\u{1F6AB}' }],
    items: [
      { word: 'crocodile', img: it('alligator'), basket: 0 },
      { word: 'bird', img: it('bird'), basket: 1 },
      { word: 'fish', img: it('fish'), basket: 0 },
      { word: 'chick', img: it('chick'), basket: 1 },
      { word: 'elephant', img: it('elephant'), basket: 0 },
      { word: 'duck', img: it('duck-yellow'), basket: 0 },
    ],
  },
  {
    id: 'ja6-train', kind: 'prea1', teacher: 'Guided: look at the animal train — say each animal — then one car is empty. Which animal is missing?',
    scene: {
      id: 'ja6-train', kind: 'train-recall', bg: bgWide, teacher: 'Look at the train. Say each animal. Which one is missing?',
      question: 'Choo choo! One car is empty. Which animal is missing?',
      cars: [
        { word: 'ELEPHANT', img: it('elephant'), emoji: '\u{1F418}' },
        { word: 'SNAKE', img: it('snake'), emoji: '\u{1F40D}' },
        { word: 'FROG', img: it('frog'), emoji: '\u{1F438}' },
        { word: 'BIRD', img: it('bird'), emoji: '\u{1F426}' },
      ],
    },
  },
  {
    id: 'ja6-go-fish', kind: 'go-fish', bg: bgWide, who: 'coco', friendImg: it('coco-cheer'), title: 'Go Fish with Coco!',
    teacher: 'Free: the student asks “Have you got a frog?” and Coco answers; then Coco asks and the student answers truthfully: Yes, I have. / No, I haven’t. Go fish!',
    cards: [
      { label: 'frog', img: it('frog') }, { label: 'bird', img: it('bird') }, { label: 'lion', img: it('lion') },
      { label: 'monkey', img: it('coco-cheer') }, { label: 'snake', img: it('snake') }, { label: 'elephant', img: it('elephant'), article: 'an' },
      { label: 'fish', img: it('fish') },
    ],
    childHand: ['frog', 'bird', 'lion', 'monkey'],
    friendHand: ['frog', 'snake', 'elephant'],
    pond: ['snake', 'bird', 'elephant', 'lion', 'fish', 'monkey', 'fish'],
    doneLine: 'No more cards! Super asking and answering!',
  },
  {
    id: 'ja6-build-camp', kind: 'world-builder', bg: bgWide, who: 'coco', title: 'Build the Jungle Camp!',
    teacher: 'Guided: every right answer builds a piece of the jungle camp. Say the answer aloud — then name the new piece!',
    pieces: [
      { label: 'house', img: it('house'), x: 26, y: 60, size: 16 },
      { label: 'log', img: it('log'), x: 50, y: 70, size: 12 },
      { label: 'stone', img: it('stone'), x: 68, y: 68, size: 8 },
      { label: 'banana', img: it('banana'), x: 14, y: 62, size: 7 },
      { label: 'flag', img: it('flag'), x: 60, y: 50, size: 6 },
      { label: 'rainbow', img: it('rainbow'), x: 46, y: 30, size: 28 },
    ],
    rounds: [
      { ask: 'Can a monkey climb?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 0 },
      { ask: 'What is it? It’s got a long nose.', choices: ['It’s an elephant.', 'It’s a frog.'], answer: 0 },
      { ask: 'Can a fish walk?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 1 },
      { ask: 'Is the snake short?', choices: ['No. It’s long.', 'Yes. It’s short.'], answer: 0, img: it('snake') },
      { ask: 'What can a bird do?', choices: ['It can fly.', 'It can swim.'], answer: 0 },
      { ask: 'Who can help Kip?', choices: ['The elephant.', 'The fish.'], answer: 0 },
    ],
    doneLine: 'Look! We built the jungle camp! Hooray!',
  },
  {
    id: 'ja6-chests', kind: 'chest-quest', bg: bgWaterfall, who: 'coco', title: 'Jungle Treasure Chests!', goal: 60,
    teacher: 'Guided: every right answer opens a chest — coins fill the class jar. Can we reach 60 coins?',
    rounds: [
      { ask: 'It’s small and green. It can jump.', choices: ['It’s a frog.', 'It’s a lion.'], answer: 0, prizes: ['10', '20', '⭐'] },
      { ask: 'Can a crocodile swim?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 0, img: it('alligator'), prizes: ['20', '×2', '10'] },
      { ask: 'What’s it got?', choices: ['A long tail.', 'A long nose.'], answer: 1, img: it('elephant'), prizes: ['10', '20', '×2'] },
      { ask: 'Can a lion swing?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 1, img: it('lion'), prizes: ['⭐', '10', '20'] },
    ],
    doneLine: 'Look at the jar! Super answers!',
  },
  {
    id: 'ja6-charades', kind: 'prea1', teacher: 'Free: Jungle Charades! Guess what the friend can do — then the student acts and the teacher guesses: “You can swing!”',
    scene: {
      id: 'ja6-charades', kind: 'charades', bg: bgObstacle, who: 'pip',
      teacher: 'Watch! What can the friend do? Then your turn to act!',
      acts: [
        { word: 'run', img: it('leo-run'), name: 'Leo', pronoun: 'He' },
        { word: 'fly', img: it('willow-fly'), name: 'Willow', pronoun: 'She' },
        { word: 'swing', img: it('coco-swing'), name: 'Coco', pronoun: 'She' },
        { word: 'jump', img: it('pip-jump'), name: 'Pip', pronoun: 'He' },
        { word: 'climb', img: it('pip-climb'), name: 'Pip', pronoun: 'He' },
      ],
      rounds: [
        { mode: 'guess', act: 2, options: [2, 0, 3] },
        { mode: 'guess', act: 4, options: [1, 4, 2] },
        { mode: 'act', act: 1, options: [] },
        { mode: 'guess', act: 0, options: [3, 1, 0] },
        { mode: 'act', act: 3, options: [] },
      ],
      doneLine: 'Super acting! You can do it all!',
    },
  },
  {
    id: 'ja6-hunt', kind: 'prea1', teacher: 'Free: Home Hunt! Find something at home (or in the room) and show it on camera — say: It’s long! It’s small!',
    scene: {
      id: 'ja6-hunt', kind: 'home-hunt', bg: bgWide, who: 'pip', title: 'Jungle Hunt at home!', seconds: 30,
      teacher: 'Find it and show it! Then say the sentence.',
      rounds: [
        { img: it('snake'), label: 'long', ask: 'Find something LONG!', found: 'Yes! It’s long — like a snake!' },
        { img: it('frog'), label: 'small', ask: 'Find something SMALL and GREEN!', found: 'Yes! It’s small and green — like a frog!' },
        { img: it('elephant'), label: 'big', ask: 'Find something BIG!', found: 'Yes! It’s big — like an elephant!' },
      ],
      doneLine: 'Super hunter! You found them all!',
    },
  },
  {
    id: 'ja6-reveal', kind: 'prea1', teacher: 'Guided: Tile Reveal! Tiles open one by one — listen to the clue and guess early. Then say two sentences about it.',
    scene: {
      id: 'ja6-reveal', kind: 'tile-reveal', bg: bgWide, who: 'pip',
      teacher: 'Who is hiding? Guess early!',
      rounds: [
        { img: it('elephant'), word: 'elephant', line: 'It’s big and grey. What is it?', options: [{ label: 'elephant', img: it('elephant') }, { label: 'frog', img: it('frog') }, { label: 'bird', img: it('bird') }] },
        { img: it('snake'), word: 'snake', line: 'It’s long and green. It can’t run. What is it?', options: [{ label: 'crocodile', img: it('alligator') }, { label: 'snake', img: it('snake') }, { label: 'fish', img: it('fish') }] },
        { img: it('coco-cheer'), word: 'monkey', line: 'It’s brown. It can climb and swing. What is it?', options: [{ label: 'lion', img: it('lion') }, { label: 'bird', img: it('bird') }, { label: 'monkey', img: it('coco-cheer') }] },
      ],
    },
  },
  {
    id: 'ja6-monsters', kind: 'prea1', teacher: 'Reading: Hungry Letter Monsters! Feed each picture to the monster with its first sound — s, ch or sh — and say it.',
    scene: {
      id: 'ja6-monsters', kind: 'letter-monsters', bg: bgWide, who: 'pip', teacher: 'Feed each picture to the monster with its first sound!',
      monsters: [{ letter: 's', color: '#22c55e' }, { letter: 'ch', color: '#f97316' }, { letter: 'sh', color: '#8b5cf6' }],
      cards: [
        { word: 'snake', img: it('snake') }, { word: 'chick', img: it('chick') },
        { word: 'ship', img: it('ship') }, { word: 'sun', img: it('sun') },
        { word: 'chips', img: it('chip') }, { word: 'sheep', img: it('sheep') },
      ],
    },
  },
  {
    id: 'ja6-twister-race', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgWide, who: 'pip', focus: '',
    teacher: 'Reading: the Twister Race! All four Unit 2 twisters — slow, faster, then super fast!',
    line: 'Six big pigs sit still. Chip the chimp chews chips. A duck on a rock eats a snack. Shy fish swish and splash.',
    lines: ['Six big pigs sit still.', 'Chip the chimp chews chips.', 'A duck on a rock eats a snack.', 'Shy fish swish and splash.'],
  },
  {
    id: 'ja6-speed-read', kind: 'reader', bg: bgWide, title: 'Speed Reading: The Jungle Rescue', doneLine: 'Wow! Fast and clear — super reading!',
    teacher: 'Reading: Game Day speed read! The student reads pages 9-12 on their own (🔊 only for help) — then once more, faster.',
    pages: JUNGLE_RESCUE.slice(8, 12),
  },
  {
    id: 'ja6-letter-match', kind: 'letter-match', bg: bgWide, letters: ['E', 'S', 'C', 'M', 'F', 'B'],
    prompt: 'Match the big and small letters — then say an animal!',
    teacher: 'Reading: match each capital letter to its small letter, then say an animal that starts with it: E — elephant, S — snake, C — crocodile, M — monkey, F — frog, B — bird.',
  },
  {
    id: 'ja6-blend', kind: 'sound-blend', bg: bgWide, look: 'frog',
    teacher: 'Reading: the Blend & Read challenge — one word for each Unit 2 sound, then read the sentence.',
    rounds: [
      { word: 'big', img: it('elephant'), sentence: 'The elephant is big.' },
      { word: 'chick', sounds: ['ch', 'i', 'ck'], img: it('chick'), sentence: 'A chick can’t swim.' },
      { word: 'fish', sounds: ['f', 'i', 'sh'], img: it('fish'), sentence: 'A fish can swim.' },
    ],
  },
  {
    id: 'ja6-trials', kind: 'prea1', teacher: 'Guided: the Jungle Trials! Three skills — read it, answer it, find it. Win all the badges for the golden banana.',
    scene: {
      id: 'ja6-trials', kind: 'hero-trials', bg: bgObstacle, who: 'leo',
      teacher: 'Win the three badges: read it, answer it, find it!',
      hero: { img: it('leo-run'), name: 'Leo' }, medal: '\u{1F34C}',
      skills: [{ key: 'read', label: 'Read it', icon: '\u{1F4D6}' }, { key: 'answer', label: 'Answer it', icon: '\u{1F4AC}' }, { key: 'find', label: 'Find it', icon: '\u{1F50D}' }],
      items: [
        { skill: 'read', ask: 'Read and find: It’s got a long tail. It can swim.', reply: 'The crocodile!', options: [{ label: 'crocodile', img: it('alligator') }, { label: 'bird', img: it('bird') }, { label: 'lion', img: it('lion') }], answer: 0 },
        { skill: 'read', ask: 'Read and find: It’s small. It can fly.', reply: 'The bird!', options: [{ label: 'elephant', img: it('elephant') }, { label: 'bird', img: it('bird') }, { label: 'snake', img: it('snake') }], answer: 1 },
        { skill: 'answer', ask: 'Can a snake run?', reply: 'No, it can’t!', options: [{ label: 'a', text: 'Yes, it can.' }, { label: 'b', text: 'It’s green.' }, { label: 'c', text: 'No, it can’t.' }], answer: 2 },
        { skill: 'answer', ask: 'What can a fish do?', reply: 'It can swim!', options: [{ label: 'a', text: 'It can swim.' }, { label: 'b', text: 'It can fly.' }, { label: 'c', text: 'It’s big.' }], answer: 0 },
        { skill: 'find', ask: 'Find the animal with a long nose!', reply: 'The elephant!', options: [{ label: 'frog', img: it('frog') }, { label: 'monkey', img: it('coco-cheer') }, { label: 'elephant', img: it('elephant') }], answer: 2 },
        { skill: 'find', ask: 'Find the animal that can swing!', reply: 'The monkey!', options: [{ label: 'monkey', img: it('coco-cheer') }, { label: 'fish', img: it('fish') }, { label: 'snake', img: it('snake') }], answer: 0 },
      ],
      doneLine: 'Three badges! You are the Jungle Game Day champion!',
    },
  },
  {
    id: 'ja6-quiz-show', kind: 'join-stage', bg: bgObstacle, teacher: 'Free: swap! Now the STUDENT is the quiz master and asks Leo. Leo answers.', cast: ['leo'],
    turns: [
      { who: 'student', line: 'Leo, can a crocodile fly?' },
      { who: 'leo', line: 'No, it can’t! It can swim.' },
      { who: 'student', line: 'What can a monkey do?' },
      { who: 'leo', line: 'It can climb and swing!' },
      { who: 'student', line: 'Is the snake big?' },
      { who: 'leo', line: 'No! It’s long and green.' },
    ],
  },
  {
    id: 'ja6-tic-tac-toe', kind: 'tic-tac-toe', bg: bgObstacle, who: 'coco', opponentImg: it('coco-cheer'), title: 'Tic-Tac-Toe with Coco!',
    teacher: 'Free: the student plays Coco. Tap a square, answer its question — a star! Three stars in a row wins. Say every answer aloud.',
    squares: [
      { ask: 'Can a bird fly?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 0, img: it('bird') },
      { ask: 'Can a fish run?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 1, img: it('fish') },
      { ask: 'What’s it got?', choices: ['A long nose.', 'A long tail.'], answer: 0, img: it('elephant') },
      { ask: 'Is it big?', choices: ['No. It’s small.', 'Yes. It’s big.'], answer: 0, img: it('frog') },
      { ask: 'What can a monkey do?', choices: ['It can fly.', 'It can climb.'], answer: 1, img: it('coco-cheer') },
      { ask: 'What colour is it?', choices: ['It’s green.', 'It’s grey.'], answer: 0, img: it('snake') },
      { ask: 'Can a crocodile swim?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 0, img: it('alligator') },
      { ask: 'Who can help Kip?', choices: ['The fish.', 'The elephant.'], answer: 1 },
      { ask: 'Can a lion swing?', choices: ['No, it can’t.', 'Yes, it can.'], answer: 0, img: it('lion') },
    ],
    doneLine: 'Three in a row! Jungle champion!',
  },
  {
    id: 'ja6-free-chat', kind: 'join-stage', bg: jungleRescue(12), teacher: 'Free: Kip wants to meet the student (Coco speaks for her little brother). The student says hello, asks and answers.', cast: ['coco', 'pip'],
    turns: [
      { who: 'coco', line: 'This is my brother Kip. Say hello!' },
      { who: 'student', line: 'Hello, Kip! Nice to meet you!' },
      { who: 'coco', line: 'Kip asks: can you swim?' },
      { who: 'student', line: 'Yes, I can. / No, I can’t. Can Kip swim?' },
      { who: 'coco', line: 'No, he can’t! What is your favourite animal? Tell Kip!' },
      { who: 'student', line: 'It’s a … It’s … It can … It can’t …' },
    ],
  },
  { id: 'ja6-echo-bye', kind: 'echo', bg: jungleRescue(12), who: 'coco', textSide: 'top', teacher: 'Guided: wave to Kip and say it with Coco!', word: 'Goodbye, Kip! See you!' },
  { id: 'ja6-i-can', kind: 'meet', focus: ['fast'], bg: bgFriends, who: 'coco', cardSide: 'left', teacher: 'Check: say it and get your passport stamp!', line: 'I can talk about animals and read fast!', repeat: 'I can do it fast!' },
  {
    id: 'ja6-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Game Day sticker in their Sticker Book.',
    scene: {
      id: 'ja6-sticker', kind: 'sticker-reward', bg: bgObstacle, who: 'pip', teacher: 'Sticker time!',
      line: 'You won Jungle Game Day! Here is your sticker.',
      sticker: { img: it('banana-trophy'), label: 'Jungle Game Day' },
    },
  },
  {
    id: 'ja6-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ja6-home-mission', kind: 'home-mission', bg: bgFriends, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child played Jungle Game Day with all the Unit 2 language. Play animal charades: one acts, the other guesses and says "It can swim!".',
      steps: [
        { emoji: '\u{1F3AD}', say: 'Play animal charades with your family.' },
        { emoji: '\u{1F445}', say: 'Say a jungle twister three times, fast!' },
        { emoji: '\u{2753}', say: 'Ask: Can it swim? Can it fly?' },
      ],
    },
  },
  {
    id: 'ja6-describe', kind: 'join-stage', bg: bgFriends, teacher: 'Extra time (Free): Willow describes — the student guesses, then gives Willow a 4-sentence riddle.', cast: ['willow'],
    turns: [
      { who: 'willow', line: 'It’s small. It’s green. It can jump. It can’t fly. What is it?' },
      { who: 'student', line: 'It’s a frog!' },
      { who: 'willow', line: 'Yes! Now you — four sentences!' },
      { who: 'student', line: 'It’s … It’s … It can … It can’t …' },
    ],
  },
  {
    id: 'ja6-break', kind: 'prea1', teacher: 'Brain break: the jungle victory dance!',
    scene: {
      id: 'ja6-break', kind: 'tpr-actions', mode: 'break', bg: bgObstacle, who: 'leo', teacher: 'Victory dance!',
      rounds: [
        { line: 'Hands up! We are jungle champions!', emoji: '\u{1F64C}' },
        { line: 'Run on the spot like a lion!', emoji: '\u{1F981}' },
        { line: 'Swing your arms like a monkey!', emoji: '\u{1F412}' },
      ],
    },
  },
  {
    id: 'ja6-goodbye-song', kind: 'song', bg: bgFriends, title: '\u{1F3B5} Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
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
  { id: 'ja6-finale', kind: 'finale', bg: bgObstacle, who: 'coco', line: 'Jungle Game Day champion! Next time: the Boss Test! \u{1F3C6}' },
];

/* =============================================================================
 * A1 Unit 2 Lesson 7: "Boss Test: Jungle Explorer!" (built 2026-10-13, plan docs/a1-unit-2-jungle.md §5.7)
 *
 * Warm-up: the Raft Race (answer-race, look 'raft'). Then five parts (Cambridge Pre A1/A1 formats), 4 of 5 to pass each:
 * 1 listening (hear the description → tap the animal, one-try Hero Trials with stars), 2 reading yes/no about a big
 * picture (Starters R&W Part 2), 3 the story with gaps (Starters R&W Part 4), 4 speaking (describe two animals + ask one
 * "Can it…?" question), 5 reading a story page aloud. Any part below 4 → practise it again (teacher note).
 * ========================================================================= */

export const LESSON_A1U2L7_TITLE = 'Unit Review & Boss Test: Jungle Explorer!';
export const LESSON_A1U2L7_OBJECTIVE = 'I can show everything from Unit 2: describe two animals, ask "Can it…?", understand descriptions and read the story.';

export const LESSON_A1U2L7_SCENES: Scene[] = [
  { id: 'ja7-title', kind: 'title-card', bg: bgWaterfall, level: 'A1', unit: 'Unit 2', lessonLabel: 'Lesson 7', title: 'Boss Test: Jungle Explorer!', subtitle: 'Show everything you can do in the jungle', cta: '\u{1F3C6} I’M READY!' },
  {
    id: 'ja7-recall-warmup', kind: 'recall-warmup', bg: bgWide, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 2 · Lesson 6 · Jungle Game Day',
    teacher: 'Guided: listen — which animal is it? Click it and say one more sentence about it.',
    items: [
      { word: 'bird', say: 'It can fly. It’s small and blue.', img: it('bird') },
      { word: 'snake', say: 'It’s long and green. It can climb.', img: it('snake') },
      { word: 'fish', say: 'It can’t walk. It can swim.', img: it('fish') },
    ],
  },
  {
    id: 'ja7-intro', kind: 'cinematic', bg: bgWaterfall, title: 'The Boss Test', subtitle: 'A race, then five parts', narrator: 'coco',
    script: [
      { who: 'coco', line: 'Welcome, jungle explorer!' },
      { who: 'coco', line: 'Listen, read, read the story, talk and read aloud!' },
      { who: 'pip', line: 'First, the raft race! Let’s go!' },
    ],
    cta: '\u{1F6F6} RACE!',
  },
  {
    id: 'ja7-raft', kind: 'answer-race', look: 'raft', bg: bgWaterfall, who: 'pip', racer: it('coco-cheer'),
    title: 'The Raft Race! Every right answer moves your raft!',
    teacher: 'Warm-up: the student answers — every right answer moves Coco’s raft. The last two cards are read, not heard.',
    rounds: [
      { ask: 'Can a fish fly?', choices: ['Yes, it can.', 'No, it can’t.', 'It’s big.'], answer: 1 },
      { ask: 'What is it? It’s got a long nose.', choices: ['It’s a frog.', 'It’s a bird.', 'It’s an elephant.'], answer: 2 },
      { ask: 'Can a monkey climb?', choices: ['Yes, it can.', 'No, it can’t.', 'It’s green.'], answer: 0 },
      { ask: 'Is a frog big?', choices: ['No. It’s small.', 'Yes. It’s big.', 'It can fly.'], answer: 0, read: true },
      { ask: 'What can a crocodile do?', choices: ['It can fly.', 'It can swim.', 'It can’t swim.'], answer: 1, read: true },
    ],
    doneLine: 'You won the raft race! Now the Boss Test!',
  },
  /* Part 1 — Listening */
  {
    id: 'ja7-p1-listen', kind: 'prea1', teacher: 'Part 1 — Listening (5). One try each; 🔊 replays the description. Pass: 4 of 5. The student works alone.',
    scene: {
      id: 'ja7-p1-listen', kind: 'hero-trials', bg: bgWide, who: 'pip',
      teacher: 'Listen and tap the animal. One try!',
      hero: { img: it('coco-cheer'), name: 'Jungle Explorer' }, medal: it('banana-trophy'),
      skills: [
        { key: 'looks', label: 'How it looks', icon: '\u{1F440}' },
        { key: 'can', label: 'Can / can’t', icon: '\u{1F44D}' },
      ],
      items: [
        { skill: 'looks', ask: 'It’s got a long tail. It can swim. It’s green.', reply: 'The crocodile!', answer: 1, options: [{ label: 'snake', img: it('snake') }, { label: 'crocodile', img: it('alligator') }, { label: 'frog', img: it('frog') }] },
        { skill: 'can', ask: 'It can fly. It’s small and blue.', reply: 'The bird!', answer: 0, options: [{ label: 'bird', img: it('bird') }, { label: 'fish', img: it('fish') }, { label: 'monkey', img: it('coco-cheer') }] },
        { skill: 'looks', ask: 'It’s big and grey. It’s got a long nose.', reply: 'The elephant!', answer: 2, options: [{ label: 'lion', img: it('lion') }, { label: 'crocodile', img: it('alligator') }, { label: 'elephant', img: it('elephant') }] },
        { skill: 'can', ask: 'It can’t walk. It can swim. It’s orange.', reply: 'The fish!', answer: 1, options: [{ label: 'frog', img: it('frog') }, { label: 'fish', img: it('fish') }, { label: 'bird', img: it('bird') }] },
        { skill: 'can', ask: 'It can climb and swing. It’s brown.', reply: 'The monkey!', answer: 0, options: [{ label: 'monkey', img: it('coco-cheer') }, { label: 'snake', img: it('snake') }, { label: 'elephant', img: it('elephant') }] },
      ],
      doneLine: 'Listening done! Super ears!',
    },
  },
  {
    id: 'ja7-p1b-listen', kind: 'listen-tap', bg: bgActions, teacher: 'Part 1b — Listening: can (5). Listen and tap the animal. Pass: 4 of 5. The student works alone.',
    targets: [
      { label: 'Monkey', ...CLIMB_SPOT, color: '#8B5A2B' },
      { label: 'Lion', ...RUN_SPOT, color: '#C97A2F' },
      { label: 'Bird', ...FLY_SPOT, color: '#4FA9E0' },
      { label: 'Frog', ...JUMP_SPOT, color: '#3FA34D' },
      { label: 'Fish', ...SWIM_SPOT, color: '#F08A24' },
    ],
    rounds: [
      { prompt: 'It can jump. It’s small and green.', answerLabel: 'Frog', who: 'pip' },
      { prompt: 'It can swim. It can’t walk.', answerLabel: 'Fish', who: 'pip' },
      { prompt: 'It can climb. It can swing.', answerLabel: 'Monkey', who: 'pip' },
      { prompt: 'It can run. It’s big and yellow.', answerLabel: 'Lion', who: 'pip' },
      { prompt: 'It can fly. It’s small.', answerLabel: 'Bird', who: 'pip' },
    ],
  },
  { id: 'ja7-can-1', kind: 'meet', focus: ['animals'], bg: jungleRescue(3), who: 'pip', cardSide: 'left', teacher: 'Can-do: the student names three animals and says how they look — tick it on the Unit 2 can-do card.', line: 'I can name jungle animals and say how they look!', repeat: 'It’s big and grey.' },
  /* Part 2 — Reading: yes or no? */
  {
    id: 'ja7-p2-read', kind: 'true-false', bg: bgWide, img: jungleRescue(3), read: true,
    teacher: 'Part 2 — Reading (5). Look at the picture. Read: yes or no? Pass: 4 of 5.',
    rounds: [
      { who: 'coco', statement: 'The elephant is big.', isTrue: true },
      { who: 'coco', statement: 'The snake is small.', isTrue: false },
      { who: 'coco', statement: 'The snake is in a tree.', isTrue: true },
      { who: 'coco', statement: 'The elephant is green.', isTrue: false },
      { who: 'coco', statement: 'The monkey is brown.', isTrue: true },
    ],
  },
  {
    id: 'ja7-p2b-spell', kind: 'letter-blocks', bg: bgWide, mode: 'sounds', model: false,
    prompt: 'Part 2b — Build the animal words (3)',
    teacher: 'Part 2b — Building words (3). The student puts the sound blocks in order and reads the word. Pass: 2 of 3.',
    rounds: [
      { blocks: ['f', 'r', 'o', 'g'], word: 'frog', img: it('frog') },
      { blocks: ['f', 'i', 'sh'], word: 'fish', img: it('fish') },
      { blocks: ['d', 'u', 'ck'], word: 'duck', img: it('duck-yellow') },
    ],
  },
  {
    id: 'ja7-p2c-tick', kind: 'prea1', teacher: 'Part 2c — Reading sentences (5). Read the sentence, look at the picture — tick or cross? Pass: 4 of 5.',
    scene: {
      id: 'ja7-p2c-tick', kind: 'tick-cross', bg: bgWide, who: 'pip', teacher: 'Read and look. Yes or no?',
      rounds: [
        { img: it('snake'), sentence: 'It’s long and green.', isTrue: true },
        { img: it('elephant'), sentence: 'It’s small.', isTrue: false },
        { img: it('fish-swim'), sentence: 'It can swim.', isTrue: true },
        { img: it('coco-swing'), sentence: 'It can’t swing.', isTrue: false },
        { img: it('bird'), sentence: 'It’s small and blue.', isTrue: true },
      ],
    },
  },
  { id: 'ja7-can-2', kind: 'meet', focus: ['can’t'], bg: bgCocoCantFly, who: 'coco', cardSide: 'right', teacher: 'Can-do: the student says what an animal can and can’t do — tick it.', line: 'I can say what animals can and can’t do!', repeat: 'It can climb. It can’t fly.' },
  /* Part 3 — Reading: the story */
  {
    id: 'ja7-p3-story', kind: 'grammar-gap', bg: bgWide, title: 'Part 3 — The story',
    teacher: 'Part 3 — Reading the story (5). Read and choose the missing word. Pass: 4 of 5.',
    rounds: [
      { before: 'Kip is on a', after: '.', choices: ['rock', 'tree'], answer: 'rock', img: jungleRescue(5) },
      { before: 'I can fly. But I am', after: '.', choices: ['big', 'small'], answer: 'small', img: jungleRescue(6) },
      { before: 'I can swim. I', after: 'lift Kip!', choices: ['can', 'can’t'], answer: 'can’t', img: jungleRescue(7) },
      { before: 'I am big. I can', after: 'in the river.', choices: ['walk', 'fly'], answer: 'walk', img: jungleRescue(9) },
      { before: 'The elephant lifts Kip with its long', after: '.', choices: ['tail', 'nose'], answer: 'nose', img: jungleRescue(10) },
    ],
  },
  {
    id: 'ja7-break', kind: 'prea1', teacher: 'Brain break between the parts: stretch like the animals.',
    scene: {
      id: 'ja7-break', kind: 'tpr-actions', mode: 'break', bg: bgWide, who: 'pip', teacher: 'Stretch like the animals!',
      rounds: [
        { line: 'Stretch up tall like an elephant!', emoji: '\u{1F418}' },
        { line: 'Wiggle like a long snake!', emoji: '\u{1F40D}' },
        { line: 'Breathe and count to five!', emoji: '\u{1F590}\u{FE0F}' },
      ],
    },
  },
  /* Part 4 — Speaking */
  {
    id: 'ja7-p4-speak', kind: 'join-stage', bg: bgFriends, teacher: 'Part 4 — Speaking (5 points: 2 for each animal described in 4 sentences, 1 for a correct “Can it…?” question). Pass: 4 of 5.', cast: ['coco', 'pip'],
    turns: [
      { who: 'coco', line: 'Pick an animal. Tell me four things about it!' },
      { who: 'student', line: 'It’s a … It’s … It can … It can’t …' },
      { who: 'coco', line: 'Great! Now another animal!' },
      { who: 'student', line: 'It’s a … It’s … It can … It can’t …' },
      { who: 'coco', line: 'Now ask me a question!' },
      { who: 'student', line: 'Can a … ?' },
    ],
  },
  {
    id: 'ja7-p4b-ask', kind: 'join-stage', bg: jungleRescue(6), teacher: 'Part 4b — Asking (4 points: one for each “Can it…?” / “Can you…?” question asked in full). The STUDENT asks Willow. Pass: 3 of 4.', cast: ['willow'],
    turns: [
      { who: 'student', line: 'Willow, can you fly?' },
      { who: 'willow', line: 'Yes, I can!' },
      { who: 'student', line: 'Can you swim?' },
      { who: 'willow', line: 'No, I can’t.' },
      { who: 'student', line: 'Can a fish fly?' },
      { who: 'willow', line: 'No, it can’t! It can swim.' },
      { who: 'student', line: 'Can an elephant swim?' },
      { who: 'willow', line: 'Yes, it can!' },
    ],
  },
  { id: 'ja7-can-3', kind: 'meet', focus: ['Can it'], bg: jungleRescue(6), who: 'willow', cardSide: 'right', teacher: 'Can-do: the student asks “Can it…?” and answers — tick it.', line: 'I can ask: Can it swim? And answer: Yes, it can!', repeat: 'Can it swim?' },
  /* Part 5 — Reading aloud */
  {
    id: 'ja7-p5-read-aloud', kind: 'reader', bg: bgWide, title: 'Part 5 — Read it aloud!', doneLine: 'You read it all by yourself!',
    teacher: 'Part 5 — Reading aloud (5 points: every word read, then fluency). Skip the listening: tap “My turn to read” at once. Pass: 4 of 5.',
    pages: [JUNGLE_RESCUE[8], JUNGLE_RESCUE[9]],
  },
  { id: 'ja7-can-4', kind: 'meet', focus: ['story'], bg: jungleRescue(12), who: 'leo', cardSide: 'left', teacher: 'Can-do: the student reads a page of the story and says who helped Kip — tick it.', line: 'I can read the story and say who can help Kip!', repeat: 'The elephant can help!' },
  { id: 'ja7-echo-champ', kind: 'echo', bg: bgWaterfall, who: 'coco', textSide: 'top', teacher: 'Say it proudly with Coco!', word: 'I can do it! Jungle explorer!' },
  { id: 'ja7-i-can', kind: 'meet', focus: ['Unit 2'], bg: bgWaterfall, who: 'coco', cardSide: 'left', teacher: 'Check: any part below 4 of 5? Play it again next lesson (Practise again). Then the trophy!', line: 'I can show everything from Unit 2!', repeat: 'I’m a jungle explorer!' },
  {
    id: 'ja7-sticker', kind: 'prea1', teacher: 'The Unit 2 trophy! The student opens the pack and puts the trophy sticker in their Sticker Book.',
    scene: {
      id: 'ja7-sticker', kind: 'sticker-reward', bg: bgWaterfall, who: 'pip', teacher: 'The Unit 2 trophy!',
      line: 'You passed the Boss Test! Here is your Unit 2 trophy — and piece 1 of the Golden Compass!',
      sticker: { img: it('banana-trophy'), label: 'Golden Compass piece 1' },
    },
  },
  {
    id: 'ja7-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ja7-home-mission', kind: 'home-mission', bg: bgFriends, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Your child finished Unit 2: jungle animals, how they look, can / can\'t, "Can it…?", and the story "The Jungle Rescue". Let them describe two animals and ask you a question.',
      steps: [
        { emoji: '\u{1F418}', say: 'Describe two animals: four sentences each.' },
        { emoji: '\u{2753}', say: 'Ask your family: Can it…?' },
        { emoji: '\u{1F3C6}', say: 'Show your trophy and read the story!' },
      ],
    },
  },
  /* Practise again — for any part below the pass mark, or as extra time */
  {
    id: 'ja7-pa-match', kind: 'picture-match', prompt: 'Practise again: read and match',
    teacher: 'Practise again (Part 2): read each sentence and drag it under its animal.',
    items: [
      { word: 'It’s got a long nose.', img: it('elephant') },
      { word: 'It can swing.', img: it('coco-cheer') },
      { word: 'It’s small and green.', img: it('frog') },
      { word: 'It can’t walk.', img: it('fish') },
    ],
    bg: bgWide,
  },
  {
    id: 'ja7-pa-splat', kind: 'word-splat', bg: bgWide, who: 'pip', title: 'Practise again: Word Splat!',
    teacher: 'Practise again (reading): Pip says a word — splat it and read it.',
    words: ['big', 'small', 'long', 'can', 'can’t', 'swim', 'fly', 'climb', 'nose', 'tail'],
    rounds: ['long', 'can’t', 'swim', 'nose', 'small', 'climb'],
    doneLine: 'Splat! Super reading!',
  },
  {
    id: 'ja7-pa-build', kind: 'sentence-build', bg: bgWide, teacher: 'Practise again (Part 3): put the words in order, then read the sentence.',
    rounds: [
      { words: ['Can', 'a', 'frog', 'jump?'], emoji: '\u{1F438}' },
      { words: ['It', 'can’t', 'fly.'], emoji: '\u{1F6AB}' },
      { words: ['It’s', 'got', 'a', 'long', 'tail.'], emoji: '\u{1F40A}' },
    ],
  },
  {
    id: 'ja7-pa-memory', kind: 'memory', bg: bgWide, teacher: 'Practise again (Part 4): find each question and its answer — read both aloud.',
    pairs: [
      { id: 'fly', label: 'Can a bird fly?', match: 'Yes, it can.', emoji: '\u{1F426}' },
      { id: 'run', label: 'Can a fish run?', match: 'No, it can’t.', emoji: '\u{1F41F}' },
      { id: 'what', label: 'What can a monkey do?', match: 'It can climb.', emoji: '\u{1F412}' },
      { id: 'big', label: 'Is the elephant small?', match: 'No. It’s big.', emoji: '\u{1F418}' },
    ],
  },
  {
    id: 'ja7-pa-chat', kind: 'chat-chain', bg: bgFriends, partner: 'leo', title: 'Practise again: chat with Leo',
    intro: 'Hi! Let’s talk about animals!',
    teacher: 'Practise again (Part 4): Leo talks, the student picks the reply that fits and SAYS it, then taps “I said it”.',
    turns: [
      { who: 'leo', line: 'Tell me about the crocodile!' },
      { who: 'student', line: 'It’s big and green.', wrong: ['It can fly.', 'Yes, it can.'] },
      { who: 'leo', line: 'Can it swim?' },
      { who: 'student', line: 'Yes, it can!', wrong: ['It’s small.', 'No, it can’t!'] },
      { who: 'leo', line: 'Ask me a question!' },
      { who: 'student', line: 'Can a lion climb?', wrong: ['Lion climb.', 'A lion is big.'] },
    ],
  },
  {
    id: 'ja7-pa-quick', kind: 'prea1', teacher: 'Practise again (speaking): quick fire! Say two sentences before the ring runs out.',
    scene: {
      id: 'ja7-pa-quick', kind: 'rapid-recall', bg: bgObstacle, who: 'pip', seconds: 7,
      teacher: 'Say it before the ring runs out!',
      cards: [
        { img: it('elephant'), word: 'elephant', say: 'It’s big. It’s got a long nose.' },
        { img: it('snake'), word: 'snake', say: 'It’s long. It can’t run.' },
        { img: it('bird'), word: 'bird', say: 'It can fly. It’s small.' },
        { img: it('alligator'), word: 'crocodile', say: 'It can swim. It’s green.' },
        { img: it('frog'), word: 'frog', say: 'It can jump. It’s small.' },
      ],
    },
  },
  {
    id: 'ja7-pa-parcel', kind: 'pass-parcel', bg: bgWaterfall, who: 'coco', title: 'Pass the Present!',
    teacher: 'Practise again (all parts): every right answer tears one layer off the present. What is inside?',
    rounds: [
      { ask: 'Can an elephant fly?', choices: ['Yes, it can.', 'No, it can’t.', 'It’s grey.'], answer: 1, img: it('elephant') },
      { ask: 'What is it? It’s long and green.', choices: ['It’s a snake.', 'It’s a lion.', 'It’s a bird.'], answer: 0 },
      { ask: 'What can a frog do?', choices: ['It can swing.', 'It can jump.', 'It can’t jump.'], answer: 1, img: it('frog') },
      { ask: 'Why can’t Willow help Kip?', choices: ['She is small.', 'She is big.', 'She can swim.'], answer: 0, img: jungleRescue(6) },
      { ask: 'How does the elephant lift Kip?', choices: ['With its long tail.', 'With its long nose.', 'With its teeth.'], answer: 1, img: jungleRescue(10) },
    ],
    prize: { img: it('banana-trophy'), label: 'Golden banana' },
    doneLine: 'You opened the present! Golden banana!',
  },
  {
    id: 'ja7-pa-quiz-board', kind: 'quiz-board', bg: bgWaterfall, who: 'coco', title: 'Jungle Jeopardy!',
    teacher: 'Practise again: the student picks any tile — harder questions are worth more. Answer, then say it aloud. One tile is a BOOM tile: double points!',
    categories: [
      { name: 'Animals', emoji: '\u{1F418}', tiles: [{ ask: 'What is it?', choices: ['It’s a snake.', 'It’s a bird.'], answer: 0, img: it('snake') }, { ask: 'It’s big and grey. What is it?', choices: ['an elephant', 'a frog'], answer: 0 }, { ask: 'It’s got a long tail. It can swim.', choices: ['a crocodile', 'a monkey'], answer: 0 }] },
      { name: 'Can it?', emoji: '\u{1F985}', tiles: [{ ask: 'Can a bird fly?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 0 }, { ask: 'Can a fish run?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 1 }, { ask: 'What can a monkey do?', choices: ['It can climb.', 'It can fly.'], answer: 0 }] },
      { name: 'Story', emoji: '\u{1F4D6}', tiles: [{ ask: 'Where is Kip?', choices: ['On a rock.', 'In a tree.'], answer: 0, img: jungleRescue(5) }, { ask: 'Why can’t Willow help?', choices: ['She is small.', 'She is big.'], answer: 0, img: jungleRescue(6) }, { ask: 'Who helps Kip?', choices: ['The elephant.', 'The crocodile.'], answer: 0, img: jungleRescue(10) }] },
      { name: 'Sounds', emoji: '\u{1F524}', tiles: [{ ask: 'Which word starts with ch?', choices: ['chick', 'ship'], answer: 0 }, { ask: 'Which word ends with ck?', choices: ['duck', 'fish'], answer: 0 }, { ask: 'Which word starts with sh?', choices: ['chips', 'shell'], answer: 1 }] },
    ],
    boom: [1, 2],
    doneLine: 'The board is finished! Jungle quiz champion!',
  },
  {
    id: 'ja7-pa-river', kind: 'rising-river', bg: bgWide, who: 'coco', title: 'Build the bridge for Kip!',
    teacher: 'Practise again (together!): every right answer lays a plank. A wrong answer — the water rises a little. Get the friends across!',
    friends: [it('coco-cheer'), it('leo-run'), wtSpr('pip')],
    rounds: [
      { ask: 'Can an elephant walk in the river?', choices: ['Yes, it can.', 'No, it can’t.'], answer: 0 },
      { ask: 'Is a frog big?', choices: ['No. It’s small.', 'Yes. It’s big.'], answer: 0, img: it('frog') },
      { ask: 'What can a fish do?', choices: ['It can swim.', 'It can climb.'], answer: 0 },
      { ask: 'It can fly. It’s small and blue.', choices: ['It’s a bird.', 'It’s a snake.'], answer: 0 },
      { ask: 'Lunch!', choices: ['Chips for all!', 'Help! Help!'], answer: 0 },
    ],
    doneLine: 'Everyone is across! Great teamwork!',
  },
  {
    id: 'ja7-goodbye-song', kind: 'song', bg: bgFriends, title: '\u{1F3B5} Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
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
  { id: 'ja7-finale', kind: 'finale', bg: bgWaterfall, who: 'coco', line: 'You finished Unit 2 and found piece 1 of the Golden Compass! Next stop: space! \u{1F680}' },
];
