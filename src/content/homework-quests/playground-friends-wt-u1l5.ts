import type { HomeworkQuest } from './types';

const W = '/welcome-town';
const story = (n: number) => `${W}/scenes/bg-wt5-story-${n}-wide.png`;
const spr = (f: string) => `${W}/sprites/${f}.png`;

/** A1 Unit 1 Lesson 5 "Storybook: The Playground Friends" — Playground Friends Quest.
 *  Re-reads the story at home: who is where, how Leo feels, the new friend Bella, goodbye;
 *  and blending CVC words (Sound Train). */
export const QUEST_PLAYGROUND_FRIENDS_WT_U1L5: HomeworkQuest = {
  id: 'playground-friends-wt-u1l5',
  title: 'Playground Friends Quest',
  subtitle: 'The Playground Friends · A1 Unit 1 · Lesson 5',
  level: 'A1',
  lessonKey: 'wt-rich-1-5',
  theme: { accent: '#F97316', accent2: '#22C55E', night: false, mapImg: story(6), guide: spr('pip-wave'), walker: spr('leo-wave') },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Story Pictures', icon: '📖', intro: 'Listen. Tap the picture from the story!', img: story(1),
      rounds: [
        { line: 'Mia is on the slide.', answer: 'slide', options: [{ label: 'slide', src: story(2) }, { label: 'swing', src: story(3) }, { label: 'sandbox', src: story(5) }] },
        { line: 'Leo is sad on the swing.', answer: 'swing', options: [{ label: 'gate', src: story(1) }, { label: 'swing', src: story(3) }, { label: 'goodbye', src: story(6) }] },
        { line: 'Goodbye, friends!', answer: 'goodbye', options: [{ label: 'slide', src: story(2) }, { label: 'sandbox', src: story(5) }, { label: 'goodbye', src: story(6) }] },
      ] },
    { kind: 'reading', name: 'Read the Story', icon: '📚', intro: 'Read the story. Then answer from memory!', img: story(4),
      sentences: ['Pip goes to the playground.', 'Mia is on the slide. She is happy.', 'Leo is on the swing. He is sad.', '“Let’s play!” Now Leo is happy.', 'A new girl says: “My name is Bella.”', '“Goodbye, friends!”'],
      questions: [
        { q: 'Who is sad?', options: ['Mia', 'Leo', 'Pip'], answer: 'Leo' },
        { q: 'What is the new friend’s name?', options: ['Bella', 'Willow', 'Mia'], answer: 'Bella' },
        { q: 'How is Leo at the end?', options: ['Sad', 'Happy', 'Tired'], answer: 'Happy' },
      ] },
    { kind: 'sentence-builder', name: 'Story Lines', icon: '🧱', intro: 'Listen. Build the line from the story!',
      rounds: [
        { img: story(3), line: 'How are you, Leo?', extra: ['name'] },
        { img: story(4), line: 'Let’s play!', extra: ['Bye'] },
        { img: story(5), line: 'My name is Bella.', extra: ['sad'] },
      ] },
    { kind: 'sound-blend', name: 'Sound Train', icon: '🚂', intro: 'Tap each sound. Then blend them and find the picture!', img: `${W}/scenes/bg-classroom-reading-wide.png`, voice: 'pip',
      rounds: [{ word: 'sad', picture: '/lep1/items/item-sad.png' }, { word: 'ant', picture: '/lep1/items/item-ant.png' }, { word: 'yak', picture: '/lep1/items/item-yak.png' }, { word: 'egg', sounds: ['e', 'g'], picture: '/lep1/items/item-egg.png' }] },
    { kind: 'treasure', name: 'Story Box', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the box to open it!', img: story(6), closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! You can tell the story!' },
  ],
};
