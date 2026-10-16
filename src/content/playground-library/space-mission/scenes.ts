/* =============================================================================
 * Space Mission — A1 Unit 3 (plan: docs/a1-unit-3-space.md, owner-approved 2026-10-13: "go")
 *
 * Reuses Welcome Town's Scene type, CharKey/CAST/VOICE_KEY and SceneRenderer — Space Mission is a new WORLD, not a new
 * engine. Unit objective: count in tens to 100 and say how many, follow and give directions (left, right, up, down,
 * above, below), ask "How many…?" / "Where is…?", give a short planet weather report, and read "The Lost Robot" (one
 * story for the unit, a few pages each lesson).
 * Every lesson: sound → a phonics game (different each lesson) → Blend & Read → tongue twister; no game twice in the unit.
 * Phonics uses only our own recorded sounds (public/lep1/audio/letters): th, ing, u, o. ng on its own and voiced th are
 * not recorded yet (docs/phonics-sounds-to-record.md), so Lesson 2 teaches the "-ing" chunk and Lesson 1 the th in
 * three / thin / bath.
 * Research (mechanics only, sources in the plan §2): Cambridge A1 Movers word list, coding-for-kids grids (Bee-Bots,
 * Science North programmer ↔ robot), ESL weather maps and reports (teach-this, games4esl, ESL Kid Stuff, British
 * Council), counting-by-tens lessons (Boom Learning, ArtsWA, Elephango). New games: Rocket Maze ★ (`rocket-maze`) and
 * Planet Weather Report ★ (`weather-report`).
 * ========================================================================= */

import { CAST, VOICE_KEY, type CharKey, type ReaderPage, type Scene } from '../welcome-town/scenes';

export type { CharKey, Scene };
export { CAST, VOICE_KEY };

const S = '/space-mission';
const bgStation = `${S}/scenes/bg-space-station-wide.png`;
const bgDeep = `${S}/scenes/bg-space-deep-wide.png`;
const WT = '/welcome-town';
const wtSpr = (who: string) => `${WT}/sprites/${who}-wave.png`;
const item = (n: string) => `/lep1/items/item-${n}.png`;
const SONG_HELLO = `${WT}/audio/hello-song.mp3?v=1`;
const SONG_GOODBYE = `${WT}/audio/goodbye-song.mp3?v=3`;

/** The Lost Robot — Canva pictures (scripts/canva-art-request.json, holder design pages 29-40). */
export const lostRobot = (n: number) => `${S}/scenes/bg-space-robot-${n}-wide.png`;

