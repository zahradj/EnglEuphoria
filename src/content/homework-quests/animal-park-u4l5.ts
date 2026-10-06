import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const park = `${S}/bg-u4l5-park-wide.png`;
const tiger = `${S}/bg-u4l5-tiger-head-wide.png`;
const monkey = `${S}/bg-u4l5-monkey-arms-wide.png`;
const elephant = `${S}/bg-u4l5-elephant-feet-wide.png`;
const seal = `${S}/bg-u4l5-seal-hands-wide.png`;

/** Pre-A1 Unit 4 Lesson 5 "From Head to Toe" — Animal Park Quest.
 *  Recalls the story's moves (turn your head, wave your arms, stomp your feet,
 *  clap your hands), "Can you do it? — I can do it!", and T /t/. */
export const QUEST_ANIMAL_PARK_U4L5: HomeworkQuest = {
  id: 'animal-park-u4l5',
  title: 'Animal Park Quest',
  subtitle: 'From Head to Toe · Pre-A1 Unit 4 · Lesson 5',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-4-5',
  theme: { accent: '#22C55E', accent2: '#F97316', night: false, mapImg: park, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! You can do it!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Who Can Do It?', icon: '🐘', intro: 'Listen. Tap the animal. Then do the move!', img: park,
      rounds: [
        { line: 'Who stomps his feet?', answer: 'elephant', options: [{ label: 'tiger', src: tiger }, { label: 'elephant', src: elephant }, { label: 'seal', src: seal }] },
        { line: 'Who claps her hands?', answer: 'seal', options: [{ label: 'seal', src: seal }, { label: 'monkey', src: monkey }, { label: 'tiger', src: tiger }] },
        { line: 'Who waves his arms?', answer: 'monkey', options: [{ label: 'elephant', src: elephant }, { label: 'seal', src: seal }, { label: 'monkey', src: monkey }] },
        { line: 'Who turns his head?', answer: 'tiger', options: [{ label: 'tiger', src: tiger }, { label: 'monkey', src: monkey }, { label: 'elephant', src: elephant }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: monkey, line: 'The monkey waves his arms!', isTrue: true },
        { img: elephant, line: 'The elephant claps his hands!', isTrue: false },
        { img: tiger, line: 'The tiger turns his head!', isTrue: true },
        { img: seal, line: 'The seal stomps her feet!', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'T or B?', icon: '🐯', intro: 'Listen to the word. Which sound does it start with?', img: park, choices: ['T', 'B'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'ten', answer: 'T', picture: `${I}/item-ten.png` },
        { word: 'bear', answer: 'B', picture: `${I}/item-bear.png` },
        { word: 'teddy', answer: 'T', picture: `${I}/item-teddy.png` },
        { word: 'ball', answer: 'B', picture: `${I}/item-ball-red.png` },
        { word: 'train', answer: 'T', picture: `${I}/item-train.png` },
      ] },
    { kind: 'treasure', name: 'Park Chest', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: park, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! From head to toe — you can do it! Bye, animals!' },
  ],
};
