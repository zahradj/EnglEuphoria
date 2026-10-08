import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const night = `${S}/bg-u6l6-gamenight-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 6 Lesson 6 "My House Game" — House Champion Quest.
 *  Reviews the whole unit: rooms, furniture with colours, and the first sounds
 *  K, CH, B, S. */
export const QUEST_MY_HOUSE_GAME_U6L6: HomeworkQuest = {
  id: 'my-house-game-u6l6',
  title: 'House Champion Quest',
  subtitle: 'My House Game · Pre-A1 Unit 6 · Lesson 6',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-6-6',
  theme: { accent: '#7C3AED', accent2: '#EA580C', night: false, mapImg: night, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Which Room?', icon: '🏠', intro: 'Listen. Tap the right room!', img: night,
      rounds: [
        { line: "It's the kitchen!", answer: 'kitchen', options: [{ label: 'bedroom', src: it('room-bedroom') }, { label: 'kitchen', src: it('room-kitchen') }, { label: 'bathroom', src: it('room-bathroom') }] },
        { line: "It's the bathroom!", answer: 'bathroom', options: [{ label: 'bathroom', src: it('room-bathroom') }, { label: 'living room', src: it('room-living-room') }, { label: 'kitchen', src: it('room-kitchen') }] },
        { line: "It's the living room!", answer: 'living room', options: [{ label: 'bedroom', src: it('room-bedroom') }, { label: 'kitchen', src: it('room-kitchen') }, { label: 'living room', src: it('room-living-room') }] },
      ] },
    { kind: 'picture-choice', name: 'What Colour?', icon: '🎨', intro: 'Listen. Tap the right picture!', img: night,
      rounds: [
        { line: 'The bed is red!', answer: 'red bed', options: [{ label: 'red bed', src: it('bed-red') }, { label: 'yellow bed', src: it('bed-yellow') }, { label: 'green bed', src: it('bed-green') }] },
        { line: 'The sofa is green!', answer: 'green sofa', options: [{ label: 'blue sofa', src: it('sofa-blue') }, { label: 'red sofa', src: it('sofa-red') }, { label: 'green sofa', src: it('sofa-green') }] },
        { line: 'The chair is blue!', answer: 'blue chair', options: [{ label: 'yellow chair', src: it('chair-yellow') }, { label: 'blue chair', src: it('chair-blue') }, { label: 'green chair', src: it('chair-green') }] },
      ] },
    { kind: 'sound-choice', name: 'First Sounds', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: night, choices: ['K', 'CH', 'B', 'S'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'kitchen', answer: 'K', picture: it('room-kitchen') },
        { word: 'chair', answer: 'CH', picture: it('chair') },
        { word: 'bed', answer: 'B', picture: it('bed') },
        { word: 'sofa', answer: 'S', picture: it('sofa') },
      ] },
    { kind: 'treasure', name: 'Champion Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: night, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You are the House Champion! I love my house!' },
  ],
};
