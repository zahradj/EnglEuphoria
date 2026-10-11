// Daily 10 for A1-S01-E2 "Sign Me Up": 4 chests, 3 recall-only games each. Items = the lesson's 14 words + frames. No teaching, no models.
import type { Chest } from './quest';

const WORDS: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten' };
const hw = { part: 3 } as const;

export const LESSON_ID = 'A1-S01-E2';
export const GUIDE = { who: 'Vee', expr: 'happy' } as const;

const RAW: Chest[] = [
  {
    id: 1, title: 'Day 1: numbers', gapDays: 1,
    slides: [
      { id: 'q1-shadow', kind: 'shadow', ...hw, bg: 'locker-hall', items: ['one', 'two', 'three', 'four', 'five'], prompt: 'Shadow match! Which number is hiding?', rounds: [1, 3, 5, 2, 4].map((n) => ({ art: { type: 'count' as const, n }, answer: WORDS[n], options: [WORDS[n], WORDS[(n % 5) + 1], WORDS[((n + 1) % 5) + 1]] })) },
      { id: 'q1-lockers', kind: 'lockers', ...hw, bg: 'locker-hall', items: ['one', 'two', 'three', 'four', 'five'], prompt: 'Locker Pop! Read the word and open the locker.', rounds: [3, 5, 1, 4, 2], grid: [1, 2, 3, 4, 5], words: WORDS },
      { id: 'q1-hunt', kind: 'hunt', ...hw, bg: 'locker-hall', items: ['one', 'three', 'five', 'two'], prompt: 'Find the hidden numbers!', targets: [{ word: 'three', n: 3, x: 48, y: 74 }, { word: 'five', n: 5, x: 82, y: 38 }, { word: 'two', n: 2, x: 47, y: 24 }], decoys: [{ n: 4, x: 28, y: 66 }, { n: 1, x: 70, y: 60 }] },
    ],
  },
  {
    id: 2, title: 'Day 3: nationalities', gapDays: 2,
    slides: [
      { id: 'q2-shadow', kind: 'shadow', ...hw, bg: 'border-control', items: ['Spanish', 'Italian', 'Brazilian', 'French', 'German', 'Japanese'], prompt: 'Shadow match! Which nationality is hiding?', rounds: [{ art: { type: 'person', code: 'es' }, answer: 'Spanish', options: ['Spanish', 'Italian', 'French'] }, { art: { type: 'person', code: 'br' }, answer: 'Brazilian', options: ['Italian', 'Brazilian', 'German'] }, { art: { type: 'person', code: 'fr' }, answer: 'French', options: ['Japanese', 'Spanish', 'French'] }, { art: { type: 'person', code: 'de' }, answer: 'German', options: ['German', 'Brazilian', 'Italian'] }, { art: { type: 'person', code: 'jp' }, answer: 'Japanese', options: ['French', 'Japanese', 'Spanish'] }, { art: { type: 'person', code: 'it' }, answer: 'Italian', options: ['Brazilian', 'German', 'Italian'] }] },
      { id: 'q2-border', kind: 'border', ...hw, bg: 'border-control', items: ['Spain', 'Spanish', 'France', 'French', 'Germany', 'German'], prompt: 'Border control! Drag each traveller onto the right passport.', flags: { Spanish: 'es', Italian: 'it', Brazilian: 'br', French: 'fr', German: 'de', Japanese: 'jp', American: 'us' }, rounds: [{ flag: 'it', says: 'I am from Italy.', answer: 'Italian', options: ['Spanish', 'Italian', 'Brazilian'] }, { flag: 'fr', says: 'I am from France.', answer: 'French', options: ['French', 'Italian', 'Japanese'] }, { flag: 'de', says: 'I am from Germany.', answer: 'German', options: ['Brazilian', 'German', 'Spanish'] }, { flag: 'jp', says: 'I am from Japan.', answer: 'Japanese', options: ['Italian', 'Spanish', 'Japanese'] }, { flag: 'es', says: 'I am from Spain.', answer: 'Spanish', options: ['American', 'Spanish', 'French'] }], stamp: 'passport' },
      { id: 'q2-memory', kind: 'memory', ...hw, bg: 'border-control', items: ['Spanish', 'Italian', 'Brazilian', 'French', 'German', 'Japanese'], prompt: 'Memory! Find each flag and its nationality word.', pairs: [{ flag: 'br', text: 'Brazilian' }, { flag: 'it', text: 'Italian' }, { flag: 'es', text: 'Spanish' }, { flag: 'fr', text: 'French' }, { flag: 'de', text: 'German' }, { flag: 'jp', text: 'Japanese' }] },
    ],
  },
  {
    id: 3, title: 'Day 7: numbers to 100 and spelling', gapDays: 4,
    slides: [
      { id: 'q3-big', kind: 'shadow', ...hw, bg: 'locker-hall', items: ['twenty', 'thirty', 'forty', 'sixty', 'one hundred'], prompt: 'Shadow match! Rows of ten: which number is hiding?', rounds: [{ n: 20, a: 'twenty' }, { n: 40, a: 'forty' }, { n: 100, a: 'one hundred' }, { n: 30, a: 'thirty' }, { n: 60, a: 'sixty' }].map(({ n, a }) => ({ art: { type: 'count' as const, n }, answer: a, options: [a, ...['twenty', 'thirty', 'forty', 'sixty', 'one hundred'].filter((w) => w !== a).slice(0, 2)] })) },
      { id: 'q3-numtrain', kind: 'numtrain', ...hw, bg: 'locker-hall', items: ['six', 'seven', 'eight', 'nine', 'ten'], prompt: 'Number Train! Put each word on its carriage.', numbers: [6, 7, 8, 9, 10], words: WORDS },
      { id: 'q3-spell', kind: 'spell', ...hw, bg: 'club-signup-desk', items: ['spell', 'letters'], prompt: 'Spell Sam’s name on the badge.', target: 'SAM' },
      { id: 'q3-chat', kind: 'phonechat', ...hw, bg: 'club-lobby', items: ['I am from', 'I am', 'My number is'], prompt: 'Theo texts you! Build your replies.', contact: 'Theo', steps: [{ text: 'Where are you from?', reply: 'I am from Italy.', extra: ['for', 'Italian'], tilePics: { 'Italy.': { type: 'flag', code: 'it' }, Italian: { type: 'person', code: 'it' } } }, { text: 'What is your nationality?', reply: 'I am Italian.', extra: ['from', 'Italy'], tilePics: { 'Italian.': { type: 'person', code: 'it' }, Italy: { type: 'flag', code: 'it' } } }, { text: 'And your number?', reply: 'My number is eight, nine, ten.', extra: ['name'] }] },
    ],
  },
  {
    id: 4, title: 'Day 10: classroom words', gapDays: 3,
    slides: [
      { id: 'q5-words', kind: 'shadow', ...hw, bg: 'club-signup-desk', items: ['Listen', 'Look', 'Repeat', 'Click', 'Read', 'Point'], prompt: 'Picture match! Which classroom word is it?', rounds: [['listen', 'Listen', 'Look', 'Read'], ['look', 'Look', 'Point', 'Click'], ['repeat', 'Repeat', 'Listen', 'Read'], ['click', 'Click', 'Repeat', 'Point'], ['read', 'Read', 'Look', 'Listen'], ['point', 'Point', 'Click', 'Repeat']].map(([id, answer, o2, o3]) => ({ art: { type: 'action' as const, id: id as 'listen' }, answer, options: [o2, answer, o3] })) },
      { id: 'q5-talk', kind: 'convo', ...hw, bg: 'club-signup-desk', actors: [{ who: 'Theo', pos: 'left', expr: 'happy' }, { who: 'Vee', pos: 'right', expr: 'happy' }], items: ['Repeat', 'Slowly, please.', 'What does it mean?'], prompt: 'Your teacher talks. Choose the best answer.', me: 'Theo', meLabel: 'You', after: 'Good! You can ask for help.', steps: [{ ask: 'Listen and repeat: My name is Vee.', options: [{ text: 'My name is Vee.', ok: true }, { text: 'Click.', hint: 'Repeat means say it after the teacher.' }, { text: 'Look.', hint: 'Repeat means say it after the teacher.' }] }, { ask: 'Four, two, seven, five, eight!', options: [{ text: 'Slowly, please.', ok: true }, { text: 'I am four.', hint: 'It is too fast. What can you ask?' }, { text: 'Read.', hint: 'It is too fast. What can you ask?' }] }, { ask: 'Do you know “nationality”?', options: [{ text: 'What does it mean?', ok: true }, { text: 'Point.', hint: 'Ask about the word.' }, { text: 'My number is five.', hint: 'Ask about the word.' }] }] },
      { id: 'q5-help', kind: 'shadow', ...hw, bg: 'club-lobby', items: ['Sorry?', 'Slowly, please.', 'I don’t understand.', 'What does it mean?'], prompt: 'Which phrase helps? Match the picture.', rounds: [['sorry', 'Sorry?', 'Slowly, please.', 'I don’t understand.'], ['slow', 'Slowly, please.', 'Sorry?', 'What does it mean?'], ['confused', 'I don’t understand.', 'What does it mean?', 'Sorry?'], ['meaning', 'What does it mean?', 'Slowly, please.', 'I don’t understand.']].map(([id, answer, o2, o3]) => ({ art: { type: 'action' as const, id: id as 'sorry' }, answer, options: [o2, answer, o3] })) },
    ],
  },
  {
    id: 5, title: 'Day 21: the big check', gapDays: 11,
    slides: [
      { id: 'q4-padlock', kind: 'padlock', ...hw, bg: 'locker-hall', items: ['five', 'eight', 'three', 'My number is'], prompt: 'Open the drawer with the code!', clue: 'five, eight, three', code: '583', reward: 'The member number is 5-8-3.' },
      { id: 'q4-detective', kind: 'findwrong', ...hw, bg: 'detective-wall', items: ['spell', 'Italy', 'Italian'], prompt: 'Detective time! This profile has 2 spelling mistakes. Tap them.', rows: [{ label: 'Name', text: 'M-A-R-C-O' }, { label: 'Country', text: 'Itlay', wrong: true, fix: 'Italy' }, { label: 'Nationality', text: 'Italan', wrong: true, fix: 'Italian' }, { label: 'Number', text: 'five, eight, three' }], reveal: 'Found them! Italy and Italian.' },
      { id: 'q4-convo', kind: 'convo', ...hw, bg: 'club-signup-desk', actors: [{ who: 'Theo', pos: 'left', expr: 'happy' }, { who: 'Vee', pos: 'right', expr: 'happy' }], items: ['How do you spell it?', 'Can you say it again?', 'I am from', 'My number is'], prompt: 'Help Marco sign up. Choose what Marco says.', me: 'Theo', meLabel: 'Marco', after: 'Marco is on the list!', steps: [{ ask: 'How do you spell it?', options: [{ text: 'M-A-R-C-O.', ok: true }, { text: 'It is Marco.', hint: 'Say the letters one by one.' }, { text: 'Marco.', hint: 'Say the letters one by one.' }] }, { ask: 'Where are you from?', options: [{ text: 'I am from Italy. I am Italian.', ok: true, pic: { type: 'flag', code: 'it' } }, { text: 'I am from Spain. I am Spanish.', hint: 'Marco is from Italy: look at the flag.', pic: { type: 'flag', code: 'es' } }, { text: 'I am from Brazil. I am Brazilian.', hint: 'Marco is from Italy: look at the flag.', pic: { type: 'flag', code: 'br' } }] }, { ask: 'Your number is five, eight, three!', options: [{ text: 'Sorry, can you say it again?', ok: true }, { text: 'I am five, eight, three.', hint: 'Marco did not hear well. What can he ask?' }, { text: 'My name is Italy.', hint: 'Marco did not hear well. What can he ask?' }] }] },
    ],
  },
];

/** every game gets the guide (Vee) at the side unless it names its own cast */
export const SIGN_ME_UP_QUEST: Chest[] = RAW.map((c) => ({ ...c, slides: c.slides.map((s, i) => ({ ...s, actors: s.actors ?? [{ who: GUIDE.who, pos: i % 2 ? 'right' : 'left', expr: GUIDE.expr }] })) as Chest['slides'] }));
