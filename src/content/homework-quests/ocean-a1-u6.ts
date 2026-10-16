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

/** Lesson 3 "Listen: Where Do They Live?" */
export const QUEST_SEA_HOMES_A1_U6L3: HomeworkQuest = {
  id: 'sea-homes-a1-u6l3', title: 'Sea Homes Quest', subtitle: 'Where Do They Live? · A1 Unit 6 · Lesson 3', level: 'A1', lessonKey: 'ocean-rich-6-3',
  theme: theme(page(7)), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Where Does It Live?', icon: '🐢', intro: 'Listen. Tap the animal!', img: reef,
      rounds: [
        { line: 'It lives on the beach. It walks sideways.', answer: 'crab', options: [{ label: 'crab', src: it('crab') }, { label: 'shark', src: it('shark') }, { label: 'turtle', src: it('turtle') }] },
        { line: 'It lives on the reef. It eats sea grass.', answer: 'turtle', options: [{ label: 'whale', src: it('whale') }, { label: 'turtle', src: it('turtle') }, { label: 'crab', src: it('crab') }] },
        { line: 'It lives in the sea. It eats fish.', answer: 'shark', options: [{ label: 'seahorse', src: it('seahorse') }, { label: 'crab', src: it('crab') }, { label: 'shark', src: it('shark') }] },
        { line: 'It lives on the reef. It’s got a curly tail.', answer: 'seahorse', options: [{ label: 'seahorse', src: it('seahorse') }, { label: 'whale', src: it('whale') }, { label: 'starfish', src: it('starfish') }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '❓', intro: 'Look and listen. True or false?',
      rounds: [
        { img: page(7), aspect: 16 / 9, line: 'The turtle eats sea grass.', isTrue: true },
        { img: page(6), aspect: 16 / 9, line: 'The friends are sleeping.', isTrue: false },
        { img: page(6), aspect: 16 / 9, line: 'Fish are swimming.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Build It!', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('turtle'), line: 'It lives on the reef.', extra: ['in'] },
        { img: it('shark'), line: 'It eats fish.', extra: ['lives'] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(7),
      sentences: ['The friends are diving. Fish are swimming!', 'The turtle lives on the reef. It eats sea grass.'],
      questions: [
        { q: 'What are the friends doing?', options: ['Diving', 'Sleeping', 'Walking'], answer: 'Diving' },
        { q: 'Where does the turtle live?', options: ['On the reef', 'In a house', 'On the beach'], answer: 'On the reef' },
      ] },
    { kind: 'twister', name: 'Splash Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: reef, line: 'Fish wish for a big splash.', seconds: 45, focus: 'sh', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: reef,
      rounds: [
        { word: 'fish', sounds: ['f', 'i', 'sh'], picture: it('fish') },
        { word: 'dish', sounds: ['d', 'i', 'sh'], picture: it('dish') },
      ] },
    chest('You did it! Sea home expert!', page(7)),
  ],
};

/** Lesson 4 "Ask and Answer: Is It a Shark?" */
export const QUEST_REEF_DETECTIVE_A1_U6L4: HomeworkQuest = {
  id: 'reef-detective-a1-u6l4', title: 'Reef Detective Quest', subtitle: 'Is It a Shark? · A1 Unit 6 · Lesson 4', level: 'A1', lessonKey: 'ocean-rich-6-4',
  theme: theme(page(9)), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Yes or No?', icon: '🔍', intro: 'Listen. Tap the animal that says YES!', img: reef,
      rounds: [
        { line: 'Is it walking? Yes, it is.', answer: 'crab', options: [{ label: 'crab', src: it('crab-walking') }, { label: 'starfish', src: it('starfish-sleeping') }, { label: 'whale', src: it('whale-diving') }] },
        { line: 'Is it hiding? Yes, it is.', answer: 'octopus', options: [{ label: 'fish', src: it('fish-eating') }, { label: 'octopus', src: it('bub-hiding') }, { label: 'crab', src: it('crab-walking') }] },
        { line: 'Is it diving? Yes, it is.', answer: 'whale', options: [{ label: 'whale', src: it('whale-diving') }, { label: 'turtle', src: it('turtle-eating') }, { label: 'octopus', src: it('bub-hiding') }] },
      ] },
    { kind: 'true-false', name: 'Is It…?', icon: '❓', intro: 'Look and listen. True or false?',
      rounds: [
        { img: page(9), aspect: 16 / 9, line: 'Is it the chest? No, it isn’t.', isTrue: true },
        { img: page(8), aspect: 16 / 9, line: 'It is sunny.', isTrue: false },
        { img: page(8), aspect: 16 / 9, line: 'The waves are big.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Build the Question!', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('shark'), line: 'Is it a shark?', extra: ['are'] },
        { img: it('crab-walking'), line: 'Is it walking?', extra: ['do'] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(8),
      sentences: ['Oh no! It is windy. The waves are big.', 'Mia: Is it the chest? Shark: No, it isn’t!'],
      questions: [
        { q: 'What is the weather like?', options: ['Windy', 'Sunny', 'Snowy'], answer: 'Windy' },
        { q: 'Is it the chest?', options: ['No, it isn’t.', 'Yes, it is.'], answer: 'No, it isn’t.' },
      ] },
    { kind: 'twister', name: 'Whale Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: reef, line: 'White whales wish for a boat.', seconds: 45, focus: 'wh', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: reef,
      rounds: [
        { word: 'boat', sounds: ['b', 'oa', 't'], picture: '/magic-castle/stickers/boat.png' },
        { word: 'fish', sounds: ['f', 'i', 'sh'], picture: it('fish') },
      ] },
    chest('You did it! Reef detective!', page(9)),
  ],
};

/** Lesson 5 "Storybook: The Treasure Reef" */
export const QUEST_TREASURE_REEF_A1_U6L5: HomeworkQuest = {
  id: 'treasure-reef-a1-u6l5', title: 'Treasure Reef Quest', subtitle: 'The Treasure Reef · A1 Unit 6 · Lesson 5', level: 'A1', lessonKey: 'ocean-rich-6-5',
  theme: theme(page(11)), voice: 'teacher', praise,
  levels: [
    { kind: 'true-false', name: 'True or False?', icon: '📖', intro: 'Look at the story. True or false?',
      rounds: [
        { img: page(10), aspect: 16 / 9, line: 'Bub is hiding.', isTrue: false },
        { img: page(11), aspect: 16 / 9, line: 'Is it the treasure? Yes, it is.', isTrue: true },
        { img: page(12), aspect: 16 / 9, line: 'It is sunny again.', isTrue: true },
      ] },
    { kind: 'picture-choice', name: 'Who Is It?', icon: '🐙', intro: 'Listen. Tap the right picture!', img: reef,
      rounds: [
        { line: 'He is hiding.', answer: 'octopus', options: [{ label: 'octopus', src: it('bub-hiding') }, { label: 'crab', src: it('crab-walking') }, { label: 'whale', src: it('whale-diving') }] },
        { line: 'It is sleeping.', answer: 'starfish', options: [{ label: 'turtle', src: it('turtle-eating') }, { label: 'starfish', src: it('starfish-sleeping') }, { label: 'fish', src: it('fish-eating') }] },
      ] },
    { kind: 'sentence-builder', name: 'Build the Story!', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: page(10), line: 'Bub is helping!', extra: ['are'] },
        { img: page(12), line: 'It is sunny again.', extra: ['windy'] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the end of the story. Then answer from memory!', img: page(12),
      sentences: ['Bub is not hiding now. He is helping!', 'Is it the treasure? Yes, it is!', 'It is sunny again. Bub is happy. Splash!'],
      questions: [
        { q: 'Who is helping?', options: ['Bub', 'The shark', 'The crab'], answer: 'Bub' },
        { q: 'What is the weather like at the end?', options: ['Sunny', 'Windy', 'Snowy'], answer: 'Sunny' },
      ] },
    { kind: 'twister', name: 'Shell Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: reef, line: 'Bub wishes for a shiny shell.', seconds: 45, focus: 'sh', sayIt: 'Now say it slow, then faster!' },
    chest('You did it! Treasure finder!', page(11)),
  ],
};
