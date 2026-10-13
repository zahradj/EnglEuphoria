// Pre-A1 Season P1 "Hello, letters", Episode 1 "Cold Open" (the Name Wall), as a game deck on the Pre-A1 run of show (5/10/8/10/8/8/6/5).
// Season spec: src/curriculum/academy/preA1.ts (docs/academy-pre-a1-s01-spec.md). Cast: Vee, Ava, Theo. Rule: after every word set TWO different games.
// New items (<= 8): hello, hi, bye, My name is, I am. Letter names A-G. No sounds yet (blending starts in E2).
import type { CastName, DeckScript, TeachArt } from '../types';

export const OBJECTIVE = 'By the end I can meet the Name Wall, say hello and my name, and hear the letters A to G.';
export const CRITERIA = [
  'I said hello and goodbye: Hello! Hi! Bye!',
  'I said my name: My name is ___.',
  'I heard and picked the letters A to G.',
  'I read the names Ava, Theo and Vee and matched them to pictures.',
  'I spelled a name with letter tiles.',
];

const L = (text: string): TeachArt => ({ type: 'letters', text });
const card = (id: string, label: string): TeachArt => ({ type: 'card', id, label });
const who = (w: CastName, pos: 'left' | 'right' | 'center', expr: 'happy' | 'wave' | 'thumbs' | 'neutral' = 'happy') => ({ who: w, pos, expr });
const NW = 'name-wall';
const LETTER_NOTE: Record<string, string> = {
  A: 'Ava starts with A.', B: 'Bye starts with B.', C: 'C is the third letter.', D: 'D is the fourth letter.', E: 'Vee ends with E.', F: 'F is the sixth letter.', G: 'G is the seventh letter.',
};
const letterPage = (l: string) => ({ word: l, art: L(l), meaning: `the letter ${l}`, example: `${l}, ${String.fromCharCode(l.charCodeAt(0) + 1)}.`, clue: LETTER_NOTE[l] });
const caps = (ls: string[]) => ls.map((l) => ({ art: L(l), text: l.toLowerCase() }));

