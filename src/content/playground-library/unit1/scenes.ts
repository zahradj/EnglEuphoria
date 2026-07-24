import type { Character } from './audio';

/**
 * Little Explorers Phonics — Lesson 1 "The Forest of Hellos" (H + M sounds).
 * Ported faithfully from the original 22-kind, 25-scene Lesson 1 script.
 * Only the `kind`s this lesson actually uses are typed here — the full
 * cast/critter contract from the source project's authoring framework.
 */

export type CharKey = Exclude<Character, 'teacher' | 'narrator'>;

export type BasketItem = { word: string; emoji: string; hit: boolean; img?: string };

export type Scene =
  | { id: string; kind: 'title-card'; bg: string; level: string; unit: string; lessonLabel: string; title: string; subtitle: string }
  | { id: string; kind: 'cinematic'; bg: string; title: string; subtitle: string; narrator: Character; script: { who: Character; line: string; emotion?: 'happy' | 'sad' | 'angry' | 'neutral' }[]; cta: string }
  | { id: string; kind: 'meet'; bg: string; who: CharKey; teacher: string; line: string; repeat?: string; phonics?: string }
  | { id: string; kind: 'sound-model'; bg: string; who: CharKey; prop?: string; letter: string; phoneme: string; sound: string; teacher: string; anchors: { word: string; emoji: string; img?: string }[] }
  | { id: string; kind: 'echo'; bg: string; who: CharKey; teacher: string; word: string; hearWord?: string }
  | { id: string; kind: 'basket'; bg: string; letter: string; phoneme: string; who: CharKey; teacher: string; items: BasketItem[]; goal: number }
  | { id: string; kind: 'trace'; bg: string; who: CharKey; letter: string; phoneme: string; word: string; teacher: string }
  | { id: string; kind: 'sound-sort'; bg: string; teacher: string; targets: { letter: string; phoneme: string; who: CharKey }[]; items: { word: string; img?: string; emoji: string; letter: string }[] }
  | { id: string; kind: 'word-build'; bg: string; teacher: string; rounds: { word: string; blankIndex: number; answer: string; choices: string[]; img?: string; emoji: string }[] }
  | { id: string; kind: 'who-said-it'; bg: string; teacher: string; rounds: { line: string; who: CharKey; emotion?: 'happy' | 'sad' | 'angry' | 'neutral' }[] }
  | { id: string; kind: 'gather'; bg: string; teacher: string; hotspots: { who: CharKey; line: string; x: number; y: number; r: number }[]; stage: { x: number; y: number; r: number } }
  | { id: string; kind: 'memory'; bg: string; teacher: string; pairs: { id: string; label: string; emoji: string; img?: string }[] }
  | { id: string; kind: 'dash'; bg: string; teacher: string; who: CharKey; targetLetter: string; targetPhoneme: string; goal: number; seconds: number; items: { word: string; letter: string; img?: string; emoji: string }[] }
  | { id: string; kind: 'feelings'; bg: string; teacher: string; options: { label: string; emoji: string; reply: string }[] }
  | { id: string; kind: 'puzzle'; bg: string; teacher: string; rounds: { who: CharKey; img: string; hint: string; emotion?: 'happy' | 'sad' | 'angry' | 'neutral' }[] }
  | { id: string; kind: 'roleplay'; bg: string; teacher: string; cast: CharKey[]; script: { who: CharKey; line: string; repeat?: boolean }[] }
  | { id: string; kind: 'join-stage'; bg: string; teacher: string; cast: CharKey[]; turns: { who: CharKey | 'student'; line: string }[] }
  | { id: string; kind: 'hello-doors'; bg: string; teacher: string; cast: CharKey[]; rounds: { target: CharKey; prompt: string; helloLine: string; echoLine: string }[] }
  | { id: string; kind: 'color-friends'; bg: string; teacher: string; cast: CharKey[] }
  | { id: string; kind: 'alphabet-blocks'; bg: string; teacher: string; letters: string[]; tapRounds: { letter: string }[]; words: { word: string; emoji: string }[] }
  | { id: string; kind: 'alphabet-order'; bg: string; teacher: string; sequences: string[] }
  | { id: string; kind: 'song'; bg: string; title: string; teacher: string; songPrompt: string; songUrl?: string; durationSeconds?: number; bigWord?: string; lyrics: { who: CharKey; text: string; emotion?: 'happy' | 'sad' | 'angry' | 'neutral' }[] }
  | { id: string; kind: 'finale'; bg: string; who: Character; line: string }
  | { id: string; kind: 'name-gate'; bg: string; teacher: string; rounds: { who: CharKey; question: string; answer: string }[] }
  | { id: string; kind: 'meet-group'; bg: string; teacher: string; askers: { who: CharKey; xPct: number; yPct: number }[]; newcomer: { who: CharKey; xPct: number; yPct: number }; question: string; answer: string; phonics?: string; showSprites?: boolean }
  | { id: string; kind: 'voice-stage'; bg: string; teacher: string; question: string; niceToMeet?: boolean; rounds: { who: CharKey; cue: string; answer: string }[] }
  | { id: string; kind: 'sound-pop'; bg: string; teacher: string; who: CharKey; goal: number; seconds: number; targets: { letter: string; phoneme: string }[]; items: { word: string; letter: string; img?: string; emoji: string }[] }
  | { id: string; kind: 'brick-crush'; bg: string; teacher: string; who: CharKey; letters: string[]; rows: number; cols: number; goal: number; seconds: number }
  | { id: string; kind: 'friend-pop'; bg: string; teacher: string; cast: CharKey[]; rounds: { target: CharKey; prompt: string; emotion?: 'happy' | 'sad' | 'angry' | 'neutral'; sayLine?: string }[] };

const A = '/lep1'; // public asset root

export const CAST: Record<CharKey, { name: string; img: string; emoji: string; color: string }> = {
  pip: { name: 'Pip', img: `${A}/characters/pip-hello.png`, emoji: '\u{1F98A}', color: '#FE6A2F' },
  mia: { name: 'Mia', img: `${A}/characters/mia-hello.png`, emoji: '\u{1F42D}', color: '#B85CD1' },
  bella: { name: 'Bella', img: `${A}/characters/bella-hello.png`, emoji: '\u{1F430}', color: '#E76FA5' },
  willow: { name: 'Willow', img: `${A}/characters/willow-hello.png`, emoji: '\u{1F426}', color: '#4FA9E0' },
  leo: { name: 'Leo', img: `${A}/characters/leo-hello.png`, emoji: '\u{1F981}', color: '#C97A2F' },
};

export const EMOTION_SPRITE: Record<CharKey, Record<'happy' | 'sad' | 'angry' | 'neutral', string>> = {
  pip: { happy: `${A}/characters/pip-happy.png`, sad: `${A}/characters/pip-sad.png`, angry: `${A}/characters/pip-angry.png`, neutral: `${A}/characters/pip-hello.png` },
  mia: { happy: `${A}/characters/mia-happy.png`, sad: `${A}/characters/mia-sad.png`, angry: `${A}/characters/mia-angry.png`, neutral: `${A}/characters/mia-hello.png` },
  bella: { happy: `${A}/characters/bella-happy.png`, sad: `${A}/characters/bella-sad.png`, angry: `${A}/characters/bella-angry.png`, neutral: `${A}/characters/bella-hello.png` },
  leo: { happy: `${A}/characters/leo-happy.png`, sad: `${A}/characters/leo-sad.png`, angry: `${A}/characters/leo-angry.png`, neutral: `${A}/characters/leo-hello.png` },
  willow: { happy: `${A}/characters/willow-hello.png`, sad: `${A}/characters/willow-hello.png`, angry: `${A}/characters/willow-hello.png`, neutral: `${A}/characters/willow-hello.png` },
};

export function getEmotionSprite(who: CharKey, emotion: 'happy' | 'sad' | 'angry' | 'neutral'): string {
  return EMOTION_SPRITE[who][emotion];
}

export const PROP_THEME: Record<string, { closed: string; label: string; tint: string; img?: string }> = {
  pip: { closed: '\u{1F41A}', label: 'shell', tint: '#FE6A2F', img: `${A}/items/prop-shell.png` },
  mia: { closed: '⭐', label: 'star', tint: '#FDE68A', img: `${A}/items/prop-star.png` },
};

export const CHARACTER_STAGE: Record<CharKey, { side: 'left' | 'right' }> = {
  pip: { side: 'left' },
  mia: { side: 'right' },
  bella: { side: 'left' },
  willow: { side: 'right' },
  leo: { side: 'left' },
};

export const COLOR_SKETCH: Record<CharKey, string> = {
  pip: `${A}/color/color-pip.png`,
  mia: `${A}/color/color-mia.png`,
  bella: `${A}/color/color-bella.png`,
  leo: `${A}/color/color-leo.png`,
  willow: `${A}/color/color-willow.png`,
};

const bgTitleForest = `${A}/scenes/bg-title-forest.jpg`;
const bgClearing = `${A}/scenes/bg-clearing.jpg`;
const scenePipClearing = `${A}/scenes/scene-pip-clearing.jpg`;
const sceneMiaMousehole = `${A}/scenes/scene-mia-mousehole.jpg`;
const sceneBellaBigTree = `${A}/scenes/scene-bella-bigtree.jpg`;
const bgHPortal = `${A}/scenes/bg-h-portal.jpg`;
const bgMPortal = `${A}/scenes/bg-m-portal.jpg`;
const bgHBasket = `${A}/scenes/bg-h-basket.jpg`;
const bgMBasket = `${A}/scenes/bg-m-basket.jpg`;
const bgGather = `${A}/scenes/bg-gather.jpg`;
const bgGatherEmpty = `${A}/scenes/bg-gather-empty.jpg`;
const bgHideSeek = `${A}/scenes/bg-hideseek.jpg`;
const bgMeadow = `${A}/scenes/bg-meadow.jpg`;
const bgBigTree = `${A}/scenes/bg-bigtree.jpg`;
const bgGoodbyeCast = `${A}/scenes/bg-goodbye-cast.jpg`;

const itemHello = `${A}/items/item-hello.png`;
const itemHat = `${A}/items/item-hat.png`;
const itemHouse = `${A}/items/item-house.png`;
const itemMoon = `${A}/items/item-moon.png`;
const itemMilk = `${A}/items/item-milk.png`;
const itemMouse = `${A}/items/item-mouse.png`;

export const LESSON_1_TITLE = 'The Forest of Hellos';
export const LESSON_1_OBJECTIVE = "Greet a friend and say my name using 'Hello. My name is ___.'";

