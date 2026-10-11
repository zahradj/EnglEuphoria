import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const shop = `${S}/bg-u7l1-petshop-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 7 Lesson 1 "Dog, Cat, Bird!" — Pet Shop Quest.
 *  Reviews the three pets with their sounds and the first sounds D, C, B. */
export const QUEST_PET_SHOP_U7L1: HomeworkQuest = {
  id: 'pet-shop-u7l1',
  title: 'Pet Shop Quest',
  subtitle: 'Dog, Cat, Bird! · Pre-A1 Unit 7 · Lesson 1',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-7-1',
  theme: { accent: '#0EA5E9', accent2: '#F97316', night: false, mapImg: shop, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Which Pet?', icon: '🐶', intro: 'Listen. Tap the right pet!', img: shop,
      rounds: [
        { line: "It's a dog!", answer: 'dog', options: [{ label: 'cat', src: it('cat') }, { label: 'dog', src: it('dog') }, { label: 'bird', src: it('bird') }] },
        { line: "It's a bird!", answer: 'bird', options: [{ label: 'bird', src: it('bird') }, { label: 'cat', src: it('cat') }, { label: 'dog', src: it('dog') }] },
        { line: "It's a cat!", answer: 'cat', options: [{ label: 'dog', src: it('dog') }, { label: 'bird', src: it('bird') }, { label: 'cat', src: it('cat') }] },
      ] },
    { kind: 'picture-choice', name: 'Who Says That?', icon: '🔊', intro: 'Listen to the sound. Who says it?', img: shop,
      rounds: [
        { line: 'Meow, meow!', answer: 'cat', options: [{ label: 'dog', src: it('dog') }, { label: 'cat', src: it('cat') }, { label: 'bird', src: it('bird') }] },
        { line: 'Tweet, tweet!', answer: 'bird', options: [{ label: 'cat', src: it('cat') }, { label: 'dog', src: it('dog') }, { label: 'bird', src: it('bird') }] },
        { line: 'Woof, woof!', answer: 'dog', options: [{ label: 'dog', src: it('dog') }, { label: 'bird', src: it('bird') }, { label: 'cat', src: it('cat') }] },
      ] },
    { kind: 'sound-choice', name: 'First Sounds', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: shop, choices: ['D', 'C', 'B'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'dog', answer: 'D', picture: it('dog') },
        { word: 'cat', answer: 'C', picture: it('cat') },
        { word: 'bird', answer: 'B', picture: it('bird') },
        { word: 'duck', answer: 'D', picture: it('duck-yellow') },
      ] },
    { kind: 'treasure', name: 'Pet Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: shop, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Dog, cat, bird! Woof, meow, tweet! I love my pets!' },
  ],
};
