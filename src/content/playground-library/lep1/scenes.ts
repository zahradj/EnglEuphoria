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
  | { id: string; kind: 'finale'; bg: string; who: Character; line: string };

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
    id: 'roleplay-l1', kind: 'roleplay', bg: bgGather, teacher: 'Story time! Listen to the friends greet each other, then repeat each line.', cast: ['pip', 'mia', 'bella'],
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
