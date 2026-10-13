// A1-S03-E1 "The Missing Poster" (Free Time Club, Cold Open), version 2 (owner 2026-10-14: "the same thing repeated from lesson one, unit one - be creative and original").
// A mystery at the Club Fair: Ava's club poster is gone and she needs three members by Friday. New scene (fair-night), new games (Explore: the fair is the game; Sort: your own opinions),
// a chat check-in, a hidden-number hunt for Remember?. NOT used here, because every Season 1 lesson used them: badge-and-convo opening, brief card, who-said, border booth, padlock, find-the-wrong-line.
// Plan: docs/academy-a1s03-plan.md. Research: docs/research/academy-a1s03-research.md, academy-lesson-sequencing.md, academy-a1s03-v2-research.md.
// Order (PPP with gradual release): context -> model -> rule -> controlled practice (two different games after every word set) -> free practice -> produce -> teach-back.
// Owner rules: the teacher MODELS first; the RULE is STATED plainly (3 lines) before practice; the student restates it; many vocabulary games (bonus games are `flex`).
import type { DeckScript, TeachArt } from '../types';

export const OBJECTIVE = 'By the end I can understand the Missing Poster story, say what I like and love, and tell Ava which club I would join.';
export const CRITERIA = [
  'I understood the Missing Poster story: who needs members and by when.',
  'I named the club words and the hobby words: club, member, poster, play, watch, listen to, draw.',
  'I said the rule: I like + a thing, I like + -ing, love is stronger than like.',
  'I said what I like and what I love: I like music. I love drawing.',
  'I said it to Ava with my name: Hello, I am ___. I like ___.',
];
/** The 14 new items of the blueprint (receptive): met in the story and at the stalls; most are also taught and practised. */
export const ITEMS = ['club', 'fair', 'member', 'join', 'free time', 'hobby', 'poster', 'play', 'watch', 'listen to', 'draw', 'Friday', 'I like…', 'I love…'];

const card = (id: string, label: string): TeachArt => ({ type: 'card', id, label });
const who = (w: 'Vee' | 'Ava' | 'Theo', pos: 'left' | 'right' | 'center', expr: 'happy' | 'wave' | 'thumbs' | 'neutral' | 'thinking' = 'happy') => ({ who: w, pos, expr });
const BONUS = 'Bonus game: skip it if time is short.';
const FN = 'fair-night';
const CLUB = card('v-club', 'a club banner');
const FAIR = card('v-fair', 'the club fair');
const MEMBER = card('v-member', 'a member badge');
const POSTER = card('v-poster', 'a poster');
const FRIDAY = card('v-friday', 'Friday on a calendar');
const PLAY = card('v-games', 'playing games');
const WATCH = card('v-watch', 'watching a film');
const LISTEN = card('v-listen', 'listening to music');
const DRAW = card('v-draw', 'drawing');
const MUSIC = card('v-music', 'music');
const FOOTBALL = card('v-football', 'football');
const LIKE = card('v-like', 'like and love');

