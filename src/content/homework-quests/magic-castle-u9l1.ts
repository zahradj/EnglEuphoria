import type { HomeworkQuest } from './types';
import {
  HW_A1U9L1_INTRO as I, HW_A1U9L1_PUZZLE, HW_A1U9L1_PUZZLE_LISTEN, HW_A1U9L1_FURNITURE, HW_A1U9L1_ROOMS,
  HW_A1U9L1_TRUE_FALSE, HW_A1U9L1_BUILD, HW_A1U9L1_EARS, HW_A1U9L1_TWISTER, HW_A1U9L1_READING,
} from '../playground-library/magic-castle/homework';

const S = '/magic-castle/scenes';
const K = '/magic-castle/stickers';
const OVERVIEW_ASPECT = 1376 / 768;
const box = (p: { x: number; y: number; w: number; h: number }) => ({ x: p.x, y: p.y, w: p.w, h: p.h });

/** Magic Castle, A1 Unit 9 Lesson 1 — "Wim's Homework Quest". */
export const QUEST_MAGIC_CASTLE_U9L1: HomeworkQuest = {
  id: 'magic-castle-u9l1',
  title: 'Wim’s Homework Quest',
  subtitle: 'Magic Castle · A1 Unit 9 · Lesson 1',
  level: 'A1',
  lessonKey: 'castle-rich-9-1',
  theme: { accent: '#f5c542', accent2: '#7c3aed', night: true, mapImg: `${S}/bg-castle-exterior.png`, guide: `${S}/sticker-wim.png`, walker: `${S}/sticker-catcat.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'scene-puzzle', name: 'House Puzzle', icon: '🧩', intro: I.puzzle, img: `${S}/bg-castle-overview.png`, aspect: OVERVIEW_ASPECT,
      pieces: HW_A1U9L1_PUZZLE.map((p) => ({ label: p.room, box: box(p), line: p.line })) },
    { kind: 'scene-puzzle', name: 'Listen & Build', icon: '🎧', intro: I.puzzleListen, img: `${S}/bg-castle-overview.png`, aspect: OVERVIEW_ASPECT, numbered: true,
      pieces: HW_A1U9L1_PUZZLE_LISTEN.map((p) => ({ label: p.room, box: box(p), line: p.line })) },
    { kind: 'tap-hotspot', name: 'Where is Wim?', icon: '🧙', intro: I.rooms, img: `${S}/bg-castle-overview.png`, aspect: OVERVIEW_ASPECT, marker: `${S}/sticker-wim.png`,
      spots: HW_A1U9L1_PUZZLE.map((p) => ({ label: p.room, box: box(p) })),
      rounds: HW_A1U9L1_ROOMS.slice(0, 4).map((r) => ({ target: r.room, line: r.line })) },
    { kind: 'sticker-drop', name: 'Furniture Magic', icon: `${K}/chair.png`, intro: I.furniture, img: `${S}/bg-castle-rooms-empty.png`, aspect: 1376 / 768,
      zones: [{ id: 'kitchen', box: { x: 4, y: 17, w: 48, h: 70 } }, { id: 'bedroom', box: { x: 55, y: 17, w: 41, h: 70 } }],
      stickers: HW_A1U9L1_FURNITURE.map((f) => ({ item: f.item, src: `${K}/${f.item}.png`, zone: f.room, line: f.line,
        size: ({ chair: 8, bed: 19, table: 14, lamp: 5, pot: 6.5 } as Record<string, number>)[f.item] ?? 9 })) },
    { kind: 'true-false', name: 'True or False', icon: '⚖️', intro: I.trueFalse,
      rounds: HW_A1U9L1_TRUE_FALSE.map((r) => ({ img: `${S}/${r.img}`, line: r.line, isTrue: r.isTrue })) },
    { kind: 'sentence-builder', name: 'Sentence Builder', icon: '🧱', intro: I.build,
      rounds: HW_A1U9L1_BUILD.map((r) => ({ img: `${S}/${r.img}`, line: r.line, extra: [...r.extra],
        sticker: 'sticker' in r && r.sticker ? { src: `${S}/${r.sticker}`, x: 80, y: 80 } : undefined })) },
    { kind: 'sound-choice', name: 'CH or SH?', icon: '👂', intro: I.ears, img: `${S}/bg-castle-wim.png`, choices: ['ch', 'sh'], voice: 'pip',
      rounds: HW_A1U9L1_EARS.map((r) => ({ word: r.word, answer: r.sound, emoji: r.emoji })) },
    { kind: 'twister', name: 'Potion Twister', icon: '⚗️', intro: I.twister, img: `${S}/bg-castle-wim.png`, line: HW_A1U9L1_TWISTER.line, seconds: HW_A1U9L1_TWISTER.seconds, focus: 'ch', sayIt: I.sayIt },
    { kind: 'reading', name: 'Spell Book', icon: '📖', intro: I.reading, img: `${S}/bg-castle-kitchen.png`, focus: 'ch',
      sentences: [...HW_A1U9L1_READING.sentences], questions: HW_A1U9L1_READING.questions.map((q) => ({ q: q.q, options: [...q.options], answer: q.answer })) },
    { kind: 'treasure', name: 'Treasure', icon: `${K}/chest-closed.png`, intro: I.chest, img: `${S}/bg-castle-friends.png`, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: I.win },
  ],
};
