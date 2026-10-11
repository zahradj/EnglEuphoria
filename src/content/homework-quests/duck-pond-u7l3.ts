import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const pond = `${S}/bg-u7l3-pond-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 7 Lesson 3 "Horse, Chicken, Duck!" — Duck Pond Quest.
 *  Reviews the three animals, their sounds and the /h/ sound. */
export const QUEST_DUCK_POND_U7L3: HomeworkQuest = {
  id: 'duck-pond-u7l3',
  title: 'Duck Pond Quest',
  subtitle: 'Horse, Chicken, Duck! · Pre-A1 Unit 7 · Lesson 3',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-7-3',
  theme: { accent: '#0891B2', accent2: '#D97706', night: false, mapImg: pond, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Which Animal?', icon: '🐴', intro: 'Listen. Tap the right animal!', img: pond,
      rounds: [
        { line: "It's a duck!", answer: 'duck', options: [{ label: 'horse', src: it('horse') }, { label: 'duck', src: it('farm-duck') }, { label: 'chicken', src: it('hen') }] },
        { line: "It's a horse!", answer: 'horse', options: [{ label: 'horse', src: it('horse') }, { label: 'chicken', src: it('hen') }, { label: 'duck', src: it('farm-duck') }] },
        { line: "It's a chicken!", answer: 'chicken', options: [{ label: 'duck', src: it('farm-duck') }, { label: 'horse', src: it('horse') }, { label: 'chicken', src: it('hen') }] },
      ] },
    { kind: 'picture-choice', name: 'Who Says That?', icon: '🔊', intro: 'Listen to the sound. Who says it?', img: pond,
      rounds: [
        { line: 'Neigh, neigh!', answer: 'horse', options: [{ label: 'duck', src: it('farm-duck') }, { label: 'horse', src: it('horse') }, { label: 'chicken', src: it('hen') }] },
        { line: 'Quack, quack!', answer: 'duck', options: [{ label: 'chicken', src: it('hen') }, { label: 'horse', src: it('horse') }, { label: 'duck', src: it('farm-duck') }] },
        { line: 'Cluck, cluck!', answer: 'chicken', options: [{ label: 'chicken', src: it('hen') }, { label: 'duck', src: it('farm-duck') }, { label: 'horse', src: it('horse') }] },
      ] },
    { kind: 'sound-choice', name: 'First Sounds', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: pond, choices: ['H', 'D'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'horse', answer: 'H', picture: it('horse') },
        { word: 'duck', answer: 'D', picture: it('farm-duck') },
        { word: 'hat', answer: 'H', picture: it('hat') },
        { word: 'house', answer: 'H', picture: it('house') },
      ] },
    { kind: 'treasure', name: 'Parade Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: pond, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Horse, chicken, duck! Neigh, cluck, quack! What a great parade!' },
  ],
};
