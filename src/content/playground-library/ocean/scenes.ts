/* =============================================================================
 * Ocean Explorers — A1 Unit 6 (plan: docs/a1-unit-6-ocean.md, owner-approved 2026-10-15: "Go")
 *
 * Reuses Welcome Town's Scene type, CharKey/CAST/VOICE_KEY and SceneRenderer — Ocean is a new WORLD, not a new engine.
 * Unit objective: name six sea animals, say what each one is doing ("The crab is walking.") and where it lives ("It
 * lives on the reef."), find a hidden animal by asking ("Is it a crab? Is it hiding?"), and read "The Treasure Reef"
 * (one story for the unit, a few pages each lesson).
 * Every lesson: sound → a phonics game (different each lesson) → Blend & Read → tongue twister; no game twice in the unit.
 * Phonics: wh (L1), oa (L2), sh at the end (L3), review (L4) — all from recorded clips, no new recording.
 * Research (mechanics only, sources in docs/research/playground-a1u6-research.md): British Council "My sea creature"
 * (A1 listen-and-guess), Lingokids aquatic animals, teach-this / Twinkl present-continuous games, Boom + Smithsonian
 * habitat sorts, Teach Starter oa games.
 * Art: Canva, Playground game colours (gameSkin.ts). Pictures up to L4 are ~35 % purple (purple coral, sea fans); from
 * 2026-10-15 new pictures use the Playground brand shades (PICTURE_COLOUR_LINE): sky blue sea, orange and sunshine coral,
 * cream sand, green sea grass. Coral the Mermaid is a girl; Bub the Octopus is a shy boy. Leo and Pip wear swim shorts, never a dress.
 * ========================================================================= */

import { CAST, VOICE_KEY, type CharKey, type ReaderPage, type Scene } from '../welcome-town/scenes';

export type { CharKey, Scene };
export { CAST, VOICE_KEY };

const S = '/lep1/scenes';
const bgReef = `${S}/bg-a1u6-reef-wide.png`;
const bgDeep = `${S}/bg-a1u6-deep-wide.png`;
const bgSpy = `${S}/bg-a1u6-ispy-wide.png`;
const item = (n: string) => `/lep1/items/item-${n}.png`;
const WT = '/welcome-town';
const SONG_HELLO = `${WT}/audio/hello-song.mp3?v=1`;
const SONG_GOODBYE = `${WT}/audio/goodbye-song.mp3?v=3`;

/** The Treasure Reef — Canva story pictures (scripts/canva-art-request.json); pages 4-12 come with Lessons 2-5. */
export const reefPage = (n: number) => `${S}/bg-a1u6-story-${n}-wide.png`;
const bgBeach = reefPage(1);

/** The sea animals (cut-out stickers, same style as the whale and octopus). */
export const SEA = {
  shark: item('shark'), whale: item('whale'), turtle: item('turtle'), starfish: item('starfish'),
  octopus: item('octopus'), crab: item('crab'), seahorse: item('seahorse'), fish: item('fish'), shell: item('shell'),
  sharks: item('sharks'), turtles: item('turtles'), fishes: item('fish-school'),
};
export const CORAL = item('coral');
/** Bub the Octopus (a shy boy) — the purple octopus sticker until his own poses come with Lesson 2. */
export const BUB = SEA.octopus;
const BISCUIT = item('dog');
const BIBI = (f: string) => item(`bibi-${f}`);

/** The unit's reading strand (plan §4). */
export const TREASURE_REEF: ReaderPage[] = [
  { img: reefPage(1), lines: [{ text: 'It is sunny. Look! A boat on the sea.' }], check: { who: 'pip', question: 'What is on the sea?', answer: 'A boat', options: [{ label: 'A boat' }, { label: 'A car' }, { label: 'A bus' }] } },
  { img: reefPage(2), lines: [{ text: 'This is Coral. She lives in the sea.' }], check: { who: 'mia', question: 'Where does Coral live?', answer: 'In the sea', options: [{ label: 'In a house' }, { label: 'In the sea' }, { label: 'In space' }] } },
  { img: reefPage(3), lines: [{ text: 'It is a whale. It is big! It is a turtle.' }], check: { who: 'leo', question: 'What is big?', answer: 'The whale', options: [{ label: 'The whale', img: SEA.whale }, { label: 'The turtle', img: SEA.turtle }, { label: 'The starfish', img: SEA.starfish }] } },
  { img: reefPage(4), lines: [{ text: 'This is Bub. Bub is an octopus. He is hiding.' }], check: { who: 'mia', question: 'What is Bub doing?', answer: 'Hiding', options: [{ label: 'Hiding', img: item('bub-hiding') }, { label: 'Sleeping', img: item('starfish-sleeping') }, { label: 'Walking', img: item('crab-walking') }] } },
  { img: reefPage(5), lines: [{ text: 'The crab is walking. The starfish is sleeping.' }], check: { who: 'pip', question: 'What is the crab doing?', answer: 'Walking', options: [{ label: 'Eating' }, { label: 'Walking' }, { label: 'Sleeping' }] } },
  { img: reefPage(6), lines: [{ text: 'The friends are diving. Fish are swimming!' }], check: { who: 'leo', question: 'What are the fish doing?', answer: 'Swimming', options: [{ label: 'Sleeping' }, { label: 'Swimming' }, { label: 'Walking' }] } },
  { img: reefPage(7), lines: [{ text: 'The turtle lives on the reef. It eats sea grass.' }], check: { who: 'mia', question: 'What does the turtle eat?', answer: 'Sea grass', options: [{ label: 'Fish', img: SEA.fish }, { label: 'Sea grass', img: item('sea-grass') }, { label: 'Shells', img: SEA.shell }] } },
  { img: reefPage(8), lines: [{ text: 'Oh no! It is windy. The waves are big.' }], check: { who: 'pip', question: 'What is the weather like?', answer: 'Windy', options: [{ label: 'Sunny' }, { label: 'Windy' }, { label: 'Snowy' }] } },
  { img: reefPage(9), lines: [{ text: 'Mia: Is it the chest? Shark: No, it isn’t!' }], check: { who: 'leo', question: 'Is it the chest?', answer: 'No, it isn’t.', options: [{ label: 'Yes, it is.' }, { label: 'No, it isn’t.' }] } },
];

