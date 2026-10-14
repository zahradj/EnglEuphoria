/* =============================================================================
 * Food Festival — A1 Unit 4 (plan: docs/a1-unit-4-food.md, owner-approved 2026-10-13: "next")
 *
 * Reuses Welcome Town's Scene type, CharKey/CAST/VOICE_KEY and SceneRenderer — Food Festival is a new WORLD, not a new
 * engine. Unit objective: name festival foods and meals, say what I like and like doing, ask "Do you like…?", offer food
 * ("Would you like some…? — Yes, please / No, thank you"), suggest "Let's…!" and read "Chef Cilla's Recipe" (one story
 * for the unit, a few pages each lesson).
 * Every lesson: sound → a phonics game (different each lesson) → Blend & Read → tongue twister; no game twice in the unit.
 * Phonics: initial blends gr / br, pl, sn, fr — played from our own recorded single sounds (playLetterPhonic blends them),
 * so no new recording is needed. Games that judge the FIRST letter only (Letter Monsters, Sound Mole) cannot check a
 * blend, so each lesson uses a phonics game that names the sound explicitly (Sound Sort, Word Build, Brick Crush,
 * Treasure Chest, Sound Pick).
 * Research (mechanics only, sources in the plan §2): Cambridge A1 Movers word list, classroom restaurant role plays
 * (eslactive, games4esl, Boggle's World, Twinkl), likes/dislikes surveys (teach-this, ESL Kid Stuff, Language Advisor),
 * kids' cooking apps (Lingokids), initial-blend games (TeachSimple, 123 Homeschool 4 Me). New games: Food Survey ★
 * (`food-survey`), Festival Café ★ (`festival-cafe`), Build a Pizza (`build-dish`).
 * ========================================================================= */

import { CAST, VOICE_KEY, type CharKey, type ReaderPage, type Scene } from '../welcome-town/scenes';

export type { CharKey, Scene };
export { CAST, VOICE_KEY };

const F = '/food-festival';
const bgMarket = `${F}/scenes/bg-food-market-wide.png`;
const bgCafe = `${F}/scenes/bg-food-cafe-wide.png`;
const WT = '/welcome-town';
const wtSpr = (who: string) => `${WT}/sprites/${who}-wave.png`;
const item = (n: string) => `/lep1/items/item-${n}.png`;
const SONG_HELLO = `${WT}/audio/hello-song.mp3?v=1`;
const SONG_GOODBYE = `${WT}/audio/goodbye-song.mp3?v=3`;

/** Chef Cilla's Recipe — Canva pictures (scripts/canva-art-request.json, holder design pages 53-64). */
export const cillaPage = (n: number) => `${F}/scenes/bg-food-cilla-${n}-wide.png`;

const CILLA = item('cilla');
const PICO = item('pico');
const BISCUIT = item('dog');

/** The unit's reading strand (plan §4). */
export const CILLA_RECIPE: ReaderPage[] = [
  { img: cillaPage(1), lines: [{ text: 'Look! The Food Festival! There are a lot of stalls.' }], check: { who: 'pip', question: 'Where are they?', answer: 'The Food Festival', options: [{ label: 'The Food Festival' }, { label: 'The jungle' }, { label: 'Space' }] } },
  { img: cillaPage(2), lines: [{ who: 'cilla', text: 'Hello! I am Chef Cilla. I like cooking!' }], check: { who: 'pip', question: 'Who is this?', answer: 'Chef Cilla', options: [{ label: 'Pico', img: item('pico') }, { label: 'Chef Cilla', img: item('cilla') }, { label: 'Biscuit', img: item('dog') }] } },
  { img: cillaPage(3), lines: [{ who: 'cilla', text: 'Let’s make a big pizza for the festival!' }], check: { who: 'pip', question: 'What do they make?', answer: 'A pizza', options: [{ label: 'A pizza', img: item('pizza') }, { label: 'Soup', img: item('soup') }, { label: 'A cake', img: item('cake') }] } },
  { img: cillaPage(4), lines: [{ who: 'cilla', text: 'Oh no! Where is the cheese?' }], check: { who: 'leo', question: 'What is lost?', answer: 'The cheese', options: [{ label: 'The bread', img: item('bread') }, { label: 'The cheese', img: item('cheese') }, { label: 'The grapes', img: item('grapes') }] } },
  { img: cillaPage(5), lines: [{ text: 'Look! Little crumbs. Biscuit can help!' }], check: { who: 'pip', question: 'Who can help?', answer: 'Biscuit', options: [{ label: 'Biscuit', img: item('dog') }, { label: 'Chef Cilla', img: item('cilla') }, { label: 'Pico', img: item('pico') }] } },
  { img: cillaPage(6), lines: [{ text: 'It is Pico the Mouse! He has the cheese.' }], check: { who: 'pip', question: 'Who has the cheese?', answer: 'Pico', options: [{ label: 'Chef Cilla', img: item('cilla') }, { label: 'Pico', img: item('pico') }, { label: 'Biscuit', img: item('dog') }] } },
  { img: cillaPage(7), lines: [{ who: 'leo', text: 'Would you like some grapes, Pico?' }, { who: 'pico', text: 'No, thank you.' }], check: { who: 'mia', question: 'Does Pico want grapes?', answer: 'No', options: [{ label: 'Yes' }, { label: 'No' }] } },
  { img: cillaPage(8), lines: [{ who: 'mia', text: 'Would you like some bread?' }, { who: 'pico', text: 'No, thank you.' }], check: { who: 'pip', question: 'Does Pico want bread?', answer: 'No', options: [{ label: 'No' }, { label: 'Yes' }] } },
  { img: cillaPage(9), lines: [{ who: 'pip', text: 'Do you like pizza, Pico?' }, { who: 'pico', text: 'Yes, I do! I like pizza!' }], check: { who: 'leo', question: 'What does Pico like?', answer: 'Pizza', options: [{ label: 'Bread', img: item('bread') }, { label: 'Grapes', img: item('grapes') }, { label: 'Pizza', img: item('pizza') }] } },
  { img: cillaPage(10), lines: [{ who: 'cilla', text: 'Would you like some pizza?' }, { who: 'pico', text: 'Yes, please!' }], check: { who: 'pip', question: 'What does Pico say?', answer: 'Yes, please!', options: [{ label: 'Yes, please!' }, { label: 'No, thank you.' }] } },
  { img: cillaPage(11), lines: [{ who: 'pico', text: 'Here is the cheese.' }, { who: 'cilla', text: 'Thank you, Pico!' }], check: { who: 'pip', question: 'What does Pico give?', answer: 'The cheese', options: [{ label: 'The cheese', img: item('cheese') }, { label: 'The pizza', img: item('pizza') }, { label: 'The milk', img: item('milk') }] } },
  { img: cillaPage(12), lines: [{ text: 'Let’s eat! Yum! We all like pizza!' }], check: { who: 'pip', question: 'What do they all like?', answer: 'Pizza', options: [{ label: 'Soup', img: item('soup') }, { label: 'Pizza', img: item('pizza') }, { label: 'Salad', img: item('salad') }] } },
];

