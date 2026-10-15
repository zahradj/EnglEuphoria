/* =============================================================================
 * Monster Town — A1 Unit 5 (plan: docs/a1-unit-5-monster-town.md, owner-approved 2026-10-14: "go")
 *
 * Reuses Welcome Town's Scene type, CharKey/CAST/VOICE_KEY and SceneRenderer — Monster Town is a new WORLD, not a new
 * engine. Unit objective: say how someone feels and why ("She's scared because it's dark."), describe looks and family
 * ("She's got three eyes. She's got a little sister."), say what someone is wearing, and read "Bibi's Bad Day" (one
 * story for the unit, a few pages each lesson).
 * Every lesson: sound → a phonics game (different each lesson) → Blend & Read → tongue twister; no game twice in the unit.
 * Phonics: ee, ea, the ee / ea sort, y at the end — from the recorded ee clip (phonics zip), no new recording.
 * Research (mechanics only, sources in the plan §2): onestopenglish feelings game cards (mime + "Why? — Because…"),
 * ESL Kids Stuff emotion Pictionary, Khan Academy Kids and Lingokids feelings games, Twee / Twinkl / eslactive monster
 * have-got games, ee / ea word sorts (Boom, Teach Starter, 123 Homeschool 4 Me). New game: Monster Mood Machine ★
 * (`mood-machine`).
 * Art: Canva (holder design "EnglEuphoria Monster Town art"), ~35 % purple with teal, cream and wood; Bibi is a girl.
 * ========================================================================= */

import { CAST, VOICE_KEY, type CharKey, type ReaderPage, type Scene } from '../welcome-town/scenes';

export type { CharKey, Scene };
export { CAST, VOICE_KEY };

const S = '/lep1/scenes';
const bgStreet = `${S}/bg-a1u5-street-wide.png`;
const bgClass = `${S}/bg-a1u5-classroom-wide.png`;
const bgLab = `${S}/bg-a1u5-lab-wide.png`;
const WT = '/welcome-town';
const wtSpr = (who: string) => `${WT}/sprites/${who}-wave.png`;
const feelSpr = (name: string) => `${WT}/sprites/${name}-v2.png`;
const item = (n: string) => `/lep1/items/item-${n}.png`;
const SONG_HELLO = `${WT}/audio/hello-song.mp3?v=1`;
const SONG_GOODBYE = `${WT}/audio/goodbye-song.mp3?v=3`;

/** Bibi's Bad Day — Canva story pictures (scripts/canva-art-request.json); pages 4-12 come with Lessons 2-5. */
export const bibiPage = (n: number) => `${S}/bg-a1u5-story-${n}-wide.png`;
/** Story GIFs (owner-approved scenario docs/scenarios/a1u5-bibis-bad-day-gifs.md, 2026-10-14 "go"): two Canva frames of
 *  the same picture as an animated WebP. Only the Reader uses them; picture tasks keep the stills. */
const bibiGif = (n: number) => `/lep1/gifs/a1u5-story-${n}.webp`;

/** Bibi the Tiny Monster (a girl) — one cut-out sticker per feeling. */
export const BIBI = {
  happy: item('bibi-happy'), sad: item('bibi-sad'), tired: item('bibi-tired'), angry: item('bibi-angry'),
  scared: item('bibi-scared'), bored: item('bibi-bored'), surprised: item('bibi-surprised'), excited: item('bibi-excited'),
};
const GLOB = item('glob');
/** Mood Machine reason scenes (owner 2026-10-14: "generate a full scene plate for that") — Canva, no characters in them. */
const whyPlate = (n: string) => `${S}/bg-a1u5-why-${n}-wide.png`;
const BISCUIT = item('dog');

/** The unit's reading strand (plan §4). */
export const BIBI_BAD_DAY: ReaderPage[] = [
  { img: bibiGif(1), lines: [{ text: 'This is Monster Town. Look! A tiny monster.' }], check: { who: 'pip', question: 'Where are they?', answer: 'Monster Town', options: [{ label: 'Monster Town' }, { label: 'The jungle' }, { label: 'Space' }] } },
  { img: bibiGif(2), lines: [{ text: 'This is Bibi. Bibi is tired because it is early.' }], check: { who: 'pip', question: 'How is Bibi?', answer: 'Tired', options: [{ label: 'Excited', img: BIBI.excited }, { label: 'Tired', img: BIBI.tired }, { label: 'Angry', img: BIBI.angry }] } },
  { img: bibiGif(3), lines: [{ text: 'It is dark. Bibi is scared!' }], check: { who: 'mia', question: 'Why is Bibi scared?', answer: 'It is dark.', options: [{ label: 'It is a party.' }, { label: 'It is dark.' }, { label: 'It is hot.' }] } },
  { img: bibiPage(4), lines: [{ text: 'The lesson is long. Bibi is bored.' }], check: { who: 'pip', question: 'How is Bibi?', answer: 'Bored', options: [{ label: 'Bored', img: BIBI.bored }, { label: 'Excited', img: BIBI.excited }, { label: 'Scared', img: BIBI.scared }] } },
  { img: bibiPage(5), lines: [{ text: 'Big Bob has got three eyes. He is very tall.' }], check: { who: 'leo', question: 'How many eyes has Big Bob got?', answer: 'Three', options: [{ label: 'One' }, { label: 'Two' }, { label: 'Three' }] } },
  { img: bibiPage(6), lines: [{ text: 'Bibi has got a little sister. Her name is Bea.' }], check: { who: 'mia', question: 'Who is Bea?', answer: 'Bibi’s sister', options: [{ label: 'Bibi’s mom' }, { label: 'Bibi’s sister' }, { label: 'Bibi’s teacher' }] } },
  { img: bibiPage(7), lines: [{ text: 'Bibi is sad because she is tiny.' }], check: { who: 'pip', question: 'Why is Bibi sad?', answer: 'She is tiny.', options: [{ label: 'She is tiny.' }, { label: 'It is dark.' }, { label: 'It is a party.' }] } },
];