const helloSong = (id: string, bg: string): Scene => ({
  id, kind: 'song', bg, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Sing hello to Coral — wave!',
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

/** Biscuit's shelf: Units 1-5, then one more Ocean treat each lesson. */
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
];
const PET_OCEAN: { label: string; img: string }[] = [{ label: 'shell', img: SEA.shell }, { label: 'boat', img: '/magic-castle/stickers/boat.png' }, { label: 'dish', img: item('dish') }, { label: 'coat', img: item('coat-blue') }];
const petPal = (id: string, n: number, line: string, choices: { label: string; img: string }[], answer: number, say: string): Scene => ({
  id, kind: 'pet-pal', bg: bgBeach, who: 'leo', title: 'Pet Pal: Biscuit at the Beach',
  teacher: 'Routine (1 minute): Biscuit the puppy says what he wants. The student listens, taps it and says it. It goes on his shelf and he grows — the shelf keeps everything from earlier lessons.',
  pet: { name: 'Biscuit', img: BISCUIT },
  earlier: [...PET_EARLIER, ...PET_OCEAN.slice(0, n)],
  rounds: [{ line, choices, answer, say }],
  doneLine: 'Biscuit is so happy! See you next time!',
});

/* =============================================================================
 * A1 Unit 6 Lesson 1: "Meet the Sea Animals: Shark, Whale"
 * Objective: I can name sea animals: "It's a whale. They're sharks."
 * Story frame: the friends reach a sunny beach with a little boat (the fifth piece of the Golden Compass points to the
 *   sea) and meet Coral the Mermaid — morning light, turquoise water, purple sea fans.
 * Practice ladder: Revise (Remember? Unit 5 feelings and looks) → Present (I do: one animal per card, then "They're…"
 *   with a group) → we do (echo) → Read and Match → you do (Deep-Sea Fishing: catch the animal you hear and say it;
 *   Photo Snap; Shadow Match; I Spy; Big or small?) → Reading (Reader p1-3, Read and Match, Yes or No?) → Phonics wh
 *   (Letter Moles, Blend & Read, twister) → Free (favourite sea animal; the child asks Coral) → check.
 * ========================================================================= */

export const LESSON_A1U6L1_TITLE = 'Meet the Sea Animals: Shark, Whale';
export const LESSON_A1U6L1_OBJECTIVE = 'I can name sea animals: "It\'s a whale. They\'re sharks."';

export const LESSON_A1U6L1_SCENES: Scene[] = [
  { id: 'oc-title', kind: 'title-card', bg: bgBeach, level: 'A1', unit: 'Unit 6', lessonLabel: 'Lesson 1', title: 'Meet the Sea Animals!', subtitle: 'Shark, whale, turtle, starfish — and Coral!', cta: '\u{1F30A} DIVE IN!' },
  {
    // Remember? (owner, 2026-10-07): Unit 5 — Bibi's feelings. Click mode: Bibi's faces share one outline.
    id: 'oc-recall-warmup', kind: 'recall-warmup', bg: bgBeach, who: 'pip', mode: 'click',
    fromLabel: 'Unit 5 · Monster Town',
    teacher: 'Guided: Pip says a sentence about Bibi — the student finds her face and says why: She’s … because … .',
    items: [
      { word: 'scared', say: 'Bibi is scared because it’s dark.', img: BIBI('scared') },
      { word: 'excited', say: 'Bibi is excited because it’s a party!', img: BIBI('excited') },
      { word: 'bored', say: 'Bibi is bored because the lesson is long.', img: BIBI('bored') },
      { word: 'happy', say: 'Bibi is happy. It’s a good day!', img: BIBI('happy') },
    ],
  },
  { id: 'oc-meet-beach', kind: 'meet', focus: ['sea'], bg: bgBeach, who: 'pip', cardSide: 'right', teacher: 'Present: the compass points to the sea! Point to the boat and the water. Say: Look — the sea!', line: 'Look! The compass points to the sea!', repeat: 'Look! The sea!' },
  { id: 'oc-meet-coral', kind: 'meet', focus: ['sea'], bg: reefPage(2), who: 'coral', cardSide: 'left', teacher: 'Present: this is Coral the Mermaid. She lives in the sea. Wave to her!', line: 'Hello! I’m Coral. I live in the sea!', repeat: 'This is Coral.' },
  {
    id: 'oc-animals', kind: 'prea1', teacher: 'Present (I do → you do): one sea animal at a time. Say it, the student says it: It’s a shark.',
    scene: {
      id: 'oc-animals', kind: 'listen-repeat-cards', bg: bgReef, teacher: 'Listen and say it!',
      cards: [
        { who: 'mia', sentence: 'It’s a shark.', img: SEA.shark, imgLabel: 'shark' },
        { who: 'mia', sentence: 'It’s a whale.', img: SEA.whale, imgLabel: 'whale' },
        { who: 'mia', sentence: 'It’s a turtle.', img: SEA.turtle, imgLabel: 'turtle' },
        { who: 'mia', sentence: 'It’s a starfish.', img: SEA.starfish, imgLabel: 'starfish' },
      ],
    },
  },
  {
    id: 'oc-theyre', kind: 'prea1', teacher: 'Present (I do → we do): one animal = It’s a shark. Many animals = They’re sharks. Hold up one finger, then all your fingers.',
    scene: {
      id: 'oc-theyre', kind: 'listen-repeat-cards', bg: bgReef, teacher: 'One or many? Listen and say it!',
      cards: [
        { who: 'mia', sentence: 'They’re sharks.', img: SEA.sharks, imgLabel: 'sharks' },
        { who: 'mia', sentence: 'They’re turtles.', img: SEA.turtles, imgLabel: 'turtles' },
        { who: 'mia', sentence: 'They’re fish.', img: SEA.fishes, imgLabel: 'fish' },
      ],
    },
  },
  { id: 'oc-meet-whale', kind: 'meet', focus: ['whale', 'big'], bg: reefPage(3), who: 'coral', cardSide: 'left', teacher: 'Present (we do): point to the whale — It’s a whale. It’s big! Then the turtle. Say it together.', line: 'Look! It’s a whale. It’s big!', repeat: 'It’s a whale. It’s big!' },
  { id: 'oc-echo', kind: 'echo', bg: reefPage(3), who: 'pip', textSide: 'top', teacher: 'Guided (we do): say it like Pip — a whisper, then BIG like a whale!', word: 'It’s a whale!' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'oc-match', kind: 'picture-match', look: 'polaroids', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its photo (or taps the sentence, then the photo), then reads it aloud. One animal = It’s… · many = They’re… .',
    items: [
      { word: 'It’s a shark.', img: SEA.shark },
      { word: 'It’s a whale.', img: SEA.whale },
      { word: 'It’s a turtle.', img: SEA.turtle },
      { word: 'It’s a starfish.', img: SEA.starfish },
      { word: 'They’re sharks.', img: SEA.sharks },
      { word: 'They’re turtles.', img: SEA.turtles },
    ],
    bg: bgReef,
  },
  {
    id: 'oc-fishing', kind: 'prea1', teacher: 'You do (signature game): Deep-Sea Fishing! Coral says an animal — the student catches it and says: It’s a shark!',
    scene: {
      id: 'oc-fishing', kind: 'shape-fishing', bg: bgDeep, who: 'mia', floating: true,
      pool: { x: 50, y: 60, rx: 30, ry: 15 },
      teacher: 'Listen and catch the right animal — then say "It’s a …!"',
      fish: [
        { colorWord: '', colorHex: '#ffffff', shape: 'circle', img: SEA.shark, word: 'shark' },
        { colorWord: '', colorHex: '#ffffff', shape: 'circle', img: SEA.whale, word: 'whale' },
        { colorWord: '', colorHex: '#ffffff', shape: 'circle', img: SEA.turtle, word: 'turtle' },
        { colorWord: '', colorHex: '#ffffff', shape: 'circle', img: SEA.starfish, word: 'starfish' },
        { colorWord: '', colorHex: '#ffffff', shape: 'circle', img: SEA.fish, word: 'fish' },
      ],
      targets: [0, 2, 1, 3, 4],
    },
  },
  helloSong('oc-hello-song', bgBeach),
  {
    id: 'oc-photo-snap', kind: 'prea1', teacher: 'You do (listening): Photo Snap! Coral says which animal to photograph — the student snaps it and says the sentence. Many animals: They’re… !',
    scene: {
      id: 'oc-photo-snap', kind: 'photo-snap', bg: bgReef, who: 'mia',
      teacher: 'Listen and take a photo of the animal! Say it with each photo.',
      spots: [
        { x: 24, y: 70, size: 15 },
        { x: 50, y: 78, size: 15 },
        { x: 76, y: 70, size: 15 },
        { x: 30, y: 42, size: 12 },
        { x: 70, y: 42, size: 12 },
      ],
      animals: [
        { label: 'shark', img: SEA.shark, say: 'It’s a shark!' },
        { label: 'whale', img: SEA.whale, say: 'It’s a whale!' },
        { label: 'turtle', img: SEA.turtle, say: 'It’s a turtle!' },
        { label: 'starfish', img: SEA.starfish, say: 'It’s a starfish!', scale: 0.8 },
        { label: 'turtles', img: SEA.turtles, say: 'They’re turtles!' },
      ],
      rounds: [
        { target: 2, line: 'Take a photo of the turtle!', place: [0, 1, 2, 3, 4] },
        { target: 0, line: 'Take a photo of the shark!', place: [2, 0, 1, 4, 3] },
        { target: 4, line: 'Many turtles! Take a photo!', place: [1, 4, 0, 2, 3] },
        { target: 1, line: 'It’s big and blue! Take a photo!', place: [3, 2, 4, 0, 1] },
        { target: 3, line: 'It’s small and orange! Take a photo!', place: [4, 3, 2, 1, 0] },
      ],
      doneLine: 'Look at your sea photos! Super explorer!',
    },
  },
  {
    id: 'oc-shadows', kind: 'prea1', teacher: 'Guided: drag each sea animal onto its shadow — and say it: It’s a starfish!',
    scene: {
      id: 'oc-shadows', kind: 'shadow-match', bg: bgReef, who: 'mia',
      teacher: 'Drag each animal onto its shadow. Say it!',
      items: [
        { label: 'shark', img: SEA.shark, line: 'It’s a shark!' },
        { label: 'whale', img: SEA.whale, line: 'It’s a whale!' },
        { label: 'turtle', img: SEA.turtle, line: 'It’s a turtle!' },
        { label: 'starfish', img: SEA.starfish, line: 'It’s a starfish!' },
        { label: 'seahorse', img: SEA.seahorse, line: 'It’s a seahorse!' },
      ],
    },
  },
  {
    id: 'oc-move-break', kind: 'prea1', teacher: 'Brain break: move like the sea animals with Pip — and say it.',
    scene: {
      id: 'oc-move-break', kind: 'tpr-actions', mode: 'break', bg: bgBeach, who: 'pip', teacher: 'Move like a sea animal!',
      rounds: [
        { line: 'Be a big whale! Open your arms wide!', emoji: '\u{1F433}' },
        { line: 'Be a shark! Hands together — swim, swim!', emoji: '\u{1F988}' },
        { line: 'Be a starfish! Arms and legs out!', emoji: '\u{2B50}' },
        { line: 'Be a turtle! Slow, slow, slow…', emoji: '\u{1F422}' },
      ],
    },
  },
  {
    id: 'oc-i-spy', kind: 'i-spy', bg: bgSpy, who: 'pip', guide: item('pip-binoculars'),
    teacher: 'Guided: I Spy under the sea! Pip gives a clue — the student moves the binoculars to the animal, then says it: It’s a turtle!',
    rounds: [
      { clue: 'I spy something big and blue!', spot: { left: 28, top: 22, r: 12 }, answer: 'It’s a whale!' },
      { clue: 'I spy something grey with a big fin!', spot: { left: 79, top: 23, r: 9 }, answer: 'It’s a shark!' },
      { clue: 'I spy something green with a shell!', spot: { left: 49, top: 52, r: 9 }, answer: 'It’s a turtle!' },
      { clue: 'I spy something small and orange, like a star!', spot: { left: 17, top: 83, r: 7 }, answer: 'It’s a starfish!' },
      { clue: 'I spy something yellow with a curly tail!', spot: { left: 83, top: 60, r: 6 }, answer: 'It’s a seahorse!' },
    ],
    doneLine: 'Super spying! You found every sea animal!',
  },
  {
    id: 'oc-big-small', kind: 'listen-tap', bg: bgReef,
    teacher: 'You do (listening): Coral describes an animal — big or small, one or many. Tap it, then say it.',
    targets: [
      { label: 'whale', left: '18%', top: '55%', color: '#38BDF8', img: SEA.whale },
      { label: 'starfish', left: '39%', top: '55%', color: '#FE6A2F', img: SEA.starfish },
      { label: 'sharks', left: '61%', top: '55%', color: '#0EA5E9', img: SEA.sharks },
      { label: 'turtle', left: '82%', top: '55%', color: '#22C55E', img: SEA.turtle },
    ],
    rounds: [
      { prompt: 'It’s big. It’s blue. It’s a whale!', answerLabel: 'whale', who: 'coral' },
      { prompt: 'They’re grey. They’re sharks!', answerLabel: 'sharks', who: 'coral' },
      { prompt: 'It’s small. It’s orange. It’s a starfish!', answerLabel: 'starfish', who: 'coral' },
      { prompt: 'It’s green. It’s got a shell. It’s a turtle!', answerLabel: 'turtle', who: 'coral' },
    ],
  },
  /* Reading: The Treasure Reef, pages 1-3 */
  {
    id: 'oc-reader', kind: 'reader', bg: bgBeach, title: 'The Treasure Reef', doneLine: 'A whale and a turtle! What will the friends find next? See you next time!',
    teacher: 'Reading: listen while the words light up, then the student reads each page. Tap any word to hear it.',
    pages: TREASURE_REEF.slice(0, 3),
  },
  {
    id: 'oc-read-match', kind: 'picture-match', look: 'frames', prompt: 'Read and match',
    teacher: 'Reading: read each sentence from the story and drag it under its picture. Then read it aloud.',
    items: [
      { word: 'A boat on the sea.', img: reefPage(1) },
      { word: 'This is Coral.', img: reefPage(2) },
      { word: 'It is a whale.', img: reefPage(3) },
    ],
    bg: bgReef,
  },
  {
    id: 'oc-yes-no', kind: 'true-false', bg: bgReef, img: reefPage(3), read: true,
    teacher: 'Reading: look at the picture, READ each sentence — yes or no? (🔊 only if the student needs help.)',
    rounds: [
      { who: 'pip', statement: 'It is a whale.', isTrue: true },
      { who: 'pip', statement: 'The whale is small.', isTrue: false },
      { who: 'mia', statement: 'It is a turtle.', isTrue: true },
      { who: 'mia', statement: 'They are sharks.', isTrue: false },
      { who: 'leo', statement: 'It is sunny.', isTrue: true },
    ],
  },
  /* Phonics: wh → Letter Moles → Blend & Read → tongue twister */
  {
    id: 'oc-sound-wh', kind: 'sound-model', bg: bgBeach, who: 'pip', letter: 'WH', phoneme: '/w/', sound: 'wh', soundSide: 'center',
    teacher: 'Present: w and h together say /w/ — round lips, like blowing! Whale, wheel, whistle. Say: wh-wh-whale!',
    anchors: [
      { word: 'whale', emoji: '\u{1F433}', img: SEA.whale },
      { word: 'wheel', emoji: '\u{1F6DE}', img: item('wheel') },
      { word: 'whistle', emoji: '\u{1F4E3}', img: item('whistle') },
    ],
  },
  {
    id: 'oc-moles', kind: 'prea1', teacher: 'Guided: Letter Moles! Hear /w/ — bonk every mole whose picture starts with wh, and say the word.',
    scene: {
      id: 'oc-moles', kind: 'sound-mole', bg: bgBeach, who: 'pip', teacher: 'Hear the sound, then bonk every mole whose picture starts with it!',
      rounds: [
        { letter: 'wh', pictures: [{ word: 'whale', img: SEA.whale }, { word: 'wheel', img: item('wheel') }, { word: 'whistle', img: item('whistle') }, { word: 'shark', img: SEA.shark }, { word: 'turtle', img: SEA.turtle }] },
      ],
    },
  },
  {
    id: 'oc-blend', kind: 'sound-blend', bg: bgBeach,
    teacher: 'Reading: say each sound (wh, ee, l — blend them), blend the word, find the picture — then read the sentence.',
    rounds: [
      { word: 'wheel', sounds: ['wh', 'ee', 'l'], img: item('wheel'), sentence: 'The boat has got a wheel.' },
      { word: 'whisk', sounds: ['wh', 'i', 's', 'k'], img: item('whisk'), sentence: 'Mix the eggs with a whisk.' },
    ],
  },
  { id: 'oc-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgBeach, who: 'pip', focus: 'wh', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, faster — then whale speed!', line: 'Why do white whales whistle?' },
  /* Free: favourite animal; the child asks */
  {
    id: 'oc-free-talk', kind: 'join-stage', bg: bgReef, teacher: 'Free: Coral asks the student’s favourite sea animal — they answer in a sentence and say one more thing about it. Then they ask Coral.', cast: ['coral'],
    turns: [
      { who: 'coral', line: 'What’s your favourite sea animal?' },
      { who: 'student', line: 'It’s a … . It’s big / small!' },
      { who: 'coral', line: 'Cool! Ask me!' },
      { who: 'student', line: 'What’s your favourite sea animal?' },
      { who: 'coral', line: 'It’s a turtle. It’s green and slow!' },
    ],
  },
  {
    id: 'oc-tour', kind: 'join-stage', bg: bgSpy, teacher: 'Free: the student is the tour guide! Point to animals in the big picture and tell Pip: Look! It’s a… . They’re… . Pip asks “What’s that?”', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'What’s that? Look, there!' },
      { who: 'student', line: 'It’s a … !' },
      { who: 'pip', line: 'And what are they?' },
      { who: 'student', line: 'They’re … !' },
      { who: 'pip', line: 'Wow! You know the sea!' },
    ],
  },
  { id: 'oc-i-can', kind: 'meet', focus: ['animals'], bg: reefPage(2), who: 'coral', cardSide: 'left', teacher: 'Check: the student names 5 sea animals in full sentences (It’s a… / They’re…) — then the passport stamp!', line: 'You can name the sea animals!', repeat: 'It’s a whale. They’re sharks.' },
  {
    id: 'oc-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Ocean sticker in their Sticker Book.',
    scene: {
      id: 'oc-sticker', kind: 'sticker-reward', bg: bgBeach, who: 'pip', teacher: 'Sticker time!',
      line: 'Super sea explorer! Here is your sticker.',
      sticker: { img: SEA.whale, label: 'Sea explorer' },
    },
  },
  petPal('oc-pet-pal', 0, 'I want something from the sea! I want a shell!', [{ label: 'shell', img: SEA.shell }, { label: 'rocket', img: item('rocket') }, { label: 'cake', img: item('cake') }], 0, 'A shell! Thank you!'),
  {
    id: 'oc-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'oc-home-mission', kind: 'home-mission', bg: bgBeach, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned sea animals (shark, whale, turtle, starfish) and how to name one or many: "It\'s a whale. They\'re sharks." This week, find a sea animal in a book or on TV and ask: "What\'s that?"',
      steps: [
        { emoji: '\u{1F4D6}', say: 'Find a sea animal in a book or on TV.' },
        { emoji: '\u{1F433}', say: 'Say: It’s a whale!' },
        { emoji: '\u{1F41F}', say: 'Many fish? Say: They’re fish!' },
      ],
    },
  },
  {
    id: 'oc-move-break-2', kind: 'prea1', teacher: 'Brain break: big whale, small fish!',
    scene: {
      id: 'oc-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgBeach, who: 'pip', teacher: 'Big or small?',
      rounds: [
        { line: 'Be a big whale! Stand up tall!', emoji: '\u{1F433}' },
        { line: 'Be a small fish! Crouch down!', emoji: '\u{1F41F}' },
        { line: 'Splash! Wave your arms like the sea!', emoji: '\u{1F30A}' },
      ],
    },
  },
  goodbyeSong('oc-goodbye-song', bgBeach),
  { id: 'oc-finale', kind: 'finale', bg: bgBeach, who: 'pip', line: 'You can name the sea animals! See you at the beach! \u{1F30A}' },
];

