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
    { id: 'title', kind: 'title', bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'center', expr: 'wave' }], heading: 'Sign Me Up', sub: 'Case file #2 · the club desk' },
    {
      id: 'brief', kind: 'brief', bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }],
      say: 'Welcome back! Today you win three stamps at the club desk.', heading: 'Your mission card',
      stamps: [{ id: 'spell', icon: '🔤', label: 'Spell your name' }, { id: 'number', icon: '🔢', label: 'Say your number' }, { id: 'passport', icon: '🛂', label: 'Say your nationality' }],
    },
    { id: 'badge', kind: 'badge', bg: 'club-signup-desk', actors: [{ who: 'Theo', pos: 'right', expr: 'wave' }], trains: [4], prompt: 'Theo gives you a badge. Put your name on it.', starter: 'My name is', hints: ['Type only your name, or a nickname.'] },
    {
      id: 'whosaid', kind: 'whosaid', bg: 'club-signup-desk', actors: [{ who: 'Ava', pos: 'left', expr: 'happy' }, { who: 'Theo', pos: 'right', expr: 'happy' }], trains: [4],
      replayTitle: 'Remember last time? Ava signed up with Theo…',
      replay: [{ who: 'Theo', text: 'What is your name?' }, { who: 'Ava', text: 'My name is Ava.' }, { who: 'Theo', text: 'How old are you?' }, { who: 'Ava', text: 'I am 13.' }],
      prompt: 'Who said it? Drag each bubble to Ava or Theo.',
      items: [{ text: 'What is your name?', who: 'Theo' }, { text: 'My name is Ava.', who: 'Ava' }, { text: 'How old are you?', who: 'Theo' }, { text: 'I am 13.', who: 'Ava' }],
      hints: ['Questions come from Theo at the desk. Answers come from Ava.'],
    },
    { id: 'lockers', kind: 'lockers', bg: 'locker-hall', actors: [{ who: 'Vee', pos: 'right', expr: 'happy' }], trains: [2], prompt: 'Locker Pop! Read the number word and open that locker.', rounds: [4, 7, 2, 9, 5, 10], words: WORDS, hints: ['Count the numbers on the doors. Four is 4.'] },
    { id: 'numtrain', kind: 'numtrain', bg: 'locker-hall', actors: [{ who: 'Theo', pos: 'left', expr: 'happy' }], trains: [2], prompt: 'Number Train! Put each number word on its carriage.', numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], words: WORDS, hints: ['Look at the dots on the carriage. Count them.'] },
    {
      id: 'padlock', kind: 'padlock', bg: 'locker-hall', actors: [{ who: 'Theo', pos: 'right', expr: 'wave' }], trains: [2],
      prompt: 'Theo says your member number. Open the drawer with the code!', clue: 'four, two, seven', code: '427', reward: 'Your member number is 4-2-7.', stamp: 'number',
      hints: ['First word: four → 4.', 'Four = 4, two = 2, seven = 7. Turn the dials to 4 2 7.'],
    },
    {
      id: 'convo', kind: 'convo', bg: 'club-signup-desk', actors: [{ who: 'Ava', pos: 'left', expr: 'happy' }, { who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 4, 5],
      prompt: 'Help Ava sign up. Choose what Ava says.', me: 'Ava', after: 'Ava is on the list! Read the whole conversation out loud with your teacher.',
      steps: [
        { ask: 'Hi! Welcome to the desk. What is your name?', options: [{ text: 'My name is Ava.', ok: true }, { text: 'I am name Ava.', hint: 'Start with: My name is…' }, { text: 'Name my Ava is.', hint: 'The words are in the wrong order.' }] },
        { ask: 'How do you spell it?', options: [{ text: 'A-V-A.', ok: true }, { text: 'Ava.', hint: 'Spell it: say the letters one by one.' }, { text: 'It is Ava.', hint: 'Spell it: say the letters one by one.' }] },
        { ask: 'How old are you?', options: [{ text: 'I am 13.', ok: true }, { text: 'I have 13.', hint: 'We say: I am + age.' }, { text: '13 am I.', hint: 'The words are in the wrong order.' }] },
        { ask: 'Where are you from?', options: [{ text: 'I am from Spain. I am Spanish.', ok: true }, { text: 'I am from Spanish.', hint: 'Country: Spain. Nationality: Spanish.' }, { text: 'I from Spain.', hint: 'We need am: I am from Spain.' }] },
        { ask: 'Your member number is four two seven!', options: [{ text: 'Sorry, can you say it again?', ok: true }, { text: 'I am four, two, seven.', hint: 'Ava did not hear well. What can she ask?' }, { text: 'My name is Spain.', hint: 'Ava did not hear well. What can she ask?' }] },
        { ask: 'Four… two… seven.', options: [{ text: 'My number is four, two, seven.', ok: true }, { text: 'I am four, two, seven.', hint: 'For a number we say: My number is…' }, { text: 'Four, two, seven name.', hint: 'Start with: My number is…' }] },
      ],
      hints: ['Read the three choices. Which one sounds right and answers the question?'],
    },
    { id: 'spell-ava', kind: 'spell', bg: 'club-signup-desk', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1], prompt: 'Spell Ava’s name. Drag each letter onto the badge.', target: 'AVA', hints: ['Start with the first letter on the badge: A.'] },
    {
      id: 'detective', kind: 'findwrong', bg: 'detective-wall', actors: [{ who: 'Vee', pos: 'left', expr: 'thinking' }], trains: [1],
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
    { id: 'spell-me', kind: 'spell', bg: 'club-signup-desk', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1], prompt: 'Now spell YOUR name on the badge.', target: '{name}', save: 'spelled', stamp: 'spell', hints: ['Look at the letters of your name on the badge.'] },
    {
      id: 'border', kind: 'border', bg: 'border-control', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [3],
      prompt: 'Border control! Drag each traveller onto the right passport.',
      rounds: [
        { flag: 'es', says: 'I am from Spain.', answer: 'Spanish', options: ['Spanish', 'Italian', 'Brazilian'] },
        { flag: 'it', says: 'I am from Italy.', answer: 'Italian', options: ['Spanish', 'Italian', 'Brazilian'] },
        { flag: 'br', says: 'I am from Brazil.', answer: 'Brazilian', options: ['Spanish', 'Italian', 'Brazilian'] },
        { flag: 'it', says: 'I am from Italy.', answer: 'Italian', options: ['Italian', 'Spanish', 'Brazilian'] },
        { flag: 'es', says: 'I am from Spain.', answer: 'Spanish', options: ['Brazilian', 'Italian', 'Spanish'] },
      ],
      stamp: 'passport', hints: ['Spain → Spanish. Italy → Italian. Brazil → Brazilian.'],
    },
    { id: 'memory', kind: 'memory', bg: 'border-control', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [3], prompt: 'Memory! Find each flag and its nationality word.', pairs: [{ flag: 'es', text: 'Spanish' }, { flag: 'it', text: 'Italian' }, { flag: 'br', text: 'Brazilian' }], hints: ['Remember where the flags are. Spain is red and yellow.'] },
    {
      id: 'phonechat', kind: 'phonechat', bg: 'club-lobby', actors: [{ who: 'Ava', pos: 'left', expr: 'happy' }], trains: [2, 3],
      prompt: 'Theo texts you! Build your replies with the word tiles.', contact: 'Theo',
      steps: [
        { text: 'Hi! Where are you from?', reply: 'I am from Spain.', extra: ['for', 'Spanish'] },
        { text: 'Cool! What is your nationality?', reply: 'I am Spanish.', extra: ['from', 'Spain'] },
        { text: 'And your number?', reply: 'My number is four, two, seven.', extra: ['name'] },
      ],
      hints: ['Answer the question Theo asks. Tap the first word of your reply.'],
    },
    {
      id: 'fade', kind: 'fade', bg: 'club-stage', actors: [{ who: 'Ava', pos: 'left', expr: 'music' }, { who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 4, 5],
      prompt: 'Backstage rehearsal! Say the lines again and again, with less help each round.',
      lines: [
        { who: 'Ava', text: 'Hi! My name is Ava. A-V-A.', keys: ['name', 'Ava'] },
        { who: 'Theo', text: 'I am 14. I am from Brazil.', keys: ['14', 'Brazil'] },
        { who: 'Ava', text: 'I am Spanish. My number is four, two, seven.', keys: ['Spanish', 'four', 'seven'] },
        { who: 'Theo', text: 'Sorry, can you say it again?', keys: ['again'] },
      ],
    },
    {
      id: 'card', kind: 'card', bg: 'club-signup-desk', actors: [{ who: 'Vee', pos: 'right', expr: 'happy' }], trains: [3, 4],
      prompt: 'Your turn! Make your club sign-up card, then print it.',
      model: [{ label: 'Age', text: 'I am 13.' }, { label: 'Country', text: 'I am from Spain.' }, { label: 'Nationality', text: 'I am Spanish.' }],
      ages: [11, 12, 13, 14, 15, 16, 17, 18],
      nationalities: ['Spain → Spanish', 'Italy → Italian', 'Brazil → Brazilian', 'Japan → Japanese', 'France → French', 'USA → American'],
      hints: ['Not in the list? Ask your teacher or write it your way.'],
    },
    {
      id: 'say', kind: 'say', bg: 'club-stage', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 4, 5],
      prompt: 'Final scene! Sign up at the desk. Say it all. If Theo is too fast, ask him again.',
      model: 'My name is {name}. {spelled}. I am {age}. I am from {country}. I am {nationality}. My number is {numw}. Can you say it again?',
    },
    { id: 'wrap', kind: 'wrap', bg: 'club-lobby', actors: [{ who: 'Vee', pos: 'left', expr: 'thumbs' }], heading: 'Mission complete?', ticks: CRITERIA, homework: 'Homework: spell your name to one friend today. Not yet is okay!', clue: 'Clue 2 of 8: In the fake profile, Sam’s name is spelled S-A-N. That is not right! Sam is S-A-M.' },
  ],
};