const helloSong = (id: string, bg: string): Scene => ({
  id, kind: 'song', bg, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Sing hello to Bibi — wave!',
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

/** Biscuit's shelf: Units 1-4, then one more Monster Town treat each lesson. */
const PET_EARLIER = [
  { label: 'star', img: item('star-gold') }, { label: 'apple', img: item('apple') }, { label: 'cake', img: item('cake') },
  { label: 'ball', img: item('ball-red') }, { label: 'hat', img: item('hat') }, { label: 'present', img: item('gift') },
  { label: 'medal', img: item('hero-medal') }, { label: 'banana', img: item('banana') }, { label: 'rainbow medal', img: item('medal-rainbow') },
  { label: 'rocket', img: item('rocket') }, { label: 'moon', img: item('moon') }, { label: 'kite', img: item('kite') },
  { label: 'scarf', img: item('scarf') }, { label: 'robot', img: item('beep') }, { label: 'sunglasses', img: item('sunglasses') },
  { label: 'gold star', img: item('star-gold') },
  { label: 'sandwich', img: item('sandwich') }, { label: 'cookie', img: item('cookie') }, { label: 'cheese', img: item('cheese') },
  { label: 'pizza', img: item('pizza-slice') }, { label: 'soup', img: item('soup') }, { label: 'cake', img: item('cake') },
];
const PET_MONSTER: { label: string; img: string }[] = [];
const petPal = (id: string, n: number, line: string, choices: { label: string; img: string }[], answer: number, say: string): Scene => ({
  id, kind: 'pet-pal', bg: bgStreet, who: 'leo', title: 'Pet Pal: Biscuit in Monster Town',
  teacher: 'Routine (1 minute): Biscuit the puppy says what he wants. The student listens, taps it and says it. It goes on his shelf and he grows — the shelf keeps everything from earlier lessons.',
  pet: { name: 'Biscuit', img: BISCUIT },
  earlier: [...PET_EARLIER, ...PET_MONSTER.slice(0, n)],
  rounds: [{ line, choices, answer, say }],
  doneLine: 'Biscuit is so happy! See you next time!',
});

/* =============================================================================
 * A1 Unit 5 Lesson 1: "How Do You Feel? Scared, Bored, Excited!"
 * Objective: I can say how someone feels and why: "She's scared because it's dark."
 * Story frame: arriving in Monster Town at sunrise and meeting Bibi the Tiny Monster (new world: purple houses, Professor
 *   Glob's potion lab — dawn light, ~35 % purple with teal and cream).
 * Practice ladder: Revise fast (Remember? Unit 4 foods, Feelings Flash for the five old feelings) → Present (I do: the
 *   four new feelings on Bibi, then because in two halves on the story pictures) → we do (echo) → Read and Match →
 *   you do (Mood Machine ★: reason → feeling → the whole sentence; Which Monster?; Memory) → Reading (Reader p1-3, Read
 *   and Match, Yes or No?, Why? sort) → Phonics ee → Free (How do you feel today? Why?) → check.
 * ========================================================================= */

export const LESSON_A1U5L1_TITLE = 'How Do You Feel? Scared, Bored, Excited!';
export const LESSON_A1U5L1_OBJECTIVE = 'I can say how someone feels and why: "She\'s scared because it\'s dark."';

const NEW_FEELINGS = [
  { feeling: 'scared', img: BIBI.scared }, { feeling: 'bored', img: BIBI.bored },
  { feeling: 'excited', img: BIBI.excited }, { feeling: 'surprised', img: BIBI.surprised },
];

export const LESSON_A1U5L1_SCENES: Scene[] = [
  { id: 'mt-title', kind: 'title-card', bg: bibiPage(1), level: 'A1', unit: 'Unit 5', lessonLabel: 'Lesson 1', title: 'How Do You Feel?', subtitle: 'Scared, bored, excited… and why?', cta: '\u{1F47E} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): Unit 4 — the festival foods. Shadow mode: the food stickers have clearly different outlines.
    id: 'mt-recall-warmup', kind: 'recall-warmup', bg: bgStreet, who: 'pip', mode: 'shadow', listen: true,
    fromLabel: 'Unit 4 · Food Festival',
    teacher: 'Guided: listen — which shadow is it? Tap it, then say one more sentence about it.',
    items: [
      { word: 'pizza', say: 'Pico likes pizza!', img: item('pizza-slice') },
      { word: 'grapes', say: 'Would you like some grapes?', img: item('grapes') },
      { word: 'cheese', say: 'Here is the cheese.', img: item('cheese') },
      { word: 'sandwich', say: 'I have a sandwich for lunch.', img: item('sandwich') },
    ],
  },
  {
    id: 'mt-feelings-flash', kind: 'feelings-runner', bg: bgStreet, who: 'pip', title: 'Feelings Flash!',
    teacher: 'Revise (fast): the five feelings from Unit 1. Pip says a sentence — tap the friend it is about and say it too. Quick, quick!',
    runner: wtSpr('pip'), team: [feelSpr('mia-sad'), feelSpr('leo-tired'), feelSpr('bella-angry'), feelSpr('willow-hungry'), feelSpr('pip-happy')],
    rounds: [
      { ask: 'She is sad!', choices: [{ img: feelSpr('pip-happy'), sentence: 'He is happy.' }, { img: feelSpr('mia-sad'), sentence: 'She is sad.' }, { img: feelSpr('leo-tired'), sentence: 'He is tired.' }], answer: 1 },
      { ask: 'He is tired!', choices: [{ img: feelSpr('leo-tired'), sentence: 'He is tired.' }, { img: feelSpr('bella-angry'), sentence: 'She is angry.' }, { img: feelSpr('willow-hungry'), sentence: 'She is hungry.' }], answer: 0 },
      { ask: 'She is angry!', choices: [{ img: feelSpr('mia-sad'), sentence: 'She is sad.' }, { img: feelSpr('pip-happy'), sentence: 'He is happy.' }, { img: feelSpr('bella-angry'), sentence: 'She is angry.' }], answer: 2 },
      { ask: 'She is hungry!', choices: [{ img: feelSpr('willow-hungry'), sentence: 'She is hungry.' }, { img: feelSpr('leo-tired'), sentence: 'He is tired.' }, { img: feelSpr('mia-sad'), sentence: 'She is sad.' }], answer: 0 },
      { ask: 'He is happy!', choices: [{ img: feelSpr('bella-angry'), sentence: 'She is angry.' }, { img: feelSpr('pip-happy'), sentence: 'He is happy.' }, { img: feelSpr('willow-hungry'), sentence: 'She is hungry.' }], answer: 1 },
    ],
    doneLine: 'Five feelings — super fast! Now let’s meet a monster!',
  },
  { id: 'mt-meet-bibi', kind: 'meet', focus: ['monster'], bg: bibiPage(1), who: 'bibi', cardSide: 'right', teacher: 'Present: the friends arrive in Monster Town. Point to the tiny monster in the middle. Say: This is Bibi!', line: 'Hello! I’m Bibi. I’m a tiny monster!', repeat: 'This is Bibi.' },
  {
    id: 'mt-feelings-new', kind: 'prea1', teacher: 'Present (I do → you do): four new feelings, one at a time on Bibi. Make the face, say it — the student copies the face and says it.',
    scene: {
      id: 'mt-feelings-new', kind: 'listen-repeat-cards', bg: bgClass, teacher: 'Listen, make the face and say it!',
      cards: [
        { who: 'mia', sentence: 'She’s scared.', img: BIBI.scared, imgLabel: 'scared' },
        { who: 'mia', sentence: 'She’s bored.', img: BIBI.bored, imgLabel: 'bored' },
        { who: 'mia', sentence: 'She’s excited!', img: BIBI.excited, imgLabel: 'excited' },
        { who: 'mia', sentence: 'She’s surprised!', img: BIBI.surprised, imgLabel: 'surprised' },
      ],
    },
  },
  { id: 'mt-because-dark', kind: 'meet', focus: ['dark', 'scared'], bg: bibiPage(3), who: 'bibi', cardSide: 'right', teacher: 'Present (I do): the dark hall. First half: "She’s scared." Then point to the dark: "because it’s dark." Say the two halves, then the whole sentence. The student repeats.', line: 'It’s dark! I’m scared!', repeat: 'She’s scared because it’s dark.' },
  { id: 'mt-because-early', kind: 'meet', focus: ['early', 'tired'], bg: bibiPage(2), who: 'bibi', cardSide: 'left', teacher: 'Present (we do): Bibi in bed, the clock says it is early. Say it together: She’s tired … because it’s early.', line: 'Yawn! It’s early. I’m tired!', repeat: 'She’s tired because it’s early.' },
  { id: 'mt-echo', kind: 'echo', bg: bibiPage(3), who: 'pip', textSide: 'top', teacher: 'Guided (we do): say it like Pip — a scared whisper, then loud!', word: 'She’s scared because it’s dark.' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'mt-feel-match', kind: 'picture-match', look: 'chalk', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under Bibi’s face (or taps the sentence, then the face), then reads it aloud.',
    items: [
      { word: 'She’s scared.', img: BIBI.scared },
      { word: 'She’s bored.', img: BIBI.bored },
      { word: 'She’s excited.', img: BIBI.excited },
      { word: 'She’s surprised.', img: BIBI.surprised },
      { word: 'She’s tired.', img: BIBI.tired },
      { word: 'She’s sad.', img: BIBI.sad },
    ],
    bg: bgClass,
  },
  {
    id: 'mt-mood-machine', kind: 'mood-machine', bg: bgLab, who: 'glob', title: 'Monster Mood Machine',
    teacher: 'You do (the new game ★): the student pulls the lever, looks at the picture that comes out (the reason), picks how Bibi feels — and SAYS the whole sentence: "Bibi is scared because it’s dark." Then 🎤.',
    monster: { name: 'Bibi', img: BIBI.happy }, host: { name: 'Professor Glob', img: GLOB },
    feelings: [...NEW_FEELINGS, { feeling: 'sad', img: BIBI.sad }, { feeling: 'tired', img: BIBI.tired }, { feeling: 'happy', img: BIBI.happy }],
    rounds: [
      { reason: 'it’s dark', img: whyPlate('dark'), feeling: 0, choices: [0, 6, 1] },
      { reason: 'the lesson is long', img: whyPlate('lesson'), feeling: 1, choices: [2, 1, 3] },
      { reason: 'it’s her party', img: whyPlate('party'), feeling: 2, choices: [4, 5, 2] },
      { reason: 'there’s a big present', img: whyPlate('present'), feeling: 3, choices: [3, 0, 1] },
      { reason: 'it’s raining', img: whyPlate('rain'), feeling: 4, choices: [6, 4, 2] },
      { reason: 'there’s thunder', img: whyPlate('thunder'), feeling: 0, choices: [0, 2, 5] },
    ],
    doneLine: 'Six potions! You can say how Bibi feels — and why!',
  },
  helloSong('mt-hello-song', bibiPage(1)),
  {
    id: 'mt-which-monster', kind: 'listen-tap', bg: bgClass,
    teacher: 'You do (listening): Which monster? Listen to the sentence and tap Bibi’s face that matches. Then say it.',
    targets: [
      { label: 'scared', left: '20%', top: '52%', color: '#8B5CF6', img: BIBI.scared },
      { label: 'bored', left: '40%', top: '52%', color: '#14B8A6', img: BIBI.bored },
      { label: 'excited', left: '60%', top: '52%', color: '#F59E0B', img: BIBI.excited },
      { label: 'surprised', left: '80%', top: '52%', color: '#EC4899', img: BIBI.surprised },
    ],
    rounds: [
      { prompt: 'Who is bored? The lesson is long.', answerLabel: 'bored', who: 'pip' },
      { prompt: 'Who is excited? It’s a party!', answerLabel: 'excited', who: 'mia' },
      { prompt: 'Who is scared? It’s dark!', answerLabel: 'scared', who: 'leo' },
      { prompt: 'Who is surprised? Look — a big present!', answerLabel: 'surprised', who: 'pip' },
    ],
  },
  {
    id: 'mt-memory', kind: 'memory', bg: bgClass, teacher: 'Guided: find each face and its word — say "She’s …" with every pair.',
    pairs: [
      { id: 'scared', label: 'scared', emoji: '\u{1F628}', img: BIBI.scared },
      { id: 'bored', label: 'bored', emoji: '\u{1F971}', img: BIBI.bored },
      { id: 'excited', label: 'excited', emoji: '\u{1F929}', img: BIBI.excited },
      { id: 'surprised', label: 'surprised', emoji: '\u{1F62E}', img: BIBI.surprised },
      { id: 'tired', label: 'tired', emoji: '\u{1F634}', img: BIBI.tired },
    ],
  },
  {
    id: 'mt-move-break', kind: 'prea1', teacher: 'Brain break: monster faces with Pip — make the face and say it.',
    scene: {
      id: 'mt-move-break', kind: 'tpr-actions', mode: 'break', bg: bgStreet, who: 'pip', teacher: 'Make a monster face!',
      rounds: [
        { line: 'Make a scared face! Eek!', emoji: '\u{1F628}' },
        { line: 'Make a bored face! Yawn…', emoji: '\u{1F971}' },
        { line: 'Jump! You are excited!', emoji: '\u{1F929}' },
        { line: 'Open your mouth! You are surprised!', emoji: '\u{1F62E}' },
      ],
    },
  },
  /* Reading: Bibi's Bad Day, pages 1-3 */
  {
    id: 'mt-reader', kind: 'reader', bg: bibiPage(1), title: 'Bibi’s Bad Day', doneLine: 'Poor Bibi is scared! What happens next? Find out next time!',
    teacher: 'Reading: listen while the words light up, then the student reads each page. Tap any word to hear it.',
    pages: BIBI_BAD_DAY.slice(0, 3),
  },
  {
    id: 'mt-read-match', kind: 'picture-match', look: 'cards', prompt: 'Read and match',
    teacher: 'Reading: read each sentence from the story and drag it under its picture. Then read it aloud.',
    items: [
      { word: 'This is Monster Town.', img: bibiPage(1) },
      { word: 'Bibi is tired.', img: bibiPage(2) },
      { word: 'It is dark. Bibi is scared!', img: bibiPage(3) },
    ],
    bg: bgStreet,
  },
  {
    id: 'mt-yes-no', kind: 'true-false', bg: bgClass, img: bibiPage(3), read: true,
    teacher: 'Reading: look at the picture, READ each sentence — yes or no? (🔊 only if the student needs help.)',
    rounds: [
      { who: 'pip', statement: 'It is dark.', isTrue: true },
      { who: 'pip', statement: 'Bibi is happy.', isTrue: false },
      { who: 'mia', statement: 'Bibi is scared.', isTrue: true },
      { who: 'mia', statement: 'Bibi is in bed.', isTrue: false },
      { who: 'leo', statement: 'It is a party.', isTrue: false },
    ],
  },
  {
    id: 'mt-why-sort', kind: 'sort-basket', look: 'potions', bg: bgLab, title: 'Why? Read and sort',
    teacher: 'Reading: read each card aloud — how does Bibi feel? Put it in the right basket and say the whole sentence: She’s scared because it is dark.',
    baskets: [{ label: 'scared', img: BIBI.scared }, { label: 'bored', img: BIBI.bored }, { label: 'excited', img: BIBI.excited }],
    items: [
      { word: 'It is dark.', img: item('moon'), basket: 0 },
      { word: 'The lesson is long.', img: item('clock'), basket: 1 },
      { word: 'It is a party!', img: item('cake'), basket: 2 },
      { word: 'A big bat!', img: item('bat'), basket: 0 },
      { word: 'The book is long.', img: item('book'), basket: 1 },
      { word: 'A balloon for me!', img: item('balloon-red'), basket: 2 },
    ],
  },
  /* Phonics: ee → Sound Sort → Blend & Read → tongue twister */
  {
    id: 'mt-sound-ee', kind: 'sound-model', bg: bgClass, who: 'pip', letter: 'EE', phoneme: '/iː/', sound: 'ee', soundSide: 'center',
    teacher: 'Present: two e’s together say a long /ee/ — like a smile! Bee, tree, sheep. Smile and say: eeee!',
    anchors: [
      { word: 'bee', emoji: '\u{1F41D}', img: item('bee') },
      { word: 'tree', emoji: '\u{1F333}', img: item('tree') },
      { word: 'sheep', emoji: '\u{1F411}', img: item('sheep') },
    ],
  },
  {
    id: 'mt-sound-sort', kind: 'prea1', teacher: 'Guided: Sound Sort! Listen to each word — the long /ee/ (bee) or the short /e/ (egg)? Drag it to its basket and say it.',
    scene: {
      id: 'mt-sound-sort', kind: 'sound-sort', bg: bgClass, teacher: 'Listen! Long ee or short e?',
      targets: [{ letter: 'ee', phoneme: '/iː/', who: 'pip' }, { letter: 'e', phoneme: '/e/', who: 'leo' }],
      items: [
        { word: 'bee', img: item('bee'), emoji: '\u{1F41D}', letter: 'ee' },
        { word: 'egg', img: item('egg'), emoji: '\u{1F95A}', letter: 'e' },
        { word: 'tree', img: item('tree'), emoji: '\u{1F333}', letter: 'ee' },
        { word: 'bed', img: item('bed'), emoji: '\u{1F6CF}', letter: 'e' },
        { word: 'sheep', img: item('sheep'), emoji: '\u{1F411}', letter: 'ee' },
        { word: 'hen', img: item('hen'), emoji: '\u{1F414}', letter: 'e' },
      ],
    },
  },
  {
    id: 'mt-blend', kind: 'sound-blend', bg: bgClass,
    teacher: 'Reading: say each sound (b, ee — blend them), blend the word, find the picture — then read the sentence.',
    rounds: [
      { word: 'bee', sounds: ['b', 'ee'], img: item('bee'), sentence: 'A bee is on a tree.' },
      { word: 'tree', sounds: ['t', 'r', 'ee'], img: item('tree'), sentence: 'The tree is green.' },
      { word: 'sheep', sounds: ['sh', 'ee', 'p'], img: item('sheep'), sentence: 'The sheep is bored.' },
    ],
  },
  { id: 'mt-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgStreet, who: 'pip', focus: 'ee', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, faster — then monster speed!', line: 'Three green bees see sheep.' },
  /* Free: how do you feel? why? */
  {
    id: 'mt-free-talk', kind: 'join-stage', bg: bgStreet, teacher: 'Free: Pip asks how the student feels today and why — they answer with I’m … because … . Then they ask Pip.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'How do you feel today?' },
      { who: 'student', line: 'I’m … .' },
      { who: 'pip', line: 'Why?' },
      { who: 'student', line: 'Because … . How do you feel, Pip?' },
      { who: 'pip', line: 'I’m excited because I’m in Monster Town!' },
    ],
  },
  {
    id: 'mt-face-guess', kind: 'join-stage', bg: bgClass, teacher: 'Free: the student makes a monster face (scared, bored, excited or surprised) — Pip guesses and asks why. Then swap: Pip makes a face.', cast: ['pip'],
    turns: [
      { who: 'student', line: '(make a face)' },
      { who: 'pip', line: 'Are you scared?' },
      { who: 'student', line: 'Yes! / No, I’m … . Because … .' },
      { who: 'pip', line: 'Now me! Look at my face!' },
      { who: 'student', line: 'You’re surprised!' },
    ],
  },
  { id: 'mt-i-can', kind: 'meet', focus: ['feel'], bg: bibiPage(1), who: 'bibi', cardSide: 'right', teacher: 'Check: the student says 3 feeling sentences about Bibi, 2 with because — then the passport stamp!', line: 'You can say how I feel — and why!', repeat: 'She’s scared because it’s dark.' },
  {
    id: 'mt-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Monster Town sticker in their Sticker Book.',
    scene: {
      id: 'mt-sticker', kind: 'sticker-reward', bg: bgStreet, who: 'pip', teacher: 'Sticker time!',
      line: 'Super feelings! Here is your sticker.',
      sticker: { img: BIBI.excited, label: 'Feelings expert' },
    },
  },
  petPal('mt-pet-pal', 0, 'I’m excited because it’s a party! I want a balloon!', [{ label: 'cake', img: item('cake') }, { label: 'rocket', img: item('rocket') }, { label: 'balloon', img: item('balloon-red') }], 2, 'A balloon! I’m excited!'),
  {
    id: 'mt-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'mt-home-mission', kind: 'home-mission', bg: bgStreet, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned four new feelings (scared, bored, excited, surprised) and how to say why: "She\'s scared because it\'s dark." This week, ask: "How do you feel? Why?" and help with "because…".',
      steps: [
        { emoji: '\u{1F628}', say: 'Make a scared face. Say why.' },
        { emoji: '\u{1F929}', say: 'What makes you excited?' },
        { emoji: '\u{1F46A}', say: 'Ask your family: How do you feel? Why?' },
      ],
    },
  },
  {
    id: 'mt-move-break-2', kind: 'prea1', teacher: 'Brain break: tiny monster, big monster!',
    scene: {
      id: 'mt-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgStreet, who: 'pip', teacher: 'Monster moves!',
      rounds: [
        { line: 'Be a tiny monster! Crouch down!', emoji: '\u{1F47E}' },
        { line: 'Be a big monster! Stand up tall! Roar!', emoji: '\u{1F995}' },
        { line: 'Tiptoe in the dark… shh!', emoji: '\u{1F319}' },
      ],
    },
  },
  goodbyeSong('mt-goodbye-song', bgStreet),
  { id: 'mt-finale', kind: 'finale', bg: bibiPage(1), who: 'pip', line: 'You can say how Bibi feels — and why! See you in Monster Town! \u{1F47E}' },
];