export const LESSON_1_SCENES: Scene[] = [
  { id: 'title-1', kind: 'title-card', bg: bgTitleForest, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 1', title: 'The Forest of Hellos', subtitle: 'Greetings & the /h/ and /m/ sounds' },
  {
    id: 'intro', kind: 'cinematic', bg: bgClearing, title: 'The Forest of Hellos', subtitle: 'A tiny adventure with big new friends', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Hi, hi, hi! I am Pip!' },
      { who: 'pip', line: 'I lost my friends in the forest. Will you help me find them?' },
    ],
    cta: "Let's go!",
  },
  { id: 'meet-pip', kind: 'meet', bg: scenePipClearing, who: 'pip', teacher: 'Look! Pip is here. Tap Pip to say hello!', line: 'Hello! I am Pip!', repeat: 'Hello!', phonics: 'h' },
  {
    id: 'model-h', kind: 'sound-model', bg: bgHPortal, who: 'pip', letter: 'H', phoneme: '/h/', sound: 'huh', teacher: "Listen to Pip's sound. /h/ /h/ Hello!",
    anchors: [
      { word: 'Hello', emoji: '\u{1F44B}', img: itemHello },
      { word: 'Hat', emoji: '\u{1F3A9}', img: itemHat },
      { word: 'House', emoji: '\u{1F3E0}', img: itemHouse },
    ],
  },
  { id: 'echo-hello', kind: 'echo', bg: scenePipClearing, who: 'pip', teacher: 'Repeat after Pip: Hello! Hello! Hello!', word: 'Hello!' },
  {
    id: 'basket-h', kind: 'basket', bg: bgHBasket, letter: 'H', phoneme: '/h/', who: 'pip', teacher: "Drag the /h/ words into Pip's H basket!", goal: 3,
    items: [
      { word: 'hello', emoji: '\u{1F44B}', img: itemHello, hit: true },
      { word: 'hat', emoji: '\u{1F3A9}', img: itemHat, hit: true },
      { word: 'house', emoji: '\u{1F3E0}', img: itemHouse, hit: true },
      { word: 'moon', emoji: '\u{1F319}', img: itemMoon, hit: false },
      { word: 'milk', emoji: '\u{1F95B}', img: itemMilk, hit: false },
    ],
  },
  { id: 'trace-h', kind: 'trace', bg: bgHPortal, who: 'pip', letter: 'H', phoneme: '/h/', word: 'Hello', teacher: 'Trace the big H with your finger! /h/ /h/' },
  { id: 'meet-mia', kind: 'meet', bg: sceneMiaMousehole, who: 'mia', teacher: 'Peek! Tap Mia to meet her!', line: 'Hi! My name is Mia!', repeat: 'My name is Mia!', phonics: 'm' },
  {
    id: 'model-m', kind: 'sound-model', bg: bgMPortal, who: 'mia', letter: 'M', phoneme: '/m/', sound: 'mmm', teacher: 'Listen to Mia’s sound. /m/ /m/ Mia!',
    anchors: [
      { word: 'Mia', emoji: '\u{1F42D}', img: itemMouse },
      { word: 'Moon', emoji: '\u{1F319}', img: itemMoon },
      { word: 'Milk', emoji: '\u{1F95B}', img: itemMilk },
    ],
  },
  { id: 'trace-m', kind: 'trace', bg: bgMPortal, who: 'mia', letter: 'M', phoneme: '/m/', word: 'Mia', teacher: 'Trace the big M with your finger! /m/ /m/' },
  { id: 'echo-mia', kind: 'echo', bg: sceneMiaMousehole, who: 'mia', teacher: 'Repeat after Mia: My name is Mia!', word: 'My name is Mia!' },
  {
    id: 'basket-m', kind: 'basket', bg: bgMBasket, letter: 'M', phoneme: '/m/', who: 'mia', teacher: "Drag the /m/ words into Mia's M basket!", goal: 3,
    items: [
      { word: 'mouse', emoji: '\u{1F42D}', img: itemMouse, hit: true },
      { word: 'moon', emoji: '\u{1F319}', img: itemMoon, hit: true },
      { word: 'milk', emoji: '\u{1F95B}', img: itemMilk, hit: true },
      { word: 'hat', emoji: '\u{1F3A9}', img: itemHat, hit: false },
      { word: 'house', emoji: '\u{1F3E0}', img: itemHouse, hit: false },
    ],
  },
  {
    id: 'sort-hm', kind: 'sound-sort', bg: bgClearing, teacher: 'Listen! Drag each thing to its sound — /h/ or /m/.',
    targets: [
      { letter: 'H', phoneme: '/h/', who: 'pip' },
      { letter: 'M', phoneme: '/m/', who: 'mia' },
    ],
    items: [
      { word: 'hello', emoji: '\u{1F44B}', img: itemHello, letter: 'H' },
      { word: 'moon', emoji: '\u{1F319}', img: itemMoon, letter: 'M' },
      { word: 'milk', emoji: '\u{1F95B}', img: itemMilk, letter: 'M' },
      { word: 'mouse', emoji: '\u{1F42D}', img: itemMouse, letter: 'M' },
      { word: 'hat', emoji: '\u{1F3A9}', img: itemHat, letter: 'H' },
      { word: 'house', emoji: '\u{1F3E0}', img: itemHouse, letter: 'H' },
    ],
  },
  {
    id: 'word-build', kind: 'word-build', bg: bgClearing, teacher: 'Listen! Tap the missing letter to make the word.',
    rounds: [
      { word: 'hat', blankIndex: 0, answer: 'H', choices: ['H', 'M'], img: itemHat, emoji: '\u{1F3A9}' },
      { word: 'moon', blankIndex: 0, answer: 'M', choices: ['H', 'M'], img: itemMoon, emoji: '\u{1F319}' },
      { word: 'house', blankIndex: 0, answer: 'H', choices: ['H', 'M'], img: itemHouse, emoji: '\u{1F3E0}' },
      { word: 'milk', blankIndex: 0, answer: 'M', choices: ['H', 'M'], img: itemMilk, emoji: '\u{1F95B}' },
    ],
  },
  { id: 'meet-bella', kind: 'meet', bg: sceneBellaBigTree, who: 'bella', teacher: 'A bunny hops over. Tap Bella to say hi!', line: 'Hello! I am Bella. Nice to meet you!', repeat: 'Nice to meet you!' },
  { id: 'echo-nice', kind: 'echo', bg: sceneBellaBigTree, who: 'bella', teacher: 'Repeat after Bella: Nice to meet you!', word: 'Nice to meet you!' },
  {
    id: 'who', kind: 'who-said-it', bg: bgHideSeek, teacher: 'Listen! Who is talking? Tap the friend.',
    rounds: [
      { line: 'Hi! My name is Mia!', who: 'mia' },
      { line: 'Hello! I am Pip!', who: 'pip' },
      { line: 'Nice to meet you! I am Bella.', who: 'bella' },
    ],
  },
  {
    id: 'gather', kind: 'gather', bg: bgGather, teacher: 'All friends are here! Tap a friend to hear them. Then drag the camera to the daisy circle for YOUR turn!',
    hotspots: [
      { who: 'pip', line: 'Hello, my name is Pip. Nice to meet you.', x: 380, y: 620, r: 220 },
      { who: 'mia', line: 'Hello, my name is Mia. Nice to meet you.', x: 810, y: 640, r: 200 },
      { who: 'bella', line: 'Hello, my name is Bella. Nice to meet you.', x: 1440, y: 660, r: 230 },
    ],
    stage: { x: 1740, y: 880, r: 180 },
  },
  {
    id: 'memory', kind: 'memory', bg: bgMeadow, teacher: 'Find the pairs! Tap two cards to match them.',
    pairs: [
      { id: 'hello', label: 'Hello', emoji: '\u{1F44B}', img: itemHello },
      { id: 'hat', label: 'Hat', emoji: '\u{1F3A9}', img: itemHat },
      { id: 'moon', label: 'Moon', emoji: '\u{1F319}', img: itemMoon },
      { id: 'milk', label: 'Milk', emoji: '\u{1F95B}', img: itemMilk },
    ],
  },
  {
    id: 'dash', kind: 'dash', bg: bgClearing, teacher: 'Pip Dash! Tap only the H words as they run by. Get 6 rings!', who: 'pip', targetLetter: 'H', targetPhoneme: '/h/', goal: 6, seconds: 40,
    items: [
      { word: 'hat', letter: 'H', img: itemHat, emoji: '\u{1F3A9}' },
      { word: 'house', letter: 'H', img: itemHouse, emoji: '\u{1F3E0}' },
      { word: 'hello', letter: 'H', img: itemHello, emoji: '\u{1F44B}' },
      { word: 'moon', letter: 'M', img: itemMoon, emoji: '\u{1F319}' },
      { word: 'milk', letter: 'M', img: itemMilk, emoji: '\u{1F95B}' },
      { word: 'mouse', letter: 'M', img: itemMouse, emoji: '\u{1F42D}' },
    ],
  },
  {
    id: 'feelings', kind: 'feelings', bg: bgBigTree, teacher: 'Big tree party time! How do you feel?',
    options: [
      { label: 'Happy', emoji: '\u{1F600}', reply: 'Yay! Me too! I am happy!' },
      { label: 'Okay', emoji: '\u{1F610}', reply: 'That is okay. I am with you.' },
      { label: 'Sad', emoji: '\u{1F622}', reply: "It's okay to feel sad. I am here." },
    ],
  },
  {
    id: 'puzzle', kind: 'puzzle', bg: bgMeadow, teacher: 'Guess the friend! Tap pieces to peek, then pick who it is.',
    rounds: [
      { who: 'pip', img: CAST.pip.img, hint: 'A little fox with a warm smile.' },
      { who: 'mia', img: CAST.mia.img, hint: 'A tiny mouse who loves the moon.' },
      { who: 'bella', img: CAST.bella.img, hint: 'A soft bunny who hops in flowers.' },
    ],
  },
  {
    id: 'roleplay-l1', kind: 'roleplay', bg: bgGatherEmpty, teacher: 'Story time! Listen to the friends greet each other, then repeat each line.', cast: ['pip', 'mia', 'bella'],
    script: [
      { who: 'pip', line: 'Hello! I am Pip.' },
      { who: 'mia', line: 'Hi! My name is Mia.', repeat: true },
      { who: 'bella', line: 'Hello! I am Bella. Nice to meet you!', repeat: true },
      { who: 'pip', line: 'Nice to meet you too!', repeat: true },
    ],
  },
  {
    id: 'join-stage-l1', kind: 'join-stage', bg: bgGatherEmpty, teacher: 'Your turn! When it says YOU, say your name out loud!', cast: ['pip', 'mia', 'bella'],
    turns: [
      { who: 'pip', line: 'Hello! I am Pip.' },
      { who: 'mia', line: 'Hi! My name is Mia.' },
      { who: 'bella', line: 'Hello! I am Bella.' },
      { who: 'student', line: 'Hello! My name is ___.' },
      { who: 'pip', line: 'Nice to meet you!' },
    ],
  },
  {
    id: 'hello-doors-l1', kind: 'hello-doors', bg: bgBigTree, teacher: 'Knock knock! Tap the right door, then say hello to your friend!', cast: ['pip', 'mia', 'bella'],
    rounds: [
      { target: 'pip', prompt: 'Knock knock! Where is Pip?', helloLine: 'Hello! My name is Pip.', echoLine: 'Hello, Pip!' },
      { target: 'mia', prompt: 'Knock knock! Where is Mia?', helloLine: 'Hello! My name is Mia.', echoLine: 'Hello, Mia!' },
      { target: 'bella', prompt: 'Knock knock! Where is Bella?', helloLine: 'Hello! My name is Bella.', echoLine: 'Hello, Bella!' },
      { target: 'mia', prompt: 'Knock again! Find Mia!', helloLine: 'Hello! My name is Mia.', echoLine: 'Hi, Mia!' },
      { target: 'pip', prompt: 'One more! Find Pip!', helloLine: 'Hello! My name is Pip.', echoLine: 'Hi, Pip!' },
    ],
  },
  { id: 'l1-color-friends', kind: 'color-friends', bg: bgMeadow, teacher: 'Bonus time! Pick a color and tap your friends to paint them!', cast: ['pip', 'mia', 'bella'] },
  {
    id: 'l1-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! First, tap the sound. Then, stack the word!', letters: ['H', 'M', 'A', 'T'],
    tapRounds: [{ letter: 'H' }, { letter: 'M' }, { letter: 'H' }, { letter: 'M' }],
    words: [
      { word: 'HAT', emoji: '\u{1F3A9}' },
      { word: 'MAT', emoji: '\u{1F7EB}' },
      { word: 'HAM', emoji: '\u{1F953}' },
    ],
  },
  { id: 'l1-alphabet-order', kind: 'alphabet-order', bg: bgMeadow, teacher: 'Alphabet Order! Drag the letters into ABC order!', sequences: ['ABCD', 'EFGH', 'HIJK'] },
  {
    id: 'l1-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: "Everyone waves goodbye! Sing together and wave on every 'goodbye'.",
    durationSeconds: 30, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3`,
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'mia', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'bella', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'finale', kind: 'finale', bg: bgBigTree, who: 'pip', line: 'You did it! You made three new friends! Hello, hello, hello!' },
];

/* =========================================================================
 * Lesson 2 — "The Name Carnival" (N + W sounds, cumulative H/M/N/W review)
 * ========================================================================= */

const bgNameCarnivalTitle = `${A}/scenes/bg-name-carnival-title.jpg`;
const bgNameCarnivalGate = `${A}/scenes/bg-name-carnival-gate.jpg`;
const bgMeetWillowGroup = `${A}/scenes/bg-meet-willow-group.jpg`;
const bgNameCarnivalBridge = `${A}/scenes/bg-name-carnival-bridge.jpg`;
const bgNameCarnivalNest = `${A}/scenes/bg-name-carnival-nest.jpg`;
const bgNameMicStage = `${A}/scenes/bg-name-mic-stage.jpg`;
const bgNameCarnivalStage = `${A}/scenes/bg-name-carnival-stage.jpg`;
const bgNameCarnivalSky = `${A}/scenes/bg-name-carnival-sky.jpg`;
const bgWillowMeadow = `${A}/scenes/bg-willow-meadow.jpg`;

const itemWhat = `${A}/items/item-what.png`;
const itemWater = `${A}/items/item-water.png`;
const itemWind = `${A}/items/item-wind.png`;
const itemNut = `${A}/items/item-nut.png`;
const itemNose = `${A}/items/item-nose.png`;
const itemWave = `${A}/items/item-wave.png`;
const itemName = `${A}/items/item-name.png`;

export const comicPointForward = `${A}/props/comic-point-forward.png`;

export const LESSON_2_TITLE = 'The Name Carnival';
export const LESSON_2_OBJECTIVE = 'Ask and answer "What is your name?" while reviewing H, M, N, W sounds.';

export const LESSON_2_SCENES: Scene[] = [
  { id: 'l2-title', kind: 'title-card', bg: bgNameCarnivalTitle, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 2', title: 'The Name Carnival', subtitle: 'Ask names · answer names · win name tickets' },
  {
    id: 'l2-intro', kind: 'cinematic', bg: bgNameCarnivalGate, title: 'The Carnival Gate', subtitle: 'Every booth opens with one magic question.', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Welcome to the Name Carnival!' },
      { who: 'pip', line: 'To open a booth, ask: What is your name?' },
      { who: 'bella', line: 'Then listen: My name is Bella!' },
    ],
    cta: 'Open the gate!',
  },
  {
    id: 'l2-name-gate', kind: 'name-gate', bg: bgNameCarnivalGate, teacher: 'Teacher and student: tap a booth, ask the question, then listen to the answer.',
    rounds: [
      { who: 'pip', question: 'What is your name?', answer: 'My name is Pip!' },
      { who: 'mia', question: 'What is your name?', answer: 'My name is Mia!' },
      { who: 'bella', question: 'What is your name?', answer: 'My name is Bella!' },
    ],
  },
  {
    id: 'l2-meet-willow', kind: 'meet-group', bg: bgMeetWillowGroup, teacher: 'Tap Pip, Mia, and Bella one by one. Each time, repeat: What is your name? Then Willow answers — repeat his name!',
    askers: [
      { who: 'pip', xPct: 17, yPct: 62 },
      { who: 'mia', xPct: 40, yPct: 68 },
      { who: 'bella', xPct: 55, yPct: 66 },
    ],
    newcomer: { who: 'willow', xPct: 83, yPct: 60 },
    question: 'What is your name?', answer: 'My name is Willow!', phonics: '/w/ /w/ Willow!',
  },
  {
    id: 'l2-model-w', kind: 'sound-model', bg: bgNameCarnivalBridge, who: 'pip', letter: 'W', phoneme: '/w/', sound: 'wuh', teacher: 'At the water bridge, Pip models /w/ before practice.',
    anchors: [
      { word: 'What', emoji: '❓', img: itemWhat },
      { word: 'Water', emoji: '\u{1F4A7}', img: itemWater },
      { word: 'Wind', emoji: '\u{1F4A8}', img: itemWind },
    ],
  },
  { id: 'l2-trace-w', kind: 'trace', bg: bgNameCarnivalBridge, who: 'pip', letter: 'W', phoneme: '/w/', word: 'What', teacher: 'Trace the carnival ribbon W. /w/ /w/ What!' },
  {
    id: 'l2-model-n', kind: 'sound-model', bg: bgNameCarnivalNest, who: 'mia', prop: 'nest', letter: 'N', phoneme: '/n/', sound: 'nnn', teacher: 'Mia opens the nest corner. Listen first: /n/ /n/ Nut.',
    anchors: [
      { word: 'Nut', emoji: '\u{1F330}', img: itemNut },
      { word: 'Nest', emoji: '\u{1FAB9}', img: `${A}/items/item-nest.png` },
      { word: 'Nose', emoji: '\u{1F443}', img: itemNose },
    ],
  },
  { id: 'l2-trace-n', kind: 'trace', bg: bgNameCarnivalNest, who: 'mia', letter: 'N', phoneme: '/n/', word: 'Nut', teacher: 'Trace the cozy N. /n/ /n/ Nut!' },
  {
    id: 'l2-student-question', kind: 'voice-stage', bg: bgNameMicStage, teacher: 'Grab the mic! Ask each friend: What is your name? Then say: Nice to meet you too!', question: 'What is your name?', niceToMeet: true,
    rounds: [
      { who: 'mia', cue: 'Ask Mia!', answer: 'My name is Mia.' },
      { who: 'bella', cue: 'Ask Bella!', answer: 'My name is Bella.' },
      { who: 'willow', cue: 'Ask Willow!', answer: 'My name is Willow.' },
    ],
  },
  {
    id: 'l2-sort-nw', kind: 'sound-sort', bg: bgNameCarnivalBridge, teacher: 'Carnival sound toss! Listen and drag to /n/ or /w/.',
    targets: [
      { letter: 'N', phoneme: '/n/', who: 'mia' },
      { letter: 'W', phoneme: '/w/', who: 'pip' },
    ],
    items: [
      { word: 'nest', emoji: '\u{1FAB9}', img: `${A}/items/item-nest.png`, letter: 'N' },
      { word: 'water', emoji: '\u{1F4A7}', img: itemWater, letter: 'W' },
      { word: 'wind', emoji: '\u{1F32C}️', img: itemWind, letter: 'W' },
      { word: 'wave', emoji: '\u{1F30A}', img: itemWave, letter: 'W' },
      { word: 'nose', emoji: '\u{1F443}', img: itemNose, letter: 'N' },
      { word: 'nut', emoji: '\u{1F330}', img: itemNut, letter: 'N' },
    ],
  },
  {
    id: 'l2-sort-all', kind: 'sound-sort', bg: bgNameCarnivalBridge, teacher: 'Big sound mix-up! Drag each picture to /h/, /m/, /n/ or /w/.',
    targets: [
      { letter: 'H', phoneme: '/h/', who: 'pip' },
      { letter: 'M', phoneme: '/m/', who: 'mia' },
      { letter: 'N', phoneme: '/n/', who: 'bella' },
      { letter: 'W', phoneme: '/w/', who: 'willow' },
    ],
    items: [
      { word: 'hat', emoji: '\u{1F3A9}', img: `${A}/items/item-hat.png`, letter: 'H' },
      { word: 'house', emoji: '\u{1F3E0}', img: `${A}/items/item-house.png`, letter: 'H' },
      { word: 'mouse', emoji: '\u{1F42D}', img: `${A}/items/item-mouse.png`, letter: 'M' },
      { word: 'moon', emoji: '\u{1F319}', img: `${A}/items/item-moon.png`, letter: 'M' },
      { word: 'nest', emoji: '\u{1FAB9}', img: `${A}/items/item-nest.png`, letter: 'N' },
      { word: 'nose', emoji: '\u{1F443}', img: itemNose, letter: 'N' },
      { word: 'water', emoji: '\u{1F4A7}', img: itemWater, letter: 'W' },
      { word: 'wave', emoji: '\u{1F30A}', img: itemWave, letter: 'W' },
    ],
  },
  { id: 'l2-brick-crush', kind: 'brick-crush', bg: bgNameCarnivalSky, teacher: 'Brick Crush! Listen to the sound, then tap every brick with that letter.', who: 'pip', letters: ['H', 'M', 'N', 'W'], rows: 6, cols: 7, goal: 18, seconds: 60 },
  {
    id: 'l2-sound-pop', kind: 'sound-pop', bg: bgNameCarnivalSky, teacher: 'Balloon Letter Pop! Willow will call a letter. Pop only the balloons with that letter.', who: 'willow', goal: 8, seconds: 45,
    targets: [
      { letter: 'H', phoneme: '/h/' },
      { letter: 'N', phoneme: '/n/' },
    ],
    items: [
      { word: 'H', letter: 'H', emoji: 'H' }, { word: 'N', letter: 'N', emoji: 'N' }, { word: 'A', letter: 'A', emoji: 'A' },
      { word: 'B', letter: 'B', emoji: 'B' }, { word: 'C', letter: 'C', emoji: 'C' }, { word: 'D', letter: 'D', emoji: 'D' },
      { word: 'E', letter: 'E', emoji: 'E' }, { word: 'F', letter: 'F', emoji: 'F' }, { word: 'G', letter: 'G', emoji: 'G' },
      { word: 'I', letter: 'I', emoji: 'I' }, { word: 'K', letter: 'K', emoji: 'K' }, { word: 'L', letter: 'L', emoji: 'L' },
      { word: 'M', letter: 'M', emoji: 'M' }, { word: 'O', letter: 'O', emoji: 'O' }, { word: 'P', letter: 'P', emoji: 'P' },
      { word: 'R', letter: 'R', emoji: 'R' }, { word: 'S', letter: 'S', emoji: 'S' }, { word: 'T', letter: 'T', emoji: 'T' },
    ],
  },
  {
    id: 'l2-grand-build', kind: 'word-build', bg: bgNameCarnivalGate, teacher: 'Grand ticket round! Choose the first sound: H, M, N, or W.',
    rounds: [
      { word: 'name', blankIndex: 0, answer: 'N', choices: ['H', 'M', 'N', 'W'], img: itemName, emoji: '\u{1F3F7}️' },
      { word: 'what', blankIndex: 0, answer: 'W', choices: ['H', 'M', 'N', 'W'], img: itemWhat, emoji: '❓' },
      { word: 'water', blankIndex: 0, answer: 'W', choices: ['H', 'M', 'N', 'W'], img: itemWater, emoji: '\u{1F4A7}' },
      { word: 'nest', blankIndex: 0, answer: 'N', choices: ['H', 'M', 'N', 'W'], img: `${A}/items/item-nest.png`, emoji: '\u{1FAB9}' },
      { word: 'moon', blankIndex: 0, answer: 'M', choices: ['H', 'M', 'N', 'W'], img: `${A}/items/item-moon.png`, emoji: '\u{1F319}' },
      { word: 'hat', blankIndex: 0, answer: 'H', choices: ['H', 'M', 'N', 'W'], img: `${A}/items/item-hat.png`, emoji: '\u{1F3A9}' },
    ],
  },
  {
    id: 'l2-dash-carnival', kind: 'dash', bg: bgNameCarnivalStage, teacher: 'Willow Dash! Fly through the carnival and tap only W words. Get 6 rings!', who: 'willow', targetLetter: 'W', targetPhoneme: '/w/', goal: 6, seconds: 40,
    items: [
      { word: 'water', letter: 'W', img: itemWater, emoji: '\u{1F4A7}' },
      { word: 'wind', letter: 'W', img: itemWind, emoji: '\u{1F32C}️' },
      { word: 'wave', letter: 'W', img: itemWave, emoji: '\u{1F30A}' },
      { word: 'what', letter: 'W', img: itemWhat, emoji: '❓' },
      { word: 'name', letter: 'N', img: itemName, emoji: '\u{1F3F7}️' },
      { word: 'nest', letter: 'N', img: `${A}/items/item-nest.png`, emoji: '\u{1FAB9}' },
      { word: 'hat', letter: 'H', img: `${A}/items/item-hat.png`, emoji: '\u{1F3A9}' },
      { word: 'milk', letter: 'M', img: `${A}/items/item-milk.png`, emoji: '\u{1F95B}' },
    ],
  },
  {
    id: 'l2-roleplay-meet-willow', kind: 'roleplay', bg: bgWillowMeadow, teacher: 'Story time! Pip, Mia and Bella meet Willow. Listen, then repeat after each friend.', cast: ['pip', 'mia', 'bella', 'willow'],
    script: [
      { who: 'pip', line: 'Hello!', repeat: true },
      { who: 'willow', line: 'Hello!' },
      { who: 'pip', line: 'What is your name?', repeat: true },
      { who: 'willow', line: 'My name is Willow.' },
      { who: 'willow', line: 'What is your name?' },
      { who: 'pip', line: 'My name is Pip.', repeat: true },
      { who: 'mia', line: 'My name is Mia.', repeat: true },
      { who: 'bella', line: 'My name is Bella.', repeat: true },
      { who: 'willow', line: 'Nice to meet you!' },
      { who: 'pip', line: 'Nice to meet you, Willow!', repeat: true },
      { who: 'willow', line: 'Goodbye!' },
      { who: 'pip', line: 'Goodbye, Willow! See you soon!', repeat: true },
    ],
  },
  {
    id: 'l2-join-stage', kind: 'join-stage', bg: bgNameCarnivalStage, teacher: 'Your turn on stage! Drag your camera onto the stage, then take each turn.', cast: ['pip', 'mia', 'bella', 'willow'],
    turns: [
      { who: 'pip', line: 'Hello!' },
      { who: 'student', line: 'Hello!' },
      { who: 'willow', line: 'What is your name?' },
      { who: 'student', line: 'My name is ___.' },
      { who: 'mia', line: 'Nice to meet you!' },
      { who: 'student', line: 'Nice to meet you!' },
      { who: 'bella', line: 'Goodbye!' },
      { who: 'student', line: 'Goodbye!' },
    ],
  },
  {
    id: 'l2-friend-pop', kind: 'friend-pop', bg: bgNameCarnivalSky, teacher: 'Whack-a-Friend! Tap the friend I call from the tents.', cast: ['pip', 'mia', 'bella', 'willow'],
    rounds: [
      { target: 'willow', prompt: 'Where is Willow?' },
      { target: 'mia', prompt: 'Where is Mia?' },
      { target: 'pip', prompt: 'Where is Pip?' },
      { target: 'bella', prompt: 'Where is Bella?' },
      { target: 'willow', prompt: 'Find Willow again!' },
    ],
  },
  { id: 'l2-color-friends', kind: 'color-friends', bg: bgMeadow, teacher: 'Bonus round! Choose a color and paint your friends!', cast: ['pip', 'mia', 'bella', 'willow'] },
  {
    id: 'l2-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! Tap the sound, then stack the word!', letters: ['H', 'M', 'N', 'W', 'A', 'I', 'T'],
    tapRounds: [{ letter: 'H' }, { letter: 'M' }, { letter: 'N' }, { letter: 'W' }],
    words: [
      { word: 'HAT', emoji: '\u{1F3A9}' },
      { word: 'MAN', emoji: '\u{1F9CD}' },
      { word: 'WIN', emoji: '\u{1F3C6}' },
    ],
  },
  { id: 'l2-alphabet-order', kind: 'alphabet-order', bg: bgMeadow, teacher: 'Alphabet Order! Drag the letters into ABC order!', sequences: ['EFGH', 'IJKL', 'MNOP'] },
  {
    id: 'l2-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye to Willow and all the friends! Sing along together.',
    durationSeconds: 30, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3`,
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'willow', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'mia', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'bella', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'l2-finale', kind: 'finale', bg: bgWillowMeadow, who: 'willow', line: 'You did it! You met Willow! What is your name? My name is Willow!' },
];