/** A number badge (no picture file needed): a coloured rounded card with the number and three stars. */
const NUM_COLORS = ['#6366F1', '#EC4899', '#F97316', '#14B8A6', '#8B5CF6', '#EF4444', '#0EA5E9', '#22C55E', '#EAB308', '#A855F7'];
export const numCard = (n: number) => {
  const color = NUM_COLORS[Math.round(n / 10) % NUM_COLORS.length];
  const size = n >= 100 ? 74 : 92;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect x='10' y='10' width='180' height='180' rx='38' fill='${color}' stroke='white' stroke-width='10'/><text x='100' y='122' font-family='Arial Rounded MT Bold,Arial,Helvetica,sans-serif' font-size='${size}' font-weight='900' fill='white' text-anchor='middle'>${n}</text><text x='100' y='170' font-family='Arial,sans-serif' font-size='30' fill='#FDE047' text-anchor='middle'>&#9733;&#9733;&#9733;</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/** The unit's reading strand (plan §4). */
export const LOST_ROBOT: ReaderPage[] = [
  { img: lostRobot(1), lines: [{ text: 'Look! The stars! There are a lot of stars.' }], check: { who: 'pip', question: 'What do they see?', answer: 'Stars', options: [{ label: 'The moon', img: item('moon') }, { label: 'Stars', img: item('star-gold') }, { label: 'The sun', img: item('sun') }] } },
  { img: lostRobot(2), lines: [{ who: 'nova', text: 'Hello! I am Captain Nova. This is my rocket.' }], check: { who: 'pip', question: 'Who is this?', answer: 'Captain Nova', options: [{ label: 'Captain Nova', img: item('nova') }, { label: 'Beep', img: item('beep') }, { label: 'Biscuit', img: item('dog') }] } },
  { img: lostRobot(3), lines: [{ text: 'Count the stars! Ten, twenty, thirty, forty!' }], check: { who: 'pip', question: 'How many stars?', answer: 'Forty', options: [{ label: 'Twenty' }, { label: 'Forty' }, { label: 'Thirty' }] } },
  { img: lostRobot(4), lines: [{ who: 'nova', text: 'Oh no! Where is Beep? Beep is my robot. He is lost!' }], check: { who: 'leo', question: 'Who is lost?', answer: 'Beep', options: [{ label: 'Biscuit', img: item('dog') }, { label: 'Captain Nova', img: item('nova') }, { label: 'Beep', img: item('beep') }] } },
  { img: lostRobot(5), lines: [{ text: 'Go up! Go left! The moon is above the rocket.' }], check: { who: 'pip', question: 'What is above the rocket?', answer: 'The moon', options: [{ label: 'The moon', img: item('moon') }, { label: 'The sun', img: item('sun') }, { label: 'A star', img: item('star-gold') }] } },
  { img: lostRobot(6), lines: [{ text: 'It is hot and sunny. Beep is not here.' }], check: { who: 'pip', question: 'What is the weather?', answer: 'Hot and sunny', options: [{ label: 'Hot and sunny', img: item('planet-sun') }, { label: 'Rainy', img: item('planet-rain') }, { label: 'Cold and snowy', img: item('planet-ice') }] } },
  { img: lostRobot(7), lines: [{ text: 'It is windy! Up, up goes Biscuit’s hat!' }], check: { who: 'leo', question: 'What goes up?', answer: 'The hat', options: [{ label: 'The rocket', img: item('rocket') }, { label: 'The hat', img: item('hat') }, { label: 'A star', img: item('star-gold') }] } },
  { img: lostRobot(8), lines: [{ text: 'It is cold and snowy. Look! Little tracks.' }], check: { who: 'pip', question: 'What is the weather?', answer: 'Cold and snowy', options: [{ label: 'Hot and sunny', img: item('planet-sun') }, { label: 'Windy', img: item('planet-wind') }, { label: 'Cold and snowy', img: item('planet-ice') }] } },
  { img: lostRobot(9), lines: [{ text: 'Beep, beep! It is below us. Go down! Go right!' }], check: { who: 'pip', question: 'Where is Beep?', answer: 'Below us', options: [{ label: 'Below us' }, { label: 'Above us' }, { label: 'In the rocket' }] } },
  { img: lostRobot(10), lines: [{ who: 'beep', text: 'I am cold. I am lost!' }], check: { who: 'pip', question: 'How is Beep?', answer: 'Cold', options: [{ label: 'Hot' }, { label: 'Cold' }, { label: 'Hungry' }] } },
  { img: lostRobot(11), lines: [{ text: 'Biscuit finds Beep! Thank you, Biscuit!' }], check: { who: 'leo', question: 'Who finds Beep?', answer: 'Biscuit', options: [{ label: 'Biscuit', img: item('dog') }, { label: 'Captain Nova', img: item('nova') }, { label: 'Leo', img: item('leo-run') }] } },
  { img: lostRobot(12), lines: [{ text: 'Ten, nine, eight… Go! Up, up, up! Beep is home.' }], check: { who: 'pip', question: 'Where is Beep now?', answer: 'Home', options: [{ label: 'Lost' }, { label: 'On the moon' }, { label: 'Home' }] } },
];

const helloSong = (id: string, bg: string): Scene => ({
  id, kind: 'song', bg, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Sing hello to Captain Nova — wave!',
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

/** Biscuit's shelf: what he got in Units 1-2, then one more thing each Space lesson. */
const PET_EARLIER = [
  { label: 'star', img: item('star-gold') }, { label: 'apple', img: item('apple') }, { label: 'cake', img: item('cake') },
  { label: 'ball', img: item('ball-red') }, { label: 'hat', img: item('hat') }, { label: 'present', img: item('gift') },
  { label: 'medal', img: item('hero-medal') }, { label: 'banana', img: item('banana') }, { label: 'rainbow medal', img: item('medal-rainbow') },
];
const petPal = (id: string, n: number, line: string, choices: { label: string; img: string }[], answer: number, say: string): Scene => ({
  id, kind: 'pet-pal', bg: bgStation, who: 'leo', title: 'Pet Pal: Biscuit in space',
  teacher: 'Routine (1 minute): Biscuit the puppy says what he wants. The student listens, taps it and says it. It goes on his shelf and he grows — the shelf keeps everything from earlier lessons.',
  pet: { name: 'Biscuit', img: item('dog') },
  earlier: [...PET_EARLIER, ...PET_SPACE.slice(0, n)],
  rounds: [{ line, choices, answer, say }],
  doneLine: 'Biscuit is so happy! See you next time!',
});
const PET_SPACE = [
  { label: 'rocket', img: item('rocket') }, { label: 'moon', img: item('moon') }, { label: 'kite', img: item('kite') },
  { label: 'scarf', img: item('scarf') }, { label: 'robot', img: item('beep') }, { label: 'sunglasses', img: item('sunglasses') },
];

const SAY_TENS = ['ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'one hundred'];
const tensWord = (n: number) => SAY_TENS[n / 10 - 1];

/* =============================================================================
 * A1 Unit 3 Lesson 1: "Count to 100 in Space!"
 * Objective: I can count in tens to 100 and say how many: "There are forty stars."
 * Story frame: arrival at Captain Nova's space station — a star-counting welcome (new world, night-sky look).
 * Practice ladder: Present (Nova, tens 10-100, There are…) → Guided (Count & Catch, Space Bingo, Number Rockets,
 *   Memory, Word Splat) → Reading (Reader p1-3, Read & Match, jigsaw) → Phonics th → Free (How many…?) → check.
 * ========================================================================= */

export const LESSON_A1U3L1_TITLE = 'Count to 100 in Space!';
export const LESSON_A1U3L1_OBJECTIVE = 'I can count in tens to 100 and say how many: "There are forty stars."';

export const LESSON_A1U3L1_SCENES: Scene[] = [
  { id: 'sm-title', kind: 'title-card', bg: bgStation, level: 'A1', unit: 'Unit 3', lessonLabel: 'Lesson 1', title: 'Count to 100 in Space!', subtitle: 'Ten, twenty, thirty… blast off!', cta: '\u{1F680} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): Unit 2 — the jungle animals (listen-only: the child hears, then clicks).
    id: 'sm-recall-warmup', kind: 'recall-warmup', bg: bgStation, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 2 · Jungle Adventure',
    teacher: 'Guided: listen — which animal is it? Click it, then say one more sentence about it.',
    items: [
      { word: 'elephant', say: 'It’s big and grey. It’s got a long nose.', img: item('elephant') },
      { word: 'fish', say: 'It can swim. It can’t walk.', img: item('fish') },
      { word: 'monkey', say: 'It can climb and swing.', img: item('coco-cheer') },
    ],
  },
  { id: 'sm-meet-nova', kind: 'meet', focus: ['rocket'], bg: lostRobot(2), who: 'nova', cardSide: 'right', teacher: 'Present: meet Captain Nova! Point to her rocket. Say: This is my rocket.', line: 'Hello! I’m Captain Nova. This is my rocket!', repeat: 'This is my rocket!' },
  {
    id: 'sm-space-words', kind: 'prea1', teacher: 'Present: the space words — listen and say each one. Point up for the stars and the moon!',
    scene: {
      id: 'sm-space-words', kind: 'listen-repeat-cards', bg: bgDeep, teacher: 'Listen and say it!',
      cards: [
        { who: 'pip', sentence: 'It’s a star.', img: item('star-gold'), imgLabel: 'star' },
        { who: 'pip', sentence: 'It’s the moon.', img: item('moon'), imgLabel: 'moon' },
        { who: 'pip', sentence: 'It’s a rocket.', img: item('rocket'), imgLabel: 'rocket' },
        { who: 'pip', sentence: 'It’s a planet.', img: item('planet-ice'), imgLabel: 'planet' },
        { who: 'pip', sentence: 'It’s a robot.', img: item('beep'), imgLabel: 'robot' },
      ],
    },
  },
  {
    id: 'sm-tens', kind: 'prea1', teacher: 'Present: count in tens with Pip — tap each number, say it, show ten fingers each time!',
    scene: { id: 'sm-tens', kind: 'numbers-learn', bg: bgStation, who: 'pip', from: 10, to: 100, step: 10, teacher: 'Tap each number, listen and say it. Ten fingers each time!' },
  },
  { id: 'sm-meet-forty', kind: 'meet', focus: ['forty'], bg: lostRobot(3), who: 'nova', cardSide: 'left', teacher: 'Present: count the groups of ten stars with Nova — ten, twenty, thirty, forty. Then say the sentence.', line: 'Look! There are forty stars!', repeat: 'There are forty stars.' },
  { id: 'sm-echo', kind: 'echo', bg: lostRobot(3), who: 'pip', textSide: 'top', teacher: 'Guided: say it like Pip — loud, then quiet!', word: 'There are thirty stars.' },
  { id: 'sm-echo-2', kind: 'echo', bg: bgStation, who: 'leo', textSide: 'top', teacher: 'Guided: count with Leo — faster each time!', word: 'Ten, twenty, thirty, forty, fifty!' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'sm-space-match', kind: 'picture-match', look: 'cards', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each word and drags it under its picture (or taps the word, then the picture), then reads it aloud.',
    items: [
      { word: 'a star', img: item('star-gold') },
      { word: 'the moon', img: item('moon') },
      { word: 'a rocket', img: item('rocket') },
      { word: 'a planet', img: item('planet-ice') },
      { word: 'a robot', img: item('beep') },
      { word: 'fifty', img: numCard(50) },
    ],
    bg: bgStation,
  },
  {
    id: 'sm-count-catch', kind: 'prea1', teacher: 'Guided: Count & Catch! Each star balloon is worth ten. Pop them in order and count: ten, twenty, thirty… one hundred!',
    scene: { id: 'sm-count-catch', kind: 'count-balloons', bg: bgDeep, who: 'pip', total: 10, step: 10, teacher: 'Every balloon is ten! Pop and count: ten, twenty, thirty…' },
  },
  helloSong('sm-hello-song', lostRobot(2)),
  {
    id: 'sm-bingo', kind: 'sticker-bingo', bg: bgDeep, who: 'pip', title: 'Space Bingo! Listen and stamp!',
    teacher: 'Guided: Pip says a number sentence — the student stamps the number, then says it too. Three in a row: Bingo!',
    cells: [10, 20, 30, 40, 50, 60, 70, 80, 90].map((n) => ({ label: tensWord(n), img: numCard(n), say: `There are ${tensWord(n)} stars.` })),
    calls: [5, 2, 7, 0, 4, 8, 3, 1, 6],
    doneLine: 'Bingo! You know your tens!',
  },
  {
    id: 'sm-number-rockets', kind: 'dominoes', bg: bgStation, who: 'pip', title: 'Number Rockets!',
    teacher: 'Reading: look at the number at the end of the chain — find the rocket card that says it, read it aloud and play it.',
    start: { img: numCard(20), label: 'twenty' },
    steps: [
      { text: 'There are twenty stars.', img: numCard(50), label: 'fifty' },
      { text: 'There are fifty stars.', img: numCard(30), label: 'thirty' },
      { text: 'There are thirty stars.', img: numCard(100), label: 'one hundred' },
      { text: 'There are one hundred stars.', img: numCard(70), label: 'seventy' },
      { text: 'There are seventy stars.', img: item('rocket'), label: 'rocket' },
    ],
    doneLine: 'The rocket chain is finished! Super counting!',
  },
  {
    id: 'sm-move-break', kind: 'prea1', teacher: 'Brain break: a countdown rocket! Crouch down, count, then jump up — blast off!',
    scene: {
      id: 'sm-move-break', kind: 'tpr-actions', mode: 'break', bg: bgStation, who: 'pip', teacher: 'Be a rocket!',
      rounds: [
        { line: 'Crouch down small like a rocket!', emoji: '\u{1F680}' },
        { line: 'Count with me: ten, twenty, thirty!', emoji: '\u{1F522}' },
        { line: 'Blast off! Jump up high!', emoji: '\u{1F4A5}' },
        { line: 'Float in space — slowly, slowly!', emoji: '\u{1F30C}' },
      ],
    },
  },
  {
    id: 'sm-memory', kind: 'memory', bg: bgDeep, teacher: 'Guided: find the number and its word — read the word aloud with each pair.',
    pairs: [
      { id: 'n30', label: '30', match: 'thirty', emoji: '\u{2B50}' },
      { id: 'n40', label: '40', match: 'forty', emoji: '\u{2B50}' },
      { id: 'n60', label: '60', match: 'sixty', emoji: '\u{2B50}' },
      { id: 'n80', label: '80', match: 'eighty', emoji: '\u{2B50}' },
      { id: 'n100', label: '100', match: 'one hundred', emoji: '\u{1F680}' },
    ],
  },
  {
    id: 'sm-word-splat', kind: 'word-splat', bg: bgDeep, who: 'pip', title: 'Star Splat: the tens!',
    teacher: 'Reading: Pip says a number word — splat it and read it.',
    words: ['ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
    rounds: ['thirty', 'seventy', 'forty', 'ninety', 'twenty', 'sixty'],
    doneLine: 'Splat! You can read the tens!',
  },
  /* Reading: The Lost Robot, pages 1-3 */
  {
    id: 'sm-reader', kind: 'reader', bg: lostRobot(1), title: 'The Lost Robot', doneLine: 'Leo, Pip and Biscuit are in space! What happens next? Find out next time!',
    teacher: 'Reading: listen while the words light up, then the student reads each page. Tap any word to hear it.',
    pages: LOST_ROBOT.slice(0, 3),
  },
  {
    id: 'sm-read-match', kind: 'picture-match', look: 'frames', prompt: 'Read and match',
    teacher: 'Reading: read each sentence and drag it under its picture. Then read it aloud.',
    items: [
      { word: 'This is my rocket.', img: item('rocket') },
      { word: 'I am Captain Nova.', img: item('nova') },
      { word: 'Look! The stars!', img: item('star-gold') },
      { word: 'This is Biscuit.', img: item('dog') },
    ],
    bg: bgDeep,
  },
  { id: 'sm-jigsaw', kind: 'jigsaw-puzzle', bg: bgDeep, teacher: 'Build the story picture — then count the stars on it in tens!', image: lostRobot(3), rows: 2, cols: 3 },
  {
    id: 'sm-tic-tac-toe', kind: 'tic-tac-toe', bg: bgStation, who: 'leo', opponentImg: wtSpr('leo'), title: 'Space Tic-Tac-Toe!',
    teacher: 'Game: the student answers to claim a square — then Leo takes one. Three in a row wins!',
    squares: [
      { ask: 'What comes after twenty?', choices: ['thirty', 'twelve', 'forty'], answer: 0 },
      { ask: 'What comes after fifty?', choices: ['fifteen', 'sixty', 'seventy'], answer: 1 },
      { ask: 'What comes before forty?', choices: ['fourteen', 'fifty', 'thirty'], answer: 2 },
      { ask: 'How many stars?', choices: ['There are ten stars.', 'There are forty stars.', 'There are four stars.'], answer: 1, img: lostRobot(3) },
      { ask: 'What comes after ninety?', choices: ['one hundred', 'nineteen', 'eighty'], answer: 0 },
      { ask: 'What is it?', choices: ['It’s a moon.', 'It’s a rocket.', 'It’s a star.'], answer: 1, img: item('rocket') },
      { ask: 'What comes after seventy?', choices: ['seventeen', 'sixty', 'eighty'], answer: 2 },
      { ask: 'Who is she?', choices: ['She is Captain Nova.', 'She is Mia.', 'She is a robot.'], answer: 0, img: item('nova') },
      { ask: 'What comes before twenty?', choices: ['ten', 'thirty', 'two'], answer: 0 },
    ],
    doneLine: 'Three in a row! You win!',
  },
  /* Phonics: th → Letter Monsters → Blend & Read → tongue twister */
  {
    id: 'sm-sound-th', kind: 'sound-model', bg: bgStation, who: 'pip', letter: 'TH', phoneme: '/th/', sound: 'th', soundSide: 'center',
    teacher: 'Present: t and h together make a new sound — put your tongue between your teeth and blow: th. Three, thumb, thread.',
    anchors: [
      { word: 'three', emoji: '3\u{FE0F}\u{20E3}', img: item('three') },
      { word: 'thumb', emoji: '\u{1F44D}', img: item('thumb') },
      { word: 'thread', emoji: '\u{1F9F5}', img: item('thread') },
    ],
  },
  {
    id: 'sm-letter-monsters', kind: 'prea1', teacher: 'Guided: Hungry Letter Monsters! Feed each picture to the monster with its first sound — th, s or t — and say it.',
    scene: {
      id: 'sm-letter-monsters', kind: 'letter-monsters', bg: bgDeep, who: 'pip',
      teacher: 'Feed each picture to the monster with its first sound!',
      monsters: [{ letter: 'th', color: '#8b5cf6' }, { letter: 's', color: '#22c55e' }, { letter: 't', color: '#f97316' }],
      cards: [
        { word: 'three', img: item('three') }, { word: 'sun', img: item('sun') }, { word: 'ten', img: item('ten') },
        { word: 'thumb', img: item('thumb') }, { word: 'snake', img: item('snake') }, { word: 'top', img: item('top') },
        { word: 'thread', img: item('thread') },
      ],
    },
  },
  {
    id: 'sm-blend', kind: 'sound-blend', bg: bgStation,
    teacher: 'Reading: say each sound (th is ONE sound), blend, find the picture — then read the sentence.',
    rounds: [
      { word: 'thin', sounds: ['th', 'i', 'n'], img: item('thread'), sentence: 'The thread is thin.' },
      { word: 'bath', sounds: ['b', 'a', 'th'], img: item('room-bathroom'), sentence: 'Biscuit is in the bath.' },
      { word: 'thick', sounds: ['th', 'i', 'ck'], img: item('log'), sentence: 'The log is thick.' },
    ],
  },
  { id: 'sm-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgDeep, who: 'pip', focus: 'th', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, then faster.', line: 'Three thin stars think.' },
  /* Free: How many…? */
  {
    id: 'sm-free-talk', kind: 'join-stage', bg: lostRobot(2), teacher: 'Free: Nova asks about the student’s room — they count things at home (books, pens, toys) and answer with There are… Then they ask Nova.', cast: ['nova', 'pip'],
    turns: [
      { who: 'nova', line: 'How many books are in your room?' },
      { who: 'student', line: 'There are … books.' },
      { who: 'nova', line: 'Wow! And how many toys?' },
      { who: 'student', line: 'There are … toys. How many stars are in space, Nova?' },
      { who: 'nova', line: 'There are a lot of stars! One hundred, and more!' },
    ],
  },
  {
    id: 'sm-count-game', kind: 'join-stage', bg: lostRobot(3), teacher: 'Free: count the groups of stars in the window in tens. Then the student shows a number with flashing hands (ten fingers each flash) and Pip says it.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'Count the stars in tens!' },
      { who: 'student', line: 'Ten, twenty, thirty, forty. There are forty stars!' },
      { who: 'pip', line: 'Now flash your hands — I count!' },
      { who: 'student', line: 'How many?' },
      { who: 'pip', line: 'There are … ! My turn: ten, twenty, thirty!' },
    ],
  },
  { id: 'sm-i-can', kind: 'meet', focus: ['hundred'], bg: lostRobot(3), who: 'nova', cardSide: 'left', teacher: 'Check: the student counts 10-100 in tens and says one “There are…” sentence — then the passport stamp!', line: 'I can count in tens to one hundred!', repeat: 'There are forty stars.' },
  {
    id: 'sm-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the space sticker in their Sticker Book.',
    scene: {
      id: 'sm-sticker', kind: 'sticker-reward', bg: bgStation, who: 'pip', teacher: 'Sticker time!',
      line: 'Super counting! Here is your sticker.',
      sticker: { img: item('rocket'), label: 'Space counter' },
    },
  },
  petPal('sm-pet-pal', 0, 'We are in space! I want a rocket!', [{ label: 'rocket', img: item('rocket') }, { label: 'banana', img: item('banana') }, { label: 'star', img: item('star-gold') }], 0, 'A rocket! Zoom!'),
  {
    id: 'sm-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'sm-home-mission', kind: 'home-mission', bg: bgStation, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned to count in tens to 100 and to say how many ("There are forty stars.") and read the first pages of "The Lost Robot". Make groups of ten with pasta or coins and count them together.',
      steps: [
        { emoji: '\u{1F35D}', say: 'Make groups of ten: pasta or coins.' },
        { emoji: '\u{1F522}', say: 'Count them in tens: ten, twenty, thirty…' },
        { emoji: '\u{1F5E3}\u{FE0F}', say: 'Say it: There are fifty pasta shells!' },
      ],
    },
  },
  {
    id: 'sm-move-break-2', kind: 'prea1', teacher: 'Brain break: count and clap in tens!',
    scene: {
      id: 'sm-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgDeep, who: 'pip', teacher: 'Clap the tens!',
      rounds: [
        { line: 'Ten! Clap once!', emoji: '\u{1F44F}' },
        { line: 'Twenty! Clap two times!', emoji: '\u{1F44F}' },
        { line: 'Thirty! Clap three times!', emoji: '\u{1F44F}' },
      ],
    },
  },
  goodbyeSong('sm-goodbye-song', bgStation),
  { id: 'sm-finale', kind: 'finale', bg: lostRobot(1), who: 'pip', line: 'You can count to one hundred in tens! See you in space! \u{1F680}' },
];

/* =============================================================================
 * A1 Unit 3 Lesson 2: "Left, Right, Up, Down: Space Directions"
 * Objective: I can follow and give directions: "Go left. Go up. The moon is above the rocket."
 * Story frame: Beep is lost — the star map room (new setting: the map window; mission-control plot).
 * Practice ladder: Present (directions TPR, above / below) → Guided (Rocket Maze listen missions, Echo Cave, Space
 *   Glider, I Spy, Above or Below?) → Free (Rocket Maze steer missions: the child gives the orders) → Reading (Reader
 *   p4-5, Read & Drag) → Phonics -ing → check.
 * ========================================================================= */

export const LESSON_A1U3L2_TITLE = 'Left, Right, Up, Down: Space Directions';
export const LESSON_A1U3L2_OBJECTIVE = 'I can follow and give directions: "Go left. Go up. The moon is above the rocket."';

export const LESSON_A1U3L2_SCENES: Scene[] = [
  { id: 'sm2-title', kind: 'title-card', bg: lostRobot(5), level: 'A1', unit: 'Unit 3', lessonLabel: 'Lesson 2', title: 'Space Directions', subtitle: 'Left, right, up, down — find Beep!', cta: '\u{1F9ED} LET’S GO!' },
  {
    id: 'sm2-recall-warmup', kind: 'recall-warmup', bg: bgStation, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 3 · Lesson 1 · Count to 100',
    teacher: 'Guided: listen — which number? Click it and say: There are … stars.',
    items: [
      { word: 'thirty', say: 'There are thirty stars.', img: numCard(30) },
      { word: 'sixty', say: 'There are sixty stars.', img: numCard(60) },
      { word: 'one hundred', say: 'There are one hundred stars.', img: numCard(100) },
    ],
  },
  { id: 'sm2-meet-lost', kind: 'meet', focus: ['lost'], bg: lostRobot(4), who: 'nova', cardSide: 'left', teacher: 'Present: the problem! Beep’s box is empty. Show “lost” — look left and right with your hand over your eyes.', line: 'Oh no! Where is Beep? He is lost!', repeat: 'Beep is lost!' },
  {
    id: 'sm2-directions', kind: 'prea1', teacher: 'Present: the four directions — listen, point and say. Stand up and point with your whole arm!',
    scene: {
      id: 'sm2-directions', kind: 'tpr-actions', mode: 'learn', bg: lostRobot(5), who: 'pip', teacher: 'Point and say it!',
      rounds: [
        { line: 'Go up! Point up!', emoji: '\u{2B06}\u{FE0F}' },
        { line: 'Go down! Point down!', emoji: '\u{2B07}\u{FE0F}' },
        { line: 'Go left! Point left!', emoji: '\u{2B05}\u{FE0F}' },
        { line: 'Go right! Point right!', emoji: '\u{27A1}\u{FE0F}' },
      ],
    },
  },
  { id: 'sm2-echo', kind: 'echo', bg: lostRobot(5), who: 'pip', textSide: 'top', teacher: 'Guided: say it like Pip and point — loud, then quiet!', word: 'Go up! Go left!' },
  {
    id: 'sm2-direction-cards', kind: 'prea1', teacher: 'Present: four orders as sentences — listen, say and point each time.',
    scene: {
      id: 'sm2-direction-cards', kind: 'listen-repeat-cards', bg: bgDeep, teacher: 'Listen and say it!',
      cards: [
        { who: 'pip', sentence: 'Go up to the moon!', img: item('moon'), imgLabel: 'up' },
        { who: 'pip', sentence: 'Go down to the planet!', img: item('planet-ice'), imgLabel: 'down' },
        { who: 'pip', sentence: 'Go left to the star!', img: item('star-gold'), imgLabel: 'left' },
        { who: 'pip', sentence: 'Go right to the rocket!', img: item('rocket'), imgLabel: 'right' },
      ],
    },
  },
  {
    id: 'sm2-above-below', kind: 'vocab-spot', bg: lostRobot(5),
    teacher: 'Present: above and below. Tap each arrow, listen, then say the sentence and show it with your hands.',
    items: [
      { label: 'above', sentence: 'The moon is above the rocket.', emoji: '\u{1F315}', left: '50%', top: '12%', color: '#6366F1', who: 'pip' },
      { label: 'below', sentence: 'The rocket is below the moon.', emoji: '\u{1F680}', left: '50%', top: '42%', color: '#EF4444', who: 'pip' },
      { label: 'left', sentence: 'Nova is on the left.', emoji: '\u{2B05}\u{FE0F}', left: '14%', top: '48%', color: '#8B5CF6', who: 'pip' },
      { label: 'right', sentence: 'Biscuit is on the right.', emoji: '\u{27A1}\u{FE0F}', left: '82%', top: '66%', color: '#F97316', who: 'pip' },
    ],
  },
  { id: 'sm2-meet-above', kind: 'meet', focus: ['above'], bg: lostRobot(5), who: 'nova', cardSide: 'left', teacher: 'Present: hands up high for “above”. Then say the sentence with Nova.', line: 'Look! The moon is above the rocket.', repeat: 'The moon is above the rocket.' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'sm2-direction-match', kind: 'picture-match', look: 'frames', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its picture (or taps it, then the picture), then reads it aloud.',
    items: [
      { word: 'Go up to the moon!', img: item('moon') },
      { word: 'Go down to the planet!', img: item('planet-ice') },
      { word: 'Go left to the star!', img: item('star-gold') },
      { word: 'Go right to the rocket!', img: item('rocket') },
    ],
    bg: bgStation,
  },
  /* ★ Signature: Rocket Maze — listen first, then the child gives the orders */
  {
    id: 'sm2-rocket-maze', kind: 'rocket-maze', bg: bgDeep, who: 'nova', rocketImg: item('rocket'), title: 'Rocket Maze: fly to the moon!',
    teacher: 'Guided → Free: first Nova gives the orders — the student listens and taps the direction. In the last two missions the student is mission control: they SAY each order (Go up!) and press it. Rocks bump the rocket back — no lives lost.',
    cols: 6, rows: 4,
    missions: [
      { mode: 'listen', intro: 'Fly to the moon!', start: [0, 3], target: [2, 1], targetImg: item('moon'), targetLabel: 'moon', route: ['up', 'up', 'right', 'right'], win: 'The moon! Well done!' },
      { mode: 'listen', intro: 'Fly to the star!', start: [1, 0], target: [4, 2], targetImg: item('star-gold'), targetLabel: 'star', rocks: [[2, 1], [3, 1]], route: ['right', 'right', 'right', 'down', 'down'], win: 'The star! Super listening!' },
      { mode: 'steer', intro: 'Now you are mission control! Fly to Planet Ice. Say every order!', start: [0, 0], target: [5, 3], targetImg: item('planet-ice'), targetLabel: 'Planet Ice', rocks: [[2, 0], [2, 1], [4, 2], [4, 3]], win: 'Planet Ice! Great orders!' },
      { mode: 'steer', intro: 'Fly back to the moon! Say every order!', start: [5, 0], target: [0, 3], targetImg: item('moon'), targetLabel: 'moon', rocks: [[3, 1], [3, 2], [1, 3]], win: 'The moon! You are a space pilot!' },
    ],
    doneLine: 'Mission complete! You can give directions!',
  },
  {
    id: 'sm2-echo-cave', kind: 'echo-cave', bg: bgDeep, who: 'nova', title: 'Space Echo: where is the call?',
    teacher: 'Game: a friend calls from a crater — left, middle or right (speakers or headphones help). The student taps where the voice came from and says it: On the left!',
    rounds: [
      { voice: 'leo', img: wtSpr('leo'), at: 0, line: 'Beep? Beep! I am on the left!', reply: 'On the left! Hi, Leo!' },
      { voice: 'pip', img: wtSpr('pip'), at: 2, line: 'Beep? I am on the right!', reply: 'On the right! Hi, Pip!' },
      { voice: 'nova', img: item('nova'), at: 1, line: 'Beep! Where are you? I am in the middle!', reply: 'In the middle! Hi, Nova!' },
      { voice: 'beep', img: item('beep'), at: 2, line: 'Beep, beep! I am on the right!', reply: 'On the right! Beep? Oh — it’s an echo!' },
    ],
    doneLine: 'You found every voice! Left, middle, right!',
  },
  {
    id: 'sm2-glider', kind: 'glider', bg: bgDeep, who: 'pip', pilot: item('rocket'), title: 'Space Glider: up or down?',
    teacher: 'Game: listen to the order and tap the cloud with the right arrow — the rocket flies into it. The student says the order too.',
    rounds: [
      { ask: 'Go up!', choices: [{ label: 'up' }, { label: 'down' }, { label: 'left' }], answer: 0, say: 'Up! Go up!' },
      { ask: 'Go left!', choices: [{ label: 'right' }, { label: 'left' }, { label: 'down' }], answer: 1, say: 'Left! Go left!' },
      { ask: 'Go down!', choices: [{ label: 'up' }, { label: 'right' }, { label: 'down' }], answer: 2, say: 'Down! Go down!' },
      { ask: 'Go right!', choices: [{ label: 'right' }, { label: 'left' }, { label: 'up' }], answer: 0, say: 'Right! Go right!' },
      { ask: 'Fly to the moon! It’s above the rocket.', choices: [{ label: 'moon', img: item('moon') }, { label: 'star', img: item('star-gold') }, { label: 'robot', img: item('beep') }], answer: 0, say: 'The moon is above the rocket!' },
    ],
    doneLine: 'Great flying, space pilot!',
  },
  {
    id: 'sm2-red-green', kind: 'red-green', bg: bgDeep, who: 'nova', runner: item('beep'), title: 'Red Light, Green Light: robot orders!',
    teacher: 'Listening race: on green, the student taps the arrow they hear and Beep rolls on (they can point too!). On red — freeze! Do not tap until it turns green.',
    cards: [{ label: 'up' }, { label: 'down' }, { label: 'left' }, { label: 'right' }],
    rounds: [
      { light: 'green', say: 'Green light! Go up!', answer: 0, steps: 2 },
      { light: 'green', say: 'Green light! Go right!', answer: 3, steps: 2 },
      { light: 'red', say: 'Red light! Stop!' },
      { light: 'green', say: 'Green light! Go left!', answer: 2, steps: 2 },
      { light: 'green', say: 'Green light! Go down!', answer: 1, steps: 2 },
      { light: 'red', say: 'Red light! Freeze, robot!' },
      { light: 'green', say: 'Green light! Go right!', answer: 3, steps: 2 },
    ],
    doneLine: 'Beep made it! Great listening!',
  },
  {
    id: 'sm2-i-spy', kind: 'i-spy', bg: lostRobot(5), who: 'pip', guide: item('pip-binoculars'),
    teacher: 'Guided: I Spy! Pip gives a clue with a direction word — the student moves the binoculars to it, then says the answer.',
    rounds: [
      { clue: 'I spy something above the rocket!', spot: { left: 50, top: 11, r: 5 }, answer: 'It’s the moon!' },
      { clue: 'I spy someone on the left. She is waving!', spot: { left: 13, top: 45, r: 7 }, answer: 'It’s Captain Nova!' },
      { clue: 'I spy someone on the right. He is a puppy!', spot: { left: 81, top: 65, r: 7 }, answer: 'It’s Biscuit!' },
      { clue: 'I spy something below the moon!', spot: { left: 50, top: 40, r: 5 }, answer: 'It’s the rocket!' },
    ],
    doneLine: 'Super spying! You know left, right, above and below!',
  },
  {
    id: 'sm2-where-tap', kind: 'listen-tap', bg: lostRobot(5), teacher: 'Guided: listen — where is it? Tap the right friend or thing, then say the sentence.',
    targets: [
      { label: 'Moon', left: '50%', top: '11%', color: '#6366F1' },
      { label: 'Nova', left: '14%', top: '50%', color: '#8B5CF6' },
      { label: 'Leo', left: '36%', top: '62%', color: '#C97A2F' },
      { label: 'Pip', left: '60%', top: '64%', color: '#FE6A2F' },
      { label: 'Biscuit', left: '81%', top: '66%', color: '#F97316' },
    ],
    rounds: [
      { prompt: 'It’s above the rocket. What is it?', answerLabel: 'Moon', who: 'pip' },
      { prompt: 'She’s on the left. Who is she?', answerLabel: 'Nova', who: 'pip' },
      { prompt: 'He’s on the right. He’s a puppy!', answerLabel: 'Biscuit', who: 'pip' },
      { prompt: 'He’s next to Nova. He’s a lion!', answerLabel: 'Leo', who: 'pip' },
      { prompt: 'He’s next to Biscuit. He’s a fox!', answerLabel: 'Pip', who: 'pip' },
    ],
  },
  {
    id: 'sm2-move-break', kind: 'prea1', teacher: 'Brain break: Robot Statues! Pip gives orders — the student moves like a robot, then freezes.',
    scene: {
      id: 'sm2-move-break', kind: 'tpr-actions', mode: 'break', bg: bgStation, who: 'pip', teacher: 'Robot Statues!',
      rounds: [
        { line: 'Robot, step left! Freeze!', emoji: '\u{1F916}' },
        { line: 'Robot, step right! Freeze!', emoji: '\u{1F916}' },
        { line: 'Robot, arms up! Freeze!', emoji: '\u{1F64C}' },
        { line: 'Robot, sit down! Beep, beep!', emoji: '\u{1F4A4}' },
      ],
    },
  },
  /* Reading: The Lost Robot, pages 4-5 */
  {
    id: 'sm2-reader', kind: 'reader', bg: lostRobot(4), title: 'The Lost Robot', doneLine: 'Beep is lost! Where is he? Find out next time!',
    teacher: 'Reading: the student reads pages 1-3 again quickly, then the new pages 4-5 (listen first). Tap any word to hear it.',
    pages: LOST_ROBOT.slice(0, 5),
  },
  {
    id: 'sm2-read-drag', kind: 'drag-match', bg: lostRobot(5), teacher: 'Reading: read each sentence and drag it onto the thing it is about. Then read it aloud.',
    items: [
      { label: 'The moon is above the rocket.', color: '#6366F1', targetLeft: '50%', targetTop: '12%' },
      { label: 'Nova is on the left.', color: '#8B5CF6', targetLeft: '14%', targetTop: '50%' },
      { label: 'Biscuit is on the right.', color: '#F97316', targetLeft: '81%', targetTop: '66%' },
      { label: 'Leo is next to Nova.', color: '#C97A2F', targetLeft: '36%', targetTop: '62%' },
    ],
  },
  /* Phonics: -ing → Sound Sort → Blend & Read → tongue twister */
  {
    id: 'sm2-sound-ing', kind: 'sound-model', bg: bgStation, who: 'pip', letter: 'ING', phoneme: '/ing/', sound: 'ing', soundSide: 'center',
    teacher: 'Present: i-n-g together say “ing” — a ringing sound in your nose. Ring, wing, swing.',
    anchors: [
      { word: 'ring', emoji: '\u{1F48D}', img: item('ring') },
      { word: 'wing', emoji: '\u{1F426}', img: item('bird-fly') },
      { word: 'swing', emoji: '\u{1F412}', img: item('coco-swing') },
    ],
  },
  {
    id: 'sm2-sound-sort', kind: 'prea1', teacher: 'Guided: Sound Sort! Listen to each word — which sound do you hear: ing, th or sh? Drag it to its rocket and say it.',
    scene: {
      id: 'sm2-sound-sort', kind: 'sound-sort', bg: bgDeep, teacher: 'Listen! Drag each picture to its sound — ing, th or sh.',
      targets: [
        { letter: 'ing', phoneme: '/ing/', who: 'pip' },
        { letter: 'th', phoneme: '/th/', who: 'leo' },
        { letter: 'sh', phoneme: '/sh/', who: 'mia' },
      ],
      items: [
        { word: 'ring', img: item('ring'), emoji: '\u{1F48D}', letter: 'ing' },
        { word: 'three', img: item('three'), emoji: '3\u{FE0F}\u{20E3}', letter: 'th' },
        { word: 'ship', img: item('ship'), emoji: '\u{1F6A2}', letter: 'sh' },
        { word: 'swing', img: item('coco-swing'), emoji: '\u{1F412}', letter: 'ing' },
        { word: 'thumb', img: item('thumb'), emoji: '\u{1F44D}', letter: 'th' },
        { word: 'shell', img: item('shell'), emoji: '\u{1F41A}', letter: 'sh' },
      ],
    },
  },
  {
    id: 'sm2-blend', kind: 'sound-blend', bg: bgStation, look: 'slide',
    teacher: 'Reading: say each sound (ing is one chunk), blend, find the picture — then read the sentence.',
    rounds: [
      { word: 'ring', sounds: ['r', 'ing'], img: item('ring'), sentence: 'Nova has a ring.' },
      { word: 'wing', sounds: ['w', 'ing'], img: item('bird-fly'), sentence: 'The bird has a wing.' },
      { word: 'swing', sounds: ['s', 'w', 'ing'], img: item('coco-swing'), sentence: 'Coco can swing.' },
    ],
  },
  { id: 'sm2-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgDeep, who: 'pip', focus: 'ing', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, then faster.', line: 'The king’s ring goes ding.' },
  /* Free: give directions */
  {
    id: 'sm2-free-talk', kind: 'join-stage', bg: lostRobot(5), teacher: 'Free: hide a toy in the room. The student guides the teacher to it with 2-3 orders (Go left! Go up!) — then swap.', cast: ['nova', 'leo'],
    turns: [
      { who: 'nova', line: 'Where is the toy? Help me find it!' },
      { who: 'student', line: 'Go left! Go … !' },
      { who: 'nova', line: 'Here? Is it above the table?' },
      { who: 'student', line: 'No! It’s below the … !' },
      { who: 'nova', line: 'I found it! Now you look — go right!' },
    ],
  },
  {
    id: 'sm2-where-is', kind: 'join-stage', bg: lostRobot(5), teacher: 'Free: the student asks Pip where things are in the picture and Pip answers; then Pip asks.', cast: ['pip'],
    turns: [
      { who: 'student', line: 'Where is the moon?' },
      { who: 'pip', line: 'It’s above the rocket!' },
      { who: 'student', line: 'Where is Biscuit?' },
      { who: 'pip', line: 'He’s on the right! Where is Nova?' },
      { who: 'student', line: 'She’s on the left!' },
    ],
  },
  { id: 'sm2-i-can', kind: 'meet', focus: ['directions'], bg: lostRobot(5), who: 'nova', cardSide: 'left', teacher: 'Check: the student gives the teacher 2-step directions to a toy and says one above / below sentence — then the passport stamp!', line: 'I can follow and give directions!', repeat: 'Go up! Go left!' },
  {
    id: 'sm2-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the compass sticker in their Sticker Book.',
    scene: {
      id: 'sm2-sticker', kind: 'sticker-reward', bg: bgStation, who: 'pip', teacher: 'Sticker time!',
      line: 'Great orders, mission control! Here is your sticker.',
      sticker: { img: item('moon'), label: 'Mission control' },
    },
  },
  petPal('sm2-pet-pal', 1, 'Where is my moon? It’s above the rocket! I want the moon!', [{ label: 'rocket', img: item('rocket') }, { label: 'moon', img: item('moon') }, { label: 'sun', img: item('sun') }], 1, 'The moon! Thank you!'),
  {
    id: 'sm2-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'sm2-home-mission', kind: 'home-mission', bg: bgStation, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned directions (left, right, up, down, above, below) and read pages 4-5 of "The Lost Robot". Hide a toy and let them guide you to it in English: "Go left! Go up!"',
      steps: [
        { emoji: '\u{1F9F8}', say: 'Hide a toy at home.' },
        { emoji: '\u{1F9ED}', say: 'Guide your family: Go left! Go right!' },
        { emoji: '\u{1F4D6}', say: 'Read pages 4 and 5 of the story.' },
      ],
    },
  },
  {
    id: 'sm2-move-break-2', kind: 'prea1', teacher: 'Brain break: Simon says with directions!',
    scene: {
      id: 'sm2-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgDeep, who: 'pip', teacher: 'Pip says…',
      rounds: [
        { line: 'Pip says: hands above your head!', emoji: '\u{1F64C}' },
        { line: 'Pip says: hands below your knees!', emoji: '\u{1F447}' },
        { line: 'Pip says: jump to the left!', emoji: '\u{2B05}\u{FE0F}' },
      ],
    },
  },
  goodbyeSong('sm2-goodbye-song', bgStation),
  { id: 'sm2-finale', kind: 'finale', bg: lostRobot(5), who: 'pip', line: 'You can give directions in space! Next time: the planets! \u{1FA90}' },
];

/* =============================================================================
 * A1 Unit 3 Lesson 3: "Listen to the Counting Rocket Song" (+ How many…? / Where is…?)
 * Objective: I can understand numbers and positions when I hear them, and ask "How many…?" and "Where is…?"
 * Story frame: Planet Sun and Planet Wind — the search begins (new settings: a hot orange desert, a windy green hill).
 * Practice ladder: Present (How many…? / Where is…? model) → Guided (Listen & Colour, Musical Pads, Whisper Tube) →
 *   song → Free (Team Flags: the child asks every second question) → Reading (Reader p6-7, Read & Check) → Phonics
 *   short u → check (Listen & Colour 4 of 5, asks 2 questions).
 * ========================================================================= */

export const LESSON_A1U3L3_TITLE = 'The Counting Rocket Song';
export const LESSON_A1U3L3_OBJECTIVE = 'I can understand numbers and positions when I hear them, and ask "How many…?" and "Where is…?"';

const SONG_A1U3L3 = `${S}/audio/counting-rocket-song-a1u3l3.mp3?v=1`;
const SONG_A1U3L3_LYRICS: { who: CharKey; text: string }[] = [
  { who: 'nova', text: 'Count by tens and up we go,' },
  { who: 'nova', text: 'To the stars and moon, hello!' },
  { who: 'pip', text: 'Ten and twenty, thirty, more,' },
  { who: 'pip', text: 'Forty, fifty, rockets roar!' },
  { who: 'nova', text: 'Count by tens and up we go,' },
  { who: 'nova', text: 'To the stars and moon, hello!' },
  { who: 'leo', text: 'Sixty, seventy, eighty, too,' },
  { who: 'leo', text: 'Ninety, a hundred! Stars for you!' },
  { who: 'nova', text: 'Count by tens and up we go,' },
  { who: 'nova', text: 'To the stars and moon, hello!' },
];
/** Take 1 (docs/songs/a1u3l3-space-counting-rocket-scores.txt, best score 0.83): line starts 0 / 10.2 / 16.3 / 18.6 /
 *  24.5 / 27.0 / 32.6 / 34.8 / 37.4 / 39.4 s, end 45.5 s. */
const SONG_A1U3L3_MS = [10200, 6100, 2300, 5900, 2500, 5600, 2200, 2600, 2000, 6100];

export const LESSON_A1U3L3_SCENES: Scene[] = [
  { id: 'sm3-title', kind: 'title-card', bg: lostRobot(6), level: 'A1', unit: 'Unit 3', lessonLabel: 'Lesson 3', title: 'The Counting Rocket Song', subtitle: 'How many? Where is it? Listen well!', cta: '\u{1F3B5} LET’S GO!' },
  {
    id: 'sm3-recall-warmup', kind: 'recall-warmup', bg: lostRobot(5), who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 3 · Lesson 2 · Space Directions',
    teacher: 'Guided: listen — where is it? Click the picture, then say the sentence too.',
    items: [
      { word: 'moon', say: 'The moon is above the rocket.', img: item('moon') },
      { word: 'rocket', say: 'The rocket is below the moon.', img: item('rocket') },
      { word: 'Biscuit', say: 'Biscuit is on the right.', img: item('dog') },
    ],
  },
  { id: 'sm3-meet-how-many', kind: 'meet', focus: ['How many'], bg: lostRobot(3), who: 'nova', cardSide: 'left', teacher: 'Present: the question! Nova asks — the student counts in tens and answers with There are…', line: 'How many stars are there?', repeat: 'How many stars?' },
  { id: 'sm3-meet-where', kind: 'meet', focus: ['Where is'], bg: lostRobot(5), who: 'pip', cardSide: 'right', teacher: 'Present: the other question! Pip asks — the student points and answers: It’s above the rocket.', line: 'Where is the moon? It’s above the rocket!', repeat: 'Where is the moon?' },
  { id: 'sm3-echo', kind: 'echo', bg: lostRobot(3), who: 'nova', textSide: 'top', teacher: 'Guided: ask like Nova — a question voice goes up at the end!', word: 'How many stars are there?' },
  { id: 'sm3-echo-where', kind: 'echo', bg: lostRobot(5), who: 'pip', textSide: 'top', teacher: 'Guided: ask like Pip — point and let your voice go up!', word: 'Where is the moon?' },
  {
    id: 'sm3-question-cards', kind: 'prea1', teacher: 'Present: questions and answers — listen and say both. The student is the asker on the second listen.',
    scene: {
      id: 'sm3-question-cards', kind: 'listen-repeat-cards', bg: bgDeep, teacher: 'Listen and say it!',
      cards: [
        { who: 'pip', sentence: 'How many stars? There are fifty.', img: numCard(50), imgLabel: 'fifty' },
        { who: 'pip', sentence: 'Where is the moon? It’s above the rocket.', img: item('moon'), imgLabel: 'moon' },
        { who: 'pip', sentence: 'How many rockets? There are twenty.', img: numCard(20), imgLabel: 'twenty' },
        { who: 'pip', sentence: 'Where is Beep? He’s below us.', img: item('beep'), imgLabel: 'Beep' },
      ],
    },
  },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'sm3-answer-match', kind: 'picture-match', look: 'polaroids', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its picture (or taps it, then the picture), then reads it aloud.',
    items: [
      { word: 'There are fifty.', img: numCard(50) },
      { word: 'There are twenty.', img: numCard(20) },
      { word: 'It’s above the rocket.', img: item('moon') },
      { word: 'He’s below us.', img: item('beep') },
    ],
    bg: bgDeep,
  },
  {
    id: 'sm3-listen-colour', kind: 'prea1', teacher: 'Guided: Listen and Colour (Cambridge Starters format). Pick the paint, then tap the planet or star you hear. Big or small? Pass: 4 of 5.',
    scene: {
      id: 'sm3-listen-colour', kind: 'listen-colour', bg: bgDeep, who: 'pip',
      teacher: 'Listen and colour! Big or small? Which shape?',
      items: [
        { id: 'bigCircle', shape: 'circle', size: 'big', x: 6, y: 8, w: 24, h: 24 },
        { id: 'smallTriangle', shape: 'triangle', size: 'small', x: 36, y: 10, w: 12, h: 12 },
        { id: 'smallCircle', shape: 'circle', size: 'small', x: 10, y: 46, w: 12, h: 12 },
        { id: 'bigTriangle', shape: 'triangle', size: 'big', x: 40, y: 34, w: 24, h: 26 },
        { id: 'bigSquare', shape: 'square', size: 'big', x: 68, y: 8, w: 22, h: 22 },
        { id: 'smallSquare', shape: 'square', size: 'small', x: 74, y: 46, w: 12, h: 12 },
      ],
      rounds: [
        { item: 'bigCircle', colorWord: 'BLUE' },
        { item: 'smallTriangle', colorWord: 'YELLOW' },
        { item: 'bigSquare', colorWord: 'RED' },
        { item: 'smallCircle', colorWord: 'GREEN' },
        { item: 'bigTriangle', colorWord: 'PURPLE' },
      ],
    },
  },
  {
    id: 'sm3-song', kind: 'song', bg: bgDeep, title: '\u{1F3B5} The Counting Rocket \u{1F3B5}',
    teacher: 'The lesson song: count up in tens with your fingers and jump up on “up we go”! The student already knows the tens.',
    durationSeconds: 46, bigWord: 'hundred', songUrl: SONG_A1U3L3, lineDurationsMs: SONG_A1U3L3_MS, lyrics: SONG_A1U3L3_LYRICS,
  },
  {
    id: 'sm3-musical-pads', kind: 'musical-islands', bg: '/lep1/scenes/bg-game-pond-wide.png', who: 'nova', music: SONG_A1U3L3, title: 'Musical Pads: how many?',
    teacher: 'Game: press the music — the space friends hop between the pads. When it stops, listen: How many friends are on the red pad? The student counts and answers: There are two!',
    players: [{ label: 'Nova', img: item('nova') }, { label: 'Beep', img: item('beep') }, { label: 'Biscuit', img: item('dog') }, { label: 'Pip', img: wtSpr('pip') }],
    rounds: [
      { at: [0, 0, 1, 2], pad: 0, ask: 'How many friends are on the red pad?', say: 'There are two! Nova and Beep.' },
      { at: [2, 1, 2, 2], pad: 2, ask: 'How many friends are on the yellow pad?', say: 'There are three!' },
      { at: [3, 3, 0, 1], pad: 1, ask: 'Where is Pip? Is he on the blue pad?', say: 'Yes! Pip is on the blue pad.' },
      { at: [1, 3, 3, 3], pad: 3, ask: 'How many friends are on the green pad?', say: 'There are three!' },
    ],
    doneLine: 'Great counting and listening!',
  },
  {
    id: 'sm3-whisper-tube', kind: 'whisper-tube', bg: bgStation, who: 'nova', title: 'Space Radio: one word is wrong!',
    teacher: 'Listening game: a friend says a sentence down the space radio; the other friend gets ONE word wrong (a number or a position). The student taps the wrong word, picks the right one and says the whole sentence.',
    rounds: [
      { from: 'nova', to: 'pip', fromImg: item('nova'), toImg: wtSpr('pip'), said: 'There are forty stars.', heard: 'There are fourteen stars.', choices: ['four'] },
      { from: 'pip', to: 'leo', fromImg: wtSpr('pip'), toImg: wtSpr('leo'), said: 'The moon is above the rocket.', heard: 'The moon is below the rocket.', choices: ['on'] },
      { from: 'leo', to: 'nova', fromImg: wtSpr('leo'), toImg: item('nova'), said: 'Beep is on the left.', heard: 'Beep is on the right.', choices: ['up'] },
      { from: 'nova', to: 'leo', fromImg: item('nova'), toImg: wtSpr('leo'), said: 'There are sixty rockets.', heard: 'There are sixteen rockets.', choices: ['six'] },
    ],
    doneLine: 'Great listening! The radio is clear!',
  },
  {
    id: 'sm3-parcel', kind: 'pass-parcel', bg: lostRobot(6), who: 'nova', title: 'Pass the Space Present!',
    teacher: 'Guided: every right answer tears one layer off the present. Listen to the question first, then read the answers.',
    rounds: [
      { ask: 'How many stars? (10, 20, 30)', choices: ['There are thirty stars.', 'There are thirteen stars.', 'There are three stars.'], answer: 0 },
      { ask: 'Where is the moon?', choices: ['It’s above the rocket.', 'It’s below the rocket.', 'There are two.'], answer: 0, img: lostRobot(5) },
      { ask: 'Is it hot on Planet Sun?', choices: ['Yes! It’s hot and sunny.', 'No, it’s cold.', 'Go left!'], answer: 0, img: lostRobot(6) },
      { ask: 'Where is Biscuit’s hat?', choices: ['It’s up in the sky!', 'It’s on Biscuit.', 'There are ten.'], answer: 0, img: lostRobot(7) },
    ],
    prize: { img: item('kite'), label: 'Space kite' },
    doneLine: 'You opened the present! A kite for a windy day!',
  },
  {
    id: 'sm3-move-break', kind: 'prea1', teacher: 'Brain break: the hot planet and the windy planet! Move with Pip.',
    scene: {
      id: 'sm3-move-break', kind: 'tpr-actions', mode: 'break', bg: lostRobot(6), who: 'pip', teacher: 'Move with Pip!',
      rounds: [
        { line: 'It’s hot! Fan your face!', emoji: '\u{1F975}' },
        { line: 'It’s windy! Sway like a tree!', emoji: '\u{1F32C}\u{FE0F}' },
        { line: 'Catch the hat! Jump up!', emoji: '\u{1F452}' },
      ],
    },
  },
  {
    id: 'sm3-team-flags', kind: 'flag-race', bg: lostRobot(7), who: 'nova', title: 'Team Flags: ask and answer!',
    teacher: 'Free: turns change — on the student’s turn they answer; on the teacher’s turn the STUDENT reads the question aloud and the teacher answers. Every right answer moves a flag up the hill.',
    rounds: [
      { ask: 'How many stars are there? (40)', choices: ['There are forty stars.', 'There are four stars.', 'There is a star.'], answer: 0 },
      { ask: 'Where is the moon?', choices: ['It’s above the rocket.', 'It’s hot.', 'There are ten.'], answer: 0 },
      { ask: 'Where is Biscuit’s hat?', choices: ['It’s up, up in the sky!', 'It’s below the rocket.', 'There are two.'], answer: 0 },
      { ask: 'How many friends are there? (4)', choices: ['There are fourteen.', 'There are four.', 'It’s windy.'], answer: 1 },
      { ask: 'What comes after sixty?', choices: ['sixteen', 'seventy', 'fifty'], answer: 1 },
      { ask: 'Where is Nova?', choices: ['She’s on the left.', 'There are forty.', 'He’s a robot.'], answer: 0 },
    ],
    doneLine: 'Flags up! Great questions!',
  },
  /* Reading: The Lost Robot, pages 6-7 */
  {
    id: 'sm3-reader', kind: 'reader', bg: lostRobot(6), title: 'The Lost Robot', doneLine: 'Beep is not on Planet Sun or Planet Wind. Where is he? Find out next time!',
    teacher: 'Reading: a quick re-read of pages 4-5, then the new pages 6-7 (listen first). Tap any word to hear it.',
    pages: LOST_ROBOT.slice(3, 7),
  },
  {
    id: 'sm3-read-check', kind: 'prea1', teacher: 'Reading: read the sentence, look at the picture — tick or cross? (Cambridge Starters “look and read”)',
    scene: {
      id: 'sm3-read-check', kind: 'tick-cross', bg: bgDeep, who: 'pip', teacher: 'Read and look. Yes or no?',
      rounds: [
        { img: lostRobot(6), sentence: 'It is hot and sunny.', isTrue: true },
        { img: lostRobot(6), sentence: 'Beep is here.', isTrue: false },
        { img: lostRobot(7), sentence: 'It is windy.', isTrue: true },
        { img: lostRobot(7), sentence: 'Biscuit’s hat is on his head.', isTrue: false },
        { img: lostRobot(5), sentence: 'The moon is above the rocket.', isTrue: true },
      ],
    },
  },
  {
    id: 'sm3-listen-check', kind: 'true-false', bg: bgDeep, img: lostRobot(3),
    teacher: 'Guided: look at the picture and listen — yes or no? The student says the right sentence after every “no”.',
    rounds: [
      { who: 'nova', statement: 'There are four friends.', isTrue: true },
      { who: 'nova', statement: 'Biscuit is on the left.', isTrue: false },
      { who: 'nova', statement: 'The stars are above the friends.', isTrue: true },
      { who: 'nova', statement: 'There are two stars.', isTrue: false },
      { who: 'nova', statement: 'Nova is on the left.', isTrue: true },
    ],
  },
  /* Phonics: short u → Word Build → Blend & Read → tongue twister */
  {
    id: 'sm3-sound-u', kind: 'sound-model', bg: bgStation, who: 'pip', letter: 'U', phoneme: '/u/', sound: 'u', soundSide: 'center',
    teacher: 'Present: short u — a little “uh” from your tummy. Up, sun, umbrella. Find the u words.',
    anchors: [
      { word: 'sun', emoji: '\u{2600}\u{FE0F}', img: item('sun') },
      { word: 'umbrella', emoji: '\u{2602}\u{FE0F}', img: item('umbrella') },
      { word: 'nut', emoji: '\u{1F330}', img: item('nut') },
    ],
  },
  {
    id: 'sm3-word-build', kind: 'word-build', bg: bgStation,
    teacher: 'Reading: which vowel is missing in the middle? u, a or o? Pick it, then read the word.',
    rounds: [
      { word: 'sun', tiles: ['s', 'u', 'n'], blankIndex: 1, answer: 'u', choices: ['a', 'u', 'o'], img: item('sun'), emoji: '\u{2600}\u{FE0F}' },
      { word: 'nut', tiles: ['n', 'u', 't'], blankIndex: 1, answer: 'u', choices: ['u', 'o', 'e'], img: item('nut'), emoji: '\u{1F330}' },
      { word: 'pot', tiles: ['p', 'o', 't'], blankIndex: 1, answer: 'o', choices: ['u', 'o', 'a'], img: item('pot'), emoji: '\u{1F372}' },
      { word: 'run', tiles: ['r', 'u', 'n'], blankIndex: 1, answer: 'u', choices: ['a', 'i', 'u'], img: item('leo-run'), emoji: '\u{1F3C3}' },
    ],
  },
  {
    id: 'sm3-blend', kind: 'sound-blend', bg: bgStation, look: 'gumball',
    teacher: 'Reading: say each sound, blend, find the picture — then read the sentence.',
    rounds: [
      { word: 'up', img: item('rocket'), sentence: 'Up, up, up goes the rocket!' },
      { word: 'sun', img: item('sun'), sentence: 'It is hot on Planet Sun.' },
      { word: 'run', img: item('leo-run'), sentence: 'Run, Leo, run!' },
    ],
  },
  { id: 'sm3-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: lostRobot(7), who: 'pip', focus: 'u', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, then faster.', line: 'Run up, little pup, run up!' },
  /* Free: the child asks */
  {
    id: 'sm3-ask-nova', kind: 'join-stage', bg: lostRobot(3), teacher: 'Free: the STUDENT asks Nova two questions (How many…? Where is…?) and Nova answers. Evidence: asks 2 questions.', cast: ['nova'],
    turns: [
      { who: 'student', line: 'How many stars are there?' },
      { who: 'nova', line: 'There are forty stars!' },
      { who: 'student', line: 'Where is Biscuit?' },
      { who: 'nova', line: 'He’s on the right!' },
      { who: 'student', line: 'How many friends are there?' },
      { who: 'nova', line: 'There are four friends!' },
    ],
  },
  {
    id: 'sm3-ask-me', kind: 'join-stage', bg: bgStation, teacher: 'Free: now the student answers about their own room — Leo asks, the student counts and points.', cast: ['leo'],
    turns: [
      { who: 'leo', line: 'How many windows are in your room?' },
      { who: 'student', line: 'There are … windows.' },
      { who: 'leo', line: 'Where is your bed?' },
      { who: 'student', line: 'It’s on the left / on the right.' },
      { who: 'leo', line: 'Cool! My bed is below the window!' },
    ],
  },
  { id: 'sm3-i-can', kind: 'meet', focus: ['How many'], bg: lostRobot(7), who: 'nova', cardSide: 'left', teacher: 'Check: Listen & Colour 4 of 5, and the student asked 2 questions — then the passport stamp!', line: 'I can ask: How many…? Where is…?', repeat: 'Where is the moon?' },
  {
    id: 'sm3-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the sun sticker in their Sticker Book.',
    scene: {
      id: 'sm3-sticker', kind: 'sticker-reward', bg: lostRobot(6), who: 'pip', teacher: 'Sticker time!',
      line: 'Super listening! Here is your sticker.',
      sticker: { img: item('planet-sun'), label: 'Planet Sun explorer' },
    },
  },
  petPal('sm3-pet-pal', 2, 'It’s windy! My hat is up, up in the sky! I want a kite!', [{ label: 'kite', img: item('kite') }, { label: 'cake', img: item('cake') }, { label: 'moon', img: item('moon') }], 0, 'A kite! It’s windy — up it goes!'),
  {
    id: 'sm3-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'sm3-home-mission', kind: 'home-mission', bg: bgStation, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child sang "The Counting Rocket", practised listening for numbers and positions, and learned to ask "How many…?" and "Where is…?". Let them ask you two questions about your home.',
      steps: [
        { emoji: '\u{1F3B5}', say: 'Sing the Counting Rocket song.' },
        { emoji: '\u{2753}', say: 'Ask your family: How many cups are there?' },
        { emoji: '\u{1F50E}', say: 'Ask: Where is my bag?' },
      ],
    },
  },
  {
    id: 'sm3-move-break-2', kind: 'prea1', teacher: 'Brain break: count down for blast off!',
    scene: {
      id: 'sm3-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgDeep, who: 'pip', teacher: 'Blast off!',
      rounds: [
        { line: 'One hundred, ninety, eighty — crouch down!', emoji: '\u{1F680}' },
        { line: 'Thirty, twenty, ten — get ready!', emoji: '\u{23F3}' },
        { line: 'Go! Up, up, up!', emoji: '\u{1F4A5}' },
      ],
    },
  },
  goodbyeSong('sm3-goodbye-song', bgStation),
  { id: 'sm3-finale', kind: 'finale', bg: lostRobot(7), who: 'pip', line: 'You can ask How many? and Where is? Next time: the weather on the planets! \u{1F326}\u{FE0F}' },
];