/* =============================================================================
 * A1 Unit 6 Lesson 2: "More Sea Animals: Octopus, Crab"
 * Objective: I can say what a sea animal is doing: "The octopus is hiding. The crab is walking."
 * Story frame: a dive into Bub's rocky reef garden (new setting: rocks, caves and purple sea fans, cool blue-green
 *   light) — shy Bub hides, the reef wakes up when the child says what each animal is doing.
 * Practice ladder: Revise (Remember? L1 animals, shadows) → Present (I do: octopus, crab; then one action per card on
 *   the animals: hiding, walking, sleeping, eating, diving, swimming) → we do (echo) → Read and Match → you do (Live
 *   Reef ★: pick the action, say the whole sentence, the reef lights up; Catch & Sort is / are; Flip & Say) → Reading
 *   (Reader p1-5, Picture Maze, Read and Match, Yes or No?) → Phonics oa (Word Splat, Blend & Read, twister) → Free
 *   (What am I doing? mime; ask Bub) → check.
 * ========================================================================= */

export const LESSON_A1U6L2_TITLE = 'More Sea Animals: Octopus, Crab';
export const LESSON_A1U6L2_OBJECTIVE = 'I can say what a sea animal is doing: "The octopus is hiding. The crab is walking."';

const bgRocks = `${S}/bg-a1u6-rocks-wide.png`;
/** Action stickers (Canva, cut-out): one animal doing one thing — the picture shows exactly the verb. */
export const ACT = {
  hiding: item('bub-hiding'), walking: item('crab-walking'), sleeping: item('starfish-sleeping'),
  eating: item('fish-eating'), diving: item('whale-diving'), turtleEating: item('turtle-eating'),
  swimming: SEA.shark, fishSwimming: item('fish-swim'),
};
const BOAT = '/magic-castle/stickers/boat.png';