export const PA1_S01_E1: DeckScript = {
  lessonId: 'PA1-S01-E1',
  level: 'Pre-A1',
  shape: 'pre-a1',
  title: 'Hello, letters · Cold Open',
  objective: OBJECTIVE,
  criteria: CRITERIA,
  cast: ['Vee', 'Ava', 'Theo'],
  taughtSounds: [],
  sightWords: ['hello', 'hi', 'bye', 'my', 'name', 'is', 'i', 'am', 'a', 'ava', 'theo', 'vee'],
  partGoals: [
    'Meet the Name Wall and pick how you feel',
    'Warm up your ears: the letters A to D',
    'Watch Vee, Ava and Theo say hello',
    'Say hello and your name, then the letters E to G',
    'Read the names on the wall',
    'Use hello and your name',
    'Say hello to Theo',
    'What you can do now',
  ],
  slides: [
    // ---------- 0 · Check-in ----------
    { id: 'title', kind: 'title', part: 0, bg: NW, actors: [who('Vee', 'center', 'wave')], heading: 'Hello, letters', sub: 'The Name Wall · lesson 1' },
    {
      id: 'brief', kind: 'brief', part: 0, bg: NW, actors: [who('Vee', 'left')],
      say: 'Hi! This is the Name Wall. Every letter you learn lights up a tile.', heading: 'Your wall card',
      stamps: [{ id: 'hello', icon: 'chat', label: 'Say hello' }, { id: 'name', icon: 'idcard', label: 'Say your name' }, { id: 'letters', icon: 'abc', label: 'Hear the letters' }],
    },
    { id: 'badge', kind: 'badge', part: 0, bg: NW, actors: [who('Theo', 'right', 'wave')], trains: [2], prompt: 'Theo gives you a name tag. Put your name on it.', starter: 'My name is', ages: [13, 14, 15, 16, 17, 18], hints: ['Type only your name, and tap your age.'] },
    {
      id: 'feel', kind: 'convo', part: 0, bg: NW, actors: [who('Theo', 'right')], trains: [1],
      prompt: 'Pick how you feel. Tap a picture.', me: 'Ava', meLabel: 'You', after: 'Thanks! Now the wall is ready.',
      steps: [
        { ask: 'Hi, {name}!', pic: card('v-hello', 'hello'), options: [{ text: 'Hello!', pic: card('v-hello', 'hello'), ok: true }, { text: 'Hi!', pic: card('v-hello', 'hello'), ok: true }] },
        { ask: 'How are you?', pic: card('v-fine', 'feeling fine'), options: [{ text: 'I am great!', pic: card('v-great', 'feeling great'), ok: true }, { text: 'I am fine.', pic: card('v-fine', 'feeling fine'), ok: true }, { text: 'I am tired.', pic: card('v-tired', 'feeling tired'), ok: true }] },
      ],
      hints: ['There is no wrong answer. Choose how you feel.'],
    },

    // ---------- 1 · Warm up your ears: letters A-D ----------
    {
      id: 'teach-abcd', kind: 'teach', part: 1, bg: 'club-stage', actors: [who('Vee', 'left')], trains: [3], title: 'The letters A, B, C, D',
      pages: ['A', 'B', 'C', 'D'].map(letterPage),
      hints: ['Listen to the name of each letter. Press “Show again” to hear it again.'],
    },
    {
      id: 'hear-abcd', kind: 'hearpick', part: 1, bg: 'club-stage', actors: [who('Vee', 'right')], trains: [3],
      prompt: 'Which letter do you hear? Tap it.',
      rounds: [{ say: 'A', options: ['A', 'B', 'C'], answer: 'A' }, { say: 'C', options: ['D', 'C', 'A'], answer: 'C' }, { say: 'D', options: ['B', 'D', 'C'], answer: 'D' }, { say: 'B', options: ['A', 'B', 'D'], answer: 'B' }],
      hints: ['Listen, then look for the same letter.'],
    },
    {
      id: 'mem-abcd', kind: 'memory', part: 1, bg: 'club-stage', actors: [who('Vee', 'left')], trains: [3],
      prompt: 'Memory! Match each big letter with its small letter.',
      pairs: caps(['A', 'B', 'C', 'D']),
      hints: ['A big letter and a small letter are the same letter.'],
    },
    {
      id: 'hear-abcd-2', kind: 'hearpick', part: 1, bg: 'locker-hall', actors: [who('Vee', 'right')], trains: [3],
      prompt: 'One more time! Which letter do you hear?',
      rounds: [{ say: 'D', options: ['D', 'A', 'B'], answer: 'D' }, { say: 'B', options: ['C', 'B', 'A'], answer: 'B' }, { say: 'A', options: ['A', 'D', 'C'], answer: 'A' }],
      hints: ['Listen, then look for the same letter.'],
    },

    // ---------- 2 · The Drop: the scene, then hello ----------
    {
      id: 'model-wall', kind: 'model', part: 2, bg: NW, actors: [who('Vee', 'left'), who('Ava', 'center'), who('Theo', 'right')], trains: [1, 2],
      title: 'Watch Vee, Ava and Theo at the Name Wall',
      lines: [
        { who: 'Vee', text: 'Hello!', pic: card('v-hello', 'hello') },
        { who: 'Ava', text: 'Hi!' },
        { who: 'Theo', text: 'Hello! My name is Theo.', pic: card('v-name', 'a name tag') },
        { who: 'Ava', text: 'Hi, Theo. I am Ava.' },
        { who: 'Vee', text: 'I am Vee. Bye!', pic: L('BYE') },
        { who: 'Ava', text: 'Bye, Vee!' },
      ],
      closing: 'Now YOU say hello!',
    },
    {
      id: 'whosaid-wall', kind: 'whosaid', part: 2, bg: NW, actors: [who('Ava', 'left'), who('Theo', 'right')], trains: [1, 2],
      replayTitle: 'Look again: Ava and Theo meet at the wall…',
      replay: [{ who: 'Theo', text: 'Hello! My name is Theo.' }, { who: 'Ava', text: 'Hi, Theo. I am Ava.' }],
      prompt: 'Who said it? Drag each bubble to Ava or Theo.',
      items: [{ text: 'My name is Theo.', who: 'Theo' }, { text: 'I am Ava.', who: 'Ava' }, { text: 'Hello!', who: 'Theo' }],
      hints: ['Theo says My name is Theo. Ava says I am Ava.'],
    },
    {
      id: 'teach-hello', kind: 'teach', part: 2, bg: NW, actors: [who('Vee', 'left')], trains: [1], title: 'Hello, hi and bye',
      pages: [
        { word: 'Hello!', art: card('v-hello', 'hello'), meaning: 'what you say when you meet someone', example: 'Hello, Ava!', clue: 'Say it with a smile.' },
        { word: 'Hi!', art: L('HI'), meaning: 'a short hello for friends', example: 'Hi, Theo!', clue: 'Hi is short for hello.' },
        { word: 'Bye!', art: L('BYE'), meaning: 'what you say when you go', example: 'Bye, Vee!', clue: 'Say it and wave.' },
      ],
      hints: ['Hello, hi and bye. Say each one after the guide.'],
    },
    {
      id: 'match-hello', kind: 'match', part: 2, bg: NW, actors: [who('Vee', 'right')], trains: [1], mode: 'listen',
      prompt: 'Listen. Tap the picture for what you hear.',
      pairs: [{ word: 'Hello!', art: card('v-hello', 'hello') }, { word: 'Hi!', art: L('HI') }, { word: 'Bye!', art: L('BYE') }],
      hints: ['Listen to the word, then look for its picture.'],
    },
    {
      id: 'mem-hello', kind: 'memory', part: 2, bg: NW, actors: [who('Vee', 'left')], trains: [1],
      prompt: 'Memory! Find each picture and its word.',
      pairs: [{ art: card('v-hello', 'hello'), text: 'Hello!' }, { art: L('HI'), text: 'Hi!' }, { art: L('BYE'), text: 'Bye!' }],
      hints: ['Flip two cards. Say the word when you find a pair.'],
    },

    // ---------- 3 · Learn: My name is, then letters E-G ----------
    {
      id: 'teach-name', kind: 'teach', part: 3, bg: 'club-lobby', actors: [who('Theo', 'right')], trains: [2], title: 'My name is… and I am…',
      pages: [
        { word: 'My name is Ava.', art: card('v-name', 'a name tag'), meaning: 'say your name', example: 'My name is Theo.', clue: 'Change the last word to YOUR name.' },
        { word: 'I am Ava.', art: card('v-me', 'me'), meaning: 'another way to say your name', example: 'I am Vee.', clue: 'I am + your name.' },
      ],
      hints: ['My name is… and I am… both tell your name.'],
    },
    {
      id: 'match-name', kind: 'match', part: 3, bg: 'club-lobby', actors: [who('Theo', 'right')], trains: [1, 2],
      prompt: 'Match each sentence with its picture. Drag it onto the picture.',
      pairs: [{ word: 'Hello!', art: card('v-hello', 'hello') }, { word: 'My name is Ava.', art: card('v-name', 'a name tag') }, { word: 'I am Ava.', art: card('v-me', 'me') }],
      hints: ['Tap a sentence to hear it, then tap the picture.'],
    },
    {
      id: 'build-name', kind: 'build', part: 3, bg: 'club-lobby', actors: [who('Ava', 'left')], trains: [2],
      prompt: 'Build the sentence. Tap the words in the right order.',
      rounds: [{ cue: 'Say Ava’s name.', target: 'My name is Ava.', extra: ['am', 'hi'] }, { cue: 'Say Theo’s name.', target: 'I am Theo.', extra: ['is', 'my'] }],
      hints: ['Start with My or I. Then the name.'],
    },
    {
      id: 'teach-efg', kind: 'teach', part: 3, bg: 'club-stage', actors: [who('Vee', 'left')], trains: [3], title: 'The letters E, F, G',
      pages: ['E', 'F', 'G'].map(letterPage),
      hints: ['Listen to the name of each letter.'],
    },
    {
      id: 'hear-efg', kind: 'hearpick', part: 3, bg: 'club-stage', actors: [who('Vee', 'right')], trains: [3],
      prompt: 'Which letter do you hear?',
      rounds: [{ say: 'E', options: ['E', 'F', 'G'], answer: 'E' }, { say: 'G', options: ['F', 'G', 'A'], answer: 'G' }, { say: 'F', options: ['E', 'B', 'F'], answer: 'F' }],
      hints: ['Listen, then look for the same letter.'],
    },
    {
      id: 'mem-efg', kind: 'memory', part: 3, bg: 'club-stage', actors: [who('Vee', 'left')], trains: [3],
      prompt: 'Memory! Match each big letter with its small letter.',
      pairs: caps(['E', 'F', 'G']),
      hints: ['A big letter and a small letter are the same letter.'],
    },

    // ---------- 4 · Read the names ----------
    {
      id: 'read-names', kind: 'reader', part: 4, bg: 'classroom-evening', actors: [who('Vee', 'left')], trains: [4],
      prompt: 'Read the line. Which picture is it? Tap a word to hear it.',
      lines: [{ text: 'Hello, Ava.', art: card('v-hello', 'hello') }, { text: 'My name is Theo.', art: card('v-name', 'a name tag') }, { text: 'Bye, Vee.', art: L('BYE') }, { text: 'I am Ava.', art: card('v-me', 'me') }],
      hints: ['Tap a word to hear it. Then pick the picture.'],
    },
    { id: 'spell-ava', kind: 'spell', part: 4, bg: NW, actors: [who('Theo', 'right')], trains: [5], prompt: 'Spell Ava’s name on the wall. Tap the letters.', target: 'AVA', hints: ['Listen to each letter. A, V, A.'] },
    {
      id: 'hear-names', kind: 'hearpick', part: 4, bg: 'club-lobby', actors: [who('Vee', 'right')], trains: [4],
      prompt: 'Which name do you hear? Tap it.',
      rounds: [{ say: 'Ava', options: ['Ava', 'Theo', 'Vee'], answer: 'Ava' }, { say: 'Vee', options: ['Theo', 'Vee', 'Ava'], answer: 'Vee' }, { say: 'Theo', options: ['Vee', 'Ava', 'Theo'], answer: 'Theo' }],
      hints: ['Listen, then read the names.'],
    },

    {
      id: 'read-chat', kind: 'reader', part: 4, bg: 'classroom-evening', actors: [who('Theo', 'right')], trains: [4],
      prompt: 'One more page. Read the line. Which picture is it?',
      lines: [{ text: 'Hi, Theo.', art: L('HI') }, { text: 'I am Vee.', art: card('v-me', 'me') }, { text: 'My name is Ava.', art: card('v-name', 'a name tag') }],
      hints: ['Tap a word to hear it. Then pick the picture.'],
    },

    // ---------- 5 · Use it: hello and your name ----------
    {
      id: 'convo-hello', kind: 'convo', part: 5, bg: 'phone-profile-closeup', actors: [who('Theo', 'right')], trains: [1, 2, 4],
      prompt: 'Theo says hello. Choose what you say.', me: 'Ava', meLabel: 'You', after: 'Great! Now say them out loud with your teacher.',
      steps: [
        { ask: 'Hello!', pic: card('v-hello', 'hello'), options: [{ text: 'Hello!', ok: true }, { text: 'Bye!', hint: 'Bye is for going away. Theo says hello.' }] },
        { ask: 'My name is Theo.', pic: card('v-name', 'a name tag'), options: [{ text: 'Hi, Theo. I am Ava.', ok: true }, { text: 'Bye, Theo.', hint: 'Say hello first.' }] },
        { ask: 'Bye!', pic: L('BYE'), options: [{ text: 'Bye, Theo!', ok: true }, { text: 'Hello!', hint: 'Theo says bye. You say bye too.' }] },
      ],
      hints: ['Read what Theo says. Then choose the answer that fits.'],
    },
    {
      id: 'mem-greet', kind: 'memory', part: 5, bg: 'phone-profile-closeup', actors: [who('Theo', 'right')], trains: [1],
      prompt: 'Memory! Find each picture and its greeting.',
      pairs: [{ art: card('v-hello', 'hello'), text: 'Hello!' }, { art: L('HI'), text: 'Hi!' }, { art: L('BYE'), text: 'Bye!' }, { art: card('v-name', 'a name tag'), text: 'My name is Ava.' }],
      hints: ['Remember where you saw each picture.'],
    },
    {
      id: 'build-me', kind: 'build', part: 5, bg: 'club-lobby', actors: [who('Ava', 'left')], trains: [2],
      prompt: 'Build your hello. Tap the words in the right order.',
      rounds: [{ cue: 'Say hello.', target: 'Hello, Ava.', extra: ['bye', 'is'] }, { cue: 'Say your name (Ava).', target: 'I am Ava.', extra: ['my', 'hi'] }],
      hints: ['Start with the first word. Then the name.'],
    },
    { id: 'spell-me', kind: 'spell', part: 5, bg: NW, actors: [who('Theo', 'right')], trains: [5], prompt: 'Now spell YOUR name on the wall.', target: '{name}', save: 'spelled', stamp: 'letters', hints: ['Look at the letters of your name.'] },

    // ---------- 6 · Mission ----------
    { id: 'dial', kind: 'dial', part: 6, bg: NW, actors: [who('Vee', 'right', 'thumbs')], prompt: 'Mission time! How much help do you want?' },
    {
      id: 'say-take1', kind: 'say', part: 6, bg: NW, actors: [who('Theo', 'right', 'wave')], trains: [1, 2, 5], open: true,
      prompt: 'Take 1 · Say hello to Theo and tell him your name.',
      model: 'Hello! My name is {name}.',
      byDial: { chill: 'Hello!', normal: 'Hello! My name is {name}.', push: 'Hello! My name is {name}. {spelled}. Bye!' },
      hints: ['Read it slowly, then say it.'],
    },
    {
      id: 'fade', kind: 'fade', part: 6, bg: 'club-stage', actors: [who('Ava', 'left'), who('Theo', 'right')], trains: [1, 2],
      prompt: 'Feedback time! Say the lines again, with less help each round, before Take 2.',
      lines: [
        { who: 'Ava', text: 'Hello! My name is Ava.', keys: ['Hello', 'Ava'] },
        { who: 'Theo', text: 'Hi! I am Theo.', keys: ['Hi', 'Theo'] },
        { who: 'Ava', text: 'Bye, Theo!', keys: ['Bye'] },
      ],
    },
    {
      id: 'say-take2', kind: 'say', part: 6, bg: NW, actors: [who('Theo', 'right')], trains: [1, 2], open: true,
      prompt: 'Take 2 · Say hello, your name and bye.',
      model: 'Hello, Theo! My name is {name}. Bye!',
      hints: ['Hello first, then your name, then bye.'],
    },

    // ---------- 7 · Wrap ----------
    {
      id: 'exit', kind: 'match', part: 7, bg: NW, actors: [who('Vee', 'right')], trains: [1, 2], mode: 'listen',
      prompt: 'Exit check · Listen. Tap the picture for what you hear.',
      pairs: [{ word: 'Bye!', art: L('BYE') }, { word: 'My name is Ava.', art: card('v-name', 'a name tag') }, { word: 'Hi!', art: L('HI') }],
      hints: ['Listen to the line, then look for its picture.'],
    },
    {
      id: 'wrap', kind: 'wrap', part: 7, bg: NW, actors: [who('Vee', 'left', 'thumbs')], heading: 'The wall lights up!', ticks: CRITERIA,
      homework: 'Homework: say hello and your name to one person today. Not yet is okay!',
      clue: 'Clue 1 of 8: The wall flashes the letter A. Whose name starts with A? Ava!',
    },
  ],
};
