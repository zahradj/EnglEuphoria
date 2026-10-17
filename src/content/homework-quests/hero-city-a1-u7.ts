import type { HomeworkQuest } from './types';

/* A1 Hero City (Unit 7) homework quests, one per lesson — the same level kinds as the Unit 2-6 quests. */

const S = '/lep1/scenes';
const it = (n: string) => `/lep1/items/item-${n}.png`;
const page = (n: number) => `${S}/bg-a1u7-story-${n}-wide.png`;
const square = `${S}/bg-a1u7-square-wide.png`;
const road = `${S}/bg-a1u7-road-wide.png`;
const trials = `${S}/bg-a1u7-trials-wide.png`;
const hq = `${S}/bg-a1u7-hq-wide.png`;
const theme = (mapImg: string) => ({ accent: '#FE6A2F', accent2: '#FEAF15', night: false, mapImg, guide: '/lep1/characters/pip-happy.png', walker: '/lep1/characters/mia-hello.png' });
const praise = { voice: 'pip' as const, lines: ['Yes! Super hero!', 'Great job, hero!', 'Wow, perfect!'], tryAgain: 'Try again!' };
const chest = (win: string, img = square) => ({ kind: 'treasure' as const, name: 'Hero Chest', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the chest to open it!', img, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win });

/** Lesson 1 "Superhero Powers: I Can Help!" */
export const QUEST_HERO_POWERS_A1_U7L1: HomeworkQuest = {
  id: 'hero-powers-a1-u7l1', title: 'Hero Powers Quest', subtitle: 'Superhero Powers · A1 Unit 7 · Lesson 1', level: 'A1', lessonKey: 'hero-rich-7-1',
  theme: theme(page(2)), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'What Can They Do?', icon: '🦸', intro: 'Listen. Tap the hero!', img: trials,
      rounds: [
        { line: 'Leo can run fast.', answer: 'run fast', options: [{ label: 'run fast', src: it('leo-fast') }, { label: 'climb well', src: it('mia-climb') }, { label: 'swim well', src: it('biscuit-swim') }] },
        { line: 'Mia can climb well.', answer: 'climb well', options: [{ label: 'jump high', src: it('pip-high') }, { label: 'climb well', src: it('mia-climb') }, { label: 'run fast', src: it('leo-fast') }] },
        { line: 'Captain Spark can fly fast.', answer: 'fly fast', options: [{ label: 'swim well', src: it('biscuit-swim') }, { label: 'run fast', src: it('leo-fast') }, { label: 'fly fast', src: it('spark-fly') }] },
        { line: 'Biscuit can swim well.', answer: 'swim well', options: [{ label: 'swim well', src: it('biscuit-swim') }, { label: 'fly fast', src: it('spark-fly') }, { label: 'jump high', src: it('pip-high') }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '❓', intro: 'Look and listen. True or false?',
      rounds: [
        { img: page(1), aspect: 16 / 9, line: 'It is a sunny day.', isTrue: true },
        { img: page(2), aspect: 16 / 9, line: 'Captain Spark can fly.', isTrue: true },
        { img: page(3), aspect: 16 / 9, line: 'Leo can climb well.', isTrue: false },
      ] },
    { kind: 'sentence-builder', name: 'My Power!', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('leo-fast'), line: 'I can run fast.', extra: ['well'] },
        { img: it('mia-climb'), line: 'She can climb well.', extra: ['fast'] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(3),
      sentences: ['This is Hero City. It is a sunny day.', 'This is Captain Spark. She can fly fast!', 'Leo can run fast. Mia can climb well.'],
      questions: [
        { q: 'Who can fly fast?', options: ['Captain Spark', 'Leo', 'Mia'], answer: 'Captain Spark' },
        { q: 'What can Mia do?', options: ['Climb well', 'Fly fast', 'Swim well'], answer: 'Climb well' },
      ] },
    { kind: 'twister', name: 'Train Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: square, line: 'Paint the train in the rain.', seconds: 45, focus: 'ai', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: square,
      rounds: [
        { word: 'rain', sounds: ['r', 'ai', 'n'], picture: it('rain') },
        { word: 'paint', sounds: ['p', 'ai', 'n', 't'], picture: it('paint') },
      ] },
    chest('You did it! Power hero!', trials),
  ],
};

/** Lesson 2 "Can You Lift It? Can't and Can!" */
export const QUEST_CAN_YOU_LIFT_A1_U7L2: HomeworkQuest = {
  id: 'can-you-lift-a1-u7l2', title: 'Can You Lift It? Quest', subtitle: 'Can’t and Can · A1 Unit 7 · Lesson 2', level: 'A1', lessonKey: 'hero-rich-7-2',
  theme: theme(page(4)), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Who Can Do It?', icon: '💪', intro: 'Listen. Tap the hero who CAN!', img: square,
      rounds: [
        { line: 'Pip can’t lift the box. But Leo can!', answer: 'Leo', options: [{ label: 'Pip', src: it('pip-try') }, { label: 'Leo', src: it('leo-lift') }] },
        { line: 'Leo can’t fly. But Captain Spark can!', answer: 'Captain Spark', options: [{ label: 'Captain Spark', src: it('spark-fly') }, { label: 'Leo', src: it('leo-fast') }] },
        { line: 'Mia can’t swim well. But Biscuit can!', answer: 'Biscuit', options: [{ label: 'Mia', src: it('mia-climb') }, { label: 'Biscuit', src: it('biscuit-swim') }] },
      ] },
    { kind: 'true-false', name: 'Can or Can’t?', icon: '❓', intro: 'Look and listen. True or false?',
      rounds: [
        { img: page(4), aspect: 16 / 9, line: 'Pip can lift the box.', isTrue: false },
        { img: page(4), aspect: 16 / 9, line: 'Leo can lift the box.', isTrue: true },
        { img: page(5), aspect: 16 / 9, line: 'Biscuit can swim well.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Ask and Answer!', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('leo-lift'), line: 'Can you lift it?', extra: ['are'] },
        { img: it('pip-try'), line: 'No, I can’t.', extra: ['can'] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(4),
      sentences: ['Can Pip lift the box? No, he can’t. But Leo can!', 'Biscuit can swim well. He can save the boat.'],
      questions: [
        { q: 'Can Pip lift the box?', options: ['No, he can’t.', 'Yes, he can.'], answer: 'No, he can’t.' },
        { q: 'Who can save the boat?', options: ['Biscuit', 'Pip', 'Leo'], answer: 'Biscuit' },
      ] },
    { kind: 'twister', name: 'Play Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: square, line: 'Stay and play all day.', seconds: 45, focus: 'ay', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: square,
      rounds: [
        { word: 'play', sounds: ['p', 'l', 'ay'], picture: it('ball-red') },
        { word: 'tray', sounds: ['t', 'r', 'ay'], picture: it('tray') },
      ] },
    chest('You did it! Strong hero!', page(4)),
  ],
};

/** Lesson 3 "Listen to the Hero Helper Song" (must / mustn't) */
export const QUEST_HERO_RULES_A1_U7L3: HomeworkQuest = {
  id: 'hero-rules-a1-u7l3', title: 'Hero Rules Quest', subtitle: 'The Hero Helper Song · A1 Unit 7 · Lesson 3', level: 'A1', lessonKey: 'hero-rich-7-3',
  theme: theme(road), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Which Rule?', icon: '🚦', intro: 'Listen. Tap the picture!', img: road,
      rounds: [
        { line: 'You must wait.', answer: 'wait', options: [{ label: 'wait', src: it('rule-wait') }, { label: 'run on the road', src: it('rule-run-road') }, { label: 'shout', src: it('rule-shout') }] },
        { line: 'You mustn’t shout.', answer: 'shout', options: [{ label: 'be kind', src: it('rule-share') }, { label: 'shout', src: it('rule-shout') }, { label: 'wait', src: it('rule-wait') }] },
        { line: 'You must be kind.', answer: 'be kind', options: [{ label: 'drop paper', src: it('rule-litter') }, { label: 'run on the road', src: it('rule-run-road') }, { label: 'be kind', src: it('rule-share') }] },
        { line: 'You mustn’t drop paper.', answer: 'drop paper', options: [{ label: 'drop paper', src: it('rule-litter') }, { label: 'help', src: it('rule-help') }, { label: 'wait', src: it('rule-wait') }] },
      ] },
    { kind: 'true-false', name: 'Must or Mustn’t?', icon: '❓', intro: 'Look and listen. Is it a good rule?',
      rounds: [
        { img: it('rule-wait'), line: 'You must wait at the red light.', isTrue: true },
        { img: it('rule-run-road'), line: 'You must run on the road.', isTrue: false },
        { img: it('rule-help'), line: 'You must help your friend.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Say the Rule!', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('rule-wait'), line: 'You must stop.', extra: ['mustn’t'] },
        { img: it('rule-run-road'), line: 'You mustn’t run on the road.', extra: ['must'] },
      ] },
    { kind: 'reading', name: 'The Song', icon: '🎵', intro: 'Read the song. Then answer from memory!', img: road,
      sentences: ['Stop! You must stop at the light,', 'Then look to the left and the right!', 'You mustn’t run on the road,', 'You must walk nice and slow!'],
      questions: [
        { q: 'Where must you stop?', options: ['At the light', 'At the shop', 'At school'], answer: 'At the light' },
        { q: 'You mustn’t …', options: ['run on the road', 'walk slow', 'look left'], answer: 'run on the road' },
      ] },
    { kind: 'twister', name: 'Cake Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: square, line: 'Brave Kate saves the cake.', seconds: 45, focus: 'a', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Magic E!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: square,
      rounds: [
        { word: 'cape', sounds: ['c', 'a_e', 'p'], picture: it('hero-cape') },
        { word: 'cake', sounds: ['c', 'a_e', 'k'], picture: it('cake') },
      ] },
    chest('You did it! Rule hero!', road),
  ],
};

/** Lesson 4 "Offer to Help: Give, Show, Tell" (What's the matter? / Can I help you?) */
export const QUEST_HERO_HELPER_A1_U7L4: HomeworkQuest = {
  id: 'hero-helper-a1-u7l4', title: 'Hero Helper Quest', subtitle: 'Offer to Help · A1 Unit 7 · Lesson 4', level: 'A1', lessonKey: 'hero-rich-7-4',
  theme: theme(hq), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'What’s the Matter?', icon: '🩹', intro: 'Listen. Tap the person!', img: square,
      rounds: [
        { line: 'I’ve got a headache.', answer: 'headache', options: [{ label: 'headache', src: it('cit-headache') }, { label: 'cold', src: it('cit-cold') }, { label: 'toothache', src: it('cit-toothache') }] },
        { line: 'Achoo! I’ve got a cold.', answer: 'cold', options: [{ label: 'tummy ache', src: it('cit-tummy') }, { label: 'cold', src: it('cit-cold') }, { label: 'headache', src: it('cit-headache') }] },
        { line: 'Ouch! I’ve got toothache.', answer: 'toothache', options: [{ label: 'cold', src: it('cit-cold') }, { label: 'heavy bags', src: it('cit-bags') }, { label: 'toothache', src: it('cit-toothache') }] },
        { line: 'My bags are very heavy!', answer: 'heavy bags', options: [{ label: 'heavy bags', src: it('cit-bags') }, { label: 'broken bike', src: it('cit-bike') }, { label: 'tummy ache', src: it('cit-tummy') }] },
      ] },
    { kind: 'picture-choice', name: 'Hero Bag', icon: '🎒', intro: 'Listen. Tap the right help!', img: hq,
      rounds: [
        { line: 'Ouch! I’ve got a cut on my finger!', answer: 'plaster', options: [{ label: 'plaster', src: it('plaster') }, { label: 'toolbox', src: it('toolbox') }, { label: 'tissue', src: it('tissues') }] },
        { line: 'Oh no! My bike is broken.', answer: 'toolbox', options: [{ label: 'tissue', src: it('tissues') }, { label: 'toolbox', src: it('toolbox') }, { label: 'plaster', src: it('plaster') }] },
        { line: 'Achoo! I’ve got a cold.', answer: 'tissue', options: [{ label: 'toolbox', src: it('toolbox') }, { label: 'phone', src: it('phone-call') }, { label: 'tissue', src: it('tissues') }] },
      ] },
    { kind: 'sentence-builder', name: 'Offer Help!', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('cit-headache'), line: 'What’s the matter?', extra: ['Where'] },
        { img: it('cit-bags'), line: 'Can I help you?', extra: ['me'] },
      ] },
    { kind: 'reading', name: 'At Hero HQ', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(9),
      sentences: ['What’s the matter? I’ve got a cold.', 'Can I help you? Yes, please!', 'Mia gives Captain Spark a tissue.'],
      questions: [
        { q: 'What’s the matter with Captain Spark?', options: ['A cold', 'A headache', 'Toothache'], answer: 'A cold' },
        { q: 'What does Mia give her?', options: ['A tissue', 'A plaster', 'A box'], answer: 'A tissue' },
      ] },
    { kind: 'twister', name: 'Hero Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: square, line: 'Brave Jay may save the train in the rain.', seconds: 50, focus: 'a', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: square,
      rounds: [
        { word: 'snail', sounds: ['s', 'n', 'ai', 'l'], picture: it('snail') },
        { word: 'tray', sounds: ['t', 'r', 'ay'], picture: it('tray') },
      ] },
    chest('You did it! Kind hero!', hq),
  ],
};