/* =========================================================================
 * Lesson 3 — "The Sunshine Meadow" (S + A sounds, cumulative H/M/N/W/S/A)
 * ========================================================================= */

const itemStar = `${A}/items/prop-star.png`;
const itemSun = `${A}/items/item-sun.svg`;
const itemSnake = `${A}/items/item-snake.svg`;
const itemApple = `${A}/items/item-apple.svg`;
const itemAnt = `${A}/items/item-ant.svg`;
const itemAlligator = `${A}/items/item-alligator.svg`;

export const LESSON_3_TITLE = 'The Sunshine Meadow';
export const LESSON_3_OBJECTIVE = 'Ask and answer "How are you?" while learning the /s/ and /a/ sounds and reviewing H, M, N, W.';

export const LESSON_3_SCENES: Scene[] = [
  { id: 'l3-title', kind: 'title-card', bg: bgMeadow, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 3', title: 'The Sunshine Meadow', subtitle: 'Feelings & the /s/ and /a/ sounds' },
  {
    id: 'l3-intro', kind: 'cinematic', bg: bgMeadow, title: 'The Sunshine Meadow', subtitle: 'A new friend is napping in the sun', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Shh! Someone new is sleeping in the sunshine.' },
      { who: 'pip', line: 'Let’s wake up our new friend and ask: How are you?' },
    ],
    cta: 'Wake him up!',
  },
  { id: 'l3-meet-leo', kind: 'meet', bg: bgBigTree, who: 'leo', teacher: 'A big yawn! Tap Leo to say hello!', line: 'Hello! My name is Leo. How are you?', repeat: 'How are you?' },
  { id: 'l3-echo-s', kind: 'echo', bg: bgHideSeek, who: 'bella', teacher: 'Repeat after Bella: Sun! Sun! Sun!', word: 'Sun!' },
  { id: 'l3-trace-s', kind: 'trace', bg: bgHideSeek, who: 'bella', letter: 'S', phoneme: '/s/', word: 'Sun', teacher: 'Trace the wiggly S with your finger! /s/ /s/ Sun!' },
  { id: 'l3-echo-a', kind: 'echo', bg: bgClearing, who: 'willow', teacher: 'Repeat after Willow: Apple! Apple! Apple!', word: 'Apple!' },
  { id: 'l3-trace-a', kind: 'trace', bg: bgClearing, who: 'willow', letter: 'A', phoneme: '/a/', word: 'Apple', teacher: 'Trace the tall A with your finger! /a/ /a/ Apple!' },
  {
    id: 'l3-feelings', kind: 'feelings', bg: bgBigTree, teacher: 'Leo wants to know — how are you today?',
    options: [
      { label: 'Happy', emoji: '\u{1F600}', reply: 'Yay! Me too! I am happy!' },
      { label: 'Okay', emoji: '\u{1F610}', reply: 'That is okay. I am with you.' },
      { label: 'Sad', emoji: '\u{1F622}', reply: "It's okay to feel sad. I am here." },
    ],
  },
  {
    id: 'l3-sort-sa', kind: 'sound-sort', bg: bgHideSeek, teacher: 'Sunshine sound toss! Listen and drag to /s/ or /a/.',
    targets: [
      { letter: 'S', phoneme: '/s/', who: 'bella' },
      { letter: 'A', phoneme: '/a/', who: 'willow' },
    ],
    items: [
      { word: 'sun', emoji: '☀️', img: itemSun, letter: 'S' },
      { word: 'star', emoji: '⭐', img: itemStar, letter: 'S' },
      { word: 'snake', emoji: '\u{1F40D}', img: itemSnake, letter: 'S' },
      { word: 'apple', emoji: '\u{1F34E}', img: itemApple, letter: 'A' },
      { word: 'ant', emoji: '\u{1F41C}', img: itemAnt, letter: 'A' },
      { word: 'alligator', emoji: '\u{1F40A}', img: itemAlligator, letter: 'A' },
    ],
  },
  {
    id: 'l3-sort-all', kind: 'sound-sort', bg: bgClearing, teacher: 'Big sound mix-up! Drag each picture to /n/, /w/, /s/ or /a/.',
    targets: [
      { letter: 'N', phoneme: '/n/', who: 'mia' },
      { letter: 'W', phoneme: '/w/', who: 'pip' },
      { letter: 'S', phoneme: '/s/', who: 'bella' },
      { letter: 'A', phoneme: '/a/', who: 'willow' },
    ],
    items: [
      { word: 'nest', emoji: '\u{1FAB9}', img: `${A}/items/item-nest.png`, letter: 'N' },
      { word: 'nose', emoji: '\u{1F443}', img: itemNose, letter: 'N' },
      { word: 'water', emoji: '\u{1F4A7}', img: itemWater, letter: 'W' },
      { word: 'wave', emoji: '\u{1F30A}', img: itemWave, letter: 'W' },
      { word: 'sun', emoji: '☀️', img: itemSun, letter: 'S' },
      { word: 'snake', emoji: '\u{1F40D}', img: itemSnake, letter: 'S' },
      { word: 'apple', emoji: '\u{1F34E}', img: itemApple, letter: 'A' },
      { word: 'ant', emoji: '\u{1F41C}', img: itemAnt, letter: 'A' },
    ],
  },
  {
    id: 'l3-word-build', kind: 'word-build', bg: bgMeadow, teacher: 'Sunshine round! Choose the first sound: H, M, N, W, S, or A.',
    rounds: [
      { word: 'sun', blankIndex: 0, answer: 'S', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemSun, emoji: '☀️' },
      { word: 'ant', blankIndex: 0, answer: 'A', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemAnt, emoji: '\u{1F41C}' },
      { word: 'water', blankIndex: 0, answer: 'W', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemWater, emoji: '\u{1F4A7}' },
      { word: 'nest', blankIndex: 0, answer: 'N', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: `${A}/items/item-nest.png`, emoji: '\u{1FAB9}' },
      { word: 'hat', blankIndex: 0, answer: 'H', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: `${A}/items/item-hat.png`, emoji: '\u{1F3A9}' },
      { word: 'moon', blankIndex: 0, answer: 'M', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: `${A}/items/item-moon.png`, emoji: '\u{1F319}' },
    ],
  },
  {
    id: 'l3-who', kind: 'who-said-it', bg: bgHideSeek, teacher: 'Listen! Who is talking? Tap the friend.',
    rounds: [
      { line: 'Hello! My name is Leo. How are you?', who: 'leo' },
      { line: 'My name is Willow!', who: 'willow' },
      { line: 'Nice to meet you! I am Bella.', who: 'bella' },
    ],
  },
  {
    id: 'l3-memory', kind: 'memory', bg: bgMeadow, teacher: 'Find the pairs! Tap two cards to match them.',
    pairs: [
      { id: 'sun', label: 'Sun', emoji: '☀️', img: itemSun },
      { id: 'star', label: 'Star', emoji: '⭐', img: itemStar },
      { id: 'apple', label: 'Apple', emoji: '\u{1F34E}', img: itemApple },
      { id: 'ant', label: 'Ant', emoji: '\u{1F41C}', img: itemAnt },
    ],
  },
  {
    id: 'l3-dash', kind: 'dash', bg: bgClearing, teacher: 'Leo Dash! Tap only the S words as they run by. Get 6 rings!', who: 'leo', targetLetter: 'S', targetPhoneme: '/s/', goal: 6, seconds: 40,
    items: [
      { word: 'sun', letter: 'S', img: itemSun, emoji: '☀️' },
      { word: 'star', letter: 'S', img: itemStar, emoji: '⭐' },
      { word: 'snake', letter: 'S', img: itemSnake, emoji: '\u{1F40D}' },
      { word: 'apple', letter: 'A', img: itemApple, emoji: '\u{1F34E}' },
      { word: 'ant', letter: 'A', img: itemAnt, emoji: '\u{1F41C}' },
      { word: 'alligator', letter: 'A', img: itemAlligator, emoji: '\u{1F40A}' },
    ],
  },
  {
    id: 'l3-puzzle', kind: 'puzzle', bg: bgMeadow, teacher: 'Guess the friend! Tap pieces to peek, then pick who it is.',
    rounds: [
      { who: 'leo', img: CAST.leo.img, hint: 'A sleepy lion with a big, warm roar.' },
      { who: 'willow', img: CAST.willow.img, hint: 'A friend who loves the meadow breeze.' },
      { who: 'bella', img: CAST.bella.img, hint: 'A soft bunny who hops in flowers.' },
    ],
  },
  {
    id: 'l3-roleplay', kind: 'roleplay', bg: bgGatherEmpty, teacher: 'Story time! Leo asks how everyone feels. Listen, then repeat each line.', cast: ['pip', 'mia', 'leo'],
    script: [
      { who: 'leo', line: 'Hello! How are you?' },
      { who: 'pip', line: 'I am happy!', repeat: true },
      { who: 'leo', line: 'How are you, Mia?' },
      { who: 'mia', line: 'I am happy too!', repeat: true },
      { who: 'leo', line: 'Yay! We are all happy!', repeat: true },
    ],
  },
  {
    id: 'l3-join-stage', kind: 'join-stage', bg: bgGatherEmpty, teacher: 'Your turn! When it says YOU, say how you feel out loud!', cast: ['pip', 'mia', 'bella', 'leo'],
    turns: [
      { who: 'leo', line: 'How are you?' },
      { who: 'student', line: 'I am happy!' },
      { who: 'mia', line: 'How are you?' },
      { who: 'student', line: 'I am happy!' },
      { who: 'leo', line: 'Yay! Nice to feel happy together!' },
    ],
  },
  {
    id: 'l3-friend-pop', kind: 'friend-pop', bg: bgNameCarnivalSky, teacher: 'Whack-a-Friend! Tap the friend I call in the sunshine.', cast: ['pip', 'mia', 'bella', 'willow', 'leo'],
    rounds: [
      { target: 'leo', prompt: 'Where is Leo?' },
      { target: 'willow', prompt: 'Where is Willow?' },
      { target: 'bella', prompt: 'Where is Bella?' },
      { target: 'mia', prompt: 'Where is Mia?' },
      { target: 'leo', prompt: 'Find Leo again!' },
    ],
  },
  { id: 'l3-color-friends', kind: 'color-friends', bg: bgMeadow, teacher: 'Bonus round! Choose a color and paint your friends!', cast: ['pip', 'mia', 'bella', 'willow', 'leo'] },
  {
    id: 'l3-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! Tap the sound, then stack the word!', letters: ['H', 'M', 'N', 'W', 'S', 'A'],
    tapRounds: [{ letter: 'S' }, { letter: 'A' }, { letter: 'S' }, { letter: 'A' }],
    words: [
      { word: 'SAT', emoji: '\u{1FA91}' },
      { word: 'MAN', emoji: '\u{1F9CD}' },
      { word: 'HAS', emoji: '✨' },
    ],
  },
  { id: 'l3-alphabet-order', kind: 'alphabet-order', bg: bgMeadow, teacher: 'Alphabet Order! Drag the letters into ABC order!', sequences: ['IJKL', 'MNOP', 'QRST'] },
  {
    id: 'l3-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye to Leo and all the friends! Sing along together.',
    durationSeconds: 30, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3`,
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'leo', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'mia', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'bella', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'l3-finale', kind: 'finale', bg: bgBigTree, who: 'leo', line: 'You did it! You met Leo and shared your feelings! How are you? I am happy!' },
];

/* =========================================================================
 * Lesson 4 — "The Big Chat Tree" (Let's Talk! — full conversation review,
 * no new letters: cumulative H/M/N/W/S/A)
 * ========================================================================= */

export const LESSON_4_TITLE = 'The Big Chat Tree';
export const LESSON_4_OBJECTIVE = 'Have a full conversation: say hello, ask a name, ask how someone feels, and say goodbye.';

export const LESSON_4_SCENES: Scene[] = [
  { id: 'l4-title', kind: 'title-card', bg: bgBigTree, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 4', title: 'The Big Chat Tree', subtitle: "Let's put it all together!" },
  {
    id: 'l4-intro', kind: 'cinematic', bg: bgBigTree, title: 'The Big Chat Tree', subtitle: 'Everyone gathers for one big conversation', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Today is chat day! Hello, names, feelings — all together!' },
      { who: 'pip', line: 'Listen close, then it is your turn to talk!' },
    ],
    cta: "Let's chat!",
  },
  {
    id: 'l4-model-convo', kind: 'roleplay', bg: bgGatherEmpty, teacher: 'Listen to the whole conversation, then repeat each line.', cast: ['pip', 'mia'],
    script: [
      { who: 'pip', line: 'Hello!' },
      { who: 'mia', line: 'Hi! What is your name?', repeat: true },
      { who: 'pip', line: 'My name is Pip. How are you?', repeat: true },
      { who: 'mia', line: 'I am happy! Goodbye!', repeat: true },
      { who: 'pip', line: 'Goodbye, Mia!', repeat: true },
    ],
  },
  {
    id: 'l4-name-gate', kind: 'name-gate', bg: bgNameCarnivalGate, teacher: 'Tap a booth, ask the question, then listen to the answer.',
    rounds: [
      { who: 'bella', question: 'What is your name?', answer: 'My name is Bella!' },
      { who: 'willow', question: 'What is your name?', answer: 'My name is Willow!' },
      { who: 'leo', question: 'What is your name?', answer: 'My name is Leo!' },
    ],
  },
  {
    id: 'l4-voice-stage', kind: 'voice-stage', bg: bgNameMicStage, teacher: 'Grab the mic! Ask each friend how they feel, then say something nice back.', question: 'How are you?', niceToMeet: true,
    rounds: [
      { who: 'pip', cue: 'Ask Pip!', answer: 'I am happy!' },
      { who: 'bella', cue: 'Ask Bella!', answer: 'I am okay.' },
      { who: 'leo', cue: 'Ask Leo!', answer: 'I am happy!' },
    ],
  },
  {
    id: 'l4-join-stage', kind: 'join-stage', bg: bgGatherEmpty, teacher: 'Your turn on stage! Take the whole conversation from hello to goodbye.', cast: ['pip', 'mia', 'bella', 'willow', 'leo'],
    turns: [
      { who: 'pip', line: 'Hello!' },
      { who: 'student', line: 'Hello!' },
      { who: 'mia', line: 'What is your name?' },
      { who: 'student', line: 'My name is ___.' },
      { who: 'bella', line: 'How are you?' },
      { who: 'student', line: 'I am happy!' },
      { who: 'willow', line: 'Nice to meet you!' },
      { who: 'student', line: 'Nice to meet you too!' },
      { who: 'leo', line: 'Goodbye!' },
      { who: 'student', line: 'Goodbye!' },
    ],
  },
  {
    id: 'l4-who', kind: 'who-said-it', bg: bgHideSeek, teacher: 'Listen! Who is talking? Tap the friend.',
    rounds: [
      { line: 'What is your name?', who: 'mia' },
      { line: 'How are you?', who: 'bella' },
      { line: 'My name is Leo!', who: 'leo' },
      { line: 'Goodbye! See you soon!', who: 'willow' },
    ],
  },
  {
    id: 'l4-hello-doors', kind: 'hello-doors', bg: bgBigTree, teacher: 'Knock knock! Tap the right door, then say hello to your friend!', cast: ['pip', 'mia', 'bella', 'willow'],
    rounds: [
      { target: 'willow', prompt: 'Knock knock! Where is Willow?', helloLine: 'Hello! My name is Willow.', echoLine: 'Hello, Willow!' },
      { target: 'bella', prompt: 'Knock knock! Where is Bella?', helloLine: 'Hello! My name is Bella.', echoLine: 'Hi, Bella!' },
      { target: 'pip', prompt: 'One more! Find Pip!', helloLine: 'Hello! My name is Pip.', echoLine: 'Hello, Pip!' },
    ],
  },
  {
    id: 'l4-friend-pop', kind: 'friend-pop', bg: bgNameCarnivalSky, teacher: 'Whack-a-Friend! Tap the friend I call.', cast: ['pip', 'mia', 'bella', 'willow', 'leo'],
    rounds: [
      { target: 'leo', prompt: 'Where is Leo?' },
      { target: 'mia', prompt: 'Where is Mia?' },
      { target: 'willow', prompt: 'Where is Willow?' },
      { target: 'bella', prompt: 'Where is Bella?' },
      { target: 'pip', prompt: 'Where is Pip?' },
    ],
  },
  {
    id: 'l4-sort-all', kind: 'sound-sort', bg: bgClearing, teacher: 'Big review! Drag each picture to /h/, /m/, /s/ or /a/.',
    targets: [
      { letter: 'H', phoneme: '/h/', who: 'pip' },
      { letter: 'M', phoneme: '/m/', who: 'mia' },
      { letter: 'S', phoneme: '/s/', who: 'bella' },
      { letter: 'A', phoneme: '/a/', who: 'willow' },
    ],
    items: [
      { word: 'hat', emoji: '\u{1F3A9}', img: `${A}/items/item-hat.png`, letter: 'H' },
      { word: 'house', emoji: '\u{1F3E0}', img: `${A}/items/item-house.png`, letter: 'H' },
      { word: 'moon', emoji: '\u{1F319}', img: `${A}/items/item-moon.png`, letter: 'M' },
      { word: 'milk', emoji: '\u{1F95B}', img: `${A}/items/item-milk.png`, letter: 'M' },
      { word: 'sun', emoji: '☀️', img: itemSun, letter: 'S' },
      { word: 'snake', emoji: '\u{1F40D}', img: itemSnake, letter: 'S' },
      { word: 'apple', emoji: '\u{1F34E}', img: itemApple, letter: 'A' },
      { word: 'ant', emoji: '\u{1F41C}', img: itemAnt, letter: 'A' },
    ],
  },
  {
    id: 'l4-word-build', kind: 'word-build', bg: bgMeadow, teacher: 'Big chat review! Choose the first sound: H, M, N, W, S, or A.',
    rounds: [
      { word: 'hat', blankIndex: 0, answer: 'H', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: `${A}/items/item-hat.png`, emoji: '\u{1F3A9}' },
      { word: 'moon', blankIndex: 0, answer: 'M', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: `${A}/items/item-moon.png`, emoji: '\u{1F319}' },
      { word: 'nest', blankIndex: 0, answer: 'N', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: `${A}/items/item-nest.png`, emoji: '\u{1FAB9}' },
      { word: 'water', blankIndex: 0, answer: 'W', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemWater, emoji: '\u{1F4A7}' },
      { word: 'sun', blankIndex: 0, answer: 'S', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemSun, emoji: '☀️' },
      { word: 'apple', blankIndex: 0, answer: 'A', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemApple, emoji: '\u{1F34E}' },
    ],
  },
  {
    id: 'l4-memory', kind: 'memory', bg: bgMeadow, teacher: 'Find the pairs! Tap two cards to match them.',
    pairs: [
      { id: 'hello', label: 'Hello', emoji: '\u{1F44B}', img: itemHello },
      { id: 'moon', label: 'Moon', emoji: '\u{1F319}', img: itemMoon },
      { id: 'sun', label: 'Sun', emoji: '☀️', img: itemSun },
      { id: 'apple', label: 'Apple', emoji: '\u{1F34E}', img: itemApple },
    ],
  },
  {
    id: 'l4-dash', kind: 'dash', bg: bgClearing, teacher: 'Mia Dash! Tap only the M words as they run by. Get 6 rings!', who: 'mia', targetLetter: 'M', targetPhoneme: '/m/', goal: 6, seconds: 40,
    items: [
      { word: 'moon', letter: 'M', img: itemMoon, emoji: '\u{1F319}' },
      { word: 'milk', letter: 'M', img: itemMilk, emoji: '\u{1F95B}' },
      { word: 'mouse', letter: 'M', img: itemMouse, emoji: '\u{1F42D}' },
      { word: 'sun', letter: 'S', img: itemSun, emoji: '☀️' },
      { word: 'ant', letter: 'A', img: itemAnt, emoji: '\u{1F41C}' },
      { word: 'water', letter: 'W', img: itemWater, emoji: '\u{1F4A7}' },
    ],
  },
  {
    id: 'l4-puzzle', kind: 'puzzle', bg: bgMeadow, teacher: 'Guess the friend! Tap pieces to peek, then pick who it is.',
    rounds: [
      { who: 'willow', img: CAST.willow.img, hint: 'A friend who loves the meadow breeze.' },
      { who: 'leo', img: CAST.leo.img, hint: 'A sleepy lion with a big, warm roar.' },
      { who: 'mia', img: CAST.mia.img, hint: 'A tiny mouse who loves the moon.' },
    ],
  },
  {
    id: 'l4-feelings', kind: 'feelings', bg: bgBigTree, teacher: 'One more time — how do you feel right now?',
    options: [
      { label: 'Happy', emoji: '\u{1F600}', reply: 'Yay! Talking with friends makes me happy too!' },
      { label: 'Okay', emoji: '\u{1F610}', reply: 'That is okay. I am glad you are here.' },
      { label: 'Sad', emoji: '\u{1F622}', reply: "It's okay to feel sad sometimes. I am here for you." },
    ],
  },
  { id: 'l4-color-friends', kind: 'color-friends', bg: bgMeadow, teacher: 'Bonus time! Pick a color and tap your friends to paint them!', cast: ['pip', 'mia', 'bella', 'willow', 'leo'] },
  {
    id: 'l4-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! Tap the sound, then stack the word!', letters: ['H', 'M', 'N', 'W', 'S', 'A'],
    tapRounds: [{ letter: 'H' }, { letter: 'S' }, { letter: 'M' }, { letter: 'A' }],
    words: [
      { word: 'SAT', emoji: '\u{1FA91}' },
      { word: 'HAM', emoji: '\u{1F953}' },
      { word: 'MAN', emoji: '\u{1F9CD}' },
    ],
  },
  { id: 'l4-alphabet-order', kind: 'alphabet-order', bg: bgMeadow, teacher: 'Alphabet Order! Drag the letters into ABC order!', sequences: ['NOPQ', 'RSTU', 'WXYZ'] },
  {
    id: 'l4-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye to everyone! Sing along together.',
    durationSeconds: 30, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3`,
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'leo', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'mia', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'bella', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'l4-finale', kind: 'finale', bg: bgBigTree, who: 'pip', line: 'Wow, what a big chat! Hello, names, feelings, goodbye — you know it all!' },
];

