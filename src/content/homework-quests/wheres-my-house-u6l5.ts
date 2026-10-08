import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const street = `${S}/bg-u6l5-street-wide.png`;
const sc = (n: string) => `${S}/bg-u6l5-${n}-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 6 Lesson 5 "Where's My House?" — Find My House Quest.
 *  Reviews the story ("Is this my house? No, it isn't! / Yes, it is!"), the door
 *  colours and the order of the story. */
export const QUEST_WHERES_MY_HOUSE_U6L5: HomeworkQuest = {
  id: 'wheres-my-house-u6l5',
  title: 'Find My House Quest',
  subtitle: "Where's My House? · Pre-A1 Unit 6 · Lesson 5",
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-6-5',
  theme: { accent: '#EA580C', accent2: '#DC2626', night: false, mapImg: street, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'You found it!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Which Door?', icon: '🚪', intro: 'Listen. Tap the right door!', img: street,
      rounds: [
        { line: 'My house has a red door!', answer: 'red door', options: [{ label: 'blue door', src: it('u6l5-door-blue') }, { label: 'red door', src: it('u6l5-door-red') }, { label: 'yellow door', src: it('u6l5-door-yellow') }] },
        { line: 'Find the yellow door!', answer: 'yellow door', options: [{ label: 'yellow door', src: it('u6l5-door-yellow') }, { label: 'red door', src: it('u6l5-door-red') }, { label: 'blue door', src: it('u6l5-door-blue') }] },
        { line: 'Find the blue door!', answer: 'blue door', options: [{ label: 'red door', src: it('u6l5-door-red') }, { label: 'yellow door', src: it('u6l5-door-yellow') }, { label: 'blue door', src: it('u6l5-door-blue') }] },
      ] },
    { kind: 'true-false', name: 'Is This My House?', icon: '🏠', intro: 'Pip\'s house has a red door. Look: is it Pip\'s house?',
      rounds: [
        { img: sc('blue-a'), line: 'Is this my house?', isTrue: false },
        { img: sc('red-a'), line: 'Is this my house?', isTrue: true },
        { img: sc('yellow-a'), line: 'Is this my house?', isTrue: false },
        { img: sc('red-c'), line: 'Welcome home, Pip!', isTrue: true },
      ] },
    { kind: 'treasure', name: 'Home Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: sc('red-c'), closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Is this my house? Yes, it is! Welcome home!' },
  ],
};
