// B1-S01-E2 "Have You Ever...? · Word Lab" (feelings, places and activities), as a game deck on the run of show (3/5/20/12/3/8/5/4, re-split for this lesson).
// Plan (approved "go" 2026-10-16): docs/academy-b1-s01-e2-plan.md. Research and game search: docs/research/academy-b1-s01-e2-research.md.
// Blueprint: ACADEMY_LESSON_BLUEPRINTS id B1-S01-E2 (14 core productive items, no new structure; builds on E1). Scenario: docs/scenarios/academy-b1s01e2-postcard-wall.md.
// Student need: a B1 student who says "good / nice" for every experience. Fourteen words in three sets, each set followed by TWO different memorising games (owner rule 2026-10-12);
// the -ed / -ing contrast is a short noticing task (feelings vs causes), the -ing forms are passive gloss only. Whole chunks are shown first, never reassembled from broken parts (Boers).
// Pictures are placeholders (frames, letter tiles) until the owner approves the scenario and the art is made; voices are baked after the text is approved.
import type { DeckScript, TeachArt } from '../types';
import { card, who } from './kit';
import { ACADEMY_RECALL_NODES, MAX_REMEMBER_ITEMS } from '../../curriculum/academy';
import { recallRounds } from '../recallSlides';

export const OBJECTIVE = 'By the end I can use 14 new words and chunks to say how an experience felt and where I did what, in a one-minute voice note about my own experiences.';
export const CRITERIA = [
  'I can say what each of the eight feeling words means and use it about myself: “I felt … because …”.',
  'I can use destination, attraction and countryside in a sentence about a trip.',
  'I can use go camping, go sightseeing and try something new in a sentence.',
  'I can describe a postcard so my partner finds it, using at least three new words.',
  'I can record a voice note with at least five of the words, an “I have …” sentence and a past-simple follow-up.',
];
export const ITEMS = ['excitement', 'amazed', 'disappointed', 'embarrassed', 'proud', 'frightened', 'relaxed', 'grateful', 'destination', 'attraction', 'countryside', 'go camping', 'go sightseeing', 'try something new'];
const SET_A = ['excitement', 'amazed', 'disappointed', 'embarrassed', 'proud'];
const SET_B = ['frightened', 'relaxed', 'grateful', 'destination', 'attraction'];
const SET_C = ['countryside', 'go camping', 'go sightseeing', 'try something new'];

const ROOM = 'travel-club-room';
const WALL = 'postcard-wall';
const TABLE = 'postcard-table';
const CLASSROOM = 'classroom-morning';
const LIBRARY = 'locker-hall'; // bright school corridor for the Release pages (no separate library plate was made)
const ART: Record<string, TeachArt> = {
  excitement: card('w-excitement', 'a packed bag by the door, a big smile'),
  amazed: card('w-amazed', 'a wide-eyed face looking at a huge view'),
  disappointed: card('w-disappointed', 'a closed museum door and a sad face'),
  embarrassed: card('w-embarrassed', 'a red-faced student who dropped a tray'),
  proud: card('w-proud', 'a smiling hiker at the top of a hill'),
  frightened: card('w-frightened', 'a student gripping a high railing'),
  relaxed: card('w-relaxed', 'a student lying on the grass, calm'),
  grateful: card('w-grateful', 'a student saying thank you with a gift'),
  destination: card('w-destination', 'a signpost with a village name at the end of a road'),
  attraction: card('w-attraction', 'a famous tower with visitors'),
  countryside: card('w-countryside', 'green fields, a farm and hills'),
  'go camping': card('w-camping', 'a camp by a lake at sunset'),
  'go sightseeing': card('w-sightseeing', 'a group with a map in front of a monument'),
  'try something new': card('w-trynew', 'a student about to try a new activity'),
};
const pairs = (ws: string[]) => ws.map((w) => ({ word: w, art: ART[w] }));