const helloSong = (id: string, bg: string): Scene => ({
  id, kind: 'song', bg, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Sing hello to Chef Cilla — wave!',
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

/** Biscuit's shelf: Units 1-3, then one more festival treat each lesson. */
const PET_EARLIER = [
  { label: 'star', img: item('star-gold') }, { label: 'apple', img: item('apple') }, { label: 'cake', img: item('cake') },
  { label: 'ball', img: item('ball-red') }, { label: 'hat', img: item('hat') }, { label: 'present', img: item('gift') },
  { label: 'medal', img: item('hero-medal') }, { label: 'banana', img: item('banana') }, { label: 'rainbow medal', img: item('medal-rainbow') },
  { label: 'rocket', img: item('rocket') }, { label: 'moon', img: item('moon') }, { label: 'kite', img: item('kite') },
  { label: 'scarf', img: item('scarf') }, { label: 'robot', img: item('beep') }, { label: 'sunglasses', img: item('sunglasses') },
  { label: 'gold star', img: item('star-gold') },
];
const PET_FOOD = [
  { label: 'sandwich', img: item('sandwich') }, { label: 'cookie', img: item('cookie') }, { label: 'cheese', img: item('cheese') },
  { label: 'pizza', img: item('pizza-slice') }, { label: 'soup', img: item('soup') }, { label: 'cake', img: item('cake') },
];
const petPal = (id: string, n: number, line: string, choices: { label: string; img: string }[], answer: number, say: string): Scene => ({
  id, kind: 'pet-pal', bg: bgMarket, who: 'leo', title: 'Pet Pal: Biscuit at the festival',
  teacher: 'Routine (1 minute): Biscuit the puppy says what he wants. The student listens, taps it and says it. It goes on his shelf and he grows — the shelf keeps everything from earlier lessons.',
  pet: { name: 'Biscuit', img: BISCUIT },
  earlier: [...PET_EARLIER, ...PET_FOOD.slice(0, n)],
  rounds: [{ line, choices, answer, say }],
  doneLine: 'Biscuit is so happy! See you next time!',
});

const FOOD = {
  rice: { label: 'rice', img: item('rice') },
  soup: { label: 'soup', img: item('soup') },
  salad: { label: 'salad', img: item('salad') },
  sandwich: { label: 'sandwich', img: item('sandwich') },
  chips: { label: 'chips', img: item('chips') },
  pasta: { label: 'pasta', img: item('pasta') },
  pizza: { label: 'pizza', img: item('pizza-slice') },
  cheese: { label: 'cheese', img: item('cheese') },
  grapes: { label: 'grapes', img: item('grapes') },
  bread: { label: 'bread', img: item('bread') },
  milk: { label: 'milk', img: item('milk') },
  juice: { label: 'juice', img: item('juice') },
  eggs: { label: 'eggs', img: item('egg') },
  cake: { label: 'cake', img: item('cake') },
};

/* =============================================================================
 * A1 Unit 4 Lesson 1: "Yummy Foods at the Festival"
 * Objective: I can name festival foods and say what I have for my meals: "I have soup for lunch."
 * Story frame: arriving at the Food Festival — a stroll between the stalls (new world: warm afternoon market light).
 * Practice ladder: Present (two small sets of food words, meals, I have … for lunch) → Guided (Mystery Bag, Feed Pip,
 *   Shadow Match, Food Memory) → Reading (Reader p1-3, Read & Match, Market Sort sentences) → Phonics gr / br → Free
 *   (What do you have for breakfast?) → check.
 * ========================================================================= */

export const LESSON_A1U4L1_TITLE = 'Yummy Foods at the Festival';
export const LESSON_A1U4L1_OBJECTIVE = 'I can name festival foods and say what I have for my meals: "I have soup for lunch."';

export const LESSON_A1U4L1_SCENES: Scene[] = [
  { id: 'ff-title', kind: 'title-card', bg: bgMarket, level: 'A1', unit: 'Unit 4', lessonLabel: 'Lesson 1', title: 'Yummy Foods at the Festival', subtitle: 'Rice, soup, salad… what do you have for lunch?', cta: '\u{1F35C} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): Unit 3 — the space words and the weather (listen-only).
    id: 'ff-recall-warmup', kind: 'recall-warmup', bg: bgMarket, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 3 · Space Mission',
    teacher: 'Guided: listen — which picture is it? Click it, then say one more sentence about it.',
    items: [
      { word: 'robot', say: 'Beep is a robot. He was lost!', img: item('beep') },
      { word: 'snowy', say: 'It’s cold and snowy on Planet Ice.', img: item('planet-ice') },
      { word: 'moon', say: 'The moon is above the rocket.', img: item('moon') },
    ],
  },
  { id: 'ff-meet-cilla', kind: 'meet', focus: ['cooking'], bg: cillaPage(2), who: 'cilla', cardSide: 'right', teacher: 'Present: meet Chef Cilla! Mime stirring a pot. Say: I like cooking!', line: 'Hello! I’m Chef Cilla. I like cooking!', repeat: 'I like cooking!' },
  {
    id: 'ff-foods-1', kind: 'prea1', teacher: 'Present: festival foods (set 1) — listen and say each one. Mime eating it!',
    scene: {
      id: 'ff-foods-1', kind: 'listen-repeat-cards', bg: bgMarket, teacher: 'Listen and say it!',
      cards: [
        { who: 'pip', sentence: 'It’s rice.', img: FOOD.rice.img, imgLabel: 'rice' },
        { who: 'pip', sentence: 'It’s soup.', img: FOOD.soup.img, imgLabel: 'soup' },
        { who: 'pip', sentence: 'It’s salad.', img: FOOD.salad.img, imgLabel: 'salad' },
        { who: 'pip', sentence: 'It’s a sandwich.', img: FOOD.sandwich.img, imgLabel: 'sandwich' },
      ],
    },
  },
  {
    id: 'ff-foods-2', kind: 'prea1', teacher: 'Present: festival foods (set 2) — listen and say each one.',
    scene: {
      id: 'ff-foods-2', kind: 'listen-repeat-cards', bg: bgMarket, teacher: 'Listen and say it!',
      cards: [
        { who: 'pip', sentence: 'They’re chips.', img: FOOD.chips.img, imgLabel: 'chips' },
        { who: 'pip', sentence: 'It’s pasta.', img: FOOD.pasta.img, imgLabel: 'pasta' },
        { who: 'pip', sentence: 'It’s cheese.', img: FOOD.cheese.img, imgLabel: 'cheese' },
        { who: 'pip', sentence: 'They’re grapes.', img: FOOD.grapes.img, imgLabel: 'grapes' },
      ],
    },
  },
  {
    id: 'ff-meals', kind: 'prea1', teacher: 'Present: the three meals — listen and say. Point to the sun: morning, midday, evening.',
    scene: {
      id: 'ff-meals', kind: 'listen-repeat-cards', bg: bgCafe, teacher: 'Listen and say it!',
      cards: [
        { who: 'mia', sentence: 'I have eggs for breakfast.', img: FOOD.eggs.img, imgLabel: 'breakfast' },
        { who: 'mia', sentence: 'I have soup for lunch.', img: FOOD.soup.img, imgLabel: 'lunch' },
        { who: 'mia', sentence: 'I have pasta for dinner.', img: FOOD.pasta.img, imgLabel: 'dinner' },
      ],
    },
  },
  { id: 'ff-meet-lunch', kind: 'meet', focus: ['lunch'], bg: cillaPage(3), who: 'cilla', cardSide: 'right', teacher: 'Present: Cilla says her lunch. The student says their own: I have … for lunch.', line: 'I have salad for lunch. Yum!', repeat: 'I have salad for lunch.' },
  { id: 'ff-echo', kind: 'echo', bg: bgMarket, who: 'pip', textSide: 'top', teacher: 'Guided: say it like Pip — loud, then quiet!', word: 'I have soup for lunch.' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'ff-food-match', kind: 'picture-match', look: 'frames', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each word and drags it under its picture (or taps the word, then the picture), then reads it aloud.',
    items: [
      { word: 'rice', img: FOOD.rice.img },
      { word: 'soup', img: FOOD.soup.img },
      { word: 'salad', img: FOOD.salad.img },
      { word: 'sandwich', img: FOOD.sandwich.img },
      { word: 'pasta', img: FOOD.pasta.img },
      { word: 'cheese', img: FOOD.cheese.img },
    ],
    bg: bgMarket,
  },
  {
    id: 'ff-mystery-bag', kind: 'prea1', teacher: 'Guided: What is in the bag? Look at the shape, tap the food — then say it with a meal: I have rice for dinner!',
    scene: {
      id: 'ff-mystery-bag', kind: 'mystery-bag', bg: bgMarket, who: 'leo',
      question: 'What is in the bag?', doneText: 'You found every food!',
      teacher: 'Look at the shape. What is in the bag? Tap it and say it!',
      rounds: [
        { img: FOOD.sandwich.img, toyWord: 'SANDWICH', colorWord: 'YUMMY', colorHex: '#F59E0B', options: [{ toyWord: 'SANDWICH', img: FOOD.sandwich.img }, { toyWord: 'SOUP', img: FOOD.soup.img }, { toyWord: 'GRAPES', img: FOOD.grapes.img }] },
        { img: FOOD.pasta.img, toyWord: 'PASTA', colorWord: 'YUMMY', colorHex: '#EF4444', options: [{ toyWord: 'RICE', img: FOOD.rice.img }, { toyWord: 'PASTA', img: FOOD.pasta.img }, { toyWord: 'CHEESE', img: FOOD.cheese.img }] },
        { img: FOOD.chips.img, toyWord: 'CHIPS', colorWord: 'YUMMY', colorHex: '#EAB308', options: [{ toyWord: 'SALAD', img: FOOD.salad.img }, { toyWord: 'SANDWICH', img: FOOD.sandwich.img }, { toyWord: 'CHIPS', img: FOOD.chips.img }] },
        { img: FOOD.rice.img, toyWord: 'RICE', colorWord: 'YUMMY', colorHex: '#94A3B8', options: [{ toyWord: 'RICE', img: FOOD.rice.img }, { toyWord: 'PASTA', img: FOOD.pasta.img }, { toyWord: 'SOUP', img: FOOD.soup.img }] },
      ],
    },
  },
  helloSong('ff-hello-song', cillaPage(1)),
  {
    id: 'ff-feed-pip', kind: 'prea1', teacher: 'Guided: Feed Pip! Pip asks for a festival food — the student taps it on the table, then says: Here you are! It’s soup!',
    scene: {
      id: 'ff-feed-pip', kind: 'feed-pip', bg: bgCafe, who: 'pip', whoImg: wtSpr('pip'),
      teacher: 'Pip asks for a food. Tap it and say: Here you are!',
      mouth: { x: 78, y: 40 },
      foods: [
        { word: 'soup', phrase: 'soup', img: FOOD.soup.img, x: 22, y: 72 },
        { word: 'rice', phrase: 'rice', img: FOOD.rice.img, x: 38, y: 78 },
        { word: 'salad', phrase: 'salad', img: FOOD.salad.img, x: 54, y: 72 },
        { word: 'sandwich', phrase: 'a sandwich', img: FOOD.sandwich.img, x: 30, y: 52 },
      ],
      rounds: [
        { target: 0, line: 'Can I have some soup, please?', reply: 'Thank you! I have soup for lunch!' },
        { target: 3, line: 'Can I have a sandwich, please?', reply: 'Thank you! Yum, a sandwich!' },
        { target: 1, line: 'Can I have some rice, please?', reply: 'Thank you! I have rice for dinner!' },
        { target: 2, line: 'Can I have some salad, please?', reply: 'Thank you! Crunch, crunch!' },
      ],
      doneLine: 'Pip is full! Great helping!',
    },
  },
  {
    id: 'ff-shadows', kind: 'prea1', teacher: 'Guided: Shadow Match! Drag each food onto its shadow (or tap it, then the shadow) and say it: It’s pasta!',
    scene: {
      id: 'ff-shadows', kind: 'shadow-match', bg: bgMarket, who: 'pip',
      teacher: 'Drag each food onto its shadow. Say it!',
      items: [
        { label: 'pasta', img: FOOD.pasta.img, line: 'It’s pasta.' },
        { label: 'cheese', img: FOOD.cheese.img, line: 'It’s cheese.' },
        { label: 'grapes', img: FOOD.grapes.img, line: 'They’re grapes.' },
        { label: 'sandwich', img: FOOD.sandwich.img, line: 'It’s a sandwich.' },
        { label: 'chips', img: FOOD.chips.img, line: 'They’re chips.' },
      ],
    },
  },
  {
    id: 'ff-move-break', kind: 'prea1', teacher: 'Brain break: festival cooking moves with Pip.',
    scene: {
      id: 'ff-move-break', kind: 'tpr-actions', mode: 'break', bg: bgMarket, who: 'pip', teacher: 'Cook with Pip!',
      rounds: [
        { line: 'Stir the soup! Round and round!', emoji: '\u{1F963}' },
        { line: 'Chop the salad! Chop, chop, chop!', emoji: '\u{1F957}' },
        { line: 'Eat the pasta! Slurp!', emoji: '\u{1F35D}' },
        { line: 'Rub your tummy! Yum!', emoji: '\u{1F60B}' },
      ],
    },
  },
  {
    id: 'ff-memory', kind: 'memory', bg: bgMarket, teacher: 'Guided: find each food and its word — say the word with every pair.',
    pairs: [
      { id: 'rice', label: 'rice', emoji: '\u{1F35A}', img: FOOD.rice.img },
      { id: 'soup', label: 'soup', emoji: '\u{1F963}', img: FOOD.soup.img },
      { id: 'salad', label: 'salad', emoji: '\u{1F957}', img: FOOD.salad.img },
      { id: 'pasta', label: 'pasta', emoji: '\u{1F35D}', img: FOOD.pasta.img },
      { id: 'chips', label: 'chips', emoji: '\u{1F35F}', img: FOOD.chips.img },
    ],
  },
  /* Reading: Chef Cilla's Recipe, pages 1-3 */
  {
    id: 'ff-reader', kind: 'reader', bg: cillaPage(1), title: 'Chef Cilla’s Recipe', doneLine: 'A big pizza for the festival! What happens next? Find out next time!',
    teacher: 'Reading: listen while the words light up, then the student reads each page. Tap any word to hear it.',
    pages: CILLA_RECIPE.slice(0, 3),
  },
  {
    id: 'ff-read-match', kind: 'picture-match', look: 'polaroids', prompt: 'Read and match',
    teacher: 'Reading: read each sentence and drag it under its picture. Then read it aloud.',
    items: [
      { word: 'I have soup for lunch.', img: FOOD.soup.img },
      { word: 'I have eggs for breakfast.', img: FOOD.eggs.img },
      { word: 'I like cooking!', img: CILLA },
      { word: 'Let’s make a pizza!', img: item('pizza') },
    ],
    bg: bgMarket,
  },
  {
    id: 'ff-market-sort', kind: 'sort-basket', bg: bgMarket, title: 'Market Sort: which meal?',
    teacher: 'Reading: read each card aloud — breakfast, lunch or dinner? Put it in the right basket. The meal word decides!',
    baskets: [{ label: 'breakfast', emoji: '\u{1F305}' }, { label: 'lunch', emoji: '\u{1F31E}' }, { label: 'dinner', emoji: '\u{1F319}' }],
    items: [
      { word: 'I have eggs for breakfast.', img: FOOD.eggs.img, basket: 0 },
      { word: 'I have soup for lunch.', img: FOOD.soup.img, basket: 1 },
      { word: 'I have pasta for dinner.', img: FOOD.pasta.img, basket: 2 },
      { word: 'I have milk for breakfast.', img: FOOD.milk.img, basket: 0 },
      { word: 'I have a sandwich for lunch.', img: FOOD.sandwich.img, basket: 1 },
      { word: 'I have rice for dinner.', img: FOOD.rice.img, basket: 2 },
    ],
  },
  /* Phonics: gr / br → Sound Sort → Blend & Read → tongue twister */
  {
    id: 'ff-sound-gr', kind: 'sound-model', bg: bgMarket, who: 'pip', letter: 'GR', phoneme: '/gr/', sound: 'gr', soundSide: 'center',
    teacher: 'Present: g and r together — say g, then r, fast: gr! Grapes, grandma, grandpa. (br works the same: bread.)',
    anchors: [
      { word: 'grapes', emoji: '\u{1F347}', img: FOOD.grapes.img },
      { word: 'grandma', emoji: '\u{1F475}', img: item('family-grandma') },
      { word: 'grandpa', emoji: '\u{1F474}', img: item('family-grandpa') },
    ],
  },
  {
    id: 'ff-sound-sort', kind: 'prea1', teacher: 'Guided: Sound Sort! Listen to each word — gr or br? Drag it to its basket and say it.',
    scene: {
      id: 'ff-sound-sort', kind: 'sound-sort', bg: bgMarket, teacher: 'Listen! gr or br?',
      targets: [{ letter: 'gr', phoneme: '/gr/', who: 'pip' }, { letter: 'br', phoneme: '/br/', who: 'leo' }],
      items: [
        { word: 'grapes', img: FOOD.grapes.img, emoji: '\u{1F347}', letter: 'gr' },
        { word: 'bread', img: FOOD.bread.img, emoji: '\u{1F35E}', letter: 'br' },
        { word: 'grandma', img: item('family-grandma'), emoji: '\u{1F475}', letter: 'gr' },
        { word: 'brother', img: item('family-brother'), emoji: '\u{1F466}', letter: 'br' },
        { word: 'grandpa', img: item('family-grandpa'), emoji: '\u{1F474}', letter: 'gr' },
      ],
    },
  },
  {
    id: 'ff-blend', kind: 'sound-blend', bg: bgMarket,
    teacher: 'Reading: say each sound (g, r — blend them fast), blend the word, find the picture — then read the sentence.',
    rounds: [
      { word: 'grab', img: item('claw'), sentence: 'The claw can grab.' },
      { word: 'grin', img: `${WT}/sprites/pip-happy-v2.png`, sentence: 'Pip has a big grin.' },
      { word: 'brick', sounds: ['b', 'r', 'i', 'ck'], img: item('blocks'), sentence: 'A red brick.' },
    ],
  },
  { id: 'ff-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgMarket, who: 'pip', focus: 'gr', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, then faster.', line: 'Green grapes, great grapes, grab a grape!' },
  /* Free: my meals */
  {
    id: 'ff-free-talk', kind: 'join-stage', bg: cillaPage(2), teacher: 'Free: Cilla asks about the student’s meals — they answer with I have … for … . Then they ask Cilla.', cast: ['cilla', 'pip'],
    turns: [
      { who: 'cilla', line: 'What do you have for breakfast?' },
      { who: 'student', line: 'I have … for breakfast.' },
      { who: 'cilla', line: 'Yum! And for lunch?' },
      { who: 'student', line: 'I have … for lunch. What do you have for dinner, Cilla?' },
      { who: 'cilla', line: 'I have pasta for dinner!' },
    ],
  },
  {
    id: 'ff-guess-food', kind: 'join-stage', bg: bgMarket, teacher: 'Free: the student thinks of a food and gives two clues (It’s yellow. I have it for lunch.) — Pip guesses. Then swap.', cast: ['pip'],
    turns: [
      { who: 'student', line: 'It’s … . I have it for … .' },
      { who: 'pip', line: 'Is it soup?' },
      { who: 'student', line: 'Yes! / No! Now you, Pip!' },
      { who: 'pip', line: 'They’re green. I have them for breakfast.' },
      { who: 'student', line: 'Grapes!' },
    ],
  },
  { id: 'ff-i-can', kind: 'meet', focus: ['meals'], bg: cillaPage(3), who: 'cilla', cardSide: 'right', teacher: 'Check: the student sorts the meals and says 2 meal sentences about themselves — then the passport stamp!', line: 'I can name festival foods and my meals!', repeat: 'I have soup for lunch.' },
  {
    id: 'ff-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the festival sticker in their Sticker Book.',
    scene: {
      id: 'ff-sticker', kind: 'sticker-reward', bg: bgMarket, who: 'pip', teacher: 'Sticker time!',
      line: 'Super food words! Here is your sticker.',
      sticker: { img: FOOD.soup.img, label: 'Festival foodie' },
    },
  },
  petPal('ff-pet-pal', 0, 'It’s lunch time! I want a sandwich!', [{ label: 'soup', img: FOOD.soup.img }, { label: 'sandwich', img: FOOD.sandwich.img }, { label: 'rocket', img: item('rocket') }], 1, 'A sandwich! I have a sandwich for lunch!'),
  {
    id: 'ff-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ff-home-mission', kind: 'home-mission', bg: bgMarket, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned festival foods (rice, soup, salad, sandwich, chips, pasta, cheese, grapes) and the meals: "I have soup for lunch." At every meal this week, ask: "What do you have for lunch?"',
      steps: [
        { emoji: '\u{1F305}', say: 'Breakfast: say what you have.' },
        { emoji: '\u{1F31E}', say: 'Lunch: I have … for lunch.' },
        { emoji: '\u{1F319}', say: 'Dinner: I have … for dinner.' },
      ],
    },
  },
  {
    id: 'ff-move-break-2', kind: 'prea1', teacher: 'Brain break: big and small bites!',
    scene: {
      id: 'ff-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgMarket, who: 'pip', teacher: 'Bite, bite!',
      rounds: [
        { line: 'A big bite of a sandwich! Chomp!', emoji: '\u{1F96A}' },
        { line: 'A tiny bite of a grape! Nibble!', emoji: '\u{1F347}' },
        { line: 'Blow on the hot soup! Whoosh!', emoji: '\u{1F963}' },
      ],
    },
  },
  goodbyeSong('ff-goodbye-song', bgMarket),
  { id: 'ff-finale', kind: 'finale', bg: cillaPage(1), who: 'pip', line: 'You can name festival foods and your meals! See you at the festival! \u{1F35C}' },
];

/* =============================================================================
 * A1 Unit 4 Lesson 2: "I Like Cooking!"
 * Objective: I can say what I like and don't like doing: "I like cooking. I don't like washing up."
 * Story frame: Cilla's festival kitchen (new setting: the café counter; a "who does what?" plot).
 * Practice ladder: Present (doing words, I like / I don't like + -ing) → Guided (Like Chart, Kitchen Charades, Spin &
 *   Say) → Reading (Reader p4-5, Read & Drag) → Phonics pl → Free (what I like doing) → check.
 * ========================================================================= */

export const LESSON_A1U4L2_TITLE = 'I Like Cooking!';
export const LESSON_A1U4L2_OBJECTIVE = 'I can say what I like and don\'t like doing: "I like cooking. I don\'t like washing up."';

const DOING = {
  cooking: { label: 'cooking', img: item('pan') },
  eating: { label: 'eating', img: FOOD.sandwich.img },
  baking: { label: 'baking', img: FOOD.cake.img },
  washing: { label: 'washing up', img: item('water-splash') },
};

export const LESSON_A1U4L2_SCENES: Scene[] = [
  { id: 'ff2-title', kind: 'title-card', bg: bgCafe, level: 'A1', unit: 'Unit 4', lessonLabel: 'Lesson 2', title: 'I Like Cooking!', subtitle: 'Cooking, eating, baking… and washing up?', cta: '\u{1F373} LET’S GO!' },
  {
    id: 'ff2-recall-warmup', kind: 'recall-warmup', bg: bgMarket, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 4 · Lesson 1 · Festival Foods',
    teacher: 'Guided: listen — which food is it? Click it and say a meal sentence: I have … for lunch.',
    items: [
      { word: 'soup', say: 'I have soup for lunch.', img: FOOD.soup.img },
      { word: 'pasta', say: 'I have pasta for dinner.', img: FOOD.pasta.img },
      { word: 'rice', say: 'I have rice for dinner.', img: FOOD.rice.img },
    ],
  },
  {
    id: 'ff2-doing', kind: 'prea1', teacher: 'Present: the doing words — listen, say and mime each one (stir, eat, mix, scrub).',
    scene: {
      id: 'ff2-doing', kind: 'listen-repeat-cards', bg: bgCafe, teacher: 'Listen, say and do it!',
      cards: [
        { who: 'pip', sentence: 'cooking', img: DOING.cooking.img, imgLabel: 'cooking' },
        { who: 'pip', sentence: 'eating', img: DOING.eating.img, imgLabel: 'eating' },
        { who: 'pip', sentence: 'baking', img: DOING.baking.img, imgLabel: 'baking' },
        { who: 'pip', sentence: 'washing up', img: DOING.washing.img, imgLabel: 'washing up' },
      ],
    },
  },
  { id: 'ff2-meet-like', kind: 'meet', focus: ['cooking'], bg: cillaPage(2), who: 'cilla', cardSide: 'right', teacher: 'Present: thumbs up — I like cooking! Say it with Cilla.', line: 'I like cooking! I like baking too!', repeat: 'I like cooking!' },
  { id: 'ff2-meet-dont', kind: 'meet', focus: ['don’t'], bg: cillaPage(3), who: 'leo', cardSide: 'left', teacher: 'Present: thumbs down — I don’t like washing up! Make a funny face. Then say it.', line: 'I like eating. I don’t like washing up!', repeat: 'I don’t like washing up!' },
  { id: 'ff2-echo', kind: 'echo', bg: bgCafe, who: 'pip', textSide: 'top', teacher: 'Guided: thumbs up, then thumbs down — say it like Pip!', word: 'I like cooking. I don’t like washing up.' },
  { id: 'ff2-echo-2', kind: 'echo', bg: bgCafe, who: 'leo', textSide: 'top', teacher: 'Guided: say it with Leo — a big yummy voice for “eating”!', word: 'I like eating!' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'ff2-doing-match', kind: 'picture-match', look: 'polaroids', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each word and drags it under its picture (or taps the word, then the picture), then reads it aloud.',
    items: [
      { word: 'cooking', img: DOING.cooking.img },
      { word: 'eating', img: DOING.eating.img },
      { word: 'baking', img: DOING.baking.img },
      { word: 'washing up', img: DOING.washing.img },
    ],
    bg: bgCafe,
  },
  {
    id: 'ff2-red-green', kind: 'red-green', bg: bgCafe, who: 'cilla', runner: item('pip-run'), title: 'Red Light, Green Light: kitchen jobs!',
    teacher: 'Listening race: on green, the student taps the kitchen job they hear and Pip runs on (they can mime it too!). On red — freeze! Do not tap until it turns green.',
    cards: [{ label: 'cooking', img: DOING.cooking.img }, { label: 'eating', img: DOING.eating.img }, { label: 'baking', img: DOING.baking.img }, { label: 'washing up', img: DOING.washing.img }],
    rounds: [
      { light: 'green', say: 'Green light! I like cooking!', answer: 0, steps: 2 },
      { light: 'green', say: 'Green light! I like baking!', answer: 2, steps: 2 },
      { light: 'red', say: 'Red light! Stop!' },
      { light: 'green', say: 'Green light! I don’t like washing up!', answer: 3, steps: 2 },
      { light: 'green', say: 'Green light! I like eating!', answer: 1, steps: 2 },
      { light: 'red', say: 'Red light! Freeze!' },
      { light: 'green', say: 'Green light! I like cooking!', answer: 0, steps: 2 },
    ],
    doneLine: 'Pip made it to the kitchen! Great listening!',
  },
  {
    id: 'ff2-like-chart', kind: 'prea1', teacher: 'Guided: the Like Chart! Each friend says what they like doing; the student taps that column and the friend’s face goes up. Then read the chart and add YOUR star.',
    scene: {
      id: 'ff2-like-chart', kind: 'like-chart', bg: bgCafe, who: 'pip',
      teacher: 'Listen! What does each friend like doing? Tap it!',
      columns: [
        { word: 'cooking', img: DOING.cooking.img },
        { word: 'eating', img: DOING.eating.img },
        { word: 'baking', img: DOING.baking.img },
      ],
      rounds: [
        { friend: 'leo', column: 1, line: 'I like eating!', reply: 'Yes! Leo likes eating!' },
        { friend: 'mia', column: 2, line: 'I like baking!', reply: 'Yes! Mia likes baking!' },
        { friend: 'bella', column: 0, line: 'I like cooking!', reply: 'Yes! Bella likes cooking!' },
        { friend: 'willow', column: 1, line: 'I like eating!', reply: 'Yes! Willow likes eating!' },
        { friend: 'pip', column: 1, line: 'I like eating too!', reply: 'Yes! Pip likes eating!' },
      ],
      summaryLine: 'Look! Three friends like eating!',
    },
  },
  helloSong('ff2-hello-song', bgCafe),
  {
    id: 'ff2-charades', kind: 'draw-guess', bg: bgCafe, who: 'leo', title: 'Kitchen Charades: what is it?',
    teacher: 'Game: take turns. The drawer sees a secret food or doing word and draws it (no words!); the other one taps the picture and says it: It’s cooking! In a live class each screen shows only its own role.',
    rounds: [
      { drawer: 'teacher', secret: 0, options: [{ label: 'soup', img: FOOD.soup.img, say: 'It’s soup!' }, { label: 'pizza', img: FOOD.pizza.img, say: 'It’s pizza!' }, { label: 'grapes', img: FOOD.grapes.img, say: 'They’re grapes!' }, { label: 'cake', img: FOOD.cake.img, say: 'It’s cake!' }], doodle: ['M 330 300 Q 500 520 670 300 Z', 'M 310 300 L 690 300', 'M 430 260 Q 450 200 430 150', 'M 500 260 Q 520 200 500 150', 'M 570 260 Q 590 200 570 150'] },
      { drawer: 'student', secret: 2, options: [{ label: 'cooking', img: DOING.cooking.img, say: 'It’s cooking!' }, { label: 'eating', img: DOING.eating.img, say: 'It’s eating!' }, { label: 'baking', img: DOING.baking.img, say: 'It’s baking!' }, { label: 'washing up', img: DOING.washing.img, say: 'It’s washing up!' }] },
      { drawer: 'teacher', secret: 1, options: [{ label: 'cake', img: FOOD.cake.img, say: 'It’s cake!' }, { label: 'pizza', img: FOOD.pizza.img, say: 'It’s pizza!' }, { label: 'soup', img: FOOD.soup.img, say: 'It’s soup!' }, { label: 'rice', img: FOOD.rice.img, say: 'It’s rice!' }], doodle: ['M 500 120 L 330 470 L 670 470 Z', 'M 340 450 Q 500 500 660 450', 'M 470 260 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0', 'M 420 380 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0', 'M 540 360 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0'] },
      { drawer: 'student', secret: 3, options: [{ label: 'eating', img: DOING.eating.img, say: 'It’s eating!' }, { label: 'baking', img: DOING.baking.img, say: 'It’s baking!' }, { label: 'cooking', img: DOING.cooking.img, say: 'It’s cooking!' }, { label: 'washing up', img: DOING.washing.img, say: 'It’s washing up!' }] },
    ],
    doneLine: 'Great drawing! Great guessing!',
  },
  {
    id: 'ff2-spin', kind: 'spin-wheel', bg: bgCafe, title: 'Spin! Like or don’t like?',
    teacher: 'Have the student spin the wheel and say a sentence about the picture with the number: I like cooking. / I don’t like washing up. If you prefer, do the activity without the spinner.',
    items: [
      { label: 'cooking', left: '14%', top: '30%', img: DOING.cooking.img },
      { label: 'eating', left: '86%', top: '30%', img: DOING.eating.img },
      { label: 'baking', left: '14%', top: '74%', img: DOING.baking.img },
      { label: 'washing up', left: '86%', top: '74%', img: DOING.washing.img },
      { label: 'pizza', left: '30%', top: '14%', img: FOOD.pizza.img },
      { label: 'salad', left: '70%', top: '14%', img: FOOD.salad.img },
    ],
    wheelAt: { left: '50%', top: '55%' },
  },
  {
    id: 'ff2-move-break', kind: 'prea1', teacher: 'Brain break: kitchen moves — thumbs up or down after each one!',
    scene: {
      id: 'ff2-move-break', kind: 'tpr-actions', mode: 'break', bg: bgCafe, who: 'pip', teacher: 'Do it — then thumbs up or down!',
      rounds: [
        { line: 'Cooking! Stir, stir, stir!', emoji: '\u{1F373}' },
        { line: 'Baking! Mix, mix, mix!', emoji: '\u{1F370}' },
        { line: 'Washing up! Scrub, scrub, scrub!', emoji: '\u{1F9FD}' },
      ],
    },
  },
  /* Reading: Chef Cilla's Recipe, pages 4-5 */
  {
    id: 'ff2-reader', kind: 'reader', bg: cillaPage(4), title: 'Chef Cilla’s Recipe', doneLine: 'Where is the cheese? Biscuit can help! Find out next time!',
    teacher: 'Reading: a quick re-read of pages 1-3, then the new pages 4-5 (listen first). Tap any word to hear it.',
    pages: CILLA_RECIPE.slice(0, 5),
  },
  {
    id: 'ff2-read-drag', kind: 'drag-match', bg: cillaPage(3), teacher: 'Reading: read each sentence and drag it onto the friend who says it. Then read it aloud.',
    items: [
      { label: 'I like cooking!', color: '#E63946', targetLeft: '50%', targetTop: '40%' },
      { label: 'I like eating!', color: '#C97A2F', targetLeft: '30%', targetTop: '42%' },
      { label: 'I like baking!', color: '#FE6A2F', targetLeft: '68%', targetTop: '42%' },
    ],
  },
  {
    id: 'ff2-balloon-match', kind: 'balloon-match', bg: bgMarket, who: 'cilla', title: 'Balloon Match: what do they like doing?',
    teacher: 'Reading game: the student reads a balloon (tap it to hear it), then taps the picture it describes. The balloon floats down and pops!',
    pairs: [
      { text: 'I like cooking.', img: DOING.cooking.img, label: 'cooking' },
      { text: 'I like baking.', img: DOING.baking.img, label: 'baking' },
      { text: 'I don’t like washing up.', img: DOING.washing.img, label: 'washing up' },
      { text: 'I like eating sandwiches.', img: DOING.eating.img, label: 'eating' },
    ],
    doneLine: 'Pop, pop! You can read about likes!',
  },
  { id: 'ff2-jigsaw', kind: 'jigsaw-puzzle', bg: bgCafe, teacher: 'Build the story picture — then read its page: Oh no! Where is the cheese?', image: cillaPage(4), rows: 2, cols: 3 },
  /* Phonics: pl → Word Build → Blend & Read → tongue twister */
  {
    id: 'ff2-sound-pl', kind: 'sound-model', bg: bgCafe, who: 'pip', letter: 'PL', phoneme: '/pl/', sound: 'pl', soundSide: 'center',
    teacher: 'Present: p and l together — p, l, fast: pl! Plum, plate, plane.',
    anchors: [
      { word: 'plum', emoji: '\u{1F351}', img: item('plum') },
      { word: 'plate', emoji: '\u{1F37D}\u{FE0F}', img: item('plate') },
      { word: 'plane', emoji: '\u{2708}\u{FE0F}', img: item('plane') },
    ],
  },
  {
    id: 'ff2-word-build', kind: 'word-build', bg: bgCafe,
    teacher: 'Reading: which blend is missing — pl, gr or br? Pick it, then read the word.',
    rounds: [
      { word: 'plum', tiles: ['pl', 'u', 'm'], blankIndex: 0, answer: 'pl', choices: ['gr', 'pl', 'br'], img: item('plum'), emoji: '\u{1F351}' },
      { word: 'grab', tiles: ['gr', 'a', 'b'], blankIndex: 0, answer: 'gr', choices: ['gr', 'pl', 'br'], img: item('claw'), emoji: '\u{1F91A}' },
      { word: 'plan', tiles: ['pl', 'a', 'n'], blankIndex: 0, answer: 'pl', choices: ['br', 'gr', 'pl'], img: item('map'), emoji: '\u{1F5FA}\u{FE0F}' },
      { word: 'brick', tiles: ['br', 'i', 'ck'], blankIndex: 0, answer: 'br', choices: ['pl', 'br', 'gr'], img: item('blocks'), emoji: '\u{1F9F1}' },
    ],
  },
  {
    id: 'ff2-blend', kind: 'sound-blend', bg: bgCafe, look: 'slide',
    teacher: 'Reading: say each sound (p, l — blend them fast), blend, find the picture — then read the sentence.',
    rounds: [
      { word: 'plum', img: item('plum'), sentence: 'A plum on a plate.' },
      { word: 'plan', img: item('map'), sentence: 'Let’s make a plan!' },
      { word: 'clap', img: item('pip-clap'), sentence: 'Clap, clap, Pip!' },
    ],
  },
  { id: 'ff2-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgCafe, who: 'pip', focus: 'pl', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, then faster.', line: 'Plum on a plate, please!' },
  /* Free: what I like doing */
  {
    id: 'ff2-free-talk', kind: 'join-stage', bg: cillaPage(2), teacher: 'Free (evidence): the student says 3 sentences about themselves — like / don’t like, one with -ing. Then asks Cilla.', cast: ['cilla'],
    turns: [
      { who: 'cilla', line: 'What do you like doing in the kitchen?' },
      { who: 'student', line: 'I like … . I don’t like … .' },
      { who: 'cilla', line: 'And what food do you like?' },
      { who: 'student', line: 'I like … . Do you like washing up, Cilla?' },
      { who: 'cilla', line: 'No, I don’t! But I like cooking!' },
    ],
  },
  {
    id: 'ff2-friends-talk', kind: 'join-stage', bg: cillaPage(3), teacher: 'Free: Leo and the student compare — same or different?', cast: ['leo'],
    turns: [
      { who: 'leo', line: 'I like eating. I don’t like washing up!' },
      { who: 'student', line: 'Me too! / I like … .' },
      { who: 'leo', line: 'Do you like baking?' },
      { who: 'student', line: 'Yes! I like baking. / No, I don’t like baking.' },
    ],
  },
  { id: 'ff2-i-can', kind: 'meet', focus: ['don’t'], bg: cillaPage(2), who: 'cilla', cardSide: 'right', teacher: 'Check: 3 like / don’t like sentences, one with -ing — then the passport stamp!', line: 'I can say what I like and don’t like doing!', repeat: 'I like cooking. I don’t like washing up.' },
  {
    id: 'ff2-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the chef sticker in their Sticker Book.',
    scene: {
      id: 'ff2-sticker', kind: 'sticker-reward', bg: bgCafe, who: 'pip', teacher: 'Sticker time!',
      line: 'Super cook! Here is your chef sticker.',
      sticker: { img: CILLA, label: 'Little chef' },
    },
  },
  petPal('ff2-pet-pal', 1, 'I like eating! I don’t like washing up! I want a cookie!', [{ label: 'cookie', img: item('cookie') }, { label: 'salad', img: FOOD.salad.img }, { label: 'scarf', img: item('scarf') }], 0, 'A cookie! I like eating cookies!'),
  {
    id: 'ff2-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ff2-home-mission', kind: 'home-mission', bg: bgCafe, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned to say what they like and don\'t like doing: "I like cooking. I don\'t like washing up." Help in the kitchen together and let them say what they like doing.',
      steps: [
        { emoji: '\u{1F373}', say: 'Help in the kitchen.' },
        { emoji: '\u{1F44D}', say: 'Say: I like cooking!' },
        { emoji: '\u{1F44E}', say: 'Say: I don’t like … !' },
      ],
    },
  },
  {
    id: 'ff2-move-break-2', kind: 'prea1', teacher: 'Brain break: likes and don’t likes — jump for “like”, sit for “don’t like”!',
    scene: {
      id: 'ff2-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgCafe, who: 'pip', teacher: 'Jump or sit?',
      rounds: [
        { line: 'I like eating! Jump!', emoji: '\u{1F44D}' },
        { line: 'I don’t like washing up! Sit down!', emoji: '\u{1F44E}' },
        { line: 'I like baking! Jump!', emoji: '\u{1F44D}' },
      ],
    },
  },
  goodbyeSong('ff2-goodbye-song', bgCafe),
  { id: 'ff2-finale', kind: 'finale', bg: cillaPage(5), who: 'pip', line: 'You can say what you like doing! Next time: where is the cheese? \u{1F9C0}' },
];

