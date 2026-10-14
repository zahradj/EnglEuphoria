// A2-S01-E1 "The Photo Wall" (Last Weekend, Cold Open): Ava posted photos from a weekend she cannot remember. New setting (the weekend gallery), new story plates, a photo-wall Explore, and a first guess in the past.
// Receptive lesson (blueprint: 10 receptive items, no new structure yet): the student HEARS was / were / -ed in the story and in chunks, is shown the rule plainly, and makes one guess: "I think Ava was at the lake."
// NOT used here, because every Season 1 lesson used them: badge-and-convo opening, brief card, who-said, border booth, padlock, find-the-wrong-line.
// Order (PPP with gradual release): context -> model -> rule -> controlled practice (two different games after every word set) -> free practice -> produce -> teach-back.
// Scenario: docs/scenarios/academy-a2s01e1-photo-wall.md. Research: docs/research/academy-a2s01-research.md. Owner rules: the teacher MODELS first; the RULE is STATED plainly (3 lines); the student restates it; bonus games are `flex`.
import type { DeckScript, TeachArt } from '../types';

export const OBJECTIVE = 'By the end I can understand the Photo Wall story, say where someone was last weekend, and tell Theo my guess about Ava.';
export const CRITERIA = [
  'I understood the Photo Wall story: Ava has photos but cannot remember last weekend.',
  'I named the weekend words: lake, hill, camp, crowd, fishing, wedding.',
  'I said the rule: last weekend is the past; am and is become was, are becomes were; a verb with -ed is the past.',
  'I said where someone was: Ava was at the lake. We were at the wedding.',
  'I told Theo my guess: I think Ava was at the lake.',
];
/** The 10 new items of the blueprint (receptive, src/curriculum/academy/items/a2.ts A2-S01 E1). */
export const ITEMS = ['lake', 'hill', 'camp', 'crowd', 'fishing', 'wedding', 'celebrate', 'surprise', 'joke', 'chat'];

const card = (id: string, label: string): TeachArt => ({ type: 'card', id, label });
const who = (w: 'Vee' | 'Ava' | 'Theo', pos: 'left' | 'right' | 'center', expr: 'happy' | 'wave' | 'thumbs' | 'neutral' | 'thinking' = 'happy') => ({ who: w, pos, expr });
const BONUS = 'Bonus game: skip it if time is short.';
const GAL = 'weekend-gallery';
const LAKE = card('v-lake', 'a lake');
const HILL = card('v-hill', 'a hill');
const CAMP = card('v-camp', 'a camp with a tent');
const CROWD = card('v-crowd', 'a crowd');
const FISHING = card('v-fishing', 'fishing');
const WEDDING = card('v-wedding', 'a wedding');
const CELEBRATE = card('v-celebrate', 'a party');
const SURPRISE = card('v-surprise', 'a surprise');
const JOKE = card('v-joke', 'a joke');
const PHOTO = card('v-photo', 'taking a photo');
const SWIM = card('v-swim', 'swimming');
const RUN = card('v-run', 'running');