export const B1_S01_E2: DeckScript = {
  lessonId: 'B1-S01-E2',
  level: 'B1',
  title: 'Have You Ever...? · Word Lab',
  objective: OBJECTIVE,
  criteria: CRITERIA,
  cast: ['Vee', 'Ava', 'Theo', 'Mia'],
  clock: true,
  theme: 'scene',
  // a vocabulary lesson: three word sets, each with two different memorising games, a short noticing task and the rule, then the postcard Mission and a private voice note
  partMinutes: [3, 5, 20, 12, 3, 8, 5, 4],
  partGoals: [
    'Tell me about a moment and how it felt',
    'Wake up your bucket-list words',
    'Hear the postcard story and meet the first ten words',
    'Feelings or causes, the rule, and the last four words',
    'Mood Postcards: which feeling fits?',
    'Craft your sentences and describe a postcard',
    'Record your voice note: my words',
    'Say the rule back and see what you can do',
  ],
  slides: [
    // ---------- 0 · Check-in ----------
    { id: 'title', kind: 'title', part: 0, bg: ROOM, actors: [who('Vee', 'center', 'wave')], heading: 'Word Lab', sub: 'Feelings, places and what you did · lesson 2' },
    {
      id: 'lead-in', kind: 'say', part: 0, stage: 'review', bg: ROOM, actors: [who('Vee', 'right')], trains: [1], open: true,
      prompt: 'Warm-up talk. Think of one moment on a trip or at an event. How did you feel? Say it in one or two sentences, any words you have.',
      model: 'Last summer I went to the beach with my cousins. It was great, and I felt really happy.',
      hints: ['One moment, one feeling. Today we find stronger words than “good” and “nice”.'],
    },
    {
      id: 'brief', kind: 'brief', part: 0, bg: ROOM, actors: [who('Vee', 'left')],
      say: 'Today you meet fourteen new words for feelings, places and things to do, play with them, and then describe a postcard so your partner can find it.', heading: 'Your mission card',
      stamps: [{ id: 'story', icon: 'chat', label: 'Hear the postcards' }, { id: 'words', icon: 'abc', label: 'Learn 14 words' }, { id: 'predict', icon: 'idcard', label: 'Describe a postcard' }],
    },

    // ---------- 1 · Remember? ----------
    {
      id: 'rem-recall', kind: 'hearpick', part: 1, stage: 'review', bg: CLASSROOM, actors: [who('Ava', 'right')], trains: [3],
      prompt: 'Remember? Which one do you hear? Tap it.',
      rounds: recallRounds(ACADEMY_RECALL_NODES, 'B1-S01-E2', 6, MAX_REMEMBER_ITEMS),
      hints: ['Listen, then look for the same words.'],
    },
    {
      id: 'rem-say', kind: 'build', part: 1, stage: 'review', optional: true, bg: CLASSROOM, actors: [who('Vee', 'right')], trains: [3],
      prompt: 'Bucket-list recall. Build a question for Vee with the words from last lesson, then say it out loud.',
      rounds: [
        { cue: 'Ask Vee about an experience with a plane.', target: 'Have you ever flown in a plane?', extra: ['flew', 'fly'] },
        { cue: 'Say what you have never done.', target: 'I have never tried surfing.', extra: ['tried', 'try'] },
      ],
      hints: ['Have you ever + the past participle? Say it after you build it.'],
    },

    // ---------- 2 · The Drop: predict, listen, then the first ten words ----------
    {
      id: 'predict', kind: 'say', part: 2, stage: 'context', bg: WALL, actors: [who('Vee', 'right')], trains: [1], open: true,
      prompt: 'Before you listen: the Travel Club has a postcard wall. What do you think the postcards say? Guess in one sentence.',
      model: 'I think the postcards are from trips. People write what they did and how they felt.',
      hints: ['There is no wrong answer. A guess helps you listen for the right words.'],
      note: 'Predict step (listen: predict, listen, compare, listen again, reflect). Do not correct the guess; come back to it after the story.',
    },
    {
      id: 'story-postcards', kind: 'story', part: 2, stage: 'context', listenFirst: true, bg: WALL, trains: [1, 2], title: 'The Postcard Wall',
      beats: [
        { plate: 'story-b1s2-1', lines: [
          { who: 'Vee', text: 'Welcome to the Travel Club! Look at the postcard wall. Everyone sent a postcard from a bucket-list trip.' },
          { who: 'Vee', text: 'But I need the right words for every postcard. “Good” and “nice” are not enough!' },
        ] },
        { plate: 'story-b1s2-2', lines: [
          { who: 'Ava', text: 'My postcard is from the countryside. We stayed there for a weekend, and I felt so relaxed.' },
          { who: 'Ava', text: 'The view was amazing, and I was grateful that my cousin invited me.' },
          { who: 'Theo', text: 'Mine is from a big city. We went sightseeing, and my favorite attraction was an old tower.' },
          { who: 'Theo', text: 'At the top I was a little frightened, but I was proud that I did it.' },
        ] },
        { plate: 'story-b1s2-3', lines: [
          { who: 'Mia', text: 'I went camping with my family. I was embarrassed because I forgot my sleeping bag!' },
          { who: 'Mia', text: 'But I was proud when I finished the hike, and I would love to try something new every year.' },
          { who: 'Vee', text: 'Perfect. Where was your destination? What did you do? How did you feel? Let’s find the words.' },
        ] },
      ],
    },
    {
      id: 'listen-q', kind: 'hearpick', part: 2, stage: 'context', bg: WALL, actors: [who('Theo', 'right')], trains: [1, 2],
      prompt: 'Listening check. Listen to each question about the postcards (the text is hidden), then choose the best answer.',
      rounds: [
        { say: 'Where did Ava go for her weekend?', options: ['To the countryside.', 'To a big city.', 'To the beach.'], answer: 'To the countryside.' },
        { say: 'What did Theo do in the city?', options: ['He went sightseeing.', 'He went camping.', 'He stayed at home.'], answer: 'He went sightseeing.' },
        { say: 'Why was Mia embarrassed?', options: ['She forgot her sleeping bag.', 'She lost her phone.', 'She was late.'], answer: 'She forgot her sleeping bag.' },
      ],
      hints: ['Listen again with the speaker button. Think about what each person said, not only the words.'],
      note: 'Reflect: was your guess close? Which words helped you answer? Ask the student, then move on.',
    },
    {
      id: 'teach-a', kind: 'teach', part: 2, stage: 'model', bg: WALL, actors: [who('Vee', 'left')], trains: [1], title: 'Five feelings, set A',
      pages: [
        { word: 'excitement', art: ART.excitement, meaning: 'a strong, happy feeling before something good', example: 'The excitement before my trip kept me awake.', clue: 'You feel excitement before a big day.' },
        { word: 'amazed', art: ART.amazed, meaning: 'very surprised, in a good way', example: 'I was amazed when I saw the mountains.', clue: 'You are amazed; the view is amazing.' },
        { word: 'disappointed', art: ART.disappointed, meaning: 'sad because something was not as good as you hoped', example: 'We were disappointed when the museum was closed.', clue: 'You hoped for more.' },
        { word: 'embarrassed', art: ART.embarrassed, meaning: 'shy and uncomfortable because of something that happened', example: 'I was embarrassed when I dropped my tray.', clue: 'A false friend for Spanish and Italian speakers: it does not mean “embarazada” or “imbarazzato”.' },
        { word: 'proud', art: ART.proud, meaning: 'happy about something you did, or about someone you care about', example: 'I was proud when I finished the hike.', clue: 'You did something good.' },
      ],
      hints: ['Listen to each word. Say it after the guide.'],
    },
    {
      id: 'match-a', kind: 'match', part: 2, stage: 'controlled', bg: WALL, actors: [who('Ava', 'right')], trains: [1], mode: 'listen',
      prompt: 'Listen. Tap the picture for the feeling you hear.',
      pairs: pairs(SET_A),
      hints: ['Listen to the word, then look for the picture.'],
    },
    {
      id: 'mem-a', kind: 'memory', part: 2, stage: 'controlled', bg: WALL, actors: [who('Vee', 'left')], trains: [1],
      prompt: 'Memory! Match each picture with its word.',
      pairs: SET_A.map((w) => ({ art: ART[w], text: w })),
      hints: ['Remember where you saw each picture.'],
    },
    {
      id: 'teach-b', kind: 'teach', part: 2, stage: 'model', bg: WALL, actors: [who('Vee', 'left')], trains: [1, 2], title: 'Three feelings and two places, set B',
      pages: [
        { word: 'frightened', art: ART.frightened, meaning: 'afraid', example: 'I was frightened at the top of the tower.', clue: 'Stronger than nervous.' },
        { word: 'relaxed', art: ART.relaxed, meaning: 'calm and comfortable, not worried', example: 'I felt relaxed in the countryside.', clue: 'No stress at all.' },
        { word: 'grateful', art: ART.grateful, meaning: 'thankful for something good that someone did', example: 'I am grateful to my friends for the trip.', clue: 'You want to say thank you.' },
        { word: 'destination', art: ART.destination, meaning: 'the place you are going to', example: 'Our destination was a small village.', clue: 'The end of the journey.' },
        { word: 'attraction', art: ART.attraction, meaning: 'a place that people visit for fun or interest', example: 'The tower is the city’s best attraction.', clue: 'A reason to visit.' },
      ],
      hints: ['Listen to each word. Say it after the guide.'],
    },
    {
      id: 'shadow-b', kind: 'shadow', part: 2, stage: 'controlled', bg: WALL, actors: [who('Theo', 'right')], trains: [1, 2],
      prompt: 'Shadow match! A dark shape of the picture. Pick the right word.',
      rounds: SET_B.map((w, i) => ({ art: ART[w], answer: w, options: [w, SET_B[(i + 1) % 5], SET_B[(i + 2) % 5]] })),
      hints: ['Think about the picture, then choose the word.'],
    },
    {
      id: 'match-b', kind: 'match', part: 2, stage: 'controlled', bg: WALL, actors: [who('Ava', 'right')], trains: [1, 2],
      prompt: 'Drag each word onto its picture.',
      pairs: pairs(SET_B),
      hints: ['Think about what each picture shows.'],
    },

    // ---------- 3 · Notice & Build: feelings or causes, the rule, the last four words ----------
    {
      id: 'cause-sort', kind: 'sort', part: 3, stage: 'model', bg: WALL, actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Cause or Feeling? Each sentence is about a person’s feeling or about the thing that causes it. Tap a sentence, then a box.',
      bins: [{ id: 'feel', label: 'How a person feels (a person)', template: '{w}' }, { id: 'cause', label: 'What causes the feeling (a thing)', template: '{w}' }],
      items: [
        { id: 'c1', word: 'I was amazed.' },
        { id: 'c2', word: 'The view was amazing.' },
        { id: 'c3', word: 'We were disappointed.' },
        { id: 'c4', word: 'The ending was disappointing.' },
      ],
      hints: ['Ask: is it a person who feels it, or a thing that makes you feel it?'],
    },
    {
      id: 'rule-words', kind: 'rule', part: 3, stage: 'rule', bg: WALL, actors: [who('Vee', 'right')], trains: [1, 2, 3],
      title: 'The rule',
      lines: [
        { rule: 'Words like amazed, proud and frightened say how a person feels.', say: 'Words like amazed, proud and frightened say how a person feels.', example: 'I felt amazed.' },
        { rule: 'Go camping, go sightseeing and try something new are whole chunks: learn each one as one piece.', say: 'Go camping, go sightseeing and try something new are whole chunks. Learn each one as one piece.', example: 'We went camping. I have been sightseeing in Rome.' },
        { rule: 'A destination is where you are going; an attraction is a place to visit; the countryside is land outside the city.', say: 'A destination is where you are going. An attraction is a place to visit. The countryside is land outside the city.', example: 'Our destination was the countryside.' },
      ],
    },
    {
      id: 'teach-c', kind: 'teach', part: 3, stage: 'model', bg: WALL, actors: [who('Vee', 'left')], trains: [2, 3], title: 'One place and three chunks, set C',
      pages: [
        { word: 'countryside', art: ART.countryside, meaning: 'land outside towns and cities, with fields and nature', example: 'We spent the weekend in the countryside.', clue: 'Fields, farms and quiet.' },
        { word: 'go camping', art: ART['go camping'], meaning: 'to sleep outside for a night or more, for fun', example: 'We went camping near a lake.', clue: 'Learn it as one piece: go camping.' },
        { word: 'go sightseeing', art: ART['go sightseeing'], meaning: 'to visit famous places in a town or city', example: 'We went sightseeing in Rome.', clue: 'Learn it as one piece: go sightseeing.' },
        { word: 'try something new', art: ART['try something new'], meaning: 'to do something for the first time', example: 'I want to try something new this summer.', clue: 'Learn it as one piece: try something new.' },
      ],
      hints: ['Listen to each word. Say it after the guide.'],
    },
    {
      id: 'mem-c', kind: 'memory', part: 3, stage: 'controlled', bg: WALL, actors: [who('Vee', 'left')], trains: [2, 3],
      prompt: 'Memory! Match each picture with its words.',
      pairs: SET_C.map((w) => ({ art: ART[w], text: w })),
      hints: ['Remember where you saw each picture.'],
    },
    {
      id: 'build-c', kind: 'build', part: 3, stage: 'controlled', bg: WALL, actors: [who('Ava', 'right')], trains: [3],
      prompt: 'Collocation Builder. The whole chunk is on the card. Build each sentence, then say it out loud.',
      rounds: [
        { cue: 'Sleep outside for fun, near a lake.', target: 'We went camping near the lake.', extra: ['camp', 'go'], hint: 'Go camping is one chunk: we went camping.' },
        { cue: 'Visit the famous places in the city.', target: 'They went sightseeing in the city.', extra: ['sightsee', 'sights'], hint: 'Go sightseeing is one chunk.' },
        { cue: 'Do something for the first time.', target: 'I want to try something new this summer.', extra: ['newly', 'tried'], hint: 'Try something new is one chunk.' },
      ],
    },
    {
      id: 'connect', kind: 'sort', part: 3, stage: 'controlled', optional: true, bg: WALL, actors: [who('Mia', 'right')], trains: [1, 2],
      prompt: 'Word Connections. Sort the words into the hidden groups: tap a word, then a box.',
      bins: [{ id: 'good', label: 'A good feeling', template: '{w} is a good feeling.' }, { id: 'hard', label: 'A difficult feeling', template: '{w} is a difficult feeling.' }, { id: 'where', label: 'A place or a plan', template: '{w} is a place or a plan.' }],
      items: [
        { id: 'k1', word: 'excitement' }, { id: 'k2', word: 'proud' }, { id: 'k3', word: 'relaxed' }, { id: 'k4', word: 'grateful' },
        { id: 'k5', word: 'embarrassed' }, { id: 'k6', word: 'frightened' }, { id: 'k7', word: 'disappointed' }, { id: 'k8', word: 'destination' },
      ],
      hints: ['Some words can fit two groups. Choose the box that feels best, and say why.'],
    },

    // ---------- 4 · Energiser: Mood Postcards ----------
    {
      id: 'mood', kind: 'rpg', part: 4, stage: 'controlled', bg: TABLE, actors: [who('Theo', 'right')], trains: [1, 4], npc: 'Theo', goal: 3,
      prompt: 'Mood Postcards! Theo shows a postcard. Choose the feeling that fits the picture best.',
      scenes: [
        { say: 'This postcard shows a person at the top of a very tall tower, holding the railing tight.', options: [
          { text: 'She was frightened.', score: 2, reply: 'Yes! Her hands tell the story.', note: 'Frightened fits the tight grip.' },
          { text: 'She was relaxed.', score: 0, reply: 'Hmm, relaxed people do not hold on so tight.', note: 'Relaxed means calm, not worried.' },
          { text: 'She was proud.', score: 1, reply: 'Maybe later, when she gets down!', note: 'Proud is possible afterwards, but the picture shows fear.' },
        ] },
        { say: 'This postcard shows a student on the grass in a quiet green field, with a book.', options: [
          { text: 'He was relaxed.', score: 2, reply: 'Exactly. Quiet and calm.', note: 'Relaxed fits the quiet field.' },
          { text: 'He was disappointed.', score: 0, reply: 'He does not look sad at all.', note: 'Disappointed means sad because it was not as good as hoped.' },
          { text: 'He was amazed.', score: 1, reply: 'He might be, but he is calm.', note: 'Amazed is a big surprise, which is not what the picture shows.' },
        ] },
        { say: 'This postcard shows a group at a closed museum door, looking at a sign.', options: [
          { text: 'They were disappointed.', score: 2, reply: 'Yes, they hoped for more.', note: 'Disappointed: it was not as good as they hoped.' },
          { text: 'They were grateful.', score: 0, reply: 'Hmm, for a closed door?', note: 'Grateful means thankful.' },
          { text: 'They were excited.', score: 1, reply: 'Maybe before they arrived!', note: 'Before the door, yes. At the door they are disappointed.' },
        ] },
      ],
      hints: ['Look at what the people are doing, then choose the feeling that fits.'],
    },

    // ---------- 5 · Mission: craft your sentences, then describe a postcard ----------
    { id: 'dial', kind: 'dial', part: 5, bg: WALL, actors: [who('Vee', 'right', 'thumbs')], prompt: 'Mission time! How much help do you want?' },
    {
      id: 'model-task', kind: 'model', part: 5, stage: 'model', bg: TABLE, actors: [who('Vee', 'left'), who('Ava', 'right')], trains: [4],
      title: 'Watch Vee describe a postcard',
      lines: [
        { who: 'Vee', text: 'I picked a postcard from the countryside. I felt so relaxed there, and the view was amazing.' },
        { who: 'Ava', text: 'Which postcard is it? Is it the one with the lake?' },
        { who: 'Vee', text: 'Yes! It was our destination for the weekend, and I am grateful that I went.' },
      ],
      closing: 'Now YOU describe a postcard. Use at least three new words, and I will guess which one it is.',
    },
    {
      id: 'workbench', kind: 'write', part: 5, stage: 'controlled', bg: TABLE, actors: [who('Mia', 'right')], trains: [1, 2, 3, 5],
      prompt: 'Word Workbench. Craft three sentence cards about your own life: collect a feeling, a reason, a place and a chunk.',
      rows: [
        { label: 'A feeling and a reason.', frame: 'I felt … because …', accept: ['\\b(excited|excitement|amazed|disappointed|embarrassed|proud|frightened|relaxed|grateful)\\b', '\\bbecause\\b'], hint: 'I felt + a feeling word, because + a reason.', sample: 'I felt proud because I finished my first hike.' },
        { label: 'A place from a trip.', frame: 'My destination was … / The best attraction was …', accept: ['\\b(destination|attraction|countryside)\\b'], hint: 'Use destination, attraction or countryside.', sample: 'The best attraction was an old tower in the city.' },
        { label: 'A chunk about you.', frame: 'I went camping … / I have been sightseeing … / I want to try something new …', accept: ['\\b(go camping|went camping|gone camping|been camping|go sightseeing|went sightseeing|been sightseeing|gone sightseeing|try something new|tried something new)\\b'], hint: 'Use go camping, go sightseeing or try something new.', sample: 'I want to try something new this summer.' },
      ],
    },
    {
      id: 'say-take1', kind: 'say', part: 5, stage: 'free', bg: TABLE, actors: [who('Ava', 'right')], trains: [4], open: true,
      prompt: 'Take 1 · Describe a postcard so Ava can find it: where it is, what you did and how you felt. About a minute.',
      model: 'My postcard is from … It was our destination. We went … and I felt … because …',
      byDial: { chill: 'My postcard is from … I felt … because …', normal: 'My postcard is from … It was our destination. We went … and I felt … because …', push: 'Describe the feeling without saying the word: “My hands were shaking, but I did it …”, then name it.' },
      hints: ['Three steps: the place, what you did, how you felt. Use three new words.'],
    },
    {
      id: 'fade', kind: 'fade', part: 5, stage: 'free', optional: true, bg: TABLE, actors: [who('Vee', 'left'), who('Ava', 'right')], trains: [4],
      prompt: 'Feedback time! Say the lines again, with less help each round, before Take 2.',
      lines: [
        { who: 'Vee', text: 'I felt so relaxed there, and the view was amazing.', keys: ['relaxed', 'amazing'] },
        { who: 'Vee', text: 'It was our destination for the weekend.', keys: ['destination', 'weekend'] },
      ],
    },
    {
      id: 'say-take2', kind: 'say', part: 5, stage: 'free', bg: TABLE, actors: [who('Theo', 'right')], trains: [4, 5], open: true,
      prompt: 'Take 2 · A new listener! Theo is listening now. Say it again with the fixes, then answer his question: “When did you go?” (the past simple, with a time).',
      model: 'My postcard is from the countryside. We went camping and I felt relaxed. Theo asks: When did you go? I went last summer.',
      hints: ['Use the fixes we noticed. Then answer Theo with the past simple and a time.'],
      note: 'Take 2 changes the listener: play Theo and ask one follow-up (When did you …?). It reuses the present perfect for the experience and the past simple for the finished time.',
    },

    // ---------- 6 · Release: my words (private first) ----------
    {
      id: 'my-words', kind: 'write', part: 6, stage: 'produce', bg: LIBRARY, actors: [who('Mia', 'right')], trains: [5],
      prompt: 'Write the two sentences you will keep: an experience and a follow-up.',
      rows: [
        { label: 'An experience (up to now, no time).', frame: 'I have (never) … ', accept: ['\\bi(’|\')?(ve| have)\\b'], hint: 'I have + a past participle: I have been … / I have never tried …', sample: 'I have never been camping in the rain.' },
        { label: 'A follow-up story (finished time).', frame: 'It was … / I went … last …', accept: ['\\b(was|were|went|did|last|ago|yesterday|in \\d{4})\\b'], hint: 'A finished time: last summer, two years ago.', sample: 'I went last August, and I felt really proud.' },
      ],
    },
    {
      id: 'say-release', kind: 'say', part: 6, stage: 'produce', bg: LIBRARY, actors: [who('Vee', 'right')], trains: [4, 5],
      prompt: 'Release: record a voice note, “my words”, privately first. About 40 seconds: use at least five of the new words, one “I have …” sentence about an experience and one follow-up in the past simple with a time.',
      model: 'I have been to the countryside, and I felt so relaxed. Our destination was a small village. I went last August, and I was proud because I tried something new.',
      hints: ['Three steps: the words, an “I have” sentence, then the story with a time.'],
    },

    // ---------- 7 · Wrap ----------
    {
      id: 'teach-back', kind: 'build', part: 7, stage: 'produce', bg: WALL, actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Teach Vee the rule. Tap the words in the right order, then say it out loud.',
      rounds: [{ cue: 'The feelings rule, in one sentence.', target: 'Words like amazed and proud say how a person feels.', extra: ['thing', 'chunks'] }],
      hints: ['Say the rule, then show it with: I felt amazed.'],
    },
    {
      id: 'wrap', kind: 'wrap', part: 7, bg: WALL, actors: [who('Vee', 'left', 'thumbs')], heading: 'Your postcard is on the wall!', ticks: CRITERIA,
      homework: 'Daily 10: say the 14 words with the pictures, then record a voice note: three sentences about a trip with a feeling, a place and one chunk. Not yet is okay!',
      clue: 'Clue 2 of 8: a new postcard has arrived with no picture and no name. What can you tell from the words alone?',
    },
  ],
};

export const SETS = { A: SET_A, B: SET_B, C: SET_C };
