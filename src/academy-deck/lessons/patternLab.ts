// A1-S01-E3 "Fake or Real?" (Pattern Lab) as a game deck. Academy cast only: Vee, Ava, Theo.
// Objective, criteria, exit task, alignment: docs/academy-a1s01e3-spec.md. Research: docs/research/academy-a1s01e3-research.md.
// Structure taught (blueprint): be (am / is / are): statements, questions, negatives. 10 chunks, listed in CHUNKS below.
// Every slide = a scene plate + ONE game; no two neighbouring slides use the same game.
import type { DeckScript } from '../types';

export const OBJECTIVE = 'By the end I can use am, is and are to say who I and other people are, say what is not true, and ask and answer a yes / no question, to check a profile.';
export const CRITERIA = [
  'I said who I am: I am 14. I am from Brazil.',
  'I said who someone else is: She is Italian. He is from Spain.',
  'I said what is not true: I am not Spanish. She is not 15.',
  'I asked a yes / no question: Are you 14? Is she Italian?',
  'I answered a yes / no question: Yes, I am. No, he is not.',
];
/** The 10 new chunks of the blueprint (newItems.count = 10, kind chunks). */
export const CHUNKS = ['I am 14.', 'You are Italian.', 'She is from Italy.', 'He is Spanish.', 'I am not Spanish.', 'She is not 15.', 'Are you 14?', 'Yes, I am.', 'Is he Spanish?', 'No, he is not.'];

