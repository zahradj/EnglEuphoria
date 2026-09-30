/* =============================================================================
 * Magic Castle — A1 Unit 9 Lesson 1 homework: "Wim's Homework Quest".
 *
 * A gamified, harder follow-up to the lesson (kitchen, bedroom, table,
 * chair, "there is / there is no", and the CH sound). Every line the game
 * says is listed here with its voice so scripts/generate-voice-cache.mjs can
 * record it ahead of time — the game only plays recorded clips (never the
 * browser's voice; see CLAUDE.md "Voice"). Voices match the lesson: Wim and
 * Cat-cat use the lesson's 'teacher' voice, Pip his own.
 *
 * Harder than the lesson on purpose: prompts are audio-only (no word under
 * the picture), rooms come from the full six-room castle, true/false hinges
 * on "there is" vs "there is NO", sentences are built word by word with
 * distractors, CH is contrasted with SH by ear, the twister is timed, and
 * the reading has no audio until the student asks for help.
 * ========================================================================== */

export type HomeworkVoice = 'teacher' | 'pip';

export const HW_A1U9L1_INTRO = {
  puzzle: 'Listen, and build the castle, room by room!',
  puzzleListen: 'Listen to the whole sentence. Which room is it?',
  furniture: 'Drag each sticker into the right room.',
  rooms: 'Listen. Where is Wim? Tap the room.',
  trueFalse: 'Look at the picture. Listen. True or false?',
  build: 'Look and listen. Build the sentence.',
  ears: 'Listen. Is it ch, or sh?',
  twister: 'Build my tongue twister before the sand runs out!',
  sayIt: 'Now say it slow, faster, and at magic speed!',
  reading: 'Read the spell book. Then answer the questions.',
  chest: 'Tap the chest to open it!',
  win: 'Amazing! You are a CH wizard!',
} as const;

/** Room boxes on bg-castle-overview.png (percent of the 1376×768 art). */
const ROOM_BOX = {
  'living room': { x: 12.1, y: 28.9, w: 26.0, h: 33.3 },
  hallway: { x: 39.1, y: 28.9, w: 21.8, h: 33.3 },
  bathroom: { x: 61.9, y: 28.9, w: 26.0, h: 33.3 },
  bedroom: { x: 12.1, y: 64.1, w: 22.6, h: 32.3 },
  kitchen: { x: 35.6, y: 64.1, w: 29.1, h: 32.3 },
  'dining room': { x: 65.6, y: 64.1, w: 22.3, h: 32.3 },
} as const;

/** Level 1 — House puzzle: "Find the kitchen." → drop the kitchen piece
 *  into its place, until the castle is whole. */
export const HW_A1U9L1_PUZZLE = [
  { room: 'kitchen', ...ROOM_BOX.kitchen, line: 'Find the kitchen.' },
  { room: 'bedroom', ...ROOM_BOX.bedroom, line: 'Find the bedroom.' },
  { room: 'living room', ...ROOM_BOX['living room'], line: 'Find the living room.' },
  { room: 'bathroom', ...ROOM_BOX.bathroom, line: 'Find the bathroom.' },
  { room: 'dining room', ...ROOM_BOX['dining room'], line: 'Find the dining room.' },
  { room: 'hallway', ...ROOM_BOX.hallway, line: 'Find the hallway.' },
] as const;

/** Level 2 — Listen & Build: numbered slots and full sentences ("Number
 *  one. Cat-cat is playing in the living room."). The student works out the
 *  room from the sentence and drops that (unlabelled) piece on slot 1, and
 *  so on — a harder listening check right after level 1. Numbers are
 *  scattered across the house on purpose. */
export const HW_A1U9L1_PUZZLE_LISTEN = [
  { n: 1, room: 'living room', ...ROOM_BOX['living room'], line: 'Number one. Cat-cat is playing in the living room.' },
  { n: 2, room: 'kitchen', ...ROOM_BOX.kitchen, line: 'Number two. Wim is cooking in the kitchen.' },
  { n: 3, room: 'bedroom', ...ROOM_BOX.bedroom, line: 'Number three. Pip is sleeping in the bedroom.' },
  { n: 4, room: 'bathroom', ...ROOM_BOX.bathroom, line: 'Number four. Cat-cat is having a bath in the bathroom.' },
  { n: 5, room: 'dining room', ...ROOM_BOX['dining room'], line: 'Number five. Wim is eating in the dining room.' },
  { n: 6, room: 'hallway', ...ROOM_BOX.hallway, line: 'Number six. Pip is walking in the hallway.' },
] as const;

/** Furniture stickers dragged onto bg-castle-rooms.png (kitchen left,
 *  bedroom right). */
export const HW_A1U9L1_FURNITURE = [
  { item: 'chair', emoji: '🪑', room: 'kitchen', line: 'There is a chair in the kitchen.' },
  { item: 'bed', emoji: '🛏️', room: 'bedroom', line: 'There is a bed in the bedroom.' },
  { item: 'table', emoji: '🍽️', room: 'kitchen', line: 'There is a table in the kitchen.' },
  { item: 'lamp', emoji: '🪔', room: 'bedroom', line: 'There is a lamp in the bedroom.' },
  { item: 'pot', emoji: '🍲', room: 'kitchen', line: 'There is a pot in the kitchen.' },
] as const;

