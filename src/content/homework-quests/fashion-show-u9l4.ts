import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const stage = `${S}/bg-u9l4-stage-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 9 Lesson 4 "What Are You Wearing?" — Fashion Show Quest.
 *  Practises "I'm wearing a … !" with clothes and colours and the sound P. */
export const QUEST_FASHION_SHOW_U9L4: HomeworkQuest = {
  id: 'fashion-show-u9l4',
  title: 'Fashion Show Quest',
  subtitle: 'What Are You Wearing? · Pre-A1 Unit 9 · Lesson 4',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-9-4',
  theme: { accent: '#DB2777', accent2: '#FBBF24', night: false, mapImg: stage, guide: `${C}/mia-happy.png`, walker: `${C}/mia-hello.png` },
  voice: 'teacher',
  praise: { voice: 'mia', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'What Am I Wearing?', icon: '👗', intro: 'Listen. What is your friend wearing?', img: stage,
      rounds: [
        { line: "I'm wearing a yellow dress!", answer: 'yellow dress', options: [{ label: 'yellow dress', src: it('dress-yellow') }, { label: 'yellow T-shirt', src: it('tshirt-yellow') }, { label: 'blue coat', src: it('coat-blue') }] },
        { line: "I'm wearing a green hat!", answer: 'green hat', options: [{ label: 'red socks', src: it('socks-red') }, { label: 'green hat', src: it('hat-green') }, { label: 'green T-shirt', src: it('tshirt-green') }] },
        { line: "I'm wearing a red shirt!", answer: 'red shirt', options: [{ label: 'red coat', src: it('coat-red') }, { label: 'blue pants', src: it('pants-blue') }, { label: 'red shirt', src: it('shirt-red') }] },
        { line: "I'm wearing blue shoes!", answer: 'blue shoes', options: [{ label: 'blue shoes', src: it('shoes-blue') }, { label: 'blue pants', src: it('pants-blue') }, { label: 'red socks', src: it('socks-red') }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '✅', intro: 'Look and listen. Is it right?',
      rounds: [
        { img: stage, line: "I'm wearing a hat.", isTrue: true, sticker: { src: it('hat-green'), x: 50, y: 92, w: 16 } },
        { img: stage, line: "I'm wearing a dress.", isTrue: false, sticker: { src: it('pants-blue'), x: 50, y: 92, w: 16 } },
        { img: stage, line: "I'm wearing red socks.", isTrue: true, sticker: { src: it('socks-red'), x: 50, y: 92, w: 16 } },
      ] },
    { kind: 'sound-choice', name: 'P or D?', icon: '🔤', intro: 'Listen to the word. Does it start with P or D?', img: stage, choices: ['P', 'D'], phonics: true,
      rounds: [
        { word: 'pants', answer: 'P', picture: it('pants-blue') },
        { word: 'dress', answer: 'D', picture: it('dress-yellow') },
        { word: 'pig', answer: 'P', picture: it('pig') },
        { word: 'dog', answer: 'D', picture: it('dog') },
      ] },
    { kind: 'treasure', name: 'Show Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: stage, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'What a great fashion show! You are a star!' },
  ],
};
