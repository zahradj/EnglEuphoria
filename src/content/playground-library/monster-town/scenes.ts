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
  { img: bibiPage(8), lines: [{ text: 'Leo is wearing a green scarf. Mia is wearing glasses.' }], check: { who: 'pip', question: 'What is Leo wearing?', answer: 'A green scarf', options: [{ label: 'A green scarf' }, { label: 'Glasses' }, { label: 'Boots' }] } },
  { img: bibiPage(9), lines: [{ text: 'Mia: Why are you sad, Bibi?' }, { text: 'Bibi: I am sad because I am little.' }], check: { who: 'leo', question: 'Why is Bibi sad?', answer: 'She is little.', options: [{ label: 'She is little.' }, { label: 'It is dark.' }, { label: 'It is a party.' }] } },
  { img: bibiPage(10), lines: [{ text: 'Surprise! Bibi is surprised.' }], check: { who: 'mia', question: 'How is Bibi?', answer: 'Surprised', options: [{ label: 'Bored', img: BIBI.bored }, { label: 'Surprised', img: BIBI.surprised }, { label: 'Tired', img: BIBI.tired }] } },
  { img: bibiPage(11), lines: [{ text: 'Bibi is excited because it is a party for her!' }], check: { who: 'pip', question: 'Why is Bibi excited?', answer: 'It is a party for her.', options: [{ label: 'It is a party for her.' }, { label: 'It is dark.' }, { label: 'The lesson is long.' }] } },
  { img: bibiPage(12), lines: [{ text: 'Bibi is happy. It is a good day after all!' }], check: { who: 'leo', question: 'How is Bibi now?', answer: 'Happy', options: [{ label: 'Sad', img: BIBI.sad }, { label: 'Scared', img: BIBI.scared }, { label: 'Happy', img: BIBI.happy }] } },
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

/* =============================================================================
 * A1 Unit 5 Lesson 4: "Describe a Monster Friend!"
 * Objective: I can describe a monster in 4 sentences: "He's got three eyes. He's wearing a big hat. He's happy because…"
 * Evidence: a 4-sentence description the teacher can build (Monster Mix-Up + the swap in free talk).
 * Story frame: getting ready in Bibi's garden — the washing line, the dress-up box and the Monster Machine that keeps
 *   making mistakes (new setting: a breezy garden, teal sky). Research: docs/research/playground-a1u5-research.md.
 * Practice ladder: Remember? (L3 feelings) → Present (I do: He's wearing… on Leo, She's wearing… on Mia; the four new
 *   clothes words; we do: echo) → Read and Match → you do: Monster Mix-Up ★ (spot and fix the machine's mistake, say the
 *   correction) → Dress-Up Studio (dress Leo and Mia as you hear) → Washing Line (Where is Bob's scarf?) → Shadows →
 *   Reading (Reader p1-9, Read and Do) → Phonics y = /ee/ (Sound Pick: the END of the word, Blend & Read frog, twister)
 *   → Free (describe your monster — the teacher builds it wrong on purpose; What are you wearing?) → check.
 * ========================================================================= */
export const LESSON_A1U5L4_TITLE = 'Describe a Monster Friend!';
export const LESSON_A1U5L4_OBJECTIVE = 'I can describe a monster in 4 sentences: "He\'s got three eyes. He\'s wearing a big hat. He\'s happy because…"';

const bgYard = `${S}/bg-a1u5-laundry-wide.png`;
const WEAR = { hat: item('hat'), glasses: item('glasses'), scarf: item('scarf'), boots: item('boots'), coat: item('coat-blue') };