/* =============================================================================
 * A1 Unit 4 Lesson 3: "Listen: Do You Like…?" (song)
 * Objective: I can understand "Do you like…?" and answer "Yes, I do / No, I don't", and say who likes what.
 * Story frame: Pico under the festival table — a listening detective lesson (new plot shape: who likes what?).
 * Practice ladder: Present (the question and both answers) → Guided (Tick or Cross, Listen & Tap) → song → Free (Hot
 *   Plate: answer about yourself; Musical Plates; Whisper Tube) → Reading (Reader p6-7, Yes or no?) → Phonics sn →
 *   check (Tick or Cross 4 of 5; answers 3 questions about themselves).
 * ========================================================================= */

export const LESSON_A1U4L3_TITLE = 'Listen: Do You Like…?';
export const LESSON_A1U4L3_OBJECTIVE = 'I can understand "Do you like…?" and answer "Yes, I do / No, I don\'t", and say who likes what.';

const SONG_A1U4L3 = `${F}/audio/do-you-like-song-a1u4l3.mp3?v=1`;
const SONG_A1U4L3_LYRICS: { who: CharKey; text: string }[] = [
  { who: 'cilla', text: 'Do you like it? Yes, I do!' },
  { who: 'cilla', text: 'Pizza, pizza, me and you!' },
  { who: 'pip', text: 'Do you like soup? Yes, I do!' },
  { who: 'pip', text: 'Soup for me and soup for you!' },
  { who: 'cilla', text: 'Do you like it? Yes, I do!' },
  { who: 'cilla', text: 'Pizza, pizza, me and you!' },
  { who: 'mia', text: 'Do you like rice? Yes, I do!' },
  { who: 'mia', text: 'Rice for me and rice for you!' },
  { who: 'leo', text: 'Do you like snails? No, I don’t!' },
  { who: 'leo', text: 'Snails for lunch? Oh no, no, no!' },
  { who: 'cilla', text: 'Do you like it? Yes, I do!' },
  { who: 'cilla', text: 'Pizza, pizza, me and you!' },
];
/** Take 1 (docs/songs/a1u4l3-food-do-you-like-scores.txt, best score 0.97, every line heard): line starts 8.3 / 10.8 /
 *  16.8 / 19.5 / 25.4 / 28.0 / 33.9 / 36.6 / 42.5 / 45.0 / 51.0 / 53.3 s, end 55.8 s. */
const SONG_A1U4L3_MS = [10840, 6000, 2640, 5880, 2600, 5980, 2620, 5960, 2480, 6040, 2280, 2530];