/* =========================================================================
 * Lesson 5 — "Leo's Lost Star" (Story Time — narrative review, cumulative
 * H/M/N/W/S/A, no new letters)
 * ========================================================================= */

export const LESSON_5_TITLE = "Leo's Lost Star";
export const LESSON_5_OBJECTIVE = 'Follow a story, retell key lines, and practice feelings and greetings inside the adventure.';

export const LESSON_5_SCENES: Scene[] = [
  { id: 'l5-title', kind: 'title-card', bg: bgMeadow, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 5', title: "Leo's Lost Star", subtitle: 'A story about friends helping friends' },
  {
    id: 'l5-intro', kind: 'cinematic', bg: bgMeadow, title: "Leo's Lost Star", subtitle: 'Leo cannot find his lucky star', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Oh no! Leo lost his lucky star. He feels sad.' },
      { who: 'pip', line: 'Let’s ask Leo how he feels, and help him find it!' },
    ],
    cta: 'Help Leo!',
  },
  {
    id: 'l5-story-sad', kind: 'roleplay', bg: bgMeadow, teacher: 'Story time! Listen to Leo, then repeat each line.', cast: ['pip', 'leo'],
    script: [
      { who: 'pip', line: 'Leo, how are you?' },
      { who: 'leo', line: 'I am sad. I lost my star.', repeat: true },
      { who: 'pip', line: 'Do not worry! We will help you!', repeat: true },
    ],
  },
  {
    id: 'l5-ask-friends', kind: 'join-stage', bg: bgGatherEmpty, teacher: 'Your turn! Ask each friend how they feel about Leo\'s star.', cast: ['mia', 'bella', 'willow'],
    turns: [
      { who: 'mia', line: 'How are you, Leo?' },
      { who: 'student', line: 'I am sad. I lost my star.' },
      { who: 'bella', line: 'Do not worry, Leo!' },
      { who: 'student', line: 'Thank you!' },
      { who: 'willow', line: 'Let’s look together!' },
    ],
  },
  {
    id: 'l5-search', kind: 'memory', bg: bgMeadow, teacher: 'Search the meadow! Find the matching pairs to look for the star.',
    pairs: [
      { id: 'star', label: 'Star', emoji: '⭐', img: itemStar },
      { id: 'sun', label: 'Sun', emoji: '☀️', img: itemSun },
      { id: 'apple', label: 'Apple', emoji: '\u{1F34E}', img: itemApple },
      { id: 'ant', label: 'Ant', emoji: '\u{1F41C}', img: itemAnt },
    ],
  },
  {
    id: 'l5-found', kind: 'cinematic', bg: bgBigTree, title: 'Found it!', subtitle: 'The star was under the big tree all along', narrator: 'leo',
    script: [
      { who: 'leo', line: 'My star! You found it! I am so happy now!' },
      { who: 'leo', line: 'Thank you, friends! How are you?' },
      { who: 'pip', line: 'We are happy too!' },
    ],
    cta: 'Yay!',
  },
  {
    id: 'l5-who', kind: 'who-said-it', bg: bgHideSeek, teacher: 'Listen! Who said it in the story? Tap the friend.',
    rounds: [
      { line: 'I am sad. I lost my star.', who: 'leo' },
      { line: 'Do not worry! We will help you!', who: 'pip' },
      { line: 'Let’s look together!', who: 'willow' },
    ],
  },
  {
    id: 'l5-roleplay-recap', kind: 'roleplay', bg: bgGatherEmpty, teacher: 'Retell the story! Listen, then repeat each line.', cast: ['leo', 'pip', 'bella'],
    script: [
      { who: 'leo', line: 'I lost my star. I was sad.', repeat: true },
      { who: 'pip', line: 'We looked together.', repeat: true },
      { who: 'bella', line: 'We found the star! Now Leo is happy!', repeat: true },
    ],
  },
  {
    id: 'l5-puzzle', kind: 'puzzle', bg: bgMeadow, teacher: 'Guess the friend from the story! Tap pieces to peek.',
    rounds: [
      { who: 'leo', img: CAST.leo.img, hint: 'He was sad, then happy again.' },
      { who: 'willow', img: CAST.willow.img, hint: 'She said "Let\'s look together!"' },
      { who: 'bella', img: CAST.bella.img, hint: 'She found the star under the tree.' },
    ],
  },
  {
    id: 'l5-feelings', kind: 'feelings', bg: bgBigTree, teacher: 'Leo was sad, now he is happy. How do you feel?',
    options: [
      { label: 'Happy', emoji: '\u{1F600}', reply: 'Yay! Just like Leo when he found his star!' },
      { label: 'Okay', emoji: '\u{1F610}', reply: 'That is okay. Feelings can change, just like in the story.' },
      { label: 'Sad', emoji: '\u{1F622}', reply: "It's okay to feel sad, like Leo did at first. It gets better!" },
    ],
  },
  {
    id: 'l5-sort-all', kind: 'sound-sort', bg: bgClearing, teacher: 'Story review! Drag each picture to /n/, /w/, /s/ or /a/.',
    targets: [
      { letter: 'N', phoneme: '/n/', who: 'mia' },
      { letter: 'W', phoneme: '/w/', who: 'pip' },
      { letter: 'S', phoneme: '/s/', who: 'bella' },
      { letter: 'A', phoneme: '/a/', who: 'willow' },
    ],
    items: [
      { word: 'nose', emoji: '\u{1F443}', img: itemNose, letter: 'N' },
      { word: 'nest', emoji: '\u{1FAB9}', img: `${A}/items/item-nest.png`, letter: 'N' },
      { word: 'wave', emoji: '\u{1F30A}', img: itemWave, letter: 'W' },
      { word: 'water', emoji: '\u{1F4A7}', img: itemWater, letter: 'W' },
      { word: 'star', emoji: '⭐', img: itemStar, letter: 'S' },
      { word: 'snake', emoji: '\u{1F40D}', img: itemSnake, letter: 'S' },
      { word: 'apple', emoji: '\u{1F34E}', img: itemApple, letter: 'A' },
      { word: 'alligator', emoji: '\u{1F40A}', img: itemAlligator, letter: 'A' },
    ],
  },
  {
    id: 'l5-word-build', kind: 'word-build', bg: bgMeadow, teacher: 'Story review! Choose the first sound: H, M, N, W, S, or A.',
    rounds: [
      { word: 'house', blankIndex: 0, answer: 'H', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: `${A}/items/item-house.png`, emoji: '\u{1F3E0}' },
      { word: 'mouse', blankIndex: 0, answer: 'M', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemMouse, emoji: '\u{1F42D}' },
      { word: 'nose', blankIndex: 0, answer: 'N', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemNose, emoji: '\u{1F443}' },
      { word: 'wave', blankIndex: 0, answer: 'W', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemWave, emoji: '\u{1F30A}' },
      { word: 'star', blankIndex: 0, answer: 'S', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemStar, emoji: '⭐' },
      { word: 'ant', blankIndex: 0, answer: 'A', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemAnt, emoji: '\u{1F41C}' },
    ],
  },
  {
    id: 'l5-dash', kind: 'dash', bg: bgClearing, teacher: 'Bella Dash! Tap only the S words as they run by. Get 6 rings!', who: 'bella', targetLetter: 'S', targetPhoneme: '/s/', goal: 6, seconds: 40,
    items: [
      { word: 'star', letter: 'S', img: itemStar, emoji: '⭐' },
      { word: 'sun', letter: 'S', img: itemSun, emoji: '☀️' },
      { word: 'snake', letter: 'S', img: itemSnake, emoji: '\u{1F40D}' },
      { word: 'nest', letter: 'N', img: `${A}/items/item-nest.png`, emoji: '\u{1FAB9}' },
      { word: 'water', letter: 'W', img: itemWater, emoji: '\u{1F4A7}' },
      { word: 'hat', letter: 'H', img: `${A}/items/item-hat.png`, emoji: '\u{1F3A9}' },
    ],
  },
  {
    id: 'l5-hello-doors', kind: 'hello-doors', bg: bgBigTree, teacher: 'Knock knock! Tap the right door, then say hello to your friend!', cast: ['pip', 'mia', 'bella', 'willow'],
    rounds: [
      { target: 'pip', prompt: 'Knock knock! Where is Pip?', helloLine: 'Hello! My name is Pip.', echoLine: 'Hello, Pip!' },
      { target: 'willow', prompt: 'Knock knock! Where is Willow?', helloLine: 'Hello! My name is Willow.', echoLine: 'Hi, Willow!' },
    ],
  },
  { id: 'l5-color-friends', kind: 'color-friends', bg: bgMeadow, teacher: 'Bonus time! Pick a color and paint your friends!', cast: ['pip', 'mia', 'bella', 'willow', 'leo'] },
  {
    id: 'l5-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! Tap the sound, then stack the word!', letters: ['H', 'M', 'N', 'W', 'S', 'A'],
    tapRounds: [{ letter: 'S' }, { letter: 'A' }, { letter: 'N' }, { letter: 'W' }],
    words: [
      { word: 'WAS', emoji: '⏳' },
      { word: 'SAM', emoji: '\u{1F9CD}' },
      { word: 'MAN', emoji: '\u{1F9CD}' },
    ],
  },
  { id: 'l5-alphabet-order', kind: 'alphabet-order', bg: bgMeadow, teacher: 'Alphabet Order! Drag the letters into ABC order!', sequences: ['TUVW', 'VWXY', 'STUV'] },
  {
    id: 'l5-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye! Sing along together.',
    durationSeconds: 30, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3`,
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'leo', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'mia', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'bella', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'l5-finale', kind: 'finale', bg: bgBigTree, who: 'leo', line: 'Thank you for helping me find my star! I am happy again. You are a great friend!' },
];

/* =========================================================================
 * Lesson 6 — "The Trophy Trail" (Trophy Quiz — cumulative capstone review
 * across H, M, N, W, S, A + all communicative goals; no new letters)
 * ========================================================================= */

export const LESSON_6_TITLE = 'The Trophy Trail';
export const LESSON_6_OBJECTIVE = "Show everything you've learned — sounds, names, and feelings — and win the Unit 1 trophy!";

export const LESSON_6_SCENES: Scene[] = [
  { id: 'l6-title', kind: 'title-card', bg: bgGoodbyeCast, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 6', title: 'The Trophy Trail', subtitle: 'Show what you know and win the trophy!' },
  {
    id: 'l6-intro', kind: 'cinematic', bg: bgBigTree, title: 'The Trophy Trail', subtitle: 'One last challenge before the trophy', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Trophy day! Show us everything you know!' },
      { who: 'pip', line: 'Sounds, names, feelings — you can do it all!' },
    ],
    cta: "Let's go!",
  },
  {
    id: 'l6-sort-hm', kind: 'sound-sort', bg: bgClearing, teacher: 'Round 1! Drag each picture to /h/ or /m/.',
    targets: [
      { letter: 'H', phoneme: '/h/', who: 'pip' },
      { letter: 'M', phoneme: '/m/', who: 'mia' },
    ],
    items: [
      { word: 'hello', emoji: '\u{1F44B}', img: itemHello, letter: 'H' },
      { word: 'hat', emoji: '\u{1F3A9}', img: `${A}/items/item-hat.png`, letter: 'H' },
      { word: 'moon', emoji: '\u{1F319}', img: itemMoon, letter: 'M' },
      { word: 'mouse', emoji: '\u{1F42D}', img: itemMouse, letter: 'M' },
    ],
  },
  {
    id: 'l6-sort-nw', kind: 'sound-sort', bg: bgNameCarnivalBridge, teacher: 'Round 2! Drag each picture to /n/ or /w/.',
    targets: [
      { letter: 'N', phoneme: '/n/', who: 'mia' },
      { letter: 'W', phoneme: '/w/', who: 'pip' },
    ],
    items: [
      { word: 'nest', emoji: '\u{1FAB9}', img: `${A}/items/item-nest.png`, letter: 'N' },
      { word: 'nose', emoji: '\u{1F443}', img: itemNose, letter: 'N' },
      { word: 'water', emoji: '\u{1F4A7}', img: itemWater, letter: 'W' },
      { word: 'wave', emoji: '\u{1F30A}', img: itemWave, letter: 'W' },
    ],
  },
  {
    id: 'l6-sort-sa', kind: 'sound-sort', bg: bgHideSeek, teacher: 'Round 3! Drag each picture to /s/ or /a/.',
    targets: [
      { letter: 'S', phoneme: '/s/', who: 'bella' },
      { letter: 'A', phoneme: '/a/', who: 'willow' },
    ],
    items: [
      { word: 'sun', emoji: '☀️', img: itemSun, letter: 'S' },
      { word: 'star', emoji: '⭐', img: itemStar, letter: 'S' },
      { word: 'apple', emoji: '\u{1F34E}', img: itemApple, letter: 'A' },
      { word: 'ant', emoji: '\u{1F41C}', img: itemAnt, letter: 'A' },
    ],
  },
  {
    id: 'l6-word-build', kind: 'word-build', bg: bgMeadow, teacher: 'Trophy round! Choose the first sound: H, M, N, W, S, or A.',
    rounds: [
      { word: 'hat', blankIndex: 0, answer: 'H', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: `${A}/items/item-hat.png`, emoji: '\u{1F3A9}' },
      { word: 'moon', blankIndex: 0, answer: 'M', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemMoon, emoji: '\u{1F319}' },
      { word: 'nest', blankIndex: 0, answer: 'N', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: `${A}/items/item-nest.png`, emoji: '\u{1FAB9}' },
      { word: 'wave', blankIndex: 0, answer: 'W', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemWave, emoji: '\u{1F30A}' },
      { word: 'sun', blankIndex: 0, answer: 'S', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemSun, emoji: '☀️' },
      { word: 'ant', blankIndex: 0, answer: 'A', choices: ['H', 'M', 'N', 'W', 'S', 'A'], img: itemAnt, emoji: '\u{1F41C}' },
    ],
  },
  {
    id: 'l6-sound-pop', kind: 'sound-pop', bg: bgNameCarnivalSky, teacher: 'Balloon Letter Pop! Leo will call a letter. Pop only the balloons with that letter.', who: 'leo', goal: 8, seconds: 45,
    targets: [
      { letter: 'S', phoneme: '/s/' },
      { letter: 'A', phoneme: '/a/' },
    ],
    items: [
      { word: 'S', letter: 'S', emoji: 'S' }, { word: 'A', letter: 'A', emoji: 'A' }, { word: 'B', letter: 'B', emoji: 'B' },
      { word: 'C', letter: 'C', emoji: 'C' }, { word: 'D', letter: 'D', emoji: 'D' }, { word: 'E', letter: 'E', emoji: 'E' },
      { word: 'F', letter: 'F', emoji: 'F' }, { word: 'G', letter: 'G', emoji: 'G' }, { word: 'H', letter: 'H', emoji: 'H' },
      { word: 'I', letter: 'I', emoji: 'I' }, { word: 'K', letter: 'K', emoji: 'K' }, { word: 'L', letter: 'L', emoji: 'L' },
      { word: 'M', letter: 'M', emoji: 'M' }, { word: 'N', letter: 'N', emoji: 'N' }, { word: 'O', letter: 'O', emoji: 'O' },
      { word: 'P', letter: 'P', emoji: 'P' }, { word: 'R', letter: 'R', emoji: 'R' }, { word: 'T', letter: 'T', emoji: 'T' },
    ],
  },
  { id: 'l6-brick-crush', kind: 'brick-crush', bg: bgNameCarnivalSky, teacher: 'Brick Crush! Listen to the sound, then tap every brick with that letter.', who: 'pip', letters: ['H', 'M', 'N', 'W', 'S', 'A'], rows: 6, cols: 7, goal: 20, seconds: 60 },
  {
    id: 'l6-dash', kind: 'dash', bg: bgClearing, teacher: 'Trophy Dash! Tap only the A words as they run by. Get 6 rings!', who: 'willow', targetLetter: 'A', targetPhoneme: '/a/', goal: 6, seconds: 40,
    items: [
      { word: 'apple', letter: 'A', img: itemApple, emoji: '\u{1F34E}' },
      { word: 'ant', letter: 'A', img: itemAnt, emoji: '\u{1F41C}' },
      { word: 'alligator', letter: 'A', img: itemAlligator, emoji: '\u{1F40A}' },
      { word: 'sun', letter: 'S', img: itemSun, emoji: '☀️' },
      { word: 'moon', letter: 'M', img: itemMoon, emoji: '\u{1F319}' },
      { word: 'water', letter: 'W', img: itemWater, emoji: '\u{1F4A7}' },
    ],
  },
  {
    id: 'l6-memory', kind: 'memory', bg: bgMeadow, teacher: 'Find the pairs! Tap two cards to match them.',
    pairs: [
      { id: 'hello', label: 'Hello', emoji: '\u{1F44B}', img: itemHello },
      { id: 'nest', label: 'Nest', emoji: '\u{1FAB9}', img: `${A}/items/item-nest.png` },
      { id: 'star', label: 'Star', emoji: '⭐', img: itemStar },
      { id: 'alligator', label: 'Alligator', emoji: '\u{1F40A}', img: itemAlligator },
    ],
  },
  {
    id: 'l6-who', kind: 'who-said-it', bg: bgHideSeek, teacher: 'Final listening round! Who is talking? Tap the friend.',
    rounds: [
      { line: 'Hello! I am Pip!', who: 'pip' },
      { line: 'My name is Willow!', who: 'willow' },
      { line: 'I am happy!', who: 'mia' },
      { line: 'Nice to meet you!', who: 'bella' },
      { line: 'How are you?', who: 'leo' },
    ],
  },
  {
    id: 'l6-puzzle', kind: 'puzzle', bg: bgMeadow, teacher: 'Guess the friend! Tap pieces to peek, then pick who it is.',
    rounds: [
      { who: 'pip', img: CAST.pip.img, hint: 'A little fox with a warm smile.' },
      { who: 'willow', img: CAST.willow.img, hint: 'A friend who loves the meadow breeze.' },
      { who: 'leo', img: CAST.leo.img, hint: 'A sleepy lion with a big, warm roar.' },
    ],
  },
  {
    id: 'l6-name-gate', kind: 'name-gate', bg: bgNameCarnivalGate, teacher: 'One more time! Ask each friend their name.',
    rounds: [
      { who: 'mia', question: 'What is your name?', answer: 'My name is Mia!' },
      { who: 'leo', question: 'What is your name?', answer: 'My name is Leo!' },
    ],
  },
  {
    id: 'l6-voice-stage', kind: 'voice-stage', bg: bgNameMicStage, teacher: 'One more time! Ask each friend how they feel.', question: 'How are you?', niceToMeet: true,
    rounds: [
      { who: 'willow', cue: 'Ask Willow!', answer: 'I am happy!' },
      { who: 'pip', cue: 'Ask Pip!', answer: 'I am happy!' },
    ],
  },
  {
    id: 'l6-roleplay', kind: 'roleplay', bg: bgGatherEmpty, teacher: 'The whole gang together! Listen, then repeat each line.', cast: ['pip', 'mia', 'leo'],
    script: [
      { who: 'pip', line: 'We did it! Trophy day!' },
      { who: 'mia', line: 'I am so happy!', repeat: true },
      { who: 'leo', line: 'Me too! We are all friends!', repeat: true },
    ],
  },
  {
    id: 'l6-join-stage', kind: 'join-stage', bg: bgGatherEmpty, teacher: 'Your final turn! Show everything you know!', cast: ['pip', 'mia', 'bella', 'willow', 'leo'],
    turns: [
      { who: 'pip', line: 'Hello!' },
      { who: 'student', line: 'Hello! My name is ___.' },
      { who: 'leo', line: 'How are you?' },
      { who: 'student', line: 'I am happy!' },
      { who: 'mia', line: 'You did it! Trophy time!' },
    ],
  },
  {
    id: 'l6-feelings', kind: 'feelings', bg: bgBigTree, teacher: 'You are about to win the trophy! How do you feel?',
    options: [
      { label: 'Happy', emoji: '\u{1F600}', reply: 'Yay! You should feel proud and happy!' },
      { label: 'Okay', emoji: '\u{1F610}', reply: 'That is okay. You worked hard and did great!' },
      { label: 'Sad', emoji: '\u{1F622}', reply: "It's okay. You still earned this trophy — great job!" },
    ],
  },
  { id: 'l6-color-friends', kind: 'color-friends', bg: bgMeadow, teacher: 'Celebration time! Pick a color and paint your friends!', cast: ['pip', 'mia', 'bella', 'willow', 'leo'] },
  {
    id: 'l6-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Final Alphabet Blocks! Tap the sound, then stack the word!', letters: ['H', 'M', 'N', 'W', 'S', 'A'],
    tapRounds: [{ letter: 'H' }, { letter: 'M' }, { letter: 'S' }, { letter: 'A' }],
    words: [
      { word: 'HAS', emoji: '✨' },
      { word: 'SAM', emoji: '\u{1F9CD}' },
      { word: 'MAT', emoji: '\u{1F7EB}' },
    ],
  },
  { id: 'l6-alphabet-order', kind: 'alphabet-order', bg: bgMeadow, teacher: 'Final Alphabet Order! Drag the letters into ABC order!', sequences: ['UVWX', 'RSTU', 'OPQR'] },
  {
    id: 'l6-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F3C6} Trophy Goodbye Song \u{1F3C6}', teacher: 'Wave goodbye and celebrate! Sing along together.',
    durationSeconds: 30, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3`,
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'leo', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'mia', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'bella', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'l6-finale', kind: 'finale', bg: bgBigTree, who: 'pip', line: 'You did it! You earned the Unit 1 Trophy! Hello, names, feelings, and six letter sounds — you know it all! \u{1F3C6}' },
];