export const LESSON_A1U5L4_SCENES: Scene[] = [
  { id: 'mt4-title', kind: 'title-card', bg: bibiPage(8), level: 'A1', unit: 'Unit 5', lessonLabel: 'Lesson 4', title: 'Describe a Monster Friend!', subtitle: 'He’s wearing a hat… or is he?', cta: '\u{1F47E} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 3 — feelings. Click mode (L3 used shadow): listen, click the face.
    id: 'mt4-recall-warmup', kind: 'recall-warmup', bg: bgYard, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Lesson 3 · The Monster Music Show',
    teacher: 'Guided: listen — which face is it? Click it, then say why: She’s scared because…',
    items: [
      { word: 'scared', say: 'She’s scared because it’s dark!', img: BIBI.scared },
      { word: 'bored', say: 'She’s bored because the lesson is long.', img: BIBI.bored },
      { word: 'excited', say: 'She’s excited because it’s a party!', img: BIBI.excited },
      { word: 'sad', say: 'She’s sad because she’s tiny.', img: BIBI.sad },
    ],
  },
  { id: 'mt4-meet-leo', kind: 'meet', focus: ['wearing', 'scarf'], bg: bibiPage(8), who: 'leo', cardSide: 'right', teacher: 'Present (I do): Leo arrives in Monster Town. Point to his scarf: He’s wearing a green scarf. Mime wrapping a scarf. The student repeats.', line: 'Look! I’m wearing a green scarf!', repeat: 'He’s wearing a green scarf.' },
  { id: 'mt4-meet-mia', kind: 'meet', focus: ['wearing', 'glasses'], bg: bibiPage(8), who: 'mia', cardSide: 'right', teacher: 'Present (I do): Mia — make "glasses" with your fingers. She’s wearing glasses. Note: glasses (always s). The student repeats.', line: 'And I’m wearing glasses!', repeat: 'She’s wearing glasses.' },
  {
    id: 'mt4-wear-cards', kind: 'prea1', teacher: 'Present (I do → you do): one piece at a time — say it, mime putting it on; the student mimes and says it.',
    scene: {
      id: 'mt4-wear-cards', kind: 'listen-repeat-cards', bg: bgYard, teacher: 'Listen, put it on and say it!',
      cards: [
        { who: 'mia', sentence: 'He’s wearing a hat.', img: WEAR.hat, imgLabel: 'hat' },
        { who: 'mia', sentence: 'She’s wearing glasses.', img: WEAR.glasses, imgLabel: 'glasses' },
        { who: 'mia', sentence: 'He’s wearing a scarf.', img: WEAR.scarf, imgLabel: 'scarf' },
        { who: 'mia', sentence: 'She’s wearing boots.', img: WEAR.boots, imgLabel: 'boots' },
      ],
    },
  },
  { id: 'mt4-echo', kind: 'echo', bg: bgYard, who: 'leo', textSide: 'top', teacher: 'Guided (we do): say it like Leo — proud and loud!', word: 'He’s wearing a scarf and boots.' },
  { id: 'mt4-echo-2', kind: 'echo', bg: bgYard, who: 'mia', textSide: 'top', teacher: 'Guided (we do): say it like Mia — then point to someone and change it: He’s / She’s…', word: 'She’s wearing glasses and a hat.' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1). Design: chalk (L3 = polaroids, U4L4 = cards).
  {
    id: 'mt4-wear-match', kind: 'picture-match', look: 'chalk', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each word and drags it under its picture, then says: He’s wearing a … .',
    items: [
      { word: 'hat', img: WEAR.hat },
      { word: 'glasses', img: WEAR.glasses },
      { word: 'scarf', img: WEAR.scarf },
      { word: 'boots', img: WEAR.boots },
      { word: 'coat', img: WEAR.coat },
    ],
    bg: bgYard,
  },
  /* You do: the signature game */
  {
    id: 'mt4-mixup', kind: 'monster-mixup', bg: bgYard, who: 'bibi', title: 'Monster Mix-Up',
    teacher: 'Signature game (you do): Bibi describes her friend, the Monster Machine builds it — with ONE mistake. The student reads/listens, taps the wrong part, picks the right one and says the correction: "No! He’s wearing a hat!"',
    body: PART.body, eye: PART.eye,
    horns: [{ label: 'short horns', img: PART.hornsShort }, { label: 'long horns', img: PART.hornsLong }],
    mouths: [{ label: 'big teeth', img: PART.teeth }, { label: 'a big smile', img: PART.smile }],
    wear: [
      { word: 'a hat', img: WEAR.hat, on: 'head' },
      { word: 'glasses', img: WEAR.glasses, on: 'face' },
      { word: 'a scarf', img: WEAR.scarf, on: 'neck' },
      { word: 'boots', img: WEAR.boots, on: 'feet' },
    ],
    rounds: [
      { line: 'He’s got three eyes. He’s wearing a hat and boots.', name: 'Zog', eyes: 3, horns: 1, mouth: 1, wears: [0, 3], mistake: { part: 'eyes', shown: 2 }, say: 'No! He’s got three eyes!' },
      { line: 'She’s got two eyes. She’s wearing glasses and a scarf.', name: 'Tilly', eyes: 2, horns: 0, mouth: 0, wears: [1, 2], mistake: { part: 'wear', slot: 0, shown: 0 }, say: 'No! She’s wearing glasses!' },
      { line: 'She’s got long horns and big teeth. She’s wearing boots.', name: 'Mo', eyes: 1, horns: 1, mouth: 0, wears: [3], mistake: { part: 'horns', shown: 0 }, say: 'No! She’s got long horns!' },
      { line: 'He’s got a big smile. He’s wearing a scarf and a hat.', name: 'Fizz', eyes: 2, horns: 0, mouth: 1, wears: [2, 0], mistake: { part: 'wear', slot: 0, shown: 3 }, say: 'No! He’s wearing a scarf!' },
      { line: 'He’s got two eyes and big teeth. He’s wearing glasses.', name: 'Bop', eyes: 2, horns: 1, mouth: 0, wears: [1], mistake: { part: 'mouth', shown: 1 }, say: 'No! He’s got big teeth!' },
    ],
    doneLine: 'You fixed every monster! You are the Monster Expert!',
  },
  helloSong('mt4-hello-song', bgYard),
  {
    id: 'mt4-dress', kind: 'prea1', teacher: 'You do: Dress-Up Studio! Leo and Mia get ready for the monster party. Listen for the piece AND the colour, tap the piece, then the paint pot. Say it: He’s wearing a blue hat! (Leo is a boy: no dress for him.)',
    scene: {
      id: 'mt4-dress', kind: 'dress-studio', bg: bgYard, who: 'mia',
      teacher: 'Listen: which piece and which colour?',
      pieces: [
        { id: 'hat', word: 'hat', img: item('hat-green') },
        { id: 'shirt', word: 'shirt', img: item('shirt-red') },
        { id: 'pants', word: 'pants', img: item('pants-blue'), plural: true },
        { id: 'socks', word: 'socks', img: item('socks-red'), plural: true },
        { id: 'shoes', word: 'shoes', img: item('shoes-blue'), plural: true },
        { id: 'dress', word: 'dress', img: item('dress-yellow') },
      ],
      colors: [
        { word: 'red', hex: '#E53935' },
        { word: 'blue', hex: '#1E6FD9' },
        { word: 'green', hex: '#3DAA3D' },
        { word: 'yellow', hex: '#FFD31A' },
        { word: 'purple', hex: '#8E44AD' },
      ],
      rounds: [
        { friend: 'leo', piece: 0, color: 4, line: 'A purple hat, please! It’s a monster party!', reply: 'He’s wearing a purple hat!' },
        { friend: 'leo', piece: 1, color: 2, line: 'Now a green shirt, please!', reply: 'He’s wearing a green shirt!' },
        { friend: 'mia', piece: 5, color: 1, line: 'A blue dress, please!', reply: 'She’s wearing a blue dress!' },
        { friend: 'mia', piece: 4, color: 3, line: 'And yellow shoes, please!', reply: 'She’s wearing yellow shoes!' },
      ],
      free: { friend: 'pip', line: 'Now dress me for the party! Then take a photo!' },
      doneLine: 'Everyone is ready for the monster party!',
    },
  },
  {
    id: 'mt4-washing-line', kind: 'prea1', teacher: 'You do: Washing Line! The monsters’ clothes are on the line. Listen: whose thing is it? Tap it in the basket — up it goes. Say: Here’s Big Bob’s scarf!',
    scene: {
      id: 'mt4-washing-line', kind: 'washing-line', bg: bgYard, who: 'pip',
      teacher: 'Where is it? Tap it and say it!',
      rope: { y: 21, x0: 12, x1: 93 },
      clothes: [
        { word: 'scarf', img: WEAR.scarf },
        { word: 'glasses', img: WEAR.glasses },
        { word: 'boots', img: WEAR.boots },
        { word: 'hat', img: WEAR.hat },
      ],
      rounds: [
        { item: 0, line: 'Where is Big Bob’s scarf?', reply: 'Here it is! Big Bob’s scarf!' },
        { item: 2, line: 'Where are Bibi’s boots?', reply: 'Yes! Bibi’s boots!' },
        { item: 1, line: 'Where are Mia’s glasses?', reply: 'Here they are! Mia’s glasses!' },
        { item: 3, line: 'Where is Professor Glob’s hat?', reply: 'Yes! Professor Glob’s hat!' },
      ],
      doneLine: 'All the clothes are on the line! Whoosh, the wind!',
    },
  },
  {
    id: 'mt4-move-break', kind: 'prea1', teacher: 'Brain break: get dressed — fast and silly!',
    scene: {
      id: 'mt4-move-break', kind: 'tpr-actions', mode: 'break', bg: bgYard, who: 'pip', teacher: 'Get dressed!',
      rounds: [
        { line: 'Put on your hat!', emoji: '\u{1F3A9}' },
        { line: 'Put on your glasses!', emoji: '\u{1F453}' },
        { line: 'Put on your boots — stomp, stomp!', emoji: '\u{1F462}' },
      ],
    },
  },
  {
    id: 'mt4-shadows', kind: 'prea1', teacher: 'Game: Shadows! Drag each piece onto its shadow (or tap it, then the shadow). Say: It’s a scarf!',
    scene: {
      id: 'mt4-shadows', kind: 'shadow-match', bg: bgYard, who: 'mia',
      teacher: 'Match each piece to its shadow!',
      items: [
        { label: 'hat', img: WEAR.hat, line: 'It’s a hat!' },
        { label: 'glasses', img: WEAR.glasses, line: 'They’re glasses!' },
        { label: 'scarf', img: WEAR.scarf, line: 'It’s a scarf!' },
        { label: 'boots', img: WEAR.boots, line: 'They’re boots!' },
        { label: 'coat', img: WEAR.coat, line: 'It’s a coat!' },
      ],
    },
  },
  /* Reading: Bibi's Bad Day, pages 1-9 */
  { id: 'mt4-why-sad', kind: 'meet', focus: ['why', 'sad'], bg: bibiPage(9), who: 'mia', cardSide: 'left', teacher: 'Present before reading: Mia asks Bibi the question from page 9. The student asks it too, kindly.', line: 'Why are you sad, Bibi?', repeat: 'I am sad because I am little.' },
  {
    id: 'mt4-reader', kind: 'reader', bg: bibiPage(8), title: 'Bibi’s Bad Day', doneLine: 'Leo and Mia have an idea… What is it? Find out next time!',
    teacher: 'Reading: the student reads pages 1-7 quickly, then the new pages 8-9 (listen first). Tap any word to hear it.',
    pages: BIBI_BAD_DAY.slice(0, 9),
  },
  {
    id: 'mt4-read-do', kind: 'read-do', bg: bgYard, title: 'Read and do!', cast: ['leo', 'mia', 'bibi'],
    teacher: 'Reading: the student READS the card (🔊 only for help), taps the thing, then the friend.',
    things: [
      { label: 'green scarf', img: WEAR.scarf },
      { label: 'glasses', img: WEAR.glasses },
      { label: 'boots', img: WEAR.boots },
      { label: 'hat', img: WEAR.hat },
    ],
    rounds: [
      { text: 'Give Leo the green scarf.', thing: 0, to: 0, reply: 'Thank you! I’m wearing my green scarf!' },
      { text: 'Give Mia the glasses.', thing: 1, to: 1, reply: 'My glasses! Now I can read!' },
      { text: 'Give Bibi the boots.', thing: 2, to: 2, reply: 'Boots! I’m happy now!' },
      { text: 'Give Leo the hat.', thing: 3, to: 0, reply: 'A hat and a scarf! I’m ready!' },
    ],
    doneLine: 'Great reading! Everyone is ready!',
  },
  /* Phonics: y = /ee/ at the end → Sound Pick (the END of the word) → Blend & Read (frog) → tongue twister */
  {
    id: 'mt4-sound-y', kind: 'sound-model', bg: bgYard, who: 'pip', letter: 'Y', phoneme: '/iː/', sound: 'ee', soundSide: 'center',
    teacher: 'Present: at the END of a word, y says /ee/ — happy, sleepy, teddy. (At the start it says /y/: yes, yo-yo.) Smile and say: eeee!',
    anchors: [
      { word: 'happy', emoji: '\u{1F604}', img: BIBI.happy },
      { word: 'sleepy', emoji: '\u{1F634}', img: BIBI.tired },
      { word: 'teddy', emoji: '\u{1F9F8}', img: item('teddy') },
    ],
  },
  {
    id: 'mt4-sound-pick', kind: 'prea1', teacher: 'Guided: listen to /ee/, then tap the word that ENDS with it (y at the end). Say the word. Words with y at the START (yak, yo-yo) say /y/!',
    scene: {
      id: 'mt4-sound-pick', kind: 'sound-pick', bg: bgYard, who: 'pip', teacher: 'Which word ends with /ee/?',
      ask: 'Which word ends with this sound?',
      rounds: [
        { sound: 'y=ee', answer: 0, options: [{ word: 'happy', img: BIBI.happy }, { word: 'yak', img: item('yak') }, { word: 'hat', img: WEAR.hat }] },
        { sound: 'y=ee', answer: 2, options: [{ word: 'yarn', img: item('yarn') }, { word: 'hen', img: item('hen') }, { word: 'teddy', img: item('teddy') }] },
        { sound: 'y=ee', answer: 1, options: [{ word: 'yo-yo', img: item('yoyo') }, { word: 'sleepy', img: BIBI.tired }, { word: 'pig', img: item('pig') }] },
        { sound: 'y=ee', answer: 0, options: [{ word: 'sunny', img: item('sun') }, { word: 'yak', img: item('yak') }, { word: 'ham', img: item('ham') }] },
      ],
    },
  },
  {
    id: 'mt4-blend', kind: 'sound-blend', bg: bgYard, look: 'frog',
    teacher: 'Reading: tap each lily pad and say the sound — the y at the end says /ee/ — blend the word, find the picture, then read the sentence.',
    rounds: [
      { word: 'happy', sounds: ['h', 'a', 'pp=p', 'y=ee'], img: BIBI.happy, sentence: 'Bibi is happy now.' },
      { word: 'teddy', sounds: ['t', 'e', 'dd=d', 'y=ee'], img: item('teddy'), sentence: 'Bea has got a teddy.' },
      { word: 'sunny', sounds: ['s', 'u', 'nn=n', 'y=ee'], img: item('sun'), sentence: 'It is sunny in the garden.' },
    ],
  },
  { id: 'mt4-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgYard, who: 'pip', focus: 'y', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, faster — then monster speed! Point to every y that says /ee/.', line: 'Funny Bibi is happy and sleepy.' },
  /* Free: the student describes — the teacher builds it wrong on purpose; then swap */
  {
    id: 'mt4-free-maker', kind: 'join-stage', bg: bgYard, teacher: 'Free (the evidence): the student describes their own monster in 4 sentences (got, got, wearing, feeling + because). The teacher draws it — WRONG on purpose — and the student corrects: No! He’s got THREE eyes! Then swap: Bibi describes, the student draws.', cast: ['bibi'],
    turns: [
      { who: 'bibi', line: 'Tell me about your monster! What has it got?' },
      { who: 'student', line: 'He’s got … . She’s got … .' },
      { who: 'bibi', line: 'What is it wearing?' },
      { who: 'student', line: 'He’s wearing … .' },
      { who: 'bibi', line: 'How does it feel? Why?' },
      { who: 'student', line: 'He’s happy because … .' },
    ],
  },
  {
    id: 'mt4-free-wearing', kind: 'join-stage', bg: bibiPage(8), teacher: 'Free: Mia asks what the student is wearing today — they answer with I’m wearing… . Then they describe the teacher: You’re wearing… / She’s wearing… .', cast: ['mia'],
    turns: [
      { who: 'mia', line: 'I’m wearing glasses! What are you wearing today?' },
      { who: 'student', line: 'I’m wearing … .' },
      { who: 'mia', line: 'What is your teacher wearing?' },
      { who: 'student', line: 'She’s / He’s wearing … .' },
    ],
  },
  { id: 'mt4-i-can', kind: 'meet', focus: ['wearing', 'got'], bg: bgYard, who: 'bibi', cardSide: 'left', teacher: 'Check: the student describes one monster in 4 sentences (got, got, wearing, feeling + because) — the teacher can build it. Then the passport stamp!', line: 'You can describe a monster friend! He’s got three eyes. He’s wearing a hat!', repeat: 'He’s wearing a big hat.' },
  {
    id: 'mt4-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Monster Town sticker in their Sticker Book.',
    scene: {
      id: 'mt4-sticker', kind: 'sticker-reward', bg: bgYard, who: 'pip', teacher: 'Sticker time!',
      line: 'Monster expert! Here is your sticker.',
      sticker: { img: WEAR.glasses, label: 'Monster expert' },
    },
  },
  petPal('mt4-pet-pal', 0, 'It’s rainy! I want my boots, please!', [{ label: 'hat', img: WEAR.hat }, { label: 'boots', img: WEAR.boots }, { label: 'glasses', img: WEAR.glasses }], 1, 'Boots! Now I can jump in the puddles!'),
  {
    id: 'mt4-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'mt4-home-mission', kind: 'home-mission', bg: bgYard, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned to describe what someone is wearing: "He\'s wearing a hat. She\'s wearing glasses." This week, describe a family member in 4 sentences together — and make one mistake on purpose for your child to correct!',
      steps: [
        { emoji: '\u{1F454}', say: 'What is your mom or dad wearing? Say: She’s wearing … .' },
        { emoji: '\u{1F47E}', say: 'Draw a monster with a hat. Describe it!' },
        { emoji: '\u{1F604}', say: 'Find 3 words with y at the end: happy, sunny… .' },
      ],
    },
  },
  {
    id: 'mt4-move-break-2', kind: 'prea1', teacher: 'Brain break: Monster Mix-Up, freeze!',
    scene: {
      id: 'mt4-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgYard, who: 'pip', teacher: 'Monster moves!',
      rounds: [
        { line: 'Walk like a monster in big boots!', emoji: '\u{1F462}' },
        { line: 'Wave your scarf in the wind!', emoji: '\u{1F9E3}' },
        { line: 'Freeze! Make a happy face!', emoji: '\u{1F604}' },
      ],
    },
  },
  goodbyeSong('mt4-goodbye-song', bgYard),
  { id: 'mt4-finale', kind: 'finale', bg: bibiPage(8), who: 'pip', line: 'You can describe a monster friend! See you in Monster Town! \u{1F47E}' },
];

/* =============================================================================
 * A1 Unit 5 Lesson 5: "Storybook: Bibi's Bad Day"
 * Objective: I can read "Bibi's Bad Day" with help and say how Bibi feels and why.
 * Evidence: reads 4 pages alone; at the pause chooses how to cheer Bibi up and says why (She's sad because she's tiny.);
 *   plots Bibi's day on the Feelings Meter with a because sentence for each point.
 * Story frame: the party — the friends cheer Bibi up (new setting: the party room and the evening dance hall).
 * Ladder: Remember? (L4 clothes) → predict (How can we help Bibi?) → party words → Read and Match (cards) → Reader p1-9
 *   (the student reads) → PAUSE: choose how to cheer Bibi up → Reader p10-12 → Feelings Meter ★ (the day as a graph,
 *   one because sentence per point) → Story Quiz Board → Picture Crossword → I Spy at the party → act it out →
 *   phonics review ee / ea / y (Word Splat, Blend & Read) → twister of the unit → retell → check.
 * Research: docs/research/playground-a1u5-research.md (Lesson 5).
 * ========================================================================= */
export const LESSON_A1U5L5_TITLE = 'Storybook: Bibi’s Bad Day';
export const LESSON_A1U5L5_OBJECTIVE = 'I can read "Bibi\'s Bad Day" with help and say how Bibi feels and why.';

