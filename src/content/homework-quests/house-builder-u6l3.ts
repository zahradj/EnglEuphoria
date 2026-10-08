import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const house = `${S}/bg-u6l3-house-empty-wide.png`;
const family = `${S}/bg-u6l3-family-home-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 6 Lesson 3 "In My House" — House Builder Quest.
 *  Reviews rooms + furniture together ("The bed is in the bedroom!") and the
 *  first sounds B, K, S, T. */
export const QUEST_HOUSE_BUILDER_U6L3: HomeworkQuest = {
  id: 'house-builder-u6l3',
  title: 'House Builder Quest',
  subtitle: 'In My House · Pre-A1 Unit 6 · Lesson 3',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-6-3',
  theme: { accent: '#F97316', accent2: '#22C55E', night: false, mapImg: house, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great building!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Which Room?', icon: '🏠', intro: 'Listen. Tap the right room!', img: house,
      rounds: [
        { line: 'The bed is in the bedroom!', answer: 'bedroom', options: [{ label: 'bedroom', src: it('room-bedroom') }, { label: 'kitchen', src: it('room-kitchen') }, { label: 'bathroom', src: it('room-bathroom') }] },
        { line: 'The table is in the kitchen!', answer: 'kitchen', options: [{ label: 'living room', src: it('room-living-room') }, { label: 'kitchen', src: it('room-kitchen') }, { label: 'bedroom', src: it('room-bedroom') }] },
        { line: 'The sofa is in the living room!', answer: 'living room', options: [{ label: 'bathroom', src: it('room-bathroom') }, { label: 'bedroom', src: it('room-bedroom') }, { label: 'living room', src: it('room-living-room') }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: family, line: 'Mom is in the kitchen!', isTrue: true },
        { img: family, line: 'Dad is in the bathroom!', isTrue: false },
        { img: family, line: 'The baby is in the bedroom!', isTrue: true },
        { img: it('sofa'), line: 'It\'s a bed!', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'First Sounds', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: house, choices: ['B', 'K', 'S'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'bed', answer: 'B', picture: it('bed') },
        { word: 'key', answer: 'K', picture: it('key') },
        { word: 'sofa', answer: 'S', picture: it('sofa') },
        { word: 'kitten', answer: 'K', picture: it('kitten') },
      ] },
    { kind: 'treasure', name: 'House Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: family, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'The bed is in the bedroom! I love my house!' },
  ],
};
