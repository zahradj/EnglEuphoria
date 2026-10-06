import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const beach = `${S}/bg-u4l3-beach-wide.png`;

/** Pre-A1 Unit 4 Lesson 3 "Hands, Fingers, Feet, Arms!" — Beach Day Quest.
 *  Practises hands, fingers, feet, arms, "Clap your hands!" / "Stamp your
 *  feet!", "They're my hands!" and F /f/ (fish, fan, feet). */
export const QUEST_BEACH_DAY_U4L3: HomeworkQuest = {
  id: 'beach-day-u4l3',
  title: 'Beach Day Quest',
  subtitle: 'Hands, Fingers, Feet, Arms! · Pre-A1 Unit 4 · Lesson 3',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-4-3',
  theme: { accent: '#0EA5E9', accent2: '#F59E0B', night: false, mapImg: beach, guide: `${C}/bella-happy.png`, walker: `${C}/leo-happy.png` },
  voice: 'teacher',
  praise: { voice: 'bella', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Sand Prints', icon: '🖐️', intro: 'Listen. Tap the right body part!', img: `${S}/bg-u4l3-sand-wide.png`,
      rounds: [
        { line: 'Clap your hands!', answer: 'Hand', options: [{ label: 'Foot', src: `${I}/item-part-foot.png` }, { label: 'Hand', src: `${I}/item-part-hand.png` }, { label: 'Arm', src: `${I}/item-part-arm.png` }] },
        { line: 'Stamp your feet!', answer: 'Foot', options: [{ label: 'Foot', src: `${I}/item-part-foot.png` }, { label: 'Finger', src: `${I}/item-part-finger.png` }, { label: 'Hand', src: `${I}/item-part-hand.png` }] },
        { line: 'Wave your arms!', answer: 'Arm', options: [{ label: 'Hand', src: `${I}/item-part-hand.png` }, { label: 'Foot', src: `${I}/item-part-foot.png` }, { label: 'Arm', src: `${I}/item-part-arm.png` }] },
        { line: 'Wiggle your fingers!', answer: 'Finger', options: [{ label: 'Finger', src: `${I}/item-part-finger.png` }, { label: 'Arm', src: `${I}/item-part-arm.png` }, { label: 'Foot', src: `${I}/item-part-foot.png` }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-u4l3-bella-hands-wide.png`, line: "They're my hands!", isTrue: true },
        { img: `${S}/bg-u4l3-bella-feet-wide.png`, line: 'Wave your arms!', isTrue: false },
        { img: `${S}/bg-u4l3-bella-arms-wide.png`, line: 'Wave your arms!', isTrue: true },
        { img: `${S}/bg-u4l3-bella-fingers-wide.png`, line: 'Stamp your feet!', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'F, N, or E?', icon: '🐟', intro: 'Listen to the word. Which sound does it start with?', img: beach, choices: ['F', 'N', 'E'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'fish', answer: 'F', picture: `${I}/item-fish.png` },
        { word: 'nest', answer: 'N', picture: `${I}/item-nest.png` },
        { word: 'fan', answer: 'F', picture: `${I}/item-fan.png` },
        { word: 'egg', answer: 'E', picture: `${I}/item-egg.png` },
        { word: 'feather', answer: 'F', picture: `${I}/item-feather.png` },
      ] },
    { kind: 'treasure', name: 'Beach Chest', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: beach, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! Hands, fingers, feet and arms! What a beach day!' },
  ],
};