export const LESSON_A1U5L5_SCENES: Scene[] = [
  { id: 'mt5-title', kind: 'title-card', bg: bibiPage(12), level: 'A1', unit: 'Unit 5', lessonLabel: 'Lesson 5', title: 'Bibi’s Bad Day', subtitle: 'The whole story — and a surprise!', cta: '\u{1F4D6} LET’S READ!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 4 — clothes. Shadow mode: the clothes stickers have clearly different outlines.
    id: 'mt5-recall-warmup', kind: 'recall-warmup', bg: bibiPage(8), who: 'pip', mode: 'shadow', listen: true,
    fromLabel: 'Lesson 4 · Describe a Monster Friend!',
    teacher: 'Guided: listen — which shadow is it? Tap it, then say: He’s wearing … / She’s wearing … .',
    items: [
      { word: 'scarf', say: 'Leo is wearing a green scarf.', img: WEAR.scarf },
      { word: 'glasses', say: 'Mia is wearing glasses.', img: WEAR.glasses },
      { word: 'boots', say: 'Bibi is wearing boots.', img: WEAR.boots },
      { word: 'hat', say: 'Professor Glob is wearing a hat.', img: WEAR.hat },
    ],
  },
  { id: 'mt5-predict', kind: 'meet', focus: ['help'], bg: bibiPage(9), who: 'leo', cardSide: 'right', teacher: 'Predict (before reading): Bibi is sad. Ask: How can we help her? The student guesses in English: A party! A hug! A game! Every guess is good.', line: 'Bibi is sad. How can we help her?', repeat: 'How can we help Bibi?' },
  {
    id: 'mt5-party-words', kind: 'prea1', teacher: 'Present (I do → you do): the party words for the end of the story. Show, say, the student repeats with a party face.',
    scene: {
      id: 'mt5-party-words', kind: 'listen-repeat-cards', bg: bibiPage(11), teacher: 'Listen and say it!',
      cards: [
        { who: 'mia', sentence: 'Surprise!', img: BIBI.surprised, imgLabel: 'surprise' },
        { who: 'mia', sentence: 'A big cake!', img: item('cake'), imgLabel: 'cake' },
        { who: 'mia', sentence: 'Balloons!', img: item('balloon-red'), imgLabel: 'balloons' },
        { who: 'mia', sentence: 'A present for you!', img: item('present'), imgLabel: 'present' },
      ],
    },
  },
  { id: 'mt5-echo', kind: 'echo', bg: bibiPage(10), who: 'mia', textSide: 'top', teacher: 'Guided (we do): shout it like Mia at a surprise party — then whisper it!', word: 'Surprise! Bibi is surprised.' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1). Design: cards (L4 = chalk, U4L5 = frames).
  {
    id: 'mt5-party-match', kind: 'picture-match', look: 'cards', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each word and drags it under its picture, then says it in a sentence.',
    items: [
      { word: 'cake', img: item('cake') },
      { word: 'balloon', img: item('balloon-red') },
      { word: 'present', img: item('present') },
      { word: 'surprised', img: BIBI.surprised },
      { word: 'excited', img: BIBI.excited },
    ],
    bg: bibiPage(11),
  },
  /* The story: pages 1-9, the pause, pages 10-12 */
  {
    id: 'mt5-reader-1', kind: 'reader', bg: bibiPage(1), title: 'Bibi’s Bad Day', doneLine: 'Poor Bibi! Stop — what can her friends do?',
    teacher: 'Reading (evidence): the student reads pages 1-9 — at least 4 pages alone (tap any word for help). Ask the picture questions.',
    pages: BIBI_BAD_DAY.slice(0, 9),
  },
  {
    id: 'mt5-pause', kind: 'choice', bg: bibiPage(9), who: 'pip', prompt: 'How can the friends cheer Bibi up? You choose!',
    teacher: 'PAUSE page (evidence): the student chooses how to cheer Bibi up and says why — “A party! She’s sad because she’s tiny.” Every choice is good. Then read on and see what the friends do.',
    options: [
      { label: 'A surprise party!', emoji: '\u{1F389}', correct: true },
      { label: 'A big hug!', emoji: '\u{1F917}', correct: true },
      { label: 'A funny game!', emoji: '\u{1F3B2}', correct: true },
    ],
  },
  {
    id: 'mt5-reader-2', kind: 'reader', bg: bibiPage(10), title: 'Bibi’s Bad Day', doneLine: 'The end! It is a good day after all!',
    teacher: 'Reading: pages 10-12 — was your idea right? Listen first, then the student reads. Act “Surprise!”.',
    pages: BIBI_BAD_DAY.slice(9, 12),
  },
  { id: 'mt5-thanks', kind: 'meet', focus: ['happy'], bg: bibiPage(12), who: 'bibi', cardSide: 'left', teacher: 'Present: Bibi thanks the friends. Ask: How does Bibi feel now? Why?', line: 'Thank you, friends! I’m so happy!', repeat: 'She’s happy because it’s a party for her.' },
  { id: 'mt5-echo-2', kind: 'echo', bg: bibiPage(11), who: 'bibi', textSide: 'top', teacher: 'Guided (we do): say it like Bibi — jumping with excitement!', word: 'Bibi is excited because it is a party for her!' },
  /* You do: the signature game */
  {
    id: 'mt5-meter', kind: 'feelings-meter', bg: bibiPage(12), who: 'pip', title: 'Feelings Meter: Bibi’s day',
    teacher: 'Signature game (evidence): look at each picture, tap Bibi’s face — the dot drops and the line grows. Then the student says the sentence with because. At the end: down, down… and up!',
    feelings: [
      { label: 'excited', img: BIBI.excited },
      { label: 'happy', img: BIBI.happy },
      { label: 'surprised', img: BIBI.surprised },
      { label: 'bored', img: BIBI.bored },
      { label: 'tired', img: BIBI.tired },
      { label: 'scared', img: BIBI.scared },
      { label: 'sad', img: BIBI.sad },
    ],
    points: [
      { img: bibiPage(2), feeling: 4, line: 'Bibi is tired because it is early.' },
      { img: bibiPage(3), feeling: 5, line: 'Bibi is scared because it is dark.' },
      { img: bibiPage(4), feeling: 3, line: 'Bibi is bored because the lesson is long.' },
      { img: bibiPage(7), feeling: 6, line: 'Bibi is sad because she is tiny.' },
      { img: bibiPage(10), feeling: 2, line: 'Bibi is surprised. Surprise!' },
      { img: bibiPage(11), feeling: 0, line: 'Bibi is excited because it is a party for her.' },
      { img: bibiPage(12), feeling: 1, line: 'Bibi is happy. It is a good day after all!' },
    ],
    doneLine: 'Bibi’s day: down, down, down… and UP!',
  },
  {
    id: 'mt5-quiz', kind: 'quiz-board', bg: bibiPage(12), who: 'bibi', title: 'Story Quiz Board!',
    teacher: 'Guided: the student picks any tile — harder questions are worth more. Answer, then say it aloud. One tile is a BOOM tile: double points!',
    categories: [
      { name: 'Who?', emoji: '\u{1F47E}', tiles: [
        { ask: 'Who is tiny?', choices: ['Bibi.', 'Big Bob.'], answer: 0, img: bibiPage(5) },
        { ask: 'Who is Bea?', choices: ['Bibi’s sister.', 'Bibi’s teacher.'], answer: 0, img: bibiPage(6) },
        { ask: 'Who asks “Why are you sad?”', choices: ['Mia.', 'Professor Glob.'], answer: 0, img: bibiPage(9) },
      ] },
      { name: 'How?', emoji: '\u{1F60A}', tiles: [
        { ask: 'How is Bibi in the dark?', choices: ['Scared.', 'Happy.'], answer: 0, img: bibiPage(3) },
        { ask: 'How is Bibi in the long lesson?', choices: ['Bored.', 'Excited.'], answer: 0, img: bibiPage(4) },
        { ask: 'How is Bibi at the door?', choices: ['Surprised.', 'Tired.'], answer: 0, img: bibiPage(10) },
      ] },
      { name: 'Why?', emoji: '\u{2753}', tiles: [
        { ask: 'Why is Bibi tired?', choices: ['It is early.', 'It is a party.'], answer: 0 },
        { ask: 'Why is Bibi sad?', choices: ['She is tiny.', 'It is sunny.'], answer: 0 },
        { ask: 'Why is Bibi excited?', choices: ['It is a party for her.', 'The lesson is long.'], answer: 0 },
      ] },
    ],
    boom: [2, 2],
    doneLine: 'The board is finished! Story champion!',
  },
  {
    id: 'mt5-crossword', kind: 'crossword', bg: bibiPage(11), who: 'bibi', title: 'Party Crossword',
    teacher: 'Spelling game: tap a picture, then tap the letters to fill its squares. Crossing letters help! Say each word when it is done.',
    words: [
      { word: 'cake', img: item('cake'), say: 'Cake! A big cake for Bibi.' },
      { word: 'present', img: item('present'), say: 'Present! A present for Bibi.' },
      { word: 'scarf', img: WEAR.scarf, say: 'Scarf! Leo is wearing a green scarf.' },
      { word: 'boots', img: WEAR.boots, say: 'Boots! Teal boots.' },
      { word: 'hat', img: WEAR.hat, say: 'Hat! A party hat.' },
      { word: 'teddy', img: item('teddy'), say: 'Teddy! Bea has got a teddy.' },
    ],
    doneLine: 'You did the whole crossword!',
  },
  {
    id: 'mt5-i-spy', kind: 'i-spy', bg: bibiPage(11), who: 'pip',
    teacher: 'Game: I Spy at the party! Listen to the clue, move the binoculars to the thing and say it.',
    rounds: [
      { clue: 'I spy something sweet with candles!', spot: { left: 65, top: 73, r: 9 }, answer: 'A cake!' },
      { clue: 'I spy something round in the air!', spot: { left: 86, top: 13, r: 8 }, answer: 'A balloon!' },
      { clue: 'I spy a box with a bow!', spot: { left: 93, top: 89, r: 7 }, answer: 'A present!' },
      { clue: 'I spy a green monster. He’s happy!', spot: { left: 78, top: 60, r: 9 }, answer: 'A green monster!' },
    ],
    doneLine: 'You found everything at the party!',
  },
  {
    id: 'mt5-act-out', kind: 'join-stage', bg: bibiPage(9), teacher: 'Free: act it out! The student is Mia (then Bibi), the teacher is the other one. Use a sad voice, then a surprised one!', cast: ['bibi', 'mia'],
    turns: [
      { who: 'student', line: 'Why are you sad, Bibi?' },
      { who: 'bibi', line: 'I am sad because I am little.' },
      { who: 'student', line: 'Come with me! … Surprise!' },
      { who: 'bibi', line: 'Wow! A party for me? I’m so excited!' },
      { who: 'student', line: 'Yes! Happy day, Bibi!' },
    ],
  },
  {
    id: 'mt5-move-break', kind: 'prea1', teacher: 'Brain break: the party dance!',
    scene: {
      id: 'mt5-move-break', kind: 'tpr-actions', mode: 'break', bg: bibiPage(12), who: 'pip', teacher: 'Party time!',
      rounds: [
        { line: 'Jump like Bibi — so excited!', emoji: '\u{1F929}' },
        { line: 'Blow up a big balloon!', emoji: '\u{1F388}' },
        { line: 'Dance with your friends!', emoji: '\u{1F57A}' },
      ],
    },
  },
  helloSong('mt5-hello-song', bibiPage(12)),
  /* Phonics review: ee · ea · y → Word Splat → Blend & Read → the unit's tongue twister */
  {
    id: 'mt5-sound-review', kind: 'sound-model', bg: bibiPage(12), who: 'pip', letter: 'EE · EA · Y', phoneme: '/iː/', sound: 'ee', soundSide: 'center',
    teacher: 'Review: three spellings, ONE long /ee/ — ee (sheep), ea (tea), y at the end (happy). Smile and say: eeee!',
    anchors: [
      { word: 'sheep', emoji: '\u{1F411}', img: item('sheep') },
      { word: 'tea', emoji: '\u{1F375}', img: item('tea') },
      { word: 'happy', emoji: '\u{1F604}', img: BIBI.happy },
    ],
  },
  {
    id: 'mt5-splat', kind: 'word-splat', bg: bibiPage(11), who: 'pip', title: 'Word Splat: ee, ea, y!',
    teacher: 'Reading: listen and splat the word you hear, then read it. Three spellings — one sound!',
    words: ['bee', 'sheep', 'green', 'tea', 'leaf', 'sea', 'happy', 'teddy'],
    rounds: ['sheep', 'leaf', 'happy', 'tea', 'teddy', 'green'],
    doneLine: 'Splat! You can read ee, ea and y!',
  },
  {
    id: 'mt5-blend', kind: 'sound-blend', bg: bibiPage(11),
    teacher: 'Reading: say each sound, blend the word, find the picture — then read the sentence from the story.',
    rounds: [
      { word: 'teeth', sounds: ['t', 'ee', 'th'], img: PART.teeth, sentence: 'Big Bob has got big teeth.' },
      { word: 'sleepy', sounds: ['s', 'l', 'ee', 'p', 'y=ee'], img: BIBI.tired, sentence: 'Bibi is sleepy because it is early.' },
      { word: 'eat', sounds: ['ea', 't'], img: item('cake'), sentence: 'Let’s eat the cake!' },
    ],
  },
  { id: 'mt5-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bibiPage(12), who: 'pip', focus: 'ee', teacher: 'Reading: the unit’s tongue twister — ee, ea and y together! Slow, faster — then monster speed!', line: 'Happy Bibi eats three green peas.' },
  /* Free: retell with feelings; your own good day */
  {
    id: 'mt5-retell', kind: 'join-stage', bg: bibiPage(1), teacher: 'Free (evidence): the student retells the story with a feeling and a reason for each part — use the Feelings Meter as the map. Pip helps with the first words.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'Tell me the story! First, Bibi is …' },
      { who: 'student', line: 'Bibi is tired because it is early.' },
      { who: 'pip', line: 'And then?' },
      { who: 'student', line: 'She’s scared … She’s bored … She’s sad because … .' },
      { who: 'pip', line: 'And at the end?' },
      { who: 'student', line: 'Surprise! She’s excited because it’s a party! She’s happy!' },
    ],
  },
  {
    id: 'mt5-my-day', kind: 'join-stage', bg: bibiPage(12), teacher: 'Free: the student tells about a bad day that became a good day — how they felt and why.', cast: ['bibi'],
    turns: [
      { who: 'bibi', line: 'My day was bad, then good! And you? When are you sad?' },
      { who: 'student', line: 'I’m sad when … / because … .' },
      { who: 'bibi', line: 'What makes you happy?' },
      { who: 'student', line: 'I’m happy because … .' },
    ],
  },
  { id: 'mt5-i-can', kind: 'meet', focus: ['read', 'why'], bg: bibiPage(12), who: 'bibi', cardSide: 'left', teacher: 'Check: the student read 4 pages alone, chose at the pause and said why, and plotted Bibi’s day with because sentences — then the passport stamp!', line: 'You can read my story and say how I feel — and why!', repeat: 'Bibi is happy because it is a party for her.' },
  {
    id: 'mt5-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Monster Town sticker in their Sticker Book.',
    scene: {
      id: 'mt5-sticker', kind: 'sticker-reward', bg: bibiPage(12), who: 'pip', teacher: 'Sticker time!',
      line: 'Story star! Here is your sticker.',
      sticker: { img: BIBI.happy, label: 'Story star' },
    },
  },
  petPal('mt5-pet-pal', 0, 'It’s a party! I want a piece of cake, please!', [{ label: 'cake', img: item('cake') }, { label: 'boots', img: WEAR.boots }, { label: 'teddy', img: item('teddy') }], 0, 'Cake! I’m so excited!'),
  {
    id: 'mt5-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'mt5-home-mission', kind: 'home-mission', bg: bibiPage(12), who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child read the whole story "Bibi\'s Bad Day" and said how Bibi feels and why: "She\'s sad because she\'s tiny." This week, ask your child to read the story to you (the Homework Quest has it) and to tell you how they feel and why.',
      steps: [
        { emoji: '\u{1F4D6}', say: 'Read Bibi’s story to your family.' },
        { emoji: '\u{1F4C8}', say: 'Draw your day: happy, sad, excited…' },
        { emoji: '\u{1F389}', say: 'Plan a little surprise for someone!' },
      ],
    },
  },
  {
    id: 'mt5-move-break-2', kind: 'prea1', teacher: 'Brain break: feelings freeze!',
    scene: {
      id: 'mt5-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bibiPage(12), who: 'pip', teacher: 'Freeze!',
      rounds: [
        { line: 'Freeze! Be scared in the dark!', emoji: '\u{1F631}' },
        { line: 'Freeze! Be surprised at the door!', emoji: '\u{1F62E}' },
        { line: 'Freeze! Be happy at the party!', emoji: '\u{1F604}' },
      ],
    },
  },
  goodbyeSong('mt5-goodbye-song', bibiPage(12)),
  { id: 'mt5-finale', kind: 'finale', bg: bibiPage(12), who: 'pip', line: 'You read the whole story! Bibi is happy — and so are we! \u{1F47E}' },
];

