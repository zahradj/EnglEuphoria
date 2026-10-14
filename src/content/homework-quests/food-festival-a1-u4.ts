import type { HomeworkQuest } from './types';

/* A1 Food Festival (Unit 4) homework quests, one per lesson — the same level kinds as the Unit 2-3 quests. */

const F = '/food-festival/scenes';
const it = (n: string) => `/lep1/items/item-${n}.png`;
const page = (n: number) => `${F}/bg-food-cilla-${n}-wide.png`;
const market = `${F}/bg-food-market-wide.png`;
const cafe = `${F}/bg-food-cafe-wide.png`;
const theme = (mapImg: string) => ({ accent: '#E63946', accent2: '#F1A208', night: false, mapImg, guide: '/lep1/characters/pip-happy.png', walker: '/lep1/characters/mia-hello.png' });
const praise = { voice: 'pip' as const, lines: ['Yes! Great job!', 'Yum! Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' };
const chest = (win: string, img = market) => ({ kind: 'treasure' as const, name: 'Festival Chest', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the chest to open it!', img, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win });

/** Lesson 1 "Yummy Foods at the Festival" */
export const QUEST_FESTIVAL_FOODS_A1_U4L1: HomeworkQuest = {
  id: 'festival-foods-a1-u4l1', title: 'Festival Foods Quest', subtitle: 'Yummy Foods at the Festival · A1 Unit 4 · Lesson 1', level: 'A1', lessonKey: 'food-rich-4-1',
  theme: theme(page(1)), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Food Words', icon: '🍜', intro: 'Listen. Tap the food!', img: market,
      rounds: [
        { line: 'It’s soup.', answer: 'soup', options: [{ label: 'soup', src: it('soup') }, { label: 'rice', src: it('rice') }, { label: 'salad', src: it('salad') }] },
        { line: 'It’s a sandwich.', answer: 'sandwich', options: [{ label: 'pasta', src: it('pasta') }, { label: 'sandwich', src: it('sandwich') }, { label: 'chips', src: it('chips') }] },
        { line: 'They’re grapes.', answer: 'grapes', options: [{ label: 'cheese', src: it('cheese') }, { label: 'rice', src: it('rice') }, { label: 'grapes', src: it('grapes') }] },
      ] },
    { kind: 'true-false', name: 'Meal Time', icon: '🌞', intro: 'Look and listen. True or false?',
      rounds: [
        { img: it('egg'), aspect: 1, line: 'I have eggs for breakfast.', isTrue: true },
        { img: it('pasta'), aspect: 1, line: 'It’s soup.', isTrue: false },
        { img: it('salad'), aspect: 1, line: 'It’s salad.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'My Meals', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('soup'), line: 'I have soup for lunch.', extra: ['dinner'] },
        { img: it('pasta'), line: 'I have pasta for dinner.', extra: ['breakfast'] },
      ] },
    { kind: 'twister', name: 'Grape Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: market, line: 'Green grapes, great grapes, grab a grape!', seconds: 45, focus: 'gr', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: market,
      rounds: [
        { word: 'grab', sounds: ['g', 'r', 'a', 'b'], picture: it('claw') },
        { word: 'brick', sounds: ['b', 'r', 'i', 'ck'], picture: it('blocks') },
      ] },
    chest('You did it! Festival foodie!'),
  ],
};

/** Lesson 2 "I Like Cooking!" */
export const QUEST_LIKE_COOKING_A1_U4L2: HomeworkQuest = {
  id: 'like-cooking-a1-u4l2', title: 'Little Chef Quest', subtitle: 'I Like Cooking! · A1 Unit 4 · Lesson 2', level: 'A1', lessonKey: 'food-rich-4-2',
  theme: theme(cafe), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Kitchen Jobs', icon: '🍳', intro: 'Listen. Tap the picture!', img: cafe,
      rounds: [
        { line: 'I like cooking!', answer: 'cooking', options: [{ label: 'cooking', src: it('pan') }, { label: 'baking', src: it('cake') }, { label: 'washing up', src: it('water-splash') }] },
        { line: 'I don’t like washing up!', answer: 'washing up', options: [{ label: 'eating', src: it('sandwich') }, { label: 'washing up', src: it('water-splash') }, { label: 'cooking', src: it('pan') }] },
        { line: 'I like baking!', answer: 'baking', options: [{ label: 'baking', src: it('cake') }, { label: 'cooking', src: it('pan') }, { label: 'eating', src: it('sandwich') }] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(4),
      sentences: ['Hello! I am Chef Cilla. I like cooking!', 'Let’s make a big pizza for the festival!', 'Oh no! Where is the cheese?', 'Look! Little crumbs. Biscuit can help!'],
      questions: [
        { q: 'What does Cilla like?', options: ['cooking', 'washing up', 'sleeping'], answer: 'cooking' },
        { q: 'What is lost?', options: ['the cheese', 'the pizza', 'Biscuit'], answer: 'the cheese' },
      ] },
    { kind: 'sentence-builder', name: 'Like or Don’t Like', icon: '👍', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('pan'), line: 'I like cooking.', extra: ['don’t'] },
        { img: it('water-splash'), line: 'I don’t like washing up.', extra: ['like?'] },
      ] },
    { kind: 'twister', name: 'Plum Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: cafe, line: 'Plum on a plate, please!', seconds: 40, focus: 'pl', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🍑', intro: 'Tap each sound, then Blend!', img: cafe,
      rounds: [
        { word: 'plum', sounds: ['p', 'l', 'u', 'm'], picture: it('plum') },
        { word: 'clap', sounds: ['c', 'l', 'a', 'p'], picture: it('pip-clap') },
      ] },
    chest('You did it! Little chef!', cafe),
  ],
};

