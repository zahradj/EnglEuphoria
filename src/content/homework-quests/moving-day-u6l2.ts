import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const truck = `${S}/bg-u6l2-moving-truck-wide.png`;
const room = `${S}/bg-u6l2-room-empty-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 6 Lesson 2 "Table, Chair, Bed!" — Moving Day Quest.
 *  Reviews table, chair, bed, sofa ("It's a chair!") and CH says /ch/
 *  (chair, cheese, chick, cherries). */
export const QUEST_MOVING_DAY_U6L2: HomeworkQuest = {
  id: 'moving-day-u6l2',
  title: 'Moving Day Quest',
  subtitle: 'Table, Chair, Bed! · Pre-A1 Unit 6 · Lesson 2',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-6-2',
  theme: { accent: '#0EA5E9', accent2: '#F97316', night: false, mapImg: truck, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Thank you!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Bring It In!', icon: '📦', intro: 'Listen. Tap the right one!', img: room,
      rounds: [
        { line: "It's a chair!", answer: 'chair', options: [{ label: 'chair', src: it('chair') }, { label: 'table', src: it('table') }, { label: 'bed', src: it('bed') }] },
        { line: "It's a sofa!", answer: 'sofa', options: [{ label: 'bed', src: it('bed') }, { label: 'sofa', src: it('sofa') }, { label: 'chair', src: it('chair') }] },
        { line: "It's a table!", answer: 'table', options: [{ label: 'sofa', src: it('sofa') }, { label: 'chair', src: it('chair') }, { label: 'table', src: it('table') }] },
        { line: "It's a bed!", answer: 'bed', options: [{ label: 'bed', src: it('bed') }, { label: 'table', src: it('table') }, { label: 'sofa', src: it('sofa') }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: it('bed'), line: "It's a bed!", isTrue: true },
        { img: it('sofa'), line: "It's a chair!", isTrue: false },
        { img: it('table'), line: "It's a table!", isTrue: true },
        { img: it('chair'), line: "It's a sofa!", isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'First Sounds', icon: '🧀', intro: 'Listen to the word. Which sound does it start with?', img: truck, choices: ['CH', 'K', 'B'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'chair', answer: 'CH', picture: it('chair') },
        { word: 'key', answer: 'K', picture: it('key') },
        { word: 'cheese', answer: 'CH', picture: it('cheese') },
        { word: 'bed', answer: 'B', picture: it('bed') },
        { word: 'chick', answer: 'CH', picture: it('chick') },
      ] },
    { kind: 'treasure', name: 'Moving Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: room, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Table, chair, bed and sofa — our new house is ready!' },
  ],
};
