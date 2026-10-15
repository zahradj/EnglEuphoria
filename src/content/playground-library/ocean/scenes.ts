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
 * Art: Canva, Playground game colours (gameSkin.ts); pictures ~35 % purple (purple coral, sea fans) with sea blues, teal,
 * sand and green. Coral the Mermaid is a girl; Bub the Octopus is a shy boy. Leo and Pip wear swim shorts, never a dress.
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
const PET_OCEAN: { label: string; img: string }[] = [{ label: 'shell', img: SEA.shell }, { label: 'boat', img: '/magic-castle/stickers/boat.png' }];
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
  { id: 'oc2-model-many', kind: 'meet', focus: ['swimming'], bg: bgDeep, who: 'coral', cardSide: 'right', teacher: 'Present (we do): one = is, many = are. Hold up one finger: The fish is swimming. All fingers: The fish are swimming!', line: 'One fish is swimming. Many fish are swimming!', repeat: 'The fish are swimming.' },
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
