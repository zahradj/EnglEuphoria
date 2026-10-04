import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const party = `${S}/bg-u2l4-party-wide.png`;

/** Pre-A1 Unit 2 Lesson 4 "What Color Is This?" — Question Party Quest.
 *  Practises only what the lesson taught: "What color / shape is this?",
 *  "Is it …? — Yes, it is. / No, it isn't.", all six colours and three
 *  shapes, and WH saying /w/. */
export const QUEST_QUESTION_PARTY_U2L4: HomeworkQuest = {
  id: 'question-party-u2l4',
  title: 'Question Party Quest',
  subtitle: 'What Color Is This? · Pre-A1 Unit 2 · Lesson 4',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-2-4',
  theme: { accent: '#A855F7', accent2: '#22C55E', night: false, mapImg: party, guide: `${C}/pip-hello.png`, walker: `${C}/willow-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Find It', icon: '🔎', intro: 'Listen. Tap the right one!', img: party,
      rounds: [
        { line: 'Find a red circle.', answer: 'Balloon', options: [{ label: 'Pizza', src: `${I}/item-pizza-slice.png` }, { label: 'Balloon', src: `${I}/item-balloon-red.png` }, { label: 'Window', src: `${I}/item-window.png` }] },
        { line: 'Find a triangle.', answer: 'Flag', options: [{ label: 'Flag', src: `${I}/item-flag.png` }, { label: 'Clock', src: `${I}/item-clock.png` }, { label: 'Present', src: `${I}/item-present.png` }] },
        { line: 'Find purple.', answer: 'Grapes', options: [{ label: 'Frog', src: `${I}/item-frog.png` }, { label: 'Carrot', src: `${I}/item-carrot.png` }, { label: 'Grapes', src: `${I}/item-grapes.png` }] },
        { line: 'Find a square.', answer: 'Window', options: [{ label: 'Window', src: `${I}/item-window.png` }, { label: 'Cookie', src: `${I}/item-cookie.png` }, { label: 'Pizza', src: `${I}/item-pizza-slice.png` }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-u2l2-green-wide.png`, line: 'Is it green? Yes, it is.', isTrue: true },
        { img: `${S}/bg-u2l3-clock-wide.png`, line: 'Is it a triangle? Yes, it is.', isTrue: false },
        { img: `${S}/bg-u2l2-purple-wide.png`, line: "Is it orange? No, it isn't.", isTrue: true },
        { img: `${S}/bg-u2l3-pizza-wide.png`, line: 'Is it a triangle? Yes, it is.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Build It', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: `${S}/bg-u2l2-orange-wide.png`, line: 'What color is this?', extra: ['shape'] },
        { img: `${S}/bg-u2l3-window-wide.png`, line: 'What shape is this?', extra: ['color'] },
        { img: `${S}/bg-u2l2-green-wide.png`, line: 'Is it green?', extra: ['red'] },
      ] },
    { kind: 'sound-choice', name: 'Wh, C, or G?', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: party, choices: ['Wh', 'C', 'G'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'whale', answer: 'Wh', picture: `${I}/item-whale.png` },
        { word: 'clock', answer: 'C', picture: `${I}/item-clock.png` },
        { word: 'wheel', answer: 'Wh', picture: `${I}/item-wheel.png` },
        { word: 'green', answer: 'G', picture: `${I}/item-leaf.png` },
        { word: 'whistle', answer: 'Wh', picture: `${I}/item-whistle.png` },
      ] },
    { kind: 'treasure', name: 'Mystery Box', icon: `${K}/chest-closed.png`, intro: 'Tap the box to open it!', img: party, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! You asked and answered! Great job!' },
  ],
};
