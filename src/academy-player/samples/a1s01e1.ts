// A1-S01-E1 "Who Are You?" — lesson script v3 (owner redo, 2026-10-09). Academy cast only.
// Plan, objective, criteria, route and alignment: docs/academy-a1s01e1-spec.md (built with .claude/skills/academy-lesson-craft).
// Owner order: 1 learn the words (pictures + meaning) · 2 read the story (full-page scene, read and repeat each line) ·
// 3 practise the words (match pictures / meanings) · 4 complete the conversation · 5 say it by heart · 6 introduce yourself.
// Every screen after a `trains` tag trains those success criteria; tests check the alignment, the exit-task coverage and the minutes.
// Run of show (blueprint): Check-in 0 · Remember? 1 · The Drop 2 · Notice & Build 3 · Energiser 4 · Mission 5 · Release 6 · Wrap 7.
// No voice clips exist yet: every line is silent; "I said it" is the student's own word (a live teacher hears it).
import type { FlashCard, SceneScript } from '../scriptTypes';

/** The objective (owner decision 2026-10-09). */
export const OBJECTIVE = 'By the end I can introduce myself to a new person: say my name, my age, where I am from and one thing I like, and ask "How old are you?" and "Where are you from?" back.';
/** Success criteria = the Wrap tick-list. 6 is the stretch. */
export const CRITERIA = [
  'I said my name: My name is ___.',
  'I said my age: I am ___.',
  'I said where I am from: I am from ___.',
  'I said one thing I like: I like ___.',
  'I asked back: How old are you? Where are you from?',
  'I said my family: I have a ___ and a ___.',
] as const;
/** The 12 pictured words of this lesson. */
export const INVENTORY = ['name', 'age', 'country', 'hobby', 'family', 'mother', 'father', 'brother', 'sister', 'football', 'music', 'games'] as const;
/** The frames the exit task uses. Each must be practised at least 3 times (see the tests). */
export const EXIT_FRAMES = ['my name is', 'i am', 'i am from', 'i like', 'how old are you'] as const;

const card = (word: string, chunk: string, meaning: string, alt: string, clue: string): FlashCard => ({ word, chunk, meaning, pictureId: `v-${word}`, alt, ask: `What is ${/^[aeiou]/.test(word) ? 'an' : 'a'} ${word}?`, clue });

const DRAG_SETS = [
  ['name', 'age', 'country', 'hobby'],
  ['family', 'mother', 'father', 'brother'],
  ['sister', 'football', 'music', 'games'],
];
/** Drag & drop after each set of words: drag the word onto its picture. */
const DRAG = (n: number): Beat => ({
  t: 'match',
  drag: true,
  prompt: 'Drag each word onto its picture.',
  pairs: DRAG_SETS[n].map((w) => ({ left: w, right: w, leftPicture: { id: `v-${w}`, alt: w } })),
});

const HOBBIES = ['football ⚽', 'music 🎵', 'games 🎮', 'reading 📚', 'drawing 🎨', 'dancing 💃'];

