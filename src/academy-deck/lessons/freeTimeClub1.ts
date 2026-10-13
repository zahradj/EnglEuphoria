// A1-S03-E1 "Free Time Club" (Cold Open): the Club Fair story, hobby words and the first rule "I like ...".
// Plan: docs/academy-a1s03-plan.md. Research: docs/research/academy-a1s03-research.md (mechanics) and academy-lesson-sequencing.md (order: context, model, rule, controlled, free, produce).
// Owner rules (2026-10-13): the teacher MODELS first and the RULE is STATED plainly (3 lines) before practice; the student restates it at the end (teach-back).
// Cast: Vee (mentor), Ava (lead, her club closes unless 3 members join by Friday), Theo. Every slide = a scene plate + ONE game; no two neighbours share a game.
import type { DeckScript, TeachArt } from '../types';

export const OBJECTIVE = 'By the end I can understand the Club Fair story, say what I like and love, and tell which club I would join.';
export const CRITERIA = [
  'I understood the Club Fair story: who needs members and by when.',
  'I named the club words and the hobby words: club, member, poster, play, watch, listen to, draw.',
  'I said the rule: I like + a thing, I like + -ing, love is stronger than like.',
  'I said what I like and what I love: I like music. I love drawing.',
  'I said it to Theo with my name: Hello, I am ___. I like ___.',
];
/** The 14 new items of the blueprint (receptive): met in the story; the first nine are also taught and practised, the rest are met in the story and the rule. */
export const ITEMS = ['club', 'fair', 'member', 'join', 'free time', 'hobby', 'poster', 'play', 'watch', 'listen to', 'draw', 'Friday', 'I like…', 'I love…'];

