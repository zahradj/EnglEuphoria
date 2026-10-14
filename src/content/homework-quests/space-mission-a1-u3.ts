import type { HomeworkQuest } from './types';

/* A1 Space Mission (Unit 3) homework quests, one per lesson — the same level kinds as the Unit 2 quests. */

const S = '/space-mission/scenes';
const it = (n: string) => `/lep1/items/item-${n}.png`;
const robot = (n: number) => `${S}/bg-space-robot-${n}-wide.png`;
const station = `${S}/bg-space-station-wide.png`;
const deep = `${S}/bg-space-deep-wide.png`;
const P = { sun: it('planet-sun'), wind: it('planet-wind'), ice: it('planet-ice'), rain: it('planet-rain') };
const theme = (mapImg: string) => ({ accent: '#6366F1', accent2: '#F59E0B', night: true, mapImg, guide: '/lep1/characters/pip-happy.png', walker: '/lep1/characters/leo-hello.png' });
const praise = { voice: 'pip' as const, lines: ['Yes! Great job!', 'Well done, astronaut!', 'Wow, perfect!'], tryAgain: 'Try again!' };
const chest = (win: string, img = station) => ({ kind: 'treasure' as const, name: 'Space Chest', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the chest to open it!', img, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win });

/** Lesson 1 "Count to 100 in Space!" */
export const QUEST_SPACE_COUNT_A1_U3L1: HomeworkQuest = {
  id: 'space-count-a1-u3l1', title: 'Star Counter Quest', subtitle: 'Count to 100 in Space! · A1 Unit 3 · Lesson 1', level: 'A1', lessonKey: 'space-rich-3-1',
  theme: theme(robot(3)), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Space Words', icon: '🚀', intro: 'Listen. Tap the picture!', img: robot(1),
      rounds: [
        { line: 'It’s a rocket.', answer: 'rocket', options: [{ label: 'rocket', src: it('rocket') }, { label: 'moon', src: it('moon') }, { label: 'star', src: it('star-gold') }] },
        { line: 'It’s the moon.', answer: 'moon', options: [{ label: 'robot', src: it('beep') }, { label: 'moon', src: it('moon') }, { label: 'planet', src: P.ice }] },
        { line: 'It’s a robot.', answer: 'robot', options: [{ label: 'star', src: it('star-gold') }, { label: 'rocket', src: it('rocket') }, { label: 'robot', src: it('beep') }] },
      ] },
    { kind: 'true-false', name: 'How Many?', icon: '⭐', intro: 'Look at the stars and listen. True or false?',
      rounds: [
        { img: robot(3), aspect: 16 / 9, line: 'There are forty stars.', isTrue: true },
        { img: robot(3), aspect: 16 / 9, line: 'There are four friends.', isTrue: true },
        { img: robot(2), aspect: 16 / 9, line: 'This is a robot.', isTrue: false },
      ] },
    { kind: 'sentence-builder', name: 'Build It', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: robot(3), line: 'There are thirty stars.', extra: ['thirteen'] },
        { img: robot(2), line: 'This is my rocket.', extra: ['moon'] },
      ] },
    { kind: 'twister', name: 'Th Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: deep, line: 'Three thin stars think.', seconds: 40, focus: 'th', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧵', intro: 'Tap each sound, then Blend!', img: station,
      rounds: [
        { word: 'thin', sounds: ['th', 'i', 'n'], picture: it('thread') },
        { word: 'bath', sounds: ['b', 'a', 'th'], picture: it('room-bathroom') },
      ] },
    chest('You did it! Star counter!'),
  ],
};