/** Lesson 5 "Storybook: Captain Spark Saves the Day" */
export const QUEST_SPARK_STORY_A1_U7L5: HomeworkQuest = {
  id: 'spark-story-a1-u7l5', title: 'Captain Spark Quest', subtitle: 'Captain Spark Saves the Day · A1 Unit 7 · Lesson 5', level: 'A1', lessonKey: 'hero-rich-7-5',
  theme: theme(page(12)), voice: 'teacher', praise,
  levels: [
    { kind: 'true-false', name: 'True or False?', icon: '📖', intro: 'Look at the story. True or false?',
      rounds: [
        { img: page(6), aspect: 16 / 9, line: 'The light is red. The friends wait.', isTrue: true },
        { img: page(10), aspect: 16 / 9, line: 'The kitten is on the tower.', isTrue: true },
        { img: page(11), aspect: 16 / 9, line: 'Leo is climbing the ladder.', isTrue: false },
      ] },
    { kind: 'picture-choice', name: 'Who Helps?', icon: '🐱', intro: 'Listen. Tap the right hero!', img: page(10),
      rounds: [
        { line: 'She can climb well. She saves the kitten.', answer: 'Mia', options: [{ label: 'Mia', src: it('mia-climb') }, { label: 'Leo', src: it('leo-lift') }, { label: 'Biscuit', src: it('biscuit-swim') }] },
        { line: 'He can swim well. He saves the boat.', answer: 'Biscuit', options: [{ label: 'Pip', src: it('pip-high') }, { label: 'Biscuit', src: it('biscuit-swim') }, { label: 'Mia', src: it('mia-climb') }] },
      ] },
    { kind: 'sentence-builder', name: 'Build the Story!', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: page(11), line: 'Mia can climb well.', extra: ['fast'] },
        { img: page(12), line: 'We can all be heroes!', extra: ['can’t'] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the end of the story. Then answer from memory!', img: page(12),
      sentences: ['The kitten is on the tower! Who can help?', 'Mia can climb well. Leo and Pip help.', 'We can all be heroes! Hooray!'],
      questions: [
        { q: 'Where is the kitten?', options: ['On the tower', 'On the road', 'On the boat'], answer: 'On the tower' },
        { q: 'Who can be a hero?', options: ['We can all be heroes!', 'Only Captain Spark.'], answer: 'We can all be heroes!' },
      ] },
    { kind: 'twister', name: 'Kitten Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: page(12), line: 'Brave Mia may save the kitten today.', seconds: 45, focus: 'a', sayIt: 'Now say it slow, then faster!' },
    chest('You did it! Story hero!', page(12)),
  ],
};

/** Lesson 6 "Extra Practice: Hero Mission Match!" */
export const QUEST_MISSION_MATCH_A1_U7L6: HomeworkQuest = {
  id: 'mission-match-a1-u7l6', title: 'Mission Match Quest', subtitle: 'Hero Mission Match · A1 Unit 7 · Lesson 6', level: 'A1', lessonKey: 'hero-rich-7-6',
  theme: theme(hq), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Mission Round', icon: '⭐', intro: 'Listen. Tap the person who needs help!', img: square,
      rounds: [
        { line: 'I’ve got a tummy ache.', answer: 'tummy ache', options: [{ label: 'tummy ache', src: it('cit-tummy') }, { label: 'headache', src: it('cit-headache') }, { label: 'cold', src: it('cit-cold') }] },
        { line: 'My kitten is up in the tree!', answer: 'kitten', options: [{ label: 'broken bike', src: it('cit-bike') }, { label: 'kitten', src: it('cit-kitten') }, { label: 'heavy bags', src: it('cit-bags') }] },
        { line: 'Oh no! My bike is broken.', answer: 'broken bike', options: [{ label: 'toothache', src: it('cit-toothache') }, { label: 'kitten', src: it('cit-kitten') }, { label: 'broken bike', src: it('cit-bike') }] },
      ] },
    { kind: 'true-false', name: 'Good Hero?', icon: '❓', intro: 'Look and listen. Is it a good rule?',
      rounds: [
        { img: it('rule-share'), line: 'You must be kind.', isTrue: true },
        { img: it('rule-shout'), line: 'You must shout.', isTrue: false },
        { img: it('rule-litter'), line: 'You mustn’t drop paper.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Hero Words!', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('cit-bags'), line: 'I can carry your bags.', extra: ['can’t'] },
        { img: it('cit-bike'), line: 'I can fix your bike.', extra: ['must'] },
      ] },
    { kind: 'reading', name: 'Mission Log', icon: '📖', intro: 'Read. Then answer from memory!', img: hq,
      sentences: ['Grandma Rose: My bags are very heavy!', 'Leo: Can I help you? I can carry your bags.', 'Grandma Rose: Oh, thank you, strong hero!'],
      questions: [
        { q: 'What’s the matter with Grandma Rose?', options: ['Her bags are heavy.', 'She has got a cold.', 'Her bike is broken.'], answer: 'Her bags are heavy.' },
        { q: 'What can Leo do?', options: ['Carry the bags', 'Fly fast', 'Fix the bike'], answer: 'Carry the bags' },
      ] },
    { kind: 'twister', name: 'Twister Race', icon: '🌀', intro: 'Build the tongue twister before the sand runs out!', img: hq, line: 'Brave Jay may save the train in the rain.', seconds: 50, focus: 'a', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: hq,
      rounds: [
        { word: 'tail', sounds: ['t', 'ai', 'l'], picture: it('tail') },
        { word: 'brave', sounds: ['b', 'r', 'a_e', 'v'], picture: it('spark-cheer') },
      ] },
    chest('You did it! Mission hero!', hq),
  ],
};

