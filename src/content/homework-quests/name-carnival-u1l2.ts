import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const gate = `${S}/bg-name-carnival-gate.jpg`;

/** Pre-A1 Unit 1 Lesson 2 "The Name Carnival" — Name Carnival Quest.
 *  Practises "What is your name? — My name is …", the friends' names, and
 *  W /w/ (what, water, wind) and N /n/ (nut, nest, nose), with H and M. */
export const QUEST_NAME_CARNIVAL_U1L2: HomeworkQuest = {
  id: 'name-carnival-u1l2',
  title: 'Name Carnival Quest',
  subtitle: 'The Name Carnival · Pre-A1 Unit 1 · Lesson 2',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-1-2',
  theme: { accent: '#F59E0B', accent2: '#A855F7', night: false, mapImg: gate, guide: `${C}/willow-hello.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'willow', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'What Is Your Name?', icon: '🎪', intro: 'Listen. Who is it? Tap the friend!', img: gate,
      rounds: [
        { line: 'What is your name? My name is Willow.', answer: 'Willow', options: [{ label: 'Willow', src: `${C}/willow-hello.png` }, { label: 'Leo', src: `${C}/leo-hello.png` }, { label: 'Mia', src: `${C}/mia-hello.png` }] },
        { line: 'What is your name? My name is Leo.', answer: 'Leo', options: [{ label: 'Bella', src: `${C}/bella-hello.png` }, { label: 'Leo', src: `${C}/leo-hello.png` }, { label: 'Willow', src: `${C}/willow-hello.png` }] },
        { line: 'What is your name? My name is Pip.', answer: 'Pip', options: [{ label: 'Mia', src: `${C}/mia-hello.png` }, { label: 'Willow', src: `${C}/willow-hello.png` }, { label: 'Pip', src: `${C}/pip-hello.png` }] },
      ] },
    { kind: 'sound-choice', name: 'W or N?', icon: '🌬️', intro: 'Listen to the word. Which sound does it start with?', img: `${S}/bg-name-carnival-bridge.jpg`, choices: ['W', 'N'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'water', answer: 'W', picture: `${I}/item-water.png` },
        { word: 'nest', answer: 'N', picture: `${I}/item-nest.png` },
        { word: 'wind', answer: 'W', picture: `${I}/item-wind.png` },
        { word: 'nut', answer: 'N', picture: `${I}/item-nut.png` },
        { word: 'nose', answer: 'N', picture: `${I}/item-nose.png` },
      ] },
    { kind: 'picture-choice', name: 'Sound Hunt', icon: '🔎', intro: 'Listen to the sound word. Tap the picture!', img: `${S}/bg-name-carnival-nest.jpg`,
      rounds: [
        { line: 'Find the hat.', answer: 'Hat', options: [{ label: 'Hat', src: `${I}/item-hat.png` }, { label: 'Nest', src: `${I}/item-nest.png` }, { label: 'Moon', src: `${I}/item-moon.png` }] },
        { line: 'Find the moon.', answer: 'Moon', options: [{ label: 'Water', src: `${I}/item-water.png` }, { label: 'Moon', src: `${I}/item-moon.png` }, { label: 'Nut', src: `${I}/item-nut.png` }] },
        { line: 'Find the nest.', answer: 'Nest', options: [{ label: 'House', src: `${I}/item-house.png` }, { label: 'Milk', src: `${I}/item-milk.png` }, { label: 'Nest', src: `${I}/item-nest.png` }] },
        { line: 'Find the water.', answer: 'Water', options: [{ label: 'Water', src: `${I}/item-water.png` }, { label: 'Hat', src: `${I}/item-hat.png` }, { label: 'Nose', src: `${I}/item-nose.png` }] },
      ] },
    { kind: 'treasure', name: 'Prize Box', icon: `${K}/chest-closed.png`, intro: 'Tap the prize box to open it!', img: gate, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! What is your name? Super star!' },
  ],
};