export const LESSON_A1U6L2_SCENES: Scene[] = [
  { id: 'oc2-title', kind: 'title-card', bg: reefPage(4), level: 'A1', unit: 'Unit 6', lessonLabel: 'Lesson 2', title: 'Octopus, Crab!', subtitle: 'What is it doing? Hiding, walking, sleeping…', cta: '\u{1F419} DIVE IN!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 1 — the sea animals. Shadow mode: the stickers have clearly different outlines.
    id: 'oc2-recall-warmup', kind: 'recall-warmup', bg: bgReef, who: 'pip', mode: 'shadow', listen: true,
    fromLabel: 'Lesson 1 · Meet the Sea Animals',
    teacher: 'Guided: listen — which shadow is it? Tap it, then say the sentence: It’s a … .',
    items: [
      { word: 'shark', say: 'It’s a shark.', img: SEA.shark },
      { word: 'whale', say: 'It’s a whale.', img: SEA.whale },
      { word: 'turtle', say: 'It’s a turtle.', img: SEA.turtle },
      { word: 'starfish', say: 'It’s a starfish.', img: SEA.starfish },
    ],
  },
  { id: 'oc2-meet-bub', kind: 'meet', focus: ['octopus', 'hiding'], bg: reefPage(4), who: 'bub', cardSide: 'right', teacher: 'Present: someone is behind the rock! Whisper: Who is it? It’s Bub — an octopus. He is shy. He is hiding.', line: 'Hello… I’m Bub. I’m an octopus. I’m hiding!', repeat: 'This is Bub. He is hiding.' },
  {
    id: 'oc2-animals', kind: 'prea1', teacher: 'Present (I do → you do): two new sea animals. Say it, the student says it.',
    scene: {
      id: 'oc2-animals', kind: 'listen-repeat-cards', bg: bgRocks, teacher: 'Listen and say it!',
      cards: [
        { who: 'mia', sentence: 'It’s an octopus.', img: SEA.octopus, imgLabel: 'octopus' },
        { who: 'mia', sentence: 'It’s a crab.', img: SEA.crab, imgLabel: 'crab' },
      ],
    },
  },
  { id: 'oc2-model-doing', kind: 'meet', focus: ['doing', 'hiding'], bg: reefPage(4), who: 'coral', cardSide: 'right', teacher: 'Present (I do): the question and the answer, one each. Point to Bub: What is he doing? He’s hiding. Now hide your face behind your hands!', line: 'What’s Bub doing? He’s hiding!', repeat: 'What’s Bub doing? He’s hiding.' },
  {
    id: 'oc2-actions', kind: 'prea1', teacher: 'Present (I do → we do): one action per card. Say the sentence and do the action — the student copies both.',
    scene: {
      id: 'oc2-actions', kind: 'listen-repeat-cards', bg: bgRocks, teacher: 'Listen, do it and say it!',
      cards: [
        { who: 'mia', sentence: 'The octopus is hiding.', img: ACT.hiding, imgLabel: 'hiding' },
        { who: 'mia', sentence: 'The crab is walking.', img: ACT.walking, imgLabel: 'walking' },
        { who: 'mia', sentence: 'The starfish is sleeping.', img: ACT.sleeping, imgLabel: 'sleeping' },
        { who: 'mia', sentence: 'The fish is eating.', img: ACT.eating, imgLabel: 'eating' },
        { who: 'mia', sentence: 'The whale is diving.', img: ACT.diving, imgLabel: 'diving' },
        { who: 'mia', sentence: 'The shark is swimming.', img: ACT.swimming, imgLabel: 'swimming' },
      ],
    },
  },
  {
    // One = is, many = are — the pictures show it (one fish / a school of fish), not an empty sea.
    id: 'oc2-model-many', kind: 'prea1', teacher: 'Present (we do): one = is, many = are. Hold up one finger: The fish is swimming. All fingers: The fish are swimming!',
    scene: {
      id: 'oc2-model-many', kind: 'listen-repeat-cards', bg: bgDeep, teacher: 'One fish or many fish? Listen and say it!',
      cards: [
        { who: 'mia', sentence: 'The fish is swimming.', img: SEA.fish, imgLabel: 'one fish' },
        { who: 'mia', sentence: 'The fish are swimming.', img: SEA.fishes, imgLabel: 'many fish' },
      ],
    },
  },
  { id: 'oc2-echo', kind: 'echo', bg: reefPage(5), who: 'pip', textSide: 'top', teacher: 'Guided (we do): say it like Pip — and walk your fingers sideways like a crab!', word: 'The crab is walking!' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'oc2-match', kind: 'picture-match', look: 'cards', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its picture, then reads it aloud.',
    items: [
      { word: 'The octopus is hiding.', img: ACT.hiding },
      { word: 'The crab is walking.', img: ACT.walking },
      { word: 'The starfish is sleeping.', img: ACT.sleeping },
      { word: 'The fish is eating.', img: ACT.eating },
      { word: 'The whale is diving.', img: ACT.diving },
      { word: 'The shark is swimming.', img: ACT.swimming },
    ],
    bg: bgRocks,
  },
  {
    id: 'oc2-live-reef', kind: 'live-reef', bg: bgRocks, who: 'coral', title: 'Live Reef: wake up the reef!',
    teacher: 'You do (the new game ★): an animal peeks out of the fog. Coral asks: What’s it doing? The student picks the action, then SAYS the whole sentence (The crab is walking.) and taps 🎤 — that part of the reef lights up. A wrong action: the animal shrugs — look again!',
    spots: [
      { name: 'crab', img: ACT.walking, left: 72, top: 56, size: 14 },
      { name: 'octopus', img: ACT.hiding, left: 18, top: 52, size: 16 },
      { name: 'starfish', img: ACT.sleeping, left: 45, top: 58, size: 12 },
      { name: 'whale', img: ACT.diving, left: 30, top: 26, size: 20 },
      { name: 'fish', img: ACT.eating, left: 82, top: 34, size: 12 },
      { name: 'turtle', img: ACT.turtleEating, left: 58, top: 40, size: 15 },
    ],
    rounds: [
      { spot: 0, doing: 'walking', choices: ['sleeping', 'walking', 'diving'] },
      { spot: 1, doing: 'hiding', choices: ['hiding', 'eating', 'walking'] },
      { spot: 2, doing: 'sleeping', choices: ['swimming', 'diving', 'sleeping'] },
      { spot: 3, doing: 'diving', choices: ['diving', 'walking', 'hiding'] },
      { spot: 4, doing: 'eating', choices: ['hiding', 'eating', 'sleeping'] },
      { spot: 5, doing: 'eating', choices: ['walking', 'sleeping', 'eating'] },
    ],
    doneLine: 'The whole reef is awake! You can say what they are doing!',
  },
  helloSong('oc2-hello-song', reefPage(1)),
  {
    id: 'oc2-catch', kind: 'prea1', teacher: 'Guided: one animal or many? Catch it: is (one) or are (many) — and say the sentence: The shark is swimming. The sharks are swimming.',
    scene: {
      id: 'oc2-catch', kind: 'catch-sort', bg: bgDeep, goal: 6, seconds: 50,
      teacher: 'One or many? Catch it in the right net and say it!',
      left: { label: 'is', img: SEA.shark, emoji: '\u{0031}\u{FE0F}\u{20E3}' }, right: { label: 'are', img: SEA.sharks, emoji: '\u{1F522}' },
      items: [
        { word: 'shark', img: SEA.shark, emoji: '\u{1F988}', target: 'left' },
        { word: 'sharks', img: SEA.sharks, emoji: '\u{1F988}', target: 'right' },
        { word: 'turtle', img: SEA.turtle, emoji: '\u{1F422}', target: 'left' },
        { word: 'turtles', img: SEA.turtles, emoji: '\u{1F422}', target: 'right' },
        { word: 'one fish', img: ACT.fishSwimming, emoji: '\u{1F41F}', target: 'left' },
        { word: 'many fish', img: SEA.fishes, emoji: '\u{1F41F}', target: 'right' },
        { word: 'crab', img: ACT.walking, emoji: '\u{1F980}', target: 'left' },
      ],
    },
  },
  {
    id: 'oc2-flip', kind: 'prea1', teacher: 'Guided: flip a card — say what the animal is doing in a whole sentence. The teacher flips one too and the student checks.',
    scene: {
      id: 'oc2-flip', kind: 'flip-say', bg: bgRocks, who: 'pip', title: 'Flip a card and say it!',
      teacher: 'Flip a card. What is it doing?',
      cards: [
        { label: 'hiding', img: ACT.hiding, say: 'The octopus is hiding.' },
        { label: 'walking', img: ACT.walking, say: 'The crab is walking.' },
        { label: 'sleeping', img: ACT.sleeping, say: 'The starfish is sleeping.' },
        { label: 'eating', img: ACT.eating, say: 'The fish is eating.' },
        { label: 'diving', img: ACT.diving, say: 'The whale is diving.' },
        { label: 'swimming', img: ACT.swimming, say: 'The shark is swimming.' },
      ],
      doneLine: 'Great sentences! You can say what they are doing!',
    },
  },
  {
    id: 'oc2-move-break', kind: 'prea1', teacher: 'Brain break: be the sea animals with Pip — and say what you are doing.',
    scene: {
      id: 'oc2-move-break', kind: 'tpr-actions', mode: 'break', bg: reefPage(1), who: 'pip', teacher: 'What are you doing?',
      rounds: [
        { line: 'Walk sideways like a crab! I’m walking!', emoji: '\u{1F980}' },
        { line: 'Hide your face like Bub! I’m hiding!', emoji: '\u{1F419}' },
        { line: 'Dive down like a whale! I’m diving!', emoji: '\u{1F433}' },
        { line: 'Sleep like a starfish… shh! I’m sleeping!', emoji: '\u{2B50}' },
      ],
    },
  },
  /* Reading: The Treasure Reef, pages 1-5 */
  {
    id: 'oc2-reader', kind: 'reader', bg: reefPage(1), title: 'The Treasure Reef', doneLine: 'Bub is hiding and the crab is walking. What happens next? See you next time!',
    teacher: 'Reading: pages 1-3 again quickly, then the new pages 4-5. Listen while the words light up, then the student reads.',
    pages: TREASURE_REEF.slice(0, 5),
  },
  {
    id: 'oc2-maze', kind: 'prea1', teacher: 'Reading: read the sentence at the top, take Pip through the maze to the right animal — then say the sentence.',
    scene: {
      id: 'oc2-maze', kind: 'picture-maze', bg: bgRocks, who: 'mia', walker: '/welcome-town/sprites/pip-wave.png', title: 'Who is doing it? Find the animal!', layout: 2,
      teacher: 'Read it, take Pip to the animal, then say the sentence.',
      items: [
        { label: 'animal that is hiding', img: ACT.hiding, say: 'The octopus is hiding!' },
        { label: 'animal that is walking', img: ACT.walking, say: 'The crab is walking!' },
        { label: 'animal that is sleeping', img: ACT.sleeping, say: 'The starfish is sleeping!' },
      ],
      rounds: [1, 0, 2], doneLine: 'You found them all! Super reading!',
    },
  },
  {
    id: 'oc2-read-match', kind: 'picture-match', look: 'chalk', prompt: 'Read and match',
    teacher: 'Reading: read each sentence from the story and drag it under its picture. Then read it aloud.',
    items: [
      { word: 'Bub is hiding.', img: reefPage(4) },
      { word: 'The crab is walking.', img: reefPage(5) },
      { word: 'This is Coral.', img: reefPage(2) },
    ],
    bg: bgRocks,
  },
  {
    id: 'oc2-balloons', kind: 'balloon-match', bg: bgRocks, who: 'coral', title: 'Balloon Match: what is it doing?',
    teacher: 'Reading game: the student reads a balloon (tap it to hear it), then taps the animal doing it. The balloon floats down and pops!',
    pairs: [
      { text: 'The whale is diving.', img: ACT.diving, label: 'whale' },
      { text: 'The fish is eating.', img: ACT.eating, label: 'fish' },
      { text: 'The octopus is hiding.', img: ACT.hiding, label: 'octopus' },
      { text: 'The starfish is sleeping.', img: ACT.sleeping, label: 'starfish' },
    ],
    doneLine: 'Pop, pop! You can read what they are doing!',
  },

  /* Phonics: oa → Word Splat → Blend & Read → tongue twister */
  {
    id: 'oc2-sound-oa', kind: 'sound-model', bg: reefPage(1), who: 'pip', letter: 'OA', phoneme: '/oʊ/', sound: 'oa', soundSide: 'center',
    teacher: 'Present: o and a together say /oʊ/ — make your mouth round like an O! Boat, coat, goat. Say: oa, oa, boat!',
    anchors: [
      { word: 'boat', emoji: '\u{26F5}', img: BOAT },
      { word: 'coat', emoji: '\u{1F9E5}', img: item('coat-blue') },
      { word: 'goat', emoji: '\u{1F410}', img: item('goat') },
    ],
  },
  {
    id: 'oc2-splat', kind: 'word-splat', bg: reefPage(1), who: 'coral', title: 'Word Splat! Listen and splat the word!',
    teacher: 'Reading: Coral says a word — the student splats it and reads it aloud. The oa words and today’s sight words.',
    words: ['boat', 'coat', 'goat', 'soap', 'road', 'is', 'are', 'what', 'doing', 'the'],
    rounds: ['boat', 'doing', 'goat', 'is', 'coat', 'what', 'soap', 'are'],
    doneLine: 'Splat! You can read them!',
  },
  {
    id: 'oc2-blend', kind: 'sound-blend', bg: reefPage(1),
    teacher: 'Reading: say each sound (b, oa, t — blend them), blend the word, find the picture — then read the sentence.',
    rounds: [
      { word: 'boat', sounds: ['b', 'oa', 't'], img: BOAT, sentence: 'The boat is on the sea.' },
      { word: 'coat', sounds: ['c', 'oa', 't'], img: item('coat-blue'), sentence: 'Pip has got a blue coat.' },
      { word: 'goat', sounds: ['g', 'oa', 't'], img: item('goat'), sentence: 'The goat is in the boat!' },
    ],
  },
  { id: 'oc2-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: reefPage(1), who: 'pip', focus: 'oa', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, faster — then boat speed!', line: 'A goat in a coat floats on a boat.' },
  /* Free: What am I doing? + ask Bub */
  {
    id: 'oc2-mime', kind: 'join-stage', bg: bgRocks, teacher: 'Free: the student mimes a sea animal doing something (walking crab, sleeping starfish, hiding octopus…). Pip asks; the student answers in a sentence. Then swap: Pip mimes, the student asks.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'What are you doing?' },
      { who: 'student', line: 'I’m … ! I’m a … !' },
      { who: 'pip', line: 'Now me! What am I doing?' },
      { who: 'student', line: 'You’re … !' },
      { who: 'pip', line: 'Yes! I’m swimming like a fish!' },
    ],
  },
  {
    id: 'oc2-ask-bub', kind: 'join-stage', bg: reefPage(4), teacher: 'Free: the student asks Bub questions (What are you doing? Are you hiding?) and then tells Coral what Bub is doing.', cast: ['bub', 'coral'],
    turns: [
      { who: 'student', line: 'Hello, Bub! What are you doing?' },
      { who: 'bub', line: 'I’m hiding. I’m shy!' },
      { who: 'coral', line: 'What’s Bub doing?' },
      { who: 'student', line: 'He’s hiding!' },
      { who: 'bub', line: 'Now I’m swimming with you!' },
    ],
  },
  { id: 'oc2-i-can', kind: 'meet', focus: ['doing'], bg: reefPage(5), who: 'coral', cardSide: 'right', teacher: 'Check: the student says what 5 animals are doing, in whole sentences (The crab is walking.) — then the passport stamp!', line: 'You can say what the animals are doing!', repeat: 'The crab is walking. The octopus is hiding.' },
  {
    id: 'oc2-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Ocean sticker in their Sticker Book.',
    scene: {
      id: 'oc2-sticker', kind: 'sticker-reward', bg: reefPage(1), who: 'pip', teacher: 'Sticker time!',
      line: 'Super sentences! Here is your sticker.',
      sticker: { img: ACT.hiding, label: 'Reef reporter' },
    },
  },
  petPal('oc2-pet-pal', 1, 'I’m sailing today! I want a boat!', [{ label: 'goat', img: item('goat') }, { label: 'boat', img: BOAT }, { label: 'coat', img: item('coat-blue') }], 1, 'A boat! I’m sailing!'),
  {
    id: 'oc2-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'oc2-home-mission', kind: 'home-mission', bg: reefPage(1), who: 'pip',
      line: 'Your home mission!', teacher: 'Home Mission: read the steps with the student.',
      parentNote: 'Today your child learned octopus and crab and how to say what someone is doing now: "The crab is walking. The octopus is hiding." This week, ask: "What are you doing?" and "What is Dad doing?"',
      steps: [
        { emoji: '\u{1F440}', say: 'Look at 3 people at home.' },
        { emoji: '\u{1F5E3}\u{FE0F}', say: 'Say what they are doing: Mom is cooking!' },
        { emoji: '\u{1F980}', say: 'Walk like a crab and say: I’m walking!' },
      ],
    },
  },
  {
    id: 'oc2-move-break-2', kind: 'prea1', teacher: 'Brain break: Bub’s game — hide and peek!',
    scene: {
      id: 'oc2-move-break-2', kind: 'tpr-actions', mode: 'break', bg: reefPage(1), who: 'pip', teacher: 'Hide and peek!',
      rounds: [
        { line: 'Hide behind your hands! Shh…', emoji: '\u{1F648}' },
        { line: 'Peek out! Boo! Hello!', emoji: '\u{1F440}' },
        { line: 'Swim back to your chair!', emoji: '\u{1F3CA}' },
      ],
    },
  },
  goodbyeSong('oc2-goodbye-song', reefPage(1)),
  { id: 'oc2-finale', kind: 'finale', bg: reefPage(5), who: 'pip', line: 'You can say what the sea animals are doing! See you at the reef! \u{1F419}' },
];