/** Professor Glob's sticker — the lab owner; he speaks in later lessons. */
export const PROFESSOR_GLOB = GLOB;

/* =============================================================================
 * A1 Unit 5 Lesson 2: "What Do They Look Like? Tall, Short, Big, Small"
 * Objective: I can describe looks and family: "She's got long horns. She's got a little sister."
 * Story frame: a visit to Bibi's home (new setting: the family living room, then the family photo on the tree) and
 *   Big Bob at the Academy — warm afternoon light.
 * Practice ladder: Revise (Remember? L1 feelings) → Present (I do: He's got / She's got on Big Bob and the parts; tall /
 *   short; a little sister) → we do (echo) → Read and Match → you do (Monster Builder ★: build what you hear; Line Up:
 *   tall → short; Family Tree: Bibi's family) → Reading (Reader p1-5, Read & Drag, Balloon Match, Yes or No?, Answer
 *   Race) → Phonics ea (Word Build, Blend & Read on the slide, twister) → Free (describe a monster / your family) → check.
 * ========================================================================= */

export const LESSON_A1U5L2_TITLE = 'What Do They Look Like? Tall, Short, Big, Small';
export const LESSON_A1U5L2_OBJECTIVE = 'I can describe looks and family: "She\'s got long horns. She\'s got a little sister."';

