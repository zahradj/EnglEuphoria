import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const farm = `${S}/bg-u7l2-farm-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 7 Lesson 2 "Cow, Pig, Sheep!" — Farm Quest.
 *  Reviews the three farm animals, their sounds and the first sounds /k/, /p/, /sh/. */
export const QUEST_FARM_U7L2: HomeworkQuest = {
  id: 'farm-u7l2',
  title: 'Farm Quest',
  subtitle: 'Cow, Pig, Sheep! · Pre-A1 Unit 7 · Lesson 2',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-7-2',
  theme: { accent: '#16A34A', accent2: '#DC2626', night: false, mapImg: farm, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Which Animal?', icon: '🐮', intro: 'Listen. Tap the right animal!', img: farm,
      rounds: [
        { line: "It's a pig!", answer: 'pig', options: [{ label: 'cow', src: it('cow') }, { label: 'pig', src: it('pig') }, { label: 'sheep', src: it('sheep') }] },
        { line: "It's a sheep!", answer: 'sheep', options: [{ label: 'sheep', src: it('sheep') }, { label: 'cow', src: it('cow') }, { label: 'pig', src: it('pig') }] },
        { line: "It's a cow!", answer: 'cow', options: [{ label: 'pig', src: it('pig') }, { label: 'sheep', src: it('sheep') }, { label: 'cow', src: it('cow') }] },
      ] },
    { kind: 'picture-choice', name: 'Who Says That?', icon: '🔊', intro: 'Listen to the sound. Who says it?', img: farm,
      rounds: [
        { line: 'Moo, moo!', answer: 'cow', options: [{ label: 'sheep', src: it('sheep') }, { label: 'cow', src: it('cow') }, { label: 'pig', src: it('pig') }] },
        { line: 'Baa, baa!', answer: 'sheep', options: [{ label: 'pig', src: it('pig') }, { label: 'cow', src: it('cow') }, { label: 'sheep', src: it('sheep') }] },
        { line: 'Oink, oink!', answer: 'pig', options: [{ label: 'pig', src: it('pig') }, { label: 'sheep', src: it('sheep') }, { label: 'cow', src: it('cow') }] },
      ] },
    { kind: 'sound-choice', name: 'First Sounds', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: farm, choices: ['C', 'P', 'SH'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'pig', answer: 'P', picture: it('pig') },
        { word: 'sheep', answer: 'SH', picture: it('sheep') },
        { word: 'cow', answer: 'C', picture: it('cow') },
      ] },
    { kind: 'treasure', name: 'Farm Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: farm, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Cow, pig, sheep! Moo, oink, baa! What a happy farm!' },
  ],
};
