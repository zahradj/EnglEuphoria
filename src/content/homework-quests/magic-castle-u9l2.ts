import type { HomeworkQuest } from './types';
import { HW_A1U9L1_PUZZLE } from '../playground-library/magic-castle/homework';

const S = '/magic-castle/scenes';
const K = '/magic-castle/stickers';
const WIDE = 1376 / 768;
const TOUR = `${S}/bg-castle-bedroom-tour.png`;
const NO_LAMP = `${S}/bg-castle-bedroom-nolamp.png`;

/** The four new things on bg-castle-bedroom-tour.png (percent of the art),
 *  measured so the pieces don't overlap — used by the puzzles and taps. */
const THING = {
  door: { x: 5, y: 8, w: 26, h: 77 },
  window: { x: 39, y: 7, w: 16, h: 49 },
  lamp: { x: 56, y: 42, w: 9, h: 19 },
  bed: { x: 65, y: 9, w: 35, h: 77 },
} as const;
const ROOM = Object.fromEntries(HW_A1U9L1_PUZZLE.map((p) => [p.room, { x: p.x, y: p.y, w: p.w, h: p.h }]));

/**
 * Magic Castle, A1 Unit 9 Lesson 2 — "Cat-cat's Bedroom Quest".
 * Practises bed, lamp, door, window, "there is / there is no", Lesson 1's
 * rooms (spiral review) and the L / W sounds. Harder than the lesson:
 * audio-only prompts, riddles instead of names, distractor words, a timed
 * twister and a new reading text. Every line is a recorded clip (baked by
 * scripts/generate-voice-cache.mjs via allQuestLines) — never the browser
 * voice (CLAUDE.md "Voice").
 */