/** Lesson 2 "Space Directions" */
export const QUEST_SPACE_DIRECTIONS_A1_U3L2: HomeworkQuest = {
  id: 'space-directions-a1-u3l2', title: 'Mission Control Quest', subtitle: 'Space Directions · A1 Unit 3 · Lesson 2', level: 'A1', lessonKey: 'space-rich-3-2',
  theme: theme(robot(5)), voice: 'teacher', praise,
  levels: [
    { kind: 'true-false', name: 'Where Is It?', icon: '🧭', intro: 'Look and listen. True or false?',
      rounds: [
        { img: robot(5), aspect: 16 / 9, line: 'The moon is above the rocket.', isTrue: true },
        { img: robot(5), aspect: 16 / 9, line: 'Nova is on the right.', isTrue: false },
        { img: robot(5), aspect: 16 / 9, line: 'Biscuit is on the right.', isTrue: true },
        { img: robot(5), aspect: 16 / 9, line: 'The rocket is above the moon.', isTrue: false },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: robot(4),
      sentences: ['Oh no! Where is Beep?', 'Beep is my robot. He is lost!', 'Go up! Go left!', 'The moon is above the rocket.'],
      questions: [
        { q: 'Who is lost?', options: ['Beep', 'Nova', 'Biscuit'], answer: 'Beep' },
        { q: 'Where is the moon?', options: ['above the rocket', 'below the rocket', 'in the box'], answer: 'above the rocket' },
      ] },
    { kind: 'sentence-builder', name: 'Give Orders', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: robot(5), line: 'Go up! Go left!', extra: ['right!'] },
        { img: robot(5), line: 'The moon is above the rocket.', extra: ['below'] },
      ] },
    { kind: 'twister', name: 'Ing Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: deep, line: 'The king’s ring goes ding.', seconds: 40, focus: 'ing', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '💍', intro: 'Tap each sound, then Blend!', img: station,
      rounds: [
        { word: 'ring', sounds: ['r', 'ing'], picture: it('ring') },
        { word: 'swing', sounds: ['s', 'w', 'ing'], picture: it('coco-swing') },
      ] },
    chest('You did it! Mission control!'),
  ],
};

/** Lesson 3 "The Counting Rocket Song" */
export const QUEST_SPACE_SONG_A1_U3L3: HomeworkQuest = {
  id: 'space-song-a1-u3l3', title: 'Planet Sun Quest', subtitle: 'The Counting Rocket Song · A1 Unit 3 · Lesson 3', level: 'A1', lessonKey: 'space-rich-3-3',
  theme: theme(robot(6)), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Number Ears', icon: '👂', intro: 'Listen. Tap the number!', img: deep,
      rounds: [
        { line: 'There are sixty stars.', answer: 'sixty', options: [{ label: 'sixteen', src: it('star-gold') }, { label: 'sixty', src: it('rocket') }, { label: 'six', src: it('moon') }] },
        { line: 'Where is the moon? It’s above the rocket.', answer: 'moon', options: [{ label: 'moon', src: it('moon') }, { label: 'robot', src: it('beep') }, { label: 'puppy', src: it('dog') }] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: robot(7),
      sentences: ['It is hot and sunny.', 'Beep is not here.', 'It is windy!', 'Up, up goes Biscuit’s hat!'],
      questions: [
        { q: 'What is the weather like on page 6?', options: ['hot and sunny', 'cold and snowy', 'rainy'], answer: 'hot and sunny' },
        { q: 'What goes up, up?', options: ['Biscuit’s hat', 'the moon', 'Beep'], answer: 'Biscuit’s hat' },
      ] },
    { kind: 'sentence-builder', name: 'Ask It', icon: '❓', intro: 'Listen. Build the question!',
      rounds: [
        { img: robot(3), line: 'How many stars are there?', extra: ['where'] },
        { img: robot(5), line: 'Where is the moon?', extra: ['many'] },
      ] },
    { kind: 'twister', name: 'Pup Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: robot(7), line: 'Run up, little pup, run up!', seconds: 40, focus: 'u', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '☀️', intro: 'Tap each sound, then Blend!', img: station,
      rounds: [
        { word: 'sun', sounds: ['s', 'u', 'n'], picture: it('sun') },
        { word: 'nut', sounds: ['n', 'u', 't'], picture: it('nut') },
      ] },
    chest('You did it! Song star!', robot(6)),
  ],
};