/** Where is Wim? — castle overview hotspots (bg-castle-overview.png). */
export const HW_A1U9L1_ROOMS = [
  { room: 'kitchen', left: 48, top: 80, line: 'Wim is in the kitchen.' },
  { room: 'bedroom', left: 23, top: 80, line: 'Wim is in the bedroom.' },
  { room: 'bathroom', left: 73, top: 48, line: 'Wim is in the bathroom.' },
  { room: 'dining room', left: 73, top: 80, line: 'Wim is in the dining room.' },
  { room: 'living room', left: 25, top: 50, line: 'Wim is in the living room.' },
  { room: 'hallway', left: 50, top: 48, line: 'Wim is in the hallway.' },
] as const;

/** Level 2 — true/false on the kitchen pictures (with / without the chair). */
export const HW_A1U9L1_TRUE_FALSE = [
  { img: 'bg-castle-kitchen.png', line: 'There is a chair in the kitchen.', isTrue: true },
  { img: 'bg-castle-kitchen-nochair.png', line: 'There is a chair in the kitchen.', isTrue: false },
  { img: 'bg-castle-kitchen-nochair.png', line: 'There is no chair in the kitchen.', isTrue: true },
  { img: 'bg-castle-kitchen.png', line: 'There is a bed in the kitchen.', isTrue: false },
  { img: 'bg-castle-kitchen-nochair.png', line: 'There is a table in the kitchen.', isTrue: true },
] as const;

/** Level 3 — build the sentence (extra words are distractors). */
export const HW_A1U9L1_BUILD = [
  { img: 'bg-castle-kitchen.png', line: 'The chair is in the kitchen.', extra: ['bedroom', 'bed'] },
  { img: 'bg-castle-bedroom-wim.png', line: 'The bed is in the bedroom.', extra: ['kitchen', 'table'] },
  { img: 'bg-castle-bathroom-dining.png', sticker: 'sticker-catcat.png', line: 'Cat-cat is in the dining room.', extra: ['bathroom', 'kitchen'] },
  { img: 'bg-castle-kitchen-nochair.png', line: 'There is no chair in the kitchen.', extra: ['a', 'bed'] },
] as const;

/** Level 4 — CH or SH by ear. */
export const HW_A1U9L1_EARS = [
  { word: 'chip', sound: 'ch', emoji: '🍟' },
  { word: 'ship', sound: 'sh', emoji: '🚢' },
  { word: 'chop', sound: 'ch', emoji: '🪓' },
  { word: 'shop', sound: 'sh', emoji: '🏪' },
  { word: 'cheese', sound: 'ch', emoji: '🧀' },
  { word: 'sheep', sound: 'sh', emoji: '🐑' },
  { word: 'chick', sound: 'ch', emoji: '🐤' },
  { word: 'fish', sound: 'sh', emoji: '🐟' },
  { word: 'lunch', sound: 'ch', emoji: '🍱' },
] as const;

/** Level 5 — the lesson's tongue twister, timed. */
export const HW_A1U9L1_TWISTER = { line: 'Wim’s chick chews cheese chips on a chair.', seconds: 45 } as const;

/** Level 6 — reading (new text, same words), audio only on request. */
export const HW_A1U9L1_READING = {
  sentences: [
    'Wim has a chest in the kitchen.',
    'In the chest, there is a chick.',
    'The chick is on a chair.',
    'There is no cheese!',
    'Wim says, “Chip, chop!”',
    'Now there is cheese on the table.',
  ],
  questions: [
    { q: 'Where is the chest?', options: ['In the kitchen', 'In the bedroom', 'On the table'], answer: 'In the kitchen' },
    { q: 'What is on the chair?', options: ['Cheese', 'A chick', 'A chest'], answer: 'A chick' },
    { q: 'Where is the cheese now?', options: ['On the chair', 'In the chest', 'On the table'], answer: 'On the table' },
  ],
} as const;

export const HW_A1U9L1_PRAISE = ['Yes! Great job!', 'Well done!', 'Wow, perfect!', 'Try again!'] as const;

/** Every (voice, text) the homework can say — baked by generate-voice-cache. */
export function homeworkA1U9L1Lines(): [HomeworkVoice, string][] {
  const out: [HomeworkVoice, string][] = [];
  Object.values(HW_A1U9L1_INTRO).forEach((t) => out.push(['teacher', t]));
  HW_A1U9L1_PUZZLE.forEach((r) => out.push(['teacher', r.line]));
  HW_A1U9L1_PUZZLE_LISTEN.forEach((r) => out.push(['teacher', r.line]));
  HW_A1U9L1_FURNITURE.forEach((r) => out.push(['teacher', r.line]));
  HW_A1U9L1_ROOMS.forEach((r) => out.push(['teacher', r.line]));
  HW_A1U9L1_TRUE_FALSE.forEach((r) => out.push(['teacher', r.line]));
  HW_A1U9L1_BUILD.forEach((r) => out.push(['teacher', r.line]));
  HW_A1U9L1_EARS.forEach((r) => out.push(['pip', r.word]));
  out.push(['teacher', HW_A1U9L1_TWISTER.line]);
  HW_A1U9L1_READING.sentences.forEach((t) => out.push(['teacher', t]));
  HW_A1U9L1_READING.questions.forEach((q) => out.push(['teacher', q.q]));
  HW_A1U9L1_PRAISE.forEach((t) => out.push(['pip', t]));
  return out;
}