/* =============================================================================
 * A1 Unit 3 Lesson 4: "What's the Weather on the Planets?"
 * Objective: I can say what the weather is like: "It's cold and snowy on Planet Ice."
 * Story frame: the TV weather studio — the child is the space weather reporter (new plot shape: a broadcast; new
 *   setting: Planet Ice, snowy blue light).
 * Practice ladder: Present (weather words, hot / cold) → Guided (Planet Weather Report map, Balloon Match, Draw That)
 *   → Free (the report on air, packing the bag, Weather Tower questions) → Reading (Reader p8-9, Sentence Build) →
 *   Phonics short o → check (a 3-sentence weather report).
 * ========================================================================= */

export const LESSON_A1U3L4_TITLE = 'What’s the Weather on the Planets?';
export const LESSON_A1U3L4_OBJECTIVE = 'I can say what the weather is like: "It\'s cold and snowy on Planet Ice."';

const WEATHER = {
  sunny: { label: 'sunny', img: item('sun') },
  windy: { label: 'windy', img: item('wind') },
  cloudy: { label: 'cloudy', img: item('cloud') },
  rainy: { label: 'rainy', img: item('rain') },
  snowy: { label: 'snowy', img: item('snow') },
};

export const LESSON_A1U3L4_SCENES: Scene[] = [
  { id: 'sm4-title', kind: 'title-card', bg: lostRobot(8), level: 'A1', unit: 'Unit 3', lessonLabel: 'Lesson 4', title: 'What’s the Weather on the Planets?', subtitle: 'Hot, cold, sunny, snowy — you are the weather reporter!', cta: '\u{1F326}\u{FE0F} LET’S GO!' },
  {
    id: 'sm4-recall-warmup', kind: 'recall-warmup', bg: bgDeep, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 3 · Lesson 3 · The Counting Rocket',
    teacher: 'Guided: listen — click the number, then ask Pip a question with How many…?',
    items: [
      { word: 'forty', say: 'How many stars? There are forty stars.', img: numCard(40) },
      { word: 'seventy', say: 'There are seventy rockets.', img: numCard(70) },
      { word: 'ninety', say: 'There are ninety moons!', img: numCard(90) },
    ],
  },
  {
    id: 'sm4-weather-words', kind: 'prea1', teacher: 'Present: the weather words — listen, say and show each one with your body (sun: arms in a circle; wind: sway; snow: shiver).',
    scene: {
      id: 'sm4-weather-words', kind: 'listen-repeat-cards', bg: bgDeep, teacher: 'Listen and say it!',
      cards: [
        { who: 'pip', sentence: 'It’s sunny.', img: WEATHER.sunny.img, imgLabel: 'sunny' },
        { who: 'pip', sentence: 'It’s windy.', img: WEATHER.windy.img, imgLabel: 'windy' },
        { who: 'pip', sentence: 'It’s cloudy.', img: WEATHER.cloudy.img, imgLabel: 'cloudy' },
        { who: 'pip', sentence: 'It’s rainy.', img: WEATHER.rainy.img, imgLabel: 'rainy' },
        { who: 'pip', sentence: 'It’s snowy.', img: WEATHER.snowy.img, imgLabel: 'snowy' },
      ],
    },
  },
  { id: 'sm4-meet-hot', kind: 'meet', focus: ['hot'], bg: lostRobot(6), who: 'nova', cardSide: 'left', teacher: 'Present: hot! Fan your face. Say it with Nova.', line: 'Phew! It’s hot and sunny on Planet Sun!', repeat: 'It’s hot and sunny.' },
  { id: 'sm4-meet-cold', kind: 'meet', focus: ['cold'], bg: lostRobot(8), who: 'nova', cardSide: 'left', teacher: 'Present: cold! Shiver and hug yourself. Say it with Nova.', line: 'Brrr! It’s cold and snowy on Planet Ice!', repeat: 'It’s cold and snowy.' },
  { id: 'sm4-meet-weather', kind: 'meet', focus: ['weather'], bg: lostRobot(7), who: 'pip', cardSide: 'right', teacher: 'Present: the question. Pip asks — the student looks at the picture and answers: It’s windy!', line: 'What’s the weather like? It’s windy!', repeat: 'What’s the weather like?' },
  { id: 'sm4-echo', kind: 'echo', bg: lostRobot(8), who: 'pip', textSide: 'top', teacher: 'Guided: say it like Pip — a cold, shivery voice!', word: 'It’s cold and snowy on Planet Ice.' },
  { id: 'sm4-echo-2', kind: 'echo', bg: lostRobot(7), who: 'nova', textSide: 'top', teacher: 'Guided: ask like a TV reporter!', word: 'What’s the weather like?' },
  {
    id: 'sm4-bag-words', kind: 'prea1', teacher: 'Present: what do you need? Listen and say each one — mime putting it on.',
    scene: {
      id: 'sm4-bag-words', kind: 'listen-repeat-cards', bg: bgStation, teacher: 'Listen and say it!',
      cards: [
        { who: 'pip', sentence: 'It’s cold. I need a scarf.', img: item('scarf'), imgLabel: 'scarf' },
        { who: 'pip', sentence: 'It’s sunny. I need sunglasses.', img: item('sunglasses'), imgLabel: 'sunglasses' },
        { who: 'pip', sentence: 'It’s rainy. I need an umbrella.', img: item('umbrella'), imgLabel: 'umbrella' },
        { who: 'pip', sentence: 'It’s snowy. I need a coat.', img: item('coat-blue'), imgLabel: 'coat' },
      ],
    },
  },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'sm4-weather-match', kind: 'picture-match', look: 'chalk', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its picture (or taps it, then the picture), then reads it aloud.',
    items: [
      { word: 'It’s sunny.', img: WEATHER.sunny.img },
      { word: 'It’s windy.', img: WEATHER.windy.img },
      { word: 'It’s cloudy.', img: WEATHER.cloudy.img },
      { word: 'It’s rainy.', img: WEATHER.rainy.img },
      { word: 'It’s snowy.', img: WEATHER.snowy.img },
    ],
    bg: bgStation,
  },
  /* ★ Signature: Planet Weather Report */
  {
    id: 'sm4-weather-report', kind: 'weather-report', bg: bgStation, who: 'nova', title: 'Space Weather Report',
    teacher: 'Guided → Free: 1) the map — listen to the forecast, tap the weather sticker, then the planet. 2) On air — the student READS each planet’s report to the camera. 3) Pack the bag — the weather decides what goes in.',
    planets: [
      { name: 'Planet Sun', img: item('planet-sun'), weather: ['sunny'], forecast: 'On Planet Sun it’s hot and sunny.', report: 'Good morning! On Planet Sun it’s hot and sunny.' },
      { name: 'Planet Wind', img: item('planet-wind'), weather: ['windy', 'cloudy'], forecast: 'On Planet Wind it’s windy and cloudy.', report: 'On Planet Wind it’s windy and cloudy. Hold your hat!' },
      { name: 'Planet Ice', img: item('planet-ice'), weather: ['snowy'], forecast: 'On Planet Ice it’s cold and snowy.', report: 'On Planet Ice it’s cold and snowy. Brrr!' },
      { name: 'Planet Rain', img: item('planet-rain'), weather: ['rainy'], forecast: 'On Planet Rain it’s rainy.', report: 'On Planet Rain it’s rainy. Goodbye from the weather!' },
    ],
    icons: [
      { key: 'sunny', ...WEATHER.sunny }, { key: 'windy', ...WEATHER.windy }, { key: 'cloudy', ...WEATHER.cloudy },
      { key: 'rainy', ...WEATHER.rainy }, { key: 'snowy', ...WEATHER.snowy },
    ],
    bag: [
      { planet: 2, line: 'We’re going to Planet Ice! It’s cold and snowy. What do we need?', choices: [{ label: 'sunglasses', img: item('sunglasses') }, { label: 'scarf', img: item('scarf') }, { label: 'umbrella', img: item('umbrella') }], answer: 1, say: 'A scarf! It’s cold on Planet Ice.' },
      { planet: 0, line: 'We’re going to Planet Sun! It’s hot and sunny. What do we need?', choices: [{ label: 'coat', img: item('coat-blue') }, { label: 'umbrella', img: item('umbrella') }, { label: 'sunglasses', img: item('sunglasses') }], answer: 2, say: 'Sunglasses! It’s sunny on Planet Sun.' },
      { planet: 3, line: 'We’re going to Planet Rain! It’s rainy. What do we need?', choices: [{ label: 'umbrella', img: item('umbrella') }, { label: 'sunglasses', img: item('sunglasses') }, { label: 'kite', img: item('kite') }], answer: 0, say: 'An umbrella! It’s rainy on Planet Rain.' },
      { planet: 1, line: 'We’re going to Planet Wind! It’s windy. What can we play with?', choices: [{ label: 'scarf', img: item('scarf') }, { label: 'kite', img: item('kite') }, { label: 'umbrella', img: item('umbrella') }], answer: 1, say: 'A kite! It’s windy on Planet Wind.' },
    ],
    doneLine: 'That’s the space weather! Great reporting!',
  },
  {
    id: 'sm4-balloon-match', kind: 'balloon-match', bg: bgDeep, who: 'nova', title: 'Balloon Match: which planet?',
    teacher: 'Reading game: the student reads a balloon (tap it to hear it), then taps the planet it describes. The balloon floats down and pops!',
    pairs: [
      { text: 'It’s hot and sunny.', img: item('planet-sun'), label: 'Planet Sun' },
      { text: 'It’s windy.', img: item('planet-wind'), label: 'Planet Wind' },
      { text: 'It’s cold and snowy.', img: item('planet-ice'), label: 'Planet Ice' },
      { text: 'It’s rainy.', img: item('planet-rain'), label: 'Planet Rain' },
    ],
    doneLine: 'Pop, pop! You can read the weather!',
  },
  {
    id: 'sm4-move-break', kind: 'prea1', teacher: 'Brain break: weather mime! Pip says the weather — the student acts it out.',
    scene: {
      id: 'sm4-move-break', kind: 'tpr-actions', mode: 'break', bg: lostRobot(8), who: 'pip', teacher: 'Act the weather!',
      rounds: [
        { line: 'It’s hot! Fan your face!', emoji: '\u{2600}\u{FE0F}' },
        { line: 'It’s rainy! Open your umbrella!', emoji: '\u{2602}\u{FE0F}' },
        { line: 'It’s windy! Hold your hat!', emoji: '\u{1F32C}\u{FE0F}' },
        { line: 'It’s cold and snowy! Shiver, brrr!', emoji: '\u{2744}\u{FE0F}' },
      ],
    },
  },
  {
    id: 'sm4-draw-that', kind: 'draw-guess', bg: bgStation, who: 'leo', title: 'Draw That! What’s the weather?',
    teacher: 'Game: take turns. The drawer sees a secret weather and draws it (no words!); the other one taps the picture and says it: It’s sunny! In a live class each screen shows only its own role.',
    rounds: [
      { drawer: 'teacher', secret: 0, options: [{ label: 'sunny', img: WEATHER.sunny.img, say: 'It’s sunny!' }, { label: 'rainy', img: WEATHER.rainy.img, say: 'It’s rainy!' }, { label: 'snowy', img: WEATHER.snowy.img, say: 'It’s snowy!' }, { label: 'cloudy', img: WEATHER.cloudy.img, say: 'It’s cloudy!' }], doodle: ['M 420 300 a 80 80 0 1 0 160 0 a 80 80 0 1 0 -160 0', 'M 500 170 L 500 115', 'M 500 430 L 500 485', 'M 370 300 L 315 300', 'M 630 300 L 685 300', 'M 405 205 L 368 168', 'M 595 205 L 632 168', 'M 405 395 L 368 432', 'M 595 395 L 632 432'] },
      { drawer: 'student', secret: 2, options: [{ label: 'windy', img: WEATHER.windy.img, say: 'It’s windy!' }, { label: 'sunny', img: WEATHER.sunny.img, say: 'It’s sunny!' }, { label: 'snowy', img: WEATHER.snowy.img, say: 'It’s snowy!' }, { label: 'rainy', img: WEATHER.rainy.img, say: 'It’s rainy!' }] },
      { drawer: 'teacher', secret: 1, options: [{ label: 'cloudy', img: WEATHER.cloudy.img, say: 'It’s cloudy!' }, { label: 'rainy', img: WEATHER.rainy.img, say: 'It’s rainy!' }, { label: 'sunny', img: WEATHER.sunny.img, say: 'It’s sunny!' }, { label: 'windy', img: WEATHER.windy.img, say: 'It’s windy!' }], doodle: ['M 330 330 Q 300 260 370 245 Q 385 175 465 190 Q 520 130 590 180 Q 680 175 678 250 Q 735 285 690 340 Z', 'M 400 400 L 385 455', 'M 470 400 L 455 455', 'M 540 400 L 525 455', 'M 610 400 L 595 455'] },
      { drawer: 'student', secret: 3, options: [{ label: 'snowy', img: WEATHER.snowy.img, say: 'It’s snowy!' }, { label: 'cloudy', img: WEATHER.cloudy.img, say: 'It’s cloudy!' }, { label: 'rainy', img: WEATHER.rainy.img, say: 'It’s rainy!' }, { label: 'windy', img: WEATHER.windy.img, say: 'It’s windy!' }] },
    ],
    doneLine: 'Great drawing! Great guessing!',
  },
  {
    id: 'sm4-weather-tower', kind: 'tower-pull', bg: lostRobot(8), who: 'nova', title: 'Ice Tower: what’s the weather?',
    teacher: 'Game: answer the question, then pull one ice block out of the tower. Careful — don’t let it fall!',
    rounds: [
      { ask: 'What’s the weather like on Planet Ice?', choices: ['It’s cold and snowy.', 'It’s hot and sunny.'], answer: 0, img: item('planet-ice') },
      { ask: 'What’s the weather like?', choices: ['It’s windy.', 'It’s snowy.'], answer: 0, img: lostRobot(7) },
      { ask: 'It’s rainy. What do you need?', choices: ['An umbrella.', 'Sunglasses.'], answer: 0, img: item('umbrella') },
      { ask: 'What’s the weather like?', choices: ['It’s cloudy.', 'It’s hot and sunny.'], answer: 1, img: lostRobot(6) },
      { ask: 'Is it hot on Planet Ice?', choices: ['No, it’s cold.', 'Yes, it’s hot.'], answer: 0 },
    ],
    doneLine: 'The tower is still standing! Weather champion!',
  },
  {
    id: 'sm4-go-fish', kind: 'go-fish', bg: bgStation, who: 'nova', friendImg: item('nova'), title: 'Go Fish! Weather cards',
    teacher: 'Game: the student asks Nova “Have you got sunny?” — “Yes! Here you are.” or “No! Go fish!”. Then Nova asks and the student answers. Say the weather sentence with every pair: It’s sunny!',
    cards: [
      { label: 'sunny', img: item('sun') }, { label: 'windy', img: item('wind') }, { label: 'cloudy', img: item('cloud') },
      { label: 'rainy', img: item('rain') }, { label: 'snowy', img: item('snow') },
    ],
    childHand: ['sunny', 'windy', 'cloudy'], friendHand: ['rainy', 'snowy', 'sunny'], pond: ['windy', 'rainy', 'cloudy', 'snowy'],
    doneLine: 'All pairs! You know the weather!',
  },
  /* Reading: The Lost Robot, pages 8-9 */
  {
    id: 'sm4-reader', kind: 'reader', bg: lostRobot(8), title: 'The Lost Robot', doneLine: 'Beep, beep! Is it Beep? Find out next time!',
    teacher: 'Reading: a quick re-read of pages 6-7, then the new pages 8-9 (listen first). Tap any word to hear it.',
    pages: LOST_ROBOT.slice(5, 9),
  },
  {
    id: 'sm4-sentence-build', kind: 'sentence-build', bg: lostRobot(8), teacher: 'Reading: put the words of the story in order, then read the sentence.',
    rounds: [
      { words: ['It', 'is', 'cold', 'and', 'snowy.'], img: lostRobot(8) },
      { words: ['Look!', 'Little', 'tracks.'], img: lostRobot(8) },
      { words: ['It', 'is', 'below', 'us.'], img: lostRobot(9) },
      { words: ['Go', 'down!', 'Go', 'right!'], img: lostRobot(9), extra: ['up!'] },
    ],
  },
  /* Phonics: short o → Brick Crush → Blend & Read → tongue twister */
  {
    id: 'sm4-sound-o', kind: 'sound-model', bg: bgStation, who: 'pip', letter: 'O', phoneme: '/o/', sound: 'o', soundSide: 'center',
    teacher: 'Present: short o — open your mouth wide like a doctor says “ah”: o. Octopus, pot, mop.',
    anchors: [
      { word: 'octopus', emoji: '\u{1F419}', img: item('octopus') },
      { word: 'pot', emoji: '\u{1F372}', img: item('pot') },
      { word: 'mop', emoji: '\u{1F9F9}', img: item('mop') },
    ],
  },
  {
    id: 'sm4-brick-o', kind: 'prea1', teacher: 'Reading: Brick Crush! Listen to the sound, then smash every brick with that letter — o, u or a.',
    scene: { id: 'sm4-brick-o', kind: 'brick-crush', bg: bgDeep, teacher: 'Listen to the sound, then tap every brick with that letter.', who: 'pip', letters: ['O', 'U', 'A'], rows: 4, cols: 7, goal: 14, seconds: 60 },
  },
  {
    id: 'sm4-blend', kind: 'sound-blend', bg: bgStation, look: 'frog',
    teacher: 'Reading: say each sound, blend, find the picture — then read the sentence.',
    rounds: [
      { word: 'hot', img: item('planet-sun'), sentence: 'It is hot on Planet Sun.' },
      { word: 'pot', img: item('pot'), sentence: 'A hot pot!' },
      { word: 'mop', img: item('mop'), sentence: 'Beep has a mop.' },
    ],
  },
  { id: 'sm4-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: lostRobot(6), who: 'pip', focus: 'o', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, then faster.', line: 'A hot pot on a hot top.' },
  /* Free: my own weather report */
  {
    id: 'sm4-my-report', kind: 'join-stage', bg: bgStation, teacher: 'Free (evidence): the student picks a planet and gives a 3-sentence weather report to Nova’s camera — then the weather today where they live.', cast: ['nova'],
    turns: [
      { who: 'nova', line: 'Hello, weather reporter! What’s the weather like on your planet?' },
      { who: 'student', line: 'On Planet … it’s … and … . You need a … !' },
      { who: 'nova', line: 'Thank you! And what’s the weather like at your home today?' },
      { who: 'student', line: 'It’s … today.' },
      { who: 'nova', line: 'Great report! Back to the studio!' },
    ],
  },
  {
    id: 'sm4-guess-planet', kind: 'join-stage', bg: lostRobot(8), teacher: 'Free: guess the planet — the student describes the weather, Pip guesses the planet. Then swap.', cast: ['pip'],
    turns: [
      { who: 'student', line: 'It’s cold and snowy.' },
      { who: 'pip', line: 'Is it Planet Ice?' },
      { who: 'student', line: 'Yes! Now you, Pip!' },
      { who: 'pip', line: 'It’s hot and sunny.' },
      { who: 'student', line: 'It’s Planet Sun!' },
    ],
  },
  { id: 'sm4-i-can', kind: 'meet', focus: ['weather'], bg: lostRobot(8), who: 'nova', cardSide: 'left', teacher: 'Check: a 3-sentence weather report for one planet — then the passport stamp!', line: 'I can say what the weather is like!', repeat: 'It’s cold and snowy on Planet Ice.' },
  {
    id: 'sm4-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the snowflake sticker in their Sticker Book.',
    scene: {
      id: 'sm4-sticker', kind: 'sticker-reward', bg: lostRobot(8), who: 'pip', teacher: 'Sticker time!',
      line: 'Super weather report! Here is your sticker.',
      sticker: { img: item('snow'), label: 'Weather reporter' },
    },
  },
  petPal('sm4-pet-pal', 3, 'Brrr! It’s cold and snowy! I want a scarf!', [{ label: 'sunglasses', img: item('sunglasses') }, { label: 'scarf', img: item('scarf') }, { label: 'kite', img: item('kite') }], 1, 'A scarf! Warm and cosy!'),
  {
    id: 'sm4-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'sm4-home-mission', kind: 'home-mission', bg: bgStation, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned weather words (hot, cold, sunny, windy, cloudy, rainy, snowy) and gave a space weather report. Ask them every morning this week: "What\'s the weather like?"',
      steps: [
        { emoji: '\u{1FA9F}', say: 'Look out of the window.' },
        { emoji: '\u{1F4FA}', say: 'Tell your family the weather: It’s sunny and hot!' },
        { emoji: '\u{1F392}', say: 'Say what you need: an umbrella, a scarf…' },
      ],
    },
  },
  {
    id: 'sm4-move-break-2', kind: 'prea1', teacher: 'Brain break: walk on the planets!',
    scene: {
      id: 'sm4-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgDeep, who: 'pip', teacher: 'Walk on the planets!',
      rounds: [
        { line: 'Walk on Planet Ice — slip, slide!', emoji: '\u{1F9CA}' },
        { line: 'Walk on Planet Sun — hot feet, hop!', emoji: '\u{1F525}' },
        { line: 'Walk on Planet Wind — lean, lean!', emoji: '\u{1F32C}\u{FE0F}' },
      ],
    },
  },
  goodbyeSong('sm4-goodbye-song', bgStation),
  { id: 'sm4-finale', kind: 'finale', bg: lostRobot(9), who: 'pip', line: 'You can give a weather report! Next time: can we find Beep? \u{1F916}' },
];

