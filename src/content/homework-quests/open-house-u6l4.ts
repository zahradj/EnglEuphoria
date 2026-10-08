import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const street = `${S}/bg-u6l4-street-wide.png`;
const bedroom = `${S}/bg-u6l4-bedroom-empty-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 6 Lesson 4 "My House" — Open House Quest.
 *  Reviews show and tell with colours + furniture ("My bed is red!") and the
 *  first sounds B and S. */
export const QUEST_OPEN_HOUSE_U6L4: HomeworkQuest = {
  id: 'open-house-u6l4',
  title: 'Open House Quest',
  subtitle: 'My House · Pre-A1 Unit 6 · Lesson 4',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-6-4',
  theme: { accent: '#8B5CF6', accent2: '#F59E0B', night: false, mapImg: street, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great show and tell!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Which One?', icon: '🛏️', intro: 'Listen. Tap the right picture!', img: bedroom,
      rounds: [
        { line: 'My bed is red!', answer: 'red bed', options: [{ label: 'blue bed', src: it('bed') }, { label: 'red bed', src: it('bed-red') }, { label: 'green bed', src: it('bed-green') }] },
        { line: 'My chair is blue!', answer: 'blue chair', options: [{ label: 'blue chair', src: it('chair-blue') }, { label: 'yellow chair', src: it('chair-yellow') }, { label: 'red chair', src: it('chair') }] },
        { line: 'My sofa is green!', answer: 'green sofa', options: [{ label: 'blue sofa', src: it('sofa-blue') }, { label: 'orange sofa', src: it('sofa') }, { label: 'green sofa', src: it('sofa-green') }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: it('bed-yellow'), line: 'My bed is yellow!', isTrue: true },
        { img: it('chair-green'), line: 'My chair is red!', isTrue: false },
        { img: it('sofa-blue'), line: 'My sofa is blue!', isTrue: true },
        { img: street, line: 'The blue house is in the middle!', isTrue: true },
      ] },
    { kind: 'sound-choice', name: 'First Sounds', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: street, choices: ['B', 'S'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'bed', answer: 'B', picture: it('bed') },
        { word: 'sofa', answer: 'S', picture: it('sofa') },
        { word: 'ball', answer: 'B', picture: it('ball') },
        { word: 'sun', answer: 'S', picture: it('sun') },
      ] },
    { kind: 'treasure', name: 'House Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: street, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'This is my house! My bed is red! Come and see!' },
  ],
};
