// A1-S01-E2 "Sign Me Up" (Word Lab) — lesson script. Academy cast only. Built with .claude/skills/academy-lesson-craft.
// Plan, objective, criteria, route and alignment: docs/academy-a1s01e2-spec.md. Research: docs/research/academy-a1s01e2-research.md.
// Blueprint items (14, core-productive): one … ten, Spain, Spanish, Italy, Italian. Blueprint stack: L2 = L1 + new (the Check-in recall,
// the Mission and the Release reuse lesson 1: name, age, country, "How old are you?").
// Owner stages as in lesson 1: learn the words · read the story · practise (match / spell) · complete the conversation · say it by heart · introduce yourself.
// Run of show (blueprint): Check-in 0 · Remember? 1 · The Drop 2 · Notice & Build 3 · Energiser 4 · Mission 5 · Release 6 · Wrap 7.
// No voice clips exist yet: every line is silent; "I said it" is the student's own word (a live teacher hears it).
import type { Beat, FlashCard, SceneScript } from '../scriptTypes';

/** The objective: one observable performance (CEFR A1: "can give personal details and spell their name"). */
export const OBJECTIVE = 'By the end I can sign up at the club desk: spell my name, say my country and nationality, say my member number, and ask someone to say it again.';
/** Success criteria = the Wrap tick-list. */
export const CRITERIA = [
  'I spelled my name: M-I-N-A.',
  'I said my number: My number is four, two, seven.',
  'I said my country and nationality: I am Spanish.',
  'I said my name and age.',
  'I asked for help: Can you say it again?',
] as const;
/** The 14 blueprint words of this lesson (each a picture card). */
export const INVENTORY = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'Spain', 'Spanish', 'Italy', 'Italian'] as const;
/** The frames the exit task uses. Each must be practised at least 3 times (see the tests). */
export const EXIT_FRAMES = ['my name is', 'i am from', 'i am', 'my number is', 'how do you spell it', 'can you say it again'] as const;
/** Words the frames use that are not in the 14 (taught in the story and the practice as chunks, shown with a gloss). */
export const FRAME_WORDS = ['spell', 'number', 'member', 'sign', 'desk', 'nationality', 'again', 'letters', 'letter'] as const;

const card = (word: string, chunk: string, meaning: string, pictureId: string, alt: string, ask: string, clue: string): FlashCard => ({ word, chunk, meaning, pictureId, alt, ask, clue });

const NUMS: [string, string][] = [['one', '1'], ['two', '2'], ['three', '3'], ['four', '4'], ['five', '5'], ['six', '6'], ['seven', '7'], ['eight', '8'], ['nine', '9'], ['ten', '10']];
const numCard = (word: string, digit: string) => card(word, `My number is ${word}.`, `the number ${digit}`, `num-${digit}`, `The number ${digit}: ${digit} dots`, `What is ${word}?`, `It is the number ${digit}. Count the dots: ${digit}.`);

const NATIONS: FlashCard[] = [
  card('Spain', 'I am from Spain.', 'a country', 'flag-es', 'The flag of Spain: red, yellow, red', 'What is Spain?', 'It is a country. It has a red and yellow flag.'),
  card('Spanish', 'I am Spanish.', 'a person from Spain', 'who-es', 'A person holding the flag of Spain', 'What is Spanish?', 'It is the nationality of a person from Spain. I am from Spain. I am Spanish.'),
  card('Italy', 'I am from Italy.', 'a country', 'flag-it', 'The flag of Italy: green, white, red', 'What is Italy?', 'It is a country. It has a green, white and red flag.'),
  card('Italian', 'I am Italian.', 'a person from Italy', 'who-it', 'A person holding the flag of Italy', 'What is Italian?', 'It is the nationality of a person from Italy. I am from Italy. I am Italian.'),
];

/** Drag & drop after each set of words: drag the word onto its picture. */
const drag = (pairs: { word: string; pic: string; alt: string }[]): Beat => ({
  t: 'match',
  drag: true,
  prompt: 'Drag each word onto its picture.',
  pairs: pairs.map((p) => ({ left: p.word, right: p.word, leftPicture: { id: p.pic, alt: p.alt } })),
});