/* =============================================================================
 * A1 Unit 3 Lesson 5: "Storybook: The Lost Robot"
 * Objective: I can read "The Lost Robot" with help and say where Beep was and what the weather was like.
 * Story frame: the whole book, a rescue in the snow (Planet Ice by night-blue light; the countdown home).
 * Practice ladder: Predict → Reader part 1 (p1-9) → the pause (the child gives the directions) → Reader part 2 (p10-12)
 *   → Guided (Treasure Radar: find Beep, Story Order, Story Gaps) → Free (act it out, retell) → Phonics review (Sound
 *   Pick th / u / o, Picture Crossword) → check (reads 4 pages alone).
 * ========================================================================= */

export const LESSON_A1U3L5_TITLE = 'Storybook: The Lost Robot';
export const LESSON_A1U3L5_OBJECTIVE = 'I can read "The Lost Robot" with help and say where Beep was and what the weather was like.';

export const LESSON_A1U3L5_SCENES: Scene[] = [
  { id: 'sm5-title', kind: 'title-card', bg: lostRobot(10), level: 'A1', unit: 'Unit 3', lessonLabel: 'Lesson 5', title: 'Storybook: The Lost Robot', subtitle: 'Where is Beep? Let’s read the whole story!', cta: '\u{1F4D6} LET’S READ!' },
  {
    id: 'sm5-recall-warmup', kind: 'recall-warmup', bg: bgDeep, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 3 · Lesson 4 · Planet Weather',
    teacher: 'Guided: listen — which planet is it? Click it, then say the weather.',
    items: [
      { word: 'Planet Ice', say: 'It’s cold and snowy.', img: item('planet-ice') },
      { word: 'Planet Sun', say: 'It’s hot and sunny.', img: item('planet-sun') },
      { word: 'Planet Rain', say: 'It’s rainy.', img: item('planet-rain') },
    ],
  },
  { id: 'sm5-predict', kind: 'meet', focus: ['Beep'], bg: lostRobot(4), who: 'nova', cardSide: 'left', teacher: 'Predict: look at the empty box. Where is Beep? Is he on Planet Sun? On Planet Ice? The student guesses — then we read.', line: 'Where is Beep? What do you think?', repeat: 'Beep is on Planet …' },
  { id: 'sm5-echo-lost', kind: 'echo', bg: lostRobot(4), who: 'nova', textSide: 'top', teacher: 'Guided: say it like Nova — a worried voice!', word: 'Oh no! Beep is lost!' },
  {
    id: 'sm5-book-1', kind: 'reader', bg: lostRobot(1), title: 'The Lost Robot', doneLine: 'Beep, beep! It is below us! How do we get there?',
    teacher: 'Reading: part 1 — the student reads pages 1-9 (listen first only where needed). Tap any word to hear it.',
    pages: LOST_ROBOT.slice(0, 9),
  },
  {
    id: 'sm5-pause', kind: 'choice', bg: lostRobot(9), who: 'nova',
    teacher: 'The pause: the student gives the directions to Beep — look at the tracks (down the hill, to the right). A wrong pick: look at the picture again and point.',
    prompt: 'Beep is below us! How do we get to Beep?',
    options: [
      { label: 'Go up! Go left!', emoji: '\u{2B06}\u{FE0F}' },
      { label: 'Go down! Go right!', emoji: '\u{2B07}\u{FE0F}', correct: true },
      { label: 'Go up! Go right!', emoji: '\u{27A1}\u{FE0F}' },
    ],
  },
  {
    id: 'sm5-radar', kind: 'hot-cold', bg: lostRobot(8), who: 'nova', title: 'Treasure Radar: find Beep!',
    teacher: 'Game: Beep is hidden in the snow. The student taps to search and listens — Cold! Warm! Hot! When it pops out, they say the sentence.',
    rounds: [
      { label: 'Beep', img: item('beep'), x: 90, y: 84, find: 'Where is Beep? Find him!', say: 'Here he is! Beep is in the snow!' },
      { label: 'hat', img: item('hat'), x: 8, y: 86, find: 'Where is Biscuit’s hat? Find it!', say: 'Here it is! Biscuit’s hat!' },
      { label: 'star', img: item('star-gold'), x: 50, y: 92, find: 'Where is the gold star? Find it!', say: 'Here it is! A gold star!' },
    ],
    doneLine: 'You found Beep! Hooray!',
  },
  {
    id: 'sm5-book-2', kind: 'reader', bg: lostRobot(10), title: 'The Lost Robot', doneLine: 'The end! Beep is home — thank you, Biscuit!',
    teacher: 'Reading: part 2 — the student reads pages 10-12, the happy end.',
    pages: LOST_ROBOT.slice(9, 12),
  },
  { id: 'sm5-meet-beep', kind: 'meet', focus: ['cold'], bg: lostRobot(10), who: 'beep', cardSide: 'right', teacher: 'Present: meet Beep at last! Shiver with him, then say his line.', line: 'Beep, beep! I am cold. I am lost!', repeat: 'I am cold!' },
  { id: 'sm5-echo-thanks', kind: 'echo', bg: lostRobot(11), who: 'nova', textSide: 'top', teacher: 'Guided: a happy voice! Say thank you to Biscuit.', word: 'Thank you, Biscuit!' },
  { id: 'sm5-meet-biscuit', kind: 'meet', focus: ['finds'], bg: lostRobot(11), who: 'pip', cardSide: 'left', teacher: 'Present: who is the hero? Point to Biscuit and say it.', line: 'Look! Biscuit finds Beep!', repeat: 'Biscuit finds Beep!' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'sm5-story-match', kind: 'picture-match', look: 'cards', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its picture (or taps it, then the picture), then reads it aloud.',
    items: [
      { word: 'Oh no! Beep is lost!', img: lostRobot(4), crop: { x: 0, y: 0, w: 100, h: 100 }, imgAspect: 16 / 9 },
      { word: 'I am cold. I am lost!', img: lostRobot(10), crop: { x: 0, y: 0, w: 100, h: 100 }, imgAspect: 16 / 9 },
      { word: 'Look! Biscuit finds Beep!', img: lostRobot(11), crop: { x: 0, y: 0, w: 100, h: 100 }, imgAspect: 16 / 9 },
    ],
    bg: bgStation,
  },
  {
    id: 'sm5-story-order', kind: 'prea1', teacher: 'Guided: put the story pictures in order, then tell it: first, then, then, at the end!',
    scene: {
      id: 'sm5-story-order', kind: 'story-order', bg: lostRobot(12), who: 'pip',
      teacher: 'Put the pictures in order, then tell the story!',
      frames: [
        { img: lostRobot(4), caption: 'Oh no! Where is Beep?' },
        { img: lostRobot(6), caption: 'It is hot and sunny. Beep is not here.' },
        { img: lostRobot(8), caption: 'It is cold and snowy. Look! Little tracks.' },
        { img: lostRobot(11), caption: 'Biscuit finds Beep!' },
        { img: lostRobot(12), caption: 'Up, up, up! Beep is home.' },
      ],
    },
  },
  {
    id: 'sm5-story-gaps', kind: 'grammar-gap', bg: bgDeep, title: 'Read and Choose',
    teacher: 'Reading: read the sentence from the story and choose the missing word. Then read it all.',
    rounds: [
      { before: 'Beep is my', after: '. He is lost!', choices: ['robot', 'rocket'], answer: 'robot', img: lostRobot(4) },
      { before: 'The moon is', after: 'the rocket.', choices: ['above', 'below'], answer: 'above', img: lostRobot(5) },
      { before: 'It is hot and', after: '.', choices: ['snowy', 'sunny'], answer: 'sunny', img: lostRobot(6) },
      { before: 'It is', after: 'and snowy.', choices: ['cold', 'hot'], answer: 'cold', img: lostRobot(8) },
      { before: 'Biscuit', after: 'Beep!', choices: ['finds', 'counts'], answer: 'finds', img: lostRobot(11) },
    ],
  },
  {
    id: 'sm5-story-quiz', kind: 'quiz-board', bg: lostRobot(12), who: 'nova', title: 'Story Quiz Board!',
    teacher: 'Guided: the student picks any tile — harder questions are worth more. Answer, then say it aloud. One tile is a BOOM tile: double points!',
    categories: [
      { name: 'Where?', emoji: '\u{1F9ED}', tiles: [{ ask: 'Where is the moon?', choices: ['Above the rocket.', 'Below the rocket.'], answer: 0, img: lostRobot(5) }, { ask: 'Where is Beep?', choices: ['Below us.', 'Above us.'], answer: 0, img: lostRobot(9) }, { ask: 'How do we get to Beep?', choices: ['Go down! Go right!', 'Go up! Go left!'], answer: 0 }] },
      { name: 'Weather', emoji: '\u{1F326}\u{FE0F}', tiles: [{ ask: 'What’s the weather like?', choices: ['It’s hot and sunny.', 'It’s snowy.'], answer: 0, img: lostRobot(6) }, { ask: 'What’s the weather like?', choices: ['It’s windy.', 'It’s rainy.'], answer: 0, img: lostRobot(7) }, { ask: 'Where is it cold and snowy?', choices: ['On Planet Ice.', 'On Planet Sun.'], answer: 0 }] },
      { name: 'Who?', emoji: '\u{1F916}', tiles: [{ ask: 'Who is Beep?', choices: ['Nova’s robot.', 'Nova’s puppy.'], answer: 0 }, { ask: 'Who finds Beep?', choices: ['Biscuit.', 'Leo.'], answer: 0, img: lostRobot(11) }, { ask: 'Who has a rocket?', choices: ['Captain Nova.', 'Biscuit.'], answer: 0, img: lostRobot(2) }] },
    ],
    boom: [2, 1],
    doneLine: 'The board is finished! Story champion!',
  },
  {
    id: 'sm5-move-break', kind: 'prea1', teacher: 'Brain break: the countdown home! Count down in tens and blast off.',
    scene: {
      id: 'sm5-move-break', kind: 'tpr-actions', mode: 'break', bg: lostRobot(12), who: 'pip', teacher: 'Blast off home!',
      rounds: [
        { line: 'Ten, nine, eight — crouch down!', emoji: '\u{1F680}' },
        { line: 'Three, two, one — Go!', emoji: '\u{1F4A5}' },
        { line: 'Up, up, up! Wave goodbye to Planet Ice!', emoji: '\u{1F44B}' },
      ],
    },
  },
  {
    id: 'sm5-act-out', kind: 'join-stage', bg: lostRobot(11), teacher: 'Free: act it out! The student is Nova (or Biscuit), the teacher is Beep. Use the story lines and your own.', cast: ['beep', 'nova'],
    turns: [
      { who: 'beep', line: 'Beep, beep! I am cold. I am lost!' },
      { who: 'student', line: 'Beep! Here you are!' },
      { who: 'beep', line: 'Where are we? What’s the weather like?' },
      { who: 'student', line: 'We are on Planet Ice. It is cold and snowy!' },
      { who: 'nova', line: 'Let’s go home! Ten, nine, eight…' },
      { who: 'student', line: 'Go! Up, up, up!' },
    ],
  },
  { id: 'sm5-echo-home', kind: 'echo', bg: lostRobot(12), who: 'pip', textSide: 'top', teacher: 'Guided: count down like Pip — quiet, then LOUD on “Go!”', word: 'Ten, nine, eight… Go! Up, up, up!' },
  /* Phonics review: th, u, o → Sound Pick → Picture Crossword → Blend & Read → twister */
  {
    id: 'sm5-sound-pick', kind: 'prea1', teacher: 'Reading: Sound Pick! Hear the sound, pick the picture that starts with it — th, u or o.',
    scene: {
      id: 'sm5-sound-pick', kind: 'sound-pick', bg: bgDeep, who: 'pip', teacher: 'Which one starts with this sound?',
      rounds: [
        { sound: 'th', options: [{ word: 'sun', img: item('sun') }, { word: 'three', img: item('three') }, { word: 'octopus', img: item('octopus') }], answer: 1 },
        { sound: 'u', options: [{ word: 'umbrella', img: item('umbrella') }, { word: 'thumb', img: item('thumb') }, { word: 'moon', img: item('moon') }], answer: 0 },
        { sound: 'o', options: [{ word: 'rocket', img: item('rocket') }, { word: 'nut', img: item('nut') }, { word: 'octopus', img: item('octopus') }], answer: 2 },
      ],
    },
  },
  {
    id: 'sm5-crossword', kind: 'crossword', bg: bgDeep, who: 'nova', title: 'Story Crossword',
    teacher: 'Spelling game: tap a picture, then tap the letters to fill its squares. Crossing letters help! Say each word when it is done.',
    words: [
      { word: 'moon', img: item('moon'), say: 'Moon! The moon is above the rocket.' },
      { word: 'robot', img: item('beep'), say: 'Robot! Beep is a robot.' },
      { word: 'snow', img: item('snow'), say: 'Snow! It is cold and snowy.' },
      { word: 'sun', img: item('sun'), say: 'Sun! It is hot and sunny.' },
      { word: 'star', img: item('star-gold'), say: 'Star! Look at the stars!' },
      { word: 'rocket', img: item('rocket'), say: 'Rocket! This is my rocket.' },
    ],
    doneLine: 'You did the whole crossword!',
  },
  {
    id: 'sm5-blend', kind: 'sound-blend', bg: bgStation,
    teacher: 'Reading: the unit’s sounds — blend, find the picture, then read the sentence.',
    rounds: [
      { word: 'thin', sounds: ['th', 'i', 'n'], img: item('thread'), sentence: 'Beep has a thin arm.' },
      { word: 'nut', img: item('nut'), sentence: 'Biscuit has a nut.' },
      { word: 'pot', img: item('pot'), sentence: 'Nova has a hot pot.' },
      { word: 'ring', sounds: ['r', 'ing'], img: item('ring'), sentence: 'Ring, ring! Beep is home.' },
    ],
  },
  { id: 'sm5-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: lostRobot(12), who: 'pip', focus: 'u', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, then faster.', line: 'Up, up, up the rocket runs!' },
  /* Free: retell */
  {
    id: 'sm5-retell', kind: 'join-stage', bg: lostRobot(12), teacher: 'Free (evidence): the student retells the story in 3-4 sentences: where Beep was, the weather, who found him.', cast: ['leo'],
    turns: [
      { who: 'leo', line: 'Tell me the story! Where was Beep?' },
      { who: 'student', line: 'Beep was on Planet … It was … and … .' },
      { who: 'leo', line: 'Who found him?' },
      { who: 'student', line: 'Biscuit found Beep!' },
      { who: 'leo', line: 'And then?' },
      { who: 'student', line: 'Ten, nine, eight… Go! Beep is home.' },
    ],
  },
  {
    id: 'sm5-favourite', kind: 'join-stage', bg: lostRobot(11), teacher: 'Free: the student says which page they like and why — Pip says his favourite page.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'Which page do you like?' },
      { who: 'student', line: 'I like page … ! It’s …' },
      { who: 'pip', line: 'I like page eleven. Biscuit finds Beep!' },
    ],
  },
  { id: 'sm5-i-can', kind: 'meet', focus: ['story'], bg: lostRobot(11), who: 'nova', cardSide: 'left', teacher: 'Check: the student read 4 pages alone and said where Beep was and what the weather was like — then the passport stamp!', line: 'I can read the story of the Lost Robot!', repeat: 'Biscuit finds Beep!' },
  {
    id: 'sm5-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Beep sticker in their Sticker Book.',
    scene: {
      id: 'sm5-sticker', kind: 'sticker-reward', bg: lostRobot(12), who: 'pip', teacher: 'Sticker time!',
      line: 'Super reading! Here is your Beep sticker.',
      sticker: { img: item('beep'), label: 'Robot rescuer' },
    },
  },
  petPal('sm5-pet-pal', 4, 'I found Beep! I want a robot friend!', [{ label: 'robot', img: item('beep') }, { label: 'rocket', img: item('rocket') }, { label: 'scarf', img: item('scarf') }], 0, 'A robot! Beep, beep!'),
  {
    id: 'sm5-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'sm5-home-mission', kind: 'home-mission', bg: bgStation, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child read the whole story "The Lost Robot". Ask them to read it to you and to tell you where Beep was and what the weather was like.',
      steps: [
        { emoji: '\u{1F4D6}', say: 'Read the story to your family.' },
        { emoji: '\u{1F916}', say: 'Tell them: where was Beep?' },
        { emoji: '\u{2744}\u{FE0F}', say: 'What was the weather like?' },
      ],
    },
  },
  {
    id: 'sm5-move-break-2', kind: 'prea1', teacher: 'Brain break: move like the story!',
    scene: {
      id: 'sm5-move-break-2', kind: 'tpr-actions', mode: 'break', bg: lostRobot(10), who: 'pip', teacher: 'Move like the story!',
      rounds: [
        { line: 'Walk like a robot! Beep, beep!', emoji: '\u{1F916}' },
        { line: 'Sniff like Biscuit! Sniff, sniff!', emoji: '\u{1F436}' },
        { line: 'Shiver in the snow! Brrr!', emoji: '\u{2744}\u{FE0F}' },
      ],
    },
  },
  goodbyeSong('sm5-goodbye-song', bgStation),
  { id: 'sm5-finale', kind: 'finale', bg: lostRobot(12), who: 'pip', line: 'You read the whole story! Beep is home! \u{1F916}\u{1F680}' },
];