/* =============================================================================
 * A1 Unit 6 Lesson 3: "Listen: Where Do They Live?"
 * Objective: I can understand where animals live and what they eat: "It lives in the sea. It eats fish."
 * Evidence: 4 of 5 right from listening (Sticker Bingo, Draw the Path).
 * Story frame: the friends put on masks and dive down to the reef (story pages 6-7) — Coral shows them each animal's home.
 * Practice ladder: Revise (Remember? Lesson 2 actions) → Present (I do: one home per card, one food per card) → we do
 *   (echo) → Read and Match → you do (Home Sort ★: the animal swims home, the child says where it lives) → THE SONG
 *   "Down in the Sea" (after the first practice game: the child sings words they know) → Musical Islands → Draw the Path
 *   (listen) → Reading (Reader p6-7, Read and Match) → Sticker Bingo (listen to the facts) → Phonics: sh at the end
 *   (Letter Bubbles, Blend & Read, twister) → Free (Where does it live? / ask Coral) → check.
 * Research (docs/research/playground-a1u6-research.md, Lesson 3): Boom "Ocean Animal Habitats", Twinkl "Beach or Bush",
 *   Twinkl "Where Do I Live?", Boom "Feed the Shark" (final digraphs), K5 sh sort, Lingokids ocean songs.
 * ========================================================================= */

export const LESSON_A1U6L3_TITLE = 'Listen: Where Do They Live?';
export const LESSON_A1U6L3_OBJECTIVE = 'I can understand where animals live and what they eat: "It lives in the sea. It eats fish."';

const SEAGRASS = item('sea-grass');
const DISH = item('dish');
const BRUSH = item('brush');
const SPLASH = item('water-splash');
/** "Down in the Sea" (scripts/songs.json a1u6l3-ocean-down-in-the-sea, kids-song-writer gate PASS, 112 BPM, one take). */
const SONG_A1U6L3 = '/lep1/audio/down-in-the-sea-song-a1u6l3.mp3?v=1';
const SONG_A1U6L3_LYRICS: { who: CharKey; text: string }[] = [
  { who: 'coral', text: 'Down in the sea, down in the sea,' },
  { who: 'coral', text: 'The beach, the reef, come swim with me!' },
  { who: 'pip', text: 'Look at the turtle, swimming slow,' },
  { who: 'pip', text: 'It lives on the reef, you know!' },
  { who: 'pip', text: 'It eats the grass, munch, munch!' },
  { who: 'pip', text: 'Munch like a turtle, eat your lunch!' },
  { who: 'mia', text: 'Look at the crab, it’s walking slow,' },
  { who: 'mia', text: 'It lives on the beach, you know!' },
  { who: 'mia', text: 'It eats the shells, crunch, crunch!' },
  { who: 'mia', text: 'Walk like a crab and eat your lunch!' },
  { who: 'leo', text: 'Look at the shark, it’s swimming, go!' },
  { who: 'leo', text: 'It lives in the sea, you know!' },
  { who: 'leo', text: 'It eats the fish, yum, yum!' },
  { who: 'leo', text: 'Swim like a shark, here we come!' },
  { who: 'coral', text: 'Down in the sea, down in the sea,' },
  { who: 'coral', text: 'The beach, the reef, come swim with me!' },
];
/** Planned line times (112 BPM, 2 bars a line after a 2-bar intro); replaced by the take's measured times. */
const SONG_A1U6L3_MS = [8572, ...Array.from({ length: 15 }, () => 4286)];