const card = (id: string, label: string): TeachArt => ({ type: 'card', id, label });
const who = (w: 'Vee' | 'Ava' | 'Theo', pos: 'left' | 'right' | 'center', expr: 'happy' | 'wave' | 'thumbs' | 'neutral' | 'thinking' = 'happy') => ({ who: w, pos, expr });
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
  title: 'Club Fair · Cold Open',
  objective: OBJECTIVE,
  criteria: CRITERIA,
  cast: ['Vee', 'Ava', 'Theo'],
  partGoals: [
    'Say hello and see today’s goal',
    'Wake up names, ages and countries',
    'Watch the Club Fair story and learn the club words',
    'See it, learn the rule, then practise the hobby words',
    'A quick game of choices',
    'Choose your help, then tell Theo what you like',
    'Write and say what you like',
    'Say the rule again and see what you can do',
  ],
  slides: [
    // ---------- 0 · Check-in ----------
    { id: 'title', kind: 'title', part: 0, bg: 'club-lobby', actors: [who('Vee', 'center', 'wave')], heading: 'Club Fair', sub: 'Free Time Club · lesson 1' },
    {
      id: 'brief', kind: 'brief', part: 0, bg: 'club-lobby', actors: [who('Vee', 'left')],
      say: 'Welcome to the Club Fair! Ava needs three members by Friday. Today you meet the club and say what you like.', heading: 'Your fair card',
      stamps: [{ id: 'story', icon: 'eyes', label: 'Understand the story' }, { id: 'rule', icon: 'check', label: 'Say the rule' }, { id: 'like', icon: 'chat', label: 'Say what I like' }],
    },
    { id: 'badge', kind: 'badge', part: 0, bg: 'club-lobby', actors: [who('Theo', 'right', 'wave')], trains: [5], prompt: 'Theo gives you a fair badge. Put your name on it.', starter: 'My name is', ages: [13, 14, 15, 16, 17, 18], hints: ['Type only your name, and tap your age.'] },
    {
      id: 'feel', kind: 'convo', part: 0, bg: 'club-lobby', actors: [who('Theo', 'right')], trains: [5],
      prompt: 'Quick questions from Theo. Choose your answers.', me: 'Ava', meLabel: 'You', after: 'Thanks! Now the fair can start.',
      steps: [
        { ask: 'Hi, {name}! How are you today?', pic: card('v-hello', 'hello'), options: [{ text: 'I am great!', pic: card('v-great', 'feeling great'), ok: true }, { text: 'I am fine.', pic: card('v-fine', 'feeling fine'), ok: true }, { text: 'I am tired.', pic: card('v-tired', 'feeling tired'), ok: true }] },
        { ask: 'How old are you?', pic: card('v-age', 'a birthday cake'), options: [{ text: 'I am 13.', ok: true }, { text: 'I am 16.', ok: true }, { text: 'I am from Spain.', hint: 'Spain is a place. Theo asks about your age.' }] },
        { ask: 'Where are you from?', pic: card('v-country', 'the world'), options: [{ text: 'I am from Brazil.', pic: { type: 'flag', code: 'br' }, ok: true }, { text: 'I am from Italy.', pic: { type: 'flag', code: 'it' }, ok: true }, { text: 'I am 15.', hint: 'Theo asks about a country.' }] },
      ],
      hints: ['There is no wrong answer. Choose what is true for you.'],
    },

    // ---------- 1 · Remember? (lessons before: name, age, country) ----------
    {
      id: 'whosaid', kind: 'whosaid', part: 1, stage: 'review', bg: 'club-signup-desk', actors: [who('Ava', 'left'), who('Theo', 'right')], trains: [5],
      replayTitle: 'Remember the sign-up desk? Ava met Theo…',
      replay: [{ who: 'Theo', text: 'What is your name?' }, { who: 'Ava', text: 'My name is Ava.' }, { who: 'Theo', text: 'Where are you from?' }, { who: 'Ava', text: 'I am from Spain.' }],
      prompt: 'Who said it? Drag each bubble to Ava or Theo.',
      items: [{ text: 'What is your name?', who: 'Theo' }, { text: 'My name is Ava.', who: 'Ava' }, { text: 'Where are you from?', who: 'Theo' }, { text: 'I am from Spain.', who: 'Ava' }],
      hints: ['Questions come from Theo. Answers come from Ava.'],
    },
    {
      id: 'mem-flags', kind: 'memory', part: 1, stage: 'review', bg: 'club-signup-desk', actors: [who('Vee', 'right')], trains: [5],
      prompt: 'Memory! Match each flag with its country.',
      pairs: [{ flag: 'es', text: 'Spain' }, { flag: 'it', text: 'Italy' }, { flag: 'br', text: 'Brazil' }, { flag: 'fr', text: 'France' }],
      hints: ['Flip two cards. Say the country when you find a pair.'],
    },
    {
      id: 'build-i-am', kind: 'build', part: 1, stage: 'review', bg: 'club-signup-desk', actors: [who('Ava', 'left')], trains: [5],
      prompt: 'Build the sentence. Tap the words in the right order.',
      rounds: [{ cue: 'Say your age (13).', target: 'I am 13.', extra: ['is', 'are'] }, { cue: 'Say where Ava is from.', target: 'I am from Spain.', extra: ['in', 'at'] }],
      hints: ['Start with I am. Then the number or the country.'],
    },

    // ---------- 2 · The Drop: the story, then the club words ----------
    {
      id: 'model-fair', kind: 'model', part: 2, stage: 'context', bg: 'club-lobby', actors: [who('Vee', 'left'), who('Ava', 'center'), who('Theo', 'right')], trains: [1],
      title: 'Watch the Club Fair',
      lines: [
        { who: 'Vee', text: 'Welcome to the Club Fair!', pic: FAIR },
        { who: 'Ava', text: 'Hi! I am Ava. This is my club.', pic: CLUB },
        { who: 'Theo', text: 'Hello, Ava. I like music.', pic: MUSIC },
        { who: 'Ava', text: 'I love drawing! Join my club!', pic: DRAW },
        { who: 'Ava', text: 'We need three members. Look at the poster!', pic: POSTER },
        { who: 'Theo', text: 'Free time is fun. I play games.', pic: PLAY },
        { who: 'Ava', text: 'Three members by Friday, please!', pic: FRIDAY },
        { who: 'Vee', text: 'Join the club, Theo?' },
      ],
      closing: 'Theo says: maybe! Now you know the club words.',
    },
    {
      id: 'gist', kind: 'convo', part: 2, stage: 'context', bg: 'club-lobby', actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Did you understand the story? Choose the answers.', me: 'Ava', meLabel: 'You', after: 'Yes! Ava needs three members by Friday.',
      steps: [
        { ask: 'Who has a club?', pic: CLUB, options: [{ text: 'Ava has a club.', ok: true }, { text: 'Vee has a club.', hint: 'Vee says welcome. Ava says “my club”.' }] },
        { ask: 'How many members does Ava need?', pic: POSTER, options: [{ text: 'Three.', ok: true }, { text: 'Ten.', hint: 'Look at the poster: three members.' }] },
        { ask: 'What does Theo like?', pic: MUSIC, options: [{ text: 'Music.', pic: MUSIC, ok: true }, { text: 'Football.', pic: FOOTBALL, hint: 'Theo says: I like music.' }, { text: 'Drawing.', pic: DRAW, hint: 'Ava loves drawing. Theo likes music.' }] },
      ],
      hints: ['Think about the story. Ava has a club. She needs members.'],
    },
    {
      id: 'teach-club', kind: 'teach', part: 2, stage: 'model', bg: 'club-lobby', actors: [who('Vee', 'left')], trains: [1, 2], title: 'The club words',
      pages: [
        { word: 'club', art: CLUB, meaning: 'a group of people with the same hobby', example: 'Ava has a club.', clue: 'A club has members.' },
        { word: 'fair', art: FAIR, meaning: 'a place with stalls where clubs say hello', example: 'We are at the Club Fair.', clue: 'Clubs show their posters at a fair.' },
        { word: 'member', art: MEMBER, meaning: 'a person in a club', example: 'Ava needs three members.', clue: 'You join, then you are a member.' },
        { word: 'poster', art: POSTER, meaning: 'a big picture with words on a wall', example: 'Look at the poster!', clue: 'The poster says: join the club.' },
        { word: 'Friday', art: FRIDAY, meaning: 'a day of the week', example: 'Three members by Friday.', clue: 'Friday is the last school day.' },
      ],
      hints: ['Listen to each word. Press “Show again” to hear it again.'],
    },
    {
      id: 'match-club', kind: 'match', part: 2, stage: 'controlled', bg: 'club-lobby', actors: [who('Vee', 'right')], trains: [1, 2], mode: 'listen',
      prompt: 'Listen. Tap the picture for what you hear.',
      pairs: [{ word: 'club', art: CLUB }, { word: 'fair', art: FAIR }, { word: 'member', art: MEMBER }, { word: 'poster', art: POSTER }],
      hints: ['Listen to the word, then look for its picture.'],
    },
    {
      id: 'mem-club', kind: 'memory', part: 2, stage: 'controlled', bg: 'club-lobby', actors: [who('Vee', 'left')], trains: [2],
      prompt: 'Memory! Find each picture and its word.',
      pairs: [{ art: CLUB, text: 'club' }, { art: FAIR, text: 'fair' }, { art: MEMBER, text: 'member' }, { art: POSTER, text: 'poster' }],
      hints: ['Flip two cards. Say the word when you find a pair.'],
    },

    // ---------- 3 · Model, rule, hobby words, controlled practice ----------
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
      hints: ['Four hobby words. Say each one after the guide.'],
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

    // ---------- 4 · Energiser: free choices ----------
    {
      id: 'this-or-that', kind: 'convo', part: 4, stage: 'free', bg: 'locker-hall', actors: [who('Theo', 'right', 'wave')], trains: [4],
      prompt: 'This or that? Pick one each time. Say “I like…” out loud.', me: 'Ava', meLabel: 'You', after: 'Nice! You like lots of things.',
      steps: [
        { ask: 'Football or music?', pic: LIKE, options: [{ text: 'I like football.', pic: FOOTBALL, ok: true }, { text: 'I like music.', pic: MUSIC, ok: true }] },
        { ask: 'Games or drawing?', pic: LIKE, options: [{ text: 'I like playing games.', pic: PLAY, ok: true }, { text: 'I like drawing.', pic: DRAW, ok: true }] },
        { ask: 'Watch a film or listen to music?', pic: LIKE, options: [{ text: 'I like watching films.', pic: WATCH, ok: true }, { text: 'I like listening to music.', pic: LISTEN, ok: true }] },
      ],
      hints: ['There is no wrong answer. Choose what is true for you.'],
    },
    {
      id: 'build-like', kind: 'build', part: 4, stage: 'free', bg: 'locker-hall', actors: [who('Ava', 'left')], trains: [3, 4],
      prompt: 'Build the sentence. Tap the words in the right order.',
      rounds: [
        { cue: 'Theo: music.', target: 'I like music.', extra: ['am', 'love'] },
        { cue: 'Ava: drawing, a lot.', target: 'I love drawing.', extra: ['like', 'is'] },
      ],
      hints: ['Start with I. Then like or love. Then the hobby.'],
    },

    // ---------- 5 · Mission: model first, then Take 1, feedback, Take 2 ----------
    { id: 'dial', kind: 'dial', part: 5, stage: 'produce', bg: 'club-lobby', actors: [who('Vee', 'right', 'thumbs')], prompt: 'Mission time! How much help do you want?' },
    {
      id: 'model-task', kind: 'model', part: 5, stage: 'model', bg: 'club-lobby', actors: [who('Ava', 'left'), who('Theo', 'right')], trains: [5],
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
      id: 'build-badge', kind: 'build', part: 5, stage: 'controlled', bg: 'club-lobby', actors: [who('Ava', 'left')], trains: [4, 5],
      prompt: 'Warm up, together: build your badge line. Tap the words in the right order.',
      rounds: [
        { cue: 'Say your name (Ava).', target: 'Hello, I am Ava.', extra: ['my', 'like'] },
        { cue: 'Say what you love.', target: 'I love playing games.', extra: ['am', 'drawing'] },
      ],
      hints: ['Hello first, then your name. Then what you love.'],
    },
    {
      id: 'say-take1', kind: 'say', part: 5, stage: 'produce', bg: 'club-lobby', actors: [who('Ava', 'right', 'wave')], trains: [4, 5], open: true,
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
      id: 'say-take2', kind: 'say', part: 5, stage: 'produce', bg: 'club-lobby', actors: [who('Theo', 'right')], trains: [4, 5], open: true,
      prompt: 'Take 2 · Start with hello for Theo, then say what you like and love.',
      model: 'Hello, Theo! I am {name}. I like music. I love drawing.',
      hints: ['Hello first, then your name, then what you like.'],
    },

    // ---------- 6 · Release ----------
    {
      id: 'write', kind: 'write', part: 6, stage: 'produce', bg: 'club-signup-desk', actors: [who('Vee', 'right')], trains: [3, 4], stamp: 'like',
      prompt: 'Your club card. The model is hidden. Try first.',
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
      id: 'teach-back', kind: 'say', part: 7, stage: 'review', bg: 'club-lobby', actors: [who('Vee', 'right')], trains: [3],
      prompt: 'Teach-back · Tell Vee the rule in your own words. Then give one example.',
      model: 'I like + a thing: I like music. I like + -ing: I like drawing. Love is stronger than like.',
      hints: ['Say it like you teach a friend. Like and love, a thing or -ing.'],
    },
    {
      id: 'wrap', kind: 'wrap', part: 7, bg: 'club-lobby', actors: [who('Vee', 'left', 'thumbs')], heading: 'The fair is open!', ticks: CRITERIA,
      homework: 'Homework: send Ava one voice note: “I like ___. I love ___.” Not yet is okay!',
      clue: 'Clue 1 of 8: Ava’s poster has a smudge. A name on it starts with M. Who could it be?',
    },
  ],
};