export const FREE_TIME_CLUB_1: DeckScript = {
  lessonId: 'A1-S03-E1',
  level: 'A1',
  title: 'The Missing Poster · Cold Open',
  objective: OBJECTIVE,
  criteria: CRITERIA,
  cast: ['Vee', 'Ava', 'Theo'],
  partGoals: [
    'Meet Ava at the fair and see the mystery',
    'Wake up your numbers and your name sentences',
    'Walk the fair: what do they like? Meet the club words',
    'Learn the rule, then the hobby words and their games',
    'Sort your own hobbies',
    'Choose your help, then tell Ava what you like',
    'Write your poster lines and say them',
    'Say the rule again and see what you can do',
  ],
  slides: [
    // ---------- 0 · Check-in: a mystery that starts in your phone ----------
    { id: 'title', kind: 'title', part: 0, bg: FN, actors: [who('Vee', 'center', 'wave')], heading: 'The Missing Poster', sub: 'Free Time Club · lesson 1' },
    { id: 'badge', kind: 'badge', part: 0, bg: FN, actors: [who('Theo', 'right', 'wave')], trains: [5], prompt: 'Sign the guest book at the fair gate. Put your name on it.', starter: 'My name is', ages: [13, 14, 15, 16, 17, 18], hints: ['Type only your name, and tap your age.'] },
    {
      id: 'sos', kind: 'phonechat', part: 0, bg: 'phone-profile-closeup', contact: 'Ava', trains: [1, 5],
      prompt: 'A message from Ava! Tap the words to write your answers.',
      steps: [
        { text: 'SOS! My club poster is gone!', pic: POSTER, reply: 'Hi, Ava! I am {name}.', extra: ['bye', 'is'] },
        { text: 'Thanks! How old are you?', reply: 'I am {age}.', extra: ['is', 'from'] },
        { text: 'See you at the fair tonight!', pic: FAIR, reply: 'Bye, Ava!', extra: ['hello', 'am'] },
      ],
      hints: ['Read Ava’s message, then tap your words in order.'],
    },

    // ---------- 1 · Remember? (Season 1: numbers, names, countries): a hidden-number hunt ----------
    {
      id: 'hunt', kind: 'hunt', part: 1, stage: 'review', bg: FN, trains: [1],
      prompt: 'Find the hidden numbers on the stall signs: three, seven, ten.',
      targets: [{ word: 'three', n: 3, x: 31, y: 28 }, { word: 'seven', n: 7, x: 68, y: 28 }, { word: 'ten', n: 10, x: 14, y: 30 }],
      decoys: [{ n: 5, x: 50, y: 27 }, { n: 9, x: 86, y: 29 }],
    },
    {
      id: 'hear-numbers', kind: 'hearpick', part: 1, stage: 'review', bg: 'club-stage', actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Ava needs members. Which number do you hear? Tap it.',
      rounds: [
        { say: 'three', options: ['two', 'three', 'ten'], answer: 'three' },
        { say: 'seven', options: ['seven', 'six', 'eight'], answer: 'seven' },
        { say: 'ten', options: ['nine', 'ten', 'five'], answer: 'ten' },
      ],
      hints: ['Listen to the number, then find the same word.'],
    },
    {
      id: 'build-i-am', kind: 'build', part: 1, stage: 'review', bg: 'club-stage', actors: [who('Ava', 'left')], trains: [5],
      prompt: 'Build the sentence. Tap the words in the right order.',
      rounds: [{ cue: 'Ava says where she is from.', target: 'I am from Spain.', extra: ['in', 'at'] }, { cue: 'Theo says his name.', target: 'My name is Theo.', extra: ['am', 'I'] }],
      hints: ['Start with I am or My name is. Then the country or the name.'],
    },

    // ---------- 2 · The Drop: the fair is the game ----------
    {
      id: 'model-fair', kind: 'model', part: 2, stage: 'context', bg: FN, actors: [who('Vee', 'left'), who('Ava', 'center'), who('Theo', 'right')], trains: [1],
      title: 'Welcome to the Club Fair',
      lines: [
        { who: 'Vee', text: 'Welcome to the Club Fair!', pic: FAIR },
        { who: 'Ava', text: 'Hi! This is my club.', pic: CLUB },
        { who: 'Ava', text: 'Oh no! My poster is gone!', pic: POSTER },
        { who: 'Theo', text: 'Look! Five stalls. Ask them what they like!' },
      ],
      closing: 'Walk the fair. Tap every stall!',
    },
    {
      id: 'walk', kind: 'explore', part: 2, stage: 'context', bg: FN, trains: [1, 4],
      prompt: 'Walk the fair. Tap every glowing stall.',
      spots: [
        { id: 'music', x: 14, y: 58, art: MUSIC, who: 'Theo', line: 'I like music.', label: 'The music stall' },
        { id: 'games', x: 31, y: 58, art: PLAY, who: 'Theo', line: 'I like playing games.', label: 'The games stall' },
        { id: 'art', x: 50, y: 58, art: DRAW, who: 'Ava', line: 'I love drawing!', label: 'The art stall' },
        { id: 'films', x: 68, y: 58, art: WATCH, who: 'Vee', line: 'I like watching films.', label: 'The film stall' },
        { id: 'football', x: 86, y: 58, art: FOOTBALL, who: 'Theo', line: 'I like football.', label: 'The football stall' },
      ],
    },
    {
      id: 'gist', kind: 'convo', part: 2, stage: 'context', bg: 'club-lobby', actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Did you understand? Choose the answers.', me: 'Ava', meLabel: 'You', after: 'Yes! Ava needs three members by Friday.',
      steps: [
        { ask: 'Who needs members?', pic: CLUB, options: [{ text: 'Ava.', ok: true }, { text: 'Theo.', hint: 'Ava has the club.' }] },
        { ask: 'Who loves drawing?', pic: DRAW, options: [{ text: 'Ava.', ok: true }, { text: 'Theo.', hint: 'Ava says: I love drawing!' }] },
      ],
      hints: ['Think about the stalls. Who says it?'],
    },
    {
      id: 'teach-club', kind: 'teach', part: 2, bg: 'club-lobby', actors: [who('Ava', 'left')], trains: [1, 2], title: 'The club words',
      pages: [
        { word: 'club', art: CLUB, meaning: 'a group of people with the same hobby', example: 'Ava has a club.', clue: 'A club has members.' },
        { word: 'member', art: MEMBER, meaning: 'a person in a club', example: 'Ava needs three members.', clue: 'You join, then you are a member.' },
        { word: 'poster', art: POSTER, meaning: 'a big picture with words on a wall', example: 'Look at the poster!', clue: 'The poster says: join the club.' },
        { word: 'Friday', art: FRIDAY, meaning: 'a day of the week', example: 'Three members by Friday.', clue: 'Friday is the last school day.' },
      ],
      hints: ['Listen to each word. Press “Show again” to hear it again.'],
    },
    {
      id: 'match-club', kind: 'match', part: 2, bg: 'club-lobby', actors: [who('Ava', 'right')], trains: [1, 2], mode: 'listen',
      prompt: 'Listen. Tap the picture for what you hear.',
      pairs: [{ word: 'club', art: CLUB }, { word: 'member', art: MEMBER }, { word: 'poster', art: POSTER }, { word: 'Friday', art: FRIDAY }],
      hints: ['Listen to the word, then look for its picture.'],
    },

    // ---------- 3 · Notice & Build: the second game, the model, the rule, the hobby words ----------
    {
      id: 'mem-club', kind: 'memory', part: 3, bg: 'club-lobby', actors: [who('Ava', 'left')], trains: [1, 2],
      prompt: 'Memory! Find each picture and its word.',
      pairs: [{ art: CLUB, text: 'club' }, { art: MEMBER, text: 'member' }, { art: POSTER, text: 'poster' }, { art: FRIDAY, text: 'Friday' }],
      hints: ['Flip two cards. Say the word when you find a pair.'],
    },
    {
      id: 'match-club-drag', kind: 'match', part: 3, flex: true, note: BONUS, bg: 'club-lobby', actors: [who('Theo', 'right')], trains: [1, 2],
      prompt: 'Drag each club word onto its picture.',
      pairs: [{ word: 'club', art: CLUB }, { word: 'fair', art: FAIR }, { word: 'member', art: MEMBER }, { word: 'poster', art: POSTER }, { word: 'Friday', art: FRIDAY }],
      hints: ['Grab a word, drag it to the picture. Tap a word to hear it.'],
    },
    {
      id: 'model-like', kind: 'model', part: 3, stage: 'model', bg: 'club-stage', actors: [who('Vee', 'left'), who('Ava', 'center'), who('Theo', 'right')], trains: [3, 4],
      title: 'Listen: what do they like?',
      lines: [
        { who: 'Theo', text: 'I like music.', pic: MUSIC, frame: ['I like ', { slot: 'a thing', label: 'a thing' }, '.'] },
        { who: 'Ava', text: 'I love drawing.', pic: DRAW, frame: ['I love ', { slot: '-ing', label: 'a thing + -ing' }, '.'] },
        { who: 'Theo', text: 'I like playing games.', pic: PLAY, frame: ['I like ', { slot: '-ing', label: 'a word + -ing' }, '.'] },
      ],
      closing: 'Now you know how it sounds. Next: the rule.',
    },
    {
      id: 'rule-like', kind: 'rule', part: 3, stage: 'rule', bg: 'club-stage', actors: [who('Vee', 'left')], trains: [3],
      title: 'The rule: I like…',
      lines: [
        { rule: 'I like + a thing', say: 'I like, and then a thing.', example: 'I like music.' },
        { rule: 'I like + a word with -ing', say: 'I like, and then a word with i n g.', example: 'I like playing games.' },
        { rule: 'love is stronger than like', say: 'Love is stronger than like.', example: 'I love drawing.' },
      ],
      hints: ['Listen to each line, say it out loud, then tap “I said it”.'],
    },
    {
      id: 'teach-hobby', kind: 'teach', part: 3, bg: 'club-stage', actors: [who('Ava', 'left')], trains: [2, 3], title: 'Four hobby words',
      pages: [
        { word: 'play', art: PLAY, meaning: 'to do a game or a sport', example: 'I like playing games.', clue: 'play + games, play + football.' },
        { word: 'watch', art: WATCH, meaning: 'to look at a film or a video', example: 'I like watching films.', clue: 'watch + a film.' },
        { word: 'listen to', art: LISTEN, meaning: 'to hear music with attention', example: 'I like listening to music.', clue: 'listen to + music (always to).' },
        { word: 'draw', art: DRAW, meaning: 'to make a picture with a pencil', example: 'I love drawing.', clue: 'draw a picture, draw a comic.' },
      ],
      hints: ['Four hobby words. Say each word after the guide.'],
    },
    {
      id: 'match-hobby', kind: 'match', part: 3, stage: 'controlled', bg: 'club-stage', actors: [who('Ava', 'right')], trains: [2],
      prompt: 'Match each hobby word with its picture. Drag it onto the picture.',
      pairs: [{ word: 'play', art: PLAY }, { word: 'watch', art: WATCH }, { word: 'listen to', art: LISTEN }, { word: 'draw', art: DRAW }],
      hints: ['Tap a word to hear it, then tap the picture.'],
    },
    {
      id: 'hear-hobby', kind: 'hearpick', part: 3, stage: 'controlled', bg: 'club-stage', actors: [who('Vee', 'right')], trains: [2, 4],
      prompt: 'Which sentence do you hear? Tap it.',
      rounds: [
        { say: 'I like music.', options: ['I like music.', 'I love music.', 'I like games.'], answer: 'I like music.' },
        { say: 'I love drawing.', options: ['I like drawing.', 'I love drawing.', 'I love playing.'], answer: 'I love drawing.' },
        { say: 'I like watching films.', options: ['I like watching films.', 'I like listening to music.', 'I love watching films.'], answer: 'I like watching films.' },
      ],
      hints: ['Listen carefully. Like and love sound different.'],
    },
    {
      id: 'mem-hobby', kind: 'memory', part: 3, stage: 'controlled', flex: true, note: BONUS, bg: 'club-stage', actors: [who('Ava', 'left')], trains: [2],
      prompt: 'Memory! Find each hobby picture and its word.',
      pairs: [{ art: PLAY, text: 'play' }, { art: WATCH, text: 'watch' }, { art: LISTEN, text: 'listen to' }, { art: DRAW, text: 'draw' }],
      hints: ['Flip two cards. Say the word when you find a pair.'],
    },

    // ---------- 4 · Energiser: your own opinions ----------
    {
      id: 'shadow-hobby', kind: 'shadow', part: 4, stage: 'controlled', bg: 'locker-hall', actors: [who('Vee', 'right')], trains: [2],
      prompt: 'Whose shadow is it? Pick the hobby word.',
      rounds: [
        { art: WATCH, answer: 'watch', options: ['listen to', 'watch', 'draw'] },
        { art: LISTEN, answer: 'listen to', options: ['draw', 'listen to', 'watch'] },
        { art: DRAW, answer: 'draw', options: ['draw', 'play', 'listen to'] },
      ],
      hints: ['Look at the shape. Which hobby is it?'],
    },
    {
      id: 'sort-like', kind: 'sort', part: 4, stage: 'free', bg: 'locker-hall', actors: [who('Theo', 'right', 'wave')], trains: [3, 4],
      prompt: 'Your hobby wall: like or love? Tap a picture, then a box.',
      bins: [{ id: 'like', label: 'I like…', template: 'I like {w}.' }, { id: 'love', label: 'I love…', template: 'I love {w}.' }],
      items: [{ id: 'music', art: MUSIC, word: 'music' }, { id: 'games', art: PLAY, word: 'games' }, { id: 'draw', art: DRAW, word: 'drawing' }, { id: 'football', art: FOOTBALL, word: 'football' }, { id: 'films', art: WATCH, word: 'films' }],
      hints: ['There is no wrong answer. Put each picture where it is true for you.'],
    },

    // ---------- 5 · Mission: model first, then Take 1, feedback, Take 2 ----------
    { id: 'dial', kind: 'dial', part: 5, stage: 'produce', bg: FN, actors: [who('Vee', 'right', 'thumbs')], prompt: 'Mission time! How much help do you want?' },
    {
      id: 'model-task', kind: 'model', part: 5, stage: 'model', bg: FN, actors: [who('Ava', 'left'), who('Theo', 'right')], trains: [4, 5],
      title: 'Watch Theo do the mission first',
      lines: [
        { who: 'Ava', text: 'Hello! What is your name?' },
        { who: 'Theo', text: 'Hello! I am Theo.' },
        { who: 'Ava', text: 'What do you like?' },
        { who: 'Theo', text: 'I like music. I love playing games.', pic: PLAY },
        { who: 'Ava', text: 'Great! Join my club!' },
      ],
      closing: 'Now it is your turn.',
    },
    {
      id: 'build-badge', kind: 'build', part: 5, stage: 'controlled', bg: FN, actors: [who('Ava', 'left')], trains: [4, 5],
      prompt: 'Warm up, together: build your lines. Tap the words in the right order.',
      rounds: [
        { cue: 'Say your name (Ava).', target: 'Hello, I am Ava.', extra: ['my', 'like'] },
        { cue: 'Say what you love.', target: 'I love playing games.', extra: ['am', 'drawing'] },
      ],
      hints: ['Hello first, then your name. Then what you love.'],
    },
    {
      id: 'say-take1', kind: 'say', part: 5, stage: 'produce', bg: FN, actors: [who('Ava', 'right', 'wave')], trains: [4, 5], open: true,
      prompt: 'Take 1 · Ava asks: What do you like? Say your name and two things.',
      model: 'Hello, I am {name}. I like music. I love drawing.',
      byDial: { chill: 'I like music.', normal: 'Hello, I am {name}. I like music. I love drawing.', push: 'Hello, I am {name}. I like music and I love drawing.' },
      hints: ['Say your own hobbies. Look at the rule if you need it.'],
    },
    {
      id: 'fade', kind: 'fade', part: 5, stage: 'produce', bg: 'club-stage', actors: [who('Ava', 'left'), who('Theo', 'right')], trains: [3, 4],
      prompt: 'Feedback time! Say the lines again, with less help each round, before Take 2.',
      lines: [
        { who: 'Ava', text: 'I love drawing.', keys: ['love', 'drawing'] },
        { who: 'Theo', text: 'I like playing games.', keys: ['like', 'playing'] },
        { who: 'Ava', text: 'I like listening to music.', keys: ['like', 'music'] },
      ],
    },
    {
      id: 'say-take2', kind: 'say', part: 5, stage: 'produce', bg: FN, actors: [who('Theo', 'right')], trains: [4, 5], open: true,
      prompt: 'Take 2 · Start with hello for Theo, then say what you like and love.',
      model: 'Hello, Theo! I am {name}. I like music. I love drawing.',
      hints: ['Hello first, then your name, then what you like.'],
    },

    // ---------- 6 · Release: your poster ----------
    {
      id: 'write', kind: 'write', part: 6, stage: 'produce', bg: 'club-signup-desk', actors: [who('Vee', 'right')], trains: [3, 4], stamp: 'like',
      prompt: 'Make a new poster for the club. Write two lines. The model is hidden. Try first.',
      rows: [
        { label: 'Say one thing you like.', frame: 'I like ___.', accept: ['^i like (?!to\\b).+'], hint: 'Start with I like. Example: I like music.', sample: 'I like music.' },
        { label: 'Say one thing you love.', frame: 'I love ___.', accept: ['^i love .+'], hint: 'Start with I love. Example: I love drawing.', sample: 'I love drawing.' },
      ],
      hints: ['Use your own hobbies.'],
    },
    {
      id: 'say-release', kind: 'say', part: 6, stage: 'produce', bg: 'club-signup-desk', actors: [who('Ava', 'left', 'happy')], trains: [4, 5],
      prompt: 'Voice note · Tell Ava which club you would join. Try without help first.',
      model: 'Hello, Ava! I am {name}. I like music and I love drawing. I join your club!',
      hints: ['Press “Show me” if you want to see the line.'],
    },
    {
      id: 'recap-hear', kind: 'hearpick', part: 6, stage: 'review', bg: 'club-signup-desk', actors: [who('Vee', 'right')], trains: [3],
      prompt: 'Rule check! Which sentence has a word with -ing? Tap it.',
      rounds: [
        { say: 'I like playing games.', options: ['I like music.', 'I like playing games.', 'I love music.'], answer: 'I like playing games.' },
        { say: 'I love drawing.', options: ['I like drawing.', 'I love drawing.', 'I like music.'], answer: 'I love drawing.' },
      ],
      hints: ['Listen for like or love, and for -ing.'],
    },

    // ---------- 7 · Wrap ----------
    {
      id: 'teach-back', kind: 'say', part: 7, stage: 'review', bg: FN, actors: [who('Vee', 'right')], trains: [3],
      prompt: 'Teach-back · Tell Vee the rule in your own words. Then give one example.',
      model: 'I like + a thing: I like music. I like + -ing: I like drawing. Love is stronger than like.',
      hints: ['Say it like you teach a friend. Like and love, a thing or -ing.'],
    },
    {
      id: 'wrap', kind: 'wrap', part: 7, bg: FN, actors: [who('Vee', 'left', 'thumbs')], heading: 'The fair is open!', ticks: CRITERIA,
      homework: 'Homework: send Ava one voice note: “I like ___. I love ___.” Not yet is okay!',
      clue: 'Clue 1 of 8: Ava’s poster is gone, but there is a torn corner on the art stall. It starts with the letter M. Who could it be?',
    },
  ],
};
