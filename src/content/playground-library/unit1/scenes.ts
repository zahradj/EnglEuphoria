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
  | { id: string; kind: 'trophy-chest'; bg: string; teacher: string; who: CharKey; rounds: { letter: string; phoneme: string; word: string; img?: string; emoji: string; choices: string[] }[] }
  | { id: string; kind: 'friend-pop'; bg: string; teacher: string; cast: CharKey[]; rounds: { target: CharKey; prompt: string; emotion?: 'happy' | 'sad' | 'angry' | 'neutral'; sayLine?: string }[] }
  | { id: string; kind: 'feelings-tap'; bg: string; teacher: string; cast: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; label: string }[] }
  | { id: string; kind: 'feelings-wheel'; bg: string; teacher: string; slots: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; label: string }[] }
  | { id: string; kind: 'x-is-feeling'; bg: string; teacher: string; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; sentence: string }[] }
  | { id: string; kind: 'feelings-dice'; bg: string; teacher: string; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; sentence: string }[] }
  | { id: string; kind: 'feed-monsters'; bg: string; teacher: string; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; sentence: string }[] }
  | { id: string; kind: 'he-she-model'; bg: string; teacher: string; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; pronoun: 'He' | 'She'; sentence: string }[] }
  | { id: string; kind: 'he-she-sort'; bg: string; teacher: string; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; pronoun: 'He' | 'She' }[] }
  | { id: string; kind: 'he-she-say'; bg: string; teacher: string; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; pronoun: 'He' | 'She' }[] }
  | { id: string; kind: 'feeling-quiz'; bg: string; teacher: string; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; prompt: string }[] }
  | { id: string; kind: 'i-am-feeling'; bg: string; teacher: string; asker: CharKey; rounds: { emotion: 'happy' | 'sad' | 'angry'; label: string }[] }
  | { id: string; kind: 'feelings-bingo'; bg: string; teacher: string; tiles: { who: CharKey; emotion: 'happy' | 'sad' | 'angry' }[]; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; prompt: string }[] }
  | { id: string; kind: 'numbers-learn'; bg: string; who: CharKey; from: number; to: number; teacher: string }
  | { id: string; kind: 'numbers-review'; bg: string; who: CharKey; from: number; to: number; teacher: string }
  | { id: string; kind: 'candle-cake'; bg: string; who: CharKey; teacher: string; rounds: { asker: CharKey; target: number; isStudent?: boolean; prompt: string; celebrate: string }[] }
  | { id: string; kind: 'count-balloons'; bg: string; who: CharKey; total: number; teacher: string }
  | { id: string; kind: 'age-balloons'; bg: string; teacher: string; friends: { who: CharKey; age: number }[] }
  | { id: string; kind: 'age-sentence-match'; bg: string; teacher: string; friends: { who: CharKey; age: number }[] }
  | { id: string; kind: 'meet-greet'; bg: string; teacher: string; friends: { who: CharKey; age: number }[] }
  | { id: string; kind: 'age-quiz'; bg: string; teacher: string; friends: { who: CharKey; age: number }[]; studentAges: number[] };

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
  // Bella/Leo (Lesson 4, B and T) had no entry here, so PROP_THEME[scene.prop ?? scene.who] ?? PROP_THEME.pip
  // was silently falling through to Pip's shell theme from Lesson 1 for a birthday-themed lesson.
  bella: { closed: '\u{1F381}', label: 'gift', tint: '#E76FA5' },
  leo: { closed: '\u{1F381}', label: 'gift', tint: '#C97A2F' },
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
const bgL6TrophyTrail = `${A}/scenes/bg-l6-trophy-trail.jpg`;
const bgL6TrophyPodium = `${A}/scenes/bg-l6-trophy-podium.jpg`;

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
const itemCat = `${A}/items/item-cat.png`;
const itemSad = `${A}/items/item-sad.png`;

const bgFeelingsTitle = `${A}/scenes/bg-feelings-title.jpg`;
const bgFeelingsMeadow = `${A}/scenes/bg-feelings-meadow.jpg`;
const bgFeelingsCalm = `${A}/scenes/bg-feelings-calm.jpg`;
const bgFeelingsFair = `${A}/scenes/bg-feelings-fair.jpg`;
const bgMoodMonsters = `${A}/scenes/bg-mood-monsters.jpg`;
const bgFeelingsStory = `${A}/scenes/bg-feelings-story.jpg`;

export const LESSON_3_TITLE = 'How Are You?';
export const LESSON_3_OBJECTIVE = 'Ask and answer "How are you?", say I am / He is / She is happy, sad, or angry, while learning the /æ/ and /s/ sounds.';

