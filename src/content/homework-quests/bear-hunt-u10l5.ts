import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const trail = `${S}/bg-u10l5-trail-empty-wide.png`;
const page = (n: number) => `${S}/bg-u10l5-story-${n}-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 10 Lesson 5 "Pip's Bear Hunt" — Bear Hunt Quest.
 *  Practises he / she / it / they + can from the story, the unit's sounds, and blending. */
export const QUEST_BEAR_HUNT_U10L5: HomeworkQuest = {
  id: 'bear-hunt-u10l5',
  title: 'Bear Hunt Quest',
  subtitle: "Pip's Bear Hunt · Pre-A1 Unit 10 · Lesson 5",
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-10-5',
  theme: { accent: '#16A34A', accent2: '#F59E0B', night: false, mapImg: trail, guide: `${C}/bella-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'bella', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Who Can?', icon: '🐾', intro: 'Listen. Who is it?', img: trail,
      rounds: [
        { line: 'She can swim!', answer: 'Mia', options: [{ label: 'Pip', src: it('pip-wave') }, { label: 'Mia', src: it('mia-wave') }, { label: 'fish', src: it('goldfish') }] },
        { line: 'It can fly!', answer: 'bird', options: [{ label: 'Leo', src: it('leo-wave') }, { label: 'Mia', src: it('mia-wave') }, { label: 'bird', src: it('bird-fly') }] },
        { line: 'He can jump!', answer: 'Pip', options: [{ label: 'Mia', src: it('mia-wave') }, { label: 'Pip', src: it('pip-wave') }, { label: 'frog', src: it('frog-happy') }] },
        { line: 'It can sleep!', answer: 'bear', options: [{ label: 'bear', src: it('bear-bruno') }, { label: 'Mia', src: it('mia-wave') }, { label: 'Leo', src: it('leo-wave') }] },
      ] },
    { kind: 'true-false', name: 'Story Check', icon: '📖', intro: 'Look and listen. Yes or no?',
      rounds: [
        { img: page(6), line: 'She can swim.', isTrue: true },
        { img: page(8), line: 'Leo can fly.', isTrue: false },
        { img: page(10), line: 'The bear can sleep.', isTrue: true },
        { img: page(4), line: 'Mia can jump.', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'J, S or R?', icon: '🔤', intro: 'Listen to the word. What sound does it start with?', img: trail, choices: ['J', 'S', 'R'], phonics: true,
      rounds: [
        { word: 'jam', answer: 'J', picture: it('jam') },
        { word: 'sun', answer: 'S', picture: it('sun') },
        { word: 'rabbit', answer: 'R', picture: it('rabbit') },
        { word: 'jet', answer: 'J', picture: it('jet') },
      ] },
    { kind: 'sound-blend', name: 'Sound Train', icon: '🚂', intro: 'Tap each sound. Then blend them and find the picture!', img: trail, voice: 'pip',
      rounds: [{ word: 'pig', picture: it('pig') }, { word: 'pin', picture: it('pin') }, { word: 'wig', picture: it('wig') }, { word: 'lid', picture: it('lid') }] },
    { kind: 'treasure', name: 'Bear Cave Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: trail, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You found the bear! You are a brave bear hunter!' },
  ],
};