/** Lesson 3 "Listen: Do You Like…?" */
export const QUEST_DO_YOU_LIKE_A1_U4L3: HomeworkQuest = {
  id: 'do-you-like-a1-u4l3', title: 'Do You Like…? Quest', subtitle: 'Listen: Do You Like…? · A1 Unit 4 · Lesson 3', level: 'A1', lessonKey: 'food-rich-4-3',
  theme: theme(page(6)), voice: 'teacher', praise,
  levels: [
    { kind: 'true-false', name: 'Who Likes It?', icon: '👂', intro: 'Look and listen. True or false?',
      rounds: [
        { img: it('pizza-slice'), aspect: 1, line: 'Pico likes pizza.', isTrue: true },
        { img: it('grapes'), aspect: 1, line: 'Pico likes grapes.', isTrue: false },
        { img: it('pan'), aspect: 1, line: 'Cilla likes cooking.', isTrue: true },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(7),
      sentences: ['It is Pico the Mouse! He has the cheese.', 'Would you like some grapes, Pico?', 'No, thank you.'],
      questions: [
        { q: 'Who has the cheese?', options: ['Pico', 'Leo', 'Cilla'], answer: 'Pico' },
        { q: 'Does Pico want grapes?', options: ['No, thank you.', 'Yes, please.'], answer: 'No, thank you.' },
      ] },
    { kind: 'sentence-builder', name: 'Ask It', icon: '❓', intro: 'Listen. Build the question or the answer!',
      rounds: [
        { img: it('soup'), line: 'Do you like soup?', extra: ['have'] },
        { img: it('pizza-slice'), line: 'Yes, I do!', extra: ['please'] },
      ] },
    { kind: 'twister', name: 'Snack Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: market, line: 'Snails snack on snacks.', seconds: 40, focus: 'sn', sayIt: 'Now say it slow, then faster!' },
    chest('You did it! Listening detective!', page(6)),
  ],
};

/** Lesson 4 "I Like / I Don't Like!" */
export const QUEST_FOOD_SURVEY_A1_U4L4: HomeworkQuest = {
  id: 'food-survey-a1-u4l4', title: 'Food Survey Quest', subtitle: 'I Like / I Don’t Like! · A1 Unit 4 · Lesson 4', level: 'A1', lessonKey: 'food-rich-4-4',
  theme: theme(market), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Polite Offers', icon: '🍽️', intro: 'Listen. Tap what they offer!', img: cafe,
      rounds: [
        { line: 'Would you like some juice?', answer: 'juice', options: [{ label: 'juice', src: it('juice') }, { label: 'milk', src: it('milk') }, { label: 'water', src: it('water') }] },
        { line: 'Would you like some cheese?', answer: 'cheese', options: [{ label: 'cake', src: it('cake') }, { label: 'cheese', src: it('cheese') }, { label: 'bread', src: it('bread') }] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(9),
      sentences: ['Would you like some bread?', 'No, thank you.', 'Do you like pizza, Pico?', 'Yes, I do! I like pizza!'],
      questions: [
        { q: 'What does Pico like?', options: ['pizza', 'bread', 'grapes'], answer: 'pizza' },
        { q: 'What does Mia offer?', options: ['some bread', 'some soup', 'some cake'], answer: 'some bread' },
      ] },
    { kind: 'sentence-builder', name: 'Offer It', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('grapes'), line: 'Would you like some grapes?', extra: ['do'] },
        { img: it('pizza'), line: 'Let’s make a pizza!', extra: ['like'] },
      ] },
    { kind: 'twister', name: 'Fish Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: cafe, line: 'Fred fries fresh fish.', seconds: 40, focus: 'fr', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🐸', intro: 'Tap each sound, then Blend!', img: cafe,
      rounds: [
        { word: 'frog', sounds: ['f', 'r', 'o', 'g'], picture: it('frog') },
        { word: 'flag', sounds: ['f', 'l', 'a', 'g'], picture: it('flag') },
      ] },
    chest('You did it! Festival reporter!'),
  ],
};