export const LESSON_A1U6L3_SCENES: Scene[] = [
  { id: 'oc3-title', kind: 'title-card', bg: reefPage(6), level: 'A1', unit: 'Unit 6', lessonLabel: 'Lesson 3', title: 'Where Do They Live?', subtitle: 'In the sea, on the beach, on the reef!', cta: '\u{1F93F} DIVE IN!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 2 — what the animals are doing. Click mode: action stickers, listen and click.
    id: 'oc3-recall-warmup', kind: 'recall-warmup', bg: bgRocks, who: 'pip', mode: 'click',
    fromLabel: 'Lesson 2 · More Sea Animals',
    teacher: 'Guided: Pip says what an animal is doing — the student finds it and says the sentence: The crab is walking.',
    items: [
      { word: 'walking', say: 'The crab is walking.', img: ACT.walking },
      { word: 'hiding', say: 'The octopus is hiding.', img: ACT.hiding },
      { word: 'sleeping', say: 'The starfish is sleeping.', img: ACT.sleeping },
      { word: 'diving', say: 'The whale is diving.', img: ACT.diving },
    ],
  },
  helloSong('oc3-hello-song', reefPage(6)),
  { id: 'oc3-meet-coral', kind: 'meet', focus: ['live', 'sea'], bg: reefPage(2), who: 'coral', cardSide: 'left', teacher: 'Present (I do): Coral asks and answers. Point down: in the sea. Ask the student: Where does Coral live? She lives in the sea.', line: 'Where do I live? I live in the sea!', repeat: 'Coral lives in the sea.' },
  {
    id: 'oc3-homes', kind: 'prea1', teacher: 'Present (I do → you do): one home per card. Say it with your hands: in the sea (wave), on the beach (flat hand), on the reef (fingers like coral).',
    scene: {
      id: 'oc3-homes', kind: 'listen-repeat-cards', bg: bgReef, teacher: 'Where does it live? Listen and say it!',
      cards: [
        { who: 'mia', sentence: 'The shark lives in the sea.', img: SEA.shark, imgLabel: 'in the sea' },
        { who: 'mia', sentence: 'The crab lives on the beach.', img: ACT.walking, imgLabel: 'on the beach' },
        { who: 'mia', sentence: 'The turtle lives on the reef.', img: SEA.turtle, imgLabel: 'on the reef' },
      ],
    },
  },
  { id: 'oc3-model-eats', kind: 'meet', focus: ['eats'], bg: reefPage(3), who: 'coral', cardSide: 'right', teacher: 'Present (I do): the question and the answer. Mime eating! What does it eat? It eats fish.', line: 'What does the shark eat? It eats fish!', repeat: 'It eats fish.' },
  {
    id: 'oc3-food', kind: 'prea1', teacher: 'Present (we do): one food per card. Say it together and mime it: munch (plants), crunch (shells), yum (fish).',
    scene: {
      id: 'oc3-food', kind: 'listen-repeat-cards', bg: bgDeep, teacher: 'What does it eat? Listen and say it!',
      cards: [
        { who: 'mia', sentence: 'It eats fish.', img: SEA.fish, imgLabel: 'fish' },
        { who: 'mia', sentence: 'It eats sea grass.', img: SEAGRASS, imgLabel: 'sea grass' },
        { who: 'mia', sentence: 'It eats shells.', img: SEA.shell, imgLabel: 'shells' },
      ],
    },
  },
  { id: 'oc3-echo', kind: 'echo', bg: reefPage(7), who: 'pip', textSide: 'top', teacher: 'Guided (we do): say it like Pip — fingers like coral for "reef", then munch!', word: 'It lives on the reef. It eats sea grass.' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game. Design differs from L2 (cards) and U5L3 (polaroids).
  {
    id: 'oc3-match', kind: 'picture-match', look: 'frames', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its animal, then reads it aloud.',
    items: [
      { word: 'The shark lives in the sea.', img: SEA.shark },
      { word: 'The crab lives on the beach.', img: ACT.walking },
      { word: 'The turtle lives on the reef.', img: SEA.turtle },
      { word: 'The whale lives in the sea.', img: SEA.whale },
      { word: 'The seahorse lives on the reef.', img: SEA.seahorse },
    ],
    bg: bgReef,
  },
  {
    id: 'oc3-home-sort', kind: 'sort-basket', look: 'homes', bg: bgReef, title: 'Home Sort: where does it live?',
    teacher: 'You do (the lesson’s big game ★): an animal arrives — the student taps its home. When it swims in, the student SAYS the sentence: It lives on the reef. Two wrong taps: the right home glows.',
    baskets: [{ label: 'in the sea', emoji: '\u{1F30A}' }, { label: 'on the beach', emoji: '\u{1F3D6}\u{FE0F}' }, { label: 'on the reef', emoji: '\u{1FAB8}' }],
    items: [
      { word: 'shark', img: SEA.shark, basket: 0 },
      { word: 'crab', img: ACT.walking, basket: 1 },
      { word: 'turtle', img: SEA.turtle, basket: 2 },
      { word: 'whale', img: SEA.whale, basket: 0 },
      { word: 'starfish', img: ACT.sleeping, basket: 1 },
      { word: 'seahorse', img: SEA.seahorse, basket: 2 },
    ],
  },
  {
    // The lesson song comes AFTER the first practice game (owner, 2026-10-10): the child sings words they know.
    id: 'oc3-song', kind: 'song', bg: reefPage(6), title: '\u{1F3B5} Down in the Sea \u{1F3B5}',
    teacher: 'Song: sing along and do the actions — swim slow (turtle), walk sideways (crab), swim fast (shark). Point down for "sea", flat hand for "beach", coral fingers for "reef".',
    bigWord: 'sea', songUrl: SONG_A1U6L3, lineDurationsMs: SONG_A1U6L3_MS, lyrics: SONG_A1U6L3_LYRICS,
  },
  {
    id: 'oc3-islands', kind: 'musical-islands', bg: bgReef, who: 'coral', music: SONG_HELLO /* → SONG_A1U6L3 once the take is in */, title: 'Musical Islands', padWord: 'island',
    teacher: 'Guided (listen): press 🎵 — the animals swim from island to island. The music stops: Coral asks who is on an island. The student taps it and says: The turtle is on the red island!',
    players: [{ label: 'turtle', img: SEA.turtle }, { label: 'crab', img: SEA.crab }, { label: 'shark', img: SEA.shark }, { label: 'octopus', img: BUB }],
    rounds: [
      { at: [0, 1, 2, 3], pad: 2, ask: 'Who is on the yellow island?', say: 'The shark is on the yellow island!' },
      { at: [3, 0, 1, 2], pad: 0, ask: 'Who is on the red island?', say: 'The crab is on the red island!' },
      { at: [1, 3, 0, 2], pad: 1, ask: 'Who is on the blue island?', say: 'The turtle is on the blue island!' },
      { at: [2, 1, 3, 0], pad: 0, ask: 'Who is on the red island?', say: 'The octopus is on the red island!' },
    ],
    doneLine: 'Great listening! Everyone found an island!',
  },
  {
    id: 'oc3-draw-path', kind: 'prea1', teacher: 'Guided (listen): Coral describes an animal (where it lives, what it eats) — the student draws a line from Pip to it, then says: It’s the … !',
    scene: {
      id: 'oc3-draw-path', kind: 'draw-path', bg: bgReef, who: 'pip', walker: 'pip',
      teacher: 'Listen and draw a line from Pip to the animal!',
      start: { x: 9, y: 84 },
      spots: [
        { label: 'turtle', img: SEA.turtle, x: 72, y: 62, size: 13 },
        { label: 'crab', img: SEA.crab, x: 44, y: 80, size: 10 },
        { label: 'shark', img: SEA.shark, x: 58, y: 32, size: 14 },
        { label: 'seahorse', img: SEA.seahorse, x: 30, y: 46, size: 8 },
      ],
      rounds: [
        { line: 'Take Pip to the animal that lives on the beach. It eats shells!', target: 1, reply: 'It’s the crab! It lives on the beach.' },
        { line: 'Take Pip to the animal that eats sea grass. It lives on the reef!', target: 0, reply: 'It’s the turtle! It eats sea grass.' },
        { line: 'Take Pip to the big animal that lives in the sea. It eats fish!', target: 2, reply: 'It’s the shark! It lives in the sea.' },
        { line: 'Take Pip to the small animal that lives on the reef. It’s got a curly tail!', target: 3, reply: 'It’s the seahorse! It lives on the reef.' },
      ],
    },
  },
  {
    id: 'oc3-move-break', kind: 'prea1', teacher: 'Brain break: do the song actions with Pip — and say where you live!',
    scene: {
      id: 'oc3-move-break', kind: 'tpr-actions', mode: 'break', bg: reefPage(6), who: 'pip', teacher: 'Swim, walk, munch!',
      rounds: [
        { line: 'Swim slow like a turtle! I live on the reef!', emoji: '\u{1F422}' },
        { line: 'Walk sideways like a crab! I live on the beach!', emoji: '\u{1F980}' },
        { line: 'Swim fast like a shark! I live in the sea!', emoji: '\u{1F988}' },
        { line: 'Munch, munch! I eat sea grass!', emoji: '\u{1F33F}' },
      ],
    },
  },
  /* Reading: The Treasure Reef, pages 1-7 */
  {
    id: 'oc3-reader', kind: 'reader', bg: reefPage(6), title: 'The Treasure Reef', doneLine: 'The friends are on the reef. What happens next? See you next time!',
    teacher: 'Reading: pages 1-5 again quickly, then the new pages 6-7. Listen while the words light up, then the student reads.',
    pages: TREASURE_REEF.slice(0, 7),
  },
  {
    id: 'oc3-read-match', kind: 'picture-match', look: 'polaroids', prompt: 'Read and match',
    teacher: 'Reading: read each sentence from the story and drag it under its picture. Then read it aloud.',
    items: [
      { word: 'The friends are diving.', img: reefPage(6) },
      { word: 'The turtle eats sea grass.', img: reefPage(7) },
      { word: 'The crab is walking.', img: reefPage(5) },
    ],
    bg: bgReef,
  },
  {
    id: 'oc3-bingo', kind: 'sticker-bingo', bg: bgReef, who: 'coral', title: 'Sea Bingo! Listen and stamp!',
    teacher: 'Guided (listen — the lesson’s evidence): Coral says where an animal lives and what it eats — the student stamps it and says the animal: It’s a turtle! Three in a row: Bingo!',
    cells: [
      { label: 'turtle', img: SEA.turtle, say: 'It lives on the reef. It eats sea grass.' },
      { label: 'crab', img: SEA.crab, say: 'It lives on the beach. It walks sideways.' },
      { label: 'shark', img: SEA.shark, say: 'It lives in the sea. It eats fish. It’s got big teeth!' },
      { label: 'whale', img: SEA.whale, say: 'It lives in the sea. It’s very, very big!' },
      { label: 'seahorse', img: SEA.seahorse, say: 'It lives on the reef. It’s small. It’s got a curly tail.' },
      { label: 'starfish', img: SEA.starfish, say: 'It lives on the beach. It’s got five arms.' },
      { label: 'octopus', img: BUB, say: 'It’s got eight arms. It likes hiding!' },
      { label: 'fish', img: SEA.fish, say: 'It’s small and orange. It swims and swims.' },
      { label: 'shell', img: SEA.shell, say: 'It isn’t an animal. It’s on the beach. The crab eats it!' },
    ],
    calls: [0, 4, 8, 2, 6, 1, 3],
    doneLine: 'Bingo! Super listening!',
  },

  /* Phonics: sh at the end → Letter Bubbles → Blend & Read → tongue twister */
  {
    id: 'oc3-sound-sh', kind: 'sound-model', bg: reefPage(7), who: 'pip', letter: 'SH', phoneme: '/ʃ/', sound: 'sh', soundSide: 'center',
    teacher: 'Present: s and h together say /ʃ/ — finger on your lips, shhh! Now it’s at the END of the word: fish, dish, brush. (Shell has it at the start.)',
    anchors: [
      { word: 'fish', emoji: '\u{1F41F}', img: SEA.fish },
      { word: 'dish', emoji: '\u{1F963}', img: DISH },
      { word: 'brush', emoji: '\u{1FAA5}', img: BRUSH },
    ],
  },
  {
    id: 'oc3-bubbles', kind: 'letter-bubbles', bg: reefPage(7), who: 'coral', title: 'Letter Bubbles: sh at the end',
    teacher: 'Spelling game: look at the picture, pop the bubbles in order — the word ends with s-h. Say the word at the end.',
    words: [
      { word: 'fish', img: SEA.fish, say: 'Fish! The shark eats fish.' },
      { word: 'dish', img: DISH, say: 'Dish! Biscuit’s dish.' },
      { word: 'brush', img: BRUSH, say: 'Brush! A brush.' },
      { word: 'splash', img: SPLASH, say: 'Splash! A big splash!' },
    ],
    doneLine: 'Pop, pop! You can spell sh words!',
  },
  {
    id: 'oc3-blend', kind: 'sound-blend', bg: reefPage(7),
    teacher: 'Reading: say each sound (f, i, sh — blend them), blend the word, find the picture — then read the sentence.',
    rounds: [
      { word: 'fish', sounds: ['f', 'i', 'sh'], img: SEA.fish, sentence: 'The fish is swimming.' },
      { word: 'dish', sounds: ['d', 'i', 'sh'], img: DISH, sentence: 'A fish in a dish!' },
      { word: 'brush', sounds: ['b', 'r', 'u', 'sh'], img: BRUSH, sentence: 'Mia has got a brush.' },
    ],
  },
  { id: 'oc3-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: reefPage(7), who: 'pip', focus: 'sh', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, faster — then splash speed!', line: 'Fish wish for a big splash.' },
  /* Free: Where does it live? + ask Coral */
  {
    id: 'oc3-guess', kind: 'join-stage', bg: bgReef, teacher: 'Free: the student thinks of a sea animal and says two facts (It lives… It eats…). The teacher (Pip) guesses. Then swap: Pip says the facts, the student guesses.', cast: ['pip'],
    turns: [
      { who: 'student', line: 'It lives … . It eats … .' },
      { who: 'pip', line: 'Is it a turtle?' },
      { who: 'student', line: 'Yes! / No, it’s a … !' },
      { who: 'pip', line: 'My turn! It lives on the beach. It walks sideways.' },
      { who: 'student', line: 'It’s a crab!' },
    ],
  },
  {
    id: 'oc3-ask-coral', kind: 'join-stage', bg: reefPage(2), teacher: 'Free: the student asks Coral where she lives and what she eats, then tells Pip about Coral.', cast: ['coral', 'pip'],
    turns: [
      { who: 'student', line: 'Coral, where do you live?' },
      { who: 'coral', line: 'I live in the sea, near the reef!' },
      { who: 'student', line: 'What do you eat?' },
      { who: 'coral', line: 'I eat sea grass and fish. Yum!' },
      { who: 'pip', line: 'Where does Coral live?' },
      { who: 'student', line: 'She lives in the sea!' },
    ],
  },
  { id: 'oc3-i-can', kind: 'meet', focus: ['live', 'eat'], bg: reefPage(7), who: 'coral', cardSide: 'right', teacher: 'Check: Coral says 5 facts — the student points to the right animal (4 of 5). Then the student says one fact alone — then the passport stamp!', line: 'You can understand where they live and what they eat!', repeat: 'It lives on the reef. It eats sea grass.' },
  {
    id: 'oc3-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Ocean sticker in their Sticker Book.',
    scene: {
      id: 'oc3-sticker', kind: 'sticker-reward', bg: reefPage(6), who: 'pip', teacher: 'Sticker time!',
      line: 'Super listening! Here is your sticker.',
      sticker: { img: ACT.turtleEating, label: 'Reef listener' },
    },
  },
  petPal('oc3-pet-pal', 2, 'I’m hungry! Where’s my dish?', [{ label: 'fish', img: SEA.fish }, { label: 'dish', img: DISH }, { label: 'brush', img: BRUSH }], 1, 'My dish! Yum!'),
  {
    id: 'oc3-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'oc3-home-mission', kind: 'home-mission', bg: reefPage(6), who: 'pip',
      line: 'Your home mission!', teacher: 'Home Mission: read the steps with the student.',
      parentNote: 'Today your child learned where sea animals live and what they eat: "The turtle lives on the reef. It eats sea grass." Sing "Down in the Sea" together and ask: "Where does a crab live? What does it eat?"',
      steps: [
        { emoji: '\u{1F3B5}', say: 'Sing Down in the Sea with your family.' },
        { emoji: '\u{1F422}', say: 'Tell them: The turtle lives on the reef.' },
        { emoji: '\u{1F41F}', say: 'Find 2 things that end in sh: fish, dish!' },
      ],
    },
  },
  {
    id: 'oc3-move-break-2', kind: 'prea1', teacher: 'Brain break: swim home!',
    scene: {
      id: 'oc3-move-break-2', kind: 'tpr-actions', mode: 'break', bg: reefPage(6), who: 'pip', teacher: 'Swim home!',
      rounds: [
        { line: 'Put on your mask! Dive down!', emoji: '\u{1F93F}' },
        { line: 'Splash, splash! Swim to the reef!', emoji: '\u{1F30A}' },
        { line: 'Swim back to your chair!', emoji: '\u{1F3CA}' },
      ],
    },
  },
  goodbyeSong('oc3-goodbye-song', reefPage(6)),
  { id: 'oc3-finale', kind: 'finale', bg: reefPage(7), who: 'pip', line: 'You know where the sea animals live and what they eat! See you at the reef! \u{1F422}' },
];