/* =============================================================================
 * A1 Unit 3 Lesson 6: "Space Game Day" (extra practice)
 * Objective: I can use numbers, directions and weather words quickly.
 * Story frame: the Space Games — a tournament on the station (new plot shape: a games day with prizes).
 * All games are new to the unit: River Crossing, Star Map, Rapid Recall, Save the Astronaut, Space Quiz (letter
 * bubbles), Hot Meteor; then Twister Race, Blend & Read and free talk with Beep.
 * ========================================================================= */

export const LESSON_A1U3L6_TITLE = 'Space Game Day';
export const LESSON_A1U3L6_OBJECTIVE = 'I can use numbers, directions and weather words quickly.';

export const LESSON_A1U3L6_SCENES: Scene[] = [
  { id: 'sm6-title', kind: 'title-card', bg: bgStation, level: 'A1', unit: 'Unit 3', lessonLabel: 'Lesson 6', title: 'Space Game Day', subtitle: 'Numbers, directions, weather — play them all!', cta: '\u{1F3AE} LET’S PLAY!' },
  {
    id: 'sm6-recall-warmup', kind: 'recall-warmup', bg: lostRobot(11), who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 3 · Lesson 5 · The Lost Robot',
    teacher: 'Guided: listen — who or what is it? Click it, then say a sentence from the story.',
    items: [
      { word: 'Beep', say: 'Beep is my robot. He is lost!', img: item('beep') },
      { word: 'Biscuit', say: 'Biscuit finds Beep!', img: item('dog') },
      { word: 'rocket', say: 'Up, up, up! Beep is home.', img: item('rocket') },
    ],
  },
  {
    id: 'sm6-intro', kind: 'cinematic', bg: bgStation, title: 'The Space Games', subtitle: 'Six games, one champion!', narrator: 'nova',
    script: [
      { who: 'nova', line: 'Welcome to the Space Games!' },
      { who: 'beep', line: 'Beep, beep! Count, go left, go right — and the weather!' },
      { who: 'pip', line: 'Let’s play!' },
    ],
    cta: '\u{1F3AE} PLAY!',
  },
  { id: 'sm6-echo', kind: 'echo', bg: bgStation, who: 'beep', textSide: 'top', teacher: 'Guided: say it like Beep — a robot voice!', word: 'Ten, twenty, thirty! Go up! Go left!' },
  {
    id: 'sm6-gates', kind: 'answer-race', look: 'gates', bg: bgStation, who: 'pip', racer: item('pip-run'),
    title: 'Catch the answer! Run through the right gate!',
    teacher: 'Guided: Pip asks — the student taps the gate with the right answer, then says it.',
    rounds: [
      { ask: 'How many stars are there? (80)', choices: ['There are eighty.', 'There are eighteen.', 'It’s sunny.'], answer: 0 },
      { ask: 'Where is the moon?', choices: ['It’s cold.', 'It’s above the rocket.', 'There are ten.'], answer: 1 },
      { ask: 'What’s the weather like?', choices: ['Go right!', 'It’s forty.', 'It’s windy.'], answer: 2 },
      { ask: 'Beep is lost!', choices: ['Oh no! Where is he?', 'Thank you!', 'It’s hot.'], answer: 0 },
    ],
    doneLine: 'You caught every answer!',
  },
  {
    id: 'sm6-lava', kind: 'prea1', teacher: 'Guided: River Crossing on Planet Sun! Listen to Pip and hop only on the stone with the right picture — then say the sentence.',
    scene: {
      id: 'sm6-lava', kind: 'stepping-stones', bg: lostRobot(6), stoneImg: item('stone'), who: 'pip', walker: 'pip',
      teacher: 'Listen! Hop on the right stone.',
      goal: { img: item('rocket'), label: 'rocket', line: 'Pip is over the river! Back to the rocket!' },
      rounds: [
        { line: 'Hop on the stone with forty!', options: [{ label: 'fourteen', img: numCard(14) }, { label: 'forty', img: numCard(40) }, { label: 'four', img: numCard(4) }], answer: 1, reply: 'Yes! Forty!' },
        { line: 'It’s cold and snowy. Hop on the right planet!', options: [{ label: 'Planet Sun', img: item('planet-sun') }, { label: 'Planet Wind', img: item('planet-wind') }, { label: 'Planet Ice', img: item('planet-ice') }], answer: 2, reply: 'Yes! It’s cold and snowy on Planet Ice!' },
        { line: 'Hop on the stone with seventy!', options: [{ label: 'seventy', img: numCard(70) }, { label: 'seventeen', img: numCard(17) }, { label: 'sixty', img: numCard(60) }], answer: 0, reply: 'Yes! Seventy!' },
        { line: 'It’s rainy. What do you need? Hop on it!', options: [{ label: 'sunglasses', img: item('sunglasses') }, { label: 'umbrella', img: item('umbrella') }, { label: 'kite', img: item('kite') }], answer: 1, reply: 'Yes! An umbrella!' },
      ],
    },
  },
  {
    id: 'sm6-star-map', kind: 'grid-hunt', bg: bgDeep, who: 'nova', title: 'Star Map: find the lost stars!',
    teacher: 'Game: answer to earn a shot. The student says a square — B three! — and taps it. Empty space or a gold star? Find all three stars.',
    treasures: ['C2', 'A3', 'D4'],
    rounds: [
      { ask: 'What comes after forty?', choices: ['fourteen', 'fifty', 'sixty'], answer: 1 },
      { ask: 'Where is the moon?', choices: ['It’s above the rocket.', 'It’s cold.', 'There are ten.'], answer: 0, img: lostRobot(5) },
      { ask: 'What’s the weather like?', choices: ['It’s hot and sunny.', 'It’s snowy.', 'It’s rainy.'], answer: 0, img: lostRobot(6) },
      { ask: 'Ten and ten and ten. How many?', choices: ['There are thirteen.', 'There are thirty.', 'There are three.'], answer: 1 },
      { ask: 'The tracks go down the hill. Where is Beep?', choices: ['He’s below us.', 'He’s above us.', 'He’s on Planet Sun.'], answer: 0, img: lostRobot(9) },
      { ask: 'What comes before one hundred?', choices: ['ninety', 'nineteen', 'eighty'], answer: 0 },
      { ask: 'It’s windy! What goes up, up?', choices: ['Biscuit’s hat.', 'The moon.', 'The snow.'], answer: 0, img: lostRobot(7) },
      { ask: 'What comes after seventy?', choices: ['eighty', 'seventeen', 'sixty'], answer: 0 },
    ],
    doneLine: 'You found all the stars!',
  },
  {
    id: 'sm6-quick', kind: 'prea1', teacher: 'Extra time: quick fire! Say the whole sentence before the ring runs out.',
    scene: {
      id: 'sm6-quick', kind: 'rapid-recall', bg: bgDeep, who: 'pip', seconds: 6,
      teacher: 'Say it before the ring runs out!',
      cards: [
        { img: numCard(60), word: 'sixty', say: 'There are sixty stars.' },
        { img: item('planet-ice'), word: 'cold', say: 'It’s cold and snowy.' },
        { img: item('moon'), word: 'above', say: 'The moon is above the rocket.' },
        { img: item('planet-sun'), word: 'hot', say: 'It’s hot and sunny.' },
        { img: numCard(90), word: 'ninety', say: 'There are ninety stars.' },
        { img: item('planet-wind'), word: 'windy', say: 'It’s windy.' },
      ],
    },
  },
  { id: 'sm6-echo-2', kind: 'echo', bg: lostRobot(8), who: 'nova', textSide: 'top', teacher: 'Guided: the weather, fast! Say it three times — faster each time.', word: 'It’s cold and snowy on Planet Ice.' },
  {
    id: 'sm6-hot-meteor', kind: 'hot-coconut', bg: bgStation, who: 'nova', coconutImg: item('moon'), title: 'Hot Moon! Pass it — then answer!',
    teacher: 'Free: tap Pass! — where the moon stops, the student answers (for themself or to help the friend).',
    seats: [
      { name: 'You', img: '' },
      { name: 'Nova', img: item('nova') },
      { name: 'Beep', img: item('beep') },
      { name: 'Leo', img: wtSpr('leo') },
      { name: 'Pip', img: wtSpr('pip') },
    ],
    rounds: [
      { ask: 'How many stars? (50)', choices: ['There are fifty stars.', 'There are fifteen stars.'], answer: 0, stop: 2 },
      { ask: 'What’s the weather like on Planet Rain?', choices: ['It’s rainy.', 'It’s sunny.'], answer: 0, stop: 0 },
      { ask: 'Where is the rocket?', choices: ['It’s below the moon.', 'It’s above the moon.'], answer: 0, stop: 3 },
      { ask: 'What comes after eighty?', choices: ['eighteen', 'ninety'], answer: 1, stop: 0 },
      { ask: 'Is it hot on Planet Ice?', choices: ['Yes, it is.', 'No. It’s cold.'], answer: 1, stop: 4 },
    ],
    doneLine: 'Great passing — great answers!',
  },
  {
    id: 'sm6-chests', kind: 'chest-quest', bg: bgDeep, who: 'nova', title: 'Space Treasure Chests!', goal: 60,
    teacher: 'Guided: every right answer opens a chest — coins fill the class jar. Can we reach 60 coins?',
    rounds: [
      { ask: 'What comes after fifty?', choices: ['sixty', 'fifteen'], answer: 0, prizes: ['10', '20', '⭐'] },
      { ask: 'What’s the weather like?', choices: ['It’s cold and snowy.', 'It’s hot.'], answer: 0, img: lostRobot(8), prizes: ['20', '×2', '10'] },
      { ask: 'Where is the rocket?', choices: ['Below the moon.', 'Above the moon.'], answer: 0, img: lostRobot(5), prizes: ['10', '20', '×2'] },
      { ask: 'It’s sunny. What do you need?', choices: ['Sunglasses.', 'A scarf.'], answer: 0, prizes: ['⭐', '10', '20'] },
    ],
    doneLine: 'Look at the jar! Super answers!',
  },
  {
    id: 'sm6-move-break', kind: 'prea1', teacher: 'Brain break: space robot dance — follow the orders!',
    scene: {
      id: 'sm6-move-break', kind: 'tpr-actions', mode: 'break', bg: bgStation, who: 'pip', teacher: 'Robot dance!',
      rounds: [
        { line: 'Two steps left! Beep, beep!', emoji: '\u{2B05}\u{FE0F}' },
        { line: 'Two steps right! Beep, beep!', emoji: '\u{27A1}\u{FE0F}' },
        { line: 'Arms up! Arms down! Spin!', emoji: '\u{1F916}' },
      ],
    },
  },
  {
    id: 'sm6-save-astronaut', kind: 'save-balloon', bg: bgDeep, who: 'pip', balloonImg: item('nova'), title: 'Save the Astronaut! Spell the word!',
    teacher: 'Reading: listen to the sentence, look at the picture — tap the letters to spell the word. Every right letter lifts Nova’s balloon over the mountain!',
    rounds: [
      { word: 'sun', img: item('sun'), sentence: 'It is hot and sunny.' },
      { word: 'moon', img: item('moon'), sentence: 'The moon is above the rocket.' },
      { word: 'cold', img: item('snow'), sentence: 'It is cold and snowy.' },
      { word: 'ten', img: numCard(10), sentence: 'Ten, twenty, thirty!' },
    ],
    doneLine: 'Nova is over the mountain! Super spelling!',
  },
  {
    id: 'sm6-space-quiz', kind: 'letter-bubbles', bg: bgDeep, who: 'nova', title: 'Space Bubbles: spell it!',
    teacher: 'Spelling game: look at the picture, then pop the bubbles in order to spell the word. Say the word at the end.',
    words: [
      { word: 'star', img: item('star-gold'), say: 'Star! There are a lot of stars.' },
      { word: 'snow', img: item('snow'), say: 'Snow! It is snowy on Planet Ice.' },
      { word: 'rocket', img: item('rocket'), say: 'Rocket! Up, up, up!' },
    ],
    doneLine: 'Pop, pop, pop! You can spell space words!',
  },
  {
    id: 'sm6-ice-bridge', kind: 'rising-river', bg: lostRobot(9), who: 'nova', title: 'Build the ice bridge!',
    teacher: 'Together: every right answer lays a plank. A wrong answer — the water rises a little. Get the friends across!',
    friends: [item('nova'), item('leo-run'), wtSpr('pip')],
    rounds: [
      { ask: 'How many? 10, 20, 30, 40', choices: ['There are forty.', 'There are four.'], answer: 0 },
      { ask: 'Is it windy on Planet Wind?', choices: ['Yes, it is.', 'No, it isn’t.'], answer: 0, img: item('planet-wind') },
      { ask: 'The tracks go down. Go…', choices: ['down!', 'up!'], answer: 0, img: lostRobot(9) },
      { ask: 'What comes before seventy?', choices: ['sixty', 'eighty'], answer: 0 },
    ],
    doneLine: 'Everyone is across! Great teamwork!',
  },
  {
    id: 'sm6-tens-cards', kind: 'prea1', teacher: 'Extra time: count backwards in tens with Pip — listen and say each number.',
    scene: { id: 'sm6-tens-cards', kind: 'numbers-learn', bg: bgDeep, who: 'pip', from: 10, to: 100, step: 10, teacher: 'Tap the numbers from 100 down to 10 and say them!' },
  },
  {
    id: 'sm6-twister-race', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgDeep, who: 'pip', focus: '',
    teacher: 'Reading: the Twister Race! All four Unit 3 twisters — slow, faster, then super fast!',
    line: 'Three thin stars think. The king’s ring goes ding. Run up, little pup, run up! A hot pot on a hot top.',
    lines: ['Three thin stars think.', 'The king’s ring goes ding.', 'Run up, little pup, run up!', 'A hot pot on a hot top.'],
  },
  {
    id: 'sm6-blend', kind: 'sound-blend', bg: bgStation, look: 'slide',
    teacher: 'Reading: blend the sounds, find the picture — then read the sentence.',
    rounds: [
      { word: 'bath', sounds: ['b', 'a', 'th'], img: item('room-bathroom'), sentence: 'Beep is in the bath.' },
      { word: 'mop', img: item('mop'), sentence: 'Pip has a mop.' },
      { word: 'wing', sounds: ['w', 'ing'], img: item('bird-fly'), sentence: 'A bird has a wing.' },
    ],
  },
  {
    id: 'sm6-planet-cards', kind: 'prea1', teacher: 'Extra time: the four planets — listen and say the planet and its weather.',
    scene: {
      id: 'sm6-planet-cards', kind: 'listen-repeat-cards', bg: bgDeep, teacher: 'Listen and say it!',
      cards: [
        { who: 'pip', sentence: 'Planet Sun. It’s hot and sunny.', img: item('planet-sun'), imgLabel: 'Planet Sun' },
        { who: 'pip', sentence: 'Planet Wind. It’s windy.', img: item('planet-wind'), imgLabel: 'Planet Wind' },
        { who: 'pip', sentence: 'Planet Ice. It’s cold and snowy.', img: item('planet-ice'), imgLabel: 'Planet Ice' },
        { who: 'pip', sentence: 'Planet Rain. It’s rainy.', img: item('planet-rain'), imgLabel: 'Planet Rain' },
      ],
    },
  },
  {
    id: 'sm6-chat-beep', kind: 'join-stage', bg: lostRobot(11), teacher: 'Free: Beep asks — the student answers in full sentences, then asks Beep a question.', cast: ['beep'],
    turns: [
      { who: 'beep', line: 'Beep, beep! What’s the weather like today?' },
      { who: 'student', line: 'It’s … today.' },
      { who: 'beep', line: 'How many windows are in your room?' },
      { who: 'student', line: 'There are … windows.' },
      { who: 'beep', line: 'Ask me a question!' },
      { who: 'student', line: 'Where is your rocket, Beep?' },
      { who: 'beep', line: 'It’s below the moon! Beep, beep!' },
    ],
  },
  {
    id: 'sm6-report', kind: 'join-stage', bg: bgStation, teacher: 'Free: a quick weather report on air — one planet, three sentences.', cast: ['nova'],
    turns: [
      { who: 'nova', line: 'Quick! The weather on Planet Rain, please!' },
      { who: 'student', line: 'On Planet Rain it’s rainy and cloudy. You need an umbrella!' },
      { who: 'nova', line: 'Thank you! Back to the games!' },
    ],
  },
  { id: 'sm6-meet-beep', kind: 'meet', focus: ['home'], bg: lostRobot(11), who: 'beep', cardSide: 'right', teacher: 'Present: Beep says thank you — the student answers with “You’re welcome!”.', line: 'Beep, beep! Thank you! I am home!', repeat: 'Beep is home!' },
  {
    id: 'sm6-steer-me', kind: 'join-stage', bg: bgStation, teacher: 'Free: the student steers the teacher (a walking “robot”) to something in the room in 3 orders — then swap.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'I am a robot! Where do I go?' },
      { who: 'student', line: 'Go … ! Go … ! Go … !' },
      { who: 'pip', line: 'Beep! I found it! Now you are the robot!' },
    ],
  },
  { id: 'sm6-i-can', kind: 'meet', focus: ['quickly'], bg: bgStation, who: 'nova', cardSide: 'left', teacher: 'Check: numbers, directions and weather — quickly! Then the passport stamp.', line: 'I can use space words quickly!', repeat: 'There are sixty stars!' },
  {
    id: 'sm6-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Space Games sticker in their Sticker Book.',
    scene: {
      id: 'sm6-sticker', kind: 'sticker-reward', bg: bgStation, who: 'pip', teacher: 'Sticker time!',
      line: 'Space Games champion! Here is your sticker.',
      sticker: { img: item('star-gold'), label: 'Space Games champion' },
    },
  },
  petPal('sm6-pet-pal', 5, 'It’s hot and sunny! I want my sunglasses!', [{ label: 'scarf', img: item('scarf') }, { label: 'umbrella', img: item('umbrella') }, { label: 'sunglasses', img: item('sunglasses') }], 2, 'Sunglasses! Cool!'),
  {
    id: 'sm6-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'sm6-home-mission', kind: 'home-mission', bg: bgStation, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child practised numbers in tens, directions and weather words in a games day. Play the direction game at home: one person is the robot, the other gives the orders.',
      steps: [
        { emoji: '\u{1F916}', say: 'Play Robot: one family member is the robot.' },
        { emoji: '\u{1F9ED}', say: 'Give orders: Go left! Go up!' },
        { emoji: '\u{1F522}', say: 'Count your steps in tens!' },
      ],
    },
  },
  {
    id: 'sm6-move-break-2', kind: 'prea1', teacher: 'Brain break: the champion’s stretch!',
    scene: {
      id: 'sm6-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgDeep, who: 'pip', teacher: 'Stretch like a champion!',
      rounds: [
        { line: 'Arms up above your head!', emoji: '\u{1F64C}' },
        { line: 'Hands down below your knees!', emoji: '\u{1F447}' },
        { line: 'Breathe and count: ten, twenty, thirty!', emoji: '\u{1F60C}' },
      ],
    },
  },
  goodbyeSong('sm6-goodbye-song', bgStation),
  { id: 'sm6-finale', kind: 'finale', bg: bgStation, who: 'pip', line: 'Space Games champion! Next time: the Boss Test! \u{1F3C6}' },
];

