import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const yard = `${S}/bg-u7l5-yard-wide.png`;
const sc = (n: string) => `${S}/bg-u7l5-${n}-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 7 Lesson 5 "Grandpa's Farm" — Grandpa's Farm Quest.
 *  Reviews the story: an animal's sound → "What animal is this? It's a cow!". */
export const QUEST_OLD_MACDONALD_U7L5: HomeworkQuest = {
  id: 'old-macdonald-u7l5',
  title: "Grandpa's Farm Quest",
  subtitle: "Grandpa's Farm · Pre-A1 Unit 7 · Lesson 5",
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-7-5',
  theme: { accent: '#B91C1C', accent2: '#F59E0B', night: false, mapImg: yard, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'What Animal is This?', icon: '🔊', intro: 'Listen to the sound. What animal is this?', img: sc('barn-0'),
      rounds: [
        { line: 'Oink! Oink! What animal is this?', answer: 'pig', options: [{ label: 'cow', src: it('cow') }, { label: 'pig', src: it('pig') }, { label: 'duck', src: it('farm-duck') }] },
        { line: 'Moo! Moo! What animal is this?', answer: 'cow', options: [{ label: 'cow', src: it('cow') }, { label: 'sheep', src: it('sheep') }, { label: 'pig', src: it('pig') }] },
        { line: 'Quack! Quack! What animal is this?', answer: 'duck', options: [{ label: 'sheep', src: it('sheep') }, { label: 'cow', src: it('cow') }, { label: 'duck', src: it('farm-duck') }] },
      ] },
    { kind: 'true-false', name: 'Is It Right?', icon: '🚪', intro: 'Look at the barn door. Is it right?',
      rounds: [
        { img: sc('barn-1'), line: "It's a cow!", isTrue: true },
        { img: sc('barn-2'), line: "It's a horse!", isTrue: false },
        { img: sc('barn-3'), line: "It's a sheep!", isTrue: true },
        { img: sc('barn-4'), line: "It's a dog!", isTrue: false },
      ] },
    { kind: 'treasure', name: 'Farm Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: yard, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Old MacDonald had a farm, E-I-E-I-O!' },
  ],
};