/* =============================================================================
 * A1 Unit 6 Lesson 4: "Ask and Answer: Is It a Shark?"
 * Objective: I can find a hidden animal by asking: "Is it a crab? Is it swimming?" "Yes, it is. / No, it isn't."
 * Evidence: the child finds Coral's secret animal with 3-4 questions (Reef Detective), then hides one and answers.
 * Story frame: a storm comes (story pages 8-9) — the friends must ask the sea animals where the chest is.
 * Practice ladder: Revise (Remember? Lesson 3 homes) → Present (I do: Is it a…? / Is it + -ing?, then the short answers)
 *   → we do (echo) → Read and Match → you do (Reef Detective ★: ask, pin the clues, find it; swap and answer) → Field
 *   Guide (Bub got it wrong — the child is the expert) → Go Fish (Have you got…?) → Reading (Reader p8-9, Read and Match,
 *   Treasure Islands) → Phonics review wh / oa / sh (Letter Blocks, Blend & Read, twister) → Free (ask Coral 3 questions;
 *   hide one for the teacher) → check.
 * Research (docs/research/playground-a1u6-research.md, Lesson 4).
 * ========================================================================= */

export const LESSON_A1U6L4_TITLE = 'Ask and Answer: Is It a Shark?';
export const LESSON_A1U6L4_OBJECTIVE = 'I can find a hidden animal by asking: "Is it a crab? Is it swimming?" "Yes, it is. / No, it isn\'t."';

const COAT = item('coat-blue');
const WHEEL = item('wheel');
const GOAT = item('goat');