const bgHome = `${S}/bg-a1u5-home-wide.png`;
const bgFamily = `${S}/bg-a1u5-family-photo-wide.png`;
const bgTree = '/lep1/scenes/bg-u5l4-tree-wide.png';
const BOB = item('big-bob');
const BEA = item('bea');
const PART = {
  body: item('mb-body'), eye: item('mb-eye'),
  hornsShort: item('mb-horns-short'), hornsLong: item('mb-horns-long'),
  teeth: item('mb-mouth-teeth'), smile: item('mb-mouth-smile'),
};
/** Faces cut from the family photo (round crops: centre %, width % of the picture). */
const FAMILY_FACES = [
  { label: 'dad', name: 'Dad', img: bgFamily, at: [17, 36] as [number, number], w: 19, aspect: 1376 / 768 },
  { label: 'mom', name: 'Mom', img: bgFamily, at: [44.5, 44] as [number, number], w: 18, aspect: 1376 / 768 },
  { label: 'Bibi', name: 'Bibi', img: bgFamily, at: [67, 58] as [number, number], w: 15, aspect: 1376 / 768 },
  { label: 'Bea', name: 'Bea', img: bgFamily, at: [87, 66] as [number, number], w: 11, aspect: 1376 / 768 },
];

export const LESSON_A1U5L2_SCENES: Scene[] = [
  { id: 'mt2-title', kind: 'title-card', bg: bgHome, level: 'A1', unit: 'Unit 5', lessonLabel: 'Lesson 2', title: 'What Do They Look Like?', subtitle: 'Three eyes, long horns, big teeth!', cta: '\u{1F47E} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 1 — the four new feelings. Click mode (L1 used shadow).
    id: 'mt2-recall-warmup', kind: 'recall-warmup', bg: bgHome, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Lesson 1 · How Do You Feel?',
    teacher: 'Guided: listen — which face is it? Click it, then say why: She’s scared because…',
    items: [
      { word: 'scared', say: 'She’s scared because it’s dark.', img: BIBI.scared },
      { word: 'bored', say: 'She’s bored because the lesson is long.', img: BIBI.bored },
      { word: 'excited', say: 'She’s excited because it’s a party!', img: BIBI.excited },
      { word: 'surprised', say: 'She’s surprised! A big present!', img: BIBI.surprised },
    ],
  },
  { id: 'mt2-meet-bob', kind: 'meet', focus: ['three', 'eyes'], bg: bibiPage(5), who: 'bibi', cardSide: 'left', teacher: 'Present (I do): meet Big Bob. Point to his eyes and count: one, two, three! Say: He’s got three eyes.', line: 'This is Big Bob. He’s got three eyes!', repeat: 'He’s got three eyes.' },
  {
    id: 'mt2-looks-1', kind: 'prea1', teacher: 'Present (I do → you do): one part at a time. Point to it, say the sentence — the student says it too. He’s got = he has got.',
    scene: {
      id: 'mt2-looks-1', kind: 'listen-repeat-cards', bg: bgHome, teacher: 'Listen and say it!',
      cards: [
        { who: 'mia', sentence: 'He’s got three eyes.', img: BOB, imgLabel: 'three eyes' },
        { who: 'mia', sentence: 'She’s got long horns.', img: PART.hornsLong, imgLabel: 'long horns' },
        { who: 'mia', sentence: 'He’s got short horns.', img: PART.hornsShort, imgLabel: 'short horns' },
        { who: 'mia', sentence: 'She’s got big teeth.', img: PART.teeth, imgLabel: 'big teeth' },
      ],
    },
  },
  {
    id: 'mt2-looks-2', kind: 'prea1', teacher: 'Present: tall and short — stretch up for tall, crouch for short. Then family: Bibi has got a little sister!',
    scene: {
      id: 'mt2-looks-2', kind: 'listen-repeat-cards', bg: bgHome, teacher: 'Listen and say it!',
      cards: [
        { who: 'leo', sentence: 'Big Bob is tall.', img: BOB, imgLabel: 'tall' },
        { who: 'leo', sentence: 'Bibi is short.', img: BIBI.happy, imgLabel: 'short' },
        { who: 'leo', sentence: 'She’s got a little sister.', img: BEA, imgLabel: 'a little sister' },
      ],
    },
  },
  { id: 'mt2-meet-bea', kind: 'meet', focus: ['sister'], bg: bgFamily, who: 'bibi', cardSide: 'left', teacher: 'Present (we do): Bibi shows her family photo. Point to Bea, the tiny one. Say it together: Bibi has got a little sister.', line: 'This is my family. I’ve got a little sister. Her name is Bea!', repeat: 'She’s got a little sister.' },
  { id: 'mt2-echo', kind: 'echo', bg: bgHome, who: 'pip', textSide: 'top', teacher: 'Guided (we do): say it like a big monster — deep and slow — then like a tiny monster!', word: 'She’s got three eyes and long horns.' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'mt2-looks-match', kind: 'picture-match', look: 'frames', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each card and drags it under its picture (or taps the card, then the picture), then reads it aloud.',
    items: [
      { word: 'three eyes', img: BOB },
      { word: 'long horns', img: PART.hornsLong },
      { word: 'short horns', img: PART.hornsShort },
      { word: 'big teeth', img: PART.teeth },
      { word: 'a little sister', img: BEA },
      { word: 'one big eye', img: PART.eye },
    ],
    bg: bgHome,
  },
  {
    id: 'mt2-builder', kind: 'monster-builder', bg: bgHome, who: 'glob', title: 'Monster Builder',
    teacher: 'You do (the new game ★): listen to the description and build the monster — eyes, horns, mouth. Check! Then the student says the whole sentence.',
    body: PART.body, eye: PART.eye,
    horns: [{ label: 'short horns', img: PART.hornsShort }, { label: 'long horns', img: PART.hornsLong }],
    mouths: [{ label: 'big teeth', img: PART.teeth }, { label: 'a big smile', img: PART.smile }],
    rounds: [
      { line: 'She’s got two eyes, short horns and big teeth.', eyes: 2, horns: 0, mouth: 0, name: 'Tilly' },
      { line: 'He’s got three eyes, long horns and a big smile.', eyes: 3, horns: 1, mouth: 1, name: 'Zog' },
      { line: 'She’s got one eye, long horns and big teeth.', eyes: 1, horns: 1, mouth: 0, name: 'Mo' },
      { line: 'He’s got two eyes, short horns and a big smile.', eyes: 2, horns: 0, mouth: 1, name: 'Fizz' },
    ],
    doneLine: 'Four new monsters! You can build what you hear!',
  },
  helloSong('mt2-hello-song', bgHome),
  {
    id: 'mt2-line-up', kind: 'prea1', teacher: 'You do: Line Up! Put the monsters in a line from the tallest to the shortest. Say: Big Bob is tall! Bea is short!',
    scene: {
      id: 'mt2-line-up', kind: 'size-line', bg: bibiPage(5), who: 'pip',
      teacher: 'Line up the monsters: tallest first!',
      members: [
        { label: 'Big Bob', img: BOB, height: 100, reply: 'Big Bob! He is very tall!' },
        { label: 'Professor Glob', img: GLOB, height: 74, reply: 'Professor Glob!' },
        { label: 'Bibi', img: BIBI.happy, height: 54, reply: 'Bibi! She is short.' },
        { label: 'Bea', img: BEA, height: 38, reply: 'Bea! She is very short!' },
      ],
      floorOrder: [2, 0, 3, 1],
      firstLine: 'Who is the tallest?', wrongLine: 'Not yet! Who is taller?',
      lastLine: 'Who is the shortest?',
      doneLine: 'Tall, tall, short, short! Great line!',
    },
  },
  {
    id: 'mt2-family-tree', kind: 'prea1', teacher: 'You do: Bibi’s Family Tree. Hang each photo on the right branch — Mom and Dad in the middle, the children at the bottom. Then say: She’s got a dad / a mom / a little sister.',
    scene: {
      id: 'mt2-family-tree', kind: 'family-tree', bg: bgTree, who: 'pip',
      teacher: 'Hang Bibi’s family on the tree!',
      intro: 'Mom and Dad go in the middle. The children go at the bottom!',
      faces: FAMILY_FACES,
      slots: [{ row: 1, x: 22, y: 55 }, { row: 1, x: 78, y: 55 }, { row: 2, x: 30, y: 79 }, { row: 2, x: 70, y: 79 }],
      rounds: [
        { face: 0, row: 1, line: 'Bibi has got a dad. Where does Dad go?', reply: 'Yes! He’s got long horns!', say: 'She’s got a dad.' },
        { face: 1, row: 1, line: 'Bibi has got a mom. Where does Mom go?', reply: 'Yes! She’s got long hair!', say: 'She’s got a mom.' },
        { face: 3, row: 2, line: 'Bibi has got a little sister. Where does Bea go?', reply: 'Yes! Bea is very short!', say: 'She’s got a little sister.' },
        { face: 2, row: 2, line: 'And this is Bibi! Where does she go?', reply: 'Yes! Bibi goes with her sister!', say: 'This is Bibi.' },
      ],
      doneLine: 'This is Bibi’s family!',
    },
  },
  {
    id: 'mt2-move-break', kind: 'prea1', teacher: 'Brain break: monster bodies!',
    scene: {
      id: 'mt2-move-break', kind: 'tpr-actions', mode: 'break', bg: bgHome, who: 'pip', teacher: 'Move like a monster!',
      rounds: [
        { line: 'Be tall! Stand on your toes!', emoji: '\u{1F4CF}' },
        { line: 'Be short! Crouch down!', emoji: '\u{1F47E}' },
        { line: 'Show me long horns! Hands up high!', emoji: '\u{1F918}' },
        { line: 'Show me big teeth! Grr!', emoji: '\u{1F62C}' },
      ],
    },
  },
  /* Reading: Bibi's Bad Day, pages 1-5 */
  {
    id: 'mt2-reader', kind: 'reader', bg: bibiPage(4), title: 'Bibi’s Bad Day', doneLine: 'Big Bob is very tall… and Bibi is tiny. What happens next? Find out next time!',
    teacher: 'Reading: a quick re-read of pages 1-3, then the new pages 4-5 (listen first). Tap any word to hear it.',
    pages: BIBI_BAD_DAY.slice(0, 5),
  },
  {
    id: 'mt2-read-drag', kind: 'drag-match', bg: bibiPage(5), teacher: 'Reading: read each sentence and drag it onto the monster it is about. Then read it aloud.',
    items: [
      { label: 'He is very tall.', color: '#F97316', targetLeft: '58%', targetTop: '40%' },
      { label: 'She is tiny.', color: '#8B5CF6', targetLeft: '33%', targetTop: '66%' },
      { label: 'He has got three eyes.', color: '#14B8A6', targetLeft: '58%', targetTop: '22%' },
    ],
  },
  {
    id: 'mt2-balloon-match', kind: 'balloon-match', bg: bgHome, who: 'bibi', title: 'Balloon Match: who is it?',
    teacher: 'Reading game: the student reads a balloon (tap it to hear it), then taps the picture it describes. The balloon floats down and pops!',
    pairs: [
      { text: 'He’s got three eyes.', img: BOB, label: 'Big Bob' },
      { text: 'She’s got a yellow bow.', img: BEA, label: 'Bea' },
      { text: 'He’s got one big eye.', img: GLOB, label: 'Professor Glob' },
      { text: 'She’s got a pink bow.', img: BIBI.happy, label: 'Bibi' },
    ],
    doneLine: 'Pop, pop! You can read about monsters!',
  },
  {
    id: 'mt2-build-sentence', kind: 'sentence-build', bg: bgHome, side: 'right',
    teacher: 'Reading: put the words in order (leave out the trap word), then read the sentence about the picture.',
    rounds: [
      { words: ['He’s', 'got', 'three', 'eyes.'], img: BOB, extra: ['two'] },
      { words: ['She’s', 'got', 'a', 'little', 'sister.'], img: BEA, extra: ['brother'] },
      { words: ['Big', 'Bob', 'is', 'very', 'tall.'], img: BOB, extra: ['short'] },
      { words: ['She’s', 'got', 'long', 'horns.'], img: PART.hornsLong, extra: ['short'] },
    ],
  },
  {
    id: 'mt2-race', kind: 'answer-race', look: 'race', bg: bgHome, who: 'pip', racer: BIBI.excited,
    title: 'Monster Race! Read and answer!',
    teacher: 'Reading: read each question (🔊 if needed), tap the right answer — Bibi races one step closer to the finish.',
    rounds: [
      { ask: 'Who has got three eyes?', choices: ['Bea', 'Big Bob', 'Bibi'], answer: 1, read: true },
      { ask: 'Who is very short?', choices: ['Bea', 'Big Bob', 'Dad'], answer: 0, read: true },
      { ask: 'Has Bibi got a little sister?', choices: ['No, she hasn’t.', 'Yes, she has.', 'Yes, I do.'], answer: 1, read: true },
      { ask: 'Who has got long hair?', choices: ['Dad', 'Big Bob', 'Mom'], answer: 2, read: true },
    ],
    doneLine: 'Bibi wins the race!',
  },
  /* Phonics: ea → Word Build → Blend & Read → tongue twister */
  {
    id: 'mt2-sound-ea', kind: 'sound-model', bg: bgHome, who: 'pip', letter: 'EA', phoneme: '/iː/', sound: 'ea', soundSide: 'center',
    teacher: 'Present: e and a together say the same long /ee/ as in bee! Tea, sea, peas. Smile and say: eeee!',
    anchors: [
      { word: 'tea', emoji: '\u{1F375}', img: item('tea') },
      { word: 'sea', emoji: '\u{1F30A}', img: item('sea') },
      { word: 'peas', emoji: '\u{1FADB}', img: item('peas') },
    ],
  },
  {
    id: 'mt2-word-build', kind: 'word-build', bg: bgHome,
    teacher: 'Reading: which letters are missing — ea, oa or ai? Pick them, then read the word.',
    rounds: [
      { word: 'tea', tiles: ['t', 'ea'], blankIndex: 1, answer: 'ea', choices: ['oa', 'ea', 'ai'], img: item('tea'), emoji: '\u{1F375}' },
      { word: 'seal', tiles: ['s', 'ea', 'l'], blankIndex: 1, answer: 'ea', choices: ['ea', 'ai', 'oa'], img: item('seal'), emoji: '\u{1F9AD}' },
      { word: 'leaf', tiles: ['l', 'ea', 'f'], blankIndex: 1, answer: 'ea', choices: ['ai', 'oa', 'ea'], img: item('leaf'), emoji: '\u{1F343}' },
      { word: 'peas', tiles: ['p', 'ea', 's'], blankIndex: 1, answer: 'ea', choices: ['ea', 'oa', 'ai'], img: item('peas'), emoji: '\u{1FADB}' },
    ],
  },
  {
    id: 'mt2-blend', kind: 'sound-blend', bg: bgHome, look: 'slide',
    teacher: 'Reading: say each sound (t, ea — blend them), slide down, find the picture — then read the sentence.',
    rounds: [
      { word: 'tea', sounds: ['t', 'ea'], img: item('tea'), sentence: 'Mom has got a cup of tea.' },
      { word: 'sea', sounds: ['s', 'ea'], img: item('sea'), sentence: 'The sea is blue.' },
      { word: 'seal', sounds: ['s', 'ea', 'l'], img: item('seal'), sentence: 'The seal has got big eyes.' },
    ],
  },
  { id: 'mt2-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgHome, who: 'pip', focus: 'ea', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, faster — then monster speed!', line: 'Sea monsters eat peas at the beach.' },
  /* Free: describe a monster / your family */
  {
    id: 'mt2-free-monster', kind: 'join-stage', bg: bgHome, teacher: 'Free: the student invents a monster and describes it — Pip draws it in the air. Then Pip describes one and the student draws it.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'Tell me about your monster!' },
      { who: 'student', line: 'It’s got … eyes. It’s got … horns.' },
      { who: 'pip', line: 'Wow! Is it tall or short?' },
      { who: 'student', line: 'It’s … . Now you, Pip!' },
      { who: 'pip', line: 'My monster has got one eye and big teeth!' },
    ],
  },
  {
    id: 'mt2-free-family', kind: 'join-stage', bg: bgFamily, teacher: 'Free: Bibi asks about the student’s family — they answer with I’ve got … . Then they ask Bibi.', cast: ['bibi'],
    turns: [
      { who: 'bibi', line: 'I’ve got a little sister. Have you got a brother or a sister?' },
      { who: 'student', line: 'I’ve got … . / No, I haven’t.' },
      { who: 'bibi', line: 'Is your mom tall or short?' },
      { who: 'student', line: 'She’s … . Has your dad got long horns, Bibi?' },
      { who: 'bibi', line: 'Yes, he has! Very long horns!' },
    ],
  },
  { id: 'mt2-i-can', kind: 'meet', focus: ['horns', 'sister'], bg: bgFamily, who: 'bibi', cardSide: 'left', teacher: 'Check: the student builds 3 monsters from listening (done!) and describes one in 2 sentences — then the passport stamp!', line: 'You can say what we look like! My dad has got long horns. I’ve got a little sister.', repeat: 'She’s got long horns.' },
  {
    id: 'mt2-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Monster Town sticker in their Sticker Book.',
    scene: {
      id: 'mt2-sticker', kind: 'sticker-reward', bg: bgHome, who: 'pip', teacher: 'Sticker time!',
      line: 'Super monster builder! Here is your sticker.',
      sticker: { img: BOB, label: 'Monster builder' },
    },
  },
  petPal('mt2-pet-pal', 0, 'I want a cup of tea, please! With peas!', [{ label: 'peas', img: item('peas') }, { label: 'seal', img: item('seal') }, { label: 'rocket', img: item('rocket') }], 0, 'Peas! Yummy green peas!'),
  {
    id: 'mt2-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'mt2-home-mission', kind: 'home-mission', bg: bgHome, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned to describe looks and family: "He\'s got three eyes. She\'s got long horns. She\'s got a little sister." This week, draw a monster together and take turns describing it.',
      steps: [
        { emoji: '\u{1F58D}\u{FE0F}', say: 'Draw a monster. Say: It’s got … .' },
        { emoji: '\u{1F4CF}', say: 'Who is tall in your family? Who is short?' },
        { emoji: '\u{1F46A}', say: 'Say: I’ve got a brother / a sister.' },
      ],
    },
  },
  {
    id: 'mt2-move-break-2', kind: 'prea1', teacher: 'Brain break: monster parade!',
    scene: {
      id: 'mt2-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgHome, who: 'pip', teacher: 'Monster parade!',
      rounds: [
        { line: 'Walk like Big Bob! Big, tall steps!', emoji: '\u{1F463}' },
        { line: 'Walk like Bea! Tiny, tiny steps!', emoji: '\u{1F43E}' },
        { line: 'Wave three hands… oh, you’ve got two!', emoji: '\u{1F44B}' },
      ],
    },
  },
  goodbyeSong('mt2-goodbye-song', bgHome),
  { id: 'mt2-finale', kind: 'finale', bg: bgFamily, who: 'pip', line: 'You can describe monsters and families! See you in Monster Town! \u{1F47E}' },
];