/** Lesson 7 "Unit Review & Boss Test: Super Helper!" */
export const QUEST_SUPER_HELPER_A1_U7L7: HomeworkQuest = {
  id: 'super-helper-a1-u7l7', title: 'Super Helper Quest', subtitle: 'Boss Test: Super Helper! · A1 Unit 7 · Lesson 7', level: 'A1', lessonKey: 'hero-rich-7-7',
  theme: theme(page(12)), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Listen!', icon: '👂', intro: 'Listen. Tap the right picture!', img: square,
      rounds: [
        { line: 'He can run fast.', answer: 'run fast', options: [{ label: 'swim well', src: it('biscuit-swim') }, { label: 'run fast', src: it('leo-fast') }, { label: 'climb well', src: it('mia-climb') }] },
        { line: 'You mustn’t run on the road.', answer: 'run on the road', options: [{ label: 'run on the road', src: it('rule-run-road') }, { label: 'wait', src: it('rule-wait') }, { label: 'be kind', src: it('rule-share') }] },
        { line: 'I’ve got toothache.', answer: 'toothache', options: [{ label: 'headache', src: it('cit-headache') }, { label: 'cold', src: it('cit-cold') }, { label: 'toothache', src: it('cit-toothache') }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '❓', intro: 'Look and read. True or false?',
      rounds: [
        { img: page(2), aspect: 16 / 9, line: 'Captain Spark can fly fast.', isTrue: true },
        { img: page(7), aspect: 16 / 9, line: 'The light is red.', isTrue: false },
        { img: page(8), aspect: 16 / 9, line: 'Captain Spark has got a cold.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Build It!', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('rule-help'), line: 'You must help your friend.', extra: ['mustn’t'] },
        { img: it('cit-cold'), line: 'Can I help you?', extra: ['are'] },
      ] },
    { kind: 'reading', name: 'Captain Spark Saves the Day', icon: '📖', intro: 'Read. Then answer from memory!', img: page(6),
      sentences: ['Stop! You must wait. You mustn’t run on the road.', 'What’s the matter? I’ve got a cold.', 'Mia can climb well. We can all be heroes!'],
      questions: [
        { q: 'What must the friends do?', options: ['Wait', 'Run', 'Shout'], answer: 'Wait' },
        { q: 'Who can climb well?', options: ['Mia', 'Leo', 'Biscuit'], answer: 'Mia' },
      ] },
    { kind: 'twister', name: 'Hero Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: page(12), line: 'Brave Jay may save the train in the rain.', seconds: 50, focus: 'a', sayIt: 'Now say it slow, then faster!' },
    chest('You did it! Super helper!', page(12)),
  ],
};