/* =============================================================================
 * A1 Unit 5 Lesson 6: "Feelings Charades!" (extra practice)
 * Objective: I can ask and answer about looks, clothes and feelings quickly.
 * Evidence: in Guess Who the student asks 3+ yes/no questions (Has your monster got…? Is your monster wearing…?) and
 *   answers the friend's questions about their own monster; in Charades they say the feeling AND why.
 * Story frame: game night in Monster Town (new setting: the game-night room with the round table and the curtain stage).
 * Ladder: Remember? (L5 party words) → model the questions and the answers → Guess Who ★ (ask, then hide) →
 *   Charades + Draw That (feelings and why) → Go Fish (Have you got…?) → Sticker Bingo → Save the Balloon (scarf,
 *   teeth, sleep) → Tic-Tac-Toe → Hot Potato questions → Pass the Present → Dominoes → Twister Race → Blend & Read →
 *   free talk with Bibi → check.
 * Research: docs/research/playground-a1u5-research.md (Lesson 6).
 * ========================================================================= */
export const LESSON_A1U5L6_TITLE = 'Feelings Charades!';
export const LESSON_A1U5L6_OBJECTIVE = 'I can ask and answer about looks, clothes and feelings quickly.';

const bgGame = `${S}/bg-a1u5-gamenight-wide.png`;
const GW_KIT = {
  body: PART.body, eye: PART.eye,
  horns: [{ label: 'short horns', img: PART.hornsShort }, { label: 'long horns', img: PART.hornsLong }],
  mouths: [{ label: 'big teeth', img: PART.teeth }, { label: 'a big smile', img: PART.smile }],
  wear: [
    { word: 'a hat', img: WEAR.hat, on: 'head' as const },
    { word: 'glasses', img: WEAR.glasses, on: 'face' as const },
    { word: 'a scarf', img: WEAR.scarf, on: 'neck' as const },
    { word: 'boots', img: WEAR.boots, on: 'feet' as const },
  ],
};
/** Body colours: the lime body sticker (hue ≈ 68°) turned with hue-rotate — checked by eye in the browser. */
const HUE = { purple: 180, blue: 140, green: 45, pink: -110 } as const;
const gwMon = (name: string, color: keyof typeof HUE, eyes: 1 | 2 | 3, horns: number, mouth: number, wears: number[]) =>
  ({ name, color, hue: HUE[color], eyes, horns, mouth, wears });
const isQ = (color: string) => ({ ask: `Is your monster ${color}?`, yes: `Yes! My monster is ${color}.`, no: `No! My monster isn’t ${color}.`, test: { color } });
const eyesQ = (n: 1 | 3) => { const w = n === 1 ? 'one eye' : 'three eyes'; return { ask: `Has your monster got ${w}?`, yes: `Yes! My monster has got ${w}.`, no: `No! My monster hasn’t got ${w}.`, test: { eyes: n } }; };
const gotQ = (what: string, test: { horns?: number; mouth?: number }) => ({ ask: `Has your monster got ${what}?`, yes: `Yes! My monster has got ${what}.`, no: `No! My monster hasn’t got ${what}.`, test });
const wearQ = (w: number) => { const what = GW_KIT.wear[w].word; return { ask: `Is your monster wearing ${what}?`, yes: `Yes! My monster is wearing ${what}.`, no: `No! My monster isn’t wearing ${what}.`, test: { wear: w } }; };
/** Face doodles for Draw That (viewBox 1000 × 600): a round face, eyes, then the mouth that shows the feeling. */
const FACE = ['M 300 300 a 200 200 0 1 0 400 0 a 200 200 0 1 0 -400 0', 'M 420 250 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0', 'M 552 250 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0'];

