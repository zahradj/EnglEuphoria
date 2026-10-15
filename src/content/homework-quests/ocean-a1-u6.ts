import type { HomeworkQuest } from './types';

/* A1 Ocean Explorers (Unit 6) homework quests, one per lesson — the same level kinds as the Unit 2-5 quests. */

const S = '/lep1/scenes';
const it = (n: string) => `/lep1/items/item-${n}.png`;
const page = (n: number) => `${S}/bg-a1u6-story-${n}-wide.png`;
const reef = `${S}/bg-a1u6-reef-wide.png`;
const theme = (mapImg: string) => ({ accent: '#0EA5E9', accent2: '#FE6A2F', night: false, mapImg, guide: '/lep1/characters/pip-happy.png', walker: '/lep1/characters/mia-hello.png' });
const praise = { voice: 'pip' as const, lines: ['Yes! Great job!', 'Splash-tastic!', 'Wow, perfect!'], tryAgain: 'Try again!' };
const chest = (win: string, img = reef) => ({ kind: 'treasure' as const, name: 'Sea Chest', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the chest to open it!', img, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win });

/** Lesson 1 "Meet the Sea Animals: Shark, Whale" */
export const QUEST_SEA_ANIMALS_A1_U6L1: HomeworkQuest = {
  id: 'sea-animals-a1-u6l1', title: 'Sea Animals Quest', subtitle: 'Meet the Sea Animals · A1 Unit 6 · Lesson 1', level: 'A1', lessonKey: 'ocean-rich-6-1',
  theme: theme(page(1)), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Which Animal?', icon: '🐳', intro: 'Listen. Tap the animal!', img: reef,
      rounds: [
        { line: 'It’s a shark.', answer: 'shark', options: [{ label: 'shark', src: it('shark') }, { label: 'whale', src: it('whale') }, { label: 'turtle', src: it('turtle') }] },
        { line: 'It’s a starfish.', answer: 'starfish', options: [{ label: 'turtle', src: it('turtle') }, { label: 'starfish', src: it('starfish') }, { label: 'shark', src: it('shark') }] },
        { line: 'It’s a turtle.', answer: 'turtle', options: [{ label: 'whale', src: it('whale') }, { label: 'starfish', src: it('starfish') }, { label: 'turtle', src: it('turtle') }] },
        { line: 'They’re sharks.', answer: 'sharks', options: [{ label: 'sharks', src: it('sharks') }, { label: 'shark', src: it('shark') }, { label: 'turtles', src: it('turtles') }] },
      ] },
    { kind: 'true-false', name: 'Big or Small?', icon: '❓', intro: 'Look and listen. True or false?',
      rounds: [
        { img: page(3), aspect: 16 / 9, line: 'It is a whale. It is big.', isTrue: true },
        { img: page(1), aspect: 16 / 9, line: 'It is sunny.', isTrue: true },
        { img: page(2), aspect: 16 / 9, line: 'This is a shark.', isTrue: false },
      ] },
    { kind: 'sentence-builder', name: 'One or Many?', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('whale'), line: 'It is a whale.', extra: ['They'] },
        { img: it('turtles'), line: 'They are turtles.', extra: ['It'] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(3),
      sentences: ['It is sunny. Look! A boat on the sea.', 'This is Coral. She lives in the sea.', 'It is a whale. It is big! It is a turtle.'],
      questions: [
        { q: 'Who lives in the sea?', options: ['Coral', 'Pip', 'Leo'], answer: 'Coral' },
        { q: 'What is big?', options: ['The whale', 'The turtle', 'The boat'], answer: 'The whale' },
      ] },
    { kind: 'twister', name: 'Whale Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: reef, line: 'Why do white whales whistle?', seconds: 45, focus: 'wh', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: reef,
      rounds: [
        { word: 'wheel', sounds: ['wh', 'ee', 'l'], picture: it('wheel') },
        { word: 'whisk', sounds: ['wh', 'i', 's', 'k'], picture: it('whisk') },
      ] },
    chest('You did it! Sea explorer!'),
  ],
};

/** Lesson 2 "More Sea Animals: Octopus, Crab" */
export const QUEST_REEF_ACTIONS_A1_U6L2: HomeworkQuest = {
  id: 'reef-actions-a1-u6l2', title: 'Live Reef Quest', subtitle: 'Octopus, Crab · A1 Unit 6 · Lesson 2', level: 'A1', lessonKey: 'ocean-rich-6-2',
  theme: theme(page(4)), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'What Is It Doing?', icon: '🦀', intro: 'Listen. Tap the picture!', img: reef,
      rounds: [
        { line: 'The crab is walking.', answer: 'walking', options: [{ label: 'walking', src: it('crab-walking') }, { label: 'hiding', src: it('bub-hiding') }, { label: 'sleeping', src: it('starfish-sleeping') }] },
        { line: 'The octopus is hiding.', answer: 'hiding', options: [{ label: 'eating', src: it('fish-eating') }, { label: 'hiding', src: it('bub-hiding') }, { label: 'diving', src: it('whale-diving') }] },
        { line: 'The whale is diving.', answer: 'diving', options: [{ label: 'sleeping', src: it('starfish-sleeping') }, { label: 'walking', src: it('crab-walking') }, { label: 'diving', src: it('whale-diving') }] },
        { line: 'The fish is eating.', answer: 'eating', options: [{ label: 'eating', src: it('fish-eating') }, { label: 'hiding', src: it('bub-hiding') }, { label: 'walking', src: it('crab-walking') }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '❓', intro: 'Look and listen. True or false?',
      rounds: [
        { img: page(5), aspect: 16 / 9, line: 'The crab is walking.', isTrue: true },
        { img: page(5), aspect: 16 / 9, line: 'The starfish is swimming.', isTrue: false },
        { img: page(4), aspect: 16 / 9, line: 'Bub is hiding.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Is or Are?', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('starfish-sleeping'), line: 'The starfish is sleeping.', extra: ['are'] },
        { img: it('fish-school'), line: 'The fish are swimming.', extra: ['is'] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(5),
      sentences: ['This is Bub. Bub is an octopus. He is hiding.', 'The crab is walking. The starfish is sleeping.'],
      questions: [
        { q: 'What is Bub doing?', options: ['Hiding', 'Eating', 'Walking'], answer: 'Hiding' },
        { q: 'What is the starfish doing?', options: ['Walking', 'Sleeping', 'Diving'], answer: 'Sleeping' },
      ] },
    { kind: 'twister', name: 'Goat Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: reef, line: 'A goat in a coat floats on a boat.', seconds: 45, focus: 'oa', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: reef,
      rounds: [
        { word: 'coat', sounds: ['c', 'oa', 't'], picture: it('coat-blue') },
        { word: 'goat', sounds: ['g', 'oa', 't'], picture: it('goat') },
      ] },
    chest('You did it! Reef reporter!', page(5)),
  ],
};