export const LESSON_A1U4L3_SCENES: Scene[] = [
  { id: 'ff3-title', kind: 'title-card', bg: cillaPage(6), level: 'A1', unit: 'Unit 4', lessonLabel: 'Lesson 3', title: 'Do You Like…?', subtitle: 'Yes, I do! No, I don’t! Listen well!', cta: '\u{1F3B5} LET’S GO!' },
  {
    id: 'ff3-recall-warmup', kind: 'recall-warmup', bg: bgCafe, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 4 · Lesson 2 · I Like Cooking!',
    teacher: 'Guided: listen — which one is it? Click it, then say if YOU like it: I like … / I don’t like … .',
    items: [
      { word: 'cooking', say: 'I like cooking!', img: DOING.cooking.img },
      { word: 'washing up', say: 'I don’t like washing up!', img: DOING.washing.img },
      { word: 'baking', say: 'I like baking!', img: DOING.baking.img },
    ],
  },
  { id: 'ff3-meet-question', kind: 'meet', focus: ['Do you like'], bg: cillaPage(9), who: 'pip', cardSide: 'left', teacher: 'Present: the question! Pip asks Pico. Voice up at the end.', line: 'Do you like pizza, Pico?', repeat: 'Do you like pizza?' },
  { id: 'ff3-meet-yes', kind: 'meet', focus: ['Yes'], bg: cillaPage(9), who: 'pico', cardSide: 'right', teacher: 'Present: the happy answer — nod and say it with Pico.', line: 'Yes, I do! I like pizza!', repeat: 'Yes, I do!' },
  { id: 'ff3-meet-no', kind: 'meet', focus: ['No'], bg: cillaPage(7), who: 'pico', cardSide: 'right', teacher: 'Present: the other answer — shake your head, kindly: No, I don’t.', line: 'No, I don’t. I don’t like grapes.', repeat: 'No, I don’t.' },
  { id: 'ff3-echo', kind: 'echo', bg: bgCafe, who: 'pip', textSide: 'top', teacher: 'Guided: ask like Pip, answer like Pico!', word: 'Do you like soup? Yes, I do!' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'ff3-like-match', kind: 'picture-match', look: 'chalk', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its picture (or taps it, then the picture), then reads it aloud.',
    items: [
      { word: 'I like pizza.', img: FOOD.pizza.img },
      { word: 'I don’t like grapes.', img: FOOD.grapes.img },
      { word: 'I like soup.', img: FOOD.soup.img },
      { word: 'I don’t like cheese.', img: FOOD.cheese.img },
    ],
    bg: bgCafe,
  },
  {
    id: 'ff3-tick-cross', kind: 'prea1', teacher: 'Guided: Tick or Cross! Listen: does the friend like it? Tick or cross. (Pass: 4 of 5.)',
    scene: {
      id: 'ff3-tick-cross', kind: 'tick-cross', bg: bgCafe, who: 'pip', teacher: 'Read and look. Yes or no?',
      rounds: [
        { img: FOOD.pizza.img, sentence: 'Pico likes pizza.', isTrue: true },
        { img: FOOD.grapes.img, sentence: 'Pico likes grapes.', isTrue: false },
        { img: DOING.cooking.img, sentence: 'Cilla likes cooking.', isTrue: true },
        { img: DOING.washing.img, sentence: 'Leo likes washing up.', isTrue: false },
        { img: FOOD.bread.img, sentence: 'Pico likes bread.', isTrue: false },
      ],
    },
  },
  {
    id: 'ff3-song', kind: 'song', bg: bgMarket, title: '\u{1F3B5} Do You Like…? \u{1F3B5}',
    teacher: 'The lesson song: thumbs up on “Yes, I do!”, shake your head on “No, I don’t!”. The student already knows the question and both answers.',
    durationSeconds: 56, bigWord: 'Yes, I do!', songUrl: SONG_A1U4L3, lineDurationsMs: SONG_A1U4L3_MS, lyrics: SONG_A1U4L3_LYRICS,
  },
  {
    id: 'ff3-listen-tap', kind: 'listen-tap', bg: cillaPage(1), teacher: 'Guided: listen to the friend — who is it? Tap them, then say: Mia likes soup!',
    targets: [
      { label: 'Pip', left: '24%', top: '52%', color: '#FE6A2F' },
      { label: 'Leo', left: '40%', top: '52%', color: '#C97A2F' },
      { label: 'Mia', left: '61%', top: '55%', color: '#B85CD1' },
      { label: 'Biscuit', left: '78%', top: '64%', color: '#8B5A2B' },
    ],
    rounds: [
      { prompt: 'I like soup. I don’t like salad. Who am I? I’m a mouse!', answerLabel: 'Mia', who: 'mia' },
      { prompt: 'I like eating! I don’t like washing up! I’m a lion!', answerLabel: 'Leo', who: 'leo' },
      { prompt: 'Woof! I like cookies! I’m a puppy!', answerLabel: 'Biscuit', who: 'pip' },
      { prompt: 'I like pizza and chips! I’m a fox!', answerLabel: 'Pip', who: 'pip' },
    ],
  },
  {
    id: 'ff3-echo-cave', kind: 'echo-cave', bg: bgMarket, who: 'cilla', title: 'Festival Echo: who likes it?',
    teacher: 'Game: a friend calls from a stall — left, middle or right (speakers or headphones help). The student taps where the voice came from and says it: Mia likes soup!',
    rounds: [
      { voice: 'mia', img: wtSpr('mia'), at: 0, line: 'I like soup! Do you like soup?', reply: 'Mia likes soup!' },
      { voice: 'leo', img: wtSpr('leo'), at: 2, line: 'I like chips! Yum!', reply: 'Leo likes chips!' },
      { voice: 'pico', img: PICO, at: 1, line: 'I like cheese! Yes, I do!', reply: 'Pico likes cheese!' },
      { voice: 'cilla', img: CILLA, at: 2, line: 'I like cooking for my friends!', reply: 'Cilla likes cooking!' },
    ],
    doneLine: 'You found every voice!',
  },
  {
    id: 'ff3-hot-plate', kind: 'hot-coconut', bg: bgMarket, who: 'cilla', coconutImg: item('plate'), title: 'Hot Plate! Pass it — then answer!',
    teacher: 'Free: tap Pass! — where the plate stops, answer the question. On the student’s seat they answer about THEMSELVES (both answers are fine if true).',
    seats: [
      { name: 'You', img: '' },
      { name: 'Cilla', img: CILLA },
      { name: 'Pico', img: PICO },
      { name: 'Leo', img: wtSpr('leo') },
      { name: 'Mia', img: wtSpr('mia') },
    ],
    rounds: [
      { ask: 'Do you like soup?', choices: ['Yes, I do.', 'No, I don’t.'], answer: 0, stop: 0 },
      { ask: 'Pico, do you like pizza?', choices: ['Yes, I do!', 'No, I don’t.'], answer: 0, stop: 2 },
      { ask: 'Leo, do you like washing up?', choices: ['Yes, I do.', 'No, I don’t.'], answer: 1, stop: 3 },
      { ask: 'Do you like grapes?', choices: ['Yes, I do.', 'No, I don’t.'], answer: 0, stop: 0 },
      { ask: 'Cilla, do you like cooking?', choices: ['Yes, I do!', 'No, I don’t.'], answer: 0, stop: 1 },
    ],
    doneLine: 'Great passing — great answers!',
  },
  {
    id: 'ff3-move-break', kind: 'prea1', teacher: 'Brain break: Yes, I do — jump! No, I don’t — freeze!',
    scene: {
      id: 'ff3-move-break', kind: 'tpr-actions', mode: 'break', bg: bgMarket, who: 'pip', teacher: 'Jump or freeze?',
      rounds: [
        { line: 'Do you like pizza? Yes, I do! Jump!', emoji: '\u{1F355}' },
        { line: 'Do you like snails? No, I don’t! Freeze!', emoji: '\u{1F40C}' },
        { line: 'Do you like cake? Yes, I do! Jump!', emoji: '\u{1F370}' },
      ],
    },
  },
  {
    id: 'ff3-musical-plates', kind: 'musical-islands', bg: '/lep1/scenes/bg-game-pond-wide.png', who: 'cilla', music: SONG_A1U4L3, title: 'Musical Plates: who likes it?',
    teacher: 'Game: press the music — the friends hop between the four plates. When it stops, listen to the question about a plate and answer: Leo! Leo likes soup.',
    players: [{ label: 'Leo', img: wtSpr('leo') }, { label: 'Mia', img: wtSpr('mia') }, { label: 'Pico', img: PICO }, { label: 'Biscuit', img: BISCUIT }],
    rounds: [
      { at: [0, 1, 2, 3], pad: 0, ask: 'Who is on the red plate? He likes soup!', say: 'Leo! Leo likes soup.' },
      { at: [3, 2, 1, 0], pad: 1, ask: 'Who is on the blue plate? He likes pizza!', say: 'Pico! Pico likes pizza.' },
      { at: [2, 3, 0, 1], pad: 3, ask: 'Who is on the green plate? She likes rice!', say: 'Mia! Mia likes rice.' },
      { at: [1, 0, 3, 2], pad: 2, ask: 'Who is on the yellow plate? He likes cookies!', say: 'Biscuit! Biscuit likes cookies.' },
    ],
    doneLine: 'Great listening!',
  },
  {
    id: 'ff3-whisper', kind: 'whisper-tube', bg: bgMarket, who: 'cilla', title: 'Festival Whispers: one word is wrong!',
    teacher: 'Listening game: a friend whispers down the tube; the other friend gets ONE word wrong. The student taps the wrong word, picks the right one and says the whole sentence.',
    rounds: [
      { from: 'pip', to: 'mia', fromImg: wtSpr('pip'), toImg: wtSpr('mia'), said: 'Do you like soup?', heard: 'Do you like soap?', choices: ['rope'] },
      { from: 'mia', to: 'leo', fromImg: wtSpr('mia'), toImg: wtSpr('leo'), said: 'I have rice for lunch.', heard: 'I have mice for lunch.', choices: ['dice'] },
      { from: 'leo', to: 'pico', fromImg: wtSpr('leo'), toImg: PICO, said: 'Yes, I do!', heard: 'Yes, I two!', choices: ['shoe'] },
      { from: 'pico', to: 'pip', fromImg: PICO, toImg: wtSpr('pip'), said: 'I like cheese.', heard: 'I like keys.', choices: ['peas'] },
    ],
    doneLine: 'No more mix-ups! Super ears!',
  },
  {
    id: 'ff3-glider', kind: 'glider', bg: bgMarket, who: 'pip', pilot: PICO, title: 'Pico’s Glider: yes or no?',
    teacher: 'Game: listen to the question and Pico’s face — tap the cloud with the right answer. Pico flies into it. The student says the answer too.',
    rounds: [
      { ask: 'Do you like cheese, Pico? (He smiles!)', choices: [{ label: 'Yes, I do!' }, { label: 'No, I don’t.' }], answer: 0, say: 'Yes, I do! I like cheese!' },
      { ask: 'Do you like grapes, Pico? (He shakes his head.)', choices: [{ label: 'Yes, I do!' }, { label: 'No, I don’t.' }], answer: 1, say: 'No, I don’t.' },
      { ask: 'Do you like pizza, Pico? (He jumps up!)', choices: [{ label: 'No, I don’t.' }, { label: 'Yes, I do!' }], answer: 1, say: 'Yes, I do! I like pizza!' },
      { ask: 'Do you like washing up, Pico? (He hides!)', choices: [{ label: 'No, I don’t.' }, { label: 'Yes, I do!' }], answer: 0, say: 'No, I don’t!' },
    ],
    doneLine: 'Great flying, Pico!',
  },
  /* Reading: Chef Cilla's Recipe, pages 6-7 */
  {
    id: 'ff3-reader', kind: 'reader', bg: cillaPage(6), title: 'Chef Cilla’s Recipe', doneLine: 'Pico doesn’t like grapes! What does he like? Find out next time!',
    teacher: 'Reading: a quick re-read of pages 4-5, then the new pages 6-7 (listen first). Tap any word to hear it.',
    pages: CILLA_RECIPE.slice(3, 7),
  },
  {
    id: 'ff3-read-check', kind: 'true-false', bg: bgMarket, img: cillaPage(7), read: true,
    teacher: 'Reading: look at the picture. Read: yes or no? The student says the right sentence after every “no”.',
    rounds: [
      { who: 'cilla', statement: 'Pico has the cheese.', isTrue: true },
      { who: 'cilla', statement: 'Leo has some grapes.', isTrue: true },
      { who: 'cilla', statement: 'Pico likes grapes.', isTrue: false },
      { who: 'cilla', statement: 'Pico is a puppy.', isTrue: false },
      { who: 'cilla', statement: 'Pico says: No, thank you.', isTrue: true },
    ],
  },
  /* Phonics: sn → Brick Crush → Blend & Read → tongue twister */
  {
    id: 'ff3-sound-sn', kind: 'sound-model', bg: bgMarket, who: 'pip', letter: 'SN', phoneme: '/sn/', sound: 'sn', soundSide: 'center',
    teacher: 'Present: s and n together — sss, nnn, fast: sn! Snake, snow, snack.',
    anchors: [
      { word: 'snake', emoji: '\u{1F40D}', img: item('snake') },
      { word: 'snow', emoji: '\u{2744}\u{FE0F}', img: item('snow') },
      { word: 'snack', emoji: '\u{1F36A}', img: item('cookie') },
    ],
  },
  {
    id: 'ff3-brick-sn', kind: 'prea1', teacher: 'Reading: Brick Crush! Listen to the blend, then smash every brick with it — sn, st or sp.',
    scene: { id: 'ff3-brick-sn', kind: 'brick-crush', bg: bgMarket, teacher: 'Listen to the blend, then tap every brick with it.', who: 'pip', letters: ['SN', 'ST', 'SP'], rows: 4, cols: 6, goal: 12, seconds: 60 },
  },
  {
    id: 'ff3-blend', kind: 'sound-blend', bg: bgMarket, look: 'gumball',
    teacher: 'Reading: say each sound (s, n — blend them fast), blend, find the picture — then read the sentence.',
    rounds: [
      { word: 'snack', sounds: ['s', 'n', 'a', 'ck'], img: item('cookie'), sentence: 'A snack for Pico.' },
      { word: 'sniff', sounds: ['s', 'n', 'i', 'f'], img: BISCUIT, sentence: 'Biscuit can sniff.' },
      { word: 'swim', img: item('fish-swim'), sentence: 'The fish can swim.' },
    ],
  },
  { id: 'ff3-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgMarket, who: 'pip', focus: 'sn', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, then faster.', line: 'Snails snack on snacks.' },
  /* Free: about me */
  {
    id: 'ff3-ask-me', kind: 'join-stage', bg: cillaPage(9), teacher: 'Free (evidence): Pico asks the student 3 questions; the student answers truthfully with Yes, I do / No, I don’t + a sentence.', cast: ['pico'],
    turns: [
      { who: 'pico', line: 'Do you like cheese?' },
      { who: 'student', line: 'Yes, I do. / No, I don’t.' },
      { who: 'pico', line: 'Do you like pizza?' },
      { who: 'student', line: 'Yes, I do! I like pizza! / No, I don’t.' },
      { who: 'pico', line: 'Do you like snails?' },
      { who: 'student', line: 'No, I don’t! Do you like grapes, Pico?' },
      { who: 'pico', line: 'No, I don’t!' },
    ],
  },
  {
    id: 'ff3-ask-pip', kind: 'join-stage', bg: bgCafe, teacher: 'Free: now the student asks Pip two questions.', cast: ['pip'],
    turns: [
      { who: 'student', line: 'Do you like … , Pip?' },
      { who: 'pip', line: 'Yes, I do!' },
      { who: 'student', line: 'Do you like … ?' },
      { who: 'pip', line: 'No, I don’t. I like chips!' },
    ],
  },
  { id: 'ff3-i-can', kind: 'meet', focus: ['Do you like'], bg: cillaPage(9), who: 'pip', cardSide: 'left', teacher: 'Check: Tick or Cross 4 of 5, and 3 questions answered about themselves — then the passport stamp!', line: 'I can ask and answer: Do you like…?', repeat: 'Yes, I do! No, I don’t.' },
  {
    id: 'ff3-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Pico sticker in their Sticker Book.',
    scene: {
      id: 'ff3-sticker', kind: 'sticker-reward', bg: bgMarket, who: 'pip', teacher: 'Sticker time!',
      line: 'Super listening! Here is your Pico sticker.',
      sticker: { img: PICO, label: 'Listening detective' },
    },
  },
  petPal('ff3-pet-pal', 2, 'Do I like cheese? Yes, I do! I want some cheese!', [{ label: 'grapes', img: FOOD.grapes.img }, { label: 'cheese', img: FOOD.cheese.img }, { label: 'bread', img: FOOD.bread.img }], 1, 'Cheese! Yes, I do like cheese!'),
  {
    id: 'ff3-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ff3-home-mission', kind: 'home-mission', bg: bgMarket, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child sang "Do You Like…?" and learned to answer "Yes, I do / No, I don\'t". Let them ask you about three foods.',
      steps: [
        { emoji: '\u{1F3B5}', say: 'Sing the Do You Like song.' },
        { emoji: '\u{2753}', say: 'Ask your family: Do you like soup?' },
        { emoji: '\u{1F44D}', say: 'Answer: Yes, I do! / No, I don’t.' },
      ],
    },
  },
  {
    id: 'ff3-move-break-2', kind: 'prea1', teacher: 'Brain break: sing and move — thumbs up, thumbs down!',
    scene: {
      id: 'ff3-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgMarket, who: 'pip', teacher: 'Thumbs up or down!',
      rounds: [
        { line: 'Do you like cake? Thumbs up!', emoji: '\u{1F44D}' },
        { line: 'Do you like snails? Thumbs down!', emoji: '\u{1F44E}' },
        { line: 'Do you like dancing? Dance!', emoji: '\u{1F483}' },
      ],
    },
  },
  goodbyeSong('ff3-goodbye-song', bgMarket),
  { id: 'ff3-finale', kind: 'finale', bg: cillaPage(7), who: 'pip', line: 'Yes, you do! You can ask and answer! Next time: what does Pico like? \u{1F42D}' },
];

/* =============================================================================
 * A1 Unit 4 Lesson 4: "I Like / I Don't Like! (interview + offer)"
 * Objective: I can interview a friend and offer food: "Do you like soup?" "Would you like some grapes?" "Let's make a pizza!"
 * Story frame: the festival reporter with a clipboard, then cooking with Cilla (new plot shape: a survey).
 * Practice ladder: Present (Would you like some…? / Yes, please / No, thank you / Let's…!) → Guided (Food Bingo, Build a
 *   Pizza) → Free (Food Survey ★: the child asks, then reports He / She likes…) → Reading (Reader p8-9, Sentence Build,
 *   Sentence Dominoes) → Phonics fr → check.
 * ========================================================================= */

export const LESSON_A1U4L4_TITLE = 'I Like / I Don’t Like!';
export const LESSON_A1U4L4_OBJECTIVE = 'I can interview a friend and offer food: "Do you like soup?" "Would you like some grapes?" "Let\'s make a pizza!"';