export const LESSON_A1U5L6_SCENES: Scene[] = [
  { id: 'mt6-title', kind: 'title-card', bg: bgGame, level: 'A1', unit: 'Unit 5', lessonLabel: 'Lesson 6', title: 'Feelings Charades!', subtitle: 'Game night in Monster Town', cta: '\u{1F3B2} LET’S PLAY!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 5 — the party words. Click mode (L5 used shadow).
    id: 'mt6-recall-warmup', kind: 'recall-warmup', bg: bgGame, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Lesson 5 · Storybook: Bibi’s Bad Day',
    teacher: 'Guided: listen — which picture is it? Tap it, then say the sentence from the story.',
    items: [
      { word: 'cake', say: 'A big cake for Bibi!', img: item('cake') },
      { word: 'present', say: 'A present for you!', img: item('present') },
      { word: 'surprised', say: 'Surprise! Bibi is surprised.', img: BIBI.surprised },
      { word: 'excited', say: 'Bibi is excited because it is a party.', img: BIBI.excited },
    ],
  },
  { id: 'mt6-intro', kind: 'meet', focus: ['games'], bg: bgGame, who: 'bibi', cardSide: 'left', teacher: 'Hook: it is game night in Monster Town! Ask: Do you like games? Which games do you play at home?', line: 'It’s game night in Monster Town! Let’s play games!', repeat: 'Let’s play games!' },
  {
    id: 'mt6-questions', kind: 'prea1', teacher: 'Model (I do → you do): the game questions. Show, say, the student repeats with a question voice (up at the end!).',
    scene: {
      id: 'mt6-questions', kind: 'listen-repeat-cards', bg: bgGame, teacher: 'Listen and ask it!',
      cards: [
        { who: 'pip', sentence: 'Has your monster got long horns?', img: PART.hornsLong, imgLabel: 'long horns' },
        { who: 'pip', sentence: 'Has your monster got three eyes?', img: PART.eye, imgLabel: 'three eyes' },
        { who: 'pip', sentence: 'Is your monster wearing a hat?', img: WEAR.hat, imgLabel: 'a hat' },
        { who: 'pip', sentence: 'Is your monster blue?', img: item('monster-blue'), imgLabel: 'blue?' },
      ],
    },
  },
  { id: 'mt6-answer', kind: 'echo', bg: bgGame, who: 'bibi', textSide: 'top', teacher: 'Model the answers (we do): Yes! My monster has got… / No! My monster isn’t wearing… The student repeats both.', word: 'Yes! My monster has got long horns. No! My monster isn’t wearing a hat.' },
  /* You do: the signature game */
  {
    id: 'mt6-guess-who', kind: 'guess-who', bg: bgGame, who: 'bibi', title: 'Guess Who?',
    teacher: 'Signature game (evidence): Part 1 — the student taps a question AND says it aloud; Bibi answers; the doors that don’t fit close by themselves; then the student taps the last monster and says “It’s Lulu!”. Part 2 — the student secretly picks a monster and answers Bibi’s questions with Yes / No and the whole sentence.',
    ...GW_KIT,
    monsters: [
      gwMon('Zog', 'green', 3, 1, 0, [0]),
      gwMon('Tilly', 'pink', 2, 0, 1, [1]),
      gwMon('Mo', 'blue', 1, 1, 0, [2]),
      gwMon('Bix', 'purple', 2, -1, 1, [3]),
      gwMon('Nim', 'green', 1, 0, 1, [1, 2]),
      gwMon('Pog', 'blue', 3, 0, 0, [0, 3]),
      gwMon('Lulu', 'pink', 3, 1, 1, [2]),
      gwMon('Rex', 'purple', 1, 1, 0, [0]),
    ],
    questions: [isQ('pink'), isQ('green'), eyesQ(3), eyesQ(1), gotQ('long horns', { horns: 1 }), gotQ('big teeth', { mouth: 0 }), wearQ(0), wearQ(1), wearQ(2), wearQ(3)],
    secret: 6,
    hideAsks: [
      { ask: 'Has your monster got long horns?', test: { horns: 1 } },
      { ask: 'Is your monster wearing a hat?', test: { wear: 0 } },
      { ask: 'Has your monster got three eyes?', test: { eyes: 3 } },
      { ask: 'Is your monster blue?', test: { color: 'blue' } },
      { ask: 'Is your monster green?', test: { color: 'green' } },
      { ask: 'Is your monster wearing glasses?', test: { wear: 1 } },
      { ask: 'Has your monster got one eye?', test: { eyes: 1 } },
      { ask: 'Is your monster wearing a scarf?', test: { wear: 2 } },
      { ask: 'Is your monster wearing boots?', test: { wear: 3 } },
      { ask: 'Has your monster got big teeth?', test: { mouth: 0 } },
      { ask: 'Is your monster pink?', test: { color: 'pink' } },
    ],
    doneLine: 'Super questions, super answers! You are a Guess Who star!',
  },
  { id: 'mt6-why-echo', kind: 'echo', bg: bgGame, who: 'mia', textSide: 'top', teacher: 'Model for Charades (we do): say the feeling AND why — with a scared face!', word: 'You’re scared because it’s dark!' },
  {
    id: 'mt6-charades', kind: 'join-stage', bg: bgGame, cast: ['bibi'],
    teacher: 'Free (evidence): CHARADES on the curtain stage! Bibi mimes, the student guesses the feeling AND why. Then swap: the student mimes (tired, bored, excited, scared, surprised), the teacher guesses. No words for the mime!',
    turns: [
      { who: 'bibi', line: 'Watch me! How do I feel?' },
      { who: 'student', line: 'You’re scared! Because it’s dark!' },
      { who: 'bibi', line: 'Yes! Now you. Be tired!' },
      { who: 'student', line: 'How do I feel?' },
      { who: 'bibi', line: 'You’re tired because it’s early!' },
      { who: 'student', line: 'Yes! Now you — be excited!' },
    ],
  },
  {
    id: 'mt6-draw', kind: 'draw-guess', bg: bgGame, who: 'bibi', title: 'Draw That! Which feeling?',
    teacher: 'Game: take turns. The drawer sees a secret feeling and draws the face (no words!); the other one taps the picture and says it — and why: She’s sad because she’s tiny!',
    rounds: [
      { drawer: 'teacher', secret: 1, options: [{ label: 'sad', img: BIBI.sad, say: 'She’s sad!' }, { label: 'happy', img: BIBI.happy, say: 'She’s happy!' }, { label: 'surprised', img: BIBI.surprised, say: 'She’s surprised!' }], doodle: [...FACE, 'M 400 360 Q 500 450 600 360'] },
      { drawer: 'student', secret: 0, options: [{ label: 'tired', img: BIBI.tired, say: 'She’s tired!' }, { label: 'excited', img: BIBI.excited, say: 'She’s excited!' }, { label: 'scared', img: BIBI.scared, say: 'She’s scared!' }] },
      { drawer: 'teacher', secret: 2, options: [{ label: 'happy', img: BIBI.happy, say: 'She’s happy!' }, { label: 'bored', img: BIBI.bored, say: 'She’s bored!' }, { label: 'sad', img: BIBI.sad, say: 'She’s sad!' }], doodle: [...FACE, 'M 400 420 Q 500 340 600 420', 'M 434 285 Q 420 320 434 332 Q 448 320 434 285'] },
      { drawer: 'student', secret: 1, options: [{ label: 'bored', img: BIBI.bored, say: 'She’s bored!' }, { label: 'surprised', img: BIBI.surprised, say: 'She’s surprised!' }, { label: 'happy', img: BIBI.happy, say: 'She’s happy!' }] },
      { drawer: 'teacher', secret: 0, options: [{ label: 'surprised', img: BIBI.surprised, say: 'She’s surprised!' }, { label: 'tired', img: BIBI.tired, say: 'She’s tired!' }, { label: 'sad', img: BIBI.sad, say: 'She’s sad!' }], doodle: [...FACE, 'M 470 380 a 30 40 0 1 0 60 0 a 30 40 0 1 0 -60 0', 'M 400 195 Q 432 165 465 195', 'M 535 195 Q 568 165 600 195'] },
    ],
    doneLine: 'Great drawing! Great guessing!',
  },
  {
    id: 'mt6-move-break', kind: 'prea1', teacher: 'Brain break: Monster says! Do it only when the monster says so.',
    scene: {
      id: 'mt6-move-break', kind: 'tpr-actions', mode: 'break', bg: bgGame, who: 'pip', teacher: 'Monster says!',
      rounds: [
        { line: 'Monster says: put on your hat!', emoji: '\u{1F3A9}' },
        { line: 'Monster says: put on your glasses!', emoji: '\u{1F453}' },
        { line: 'Monster says: be scared!', emoji: '\u{1F631}' },
        { line: 'Monster says: be excited — jump!', emoji: '\u{1F929}' },
      ],
    },
  },
  helloSong('mt6-hello-song', bgGame),
  {
    id: 'mt6-go-fish', kind: 'go-fish', bg: bgGame, who: 'bibi', friendImg: BIBI.happy, title: 'Go Fish with Bibi!',
    teacher: 'Game: the student asks Bibi “Have you got a scarf?” — “Yes! Here you are.” or “No! Go fish!”. Then Bibi asks and the student answers truthfully: Yes, I have. / No, I haven’t. Go fish!',
    cards: [
      { label: 'hat', img: WEAR.hat }, { label: 'scarf', img: WEAR.scarf }, { label: 'coat', img: WEAR.coat },
      { label: 'cake', img: item('cake') }, { label: 'present', img: item('present') }, { label: 'balloon', img: item('balloon-red') }, { label: 'teddy', img: item('teddy') },
    ],
    childHand: ['hat', 'scarf', 'cake', 'present'],
    friendHand: ['hat', 'coat', 'balloon'],
    pond: ['coat', 'scarf', 'balloon', 'cake', 'teddy', 'present', 'teddy'],
    doneLine: 'No more cards! Super asking and answering!',
  },
  {
    id: 'mt6-bingo', kind: 'sticker-bingo', bg: bgGame, who: 'pip', title: 'Monster Bingo!',
    teacher: 'Game: listen to the sentence and stamp the picture. A line of three = Bingo! Then the student reads a picture aloud for the teacher.',
    cells: [
      { label: 'happy', img: BIBI.happy, say: 'Bibi is happy. It is a good day!' },
      { label: 'sad', img: BIBI.sad, say: 'Bibi is sad because she is tiny.' },
      { label: 'tired', img: BIBI.tired, say: 'Bibi is tired because it is early.' },
      { label: 'scared', img: BIBI.scared, say: 'Bibi is scared because it is dark.' },
      { label: 'Big Bob', img: item('big-bob'), say: 'Big Bob is very tall. He has got three eyes.' },
      { label: 'bored', img: BIBI.bored, say: 'Bibi is bored because the lesson is long.' },
      { label: 'excited', img: BIBI.excited, say: 'Bibi is excited because it is a party.' },
      { label: 'surprised', img: BIBI.surprised, say: 'Surprise! Bibi is surprised.' },
      { label: 'Bea', img: item('bea'), say: 'This is Bea. She is Bibi’s sister.' },
    ],
    calls: [4, 0, 8, 2, 6, 1, 3, 5, 7],
    doneLine: 'Bingo! You heard every sentence!',
  },
  {
    id: 'mt6-balloon', kind: 'save-balloon', bg: bgGame, who: 'pip', title: 'Save the Balloon!',
    teacher: 'Spelling: tap the letters of the word — every right letter lifts the balloon. Then read the sentence.',
    rounds: [
      { word: 'scarf', img: WEAR.scarf, sentence: 'Leo is wearing a green scarf.' },
      { word: 'teeth', img: PART.teeth, sentence: 'Big Bob has got big teeth.' },
      { word: 'sleep', img: BIBI.tired, sentence: 'Bibi is tired. She wants to sleep.' },
    ],
    doneLine: 'The balloon is safe! Super spelling!',
  },
  {
    id: 'mt6-tictactoe', kind: 'tic-tac-toe', bg: bgGame, who: 'bibi', opponentImg: BIBI.excited, title: 'Tic-Tac-Toe with Bibi!',
    teacher: 'Game: to take a square, read the question and choose the answer — then say it. Bibi takes the next square. Three in a row wins!',
    squares: [
      { ask: 'How is Bibi?', choices: ['She’s scared.', 'She’s happy.'], answer: 0, img: BIBI.scared },
      { ask: 'What is Leo wearing?', choices: ['A scarf.', 'Glasses.'], answer: 0, img: WEAR.scarf },
      { ask: 'Is Big Bob tall?', choices: ['Yes, he is.', 'No, he isn’t.'], answer: 0, img: item('big-bob') },
      { ask: 'Why is Bibi bored?', choices: ['The lesson is long.', 'It is a party.'], answer: 0, img: BIBI.bored },
      { ask: 'Has a bee got wings?', choices: ['Yes, it has.', 'No, it hasn’t.'], answer: 0, img: item('bee') },
      { ask: 'How is Bibi?', choices: ['She’s tired.', 'She’s excited.'], answer: 1, img: BIBI.excited },
      { ask: 'What is Mia wearing?', choices: ['Boots.', 'Glasses.'], answer: 1, img: WEAR.glasses },
      { ask: 'Why is Bibi surprised?', choices: ['It is a surprise party!', 'It is early.'], answer: 0, img: BIBI.surprised },
      { ask: 'Is Bibi big?', choices: ['Yes, she is.', 'No, she’s tiny.'], answer: 1, img: BIBI.happy },
    ],
    doneLine: 'Three in a row! You win!',
  },
  {
    id: 'mt6-coconut', kind: 'hot-coconut', bg: bgGame, who: 'bibi', title: 'Hot Potato! Pass it — then answer!',
    teacher: 'Free: tap Pass! — where the potato stops, the student answers the question (for themself or to help the friend).',
    seats: [
      { name: 'You', img: '' },
      { name: 'Bibi', img: BIBI.happy },
      { name: 'Bea', img: item('bea') },
      { name: 'Big Bob', img: item('big-bob') },
      { name: 'Glob', img: GLOB },
    ],
    rounds: [
      { ask: 'How do you feel in the dark?', choices: ['I’m scared.', 'I’m a hat.'], answer: 0, stop: 0 },
      { ask: 'Is Big Bob tall or short?', choices: ['He’s short.', 'He’s tall.'], answer: 1, stop: 3 },
      { ask: 'What is Professor Glob wearing?', choices: ['He’s wearing a hat.', 'He’s wearing boots.'], answer: 0, stop: 4 },
      { ask: 'How do you feel at a party?', choices: ['I’m excited!', 'I’m bored.'], answer: 0, stop: 0 },
      { ask: 'Who is Bibi’s sister?', choices: ['Bea.', 'Big Bob.'], answer: 0, stop: 2 },
    ],
    doneLine: 'Hot potato champion!',
  },
  {
    id: 'mt6-parcel', kind: 'pass-parcel', bg: bgGame, who: 'pip', title: 'Pass the Present!',
    teacher: 'Game: every right answer tears one layer off the present. Read the question, choose, then say the whole answer.',
    rounds: [
      { ask: 'Bibi is ___ because she is tiny.', choices: ['sad', 'excited'], answer: 0, img: BIBI.sad },
      { ask: 'He ___ got three eyes.', choices: ['has', 'is'], answer: 0, img: item('big-bob') },
      { ask: 'She is ___ glasses.', choices: ['wearing', 'got'], answer: 0, img: WEAR.glasses },
      { ask: 'I’m scared ___ it’s dark.', choices: ['because', 'and'], answer: 0, img: BIBI.scared },
    ],
    prize: { img: BIBI.excited, label: 'Excited Bibi' },
    doneLine: 'You opened the present! It’s Bibi!',
  },
  {
    id: 'mt6-dominoes', kind: 'dominoes', bg: bgGame, who: 'pip', title: 'Monster Dominoes!',
    teacher: 'Reading: find the domino whose sentence matches the picture at the end of the line — read it aloud and add it.',
    start: { img: BIBI.tired, label: 'tired Bibi' },
    steps: [
      { text: 'Bibi is tired.', img: BIBI.scared, label: 'scared Bibi' },
      { text: 'Bibi is scared.', img: item('big-bob'), label: 'Big Bob' },
      { text: 'Big Bob is very tall.', img: WEAR.scarf, label: 'scarf' },
      { text: 'Leo is wearing a scarf.', img: BIBI.surprised, label: 'surprised Bibi' },
      { text: 'Bibi is surprised!', img: BIBI.happy, label: 'happy Bibi' },
    ],
    doneLine: 'The whole domino line! Super reading!',
  },
  /* Reading and sounds: the unit's twisters, then Blend & Read */
  {
    id: 'mt6-sound-review', kind: 'sound-model', bg: bgGame, who: 'pip', letter: 'EE · EA · Y', phoneme: '/iː/', sound: 'ee', soundSide: 'center',
    teacher: 'Review before the race: ee (bee), ea (leaf), y at the end (funny) — one long /ee/. Smile: eeee!',
    anchors: [
      { word: 'bee', emoji: '\u{1F41D}', img: item('bee') },
      { word: 'leaf', emoji: '\u{1F343}', img: item('leaf') },
      { word: 'funny', emoji: '\u{1F604}', img: BIBI.happy },
    ],
  },
  {
    id: 'mt6-twister-race', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgGame, who: 'pip', focus: '',
    teacher: 'Reading: the Twister Race! All five Unit 5 twisters — slow, faster, then monster speed!',
    line: 'Three green bees see sheep. Sea monsters eat peas at the beach. Bea eats green peas. Funny Bibi is happy and sleepy. Happy Bibi eats three green peas.',
    lines: ['Three green bees see sheep.', 'Sea monsters eat peas at the beach.', 'Bea eats green peas.', 'Funny Bibi is happy and sleepy.', 'Happy Bibi eats three green peas.'],
  },
  {
    id: 'mt6-blend', kind: 'sound-blend', bg: bgGame, look: 'slide',
    teacher: 'Reading: say each sound, slide them together, find the picture — then read the sentence.',
    rounds: [
      { word: 'sheep', sounds: ['sh', 'ee', 'p'], img: item('sheep'), sentence: 'A sheep is sleepy.' },
      { word: 'leaf', sounds: ['l', 'ea', 'f'], img: item('leaf'), sentence: 'Bibi plays with a green leaf.' },
      { word: 'funny', sounds: ['f', 'u', 'nn=n', 'y=ee'], img: BIBI.happy, sentence: 'Bibi is funny and happy.' },
    ],
  },
  {
    id: 'mt6-monster-says', kind: 'prea1', teacher: 'Brain break: the clothes freeze — do it, then say it: I’m wearing a hat!',
    scene: {
      id: 'mt6-monster-says', kind: 'tpr-actions', mode: 'break', bg: bgGame, who: 'pip', teacher: 'Freeze!',
      rounds: [
        { line: 'Put on your boots — stomp, stomp!', emoji: '\u{1F462}' },
        { line: 'Put on your scarf — it’s cold!', emoji: '\u{1F9E3}' },
        { line: 'Freeze! Be a sleepy monster!', emoji: '\u{1F634}' },
      ],
    },
  },
  /* Free talk */
  {
    id: 'mt6-describe', kind: 'join-stage', bg: bgGame, cast: ['bibi'],
    teacher: 'Free (evidence): the student secretly picks a monster from Guess Who and describes it in 3 sentences (has got / is wearing / is + colour); Bibi guesses. Then swap.',
    turns: [
      { who: 'bibi', line: 'Describe a monster! I will guess.' },
      { who: 'student', line: 'My monster is pink. It has got three eyes. It is wearing a scarf.' },
      { who: 'bibi', line: 'Is it Lulu?' },
      { who: 'student', line: 'Yes! Now you describe one.' },
    ],
  },
  {
    id: 'mt6-free-talk', kind: 'join-stage', bg: bgGame, cast: ['bibi'],
    teacher: 'Free: quick-fire talk with Bibi — the student answers fast and asks one question back.',
    turns: [
      { who: 'bibi', line: 'How do you feel today? Why?' },
      { who: 'student', line: 'I’m … because … .' },
      { who: 'bibi', line: 'What are you wearing?' },
      { who: 'student', line: 'I’m wearing … . And you?' },
      { who: 'bibi', line: 'I’m wearing a party hat! Have you got long hair?' },
      { who: 'student', line: 'Yes, I have. / No, I haven’t.' },
    ],
  },
  { id: 'mt6-i-can', kind: 'meet', focus: ['ask', 'answer'], bg: bgGame, who: 'bibi', cardSide: 'left', teacher: 'Check: the student asked 3+ Guess Who questions, answered about their own monster and said a feeling with why in Charades — then the passport stamp!', line: 'You can ask and answer about monsters — so fast!', repeat: 'Has your monster got three eyes?' },
  {
    id: 'mt6-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Monster Town sticker in their Sticker Book.',
    scene: {
      id: 'mt6-sticker', kind: 'sticker-reward', bg: bgGame, who: 'pip', teacher: 'Sticker time!',
      line: 'Game night star! Here is your sticker.',
      sticker: { img: BIBI.excited, label: 'Game night star' },
    },
  },
  petPal('mt6-pet-pal', 0, 'It’s game night! I want my teddy, please!', [{ label: 'teddy', img: item('teddy') }, { label: 'scarf', img: WEAR.scarf }, { label: 'present', img: item('present') }], 0, 'My teddy! Now I’m happy!'),
  {
    id: 'mt6-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'mt6-home-mission', kind: 'home-mission', bg: bgGame, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child played Guess Who and Charades in English: "Has your monster got three eyes?" "Is your monster wearing a hat?" "You\'re scared because it\'s dark!" This week, play Guess Who with family photos: your child asks the questions in English.',
      steps: [
        { emoji: '\u{1F5BC}', say: 'Play Guess Who with family photos.' },
        { emoji: '\u{1F3AD}', say: 'Play Charades: act a feeling!' },
        { emoji: '\u{1F5E3}', say: 'Ask: Is he wearing glasses?' },
      ],
    },
  },
  {
    id: 'mt6-move-break-2', kind: 'prea1', teacher: 'Brain break: the last charade!',
    scene: {
      id: 'mt6-move-break-2', kind: 'tpr-actions', mode: 'break', bg: bgGame, who: 'pip', teacher: 'Charades!',
      rounds: [
        { line: 'Be a bored monster!', emoji: '\u{1F971}' },
        { line: 'Be a surprised monster!', emoji: '\u{1F62E}' },
        { line: 'Be a happy monster — wave goodbye!', emoji: '\u{1F44B}' },
      ],
    },
  },
  goodbyeSong('mt6-goodbye-song', bgGame),
  { id: 'mt6-finale', kind: 'finale', bg: bgGame, who: 'pip', line: 'What a game night! You asked and answered like a monster champion! \u{1F47E}' },
];