/** Lesson 5 "Storybook: Chef Cilla's Recipe" */
export const QUEST_CILLA_RECIPE_A1_U4L5: HomeworkQuest = {
  id: 'cilla-recipe-a1-u4l5', title: 'Chef Cilla’s Recipe Quest', subtitle: 'Storybook: Chef Cilla’s Recipe · A1 Unit 4 · Lesson 5', level: 'A1', lessonKey: 'food-rich-4-5',
  theme: theme(page(12)), voice: 'teacher', praise,
  levels: [
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(10),
      sentences: ['Would you like some pizza?', 'Yes, please!', 'Here is the cheese.', 'Thank you, Pico!', 'Let’s eat! Yum! We all like pizza!'],
      questions: [
        { q: 'What does Pico say to the pizza?', options: ['Yes, please!', 'No, thank you.'], answer: 'Yes, please!' },
        { q: 'What does Pico give back?', options: ['the cheese', 'the grapes', 'the bread'], answer: 'the cheese' },
        { q: 'What do they all like?', options: ['pizza', 'soup', 'salad'], answer: 'pizza' },
      ] },
    { kind: 'true-false', name: 'Story Check', icon: '🐭', intro: 'Look and listen. True or false?',
      rounds: [
        { img: page(6), aspect: 16 / 9, line: 'Pico has the cheese.', isTrue: true },
        { img: page(5), aspect: 16 / 9, line: 'Biscuit finds the crumbs.', isTrue: true },
        { img: page(12), aspect: 16 / 9, line: 'They are eating soup.', isTrue: false },
      ] },
    { kind: 'sentence-builder', name: 'Story Lines', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: page(11), line: 'Thank you, Pico!', extra: ['please'] },
        { img: page(4), line: 'Where is the cheese?', extra: ['pizza'] },
      ] },
    chest('You did it! Story chef!', page(12)),
  ],
};

/** Lesson 6 "Festival Café" */
export const QUEST_FESTIVAL_CAFE_A1_U4L6: HomeworkQuest = {
  id: 'festival-cafe-a1-u4l6', title: 'Festival Café Quest', subtitle: 'Festival Café · A1 Unit 4 · Lesson 6', level: 'A1', lessonKey: 'food-rich-4-6',
  theme: theme(cafe), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Take the Order', icon: '☕', intro: 'Listen to the order. Tap it!', img: cafe,
      rounds: [
        { line: 'Some pizza, please!', answer: 'pizza', options: [{ label: 'pizza', src: it('pizza-slice') }, { label: 'salad', src: it('salad') }, { label: 'soup', src: it('soup') }] },
        { line: 'Some chips, please — no salad!', answer: 'chips', options: [{ label: 'salad', src: it('salad') }, { label: 'chips', src: it('chips') }, { label: 'cake', src: it('cake') }] },
        { line: 'Some juice, please.', answer: 'juice', options: [{ label: 'milk', src: it('milk') }, { label: 'cake', src: it('cake') }, { label: 'juice', src: it('juice') }] },
      ] },
    { kind: 'sentence-builder', name: 'Be Polite', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('cake'), line: 'Would you like some cake?', extra: ['do'] },
        { img: it('plate'), line: 'Here you are!', extra: ['please'] },
        { img: it('soup'), line: 'Yes, please!', extra: ['do'] },
      ] },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🐟', intro: 'Tap each sound, then Blend!', img: cafe,
      rounds: [
        { word: 'snack', sounds: ['s', 'n', 'a', 'ck'], picture: it('cookie') },
        { word: 'grab', sounds: ['g', 'r', 'a', 'b'], picture: it('claw') },
        { word: 'plum', sounds: ['p', 'l', 'u', 'm'], picture: it('plum') },
      ] },
    chest('You did it! Super waiter!', cafe),
  ],
};

/** Lesson 7 "Boss Test: Festival Feast!" */
export const QUEST_FESTIVAL_FEAST_A1_U4L7: HomeworkQuest = {
  id: 'festival-feast-a1-u4l7', title: 'Festival Feast Quest', subtitle: 'Boss Test: Festival Feast! · A1 Unit 4 · Lesson 7', level: 'A1', lessonKey: 'food-rich-4-7',
  theme: theme(page(12)), voice: 'teacher', praise,
  levels: [
    { kind: 'true-false', name: 'Feast Check', icon: '🏆', intro: 'Look and listen. True or false?',
      rounds: [
        { img: page(12), aspect: 16 / 9, line: 'The friends are eating pizza.', isTrue: true },
        { img: page(2), aspect: 16 / 9, line: 'Cilla doesn’t like cooking.', isTrue: false },
        { img: page(9), aspect: 16 / 9, line: 'Pico likes pizza.', isTrue: true },
      ] },
    { kind: 'reading', name: 'The Whole Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(12),
      sentences: ['Let’s make a big pizza!', 'Oh no! Where is the cheese?', 'Pico has the cheese.', 'Would you like some pizza? Yes, please!', 'Let’s eat!'],
      questions: [
        { q: 'Who has the cheese?', options: ['Pico', 'Biscuit', 'Leo'], answer: 'Pico' },
        { q: 'What does Cilla make?', options: ['a big pizza', 'some soup', 'a cake'], answer: 'a big pizza' },
      ] },
    { kind: 'sentence-builder', name: 'Boss Sentences', icon: '🏆', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('soup'), line: 'Do you like soup?', extra: ['some'] },
        { img: it('pan'), line: 'I like cooking.', extra: ['don’t'] },
      ] },
    chest('You did it! Festival chef!', page(12)),
  ],
};
