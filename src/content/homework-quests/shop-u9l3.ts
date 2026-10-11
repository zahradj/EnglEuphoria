import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const shop = `${S}/bg-u9l3-shop-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 9 Lesson 3 "Coat, Skirt, T-shirt!" — Shop Quest.
 *  Practises coat, skirt, T-shirt with colours ("A red coat, please!") and the sounds T and C. */
export const QUEST_SHOP_U9L3: HomeworkQuest = {
  id: 'shop-u9l3',
  title: 'Shop Quest',
  subtitle: 'Coat, Skirt, T-shirt! · Pre-A1 Unit 9 · Lesson 3',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-9-3',
  theme: { accent: '#EC4899', accent2: '#F59E0B', night: false, mapImg: shop, guide: `${C}/bella-happy.png`, walker: `${C}/bella-hello.png` },
  voice: 'teacher',
  praise: { voice: 'bella', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Colour Shop', icon: '🛍️', intro: 'Listen. What does your friend want?', img: shop,
      rounds: [
        { line: 'A red coat, please!', answer: 'red coat', options: [{ label: 'blue coat', src: it('coat-blue') }, { label: 'red coat', src: it('coat-red') }, { label: 'yellow T-shirt', src: it('tshirt-yellow') }] },
        { line: 'A pink skirt, please!', answer: 'pink skirt', options: [{ label: 'pink skirt', src: it('skirt-pink') }, { label: 'purple skirt', src: it('skirt-purple') }, { label: 'red coat', src: it('coat-red') }] },
        { line: 'A green T-shirt, please!', answer: 'green T-shirt', options: [{ label: 'yellow T-shirt', src: it('tshirt-yellow') }, { label: 'blue coat', src: it('coat-blue') }, { label: 'green T-shirt', src: it('tshirt-green') }] },
        { line: 'A blue coat, please!', answer: 'blue coat', options: [{ label: 'green T-shirt', src: it('tshirt-green') }, { label: 'blue coat', src: it('coat-blue') }, { label: 'pink skirt', src: it('skirt-pink') }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '✅', intro: 'Look and listen. Is it right?',
      rounds: [
        { img: shop, line: 'It is a coat.', isTrue: true, sticker: { src: it('coat-blue'), x: 50, y: 92, w: 16 } },
        { img: shop, line: 'It is a T-shirt.', isTrue: false, sticker: { src: it('skirt-pink'), x: 50, y: 92, w: 16 } },
        { img: shop, line: 'It is a yellow T-shirt.', isTrue: true, sticker: { src: it('tshirt-yellow'), x: 50, y: 92, w: 16 } },
      ] },
    { kind: 'sound-choice', name: 'T or C?', icon: '🔤', intro: 'Listen to the word. Does it start with T or C?', img: shop, choices: ['T', 'C'], phonics: true,
      rounds: [
        { word: 'T-shirt', answer: 'T', picture: it('tshirt-yellow') },
        { word: 'coat', answer: 'C', picture: it('coat-blue') },
        { word: 'cat', answer: 'C', picture: it('cat') },
        { word: 'teddy', answer: 'T', picture: it('teddy') },
      ] },
    { kind: 'treasure', name: 'Shop Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: shop, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Coat, skirt, T-shirt! Thank you for shopping!' },
  ],
};
