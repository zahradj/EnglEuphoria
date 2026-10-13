// A1-S03-E2 "Free Time Club" (Word Lab): 14 hobby words and the verb chunks play / go / like + -ing.
// Plan: docs/academy-a1s03-plan.md. Research: docs/research/academy-a1s03e2-research.md (+ academy-a1s03-research.md, academy-lesson-sequencing.md).
// Order (PPP with gradual release): context -> model -> rule -> controlled practice (two different games after every word set) -> free practice -> produce -> teach-back.
// Owner rules: the teacher MODELS first; the RULE is STATED plainly (3 lines) before practice; the student restates it (teach-back); more vocabulary games (bonus games are `flex`).
// Cast: Vee (mentor), Ava (lead), Theo. Every slide = a scene plate + ONE game; no two neighbours share a game.
import type { DeckScript, TeachArt } from '../types';

export const OBJECTIVE = 'By the end I can name 14 hobbies and say which verb goes with them: I play tennis. I go swimming. I like cooking.';
export const CRITERIA = [
  'I understood the hobby wall story: who plays, who goes, who likes.',
  'I named the hobbies: basketball, tennis, swimming, running, dancing, singing, cooking, reading, photos.',
  'I said the rule: play + a sport, go + -ing, like + -ing.',
  'I said what I play, what I go and what I like: I play tennis. I go swimming. I like cooking.',
  'I said it to Ava with my name: Hello, I am ___. I play ___.',
];
/** The 14 items of the blueprint (core-productive). Nine are new today; football, gaming, drawing, music and films return from lesson 1 and are met again in Remember? and the games. */
export const ITEMS = ['football', 'basketball', 'tennis', 'swimming', 'running', 'dancing', 'singing', 'drawing', 'cooking', 'reading', 'gaming', 'photos', 'music', 'films'];

const card = (id: string, label: string): TeachArt => ({ type: 'card', id, label });
const who = (w: 'Vee' | 'Ava' | 'Theo', pos: 'left' | 'right' | 'center', expr: 'happy' | 'wave' | 'thumbs' | 'neutral' | 'thinking' = 'happy') => ({ who: w, pos, expr });
const BONUS = 'Bonus game: skip it if time is short.';
const FAIR = card('v-fair', 'the club fair');
const POSTER = card('v-poster', 'a poster');
const FOOTBALL = card('v-football', 'football');
const GAMES = card('v-games', 'playing games');
const DRAW = card('v-draw', 'drawing');
const MUSIC = card('v-music', 'music');
const WATCH = card('v-watch', 'watching films');
const LISTEN = card('v-listen', 'listening to music');
const PLAY = card('v-games', 'playing games');
const BASKETBALL = card('v-basketball', 'basketball');
const TENNIS = card('v-tennis', 'tennis');
const SWIM = card('v-swim', 'swimming');
const RUN = card('v-run', 'running');
const DANCE = card('v-dance', 'dancing');
const SING = card('v-sing', 'singing');
const COOK = card('v-cook', 'cooking');
const READ = card('v-read', 'reading');
const PHOTO = card('v-photo', 'taking photos');
const LIKE = card('v-like', 'like and love');

