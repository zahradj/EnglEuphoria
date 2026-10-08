import type { HomeworkQuest } from './types';

const W = '/welcome-town/scenes';
const spr = (f: string) => `/welcome-town/sprites/${f}.png`;

/** A2 Unit 1 Lesson 1 "My Day" — Pip's Day Quest.
 *  Practises the daily routine (wake up, brush my teeth, eat breakfast, walk
 *  to school, play, read, sleep), he / she / they + is / are, and magic e. */
export const QUEST_MY_DAY_A2_U1L1: HomeworkQuest = {
  id: 'my-day-a2-u1l1',
  title: 'Pip’s Day Quest',
  subtitle: 'My Day · A2 Unit 1 · Lesson 1',
  level: 'A2',
  lessonKey: 'wt-a2-rich-1-1',
  theme: { accent: '#F59E0B', accent2: '#6366F1', night: false, mapImg: `${W}/bg-a2-morning.png`, guide: spr('pip-happy'), walker: spr('pip-wave') },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Morning to Night', icon: '⏰', intro: 'Listen. Tap the right picture!', img: `${W}/bg-a2-morning.png`,
      rounds: [
        { line: 'Every morning, I brush my teeth!', answer: 'Teeth', options: [{ label: 'Breakfast', src: `${W}/bg-a2-kitchen.png` }, { label: 'Teeth', src: `${W}/bg-a2-bathroom.png` }, { label: 'Sleep', src: `${W}/bg-a2-bedroom-asleep.png` }] },
        { line: 'I walk to school!', answer: 'School', options: [{ label: 'School', src: `${W}/bg-a2-street.png` }, { label: 'Read', src: `${W}/bg-a2-bedroom-night.png` }, { label: 'Wake', src: `${W}/bg-a2-morning.png` }] },
        { line: 'At night, I read my favorite book.', answer: 'Read', options: [{ label: 'Play', src: `${W}/bg-a2-playground.png` }, { label: 'Breakfast', src: `${W}/bg-a2-kitchen.png` }, { label: 'Read', src: `${W}/bg-a2-bedroom-night.png` }] },
        { line: 'I am thirsty! I drink some water.', answer: 'Thirsty', options: [{ label: 'Thirsty', src: `${W}/bg-a2-thirsty.png` }, { label: 'Teeth', src: `${W}/bg-a2-bathroom.png` }, { label: 'School', src: `${W}/bg-a2-street.png` }] },
      ] },
    { kind: 'sentence-builder', name: 'He, She, They', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: `${W}/bg-a2-playground.png`, line: 'They are happy.', extra: ['is'] },
        { img: `${W}/bg-a2-playground.png`, line: 'She is happy too!', extra: ['are'] },
        { img: `${W}/bg-a2-kitchen.png`, line: 'I eat my breakfast.', extra: ['sleep'] },
      ] },
    { kind: 'reading', name: 'A Day with Pip', icon: '📖', intro: 'Read the story. Then answer from memory!', img: `${W}/bg-a2-morning.png`,
      sentences: ['It is morning. Pip wakes up. "Good morning!"', 'Pip brushes his teeth. Scrub, scrub, scrub!', 'Pip eats breakfast. Yum, yum!', 'Pip puts on his backpack and walks to school.', 'At recess, Pip plays with his friends.', 'At night, Pip reads a book. Then he sleeps.'],
      questions: [
        { q: 'What does Pip do first?', options: ['He wakes up', 'He sleeps', 'He plays'], answer: 'He wakes up' },
        { q: 'What does Pip do at recess?', options: ['He reads', 'He plays', 'He eats'], answer: 'He plays' },
        { q: 'What does Pip do at night?', options: ['He walks to school', 'He brushes his teeth', 'He reads a book'], answer: 'He reads a book' },
      ] },
    { kind: 'sound-choice', name: 'Magic E', icon: '✨', intro: 'Listen to the word. Short sound, or magic e?', img: `${W}/bg-a2-playground.png`, choices: ['a', 'a_e', 'i', 'i_e'],
      rounds: [
        { word: 'cap', answer: 'a', emoji: '🧢' },
        { word: 'cape', answer: 'a_e', emoji: '🦸' },
        { word: 'kite', answer: 'i_e', emoji: '🪁' },
        { word: 'sit', answer: 'i', emoji: '🪑' },
      ] },
    { kind: 'treasure', name: 'Day Box', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the box to open it!', img: `${W}/bg-a2-bedroom-asleep.png`, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! What a busy day! Good night, Pip!' },
  ],
};
