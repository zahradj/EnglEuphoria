import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const front = `${S}/bg-u6l1-house-front-wide.png`;
const house = `${S}/bg-u6l1-dollhouse-wide.png`;
const room = (n: string) => `${I}/item-room-${n}.png`;

/** Pre-A1 Unit 6 Lesson 1 "Kitchen, Bedroom, Bathroom!" — House Tour Quest.
 *  Reviews the four rooms ("This is the kitchen!", "In the bathroom!") and
 *  K says /k/ (kitchen, key, kitten, kangaroo). */
export const QUEST_HOUSE_TOUR_U6L1: HomeworkQuest = {
  id: 'house-tour-u6l1',
  title: 'House Tour Quest',
  subtitle: 'Kitchen, Bedroom, Bathroom! · Pre-A1 Unit 6 · Lesson 1',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-6-1',
  theme: { accent: '#F97316', accent2: '#0EA5E9', night: false, mapImg: front, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! You found it!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Which Room?', icon: '🏠', intro: 'Listen. Tap the right room!', img: house,
      rounds: [
        { line: 'This is the kitchen!', answer: 'kitchen', options: [{ label: 'kitchen', src: room('kitchen') }, { label: 'bedroom', src: room('bedroom') }, { label: 'bathroom', src: room('bathroom') }] },
        { line: 'This is the bathroom!', answer: 'bathroom', options: [{ label: 'living room', src: room('living-room') }, { label: 'bathroom', src: room('bathroom') }, { label: 'kitchen', src: room('kitchen') }] },
        { line: 'This is the bedroom!', answer: 'bedroom', options: [{ label: 'bathroom', src: room('bathroom') }, { label: 'living room', src: room('living-room') }, { label: 'bedroom', src: room('bedroom') }] },
        { line: 'This is the living room!', answer: 'living room', options: [{ label: 'living room', src: room('living-room') }, { label: 'kitchen', src: room('kitchen') }, { label: 'bedroom', src: room('bedroom') }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: room('bedroom'), line: 'This is the bedroom!', isTrue: true },
        { img: room('kitchen'), line: 'This is the bathroom!', isTrue: false },
        { img: room('living-room'), line: 'This is the living room!', isTrue: true },
        { img: room('bathroom'), line: 'This is the kitchen!', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'First Sounds', icon: '🔑', intro: 'Listen to the word. Which sound does it start with?', img: front, choices: ['K', 'B', 'T'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'key', answer: 'K', picture: `${I}/item-key.png` },
        { word: 'bed', answer: 'B', picture: room('bedroom') },
        { word: 'kitten', answer: 'K', picture: `${I}/item-kitten.png` },
        { word: 'kangaroo', answer: 'K', picture: `${I}/item-kangaroo.png` },
        { word: 'bath', answer: 'B', picture: room('bathroom') },
      ] },
    { kind: 'treasure', name: 'House Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: house, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Kitchen, bedroom, bathroom, living room — you know my house!' },
  ],
};
