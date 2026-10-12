// A1-S01-E2 "Sign Me Up" as a game deck (replaces the line-by-line player for this lesson). Academy cast only.
// Objective, criteria and blueprint facts: docs/academy-a1s01e2-spec.md. Items (blueprint): one … ten, Spain, Spanish, Italy, Italian.
// Every slide = a full scene plate + ONE different game; no two neighbouring slides use the same game.
import type { DeckScript } from '../types';
import { numberWord as numberWordOf } from '../spoken';

export const OBJECTIVE = 'By the end I can sign up at the club desk: spell my name, say my country and nationality, say my member number, and ask someone to say it again.';
export const CRITERIA = [
  'I spelled my name: M-I-N-A.',
  'I said my number: My number is four hundred twenty-seven.',
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
    {
      id: 'teach-words', kind: 'teach', part: 0, bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [1], title: 'Words your teacher says',
      pages: [
        { word: 'Listen', art: { type: 'action' as const, id: 'listen' as const }, meaning: 'use your ears: someone is speaking', example: 'Listen to Theo.', clue: 'Listen, then answer.' },
        { word: 'Look', art: { type: 'action' as const, id: 'look' as const }, meaning: 'use your eyes: see the picture', example: 'Look at the picture.', clue: 'Look first. Then click.' },
        { word: 'Repeat', art: { type: 'action' as const, id: 'repeat' as const }, meaning: 'say it again after the teacher', example: 'Listen and repeat: My name is Vee.', clue: 'Listen and repeat = hear it, then say it.' },
        { word: 'Click', art: { type: 'action' as const, id: 'click' as const }, meaning: 'press the button or the picture', example: 'Click the answer.', clue: 'On a phone you tap.' },
        { word: 'Read', art: { type: 'action' as const, id: 'read' as const }, meaning: 'look at the words and understand them', example: 'Read the clue.', clue: 'Read slowly. Use the pictures.' },
        { word: 'Point', art: { type: 'action' as const, id: 'point' as const }, meaning: 'show with your finger', example: 'Point to the flag.', clue: 'Point = show.' },
      ],
      hints: ['These are the words you will hear in every lesson.'],
    },
    {
      id: 'match-words', kind: 'match', part: 0, bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [1],
      prompt: 'Match each picture with its word. Drag the word onto the picture.',
      pairs: [
        { word: 'Listen', art: { type: 'action' as const, id: 'listen' as const } },
        { word: 'Look', art: { type: 'action' as const, id: 'look' as const } },
        { word: 'Repeat', art: { type: 'action' as const, id: 'repeat' as const } },
        { word: 'Click', art: { type: 'action' as const, id: 'click' as const } },
        { word: 'Read', art: { type: 'action' as const, id: 'read' as const } },
        { word: 'Point', art: { type: 'action' as const, id: 'point' as const } },
      ],
      hints: ['Look at what the picture shows. A hand pointing is Point. An ear is Listen.', 'Tap a word to hear it, then tap the picture.'],
    },
    {
      id: 'memory-words', kind: 'memory', part: 0, bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [1],
      prompt: 'Memory! Flip two cards: find each picture and its word. Hear it, then say it.',
      pairs: [
        { art: { type: 'action' as const, id: 'listen' as const }, text: 'Listen' },
        { art: { type: 'action' as const, id: 'look' as const }, text: 'Look' },
        { art: { type: 'action' as const, id: 'repeat' as const }, text: 'Repeat' },
        { art: { type: 'action' as const, id: 'click' as const }, text: 'Click' },
        { art: { type: 'action' as const, id: 'read' as const }, text: 'Read' },
        { art: { type: 'action' as const, id: 'point' as const }, text: 'Point' },
      ],
      hints: ['Flip a card and listen. Remember where each picture is.'],
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
      id: 'intro-me', kind: 'say', part: 0, bg: 'club-signup-desk', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [4], open: true,
      prompt: 'Now introduce yourself! Read the little paragraph, then say it in your own words.',
      model: 'Hello! My name is {name}. I am {age} years old. I feel happy today. I am great!',
      hints: ['Read it slowly: Hello, my name is…, I am … years old.', 'You can change the last part: I am fine. I am great. I feel happy today.'],
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
      id: 'teach-help', kind: 'teach', part: 1, bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'right', expr: 'happy' }], trains: [5], title: 'When you do not understand, say…',
      pages: [
        { word: 'Sorry?', art: { type: 'action' as const, id: 'sorry' as const }, meaning: 'I did not hear. Please say it again.', example: 'Sorry? … Oh, I see!', clue: 'A small word with a question tone.' },
        { word: 'Slowly, please.', art: { type: 'action' as const, id: 'slow' as const }, meaning: 'please speak more slowly', example: 'Slowly, please. Thank you!', clue: 'Slowly = not fast.' },
        { word: 'I don’t understand.', art: { type: 'action' as const, id: 'confused' as const }, meaning: 'I do not know what it means', example: 'I don’t understand. Can you help?', clue: 'It is OK. Say it and your teacher helps.' },
        { word: 'What does it mean?', art: { type: 'action' as const, id: 'meaning' as const }, meaning: 'ask about a word', example: 'What does “nationality” mean?', clue: 'Point to the word and ask.' },
      ],
      hints: ['Teachers love this question. Asking is how you learn.'],
    },
    {
      id: 'match-help', kind: 'match', part: 1, bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'right', expr: 'happy' }], trains: [5],
      prompt: 'Grab and drag: match each help phrase with its picture.',
      pairs: [
        { word: 'Sorry?', art: { type: 'action' as const, id: 'sorry' as const } },
        { word: 'Slowly, please.', art: { type: 'action' as const, id: 'slow' as const } },
        { word: 'I don’t understand.', art: { type: 'action' as const, id: 'confused' as const } },
        { word: 'What does it mean?', art: { type: 'action' as const, id: 'meaning' as const } },
      ],
      hints: ['Look at the face and the hands in each picture. Which phrase would you say?', 'Tap a phrase to hear it, then tap the picture.'],
    },
    {
      id: 'memory-help', kind: 'memory', part: 1, bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'right', expr: 'happy' }], trains: [5],
      prompt: 'Memory! Find each help phrase and its picture.',
      pairs: [
        { art: { type: 'action' as const, id: 'sorry' as const }, text: 'Sorry?' },
        { art: { type: 'action' as const, id: 'slow' as const }, text: 'Slowly, please.' },
        { art: { type: 'action' as const, id: 'confused' as const }, text: 'I don’t understand.' },
        { art: { type: 'action' as const, id: 'meaning' as const }, text: 'What does it mean?' },
      ],
      hints: ['Flip two cards. Match the phrase with the face.'],
    },
    {
      id: 'count-revise', kind: 'countup', part: 1, bg: 'locker-hall', actors: [{ who: 'Vee', pos: 'right', expr: 'happy' }], trains: [2],
      prompt: 'Let’s count! Listen, then fill the gaps. 1 to 10, 11 to 20, then by tens.',
      rounds: [
        { seq: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], blanks: [2, 6, 8] },
        { seq: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], blanks: [3, 9] },
        { seq: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], blanks: [2, 4, 7] },
      ],
      hints: ['Say the numbers in your head: one, two, … Which number comes next?', 'By tens: ten, twenty, thirty, forty, fifty…'],
    },
    {
      id: 'listen-numbers', kind: 'match', part: 1, bg: 'locker-hall', actors: [{ who: 'Vee', pos: 'right', expr: 'thumbs' }], trains: [2], mode: 'listen',
      prompt: 'Listen and match: hear the number, then tap the right number card.',
      pairs: [3, 12, 40, 70, 100].map((n) => ({ word: numberWordOf(n), art: { type: 'count' as const, n } })),
      hints: ['Listen for the end of the word: -teen (13) or -ty (30).', 'Tap Hear it again as many times as you like.'],
    },
{
      id: 'teach-nums', part: 2, kind: 'teach', bg: 'locker-hall', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [2], title: 'Meet the numbers 1 to 10',
      pages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ word: WORDS[n], art: { type: 'count' as const, n }, meaning: `the number ${n}`, example: `My number is ${WORDS[n]}.`, clue: `Count the dots: ${n <= 5 ? Array.from({ length: n }, (_, i) => i + 1).join(', ') : `${n} dots`}.` })),
      hints: ['Watch the dots appear one by one. Press “Show again” to see it again.'],
    },
{ id: 'lockers', kind: 'lockers', part: 2, bg: 'locker-hall', actors: [{ who: 'Vee', pos: 'right', expr: 'happy' }], trains: [2], prompt: 'Locker Pop! Read the number word and open that locker.', rounds: [4, 2, 5], grid: [1, 2, 3, 4, 5], words: WORDS, hints: ['Count the numbers on the doors. Four is 4.'] },
    {
      id: 'memory-nums', kind: 'memory', part: 2, bg: 'locker-hall', actors: [{ who: 'Vee', pos: 'right', expr: 'happy' }], trains: [2],
      prompt: 'Memory! Match each number word with its dots.',
      pairs: [
        { art: { type: 'count' as const, n: 3 }, text: WORDS[3] },
        { art: { type: 'count' as const, n: 5 }, text: WORDS[5] },
        { art: { type: 'count' as const, n: 6 }, text: WORDS[6] },
        { art: { type: 'count' as const, n: 8 }, text: WORDS[8] },
        { art: { type: 'count' as const, n: 10 }, text: WORDS[10] },
      ],
      hints: ['Count the dots on the card, then find its word.'],
    },
    {
      id: 'teach-nations', kind: 'teach', part: 2, bg: 'border-control', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [3], title: 'Countries and nationalities (country · nationality)',
      pages: [
        { word: 'Spain · Spanish', art: { type: 'bearer' as const, code: 'es', who: 'Ava' as const }, meaning: 'a country and its people', example: 'I am from Spain. I am Spanish.', clue: 'Ava holds the flag of Spain: red, yellow, red. Spain → Spanish.' },
        { word: 'Italy · Italian', art: { type: 'bearer' as const, code: 'it', who: 'Theo' as const }, meaning: 'a country and its people', example: 'I am from Italy. I am Italian.', clue: 'Theo holds the flag of Italy: green, white and red. Italy → Italian.' },
        { word: 'Brazil · Brazilian', art: { type: 'bearer' as const, code: 'br', who: 'Mia' as const }, meaning: 'a country and its people', example: 'I am from Brazil. I am Brazilian.', clue: 'Mia holds the flag of Brazil: green with a yellow diamond. Brazil → Brazilian. See the pattern?' },
        { word: 'France · French', art: { type: 'bearer' as const, code: 'fr', who: 'Vee' as const }, meaning: 'a country and its people', example: 'I am from France. I am French.', clue: 'Vee holds the flag of France: blue, white, red. France → French.' },
      ],
      hints: ['Country: where you are from. Nationality: what you are.']
    },
    {
      id: 'match-nations', kind: 'match', part: 2, bg: 'border-control', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [3],
      prompt: 'Who is from where? Drag each country and nationality onto its character.',
      pairs: [
        { word: 'Spain · Spanish', art: { type: 'bearer' as const, code: 'es', who: 'Ava' as const } },
        { word: 'Italy · Italian', art: { type: 'bearer' as const, code: 'it', who: 'Theo' as const } },
        { word: 'Brazil · Brazilian', art: { type: 'bearer' as const, code: 'br', who: 'Mia' as const } },
        { word: 'France · French', art: { type: 'bearer' as const, code: 'fr', who: 'Vee' as const } },
      ],
      hints: ['Look at the flag in their hand. Red and yellow is Spain. Green and yellow is Brazil.', 'Tap a word to hear it, then tap the character.'],
    },
    {
      id: 'memory-nations', kind: 'memory', part: 2, bg: 'border-control', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [3],
      prompt: 'Memory! Find each flag and its nationality word.',
      pairs: [
        { flag: 'es', text: 'Spanish' },
        { flag: 'it', text: 'Italian' },
        { flag: 'br', text: 'Brazilian' },
        { flag: 'fr', text: 'French' },
      ],
      hints: ['Remember where the flags are. Spain is red and yellow.'],
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
        { who: 'Theo', text: 'Your member number is four hundred twenty-seven.', pic: { type: 'letters', text: '427' }, frame: ['Your member number is ', { slot: 'four hundred twenty-seven', label: 'number' }, '.'] },
        { who: 'Ava', text: 'Sorry, can you say it again?', pic: { type: 'card', id: 'v-again', label: 'say it again' }, frame: ['Sorry, can you ', { slot: 'say it again', label: 'ask for help' }, '?'], note: 'You did not hear? Ask for help. That is very good English!' },
        { who: 'Theo', text: 'Four hundred… twenty-seven.' },
        { who: 'Ava', text: 'My number is four hundred twenty-seven.', frame: ['My number is ', { slot: 'four hundred twenty-seven', label: 'number' }, '.'] },
      ],
      closing: 'Now YOU help Ava sign up!',
    },
{ id: 'numwall', kind: 'numwall', part: 3, bg: 'locker-hall', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [2], title: 'More numbers: 11 to 100, and the big numbers', need: 8, hundreds: true, hints: ['Tap 20, then 21, then 30. Look at the pattern: twenty, twenty-one, thirty.'] },
    {
      id: 'teach-hundreds', kind: 'teach', part: 3, bg: 'locker-hall', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [2], title: 'Big numbers: hundreds',
      pages: [
        { word: 'one hundred', art: { type: 'count' as const, n: 100 }, meaning: 'the number 100: ten tens', example: 'The locker is one hundred.', clue: '100 = one hundred.' },
        { word: 'two hundred', art: { type: 'letters' as const, text: '200' }, meaning: 'the number 200: two times one hundred', example: 'Open locker two hundred.', clue: 'The first number says how many hundreds: 2 → two hundred.' },
        { word: 'four hundred', art: { type: 'letters' as const, text: '400' }, meaning: 'the number 400: four times one hundred', example: 'Open locker four hundred.', clue: '400 = four hundred. And 300? Three hundred. 500? Five hundred!' },
        { word: 'four hundred twenty-seven', art: { type: 'letters' as const, text: '427' }, meaning: 'the number 427: 400 and 27 together', example: 'My number is four hundred twenty-seven.', clue: 'Say the hundreds first: four hundred. Then the rest: twenty-seven.' },
      ],
      hints: ['Hundreds are easy: say the number, then “hundred”.'],
    },
    {
      id: 'lockers-hundreds', kind: 'lockers', part: 3, bg: 'locker-hall', actors: [{ who: 'Theo', pos: 'left', expr: 'happy' }], trains: [2],
      prompt: 'Locker Pop: big numbers! Listen and open the locker.',
      rounds: [400, 200, 100], grid: [100, 200, 300, 400, 500],
      words: { 100: 'one hundred', 200: 'two hundred', 300: 'three hundred', 400: 'four hundred', 500: 'five hundred' },
      hints: ['One hundred is 100. Two hundred is 200. Four hundred is 400.', 'The first number tells you how many hundreds.'],
    },
    {
      id: 'numtrain', kind: 'numtrain', part: 3, bg: 'locker-hall', actors: [{ who: 'Theo', pos: 'left', expr: 'happy' }], trains: [2],
      prompt: 'Number Train! Put each number word on its carriage: two-digit and three-digit numbers.',
      numbers: [88, 180, 503, 245],
      words: { 88: 'eighty-eight', 180: 'one hundred eighty', 503: 'five hundred three', 245: 'two hundred forty-five' },
      hints: ['Read the number: 503 is five hundred and three. 88 is eighty-eight.', 'Hundreds first, then the tens and ones: 245 = two hundred forty-five.'],
    },
{
      id: 'padlock', kind: 'padlock', part: 3, bg: 'locker-hall', actors: [{ who: 'Theo', pos: 'right', expr: 'wave' }], trains: [2],
      prompt: 'Theo says your member number. Open the drawer with the code!', clue: 'four hundred twenty-seven', code: '427', reward: 'Your member number is 427: four hundred twenty-seven.', stamp: 'number',
      hints: ['Four hundred → the first dial is 4.', 'Twenty-seven is 27: the next dials are 2 and 7. Turn them to 4 2 7.'],
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
    {
      id: 'match-spell', kind: 'match', part: 3, bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'right', expr: 'happy' }], trains: [1, 5],
      prompt: 'Match each word or question with its picture. Drag it onto the picture.',
      pairs: [
        { word: 'spell', art: { type: 'letters' as const, text: 'AVA' } },
        { word: 'letter', art: { type: 'letters' as const, text: 'M' } },
        { word: 'How do you spell it?', art: { type: 'card' as const, id: 'v-spell', label: 'spelling a name' } },
        { word: 'Can you say it again?', art: { type: 'card' as const, id: 'v-again', label: 'say it again' } },
      ],
      hints: ['Spell is the letters of a word. Look at the picture, then drag.'],
    },
    {
      id: 'memory-spell', kind: 'memory', part: 3, bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'right', expr: 'happy' }], trains: [1, 5],
      prompt: 'Memory! Find each picture and its word.',
      pairs: [
        { art: { type: 'letters' as const, text: 'AVA' }, text: 'spell' },
        { art: { type: 'letters' as const, text: 'M' }, text: 'letter' },
        { art: { type: 'card' as const, id: 'v-spell', label: 'spelling a name' }, text: 'How do you spell it?' },
        { art: { type: 'card' as const, id: 'v-again', label: 'say it again' }, text: 'Can you say it again?' },
      ],
      hints: ['Flip two cards. Say the word when you find a pair.'],
    },
    {
      id: 'border', kind: 'border', part: 3, bg: 'border-control', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [3],
      prompt: 'Border control! Drag each traveller onto the right passport.',
      rounds: [
        { flag: 'es', who: 'Ava' as const, says: 'I am from Spain.', answer: 'Spanish', options: ['Spanish', 'Italian', 'French'] },
        { flag: 'fr', who: 'Vee' as const, says: 'I am from France.', answer: 'French', options: ['Brazilian', 'French', 'Spanish'] },
        { flag: 'br', who: 'Mia' as const, says: 'I am from Brazil.', answer: 'Brazilian', options: ['Spanish', 'Italian', 'Brazilian'] },
        { flag: 'it', who: 'Theo' as const, says: 'I am from Italy.', answer: 'Italian', options: ['Italian', 'French', 'Brazilian'] },
      ],
      flags: { Spanish: 'es', Italian: 'it', Brazilian: 'br', French: 'fr' }, stamp: 'passport', hints: ['Spain → Spanish. Italy → Italian. Brazil → Brazilian. France → French.'],
    },
{
      id: 'convo', kind: 'convo', part: 3, bg: 'club-signup-desk', actors: [{ who: 'Ava', pos: 'left', expr: 'happy' }, { who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 4, 5],
      prompt: 'Help Ava sign up. Choose what Ava says.', me: 'Ava', after: 'Ava is on the list! Read the whole conversation out loud with your teacher.',
      steps: [
        { ask: 'Hi! Welcome to the desk. What is your name?', pic: { type: 'card', id: 'v-name', label: 'a name tag' }, options: [{ text: 'My name is Ava.', ok: true }, { text: 'I am name Ava.', hint: 'Start with: My name is…' }, { text: 'Name my Ava is.', hint: 'The words are in the wrong order.' }] },
        { ask: 'How do you spell it?', pic: { type: 'letters', text: 'ABC' }, options: [{ text: 'A-V-A.', ok: true }, { text: 'Ava.', hint: 'Spell it: say the letters one by one.' }, { text: 'It is Ava.', hint: 'Spell it: say the letters one by one.' }] },
        { ask: 'How old are you?', pic: { type: 'card', id: 'v-age', label: 'a birthday cake' }, options: [{ text: 'I am 13.', ok: true }, { text: 'I have 13.', hint: 'We say: I am + age.' }, { text: '13 am I.', hint: 'The words are in the wrong order.' }] },
        { ask: 'Where are you from?', pic: { type: 'card', id: 'v-country', label: 'the world' }, options: [{ text: 'I am from Spain. I am Spanish.', pic: { type: 'flag', code: 'es' }, ok: true }, { text: 'I am from Italy. I am Italian.', pic: { type: 'flag', code: 'it' }, hint: 'Ava is from Spain. Look at the red and yellow flag.' }, { text: 'I am from Brazil. I am Brazilian.', pic: { type: 'flag', code: 'br' }, hint: 'Ava is from Spain. Look at the red and yellow flag.' }] },
        { ask: 'Your member number is four hundred twenty-seven!', pic: { type: 'letters', text: '427' }, options: [{ text: 'Sorry, can you say it again?', pic: { type: 'card', id: 'v-again', label: 'say it again' }, ok: true }, { text: 'I am four hundred twenty-seven.', pic: { type: 'card', id: 'v-me', label: 'me' }, hint: 'Ava did not hear well. What can she ask?' }, { text: 'My name is Spain.', pic: { type: 'card', id: 'v-name', label: 'a name tag' }, hint: 'Ava did not hear well. What can she ask?' }] },
        { ask: 'Four hundred… twenty-seven.', pic: { type: 'letters', text: '427' }, options: [{ text: 'My number is four hundred twenty-seven.', ok: true }, { text: 'I am four hundred twenty-seven.', hint: 'For a number we say: My number is…' }, { text: 'Four hundred twenty-seven name.', hint: 'Start with: My number is…' }] },
      ],
      hints: ['Read the three choices. Which one sounds right and answers the question?'],
    },
{ id: 'memory', kind: 'memory', part: 4, bg: 'border-control', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [3], prompt: 'Memory! Find each flag and its nationality word.', pairs: [{ flag: 'es', text: 'Spanish' }, { flag: 'it', text: 'Italian' }, { flag: 'br', text: 'Brazilian' }, { flag: 'fr', text: 'French' }], hints: ['Remember where the flags are. Spain is red and yellow.'] },
{
      id: 'detective', kind: 'findwrong', part: 4, bg: 'detective-wall', actors: [{ who: 'Vee', pos: 'left', expr: 'thinking' }], trains: [1],
      prompt: 'Detective time! The fake profile of Sam has 2 spelling mistakes. Tap them.',
      rows: [
        { label: 'Name', text: 'S-A-N', wrong: true, fix: 'S-A-M' },
        { label: 'Age', text: '13' },
        { label: 'Country', text: 'Spian', wrong: true, fix: 'Spain' },
        { label: 'Nationality', text: 'Spanish' },
        { label: 'Number', text: 'four hundred twenty-seven' },
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
        { text: 'And your number?', pic: { type: 'letters', text: '427' }, reply: 'My number is four hundred twenty-seven.', extra: ['name'], tilePics: { four: { type: 'letters', text: '400' }, hundred: { type: 'letters', text: '100' }, 'twenty-seven.': { type: 'letters', text: '27' } } },
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
        { who: 'Ava', text: 'I am Spanish. My number is four hundred twenty-seven.', keys: ['Spanish', 'four', 'twenty-seven'] },
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