/* =========================================================================
 * Unit 2, Lesson 1 — "The Rainbow Meadow" (B + T sounds, Colors & Shapes).
 * Same cast/world as Unit 1 (no new characters or background art exist for
 * a distinct Unit 2 world yet) — see the playground-library-lesson-builder
 * skill, section 6, for why this stays in unit1/scenes.ts despite the DB's
 * unit_number being 2. B and T are taught through "Blue" and "Triangle" so
 * the unit's colors/shapes theme comes through the phonics vocab itself.
 * ========================================================================= */

const itemBall = `${A}/items/item-ball.svg`;
const itemBear = `${A}/items/item-bear.svg`;
const itemButterfly = `${A}/items/item-butterfly.svg`;
const itemTriangle = `${A}/items/item-triangle.svg`;
const itemTurtle = `${A}/items/item-turtle.svg`;
const itemTree = `${A}/items/item-tree.svg`;

export const LESSON_U2L1_TITLE = 'The Rainbow Meadow';
export const LESSON_U2L1_OBJECTIVE = 'Name colors and shapes while learning the /b/ and /t/ sounds.';

export const LESSON_U2L1_SCENES: Scene[] = [
  { id: 'u2l1-title', kind: 'title-card', bg: bgMeadow, level: 'Pre-A1', unit: 'Unit 2', lessonLabel: 'Lesson 1', title: 'The Rainbow Meadow', subtitle: 'Colors, shapes & the /b/ and /t/ sounds' },
  {
    id: 'u2l1-intro', kind: 'cinematic', bg: bgMeadow, title: 'The Rainbow Meadow', subtitle: 'A meadow full of colors and shapes', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Look at all the colors and shapes today!' },
      { who: 'pip', line: 'Bella and Willow found two new sounds to share.' },
    ],
    cta: "Let's look!",
  },
  {
    id: 'u2l1-model-b', kind: 'sound-model', bg: bgClearing, who: 'bella', letter: 'B', phoneme: '/b/', sound: 'buh', teacher: 'Listen to Bella\'s sound. /b/ /b/ Blue!',
    anchors: [
      { word: 'Ball', emoji: '\u{26BD}', img: itemBall },
      { word: 'Bear', emoji: '\u{1F43B}', img: itemBear },
      { word: 'Butterfly', emoji: '\u{1F98B}', img: itemButterfly },
    ],
  },
  { id: 'u2l1-trace-b', kind: 'trace', bg: bgClearing, who: 'bella', letter: 'B', phoneme: '/b/', word: 'Ball', teacher: 'Trace the big B with your finger! /b/ /b/ Ball!' },
  { id: 'u2l1-echo-b', kind: 'echo', bg: bgMeadow, who: 'bella', teacher: 'Repeat after Bella: Blue ball! Blue ball!', word: 'Blue ball!' },
  {
    id: 'u2l1-model-t', kind: 'sound-model', bg: bgBigTree, who: 'willow', letter: 'T', phoneme: '/t/', sound: 'tuh', teacher: 'Listen to Willow\'s sound. /t/ /t/ Triangle!',
    anchors: [
      { word: 'Triangle', emoji: '\u{1F53A}', img: itemTriangle },
      { word: 'Turtle', emoji: '\u{1F422}', img: itemTurtle },
      { word: 'Tree', emoji: '\u{1F333}', img: itemTree },
    ],
  },
  { id: 'u2l1-trace-t', kind: 'trace', bg: bgBigTree, who: 'willow', letter: 'T', phoneme: '/t/', word: 'Triangle', teacher: 'Trace the tall T with your finger! /t/ /t/ Triangle!' },
  { id: 'u2l1-echo-t', kind: 'echo', bg: bgMeadow, who: 'willow', teacher: 'Repeat after Willow: Orange triangle! Orange triangle!', word: 'Orange triangle!' },
  {
    id: 'u2l1-basket-b', kind: 'basket', bg: bgClearing, letter: 'B', phoneme: '/b/', who: 'bella', teacher: "Drag the /b/ words into Bella's B basket!", goal: 3,
    items: [
      { word: 'ball', emoji: '\u{26BD}', img: itemBall, hit: true },
      { word: 'bear', emoji: '\u{1F43B}', img: itemBear, hit: true },
      { word: 'butterfly', emoji: '\u{1F98B}', img: itemButterfly, hit: true },
      { word: 'triangle', emoji: '\u{1F53A}', img: itemTriangle, hit: false },
      { word: 'turtle', emoji: '\u{1F422}', img: itemTurtle, hit: false },
    ],
  },
  {
    id: 'u2l1-basket-t', kind: 'basket', bg: bgBigTree, letter: 'T', phoneme: '/t/', who: 'willow', teacher: "Drag the /t/ words into Willow's T basket!", goal: 3,
    items: [
      { word: 'triangle', emoji: '\u{1F53A}', img: itemTriangle, hit: true },
      { word: 'turtle', emoji: '\u{1F422}', img: itemTurtle, hit: true },
      { word: 'tree', emoji: '\u{1F333}', img: itemTree, hit: true },
      { word: 'ball', emoji: '\u{26BD}', img: itemBall, hit: false },
      { word: 'bear', emoji: '\u{1F43B}', img: itemBear, hit: false },
    ],
  },
  {
    id: 'u2l1-sort-bt', kind: 'sound-sort', bg: bgMeadow, teacher: 'Listen! Drag each thing to its sound — /b/ or /t/.',
    targets: [
      { letter: 'B', phoneme: '/b/', who: 'bella' },
      { letter: 'T', phoneme: '/t/', who: 'willow' },
    ],
    items: [
      { word: 'ball', emoji: '\u{26BD}', img: itemBall, letter: 'B' },
      { word: 'bear', emoji: '\u{1F43B}', img: itemBear, letter: 'B' },
      { word: 'butterfly', emoji: '\u{1F98B}', img: itemButterfly, letter: 'B' },
      { word: 'triangle', emoji: '\u{1F53A}', img: itemTriangle, letter: 'T' },
      { word: 'turtle', emoji: '\u{1F422}', img: itemTurtle, letter: 'T' },
      { word: 'tree', emoji: '\u{1F333}', img: itemTree, letter: 'T' },
    ],
  },
  {
    id: 'u2l1-color-friends', kind: 'color-friends', bg: bgMeadow, teacher: 'Rainbow time! Pick a color and paint your friends!', cast: ['pip', 'mia', 'bella', 'willow', 'leo'],
  },
  {
    id: 'u2l1-word-build', kind: 'word-build', bg: bgMeadow, teacher: 'Listen! Tap the missing letter to make the word.',
    rounds: [
      { word: 'ball', blankIndex: 0, answer: 'B', choices: ['B', 'T'], img: itemBall, emoji: '\u{26BD}' },
      { word: 'triangle', blankIndex: 0, answer: 'T', choices: ['B', 'T'], img: itemTriangle, emoji: '\u{1F53A}' },
      { word: 'bear', blankIndex: 0, answer: 'B', choices: ['B', 'T'], img: itemBear, emoji: '\u{1F43B}' },
      { word: 'turtle', blankIndex: 0, answer: 'T', choices: ['B', 'T'], img: itemTurtle, emoji: '\u{1F422}' },
    ],
  },
  {
    id: 'u2l1-who', kind: 'who-said-it', bg: bgHideSeek, teacher: 'Listen! Who is talking? Tap the friend.',
    rounds: [
      { line: 'Look at the blue ball!', who: 'bella' },
      { line: 'I see an orange triangle!', who: 'willow' },
      { line: 'The tree is so tall!', who: 'pip' },
    ],
  },
  {
    id: 'u2l1-memory', kind: 'memory', bg: bgMeadow, teacher: 'Find the pairs! Tap two cards to match them.',
    pairs: [
      { id: 'ball', label: 'Ball', emoji: '\u{26BD}', img: itemBall },
      { id: 'bear', label: 'Bear', emoji: '\u{1F43B}', img: itemBear },
      { id: 'triangle', label: 'Triangle', emoji: '\u{1F53A}', img: itemTriangle },
      { id: 'turtle', label: 'Turtle', emoji: '\u{1F422}', img: itemTurtle },
    ],
  },
  {
    id: 'u2l1-dash', kind: 'dash', bg: bgClearing, teacher: 'Bella Dash! Tap only the B words as they run by. Get 6 rings!', who: 'bella', targetLetter: 'B', targetPhoneme: '/b/', goal: 6, seconds: 40,
    items: [
      { word: 'ball', letter: 'B', img: itemBall, emoji: '\u{26BD}' },
      { word: 'bear', letter: 'B', img: itemBear, emoji: '\u{1F43B}' },
      { word: 'butterfly', letter: 'B', img: itemButterfly, emoji: '\u{1F98B}' },
      { word: 'triangle', letter: 'T', img: itemTriangle, emoji: '\u{1F53A}' },
      { word: 'turtle', letter: 'T', img: itemTurtle, emoji: '\u{1F422}' },
      { word: 'tree', letter: 'T', img: itemTree, emoji: '\u{1F333}' },
    ],
  },
  {
    id: 'u2l1-feelings', kind: 'feelings', bg: bgBigTree, teacher: 'So many colors and shapes today! How do you feel?',
    options: [
      { label: 'Happy', emoji: '\u{1F600}', reply: 'Yay! Colors and shapes are fun!' },
      { label: 'Okay', emoji: '\u{1F610}', reply: 'That is okay. Let\'s keep exploring together.' },
      { label: 'Sad', emoji: '\u{1F622}', reply: "It's okay to feel sad. I am here with you." },
    ],
  },
  {
    id: 'u2l1-puzzle', kind: 'puzzle', bg: bgMeadow, teacher: 'Guess the friend! Tap pieces to peek, then pick who it is.',
    rounds: [
      { who: 'bella', img: CAST.bella.img, hint: 'She loves the color blue.' },
      { who: 'willow', img: CAST.willow.img, hint: 'She found a triangle today.' },
      { who: 'leo', img: CAST.leo.img, hint: 'A sleepy lion with a big, warm roar.' },
    ],
  },
  {
    id: 'u2l1-roleplay', kind: 'roleplay', bg: bgGatherEmpty, teacher: 'Story time! Listen to Pip and Bella talk about the meadow, then repeat.', cast: ['pip', 'bella'],
    script: [
      { who: 'pip', line: 'Look! A blue ball!' },
      { who: 'bella', line: 'I like blue!', repeat: true },
      { who: 'bella', line: 'Look! An orange triangle!' },
      { who: 'pip', line: 'I like orange too!', repeat: true },
    ],
  },
  {
    id: 'u2l1-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! Tap the sound, then stack the word!', letters: ['B', 'T', 'A', 'U'],
    tapRounds: [{ letter: 'B' }, { letter: 'T' }, { letter: 'B' }, { letter: 'T' }],
    words: [
      { word: 'BAT', emoji: '\u{1F987}' },
      { word: 'TUB', emoji: '\u{1F6C1}' },
    ],
  },
  { id: 'u2l1-alphabet-order', kind: 'alphabet-order', bg: bgMeadow, teacher: 'Alphabet Order! Drag the letters into ABC order!', sequences: ['ABCD', 'STUV', 'QRST'] },
  {
    id: 'u2l1-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye to the rainbow meadow! Sing along together.',
    durationSeconds: 30, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3`,
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'willow', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'mia', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'pip', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'u2l1-finale', kind: 'finale', bg: bgMeadow, who: 'bella', line: 'You did it! You found colors, shapes, and two new sounds — /b/ and /t/!' },
];