export const A1S01E1: SceneScript = {
  lessonId: 'A1-S01-E1',
  level: 'A1',
  title: 'Who Are You?',
  cast: ['Vee', 'Ava', 'Theo'],
  beats: [
    // ── Check-in (5 min): say hello, see today's goal, give your name ─────────
    { t: 'segment', index: 0 },
    { t: 'trains', criteria: [0] },
    { t: 'bg', id: 'club-lobby', alt: 'A bright club lobby with sofas, a snack table and colourful flags' },
    { t: 'show', who: 'Vee', pos: 'center', expr: 'wave' },
    { t: 'say', who: 'Vee', expr: 'wave', text: 'Hello! Welcome to the club. I am Vee.', key: ['Welcome'] },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Today you will introduce yourself. That is your goal.', gloss: { goal: 'what you want to do at the end' } },
    {
      t: 'profile',
      title: 'My introduction card',
      prompt: 'This card is empty. At the end of the lesson it will be full.',
      rows: [
        { label: 'Name', value: '___' },
        { label: 'Age', value: '___' },
        { label: 'Country', value: '___' },
        { label: 'Hobby', value: '___' },
        { label: 'Family', value: '___' },
      ],
    },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'First, tell us your name. A nickname is fine.' },
    { t: 'trains', criteria: [1] },
    {
      t: 'form',
      prompt: 'Answer in a full sentence. Follow the model.',
      model: {
        title: 'Model: Ava answers',
        style: 'talk',
        lines: [
          { who: 'Vee', text: 'What is your name?' },
          { who: 'Ava', text: 'My name is Ava.' },
          { who: 'Vee', text: 'How are you today?' },
          { who: 'Ava', text: 'I am great, thanks!' },
        ],
      },
      fields: [
        { key: 'name', label: 'What is your name?', kind: 'text', starter: 'My name is', placeholder: 'your name', clue: 'Type only your name. We add the rest.' },
        { key: 'mood', label: 'How are you today?', kind: 'choice', starter: 'I am', options: ['great 😀', 'fine 🙂', 'tired 😴'], clue: 'Tap one. Then say: I am …' },
      ],
    },
    { t: 'hide', who: 'Vee' },
    { t: 'show', who: 'Ava', pos: 'left', expr: 'wave' },
    { t: 'show', who: 'Theo', pos: 'right', expr: 'wave' },
    { t: 'say', who: 'Ava', expr: 'wave', text: 'Hi, {name}! My name is Ava. Nice to meet you.', key: ['name'] },
    { t: 'say', who: 'Theo', expr: 'wave', text: 'Hi, {name}! I am Theo. Welcome!' },
    { t: 'hide', who: 'Ava' },
    { t: 'hide', who: 'Theo' },
    { t: 'show', who: 'Vee', pos: 'center', expr: 'happy' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Nice! Now let us learn the words for your card.' },

    // ── Remember? (7 min) = 1. Learn the words: picture + meaning, 3 sets of 4, each set checked ─
    { t: 'segment', index: 1 },
    { t: 'trains', criteria: [1, 2, 3, 4, 5, 6] },
    { t: 'bg', id: 'club-lobby', alt: 'The club lobby' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Meet 12 words. Tap a picture to see its meaning.' },
    {
      t: 'flash',
      title: 'Words about you',
      noCheck: true,
      cards: [
        card('name', 'My name is Ava.', 'what people call you', 'A name tag on a lanyard next to a smiling teen', "It is the word people use for you. Ava, Theo and Mia are names. What is your name?"),
        card('age', 'My age is 14.', 'how old you are', 'A birthday cake with candles and balloons', "It is a number. It says how many years old you are. Theo is 14."),
        card('country', 'My country is Brazil.', 'the place you are from', 'A globe with small flags and a map pin', "It is the big place you are from. Brazil, Spain and Japan are countries."),
        card('hobby', 'My hobby is music.', 'what you like to do', 'A teen at a desk with small icons of free-time things', "It is a thing you like to do in your free time. Music is a hobby."),
      ],
    },
    DRAG(0),
    {
      t: 'flash',
      title: 'Words about family',
      noCheck: true,
      cards: [
        card('family', 'I have a big family.', 'mother, father, brother, sister', 'A happy family of four', "It is the people at home: mother, father, brother, sister."),
        card('mother', 'This is my mother.', 'a woman in your family: she has children', 'A smiling woman with a teen girl', "She is a woman. She has children. Ava’s mother is at home."),
        card('father', 'This is my father.', 'a man in your family: he has children', 'A smiling man with a teen boy', "He is a man. He has children. Theo’s father likes football."),
        card('brother', 'I have a brother.', 'a boy in your family', 'Two boys fist-bumping', "He is a boy in your family. You have the same mother and father."),
      ],
    },
    DRAG(1),
    {
      t: 'flash',
      title: 'Words about free time',
      noCheck: true,
      cards: [
        card('sister', 'I have a sister.', 'a girl in your family', 'Two girls laughing together', "She is a girl in your family. You have the same mother and father."),
        card('football', 'I like football.', 'a game with a ball and two goals', 'A football on grass with a goal', "It is a game with a ball and two goals. Many people play it."),
        card('music', 'I like music.', 'songs: you listen to it', 'Headphones, a music note and a guitar', "It is songs. You listen to music. Ava likes music."),
        card('games', 'I like games.', 'things you play on a screen or a table', 'A game controller with a glowing screen', "You play games on a screen or at a table. Theo likes games."),
      ],
    },

    DRAG(2),

    // ── The Drop (10 min) = 2. Read the story: a full-page scene, the cast act every line; read it, then say it ─
    { t: 'segment', index: 2 },
    { t: 'trains', criteria: [1, 2, 3, 4, 5, 6] },
    { t: 'layout', mode: 'story' },
    { t: 'bg', id: 'club-lobby', alt: 'The club lobby: Ava and Theo meet' },
    { t: 'hide', who: 'Vee' },
    { t: 'show', who: 'Ava', pos: 'left', expr: 'wave' },
    { t: 'show', who: 'Theo', pos: 'right', expr: 'neutral' },
    { t: 'say', who: 'narrator', text: 'Ava and Theo meet. Read each line, then say it.' },
    { t: 'say', who: 'Ava', expr: 'wave', text: 'Hi! Welcome to the club. My name is Ava.', key: ['name'], repeat: true },
    { t: 'say', who: 'Theo', expr: 'wave', text: 'Hi, Ava! My name is Theo. Nice to meet you.', key: ['name'], repeat: true },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'Nice to meet you, too. How old are you?', key: ['old'], repeat: true },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'I am 14. How old are you?', key: ['old'], repeat: true },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'I am 13. Where are you from, Theo?', key: ['from'], repeat: true },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'I am from Brazil. Where are you from?', key: ['from'], repeat: true },
    { t: 'say', who: 'Ava', expr: 'music', text: 'I am from Spain. I like music. What do you like?', key: ['music'], repeat: true },
    { t: 'say', who: 'Theo', expr: 'football', text: 'I like football and games. Do you have a brother?', key: ['football', 'games'], repeat: true },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'Yes! I have a brother and a sister.', key: ['brother', 'sister'], repeat: true },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'I have a mother, a father and a sister.', key: ['mother', 'father', 'sister'], repeat: true },
    {
      t: 'choice',
      prompt: 'Where is Theo from?',
      tests: 'language',
      options: [
        { text: 'Brazil', correct: true, feedback: 'Yes! Theo says: I am from Brazil.' },
        { text: 'Spain', correct: false, feedback: 'Spain is Ava’s country. Theo says: I am from Brazil.' },
        { text: 'Japan', correct: false, feedback: 'Look at the story again: I am from Brazil.' },
      ],
    },
    {
      t: 'choice',
      prompt: 'What does Ava like?',
      tests: 'language',
      options: [
        { text: 'Music', correct: true, feedback: 'Yes! Ava says: I like music.' },
        { text: 'Football', correct: false, feedback: 'Football is Theo’s hobby. Ava says: I like music.' },
        { text: 'Games', correct: false, feedback: 'Look again: I am from Spain. I like music.' },
      ],
    },
    {
      t: 'choice',
      prompt: 'How old is Ava?',
      tests: 'language',
      options: [
        { text: '13', correct: true, feedback: 'Yes! Ava says: I am 13.' },
        { text: '14', correct: false, feedback: 'Fourteen is Theo’s age. Ava says: I am 13.' },
        { text: '12', correct: false, feedback: 'Look again: I am 13.' },
      ],
    },
    {
      t: 'match',
      prompt: 'Match each person with their facts.',
      pairs: [
        { left: 'Ava is from', right: 'Spain' },
        { left: 'Theo is from', right: 'Brazil' },
        { left: 'Ava likes', right: 'music' },
        { left: 'Theo likes', right: 'football' },
        { left: 'Ava is', right: '13' },
        { left: 'Theo is', right: '14' },
      ],
    },
    { t: 'hide', who: 'Ava' },
    { t: 'show', who: 'Vee', pos: 'left', expr: 'thumbs' },
    { t: 'say', who: 'Vee', expr: 'thumbs', text: 'Great! Name, age, country, hobby, family. Now it is your turn.' },
    { t: 'layout', mode: 'normal' },
    { t: 'hide', who: 'Vee' },
    { t: 'hide', who: 'Theo' },

    // ── Notice & Build (10 min) = 3. Practise the words · 4. Complete the conversation ─
    { t: 'segment', index: 3 },
    { t: 'trains', criteria: [1, 2, 3, 4, 6] },
    { t: 'bg', id: 'club-lobby', alt: 'The club lobby' },
    { t: 'show', who: 'Vee', pos: 'center', expr: 'happy' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Now practise. First, match the pictures with the words.' },
    {
      t: 'match',
      prompt: 'Match each picture with its word.',
      pairs: [
        { left: 'name', right: 'name', leftPicture: { id: 'v-name', alt: 'A name tag' } },
        { left: 'age', right: 'age', leftPicture: { id: 'v-age', alt: 'A birthday cake' } },
        { left: 'country', right: 'country', leftPicture: { id: 'v-country', alt: 'A globe with flags' } },
        { left: 'hobby', right: 'hobby', leftPicture: { id: 'v-hobby', alt: 'A teen with free-time icons' } },
        { left: 'football', right: 'football', leftPicture: { id: 'v-football', alt: 'A football' } },
        { left: 'music', right: 'music', leftPicture: { id: 'v-music', alt: 'Headphones and a guitar' } },
      ],
    },
    {
      t: 'match',
      prompt: 'Match each word with its meaning.',
      pairs: [
        { left: 'name', right: 'what people call you' },
        { left: 'age', right: 'how old you are' },
        { left: 'country', right: 'the place you are from' },
        { left: 'hobby', right: 'what you like to do' },
        { left: 'brother', right: 'a boy in your family' },
        { left: 'sister', right: 'a girl in your family' },
      ],
    },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Now complete the conversation from the story.' },
    { t: 'trains', criteria: [1, 2, 3, 5] },
    {
      t: 'cloze',
      prompt: 'Complete the conversation. Tap a word for each gap.',
      lines: [
        { who: 'Ava', text: 'Hi! My {{name}} is Ava. How {{old}} are you?' },
        { who: 'Theo', text: 'I {{am}} 14. Where are you {{from}}?' },
      ],
      bank: ['name', 'old', 'am', 'from', 'like'],
    },
    { t: 'trains', criteria: [3, 4, 6] },
    {
      t: 'cloze',
      prompt: 'Complete the conversation. Tap a word for each gap.',
      lines: [
        { who: 'Ava', text: 'I am {{from}} Spain. I {{like}} music.' },
        { who: 'Theo', text: 'I like {{football}}. I have a {{brother}} and a {{sister}}.' },
      ],
      bank: ['from', 'like', 'football', 'brother', 'sister', 'family', 'games'],
    },
    { t: 'trains', criteria: [3] },
    { t: 'build', prompt: 'Build the sentence.', target: 'I am from Brazil.', extraTiles: ['like', 'Spain'], hint: 'Start with I.' },
    { t: 'trains', criteria: [5] },
    { t: 'build', prompt: 'Build the question.', target: 'Where are you from?', extraTiles: ['old'], hint: 'Start with Where.' },
    { t: 'build', prompt: 'Build the question.', target: 'How old are you?', extraTiles: ['from'], hint: 'Start with How.' },

    // ── Energiser (4 min): a quick game with the same words ──────────────────
    { t: 'segment', index: 4 },
    { t: 'trains', criteria: [6] },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Quick game! Tap the word that is different.' },
    {
      t: 'choice',
      prompt: 'Which word is NOT about family?',
      tests: 'language',
      options: [
        { text: 'mother', correct: false, feedback: 'A mother is in a family. Try again.' },
        { text: 'football', correct: true, feedback: 'Yes! Football is a hobby.' },
        { text: 'sister', correct: false, feedback: 'A sister is in a family. Try again.' },
      ],
    },
    { t: 'trains', criteria: [4] },
    {
      t: 'choice',
      prompt: 'Which word is a hobby?',
      tests: 'language',
      options: [
        { text: 'father', correct: false, feedback: 'A father is in your family. Try again.' },
        { text: 'music', correct: true, feedback: 'Yes! Music is a hobby.' },
        { text: 'country', correct: false, feedback: 'A country is a place. Try again.' },
      ],
    },
    {
      t: 'match',
      prompt: 'Speed round! Match the family pictures with the words.',
      pairs: [
        { left: 'family', right: 'family', leftPicture: { id: 'v-family', alt: 'A happy family of four' } },
        { left: 'mother', right: 'mother', leftPicture: { id: 'v-mother', alt: 'A woman with a teen girl' } },
        { left: 'father', right: 'father', leftPicture: { id: 'v-father', alt: 'A man with a teen boy' } },
        { left: 'brother', right: 'brother', leftPicture: { id: 'v-brother', alt: 'Two boys fist-bumping' } },
        { left: 'sister', right: 'sister', leftPicture: { id: 'v-sister', alt: 'Two girls laughing' } },
      ],
    },
    { t: 'trains', criteria: [5] },
    {
      t: 'choice',
      prompt: 'Which line asks about age?',
      tests: 'language',
      options: [
        { text: 'Where are you from?', correct: false, feedback: 'That asks about the country. Try again.' },
        { text: 'How old are you?', correct: true, feedback: 'Yes! How old are you? asks about age.' },
        { text: 'What is your name?', correct: false, feedback: 'That asks about the name. Try again.' },
      ],
    },
    {
      t: 'choice',
      prompt: 'Which line asks about the country?',
      tests: 'language',
      options: [
        { text: 'How old are you?', correct: false, feedback: 'That asks about age. Try again.' },
        { text: 'Where are you from?', correct: true, feedback: 'Yes! Where are you from? asks about the country.' },
        { text: 'What do you like?', correct: false, feedback: 'That asks about hobbies. Try again.' },
      ],
    },
    { t: 'trains', criteria: [4] },
    {
      t: 'choice',
      prompt: 'Which hobby do you like?',
      tests: 'story',
      options: [
        { text: 'football', set: { fun: 'football' } },
        { text: 'music', set: { fun: 'music' } },
        { text: 'games', set: { fun: 'games' } },
      ],
    },

    // ── Mission (12 min) = 5. Say it by heart: fade the support, then role-play (Take 1, feedback, Take 2) ─
    { t: 'segment', index: 5 },
    { t: 'trains', criteria: [1, 5] },
    { t: 'bg', id: 'club-lobby', alt: 'The club lobby' },
    { t: 'show', who: 'Ava', pos: 'left', expr: 'happy' },
    { t: 'show', who: 'Theo', pos: 'right', expr: 'happy' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Now say the lines from memory. Some words are hidden.' },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'Hi! My name is Ava. How old are you?', key: ['name', 'old'], hide: 'keys' },
    { t: 'trains', criteria: [2, 3, 5] },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'I am 14. Where are you from?', key: ['am', 'from'], hide: 'keys' },
    { t: 'trains', criteria: [3, 4] },
    { t: 'say', who: 'Ava', expr: 'music', text: 'I am from Spain. I like music.', key: ['Spain', 'music'], hide: 'keys' },
    { t: 'trains', criteria: [4, 6] },
    { t: 'say', who: 'Theo', expr: 'football', text: 'I like football. I have a brother.', key: ['football', 'brother'], hide: 'keys' },
    { t: 'say', who: 'Vee', expr: 'thumbs', text: 'Now only the first word. Say the whole line.' },
    { t: 'trains', criteria: [1, 5] },
    { t: 'say', who: 'Ava', expr: 'happy', text: 'Hi! My name is Ava. How old are you?', hide: 'all' },
    { t: 'trains', criteria: [3, 4] },
    { t: 'say', who: 'Theo', expr: 'football', text: 'I am from Brazil. I like football.', hide: 'all' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Now you talk with Theo. Choose how much help you want.' },
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
    { t: 'set', key: 'model1', value: 'Hi! My name is {name}. I am from ___.' },
    { t: 'jump', label: 'take1' },
    { t: 'label', name: 'normal' },
    { t: 'set', key: 'model1', value: 'Hi! My name is {name}. I am ___. I am from ___.' },
    { t: 'jump', label: 'take1' },
    { t: 'label', name: 'push' },
    { t: 'set', key: 'model1', value: 'Hi! My name is {name}. I am ___. I am from ___. I like ___.' },
    { t: 'label', name: 'take1' },
    { t: 'trains', criteria: [1, 2, 3, 4] },
    { t: 'say', who: 'Theo', expr: 'wave', text: 'Hi! I am Theo. What is your name?' },
    { t: 'record', prompt: 'Take 1: answer Theo with your own words.', model: '{model1}' },
    { t: 'say', who: 'Vee', expr: 'thumbs', text: 'Good! Now add one new thing: ask Theo a question.' },
    { t: 'trains', criteria: [5] },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'I am from Brazil. I like football.' },
    { t: 'record', prompt: 'Take 2: say it again. Then ask Theo two questions.', model: 'Hi! My name is {name}. I am from ___. How old are you? Where are you from?' },
    { t: 'hide', who: 'Ava' },
    { t: 'hide', who: 'Theo' },

    // ── Release (7 min) = 6. Introduce yourself: your card, then say it with the model hidden ─
    { t: 'segment', index: 6 },
    { t: 'trains', criteria: [2, 3, 4, 6] },
    { t: 'bg', id: 'club-lobby', alt: 'The club lobby' },
    { t: 'show', who: 'Vee', pos: 'center', expr: 'happy' },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Your turn! Make your introduction card.' },
    {
      t: 'form',
      prompt: 'Fill your card. Follow Ava’s model.',
      model: {
        title: 'Model: Ava’s card, and what she says',
        style: 'card',
        lines: [
          { who: 'Age', text: 'I am 14.' },
          { who: 'Country', text: 'I am from Brazil.' },
          { who: 'Hobby', text: 'I like music.' },
          { who: 'Family', text: 'I have a mother and a sister.' },
          { who: 'Then', text: 'Ask back: How old are you? Where are you from?' },
        ],
      },
      fields: [
        { key: 'age', label: 'My age', kind: 'choice', starter: 'I am', options: ['11', '12', '13', '14', '15', '16', '17', '18'] },
        { key: 'country', label: 'My country', kind: 'text', starter: 'I am from', placeholder: 'Brazil', clue: 'Type only the country.' },
        { key: 'hobby', label: 'My hobby', kind: 'choice', starter: 'I like', options: HOBBIES },
        { key: 'family', label: 'My family (tap all)', kind: 'multi', options: ['mother', 'father', 'brother', 'sister'], optional: true, clue: 'Not sure? You can skip it.' },
      ],
    },
    {
      t: 'profile',
      title: 'My introduction card',
      prompt: 'This is you. Read your card.',
      rows: [
        { label: 'Name', value: '{name}' },
        { label: 'Age', value: '{age}' },
        { label: 'Country', value: '{country}' },
        { label: 'Hobby', value: '{hobby}' },
        { label: 'Family', value: '{family}' },
      ],
    },
    { t: 'trains', criteria: [1, 2, 3, 4, 5] },
    { t: 'say', who: 'Vee', expr: 'happy', text: 'Now introduce yourself. Do not look at the line. Say it!' },
    { t: 'record', prompt: 'Say your introduction. Then ask two questions.', model: 'Hi! My name is {name}. I am {age}. I am from {country}. I like {hobby}. How old are you? Where are you from?', hideModel: true },
    { t: 'hide', who: 'Vee' },
    { t: 'show', who: 'Ava', pos: 'left', expr: 'wave' },
    { t: 'show', who: 'Theo', pos: 'right', expr: 'wave' },
    { t: 'say', who: 'Ava', expr: 'wave', text: 'Nice to meet you, {name}! Great introduction.' },
    { t: 'say', who: 'Theo', expr: 'happy', text: 'Welcome to the club, {name}!' },

    // ── Wrap (5 min): can-do ticks tied to the criteria, homework, clue ──────
    { t: 'segment', index: 7 },
    { t: 'trains', criteria: [1, 2, 3] },
    { t: 'hide', who: 'Ava' },
    { t: 'hide', who: 'Theo' },
    { t: 'show', who: 'Vee', pos: 'center', expr: 'thumbs' },
    { t: 'ticks', prompt: 'I can...', items: [CRITERIA[0], CRITERIA[1], CRITERIA[2]] },
    { t: 'trains', criteria: [4, 5, 6] },
    { t: 'ticks', prompt: 'I can...', items: [CRITERIA[3], CRITERIA[4], CRITERIA[5]] },
    { t: 'say', who: 'Vee', expr: 'thumbs', text: 'Homework: introduce yourself to one friend today. Not yet is okay!' },
    { t: 'end', summary: 'Clue 1 of 8: Ava’s group chat has a new member called Sam. Who is Sam? See you next time.' },
  ],
};