export const LESSON_A1U6L4_SCENES: Scene[] = [
  { id: 'oc4-title', kind: 'title-card', bg: reefPage(9), level: 'A1', unit: 'Unit 6', lessonLabel: 'Lesson 4', title: 'Is It a Shark?', subtitle: 'Ask and answer: Yes, it is! No, it isn’t!', cta: '\u{1F50D} LET’S ASK!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 3 — where they live. Shadow mode (Lesson 3 used click): clearly different outlines.
    id: 'oc4-recall-warmup', kind: 'recall-warmup', bg: bgReef, who: 'pip', mode: 'shadow', listen: true,
    fromLabel: 'Lesson 3 · Where Do They Live?',
    teacher: 'Guided: Pip says where an animal lives — the student finds its shadow and says: It’s a … . It lives … .',
    items: [
      { word: 'crab', say: 'It lives on the beach.', img: SEA.crab },
      { word: 'turtle', say: 'It lives on the reef. It eats sea grass.', img: SEA.turtle },
      { word: 'shark', say: 'It lives in the sea. It eats fish.', img: SEA.shark },
      { word: 'seahorse', say: 'It lives on the reef.', img: SEA.seahorse },
    ],
  },
  helloSong('oc4-hello-song', reefPage(1)),
  { id: 'oc4-model-is-it', kind: 'meet', focus: ['crab'], bg: reefPage(5), who: 'coral', cardSide: 'right', teacher: 'Present (I do): cover the picture with your hand. Ask: Is it a crab? Lift your hand — Yes, it is! Voice goes UP for the question, DOWN for the answer.', line: 'Is it a crab? Yes, it is!', repeat: 'Is it a crab? Yes, it is.' },
  {
    id: 'oc4-short-answers', kind: 'prea1', teacher: 'Present (I do → you do): the question goes up, the answer comes down. Thumbs up for "Yes, it is", thumbs down for "No, it isn’t".',
    scene: {
      id: 'oc4-short-answers', kind: 'listen-repeat-cards', bg: bgReef, teacher: 'Is it…? Listen and say it!',
      cards: [
        { who: 'mia', sentence: 'Is it a shark? Yes, it is.', img: SEA.shark, imgLabel: 'yes' },
        { who: 'mia', sentence: 'Is it a turtle? No, it isn’t. It’s a whale.', img: SEA.whale, imgLabel: 'no' },
        { who: 'mia', sentence: 'Is it a starfish? Yes, it is.', img: SEA.starfish, imgLabel: 'yes' },
      ],
    },
  },
  { id: 'oc4-model-doing', kind: 'meet', focus: ['hiding'], bg: reefPage(4), who: 'bub', cardSide: 'right', teacher: 'Present (I do): now ask what it is DOING. Point to Bub behind the rock: Is he hiding? Yes! Is he sleeping? No!', line: 'Is it hiding? Yes, it is! I’m hiding!', repeat: 'Is it hiding? Yes, it is.' },
  {
    id: 'oc4-doing-cards', kind: 'prea1', teacher: 'Present (we do): Is it + -ing? Say each question together, then the answer — act it out.',
    scene: {
      id: 'oc4-doing-cards', kind: 'listen-repeat-cards', bg: bgRocks, teacher: 'What is it doing? Listen and say it!',
      cards: [
        { who: 'mia', sentence: 'Is it swimming? Yes, it is.', img: ACT.swimming, imgLabel: 'swimming' },
        { who: 'mia', sentence: 'Is it sleeping? No, it isn’t. It’s walking.', img: ACT.walking, imgLabel: 'walking' },
        { who: 'mia', sentence: 'Is it eating? Yes, it is.', img: ACT.turtleEating, imgLabel: 'eating' },
      ],
    },
  },
  { id: 'oc4-echo', kind: 'echo', bg: reefPage(4), who: 'pip', textSide: 'top', teacher: 'Guided (we do): ask like Pip — voice UP — then answer like Bub, voice DOWN.', word: 'Is it swimming? No, it isn’t!' },
  // Owner 2026-10-13/14: after the words, Read and Match. Design differs from L3 (frames) and U5L4 (chalk).
  {
    id: 'oc4-match', kind: 'picture-match', look: 'polaroids', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each question and answer and drags it under the picture that says YES. Then reads it aloud.',
    items: [
      { word: 'Is it hiding? Yes, it is.', img: ACT.hiding },
      { word: 'Is it sleeping? Yes, it is.', img: ACT.sleeping },
      { word: 'Is it diving? Yes, it is.', img: ACT.diving },
      { word: 'Is it walking? Yes, it is.', img: ACT.walking },
      { word: 'Is it eating? Yes, it is.', img: ACT.eating },
    ],
    bg: bgRocks,
  },
  {
    id: 'oc4-detective', kind: 'reef-detective', bg: bgRocks, who: 'coral', whoName: 'Coral', helper: 'bub', helperName: 'Bub', title: 'Reef Detective: which animal is it?',
    intro: 'I’m thinking of a sea animal. Ask me questions!',
    teacher: 'You do (the new game ★): the student taps a question and SAYS it — Coral answers. The clue is pinned and the animals that don’t fit are crossed out. Then the student names it. Part 2: the student hides one and answers Bub: Yes, it is / No, it isn’t. Evidence: 3-4 questions.',
    suspects: [
      { name: 'shark', img: ACT.swimming, doing: 'swimming', size: 'big' },
      { name: 'crab', img: ACT.walking, doing: 'walking', size: 'small' },
      { name: 'octopus', img: ACT.hiding, doing: 'hiding', size: 'small' },
      { name: 'whale', img: ACT.diving, doing: 'diving', size: 'big' },
      { name: 'starfish', img: ACT.sleeping, doing: 'sleeping', size: 'small' },
      { name: 'turtle', img: ACT.turtleEating, doing: 'eating', size: 'big' },
    ],
    secret: 5,
    hideAsks: ['size:big', 'doing:swimming', 'doing:hiding'],
    doneLine: 'Case closed! You are a super reef detective!',
  },
  {
    id: 'oc4-field-guide', kind: 'field-guide', bg: bgReef, who: 'bub', title: 'Bub’s Reef Guide — fix it!',
    teacher: 'You do (the child is the expert): Bub wrote the reef guide and got it wrong! For each line the student picks the right word (No! It isn’t sleeping — it’s swimming!), then reads the whole card aloud.',
    animals: [
      { name: 'shark', img: SEA.shark, lines: [
        { frame: 'The shark is ___.', options: ['sleeping', 'swimming'], answer: 'swimming', no: 'No! It isn’t sleeping!' },
        { frame: 'It lives in the ___.', options: ['sea', 'house'], answer: 'sea', no: 'No! Not in a house!' },
        { frame: 'It eats ___.', options: ['fish', 'cake'], answer: 'fish', no: 'No! It doesn’t eat cake!' },
      ] },
      { name: 'crab', img: SEA.crab, lines: [
        { frame: 'The crab is ___.', options: ['walking', 'flying'], answer: 'walking', no: 'No! It isn’t flying!' },
        { frame: 'It lives on the ___.', options: ['beach', 'moon'], answer: 'beach', no: 'No! Not on the moon!' },
        { frame: 'It is ___.', options: ['small', 'big'], answer: 'small', no: 'No! It isn’t big!' },
      ] },
      { name: 'turtle', img: SEA.turtle, lines: [
        { frame: 'The turtle is ___.', options: ['eating', 'hiding'], answer: 'eating', no: 'No! It isn’t hiding!' },
        { frame: 'It lives on the ___.', options: ['reef', 'beach'], answer: 'reef', no: 'No! Look at the picture!' },
        { frame: 'It eats sea ___.', options: ['grass', 'shells'], answer: 'grass', no: 'No! It eats sea grass!' },
      ] },
    ],
    doneLine: 'Thank you! Now my reef guide is right!',
  },
  {
    id: 'oc4-go-fish', kind: 'go-fish', bg: reefPage(1), who: 'coral', friendImg: CORAL, title: 'Go Fish with Coral!',
    teacher: 'Free: the student asks “Have you got a crab?” and Coral answers; then Coral asks and the student answers truthfully: Yes, I have. / No, I haven’t. Go fish!',
    cards: [
      { label: 'crab', img: SEA.crab }, { label: 'shark', img: SEA.shark }, { label: 'whale', img: SEA.whale },
      { label: 'turtle', img: SEA.turtle }, { label: 'starfish', img: SEA.starfish }, { label: 'octopus', img: BUB, article: 'an' },
      { label: 'seahorse', img: SEA.seahorse },
    ],
    childHand: ['crab', 'shark', 'whale', 'turtle'],
    friendHand: ['crab', 'starfish', 'octopus'],
    pond: ['starfish', 'shark', 'octopus', 'whale', 'seahorse', 'turtle', 'seahorse'],
    doneLine: 'No more cards! Super asking and answering!',
  },
  {
    id: 'oc4-race', kind: 'answer-race', look: 'raft', bg: reefPage(1), who: 'pip', racer: SEA.turtle, title: 'Raft Race: yes or no?',
    teacher: 'Guided: Pip asks about the picture — the student reads the answers and taps the right one (Yes, it is / No, it isn’t), then says it. Every right answer paddles the raft.',
    rounds: [
      { ask: 'Look at the crab. Is it walking?', choices: ['Yes, it is.', 'No, it isn’t.'], answer: 0 },
      { ask: 'Look at the starfish. Is it swimming?', choices: ['Yes, it is.', 'No, it isn’t.'], answer: 1 },
      { ask: 'Look at Bub. Is he hiding?', choices: ['No, he isn’t.', 'Yes, he is.'], answer: 1 },
      { ask: 'Look at the whale. Is it small?', choices: ['Yes, it is.', 'No, it isn’t.'], answer: 1 },
      { ask: 'Look at the turtle. Is it eating?', choices: ['Yes, it is.', 'No, it isn’t.'], answer: 0 },
    ],
    doneLine: 'You won the raft race! Great answers!',
  },
  {
    id: 'oc4-move-break', kind: 'prea1', teacher: 'Brain break: Pip asks — the student answers with the body: thumbs up (Yes, it is) or thumbs down (No, it isn’t).',
    scene: {
      id: 'oc4-move-break', kind: 'tpr-actions', mode: 'break', bg: reefPage(1), who: 'pip', teacher: 'Thumbs up or down!',
      rounds: [
        { line: 'Is the sea blue? Thumbs up! Yes, it is!', emoji: '\u{1F44D}' },
        { line: 'Is a whale small? Thumbs down! No, it isn’t!', emoji: '\u{1F44E}' },
        { line: 'Swim like a fish! Are you swimming? Yes, I am!', emoji: '\u{1F41F}' },
        { line: 'Freeze like a starfish! Shh…', emoji: '\u{2B50}' },
      ],
    },
  },
  /* Reading: The Treasure Reef, pages 1-9 */
  { id: 'oc4-storm', kind: 'meet', focus: ['chest'], bg: reefPage(8), who: 'mia', cardSide: 'left', teacher: 'Before reading: a storm! Ask the student: Is it sunny? (No, it isn’t — it’s windy!) Where is the chest? Let’s ask the animals!', line: 'Oh no, a storm! Where is the chest? Let’s ask!', repeat: 'Is it the chest?' },
  {
    id: 'oc4-reader', kind: 'reader', bg: reefPage(8), title: 'The Treasure Reef', doneLine: 'A storm! Where is the chest? See you next time!',
    teacher: 'Reading: pages 1-7 quickly, then the new pages 8-9. Listen while the words light up, then the student reads — Mia’s question goes UP.',
    pages: TREASURE_REEF.slice(0, 9),
  },
  {
    id: 'oc4-read-match', kind: 'picture-match', look: 'cards', prompt: 'Read and match',
    teacher: 'Reading: read each sentence from the story and drag it under its picture. Then read it aloud.',
    items: [
      { word: 'The waves are big.', img: reefPage(8) },
      { word: 'Is it the chest? No, it isn’t!', img: reefPage(9) },
      { word: 'The turtle eats sea grass.', img: reefPage(7) },
    ],
    bg: bgReef,
  },
  {
    id: 'oc4-treasure-islands', kind: 'grid-hunt', bg: reefPage(1), who: 'coral', title: 'Treasure Islands: find the chest!',
    teacher: 'Reading game: read the question and the answers, tap the right one — that earns a dive. The student says a square (B three!) and taps it. Splash or treasure?',
    treasures: ['B3', 'D1', 'A4'],
    rounds: [
      { ask: 'Is it a crab?', choices: ['Yes, it is.', 'No, it isn’t.'], answer: 0, img: SEA.crab },
      { ask: 'Is it a shark?', choices: ['Yes, it is.', 'No, it isn’t.'], answer: 1, img: SEA.whale },
      { ask: 'Is it sleeping?', choices: ['Yes, it is.', 'No, it isn’t.'], answer: 0, img: ACT.sleeping },
      { ask: 'Is it swimming?', choices: ['Yes, it is.', 'No, it isn’t.'], answer: 1, img: ACT.walking },
      { ask: 'Is it a seahorse?', choices: ['Yes, it is.', 'No, it isn’t.'], answer: 0, img: SEA.seahorse },
      { ask: 'Is it hiding?', choices: ['Yes, it is.', 'No, it isn’t.'], answer: 0, img: ACT.hiding },
      { ask: 'Is it big?', choices: ['Yes, it is.', 'No, it isn’t.'], answer: 1, img: SEA.starfish },
      { ask: 'Is it eating?', choices: ['Yes, it is.', 'No, it isn’t.'], answer: 0, img: ACT.eating },
    ],
    doneLine: 'You found all the treasure!',
  },

  /* Phonics review: wh, oa, sh → Letter Blocks → Blend & Read → the unit twister */
  {
    id: 'oc4-blocks', kind: 'letter-blocks', bg: reefPage(1), mode: 'sounds', model: false,
    prompt: 'Build the word — sound by sound!',
    teacher: 'Reading (review of the unit sounds): listen, put the sound blocks in order — wh, oa and sh are ONE block each — blend and read the word.',
    rounds: [
      { blocks: ['wh', 'ee', 'l'], word: 'wheel', img: WHEEL },
      { blocks: ['b', 'oa', 't'], word: 'boat', img: BOAT },
      { blocks: ['f', 'i', 'sh'], word: 'fish', img: SEA.fish },
      { blocks: ['sh', 'e', 'll'], word: 'shell', img: SEA.shell },
    ],
  },
  {
    id: 'oc4-blend', kind: 'sound-blend', bg: reefPage(1),
    teacher: 'Reading: blend the word, find the picture — then read the question and answer it.',
    rounds: [
      { word: 'coat', sounds: ['c', 'oa', 't'], img: COAT, sentence: 'Is it a coat? Yes, it is.' },
      { word: 'goat', sounds: ['g', 'oa', 't'], img: GOAT, sentence: 'Is it a goat? Yes, it is.' },
      { word: 'dish', sounds: ['d', 'i', 'sh'], img: item('dish'), sentence: 'Is it a fish? No, it isn’t. It’s a dish!' },
    ],
  },
  { id: 'oc4-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: reefPage(1), who: 'pip', focus: 'wh', teacher: 'Reading: the unit twister! Listen to Pip, then say it slow, faster — then whale speed!', line: 'White whales wish for a boat.' },
  /* Free: ask Coral 3 questions; hide one for the teacher */
  {
    id: 'oc4-ask-coral', kind: 'join-stage', bg: reefPage(2), teacher: 'Free: Coral is holding a secret animal. The student asks 3 questions (size, doing, name) and finds it. Then the student tells Pip.', cast: ['coral', 'pip'],
    turns: [
      { who: 'coral', line: 'I’ve got a secret animal. Ask me!' },
      { who: 'student', line: 'Is it big?' },
      { who: 'coral', line: 'No, it isn’t. It’s small.' },
      { who: 'student', line: 'Is it walking?' },
      { who: 'coral', line: 'Yes, it is!' },
      { who: 'student', line: 'Is it a crab?' },
      { who: 'coral', line: 'Yes, it is! Well done!' },
    ],
  },
  {
    id: 'oc4-hide-one', kind: 'join-stage', bg: bgReef, teacher: 'Free (swap): the student thinks of a sea animal; the teacher (Pip) asks. The student answers in full short answers: Yes, it is. / No, it isn’t.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'Is it big?' },
      { who: 'student', line: 'Yes, it is. / No, it isn’t.' },
      { who: 'pip', line: 'Is it swimming?' },
      { who: 'student', line: 'Yes, it is. / No, it isn’t.' },
      { who: 'pip', line: 'Is it a whale?' },
      { who: 'student', line: 'Yes, it is! / No, it isn’t. It’s a … !' },
    ],
  },
  { id: 'oc4-i-can', kind: 'meet', focus: ['Is it'], bg: reefPage(9), who: 'coral', cardSide: 'right', teacher: 'Check: the student finds a hidden animal with 3-4 questions, then answers 3 questions about their own — then the passport stamp!', line: 'Is it a super detective? Yes, it is — it’s you!', repeat: 'Is it a crab? Yes, it is. No, it isn’t.' },
  {
    id: 'oc4-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Ocean sticker in their Sticker Book.',
    scene: {
      id: 'oc4-sticker', kind: 'sticker-reward', bg: reefPage(1), who: 'pip', teacher: 'Sticker time!',
      line: 'Super questions! Here is your sticker.',
      sticker: { img: SEA.seahorse, label: 'Reef detective' },
    },
  },
  petPal('oc4-pet-pal', 3, 'Brr, it’s windy! Is it my coat? Yes, it is! I want my coat!', [{ label: 'goat', img: GOAT }, { label: 'coat', img: COAT }, { label: 'boat', img: BOAT }], 1, 'My coat! Is it warm? Yes, it is!'),
  {
    id: 'oc4-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'oc4-home-mission', kind: 'home-mission', bg: reefPage(1), who: 'pip',
      line: 'Your home mission!', teacher: 'Home Mission: read the steps with the student.',
      parentNote: 'Today your child learned to ask yes/no questions: "Is it a crab? Is it swimming?" and to answer "Yes, it is. / No, it isn’t." Hide a toy in a bag and let your child ask questions to find it — then swap!',
      steps: [
        { emoji: '\u{1F45C}', say: 'Hide a toy in a bag.' },
        { emoji: '\u{2753}', say: 'Your family asks: Is it big? Is it a car?' },
        { emoji: '\u{1F44D}', say: 'Answer: Yes, it is! No, it isn’t!' },
      ],
    },
  },
  {
    id: 'oc4-move-break-2', kind: 'prea1', teacher: 'Brain break: the storm!',
    scene: {
      id: 'oc4-move-break-2', kind: 'tpr-actions', mode: 'break', bg: reefPage(8), who: 'pip', teacher: 'The storm!',
      rounds: [
        { line: 'Big waves! Go up and down!', emoji: '\u{1F30A}' },
        { line: 'It is windy! Wooosh!', emoji: '\u{1F32C}\u{FE0F}' },
        { line: 'The sun is back! Sit down and smile!', emoji: '\u{2600}\u{FE0F}' },
      ],
    },
  },
  goodbyeSong('oc4-goodbye-song', reefPage(1)),
  { id: 'oc4-finale', kind: 'finale', bg: reefPage(9), who: 'pip', line: 'You can ask and answer like a real reef detective! See you next time! \u{1F50D}' },
];