export const QUEST_MAGIC_CASTLE_U9L2: HomeworkQuest = {
  id: 'magic-castle-u9l2',
  title: 'Cat-cat’s Bedroom Quest',
  subtitle: 'Magic Castle · A1 Unit 9 · Lesson 2',
  level: 'A1',
  lessonKey: 'castle-rich-9-2',
  theme: { accent: '#f5c542', accent2: '#c0392b', night: true, mapImg: `${S}/bg-castle-exterior.png`, guide: `${S}/sticker-catcat.png`, walker: `${S}/sticker-wim.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    {
      kind: 'tap-hotspot', name: 'Castle Review', icon: '🏰', intro: 'Remember the castle? Listen. Where is Cat-cat? Tap the room.',
      img: `${S}/bg-castle-overview.png`, aspect: WIDE, marker: `${S}/sticker-catcat.png`,
      spots: HW_A1U9L1_PUZZLE.map((p) => ({ label: p.room, box: ROOM[p.room] })),
      rounds: [
        { target: 'kitchen', line: 'Cat-cat is in the kitchen.' },
        { target: 'bathroom', line: 'Cat-cat is in the bathroom.' },
        { target: 'hallway', line: 'Cat-cat is in the hallway.' },
        { target: 'living room', line: 'Cat-cat is in the living room.' },
        { target: 'dining room', line: 'Cat-cat is in the dining room.' },
        { target: 'bedroom', line: 'Cat-cat is in the bedroom.' },
      ],
    },
    {
      kind: 'scene-puzzle', name: 'Bedroom Puzzle', icon: '🧩', intro: 'Listen, and build Cat-cat’s bedroom, piece by piece!',
      img: TOUR, aspect: WIDE,
      pieces: [
        { label: 'bed', box: THING.bed, line: 'Find the bed.' },
        { label: 'window', box: THING.window, line: 'Find the window.' },
        { label: 'door', box: THING.door, line: 'Find the door.' },
        { label: 'lamp', box: THING.lamp, line: 'Find the lamp.' },
      ],
    },
    {
      kind: 'scene-puzzle', name: 'Listen & Build', icon: '🎧', intro: 'Listen to the whole sentence. Which piece is it?',
      img: TOUR, aspect: WIDE, numbered: true,
      pieces: [
        { label: 'window', box: THING.window, line: 'Number one. There is a big window in the bedroom.' },
        { label: 'lamp', box: THING.lamp, line: 'Number two. There is a little lamp by the bed.' },
        { label: 'door', box: THING.door, line: 'Number three. There is a wooden door in the bedroom.' },
        { label: 'bed', box: THING.bed, line: 'Number four. There is a red bed in the bedroom.' },
      ],
    },
    {
      kind: 'picture-choice', name: 'Riddle Room', icon: '❓', intro: 'Listen to the riddle. What is it? Tap the picture.',
      img: TOUR,
      rounds: [
        { line: 'You sleep in it.', answer: 'bed', options: [{ label: 'bed', src: `${K}/bed.png` }, { label: 'door', src: `${K}/door.png` }, { label: 'chair', src: `${K}/chair.png` }] },
        { line: 'It gives light at night.', answer: 'lamp', options: [{ label: 'window', src: `${K}/window.png` }, { label: 'lamp', src: `${K}/lamp.png` }, { label: 'table', src: `${K}/table.png` }] },
        { line: 'You can look out of it.', answer: 'window', options: [{ label: 'door', src: `${K}/door.png` }, { label: 'bed', src: `${K}/bed.png` }, { label: 'window', src: `${K}/window.png` }] },
        { line: 'You open it and walk in.', answer: 'door', options: [{ label: 'door', src: `${K}/door.png` }, { label: 'lamp', src: `${K}/lamp.png` }, { label: 'window', src: `${K}/window.png` }] },
        { line: 'You sit on it.', answer: 'chair', options: [{ label: 'bed', src: `${K}/bed.png` }, { label: 'chair', src: `${K}/chair.png` }, { label: 'pot', src: `${K}/pot.png` }] },
        { line: 'You cook in it.', answer: 'pot', options: [{ label: 'pot', src: `${K}/pot.png` }, { label: 'lamp', src: `${K}/lamp.png` }, { label: 'table', src: `${K}/table.png` }] },
      ],
    },
    {
      kind: 'true-false', name: 'The Lost Lamp', icon: '🪔', intro: 'Look at the picture. Listen. True or false?',
      rounds: [
        { img: TOUR, line: 'There is a lamp in the bedroom.', isTrue: true },
        { img: NO_LAMP, line: 'There is a lamp in the bedroom.', isTrue: false },
        { img: NO_LAMP, line: 'There is no lamp in the bedroom.', isTrue: true },
        { img: NO_LAMP, line: 'There is no window in the bedroom.', isTrue: false },
        { img: TOUR, line: 'There is a table in the bedroom.', isTrue: false },
        { img: NO_LAMP, line: 'There is a door in the bedroom.', isTrue: true },
      ],
    },
    {
      kind: 'sentence-builder', name: 'Sentence Builder', icon: '🧱', intro: 'Look and listen. Build the sentence.',
      rounds: [
        { img: TOUR, line: 'There is a bed in the bedroom.', extra: ['kitchen', 'chair'] },
        { img: TOUR, line: 'The lamp is by the bed.', extra: ['window', 'in'] },
        { img: NO_LAMP, line: 'There is no lamp in the bedroom.', extra: ['a', 'door'] },
        { img: `${S}/bg-castle-catcat-pip-door.png`, line: 'Cat-cat is at the door.', extra: ['window', 'Pip'] },
      ],
    },
    {
      kind: 'sound-choice', name: 'L or W?', icon: '👂', intro: 'Listen. Does it start with l, or w?', img: `${S}/bg-castle-wim.png`,
      choices: ['l', 'w'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'lamp', answer: 'l', picture: `${K}/lamp.png` },
        { word: 'window', answer: 'w', picture: `${K}/window.png` },
        { word: 'lion', answer: 'l', emoji: '🦁' },
        { word: 'web', answer: 'w', emoji: '🕸️' },
        { word: 'leaf', answer: 'l', emoji: '🍃' },
        { word: 'wand', answer: 'w', emoji: '🪄' },
        { word: 'leg', answer: 'l', emoji: '🦵' },
        { word: 'wizard', answer: 'w', emoji: '🧙' },
      ],
    },
    {
      kind: 'twister', name: 'Wobbly Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!',
      img: `${S}/bg-castle-wim.png`, line: 'Wim’s little lamp wobbles by the window.', seconds: 40, focus: 'l|w',
      sayIt: 'Now say it slow, faster, and at magic speed!',
    },
    {
      kind: 'reading', name: 'Night Story', icon: '📖', intro: 'Read the story. Then answer the questions.', img: TOUR, focus: 'l|w',
      sentences: [
        'Cat-cat has a little bedroom.',
        'There is a big bed and a window.',
        'There is a lamp by the bed.',
        'At night, the lamp is on.',
        'Wim looks in the window and waves.',
        'Cat-cat waves too. “Hello, Wim!”',
      ],
      questions: [
        { q: 'What is by the bed?', options: ['A door', 'A lamp', 'A table'], answer: 'A lamp' },
        { q: 'When is the lamp on?', options: ['At night', 'In the kitchen', 'In the bath'], answer: 'At night' },
        { q: 'Who looks in the window?', options: ['Pip', 'Cat-cat', 'Wim'], answer: 'Wim' },
      ],
    },
    {
      kind: 'treasure', name: 'Treasure', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!',
      img: `${S}/bg-castle-friends.png`, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`,
      win: 'Amazing! You found everything in the bedroom. You are an L and W wizard!',
    },
  ],
};