/* =============================================================================
 * A1 Unit 3 Lesson 7: "Boss Test: Space Navigator!"
 * Rocket Race warm-up, then five parts (4 of 5 each): listening, reading yes / no, the story, speaking (count a group,
 * steer the rocket in 3 steps, a 3-sentence weather report), reading aloud. Practise-again games after the trophy.
 * ========================================================================= */

export const LESSON_A1U3L7_TITLE = 'Boss Test: Space Navigator!';
export const LESSON_A1U3L7_OBJECTIVE = 'I can show what I learned in Unit 3: numbers in tens, directions, weather and the story.';

export const LESSON_A1U3L7_SCENES: Scene[] = [
  { id: 'sm7-title', kind: 'title-card', bg: lostRobot(12), level: 'A1', unit: 'Unit 3', lessonLabel: 'Lesson 7', title: 'Boss Test: Space Navigator!', subtitle: 'Show everything you can do in space', cta: '\u{1F3C6} I’M READY!' },
  {
    id: 'sm7-recall-warmup', kind: 'recall-warmup', bg: bgDeep, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 3 · Lesson 6 · Space Game Day',
    teacher: 'Guided: listen — click the picture and say one more sentence about it.',
    items: [
      { word: 'eighty', say: 'There are eighty stars.', img: numCard(80) },
      { word: 'Planet Wind', say: 'It’s windy and cloudy.', img: item('planet-wind') },
      { word: 'moon', say: 'The moon is above the rocket.', img: item('moon') },
    ],
  },
  {
    id: 'sm7-intro', kind: 'cinematic', bg: lostRobot(12), title: 'The Boss Test', subtitle: 'A rocket race, then five parts', narrator: 'nova',
    script: [
      { who: 'nova', line: 'Welcome, space navigator!' },
      { who: 'nova', line: 'Listen, read, read the story, talk and read aloud!' },
      { who: 'pip', line: 'First, the rocket race! Let’s go!' },
    ],
    cta: '\u{1F680} RACE!',
  },
  {
    id: 'sm7-rocket-race', kind: 'answer-race', look: 'race', bg: bgDeep, who: 'pip', racer: item('rocket'),
    title: 'The Rocket Race! Every right answer moves your rocket!',
    teacher: 'Warm-up: the student answers — every right answer moves the rocket. The last two cards are read, not heard.',
    rounds: [
      { ask: 'What comes after thirty?', choices: ['thirteen', 'forty', 'twenty'], answer: 1 },
      { ask: 'Where is the moon?', choices: ['It’s above the rocket.', 'It’s hot.', 'There are ten.'], answer: 0 },
      { ask: 'What’s the weather like on Planet Ice?', choices: ['It’s hot and sunny.', 'It’s cold and snowy.', 'It’s windy.'], answer: 1 },
      { ask: 'How many stars? 10, 20, 30, 40, 50', choices: ['There are fifty stars.', 'There are fifteen stars.', 'There are five stars.'], answer: 0, read: true },
      { ask: 'Who finds Beep?', choices: ['Biscuit.', 'The moon.', 'Planet Sun.'], answer: 0, read: true },
    ],
    doneLine: 'You won the rocket race! Now the Boss Test!',
  },
  /* Part 1 — Listening */
  {
    id: 'sm7-p1-listen', kind: 'prea1', teacher: 'Part 1 — Listening (5). One try each; 🔊 replays it. Pass: 4 of 5. The student works alone.',
    scene: {
      id: 'sm7-p1-listen', kind: 'hero-trials', bg: bgDeep, who: 'pip',
      teacher: 'Listen and tap the picture. One try!',
      hero: { img: item('nova'), name: 'Space Navigator' }, medal: item('medal-rainbow'),
      skills: [
        { key: 'numbers', label: 'Numbers', icon: '\u{1F522}' },
        { key: 'weather', label: 'Weather', icon: '\u{1F326}\u{FE0F}' },
        { key: 'where', label: 'Where?', icon: '\u{1F9ED}' },
      ],
      items: [
        { skill: 'numbers', ask: 'There are sixty stars.', reply: 'Sixty!', answer: 1, options: [{ label: 'sixteen', img: numCard(16) }, { label: 'sixty', img: numCard(60) }, { label: 'six', img: numCard(6) }] },
        { skill: 'weather', ask: 'It’s cold and snowy.', reply: 'Planet Ice!', answer: 2, options: [{ label: 'Planet Sun', img: item('planet-sun') }, { label: 'Planet Rain', img: item('planet-rain') }, { label: 'Planet Ice', img: item('planet-ice') }] },
        { skill: 'where', ask: 'It’s above the rocket.', reply: 'The moon!', answer: 0, options: [{ label: 'moon', img: item('moon') }, { label: 'robot', img: item('beep') }, { label: 'puppy', img: item('dog') }] },
        { skill: 'numbers', ask: 'There are one hundred stars.', reply: 'One hundred!', answer: 0, options: [{ label: 'one hundred', img: numCard(100) }, { label: 'ten', img: numCard(10) }, { label: 'ninety', img: numCard(90) }] },
        { skill: 'weather', ask: 'It’s windy. Up, up goes the hat!', reply: 'Planet Wind!', answer: 1, options: [{ label: 'Planet Ice', img: item('planet-ice') }, { label: 'Planet Wind', img: item('planet-wind') }, { label: 'Planet Sun', img: item('planet-sun') }] },
      ],
      doneLine: 'Listening done! Super ears!',
    },
  },
  { id: 'sm7-can-1', kind: 'meet', focus: ['hundred'], bg: lostRobot(3), who: 'nova', cardSide: 'left', teacher: 'Can-do: the student counts 10-100 in tens and says how many — tick it on the Unit 3 can-do card.', line: 'I can count in tens to one hundred!', repeat: 'There are forty stars.' },
  /* Part 2 — Reading: yes or no? */
  {
    id: 'sm7-p2-read', kind: 'true-false', bg: bgDeep, img: lostRobot(5), read: true,
    teacher: 'Part 2 — Reading (5). Look at the picture. Read: yes or no? Pass: 4 of 5.',
    rounds: [
      { who: 'nova', statement: 'The moon is above the rocket.', isTrue: true },
      { who: 'nova', statement: 'Biscuit is on the left.', isTrue: false },
      { who: 'nova', statement: 'There are four friends.', isTrue: true },
      { who: 'nova', statement: 'The rocket is above the moon.', isTrue: false },
      { who: 'nova', statement: 'Nova is on the left.', isTrue: true },
    ],
  },
  {
    id: 'sm7-p2b-spell', kind: 'letter-blocks', bg: bgDeep, mode: 'sounds', model: false,
    prompt: 'Part 2b — Build the space words (3)',
    teacher: 'Part 2b — Building words (3). The student puts the sound blocks in order and reads the word. Pass: 2 of 3.',
    rounds: [
      { blocks: ['s', 'u', 'n'], word: 'sun', img: item('sun') },
      { blocks: ['th', 'i', 'n'], word: 'thin', img: item('thread') },
      { blocks: ['r', 'ing'], word: 'ring', img: item('ring') },
    ],
  },
  {
    id: 'sm7-p2c-tick', kind: 'prea1', teacher: 'Part 2c — Reading sentences (5). Read the sentence, look at the picture — tick or cross? Pass: 4 of 5.',
    scene: {
      id: 'sm7-p2c-tick', kind: 'tick-cross', bg: bgDeep, who: 'pip', teacher: 'Read and look. Yes or no?',
      rounds: [
        { img: item('planet-sun'), sentence: 'It’s hot and sunny.', isTrue: true },
        { img: item('planet-ice'), sentence: 'It’s hot.', isTrue: false },
        { img: numCard(70), sentence: 'There are seventy stars.', isTrue: true },
        { img: item('umbrella'), sentence: 'It’s for a sunny day.', isTrue: false },
        { img: item('planet-rain'), sentence: 'It’s rainy.', isTrue: true },
      ],
    },
  },
  { id: 'sm7-can-2', kind: 'meet', focus: ['directions'], bg: lostRobot(5), who: 'pip', cardSide: 'right', teacher: 'Can-do: the student follows and gives directions — tick it.', line: 'I can follow and give directions!', repeat: 'Go down! Go right!' },
  /* Part 3 — Reading: the story */
  {
    id: 'sm7-p3-story', kind: 'grammar-gap', bg: bgDeep, title: 'Part 3 — The story',
    teacher: 'Part 3 — Reading the story (5). Read and choose the missing word. Pass: 4 of 5.',
    rounds: [
      { before: 'Count the stars! Ten, twenty, thirty,', after: '!', choices: ['forty', 'fourteen'], answer: 'forty', img: lostRobot(3) },
      { before: 'Where is Beep? He is', after: '!', choices: ['lost', 'hot'], answer: 'lost', img: lostRobot(4) },
      { before: 'It is', after: '! Up, up goes Biscuit’s hat!', choices: ['windy', 'snowy'], answer: 'windy', img: lostRobot(7) },
      { before: 'Beep, beep! It is', after: 'us.', choices: ['below', 'above'], answer: 'below', img: lostRobot(9) },
      { before: 'Ten, nine, eight… Go! Beep is', after: '.', choices: ['home', 'lost'], answer: 'home', img: lostRobot(12) },
    ],
  },
  {
    id: 'sm7-break', kind: 'prea1', teacher: 'Brain break between the parts: float like an astronaut.',
    scene: {
      id: 'sm7-break', kind: 'tpr-actions', mode: 'break', bg: bgDeep, who: 'pip', teacher: 'Float in space!',
      rounds: [
        { line: 'Float slowly — arms out!', emoji: '\u{1F9D1}\u{200D}\u{1F680}' },
        { line: 'Look left, look right!', emoji: '\u{1F440}' },
        { line: 'Breathe and count to five!', emoji: '\u{1F590}\u{FE0F}' },
      ],
    },
  },
  /* Part 4 — Speaking */
  {
    id: 'sm7-p4-count', kind: 'join-stage', bg: lostRobot(3), teacher: 'Part 4a — Speaking (2 points): the student counts the star groups in tens and answers “How many?” with a full sentence.', cast: ['nova'],
    turns: [
      { who: 'nova', line: 'Count the stars in tens! How many stars are there?' },
      { who: 'student', line: 'Ten, twenty, thirty, forty. There are forty stars.' },
    ],
  },
  {
    id: 'sm7-p4-steer', kind: 'rocket-maze', bg: bgDeep, who: 'nova', rocketImg: item('rocket'), title: 'Part 4b: steer the rocket!',
    teacher: 'Part 4b — Speaking (1 point): the student is mission control and SAYS every order to reach the moon in 3 steps (no help).',
    cols: 5, rows: 4,
    missions: [
      { mode: 'steer', intro: 'Steer the rocket to the moon! Say every order!', start: [0, 3], target: [1, 1], targetImg: item('moon'), targetLabel: 'moon', rocks: [[0, 1]], win: 'The moon! Well done, navigator!' },
    ],
    doneLine: 'Great orders, space navigator!',
  },
  {
    id: 'sm7-p4-weather', kind: 'join-stage', bg: bgStation, teacher: 'Part 4c — Speaking (2 points): a 3-sentence weather report for any planet. Pass for Part 4: 4 of 5 points.', cast: ['nova'],
    turns: [
      { who: 'nova', line: 'You are the weather reporter! Pick a planet. What’s the weather like?' },
      { who: 'student', line: 'On Planet … it’s … and … . You need a … !' },
      { who: 'nova', line: 'Thank you! Great report!' },
    ],
  },
  { id: 'sm7-can-3', kind: 'meet', focus: ['weather'], bg: lostRobot(8), who: 'nova', cardSide: 'left', teacher: 'Can-do: the student gives a weather report — tick it.', line: 'I can say what the weather is like!', repeat: 'It’s cold and snowy on Planet Ice.' },
  /* Part 5 — Reading aloud */
  {
    id: 'sm7-p5-read-aloud', kind: 'reader', bg: bgDeep, title: 'Part 5 — Read it aloud!', doneLine: 'You read it all by yourself!',
    teacher: 'Part 5 — Reading aloud (5 points: every word read, then fluency). Skip the listening: tap “My turn to read” at once. Pass: 4 of 5.',
    pages: [LOST_ROBOT[7], LOST_ROBOT[8]],
  },
  { id: 'sm7-can-4', kind: 'meet', focus: ['story'], bg: lostRobot(11), who: 'leo', cardSide: 'left', teacher: 'Can-do: the student reads a page of the story and says who found Beep — tick it.', line: 'I can read the story and say who found Beep!', repeat: 'Biscuit finds Beep!' },
  { id: 'sm7-echo-champ', kind: 'echo', bg: lostRobot(12), who: 'nova', textSide: 'top', teacher: 'Say it proudly with Nova!', word: 'I can do it! Space navigator!' },
  { id: 'sm7-i-can', kind: 'meet', focus: ['Unit 3'], bg: lostRobot(12), who: 'nova', cardSide: 'left', teacher: 'Check: any part below 4 of 5? Play it again next lesson (Practise again). Then the trophy!', line: 'I can show everything from Unit 3!', repeat: 'I’m a space navigator!' },
  {
    id: 'sm7-sticker', kind: 'prea1', teacher: 'The Unit 3 trophy! The student opens the pack and puts the trophy sticker in their Sticker Book.',
    scene: {
      id: 'sm7-sticker', kind: 'sticker-reward', bg: lostRobot(12), who: 'pip', teacher: 'The Unit 3 trophy!',
      line: 'You passed the Boss Test! Here is your Unit 3 trophy — and piece 2 of the Golden Compass!',
      sticker: { img: item('medal-rainbow'), label: 'Golden Compass piece 2' },
    },
  },
  petPal('sm7-pet-pal', 6, 'I am a space navigator! I want a gold star!', [{ label: 'gold star', img: item('star-gold') }, { label: 'moon', img: item('moon') }, { label: 'cookie', img: item('cookie') }], 0, 'A gold star! Well done!'),
  {
    id: 'sm7-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'sm7-home-mission', kind: 'home-mission', bg: bgStation, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Your child finished Unit 3: counting in tens to 100, directions (left, right, up, down, above, below), the weather and the story "The Lost Robot". Let them count to 100 in tens and give you a weather report.',
      steps: [
        { emoji: '\u{1F3C5}', say: 'Show your trophy to your family.' },
        { emoji: '\u{1F522}', say: 'Count to one hundred in tens.' },
        { emoji: '\u{1F4FA}', say: 'Give a weather report for today!' },
      ],
    },
  },
  /* Practise again — for any part below the pass mark, or as extra time */
  {
    id: 'sm7-pa-match', kind: 'picture-match', look: 'polaroids', prompt: 'Practise again: read and match',
    teacher: 'Practise again (Part 2): read each sentence and drag it under its picture.',
    items: [
      { word: 'It’s cold and snowy.', img: item('planet-ice') },
      { word: 'It’s above the rocket.', img: item('moon') },
      { word: 'There are thirty.', img: numCard(30) },
      { word: 'Beep is a robot.', img: item('beep') },
    ],
    bg: bgDeep,
  },
  {
    id: 'sm7-pa-build', kind: 'sentence-build', bg: bgDeep, teacher: 'Practise again (Part 3): put the words in order, then read the sentence.',
    rounds: [
      { words: ['There', 'are', 'forty', 'stars.'], emoji: '\u{2B50}' },
      { words: ['The', 'moon', 'is', 'above', 'the', 'rocket.'], emoji: '\u{1F315}' },
      { words: ['It’s', 'hot', 'and', 'sunny.'], emoji: '\u{2600}\u{FE0F}' },
    ],
  },
  {
    id: 'sm7-pa-chat', kind: 'chat-chain', bg: bgStation, partner: 'leo', title: 'Practise again: chat with Leo',
    intro: 'Hi! Let’s talk about space!',
    teacher: 'Practise again (Part 4): Leo talks, the student picks the reply that fits and SAYS it, then taps “I said it”.',
    turns: [
      { who: 'leo', line: 'How many stars are there?' },
      { who: 'student', line: 'There are sixty stars.', wrong: ['It’s sunny.', 'Go left!'] },
      { who: 'leo', line: 'What’s the weather like on Planet Rain?' },
      { who: 'student', line: 'It’s rainy.', wrong: ['There are ten.', 'It’s above the moon.'] },
      { who: 'leo', line: 'Ask me a question!' },
      { who: 'student', line: 'Where is Beep?', wrong: ['Beep where.', 'Beep is robot.'] },
    ],
  },
  {
    id: 'sm7-pa-parcel', kind: 'pass-parcel', bg: lostRobot(12), who: 'nova', title: 'Pass the Present!',
    teacher: 'Practise again (all parts): every right answer tears one layer off the present. What is inside?',
    rounds: [
      { ask: 'What comes after ninety?', choices: ['one hundred', 'nineteen', 'eighty'], answer: 0 },
      { ask: 'Where is Beep?', choices: ['He’s below us.', 'He’s above the moon.', 'He’s hot.'], answer: 0, img: lostRobot(9) },
      { ask: 'What’s the weather like?', choices: ['It’s windy.', 'It’s snowy.', 'It’s rainy.'], answer: 0, img: lostRobot(7) },
      { ask: 'It’s cold and snowy. What do you need?', choices: ['A scarf.', 'Sunglasses.', 'A kite.'], answer: 0 },
      { ask: 'Who finds Beep?', choices: ['Biscuit.', 'Nova.', 'Leo.'], answer: 0, img: lostRobot(11) },
    ],
    prize: { img: item('medal-rainbow'), label: 'Space medal' },
    doneLine: 'You opened the present! A space medal!',
  },
  {
    id: 'sm7-pa-river', kind: 'rising-river', bg: lostRobot(9), who: 'nova', title: 'Build the ice bridge to Beep!',
    teacher: 'Practise again (together!): every right answer lays a plank. A wrong answer — the water rises a little. Get the friends across!',
    friends: [item('nova'), item('leo-run'), wtSpr('pip')],
    rounds: [
      { ask: 'How many? 10, 20, 30', choices: ['There are thirty.', 'There are three.'], answer: 0 },
      { ask: 'Is it hot on Planet Ice?', choices: ['No. It’s cold.', 'Yes. It’s hot.'], answer: 0, img: item('planet-ice') },
      { ask: 'Beep is below us. Go…', choices: ['down!', 'up!'], answer: 0 },
      { ask: 'Where is the moon?', choices: ['It’s above the rocket.', 'It’s below the rocket.'], answer: 0, img: lostRobot(5) },
      { ask: 'Biscuit finds Beep!', choices: ['Thank you, Biscuit!', 'Go left!'], answer: 0 },
    ],
    doneLine: 'Everyone is across! Beep is safe!',
  },
  goodbyeSong('sm7-goodbye-song', lostRobot(12)),
  { id: 'sm7-finale', kind: 'finale', bg: lostRobot(12), who: 'nova', line: 'You finished Unit 3 and found piece 2 of the Golden Compass! See you on the next adventure! \u{1F680}' },
];