export const LESSON_A1U4L4_SCENES: Scene[] = [
  { id: 'ff4-title', kind: 'title-card', bg: bgMarket, level: 'A1', unit: 'Unit 4', lessonLabel: 'Lesson 4', title: 'I Like / I Don’t Like!', subtitle: 'Ask your friends — and offer some food!', cta: '\u{1F4CB} LET’S GO!' },
  {
    id: 'ff4-recall-warmup', kind: 'recall-warmup', bg: bgCafe, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 4 · Lesson 3 · Do You Like…?',
    teacher: 'Guided: listen — which food? Click it, then answer about YOU: Yes, I do! / No, I don’t.',
    items: [
      { word: 'pizza', say: 'Do you like pizza?', img: FOOD.pizza.img },
      { word: 'cheese', say: 'Do you like cheese?', img: FOOD.cheese.img },
      { word: 'grapes', say: 'Do you like grapes?', img: FOOD.grapes.img },
    ],
  },
  { id: 'ff4-meet-offer', kind: 'meet', focus: ['some'], bg: cillaPage(7), who: 'leo', cardSide: 'left', teacher: 'Present: offering politely — hold out your hand with the food: Would you like some grapes?', line: 'Would you like some grapes?', repeat: 'Would you like some grapes?' },
  {
    id: 'ff4-answers', kind: 'prea1', teacher: 'Present: the two polite answers — nod for “Yes, please!”, smile and shake your head for “No, thank you.”',
    scene: {
      id: 'ff4-answers', kind: 'listen-repeat-cards', bg: bgCafe, teacher: 'Listen and say it!',
      cards: [
        { who: 'mia', sentence: 'Would you like some juice? Yes, please!', img: FOOD.juice.img, imgLabel: 'Yes, please!' },
        { who: 'mia', sentence: 'Would you like some bread? No, thank you.', img: FOOD.bread.img, imgLabel: 'No, thank you.' },
        { who: 'pip', sentence: 'Let’s make a pizza!', img: item('pizza'), imgLabel: 'Let’s…!' },
      ],
    },
  },
  { id: 'ff4-meet-lets', kind: 'meet', focus: ['Let’s'], bg: cillaPage(3), who: 'cilla', cardSide: 'right', teacher: 'Present: Let’s… = we do it together! Hands together, then say it.', line: 'Let’s make a big pizza together!', repeat: 'Let’s make a pizza!' },
  { id: 'ff4-echo', kind: 'echo', bg: bgCafe, who: 'mia', textSide: 'top', teacher: 'Guided: offer and answer like Mia — kind voice!', word: 'Would you like some soup? Yes, please!' },
  { id: 'ff4-echo-2', kind: 'echo', bg: cillaPage(10), who: 'pico', textSide: 'top', teacher: 'Guided: answer like Pico — a big happy “Yes, please!”', word: 'Yes, please! Thank you!' },
  {
    id: 'ff4-offers', kind: 'prea1', teacher: 'Present: more offers — listen, then say each one holding out your hand.',
    scene: {
      id: 'ff4-offers', kind: 'listen-repeat-cards', bg: bgMarket, teacher: 'Listen and say it!',
      cards: [
        { who: 'mia', sentence: 'Would you like some rice?', img: FOOD.rice.img, imgLabel: 'rice' },
        { who: 'mia', sentence: 'Would you like some salad?', img: FOOD.salad.img, imgLabel: 'salad' },
        { who: 'mia', sentence: 'Would you like some cheese?', img: FOOD.cheese.img, imgLabel: 'cheese' },
      ],
    },
  },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'ff4-offer-match', kind: 'picture-match', look: 'cards', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its picture (or taps it, then the picture), then reads it aloud.',
    items: [
      { word: 'Would you like some juice?', img: FOOD.juice.img },
      { word: 'Would you like some bread?', img: FOOD.bread.img },
      { word: 'Would you like some rice?', img: FOOD.rice.img },
      { word: 'Would you like some salad?', img: FOOD.salad.img },
    ],
    bg: bgMarket,
  },
  {
    id: 'ff4-bingo', kind: 'sticker-bingo', bg: bgMarket, who: 'pip', title: 'Food Bingo! Listen and stamp!',
    teacher: 'Guided: Pip says who likes what — the student stamps the food, then says the sentence too. Three in a row: Bingo!',
    cells: [
      { label: 'soup', img: FOOD.soup.img, say: 'Mia likes soup.' },
      { label: 'pizza', img: FOOD.pizza.img, say: 'Pico likes pizza.' },
      { label: 'rice', img: FOOD.rice.img, say: 'Leo likes rice.' },
      { label: 'salad', img: FOOD.salad.img, say: 'Cilla likes salad.' },
      { label: 'cheese', img: FOOD.cheese.img, say: 'Pico likes cheese.' },
      { label: 'chips', img: FOOD.chips.img, say: 'Pip likes chips.' },
      { label: 'pasta', img: FOOD.pasta.img, say: 'Bella likes pasta.' },
      { label: 'grapes', img: FOOD.grapes.img, say: 'Willow likes grapes.' },
      { label: 'sandwich', img: FOOD.sandwich.img, say: 'Biscuit likes sandwiches.' },
    ],
    calls: [4, 1, 7, 0, 2, 6, 5, 3, 8],
    doneLine: 'Bingo! You know who likes what!',
  },
  /* ★ Signature: Food Survey */
  {
    id: 'ff4-survey', kind: 'food-survey', bg: bgMarket, who: 'cilla', title: 'Festival Food Survey',
    teacher: 'Free (evidence): the student is the festival reporter. They tap a box, SAY the question (Do you like soup, Mia?) and tap 🎤 — the friend answers. Then they read the chart and report: Mia likes soup. Leo doesn’t like salad.',
    friends: [
      { name: 'Mia', who: 'mia', img: wtSpr('mia') },
      { name: 'Leo', who: 'leo', img: wtSpr('leo') },
      { name: 'Pico', who: 'pico', img: PICO },
    ],
    foods: [FOOD.soup, FOOD.salad, FOOD.pizza],
    answers: [[true, true, false], [true, false, true], [false, false, true]],
    reports: [{ friend: 0, food: 0 }, { friend: 1, food: 1 }, { friend: 2, food: 2 }, { friend: 0, food: 2 }],
    doneLine: 'Great reporting! You asked everyone!',
  },
  {
    id: 'ff4-move-break', kind: 'prea1', teacher: 'Brain break: Yes, please — clap! No, thank you — wave!',
    scene: {
      id: 'ff4-move-break', kind: 'tpr-actions', mode: 'break', bg: bgMarket, who: 'pip', teacher: 'Clap or wave?',
      rounds: [
        { line: 'Would you like some cake? Yes, please! Clap!', emoji: '\u{1F370}' },
        { line: 'Would you like some snails? No, thank you! Wave!', emoji: '\u{1F40C}' },
        { line: 'Let’s dance! Spin around!', emoji: '\u{1F483}' },
      ],
    },
  },
  {
    id: 'ff4-build-pizza', kind: 'build-dish', bg: bgCafe, who: 'cilla', title: 'Build a Pizza for Pico!',
    teacher: 'Reading: read each recipe step (🔊 only to help), then tap the topping it names. At the end Pico tastes the pizza!',
    toppings: [FOOD.cheese, { label: 'ham', img: item('ham') }, { label: 'carrots', img: item('carrot') }, { label: 'eggs', img: FOOD.eggs.img }],
    steps: [
      { text: 'Put some cheese on the pizza.', topping: 0 },
      { text: 'Put some ham on the pizza.', topping: 1 },
      { text: 'Now some carrots!', topping: 2 },
      { text: 'And more cheese, please!', topping: 0 },
    ],
    eater: { who: 'pico', img: PICO, line: 'Yum! I like pizza! Thank you!' },
    doneLine: 'A super pizza! Pico likes it!',
  },
  {
    id: 'ff4-tic-tac-toe', kind: 'tic-tac-toe', bg: bgMarket, who: 'pico', opponentImg: PICO, title: 'Festival Tic-Tac-Toe!',
    teacher: 'Game: the student answers to claim a square — then Pico takes one. Three in a row wins!',
    squares: [
      { ask: 'Would you like some soup?', choices: ['Yes, please!', 'Yes, I do!', 'I like soup is.'], answer: 0, img: FOOD.soup.img },
      { ask: 'Do you like cheese?', choices: ['No, thank you.', 'Yes, I do!', 'Some cheese.'], answer: 1 },
      { ask: 'Let’s make a pizza!', choices: ['Yes! Let’s!', 'No, I don’t.', 'Pizza is.'], answer: 0 },
      { ask: 'Would you like some bread?', choices: ['No, I don’t.', 'Bread, no.', 'No, thank you.'], answer: 2, img: FOOD.bread.img },
      { ask: 'Does Mia like soup?', choices: ['Yes, she does.', 'Yes, she do.', 'Yes, please.'], answer: 0 },
      { ask: 'What do you have for lunch?', choices: ['I have soup.', 'I like lunch.', 'Yes, I do.'], answer: 0 },
      { ask: 'Do you like snails?', choices: ['No, I don’t!', 'No, thank you!', 'Snails, please!'], answer: 0 },
      { ask: 'Leo likes …', choices: ['pizza.', 'please.', 'thank you.'], answer: 0, img: FOOD.pizza.img },
      { ask: 'Would you like some cake?', choices: ['Yes, please!', 'Yes, I do!', 'I am cake.'], answer: 0, img: FOOD.cake.img },
    ],
    doneLine: 'Three in a row! You win!',
  },
  /* Reading: Chef Cilla's Recipe, pages 8-9 */
  {
    id: 'ff4-reader', kind: 'reader', bg: cillaPage(8), title: 'Chef Cilla’s Recipe', doneLine: 'Pico likes pizza! Will he give back the cheese? Find out next time!',
    teacher: 'Reading: a quick re-read of pages 6-7, then the new pages 8-9 (listen first). Tap any word to hear it.',
    pages: CILLA_RECIPE.slice(5, 9),
  },
  {
    id: 'ff4-sentence-build', kind: 'sentence-build', bg: cillaPage(8), teacher: 'Reading: put the words of the story in order, then read the sentence.',
    rounds: [
      { words: ['Would', 'you', 'like', 'some', 'bread?'], img: cillaPage(8) },
      { words: ['No,', 'thank', 'you.'], img: cillaPage(8), extra: ['please.'] },
      { words: ['Do', 'you', 'like', 'pizza,', 'Pico?'], img: cillaPage(9) },
      { words: ['Yes,', 'I', 'do!'], img: cillaPage(9), extra: ['don’t!'] },
    ],
  },
  {
    id: 'ff4-dominoes', kind: 'dominoes', bg: bgMarket, who: 'pip', title: 'Food Dominoes!',
    teacher: 'Reading: look at the picture at the end of the chain — find the domino that offers it, read it aloud and play it.',
    start: { img: FOOD.grapes.img, label: 'grapes' },
    steps: [
      { text: 'Would you like some grapes?', img: FOOD.bread.img, label: 'bread' },
      { text: 'Would you like some bread?', img: FOOD.soup.img, label: 'soup' },
      { text: 'Would you like some soup?', img: FOOD.pizza.img, label: 'pizza' },
      { text: 'Would you like some pizza?', img: FOOD.cake.img, label: 'cake' },
      { text: 'Would you like some cake? Yes, please!', img: PICO, label: 'Pico' },
    ],
    doneLine: 'The chain is finished! Super offers!',
  },
  {
    id: 'ff4-splat', kind: 'word-splat', bg: bgCafe, who: 'pip', title: 'Word Splat: polite words!',
    teacher: 'Reading: Pip says a word — splat it and read it.',
    words: ['some', 'would', 'like', 'please', 'thank', 'you', 'let’s', 'do', 'don’t'],
    rounds: ['some', 'please', 'would', 'let’s', 'don’t', 'thank'],
    doneLine: 'Splat! Super reading!',
  },
  /* Phonics: fr → Treasure Chest → Blend & Read → tongue twister */
  {
    id: 'ff4-sound-fr', kind: 'sound-model', bg: bgCafe, who: 'pip', letter: 'FR', phoneme: '/fr/', sound: 'fr', soundSide: 'center',
    teacher: 'Present: f and r together — fff, r, fast: fr! Frog, friend, fruit.',
    anchors: [
      { word: 'frog', emoji: '\u{1F438}', img: item('frog') },
      { word: 'friend', emoji: '\u{1F42D}', img: wtSpr('mia') },
      { word: 'fruit', emoji: '\u{1F347}', img: FOOD.grapes.img },
    ],
  },
  {
    id: 'ff4-trophy', kind: 'prea1', teacher: 'Reading: Treasure Chest! Hear the blend, pick the letters that make it — fr, fl, gr, pl or br — and the chest opens.',
    scene: {
      id: 'ff4-trophy', kind: 'trophy-chest', bg: bgCafe, who: 'pip', teacher: 'Find this sound!',
      rounds: [
        { letter: 'fr', phoneme: '/fr/', word: 'frog', img: item('frog'), emoji: '\u{1F438}', choices: ['fr', 'fl', 'gr'] },
        { letter: 'fl', phoneme: '/fl/', word: 'flag', img: item('flag'), emoji: '\u{1F6A9}', choices: ['pl', 'fl', 'fr'] },
        { letter: 'gr', phoneme: '/gr/', word: 'grapes', img: FOOD.grapes.img, emoji: '\u{1F347}', choices: ['br', 'fr', 'gr'] },
        { letter: 'pl', phoneme: '/pl/', word: 'plate', img: item('plate'), emoji: '\u{1F37D}\u{FE0F}', choices: ['pl', 'gr', 'fl'] },
      ],
    },
  },
  {
    id: 'ff4-blend', kind: 'sound-blend', bg: bgCafe, look: 'frog',
    teacher: 'Reading: say each sound (f, r — blend them fast), blend, find the picture — then read the sentence.',
    rounds: [
      { word: 'frog', img: item('frog'), sentence: 'A frog at the festival!' },
      { word: 'flag', img: item('flag'), sentence: 'Look at the red flag.' },
      { word: 'drum', img: item('drum'), sentence: 'Bang the drum!' },
    ],
  },
  { id: 'ff4-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgCafe, who: 'pip', focus: 'fr', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, then faster.', line: 'Fred fries fresh fish.' },
  /* Free: interview + offer */
  {
    id: 'ff4-interview', kind: 'join-stage', bg: bgMarket, teacher: 'Free (evidence): the student interviews the teacher about 2 foods, then makes one offer.', cast: ['cilla'],
    turns: [
      { who: 'student', line: 'Do you like … ?' },
      { who: 'cilla', line: 'Yes, I do!' },
      { who: 'student', line: 'Do you like … ?' },
      { who: 'cilla', line: 'No, I don’t.' },
      { who: 'student', line: 'Would you like some … ?' },
      { who: 'cilla', line: 'Yes, please! Thank you!' },
    ],
  },
  {
    id: 'ff4-report', kind: 'join-stage', bg: bgMarket, teacher: 'Free: the student reports the survey to Pip in the third person.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'Tell me! What does Mia like?' },
      { who: 'student', line: 'Mia likes soup and salad.' },
      { who: 'pip', line: 'And Leo?' },
      { who: 'student', line: 'Leo likes pizza. He doesn’t like salad.' },
      { who: 'pip', line: 'Let’s make soup for Mia!' },
    ],
  },
  { id: 'ff4-i-can', kind: 'meet', focus: ['offer'], bg: cillaPage(10), who: 'cilla', cardSide: 'left', teacher: 'Check: the student asked 3 friends, reported 2 sentences and made an offer — then the passport stamp!', line: 'I can ask my friends and offer food!', repeat: 'Would you like some pizza?' },
  {
    id: 'ff4-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the reporter sticker in their Sticker Book.',
    scene: {
      id: 'ff4-sticker', kind: 'sticker-reward', bg: bgMarket, who: 'pip', teacher: 'Sticker time!',
      line: 'Super reporter! Here is your sticker.',
      sticker: { img: FOOD.pizza.img, label: 'Festival reporter' },
    },
  },
  petPal('ff4-pet-pal', 3, 'Would I like some pizza? Yes, please!', [{ label: 'pizza', img: FOOD.pizza.img }, { label: 'salad', img: FOOD.salad.img }, { label: 'robot', img: item('beep') }], 0, 'Pizza! Yes, please! Thank you!'),
  {
    id: 'ff4-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ff4-home-mission', kind: 'home-mission', bg: bgMarket, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child did a food survey ("Do you like soup?") and learned to offer food politely ("Would you like some grapes? Yes, please / No, thank you"). Let them interview the family and offer a snack.',
      steps: [
        { emoji: '\u{1F4CB}', say: 'Ask your family: Do you like … ?' },
        { emoji: '\u{2705}', say: 'Tick the answers on a chart.' },
        { emoji: '\u{1F34E}', say: 'Offer a snack: Would you like some … ?' },
      ],
    },
  },
  {
    id: 'ff4-move-break-2', kind: 'prea1', teacher: 'Brain break: let’s… move!',
    scene: {
      id: 'ff4-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgCafe, who: 'pip', teacher: 'Let’s go!',
      rounds: [
        { line: 'Let’s jump!', emoji: '\u{1F938}' },
        { line: 'Let’s stir the soup!', emoji: '\u{1F963}' },
        { line: 'Let’s sit down and eat!', emoji: '\u{1F37D}\u{FE0F}' },
      ],
    },
  },
  goodbyeSong('ff4-goodbye-song', bgCafe),
  { id: 'ff4-finale', kind: 'finale', bg: cillaPage(9), who: 'pip', line: 'You can ask your friends and offer food! Next time: the whole story! \u{1F4D6}' },
];

/* =============================================================================
 * A1 Unit 4 Lesson 5: "Storybook: Chef Cilla's Recipe"
 * Objective: I can read "Chef Cilla's Recipe" with help and say what Pico likes and what the friends offer him.
 * Story frame: the whole book, then the festival feast at night (lanterns; a calm reading lesson).
 * ========================================================================= */

export const LESSON_A1U4L5_TITLE = 'Storybook: Chef Cilla’s Recipe';
export const LESSON_A1U4L5_OBJECTIVE = 'I can read "Chef Cilla\'s Recipe" with help and say what Pico likes and what the friends offer him.';

