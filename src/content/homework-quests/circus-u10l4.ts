import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const ring = `${S}/bg-u10l4-circus-empty-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 10 Lesson 4 "What Can You Do?" — Circus Quest.
 *  Practises "Can a … ?" yes/no (can / can't), the sounds C and B, and blending. */
export const QUEST_CIRCUS_U10L4: HomeworkQuest = {
  id: 'circus-u10l4',
  title: 'Circus Quest',
  subtitle: 'What Can You Do? · Pre-A1 Unit 10 · Lesson 4',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-10-4',
  theme: { accent: '#DC2626', accent2: '#FACC15', night: false, mapImg: ring, guide: `${C}/leo-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'leo', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'true-false', name: 'Can It?', icon: '🎪', intro: 'Listen. Yes or no?',
      rounds: [
        { img: ring, line: 'A fish can swim.', isTrue: true, sticker: { src: it('fish'), x: 50, y: 80, w: 26 } },
        { img: ring, line: 'A dog can fly.', isTrue: false, sticker: { src: it('dog'), x: 50, y: 80, w: 26 } },
        { img: ring, line: 'A frog can jump.', isTrue: true, sticker: { src: it('frog'), x: 50, y: 80, w: 26 } },
        { img: ring, line: 'A snake can run.', isTrue: false, sticker: { src: it('snake'), x: 50, y: 80, w: 26 } },
      ] },
    { kind: 'picture-choice', name: 'Who Can?', icon: '🐾', intro: 'Listen. Who can do it?', img: ring,
      rounds: [
        { line: 'It can fly!', answer: 'bird', options: [{ label: 'fish', src: it('fish') }, { label: 'bird', src: it('bird') }, { label: 'dog', src: it('dog') }] },
        { line: 'It can swim!', answer: 'fish', options: [{ label: 'fish', src: it('fish') }, { label: 'kangaroo', src: it('kangaroo') }, { label: 'bird', src: it('bird') }] },
        { line: 'It can jump!', answer: 'kangaroo', options: [{ label: 'snake', src: it('snake') }, { label: 'fish', src: it('fish') }, { label: 'kangaroo', src: it('kangaroo') }] },
      ] },
    { kind: 'sound-choice', name: 'C or B?', icon: '🔤', intro: 'Listen to the word. Does it start with C or B?', img: ring, choices: ['C', 'B'], phonics: true,
      rounds: [
        { word: 'cat', answer: 'C', picture: it('cat') },
        { word: 'ball', answer: 'B', picture: it('ball') },
        { word: 'cake', answer: 'C', picture: it('cake') },
        { word: 'bed', answer: 'B', picture: it('bed') },
      ] },
    { kind: 'sound-blend', name: 'Sound Train', icon: '🚂', intro: 'Tap each sound. Then blend them and find the picture!', img: ring, voice: 'pip',
      rounds: [{ word: 'cab', picture: it('cab') }, { word: 'cob', picture: it('cob') }, { word: 'bin', picture: it('bin') }, { word: 'bat', picture: it('bat') }] },
    { kind: 'treasure', name: 'Circus Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: ring, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You can do so much! You are a circus star!' },
  ],
};
