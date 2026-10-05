import type { Scene } from './scenes';

/* =============================================================================
 * SAMPLE (comparison): the Academy lesson "A1 · Unit 1 · Lesson 1 — Episode 1: My Name Is…" rebuilt on the PLAYGROUND
 * scene player (Welcome Town engine), so the owner can compare the two players side by side.
 *
 * Same objective and words as the Academy deck (hello, goodbye, name; I am / My name is / What is your name?; spelling a
 * name), same Academy Cast Vault characters (Ava, Theo, Nova) and the same Canva pictures from public/academy/a1u1l1/.
 * It is NOT registered in the curriculum or any lesson registry: it only plays at /playground-scene/sample-academy-a1-1.
 *
 * Playground rules honoured: every character is painted into the full-bleed picture (no floating cut-outs); voices go
 * through VOICE_KEY (approved American voices; clips are baked later, silent until then); one new idea per scene.
 * ========================================================================== */

const A = '/academy/a1u1l1';
const bgGate = `${A}/gate.webp`;
const bgClass = `${A}/classroom.webp`;
const bgCourt = `${A}/bg-warmup.webp`;
const bgHall = `${A}/bg-vocab.webp`;
const bgLibrary = `${A}/bg-reading.webp`;

export const ACADEMY_SAMPLE_TITLE = 'Episode 1: My Name Is…';
export const ACADEMY_SAMPLE_OBJECTIVE = 'Say hello and goodbye, ask "What is your name?", answer "I am… / My name is…", and spell your name.';

export const ACADEMY_SAMPLE_SCENES: Scene[] = [
  { id: 'as-title', kind: 'title-card', bg: bgGate, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 1', title: 'Episode 1: My Name Is…', subtitle: 'Say hello and tell people your name', cta: '\u{1F44B} LET’S GO!' },
  {
    id: 'as-intro', kind: 'cinematic', bg: bgGate, title: 'The New Student', subtitle: 'Your first day at Starline Academy', narrator: 'ava',
    script: [
      { who: 'ava', line: 'Hello! I am Ava. What is your name?' },
      { who: 'nova', line: 'Beep! Name check!' },
      { who: 'theo', line: 'Hi! I am Theo. Welcome to Starline!' },
    ],
    cta: 'MEET THEM',
  },
  { id: 'as-meet-ava', kind: 'meet', focus: ['Hello'], bg: bgGate, who: 'ava', cardSide: 'right', teacher: 'Tap Ava. Then wave and say hello!', line: 'Hello! I am Ava.', repeat: 'Hello!' },
  { id: 'as-meet-theo', kind: 'meet', focus: ['name'], bg: bgGate, who: 'theo', cardSide: 'left', teacher: 'Tap Theo. Then say his name!', line: 'Hi! My name is Theo. What is your name?', repeat: 'My name is…' },
  {
    id: 'as-choice-hello', kind: 'choice', bg: bgGate, who: 'ava', teacher: 'Ava says “Hello!” What do you say?',
    prompt: 'Ava says “Hello!” What do you say?',
    options: [
      { label: 'Hello! I am …', emoji: '\u{1F44B}', correct: true },
      { label: 'Goodbye!', emoji: '\u{1F6AA}' },
      { label: 'Thank you!', emoji: '\u{1F64F}' },
    ],
  },
  {
    id: 'as-true-false', kind: 'true-false', bg: bgCourt, teacher: 'Think about the story. Tap yes or no!',
    rounds: [
      { who: 'ava', statement: 'Ava says: “Hello! I am Ava.”', isTrue: true },
      { who: 'theo', statement: 'Theo says: “I am Ava.”', isTrue: false },
      { who: 'nova', statement: 'Nova is a small owl.', isTrue: true },
    ],
  },
  {
    id: 'as-roleplay', kind: 'roleplay', bg: bgGate, teacher: 'Listen to Ava and Theo. Say each line after them!', cast: ['ava', 'theo'],
    script: [
      { who: 'ava', line: 'Hello! I am Ava. What is your name?', repeat: true },
      { who: 'theo', line: 'Hi, Ava! My name is Theo.', repeat: true },
      { who: 'ava', line: 'Nice to meet you, Theo!', repeat: true },
      { who: 'theo', line: 'Goodbye, Ava! See you tomorrow!', repeat: true },
    ],
  },
  {
    id: 'as-sentence', kind: 'sentence-build', bg: bgClass, teacher: 'Put the words in order to say it!', side: 'top',
    rounds: [
      { words: ['I', 'am', 'Ava'], emoji: '\u{1F60A}' },
      { words: ['My', 'name', 'is', 'Theo'], emoji: '\u{1F60E}' },
      { words: ['What', 'is', 'your', 'name?'], emoji: '\u{1F4AC}' },
    ],
  },
  {
    id: 'as-choice-name', kind: 'choice', bg: bgHall, who: 'vee', teacher: 'Vee asks: “What is your name?” What do you say?',
    prompt: 'Vee asks: “What is your name?”',
    options: [
      { label: 'My name is Mia.', emoji: '\u{1F60A}', correct: true },
      { label: 'Goodbye, Vee!', emoji: '\u{1F6AA}' },
      { label: 'See you tomorrow!', emoji: '\u{1F319}' },
    ],
  },
  {
    id: 'as-name-badge', kind: 'name-badge', bg: bgLibrary, who: 'nova', teacher: 'Nova reads the name tags. Tap the letters in order!',
    rounds: [
      { name: 'Ava', choices: ['A', 'V', 'E', 'O'] },
      { name: 'Theo', choices: ['T', 'H', 'E', 'O'] },
      { name: 'Mia', choices: ['M', 'I', 'A', 'E'] },
    ],
  },
  {
    id: 'as-your-turn', kind: 'join-stage', bg: bgGate, teacher: 'Your turn! When it says YOU, say it out loud.', cast: ['ava', 'theo'],
    turns: [
      { who: 'ava', line: 'Hello! What is your name?' },
      { who: 'student', line: 'Hello! My name is …' },
      { who: 'theo', line: 'Nice to meet you!' },
      { who: 'student', line: 'Nice to meet you, too!' },
      { who: 'ava', line: 'Now you ask! What is Theo’s name?' },
      { who: 'student', line: 'What is your name?' },
      { who: 'theo', line: 'My name is Theo!' },
    ],
  },
  { id: 'as-goodbye', kind: 'meet', focus: ['Goodbye'], bg: bgGate, who: 'theo', cardSide: 'left', teacher: 'Time to go! Wave and say goodbye to Theo.', line: 'Goodbye! See you tomorrow!', repeat: 'Goodbye!' },
  { id: 'as-finale', kind: 'finale', bg: bgGate, who: 'ava', cast: ['ava', 'theo', 'nova'], line: 'You said hello, told us your name and spelled it! Next episode: Meet My Friends!' },
];