export const LESSON_A1U4L5_SCENES: Scene[] = [
  { id: 'ff5-title', kind: 'title-card', bg: cillaPage(12), level: 'A1', unit: 'Unit 4', lessonLabel: 'Lesson 5', title: 'Storybook: Chef Cilla’s Recipe', subtitle: 'Where is the cheese? Let’s read the whole story!', cta: '\u{1F4D6} LET’S READ!' },
  {
    id: 'ff5-recall-warmup', kind: 'recall-warmup', bg: bgCafe, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 4 · Lesson 4 · Food Survey',
    teacher: 'Guided: listen — which food? Click it and answer: Yes, please! / No, thank you.',
    items: [
      { word: 'soup', say: 'Would you like some soup?', img: FOOD.soup.img },
      { word: 'pizza', say: 'Would you like some pizza?', img: FOOD.pizza.img },
      { word: 'bread', say: 'Would you like some bread?', img: FOOD.bread.img },
    ],
  },
  { id: 'ff5-predict', kind: 'meet', focus: ['cheese'], bg: cillaPage(4), who: 'cilla', cardSide: 'left', teacher: 'Predict: the cheese box is empty. Who has the cheese? What will the friends do? The student guesses — then we read.', line: 'Oh no! Where is the cheese? What do you think?', repeat: 'Where is the cheese?' },
  { id: 'ff5-echo', kind: 'echo', bg: cillaPage(4), who: 'cilla', textSide: 'top', teacher: 'Guided: say it like Cilla — a surprised voice!', word: 'Oh no! Where is the cheese?' },
  {
    id: 'ff5-book-1', kind: 'reader', bg: cillaPage(1), title: 'Chef Cilla’s Recipe', doneLine: 'Pico likes pizza! What can Cilla do?',
    teacher: 'Reading: part 1 — the student reads pages 1-9 (listen first only where needed). Tap any word to hear it.',
    pages: CILLA_RECIPE.slice(0, 9),
  },
  {
    id: 'ff5-pause', kind: 'choice', bg: cillaPage(9), who: 'cilla',
    teacher: 'The pause: the student chooses what to offer Pico — and SAYS the offer. A wrong pick: look at page 9 again (What does Pico like?).',
    prompt: 'Pico likes pizza. What can Cilla say?',
    options: [
      { label: 'Would you like some grapes?', emoji: '\u{1F347}' },
      { label: 'Would you like some pizza?', emoji: '\u{1F355}', correct: true },
      { label: 'Would you like some bread?', emoji: '\u{1F35E}' },
    ],
  },
  {
    id: 'ff5-book-2', kind: 'reader', bg: cillaPage(10), title: 'Chef Cilla’s Recipe', doneLine: 'The end! Pico gives back the cheese — and everyone eats pizza!',
    teacher: 'Reading: part 2 — the student reads pages 10-12, the happy end.',
    pages: CILLA_RECIPE.slice(9, 12),
  },
  { id: 'ff5-meet-pico', kind: 'meet', focus: ['please'], bg: cillaPage(10), who: 'pico', cardSide: 'right', teacher: 'Present: Pico’s happy answer — say it with him.', line: 'Yes, please! I like pizza!', repeat: 'Yes, please!' },
  { id: 'ff5-echo-thanks', kind: 'echo', bg: cillaPage(11), who: 'cilla', textSide: 'top', teacher: 'Guided: a happy voice — thank Pico!', word: 'Thank you, Pico!' },
  { id: 'ff5-echo-eat', kind: 'echo', bg: cillaPage(12), who: 'pip', textSide: 'top', teacher: 'Guided: the happy end — say it all together!', word: 'Let’s eat! We all like pizza!' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'ff5-story-match', kind: 'picture-match', look: 'frames', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its picture (or taps it, then the picture), then reads it aloud.',
    items: [
      { word: 'Where is the cheese?', img: cillaPage(4), crop: { x: 0, y: 0, w: 100, h: 100 }, imgAspect: 16 / 9 },
      { word: 'Yes, please! I like pizza!', img: cillaPage(10), crop: { x: 0, y: 0, w: 100, h: 100 }, imgAspect: 16 / 9 },
      { word: 'Thank you, Pico!', img: cillaPage(11), crop: { x: 0, y: 0, w: 100, h: 100 }, imgAspect: 16 / 9 },
    ],
    bg: bgMarket,
  },
  {
    id: 'ff5-radar', kind: 'hot-cold', bg: bgMarket, who: 'cilla', title: 'Treasure Radar: find the cheese!',
    teacher: 'Game: things are hidden at the festival. The student taps to search and listens — Cold! Warm! Hot! When it pops out, they say the sentence.',
    rounds: [
      { label: 'cheese', img: FOOD.cheese.img, x: 84, y: 80, find: 'Where is the cheese? Find it!', say: 'Here it is! The cheese!' },
      { label: 'Pico', img: PICO, x: 14, y: 76, find: 'Where is Pico? Find him!', say: 'Here he is! Pico the Mouse!' },
      { label: 'grapes', img: FOOD.grapes.img, x: 52, y: 62, find: 'Where are the grapes? Find them!', say: 'Here they are! Some grapes!' },
    ],
    doneLine: 'You found everything! Great detective!',
  },
  {
    id: 'ff5-story-order', kind: 'prea1', teacher: 'Guided: put the story pictures in order, then tell it: first, then, then, at the end!',
    scene: {
      id: 'ff5-story-order', kind: 'story-order', bg: cillaPage(12), who: 'pip',
      teacher: 'Put the pictures in order, then tell the story!',
      frames: [
        { img: cillaPage(3), caption: 'Let’s make a big pizza!' },
        { img: cillaPage(4), caption: 'Oh no! Where is the cheese?' },
        { img: cillaPage(6), caption: 'Pico has the cheese.' },
        { img: cillaPage(10), caption: 'Would you like some pizza? Yes, please!' },
        { img: cillaPage(12), caption: 'Let’s eat! We all like pizza!' },
      ],
    },
  },
  {
    id: 'ff5-story-gaps', kind: 'grammar-gap', bg: bgCafe, title: 'Read and Choose',
    teacher: 'Reading: read the sentence from the story and choose the missing word. Then read it all.',
    rounds: [
      { before: 'Hello! I am Chef Cilla. I like', after: '!', choices: ['cooking', 'washing up'], answer: 'cooking', img: cillaPage(2) },
      { before: 'Oh no! Where is the', after: '?', choices: ['cheese', 'pizza'], answer: 'cheese', img: cillaPage(4) },
      { before: 'Would you like some grapes, Pico? No,', after: 'you.', choices: ['thank', 'please'], answer: 'thank', img: cillaPage(7) },
      { before: 'Do you like pizza, Pico? Yes, I', after: '!', choices: ['do', 'don’t'], answer: 'do', img: cillaPage(9) },
      { before: 'Would you like some pizza? Yes,', after: '!', choices: ['please', 'thank you'], answer: 'please', img: cillaPage(10) },
    ],
  },
  {
    id: 'ff5-stones', kind: 'prea1', teacher: 'Guided: Story Stones! Listen to Pip and hop on the stone with the right picture from the story — then say the sentence.',
    scene: {
      id: 'ff5-stones', kind: 'stepping-stones', bg: bgMarket, stoneImg: item('stone'), who: 'pip', walker: 'pip',
      teacher: 'Listen! Hop on the right stone.',
      goal: { img: FOOD.pizza.img, label: 'pizza', line: 'Pip is over the river! Pizza time!' },
      rounds: [
        { line: 'Who has the cheese?', options: [{ label: 'Pico', img: PICO }, { label: 'Biscuit', img: BISCUIT }, { label: 'Cilla', img: CILLA }], answer: 0, reply: 'Pico has the cheese!' },
        { line: 'What does Leo offer?', options: [{ label: 'bread', img: FOOD.bread.img }, { label: 'grapes', img: FOOD.grapes.img }, { label: 'pizza', img: FOOD.pizza.img }], answer: 1, reply: 'Some grapes!' },
        { line: 'What does Pico like?', options: [{ label: 'pizza', img: FOOD.pizza.img }, { label: 'grapes', img: FOOD.grapes.img }, { label: 'bread', img: FOOD.bread.img }], answer: 0, reply: 'Pico likes pizza!' },
        { line: 'Who finds the crumbs?', options: [{ label: 'Mia', img: wtSpr('mia') }, { label: 'Biscuit', img: BISCUIT }, { label: 'Pip', img: wtSpr('pip') }], answer: 1, reply: 'Biscuit finds the crumbs!' },
      ],
    },
  },
  {
    id: 'ff5-flags', kind: 'flag-race', bg: cillaPage(12), who: 'cilla', title: 'Team Flags: story questions!',
    teacher: 'Free: turns change — on the student’s turn they answer; on the teacher’s turn the STUDENT reads the question aloud and the teacher answers. Every right answer moves a flag up the hill.',
    rounds: [
      { ask: 'What does Cilla want to make?', choices: ['A big pizza.', 'Some soup.', 'A cake.'], answer: 0 },
      { ask: 'Where is the cheese?', choices: ['Pico has it.', 'It’s in the box.', 'Biscuit has it.'], answer: 0 },
      { ask: 'What does Mia offer Pico?', choices: ['Some bread.', 'Some cake.', 'Some soup.'], answer: 0 },
      { ask: 'Does Pico like grapes?', choices: ['No, he doesn’t.', 'Yes, he does.', 'Yes, please.'], answer: 0 },
      { ask: 'What does Pico say to the pizza?', choices: ['Yes, please!', 'No, thank you.', 'No, I don’t.'], answer: 0 },
      { ask: 'What do they all like?', choices: ['Pizza!', 'Grapes!', 'Washing up!'], answer: 0 },
    ],
    doneLine: 'Flags up! Great story readers!',
  },
  {
    id: 'ff5-move-break', kind: 'prea1', teacher: 'Brain break: act the story!',
    scene: {
      id: 'ff5-move-break', kind: 'tpr-actions', mode: 'break', bg: cillaPage(5), who: 'pip', teacher: 'Act the story!',
      rounds: [
        { line: 'Sniff like Biscuit! Sniff, sniff!', emoji: '\u{1F436}' },
        { line: 'Hide like Pico! Shhh!', emoji: '\u{1F42D}' },
        { line: 'Eat pizza like everyone! Yum!', emoji: '\u{1F355}' },
      ],
    },
  },
  {
    id: 'ff5-quiz', kind: 'quiz-board', bg: cillaPage(12), who: 'cilla', title: 'Story Quiz Board!',
    teacher: 'Guided: the student picks any tile — harder questions are worth more. Answer, then say it aloud. One tile is a BOOM tile: double points!',
    categories: [
      { name: 'Who?', emoji: '\u{1F42D}', tiles: [{ ask: 'Who is the chef?', choices: ['Cilla.', 'Pico.'], answer: 0, img: cillaPage(2) }, { ask: 'Who has the cheese?', choices: ['Pico.', 'Biscuit.'], answer: 0, img: cillaPage(6) }, { ask: 'Who finds the crumbs?', choices: ['Biscuit.', 'Leo.'], answer: 0, img: cillaPage(5) }] },
      { name: 'Likes', emoji: '\u{1F44D}', tiles: [{ ask: 'Does Pico like grapes?', choices: ['No, he doesn’t.', 'Yes, he does.'], answer: 0 }, { ask: 'Does Pico like pizza?', choices: ['Yes, he does.', 'No, he doesn’t.'], answer: 0 }, { ask: 'What does Cilla like?', choices: ['Cooking.', 'Washing up.'], answer: 0 }] },
      { name: 'Offers', emoji: '\u{1F37D}\u{FE0F}', tiles: [{ ask: 'What does Leo offer?', choices: ['Some grapes.', 'Some soup.'], answer: 0, img: cillaPage(7) }, { ask: 'What does Mia offer?', choices: ['Some bread.', 'Some cake.'], answer: 0, img: cillaPage(8) }, { ask: 'What does Pico say to the pizza?', choices: ['Yes, please!', 'No, thank you.'], answer: 0, img: cillaPage(10) }] },
    ],
    boom: [2, 2],
    doneLine: 'The board is finished! Story champion!',
  },
  {
    id: 'ff5-act-out', kind: 'join-stage', bg: cillaPage(10), teacher: 'Free: act it out! The student is Cilla (or Leo), the teacher is Pico.', cast: ['pico', 'cilla'],
    turns: [
      { who: 'student', line: 'Would you like some grapes, Pico?' },
      { who: 'pico', line: 'No, thank you.' },
      { who: 'student', line: 'Do you like pizza?' },
      { who: 'pico', line: 'Yes, I do!' },
      { who: 'student', line: 'Would you like some pizza?' },
      { who: 'pico', line: 'Yes, please! Here is the cheese.' },
      { who: 'student', line: 'Thank you, Pico! Let’s eat!' },
    ],
  },
  /* Phonics review: Sound Pick → Picture Crossword → Blend & Read → twister */
  {
    id: 'ff5-sound-pick', kind: 'prea1', teacher: 'Reading: Sound Pick! Hear the blend, pick the picture that starts with it — gr, pl, sn or fr.',
    scene: {
      id: 'ff5-sound-pick', kind: 'sound-pick', bg: bgCafe, who: 'pip', teacher: 'Which one starts with this sound?',
      rounds: [
        { sound: 'gr', options: [{ word: 'plum', img: item('plum') }, { word: 'grapes', img: FOOD.grapes.img }, { word: 'frog', img: item('frog') }], answer: 1 },
        { sound: 'pl', options: [{ word: 'plate', img: item('plate') }, { word: 'snake', img: item('snake') }, { word: 'bread', img: FOOD.bread.img }], answer: 0 },
        { sound: 'sn', options: [{ word: 'grandma', img: item('family-grandma') }, { word: 'flag', img: item('flag') }, { word: 'snow', img: item('snow') }], answer: 2 },
        { sound: 'fr', options: [{ word: 'frog', img: item('frog') }, { word: 'plane', img: item('plane') }, { word: 'snake', img: item('snake') }], answer: 0 },
      ],
    },
  },
  {
    id: 'ff5-crossword', kind: 'crossword', bg: bgCafe, who: 'cilla', title: 'Festival Crossword',
    teacher: 'Spelling game: tap a picture, then tap the letters to fill its squares. Crossing letters help! Say each word when it is done.',
    words: [
      { word: 'cheese', img: FOOD.cheese.img, say: 'Cheese! Pico has the cheese.' },
      { word: 'pizza', img: FOOD.pizza.img, say: 'Pizza! We all like pizza.' },
      { word: 'soup', img: FOOD.soup.img, say: 'Soup! I have soup for lunch.' },
      { word: 'rice', img: FOOD.rice.img, say: 'Rice! I have rice for dinner.' },
      { word: 'bread', img: FOOD.bread.img, say: 'Bread! Would you like some bread?' },
      { word: 'grapes', img: FOOD.grapes.img, say: 'Grapes! Would you like some grapes?' },
    ],
    doneLine: 'You did the whole crossword!',
  },
  {
    id: 'ff5-blend', kind: 'sound-blend', bg: bgMarket,
    teacher: 'Reading: the unit’s blends — blend, find the picture, then read the sentence.',
    rounds: [
      { word: 'grab', img: item('claw'), sentence: 'Pico can grab the cheese.' },
      { word: 'plum', img: item('plum'), sentence: 'Would you like a plum?' },
      { word: 'snack', sounds: ['s', 'n', 'a', 'ck'], img: item('cookie'), sentence: 'A snack for Biscuit.' },
      { word: 'frog', img: item('frog'), sentence: 'The frog likes flies.' },
    ],
  },
  { id: 'ff5-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: cillaPage(12), who: 'pip', focus: 'pl', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, then faster.', line: 'Please pass the pizza plate, Pico!' },
  /* Free: retell */
  {
    id: 'ff5-retell', kind: 'join-stage', bg: cillaPage(12), teacher: 'Free (evidence): the student retells the story in 3-4 sentences: what Pico liked, what the friends offered, the end.', cast: ['leo'],
    turns: [
      { who: 'leo', line: 'Tell me the story! Who had the cheese?' },
      { who: 'student', line: 'Pico had the cheese.' },
      { who: 'leo', line: 'What did we offer him?' },
      { who: 'student', line: 'Some grapes and some bread. No, thank you!' },
      { who: 'leo', line: 'And then?' },
      { who: 'student', line: 'Cilla said: Would you like some pizza? Yes, please!' },
    ],
  },
  { id: 'ff5-i-can', kind: 'meet', focus: ['story'], bg: cillaPage(11), who: 'cilla', cardSide: 'left', teacher: 'Check: the student read 4 pages alone and said what Pico liked — then the passport stamp!', line: 'I can read the story of Chef Cilla’s Recipe!', repeat: 'Would you like some pizza?' },
  {
    id: 'ff5-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the cheese sticker in their Sticker Book.',
    scene: {
      id: 'ff5-sticker', kind: 'sticker-reward', bg: cillaPage(12), who: 'pip', teacher: 'Sticker time!',
      line: 'Super reading! Here is your cheese sticker.',
      sticker: { img: FOOD.cheese.img, label: 'Cheese finder' },
    },
  },
  petPal('ff5-pet-pal', 4, 'It’s dinner time! Would I like some soup? Yes, please!', [{ label: 'soup', img: FOOD.soup.img }, { label: 'kite', img: item('kite') }, { label: 'pasta', img: FOOD.pasta.img }], 0, 'Soup! Yes, please! Slurp!'),
  {
    id: 'ff5-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ff5-home-mission', kind: 'home-mission', bg: bgMarket, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child read the whole story "Chef Cilla\'s Recipe". Ask them to read it to you and to tell you what Pico liked and what the friends offered him.',
      steps: [
        { emoji: '\u{1F4D6}', say: 'Read the story to your family.' },
        { emoji: '\u{1F42D}', say: 'Tell them: what does Pico like?' },
        { emoji: '\u{1F373}', say: 'Help cook something and name the food.' },
      ],
    },
  },
  {
    id: 'ff5-move-break-2', kind: 'prea1', teacher: 'Brain break: the festival dance!',
    scene: {
      id: 'ff5-move-break-2', kind: 'tpr-actions', mode: 'break', bg: cillaPage(12), who: 'pip', teacher: 'Festival dance!',
      rounds: [
        { line: 'Wave your hands like lanterns!', emoji: '\u{1F3EE}' },
        { line: 'Spin like a pizza!', emoji: '\u{1F355}' },
        { line: 'Bow to Chef Cilla!', emoji: '\u{1F469}\u{200D}\u{1F373}' },
      ],
    },
  },
  goodbyeSong('ff5-goodbye-song', cillaPage(12)),
  { id: 'ff5-finale', kind: 'finale', bg: cillaPage(12), who: 'pip', line: 'You read the whole story! Let’s eat! \u{1F355}' },
];

/* =============================================================================
 * A1 Unit 4 Lesson 6: "Festival Café" (extra practice)
 * Objective: I can order and offer food quickly and politely.
 * Story frame: the child works at Cilla's festival café (new plot shape: a job; new setting: the café counter at night).
 * All games new to the unit: Festival Café ★, Cookie Faces, Rapid Recall, Save the Balloon, Treasure Chests, Letter
 * Bubbles, Treasure Map (grid-hunt), Wobbly Tower; then Twister Race, Blend & Read and free talk with Pico.
 * ========================================================================= */

export const LESSON_A1U4L6_TITLE = 'Festival Café';
export const LESSON_A1U4L6_OBJECTIVE = 'I can order and offer food quickly and politely.';

// faces on story page 1 (Pip, Leo, Mia, Biscuit), centre % of the 16:9 picture
const P1 = cillaPage(1);
const COOKIE_FACES = [
  { label: 'Pip', name: 'Pip', img: P1, at: [23.5, 50] as [number, number], w: 15, aspect: 16 / 9 },
  { label: 'Leo', name: 'Leo', img: P1, at: [40.5, 47] as [number, number], w: 16, aspect: 16 / 9 },
  { label: 'Mia', name: 'Mia', img: P1, at: [61, 46] as [number, number], w: 14, aspect: 16 / 9 },
  { label: 'Biscuit', name: 'Biscuit', img: P1, at: [78.5, 60] as [number, number], w: 13, aspect: 16 / 9 },
];