export const LAST_WEEKEND_1: DeckScript = {
  lessonId: 'A2-S01-E1',
  level: 'A2',
  title: 'The Photo Wall · Cold Open',
  objective: OBJECTIVE,
  criteria: CRITERIA,
  cast: ['Vee', 'Ava', 'Theo'],
  partGoals: [
    'Meet Ava and her photos',
    'Wake up what is happening now and your hobby words',
    'Walk the photo wall: where was Ava? Meet the place words',
    'Learn the rule, then the event words and their games',
    'Say where you were',
    'Choose your help, then tell Theo your guess',
    'Write your lines and say them to Ava',
    'Say the rule again and see what you can do',
  ],
  slides: [
    // ---------- 0 · Check-in ----------
    { id: 'title', kind: 'title', part: 0, bg: GAL, actors: [who('Vee', 'center', 'wave')], heading: 'The Photo Wall', sub: 'Last Weekend · lesson 1' },
    {
      id: 'sos', kind: 'phonechat', part: 0, bg: 'phone-profile-closeup', contact: 'Ava', trains: [1, 5],
      prompt: 'A message from Ava! Tap the words to write your answers.',
      steps: [
        { text: 'Help! I posted 20 photos. I do not remember my weekend!', pic: PHOTO, reply: 'Hi, Ava! Show me.', extra: ['bye', 'sorry'] },
        { text: 'Come to the gallery. Let us chat about them.', reply: 'Okay! See you.', extra: ['no', 'hello'] },
      ],
      hints: ['Read Ava’s message, then tap your words in order.'],
    },
    {
      id: 'mood', kind: 'convo', part: 0, bg: 'classroom-evening', actors: [who('Theo', 'right', 'wave')], trains: [1], me: 'Theo', meLabel: 'You', after: 'Great. Let us look at the wall!',
      prompt: 'Theo asks you two quick questions. Choose your answers.',
      steps: [
        { ask: 'Do you like weekends?', pic: CELEBRATE, options: [{ text: 'Yes, I do.', ok: true }, { text: 'Not really.', ok: true }] },
        { ask: 'Do you take photos?', pic: PHOTO, options: [{ text: 'Yes, I do.', ok: true }, { text: 'No, I do not.', ok: true }] },
      ],
      hints: ['There is no wrong answer. Choose what is true for you.'],
    },

    // ---------- 1 · Remember? (A1: what is happening now, hobby words) ----------
    {
      id: 'hear-now', kind: 'hearpick', part: 1, stage: 'review', bg: 'locker-hall', actors: [who('Ava', 'right')], trains: [1],
      prompt: 'Which sentence do you hear? Tap it.',
      rounds: [
        { say: 'Ava is taking a photo.', options: ['Ava is taking a photo.', 'Ava is drawing.', 'Theo is taking a photo.'], answer: 'Ava is taking a photo.' },
        { say: 'Theo is looking at the wall.', options: ['Theo is looking at the wall.', 'Theo is listening to music.', 'Ava is looking at the wall.'], answer: 'Theo is looking at the wall.' },
        { say: 'I like taking photos.', options: ['I like taking photos.', 'I love taking photos.', 'I like drawing.'], answer: 'I like taking photos.' },
      ],
      hints: ['Listen to the name and the action.'],
    },
    {
      id: 'shadow-hobby', kind: 'shadow', part: 1, stage: 'review', bg: 'locker-hall', actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Whose shadow is it? Pick the word.',
      rounds: [
        { art: PHOTO, answer: 'photo', options: ['swim', 'photo', 'run'] },
        { art: SWIM, answer: 'swim', options: ['swim', 'run', 'photo'] },
        { art: RUN, answer: 'run', options: ['photo', 'run', 'swim'] },
      ],
      hints: ['Look at the shape. What is it?'],
    },
    {
      id: 'build-now', kind: 'build', part: 1, stage: 'review', bg: 'locker-hall', actors: [who('Ava', 'left')], trains: [1, 4],
      prompt: 'Build the sentence. Tap the words in the right order.',
      rounds: [
        { cue: 'Say what Ava is doing now.', target: 'Ava is taking a photo.', extra: ['was', 'at'] },
        { cue: 'Say what Theo is doing now.', target: 'Theo is looking at the photos.', extra: ['were', 'am'] },
      ],
      hints: ['Start with the name. Then is, then the action.'],
    },

    // ---------- 2 · The Drop: the photo wall is the game ----------
    {
      id: 'story-welcome', kind: 'story', part: 2, stage: 'context', bg: GAL, trains: [1], title: 'The Photo Wall',
      beats: [
        { plate: 'story-wk-1', lines: [{ who: 'Vee', text: 'Welcome to the Photo Gallery!' }, { who: 'Ava', text: 'Look at my photos from last weekend.' }] },
        { plate: 'story-wk-2', lines: [{ who: 'Ava', text: 'But I do not remember last weekend!' }, { who: 'Theo', text: 'Not one thing? Look, a lake!' }] },
        { plate: 'story-wk-3', lines: [{ who: 'Theo', text: 'A tent, a crowd, a wedding. Where were you?' }] },
      ],
    },
    {
      id: 'walk', kind: 'explore', part: 2, stage: 'context', bg: GAL, trains: [1, 2],
      prompt: 'Walk the photo wall. Tap every glowing photo.',
      spots: [
        { id: 'lake', x: 14, y: 52, art: LAKE, who: 'Theo', line: 'Ava was at the lake.', label: 'The lake photo' },
        { id: 'hill', x: 32, y: 46, art: HILL, who: 'Theo', line: 'Ava and I were on the hill.', label: 'The hill photo' },
        { id: 'camp', x: 50, y: 52, art: CAMP, who: 'Vee', line: 'You camped there at night.', label: 'The camp photo' },
        { id: 'crowd', x: 68, y: 46, art: CROWD, who: 'Ava', line: 'Look at the crowd!', label: 'The crowd photo' },
        { id: 'wedding', x: 86, y: 52, art: WEDDING, who: 'Vee', line: 'It was a wedding!', label: 'The wedding photo' },
      ],
    },
    {
      id: 'gist', kind: 'convo', part: 2, stage: 'context', bg: 'club-lobby', actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Did you understand? Choose the answers.', me: 'Ava', meLabel: 'You', after: 'Yes! Ava has photos but cannot remember the weekend.',
      steps: [
        { ask: 'What does Ava not remember?', pic: PHOTO, options: [{ text: 'Last weekend.', ok: true }, { text: 'Her name.', hint: 'Ava remembers her name. She cannot remember the weekend.' }] },
        { ask: 'Was Ava at the lake?', pic: LAKE, options: [{ text: 'Yes, she was.', ok: true }, { text: 'No, she was not.', hint: 'Theo says: Ava was at the lake.' }] },
      ],
      hints: ['Think about the photos. What do they show?'],
    },
    {
      id: 'teach-places', kind: 'teach', part: 2, bg: 'club-lobby', actors: [who('Ava', 'left')], trains: [1, 2], title: 'The place words',
      pages: [
        { word: 'lake', art: LAKE, meaning: 'a big place with water, not the sea', example: 'Ava was at the lake.', clue: 'You can swim or fish in a lake.' },
        { word: 'hill', art: HILL, meaning: 'a small mountain', example: 'We were on the hill.', clue: 'You walk up a hill.' },
        { word: 'camp', art: CAMP, meaning: 'to sleep outside in a tent', example: 'We camped on the hill.', clue: 'camp + a tent + a fire.' },
        { word: 'crowd', art: CROWD, meaning: 'a lot of people in one place', example: 'Look at the crowd!', clue: 'A crowd is loud.' },
      ],
      hints: ['Listen to each word. Press “Show again” to hear it again.'],
    },
    {
      id: 'match-places', kind: 'match', part: 2, bg: 'club-lobby', actors: [who('Ava', 'right')], trains: [1, 2], mode: 'listen',
      prompt: 'Listen. Tap the picture for what you hear.',
      pairs: [{ word: 'lake', art: LAKE }, { word: 'hill', art: HILL }, { word: 'camp', art: CAMP }, { word: 'crowd', art: CROWD }],
      hints: ['Listen to the word, then look for its picture.'],
    },

    // ---------- 3 · Notice & Build: second game, model, rule, event words ----------
    {
      id: 'mem-places', kind: 'memory', part: 3, bg: 'club-lobby', actors: [who('Ava', 'left')], trains: [1, 2],
      prompt: 'Memory! Find each picture and its word.',
      pairs: [{ art: LAKE, text: 'lake' }, { art: HILL, text: 'hill' }, { art: CAMP, text: 'camp' }, { art: CROWD, text: 'crowd' }],
      hints: ['Flip two cards. Say the word when you find a pair.'],
    },
    {
      id: 'match-places-drag', kind: 'match', part: 3, flex: true, note: BONUS, bg: 'club-lobby', actors: [who('Theo', 'right')], trains: [1, 2],
      prompt: 'Drag each place word onto its picture.',
      pairs: [{ word: 'lake', art: LAKE }, { word: 'hill', art: HILL }, { word: 'camp', art: CAMP }, { word: 'crowd', art: CROWD }],
      hints: ['Grab a word, drag it to the picture. Tap a word to hear it.'],
    },
    {
      id: 'model-past', kind: 'model', part: 3, stage: 'model', bg: GAL, actors: [who('Vee', 'left'), who('Ava', 'center'), who('Theo', 'right')], trains: [3, 4],
      title: 'Listen: what happened last weekend?',
      lines: [
        { who: 'Ava', text: 'Last weekend I was at the lake.', pic: LAKE, frame: ['Last weekend I ', { slot: 'was', label: 'was / were' }, ' at the lake.'] },
        { who: 'Theo', text: 'We were on the hill.', pic: HILL, frame: ['We ', { slot: 'were', label: 'was / were' }, ' on the hill.'] },
        { who: 'Theo', text: 'We camped there at night.', pic: CAMP, frame: ['We ', { slot: 'camped', label: 'a verb + -ed' }, ' there at night.'] },
      ],
      closing: 'Now you know how it sounds. Next: the rule.',
    },
    {
      id: 'rule-past', kind: 'rule', part: 3, stage: 'rule', bg: GAL, actors: [who('Vee', 'left')], trains: [3],
      title: 'The rule: the past',
      lines: [
        { rule: 'last weekend, yesterday = the past', say: 'Last weekend and yesterday mean the past.', example: 'Last weekend I was at the lake.' },
        { rule: 'am, is → was · are → were', say: 'Am and is become was. Are becomes were.', example: 'We were at the wedding.' },
        { rule: 'a verb with -ed = the past', say: 'A verb with e d at the end tells us the past.', example: 'We camped on the hill.' },
      ],
      hints: ['Listen to each line, say it out loud, then tap “I said it”.'],
    },
    {
      id: 'teach-events', kind: 'teach', part: 3, bg: GAL, actors: [who('Ava', 'left')], trains: [2, 3], title: 'Five event words',
      pages: [
        { word: 'fishing', art: FISHING, meaning: 'catching fish with a rod', example: 'Fishing was fun.', clue: 'go fishing at a lake.' },
        { word: 'wedding', art: WEDDING, meaning: 'a big party when two people marry', example: 'The wedding was big.', clue: 'A wedding has a cake and a crowd.' },
        { word: 'celebrate', art: CELEBRATE, meaning: 'to have a party for something good', example: 'We celebrated at the wedding.', clue: 'celebrate + a party.' },
        { word: 'surprise', art: SURPRISE, meaning: 'something you do not expect', example: 'The party was a surprise.', clue: 'A surprise makes you say: Oh!' },
        { word: 'joke', art: JOKE, meaning: 'something funny you say', example: 'Theo made a joke.', clue: 'A joke makes people laugh.' },
      ],
      hints: ['Five words. Say each word after the guide.'],
    },
    {
      id: 'match-events', kind: 'match', part: 3, stage: 'controlled', bg: GAL, actors: [who('Ava', 'right')], trains: [2],
      prompt: 'Match each word with its picture. Drag it onto the picture.',
      pairs: [{ word: 'fishing', art: FISHING }, { word: 'wedding', art: WEDDING }, { word: 'celebrate', art: CELEBRATE }, { word: 'surprise', art: SURPRISE }, { word: 'joke', art: JOKE }],
      hints: ['Tap a word to hear it, then tap the picture.'],
    },
    {
      id: 'hear-events', kind: 'hearpick', part: 3, stage: 'controlled', bg: GAL, actors: [who('Vee', 'right')], trains: [3, 4],
      prompt: 'Which sentence do you hear? Tap it.',
      rounds: [
        { say: 'We were at the wedding.', options: ['We were at the wedding.', 'We are at the wedding.', 'We were at the lake.'], answer: 'We were at the wedding.' },
        { say: 'We camped on the hill.', options: ['We camp on the hill.', 'We camped on the hill.', 'We camped at the lake.'], answer: 'We camped on the hill.' },
      ],
      hints: ['Listen carefully. Was and am sound different. Camp and camped sound different.'],
    },
    {
      id: 'mem-events', kind: 'memory', part: 3, stage: 'controlled', flex: true, note: BONUS, bg: GAL, actors: [who('Ava', 'left')], trains: [2],
      prompt: 'Memory! Find each event picture and its word.',
      pairs: [{ art: FISHING, text: 'fishing' }, { art: WEDDING, text: 'wedding' }, { art: CELEBRATE, text: 'celebrate' }, { art: JOKE, text: 'joke' }],
      hints: ['Flip two cards. Say the word when you find a pair.'],
    },

    // ---------- 4 · Energiser ----------
    {
      id: 'shadow-events', kind: 'shadow', part: 4, stage: 'controlled', bg: 'detective-wall', actors: [who('Vee', 'right')], trains: [2],
      prompt: 'Whose shadow is it? Pick the word.',
      rounds: [
        { art: FISHING, answer: 'fishing', options: ['wedding', 'fishing', 'joke'] },
        { art: WEDDING, answer: 'wedding', options: ['wedding', 'surprise', 'fishing'] },
        { art: SURPRISE, answer: 'surprise', options: ['joke', 'celebrate', 'surprise'] },
      ],
      hints: ['Look at the shape. What is it?'],
    },
    {
      id: 'sort-was', kind: 'sort', part: 4, stage: 'free', bg: 'detective-wall', actors: [who('Theo', 'right', 'wave')], trains: [3, 4],
      prompt: 'Your own weekend: were you there? Tap a picture, then a box.',
      bins: [{ id: 'was', label: 'I was there', template: 'I was at the {w}.' }, { id: 'wasnt', label: 'I was not there', template: 'I was not at the {w}.' }],
      items: [{ id: 'lake', art: LAKE, word: 'lake' }, { id: 'hill', art: HILL, word: 'hill' }, { id: 'camp', art: CAMP, word: 'camp' }, { id: 'wedding', art: WEDDING, word: 'wedding' }],
      hints: ['There is no wrong answer. Put each picture where it is true for you.'],
    },

    // ---------- 5 · Mission: model first, then Take 1, feedback, Take 2 ----------
    { id: 'dial', kind: 'dial', part: 5, stage: 'produce', bg: GAL, actors: [who('Vee', 'right', 'thumbs')], prompt: 'Mission time! How much help do you want?' },
    {
      id: 'model-task', kind: 'model', part: 5, stage: 'model', bg: GAL, actors: [who('Ava', 'left'), who('Theo', 'right')], trains: [4, 5],
      title: 'Watch Theo do the mission first',
      lines: [
        { who: 'Ava', text: 'Theo, where was I last weekend?' },
        { who: 'Theo', text: 'I think you were at the lake.', pic: LAKE },
        { who: 'Ava', text: 'Why do you think that?' },
        { who: 'Theo', text: 'Look! This is the lake photo.' },
        { who: 'Ava', text: 'Good guess!' },
      ],
      closing: 'Now it is your turn.',
    },
    {
      id: 'build-guess', kind: 'build', part: 5, stage: 'controlled', bg: GAL, actors: [who('Ava', 'left')], trains: [4, 5],
      prompt: 'Warm up, together: build your lines. Tap the words in the right order.',
      rounds: [
        { cue: 'Say where Ava was.', target: 'Ava was at the lake.', extra: ['were', 'on'] },
        { cue: 'Say your guess.', target: 'I think Ava was on the hill.', extra: ['were', 'am'] },
      ],
      hints: ['Ava was. Then at or on, then the place.'],
    },
    {
      id: 'say-take1', kind: 'say', part: 5, stage: 'produce', bg: GAL, actors: [who('Theo', 'right', 'wave')], trains: [4, 5], open: true,
      prompt: 'Take 1 · Theo asks: Where was Ava? Say your guess.',
      model: 'I think Ava was at the lake.',
      byDial: { chill: 'Ava was at the lake.', normal: 'I think Ava was at the lake.', push: 'I think Ava was at the lake. Then she was at the wedding.' },
      hints: ['Say your own guess. Look at the rule if you need it.'],
    },
    {
      id: 'fade', kind: 'fade', part: 5, stage: 'produce', bg: GAL, actors: [who('Ava', 'left'), who('Theo', 'right')], trains: [3, 4],
      prompt: 'Feedback time! Say the lines again, with less help each round, before Take 2.',
      lines: [
        { who: 'Ava', text: 'I was at the lake.', keys: ['was', 'lake'] },
        { who: 'Theo', text: 'We camped on the hill.', keys: ['camped', 'hill'] },
        { who: 'Vee', text: 'The wedding was big.', keys: ['was', 'wedding'] },
      ],
    },
    {
      id: 'say-take2', kind: 'say', part: 5, stage: 'produce', bg: GAL, actors: [who('Theo', 'right')], trains: [4, 5], open: true,
      prompt: 'Take 2 · Start with hello for Theo, then say where you think Ava was and why.',
      model: 'Hello, Theo! I think Ava was at the lake. Look at the photo.',
      hints: ['Hello first, then I think Ava was, then the place.'],
    },

    // ---------- 6 · Release ----------
    {
      id: 'write', kind: 'write', part: 6, stage: 'produce', bg: 'club-signup-desk', actors: [who('Vee', 'right')], trains: [4, 5], stamp: 'guess',
      prompt: 'Write two lines for Ava. The model is hidden. Try first.',
      rows: [
        { label: 'Say where you think Ava was.', frame: 'I think Ava was at the ___.', accept: ['^i think ava was (at|on|in) .+'], hint: 'Start with I think Ava was. Example: I think Ava was at the lake.', sample: 'I think Ava was at the lake.' },
        { label: 'Say one place where you were.', frame: 'I was at the ___.', accept: ['^i was (at|on|in) .+'], hint: 'Start with I was. Example: I was at home.', sample: 'I was at home.' },
      ],
      hints: ['Use your own ideas.'],
    },
    {
      id: 'say-release', kind: 'say', part: 6, stage: 'produce', bg: 'club-signup-desk', actors: [who('Ava', 'left', 'happy')], trains: [4, 5],
      prompt: 'Voice note · Tell Ava where you think she was last weekend. Try without help first.',
      model: 'Hello, Ava! I think you were at the lake. I was at home last weekend.',
      hints: ['Press “Show me” if you want to see the line.'],
    },
    {
      id: 'recap-hear', kind: 'hearpick', part: 6, stage: 'review', bg: 'club-signup-desk', actors: [who('Vee', 'right')], trains: [3],
      prompt: 'Rule check! Which sentence is about the past? Tap it.',
      rounds: [
        { say: 'We were at the lake.', options: ['We are at the lake.', 'We were at the lake.', 'We go to the lake.'], answer: 'We were at the lake.' },
        { say: 'They camped on the hill.', options: ['They camp on the hill.', 'They camped on the hill.', 'They are on the hill.'], answer: 'They camped on the hill.' },
      ],
      hints: ['Listen for was, were or -ed.'],
    },

    // ---------- 7 · Wrap ----------
    {
      id: 'teach-back', kind: 'say', part: 7, stage: 'review', bg: GAL, actors: [who('Vee', 'right')], trains: [3],
      prompt: 'Teach-back · Tell Vee the rule in your own words. Then give one example.',
      model: 'Last weekend is the past. Am and is become was. Are becomes were. A verb with e d is the past. We camped on the hill.',
      hints: ['Say it like you teach a friend: was, were, and -ed.'],
    },
    {
      id: 'story-clue', kind: 'story', part: 7, stage: 'review', bg: GAL, trains: [1], title: 'Clue 1',
      beats: [{ plate: 'story-wk-4', lines: [{ who: 'Ava', text: 'Half a photo! Someone in a purple hoodie was at the lake. Who is it?' }] }],
    },
    {
      id: 'wrap', kind: 'wrap', part: 7, bg: GAL, actors: [who('Vee', 'left', 'thumbs')], heading: 'The wall is open!', ticks: CRITERIA,
      homework: 'Homework: send Ava one voice note: “I think you were at the ___.” Not yet is okay!',
      clue: 'Clue 1 of 8: half a photo at the lake, with a purple hoodie. Who could it be?',
    },
  ],
};
