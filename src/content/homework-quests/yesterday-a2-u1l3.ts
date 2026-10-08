import type { HomeworkQuest } from './types';

const W = '/welcome-town/scenes';
const spr = (f: string) => `/welcome-town/sprites/${f}.png`;

/** A2 Unit 1 Lesson 3 "Yesterday" — Pip's Yesterday Quest.
 *  Practises the past tense (woke up, brushed, ate, walked, played, read,
 *  slept), "What did you do yesterday?", and the ee sound (see, tree, sleep). */
export const QUEST_YESTERDAY_A2_U1L3: HomeworkQuest = {
  id: 'yesterday-a2-u1l3',
  title: 'Pip’s Yesterday Quest',
  subtitle: 'Yesterday · A2 Unit 1 · Lesson 3',
  level: 'A2',
  lessonKey: 'wt-a2-rich-1-3',
  theme: { accent: '#0EA5E9', accent2: '#F97316', night: false, mapImg: `${W}/bg-a2-street.png`, guide: spr('pip-happy'), walker: spr('pip-wave') },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'What Did Pip Do?', icon: '⏪', intro: 'Listen. Tap the right picture!', img: `${W}/bg-a2-street.png`,
      rounds: [
        { line: 'He brushed his teeth.', answer: 'Teeth', options: [{ label: 'Teeth', src: `${W}/bg-a2-bathroom.png` }, { label: 'Breakfast', src: `${W}/bg-a2-kitchen.png` }, { label: 'School', src: `${W}/bg-a2-street.png` }] },
        { line: 'He ate his breakfast.', answer: 'Breakfast', options: [{ label: 'Sleep', src: `${W}/bg-a2-bedroom-asleep.png` }, { label: 'Breakfast', src: `${W}/bg-a2-kitchen.png` }, { label: 'Play', src: `${W}/bg-a2-playground.png` }] },
        { line: 'He played with Mia and Leo.', answer: 'Play', options: [{ label: 'Teeth', src: `${W}/bg-a2-bathroom.png` }, { label: 'Read', src: `${W}/bg-a2-bedroom-night.png` }, { label: 'Play', src: `${W}/bg-a2-playground.png` }] },
        { line: 'Then he slept.', answer: 'Sleep', options: [{ label: 'Sleep', src: `${W}/bg-a2-bedroom-asleep.png` }, { label: 'School', src: `${W}/bg-a2-street.png` }, { label: 'Breakfast', src: `${W}/bg-a2-kitchen.png` }] },
      ] },
    { kind: 'sentence-builder', name: 'Yesterday', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: `${W}/bg-a2-morning.png`, line: 'Yesterday, I woke up.', extra: ['wake'] },
        { img: `${W}/bg-a2-street.png`, line: 'I walked to school.', extra: ['walk'] },
        { img: `${W}/bg-a2-bedroom-asleep.png`, line: 'Last night, I slept well.', extra: ['sleep'] },
      ] },
    { kind: 'reading', name: 'Pip’s Yesterday', icon: '📖', intro: 'Read the story. Then answer from memory!', img: `${W}/bg-a2-morning.png`,
      sentences: ['Yesterday morning, Pip woke up and stretched.', 'He brushed his teeth. Scrub, scrub, scrub!', 'He ate his breakfast. Yum, yum!', 'He walked to school with his backpack.', 'At recess, he played with Mia and Leo.', 'At night, he read his favorite book. Then he slept.'],
      questions: [
        { q: 'What did Pip eat?', options: ['Pizza', 'Breakfast', 'A cake'], answer: 'Breakfast' },
        { q: 'Who did Pip play with?', options: ['Mia and Leo', 'Bella', 'His teacher'], answer: 'Mia and Leo' },
        { q: 'What did Pip do at night?', options: ['He played soccer', 'He walked to school', 'He read a book'], answer: 'He read a book' },
      ] },
    { kind: 'sound-choice', name: 'The EE Sound', icon: '🌳', intro: 'Listen to the word. Which sound is in it?', img: `${W}/bg-a2-playground.png`, choices: ['ee', 'ay', 'i'],
      rounds: [
        { word: 'tree', answer: 'ee', emoji: '🌳' },
        { word: 'play', answer: 'ay', emoji: '⚽' },
        { word: 'sleep', answer: 'ee', emoji: '😴' },
        { word: 'kite', answer: 'i', emoji: '🪁' },
        { word: 'see', answer: 'ee', emoji: '👀' },
      ] },
    { kind: 'treasure', name: 'Memory Box', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the box to open it!', img: `${W}/bg-a2-bedroom-asleep.png`, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! What a busy yesterday!' },
  ],
};
