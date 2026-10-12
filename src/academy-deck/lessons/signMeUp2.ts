// A1-S01-E2 "Sign Me Up" — SAMPLE 2 (rewrite, owner 2026-10-12). Plan, evaluation and decisions: docs/academy-a1s01e2-evaluation-and-rewrite.md.
// Blueprint scope only: the 14 new items (one … ten, Spain, Spanish, Italy, Italian) in three small sets, each followed by TWO different memorising games.
// Three lanes in ONE lesson: start (pre-A1), core (A1), stretch (post-A1). A slide is written for core; `lanes` lists what changes for start / stretch.
// Every part does one job: Check-in (no new language) · Remember? (lesson 1 only) · The Drop (story, then numbers 1-5) · Notice & Build (numbers 6-10, then the countries, then spelling)
// · Energiser (calm games) · Mission · Release · Wrap. Cast: Vee, Ava, Theo (same canon as lesson 2: Ava is 13 and Spanish, Theo is 15 and Italian).
import type { CastName, DeckScript, TeachArt, TeachPage } from '../types';
import { numberWord } from '../spoken';

export const OBJECTIVE = 'By the end I can sign up at the club desk: spell my name, say my number, say my country and nationality, and ask someone to say it again.';
export const CRITERIA = [
  'I spelled my name: A-V-A.',
  'I said my number: My number is four, two, seven.',
  'I said my country and nationality: I am from Spain. I am Spanish.',
  'I said my name and age: My name is Ava. I am 13.',
  'I asked for help: Sorry, can you say it again?',
];

const WORDS: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten' };
const TENS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const TENS_WORDS: Record<number, string> = Object.fromEntries(TENS.map((n) => [n, numberWord(n)]));
const count = (n: number): TeachArt => ({ type: 'count', n });
const bearer = (code: string, who: CastName): TeachArt => ({ type: 'bearer', code, who });
const numPage = (n: number): TeachPage => ({ word: WORDS[n], art: count(n), meaning: `the number ${n}`, example: `My number is ${WORDS[n]}.`, clue: `Count the dots: ${n}.` });
const noClue = (pages: TeachPage[]): TeachPage[] => pages.map(({ clue: _c, ...p }) => p);
const NUM_A = [1, 2, 3, 4, 5];
const NUM_B = [6, 7, 8, 9, 10];
const pairsOf = (ns: number[]) => ns.map((n) => ({ word: WORDS[n], art: count(n) }));
const memOf = (ns: number[]) => ns.map((n) => ({ art: count(n), text: WORDS[n] }));
const VEE = (pos: 'left' | 'right', expr: 'happy' | 'thumbs' | 'wave' = 'happy') => ({ who: 'Vee' as const, pos, expr });
const BG = 'club-signup-desk';