export const A1S01E2: SceneScript = {
  lessonId: 'A1-S01-E2',
  level: 'A1',
  title: 'Sign Me Up',
  cast: ['Vee', 'Ava', 'Theo'],
  beats: [
    // ── Check-in (5 min): hello, today's goal, and a quick Remember? of lesson 1 ───────────────────
    { t: 'segment', index: 0 },
    { t: 'trains', criteria: [0] },
    { t: 'bg', id: 'club-signup-desk', alt: 'The club sign-up desk with name badges, a laptop and a clipboard' },
    { t: 'show', who: 'Vee', pos: 'center', expr: 'wave' },
    { t: 'say', who: 'Vee', expr: 'wave', text: 'Hello again! Today we sign up at the club desk.', gloss: { sign: 'put your name on the list', desk: 'a table where people help you' } },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Your goal: spell your name and say your number.', gloss: { goal: 'what you want to do at the end', spell: 'say the letters of a word: M-I-N-A', number: 'a word like one, two, three' } },
    { t: 'say', who: 'Vee', expr: 'thumbs', text: 'First, a quick Remember? from last time.' },
    { t: 'trains', criteria: [4] },
    {
      t: 'form',
      prompt: 'Remember? Say who you are. Follow the model.',
      model: {
        title: 'Model: Ava answers',
        style: 'talk',
        lines: [
          { who: 'Theo', text: 'What is your name?' },
          { who: 'Ava', text: 'My name is Ava.' },
          { who: 'Theo', text: 'How old are you?' },
          { who: 'Ava', text: 'I am 13.' },
        ],
      },
      fields: [
        { key: 'name', label: 'What is your name?', kind: 'text', starter: 'My name is', placeholder: 'your name', clue: 'Type only your name. We add the rest.' },
        { key: 'age', label: 'How old are you?', kind: 'choice', starter: 'I am', options: ['11', '12', '13', '14', '15', '16', '17', '18'] },
      ],
    },
    { t: 'hide', who: 'Vee' },
    { t: 'show', who: 'Ava', pos: 'left', expr: 'wave' },
    { t: 'show', who: 'Theo', pos: 'right', expr: 'wave' },
    { t: 'say', who: 'Theo', expr: 'wave', text: 'Hi, {name}! I am Theo. I work at the desk.', key: ['desk'] },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'And I am Ava. I am here to sign up too!' },
    {
      t: 'cloze',
      prompt: 'Remember? Complete the conversation from last time.',
      lines: [
        { who: 'Ava', text: 'Hi! My {{name}} is Ava. How {{old}} are you?' },
        { who: 'Theo', text: 'I {{am}} 14. Where are you {{from}}?' },
      ],
      bank: ['name', 'old', 'am', 'from', 'like'],
    },
    { t: 'hide', who: 'Ava' },
    { t: 'hide', who: 'Theo' },
    { t: 'set', key: 'num', value: '4-2-7' },
    { t: 'set', key: 'numw', value: 'four, two, seven' },

    // ── Remember? slot = 1. Learn the words: numbers 1-10 and two countries, each set matched by drag & drop ─
    { t: 'segment', index: 1 },
    { t: 'trains', criteria: [2, 3] },
    { t: 'bg', id: 'club-signup-desk', alt: 'The club sign-up desk' },
    { t: 'show', who: 'Vee', pos: 'center', expr: 'happy' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Meet 14 words: numbers, and two countries.' },
    ...[NUMS.slice(0, 4), NUMS.slice(4, 7), NUMS.slice(7)].flatMap((set, k): Beat[] => [
      { t: 'flash', title: ['Numbers 1 to 4', 'Numbers 5 to 7', 'Numbers 8 to 10'][k], noCheck: true, cards: set.map(([w, d]) => numCard(w, d)) },
      drag(set.map(([w, d]) => ({ word: w, pic: `num-${d}`, alt: `The number ${d}` }))),
    ]),
    { t: 'flash', title: 'Countries and people', noCheck: true, cards: NATIONS },
    drag(NATIONS.map((c) => ({ word: c.word, pic: c.pictureId, alt: c.alt }))),

    // ── The Drop = 2. Read the story: Ava signs up at the desk; every line is read, then said ────────
    { t: 'segment', index: 2 },
    { t: 'trains', criteria: [1, 2, 3, 4, 5] },
    { t: 'layout', mode: 'story' },
    { t: 'bg', id: 'club-signup-desk', alt: 'The club sign-up desk: Ava signs up, Theo helps her' },
    { t: 'hide', who: 'Vee' },
    { t: 'show', who: 'Ava', pos: 'left', expr: 'happy' },
    { t: 'show', who: 'Theo', pos: 'right', expr: 'wave' },
    { t: 'say', who: 'narrator', text: 'Ava is at the sign-up desk. Read each line, then say it.' },
    { t: 'say', who: 'Theo', expr: 'wave', text: 'Hi! Welcome to the desk. What is your name?' },
    { t: 'say', who: 'Ava', expr: 'wave', text: 'My name is Ava.', key: ['name'], repeat: true },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'How do you spell it?', key: ['spell'], repeat: true },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'A-V-A.', repeat: true },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'How old are you?', repeat: true },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'I am 13.', key: ['am'], repeat: true },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'Where are you from?', repeat: true },
    { t: 'say', who: 'Ava', expr: 'music', text: 'I am from Spain. I am Spanish.', key: ['Spain', 'Spanish'], repeat: true },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'Great! Your member number is four, two, seven.', key: ['member', 'number'] },
    { t: 'say', who: 'Ava', expr: 'curious', text: 'Sorry, can you say it again?', key: ['again'], repeat: true },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'Four... two... seven.' },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'My number is four, two, seven.', key: ['number'], repeat: true },
    { t: 'say', who: 'Theo', expr: 'wave', text: 'Perfect! Welcome to the club, Ava.' },
    { t: 'say', who: 'Ava', expr: 'curious', text: 'Theo, where are you from?', repeat: true },
    { t: 'say', who: 'Theo', expr: 'football', text: 'I am from Brazil. I am Brazilian.', repeat: true },
    {
      t: 'choice',
      prompt: 'How does Ava spell her name?',
      tests: 'story',
      options: [
        { text: 'A-V-A', correct: true },
        { text: 'A-V-E', correct: false },
        { text: 'E-V-A', correct: false },
      ],
    },
    {
      t: 'choice',
      prompt: 'What is Ava’s member number?',
      tests: 'story',
      options: [
        { text: 'Seven, two, four', correct: false },
        { text: 'Four, two, seven', correct: true },
        { text: 'Two, four, seven', correct: false },
      ],
    },
    {
      t: 'match',
      prompt: 'Match each question with Ava’s answer.',
      pairs: [
        { left: 'How do you spell it?', right: 'A-V-A' },
        { left: 'How old are you?', right: 'I am 13.' },
        { left: 'Where are you from?', right: 'I am from Spain.' },
      ],
    },
    {
      t: 'choice',
      prompt: 'What does Ava ask Theo to do?',
      tests: 'story',
      options: [
        { text: 'Say it again', correct: true },
        { text: 'Spell her name', correct: false },
        { text: 'Say his age', correct: false },
      ],
    },
    { t: 'layout', mode: 'normal' },

    // ── Notice & Build = 3. Practise: spell, numbers, countries and nationalities; 4. complete the conversation ───
    { t: 'segment', index: 3 },
    { t: 'trains', criteria: [1, 5] },
    { t: 'bg', id: 'club-signup-desk', alt: 'The club sign-up desk' },
    { t: 'hide', who: 'Ava' },
    { t: 'hide', who: 'Theo' },
    { t: 'show', who: 'Vee', pos: 'center', expr: 'happy' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Now practise. First, spell names with letter tiles.' },
    { t: 'spell', prompt: 'Spell Ava’s name. Drag each letter onto the badge.', target: 'AVA' },
    { t: 'spell', prompt: 'Now spell Theo’s name.', target: 'THEO' },
    {
      t: 'choice',
      prompt: 'S-A-M. Who is it?',
      tests: 'language',
      options: [
        { text: 'Sam', correct: true },
        { text: 'Mas', correct: false },
        { text: 'Sim', correct: false },
      ],
    },
    { t: 'spell', prompt: 'Now spell YOUR name.', target: '{name}', save: 'spelled' },
    { t: 'say', who: 'Vee', expr: 'thumbs', text: 'Nice! Say your letters out loud: {spelled}.', repeat: true },
    { t: 'trains', criteria: [2] },
    {
      t: 'choice',
      prompt: 'Read the number: 6-9-4. Which is right?',
      tests: 'language',
      options: [
        { text: 'Nine, six, four', correct: false },
        { text: 'Six, nine, four', correct: true },
        { text: 'Six, four, nine', correct: false },
      ],
    },
    {
      t: 'choice',
      prompt: 'Read the number: 8-3-5. Which is right?',
      tests: 'language',
      options: [
        { text: 'Eight, three, five', correct: true },
        { text: 'Eight, five, three', correct: false },
        { text: 'Three, eight, five', correct: false },
      ],
    },
    { t: 'build', prompt: 'Build: My number is four, two, seven.', target: 'My number is four, two, seven.', extraTiles: ['nine', 'six'], hint: 'Start with: My number is…' },
    { t: 'trains', criteria: [3] },
    {
      t: 'match',
      prompt: 'Match each country with its nationality.',
      pairs: [
        { left: 'Spain', right: 'Spanish', leftPicture: { id: 'flag-es', alt: 'The flag of Spain' } },
        { left: 'Italy', right: 'Italian', leftPicture: { id: 'flag-it', alt: 'The flag of Italy' } },
        { left: 'Brazil', right: 'Brazilian', leftPicture: { id: 'flag-br', alt: 'The flag of Brazil' } },
      ],
    },
    {
      t: 'choice',
      prompt: 'Spain → Spanish. Italy → Italian. So Brazil → ?',
      tests: 'language',
      options: [
        { text: 'Brazilian', correct: true },
        { text: 'Brazilish', correct: false },
        { text: 'Brazilan', correct: false },
      ],
    },
    { t: 'build', prompt: 'Build: I am from Spain. I am Spanish.', target: 'I am from Spain. I am Spanish.', extraTiles: ['Italian'], hint: 'First where you are from, then who you are.' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Now complete the conversation from the story.' },
    { t: 'trains', criteria: [1, 4, 5] },
    {
      t: 'cloze',
      prompt: 'Complete the conversation. Tap a word for each gap.',
      lines: [
        { who: 'Theo', text: 'What is your {{name}}?' },
        { who: 'Ava', text: 'My name is Ava.' },
        { who: 'Theo', text: 'How do you {{spell}} it?' },
        { who: 'Ava', text: 'A-V-A. I {{am}} 13.' },
      ],
      bank: ['name', 'spell', 'am', 'from', 'old'],
    },
    { t: 'trains', criteria: [2, 3, 5] },
    {
      t: 'cloze',
      prompt: 'Complete the conversation. Tap a word for each gap.',
      lines: [
        { who: 'Theo', text: 'Where are you {{from}}?' },
        { who: 'Ava', text: 'I am from Spain. I am {{Spanish}}.' },
        { who: 'Theo', text: 'Your {{number}} is four, two, seven.' },
        { who: 'Ava', text: 'Sorry, can you say it {{again}}?' },
      ],
      bank: ['from', 'Spanish', 'number', 'again', 'Italian'],
    },
    { t: 'build', prompt: 'Build the question: How do you spell it?', target: 'How do you spell it?', extraTiles: ['old'], hint: 'It starts with: How do…' },

    // ── Energiser: a quick game (odd one out, spot the mistake, numbers, letters) ───────────────
    { t: 'segment', index: 4 },
    { t: 'trains', criteria: [3] },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Quick game! Find the odd one out.' },
    {
      t: 'choice',
      prompt: 'Which one is NOT a nationality?',
      tests: 'language',
      options: [
        { text: 'Spanish', correct: false },
        { text: 'Italian', correct: false },
        { text: 'Spain', correct: true },
      ],
    },
    {
      t: 'choice',
      prompt: 'Which line is right?',
      tests: 'language',
      options: [
        { text: 'I am from Italy.', correct: true },
        { text: 'I am for Italy.', correct: false },
        { text: 'I from Italy.', correct: false },
      ],
    },
    { t: 'trains', criteria: [2] },
    {
      t: 'match',
      prompt: 'Match the numbers with the words.',
      pairs: [
        { left: '3', right: 'three' },
        { left: '5', right: 'five' },
        { left: '8', right: 'eight' },
        { left: '10', right: 'ten' },
      ],
    },
    {
      t: 'choice',
      prompt: 'One, two, three, four, … what is next?',
      tests: 'language',
      options: [
        { text: 'Five', correct: true },
        { text: 'Seven', correct: false },
        { text: 'Ten', correct: false },
      ],
    },
    { t: 'trains', criteria: [1] },
    { t: 'spell', prompt: 'Spell Sam’s name.', target: 'SAM' },
    {
      t: 'choice',
      prompt: 'A, B, C, D, … which letter is next?',
      tests: 'language',
      options: [
        { text: 'E', correct: true },
        { text: 'G', correct: false },
        { text: 'B', correct: false },
      ],
    },
    { t: 'trains', criteria: [5] },
    {
      t: 'choice',
      prompt: 'You do not hear a word. What do you say?',
      tests: 'language',
      options: [
        { text: 'Sorry, can you say it again?', correct: true },
        { text: 'I am from Spain.', correct: false },
        { text: 'My name is Ava.', correct: false },
      ],
    },

    // ── Mission = 5. Say it by heart: fade the lines, then role-play the sign-up with Theo ─────────
    { t: 'segment', index: 5 },
    { t: 'trains', criteria: [1, 4, 5] },
    { t: 'bg', id: 'club-signup-desk', alt: 'The club sign-up desk' },
    { t: 'show', who: 'Ava', pos: 'left', expr: 'happy' },
    { t: 'show', who: 'Theo', pos: 'right', expr: 'happy' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Now say the lines from memory. Some words are hidden.' },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'Hi! My name is Ava. How do you spell it?', key: ['name', 'spell'], hide: 'keys' },
    { t: 'trains', criteria: [1, 4] },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'T-H-E-O. I am 14. Where are you from?', key: ['am', 'from'], hide: 'keys' },
    { t: 'trains', criteria: [3, 4] },
    { t: 'say', who: 'Ava', expr: 'music', text: 'I am from Spain. I am Spanish.', key: ['Spain', 'Spanish'], hide: 'keys' },
    { t: 'trains', criteria: [2, 5] },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'Sorry, can you say it again? My number is seven.', key: ['again', 'number'], hide: 'keys' },
    { t: 'say', who: 'Vee', expr: 'thumbs', text: 'Now only the first word. Say the whole line.' },
    { t: 'trains', criteria: [1, 4] },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'My name is Ava. A-V-A. I am 13.', hide: 'all' },
    { t: 'trains', criteria: [2, 3] },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'I am Italian. My number is four, two, seven.', hide: 'all' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Now you sign up with Theo. Choose how much help you want.' },
    {
      t: 'choice',
      prompt: 'How much help do you want?',
      tests: 'story',
      options: [
        { text: 'Chill: lots of help', goto: 'chill', set: { dial: 'chill' } },
        { text: 'Normal', goto: 'normal', set: { dial: 'normal' } },
        { text: 'Push: a little help', goto: 'push', set: { dial: 'push' } },
      ],
    },
    { t: 'label', name: 'chill' },
    { t: 'set', key: 'model1', value: 'My name is {name}. {spelled}. I am from ___.' },
    { t: 'jump', label: 'take1' },
    { t: 'label', name: 'normal' },
    { t: 'set', key: 'model1', value: 'My name is {name}. {spelled}. I am ___. I am from ___. I am ___.' },
    { t: 'jump', label: 'take1' },
    { t: 'label', name: 'push' },
    { t: 'set', key: 'model1', value: 'My name is {name}. {spelled}. I am ___. I am from ___. I am ___. My number is ___.' },
    { t: 'label', name: 'take1' },
    { t: 'trains', criteria: [1, 3, 4] },
    { t: 'say', who: 'Theo', expr: 'wave', text: 'Hi! Welcome to the desk. What is your name?' },
    { t: 'record', prompt: 'Take 1: sign up with Theo. Say your name and spell it.', model: '{model1}' },
    { t: 'say', who: 'Vee', expr: 'thumbs', text: 'Good! Now Theo talks fast. Ask him to say it again.' },
    { t: 'trains', criteria: [2, 5] },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'Your member number is four two seven!' },
    { t: 'record', prompt: 'Take 2: ask Theo to say it again. Then say your number.', model: 'Sorry, can you say it again? My number is {numw}. How do you spell it?' },
    { t: 'hide', who: 'Ava' },
    { t: 'hide', who: 'Theo' },

    // ── Release = 6. Introduce yourself: your sign-up card, then say it with the model hidden ───────
    { t: 'segment', index: 6 },
    { t: 'trains', criteria: [3, 4] },
    { t: 'bg', id: 'club-signup-desk', alt: 'The club sign-up desk' },
    { t: 'show', who: 'Vee', pos: 'center', expr: 'happy' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Your turn! Make your club sign-up card.' },
    {
      t: 'form',
      prompt: 'Fill your card. Follow Ava’s model.',
      model: {
        title: 'Model: Ava’s card, and what she says',
        style: 'card',
        lines: [
          { who: 'Age', text: 'I am 13.' },
          { who: 'Country', text: 'I am from Spain.' },
          { who: 'Nation', text: 'I am Spanish.' },
          { who: 'List', text: 'Spain → Spanish · Italy → Italian · Brazil → Brazilian · Japan → Japanese · France → French · USA → American' },
        ],
      },
      fields: [
        { key: 'age', label: 'My age', kind: 'choice', starter: 'I am', options: ['11', '12', '13', '14', '15', '16', '17', '18'] },
        { key: 'country', label: 'My country', kind: 'text', starter: 'I am from', placeholder: 'Brazil', clue: 'Type only the country.' },
        { key: 'nationality', label: 'My nationality', kind: 'text', starter: 'I am', placeholder: 'Brazilian', clue: 'Not in the list? Ask your teacher or type it your way.' },
      ],
    },
    {
      t: 'profile',
      title: 'My club sign-up card',
      prompt: 'This is you. Read your card.',
      rows: [
        { label: 'Name', value: '{name}' },
        { label: 'Letters', value: '{spelled}' },
        { label: 'Age', value: '{age}' },
        { label: 'Country', value: '{country}' },
        { label: 'Nationality', value: '{nationality}' },
        { label: 'Member number', value: '{num}' },
      ],
    },
    { t: 'trains', criteria: [1, 2, 3, 4, 5] },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Now sign up. Do not look at the line. Say it!' },
    { t: 'record', prompt: 'Say your sign-up. If Theo is too fast, ask him again.', model: 'My name is {name}. {spelled}. I am {age}. I am from {country}. I am {nationality}. My number is {numw}. Can you say it again?', hideModel: true },
    { t: 'hide', who: 'Vee' },
    { t: 'show', who: 'Ava', pos: 'left', expr: 'wave' },
    { t: 'show', who: 'Theo', pos: 'right', expr: 'wave' },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'Perfect, {name}! You are on the list.' },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'Welcome to the club, {name}!' },

    // ── Wrap: can-do ticks tied to the criteria, homework, clue ──────────────────────────────
    { t: 'segment', index: 7 },
    { t: 'trains', criteria: [1, 2, 3] },
    { t: 'hide', who: 'Ava' },
    { t: 'hide', who: 'Theo' },
    { t: 'show', who: 'Vee', pos: 'center', expr: 'thumbs' },
    { t: 'ticks', prompt: 'I can...', items: [CRITERIA[0], CRITERIA[1], CRITERIA[2]] },
    { t: 'trains', criteria: [4, 5] },
    { t: 'ticks', prompt: 'I can...', items: [CRITERIA[3], CRITERIA[4]] },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Great work today, {name}! You can spell and count.' },
    { t: 'say', who: 'Vee', expr: 'thumbs', text: 'Homework: spell your name to one friend today. Not yet is okay!' },
    { t: 'end', summary: 'Clue 2 of 8: In the fake profile, Sam’s name is spelled S-A-N. That is not right! Sam is S-A-M. See you next time.' },
  ],
};