export const PATTERN_LAB: DeckScript = {
  lessonId: 'A1-S01-E3',
  level: 'A1',
  title: 'Fake or Real?',
  objective: OBJECTIVE,
  criteria: CRITERIA,
  cast: ['Vee', 'Ava', 'Theo'],
  partGoals: [
    'Say hello and see today’s case',
    'Wake up numbers, names and nationalities',
    'Meet am, is and are, and watch them in use',
    'Practise statements, negatives and questions',
    'A quick game',
    'Choose your help, then check the profile for real',
    'Write about yourself and a friend',
    'What you can do now',
  ],
  slides: [
    // ---------- 0 · Check-in ----------
    { id: 'title', kind: 'title', part: 0, bg: 'detective-wall', actors: [{ who: 'Vee', pos: 'center', expr: 'wave' }], heading: 'Fake or Real?', sub: 'Case file #3 · the profile check' },
    {
      id: 'brief', kind: 'brief', part: 0, bg: 'detective-wall', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }],
      say: 'Welcome back, detective! A fake profile of Ava is online. Today you check the facts.', heading: 'Your case card',
      stamps: [{ id: 'true', icon: 'check', label: 'Say who is who' }, { id: 'not', icon: 'search', label: 'Say what is not true' }, { id: 'ask', icon: 'chat', label: 'Ask and answer' }],
    },
    { id: 'badge', kind: 'badge', part: 0, bg: 'detective-wall', actors: [{ who: 'Theo', pos: 'right', expr: 'wave' }], trains: [1], prompt: 'Theo gives you a detective badge. Put your name on it.', starter: 'My name is', ages: [11, 12, 13, 14, 15, 16, 17, 18], hints: ['Type only your name, and tap your age.'] },
    {
      id: 'checkin-chat', kind: 'convo', part: 0, bg: 'detective-wall', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1],
      prompt: 'Quick questions from Theo. Choose your answers.', me: 'Ava', meLabel: 'You', after: 'Thanks! Now Theo knows his new detective.',
      steps: [
        { ask: 'Hi, {name}! How are you today?', pic: { type: 'card', id: 'v-hello', label: 'hello' }, options: [{ text: 'I am great!', pic: { type: 'card', id: 'v-great', label: 'feeling great' }, ok: true }, { text: 'I am fine.', pic: { type: 'card', id: 'v-fine', label: 'feeling fine' }, ok: true }, { text: 'I am tired.', pic: { type: 'card', id: 'v-tired', label: 'feeling tired' }, ok: true }] },
        { ask: 'How old are you?', pic: { type: 'card', id: 'v-age', label: 'a birthday cake' }, options: [{ text: 'I am 13.', ok: true }, { text: 'I am 15.', ok: true }, { text: 'I am from Italy.', hint: 'Italy is a place. Theo asks about your age.' }] },
        { ask: 'Where are you from?', pic: { type: 'card', id: 'v-country', label: 'the world' }, options: [{ text: 'I am from Brazil.', pic: { type: 'flag', code: 'br' }, ok: true }, { text: 'I am from Spain.', pic: { type: 'flag', code: 'es' }, ok: true }, { text: 'I am 14.', hint: 'Where asks for a place, not an age.' }] },
      ],
      hints: ['There is no wrong answer in the first two. Choose what is true for you.'],
    },

    // ---------- 1 · Remember? (lesson 1-2: names, ages, countries, nationalities, spelling) ----------
    {
      id: 'whosaid', kind: 'whosaid', part: 1, bg: 'club-signup-desk', actors: [{ who: 'Ava', pos: 'left', expr: 'happy' }, { who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1],
      replayTitle: 'Remember last time? Ava signed up at the club desk…',
      replay: [{ who: 'Theo', text: 'How old are you?' }, { who: 'Ava', text: 'I am 14.' }, { who: 'Theo', text: 'Where are you from?' }, { who: 'Ava', text: 'I am from Italy. I am Italian.' }],
      prompt: 'Who said it? Drag each bubble to Ava or Theo.',
      items: [{ text: 'How old are you?', who: 'Theo' }, { text: 'I am 14.', who: 'Ava' }, { text: 'Where are you from?', who: 'Theo' }, { text: 'I am from Italy. I am Italian.', who: 'Ava' }],
      hints: ['Questions come from Theo. Answers come from Ava.'],
    },
    {
      id: 'border', kind: 'border', part: 1, bg: 'border-control', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1],
      prompt: 'Border control! Drag each traveller onto the right passport.',
      rounds: [
        { flag: 'it', says: 'I am from Italy.', answer: 'Italian', options: ['Italian', 'Spanish', 'French'] },
        { flag: 'es', says: 'I am from Spain.', answer: 'Spanish', options: ['Spanish', 'Italian', 'Brazilian'] },
        { flag: 'br', says: 'I am from Brazil.', answer: 'Brazilian', options: ['Japanese', 'Brazilian', 'Spanish'] },
        { flag: 'fr', says: 'I am from France.', answer: 'French', options: ['French', 'Italian', 'American'] },
      ],
      flags: { Spanish: 'es', Italian: 'it', Brazilian: 'br', French: 'fr', Japanese: 'jp', American: 'us' }, hints: ['Spain → Spanish. Italy → Italian. France → French.'],
    },
    { id: 'spell-me', kind: 'spell', part: 1, bg: 'club-signup-desk', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1], prompt: 'Spell YOUR name on the detective badge.', target: '{name}', save: 'spelled', hints: ['Look at the letters of your name on the badge.'] },

    // ---------- 2 · The Drop (meet am / is / are, then watch them used) ----------
    {
      id: 'teach-be', kind: 'teach', part: 2, bg: 'detective-wall', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [1, 2], title: 'Three small words: am, is, are',
      pages: [
        { word: 'I am', art: { type: 'letters', text: 'I AM' }, meaning: 'I = me. With I we always say am.', example: 'I am 14.', clue: 'I → am. Always.' },
        { word: 'You are', art: { type: 'letters', text: 'YOU ARE' }, meaning: 'you = the person I talk to. With you we say are.', example: 'You are Italian.', clue: 'You → are.' },
        { word: 'She is', art: { type: 'person', code: 'it' }, meaning: 'she = a girl or a woman. With she we say is.', example: 'She is from Italy.', clue: 'She → is.' },
        { word: 'He is', art: { type: 'person', code: 'es' }, meaning: 'he = a boy or a man. With he we say is.', example: 'He is Spanish.', clue: 'He → is.' },
      ],
      hints: ['am, is and are are three forms of the same little word. The person decides which one.'],
    },
    {
      id: 'model-fake', kind: 'model', part: 2, bg: 'detective-wall', actors: [{ who: 'Vee', pos: 'left', expr: 'thinking' }, { who: 'Ava', pos: 'center', expr: 'concerned' }, { who: 'Theo', pos: 'right', expr: 'neutral' }], trains: [1, 2, 3, 4, 5],
      title: 'Watch Ava and Theo check the fake profile',
      lines: [
        { who: 'Theo', text: 'The profile says: She is 15. She is Spanish.', frame: ['She ', { slot: 'is', label: 'she → is' }, ' 15.'] },
        { who: 'Ava', text: 'No! I am not 15. I am 14.', frame: ['I ', { slot: 'am', label: 'I → am' }, ' ', { slot: 'not', label: 'false!' }, ' 15.'], note: 'To say it is NOT true, put not after am, is or are.' },
        { who: 'Ava', text: 'I am not Spanish. I am Italian.', pic: { type: 'pair', code: 'it' }, frame: ['I am ', { slot: 'not', label: 'false!' }, ' Spanish.'] },
        { who: 'Theo', text: 'You are 14. You are from Italy.', frame: ['You ', { slot: 'are', label: 'you → are' }, ' 14.'] },
        { who: 'Vee', text: 'Are you from Spain, Ava?', frame: [{ slot: 'Are', label: 'question: are first' }, ' you from Spain?'], note: 'In a question the two words swap places: You are → Are you.' },
        { who: 'Ava', text: 'No, I am not.', frame: ['No, I ', { slot: 'am not', label: 'short answer' }, '.'] },
        { who: 'Vee', text: 'Is he Spanish?', pic: { type: 'pair', code: 'es' }, frame: [{ slot: 'Is', label: 'question: is first' }, ' he Spanish?'], note: 'He is → Is he?' },
        { who: 'Ava', text: 'Yes, he is. He is from Spain.', frame: ['Yes, he ', { slot: 'is', label: 'short answer' }, '.'] },
        { who: 'Vee', text: 'Is he 16?' },
        { who: 'Ava', text: 'No, he is not. He is 15.', frame: ['No, he ', { slot: 'is not', label: 'short answer' }, '.'] },
      ],
      closing: 'Now YOU check the facts!',
    },
    {
      id: 'whosaid-check', kind: 'whosaid', part: 2, bg: 'detective-wall', actors: [{ who: 'Ava', pos: 'left', expr: 'happy' }, { who: 'Theo', pos: 'right', expr: 'happy' }], trains: [2, 3],
      prompt: 'Who said it? Drag each bubble to Ava or Theo.',
      items: [{ text: 'I am not 15.', who: 'Ava' }, { text: 'You are 14.', who: 'Theo' }, { text: 'He is from Spain.', who: 'Ava' }, { text: 'She is Spanish.', who: 'Theo' }],
      hints: ['Ava talks about herself (I). Theo talks about Ava (you, she).'],
    },
    {
      id: 'teach-not', kind: 'teach', part: 2, bg: 'detective-wall', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [3, 4, 5], title: 'Two more tools: not, and questions',
      pages: [
        { word: 'I am not', art: { type: 'letters', text: 'NOT' }, meaning: 'not = this is false, this is not true.', example: 'I am not Spanish.', clue: 'Put not after am.' },
        { word: 'She is not', art: { type: 'person', code: 'it' }, meaning: 'the same with is: she is not = it is false.', example: 'She is not 15.', clue: 'Put not after is. (Short: isn’t.)' },
        { word: 'Are you…?', art: { type: 'letters', text: 'ARE YOU?' }, meaning: 'a yes / no question. The two words swap places.', example: 'Are you 14?', clue: 'You are → Are you?' },
        { word: 'Is she…?', art: { type: 'person', code: 'it' }, meaning: 'a yes / no question about another person.', example: 'Is she Italian?', clue: 'She is → Is she?' },
        { word: 'Yes, I am.', art: { type: 'letters', text: 'YES NO' }, meaning: 'a short answer: say yes or no, then am, is or are.', example: 'Are you Italian? Yes, I am.', clue: 'No, he is not. · Yes, she is.' },
      ],
      hints: ['A question starts with am, is or are. The short answer ends with am, is or are.'],
    },

    // ---------- 3 · Notice & Build ----------
    {
      id: 'bepick', kind: 'bepick', part: 3, bg: 'classroom-morning', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 4], stamp: 'not',
      prompt: 'Pick am, is or are for each person.',
      rounds: [
        { frame: 'I ___ 14.', answer: 'am', who: { type: 'letters', text: 'I' }, why: 'I → am.' },
        { frame: 'You ___ Italian.', answer: 'are', who: { type: 'letters', text: 'YOU' }, why: 'You → are.' },
        { frame: 'She ___ from Italy.', answer: 'is', who: { type: 'person', code: 'it' }, why: 'She → is.' },
        { frame: 'He ___ Spanish.', answer: 'is', who: { type: 'person', code: 'es' }, why: 'He → is.' },
        { frame: 'I ___ not Spanish.', answer: 'am', who: { type: 'letters', text: 'I' }, why: 'With not, the little word stays the same: I am not.' },
        { frame: 'She ___ not 15.', answer: 'is', who: { type: 'person', code: 'it' }, why: 'She → is, then not: She is not 15.' },
        { frame: '___ you 14?', answer: 'are', who: { type: 'letters', text: 'YOU' }, why: 'A question: Are you 14? (You are → Are you)' },
        { frame: '___ she Italian?', answer: 'is', who: { type: 'person', code: 'it' }, why: 'A question: Is she Italian? (She is → Is she)' },
      ],
      hints: ['Look at the picture. I → am. You → are. She or he → is.'],
    },
    {
      id: 'build-1', kind: 'build', part: 3, bg: 'phone-profile-closeup', actors: [{ who: 'Ava', pos: 'left', expr: 'thinking' }], trains: [1, 2, 3, 4],
      prompt: 'Build the sentence. Tap the words in the right order.',
      rounds: [
        { cue: 'About Ava: she is Italian.', target: 'She is Italian.', extra: ['am', 'are'] },
        { cue: 'About Theo: he is from Spain.', target: 'He is from Spain.', extra: ['are', 'am'] },
        { cue: 'About you: not Spanish.', target: 'I am not Spanish.', extra: ['is', 'no'], hint: 'We say am not. Not “am no”.' },
        { cue: 'Ask Ava: is she 14?', target: 'Are you 14?', extra: ['is', 'am'], hint: 'You ask Ava, so use you. A question: You are → Are you.' },
        { cue: 'Ask about Theo: Spanish?', target: 'Is he Spanish?', extra: ['are', 'am'], hint: 'A question about he: He is → Is he.' },
      ],
      hints: ['Find the person first. Then the little word: am, is or are.'],
    },
    {
      id: 'findwrong', kind: 'findwrong', part: 3, bg: 'detective-wall', actors: [{ who: 'Vee', pos: 'left', expr: 'thinking' }], trains: [2, 3],
      prompt: 'Detective time! The fake profile has 3 mistakes with am, is, are or not. Tap them.',
      rows: [
        { label: 'Line 1', text: 'He are 15.', wrong: true, fix: 'He is 15.' },
        { label: 'Line 2', text: 'She is from Italy.' },
        { label: 'Line 3', text: 'I is Spanish.', wrong: true, fix: 'I am Spanish.' },
        { label: 'Line 4', text: 'Are you 14?' },
        { label: 'Line 5', text: 'She is no 15.', wrong: true, fix: 'She is not 15.' },
      ],
      reveal: 'Found them! He is 15. I am Spanish. She is not 15. The fake writer forgot the rules!',
      hints: ['He → is. I → am. For NOT we say: is not.', 'Line 1, line 3 and line 5 have mistakes.'],
    },
    {
      id: 'answers', kind: 'convo', part: 3, bg: 'club-lobby', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [5],
      prompt: 'You are Ava. Theo asks questions. Choose Ava’s answers.', me: 'Ava', meLabel: 'Ava', after: 'Short answers! Now say them out loud with your teacher.',
      steps: [
        { ask: 'Are you Spanish?', pic: { type: 'pair', code: 'es' }, options: [{ text: 'No, I am not.', ok: true }, { text: 'Yes, I am.', hint: 'Ava is Italian, not Spanish.' }, { text: 'No, I not.', hint: 'Short answers end with am, is or are.' }] },
        { ask: 'Is Theo Spanish?', pic: { type: 'pair', code: 'es' }, options: [{ text: 'Yes, he is.', ok: true }, { text: 'Yes, I am.', hint: 'The question is about Theo (he), not about Ava.' }, { text: 'Yes, he are.', hint: 'He → is.' }] },
        { ask: 'Are you 15?', pic: { type: 'card', id: 'v-age', label: 'a birthday cake' }, options: [{ text: 'No, I am not.', ok: true }, { text: 'Yes, I am.', hint: 'Ava is 14.' }, { text: 'No, you are not.', hint: 'Ava answers about herself: I → am.' }] },
        { ask: 'Is he 16?', options: [{ text: 'No, he is not.', ok: true }, { text: 'Yes, he is.', hint: 'Theo is 15. Look at the profile in the model.' }, { text: 'No, he am not.', hint: 'He → is.' }] },
      ],
      hints: ['Read the question. Which person is it about? Answer with am, is or are for that person.'],
    },
    {
      id: 'factcheck', kind: 'factcheck', part: 3, bg: 'detective-wall', actors: [{ who: 'Vee', pos: 'left', expr: 'thinking' }], trains: [2, 3, 5], stamp: 'true',
      prompt: 'Is each sentence true? Check it on Ava’s real card.',
      profile: { who: 'Ava', name: 'Ava', age: 14, from: 'Italy', nationality: 'Italian', flag: 'it' },
      claims: [
        { text: 'She is 14.', fact: true },
        { text: 'She is Spanish.', fact: false, fixes: [{ text: 'She is not Spanish.', ok: true }, { text: 'She is Italian.', ok: true }, { text: 'She is not 14.', hint: 'Ava is 14. Check the card.' }] },
        { text: 'She is from Italy.', fact: true },
        { text: 'She is 15.', fact: false, fixes: [{ text: 'She is not 15.', ok: true }, { text: 'She is 14.', ok: true }, { text: 'She is not Italian.', hint: 'Ava is Italian. Check the card.' }] },
        { text: 'She is not French.', fact: true },
      ],
      hints: ['Look at the card: age 14, from Italy, Italian. Is the sentence the same?'],
    },

    // ---------- 4 · Energiser ----------
    {
      id: 'memory', kind: 'memory', part: 4, bg: 'border-control', actors: [{ who: 'Vee', pos: 'left', expr: 'happy' }], trains: [1, 2],
      prompt: 'Memory! Find each flag and the sentence about its country.',
      pairs: [{ flag: 'es', text: 'He is Spanish.' }, { flag: 'it', text: 'She is from Italy.' }, { flag: 'br', text: 'I am Brazilian.' }, { flag: 'fr', text: 'She is French.' }, { flag: 'jp', text: 'He is from Japan.' }, { flag: 'us', text: 'You are American.' }],
      hints: ['Remember where you saw each flag. Match the country to the sentence.'],
    },

    // ---------- 5 · Mission ----------
    { id: 'dial', kind: 'dial', part: 5, bg: 'club-stage', actors: [{ who: 'Vee', pos: 'right', expr: 'thumbs' }], prompt: 'Mission time! How much help do you want?' },
    {
      id: 'phonechat', kind: 'phonechat', part: 5, bg: 'club-lobby', actors: [{ who: 'Ava', pos: 'left', expr: 'happy' }], trains: [4, 5],
      prompt: 'Ava texts you! Build your replies with the word tiles.', contact: 'Ava',
      steps: [
        { text: 'Hi, detective! Are you ready?', reply: 'Yes, I am.', extra: ['is.', 'are.'] },
        { text: 'Is Theo 16?', reply: 'No, he is not.', extra: ['am', 'are'] },
        { text: 'Ask me about Theo!', reply: 'Is he Spanish?', extra: ['Are', 'am'] },
        { text: 'Yes, he is! And you? How old are you?', reply: 'I am 14.', extra: ['is', 'are'] },
      ],
      hints: ['Answer the question Ava asks. Tap the first word of your reply.'],
    },
    {
      id: 'build-2', kind: 'build', part: 5, bg: 'phone-profile-closeup', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 4, 5],
      prompt: 'Sentence duel! Build each sentence for the case. No timer, take your time.',
      rounds: [
        { cue: 'Theo: not 16.', target: 'He is not 16.', extra: ['am', 'are'] },
        { cue: 'Ava: not Spanish.', target: 'She is not Spanish.', extra: ['are', 'no'] },
        { cue: 'You: not 15.', target: 'I am not 15.', extra: ['is', 'are'] },
        { cue: 'Ask Theo: from Spain?', target: 'Are you from Spain?', extra: ['is', 'am'] },
        { cue: 'Ask about Ava: Italian?', target: 'Is she Italian?', extra: ['are', 'am'] },
        { cue: 'Answer: Is he 15? Yes.', target: 'Yes, he is.', extra: ['am', 'are'] },
      ],
      hints: ['Person first, then am, is or are. For not, add not after it.'],
    },
    {
      id: 'say-take1', kind: 'say', part: 5, bg: 'detective-wall', actors: [{ who: 'Theo', pos: 'right', expr: 'wave' }], trains: [1, 3, 4], open: true,
      prompt: 'Take 1 · Check in with Theo. Say who you are, one thing that is not true, and ask him a question.',
      model: 'I am {name}. I am {age}. I am not ___. Are you Spanish, Theo?',
      byDial: { chill: 'I am {name}. I am {age}.', normal: 'I am {name}. I am {age}. I am not ___. Are you Spanish, Theo?', push: 'I am {name}. I am {age}. I am not ___. Are you Spanish, Theo? Is Ava Italian? Yes, she is.' },
      hints: ['Read the model, then say it with your own facts.'],
    },
    {
      id: 'fade', kind: 'fade', part: 5, bg: 'club-stage', actors: [{ who: 'Ava', pos: 'left', expr: 'music' }, { who: 'Theo', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 4, 5],
      prompt: 'Feedback time! Practise the lines again, with less help each round, before Take 2.',
      lines: [
        { who: 'Ava', text: 'Are you Spanish, Theo?', keys: ['Are', 'Spanish'] },
        { who: 'Theo', text: 'Yes, I am. I am from Spain.', keys: ['Yes', 'am'] },
        { who: 'Theo', text: 'Is Ava 15?', keys: ['Is', '15'] },
        { who: 'Ava', text: 'No, I am not. I am 14.', keys: ['not', '14'] },
        { who: 'Theo', text: 'She is not 15. She is 14.', keys: ['not', '14'] },
      ],
    },
    {
      id: 'say-take2', kind: 'say', part: 5, bg: 'detective-wall', actors: [{ who: 'Theo', pos: 'right', expr: 'happy' }], trains: [3, 4, 5], open: true,
      prompt: 'Take 2 · Theo asks YOU: “Are you Spanish?” Answer, then ask him about Ava.',
      model: 'No, I am not. I am ___. Is Ava Italian? Yes, she is.',
      hints: ['A short answer ends with am, is or are: No, I am not.'],
    },

    // ---------- 6 · Release (exit task: model hidden) ----------
    {
      id: 'write', kind: 'write', part: 6, bg: 'detective-wall', actors: [{ who: 'Vee', pos: 'right', expr: 'happy' }], trains: [1, 2, 3, 4, 5], stamp: 'ask',
      prompt: 'Final case! Write your own profile check. The model is hidden. Try first.',
      rows: [
        { label: 'Say who YOU are.', frame: 'I am ___.', accept: ['^(i am|i\'m) (?!not\\b).+'], hint: 'Start with I am. Example: I am 14.', sample: 'I am 14.' },
        { label: 'Say who a friend is.', frame: 'She is ___. / He is ___.', accept: ['^(she|he) is (?!not\\b).+'], hint: 'Use she is or he is. Example: She is Italian.', sample: 'She is Italian.' },
        { label: 'Say one thing that is NOT true about you.', frame: 'I am not ___.', accept: ['^(i am not|i\'m not) .+'], hint: 'Put not after am. Example: I am not Spanish.', sample: 'I am not Spanish.' },
        { label: 'Say one thing that is NOT true about your friend.', frame: 'He is not ___.', accept: ['^(she|he) (is not|isn\'t) .+'], hint: 'Use is not (or isn’t). Example: He is not 16.', sample: 'He is not 16.' },
        { label: 'Ask a question, then answer it.', frame: 'Is she ___? Yes, she is.', accept: ['^(is (she|he)|are you) .+\\?\\s*(yes|no),? (i am|i am not|i\'m not|she is|he is|she is not|he is not|she isn\'t|he isn\'t)\\.?$'], hint: 'First the question (Is she…? or Are you…?). Then Yes or No and a short answer: Yes, she is.', sample: 'Is she Italian? Yes, she is.' },
      ],
      hints: ['Use the pictures in your head: Ava is 14, Italian. Theo is 15, Spanish.'],
    },

    // ---------- 7 · Wrap ----------
    {
      id: 'wrap', kind: 'wrap', part: 7, bg: 'club-lobby', actors: [{ who: 'Vee', pos: 'left', expr: 'thumbs' }], heading: 'Case solved?', ticks: CRITERIA,
      homework: 'Homework: write three sentences about a friend: one with is, one with is not, and one question.',
      clue: 'Clue 3 of 8: The fake profile says “She is 15. She is Spanish.” But Ava is 14 and Italian. Who is 15 and Spanish? Theo! Someone mixed up their facts.',
    },
  ],
};