export const SIGN_ME_UP_2: DeckScript = {
  lessonId: 'A1-S01-E2',
  level: 'A1',
  title: 'Sign Me Up (Sample 2)',
  objective: OBJECTIVE,
  criteria: CRITERIA,
  cast: ['Vee', 'Ava', 'Theo'],
  partGoals: [
    'Say hello, pick where to start, and see today’s mission',
    'Wake up hello, my name is, and I am 13',
    'Watch Ava sign up, then meet the numbers 1 to 5',
    'Numbers 6 to 10, countries and nationalities, then spell a name',
    'Two calm games',
    'Sign up with Theo: Take 1, feedback, Take 2',
    'Make your sign-up card and say it all',
    'What you can do now',
  ],
  slides: [
    // ---------- 0 · Check-in (no new language) ----------
    { id: 'title', kind: 'title', part: 0, bg: BG, actors: [{ who: 'Vee', pos: 'center', expr: 'wave' }], heading: 'Sign Me Up', sub: 'Case file #2 · the club desk' },
    {
      id: 'brief', kind: 'brief', part: 0, bg: BG, actors: [VEE('left')],
      say: 'Welcome back! Today you sign up at the club desk and win three stamps.', heading: 'Your mission card',
      stamps: [{ id: 'spell', icon: 'abc', label: 'Spell your name' }, { id: 'number', icon: 'numbers', label: 'Say your number' }, { id: 'passport', icon: 'passport', label: 'Say your country' }],
    },
    {
      id: 'lane', kind: 'lane', part: 0, bg: BG, actors: [VEE('right')],
      prompt: 'Where do you want to start today?',
      choices: [
        { lane: 'start', title: 'Start', blurb: 'I am new. Go slowly, with pictures.', art: { type: 'letters', text: 'HI' } },
        { lane: 'core', title: 'Core', blurb: 'I know some words. Let’s go.', art: { type: 'letters', text: 'GO' } },
        { lane: 'stretch', title: 'Stretch', blurb: 'I can say sentences. Give me more.', art: { type: 'letters', text: 'ASK' } },
      ],
      note: 'Start = pre-A1, Core = A1, Stretch = post-A1. The student can switch any time (More → Easier / Harder); you can too.',
    },
    { id: 'badge', kind: 'badge', part: 0, bg: BG, actors: [{ who: 'Theo', pos: 'right', expr: 'wave' }], trains: [4], prompt: 'Theo gives you a badge. Put your name on it.', starter: 'My name is', ages: [11, 12, 13, 14, 15, 16, 17, 18], hints: ['Type only your name, and tap your age.'] },
    {
      id: 'checkin-chat', kind: 'convo', part: 0, bg: BG, actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [4],
      prompt: 'Quick questions from Theo. Choose your answers.', me: 'Ava', meLabel: 'You', after: 'Thanks! Now Theo knows you.',
      steps: [
        { ask: 'Hi, {name}! How are you today?', pic: { type: 'card', id: 'v-hello', label: 'hello' }, options: [{ text: 'I am great!', pic: { type: 'card', id: 'v-great', label: 'feeling great' }, ok: true }, { text: 'I am fine.', pic: { type: 'card', id: 'v-fine', label: 'feeling fine' }, ok: true }, { text: 'I am tired.', pic: { type: 'card', id: 'v-tired', label: 'feeling tired' }, ok: true }] },
        { ask: 'How old are you?', pic: { type: 'card', id: 'v-age', label: 'a birthday cake' }, options: [{ text: 'I am 13.', ok: true }, { text: 'I am 15.', ok: true }, { text: 'I am from Spain.', hint: 'Spain is a place. Theo asks about your age.' }] },
      ],
      hints: ['There is no wrong answer in the first two. Choose what is true for you.'],
    },

    // ---------- 1 · Remember? (lesson 1 only: hello, my name is, I am 13) ----------
    {
      id: 'whosaid', kind: 'whosaid', part: 1, bg: BG, actors: [{ who: 'Ava', pos: 'left', expr: 'happy' }, { who: 'Theo', pos: 'right', expr: 'happy' }], trains: [4],
      replayTitle: 'Remember last time? Ava met Theo…',
      replay: [{ who: 'Theo', text: 'What is your name?' }, { who: 'Ava', text: 'My name is Ava.' }, { who: 'Theo', text: 'How old are you?' }, { who: 'Ava', text: 'I am 13.' }],
      prompt: 'Who said it? Drag each bubble to Ava or Theo.',
      items: [{ text: 'What is your name?', who: 'Theo' }, { text: 'My name is Ava.', who: 'Ava' }, { text: 'How old are you?', who: 'Theo' }, { text: 'I am 13.', who: 'Ava' }],
      lanes: { start: { items: [{ text: 'What is your name?', who: 'Theo' }, { text: 'My name is Ava.', who: 'Ava' }, { text: 'I am 13.', who: 'Ava' }] } },
      hints: ['Questions come from Theo. Answers come from Ava.'],
    },
    {
      id: 'match-recap', kind: 'match', part: 1, bg: BG, actors: [VEE('right')], trains: [4], mode: 'listen',
      prompt: 'Listen. Tap the picture for what you hear.',
      pairs: [
        { word: 'Hello!', art: { type: 'card', id: 'v-hello', label: 'hello' } },
        { word: 'My name is Ava.', art: { type: 'card', id: 'v-name', label: 'a name tag' } },
        { word: 'I am 13.', art: { type: 'card', id: 'v-age', label: 'a birthday cake' } },
      ],
      lanes: { start: { pairs: [{ word: 'Hello!', art: { type: 'card', id: 'v-hello', label: 'hello' } }, { word: 'My name is Ava.', art: { type: 'card', id: 'v-name', label: 'a name tag' } }] } },
      hints: ['Listen to the sentence, then look for its picture.'],
    },
    {
      id: 'intro-me', kind: 'say', part: 1, bg: BG, actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [4], open: true,
      prompt: 'Introduce yourself to Theo. Read the little paragraph, then say it.',
      model: 'Hello! My name is {name}. I am {age}.',
      hints: ['Read it slowly: Hello, my name is…, I am …'],
    },

    // ---------- 2 · The Drop: the story first, then numbers 1-5 ----------
    {
      id: 'model-signup', kind: 'model', part: 2, bg: BG, actors: [{ who: 'Ava', pos: 'left', expr: 'happy' }, { who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 5],
      title: 'Watch Ava sign up at the desk',
      lines: [
        { who: 'Theo', text: 'What is your name?', pic: { type: 'card', id: 'v-name', label: 'a name tag' } },
        { who: 'Ava', text: 'My name is Ava.' },
        { who: 'Theo', text: 'How do you spell it?', pic: { type: 'card', id: 'v-spell', label: 'spelling a name' } },
        { who: 'Ava', text: 'A-V-A.' },
        { who: 'Theo', text: 'Where are you from?', pic: { type: 'card', id: 'v-country', label: 'the world' } },
        { who: 'Ava', text: 'I am from Spain. I am Spanish.', pic: bearer('es', 'Ava') },
        { who: 'Theo', text: 'Your member number is four, two, seven.', pic: { type: 'letters', text: '427' } },
        { who: 'Ava', text: 'Sorry, can you say it again?', pic: { type: 'card', id: 'v-again', label: 'say it again' }, note: 'You did not hear? Ask for help. That is very good English!' },
      ],
      closing: 'Now meet the numbers, so you can sign up too!',
    },
    {
      id: 'teach-nums-a', kind: 'teach', part: 2, bg: 'locker-hall', actors: [VEE('left')], trains: [2], title: 'Meet the numbers 1 to 5',
      pages: NUM_A.map(numPage),
      lanes: { start: { pages: noClue(NUM_A.map(numPage)) } },
      hints: ['Watch the dots appear one by one. Press “Show again” to see it again.'],
    },
    {
      id: 'match-nums-a', kind: 'match', part: 2, bg: 'locker-hall', actors: [VEE('left')], trains: [2], mode: 'drag',
      prompt: 'Match each number word with its dots. Drag the word onto the picture.',
      pairs: pairsOf(NUM_A),
      lanes: { start: { pairs: pairsOf([1, 3, 5]) }, stretch: { mode: 'listen', prompt: 'Listen. Tap the picture for the number you hear.' } },
      hints: ['Count the dots. Three dots is three.'],
    },
    {
      id: 'memory-nums-a', kind: 'memory', part: 2, bg: 'locker-hall', actors: [VEE('right')], trains: [2],
      prompt: 'Memory! Match each number word with its dots.',
      pairs: memOf([1, 2, 4, 5]),
      lanes: { start: { pairs: memOf([1, 3, 5]) }, stretch: { pairs: memOf(NUM_A) } },
      hints: ['Count the dots on the card, then find its word.'],
    },

    // ---------- 3 · Notice & Build: numbers 6-10, countries and nationalities, spelling ----------
    {
      id: 'teach-nums-b', kind: 'teach', part: 3, bg: 'locker-hall', actors: [VEE('left')], trains: [2], title: 'Meet the numbers 6 to 10',
      pages: NUM_B.map(numPage),
      lanes: { start: { pages: noClue(NUM_B.map(numPage)) } },
      hints: ['Six, seven, eight, nine, ten. Say each one after the guide.'],
    },
    {
      id: 'lockers', kind: 'lockers', part: 3, bg: 'locker-hall', actors: [VEE('right')], trains: [2],
      prompt: 'Locker Pop! Read the number word and open that locker.',
      rounds: [7, 9, 6, 10], grid: NUM_B, words: WORDS,
      lanes: { start: { rounds: [6, 8, 10], grid: NUM_B }, stretch: { rounds: [30, 70, 50, 90], grid: TENS.slice(0, 10), words: TENS_WORDS, prompt: 'Bonus! Tens: open the locker for the number word.' } },
      hints: ['Count the numbers on the doors. Seven is 7.'],
    },
    {
      id: 'memory-nums-b', kind: 'memory', part: 3, bg: 'locker-hall', actors: [VEE('right')], trains: [2],
      prompt: 'Memory! Match each number word with its dots.',
      pairs: memOf([6, 7, 9, 10]),
      lanes: { start: { pairs: memOf([6, 8, 10]) }, stretch: { pairs: memOf(NUM_B) } },
      hints: ['Count the dots on the card, then find its word.'],
    },
    {
      id: 'teach-nations', kind: 'teach', part: 3, bg: 'border-control', actors: [VEE('left')], trains: [3], title: 'Countries and nationalities (country · nationality)',
      pages: [
        { word: 'Spain · Spanish', art: bearer('es', 'Ava'), meaning: 'a country and its people', example: 'I am from Spain. I am Spanish.', clue: 'Ava holds the flag of Spain. Spain → Spanish.' },
        { word: 'Italy · Italian', art: bearer('it', 'Theo'), meaning: 'a country and its people', example: 'I am from Italy. I am Italian.', clue: 'Theo holds the flag of Italy. Italy → Italian.' },
      ],
      lanes: {
        start: { pages: noClue([
          { word: 'Spain · Spanish', art: bearer('es', 'Ava'), meaning: 'a country and its people', example: 'I am from Spain. I am Spanish.' },
          { word: 'Italy · Italian', art: bearer('it', 'Theo'), meaning: 'a country and its people', example: 'I am from Italy. I am Italian.' },
        ]) },
        stretch: { pages: [
          { word: 'Spain · Spanish', art: bearer('es', 'Ava'), meaning: 'a country and its people', example: 'I am from Spain. I am Spanish.', clue: 'Ava holds the flag of Spain. Spain → Spanish.' },
          { word: 'Italy · Italian', art: bearer('it', 'Theo'), meaning: 'a country and its people', example: 'I am from Italy. I am Italian.', clue: 'Theo holds the flag of Italy. Italy → Italian.' },
          { word: 'Brazil · Brazilian', art: bearer('br', 'Vee'), meaning: 'a country and its people', example: 'I am from Brazil. I am Brazilian.', clue: 'Bonus! Brazil → Brazilian. See the pattern?' },
          { word: 'France · French', art: bearer('fr', 'Vee'), meaning: 'a country and its people', example: 'I am from France. I am French.', clue: 'Bonus! France → French.' },
        ] },
      },
      hints: ['Country: where you are from. Nationality: what you are.'],
    },
    {
      id: 'match-nations', kind: 'match', part: 3, bg: 'border-control', actors: [VEE('left')], trains: [3],
      prompt: 'Who is from where? Drag each word onto its picture: the flag is the country, the person is the nationality.',
      pairs: [
        { word: 'Spain', art: { type: 'flag', code: 'es' } },
        { word: 'Italy', art: { type: 'flag', code: 'it' } },
        { word: 'Spanish', art: { type: 'pair', code: 'es' } },
        { word: 'Italian', art: { type: 'pair', code: 'it' } },
      ],
      lanes: { start: { prompt: 'Which flag is which? Drag each word onto its flag.', pairs: [{ word: 'Spain', art: { type: 'flag', code: 'es' } }, { word: 'Italy', art: { type: 'flag', code: 'it' } }] } },
      hints: ['A flag is a country. A person holding the flag is the nationality.', 'Tap a word to hear it, then tap the picture.'],
    },
    {
      id: 'memory-nations', kind: 'memory', part: 3, bg: 'border-control', actors: [VEE('right')], trains: [3],
      prompt: 'Memory! Find each flag and its nationality word.',
      pairs: [{ flag: 'es', text: 'Spanish' }, { flag: 'it', text: 'Italian' }, { art: bearer('es', 'Ava'), text: 'Spain' }, { art: bearer('it', 'Theo'), text: 'Italy' }],
      lanes: { start: { pairs: [{ flag: 'es', text: 'Spanish' }, { flag: 'it', text: 'Italian' }] }, stretch: { pairs: [{ flag: 'es', text: 'Spanish' }, { flag: 'it', text: 'Italian' }, { flag: 'br', text: 'Brazilian' }, { flag: 'fr', text: 'French' }, { art: bearer('es', 'Ava'), text: 'Spain' }, { art: bearer('it', 'Theo'), text: 'Italy' }] } },
      hints: ['Remember where the flags are. Spain is red and yellow.'],
    },
    { id: 'spell-ava', kind: 'spell', part: 3, bg: BG, actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1], prompt: 'Spell Ava’s name on the badge. Tap the letters.', target: 'AVA', hints: ['Listen to each letter. A, V, A.'] },

    // ---------- 4 · Energiser: two calm games ----------
    {
      id: 'border', kind: 'border', part: 4, bg: 'border-control', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [3],
      prompt: 'Border control! Drag each traveller onto the right passport.',
      rounds: [
        { flag: 'es', who: 'Ava', says: 'I am from Spain.', answer: 'Spanish', options: ['Spanish', 'Italian'] },
        { flag: 'it', who: 'Theo', says: 'I am from Italy.', answer: 'Italian', options: ['Italian', 'Spanish'] },
        { flag: 'it', who: 'Theo', says: 'I am Italian.', answer: 'Italian', options: ['Spanish', 'Italian'] },
        { flag: 'es', who: 'Ava', says: 'I am Spanish.', answer: 'Spanish', options: ['Italian', 'Spanish'] },
      ],
      lanes: { stretch: { rounds: [
        { flag: 'es', who: 'Ava', says: 'I am from Spain.', answer: 'Spanish', options: ['Spanish', 'Italian', 'French'] },
        { flag: 'it', who: 'Theo', says: 'I am from Italy.', answer: 'Italian', options: ['Italian', 'Spanish', 'Brazilian'] },
        { flag: 'br', who: 'Vee', says: 'I am from Brazil.', answer: 'Brazilian', options: ['Brazilian', 'Spanish', 'French'] },
        { flag: 'fr', who: 'Vee', says: 'I am from France.', answer: 'French', options: ['French', 'Italian', 'Brazilian'] },
      ], flags: { Spanish: 'es', Italian: 'it', Brazilian: 'br', French: 'fr' } } },
      flags: { Spanish: 'es', Italian: 'it' }, hints: ['Spain → Spanish. Italy → Italian.'],
    },
    {
      id: 'numtrain', kind: 'numtrain', part: 4, bg: 'locker-hall', actors: [VEE('left')], trains: [2],
      prompt: 'Number Train! Put each number word on its carriage.',
      numbers: [2, 5, 8, 10], words: WORDS,
      lanes: { stretch: { numbers: [20, 45, 88, 100], words: { 20: 'twenty', 45: 'forty-five', 88: 'eighty-eight', 100: 'one hundred' }, prompt: 'Bonus Number Train! Tens and big numbers.' } },
      hints: ['Read the digits on the carriage, then find the word.'],
    },

    // ---------- 5 · Mission ----------
    { id: 'dial', kind: 'dial', part: 5, bg: BG, actors: [VEE('right', 'thumbs')], prompt: 'Mission time! How much help do you want?' },
    {
      id: 'padlock', kind: 'padlock', part: 5, bg: 'locker-hall', actors: [{ who: 'Theo', pos: 'right', expr: 'wave' }], trains: [2],
      prompt: 'Theo says your member number. Open the drawer with the code.', clue: 'four, two, seven', code: '427', reward: 'Your member card!', stamp: 'number',
      lanes: { start: { code: '7', clue: 'seven', prompt: 'Open the drawer. The code is one number.' }, stretch: { clue: 'four hundred twenty-seven', prompt: 'Bonus! Open the drawer with the big number.' } },
      hints: ['Four, two, seven is 4, 2, 7. Turn each wheel.'],
    },
    { id: 'spell-me', kind: 'spell', part: 5, bg: BG, actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1], prompt: 'Now spell YOUR name on the badge.', target: '{name}', save: 'spelled', stamp: 'spell', hints: ['Look at the letters of your name on the badge.'] },
    {
      id: 'say-take1', kind: 'say', part: 5, bg: BG, actors: [{ who: 'Theo', pos: 'right', expr: 'wave' }], trains: [1, 3, 4], open: true,
      prompt: 'Take 1 · Sign up with Theo. Say your name, spell it and say where you are from.',
      model: 'My name is {name}. {spelled}. I am from ___. I am ___.',
      byDial: { chill: 'My name is {name}. I am from ___.', normal: 'My name is {name}. {spelled}. I am from ___. I am ___.', push: 'My name is {name}. {spelled}. I am {age}. I am from ___. I am ___. My number is four, two, seven.' },
      lanes: { start: { byDial: { chill: 'My name is {name}.', normal: 'My name is {name}. I am from ___.', push: 'My name is {name}. I am from ___. I am ___.' } } },
      hints: ['Read the model, then say it with your own country.'],
    },
    {
      id: 'fade', kind: 'fade', part: 5, bg: 'club-stage', actors: [{ who: 'Ava', pos: 'left', expr: 'music' }, { who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 4, 5],
      prompt: 'Feedback time! Practise the lines again, with less help each round, before Take 2.',
      lines: [
        { who: 'Ava', text: 'Hi! My name is Ava. A-V-A.', keys: ['name', 'Ava'] },
        { who: 'Theo', text: 'I am from Italy. I am Italian.', keys: ['Italy', 'Italian'] },
        { who: 'Ava', text: 'I am Spanish. My number is four, two, seven.', keys: ['Spanish', 'four'] },
        { who: 'Theo', text: 'Sorry, can you say it again?', keys: ['again'] },
      ],
    },
    {
      id: 'say-take2', kind: 'say', part: 5, bg: BG, actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [2, 5], open: true,
      prompt: 'Take 2 · Theo talks fast! Ask him to say it again, then say your number.',
      model: 'Sorry, can you say it again? My number is four, two, seven.',
      lanes: { stretch: { model: 'Sorry, can you say it again? My number is four, two, seven. How do you spell it?' } },
      hints: ['You did not hear? Ask for help. That is good English!'],
    },

    // ---------- 6 · Release (model hidden) ----------
    {
      id: 'card', kind: 'card', part: 6, bg: BG, actors: [VEE('right')], trains: [3, 4],
      prompt: 'Your turn! Make your club sign-up card, then print it.',
      model: [{ label: 'Age', text: 'I am 13.' }, { label: 'Country', text: 'I am from Spain.' }, { label: 'Nationality', text: 'I am Spanish.' }],
      ages: [11, 12, 13, 14, 15, 16, 17, 18],
      nationalities: ['Spain → Spanish', 'Italy → Italian', 'Brazil → Brazilian', 'Japan → Japanese', 'France → French', 'USA → American'],
      lanes: { start: { nationalities: ['Spain → Spanish', 'Italy → Italian'] } },
      hints: ['Not in the list? Ask your teacher or write it your way.'],
    },
    {
      id: 'say', kind: 'say', part: 6, bg: 'club-stage', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 4, 5],
      prompt: 'Final scene! Sign up at the desk. Say it all. If Theo is too fast, ask him again.',
      model: 'My name is {name}. {spelled}. I am {age}. I am from {country}. I am {nationality}. My number is four, two, seven. Sorry, can you say it again?',
      lanes: { start: { model: 'My name is {name}. I am from {country}. I am {nationality}.' } },
    },

    // ---------- 7 · Wrap ----------
    { id: 'wrap', kind: 'wrap', part: 7, bg: 'club-lobby', actors: [{ who: 'Vee', pos: 'left', expr: 'thumbs' }], heading: 'Mission complete?', ticks: CRITERIA, homework: 'Homework: spell your name to one friend today. Not yet is okay!', clue: 'Clue 2 of 8: In the fake profile, Sam’s name is spelled S-A-N. That is not right! Sam is S-A-M.' },
  ],
};