/* =============================================================================
 * A1 Unit 5 Lesson 3: "Listen to the Feelings Song"
 * Objective: I can understand feelings and descriptions in a song and in short dialogues.
 * Evidence: Name That Feeling — 4 of 5 buzzed right from listening.
 * Story frame: the Monster Music Show — Professor Glob hosts a game show in the Academy music hall (new setting: stage
 *   lights, purple velvet, star ceiling — evening show light). Research: docs/research/playground-a1u5-research.md.
 * Practice ladder: Remember? (L2 looks, shadow) → revise the feelings fast (cards) → Present (I do: "Why are you sad?" —
 *   "Because I'm tiny." on story page 7; we do: echo) → Read and Match (reasons) → you do: Name That Feeling (game-show
 *   buzzer, listening) → the song "How Do You Feel?" → Whisper Tube (one wrong word) → Echo Hall (find the voice) →
 *   Reading (Reader p1-7, Read & Check, Story Order) → Phonics ee / ea (Catch & Sort by spelling, Blend & Read gumball,
 *   twister) → Free (sing your own verse; Why are you …? role-play) → check.
 * ========================================================================= */
export const LESSON_A1U5L3_TITLE = 'Listen to the Feelings Song';
export const LESSON_A1U5L3_OBJECTIVE = 'I can understand feelings and descriptions in a song and in short dialogues.';

