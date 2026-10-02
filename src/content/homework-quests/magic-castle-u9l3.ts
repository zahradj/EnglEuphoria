import type { HomeworkQuest } from './types';
import { HW_A1U9L1_PUZZLE } from '../playground-library/magic-castle/homework';

const S = '/magic-castle/scenes';
const K = '/magic-castle/stickers';
const WIDE = 1376 / 768;
const OVERVIEW = `${S}/bg-castle-overview.png`;
const ROOM_FURN = `${S}/bg-castle-furniture-room.png`;
const H = {
  kitchen: `${S}/bg-hunt-kitchen-under.png`,
  living: `${S}/bg-hunt-living-nextto.png`,
  dining: `${S}/bg-hunt-dining-on.png`,
  bath: `${S}/bg-hunt-bathroom-in.png`,
  bedroom: `${S}/bg-hunt-bedroom-behind.png`,
};

/** The six new furniture words on bg-castle-furniture-room.png (percent of
 *  the 1376×768 art), measured so the puzzle pieces don't overlap. */
const F = {
  bookcase: { x: 2, y: 11, w: 19, h: 78 },
  clock: { x: 33, y: 11, w: 13, h: 23 },
  mirror: { x: 57, y: 15, w: 14, h: 33 },
  sofa: { x: 22, y: 50, w: 38.5, h: 29 },
  armchair: { x: 61, y: 49, w: 20, h: 32 },
  desk: { x: 81, y: 61, w: 19, h: 37 },
} as const;
const ROOM = Object.fromEntries(HW_A1U9L1_PUZZLE.map((p) => [p.room, { x: p.x, y: p.y, w: p.w, h: p.h }]));

/**
 * Magic Castle, A1 Unit 9 Lesson 3 — "Wim's Lamp Hunt Quest".
 * Practises "Where is the ___?" / "It's in the ___." on the whole castle,
 * the five "where" words (in, on, under, next to, behind) and the new
 * furniture (sofa, armchair, mirror, bookcase, clock, desk). Harder than
 * the lesson: audio-only prompts, riddles, picture-only answers, traps in
 * the sentence builder and a new reading. Every line is a recorded clip
 * (baked via allQuestLines) — never the browser voice (CLAUDE.md "Voice").
 */
