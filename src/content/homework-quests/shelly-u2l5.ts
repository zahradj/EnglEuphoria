import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const sea = `${S}/bg-u2l5-sea-wide.png`;

/** Pre-A1 Unit 2 Lesson 5 "The Rainbow Fish's Scales" — Shelly's Sea Quest.
 *  Practises only what the lesson taught: Shelly's story (colored scales,
 *  shapes), "I want …, please / Here you are / Thank you", and SH.
 *  Everything is heard and answered with pictures — no reading. */
export const QUEST_SHELLY_U2L5: HomeworkQuest = {
  id: 'shelly-u2l5',
  title: "Shelly's Sea Quest",
  subtitle: "The Rainbow Fish's Scales · Pre-A1 Unit 2 · Lesson 5",
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-2-5',
  theme: { accent: '#0EA5E9', accent2: '#A855F7', night: false, mapImg: sea, guide: `${C}/pip-hello.png`, walker: `${C}/mia-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Find It', icon: '🔎', intro: 'Listen. Tap the right one!', img: sea,
      rounds: [
        { line: 'Find the ship.', answer: 'Ship', options: [{ label: 'Shoe', src: `${I}/item-shoe.png` }, { label: 'Ship', src: `${I}/item-ship.png` }, { label: 'Shell', src: `${I}/item-shell.png` }] },
        { line: 'Find Shelly the fish.', answer: 'Fish', options: [{ label: 'Fish', src: `${I}/item-shelly.png` }, { label: 'Whale', src: `${I}/item-whale.png` }, { label: 'Frog', src: `${I}/item-frog.png` }] },
        { line: 'Find the shell.', answer: 'Shell', options: [{ label: 'Clock', src: `${I}/item-clock.png` }, { label: 'Ship', src: `${I}/item-ship.png` }, { label: 'Shell', src: `${I}/item-shell.png` }] },
        { line: 'Find the shoe.', answer: 'Shoe', options: [{ label: 'Shoe', src: `${I}/item-shoe.png` }, { label: 'Shell', src: `${I}/item-shell.png` }, { label: 'Wheel', src: `${I}/item-wheel.png` }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-u2l5-shelly-sad-wide.png`, line: 'Shelly is gray.', isTrue: true },
        { img: `${S}/bg-u2l5-shelly-red-wide.png`, line: 'Bella gives Shelly a red circle.', isTrue: true },
        { img: `${S}/bg-u2l5-shelly-yellow-wide.png`, line: 'Leo gives Shelly a green square.', isTrue: false },
        { img: `${S}/bg-u2l5-shelly-rainbow-wide.png`, line: 'Shelly is sad.', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'Sh, Wh, or C?', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: sea, choices: ['Sh', 'Wh', 'C'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'ship', answer: 'Sh', picture: `${I}/item-ship.png` },
        { word: 'whale', answer: 'Wh', picture: `${I}/item-whale.png` },
        { word: 'shell', answer: 'Sh', picture: `${I}/item-shell.png` },
        { word: 'clock', answer: 'C', picture: `${I}/item-clock.png` },
        { word: 'shoe', answer: 'Sh', picture: `${I}/item-shoe.png` },
      ] },
    { kind: 'treasure', name: 'Mystery Box', icon: `${K}/chest-closed.png`, intro: 'Tap the box to open it!', img: sea, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! Shelly says thank you!' },
  ],
};
