/* =============================================================================
 * Pre-A1 Unit 2 Lesson 1 homework: "Pip's Carnival Quest".
 *
 * A gamified, harder follow-up to the lesson (red/blue/yellow, the carnival
 * stand vocabulary, "It's ___", and the R/Y/B letter sounds). Every line the
 * game says is listed here with its voice so scripts/generate-voice-cache.mjs
 * can record it ahead of time — the game only plays recorded clips (never
 * the browser's voice; see CLAUDE.md "Voice"). Pip guides the quest (the
 * lesson's energetic ringmaster-ish character); Bella walks the map.
 *
 * Themed as a traveling carnival on purpose, NOT the Magic Castle's wizard
 * theme (A1 Unit 9) — direct user instruction to give this quest its own
 * creative identity rather than reusing "magic". Harder than the lesson on
 * purpose: prompts are audio-only (no word under the picture on most
 * levels), the puzzle/hotspot levels use the full carnival overview instead
 * of a single stand, true/false mixes in wrong colors, sentences are built
 * word-by-word with a distractor color, and the R/Y/B sound check covers
 * all 9 anchor words from the lesson at once instead of one letter at a time.
 * ========================================================================== */

export type HomeworkVoice = 'teacher' | 'pip' | 'bella' | 'willow';

export const HW_U2L1_INTRO = {
  puzzle: 'Listen, and build the carnival, stand by stand!',
  puzzleListen: 'Listen to the whole sentence. Which stand is it?',
  whereIsPip: 'Listen. Where is Pip? Tap the stand.',
  stickerDrop: 'Drag each prize to the right color!',
  trueFalse: 'Look at the picture. Listen. True or false?',
  build: 'Look and listen. Build the sentence.',
  sounds: 'Listen. Is it R, Y, or B?',
  chest: 'Tap the crate to open it!',
  win: 'Amazing! You are a Color Carnival champion!',
} as const;

/** Stand boxes on bg-u2l1c-hero.png (percent of the 1264x1264 art). */
const STAND_BOX = {
  balloons: { x: 8, y: 13, w: 24, h: 45 },
  cottonCandy: { x: 52, y: 26, w: 22, h: 29 },
  popcorn: { x: 70, y: 26, w: 22, h: 29 },
} as const;

/** Level 1 — Carnival puzzle: "Find the balloon stand." → drop that piece
 *  into its place, until the carnival is whole. */
export const HW_U2L1_PUZZLE = [
  { stand: 'balloon stand', ...STAND_BOX.balloons, line: 'Find the balloon stand.' },
  { stand: 'cotton candy stand', ...STAND_BOX.cottonCandy, line: 'Find the cotton candy stand.' },
  { stand: 'popcorn stand', ...STAND_BOX.popcorn, line: 'Find the popcorn stand.' },
] as const;

/** Level 2 — Listen & Build: numbered slots and full color+place sentences,
 *  a harder listening check right after level 1. */
export const HW_U2L1_PUZZLE_LISTEN = [
  { n: 1, stand: 'balloon stand', ...STAND_BOX.balloons, line: "Number one. It's red at the balloon stand." },
  { n: 2, stand: 'cotton candy stand', ...STAND_BOX.cottonCandy, line: "Number two. It's blue at the cotton candy stand." },
  { n: 3, stand: 'popcorn stand', ...STAND_BOX.popcorn, line: "Number three. It's yellow at the popcorn stand." },
] as const;

/** "Where is Pip?" — carnival overview hotspots (bg-u2l1c-hero.png). */
export const HW_U2L1_STANDS = [
  { stand: 'balloon stand', line: 'Pip is at the balloon stand.' },
  { stand: 'cotton candy stand', line: 'Pip is at the cotton candy stand.' },
  { stand: 'popcorn stand', line: 'Pip is at the popcorn stand.' },
] as const;

/** Level — Fill the Carnival: prize stickers dragged onto color zones on a
 *  plain bunting backdrop. */