export const QUEST_MAGIC_CASTLE_U9L3: HomeworkQuest = {
  id: 'magic-castle-u9l3',
  title: 'Wim’s Lamp Hunt Quest',
  subtitle: 'Magic Castle · A1 Unit 9 · Lesson 3',
  level: 'A1',
  lessonKey: 'castle-rich-9-3',
  theme: { accent: '#f5c542', accent2: '#7c3aed', night: true, mapImg: `${S}/bg-castle-exterior.png`, guide: `${S}/sticker-wim.png`, walker: `${S}/sticker-catcat.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    {
      kind: 'tap-hotspot', name: 'Castle Rooms', icon: '🏰', intro: 'Listen. Where is it? Tap the room.',
      img: OVERVIEW, aspect: WIDE,
      spots: HW_A1U9L1_PUZZLE.map((p) => ({ label: p.room, box: ROOM[p.room] })),
      rounds: [
        { target: 'living room', line: 'Where is the sofa?' },
        { target: 'bathroom', line: 'Where is the mirror?' },
        { target: 'bedroom', line: 'Where is the bed?' },
        { target: 'kitchen', line: 'Where is the pot?' },
        { target: 'dining room', line: 'Where is the chair?' },
      ],
    },
    {
      kind: 'scene-puzzle', name: 'Furniture Puzzle', icon: '🧩', intro: 'Listen, and build Wim’s sitting room, piece by piece!',
      img: ROOM_FURN, aspect: WIDE,
      pieces: [
        { label: 'sofa', box: F.sofa, line: 'Find the sofa.' },
        { label: 'clock', box: F.clock, line: 'Find the clock.' },
        { label: 'armchair', box: F.armchair, line: 'Find the armchair.' },
        { label: 'bookcase', box: F.bookcase, line: 'Find the bookcase.' },
        { label: 'desk', box: F.desk, line: 'Find the desk.' },
        { label: 'mirror', box: F.mirror, line: 'Find the mirror.' },
      ],
    },
    {
      kind: 'picture-choice', name: 'Riddle Room', icon: '❓', intro: 'Listen to the riddle. What is it? Tap the picture.',
      img: ROOM_FURN,
      rounds: [
        { line: 'It tells the time.', answer: 'clock', options: [{ label: 'mirror', src: `${K}/mirror.png` }, { label: 'clock', src: `${K}/clock.png` }, { label: 'desk', src: `${K}/desk.png` }] },
        { line: 'You look in it and see you!', answer: 'mirror', options: [{ label: 'mirror', src: `${K}/mirror.png` }, { label: 'window', src: `${K}/window.png` }, { label: 'bookcase', src: `${K}/bookcase.png` }] },
        { line: 'It is full of books.', answer: 'bookcase', options: [{ label: 'desk', src: `${K}/desk.png` }, { label: 'sofa', src: `${K}/sofa.png` }, { label: 'bookcase', src: `${K}/bookcase.png` }] },
        { line: 'You write at it.', answer: 'desk', options: [{ label: 'desk', src: `${K}/desk.png` }, { label: 'bed', src: `${K}/bed.png` }, { label: 'armchair', src: `${K}/armchair.png` }] },
        { line: 'One person sits in it. It is soft.', answer: 'armchair', options: [{ label: 'sofa', src: `${K}/sofa.png` }, { label: 'armchair', src: `${K}/armchair.png` }, { label: 'chair', src: `${K}/chair.png` }] },
        { line: 'Two or three people sit on it.', answer: 'sofa', options: [{ label: 'armchair', src: `${K}/armchair.png` }, { label: 'table', src: `${K}/table.png` }, { label: 'sofa', src: `${K}/sofa.png` }] },
      ],
    },
    {
      kind: 'picture-choice', name: 'Find the Lamp', icon: '🔦', intro: 'Listen. Where is Wim’s lamp? Tap the right picture.',
      img: H.kitchen,
      rounds: [
        { line: 'The lamp is under the table.', answer: 'under', options: [{ label: 'on', src: H.dining }, { label: 'under', src: H.kitchen }, { label: 'in', src: H.bath }] },
        { line: 'The lamp is behind the bed.', answer: 'behind', options: [{ label: 'behind', src: H.bedroom }, { label: 'next to', src: H.living }, { label: 'under', src: H.kitchen }] },
        { line: 'The lamp is in the bath.', answer: 'in', options: [{ label: 'on', src: H.dining }, { label: 'behind', src: H.bedroom }, { label: 'in', src: H.bath }] },
        { line: 'The lamp is next to the sofa.', answer: 'next to', options: [{ label: 'next to', src: H.living }, { label: 'in', src: H.bath }, { label: 'behind', src: H.bedroom }] },
        { line: 'The lamp is on the chair.', answer: 'on', options: [{ label: 'under', src: H.kitchen }, { label: 'on', src: H.dining }, { label: 'next to', src: H.living }] },
      ],
    },
    {
      kind: 'true-false', name: 'True or False', icon: '⚖️', intro: 'Look at the picture. Listen. True or false?',
      rounds: [
        { img: H.kitchen, line: 'The lamp is under the table.', isTrue: true },
        { img: H.bath, line: 'The lamp is next to the bath.', isTrue: false },
        { img: H.dining, line: 'The lamp is on the chair.', isTrue: true },
        { img: ROOM_FURN, line: 'The armchair is next to the sofa.', isTrue: true },
        { img: H.bedroom, line: 'The lamp is on the bed.', isTrue: false },
        { img: ROOM_FURN, line: 'The clock is under the sofa.', isTrue: false },
      ],
    },
    {
      kind: 'sentence-builder', name: 'Sentence Builder', icon: '🧱', intro: 'Look and listen. Build the sentence.',
      rounds: [
        { img: H.bedroom, line: 'The lamp is behind the bed.', extra: ['under', 'sofa'] },
        { img: H.living, line: 'The lamp is next to the sofa.', extra: ['on', 'bath'] },
        { img: OVERVIEW, line: 'It’s in the kitchen.', extra: ['on', 'bedroom'] },
        { img: ROOM_FURN, line: 'Where is the mirror?', extra: ['clock', 'under'] },
      ],
    },
    {
      kind: 'reading', name: 'Night Story', icon: '📖', intro: 'Read the story. Then answer the questions.', img: ROOM_FURN, focus: '\\bnext to\\b|\\bunder\\b|\\bbehind\\b|\\bin\\b|\\bon\\b',
      sentences: [
        'Wim has a new sitting room.',
        'There is a sofa and an armchair.',
        'The armchair is next to the sofa.',
        'Cat-cat sleeps under the desk.',
        'Wim’s lamp is behind the clock!',
        '“Silly lamp!” says Wim.',
      ],
      questions: [
        { q: 'Where is the armchair?', options: ['Next to the sofa', 'Under the desk', 'In the bath'], answer: 'Next to the sofa' },
        { q: 'Where does Cat-cat sleep?', options: ['On the sofa', 'Under the desk', 'Behind the clock'], answer: 'Under the desk' },
        { q: 'Where is the lamp?', options: ['Behind the clock', 'In the kitchen', 'On the armchair'], answer: 'Behind the clock' },
      ],
    },
    {
      kind: 'treasure', name: 'Treasure', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!',
      img: `${S}/bg-castle-lamp-found.png`, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`,
      win: 'Hooray! You found the lamp and everything in the castle. You are a where-is-it wizard!',
    },
  ],
};