const bgHall = `${S}/bg-a1u5-stage-wide.png`;
const bgShow = `${S}/bg-a1u5-show-wide.png`;
const SONG_A1U5L3 = '/lep1/audio/how-do-you-feel-song-a1u5l3.mp3?v=1';
const SONG_A1U5L3_LYRICS: { who: CharKey; text: string }[] = [
  { who: 'glob', text: 'How do you feel? How do you feel?' },
  { who: 'glob', text: 'Make a face and spin like a wheel!' },
  { who: 'bibi', text: 'Bibi is scared, so scared, oh no!' },
  { who: 'bibi', text: 'Why is she scared? Do you know?' },
  { who: 'bibi', text: 'Because it’s dark, it’s dark, you see!' },
  { who: 'bibi', text: 'Make a scared face just like me!' },
  { who: 'bibi', text: 'Bibi is bored, so bored, oh no!' },
  { who: 'bibi', text: 'Why is she bored? Do you know?' },
  { who: 'bibi', text: 'Because the lesson’s long, you see!' },
  { who: 'bibi', text: 'Make a bored face just like me!' },
  { who: 'bibi', text: 'Bibi’s excited, hooray, hooray!' },
  { who: 'bibi', text: 'Why’s she excited? Can you say?' },
  { who: 'bibi', text: 'Because it’s a party, you see!' },
  { who: 'bibi', text: 'Make an excited face like me!' },
  { who: 'glob', text: 'How do you feel? How do you feel?' },
  { who: 'glob', text: 'Make a face and spin like a wheel!' },
];
/** Take 2 (docs/songs/a1u5l3-monster-how-do-you-feel-scores.txt, score 0.94, every line sung; Whisper hears "Bibi" as
 *  "baby"): line starts 8.0 / 10.8 / 17.0 / 19.4 / 21.4 / 23.8 / 33.9 / 36.2 / 38.6 / 40.4 / 51.2 / 53.4 / 56.0 / 57.6 /
 *  63.9 / 66.3 s (word timings), end 72.9 s. The verses are sung on the beat with an instrumental bar after each. */
const SONG_A1U5L3_MS = [10800, 6200, 2400, 2000, 2400, 10100, 2300, 2400, 1800, 10800, 2200, 2600, 1600, 6300, 2400, 6600];