export const HW_U2L1_PRIZES = [
  { item: 'balloon', zone: 'red', size: 14, line: "It's a balloon. It's red." },
  { item: 'ring', zone: 'red', size: 9, line: "It's a ring. It's red." },
  { item: 'cottoncandy', zone: 'blue', size: 16, line: "It's cotton candy. It's blue." },
  { item: 'ribbon-blue', zone: 'blue', size: 10, line: "It's a ribbon. It's blue." },
  { item: 'popcorn', zone: 'yellow', size: 14, line: "It's popcorn. It's yellow." },
  { item: 'duck-yellow', zone: 'yellow', size: 11, line: "It's a duck. It's yellow." },
] as const;

/** Level — true/false on the three stand close-ups. */
export const HW_U2L1_TRUE_FALSE = [
  { img: 'bg-u2l1c-red-balloon-stand.png', line: "It's red.", isTrue: true },
  { img: 'bg-u2l1c-red-balloon-stand.png', line: "It's blue.", isTrue: false },
  { img: 'bg-u2l1c-blue-cottoncandy-stand.png', line: "It's blue.", isTrue: true },
  { img: 'bg-u2l1c-yellow-popcorn-stand.png', line: "It's blue.", isTrue: false },
  { img: 'bg-u2l1c-yellow-popcorn-stand.png', line: "It's yellow.", isTrue: true },
] as const;

/** Level — build the sentence (one distractor color word each). */
export const HW_U2L1_BUILD = [
  { img: 'bg-u2l1c-red-balloon-stand.png', line: "It's red.", extra: ['blue'] },
  { img: 'bg-u2l1c-blue-cottoncandy-stand.png', line: "It's blue.", extra: ['yellow'] },
  { img: 'bg-u2l1c-yellow-popcorn-stand.png', line: "It's yellow.", extra: ['red'] },
] as const;

/** Level — R, Y or B by ear, all 9 lesson anchor words at once. */
export const HW_U2L1_SOUNDS = [
  { word: 'Red', sound: 'R', picture: 'item-balloon-red.png' },
  { word: 'Ring', sound: 'R', picture: 'item-ring.png' },
  { word: 'Ribbon', sound: 'R', picture: 'item-ribbon-blue.png' },
  { word: 'Yellow', sound: 'Y', picture: 'item-popcorn-yellow.png' },
  { word: 'Yo-yo', sound: 'Y', picture: 'item-yoyo.png' },
  { word: 'Yarn', sound: 'Y', picture: 'item-yarn.png' },
  { word: 'Blue', sound: 'B', picture: 'item-cottoncandy-blue.png' },
  { word: 'Ball', sound: 'B', picture: 'item-ball.png' },
  { word: 'Bear', sound: 'B', picture: 'item-bear.png' },
] as const;

export const HW_U2L1_PRAISE = ['Yes! Great job!', 'Well done!', 'Wow, perfect!', 'Try again!'] as const;

/** Every (voice, text) the homework can say — baked by generate-voice-cache. */
export function homeworkU2L1Lines(): [HomeworkVoice, string][] {
  const out: [HomeworkVoice, string][] = [];
  Object.values(HW_U2L1_INTRO).forEach((t) => out.push(['teacher', t]));
  HW_U2L1_PUZZLE.forEach((r) => out.push(['teacher', r.line]));
  HW_U2L1_PUZZLE_LISTEN.forEach((r) => out.push(['teacher', r.line]));
  HW_U2L1_STANDS.forEach((r) => out.push(['teacher', r.line]));
  HW_U2L1_PRIZES.forEach((r) => out.push(['teacher', r.line]));
  HW_U2L1_TRUE_FALSE.forEach((r) => out.push(['teacher', r.line]));
  HW_U2L1_BUILD.forEach((r) => out.push(['teacher', r.line]));
  HW_U2L1_SOUNDS.forEach((r) => out.push(['pip', r.word]));
  HW_U2L1_PRAISE.forEach((t) => out.push(['pip', t]));
  return out;
}