export const LESSON_A1U4L6_SCENES: Scene[] = [
  { id: 'ff6-title', kind: 'title-card', bg: bgCafe, level: 'A1', unit: 'Unit 4', lessonLabel: 'Lesson 6', title: 'Festival Café', subtitle: 'Take the orders — and offer politely!', cta: '\u{2615} LET’S PLAY!' },
  {
    id: 'ff6-recall-warmup', kind: 'recall-warmup', bg: cillaPage(12), who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 4 · Lesson 5 · Chef Cilla’s Recipe',
    teacher: 'Guided: listen — who or what is it? Click it, then say a sentence from the story.',
    items: [
      { word: 'Pico', say: 'Pico has the cheese.', img: PICO },
      { word: 'Cilla', say: 'I am Chef Cilla. I like cooking!', img: CILLA },
      { word: 'pizza', say: 'Let’s eat! We all like pizza!', img: FOOD.pizza.img },
    ],
  },
  {
    id: 'ff6-intro', kind: 'cinematic', bg: bgCafe, title: 'The Festival Café', subtitle: 'You are the waiter tonight!', narrator: 'cilla',
    script: [
      { who: 'cilla', line: 'Welcome to my festival café!' },
      { who: 'cilla', line: 'Listen to the orders — and be polite!' },
      { who: 'pico', line: 'I’m hungry! Can I order first?' },
    ],
    cta: '\u{2615} OPEN!',
  },
  { id: 'ff6-echo', kind: 'echo', bg: bgCafe, who: 'cilla', textSide: 'top', teacher: 'Guided: the waiter’s question — friendly voice!', word: 'What would you like?' },
  {
    id: 'ff6-orders', kind: 'prea1', teacher: 'Present: the café words — listen and say each order like a customer.',
    scene: {
      id: 'ff6-orders', kind: 'listen-repeat-cards', bg: bgCafe, teacher: 'Listen and say it!',
      cards: [
        { who: 'leo', sentence: 'Some pizza, please!', img: FOOD.pizza.img, imgLabel: 'pizza' },
        { who: 'mia', sentence: 'Some soup and some juice, please.', img: FOOD.soup.img, imgLabel: 'soup' },
        { who: 'pip', sentence: 'Here you are!', img: item('plate'), imgLabel: 'Here you are!' },
      ],
    },
  },
  {
    id: 'ff6-gates', kind: 'answer-race', look: 'gates', bg: bgMarket, who: 'pip', racer: item('pip-run'),
    title: 'Catch the answer! Run through the right gate!',
    teacher: 'Guided: Pip asks — the student taps the gate with the right answer, then says it.',
    rounds: [
      { ask: 'What would you like?', choices: ['Some soup, please.', 'Yes, I do.', 'I like cooking.'], answer: 0 },
      { ask: 'Would you like some cake?', choices: ['No, I don’t.', 'Yes, please!', 'Cake is it.'], answer: 1 },
      { ask: 'Here you are!', choices: ['Thank you!', 'No, I don’t.', 'Let’s cook.'], answer: 0 },
      { ask: 'Do you like chips?', choices: ['Yes, please.', 'Chips, chips.', 'Yes, I do!'], answer: 2 },
    ],
    doneLine: 'You caught every answer!',
  },
  /* ★ Signature: Festival Café */
  {
    id: 'ff6-cafe', kind: 'festival-cafe', bg: bgCafe, who: 'cilla', title: 'Festival Café: take the order!',
    teacher: 'Free: the student is the waiter. Listen to the WHOLE order (watch for the twist!), tap the food onto the tray, tap Serve. Then say the offer aloud and tap “I said it”.',
    menu: [FOOD.soup, FOOD.salad, FOOD.sandwich, FOOD.pizza, FOOD.chips, FOOD.juice, FOOD.cake],
    rounds: [
      { customer: 'pico', customerImg: PICO, line: 'Some pizza, please!', order: [3], reply: 'Yum! Thank you!', offer: { line: 'Would you like some juice?', item: 5 } },
      { customer: 'mia', customerImg: wtSpr('mia'), line: 'Some soup and a sandwich, please — but no salad!', order: [0, 2], reply: 'Perfect! Thank you!' },
      { customer: 'leo', customerImg: wtSpr('leo'), line: 'Chips and pizza, please! I’m very hungry!', order: [3, 4], reply: 'Wow! Thank you!', offer: { line: 'Would you like some cake?', item: 6 } },
      { customer: 'bella', customerImg: wtSpr('bella'), line: 'Some salad, please. No cake today!', order: [1], reply: 'Lovely! Thank you!' },
      { customer: 'pip', customerImg: wtSpr('pip'), line: 'Juice and cake, please — and some soup!', order: [0, 5, 6], reply: 'Yummy! Thank you, waiter!' },
    ],
    doneLine: 'The café is closed! You are a super waiter!',
  },
  {
    id: 'ff6-cookies', kind: 'prea1', teacher: 'Guided: Festival Cookies! Listen to Cilla, pick the friend’s face for the cookie and watch it bake. Say who it is!',
    scene: {
      id: 'ff6-cookies', kind: 'cookie-faces', bg: bgCafe, who: 'pip',
      teacher: 'Listen, pick the face for the cookie, then say who it is!',
      faces: COOKIE_FACES,
      rounds: [
        { face: 1, line: 'Let’s make a Leo cookie!', reply: 'A Leo cookie! Leo likes eating!' },
        { face: 3, line: 'Now a Biscuit cookie, please!', reply: 'A Biscuit cookie! Woof!' },
        { face: 2, line: 'Let’s make a Mia cookie!', reply: 'A Mia cookie! Mia likes soup!' },
        { face: 0, line: 'And a Pip cookie, please!', reply: 'A Pip cookie! Pip likes chips!' },
      ],
      doneLine: 'Cookies for the festival! Yum, yum!',
    },
  },
  {
    id: 'ff6-quick', kind: 'prea1', teacher: 'Extra time: quick fire! Say the whole offer before the ring runs out.',
    scene: {
      id: 'ff6-quick', kind: 'rapid-recall', bg: bgCafe, who: 'pip', seconds: 6,
      teacher: 'Say it before the ring runs out!',
      cards: [
        { img: FOOD.soup.img, word: 'soup', say: 'Would you like some soup?' },
        { img: FOOD.rice.img, word: 'rice', say: 'Would you like some rice?' },
        { img: FOOD.grapes.img, word: 'grapes', say: 'Would you like some grapes?' },
        { img: FOOD.cheese.img, word: 'cheese', say: 'Would you like some cheese?' },
        { img: FOOD.pasta.img, word: 'pasta', say: 'Would you like some pasta?' },
        { img: FOOD.juice.img, word: 'juice', say: 'Would you like some juice?' },
      ],
    },
  },
  {
    id: 'ff6-move-break', kind: 'prea1', teacher: 'Brain break: waiter moves!',
    scene: {
      id: 'ff6-move-break', kind: 'tpr-actions', mode: 'break', bg: bgCafe, who: 'pip', teacher: 'Be a waiter!',
      rounds: [
        { line: 'Carry the tray! Walk slowly!', emoji: '\u{1F37D}\u{FE0F}' },
        { line: 'Write the order! Scribble, scribble!', emoji: '\u{1F4DD}' },
        { line: 'Bow and say: Here you are!', emoji: '\u{1F647}' },
      ],
    },
  },
  {
    id: 'ff6-balloon', kind: 'save-balloon', bg: bgMarket, who: 'pip', balloonImg: PICO, title: 'Save the Balloon! Spell the food!',
    teacher: 'Reading: listen to the sentence, look at the picture — tap the letters to spell the word. Every right letter lifts Pico’s balloon over the stalls!',
    rounds: [
      { word: 'soup', img: FOOD.soup.img, sentence: 'I have soup for lunch.' },
      { word: 'rice', img: FOOD.rice.img, sentence: 'I have rice for dinner.' },
      { word: 'cake', img: FOOD.cake.img, sentence: 'Would you like some cake?' },
      { word: 'milk', img: FOOD.milk.img, sentence: 'I have milk for breakfast.' },
    ],
    doneLine: 'Pico is over the stalls! Super spelling!',
  },
  {
    id: 'ff6-chests', kind: 'chest-quest', bg: bgMarket, who: 'cilla', title: 'Festival Treasure Chests!', goal: 60,
    teacher: 'Guided: every right answer opens a chest — coins fill the class jar. Can we reach 60 coins?',
    rounds: [
      { ask: 'Would you like some soup?', choices: ['Yes, please!', 'Yes, I do!'], answer: 0, prizes: ['10', '20', '⭐'] },
      { ask: 'Do you like pizza?', choices: ['Yes, I do!', 'Yes, please!'], answer: 0, img: FOOD.pizza.img, prizes: ['20', '×2', '10'] },
      { ask: 'What do you have for breakfast?', choices: ['I have eggs.', 'I like cooking.'], answer: 0, img: FOOD.eggs.img, prizes: ['10', '20', '×2'] },
      { ask: 'Let’s make a pizza!', choices: ['Yes! Let’s!', 'No, I don’t.'], answer: 0, prizes: ['⭐', '10', '20'] },
    ],
    doneLine: 'Look at the jar! Super answers!',
  },
  {
    id: 'ff6-first-sound', kind: 'first-sound', bg: bgCafe, prompt: 'Catch the fish with the first sound!',
    teacher: 'Reading: hear the food, catch the fish with its first sound (the recorded sound plays). Soup — s!',
    rounds: [
      { word: 'soup', letter: 's', choices: ['s', 'r', 'p'], img: FOOD.soup.img },
      { word: 'rice', letter: 'r', choices: ['c', 'r', 's'], img: FOOD.rice.img },
      { word: 'pasta', letter: 'p', choices: ['b', 'd', 'p'], img: FOOD.pasta.img },
      { word: 'milk', letter: 'm', choices: ['m', 'n', 'w'], img: FOOD.milk.img },
      { word: 'juice', letter: 'j', choices: ['g', 'j', 'y'], img: FOOD.juice.img },
    ],
  },
  {
    id: 'ff6-blocks', kind: 'letter-blocks', bg: bgCafe, mode: 'sounds', model: false,
    prompt: 'Build the menu words',
    teacher: 'Reading: put the sound blocks in order and read the word.',
    rounds: [
      { blocks: ['ch', 'i', 'p', 's'], word: 'chips', img: FOOD.chips.img },
      { blocks: ['s', 'a', 'l', 'a', 'd'], word: 'salad', img: FOOD.salad.img },
      { blocks: ['gr', 'a', 'b'], word: 'grab', img: item('claw') },
    ],
  },
  {
    id: 'ff6-bubbles', kind: 'letter-bubbles', bg: bgCafe, who: 'cilla', title: 'Menu Bubbles: spell it!',
    teacher: 'Spelling game: look at the picture, then pop the bubbles in order to spell the word. Say the word at the end.',
    words: [
      { word: 'salad', img: FOOD.salad.img, say: 'Salad! Would you like some salad?' },
      { word: 'pasta', img: FOOD.pasta.img, say: 'Pasta! I have pasta for dinner.' },
      { word: 'chips', img: FOOD.chips.img, say: 'Chips! Pip likes chips.' },
    ],
    doneLine: 'Pop, pop, pop! You can spell the menu!',
  },
  {
    id: 'ff6-map', kind: 'grid-hunt', bg: bgMarket, who: 'pip', title: 'Festival Map: find the cheese!',
    teacher: 'Game: answer to earn a look. The student says a square — B three! — and taps it. Empty stall or cheese? Find all three cheeses.',
    treasures: ['B2', 'D1', 'C4'],
    rounds: [
      { ask: 'Do you like soup?', choices: ['Yes, I do.', 'Yes, please.', 'I have soup.'], answer: 0 },
      { ask: 'Would you like some bread?', choices: ['No, thank you.', 'No, I don’t.', 'Bread is it.'], answer: 0 },
      { ask: 'What do you have for lunch?', choices: ['I have a sandwich.', 'I like cooking.', 'Yes, please.'], answer: 0 },
      { ask: 'Does Pico like grapes?', choices: ['No, he doesn’t.', 'Yes, he does.', 'He has grapes.'], answer: 0 },
      { ask: 'What does Cilla like?', choices: ['She likes cooking.', 'She likes washing up.', 'She is cheese.'], answer: 0 },
      { ask: 'Let’s eat!', choices: ['Yes! Yum!', 'No, I don’t.', 'Thank you, Pico.'], answer: 0 },
      { ask: 'Would you like some cake?', choices: ['Yes, please!', 'Yes, I do!', 'I am cake.'], answer: 0 },
    ],
    doneLine: 'You found all the cheese!',
  },
  {
    id: 'ff6-tower', kind: 'tower-pull', bg: bgCafe, who: 'cilla', title: 'Cake Tower: answer and pull!',
    teacher: 'Game: answer the question, then pull one block out of the cake tower. Careful — don’t let it fall!',
    rounds: [
      { ask: 'Would you like some juice?', choices: ['Yes, please!', 'Yes, I do!'], answer: 0, img: FOOD.juice.img },
      { ask: 'Do you like washing up?', choices: ['No, I don’t.', 'No, thank you.'], answer: 0 },
      { ask: 'What do you have for dinner?', choices: ['I have pasta.', 'I have breakfast.'], answer: 0, img: FOOD.pasta.img },
      { ask: 'Do you like cheese, Pico?', choices: ['Yes, I do!', 'Yes, please!'], answer: 0, img: PICO },
      { ask: 'Let’s bake a cake!', choices: ['Yes! Let’s!', 'No, I do.'], answer: 0, img: FOOD.cake.img },
    ],
    doneLine: 'The tower is still standing! Café champion!',
  },
  {
    id: 'ff6-river', kind: 'rising-river', bg: bgMarket, who: 'cilla', title: 'Build the bridge to the café!',
    teacher: 'Together: every right answer lays a plank. A wrong answer — the water rises a little. Get the friends across!',
    friends: [CILLA, PICO, wtSpr('pip')],
    rounds: [
      { ask: 'Would you like some juice?', choices: ['Yes, please!', 'Yes, I do!'], answer: 0, img: FOOD.juice.img },
      { ask: 'Do you like salad?', choices: ['No, I don’t.', 'No, thank you.'], answer: 0, img: FOOD.salad.img },
      { ask: 'What do you have for breakfast?', choices: ['I have eggs.', 'I have dinner.'], answer: 0 },
      { ask: 'Let’s go to the café!', choices: ['Yes! Let’s go!', 'No, I do.'], answer: 0 },
    ],
    doneLine: 'Everyone is across! The café is open!',
  },
  {
    id: 'ff6-parcel', kind: 'pass-parcel', bg: bgCafe, who: 'cilla', title: 'Pass the Present!',
    teacher: 'Guided: every right answer tears one layer off the present. What is inside?',
    rounds: [
      { ask: 'What would you like?', choices: ['Some pizza, please.', 'Yes, I do.', 'I like.'], answer: 0, img: FOOD.pizza.img },
      { ask: 'Would you like some milk?', choices: ['No, thank you.', 'No, I don’t.', 'Milk no.'], answer: 0, img: FOOD.milk.img },
      { ask: 'Does Leo like eating?', choices: ['Yes, he does.', 'Yes, he do.', 'Yes, please.'], answer: 0 },
      { ask: 'Here you are!', choices: ['Thank you!', 'Let’s!', 'Yes, I do!'], answer: 0 },
    ],
    prize: { img: item('cookie'), label: 'Cookie' },
    doneLine: 'You opened the present! A cookie!',
  },
  {
    id: 'ff6-twister-race', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgCafe, who: 'pip', focus: '',
    teacher: 'Reading: the Twister Race! All four Unit 4 twisters — slow, faster, then super fast!',
    line: 'Green grapes, great grapes, grab a grape! Plum on a plate, please! Snails snack on snacks. Fred fries fresh fish.',
    lines: ['Green grapes, great grapes, grab a grape!', 'Plum on a plate, please!', 'Snails snack on snacks.', 'Fred fries fresh fish.'],
  },
  {
    id: 'ff6-blend', kind: 'sound-blend', bg: bgCafe, look: 'slide',
    teacher: 'Reading: blend the sounds, find the picture — then read the sentence.',
    rounds: [
      { word: 'brick', sounds: ['b', 'r', 'i', 'ck'], img: item('blocks'), sentence: 'A brick oven for pizza.' },
      { word: 'clap', img: item('pip-clap'), sentence: 'Clap for Chef Cilla!' },
      { word: 'swim', img: item('fish-swim'), sentence: 'The fish can swim.' },
    ],
  },
  {
    id: 'ff6-chat-pico', kind: 'join-stage', bg: cillaPage(11), teacher: 'Free: Pico asks — the student answers in full sentences, then offers him something.', cast: ['pico'],
    turns: [
      { who: 'pico', line: 'Do you like cheese?' },
      { who: 'student', line: 'Yes, I do. / No, I don’t.' },
      { who: 'pico', line: 'What do you have for lunch?' },
      { who: 'student', line: 'I have … for lunch. Would you like some … , Pico?' },
      { who: 'pico', line: 'Yes, please! Thank you!' },
    ],
  },
  {
    id: 'ff6-order-cilla', kind: 'join-stage', bg: bgCafe, teacher: 'Free: role swap — now the student is the customer and orders from Cilla.', cast: ['cilla'],
    turns: [
      { who: 'cilla', line: 'Hello! What would you like?' },
      { who: 'student', line: 'Some … and some … , please.' },
      { who: 'cilla', line: 'Here you are! Would you like some juice?' },
      { who: 'student', line: 'Yes, please! / No, thank you.' },
      { who: 'cilla', line: 'Enjoy the festival!' },
    ],
  },
  { id: 'ff6-i-can', kind: 'meet', focus: ['quickly'], bg: bgCafe, who: 'cilla', cardSide: 'left', teacher: 'Check: the student served 5 orders and made polite offers — then the passport stamp!', line: 'I can order and offer food quickly!', repeat: 'Would you like some juice?' },
  {
    id: 'ff6-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the waiter sticker in their Sticker Book.',
    scene: {
      id: 'ff6-sticker', kind: 'sticker-reward', bg: bgCafe, who: 'pip', teacher: 'Sticker time!',
      line: 'Super waiter! Here is your sticker.',
      sticker: { img: item('plate'), label: 'Festival waiter' },
    },
  },
  petPal('ff6-pet-pal', 5, 'The café is open! Would I like some cake? Yes, please!', [{ label: 'chips', img: FOOD.chips.img }, { label: 'cake', img: FOOD.cake.img }, { label: 'umbrella', img: item('umbrella') }], 1, 'Cake! Yes, please! Thank you!'),
  {
    id: 'ff6-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ff6-home-mission', kind: 'home-mission', bg: bgCafe, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child played café: taking orders and offering food politely. Play café at home — your child is the waiter, then you swap.',
      steps: [
        { emoji: '\u{1F4DD}', say: 'Make a menu with pictures.' },
        { emoji: '\u{2615}', say: 'Be the waiter: What would you like?' },
        { emoji: '\u{1F37D}\u{FE0F}', say: 'Offer: Would you like some … ?' },
      ],
    },
  },
  {
    id: 'ff6-move-break-2', kind: 'prea1', teacher: 'Brain break: the café is closing — tidy up!',
    scene: {
      id: 'ff6-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgCafe, who: 'pip', teacher: 'Tidy up!',
      rounds: [
        { line: 'Wash the plates! Scrub, scrub!', emoji: '\u{1F37D}\u{FE0F}' },
        { line: 'Wipe the table! Swish, swish!', emoji: '\u{1F9FD}' },
        { line: 'Wave goodbye to the customers!', emoji: '\u{1F44B}' },
      ],
    },
  },
  goodbyeSong('ff6-goodbye-song', bgCafe),
  { id: 'ff6-finale', kind: 'finale', bg: bgCafe, who: 'pip', line: 'Super waiter! Next time: the Boss Test! \u{1F3C6}' },
];

/* =============================================================================
 * A1 Unit 4 Lesson 7: "Boss Test: Festival Feast!"
 * Food Race warm-up, then five parts (4 of 5 each): listening, reading yes / no, the story, speaking (order a meal,
 * offer two things, answer Do you like…? about yourself), reading aloud. Practise-again games after the trophy.
 * ========================================================================= */

