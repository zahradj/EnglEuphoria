import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const station = `${S}/bg-u4l6-station-wide.png`;
const room = `${S}/bg-u4l6-room-wide.png`;

/** Pre-A1 Unit 4 Lesson 6 "Simon Says Body Parts" — Space Station Quest.
 *  Reviews the unit's body words with "Touch your …!" and Simon Says, face or
 *  body, and the unit's sounds E N F B. */
export const QUEST_SPACE_STATION_U4L6: HomeworkQuest = {
  id: 'space-station-u4l6',
  title: 'Space Station Quest',
  subtitle: 'Simon Says Body Parts · Pre-A1 Unit 4 · Lesson 6',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-4-6',
  theme: { accent: '#3B82F6', accent2: '#F97316', night: false, mapImg: station, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Beep beep! Perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Simon Says', icon: '🤖', intro: 'Listen. Touch it on your body, then tap the picture!', img: room,
      rounds: [
        { line: 'Simon says: touch your nose!', answer: 'nose', options: [{ label: 'eyes', src: `${I}/item-card-eyes.png` }, { label: 'nose', src: `${I}/item-card-nose.png` }, { label: 'foot', src: `${I}/item-part-foot.png` }] },
        { line: 'Simon says: clap your hands!', answer: 'hand', options: [{ label: 'hand', src: `${I}/item-part-hand.png` }, { label: 'ears', src: `${I}/item-card-ears.png` }, { label: 'mouth', src: `${I}/item-card-mouth.png` }] },
        { line: 'Simon says: touch your ears!', answer: 'ears', options: [{ label: 'arm', src: `${I}/item-part-arm.png` }, { label: 'nose', src: `${I}/item-card-nose.png` }, { label: 'ears', src: `${I}/item-card-ears.png` }] },
        { line: 'Simon says: stamp your feet!', answer: 'foot', options: [{ label: 'foot', src: `${I}/item-part-foot.png` }, { label: 'hand', src: `${I}/item-part-hand.png` }, { label: 'eyes', src: `${I}/item-card-eyes.png` }] },
      ] },
    { kind: 'true-false', name: 'Face or Not?', icon: '🙂', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${I}/item-card-eyes.png`, line: 'Eyes are on your face!', isTrue: true, aspect: 1 },
        { img: `${I}/item-part-foot.png`, line: 'A foot is on your face!', isTrue: false, aspect: 1 },
        { img: `${I}/item-card-mouth.png`, line: 'A mouth is on your face!', isTrue: true, aspect: 1 },
        { img: `${I}/item-part-hand.png`, line: 'A hand is on your face!', isTrue: false, aspect: 1 },
      ] },
    { kind: 'sound-choice', name: 'Space Sounds', icon: '🚀', intro: 'Listen to the word. Which sound does it start with?', img: room, choices: ['E', 'N', 'F', 'B'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'egg', answer: 'E', picture: `${I}/item-egg.png` },
        { word: 'nest', answer: 'N', picture: `${I}/item-nest.png` },
        { word: 'fish', answer: 'F', picture: `${I}/item-fish.png` },
        { word: 'bear', answer: 'B', picture: `${I}/item-bear.png` },
        { word: 'elephant', answer: 'E', picture: `${I}/item-elephant.png` },
      ] },
    { kind: 'treasure', name: 'Robo Chest', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: station, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! Head, shoulders, knees and toes! Beep beep, bye-bye!' },
  ],
};
