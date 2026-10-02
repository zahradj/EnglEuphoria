import type { HomeworkQuest } from './types';
import {
  HW_U2L1_INTRO as I, HW_U2L1_PUZZLE, HW_U2L1_PUZZLE_LISTEN, HW_U2L1_STANDS,
  HW_U2L1_PRIZES, HW_U2L1_TRUE_FALSE, HW_U2L1_BUILD, HW_U2L1_SOUNDS,
} from '../playground-library/unit1/homework-u2l1';

const S = '/lep1/scenes';
const I_ = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const HERO_ASPECT = 1; // bg-u2l1c-hero.png is 1264x1264
const box = (p: { x: number; y: number; w: number; h: number }) => ({ x: p.x, y: p.y, w: p.w, h: p.h });

/** Maps a prize's short id (homework-u2l1.ts) to its real transparent icon file. */
const PRIZE_SRC: Record<string, string> = {
  balloon: `${I_}/item-balloon-red.png`,
  ring: `${I_}/item-ring.png`,
  cottoncandy: `${I_}/item-cottoncandy-blue.png`,
  'ribbon-blue': `${I_}/item-ribbon-blue.png`,
  popcorn: `${I_}/item-popcorn-yellow.png`,
  'duck-yellow': `${I_}/item-duck-yellow.png`,
};

/** Pre-A1 Unit 2 Lesson 1 — "Pip's Carnival Quest". A traveling-fairground
 *  theme deliberately distinct from Magic Castle's (A1 Unit 9) wizard theme
 *  — per direct user request not to reuse "magic" for this quest. */
export const QUEST_COLOR_CARNIVAL_U2L1: HomeworkQuest = {
  id: 'color-carnival-u2l1',
  title: "Pip’s Carnival Quest",
  subtitle: 'The Color Carnival · Pre-A1 Unit 2 · Lesson 1',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-2-1',
  theme: { accent: '#E63946', accent2: '#FBBF24', night: false, mapImg: `${S}/bg-u2l1c-hero.png`, guide: `${C}/pip-hello.png`, walker: `${C}/bella-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'scene-puzzle', name: 'Carnival Puzzle', icon: '🎡', intro: I.puzzle, img: `${S}/bg-u2l1c-hero.png`, aspect: HERO_ASPECT,
      pieces: HW_U2L1_PUZZLE.map((p) => ({ label: p.stand, box: box(p), line: p.line })) },
    { kind: 'scene-puzzle', name: 'Listen & Build', icon: '🎧', intro: I.puzzleListen, img: `${S}/bg-u2l1c-hero.png`, aspect: HERO_ASPECT, numbered: true,
      pieces: HW_U2L1_PUZZLE_LISTEN.map((p) => ({ label: p.stand, box: box(p), line: p.line })) },
    { kind: 'tap-hotspot', name: 'Where is Pip?', icon: '🦊', intro: I.whereIsPip, img: `${S}/bg-u2l1c-hero.png`, aspect: HERO_ASPECT, marker: `${C}/pip-hello.png`,
      spots: HW_U2L1_PUZZLE.map((p) => ({ label: p.stand, box: box(p) })),
      rounds: HW_U2L1_STANDS.map((r) => ({ target: r.stand, line: r.line })) },
    { kind: 'sticker-drop', name: 'Fill the Carnival', icon: `${I_}/item-balloon-red.png`, intro: I.stickerDrop, img: `${S}/bg-u2l1c-bunting.png`, aspect: 1,
      zones: [{ id: 'red', box: { x: 2, y: 15, w: 30, h: 70 } }, { id: 'blue', box: { x: 35, y: 15, w: 30, h: 70 } }, { id: 'yellow', box: { x: 68, y: 15, w: 30, h: 70 } }],
      stickers: HW_U2L1_PRIZES.map((p) => ({ item: p.item, src: PRIZE_SRC[p.item], zone: p.zone, size: p.size, line: p.line })) },
    { kind: 'true-false', name: 'True or False', icon: '⚖️', intro: I.trueFalse,
      rounds: HW_U2L1_TRUE_FALSE.map((r) => ({ img: `${S}/${r.img}`, line: r.line, isTrue: r.isTrue })) },
    { kind: 'sentence-builder', name: 'Sentence Builder', icon: '🧱', intro: I.build,
      rounds: HW_U2L1_BUILD.map((r) => ({ img: `${S}/${r.img}`, line: r.line, extra: [...r.extra] })) },
    { kind: 'sound-choice', name: 'R, Y, or B?', icon: '👂', intro: I.sounds, img: `${S}/bg-u2l1c-tickets.png`, choices: ['R', 'Y', 'B'], phonics: true, voice: 'pip',
      rounds: HW_U2L1_SOUNDS.map((r) => ({ word: r.word, answer: r.sound, picture: `${I_}/${r.picture}` })) },
    { kind: 'treasure', name: 'Prize Crate', icon: `${K}/chest-closed.png`, intro: I.chest, img: `${S}/bg-u2l1c-hero.png`, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: I.win },
  ],
};