export const LESSON_A1U5L3_SCENES: Scene[] = [
  { id: 'mt3-title', kind: 'title-card', bg: bgHall, level: 'A1', unit: 'Unit 5', lessonLabel: 'Lesson 3', title: 'The Monster Music Show', subtitle: 'Listen to the Feelings Song!', cta: '\u{1F3B5} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 2 — looks. Shadow mode: the monster and part stickers have clearly different outlines.
    id: 'mt3-recall-warmup', kind: 'recall-warmup', bg: bgHall, who: 'pip', mode: 'shadow', listen: true,
    fromLabel: 'Lesson 2 · What Do They Look Like?',
    teacher: 'Guided: listen — which shadow is it? Tap it, then say one more sentence about it.',
    items: [
      { word: 'Big Bob', say: 'Big Bob is very tall!', img: BOB },
      { word: 'Bea', say: 'Bea is Bibi’s little sister.', img: BEA },
      { word: 'horns', say: 'She’s got long horns.', img: PART.hornsLong },
      { word: 'teeth', say: 'He’s got big teeth!', img: PART.teeth },
    ],
  },
  { id: 'mt3-meet-show', kind: 'meet', focus: ['listen'], bg: bgHall, who: 'glob', cardSide: 'right', teacher: 'Present: Professor Glob opens the Monster Music Show. Today we LISTEN: songs, game shows, whispers. Cup your ear and say it together.', line: 'Welcome to the Monster Music Show! Today we listen, sing and play!', repeat: 'How do you feel?' },
  {
    id: 'mt3-feelings', kind: 'prea1', teacher: 'Revise (fast): six feelings on Bibi. Make the face, say it — the student copies the face and says it. Quick!',
    scene: {
      id: 'mt3-feelings', kind: 'listen-repeat-cards', bg: bgHall, teacher: 'Listen, make the face and say it!',
      cards: [
        { who: 'mia', sentence: 'She’s scared.', img: BIBI.scared, imgLabel: 'scared' },
        { who: 'mia', sentence: 'She’s bored.', img: BIBI.bored, imgLabel: 'bored' },
        { who: 'mia', sentence: 'She’s excited!', img: BIBI.excited, imgLabel: 'excited' },
        { who: 'mia', sentence: 'She’s surprised!', img: BIBI.surprised, imgLabel: 'surprised' },
        { who: 'mia', sentence: 'She’s sad.', img: BIBI.sad, imgLabel: 'sad' },
        { who: 'mia', sentence: 'She’s happy!', img: BIBI.happy, imgLabel: 'happy' },
      ],
    },
  },
  { id: 'mt3-why-ask', kind: 'meet', focus: ['why', 'sad'], bg: bibiPage(7), who: 'mia', cardSide: 'left', teacher: 'Present (I do): the question. Point to Bibi alone at lunch and ask with a kind face: Why are you sad? The voice goes UP on "why". The student repeats.', line: 'Bibi, why are you sad?', repeat: 'Why are you sad?' },
  { id: 'mt3-why-answer', kind: 'meet', focus: ['because', 'tiny'], bg: bibiPage(7), who: 'bibi', cardSide: 'left', teacher: 'Present (I do → we do): the answer starts with "because". Bibi says it about herself (I’m tiny); we say it about her (she’s tiny). Say both together.', line: 'Because I’m tiny. The big monsters are so tall!', repeat: 'She’s sad because she’s tiny.' },
  { id: 'mt3-echo', kind: 'echo', bg: bibiPage(7), who: 'mia', textSide: 'top', teacher: 'Guided (we do): ask it like Mia — kind and soft, then answer like Bibi — sad and tiny!', word: 'Why are you sad? Because I’m tiny.' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1) — here the reasons ("because …") with their scene plates.
  {
    id: 'mt3-why-match', kind: 'picture-match', look: 'polaroids', prompt: 'Read and match: why?',
    teacher: 'Read and match: the student reads each reason and drags it under its picture (or taps the reason, then the picture), then says the whole sentence: She’s scared because it’s dark.',
    items: [
      { word: 'It’s dark.', img: whyPlate('dark') },
      { word: 'The lesson is long.', img: whyPlate('lesson') },
      { word: 'It’s a party!', img: whyPlate('party') },
      { word: 'It’s a big present!', img: whyPlate('present') },
      { word: 'It’s raining.', img: whyPlate('rain') },
    ],
    bg: bgHall,
  },
  /* You do: the signature game — a TV game show you win by listening */
  {
    id: 'mt3-name-that-feeling', kind: 'prea1', teacher: 'Signature game (evidence: 4 of 5): Name That Feeling! Pip plays what Bibi says — the student listens (twice if needed), presses the buzzer under the right face and says the whole sentence with because.',
    scene: {
      id: 'mt3-name-that-feeling', kind: 'buzzer-show', bg: bgShow, who: 'pip',
      teacher: 'Listen to Bibi. How does she feel? Buzz, then say it!',
      intro: 'Name That Feeling! Listen to Bibi and press the buzzer!',
      podiums: [{ x: 17.2, y: 65.7, by: 45.3 }, { x: 49.8, y: 65.7, by: 45.3 }, { x: 82.8, y: 65.7, by: 45.3 }],
      faces: [
        { label: 'scared', name: 'scared', img: BIBI.scared },
        { label: 'bored', name: 'bored', img: BIBI.bored },
        { label: 'excited', name: 'excited', img: BIBI.excited },
        { label: 'surprised', name: 'surprised', img: BIBI.surprised },
        { label: 'sad', name: 'sad', img: BIBI.sad },
      ],
      rounds: [
        { faces: [1, 0, 2], answer: 1, line: 'It’s dark! Oh no! How does Bibi feel?', reply: 'Yes! She’s scared!', say: 'She’s scared because it’s dark.' },
        { faces: [0, 1, 4], answer: 1, line: 'The lesson is long… so long. How does Bibi feel?', reply: 'Yes! She’s bored!', say: 'She’s bored because the lesson is long.' },
        { faces: [3, 4, 2], answer: 2, line: 'A party for me! Hooray! How does Bibi feel?', reply: 'Yes! She’s excited!', say: 'She’s excited because it’s a party.' },
        { faces: [3, 1, 0], answer: 0, line: 'Wow! A big present! How does Bibi feel?', reply: 'Yes! She’s surprised!', say: 'She’s surprised because it’s a big present.' },
        { faces: [2, 3, 4], answer: 2, line: 'I’m tiny. I’m all alone. How does Bibi feel?', reply: 'Yes! She’s sad.', say: 'She’s sad because she’s tiny.' },
      ],
      doneLine: 'You named every feeling! Feelings champion!',
    },
  },
  /* The lesson's song: after the words and a first game (CLAUDE.md "Lesson song placement") */
  {
    id: 'mt3-song', kind: 'song', bg: bgHall, title: '\u{1F3B5} How Do You Feel? \u{1F3B5}', teacher: 'Guided: sing and do it — make the face in every verse (scared, bored, excited) and spin on "wheel". Sing it twice: the second time the student sings the "Why…?" lines alone.',
    durationSeconds: 73, bigWord: 'How do you feel?',
    songUrl: SONG_A1U5L3,
    lineDurationsMs: SONG_A1U5L3_MS,
    lyrics: SONG_A1U5L3_LYRICS,
  },
  {
    id: 'mt3-whisper', kind: 'whisper-tube', bg: bgHall, who: 'pip', title: 'Monster Whispers',
    teacher: 'Listening game: a friend whispers a sentence down the tube; the other friend gets ONE word wrong. The student taps the wrong word, picks the right one and says the whole sentence.',
    rounds: [
      { from: 'mia', to: 'leo', fromImg: wtSpr('mia'), toImg: wtSpr('leo'), said: 'Bibi is scared because it is dark.', heard: 'Bibi is bored because it is dark.', choices: ['happy'] },
      { from: 'leo', to: 'pip', fromImg: wtSpr('leo'), toImg: wtSpr('pip'), said: 'Bibi is excited because it is a party.', heard: 'Bibi is excited because it is a lesson.', choices: ['bed'] },
      { from: 'pip', to: 'mia', fromImg: wtSpr('pip'), toImg: wtSpr('mia'), said: 'Bibi has got a little sister.', heard: 'Bibi has got a little sweater.', choices: ['brother'] },
      { from: 'mia', to: 'pip', fromImg: wtSpr('mia'), toImg: wtSpr('pip'), said: 'Big Bob is very tall.', heard: 'Big Bob is very small.', choices: ['short'] },
    ],
    doneLine: 'Great listening! No more monster mix-ups!',
  },
  {
    id: 'mt3-echo-hall', kind: 'echo-cave', bg: whyPlate('dark'), who: 'pip', title: 'Echo Hall: who is calling?',
    teacher: 'Game: the lights are off in the long hall! A friend calls from the left, the middle or the right (speakers or headphones help). The student taps where the voice is, then asks: Why are you scared? — the friend answers with because.',
    rounds: [
      { voice: 'bibi', img: BIBI.scared, at: 2, line: 'I’m scared! It’s so dark! Find me!', reply: 'You found me! I’m scared because it’s dark.' },
      { voice: 'leo', img: feelSpr('leo-tired'), at: 0, line: 'I’m tired! It’s late! Find me!', reply: 'Here I am! I’m tired because it’s late.' },
      { voice: 'mia', img: feelSpr('mia-sad'), at: 1, line: 'I’m sad! I can’t find Bibi! Find me!', reply: 'You found me! I’m sad because I can’t find Bibi.' },
      { voice: 'pip', img: feelSpr('pip-happy'), at: 2, line: 'I’m happy! I love this game! Find me!', reply: 'Here I am! I’m happy because it’s fun!' },
    ],
    doneLine: 'You found everyone! Lights on!',
  },
  {
    id: 'mt3-reveal', kind: 'prea1', teacher: 'Game: Peek-a-Boo Plates! Tiles hide a place. Guess early: how would Bibi feel there? Tap her face, then say the sentence with because.',
    scene: {
      id: 'mt3-reveal', kind: 'tile-reveal', bg: bgHall, who: 'pip',
      teacher: 'What is the place? How does Bibi feel there?',
      rounds: [
        { img: whyPlate('thunder'), word: 'scared', line: 'Thunder! She’s scared because it’s a storm!', options: [{ label: 'excited', img: BIBI.excited }, { label: 'scared', img: BIBI.scared }, { label: 'bored', img: BIBI.bored }] },
        { img: whyPlate('party'), word: 'excited', line: 'A party! She’s excited because it’s a party!', options: [{ label: 'sad', img: BIBI.sad }, { label: 'tired', img: BIBI.tired }, { label: 'excited', img: BIBI.excited }] },
        { img: whyPlate('rain'), word: 'sad', line: 'Rain! She’s sad because it’s raining.', options: [{ label: 'sad', img: BIBI.sad }, { label: 'surprised', img: BIBI.surprised }, { label: 'happy', img: BIBI.happy }] },
      ],
    },
  },
  {
    id: 'mt3-move-break', kind: 'prea1', teacher: 'Brain break: freeze faces! Dance — then freeze with the face you hear.',
    scene: {
      id: 'mt3-move-break', kind: 'tpr-actions', mode: 'break', bg: bgHall, who: 'pip', teacher: 'Dance and freeze!',
      rounds: [
        { line: 'Dance, dance… freeze! Make a scared face!', emoji: '\u{1F631}' },
        { line: 'Dance, dance… freeze! Make a bored face!', emoji: '\u{1F971}' },
        { line: 'Dance, dance… freeze! Make an excited face!', emoji: '\u{1F929}' },
      ],
    },
  },
  /* Reading: Bibi's Bad Day, pages 1-7 */
  {
    id: 'mt3-reader', kind: 'reader', bg: bibiPage(6), title: 'Bibi’s Bad Day', doneLine: 'Poor Bibi is sad… What can her friends do? Find out next time!',
    teacher: 'Reading: a quick re-read of pages 1-5 (the student reads), then the new pages 6-7 (listen first). Tap any word to hear it.',
    pages: BIBI_BAD_DAY.slice(0, 7),
  },
  {
    id: 'mt3-read-check', kind: 'prea1', teacher: 'Reading: Read & Check (Cambridge "look and read") — read the sentence, look at the story picture: tick or cross? Correct every cross aloud.',
    scene: {
      id: 'mt3-read-check', kind: 'tick-cross', bg: bgHall, who: 'pip', teacher: 'Read and look. Yes or no?',
      rounds: [
        { img: bibiPage(6), sentence: 'Bibi has got a little sister.', isTrue: true },
        { img: bibiPage(6), sentence: 'Bea is very tall.', isTrue: false },
        { img: bibiPage(7), sentence: 'Bibi is sad.', isTrue: true },
        { img: bibiPage(7), sentence: 'Bibi is with her friends.', isTrue: false },
        { img: bibiPage(4), sentence: 'Bibi is bored because the lesson is long.', isTrue: true },
      ],
    },
  },
  {
    id: 'mt3-story-order', kind: 'prea1', teacher: 'Reading: Story Order — put Bibi’s day in order (pages 2, 3, 4, 6, 7), then retell it with a feeling for each picture.',
    scene: {
      id: 'mt3-story-order', kind: 'story-order', bg: bgHall, who: 'pip', teacher: 'Put the story in order!',
      frames: [
        { img: bibiPage(2), caption: 'Bibi is tired because it is early.' },
        { img: bibiPage(3), caption: 'It is dark. Bibi is scared!' },
        { img: bibiPage(4), caption: 'The lesson is long. Bibi is bored.' },
        { img: bibiPage(6), caption: 'Bibi has got a little sister.' },
        { img: bibiPage(7), caption: 'Bibi is sad because she is tiny.' },
      ],
    },
  },
  /* Phonics: ee and ea — same sound, two spellings → Catch & Sort → Blend & Read → tongue twister */
  {
    id: 'mt3-sound-ee-ea', kind: 'sound-model', bg: bgHall, who: 'pip', letter: 'EE · EA', phoneme: '/iː/', sound: 'ee', soundSide: 'center',
    teacher: 'Present: ee and ea say the SAME long /ee/ — like a smile! Green, sheep (ee) … tea, peas (ea). Listen: same sound. Look: two spellings.',
    anchors: [
      { word: 'sheep', emoji: '\u{1F411}', img: item('sheep') },
      { word: 'tea', emoji: '\u{1F375}', img: item('tea') },
      { word: 'cheese', emoji: '\u{1F9C0}', img: item('cheese') },
    ],
  },
  {
    id: 'mt3-catch-sort', kind: 'prea1', teacher: 'Guided: Catch & Sort! Every word has the long /ee/ sound — so LOOK at the word: ee or ea? Catch it in the right jar and read it aloud.',
    scene: {
      id: 'mt3-catch-sort', kind: 'catch-sort', bg: bgHall, goal: 8, seconds: 60,
      teacher: 'Same sound! Look: ee or ea? Catch it in the right jar and read it!',
      left: { label: 'ee', emoji: '\u{1F41D}' }, right: { label: 'ea', emoji: '\u{1F375}' },
      items: [
        { word: 'bee', img: item('bee'), emoji: '\u{1F41D}', target: 'left' },
        { word: 'tea', img: item('tea'), emoji: '\u{1F375}', target: 'right' },
        { word: 'tree', img: item('tree'), emoji: '\u{1F333}', target: 'left' },
        { word: 'sea', img: item('sea'), emoji: '\u{1F30A}', target: 'right' },
        { word: 'sheep', img: item('sheep'), emoji: '\u{1F411}', target: 'left' },
        { word: 'leaf', img: item('leaf'), emoji: '\u{1F343}', target: 'right' },
        { word: 'three', img: item('three'), emoji: '3\u{FE0F}\u{20E3}', target: 'left' },
        { word: 'peas', img: item('peas'), emoji: '\u{1FADB}', target: 'right' },
        { word: 'cheese', img: item('cheese'), emoji: '\u{1F9C0}', target: 'left' },
        { word: 'seal', img: item('seal'), emoji: '\u{1F9AD}', target: 'right' },
      ],
    },
  },
  {
    id: 'mt3-blend', kind: 'sound-blend', bg: bgHall, look: 'gumball',
    teacher: 'Reading: tap each gumball and say the sound, press Blend!, find the picture — then read the sentence.',
    rounds: [
      { word: 'leaf', sounds: ['l', 'ea', 'f'], img: item('leaf'), sentence: 'Bea has got a green leaf.' },
      { word: 'peas', sounds: ['p', 'ea', 'z'], img: item('peas'), sentence: 'Bibi is excited. Peas for lunch!' },
      { word: 'cheese', sounds: ['ch', 'ee', 'z'], img: item('cheese'), sentence: 'The cheese is for Big Bob.' },
    ],
  },
  { id: 'mt3-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bibiPage(6), who: 'pip', focus: 'ee', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, faster — then monster speed! Point: ea in Bea, eats, peas — ee in green.', line: 'Bea eats green peas.' },
  /* Free: sing your own verse; ask why */
  {
    id: 'mt3-free-verse', kind: 'join-stage', bg: bgHall, teacher: 'Free: the student makes their OWN verse of the song — a feeling and a reason — and sings or chants it to the tune. Then Bibi asks why.', cast: ['bibi'],
    turns: [
      { who: 'bibi', line: 'Make your own verse! How do you feel today?' },
      { who: 'student', line: 'I am … , so … , oh no! / hooray!' },
      { who: 'bibi', line: 'Why are you … ?' },
      { who: 'student', line: 'Because … !' },
      { who: 'bibi', line: 'Make a … face just like me!' },
    ],
  },
  {
    id: 'mt3-free-why', kind: 'join-stage', bg: bibiPage(7), teacher: 'Free: role-play the lunch hall. The student is Mia: they ask Bibi how she feels and why, then say one kind thing. Then swap.', cast: ['bibi', 'mia'],
    turns: [
      { who: 'mia', line: 'Hi, Bibi! How do you feel?' },
      { who: 'bibi', line: 'I’m sad.' },
      { who: 'student', line: 'Why are you sad?' },
      { who: 'bibi', line: 'Because I’m tiny.' },
      { who: 'student', line: 'You’re my friend! Sit with me!' },
    ],
  },
  { id: 'mt3-i-can', kind: 'meet', focus: ['listen', 'feel'], bg: bgHall, who: 'glob', cardSide: 'right', teacher: 'Check: Name That Feeling 4 of 5 (done!) — now the student listens to one more: "I’m bored. The lesson is long." and says how Bibi feels and why. Then the passport stamp!', line: 'You can listen and say how we feel — and why!', repeat: 'She’s bored because the lesson is long.' },
  {
    id: 'mt3-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Monster Town sticker in their Sticker Book.',
    scene: {
      id: 'mt3-sticker', kind: 'sticker-reward', bg: bgHall, who: 'pip', teacher: 'Sticker time!',
      line: 'Super listener! Here is your sticker.',
      sticker: { img: BIBI.excited, label: 'Super listener' },
    },
  },
  petPal('mt3-pet-pal', 0, 'I’m bored! I want a leaf to play with!', [{ label: 'tea', img: item('tea') }, { label: 'leaf', img: item('leaf') }, { label: 'sheep', img: item('sheep') }], 1, 'A leaf! Now I’m happy!'),
  {
    id: 'mt3-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'mt3-home-mission', kind: 'home-mission', bg: bgHall, who: 'pip',
      line: 'Your home mission!',
      teacher: 'Home Mission: read the steps with the student.',
      parentNote: 'Today your child listened to a feelings song and short dialogues: "Why are you sad? Because I\'m tiny." This week, sing "How Do You Feel?" together and take turns asking "Why?".',
      steps: [
        { emoji: '\u{1F3B5}', say: 'Sing "How Do You Feel?" with your family.' },
        { emoji: '\u{1F914}', say: 'Ask: How do you feel? Why?' },
        { emoji: '\u{1F3AD}', say: 'Make a face. Your family guesses the feeling!' },
      ],
    },
  },
  {
    id: 'mt3-move-break-2', kind: 'prea1', teacher: 'Brain break: the monster band!',
    scene: {
      id: 'mt3-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgHall, who: 'pip', teacher: 'Monster band!',
      rounds: [
        { line: 'Play the drum! Boom, boom, boom!', emoji: '\u{1F941}' },
        { line: 'Play the guitar! Strum, strum!', emoji: '\u{1F3B8}' },
        { line: 'Take a bow! Thank you, monsters!', emoji: '\u{1F647}' },
      ],
    },
  },
  goodbyeSong('mt3-goodbye-song', bgHall),
  { id: 'mt3-finale', kind: 'finale', bg: bgHall, who: 'pip', line: 'You can listen and say how monsters feel — and why! See you in Monster Town! \u{1F47E}' },
];