/* =============================================================================
 * A1 Unit 5 Lesson 7: "Boss Test: Monster Portrait!"
 * Feelings Race warm-up, then five parts (4 of 5 each, docs/a1-unit-5-monster-town.md §5.7): listening (who feels
 * what / looks / wearing), reading yes / no about the party picture, the story (5 gaps), speaking (a 4-sentence monster
 * portrait + 2 questions about another monster), reading aloud. Practise-again games after the trophy.
 * The A1 Halfway Check is its own lesson after this one (U5 · L8, docs/assessment/a1-assessment-plan.md).
 * ========================================================================= */
export const LESSON_A1U5L7_TITLE = 'Boss Test: Monster Portrait!';
export const LESSON_A1U5L7_OBJECTIVE = 'I can show what I learned in Unit 5: feelings and why, looks (has got), clothes (is wearing) and the story.';

export const LESSON_A1U5L7_SCENES: Scene[] = [
  { id: 'mt7-title', kind: 'title-card', bg: bgStreet, level: 'A1', unit: 'Unit 5', lessonLabel: 'Lesson 7', title: 'Boss Test: Monster Portrait!', subtitle: 'Show everything you can do in Monster Town', cta: '\u{1F3C6} I’M READY!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 6 — the Guess Who questions. Shadow mode (L6 used click): clothes stickers.
    id: 'mt7-recall-warmup', kind: 'recall-warmup', bg: bgStreet, who: 'pip', mode: 'shadow', listen: true,
    fromLabel: 'Unit 5 · Lesson 6 · Feelings Charades!',
    teacher: 'Guided: listen — find the shadow, then ask the Guess Who question: Is your monster wearing a … ?',
    items: [
      { word: 'hat', say: 'Is your monster wearing a hat?', img: WEAR.hat },
      { word: 'glasses', say: 'Is your monster wearing glasses?', img: WEAR.glasses },
      { word: 'boots', say: 'Is your monster wearing boots?', img: WEAR.boots },
      { word: 'scarf', say: 'Is your monster wearing a scarf?', img: WEAR.scarf },
    ],
  },
  helloSong('mt7-hello-song', bgStreet),
  {
    id: 'mt7-intro', kind: 'cinematic', bg: bgStreet, title: 'The Boss Test', subtitle: 'A feelings race, then five parts', narrator: 'bibi',
    script: [
      { who: 'bibi', line: 'Welcome back to Monster Town!' },
      { who: 'bibi', line: 'Listen, read, read my story, talk and read aloud!' },
      { who: 'pip', line: 'First, the feelings race! Let’s go!' },
    ],
    cta: '\u{1F3C1} RACE!',
  },
  {
    id: 'mt7-race', kind: 'answer-race', look: 'race', bg: bgStreet, who: 'pip', racer: BIBI.excited,
    title: 'The Feelings Race! Every right answer moves Bibi!',
    teacher: 'Warm-up: the student answers — every right answer moves Bibi. The last two cards are read, not heard.',
    rounds: [
      { ask: 'How do you feel at a party?', choices: ['I’m excited!', 'I’m wearing a hat.', 'It is dark.'], answer: 0 },
      { ask: 'Why are you scared?', choices: ['Because it’s dark.', 'Because I’m happy.', 'Yes, I am.'], answer: 0 },
      { ask: 'What has Big Bob got?', choices: ['He has got three eyes.', 'He is got three eyes.', 'He wearing eyes.'], answer: 0 },
      { ask: 'What is Leo wearing?', choices: ['He is wearing a scarf.', 'He has wearing a scarf.', 'He is scarf.'], answer: 0, read: true },
      { ask: 'Why is Bibi sad?', choices: ['She is sad because she is tiny.', 'She is sad because it is a party.', 'She sad tiny.'], answer: 0, read: true },
    ],
    doneLine: 'You won the feelings race! Now the Boss Test!',
  },
  /* Part 1 — Listening */
  {
    id: 'mt7-p1-listen', kind: 'prea1', teacher: 'Part 1 — Listening (5). One try each; 🔊 replays it. Pass: 4 of 5. The student works alone.',
    scene: {
      id: 'mt7-p1-listen', kind: 'hero-trials', bg: bgStreet, who: 'pip',
      teacher: 'Listen and tap the picture. One try!',
      hero: { img: BIBI.happy, name: 'Monster Expert' }, medal: item('medal-rainbow'),
      skills: [
        { key: 'feel', label: 'Feelings', icon: '\u{1F60A}' },
        { key: 'look', label: 'Looks', icon: '\u{1F440}' },
        { key: 'wear', label: 'Clothes', icon: '\u{1F9E3}' },
      ],
      items: [
        { skill: 'feel', ask: 'She’s bored because the lesson is long.', reply: 'Bored!', answer: 2, options: [{ label: 'excited', img: BIBI.excited }, { label: 'scared', img: BIBI.scared }, { label: 'bored', img: BIBI.bored }] },
        { skill: 'feel', ask: 'Surprise! She’s surprised!', reply: 'Surprised!', answer: 0, options: [{ label: 'surprised', img: BIBI.surprised }, { label: 'tired', img: BIBI.tired }, { label: 'sad', img: BIBI.sad }] },
        { skill: 'look', ask: 'He’s very tall. He has got three eyes.', reply: 'Big Bob!', answer: 1, options: [{ label: 'Bea', img: item('bea') }, { label: 'Big Bob', img: item('big-bob') }, { label: 'Bibi', img: BIBI.happy }] },
        { skill: 'wear', ask: 'She’s wearing glasses.', reply: 'Glasses!', answer: 0, options: [{ label: 'glasses', img: WEAR.glasses }, { label: 'boots', img: WEAR.boots }, { label: 'scarf', img: WEAR.scarf }] },
        { skill: 'wear', ask: 'It’s cold. He’s wearing a scarf.', reply: 'A scarf!', answer: 2, options: [{ label: 'hat', img: WEAR.hat }, { label: 'coat', img: WEAR.coat }, { label: 'scarf', img: WEAR.scarf }] },
      ],
      doneLine: 'Listening done! Super ears!',
    },
  },
  { id: 'mt7-can-1', kind: 'meet', focus: ['why'], bg: bibiPage(3), who: 'bibi', cardSide: 'right', teacher: 'Can-do: the student says 6 feelings and one reason with because — tick it on the Unit 5 can-do card.', line: 'I can say how I feel — and why!', repeat: 'I’m scared because it’s dark.' },
  /* Part 2 — Reading: yes or no? */
  {
    id: 'mt7-p2-read', kind: 'true-false', bg: bgStreet, img: bibiPage(11), read: true,
    teacher: 'Part 2 — Reading (5). Look at the party picture. Read: yes or no? Pass: 4 of 5.',
    rounds: [
      { who: 'bibi', statement: 'Bibi is excited.', isTrue: true },
      { who: 'bibi', statement: 'There is a big cake.', isTrue: true },
      { who: 'bibi', statement: 'Bibi is sad.', isTrue: false },
      { who: 'bibi', statement: 'There are balloons.', isTrue: true },
      { who: 'bibi', statement: 'Bibi is wearing glasses.', isTrue: false },
    ],
  },
  {
    id: 'mt7-p2b-tick', kind: 'prea1', teacher: 'Part 2b — Reading sentences (5). Read the sentence, look at the picture — tick or cross? Pass: 4 of 5.',
    scene: {
      id: 'mt7-p2b-tick', kind: 'tick-cross', bg: bgStreet, who: 'pip', teacher: 'Read and look. Yes or no?',
      rounds: [
        { img: BIBI.tired, sentence: 'She’s tired.', isTrue: true },
        { img: WEAR.boots, sentence: 'He’s wearing a hat.', isTrue: false },
        { img: item('big-bob'), sentence: 'He’s very tall.', isTrue: true },
        { img: BIBI.scared, sentence: 'She’s happy.', isTrue: false },
        { img: PART.hornsLong, sentence: 'Long horns!', isTrue: true },
      ],
    },
  },
  {
    id: 'mt7-p2c-sounds', kind: 'letter-blocks', bg: bgStreet, mode: 'sounds', model: false,
    prompt: 'Part 2c — Build the long ee words (3)',
    teacher: 'Part 2c — Sounds (3). The student puts the sound blocks in order and reads the word: ee, ea, y. Pass: 2 of 3.',
    rounds: [
      { blocks: ['sh', 'ee', 'p'], word: 'sheep', img: item('sheep') },
      { blocks: ['l', 'ea', 'f'], word: 'leaf', img: item('leaf') },
      { blocks: ['t', 'ee', 'th'], word: 'teeth', img: PART.teeth },
    ],
  },
  { id: 'mt7-can-2', kind: 'meet', focus: ['monsters'], bg: bibiPage(5), who: 'leo', cardSide: 'left', teacher: 'Can-do: the student says what a monster has got (eyes, horns, teeth) and tall / short / big / small — tick it.', line: 'I can say what monsters look like!', repeat: 'Big Bob has got three eyes.' },
  /* Part 3 — Reading: the story */
  {
    id: 'mt7-p3-story', kind: 'grammar-gap', bg: bgStreet, title: 'Part 3 — The story',
    teacher: 'Part 3 — Reading the story (5). Read and choose the missing word. Pass: 4 of 5.',
    rounds: [
      { before: 'Bibi is tired because it is', after: '.', choices: ['early', 'dark'], answer: 'early', img: bibiPage(2) },
      { before: 'Big Bob has', after: 'three eyes.', choices: ['got', 'is'], answer: 'got', img: bibiPage(5) },
      { before: 'Leo is', after: 'a green scarf.', choices: ['wearing', 'got'], answer: 'wearing', img: bibiPage(8) },
      { before: 'Bibi is sad', after: 'she is tiny.', choices: ['because', 'and'], answer: 'because', img: bibiPage(7) },
      { before: 'Bibi is', after: 'because it is a party for her!', choices: ['excited', 'bored'], answer: 'excited', img: bibiPage(11) },
    ],
  },
  {
    id: 'mt7-break', kind: 'prea1', teacher: 'Brain break between the parts: stretch and breathe.',
    scene: {
      id: 'mt7-break', kind: 'tpr-actions', mode: 'break', bg: bgStreet, who: 'pip', teacher: 'Stretch!',
      rounds: [
        { line: 'Stretch up tall like Big Bob!', emoji: '\u{1F64C}' },
        { line: 'Now be tiny like Bibi!', emoji: '\u{1F90F}' },
        { line: 'Breathe and count to five!', emoji: '\u{1F590}\u{FE0F}' },
      ],
    },
  },
  /* Part 4 — Speaking */
  {
    id: 'mt7-p4-portrait', kind: 'join-stage', bg: bgStreet, teacher: 'Part 4a — Speaking (3 points): the Monster Portrait. The student describes a monster (their own drawing or one from Guess Who) in 4 sentences: looks (has got), size or colour, clothes (is wearing), feeling + because. 1 point for has got / is wearing used right, 1 for the feeling with because, 1 for four sentences alone.', cast: ['bibi'],
    turns: [
      { who: 'bibi', line: 'Tell me about your monster!' },
      { who: 'student', line: 'My monster is … . It has got … .' },
      { who: 'student', line: 'It is wearing … .' },
      { who: 'student', line: 'It is … because … .' },
      { who: 'bibi', line: 'What a great monster!' },
    ],
  },
  {
    id: 'mt7-p4-ask', kind: 'join-stage', bg: bgGame, teacher: 'Part 4b — Speaking (2 points): the student asks Bibi 2 questions about HER secret monster (Has it got…? / Is it wearing…? / Is it…?). Pass for Part 4: 4 of 5 points.', cast: ['bibi'],
    turns: [
      { who: 'bibi', line: 'I have a secret monster. Ask me two questions!' },
      { who: 'student', line: 'Has your monster got … ?' },
      { who: 'bibi', line: 'Yes, it has!' },
      { who: 'student', line: 'Is your monster wearing … ?' },
      { who: 'bibi', line: 'No, it isn’t!' },
    ],
  },
  { id: 'mt7-can-3', kind: 'meet', focus: ['describe'], bg: bibiPage(8), who: 'mia', cardSide: 'left', teacher: 'Can-do: the student describes a monster friend with has got and is wearing — tick it.', line: 'I can describe a monster friend!', repeat: 'He’s got long horns. He’s wearing a hat.' },
  /* Part 5 — Reading aloud */
  {
    id: 'mt7-p5-read-aloud', kind: 'reader', bg: bgStreet, title: 'Part 5 — Read it aloud!', doneLine: 'You read it all by yourself!',
    teacher: 'Part 5 — Reading aloud (5 points: every word read, then fluency). Skip the listening: tap “My turn to read” at once. Pass: 4 of 5.',
    pages: [BIBI_BAD_DAY[6], BIBI_BAD_DAY[8]],
  },
  { id: 'mt7-can-4', kind: 'meet', focus: ['story'], bg: bibiPage(12), who: 'bibi', cardSide: 'left', teacher: 'Can-do: the student reads a page of the story and says how Bibi feels at the end — tick it.', line: 'I can read my story and say how I feel!', repeat: 'Bibi is happy. It is a good day!' },
  { id: 'mt7-echo-champ', kind: 'echo', bg: bibiPage(12), who: 'bibi', textSide: 'top', teacher: 'Say it proudly with Bibi!', word: 'I can do it! Monster expert!' },
  { id: 'mt7-i-can', kind: 'meet', focus: ['Unit 5'], bg: bibiPage(12), who: 'bibi', cardSide: 'left', teacher: 'Check: any part below 4 of 5? Play it again next lesson (Practise again). Then the trophy!', line: 'I can show everything from Unit 5!', repeat: 'I’m a monster expert!' },
  {
    id: 'mt7-sticker', kind: 'prea1', teacher: 'The Unit 5 trophy! The student opens the pack and puts the trophy sticker in their Sticker Book.',
    scene: {
      id: 'mt7-sticker', kind: 'sticker-reward', bg: bibiPage(12), who: 'pip', teacher: 'The Unit 5 trophy!',
      line: 'You passed the Boss Test! Here is your Unit 5 trophy — and piece 4 of the Golden Compass!',
      sticker: { img: item('medal-rainbow'), label: 'Golden Compass piece 4' },
    },
  },
  petPal('mt7-pet-pal', 0, 'You are a monster expert! I want a medal too!', [{ label: 'medal', img: item('hero-medal') }, { label: 'hat', img: WEAR.hat }, { label: 'leaf', img: item('leaf') }], 0, 'A medal! I’m so happy!'),
  {
    id: 'mt7-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'mt7-home-mission', kind: 'home-mission', bg: bgStreet, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Your child finished Unit 5: feelings and why ("I\'m scared because it\'s dark."), looks ("He has got three eyes."), clothes ("She is wearing glasses.") and the story "Bibi\'s Bad Day". Next comes the A1 Halfway Check. Ask your child to describe a friend to you in English.',
      steps: [
        { emoji: '\u{1F3C5}', say: 'Show your medal to your family.' },
        { emoji: '\u{1F9D1}', say: 'Describe a friend: He has got… He is wearing…' },
        { emoji: '\u{1F4D6}', say: 'Read Bibi’s story again.' },
      ],
    },
  },
  /* Practise again — for any part below the pass mark, or as extra time */
  {
    id: 'mt7-pa-match', kind: 'picture-match', look: 'frames', prompt: 'Practise again: read and match',
    teacher: 'Practise again (Part 2): read each sentence and drag it under its picture.',
    items: [
      { word: 'She’s scared.', img: BIBI.scared },
      { word: 'He’s very tall.', img: item('big-bob') },
      { word: 'She’s wearing glasses.', img: WEAR.glasses },
      { word: 'Long horns!', img: PART.hornsLong },
    ],
    bg: bgStreet,
  },
  {
    id: 'mt7-pa-build', kind: 'sentence-build', bg: bgStreet, teacher: 'Practise again (Part 3): put the words in order, then read the sentence.',
    rounds: [
      { words: ['She', 'is', 'sad', 'because', 'she', 'is', 'tiny.'], emoji: '\u{1F622}' },
      { words: ['He', 'has', 'got', 'three', 'eyes.'], emoji: '\u{1F440}' },
      { words: ['Leo', 'is', 'wearing', 'a', 'scarf.'], emoji: '\u{1F9E3}' },
    ],
  },
  {
    id: 'mt7-pa-memory', kind: 'memory', bg: bgGame, teacher: 'Practise again (Part 4): find each question and its answer — read both aloud.',
    pairs: [
      { id: 'feel', label: 'How do you feel?', match: 'I’m happy!', emoji: '\u{1F604}' },
      { id: 'why', label: 'Why are you scared?', match: 'Because it’s dark.', emoji: '\u{1F311}' },
      { id: 'got', label: 'Has it got horns?', match: 'Yes, it has.', emoji: '\u{1F47E}' },
      { id: 'wear', label: 'Is she wearing a hat?', match: 'No, she isn’t.', emoji: '\u{1F3A9}' },
    ],
  },
  {
    id: 'mt7-pa-chat', kind: 'chat-chain', bg: bgStreet, partner: 'leo', title: 'Practise again: chat with Leo',
    intro: 'Hi! Let’s talk about monsters!',
    teacher: 'Practise again (Part 4): Leo talks, the student picks the reply that fits and SAYS it, then taps “I said it”.',
    turns: [
      { who: 'leo', line: 'How are you today?' },
      { who: 'student', line: 'I’m happy because it’s sunny!', wrong: ['I’m wearing happy.', 'I has got happy.'] },
      { who: 'leo', line: 'What does your monster look like?' },
      { who: 'student', line: 'It has got two big eyes.', wrong: ['It is got two eyes.', 'It wearing eyes.'] },
      { who: 'leo', line: 'Ask me a question!' },
      { who: 'student', line: 'Is your monster wearing a hat?', wrong: ['Your monster wearing a hat.', 'Has your monster wearing a hat?'] },
    ],
  },
  {
    id: 'mt7-pa-parcel', kind: 'pass-parcel', bg: bibiPage(12), who: 'bibi', title: 'Pass the Present!',
    teacher: 'Practise again (all parts): every right answer tears one layer off the present. What is inside?',
    rounds: [
      { ask: 'Why is Bibi tired?', choices: ['Because it is early.', 'Because it is a party.', 'She tired.'], answer: 0, img: bibiPage(2) },
      { ask: 'Who is Bea?', choices: ['Bibi’s sister.', 'Bibi’s teacher.', 'A big monster.'], answer: 0, img: bibiPage(6) },
      { ask: 'Is Big Bob short?', choices: ['No, he isn’t. He’s tall.', 'Yes, he is.', 'He has short.'], answer: 0, img: bibiPage(5) },
      { ask: 'What is Mia wearing?', choices: ['She is wearing glasses.', 'She has glasses wearing.', 'She is a scarf.'], answer: 0, img: bibiPage(8) },
      { ask: 'How is Bibi at the end?', choices: ['She is happy.', 'She is scared.', 'She is bored.'], answer: 0, img: bibiPage(12) },
    ],
    prize: { img: BIBI.happy, label: 'Happy Bibi' },
    doneLine: 'You opened the present! It’s happy Bibi!',
  },
  {
    id: 'mt7-pa-twister', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bibiPage(12), who: 'pip', focus: 'ee',
    teacher: 'Practise again (sounds): the unit’s long ee — slow, faster, then monster speed!',
    line: 'Happy Bibi eats three green peas.',
  },
  goodbyeSong('mt7-goodbye-song', bibiPage(12)),
  { id: 'mt7-finale', kind: 'finale', bg: bibiPage(12), who: 'bibi', line: 'You finished Unit 5 and found piece 4 of the Golden Compass! Next: the Halfway Check… \u{1F9ED}' },
];