/** Lesson 4 "What's the Weather on the Planets?" */
export const QUEST_SPACE_WEATHER_A1_U3L4: HomeworkQuest = {
  id: 'space-weather-a1-u3l4', title: 'Weather Reporter Quest', subtitle: 'What’s the Weather on the Planets? · A1 Unit 3 · Lesson 4', level: 'A1', lessonKey: 'space-rich-3-4',
  theme: theme(robot(8)), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Weather Ears', icon: '🌦️', intro: 'Listen. Tap the planet!', img: deep,
      rounds: [
        { line: 'It’s cold and snowy.', answer: 'Planet Ice', options: [{ label: 'Planet Sun', src: P.sun }, { label: 'Planet Ice', src: P.ice }, { label: 'Planet Rain', src: P.rain }] },
        { line: 'It’s hot and sunny.', answer: 'Planet Sun', options: [{ label: 'Planet Sun', src: P.sun }, { label: 'Planet Wind', src: P.wind }, { label: 'Planet Ice', src: P.ice }] },
        { line: 'It’s rainy. I need an umbrella.', answer: 'umbrella', options: [{ label: 'sunglasses', src: it('sunglasses') }, { label: 'scarf', src: it('scarf') }, { label: 'umbrella', src: it('umbrella') }] },
      ] },
    { kind: 'true-false', name: 'Weather Check', icon: '❄️', intro: 'Look and listen. True or false?',
      rounds: [
        { img: robot(8), aspect: 16 / 9, line: 'It’s cold and snowy.', isTrue: true },
        { img: robot(6), aspect: 16 / 9, line: 'It’s rainy.', isTrue: false },
        { img: robot(7), aspect: 16 / 9, line: 'It’s windy.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'My Report', icon: '📺', intro: 'Listen. Build the weather report!',
      rounds: [
        { img: P.ice, line: 'It’s cold and snowy on Planet Ice.', extra: ['hot'] },
        { img: P.sun, line: 'It’s hot and sunny.', extra: ['snowy'] },
      ] },
    { kind: 'twister', name: 'Hot Pot Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: robot(6), line: 'A hot pot on a hot top.', seconds: 40, focus: 'o', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🍲', intro: 'Tap each sound, then Blend!', img: station,
      rounds: [
        { word: 'pot', sounds: ['p', 'o', 't'], picture: it('pot') },
        { word: 'mop', sounds: ['m', 'o', 'p'], picture: it('mop') },
      ] },
    chest('You did it! Weather reporter!', robot(8)),
  ],
};

/** Lesson 5 "Storybook: The Lost Robot" */
export const QUEST_LOST_ROBOT_A1_U3L5: HomeworkQuest = {
  id: 'lost-robot-a1-u3l5', title: 'Lost Robot Quest', subtitle: 'Storybook: The Lost Robot · A1 Unit 3 · Lesson 5', level: 'A1', lessonKey: 'space-rich-3-5',
  theme: theme(robot(10)), voice: 'teacher', praise,
  levels: [
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: robot(9),
      sentences: ['It is cold and snowy. Look! Little tracks.', 'Beep, beep! It is below us.', 'Go down! Go right!', 'Biscuit finds Beep!', 'Ten, nine, eight… Go! Beep is home.'],
      questions: [
        { q: 'Where is Beep?', options: ['below us', 'above us', 'on Planet Sun'], answer: 'below us' },
        { q: 'Who finds Beep?', options: ['Biscuit', 'Nova', 'Leo'], answer: 'Biscuit' },
        { q: 'What is the weather like?', options: ['cold and snowy', 'hot and sunny', 'windy'], answer: 'cold and snowy' },
      ] },
    { kind: 'true-false', name: 'Story Check', icon: '🤖', intro: 'Look and listen. True or false?',
      rounds: [
        { img: robot(10), aspect: 16 / 9, line: 'Beep is cold.', isTrue: true },
        { img: robot(11), aspect: 16 / 9, line: 'Biscuit finds Beep.', isTrue: true },
        { img: robot(12), aspect: 16 / 9, line: 'The rocket goes down.', isTrue: false },
      ] },
    { kind: 'sentence-builder', name: 'Story Lines', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: robot(11), line: 'Thank you, Biscuit!', extra: ['Beep'] },
        { img: robot(9), line: 'Go down! Go right!', extra: ['up!'] },
      ] },
    { kind: 'twister', name: 'Rocket Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: robot(12), line: 'Up, up, up the rocket runs!', seconds: 40, focus: 'u', sayIt: 'Now say it slow, then faster!' },
    chest('You did it! Robot rescuer!', robot(11)),
  ],
};

