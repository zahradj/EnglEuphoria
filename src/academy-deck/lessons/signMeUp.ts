// A1-S01-E2 "Sign Me Up" as a game deck (replaces the line-by-line player for this lesson). Academy cast only.
// Objective, criteria and blueprint facts: docs/academy-a1s01e2-spec.md. Items (blueprint): one … ten, Spain, Spanish, Italy, Italian.
// Every slide = a full scene plate + ONE different game; no two neighbouring slides use the same game.
import type { DeckScript } from '../types';

export const OBJECTIVE = 'By the end I can sign up at the club desk: spell my name, say my country and nationality, say my member number, and ask someone to say it again.';
export const CRITERIA = [
  'I spelled my name: M-I-N-A.',
  'I said my number: My number is four, two, seven.',
  'I said my country and nationality: I am Spanish.',
  'I said my name and age.',
  'I asked for help: Can you say it again?',
];
const WORDS: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten' };

export const SIGN_ME_UP: DeckScript = {
  lessonId: 'A1-S01-E2',
  level: 'A1',
  title: 'Sign Me Up',
  objective: OBJECTIVE,
  criteria: CRITERIA,
  cast: ['Vee', 'Ava', 'Theo'],
  slides: [
{ id: 'title', kind: 'title', part: 0, bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'center', expr: 'wave' }], heading: 'Sign Me Up', sub: 'Case file #2 · the club desk' },
{
      id: 'brief', kind: 'brief', part: 0, bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }],
      say: 'Welcome back! Today you win three stamps at the club desk.', heading: 'Your mission card',
      stamps: [{ id: 'spell', icon: 'abc', label: 'Spell your name' }, { id: 'number', icon: 'numbers', label: 'Say your number' }, { id: 'passport', icon: 'passport', label: 'Say your nationality' }],
    },
{ id: 'badge', kind: 'badge', part: 0, bg: 'club-signup-desk', actors: [{ who: 'Theo', pos: 'right', expr: 'wave' }], trains: [4], prompt: 'Theo gives you a badge. Put your name on it.', starter: 'My name is', ages: [11, 12, 13, 14, 15, 16, 17, 18], hints: ['Type only your name, and tap your age.'] },
{
      id: 'checkin-chat', part: 0, kind: 'convo', bg: 'club-signup-desk', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [4],
      prompt: 'Quick questions from Theo. Choose your answers.', me: 'Ava', meLabel: 'You', after: 'Thanks! Theo knows how you feel today.',
      steps: [
        { ask: 'Hi, {name}! How are you today?', pic: { type: 'card', id: 'v-hello', label: 'hello' }, options: [{ text: 'I am great!', pic: { type: 'card', id: 'v-great', label: 'feeling great' }, ok: true }, { text: 'I am fine.', pic: { type: 'card', id: 'v-fine', label: 'feeling fine' }, ok: true }, { text: 'I am tired.', pic: { type: 'card', id: 'v-tired', label: 'feeling tired' }, ok: true }] },
        { ask: 'What do you like?', options: [{ text: 'I like music.', pic: { type: 'card', id: 'v-music', label: 'music' }, ok: true }, { text: 'I like football.', pic: { type: 'card', id: 'v-football', label: 'football' }, ok: true }, { text: 'I like games.', pic: { type: 'card', id: 'v-games', label: 'games' }, ok: true }] },
      ],
      hints: ['There is no wrong answer here. Choose what is true for you.'],
    },
    {
      id: 'whosaid', kind: 'whosaid', part: 1, bg: 'club-signup-desk', actors: [{ who: 'Ava', pos: 'left', expr: 'happy' }, { who: 'Theo', pos: 'right', expr: 'happy' }], trains: [4],
      replayTitle: 'Remember last time? Ava signed up with Theo…',
      replay: [{ who: 'Theo', text: 'What is your name?' }, { who: 'Ava', text: 'My name is Ava.' }, { who: 'Theo', text: 'How old are you?' }, { who: 'Ava', text: 'I am 13.' }],
      prompt: 'Who said it? Drag each bubble to Ava or Theo.',
      items: [{ text: 'What is your name?', who: 'Theo' }, { text: 'My name is Ava.', who: 'Ava' }, { text: 'How old are you?', who: 'Theo' }, { text: 'I am 13.', who: 'Ava' }],
      hints: ['Questions come from Theo at the desk. Answers come from Ava.'],
    },
    {
      id: 'recall-chat', part: 1, kind: 'phonechat', bg: 'club-lobby', actors: [{ who: 'Ava', pos: 'left', expr: 'happy' }], trains: [4],
      prompt: 'Remember last time? Theo texts you. Build your replies.', contact: 'Theo',
      steps: [
        { text: 'Hi! What is your name?', pic: { type: 'card', id: 'v-name', label: 'a name tag' }, reply: 'My name is {name}.', extra: ['I', 'name'] },
        { text: 'How old are you?', pic: { type: 'card', id: 'v-age', label: 'a birthday cake' }, reply: 'I am {age}.', extra: ['have', 'old'] },
        { text: 'Nice to meet you!', pic: { type: 'card', id: 'v-meet', label: 'nice to meet you' }, reply: 'Nice to meet you, too.', extra: ['name'] },
      ],
      hints: ['Answer Theo’s question. Your name and age are on the tiles.'],
    },
{
      id: 'teach-nums', part: 2, kind: 'teach', bg: 'locker-hall', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [2], title: 'Meet the numbers 1 to 10',
      pages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ word: WORDS[n], art: { type: 'count' as const, n }, meaning: `the number ${n}`, example: `My number is ${WORDS[n]}.`, clue: `Count the dots: ${n <= 5 ? Array.from({ length: n }, (_, i) => i + 1).join(', ') : `${n} dots`}.` })),
      hints: ['Watch the dots appear one by one. Press “Show again” to see it again.'],
    },
{ id: 'lockers', kind: 'lockers', part: 2, bg: 'locker-hall', actors: [{ who: 'Vee', pos: 'right', expr: 'happy' }], trains: [2], prompt: 'Locker Pop! Read the number word and open that locker.', rounds: [4, 2, 5, 1, 3], grid: [1, 2, 3, 4, 5], words: WORDS, hints: ['Count the numbers on the doors. Four is 4.'] },
    {
      id: 'teach-nations', kind: 'teach', part: 2, bg: 'border-control', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [3], title: 'Countries and nationalities',
      pages: [
        { word: 'Spain', art: { type: 'flag', code: 'es' }, meaning: 'a country', example: 'I am from Spain.', clue: 'The flag is red and yellow.' },
        { word: 'Spanish', art: { type: 'person', code: 'es' }, meaning: 'a person from Spain', example: 'I am Spanish.', clue: 'Spain → Spanish.' },
        { word: 'Italy', art: { type: 'flag', code: 'it' }, meaning: 'a country', example: 'I am from Italy.', clue: 'The flag is green, white and red.' },
        { word: 'Italian', art: { type: 'person', code: 'it' }, meaning: 'a person from Italy', example: 'I am Italian.', clue: 'Italy → Italian.' },
        { word: 'Brazil', art: { type: 'flag', code: 'br' }, meaning: 'a country (you know it!)', example: 'I am from Brazil.', clue: 'Green, with a yellow diamond.' },
        { word: 'Brazilian', art: { type: 'person', code: 'br' }, meaning: 'a person from Brazil', example: 'I am Brazilian.', clue: 'Brazil → Brazilian. See the pattern?' },
      ],
      hints: ['Country: where you are from. Nationality: what you are.'],
    },
{
      id: 'model-signup', kind: 'model', part: 2, bg: 'club-signup-desk', actors: [{ who: 'Ava', pos: 'left', expr: 'happy' }, { who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 4, 5],
      title: 'Watch Ava sign up at the desk',
      lines: [
        { who: 'Theo', text: 'What is your name?', pic: { type: 'card', id: 'v-name', label: 'a name tag' }, frame: ['What is your ', { slot: 'name', label: 'asking for' }, '?'] },
        { who: 'Ava', text: 'My name is Ava.', frame: ['My name is ', { slot: 'Ava', label: 'your name' }, '.'], note: 'The pattern stays the same. Only the coloured part changes.' },
        { who: 'Theo', text: 'How do you spell it?', pic: { type: 'letters', text: 'ABC' }, frame: ['How do you ', { slot: 'spell', label: 'action' }, ' it?'] },
        { who: 'Ava', text: 'A-V-A.', frame: [{ slot: 'A', label: 'letter' }, '-', { slot: 'V', label: 'letter' }, '-', { slot: 'A', label: 'letter' }], note: 'Say the letters one by one.' },
        { who: 'Theo', text: 'How old are you?', pic: { type: 'card', id: 'v-age', label: 'a birthday cake' }, frame: ['How old are ', { slot: 'you', label: 'person' }, '?'] },
        { who: 'Ava', text: 'I am 13.', frame: ['I am ', { slot: '13', label: 'age' }, '.'] },
        { who: 'Theo', text: 'Where are you from?', pic: { type: 'card', id: 'v-country', label: 'the world' }, frame: ['Where are you ', { slot: 'from', label: 'place' }, '?'] },
        { who: 'Ava', text: 'I am from Spain. I am Spanish.', frame: ['I am from ', { slot: 'Spain', label: 'country' }, '. I am ', { slot: 'Spanish', label: 'nationality' }, '.'] },
        { who: 'Theo', text: 'Your member number is four, two, seven.', pic: { type: 'count', n: 4 }, frame: ['Your member number is ', { slot: 'four, two, seven', label: 'number' }, '.'] },
        { who: 'Ava', text: 'Sorry, can you say it again?', pic: { type: 'card', id: 'v-again', label: 'say it again' }, frame: ['Sorry, can you ', { slot: 'say it again', label: 'ask for help' }, '?'], note: 'You did not hear? Ask for help. That is very good English!' },
        { who: 'Theo', text: 'Four… two… seven.' },
        { who: 'Ava', text: 'My number is four, two, seven.', frame: ['My number is ', { slot: 'four, two, seven', label: 'number' }, '.'] },
      ],
      closing: 'Now YOU help Ava sign up!',
    },
{ id: 'numtrain', kind: 'numtrain', part: 3, bg: 'locker-hall', actors: [{ who: 'Theo', pos: 'left', expr: 'happy' }], trains: [2], prompt: 'Number Train! Put each number word on its carriage.', numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], words: WORDS, hints: ['Look at the dots on the carriage. Count them.'] },
{
      id: 'padlock', kind: 'padlock', part: 3, bg: 'locker-hall', actors: [{ who: 'Theo', pos: 'right', expr: 'wave' }], trains: [2],
      prompt: 'Theo says your member number. Open the drawer with the code!', clue: 'four, two, seven', code: '427', reward: 'Your member number is 4-2-7.', stamp: 'number',
      hints: ['First word: four → 4.', 'Four = 4, two = 2, seven = 7. Turn the dials to 4 2 7.'],
    },
{
      id: 'teach-spell', kind: 'teach', part: 3, bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'right', expr: 'happy' }], trains: [1, 5], title: 'Spelling and asking for help',
      pages: [
        { word: 'spell', art: { type: 'letters', text: 'AVA' }, meaning: 'say the letters of a word, one by one', example: 'How do you spell it? A-V-A.', clue: 'Ava has three letters: A, V, A.' },
        { word: 'letter', art: { type: 'letters', text: 'M' }, meaning: 'A, B, C… each one is a letter', example: 'M is a letter.', clue: 'Your name is made of letters.' },
        { word: 'How do you spell it?', art: { type: 'card', id: 'v-spell', label: 'spelling a name' }, meaning: 'a question: please say the letters', example: 'How do you spell it? M-I-N-A.', clue: 'You can ask it too!' },
        { word: 'Can you say it again?', art: { type: 'card', id: 'v-again', label: 'say it again' }, meaning: 'ask someone to repeat', example: 'Sorry, can you say it again?', clue: 'You did not hear? Ask. It is normal.' },
      ],
      hints: ['Press “Show again” to watch the letters appear.'],
    },
{ id: 'spell-ava', kind: 'spell', part: 3, bg: 'club-signup-desk', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1], prompt: 'Spell Ava’s name. Drag each letter onto the badge.', target: 'AVA', hints: ['Start with the first letter on the badge: A.'] },
{
      id: 'border', kind: 'border', part: 3, bg: 'border-control', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [3],
      prompt: 'Border control! Drag each traveller onto the right passport.',
      rounds: [
        { flag: 'es', says: 'I am from Spain.', answer: 'Spanish', options: ['Spanish', 'Italian', 'Brazilian'] },
        { flag: 'it', says: 'I am from Italy.', answer: 'Italian', options: ['Spanish', 'Italian', 'Brazilian'] },
        { flag: 'br', says: 'I am from Brazil.', answer: 'Brazilian', options: ['Spanish', 'Italian', 'Brazilian'] },
        { flag: 'it', says: 'I am from Italy.', answer: 'Italian', options: ['Italian', 'Spanish', 'Brazilian'] },
        { flag: 'es', says: 'I am from Spain.', answer: 'Spanish', options: ['Brazilian', 'Italian', 'Spanish'] },
      ],
      flags: { Spanish: 'es', Italian: 'it', Brazilian: 'br' }, stamp: 'passport', hints: ['Spain → Spanish. Italy → Italian. Brazil → Brazilian.'],
    },
{
      id: 'convo', kind: 'convo', part: 3, bg: 'club-signup-desk', actors: [{ who: 'Ava', pos: 'left', expr: 'happy' }, { who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 4, 5],
      prompt: 'Help Ava sign up. Choose what Ava says.', me: 'Ava', after: 'Ava is on the list! Read the whole conversation out loud with your teacher.',
      steps: [
        { ask: 'Hi! Welcome to the desk. What is your name?', pic: { type: 'card', id: 'v-name', label: 'a name tag' }, options: [{ text: 'My name is Ava.', ok: true }, { text: 'I am name Ava.', hint: 'Start with: My name is…' }, { text: 'Name my Ava is.', hint: 'The words are in the wrong order.' }] },
        { ask: 'How do you spell it?', pic: { type: 'letters', text: 'ABC' }, options: [{ text: 'A-V-A.', ok: true }, { text: 'Ava.', hint: 'Spell it: say the letters one by one.' }, { text: 'It is Ava.', hint: 'Spell it: say the letters one by one.' }] },
        { ask: 'How old are you?', pic: { type: 'card', id: 'v-age', label: 'a birthday cake' }, options: [{ text: 'I am 13.', ok: true }, { text: 'I have 13.', hint: 'We say: I am + age.' }, { text: '13 am I.', hint: 'The words are in the wrong order.' }] },
        { ask: 'Where are you from?', pic: { type: 'card', id: 'v-country', label: 'the world' }, options: [{ text: 'I am from Spain. I am Spanish.', pic: { type: 'flag', code: 'es' }, ok: true }, { text: 'I am from Italy. I am Italian.', pic: { type: 'flag', code: 'it' }, hint: 'Ava is from Spain. Look at the red and yellow flag.' }, { text: 'I am from Brazil. I am Brazilian.', pic: { type: 'flag', code: 'br' }, hint: 'Ava is from Spain. Look at the red and yellow flag.' }] },
        { ask: 'Your member number is four two seven!', pic: { type: 'count', n: 4 }, options: [{ text: 'Sorry, can you say it again?', pic: { type: 'card', id: 'v-again', label: 'say it again' }, ok: true }, { text: 'I am four, two, seven.', pic: { type: 'card', id: 'v-me', label: 'me' }, hint: 'Ava did not hear well. What can she ask?' }, { text: 'My name is Spain.', pic: { type: 'card', id: 'v-name', label: 'a name tag' }, hint: 'Ava did not hear well. What can she ask?' }] },
        { ask: 'Four… two… seven.', pic: { type: 'count', n: 4 }, options: [{ text: 'My number is four, two, seven.', ok: true }, { text: 'I am four, two, seven.', hint: 'For a number we say: My number is…' }, { text: 'Four, two, seven name.', hint: 'Start with: My number is…' }] },
      ],
      hints: ['Read the three choices. Which one sounds right and answers the question?'],
    },
{ id: 'memory', kind: 'memory', part: 4, bg: 'border-control', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [3], prompt: 'Memory! Find each flag and its nationality word.', pairs: [{ flag: 'es', text: 'Spanish' }, { flag: 'it', text: 'Italian' }, { flag: 'br', text: 'Brazilian' }], hints: ['Remember where the flags are. Spain is red and yellow.'] },
{
      id: 'detective', kind: 'findwrong', part: 4, bg: 'detective-wall', actors: [{ who: 'Vee', pos: 'left', expr: 'thinking' }], trains: [1],
      prompt: 'Detective time! The fake profile of Sam has 2 spelling mistakes. Tap them.',
      rows: [
        { label: 'Name', text: 'S-A-N', wrong: true, fix: 'S-A-M' },
        { label: 'Age', text: '13' },
        { label: 'Country', text: 'Spian', wrong: true, fix: 'Spain' },
        { label: 'Nationality', text: 'Spanish' },
        { label: 'Number', text: 'four, two, seven' },
      ],
      reveal: 'Found them! Sam is S-A-M and the country is Spain. Someone typed the wrong letters!',
      hints: ['Spell Sam: S, A, M. Does the profile say the same?', 'The name has a wrong last letter. The country has two letters in the wrong place.'],
    },
    {
      id: 'dial', part: 5, kind: 'dial', bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'right', expr: 'thumbs' }],
      prompt: 'Mission time! How much help do you want?',
    },
{ id: 'spell-me', kind: 'spell', part: 5, bg: 'club-signup-desk', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1], prompt: 'Now spell YOUR name on the badge.', target: '{name}', save: 'spelled', stamp: 'spell', hints: ['Look at the letters of your name on the badge.'] },
{
      id: 'phonechat', kind: 'phonechat', part: 5, bg: 'club-lobby', actors: [{ who: 'Ava', pos: 'left', expr: 'happy' }], trains: [2, 3],
      prompt: 'Theo texts you! Build your replies with the word tiles.', contact: 'Theo',
      steps: [
        { text: 'Hi! Where are you from?', pic: { type: 'card', id: 'v-country', label: 'the world' }, reply: 'I am from Spain.', extra: ['for', 'Spanish'], tilePics: { 'Spain.': { type: 'flag', code: 'es' }, Spanish: { type: 'person', code: 'es' } } },
        { text: 'Cool! What is your nationality?', pic: { type: 'card', id: 'v-nationality', label: 'a passport' }, reply: 'I am Spanish.', extra: ['from', 'Spain'], tilePics: { 'Spanish.': { type: 'person', code: 'es' }, Spain: { type: 'flag', code: 'es' } } },
        { text: 'And your number?', pic: { type: 'count', n: 4 }, reply: 'My number is four, two, seven.', extra: ['name'], tilePics: { 'four,': { type: 'count', n: 4 }, 'two,': { type: 'count', n: 2 }, 'seven.': { type: 'count', n: 7 } } },
      ],
      hints: ['Answer the question Theo asks. Tap the first word of your reply.'],
    },
    {
      id: 'say-take1', part: 5, kind: 'say', bg: 'club-signup-desk', actors: [{ who: 'Theo', pos: 'right', expr: 'wave' }], trains: [1, 3, 4],
      prompt: 'Take 1 · Sign up with Theo. Say your name, spell it and say where you are from.', open: true,
      model: 'My name is {name}. {spelled}. I am {age}. I am from ___. I am ___.',
      byDial: { chill: 'My name is {name}. {spelled}. I am from ___.', normal: 'My name is {name}. {spelled}. I am {age}. I am from ___. I am ___.', push: 'My name is {name}. {spelled}. I am {age}. I am from ___. I am ___. My number is {numw}.' },
      hints: ['Read the model, then say it with your own country.'],
    },
{
      id: 'fade', kind: 'fade', part: 5, bg: 'club-stage', actors: [{ who: 'Ava', pos: 'left', expr: 'music' }, { who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 4, 5],
      prompt: 'Feedback time! Practise the lines again, with less help each round, before Take 2.',
      lines: [
        { who: 'Ava', text: 'Hi! My name is Ava. A-V-A.', keys: ['name', 'Ava'] },
        { who: 'Theo', text: 'I am 14. I am from Brazil.', keys: ['14', 'Brazil'] },
        { who: 'Ava', text: 'I am Spanish. My number is four, two, seven.', keys: ['Spanish', 'four', 'seven'] },
        { who: 'Theo', text: 'Sorry, can you say it again?', keys: ['again'] },
      ],
    },
    {
      id: 'say-take2', part: 5, kind: 'say', bg: 'club-signup-desk', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [2, 5],
      prompt: 'Take 2 · Theo talks fast! Ask him to say it again, then say your number.', open: true,
      model: 'Sorry, can you say it again? My number is {numw}. How do you spell it?',
      hints: ['You did not hear? Ask for help. That is good English!'],
    },
{
      id: 'card', kind: 'card', part: 6, bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'right', expr: 'happy' }], trains: [3, 4],
      prompt: 'Your turn! Make your club sign-up card, then print it.',
      model: [{ label: 'Age', text: 'I am 13.' }, { label: 'Country', text: 'I am from Spain.' }, { label: 'Nationality', text: 'I am Spanish.' }],
      ages: [11, 12, 13, 14, 15, 16, 17, 18],
      nationalities: ['Spain → Spanish', 'Italy → Italian', 'Brazil → Brazilian', 'Japan → Japanese', 'France → French', 'USA → American'],
      hints: ['Not in the list? Ask your teacher or write it your way.'],
    },
{
      id: 'say', kind: 'say', part: 6, bg: 'club-stage', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 4, 5],
      prompt: 'Final scene! Sign up at the desk. Say it all. If Theo is too fast, ask him again.',
      model: 'My name is {name}. {spelled}. I am {age}. I am from {country}. I am {nationality}. My number is {numw}. Can you say it again?',
    },
{ id: 'wrap', kind: 'wrap', part: 7, bg: 'club-lobby', actors: [{ who: 'Vee', pos: 'left', expr: 'thumbs' }], heading: 'Mission complete?', ticks: CRITERIA, homework: 'Homework: spell your name to one friend today. Not yet is okay!', clue: 'Clue 2 of 8: In the fake profile, Sam’s name is spelled S-A-N. That is not right! Sam is S-A-M.' }
  ],
};
