import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const show = `${S}/bg-u3l4-showtell-wide.png`;

/** Pre-A1 Unit 3 Lesson 4 "My Favorite Toy" — Show and Tell Quest.
 *  Practises "What's your favorite toy? — My favorite toy is my …", big /
 *  small, the Show and Tell story (sharing) and P /p/. */
export const QUEST_SHOW_TELL_U3L4: HomeworkQuest = {
  id: 'show-tell-u3l4',
  title: 'Show and Tell Quest',
  subtitle: 'My Favorite Toy · Pre-A1 Unit 3 · Lesson 4',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-3-4',
  theme: { accent: '#8B5CF6', accent2: '#F59E0B', night: false, mapImg: show, guide: `${C}/leo-happy.png`, walker: `${C}/bella-hello.png` },
  voice: 'teacher',
  praise: { voice: 'leo', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'tap-hotspot', name: 'Favorite Toys', icon: '⭐', intro: 'Listen. Find the favorite toy!', img: show, aspect: 1376 / 768,
      spots: [
        { label: 'ball', box: { x: 13, y: 52, w: 16, h: 30 } },
        { label: 'robot', box: { x: 30, y: 54, w: 14, h: 30 } },
        { label: 'teddy', box: { x: 45, y: 53, w: 15, h: 30 } },
        { label: 'kite', box: { x: 69, y: 52, w: 17, h: 32 } },
      ],
      rounds: [
        { target: 'teddy', line: 'My favorite toy is my teddy bear!' },
        { target: 'kite', line: 'My favorite toy is my kite!' },
        { target: 'ball', line: 'My favorite toy is my ball!' },
        { target: 'robot', line: 'My favorite toy is my robot!' },
      ] },
    { kind: 'true-false', name: 'Show and Tell', icon: '📖', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-u3l4-leo-wide.png`, line: 'Leo has a big teddy bear.', isTrue: true },
        { img: `${S}/bg-u3l4-mia-wide.png`, line: 'Mia has a big robot.', isTrue: false },
        { img: `${S}/bg-u3l4-mia-wide.png`, line: 'Mia has a small robot.', isTrue: true },
        { img: `${S}/bg-u3l4-share-wide.png`, line: 'Pip shares his ball.', isTrue: true },
      ] },
    { kind: 'sound-choice', name: 'P, K, or T?', icon: '🍕', intro: 'Listen to the word. Which sound does it start with?', img: show, choices: ['P', 'K', 'T'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'pizza', answer: 'P', picture: `${I}/item-pizza.png` },
        { word: 'kite', answer: 'K', picture: `${I}/item-kite.png` },
        { word: 'pumpkin', answer: 'P', picture: `${I}/item-pumpkin.png` },
        { word: 'teddy', answer: 'T', picture: `${I}/item-teddy.png` },
        { word: 'plum', answer: 'P', picture: `${I}/item-plum.png` },
      ] },
    { kind: 'treasure', name: 'Toy Chest', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: `${S}/bg-u3l4-share-wide.png`, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! What is your favorite toy? Great sharing!' },
  ],
};