/** Lesson 6 "Space Game Day" */
export const QUEST_SPACE_GAME_DAY_A1_U3L6: HomeworkQuest = {
  id: 'space-game-day-a1-u3l6', title: 'Space Games Quest', subtitle: 'Space Game Day · A1 Unit 3 · Lesson 6', level: 'A1', lessonKey: 'space-rich-3-6',
  theme: theme(station), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Quick Ears', icon: '👂', intro: 'Listen. Tap it fast!', img: deep,
      rounds: [
        { line: 'It’s windy.', answer: 'Planet Wind', options: [{ label: 'Planet Wind', src: P.wind }, { label: 'Planet Ice', src: P.ice }, { label: 'Planet Sun', src: P.sun }] },
        { line: 'It’s above the rocket.', answer: 'moon', options: [{ label: 'star', src: it('star-gold') }, { label: 'robot', src: it('beep') }, { label: 'moon', src: it('moon') }] },
        { line: 'It’s cold. I need a scarf.', answer: 'scarf', options: [{ label: 'scarf', src: it('scarf') }, { label: 'kite', src: it('kite') }, { label: 'sunglasses', src: it('sunglasses') }] },
      ] },
    { kind: 'sentence-builder', name: 'Build It Fast', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: robot(3), line: 'There are fifty stars.', extra: ['fifteen'] },
        { img: robot(9), line: 'Beep is below us.', extra: ['above'] },
        { img: P.rain, line: 'It’s rainy.', extra: ['sunny'] },
      ] },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🛁', intro: 'Tap each sound, then Blend!', img: station,
      rounds: [
        { word: 'wing', sounds: ['w', 'ing'], picture: it('bird-fly') },
        { word: 'thin', sounds: ['th', 'i', 'n'], picture: it('thread') },
        { word: 'sun', sounds: ['s', 'u', 'n'], picture: it('sun') },
      ] },
    chest('You did it! Space Games champion!'),
  ],
};

/** Lesson 7 "Boss Test: Space Navigator!" */
export const QUEST_SPACE_NAVIGATOR_A1_U3L7: HomeworkQuest = {
  id: 'space-navigator-a1-u3l7', title: 'Space Navigator Quest', subtitle: 'Boss Test: Space Navigator! · A1 Unit 3 · Lesson 7', level: 'A1', lessonKey: 'space-rich-3-7',
  theme: theme(robot(12)), voice: 'teacher', praise,
  levels: [
    { kind: 'true-false', name: 'Navigator Check', icon: '🧭', intro: 'Look and listen. True or false?',
      rounds: [
        { img: robot(5), aspect: 16 / 9, line: 'The moon is above the rocket.', isTrue: true },
        { img: robot(8), aspect: 16 / 9, line: 'It’s hot and sunny.', isTrue: false },
        { img: robot(3), aspect: 16 / 9, line: 'There are forty stars.', isTrue: true },
      ] },
    { kind: 'reading', name: 'The Whole Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: robot(12),
      sentences: ['Beep is lost!', 'It is hot and sunny. Beep is not here.', 'It is cold and snowy. Look! Little tracks.', 'Biscuit finds Beep!', 'Up, up, up! Beep is home.'],
      questions: [
        { q: 'Is Beep on Planet Sun?', options: ['No, he isn’t.', 'Yes, he is.'], answer: 'No, he isn’t.' },
        { q: 'Who finds Beep?', options: ['Biscuit', 'the moon', 'Leo'], answer: 'Biscuit' },
      ] },
    { kind: 'sentence-builder', name: 'Boss Sentences', icon: '🏆', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: robot(3), line: 'There are one hundred stars.', extra: ['ten'] },
        { img: P.ice, line: 'It’s cold and snowy on Planet Ice.', extra: ['sunny'] },
      ] },
    chest('You did it! Space navigator!', robot(12)),
  ],
};