export const LESSON_3_SCENES: Scene[] = [
  { id: 'l3-title', kind: 'title-card', bg: bgFeelingsTitle, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 3 · Feelings', title: 'How Are You?', subtitle: '\u{1F60A} Happy · \u{1F622} Sad · \u{1F620} Angry — today we talk about EMOTIONS!' },
  {
    id: 'l3-song', kind: 'song', bg: bgFeelingsMeadow, title: '\u{1F3B5} The Feelings Song \u{1F3B5}',
    teacher: "Sing along! Clap on 'happy', hug yourself on 'sad', stomp on 'angry'. Repeat the whole song a second time and let the student sing louder!",
    durationSeconds: 30,
    songPrompt: "A cheerful children's sing-along in C major, 100 BPM, warm ukulele and glockenspiel, playful clapping. A group of kids (ages 4-6) sing in a bright, joyful call-and-response style. Lyrics: 'How are you? How are you? I am happy — yes I am, ha ha ha! How are you? How are you? I am sad — boo hoo hoo. How are you? How are you? I am angry — grrr grrr grrr! Happy, sad, and angry too — every feeling is okay with you!' Simple, catchy, kindergarten-style melody, super clear diction, no adult voices.",
    lyrics: [
      { who: 'pip', text: 'How are you? How are you?', emotion: 'happy' },
      { who: 'mia', text: 'I am happy — yes I am! Ha ha ha!', emotion: 'happy' },
      { who: 'pip', text: 'How are you? How are you?', emotion: 'happy' },
      { who: 'bella', text: 'I am sad — boo hoo hoo.', emotion: 'sad' },
      { who: 'pip', text: 'How are you? How are you?', emotion: 'happy' },
      { who: 'leo', text: 'I am angry — grrr grrr grrr!', emotion: 'angry' },
      { who: 'pip', text: 'Happy, sad, and angry too —', emotion: 'happy' },
      { who: 'mia', text: 'Every feeling is okay with you!', emotion: 'happy' },
    ],
  },
  {
    id: 'l3-vocab-match', kind: 'feelings-tap', bg: bgFeelingsMeadow, teacher: 'Tap each friend — a card pops up! Repeat the feeling with the student.',
    cast: [
      { who: 'pip', emotion: 'happy', label: 'Happy.' },
      { who: 'mia', emotion: 'sad', label: 'Sad.' },
      { who: 'bella', emotion: 'angry', label: 'Angry.' },
    ],
  },
  {
    id: 'l3-vocab-wheel', kind: 'feelings-wheel', bg: bgFeelingsMeadow, teacher: 'Spin the wheel! When it stops, YOU say the feeling. No hints — you name it!',
    slots: [
      { who: 'mia', emotion: 'happy', label: 'Happy' },
      { who: 'pip', emotion: 'angry', label: 'Angry' },
      { who: 'bella', emotion: 'sad', label: 'Sad' },
    ],
  },
  {
    id: 'l3-feeling-stage', kind: 'friend-pop', bg: bgFeelingsCalm, teacher: 'Say the feeling word. Student listens and taps the friend who feels that way.', cast: ['mia', 'bella', 'leo', 'pip'],
    rounds: [
      { target: 'mia', emotion: 'happy', prompt: 'Happy \u{1F60A}' },
      { target: 'pip', emotion: 'happy', prompt: 'Happy \u{1F60A}' },
      { target: 'bella', emotion: 'sad', prompt: 'Sad \u{1F622}' },
      { target: 'leo', emotion: 'angry', prompt: 'Angry \u{1F620}' },
      { target: 'mia', emotion: 'sad', prompt: 'Sad \u{1F622}' },
      { target: 'pip', emotion: 'angry', prompt: 'Angry \u{1F620}' },
    ],
  },
  {
    id: 'l3-i-am-demo', kind: 'x-is-feeling', bg: bgFeelingsMeadow, teacher: "Demonstration: 'I am ___'. Each friend models the first-person sentence. Student listens, then taps the card to repeat.",
    rounds: [
      { who: 'pip', emotion: 'happy', sentence: 'I am happy!' },
      { who: 'mia', emotion: 'sad', sentence: 'I am sad.' },
      { who: 'leo', emotion: 'angry', sentence: 'I am angry!' },
    ],
  },
  {
    id: 'l3-feelings-dice', kind: 'feelings-dice', bg: bgFeelingsMeadow, teacher: "Free practice! Roll → see the friend. Student says the full sentence alone: 'I am happy / sad / angry.' No model, no help.",
    rounds: [
      { who: 'pip', emotion: 'happy', sentence: 'I am happy!' },
      { who: 'mia', emotion: 'sad', sentence: 'I am sad.' },
      { who: 'bella', emotion: 'angry', sentence: 'I am angry!' },
      { who: 'leo', emotion: 'happy', sentence: 'I am happy!' },
      { who: 'mia', emotion: 'angry', sentence: 'I am angry!' },
      { who: 'pip', emotion: 'sad', sentence: 'I am sad.' },
    ],
  },
  {
    id: 'l3-who-feels-it', kind: 'who-said-it', bg: bgFeelingsFair, teacher: 'Tap a friend on the stage. Hear their feeling and say it with them!',
    rounds: [
      { line: 'Mia is happy.', who: 'mia', emotion: 'happy' },
      { line: 'Bella is sad.', who: 'bella', emotion: 'sad' },
      { line: 'Leo is angry.', who: 'leo', emotion: 'angry' },
      { line: 'Pip is happy.', who: 'pip', emotion: 'happy' },
    ],
  },
  {
    id: 'l3-feed-monsters', kind: 'feed-monsters', bg: bgMoodMonsters, teacher: 'Feed the Mood Monsters! Listen, then drag the friend to the monster that feels the same.',
    rounds: [
      { who: 'mia', emotion: 'happy', sentence: 'Mia is happy. Feed the happy monster!' },
      { who: 'bella', emotion: 'sad', sentence: 'Bella is sad. Feed the sad monster!' },
      { who: 'leo', emotion: 'angry', sentence: 'Leo is angry. Feed the angry monster!' },
      { who: 'pip', emotion: 'happy', sentence: 'Pip is happy. Feed the happy monster!' },
      { who: 'leo', emotion: 'sad', sentence: 'Leo is sad. Feed the sad monster!' },
      { who: 'bella', emotion: 'angry', sentence: 'Bella is angry. Feed the angry monster!' },
    ],
  },
  {
    id: 'l3-model-a', kind: 'sound-model', bg: bgFeelingsMeadow, who: 'leo', letter: 'A', phoneme: '/æ/', sound: 'aaa', teacher: 'Leo roars the short A sound. Listen first: /æ/ /æ/ apple.',
    anchors: [
      { word: 'Apple', emoji: '\u{1F34E}', img: itemApple },
      { word: 'Ant', emoji: '\u{1F41C}', img: itemAnt },
      { word: 'Cat', emoji: '\u{1F431}', img: itemCat },
    ],
  },
  { id: 'l3-trace-a', kind: 'trace', bg: bgFeelingsMeadow, who: 'leo', letter: 'A', phoneme: '/æ/', word: 'Apple', teacher: 'Trace the sunny A. /æ/ /æ/ Apple!' },
  {
    id: 'l3-model-s', kind: 'sound-model', bg: bgFeelingsMeadow, who: 'mia', letter: 'S', phoneme: '/s/', sound: 'sss', teacher: 'Mia hisses the /s/ sound. Listen: /s/ /s/ Sad.',
    anchors: [
      { word: 'Sad', emoji: '\u{1F622}', img: itemSad },
      { word: 'Sun', emoji: '☀️', img: itemSun },
      { word: 'Star', emoji: '⭐', img: itemStar },
    ],
  },
  { id: 'l3-trace-s', kind: 'trace', bg: bgFeelingsMeadow, who: 'mia', letter: 'S', phoneme: '/s/', word: 'Sun', teacher: 'Trace the wavy S. /s/ /s/ Sun!' },
  {
    id: 'l3-sort-as', kind: 'sound-sort', bg: bgFeelingsMeadow, teacher: 'Feelings sound toss! Listen and drag to /æ/ or /s/.',
    targets: [
      { letter: 'A', phoneme: '/æ/', who: 'leo' },
      { letter: 'S', phoneme: '/s/', who: 'mia' },
    ],
    items: [
      { word: 'apple', emoji: '\u{1F34E}', img: itemApple, letter: 'A' },
      { word: 'sun', emoji: '☀️', img: itemSun, letter: 'S' },
      { word: 'star', emoji: '⭐', img: itemStar, letter: 'S' },
      { word: 'sad', emoji: '\u{1F622}', img: itemSad, letter: 'S' },
      { word: 'ant', emoji: '\u{1F41C}', img: itemAnt, letter: 'A' },
      { word: 'cat', emoji: '\u{1F431}', img: itemCat, letter: 'A' },
    ],
  },
  {
    id: 'l3-sound-pop', kind: 'sound-pop', bg: bgFeelingsTitle, teacher: 'Balloon Letter Pop! Leo will call a letter. Pop only that letter!', who: 'leo', goal: 8, seconds: 45,
    targets: [
      { letter: 'A', phoneme: '/æ/' },
      { letter: 'S', phoneme: '/s/' },
    ],
    items: [
      { word: 'A', letter: 'A', emoji: 'A' },
      { word: 'S', letter: 'S', emoji: 'S' },
      { word: 'H', letter: 'H', emoji: 'H' },
      { word: 'M', letter: 'M', emoji: 'M' },
      { word: 'N', letter: 'N', emoji: 'N' },
      { word: 'W', letter: 'W', emoji: 'W' },
      { word: 'B', letter: 'B', emoji: 'B' },
      { word: 'T', letter: 'T', emoji: 'T' },
    ],
  },
  {
    id: 'l3-grand-build', kind: 'word-build', bg: bgFeelingsMeadow, teacher: 'Grand feelings round! Choose the first sound: A, S, H, or M.',
    rounds: [
      { word: 'apple', blankIndex: 0, answer: 'A', choices: ['A', 'S', 'H', 'M'], img: itemApple, emoji: '\u{1F34E}' },
      { word: 'sun', blankIndex: 0, answer: 'S', choices: ['A', 'S', 'H', 'M'], img: itemSun, emoji: '☀️' },
      { word: 'ant', blankIndex: 0, answer: 'A', choices: ['A', 'S', 'H', 'M'], img: itemAnt, emoji: '\u{1F41C}' },
      { word: 'hat', blankIndex: 0, answer: 'H', choices: ['A', 'S', 'H', 'M'], img: itemHat, emoji: '\u{1F3A9}' },
      { word: 'moon', blankIndex: 0, answer: 'M', choices: ['A', 'S', 'H', 'M'], img: itemMoon, emoji: '\u{1F319}' },
    ],
  },
  {
    id: 'l3-x-is-feeling', kind: 'x-is-feeling', bg: bgFeelingsMeadow, teacher: 'Look and listen. Then repeat: X is happy, X is sad, X is angry.',
    rounds: [
      { who: 'mia', emotion: 'happy', sentence: 'Mia is happy.' },
      { who: 'leo', emotion: 'angry', sentence: 'Leo is angry.' },
      { who: 'bella', emotion: 'sad', sentence: 'Bella is sad.' },
      { who: 'pip', emotion: 'happy', sentence: 'Pip is happy.' },
      { who: 'leo', emotion: 'sad', sentence: 'Leo is sad.' },
      { who: 'mia', emotion: 'angry', sentence: 'Mia is angry.' },
    ],
  },
  {
    id: 'l3-he-she-model', kind: 'he-she-model', bg: bgFeelingsMeadow, teacher: "Boys are HE. Girls are SHE. Model twice: 'Mia is sad. She is sad.' Then have the student repeat both lines.",
    rounds: [
      { who: 'mia', emotion: 'sad', pronoun: 'She', sentence: 'Mia is sad. She is sad.' },
      { who: 'pip', emotion: 'happy', pronoun: 'He', sentence: 'Pip is happy. He is happy.' },
      { who: 'bella', emotion: 'happy', pronoun: 'She', sentence: 'Bella is happy. She is happy.' },
      { who: 'leo', emotion: 'angry', pronoun: 'He', sentence: 'Leo is angry. He is angry.' },
      { who: 'mia', emotion: 'happy', pronoun: 'She', sentence: 'Mia is happy. She is happy.' },
      { who: 'leo', emotion: 'sad', pronoun: 'He', sentence: 'Leo is sad. He is sad.' },
    ],
  },
  {
    id: 'l3-he-she-sort', kind: 'he-she-sort', bg: bgFeelingsMeadow, teacher: "Listen! The character says 'I am ___'. Girls go into the SHE box. Boys go into the HE box. Drag each friend to the right pronoun.",
    rounds: [
      { who: 'mia', emotion: 'sad', pronoun: 'She' },
      { who: 'pip', emotion: 'happy', pronoun: 'He' },
      { who: 'bella', emotion: 'happy', pronoun: 'She' },
      { who: 'leo', emotion: 'angry', pronoun: 'He' },
      { who: 'willow', emotion: 'happy', pronoun: 'She' },
      { who: 'leo', emotion: 'sad', pronoun: 'He' },
    ],
  },
  {
    id: 'l3-he-she-say', kind: 'he-she-say', bg: bgFeelingsMeadow, teacher: 'Look at the friend and the feeling card. Say it! Is it HE or SHE? Then tap to check.',
    rounds: [
      { who: 'mia', emotion: 'angry', pronoun: 'She' },
      { who: 'pip', emotion: 'sad', pronoun: 'He' },
      { who: 'leo', emotion: 'happy', pronoun: 'He' },
      { who: 'bella', emotion: 'sad', pronoun: 'She' },
      { who: 'leo', emotion: 'angry', pronoun: 'He' },
      { who: 'mia', emotion: 'happy', pronoun: 'She' },
    ],
  },
  {
    id: 'l3-feeling-quiz', kind: 'feeling-quiz', bg: bgFeelingsMeadow, teacher: "Emotion recognition only. Say: 'Who is happy?' — the student taps whichever friend is showing that feeling. Ignore character names.",
    rounds: [
      { who: 'pip', emotion: 'happy', prompt: 'How does Pip feel?' },
      { who: 'mia', emotion: 'sad', prompt: 'How does Mia feel?' },
      { who: 'leo', emotion: 'angry', prompt: 'How does Leo feel?' },
      { who: 'bella', emotion: 'happy', prompt: 'How does Bella feel?' },
      { who: 'mia', emotion: 'angry', prompt: 'How does Mia feel?' },
      { who: 'bella', emotion: 'sad', prompt: 'How does Bella feel?' },
    ],
  },
  {
    id: 'l3-model-how-are-you', kind: 'roleplay', bg: bgFeelingsMeadow, teacher: "Look and listen! Bella asks Pip: 'How are you?' Pip answers: 'I am happy.' Then the student repeats BOTH lines. Do the same for the sad and angry turns before the student's own turn.", cast: ['pip', 'bella'],
    script: [
      { who: 'bella', line: 'Hi, Pip! How are you?', repeat: true },
      { who: 'pip', line: 'I am happy!', repeat: true },
      { who: 'bella', line: 'Hi, Pip! How are you?', repeat: true },
      { who: 'pip', line: 'I am sad.', repeat: true },
      { who: 'bella', line: 'Hi, Pip! How are you?', repeat: true },
      { who: 'pip', line: 'I am angry!', repeat: true },
    ],
  },
  {
    id: 'l3-i-am-feeling', kind: 'i-am-feeling', bg: bgFeelingsMeadow, teacher: 'Your turn! Pip asks: How are you? Choose your feeling, then say: I am ___.', asker: 'pip',
    rounds: [
      { emotion: 'happy', label: 'Happy' },
      { emotion: 'sad', label: 'Sad' },
      { emotion: 'angry', label: 'Angry' },
      { emotion: 'happy', label: 'Happy' },
    ],
  },
  {
    id: 'l3-roleplay-feelings', kind: 'roleplay', bg: bgFeelingsStory, teacher: "Meet Leo! Only Leo introduces his name (new friend). Then Leo asks 'How are you?' to each friend. Finally Pip asks Leo — Leo says 'I am angry!' Student repeats every line.", cast: ['pip', 'mia', 'bella', 'leo'],
    script: [
      { who: 'pip', line: "Hello! What's your name?", repeat: true },
      { who: 'leo', line: 'Hello! My name is Leo.', repeat: true },
      { who: 'pip', line: 'Nice to meet you, Leo!', repeat: true },
      { who: 'leo', line: 'Hi, Mia! How are you?', repeat: true },
      { who: 'mia', line: 'I am happy!', repeat: true },
      { who: 'leo', line: 'Hi, Bella! How are you?', repeat: true },
      { who: 'bella', line: 'I am sad.', repeat: true },
      { who: 'leo', line: 'Hi, Pip! How are you?', repeat: true },
      { who: 'pip', line: 'I am happy!', repeat: true },
      { who: 'pip', line: 'And you, Leo? How are you?', repeat: true },
      { who: 'leo', line: 'I am angry! Grrr!', repeat: true },
      { who: 'mia', line: "It's okay, Leo.", repeat: true },
      { who: 'pip', line: 'Goodbye, friends!', repeat: true },
    ],
  },
  {
    id: 'l3-feelings-bingo', kind: 'feelings-bingo', bg: bgFeelingsMeadow, teacher: 'Feelings Bingo! Listen carefully, then tap the friend who feels that way!',
    tiles: [
      { who: 'pip', emotion: 'happy' },
      { who: 'mia', emotion: 'sad' },
      { who: 'bella', emotion: 'angry' },
      { who: 'leo', emotion: 'happy' },
      { who: 'pip', emotion: 'angry' },
      { who: 'mia', emotion: 'happy' },
    ],
    rounds: [
      { who: 'mia', emotion: 'sad', prompt: 'Find sad Mia!' },
      { who: 'bella', emotion: 'angry', prompt: 'Find angry Bella!' },
      { who: 'leo', emotion: 'happy', prompt: 'Find happy Leo!' },
      { who: 'pip', emotion: 'angry', prompt: 'Find angry Pip!' },
    ],
  },
  { id: 'l3-color-friends', kind: 'color-friends', bg: bgMeadow, teacher: 'Bonus time! Pick a color and paint your friends!', cast: ['pip', 'mia', 'bella', 'leo'] },
  {
    id: 'l3-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! Tap the /a/ sound, then stack the word!', letters: ['A', 'H', 'M', 'T', 'S', 'D'],
    tapRounds: [{ letter: 'A' }, { letter: 'M' }, { letter: 'H' }, { letter: 'A' }],
    words: [
      { word: 'HAT', emoji: '\u{1F3A9}' },
      { word: 'MAT', emoji: '\u{1F7EB}' },
      { word: 'SAD', emoji: '\u{1F622}' },
    ],
  },
  { id: 'l3-alphabet-order', kind: 'alphabet-order', bg: bgMeadow, teacher: 'Alphabet Order! Put the letters in ABC order!', sequences: ['KLMN', 'MNOP', 'PQRS'] },
  {
    id: 'l3-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye to your feelings friends! Sing along together.',
    durationSeconds: 30, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3`,
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'mia', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'leo', text: '\u{1F389} Goodbye, goodbye, goodbye!', emotion: 'happy' },
      { who: 'bella', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'l3-finale', kind: 'finale', bg: bgMeadow, who: 'leo', line: 'You did it! You met Leo and shared your feelings! How are you? I am happy!' },
];

/* =========================================================================
 * Lesson 4 — "The Big Chat Tree" (Let's Talk! — full conversation review,
 * no new letters: cumulative H/M/N/W/S/A)
 * ========================================================================= */

export const LESSON_4_TITLE = "Bella's Birthday!";
export const LESSON_4_OBJECTIVE = 'Ask and answer "How old are you?", count 1-10, and learn the /b/ and /t/ sounds.';

const bgL4Party = `${A}/scenes/bg-l4-birthday-party.jpg`;
const bgL4BellaFive = `${A}/scenes/bg-l4-bella-five.jpg`;
const bgL4MiaSix = `${A}/scenes/bg-l4-mia-six.jpg`;
const bgL4LeoSeven = `${A}/scenes/bg-l4-leo-seven.jpg`;
const bgL4WillowFour = `${A}/scenes/bg-l4-willow-four.jpg`;
const bgL4PipSix = `${A}/scenes/bg-l4-pip-six.jpg`;
const bgL4PlainParty = `${A}/scenes/bg-l4-plain-party.jpg`;
const bgL4CakeStage = `${A}/scenes/bg-l4-cake-stage.jpg`;
const bgL4PlainSky = `${A}/scenes/bg-l4-plain-sky.jpg`;
const bgL4CloudSky = `${A}/scenes/bg-l4-cloud-sky.jpg`;
const bgL4AgeFair = `${A}/scenes/bg-l4-age-fair.jpg`;
const itemBag = `${A}/items/item-bag.png`;
const itemBallL4 = `${A}/items/item-ball-kawaii.png`;
const itemBye = `${A}/items/item-bye.png`;
const itemTen = `${A}/items/item-ten.png`;
const itemToy = `${A}/items/item-toy.png`;
const itemTwo = `${A}/items/item-two.png`;

export const LESSON_4_SCENES: Scene[] = [
  { id: 'l4-title', kind: 'title-card', bg: bgL4Party, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 4 · Birthday', title: "Bella's Birthday!", subtitle: '\u{1F382} How old are you? · \u{1F44B} Goodbye! — party with Pip, Mia, Bella & Leo!' },
  { id: 'l4-arrive', kind: 'meet', bg: bgL4Party, who: 'pip', teacher: 'Pip runs to Bella’s party. Wave hello and repeat with Pip!', line: 'Hello, friends! Today is Bella’s birthday!', repeat: 'Hello, friends!' },
  { id: 'l4-bella-age', kind: 'meet', bg: bgL4BellaFive, who: 'bella', teacher: 'Bella is FIVE today! Repeat with Bella: I am five.', line: 'Hello! I am Bella. I am five!', repeat: 'I am five.' },
  { id: 'l4-mia-age', kind: 'meet', bg: bgL4MiaSix, who: 'mia', teacher: 'Mia is SIX! Repeat with Mia: I am six.', line: 'Hi! I am Mia. I am six!', repeat: 'I am six.' },
  { id: 'l4-leo-age', kind: 'meet', bg: bgL4LeoSeven, who: 'leo', teacher: 'Leo is SEVEN! Repeat with Leo: I am seven.', line: 'Hi! I am Leo. I am seven!', repeat: 'I am seven.' },
  { id: 'l4-willow-age', kind: 'meet', bg: bgL4WillowFour, who: 'willow', teacher: 'Willow is FOUR! Repeat with Willow: I am four.', line: 'Hello! I am Willow. I am four!', repeat: 'I am four.' },
  { id: 'l4-pip-age', kind: 'meet', bg: bgL4PipSix, who: 'pip', teacher: 'Pip is SIX! Repeat with Pip: I am six.', line: 'Hi friends! I am Pip. I am six!', repeat: 'I am six.' },
  { id: 'l4-echo-question', kind: 'echo', bg: bgL4Party, who: 'pip', teacher: 'Say it with Pip! Point to a friend and ask the big question.', word: 'How old are you?', hearWord: 'How old are you?' },
  { id: 'l4-echo-i-am-five', kind: 'echo', bg: bgL4Party, who: 'bella', teacher: 'Bella answers. Repeat two times, then say YOUR age.', word: 'I am five.', hearWord: 'I am five.' },
  { id: 'l4-numbers-learn', kind: 'numbers-learn', bg: bgL4PlainParty, who: 'pip', from: 1, to: 10, teacher: "Let's count together! Tap each number to hear Pip say it. Press Next when the student can say them all." },
  { id: 'l4-numbers-review', kind: 'numbers-review', bg: bgL4PlainParty, who: 'pip', from: 1, to: 10, teacher: 'Number-tap game! Tap the number Pip calls out.' },
  {
    id: 'l4-age-pop', kind: 'candle-cake', bg: bgL4CakeStage, who: 'bella', teacher: 'Bella’s cake needs candles! Listen to the age, then tap the cake to add that many candles. \u{1F382}',
    rounds: [
      { asker: 'bella', target: 5, prompt: 'I am FIVE! Tap FIVE candles on my cake!', celebrate: 'Five candles! I am five!' },
      { asker: 'mia', target: 6, prompt: 'I am SIX! Tap SIX candles for Mia!', celebrate: 'Six candles! I am six!' },
      { asker: 'pip', target: 6, prompt: 'I am SIX too! Give Pip SIX candles!', celebrate: 'Six candles! I am six!' },
      { asker: 'pip', target: 0, isStudent: true, prompt: 'Your turn! How old are you? Tap your age, then put candles on YOUR cake and blow!', celebrate: 'Happy birthday to YOU!' },
    ],
  },
  { id: 'l4-count-balloons', kind: 'count-balloons', bg: bgL4PlainSky, who: 'pip', total: 10, teacher: 'Ten sticker balloons floated up! Pop them ONE by ONE and count with Pip!' },
  {
    id: 'l4-age-balloons', kind: 'age-balloons', bg: bgL4PlainSky, teacher: 'Each friend is holding balloons. Tap a friend! Count the balloons, then say: "{Name} is {number}!"',
    friends: [
      { who: 'willow', age: 3 },
      { who: 'bella', age: 5 },
      { who: 'mia', age: 6 },
      { who: 'leo', age: 7 },
    ],
  },
  {
    id: 'l4-age-sentence-match', kind: 'age-sentence-match', bg: bgL4PlainSky, teacher: 'Match each friend to their sentence! Listen, then grab and drag the card to the friend it belongs to.',
    friends: [
      { who: 'willow', age: 3 },
      { who: 'bella', age: 5 },
      { who: 'mia', age: 6 },
      { who: 'leo', age: 7 },
    ],
  },
  {
    id: 'l4-meet-greet', kind: 'meet-greet', bg: bgL4CloudSky, teacher: 'One friend at a time comes on stage. Ask their name, their age, then say nice to meet you.',
    friends: [
      { who: 'bella', age: 5 },
      { who: 'mia', age: 6 },
      { who: 'leo', age: 7 },
      { who: 'willow', age: 3 },
    ],
  },
  {
    id: 'l4-age-quiz', kind: 'age-quiz', bg: bgL4Party, teacher: 'Tap the wobbly present! Ask "How old are you?" then guess the candles. At the end — tap YOUR own age!',
    friends: [
      { who: 'bella', age: 5 },
      { who: 'mia', age: 6 },
      { who: 'leo', age: 7 },
      { who: 'willow', age: 3 },
    ],
    studentAges: [3, 4, 5, 6, 7],
  },
  {
    id: 'l4-age-mic', kind: 'join-stage', bg: bgNameMicStage, teacher: 'Live Stage! Read each teacher line out loud — the student answers into the mic, then tap the check.', cast: [],
    turns: [
      { who: 'teacher', line: 'How old are you?' },
      { who: 'student', line: 'I am ___ years old.' },
      { who: 'teacher', line: 'Wow! Nice!' },
      { who: 'student', line: 'How old are you?' },
      { who: 'teacher', line: 'I am ___ years old!' },
      { who: 'student', line: 'Nice to meet you!' },
    ],
  },
  {
    id: 'l4-birthday-song', kind: 'song', bg: bgL4Party, title: '\u{1F382} Happy Birthday, Bella! \u{1F382}', teacher: 'Everyone sings to Bella! Clap on every line. At the end, a big cheer: Happy birthday, Bella!',
    durationSeconds: 29, songUrl: `${A}/audio/goodbye-song.mp3`,
    songPrompt: 'Traditional normal Happy Birthday rhythm and beat, cheerful kids-and-teacher birthday sing-along for Bella, clear real singing, simple party claps, ending with a big joyful cheer: Happy birthday, Bella!',
    lyrics: [
      { who: 'bella', text: '\u{1F382} Happy birthday to you', emotion: 'happy' },
      { who: 'bella', text: '\u{1F388} Happy birthday to you', emotion: 'happy' },
      { who: 'bella', text: '\u{1F389} Happy birthday dear Bella', emotion: 'happy' },
      { who: 'bella', text: '\u{1F381} Happy birthday to you!', emotion: 'happy' },
      { who: 'bella', text: '\u{1F973} Yaaay! Happy birthday, Bella!', emotion: 'happy' },
    ],
  },
  {
    id: 'l4-model-b', kind: 'sound-model', bg: bgL4Party, who: 'bella', letter: 'B', phoneme: '/b/', sound: 'buh', teacher: 'Bella bounces the /b/ sound! Listen first: /b/ /b/ Bag. /b/ /b/ Ball.',
    anchors: [
      { word: 'Bag', emoji: '\u{1F392}', img: itemBag },
      { word: 'Ball', emoji: '⚽', img: itemBallL4 },
      { word: 'Bye', emoji: '\u{1F44B}', img: itemBye },
    ],
  },
  { id: 'l4-trace-b', kind: 'trace', bg: bgL4Party, who: 'bella', letter: 'B', phoneme: '/b/', word: 'Ball', teacher: 'Trace the bouncy B. /b/ /b/ Ball!' },
  {
    id: 'l4-model-t', kind: 'sound-model', bg: bgL4Party, who: 'leo', letter: 'T', phoneme: '/t/', sound: 'tuh', teacher: 'Leo taps the /t/ sound! Listen first: /t/ /t/ Two. /t/ /t/ Ten.',
    anchors: [
      { word: 'Two', emoji: '2\u{FE0F}\u{20E3}', img: itemTwo },
      { word: 'Ten', emoji: '\u{1F51F}', img: itemTen },
      { word: 'Toy', emoji: '\u{1F9F8}', img: itemToy },
    ],
  },
  { id: 'l4-trace-t', kind: 'trace', bg: bgL4Party, who: 'leo', letter: 'T', phoneme: '/t/', word: 'Two', teacher: 'Trace the tall T. /t/ /t/ Two!' },
  {
    id: 'l4-sound-pop', kind: 'sound-pop', bg: bgL4AgeFair, teacher: 'Balloon Letter Pop! Bella will call a letter. Pop only that letter!', who: 'bella', goal: 8, seconds: 45,
    targets: [
      { letter: 'B', phoneme: '/b/' },
      { letter: 'T', phoneme: '/t/' },
    ],
    items: [
      { word: 'B', letter: 'B', emoji: 'B' },
      { word: 'T', letter: 'T', emoji: 'T' },
      { word: 'A', letter: 'A', emoji: 'A' },
      { word: 'S', letter: 'S', emoji: 'S' },
      { word: 'H', letter: 'H', emoji: 'H' },
      { word: 'M', letter: 'M', emoji: 'M' },
      { word: 'N', letter: 'N', emoji: 'N' },
      { word: 'W', letter: 'W', emoji: 'W' },
    ],
  },
  { id: 'l4-sort-bt', kind: 'brick-crush', bg: bgL4Party, teacher: 'Mega Brick Crush! All the sounds from Lessons 1–4. Listen — then smash every brick with that letter!', who: 'bella', letters: ['H', 'M', 'N', 'W', 'S', 'A', 'B', 'T'], rows: 6, cols: 7, goal: 20, seconds: 70 },
  {
    id: 'l4-grand-build', kind: 'word-build', bg: bgL4Party, teacher: 'Grand birthday round! Choose the first sound: B, T, A, S, or H.',
    rounds: [
      { word: 'ball', blankIndex: 0, answer: 'B', choices: ['B', 'T', 'A', 'S', 'H'], img: itemBallL4, emoji: '⚽' },
      { word: 'two', blankIndex: 0, answer: 'T', choices: ['B', 'T', 'A', 'S', 'H'], img: itemTwo, emoji: '2\u{FE0F}\u{20E3}' },
      { word: 'bye', blankIndex: 0, answer: 'B', choices: ['B', 'T', 'A', 'S', 'H'], img: itemBye, emoji: '\u{1F44B}' },
      { word: 'ten', blankIndex: 0, answer: 'T', choices: ['B', 'T', 'A', 'S', 'H'], img: itemTen, emoji: '\u{1F51F}' },
      { word: 'sun', blankIndex: 0, answer: 'S', choices: ['B', 'T', 'A', 'S', 'H'], img: itemSun, emoji: '☀️' },
      { word: 'hat', blankIndex: 0, answer: 'H', choices: ['B', 'T', 'A', 'S', 'H'], img: itemHat, emoji: '\u{1F3A9}' },
      { word: 'ant', blankIndex: 0, answer: 'A', choices: ['B', 'T', 'A', 'S', 'H'], img: itemAnt, emoji: '\u{1F41C}' },
    ],
  },
  {
    id: 'l4-roleplay-birthday', kind: 'roleplay', bg: bgL4Party, teacher: 'Full birthday conversation! Characters ask, the student answers (repeat each line), then everyone wishes Bella a happy birthday.', cast: ['pip', 'mia', 'bella', 'leo'],
    script: [
      { who: 'bella', line: 'Hello! How are you?', repeat: true },
      { who: 'pip', line: 'I am happy. How are you?', repeat: true },
      { who: 'bella', line: 'I am happy too!', repeat: true },
      { who: 'mia', line: 'Hello! What is your name?', repeat: true },
      { who: 'pip', line: 'My name is Pip. What is your name?', repeat: true },
      { who: 'mia', line: 'My name is Mia!', repeat: true },
      { who: 'leo', line: 'Nice to meet you! How old are you?', repeat: true },
      { who: 'pip', line: 'I am five. How old are you?', repeat: true },
      { who: 'leo', line: 'I am seven!', repeat: true },
      { who: 'bella', line: 'Welcome to my party, friend!', repeat: true },
      { who: 'mia', line: 'We are so happy you are here!', repeat: true },
      { who: 'pip', line: 'Everybody — say it with me!', repeat: true },
      { who: 'leo', line: 'Happy birthday to Bella!', repeat: true },
      { who: 'bella', line: 'Thank you! Hip hip hooray!', repeat: true },
    ],
  },
  {
    id: 'l4-join-birthday', kind: 'join-stage', bg: bgL4Party, teacher: 'Live Stage! Read each question — the student answers into the microphone, then tap the check.', cast: [],
    turns: [
      { who: 'teacher', line: 'Hello! How are you?' },
      { who: 'student', line: 'I am happy!' },
      { who: 'teacher', line: 'What is your name?' },
      { who: 'student', line: 'My name is ___.' },
      { who: 'teacher', line: 'How old are you?' },
      { who: 'student', line: 'I am ___.' },
      { who: 'teacher', line: 'Nice to meet you!' },
      { who: 'student', line: 'Nice to meet you too!' },
    ],
  },
  { id: 'l4-color-friends', kind: 'color-friends', bg: bgMeadow, teacher: 'Bonus round! Pick a color and paint the birthday friends!', cast: ['pip', 'mia', 'bella', 'leo'] },
  {
    id: 'l4-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! Tap the sound, then stack the birthday word!', letters: ['B', 'T', 'A', 'E', 'N', 'G'],
    tapRounds: [{ letter: 'B' }, { letter: 'T' }, { letter: 'B' }, { letter: 'T' }],
    words: [
      { word: 'BAT', emoji: '\u{1F987}' },
      { word: 'TEN', emoji: '\u{1F51F}' },
      { word: 'BAG', emoji: '\u{1F392}' },
    ],
  },
  { id: 'l4-alphabet-order', kind: 'alphabet-order', bg: bgMeadow, teacher: 'Alphabet Order! Drag the letters into ABC order!', sequences: ['OPQR', 'STUV', 'WXYZ'] },
  {
    id: 'l4-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Everyone waves goodbye! Sing together and wave on every goodbye.',
    durationSeconds: 30, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3`,
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'mia', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'leo', text: '\u{1F389} Goodbye, goodbye, goodbye!', emotion: 'happy' },
      { who: 'bella', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'l4-finale', kind: 'finale', bg: bgWillowMeadow, who: 'bella', line: 'You did it! You know my age! Goodbye, friend! See you next lesson!' },
];

/* =========================================================================
 * Lesson 5 — "Leo's Lost Star" (Story Time — narrative review, cumulative
 * H/M/N/W/S/A, no new letters)
 * ========================================================================= */

export const LESSON_5_TITLE = "Leo's Lost Star";
export const LESSON_5_OBJECTIVE = 'Follow a story that revisits every friend, question, and sound from Lessons 1-4: greetings, names, feelings, and age.';

export const LESSON_5_SCENES: Scene[] = [
  { id: 'l5-title', kind: 'title-card', bg: bgMeadow, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 5 · Story', title: "Leo's Lost Star", subtitle: 'A story that remembers everything we have learned' },
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
    id: 'l5-recall-hello', kind: 'join-stage', bg: bgMeadow, teacher: 'Remember Lesson 1? Say hello to Mia the way we learned!', cast: ['mia'],
    turns: [
      { who: 'mia', line: 'Hello! My name is Mia.' },
      { who: 'student', line: 'Hello! My name is ___.' },
      { who: 'mia', line: 'Nice to meet you again! Leo lost his star — will you help?' },
      { who: 'student', line: 'Yes! We will help Leo!' },
    ],
  },
  {
    id: 'l5-recall-name', kind: 'join-stage', bg: bgMeadow, teacher: 'Remember Lesson 2? Ask Bella the carnival question!', cast: ['bella'],
    turns: [
      { who: 'bella', line: 'Hello again!' },
      { who: 'student', line: 'What is your name?' },
      { who: 'bella', line: 'My name is Bella! Let’s go help Leo find his star.' },
    ],
  },
  {
    id: 'l5-ask-friends', kind: 'join-stage', bg: bgGatherEmpty, teacher: 'Remember Lesson 3? Ask how everyone feels, then help Leo.', cast: ['mia', 'bella', 'willow'],
    turns: [
      { who: 'mia', line: 'How are you, Leo?' },
      { who: 'student', line: 'I am sad. I lost my star.' },
      { who: 'bella', line: 'I am happy! Do not worry, Leo — we will find it.' },
      { who: 'student', line: 'Thank you!' },
      { who: 'willow', line: 'I am angry we cannot find it. Let’s keep looking!' },
    ],
  },
  {
    id: 'l5-recall-age', kind: 'join-stage', bg: bgMeadow, teacher: 'Remember Lesson 4? Ask Willow the birthday question!', cast: ['willow'],
    turns: [
      { who: 'student', line: 'How old are you?' },
      { who: 'willow', line: 'I am three! Now let’s search for the star.' },
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
    id: 'l5-who', kind: 'who-said-it', bg: bgHideSeek, teacher: 'Listen! Who said it in our story? Tap the friend.',
    rounds: [
      { line: 'I am sad. I lost my star.', who: 'leo', emotion: 'sad' },
      { line: 'Do not worry! We will help you!', who: 'pip' },
      { line: 'Hello! My name is Mia.', who: 'mia' },
      { line: 'I am happy! Do not worry, Leo.', who: 'bella', emotion: 'happy' },
      { line: 'I am angry we cannot find it.', who: 'willow', emotion: 'angry' },
    ],
  },
  {
    id: 'l5-roleplay-recap', kind: 'roleplay', bg: bgGatherEmpty, teacher: 'Retell the whole story! Listen, then repeat each line.', cast: ['leo', 'pip', 'mia', 'willow', 'bella'],
    script: [
      { who: 'leo', line: 'I lost my star. I was sad.', repeat: true },
      { who: 'mia', line: 'We said hello and asked how to help.', repeat: true },
      { who: 'pip', line: 'We looked together in the meadow.', repeat: true },
      { who: 'willow', line: 'I felt a little angry, but we did not give up!', repeat: true },
      { who: 'bella', line: 'We found the star! Now Leo is happy!', repeat: true },
    ],
  },
  {
    id: 'l5-puzzle', kind: 'puzzle', bg: bgMeadow, teacher: 'Guess the friend from the story! Tap pieces to peek.',
    rounds: [
      { who: 'leo', img: CAST.leo.img, hint: 'He was sad, then happy again.', emotion: 'sad' },
      { who: 'mia', img: CAST.mia.img, hint: 'She said hello first and asked to help.' },
      { who: 'willow', img: CAST.willow.img, hint: 'He felt a little angry but kept looking.', emotion: 'angry' },
      { who: 'bella', img: CAST.bella.img, hint: 'She found the star under the tree.', emotion: 'happy' },
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
    id: 'l5-sort-part1', kind: 'sound-sort', bg: bgClearing, teacher: 'Lessons 1 & 2 review! Drag each picture to /h/, /m/, /n/ or /w/.',
    targets: [
      { letter: 'H', phoneme: '/h/', who: 'pip' },
      { letter: 'M', phoneme: '/m/', who: 'mia' },
      { letter: 'N', phoneme: '/n/', who: 'mia' },
      { letter: 'W', phoneme: '/w/', who: 'pip' },
    ],
    items: [
      { word: 'hat', emoji: '\u{1F3A9}', img: itemHat, letter: 'H' },
      { word: 'house', emoji: '\u{1F3E0}', img: itemHouse, letter: 'H' },
      { word: 'mouse', emoji: '\u{1F42D}', img: itemMouse, letter: 'M' },
      { word: 'moon', emoji: '\u{1F319}', img: itemMoon, letter: 'M' },
      { word: 'nose', emoji: '\u{1F443}', img: itemNose, letter: 'N' },
      { word: 'nut', emoji: '\u{1F95C}', img: itemNut, letter: 'N' },
      { word: 'wave', emoji: '\u{1F30A}', img: itemWave, letter: 'W' },
      { word: 'water', emoji: '\u{1F4A7}', img: itemWater, letter: 'W' },
    ],
  },
  {
    id: 'l5-sort-part2', kind: 'sound-sort', bg: bgClearing, teacher: 'Lessons 3 & 4 review! Drag each picture to /a/, /s/, /b/ or /t/.',
    targets: [
      { letter: 'A', phoneme: '/a/', who: 'leo' },
      { letter: 'S', phoneme: '/s/', who: 'mia' },
      { letter: 'B', phoneme: '/b/', who: 'bella' },
      { letter: 'T', phoneme: '/t/', who: 'leo' },
    ],
    items: [
      { word: 'apple', emoji: '\u{1F34E}', img: itemApple, letter: 'A' },
      { word: 'ant', emoji: '\u{1F41C}', img: itemAnt, letter: 'A' },
      { word: 'star', emoji: '⭐', img: itemStar, letter: 'S' },
      { word: 'sun', emoji: '☀️', img: itemSun, letter: 'S' },
      { word: 'bag', emoji: '\u{1F392}', img: itemBag, letter: 'B' },
      { word: 'ball', emoji: '⚽', img: itemBallL4, letter: 'B' },
      { word: 'two', emoji: '2\u{FE0F}\u{20E3}', img: itemTwo, letter: 'T' },
      { word: 'toy', emoji: '\u{1F9F8}', img: itemToy, letter: 'T' },
    ],
  },
  {
    id: 'l5-word-build', kind: 'word-build', bg: bgMeadow, teacher: 'Grand review! Choose the first sound — all 8 you have learned!',
    rounds: [
      { word: 'house', blankIndex: 0, answer: 'H', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemHouse, emoji: '\u{1F3E0}' },
      { word: 'mouse', blankIndex: 0, answer: 'M', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemMouse, emoji: '\u{1F42D}' },
      { word: 'nose', blankIndex: 0, answer: 'N', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemNose, emoji: '\u{1F443}' },
      { word: 'wave', blankIndex: 0, answer: 'W', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemWave, emoji: '\u{1F30A}' },
      { word: 'ant', blankIndex: 0, answer: 'A', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemAnt, emoji: '\u{1F41C}' },
      { word: 'star', blankIndex: 0, answer: 'S', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemStar, emoji: '⭐' },
      { word: 'bag', blankIndex: 0, answer: 'B', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemBag, emoji: '\u{1F392}' },
      { word: 'two', blankIndex: 0, answer: 'T', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemTwo, emoji: '2\u{FE0F}\u{20E3}' },
    ],
  },
  {
    id: 'l5-dash', kind: 'dash', bg: bgClearing, teacher: 'Bella Dash! Tap only the S words as they run by. Get 6 rings!', who: 'bella', targetLetter: 'S', targetPhoneme: '/s/', goal: 6, seconds: 40,
    items: [
      { word: 'star', letter: 'S', img: itemStar, emoji: '⭐' },
      { word: 'sun', letter: 'S', img: itemSun, emoji: '☀️' },
      { word: 'snake', letter: 'S', img: itemSnake, emoji: '\u{1F40D}' },
      { word: 'nose', letter: 'N', img: itemNose, emoji: '\u{1F443}' },
      { word: 'water', letter: 'W', img: itemWater, emoji: '\u{1F4A7}' },
      { word: 'hat', letter: 'H', img: itemHat, emoji: '\u{1F3A9}' },
      { word: 'bag', letter: 'B', img: itemBag, emoji: '\u{1F392}' },
      { word: 'two', letter: 'T', img: itemTwo, emoji: '2\u{FE0F}\u{20E3}' },
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
    id: 'l5-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! Tap the sound, then stack the word!', letters: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'],
    tapRounds: [{ letter: 'S' }, { letter: 'A' }, { letter: 'N' }, { letter: 'W' }, { letter: 'B' }, { letter: 'T' }],
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
  { id: 'l6-title', kind: 'title-card', bg: bgL6TrophyTrail, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 6', title: 'The Trophy Trail', subtitle: 'Show what you know and win the trophy!' },
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
    id: 'l6-trophy-chest', kind: 'trophy-chest', bg: bgGatherEmpty, who: 'pip', teacher: 'The Trophy Chest! Tap the sound you hear to unlock each treasure.',
    rounds: [
      { letter: 'H', phoneme: '/h/', word: 'house', img: itemHouse, emoji: '\u{1F3E0}', choices: ['H', 'S', 'M'] },
      { letter: 'M', phoneme: '/m/', word: 'milk', img: itemMilk, emoji: '\u{1F95B}', choices: ['M', 'W', 'N'] },
      { letter: 'N', phoneme: '/n/', word: 'nut', img: itemNut, emoji: '\u{1F95C}', choices: ['N', 'A', 'H'] },
      { letter: 'W', phoneme: '/w/', word: 'wind', img: itemWind, emoji: '\u{1F32C}️', choices: ['W', 'S', 'M'] },
      { letter: 'S', phoneme: '/s/', word: 'snake', img: itemSnake, emoji: '\u{1F40D}', choices: ['S', 'A', 'W'] },
      { letter: 'A', phoneme: '/a/', word: 'alligator', img: itemAlligator, emoji: '\u{1F40A}', choices: ['A', 'H', 'N'] },
    ],
  },
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
  { id: 'l6-finale', kind: 'finale', bg: bgL6TrophyPodium, who: 'pip', line: 'You did it! You earned the Unit 1 Trophy! Hello, names, feelings, and six letter sounds — you know it all! \u{1F3C6}' },
];

/* =========================================================================
 * Unit 2, Lesson 1 — "The Rainbow Meadow" (R + Y sounds, Colors & Shapes).
 * Same cast/world as Unit 1 (no new characters or background art exist for
 * a distinct Unit 2 world yet) — see the playground-library-lesson-builder
 * skill, section 6, for why this stays in unit1/scenes.ts despite the DB's
 * unit_number being 2. Per the reference curriculum's "Red, Blue, Yellow!"
 * spec (see skill section 15), Unit 2 Lesson 1 teaches R and Y — not B/T,
 * which is Unit 1 Lesson 4's pair and was a real content bug when this
 * lesson duplicated it. R and Y are taught through "Red" and "Yellow" so
 * the unit's colors/shapes theme comes through the phonics vocab itself.
 * ========================================================================= */

const itemRain = `${A}/items/item-rain.png`;
const itemRainbow = `${A}/items/item-rainbow.png`;
const itemRose = `${A}/items/item-rose.png`;
const itemYoyo = `${A}/items/item-yoyo.png`;
const itemYarn = `${A}/items/item-yarn.png`;
const itemYak = `${A}/items/item-yak.png`;

export const LESSON_U2L1_TITLE = 'The Rainbow Meadow';
export const LESSON_U2L1_OBJECTIVE = 'Name colors and shapes while learning the /r/ and /y/ sounds.';

export const LESSON_U2L1_SCENES: Scene[] = [
  { id: 'u2l1-title', kind: 'title-card', bg: bgMeadow, level: 'Pre-A1', unit: 'Unit 2', lessonLabel: 'Lesson 1', title: 'The Rainbow Meadow', subtitle: 'Colors, shapes & the /r/ and /y/ sounds' },
  {
    id: 'u2l1-intro', kind: 'cinematic', bg: bgMeadow, title: 'The Rainbow Meadow', subtitle: 'A meadow full of colors and shapes', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Look at all the colors and shapes today!' },
      { who: 'pip', line: 'Bella and Willow found two new sounds to share.' },
    ],
    cta: "Let's look!",
  },
  {
    id: 'u2l1-model-r', kind: 'sound-model', bg: bgClearing, who: 'bella', letter: 'R', phoneme: '/r/', sound: 'ruh', teacher: 'Listen to Bella\'s sound. /r/ /r/ Rainbow!',
    anchors: [
      { word: 'Rain', emoji: '\u{1F327}️', img: itemRain },
      { word: 'Rainbow', emoji: '\u{1F308}', img: itemRainbow },
      { word: 'Rose', emoji: '\u{1F339}', img: itemRose },
    ],
  },
  { id: 'u2l1-trace-r', kind: 'trace', bg: bgClearing, who: 'bella', letter: 'R', phoneme: '/r/', word: 'Rainbow', teacher: 'Trace the round R with your finger! /r/ /r/ Rainbow!' },
  { id: 'u2l1-echo-r', kind: 'echo', bg: bgMeadow, who: 'bella', teacher: 'Repeat after Bella: Red rose! Red rose!', word: 'Red rose!' },
  {
    id: 'u2l1-model-y', kind: 'sound-model', bg: bgBigTree, who: 'willow', letter: 'Y', phoneme: '/y/', sound: 'yuh', teacher: 'Listen to Willow\'s sound. /y/ /y/ Yoyo!',
    anchors: [
      { word: 'Yoyo', emoji: '\u{1FA80}', img: itemYoyo },
      { word: 'Yarn', emoji: '\u{1F9F6}', img: itemYarn },
      { word: 'Yak', emoji: '\u{1F403}', img: itemYak },
    ],
  },
  { id: 'u2l1-trace-y', kind: 'trace', bg: bgBigTree, who: 'willow', letter: 'Y', phoneme: '/y/', word: 'Yoyo', teacher: 'Trace the tall Y with your finger! /y/ /y/ Yoyo!' },
  { id: 'u2l1-echo-y', kind: 'echo', bg: bgMeadow, who: 'willow', teacher: 'Repeat after Willow: Yellow yarn! Yellow yarn!', word: 'Yellow yarn!' },
  {
    id: 'u2l1-basket-r', kind: 'basket', bg: bgClearing, letter: 'R', phoneme: '/r/', who: 'bella', teacher: "Drag the /r/ words into Bella's R basket!", goal: 3,
    items: [
      { word: 'rain', emoji: '\u{1F327}️', img: itemRain, hit: true },
      { word: 'rainbow', emoji: '\u{1F308}', img: itemRainbow, hit: true },
      { word: 'rose', emoji: '\u{1F339}', img: itemRose, hit: true },
      { word: 'yoyo', emoji: '\u{1FA80}', img: itemYoyo, hit: false },
      { word: 'yarn', emoji: '\u{1F9F6}', img: itemYarn, hit: false },
    ],
  },
  {
    id: 'u2l1-basket-y', kind: 'basket', bg: bgBigTree, letter: 'Y', phoneme: '/y/', who: 'willow', teacher: "Drag the /y/ words into Willow's Y basket!", goal: 3,
    items: [
      { word: 'yoyo', emoji: '\u{1FA80}', img: itemYoyo, hit: true },
      { word: 'yarn', emoji: '\u{1F9F6}', img: itemYarn, hit: true },
      { word: 'yak', emoji: '\u{1F403}', img: itemYak, hit: true },
      { word: 'rain', emoji: '\u{1F327}️', img: itemRain, hit: false },
      { word: 'rainbow', emoji: '\u{1F308}', img: itemRainbow, hit: false },
    ],
  },
  {
    id: 'u2l1-sort-ry', kind: 'sound-sort', bg: bgMeadow, teacher: 'Listen! Drag each thing to its sound — /r/ or /y/.',
    targets: [
      { letter: 'R', phoneme: '/r/', who: 'bella' },
      { letter: 'Y', phoneme: '/y/', who: 'willow' },
    ],
    items: [
      { word: 'rain', emoji: '\u{1F327}️', img: itemRain, letter: 'R' },
      { word: 'rainbow', emoji: '\u{1F308}', img: itemRainbow, letter: 'R' },
      { word: 'rose', emoji: '\u{1F339}', img: itemRose, letter: 'R' },
      { word: 'yoyo', emoji: '\u{1FA80}', img: itemYoyo, letter: 'Y' },
      { word: 'yarn', emoji: '\u{1F9F6}', img: itemYarn, letter: 'Y' },
      { word: 'yak', emoji: '\u{1F403}', img: itemYak, letter: 'Y' },
    ],
  },
  {
    id: 'u2l1-color-friends', kind: 'color-friends', bg: bgMeadow, teacher: 'Rainbow time! Pick a color and paint your friends!', cast: ['pip', 'mia', 'bella', 'willow', 'leo'],
  },
  {
    id: 'u2l1-word-build', kind: 'word-build', bg: bgMeadow, teacher: 'Listen! Tap the missing letter to make the word.',
    rounds: [
      { word: 'rain', blankIndex: 0, answer: 'R', choices: ['R', 'Y'], img: itemRain, emoji: '\u{1F327}️' },
      { word: 'yoyo', blankIndex: 0, answer: 'Y', choices: ['R', 'Y'], img: itemYoyo, emoji: '\u{1FA80}' },
      { word: 'rose', blankIndex: 0, answer: 'R', choices: ['R', 'Y'], img: itemRose, emoji: '\u{1F339}' },
      { word: 'yak', blankIndex: 0, answer: 'Y', choices: ['R', 'Y'], img: itemYak, emoji: '\u{1F403}' },
    ],
  },
  {
    id: 'u2l1-who', kind: 'who-said-it', bg: bgHideSeek, teacher: 'Listen! Who is talking? Tap the friend.',
    rounds: [
      { line: 'Look at the red rose!', who: 'bella' },
      { line: 'I have a yellow yoyo!', who: 'willow' },
      { line: 'The rainbow is so pretty!', who: 'pip' },
    ],
  },
  {
    id: 'u2l1-memory', kind: 'memory', bg: bgMeadow, teacher: 'Find the pairs! Tap two cards to match them.',
    pairs: [
      { id: 'rain', label: 'Rain', emoji: '\u{1F327}️', img: itemRain },
      { id: 'rose', label: 'Rose', emoji: '\u{1F339}', img: itemRose },
      { id: 'yoyo', label: 'Yoyo', emoji: '\u{1FA80}', img: itemYoyo },
      { id: 'yak', label: 'Yak', emoji: '\u{1F403}', img: itemYak },
    ],
  },
  {
    id: 'u2l1-dash', kind: 'dash', bg: bgClearing, teacher: 'Bella Dash! Tap only the R words as they run by. Get 6 rings!', who: 'bella', targetLetter: 'R', targetPhoneme: '/r/', goal: 6, seconds: 40,
    items: [
      { word: 'rain', letter: 'R', img: itemRain, emoji: '\u{1F327}️' },
      { word: 'rainbow', letter: 'R', img: itemRainbow, emoji: '\u{1F308}' },
      { word: 'rose', letter: 'R', img: itemRose, emoji: '\u{1F339}' },
      { word: 'yoyo', letter: 'Y', img: itemYoyo, emoji: '\u{1FA80}' },
      { word: 'yarn', letter: 'Y', img: itemYarn, emoji: '\u{1F9F6}' },
      { word: 'yak', letter: 'Y', img: itemYak, emoji: '\u{1F403}' },
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
      { who: 'bella', img: CAST.bella.img, hint: 'She loves red roses.' },
      { who: 'willow', img: CAST.willow.img, hint: 'She found a yellow yoyo today.' },
      { who: 'leo', img: CAST.leo.img, hint: 'A sleepy lion with a big, warm roar.' },
    ],
  },
  {
    id: 'u2l1-roleplay', kind: 'roleplay', bg: bgGatherEmpty, teacher: 'Story time! Listen to Pip and Bella talk about the meadow, then repeat.', cast: ['pip', 'bella'],
    script: [
      { who: 'pip', line: 'Look! A red rose!' },
      { who: 'bella', line: 'I like red!', repeat: true },
      { who: 'bella', line: 'Look! A yellow yoyo!' },
      { who: 'pip', line: 'I like yellow too!', repeat: true },
    ],
  },
  {
    id: 'u2l1-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! Tap the sound, then stack the word!', letters: ['R', 'Y', 'E', 'T'],
    tapRounds: [{ letter: 'R' }, { letter: 'Y' }, { letter: 'R' }, { letter: 'Y' }],
    words: [
      { word: 'RYE', emoji: '\u{1F35E}' },
      { word: 'TRY', emoji: '\u{1F4AA}' },
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
  { id: 'u2l1-finale', kind: 'finale', bg: bgMeadow, who: 'bella', line: 'You did it! You found colors, shapes, and two new sounds — /r/ and /y/!' },
];