export const LESSON_A1U4L7_TITLE = 'Boss Test: Festival Feast!';
export const LESSON_A1U4L7_OBJECTIVE = 'I can show what I learned in Unit 4: foods and meals, likes, "Do you like…?", offers and the story.';

export const LESSON_A1U4L7_SCENES: Scene[] = [
  { id: 'ff7-title', kind: 'title-card', bg: cillaPage(12), level: 'A1', unit: 'Unit 4', lessonLabel: 'Lesson 7', title: 'Boss Test: Festival Feast!', subtitle: 'Show everything you can do at the festival', cta: '\u{1F3C6} I’M READY!' },
  {
    id: 'ff7-recall-warmup', kind: 'recall-warmup', bg: bgCafe, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 4 · Lesson 6 · Festival Café',
    teacher: 'Guided: listen — click the food and say the offer: Would you like some … ?',
    items: [
      { word: 'juice', say: 'Would you like some juice?', img: FOOD.juice.img },
      { word: 'salad', say: 'Some salad, please.', img: FOOD.salad.img },
      { word: 'cake', say: 'Would you like some cake?', img: FOOD.cake.img },
    ],
  },
  {
    id: 'ff7-intro', kind: 'cinematic', bg: cillaPage(12), title: 'The Boss Test', subtitle: 'A food race, then five parts', narrator: 'cilla',
    script: [
      { who: 'cilla', line: 'Welcome to the Festival Feast!' },
      { who: 'cilla', line: 'Listen, read, read the story, talk and read aloud!' },
      { who: 'pip', line: 'First, the food race! Let’s go!' },
    ],
    cta: '\u{1F3C1} RACE!',
  },
  {
    id: 'ff7-food-race', kind: 'answer-race', look: 'race', bg: bgMarket, who: 'pip', racer: item('pizza-slice'),
    title: 'The Food Race! Every right answer moves your pizza!',
    teacher: 'Warm-up: the student answers — every right answer moves the pizza. The last two cards are read, not heard.',
    rounds: [
      { ask: 'Do you like soup?', choices: ['Yes, I do.', 'Yes, please.', 'I have soup.'], answer: 0 },
      { ask: 'Would you like some juice?', choices: ['No, I don’t.', 'Yes, please!', 'I like juice is.'], answer: 1 },
      { ask: 'What do you have for breakfast?', choices: ['I have eggs.', 'I like washing up.', 'No, thank you.'], answer: 0 },
      { ask: 'What does Cilla like?', choices: ['She likes cooking.', 'She like cooking.', 'She is cooking pizza no.'], answer: 0, read: true },
      { ask: 'Who has the cheese?', choices: ['Pico has the cheese.', 'Biscuit has the cheese.', 'Cilla has the soup.'], answer: 0, read: true },
    ],
    doneLine: 'You won the food race! Now the Boss Test!',
  },
  /* Part 1 — Listening */
  {
    id: 'ff7-p1-listen', kind: 'prea1', teacher: 'Part 1 — Listening (5). One try each; 🔊 replays it. Pass: 4 of 5. The student works alone.',
    scene: {
      id: 'ff7-p1-listen', kind: 'hero-trials', bg: bgCafe, who: 'pip',
      teacher: 'Listen and tap the picture. One try!',
      hero: { img: CILLA, name: 'Festival Chef' }, medal: item('medal-rainbow'),
      skills: [
        { key: 'food', label: 'Food', icon: '\u{1F35C}' },
        { key: 'likes', label: 'Likes', icon: '\u{1F44D}' },
        { key: 'meals', label: 'Meals', icon: '\u{1F31E}' },
      ],
      items: [
        { skill: 'food', ask: 'Would you like some soup?', reply: 'Soup!', answer: 1, options: [{ label: 'salad', img: FOOD.salad.img }, { label: 'soup', img: FOOD.soup.img }, { label: 'rice', img: FOOD.rice.img }] },
        { skill: 'likes', ask: 'I like cooking!', reply: 'Cooking!', answer: 0, options: [{ label: 'cooking', img: DOING.cooking.img }, { label: 'washing up', img: DOING.washing.img }, { label: 'eating', img: DOING.eating.img }] },
        { skill: 'meals', ask: 'I have pasta for dinner.', reply: 'Pasta!', answer: 2, options: [{ label: 'eggs', img: FOOD.eggs.img }, { label: 'sandwich', img: FOOD.sandwich.img }, { label: 'pasta', img: FOOD.pasta.img }] },
        { skill: 'likes', ask: 'Pico likes pizza. He doesn’t like grapes.', reply: 'Pizza!', answer: 0, options: [{ label: 'pizza', img: FOOD.pizza.img }, { label: 'grapes', img: FOOD.grapes.img }, { label: 'bread', img: FOOD.bread.img }] },
        { skill: 'food', ask: 'Some chips, please!', reply: 'Chips!', answer: 1, options: [{ label: 'cheese', img: FOOD.cheese.img }, { label: 'chips', img: FOOD.chips.img }, { label: 'cake', img: FOOD.cake.img }] },
      ],
      doneLine: 'Listening done! Super ears!',
    },
  },
  { id: 'ff7-can-1', kind: 'meet', focus: ['meals'], bg: cillaPage(2), who: 'cilla', cardSide: 'right', teacher: 'Can-do: the student names 6 foods and says a meal sentence — tick it on the Unit 4 can-do card.', line: 'I can name foods and my meals!', repeat: 'I have soup for lunch.' },
  /* Part 2 — Reading: yes or no? */
  {
    id: 'ff7-p2-read', kind: 'true-false', bg: bgCafe, img: cillaPage(12), read: true,
    teacher: 'Part 2 — Reading (5). Look at the picture. Read: yes or no? Pass: 4 of 5.',
    rounds: [
      { who: 'cilla', statement: 'The friends are eating pizza.', isTrue: true },
      { who: 'cilla', statement: 'They are eating soup.', isTrue: false },
      { who: 'cilla', statement: 'Pico is at the table.', isTrue: true },
      { who: 'cilla', statement: 'It is morning.', isTrue: false },
      { who: 'cilla', statement: 'Chef Cilla has a chef hat.', isTrue: true },
    ],
  },
  {
    id: 'ff7-p2b-spell', kind: 'letter-blocks', bg: bgCafe, mode: 'sounds', model: false,
    prompt: 'Part 2b — Build the food words (3)',
    teacher: 'Part 2b — Building words (3). The student puts the sound blocks in order and reads the word. Pass: 2 of 3.',
    rounds: [
      { blocks: ['s', 'ou', 'p'], word: 'soup', img: FOOD.soup.img },
      { blocks: ['pl', 'u', 'm'], word: 'plum', img: item('plum') },
      { blocks: ['fr', 'o', 'g'], word: 'frog', img: item('frog') },
    ],
  },
  {
    id: 'ff7-p2c-tick', kind: 'prea1', teacher: 'Part 2c — Reading sentences (5). Read the sentence, look at the picture — tick or cross? Pass: 4 of 5.',
    scene: {
      id: 'ff7-p2c-tick', kind: 'tick-cross', bg: bgCafe, who: 'pip', teacher: 'Read and look. Yes or no?',
      rounds: [
        { img: FOOD.soup.img, sentence: 'It’s soup.', isTrue: true },
        { img: FOOD.salad.img, sentence: 'It’s a sandwich.', isTrue: false },
        { img: DOING.washing.img, sentence: 'Washing up!', isTrue: true },
        { img: FOOD.grapes.img, sentence: 'They’re chips.', isTrue: false },
        { img: FOOD.rice.img, sentence: 'It’s rice.', isTrue: true },
      ],
    },
  },
  { id: 'ff7-can-2', kind: 'meet', focus: ['don’t'], bg: cillaPage(3), who: 'leo', cardSide: 'left', teacher: 'Can-do: the student says what they like and don’t like doing — tick it.', line: 'I can say what I like and don’t like!', repeat: 'I like eating. I don’t like washing up.' },
  /* Part 3 — Reading: the story */
  {
    id: 'ff7-p3-story', kind: 'grammar-gap', bg: bgCafe, title: 'Part 3 — The story',
    teacher: 'Part 3 — Reading the story (5). Read and choose the missing word. Pass: 4 of 5.',
    rounds: [
      { before: 'Look! The Food Festival! There are a lot of', after: '.', choices: ['stalls', 'stars'], answer: 'stalls', img: cillaPage(1) },
      { before: 'Let’s make a big', after: 'for the festival!', choices: ['pizza', 'soup'], answer: 'pizza', img: cillaPage(3) },
      { before: 'It is Pico the Mouse! He has the', after: '.', choices: ['cheese', 'bread'], answer: 'cheese', img: cillaPage(6) },
      { before: 'Would you like some bread? No, thank', after: '.', choices: ['you', 'please'], answer: 'you', img: cillaPage(8) },
      { before: 'Let’s eat! Yum! We all', after: 'pizza!', choices: ['like', 'likes'], answer: 'like', img: cillaPage(12) },
    ],
  },
  {
    id: 'ff7-break', kind: 'prea1', teacher: 'Brain break between the parts: stretch and breathe.',
    scene: {
      id: 'ff7-break', kind: 'tpr-actions', mode: 'break', bg: bgMarket, who: 'pip', teacher: 'Stretch!',
      rounds: [
        { line: 'Stretch up tall like a chef’s hat!', emoji: '\u{1F468}\u{200D}\u{1F373}' },
        { line: 'Stir a big pot — slowly!', emoji: '\u{1F963}' },
        { line: 'Breathe and count to five!', emoji: '\u{1F590}\u{FE0F}' },
      ],
    },
  },
  /* Part 4 — Speaking */
  {
    id: 'ff7-p4-order', kind: 'join-stage', bg: bgCafe, teacher: 'Part 4a — Speaking (2 points): the student orders a meal from Cilla in full sentences.', cast: ['cilla'],
    turns: [
      { who: 'cilla', line: 'Hello! What would you like?' },
      { who: 'student', line: 'Some … and some … , please.' },
      { who: 'cilla', line: 'Here you are!' },
      { who: 'student', line: 'Thank you!' },
    ],
  },
  {
    id: 'ff7-p4-offer', kind: 'join-stage', bg: cillaPage(10), teacher: 'Part 4b — Speaking (2 points): the student offers Pico two things; Pico answers.', cast: ['pico'],
    turns: [
      { who: 'student', line: 'Would you like some … , Pico?' },
      { who: 'pico', line: 'No, thank you.' },
      { who: 'student', line: 'Would you like some … ?' },
      { who: 'pico', line: 'Yes, please!' },
    ],
  },
  {
    id: 'ff7-p4-me', kind: 'join-stage', bg: bgMarket, teacher: 'Part 4c — Speaking (1 point): the student answers a Do you like…? question about themselves with a reason. Pass for Part 4: 4 of 5 points.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'Do you like pizza?' },
      { who: 'student', line: 'Yes, I do. I like … ! / No, I don’t. I like … .' },
    ],
  },
  { id: 'ff7-can-3', kind: 'meet', focus: ['offer'], bg: cillaPage(10), who: 'cilla', cardSide: 'left', teacher: 'Can-do: the student asks Do you like…? and offers food — tick it.', line: 'I can ask my friends and offer food!', repeat: 'Would you like some pizza?' },
  /* Part 5 — Reading aloud */
  {
    id: 'ff7-p5-read-aloud', kind: 'reader', bg: bgCafe, title: 'Part 5 — Read it aloud!', doneLine: 'You read it all by yourself!',
    teacher: 'Part 5 — Reading aloud (5 points: every word read, then fluency). Skip the listening: tap “My turn to read” at once. Pass: 4 of 5.',
    pages: [CILLA_RECIPE[8], CILLA_RECIPE[9]],
  },
  { id: 'ff7-can-4', kind: 'meet', focus: ['story'], bg: cillaPage(11), who: 'leo', cardSide: 'left', teacher: 'Can-do: the student reads a page of the story and says what Pico liked — tick it.', line: 'I can read the story and say what Pico likes!', repeat: 'Pico likes pizza!' },
  { id: 'ff7-echo-champ', kind: 'echo', bg: cillaPage(12), who: 'cilla', textSide: 'top', teacher: 'Say it proudly with Cilla!', word: 'I can do it! Festival chef!' },
  { id: 'ff7-i-can', kind: 'meet', focus: ['Unit 4'], bg: cillaPage(12), who: 'cilla', cardSide: 'left', teacher: 'Check: any part below 4 of 5? Play it again next lesson (Practise again). Then the trophy!', line: 'I can show everything from Unit 4!', repeat: 'I’m a festival chef!' },
  {
    id: 'ff7-sticker', kind: 'prea1', teacher: 'The Unit 4 trophy! The student opens the pack and puts the trophy sticker in their Sticker Book.',
    scene: {
      id: 'ff7-sticker', kind: 'sticker-reward', bg: cillaPage(12), who: 'pip', teacher: 'The Unit 4 trophy!',
      line: 'You passed the Boss Test! Here is your Unit 4 trophy — and piece 3 of the Golden Compass!',
      sticker: { img: item('medal-rainbow'), label: 'Golden Compass piece 3' },
    },
  },
  petPal('ff7-pet-pal', 6, 'It’s the festival feast! I want a big cake!', [{ label: 'cake', img: FOOD.cake.img }, { label: 'salad', img: FOOD.salad.img }, { label: 'moon', img: item('moon') }], 0, 'A big cake! Thank you! Yum!'),
  {
    id: 'ff7-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ff7-home-mission', kind: 'home-mission', bg: bgMarket, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Your child finished Unit 4: foods and meals, "I like / don\'t like + -ing", "Do you like…?", "Would you like some…?", "Let\'s…!" and the story "Chef Cilla\'s Recipe". Let them offer you a snack in English.',
      steps: [
        { emoji: '\u{1F3C5}', say: 'Show your trophy to your family.' },
        { emoji: '\u{1F36A}', say: 'Offer a snack: Would you like some … ?' },
        { emoji: '\u{1F4D6}', say: 'Read the story to your family.' },
      ],
    },
  },
  /* Practise again — for any part below the pass mark, or as extra time */
  {
    id: 'ff7-pa-match', kind: 'picture-match', look: 'chalk', prompt: 'Practise again: read and match',
    teacher: 'Practise again (Part 2): read each sentence and drag it under its picture.',
    items: [
      { word: 'Would you like some soup?', img: FOOD.soup.img },
      { word: 'I like baking.', img: DOING.baking.img },
      { word: 'Pico has the cheese.', img: PICO },
      { word: 'I have eggs for breakfast.', img: FOOD.eggs.img },
    ],
    bg: bgCafe,
  },
  {
    id: 'ff7-pa-build', kind: 'sentence-build', bg: bgCafe, teacher: 'Practise again (Part 3): put the words in order, then read the sentence.',
    rounds: [
      { words: ['Do', 'you', 'like', 'soup?'], emoji: '\u{1F963}' },
      { words: ['I', 'don’t', 'like', 'washing', 'up.'], emoji: '\u{1F9FD}' },
      { words: ['Would', 'you', 'like', 'some', 'cake?'], emoji: '\u{1F370}' },
    ],
  },
  {
    id: 'ff7-pa-memory', kind: 'memory', bg: bgMarket, teacher: 'Practise again (Part 4): find each question and its answer — read both aloud.',
    pairs: [
      { id: 'like', label: 'Do you like soup?', match: 'Yes, I do.', emoji: '\u{1F963}' },
      { id: 'offer', label: 'Would you like some cake?', match: 'Yes, please!', emoji: '\u{1F370}' },
      { id: 'no', label: 'Would you like some bread?', match: 'No, thank you.', emoji: '\u{1F35E}' },
      { id: 'meal', label: 'What do you have for lunch?', match: 'I have a sandwich.', emoji: '\u{1F96A}' },
    ],
  },
  {
    id: 'ff7-pa-chat', kind: 'chat-chain', bg: bgCafe, partner: 'leo', title: 'Practise again: chat with Leo',
    intro: 'Hi! Let’s talk about food!',
    teacher: 'Practise again (Part 4): Leo talks, the student picks the reply that fits and SAYS it, then taps “I said it”.',
    turns: [
      { who: 'leo', line: 'Do you like pizza?' },
      { who: 'student', line: 'Yes, I do!', wrong: ['Yes, please!', 'I have pizza is.'] },
      { who: 'leo', line: 'Would you like some juice?' },
      { who: 'student', line: 'Yes, please!', wrong: ['Yes, I do!', 'I like cooking.'] },
      { who: 'leo', line: 'Ask me a question!' },
      { who: 'student', line: 'Do you like salad?', wrong: ['You like salad.', 'Salad you like?'] },
    ],
  },
  {
    id: 'ff7-pa-parcel', kind: 'pass-parcel', bg: cillaPage(12), who: 'cilla', title: 'Pass the Present!',
    teacher: 'Practise again (all parts): every right answer tears one layer off the present. What is inside?',
    rounds: [
      { ask: 'Would you like some grapes?', choices: ['No, thank you.', 'No, I don’t.', 'Grapes no.'], answer: 0, img: FOOD.grapes.img },
      { ask: 'Does Pico like pizza?', choices: ['Yes, he does.', 'Yes, he do.', 'No, he doesn’t.'], answer: 0, img: cillaPage(9) },
      { ask: 'What do you have for dinner?', choices: ['I have rice.', 'I like dinner.', 'Yes, please.'], answer: 0 },
      { ask: 'Let’s make a pizza!', choices: ['Yes! Let’s!', 'Thank you, Pico.', 'No, I don’t.'], answer: 0 },
      { ask: 'Who finds the crumbs?', choices: ['Biscuit.', 'Cilla.', 'Mia.'], answer: 0, img: cillaPage(5) },
    ],
    prize: { img: FOOD.cake.img, label: 'Festival cake' },
    doneLine: 'You opened the present! A festival cake!',
  },
  goodbyeSong('ff7-goodbye-song', cillaPage(12)),
  { id: 'ff7-finale', kind: 'finale', bg: cillaPage(12), who: 'cilla', line: 'You finished Unit 4 and found piece 3 of the Golden Compass! Next: a friendly monster roar… \u{1F47E}' },
];