/* =============================================================================
 * A1 Halfway Check "Explorer Halfway" — after Unit 5, its own lesson (U5 · L8)
 * docs/assessment/a1-assessment-plan.md §2-4: five sections over Units 1-5 — Listening words (8), Listening sentences (8),
 * Reading & writing (8, read, not heard), Sounds (6), Speaking (4 prompts, rated 0-3 by the teacher). Stars per section;
 * Go on (every section 3+ stars and 17+ of 25) / Go on with support / Review first (levelTestScoring.ts, checkpoint mode).
 * The child is never told "failed": everyone gets the halfway medal.
 * ========================================================================= */
export const LESSON_A1U5L8_TITLE = 'A1 Halfway Check: Explorer Halfway';
export const LESSON_A1U5L8_OBJECTIVE = 'A1 Halfway Check (after Unit 5): show what you learned in Units 1–5 — greetings and numbers, animals and can, weather and directions, food and likes, feelings, looks and clothes — by listening, reading, sounding out words and talking with your teacher.';

const WTS = (n: string) => `${WT}/sprites/${n}`;
const yesNo = [{ label: 'Yes', text: 'Yes' }, { label: 'No', text: 'No' }];

export const LESSON_A1U5L8_SCENES: Scene[] = [
  { id: 'mt8-title', kind: 'title-card', bg: bgStreet, level: 'A1', unit: 'Halfway Check', lessonLabel: 'Units 1–5', title: 'Explorer Halfway', subtitle: 'Show what you know!', cta: '\u{1F9ED} I’M READY!' },
  {
    // Remember? (owner, 2026-10-07): a calm warm-up of Unit 5 — not scored. Click mode (L7 used shadow).
    id: 'mt8-recall-warmup', kind: 'recall-warmup', bg: bgStreet, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Unit 5 · Monster Town',
    teacher: 'A calm warm-up before the check (not scored): Pip says a feeling, the child finds Bibi’s face.',
    items: [
      { word: 'happy', say: 'Bibi is happy!', img: BIBI.happy },
      { word: 'scared', say: 'Bibi is scared!', img: BIBI.scared },
      { word: 'excited', say: 'Bibi is excited!', img: BIBI.excited },
    ],
  },
  {
    id: 'mt8-intro', kind: 'cinematic', bg: bgStreet, title: 'Explorer Halfway', subtitle: 'Five parts — take your time', narrator: 'bibi',
    script: [
      { who: 'bibi', line: 'You are halfway, explorer!' },
      { who: 'pip', line: 'Listen, read, sound it out — then talk with your teacher.' },
    ],
    cta: '\u{1F680} Let’s go!',
  },
  {
    id: 'mt8-test', kind: 'prea1',
    teacher: 'A1 Halfway Check (Units 1–5). Please do not help with the answers: in Parts 1, 2 and 4 the child listens (🔊 repeats); Part 3 is READ, not heard. In Part 5 ask each card, listen, and tap a score 0–3 on YOUR screen. At the end check the result and press "Confirm & save result".',
    scene: {
      id: 'mt8-test', kind: 'level-test', bg: bgClass, who: 'pip',
      teacher: 'Five parts. One try each. Then talk with your teacher.',
      testKey: 'a1-halfway-check', title: 'A1 Halfway Check', level: 'A1', mode: 'checkpoint',
      hero: wtSpr('pip'), medal: item('medal-rainbow'),
      certificate: { title: 'Great job, explorer!', line: 'You are halfway there! Here is your explorer medal!' },
      sections: [
        {
          key: 'words', label: 'Listening — words', icon: '\u{1F442}', intro: 'Listen and find the picture!',
          items: [
            { ask: 'Find: elephant!', reply: 'An elephant!', answer: 1, options: [{ label: 'lion', img: item('lion') }, { label: 'elephant', img: item('elephant') }, { label: 'snake', img: item('snake') }] },
            { ask: 'Find: monkey!', reply: 'A monkey!', answer: 2, options: [{ label: 'frog', img: item('frog') }, { label: 'bird', img: item('bird') }, { label: 'monkey', img: item('coco-cheer') }] },
            { ask: 'Find: rainy!', reply: 'Rainy!', answer: 0, options: [{ label: 'rainy', img: item('rain') }, { label: 'sunny', img: item('sun') }, { label: 'windy', img: item('wind') }] },
            { ask: 'Find: rocket!', reply: 'A rocket!', answer: 1, options: [{ label: 'star', img: item('star-gold') }, { label: 'rocket', img: item('rocket') }, { label: 'moon', img: item('moon') }] },
            { ask: 'Find: sandwich!', reply: 'A sandwich!', answer: 2, options: [{ label: 'soup', img: item('soup') }, { label: 'chips', img: item('chips') }, { label: 'sandwich', img: item('sandwich') }] },
            { ask: 'Find: grapes!', reply: 'Grapes!', answer: 0, options: [{ label: 'grapes', img: item('grapes') }, { label: 'cheese', img: item('cheese') }, { label: 'bread', img: item('bread') }] },
            { ask: 'Find: scared!', reply: 'Scared!', answer: 1, options: [{ label: 'happy', img: BIBI.happy }, { label: 'scared', img: BIBI.scared }, { label: 'bored', img: BIBI.bored }] },
            { ask: 'Find: glasses!', reply: 'Glasses!', answer: 2, options: [{ label: 'scarf', img: WEAR.scarf }, { label: 'boots', img: WEAR.boots }, { label: 'glasses', img: WEAR.glasses }] },
          ],
        },
        {
          key: 'sentences', label: 'Listening — sentences', icon: '\u{1F4AC}', intro: 'Listen to the sentence and find it!',
          items: [
            { ask: 'How old are you? I’m seven.', reply: 'Seven!', answer: 0, options: [{ label: '7', text: '7' }, { label: '11', text: '11' }, { label: '17', text: '17' }] },
            { ask: 'He is happy. Who is it?', reply: 'Pip! He is happy.', answer: 1, options: [{ label: 'Mia, sad', img: WTS('mia-sad-v2.png') }, { label: 'Pip, happy', img: WTS('pip-happy-v2.png') }, { label: 'Leo, tired', img: WTS('leo-tired-v2.png') }] },
            { ask: 'It can swim, but it can’t fly. What is it?', reply: 'A fish!', answer: 2, options: [{ label: 'bird', img: item('bird') }, { label: 'monkey', img: item('coco-cheer') }, { label: 'fish', img: item('fish') }] },
            { ask: 'It’s cloudy today.', reply: 'Cloudy!', answer: 1, options: [{ label: 'snowy', img: item('snow') }, { label: 'cloudy', img: item('cloud') }, { label: 'sunny', img: item('sun') }] },
            { ask: 'I like pizza! Some pizza, please!', reply: 'Pizza!', answer: 0, options: [{ label: 'pizza', img: item('pizza-slice') }, { label: 'salad', img: item('salad') }, { label: 'rice', img: item('rice') }] },
            { ask: 'She is tired because it is early.', reply: 'Tired!', answer: 2, options: [{ label: 'excited', img: BIBI.excited }, { label: 'surprised', img: BIBI.surprised }, { label: 'tired', img: BIBI.tired }] },
            { ask: 'He is very tall. He has got three eyes.', reply: 'Big Bob!', answer: 0, options: [{ label: 'Big Bob', img: item('big-bob') }, { label: 'Bea', img: item('bea') }, { label: 'Bibi', img: BIBI.happy }] },
            { ask: 'She is wearing boots.', reply: 'Boots!', answer: 1, options: [{ label: 'hat', img: WEAR.hat }, { label: 'boots', img: WEAR.boots }, { label: 'scarf', img: WEAR.scarf }] },
          ],
        },
        {
          key: 'reading', label: 'Reading & writing', icon: '\u{1F4D6}', intro: 'Now read it yourself! Read and choose.',
          items: [
            { read: true, img: item('lion'), ask: 'It’s a lion. It’s big and yellow.', reply: 'Yes!', answer: 0, options: yesNo },
            { read: true, img: item('soup'), ask: 'It’s pizza.', reply: 'No! It’s soup.', answer: 1, options: yesNo },
            { read: true, img: item('bird'), ask: 'A bird can ___ .', reply: 'A bird can fly.', answer: 0, options: [{ label: 'fly', text: 'fly' }, { label: 'swim', text: 'swim' }] },
            { read: true, img: item('snow'), ask: 'It’s ___ and snowy.', reply: 'It’s cold and snowy.', answer: 1, options: [{ label: 'hot', text: 'hot' }, { label: 'cold', text: 'cold' }] },
            { read: true, img: item('grapes'), ask: 'Do you like grapes? Yes, I ___ .', reply: 'Yes, I do.', answer: 0, options: [{ label: 'do', text: 'do' }, { label: 'am', text: 'am' }] },
            { read: true, img: BIBI.sad, ask: 'Bibi is sad ___ she is tiny.', reply: 'Bibi is sad because she is tiny.', answer: 1, options: [{ label: 'and', text: 'and' }, { label: 'because', text: 'because' }] },
            { read: true, img: item('big-bob'), ask: 'He ___ got three eyes.', reply: 'He has got three eyes.', answer: 0, options: [{ label: 'has', text: 'has' }, { label: 'is', text: 'is' }] },
            { read: true, img: WEAR.scarf, ask: 'Leo is ___ a green scarf.', reply: 'Leo is wearing a green scarf.', answer: 1, options: [{ label: 'got', text: 'got' }, { label: 'wearing', text: 'wearing' }] },
          ],
        },
        {
          key: 'sounds', label: 'Sounds', icon: '\u{1F524}', intro: 'Listen to the sounds!',
          items: [
            { ask: 'What word is it?', blend: ['f', 'r', 'o', 'g'], reply: 'Frog!', answer: 2, options: [{ label: 'fish', img: item('fish') }, { label: 'bird', img: item('bird') }, { label: 'frog', img: item('frog') }] },
            { ask: 'What word is it?', blend: ['f', 'i', 'sh'], reply: 'Fish!', answer: 0, options: [{ label: 'fish', img: item('fish') }, { label: 'frog', img: item('frog') }, { label: 'snake', img: item('snake') }] },
            { ask: 'What word is it?', blend: ['sh', 'ee', 'p'], reply: 'Sheep!', answer: 1, options: [{ label: 'bee', img: item('bee') }, { label: 'sheep', img: item('sheep') }, { label: 'leaf', img: item('leaf') }] },
            { ask: 'What word is it?', blend: ['l', 'ea', 'f'], reply: 'Leaf!', answer: 2, options: [{ label: 'sheep', img: item('sheep') }, { label: 'tea', img: item('tea') }, { label: 'leaf', img: item('leaf') }] },
            { ask: 'Cheese. Which sound?', reply: 'Ch! Cheese!', answer: 0, options: [{ label: 'ch', text: 'ch' }, { label: 'sh', text: 'sh' }, { label: 'th', text: 'th' }] },
            { ask: 'Happy. The y says…', reply: 'Ee! Happy!', answer: 1, options: [{ label: 'y', text: 'y' }, { label: 'ee', text: 'ee' }, { label: 'a', text: 'a' }] },
          ],
        },
      ],
      speaking: {
        key: 'speaking', label: 'Speaking', icon: '\u{1F3A4}', intro: 'Now talk with your teacher!',
        prompts: [
          { img: item('elephant'), say: 'Tell me about this animal. What can it do?', prompt: 'Describe a jungle animal in 4 sentences', model: 'It’s an elephant. It’s big and grey. It can walk. It can’t fly.' },
          { img: item('frog'), say: 'I have a secret animal. Ask me a question with can!', prompt: 'Ask one “Can it…?” question', model: 'Can it jump?' },
          { img: item('planet-ice'), say: 'What’s the weather like on Planet Ice?', prompt: 'Weather report', model: 'It’s cold and snowy on Planet Ice.' },
          { img: item('big-bob'), say: 'Describe your monster friend. How does he feel? Why?', prompt: 'Monster friend: has got, wearing, feeling + because', model: 'He has got three eyes. He is wearing a hat. He is happy because it is a party.' },
        ],
      },
    },
  },
  { id: 'mt8-echo', kind: 'echo', bg: bgStreet, who: 'bibi', textSide: 'top', teacher: 'Say it proudly with Bibi — whatever the result!', word: 'I’m halfway! I’m an explorer!' },
  {
    id: 'mt8-sticker', kind: 'prea1', teacher: 'Sticker time! The halfway medal goes in the Sticker Book — for every child, whatever the result.',
    scene: {
      id: 'mt8-sticker', kind: 'sticker-reward', bg: bgStreet, who: 'pip', teacher: 'Sticker time!',
      line: 'You are halfway, super explorer! Here is your medal!',
      sticker: { img: item('medal-rainbow'), label: 'Halfway medal' },
    },
  },
  {
    id: 'mt8-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. The teacher’s report has the result for the family.',
    scene: {
      id: 'mt8-home-mission', kind: 'home-mission', bg: bgStreet, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child did the A1 Halfway Check (Units 1–5): listening, reading, sounds and speaking. Your child\'s teacher will send the result and what comes next. Ask your child to tell you about an animal in English.',
      steps: [
        { emoji: '\u{1F3C5}', say: 'Show your medal to your family.' },
        { emoji: '\u{1F418}', say: 'Tell your family about an animal: It can… It can’t…' },
        { emoji: '\u{1F4D6}', say: 'Read a story from Units 1 to 5 again.' },
      ],
    },
  },
  goodbyeSong('mt8-goodbye-song', bgStreet),
  { id: 'mt8-finale', kind: 'finale', bg: bgStreet, who: 'pip', line: 'Well done, explorer! You are halfway! On to the next adventure!' },
];