export const FREE_TIME_CLUB_2: DeckScript = {
  lessonId: 'A1-S03-E2',
  level: 'A1',
  title: 'Hobby Wall · Word Lab',
  objective: OBJECTIVE,
  criteria: CRITERIA,
  cast: ['Vee', 'Ava', 'Theo'],
  partGoals: [
    'Say hello and see today’s goal',
    'Wake up the club words and I like…',
    'See the hobby wall, learn the rule, meet the first hobbies',
    'Go and like: more hobby words and games',
    'More hobby words and games',
    'Choose your help, then tell Ava your hobbies',
    'Write and say your hobbies',
    'Say the rule again and see what you can do',
  ],
  slides: [
    // ---------- 0 · Check-in ----------
    { id: 'title', kind: 'title', part: 0, bg: 'club-lobby', actors: [who('Vee', 'center', 'wave')], heading: 'Hobby Wall', sub: 'Free Time Club · lesson 2' },
    {
      id: 'brief', kind: 'brief', part: 0, bg: 'club-lobby', actors: [who('Vee', 'left')],
      say: 'Day two at the Club Fair! Today you learn lots of hobbies and say which verb goes with them.', heading: 'Your fair card',
      stamps: [{ id: 'words', icon: 'abc', label: 'Name the hobbies' }, { id: 'rule', icon: 'check', label: 'Say the rule' }, { id: 'say', icon: 'chat', label: 'Say what I play and go' }],
    },
    { id: 'badge', kind: 'badge', part: 0, bg: 'club-lobby', actors: [who('Theo', 'right', 'wave')], trains: [5], prompt: 'Theo gives you your fair badge again. Put your name on it.', starter: 'My name is', ages: [13, 14, 15, 16, 17, 18], hints: ['Type only your name, and tap your age.'] },
    {
      id: 'feel', kind: 'convo', part: 0, bg: 'club-lobby', actors: [who('Theo', 'right')], trains: [5],
      prompt: 'Quick questions from Theo. Choose your answers.', me: 'Ava', meLabel: 'You', after: 'Thanks! Now the hobby wall can open.',
      steps: [
        { ask: 'Hi, {name}! How are you today?', pic: card('v-hello', 'hello'), options: [{ text: 'I am great!', pic: card('v-great', 'feeling great'), ok: true }, { text: 'I am fine.', pic: card('v-fine', 'feeling fine'), ok: true }, { text: 'I am tired.', pic: card('v-tired', 'feeling tired'), ok: true }] },
        { ask: 'What do you like?', pic: LIKE, options: [{ text: 'I like music.', pic: MUSIC, ok: true }, { text: 'I love drawing.', pic: DRAW, ok: true }, { text: 'I like football.', pic: FOOTBALL, ok: true }] },
      ],
      hints: ['There is no wrong answer. Choose what is true for you.'],
    },

    // ---------- 1 · Remember? (lesson 1: club words, I like / I love, play watch listen to draw) ----------
    {
      id: 'hear-recap', kind: 'hearpick', part: 1, stage: 'review', bg: 'club-stage', actors: [who('Vee', 'right')], trains: [4],
      prompt: 'Remember last time? Which sentence do you hear? Tap it.',
      rounds: [
        { say: 'I like music.', options: ['I like music.', 'I love music.', 'I like games.'], answer: 'I like music.' },
        { say: 'I love drawing.', options: ['I like drawing.', 'I love drawing.', 'I love playing.'], answer: 'I love drawing.' },
        { say: 'I like playing games.', options: ['I like playing games.', 'I like watching films.', 'I love playing games.'], answer: 'I like playing games.' },
      ],
      hints: ['Listen carefully. Like and love sound different.'],
    },
    {
      id: 'match-recap', kind: 'match', part: 1, stage: 'review', bg: 'club-stage', actors: [who('Ava', 'left')], trains: [2],
      prompt: 'Remember the hobby words? Drag each word onto its picture.',
      pairs: [{ word: 'play', art: PLAY }, { word: 'watch', art: WATCH }, { word: 'listen to', art: LISTEN }, { word: 'draw', art: DRAW }],
      hints: ['Tap a word to hear it, then tap the picture.'],
    },
    {
      id: 'build-recap', kind: 'build', part: 1, stage: 'review', bg: 'club-stage', actors: [who('Theo', 'right')], trains: [4],
      prompt: 'Build the sentence. Tap the words in the right order.',
      rounds: [{ cue: 'Theo: music.', target: 'I like music.', extra: ['am', 'love'] }, { cue: 'Ava: drawing, a lot.', target: 'I love drawing.', extra: ['like', 'is'] }],
      hints: ['Start with I. Then like or love. Then the hobby.'],
    },

    // ---------- 2 · The Drop: the hobby wall, the model, the rule, the first words ----------
    {
      id: 'model-wall', kind: 'model', part: 2, stage: 'context', bg: 'club-lobby', actors: [who('Vee', 'left'), who('Ava', 'center'), who('Theo', 'right')], trains: [1],
      title: 'Watch the hobby wall',
      lines: [
        { who: 'Vee', text: 'Day two at the Club Fair!', pic: FAIR },
        { who: 'Ava', text: 'Look at the hobby wall. What do you like?', pic: POSTER },
        { who: 'Theo', text: 'I play basketball and tennis.', pic: BASKETBALL },
        { who: 'Ava', text: 'I go swimming and running.', pic: SWIM },
        { who: 'Theo', text: 'I like cooking and reading.', pic: COOK },
        { who: 'Vee', text: 'Join the club, Theo?' },
      ],
      closing: 'Theo says: maybe! Now you know the hobby words.',
    },
    {
      id: 'gist', kind: 'convo', part: 2, stage: 'context', bg: 'club-lobby', actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Did you understand the story? Choose the answers.', me: 'Ava', meLabel: 'You', after: 'Yes! Theo plays, Ava goes, and Theo likes cooking.',
      steps: [
        { ask: 'Who plays basketball?', pic: BASKETBALL, options: [{ text: 'Theo.', ok: true }, { text: 'Ava.', hint: 'Theo says: I play basketball.' }] },
        { ask: 'Who goes swimming?', pic: SWIM, options: [{ text: 'Ava.', ok: true }, { text: 'Theo.', hint: 'Ava says: I go swimming.' }] },
      ],
      hints: ['Think about the story. Who says it?'],
    },
    {
      id: 'model-chunks', kind: 'model', part: 2, stage: 'model', bg: 'club-stage', actors: [who('Vee', 'left'), who('Ava', 'center'), who('Theo', 'right')], trains: [1, 3, 4],
      title: 'Listen: play, go and like',
      lines: [
        { who: 'Theo', text: 'I play tennis.', pic: TENNIS, frame: ['I play ', { slot: 'a sport', label: 'a sport or a game' }, '.'] },
        { who: 'Ava', text: 'I go swimming.', pic: SWIM, frame: ['I go ', { slot: '-ing', label: 'a word + -ing' }, '.'] },
        { who: 'Theo', text: 'I like cooking.', pic: COOK, frame: ['I like ', { slot: '-ing', label: 'a word + -ing' }, '.'] },
      ],
      closing: 'Now you know how it sounds. Next: the rule.',
    },
    {
      id: 'rule-verbs', kind: 'rule', part: 2, stage: 'rule', bg: 'club-stage', actors: [who('Vee', 'left')], trains: [3],
      title: 'The rule: play, go, like',
      lines: [
        { rule: 'play + a sport or a game', say: 'Play, and then a sport or a game.', example: 'I play tennis.' },
        { rule: 'go + a word with -ing', say: 'Go, and then a word with i n g.', example: 'I go swimming.' },
        { rule: 'like + a word with -ing, for any hobby', say: 'Like, and then a word with i n g, for any hobby.', example: 'I like cooking.' },
      ],
      hints: ['Listen to each line, say it out loud, then tap “I said it”.'],
    },
    {
      id: 'teach-a', kind: 'teach', part: 2, bg: 'club-stage', actors: [who('Ava', 'left')], trains: [1, 2], title: 'Two new sports: you play them',
      pages: [
        { word: 'basketball', art: BASKETBALL, meaning: 'a team sport with a ball and a hoop', example: 'I play basketball.', clue: 'play + basketball.' },
        { word: 'tennis', art: TENNIS, meaning: 'a sport with rackets and a ball', example: 'I play tennis.', clue: 'play + tennis.' },
      ],
      hints: ['Say each word after the guide.'],
    },
    {
      id: 'match-a', kind: 'match', part: 2, stage: 'controlled', bg: 'club-stage', actors: [who('Ava', 'right')], trains: [2], mode: 'listen',
      prompt: 'Listen. Tap the picture for what you hear.',
      pairs: [{ word: 'football', art: FOOTBALL }, { word: 'basketball', art: BASKETBALL }, { word: 'tennis', art: TENNIS }, { word: 'games', art: GAMES }],
      hints: ['Listen to the word, then look for its picture.'],
    },

    // ---------- 3 · Notice & Build: more words, two games after each set ----------
    {
      id: 'mem-a', kind: 'memory', part: 3, stage: 'controlled', bg: 'club-stage', actors: [who('Ava', 'left')], trains: [2],
      prompt: 'Memory! Find each picture and its word.',
      pairs: [{ art: FOOTBALL, text: 'football' }, { art: BASKETBALL, text: 'basketball' }, { art: TENNIS, text: 'tennis' }, { art: GAMES, text: 'games' }],
      hints: ['Flip two cards. Say the word when you find a pair.'],
    },
    {
      id: 'match-a-drag', kind: 'match', part: 3, stage: 'controlled', flex: true, note: BONUS, bg: 'club-stage', actors: [who('Theo', 'right')], trains: [2],
      prompt: 'Drag each word onto its picture.',
      pairs: [{ word: 'football', art: FOOTBALL }, { word: 'basketball', art: BASKETBALL }, { word: 'tennis', art: TENNIS }, { word: 'music', art: MUSIC }, { word: 'drawing', art: DRAW }],
      hints: ['Grab a word, drag it to the picture. Tap a word to hear it.'],
    },
    {
      id: 'teach-b', kind: 'teach', part: 3, bg: 'locker-hall', actors: [who('Theo', 'left')], trains: [2], title: 'Three hobbies you go',
      pages: [
        { word: 'swimming', art: SWIM, meaning: 'moving in water', example: 'I go swimming.', clue: 'go + swimming.' },
        { word: 'running', art: RUN, meaning: 'moving fast on your feet', example: 'I go running.', clue: 'go + running.' },
        { word: 'dancing', art: DANCE, meaning: 'moving to music', example: 'I go dancing.', clue: 'go + dancing.' },
      ],
      hints: ['Say each word after the guide.'],
    },
    {
      id: 'match-b', kind: 'match', part: 3, stage: 'controlled', bg: 'locker-hall', actors: [who('Theo', 'right')], trains: [2],
      prompt: 'Drag each hobby word onto its picture.',
      pairs: [{ word: 'swimming', art: SWIM }, { word: 'running', art: RUN }, { word: 'dancing', art: DANCE }],
      hints: ['Tap a word to hear it, then tap the picture.'],
    },
    {
      id: 'hear-b', kind: 'hearpick', part: 3, stage: 'controlled', bg: 'locker-hall', actors: [who('Vee', 'right')], trains: [2, 4],
      prompt: 'Which sentence do you hear? Tap it.',
      rounds: [
        { say: 'I go swimming.', options: ['I go swimming.', 'I go running.', 'I go dancing.'], answer: 'I go swimming.' },
        { say: 'I go dancing.', options: ['I go running.', 'I go swimming.', 'I go dancing.'], answer: 'I go dancing.' },
        { say: 'I go running.', options: ['I go dancing.', 'I go running.', 'I go swimming.'], answer: 'I go running.' },
      ],
      hints: ['Listen carefully. Three different hobbies.'],
    },
    {
      id: 'shadow-b', kind: 'shadow', part: 3, stage: 'controlled', flex: true, note: BONUS, bg: 'locker-hall', actors: [who('Ava', 'left')], trains: [2],
      prompt: 'Whose shadow is it? Pick the hobby word.',
      rounds: [
        { art: SWIM, answer: 'swimming', options: ['swimming', 'running', 'dancing'] },
        { art: RUN, answer: 'running', options: ['dancing', 'running', 'swimming'] },
        { art: DANCE, answer: 'dancing', options: ['swimming', 'dancing', 'running'] },
      ],
      hints: ['Look at the shape. Which hobby is it?'],
    },
    {
      id: 'teach-c', kind: 'teach', part: 3, bg: 'club-lobby', actors: [who('Vee', 'left')], trains: [2], title: 'Four hobbies you like',
      pages: [
        { word: 'singing', art: SING, meaning: 'making music with your voice', example: 'I like singing.', clue: 'like + singing.' },
        { word: 'cooking', art: COOK, meaning: 'making food', example: 'I like cooking.', clue: 'like + cooking.' },
        { word: 'reading', art: READ, meaning: 'looking at the words in a book', example: 'I like reading.', clue: 'like + reading.' },
        { word: 'photos', art: PHOTO, meaning: 'pictures you take with a camera', example: 'I like taking photos.', clue: 'like + taking photos.' },
      ],
      hints: ['Say each word after the guide.'],
    },

    // ---------- 4 · the two games for the last set, plus bonus games ----------
    {
      id: 'match-c', kind: 'match', part: 4, stage: 'controlled', bg: 'club-lobby', actors: [who('Vee', 'right')], trains: [2], mode: 'listen',
      prompt: 'Listen. Tap the picture for what you hear.',
      pairs: [{ word: 'singing', art: SING }, { word: 'cooking', art: COOK }, { word: 'reading', art: READ }, { word: 'photos', art: PHOTO }],
      hints: ['Listen to the word, then look for its picture.'],
    },
    {
      id: 'mem-c', kind: 'memory', part: 4, stage: 'controlled', bg: 'club-lobby', actors: [who('Ava', 'left')], trains: [2],
      prompt: 'Memory! Find each picture and its word.',
      pairs: [{ art: SING, text: 'singing' }, { art: COOK, text: 'cooking' }, { art: READ, text: 'reading' }, { art: PHOTO, text: 'photos' }],
      hints: ['Flip two cards. Say the word when you find a pair.'],
    },
    {
      id: 'shadow-c', kind: 'shadow', part: 4, stage: 'controlled', flex: true, note: BONUS, bg: 'club-lobby', actors: [who('Theo', 'right')], trains: [2],
      prompt: 'Whose shadow is it? Pick the hobby word.',
      rounds: [
        { art: SING, answer: 'singing', options: ['singing', 'reading', 'cooking'] },
        { art: COOK, answer: 'cooking', options: ['photos', 'cooking', 'singing'] },
        { art: READ, answer: 'reading', options: ['reading', 'photos', 'cooking'] },
        { art: PHOTO, answer: 'photos', options: ['singing', 'reading', 'photos'] },
      ],
      hints: ['Look at the shape. Which hobby is it?'],
    },
    {
      id: 'match-sentences', kind: 'match', part: 4, stage: 'controlled', flex: true, note: BONUS, bg: 'club-lobby', actors: [who('Ava', 'left')], trains: [3, 4],
      prompt: 'Drag each sentence onto the picture it tells about.',
      pairs: [{ word: 'I play tennis.', art: TENNIS }, { word: 'I go swimming.', art: SWIM }, { word: 'I like cooking.', art: COOK }, { word: 'I like reading.', art: READ }],
      hints: ['Tap a sentence to hear it, then tap the picture.'],
    },

    // ---------- 5 · Mission: model first, then Take 1, feedback, Take 2 ----------
    { id: 'dial', kind: 'dial', part: 5, stage: 'produce', bg: 'club-lobby', actors: [who('Vee', 'right', 'thumbs')], prompt: 'Mission time! How much help do you want?' },
    {
      id: 'model-task', kind: 'model', part: 5, stage: 'model', bg: 'club-lobby', actors: [who('Ava', 'left'), who('Theo', 'right')], trains: [4, 5],
      title: 'Watch Theo do the mission first',
      lines: [
        { who: 'Ava', text: 'Hello! What do you play?' },
        { who: 'Theo', text: 'Hello! I am Theo. I play tennis.', pic: TENNIS },
        { who: 'Ava', text: 'What do you go?' },
        { who: 'Theo', text: 'I go swimming. I like cooking.', pic: SWIM },
        { who: 'Ava', text: 'Great! Join my club!' },
      ],
      closing: 'Now it is your turn.',
    },
    {
      id: 'build-badge', kind: 'build', part: 5, stage: 'controlled', bg: 'club-lobby', actors: [who('Ava', 'left')], trains: [3, 4],
      prompt: 'Warm up, together: build your hobby lines. Tap the words in the right order.',
      rounds: [
        { cue: 'Say a sport you play.', target: 'I play basketball.', extra: ['go', 'like'] },
        { cue: 'Say a hobby you go.', target: 'I go running.', extra: ['play', 'like'] },
      ],
      hints: ['Play + a sport. Go + a word with -ing.'],
    },
    {
      id: 'this-or-that', kind: 'convo', part: 5, stage: 'free', bg: 'locker-hall', actors: [who('Theo', 'right', 'wave')], trains: [4],
      prompt: 'This or that? Pick one each time. Say it out loud.', me: 'Ava', meLabel: 'You', after: 'Nice! You have lots of hobbies.',
      steps: [
        { ask: 'Tennis or basketball?', pic: LIKE, options: [{ text: 'I play tennis.', pic: TENNIS, ok: true }, { text: 'I play basketball.', pic: BASKETBALL, ok: true }] },
        { ask: 'Swimming or running?', pic: LIKE, options: [{ text: 'I go swimming.', pic: SWIM, ok: true }, { text: 'I go running.', pic: RUN, ok: true }] },
        { ask: 'Cooking or reading?', pic: LIKE, options: [{ text: 'I like cooking.', pic: COOK, ok: true }, { text: 'I like reading.', pic: READ, ok: true }] },
      ],
      hints: ['There is no wrong answer. Choose what is true for you.'],
    },
    {
      id: 'say-take1', kind: 'say', part: 5, stage: 'produce', bg: 'club-lobby', actors: [who('Ava', 'right', 'wave')], trains: [4, 5], open: true,
      prompt: 'Take 1 · Ava asks: What do you play? What do you like? Say your name and your hobbies.',
      model: 'Hello, I am {name}. I play tennis. I go swimming. I like cooking.',
      byDial: { chill: 'I play tennis.', normal: 'Hello, I am {name}. I play tennis. I go swimming. I like cooking.', push: 'Hello, I am {name}. I play tennis and I go swimming. I like cooking and reading.' },
      hints: ['Say your own hobbies. Look at the rule if you need it.'],
    },
    {
      id: 'fade', kind: 'fade', part: 5, stage: 'produce', bg: 'club-stage', actors: [who('Ava', 'left'), who('Theo', 'right')], trains: [3, 4],
      prompt: 'Feedback time! Say the lines again, with less help each round, before Take 2.',
      lines: [
        { who: 'Ava', text: 'I play basketball.', keys: ['play', 'basketball'] },
        { who: 'Theo', text: 'I go running.', keys: ['go', 'running'] },
        { who: 'Ava', text: 'I like reading.', keys: ['like', 'reading'] },
      ],
    },
    {
      id: 'say-take2', kind: 'say', part: 5, stage: 'produce', bg: 'club-lobby', actors: [who('Theo', 'right')], trains: [4, 5], open: true,
      prompt: 'Take 2 · Start with hello for Ava, then say what you play, what you go and what you like.',
      model: 'Hello, Ava! I am {name}. I play tennis. I go swimming. I like cooking.',
      hints: ['Hello first, then your name, then your hobbies.'],
    },

    // ---------- 6 · Release ----------
    {
      id: 'write', kind: 'write', part: 6, stage: 'produce', bg: 'club-signup-desk', actors: [who('Vee', 'right')], trains: [3, 4], stamp: 'hobbies',
      prompt: 'Your hobby card. The model is hidden. Try first.',
      rows: [
        { label: 'Say a sport or a game you play.', frame: 'I play ___.', accept: ['^i play .+'], hint: 'Start with I play. Example: I play tennis.', sample: 'I play tennis.' },
        { label: 'Say one hobby you go.', frame: 'I go ___.', accept: ['^i go \\w+ing\\b.*'], hint: 'Start with I go and a word with -ing. Example: I go swimming.', sample: 'I go swimming.' },
        { label: 'Say one hobby you like.', frame: 'I like ___.', accept: ['^i like .+'], hint: 'Start with I like. Example: I like cooking.', sample: 'I like cooking.' },
      ],
      hints: ['Use your own hobbies.'],
    },
    {
      id: 'say-release', kind: 'say', part: 6, stage: 'produce', bg: 'club-signup-desk', actors: [who('Ava', 'left', 'happy')], trains: [4, 5],
      prompt: 'Voice note · Tell Ava your hobbies. Try without help first.',
      model: 'Hello, Ava! I am {name}. I play tennis. I go swimming. I like cooking and reading.',
      hints: ['Press “Show me” if you want to see the line.'],
    },
    {
      id: 'recap-hear', kind: 'hearpick', part: 6, stage: 'review', bg: 'club-signup-desk', actors: [who('Vee', 'right')], trains: [3],
      prompt: 'Rule check! Which sentence uses go? Tap it.',
      rounds: [
        { say: 'I go swimming.', options: ['I like cooking.', 'I go swimming.', 'I play tennis.'], answer: 'I go swimming.' },
        { say: 'I play tennis.', options: ['I play tennis.', 'I go running.', 'I like reading.'], answer: 'I play tennis.' },
      ],
      hints: ['Listen for play, go or like.'],
    },

    // ---------- 7 · Wrap ----------
    {
      id: 'teach-back', kind: 'say', part: 7, stage: 'review', bg: 'club-lobby', actors: [who('Vee', 'right')], trains: [3],
      prompt: 'Teach-back · Tell Vee the rule in your own words. Then give one example for each.',
      model: 'Play and a sport: I play tennis. Go and a word with -ing: I go swimming. Like and a word with -ing: I like cooking.',
      hints: ['Say it like you teach a friend. Play, go, like.'],
    },
    {
      id: 'wrap', kind: 'wrap', part: 7, bg: 'club-lobby', actors: [who('Vee', 'left', 'thumbs')], heading: 'The hobby wall is full!', ticks: CRITERIA,
      homework: 'Homework: send Ava one voice note: “I play ___. I go ___. I like ___.” Not yet is okay!',
      clue: 'Clue 2 of 8: Under the smudge on the poster you can read: “plays tennis, goes swimming”. Who is it? Not Ava, and not Theo…',
    },
  ],
};
