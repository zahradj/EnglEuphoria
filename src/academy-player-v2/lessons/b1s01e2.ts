// B1-S01-E2 "Have You Ever...? · Word Lab" (feelings, places and activities), rebuilt for the player v2. Chapter 2 of the Season "Bucket list": the words.
// Plan (approved by the owner 2026-10-16): docs/academy-b1-s01-e2-plan.md. Research and game search: docs/research/academy-b1-s01-e2-research.md. Scenario: docs/scenarios/academy-b1s01e2-postcard-wall.md.
// Blueprint: ACADEMY_LESSON_BLUEPRINTS 'B1-S01-E2' (14 core productive items, no new structure; builds on E1). Three word sets, each followed by TWO different memorising games.
// Whole chunks are shown first, never reassembled from broken parts. Art note: story plate b1s2-2 shows a different Theo than the cast reference (artReview.ts: redo), so the story uses b1s2-1, the consistent club plate b1s1-3 and b1s2-3.
import type { LessonScript, SceneBase } from '../types';
import type { ComicScene } from '../scenes/comic/Comic';
import type { RuleScene } from '../scenes/rule/Rule';
import type { ModelScene } from '../scenes/model/Model';
import type { SortScene } from '../scenes/sort/Sort';
import type { ChoiceScene } from '../scenes/choice/Choice';
import type { MatchScene } from '../scenes/match/Match';
import type { BuildScene } from '../scenes/build/Build';
import type { SpeakScene } from '../scenes/speak/Speak';
import type { RapportScene } from '../scenes/rapport/Rapport';
import type { WriteScene } from '../scenes/write/Write';
import type { TeachScene, TeachPage } from '../scenes/teach/Teach';
import type { MemoryScene } from '../scenes/memory/Memory';
import type { WrapScene } from '../scenes/wrap/Wrap';
import type { LobbyScene } from '../scenes/lobby/Lobby';
import type { InspectScene } from '../scenes/inspect/Inspect';
import type { FinderScene } from '../scenes/finder/Finder';
import type { WorkshopScene } from '../scenes/workshop/Workshop';
import type { BeatsScene } from '../scenes/beats/Beats';

export const CRITERIA = [
  'I can say what each of the eight feeling words means and use it about myself: “I felt … because …”.',
  'I can use destination, attraction and countryside in a sentence about a trip.',
  'I can use go camping, go sightseeing and try something new in a sentence.',
  'I can describe a postcard so my partner finds it, using at least three new words.',
  'I can record a voice note with at least five of the words, an “I have …” sentence and a past-simple follow-up.',
];

const ROOM = 'travel-club-room';
const WALL = 'postcard-wall';
const TABLE = 'postcard-table';
const P = (word: string, art: string, meaning: string, example: string, clue?: string): TeachPage => ({ word, art: `w-${art}`, meaning, example, clue });
const SET_A: TeachPage[] = [
  P('excitement', 'excitement', 'a strong, happy feeling before something good', 'The excitement before my trip kept me awake.', 'You feel excitement before a big day.'),
  P('amazed', 'amazed', 'very surprised, in a good way', 'I was amazed when I saw the mountains.', 'You are amazed; the view is amazing.'),
  P('disappointed', 'disappointed', 'sad because something was not as good as you hoped', 'We were disappointed when the museum was closed.', 'You hoped for more.'),
  P('embarrassed', 'embarrassed', 'shy and uncomfortable because of something that happened', 'I was embarrassed when I dropped my tray.', 'A false friend for Spanish speakers: embarazada means pregnant, not embarrassed.'),
  P('proud', 'proud', 'happy about something you did, or about someone you care about', 'I was proud when I finished the hike.', 'You did something good.'),
];
const SET_B: TeachPage[] = [
  P('frightened', 'frightened', 'afraid', 'I was frightened at the top of the tower.', 'Stronger than nervous.'),
  P('relaxed', 'relaxed', 'calm and comfortable, not worried', 'I felt relaxed in the countryside.', 'No stress at all.'),
  P('grateful', 'grateful', 'thankful for something good that someone did', 'I am grateful to my friends for the trip.', 'You want to say thank you.'),
  P('destination', 'destination', 'the place you are going to', 'Our destination was a small village.', 'The end of the journey.'),
  P('attraction', 'attraction', 'a place that people visit for fun or interest', 'The tower is the city’s best attraction.', 'A reason to visit.'),
];
const SET_C: TeachPage[] = [
  P('countryside', 'countryside', 'land outside towns and cities, with fields and nature', 'We spent the weekend in the countryside.', 'Fields, farms and quiet.'),
  P('go camping', 'camping', 'to sleep outside for a night or more, for fun', 'We went camping near a lake.', 'Learn it as one piece: go camping.'),
  P('go sightseeing', 'sightseeing', 'to visit famous places in a town or city', 'We went sightseeing in Rome.', 'Learn it as one piece: go sightseeing.'),
  P('try something new', 'trynew', 'to do something for the first time', 'I want to try something new this summer.', 'Learn it as one piece: try something new.'),
];
const mem = (pages: TeachPage[], n: number) => pages.slice(0, n).map((p) => ({ art: p.art, text: p.word }));
const gloss: Record<string, string> = { excitement: 'a happy feeling before a good thing', amazed: 'very surprised, in a good way', disappointed: 'sad: it was not as good as you hoped', embarrassed: 'shy and uncomfortable', proud: 'happy about what you did', frightened: 'afraid', relaxed: 'calm, not worried', grateful: 'thankful', destination: 'the place you are going to', attraction: 'a place people visit' };

// the scenes carry the fields of their kind (heading, title, beats...), checked by `satisfies` and the registry validator
type Scene = SceneBase & Record<string, unknown>;
const scenes: Scene[] = [
  { id: 'lobby', part: 0, kind: 'lobby', plate: ROOM, heading: 'Word Lab', sub: 'Feelings, places and what you did · lesson 2' } satisfies LobbyScene,
  { id: 'lead-in', part: 0, kind: 'speak', plate: ROOM, trains: [1], title: 'Warm-up talk', who: 'Vee', turns: [
    { step: 'guided', prompt: 'Think of one moment on a trip or at an event. How did you feel? Say it in one or two sentences, any words you have.', model: 'Last summer I went to the beach with my cousins. It was great, and I felt really happy.' },
  ] } satisfies SpeakScene,

  { id: 'rem-say', part: 1, kind: 'build', plate: 'classroom-morning', trains: [3], title: 'Bucket-list recall', items: [
    { words: ['Have', 'you', 'ever', 'flown', 'in', 'a', 'plane'], hint: 'Have you ever + the past participle.' },
    { words: ['I', 'have', 'never', 'tried', 'surfing'], hint: 'I have never + tried.' },
  ] } satisfies BuildScene,
  { id: 'remember', part: 1, kind: 'choice', plate: 'classroom-morning', trains: [3], title: 'Remember?', questions: [
    { q: 'A list of things you want to do in your life is a…', options: ['bucket list', 'dare', 'trophy'], answer: 0 },
    { q: 'To “give it a go” means to…', options: ['try it', 'win it', 'tick it off'], answer: 0 },
  ] } satisfies ChoiceScene,

  { id: 'predict', part: 2, kind: 'speak', plate: WALL, trains: [1], title: 'Before you listen', who: 'Vee', turns: [
    { step: 'free', prompt: 'The Travel Club has a postcard wall. What do you think the postcards say? Guess in one sentence.' },
  ] } satisfies SpeakScene,
  { id: 'story-postcards', part: 2, kind: 'comic', plate: WALL, trains: [1, 2], title: 'The Postcard Wall', beats: [
    { plate: 'story-b1s2-1', caption: 'The Travel Club’s postcard wall.', spots: { Vee: { x: 58, y: 6, w: 34 } }, heads: { Vee: { x: 27, y: 14 } }, lines: [
      { who: 'Vee', text: 'Welcome to the Travel Club! Look at the postcard wall. Everyone sent a postcard from a bucket-list trip.' },
      { who: 'Vee', text: 'But I need the right words for every postcard. “Good” and “nice” are not enough!' },
    ] },
    { plate: 'story-b1s1-3', spots: { Ava: { x: 2, y: 4, w: 28 }, Theo: { x: 2, y: 38, w: 28 } }, heads: { Ava: { x: 63, y: 26 }, Theo: { x: 73, y: 18 } }, lines: [
      { who: 'Ava', text: 'My postcard is from the countryside. We stayed there for a weekend, and I felt so relaxed.' },
      { who: 'Ava', text: 'The view was amazing, and I was grateful that my cousin invited me.' },
      { who: 'Theo', text: 'Mine is from a big city. We went sightseeing, and my favorite attraction was an old tower.' },
      { who: 'Theo', text: 'At the top I was a little frightened, but I was proud that I did it.' },
    ] },
    { plate: 'story-b1s2-3', spots: { Mia: { x: 33, y: 2, w: 40 }, Vee: { x: 76, y: 4, w: 22 } }, heads: { Mia: { x: 66, y: 28 }, Vee: { x: 24, y: 22 } }, lines: [
      { who: 'Mia', text: 'I went camping with my family. I was embarrassed because I forgot my sleeping bag!' },
      { who: 'Mia', text: 'But I was proud when I finished the hike, and I would love to try something new every year.' },
      { who: 'Vee', text: 'Perfect. Where was your destination? What did you do? How did you feel? Let’s find the words.' },
    ] },
  ] } satisfies ComicScene,
  { id: 'listen-q', part: 2, kind: 'choice', plate: WALL, trains: [1, 2], title: 'What did you hear?', questions: [
    { q: 'Where did Ava go for her weekend?', options: ['To the countryside.', 'To a big city.', 'To the beach.'], answer: 0 },
    { q: 'What did Theo do in the city?', options: ['He went sightseeing.', 'He went camping.', 'He stayed at home.'], answer: 0 },
    { q: 'Why was Mia embarrassed?', options: ['She forgot her sleeping bag.', 'She lost her phone.', 'She was late.'], answer: 0 },
  ] } satisfies ChoiceScene,

  { id: 'teach-a', part: 2, kind: 'teach', plate: WALL, trains: [1], title: 'Five feelings, set A', who: 'Vee', pages: SET_A } satisfies TeachScene,
  { id: 'match-a', part: 2, kind: 'match', plate: WALL, trains: [1], title: 'Read and match: set A', pairs: SET_A.slice(0, 5).map((p) => ({ left: p.word, right: gloss[p.word] })) } satisfies MatchScene,
  { id: 'teach-b', part: 2, kind: 'teach', plate: WALL, trains: [1, 2], title: 'Three feelings and two places, set B', who: 'Vee', pages: SET_B } satisfies TeachScene,
  { id: 'match-b', part: 2, kind: 'match', plate: WALL, trains: [1, 2], title: 'Read and match: set B', pairs: SET_B.map((p) => ({ left: p.word, right: gloss[p.word] })) } satisfies MatchScene,

  { id: 'postcard-desk', part: 3, kind: 'inspect', plate: TABLE, trains: [1], title: 'Postcard Inspector', look: 'postcard', chief: 'Vee',
    intro: 'Welcome to the Postcard Desk. Every postcard has two lines from a diary. Check the feeling words against the rulebook, approve the card or fix it, then file the batch.',
    rules: [
      { id: 'r1', title: 'How I feel', text: 'A word ending in ed, like amazed or disappointed, says how a person feels.', example: 'I was amazed.' },
      { id: 'r2', title: 'What causes it', text: 'A word ending in ing, like amazing or disappointing, describes the thing that causes the feeling.', example: 'The view was amazing.' },
      { id: 'r3', fromBatch: 2, title: 'The reason', text: 'To give the reason for a feeling, use because.', example: 'I felt proud because I finished the hike.' },
    ],
    batches: [
      { title: 'First postcards', items: [
        { id: 'c1', from: 'Ravi', prop: { kind: 'photo', tone: 'tower', caption: 'The old tower' }, doc: ['The view from the tower was frightened.', 'I held the rail very tight.'],
          fault: { word: 'frightened', fixes: ['frightening', 'frighten', 'frightens'], correct: 'frightening', ruleId: 'r2', why: 'The view is the thing that causes the feeling, so we say frightening. A person is frightened.' },
          retry: { id: 'c1r', from: 'Hana', prop: { kind: 'photo', tone: 'city', caption: 'The long queue' }, doc: ['The queue was so embarrassed.', 'We waited for an hour.'], fault: { word: 'embarrassed', fixes: ['embarrassing', 'embarrass', 'embarrasses'], correct: 'embarrassing', ruleId: 'r2', why: 'The queue is the thing that causes the feeling, so we say embarrassing. A person is embarrassed.' } } },
        { id: 'c2', from: 'Lucia', prop: { kind: 'photo', tone: 'field', caption: 'The countryside' }, doc: ['I felt so relaxed in the countryside.', 'The quiet fields were relaxing.'], okWhy: 'Relaxed is how I feel. Relaxing describes the quiet fields that cause the feeling.', okFixes: ['relaxing', 'relax', 'relaxes'],
          retry: { id: 'c2r', from: 'Omar', prop: { kind: 'photo', tone: 'sea', caption: 'A boat trip' }, doc: ['I was grateful to my cousin for the trip.', 'The boat ride was amazing.'], okWhy: 'Grateful is how I feel. Amazing describes the boat ride that causes the feeling.', okFixes: ['amazed', 'amaze', 'amazes'] } },
        { id: 'c3', from: 'Mei', prop: { kind: 'photo', tone: 'city', caption: 'The museum door' }, doc: ['We were disappointing when the museum was closed.', 'We walked in the rain instead.'],
          fault: { word: 'disappointing', fixes: ['disappointed', 'disappoint', 'disappoints'], correct: 'disappointed', ruleId: 'r1', why: 'We are people, so we say how we feel: disappointed. The closed museum is disappointing.' },
          retry: { id: 'c3r', from: 'Ben', prop: { kind: 'photo', tone: 'sea', caption: 'The ferry' }, doc: ['I was embarrassing when I dropped my tray.', 'Everyone looked at me.'], fault: { word: 'embarrassing', fixes: ['embarrassed', 'embarrass', 'embarrasses'], correct: 'embarrassed', ruleId: 'r1', why: 'I am a person, so I say how I feel: embarrassed. The mistake was embarrassing.' } } },
      ] },
      { title: 'Second postcards', items: [
        { id: 'c4', from: 'Jo', prop: { kind: 'photo', tone: 'camp', caption: 'The lake camp' }, doc: ['I was so proud when I finished the hike.', 'The sunset was amazing.'], okWhy: 'Proud is how I feel. Amazing describes the sunset that causes the feeling.', okFixes: ['pride', 'proudly', 'prouder'],
          retry: { id: 'c4r', from: 'Nia', prop: { kind: 'photo', tone: 'hill', caption: 'The top of the hill' }, doc: ['I felt amazed at the top.', 'The view was amazing.'], okWhy: 'Amazed is how I feel. Amazing describes the view that causes the feeling.', okFixes: ['amazing', 'amaze', 'amazes'] } },
        { id: 'c5', from: 'Nina', prop: { kind: 'photo', tone: 'sea', caption: 'The sea at night' }, doc: ['The sea at night was amazed.', 'I could not stop looking.'],
          fault: { word: 'amazed', fixes: ['amazing', 'amaze', 'amazes'], correct: 'amazing', ruleId: 'r2', why: 'The sea is the thing that causes the feeling, so we say amazing. A person is amazed.' },
          retry: { id: 'c5r', from: 'Tess', prop: { kind: 'photo', tone: 'sea', caption: 'The coral reef' }, doc: ['The coral reef was amazed.', 'We swam there all morning.'], fault: { word: 'amazed', fixes: ['amazing', 'amaze', 'amazes'], correct: 'amazing', ruleId: 'r2', why: 'The reef is the thing that causes the feeling, so we say amazing. A person is amazed.' } } },
        { id: 'c6', from: 'Paul', prop: { kind: 'photo', tone: 'hill', caption: 'Dad at the top' }, doc: ['My dad was proud of me.', 'I felt grateful for his help.'], okWhy: 'Proud and grateful both say how a person feels.', okFixes: ['pride', 'proudly', 'proudest'],
          retry: { id: 'c6r', from: 'Kofi', prop: { kind: 'photo', tone: 'camp', caption: 'The class camp' }, doc: ['My teacher was proud of us.', 'We felt grateful for her help.'], okWhy: 'Proud and grateful both say how a person feels.', okFixes: ['pride', 'proudly', 'proudest'] } },
      ] },
      { title: 'Last postcards', items: [
        { id: 'c7', from: 'Zoe', prop: { kind: 'photo', tone: 'tower', caption: 'Three castles' }, doc: ['I felt grateful because the trip was amazed.', 'We saw three castles.'],
          fault: { word: 'amazed', fixes: ['amazing', 'amaze', 'amazes'], correct: 'amazing', ruleId: 'r2', why: 'The trip causes the feeling, so we say amazing. The reason after because describes the thing.' },
          retry: { id: 'c7r', from: 'Dev', prop: { kind: 'photo', tone: 'sea', caption: 'The beach' }, doc: ['I felt relaxed because the beach was relaxed.', 'We stayed all day.'], fault: { word: 'relaxed', occurrence: 1, fixes: ['relaxing', 'relax', 'relaxes'], correct: 'relaxing', ruleId: 'r2', why: 'The beach causes the feeling, so we say relaxing. I felt relaxed is right.' } } },
        { id: 'c8', from: 'Tariq', prop: { kind: 'photo', tone: 'city', caption: 'The museum' }, doc: ['The museum was disappointed, so we left early.', 'We found a cafe instead.'],
          fault: { word: 'disappointed', fixes: ['disappointing', 'disappoint', 'disappoints'], correct: 'disappointing', ruleId: 'r2', why: 'The museum is the thing that causes the feeling, so we say disappointing. We were disappointed.' },
          retry: { id: 'c8r', from: 'Lea', prop: { kind: 'photo', tone: 'city', caption: 'The cinema' }, doc: ['The ending was disappointed, so I stopped watching.', 'I read a book instead.'], fault: { word: 'disappointed', fixes: ['disappointing', 'disappoint', 'disappoints'], correct: 'disappointing', ruleId: 'r2', why: 'The ending is the thing that causes the feeling, so we say disappointing. I was disappointed.' } } },
        { id: 'c9', from: 'Yuki', prop: { kind: 'photo', tone: 'field', caption: 'The farm' }, doc: ['We felt grateful because my cousin invited us.', 'The countryside was lovely.'], okWhy: 'Grateful is how we feel, and because gives the reason.', okFixes: ['gratefully', 'gratitude', 'grates'],
          retry: { id: 'c9r', from: 'Abel', prop: { kind: 'photo', tone: 'hill', caption: 'The hike' }, doc: ['I felt proud because I finished the hike.', 'My legs were tired.'], okWhy: 'Proud is how I feel, and because gives the reason.', okFixes: ['pride', 'proudly', 'prouder'] } },
      ] },
    ],
    finale: { prompt: 'Now write a line for your own postcard: say how you felt and why.', frame: 'I felt … because …', accept: ['\\b(excitement|amazed|disappointed|embarrassed|proud|frightened|relaxed|grateful)\\b', '\\bbecause\\b'], hint: 'I felt + a feeling word, because + a reason.', sample: 'I felt proud because I finished the hike.' } } satisfies InspectScene,
  { id: 'model', part: 3, kind: 'model', plate: WALL, trains: [1, 2, 3], title: 'Watch Vee use the words', who: 'Vee', steps: [
    { phase: 'iDo', text: 'We went camping near a lake. I felt relaxed, and the view was amazing. Our destination was a small village.' },
    { phase: 'weDo', text: 'Say it with me: I felt relaxed. The view was amazing. Our destination was a small village.' },
    { phase: 'youDo', text: 'Now you: one sentence with a feeling and a reason.' },
  ] } satisfies ModelScene,
  { id: 'rule', part: 3, kind: 'rule', plate: WALL, trains: [1, 2, 3], title: 'Feelings, places and chunks', who: 'Vee', lines: [
    { rule: 'Words like amazed, proud and frightened say how a person feels.', example: 'I felt amazed.' },
    { rule: 'Go camping, go sightseeing and try something new are whole chunks: learn each one as one piece.', example: 'We went camping. I have been sightseeing in Rome.' },
    { rule: 'A destination is where you are going; an attraction is a place to visit; the countryside is land outside the city.', example: 'Our destination was the countryside.' },
  ] } satisfies RuleScene,
  { id: 'teach-c', part: 3, kind: 'teach', plate: WALL, trains: [2, 3], title: 'One place and three chunks, set C', who: 'Vee', pages: SET_C } satisfies TeachScene,
  // Wave 2 (owner "go" 2026-10-17, plan amendment 2): crafting the three chunks right after they are taught. Trains criterion 3.
  { id: 'workshop', part: 3, kind: 'workshop', plate: ROOM, trains: [3], title: 'Chunk Workshop', who: 'Mia',
    intro: 'Welcome to the Chunk Workshop. Every travel kit item needs a chunk. Pick one card for each half, decide if they fit, and press to snap them into one piece.',
    items: [
      { kit: 'tent', goal: 'Your kit has a tent. You want to sleep outside near a lake.', first: { options: ['go', 'do', 'make'], correct: 'go' }, second: { options: ['camping', 'sightseeing', 'something new'], correct: 'camping' },
        explainWrong: 'We say go camping. Do and make are not used with camping.', sentence: { stem: 'Last summer we ___ near a lake and slept in a tent.', accepts: ['\\bwent camping\\b'], hint: 'Last summer is finished, so the verb goes in the past: went camping.', sample: 'went camping' } },
      { kit: 'city map', goal: 'Your kit has a city map. You want to walk around and see the famous places.', first: { options: ['do', 'go', 'make'], correct: 'go' }, second: { options: ['something new', 'camping', 'sightseeing'], correct: 'sightseeing' },
        explainWrong: 'We say go sightseeing. Go is the verb for camping and sightseeing.', sentence: { stem: 'Tomorrow we are ___ in Rome.', accepts: ['\\bgoing sightseeing\\b'], hint: 'After “are” the verb needs -ing: going sightseeing.', sample: 'going sightseeing' } },
      { kit: 'notebook', goal: 'Your kit has an empty notebook. You want to do something for the first time.', first: { options: ['make', 'try', 'go'], correct: 'try' }, second: { options: ['camping', 'sightseeing', 'something new'], correct: 'something new' },
        explainWrong: 'We say try something new. Try is the verb for a first time.', sentence: { stem: 'This summer I want to ___ and learn to surf.', accepts: ['\\btry something new\\b'], hint: 'After “want to” use the base verb: try something new.', sample: 'try something new' } },
    ] } satisfies WorkshopScene,
  { id: 'mem-c', part: 3, kind: 'memory', plate: WALL, trains: [2, 3], title: 'Memory: set C', pairs: mem(SET_C, 4) } satisfies MemoryScene,
  { id: 'build-c', part: 3, kind: 'build', plate: WALL, trains: [3], title: 'Collocation Builder', items: [
    { words: ['We', 'went', 'camping', 'near', 'the', 'lake'], hint: 'Go camping is one chunk: we went camping.' },
    { words: ['They', 'went', 'sightseeing', 'in', 'the', 'city'], hint: 'Go sightseeing is one chunk.' },
    { words: ['I', 'want', 'to', 'try', 'something', 'new', 'this', 'summer'], hint: 'Try something new is one chunk.' },
  ] } satisfies BuildScene,

  { id: 'mood', part: 4, kind: 'rapport', plate: TABLE, trains: [1, 4], title: 'Mood Postcards', npc: 'Theo', exchanges: [
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
  ] } satisfies RapportScene,

  // Wave 2: Stress Beats in the Energiser part. Trains criterion 1 (the feeling words, said with the right stress) and 5 (the voice note).
  { id: 'beats', part: 4, kind: 'beats', plate: 'classroom-morning', trains: [1, 5], title: 'Stress Beats', who: 'Theo',
    intro: 'Welcome to Stress Beats. Every long word has one strong part. Listen, tap the strong pad, then tap all the pads and hold the strong one a little longer. There is no timer.',
    items: [
      { word: 'embarrassed', syllables: ['em', 'bar', 'rassed'], stressIndex: 1, sentence: 'I was embarrassed when I dropped my tray.',
        pair: { word: 'embarrassing', syllables: ['em', 'bar', 'rass', 'ing'], sentence: 'Dropping my tray was embarrassing.' },
        l1Note: { generic: 'Embarrassed means shy and uncomfortable. In some languages a similar word means something else: Spanish embarazada means pregnant.',
          es: 'Cuidado: embarrassed no significa embarazada (pregnant). Significa avergonzado, con vergüenza. El acento va en la segunda sílaba: em-BAR-rassed.',
          fr: 'Embarrassed ressemble à « embarrassé », mais on dit surtout « gêné » ou « timide ». L’accent est sur la deuxième syllabe : em-BAR-rassed.',
          it: 'Embarrassed è vicino a “imbarazzato” e ha lo stesso significato. Attenzione all’accento sulla seconda sillaba: em-BAR-rassed.',
          ar: 'كلمة embarrassed تعني «محرج» أو «خجلان»، وليست «حامل». النبر على المقطع الثاني: em-BAR-rassed.',
          tr: 'Embarrassed, “utanmış” veya “mahcup” demektir. Vurgu ikinci hecede: em-BAR-rassed.' } },
      { word: 'disappointed', syllables: ['dis', 'ap', 'point', 'ed'], stressIndex: 2, sentence: 'We were disappointed when the museum was closed.',
        pair: { word: 'disappointing', syllables: ['dis', 'ap', 'point', 'ing'], sentence: 'The closed museum was disappointing.' },
        l1Note: { generic: 'The -ed ending is not a full syllable in the middle of the word: dis-ap-POINT-ed, with the strong part on point.',
          es: 'El acento va en la tercera sílaba: dis-ap-POINT-ed. No pronuncies la -e- de -ed como una sílaba aparte.',
          fr: 'L’accent est sur la troisième syllabe : dis-ap-POINT-ed. Ne prononcez pas « ed » comme une syllabe forte.',
          it: 'L’accento è sulla terza sillaba: dis-ap-POINT-ed. La finale -ed è debole.',
          ar: 'النبر على المقطع الثالث: dis-ap-POINT-ed. نهاية -ed ضعيفة.',
          tr: 'Vurgu üçüncü hecede: dis-ap-POINT-ed. Sondaki -ed zayıf kalır.' } },
      { word: 'frightened', syllables: ['fright', 'ened'], stressIndex: 0, sentence: 'I was frightened at the top of the tower.',
        pair: { word: 'frightening', syllables: ['fright', 'en', 'ing'], sentence: 'The view from the tower was frightening.' } },
      { word: 'destination', syllables: ['des', 'ti', 'na', 'tion'], stressIndex: 2, sentence: 'Our destination was a small village.' },
      { word: 'attraction', syllables: ['at', 'trac', 'tion'], stressIndex: 1, sentence: 'The tower is the city’s best attraction.' },
    ] } satisfies BeatsScene,
  { id: 'mission-model', part: 5, kind: 'model', plate: TABLE, trains: [4], title: 'Watch Vee describe a postcard', who: 'Vee', steps: [
    { phase: 'iDo', text: 'I picked a postcard from the countryside. I felt so relaxed there, and the view was amazing. It was our destination for the weekend, and I am grateful that I went.' },
    { phase: 'weDo', text: 'Three steps: the place, what you did, how you felt. Say it with me: It was our destination. We went camping. I felt relaxed.' },
    { phase: 'youDo', text: 'Now you describe a postcard. Use at least three new words, and I will guess which one it is.' },
  ] } satisfies ModelScene,
  { id: 'workbench', part: 5, kind: 'write', plate: TABLE, trains: [1, 2, 3, 5], title: 'Word Workbench', prompt: 'Craft three sentence cards about your own life: a feeling and a reason, a place, and a chunk.', rows: [
    { label: 'A feeling and a reason.', frame: 'I felt … because …', accept: ['\\b(excited|excitement|amazed|disappointed|embarrassed|proud|frightened|relaxed|grateful)\\b', '\\bbecause\\b'], hint: 'I felt + a feeling word, because + a reason.', sample: 'I felt proud because I finished my first hike.' },
    { label: 'A place from a trip.', frame: 'My destination was … / The best attraction was …', accept: ['\\b(destination|attraction|countryside)\\b'], hint: 'Use destination, attraction or countryside.', sample: 'The best attraction was an old tower in the city.' },
    { label: 'A chunk about you.', frame: 'I went camping … / I have been sightseeing … / I want to try something new …', accept: ['\\b(go camping|went camping|gone camping|been camping|go sightseeing|went sightseeing|been sightseeing|gone sightseeing|try something new|tried something new)\\b'], hint: 'Use go camping, go sightseeing or try something new.', sample: 'I want to try something new this summer.' },
  ] } satisfies WriteScene,
  // Wave 2: Postcard Finder before the Mission speak scene. Trains criterion 4 (describe a postcard with at least three new words).
  { id: 'finder', part: 5, kind: 'finder', plate: WALL, trains: [4], title: 'Postcard Finder', partner: 'Ava',
    intro: 'Welcome to Postcard Finder. Six postcards look almost the same. First I give you a clue and you find my postcard. Then we swap, and you give me the clue.',
    buildLine: 'Now you give the clue. Choose words that fit your secret postcard, and I will pick one.',
    askLine: 'Hmm, is it this one?',
    foundLine: 'Yes, that is the one. Great clue!',
    grids: [
      { id: 'f1', mode: 'find', targetId: 'a', trapId: 'b',
        cards: [
          { id: 'a', place: 'city', feeling: 'amazed', chunk: 'went sightseeing', details: ['tower', 'flag'], tone: 'tower' },
          { id: 'b', place: 'city', feeling: 'amazed', chunk: 'went sightseeing', details: ['bridge', 'bus'], tone: 'city' },
          { id: 'c', place: 'city', feeling: 'frightened', chunk: 'went sightseeing', details: ['tower', 'flag'], tone: 'tower' },
          { id: 'd', place: 'countryside', feeling: 'amazed', chunk: 'went camping', details: ['tent', 'lake'], tone: 'field' },
          { id: 'e', place: 'beach', feeling: 'amazed', chunk: 'tried something new', details: ['boat', 'sun'], tone: 'sea' },
          { id: 'f', place: 'countryside', feeling: 'relaxed', chunk: 'went camping', details: ['tent', 'fire'], tone: 'camp' },
        ],
        clues: [
          { text: 'I felt amazed.', tags: ['amazed'] },
          { text: 'It was a city, and we went sightseeing.', tags: ['city', 'went sightseeing'] },
          { text: 'There is a tower and a flag.', tags: ['tower', 'flag'] },
        ] },
      { id: 'f2', mode: 'build', targetId: 'a', trapId: 'b', minNewWords: 3, clueText: 'It was in the countryside, we went camping, and I felt relaxed.',
        cards: [
          { id: 'a', place: 'countryside', feeling: 'relaxed', chunk: 'went camping', details: ['tent', 'lake'], tone: 'camp' },
          { id: 'b', place: 'countryside', feeling: 'relaxed', chunk: 'went camping', details: ['fire', 'tree'], tone: 'field' },
          { id: 'c', place: 'countryside', feeling: 'grateful', chunk: 'went camping', details: ['tent', 'lake'], tone: 'camp' },
          { id: 'd', place: 'city', feeling: 'relaxed', chunk: 'went sightseeing', details: ['cafe', 'bridge'], tone: 'city' },
          { id: 'e', place: 'beach', feeling: 'relaxed', chunk: 'tried something new', details: ['boat', 'sun'], tone: 'sea' },
          { id: 'f', place: 'hill', feeling: 'proud', chunk: 'went camping', details: ['tent', 'flag'], tone: 'hill' },
        ],
        chips: [
          { id: 'relaxed', text: 'I felt relaxed', group: 'feeling', tag: 'relaxed', isNew: true },
          { id: 'grateful', text: 'I felt grateful', group: 'feeling', tag: 'grateful', isNew: true },
          { id: 'proud', text: 'I felt proud', group: 'feeling', tag: 'proud', isNew: true },
          { id: 'country', text: 'in the countryside', group: 'place', tag: 'countryside', isNew: true },
          { id: 'city', text: 'in the city', group: 'place', tag: 'city' },
          { id: 'camp', text: 'we went camping', group: 'chunk', tag: 'went camping', isNew: true },
          { id: 'sight', text: 'we went sightseeing', group: 'chunk', tag: 'went sightseeing', isNew: true },
          { id: 'tent', text: 'a tent', group: 'detail', tag: 'tent' },
          { id: 'lake', text: 'a lake', group: 'detail', tag: 'lake' },
          { id: 'boat', text: 'a boat', group: 'detail', tag: 'boat' },
          { id: 'fire', text: 'a fire', group: 'detail', tag: 'fire' },
        ],
        acceptedChips: ['relaxed', 'country', 'camp', 'tent', 'lake'] },
      { id: 'f3', mode: 'build', targetId: 'a', trapId: 'b', minNewWords: 1, clueText: 'It was a beach, and I tried something new. There is a boat and the sun.',
        cards: [
          { id: 'a', place: 'beach', feeling: 'grateful', chunk: 'tried something new', details: ['boat', 'sun'], tone: 'sea', forbidden: ['grateful'] },
          { id: 'b', place: 'beach', feeling: 'grateful', chunk: 'tried something new', details: ['fire', 'tree'], tone: 'sea' },
          { id: 'c', place: 'beach', feeling: 'proud', chunk: 'tried something new', details: ['boat', 'flag'], tone: 'sea' },
          { id: 'd', place: 'hill', feeling: 'grateful', chunk: 'tried something new', details: ['flag', 'sun'], tone: 'hill' },
          { id: 'e', place: 'city', feeling: 'grateful', chunk: 'went sightseeing', details: ['cafe', 'bus'], tone: 'city' },
          { id: 'f', place: 'countryside', feeling: 'grateful', chunk: 'went camping', details: ['tent', 'lake'], tone: 'camp' },
        ],
        chips: [
          { id: 'grateful', text: 'I felt grateful', group: 'feeling', tag: 'grateful', isNew: true },
          { id: 'proud', text: 'I felt proud', group: 'feeling', tag: 'proud', isNew: true },
          { id: 'amazed', text: 'I felt amazed', group: 'feeling', tag: 'amazed', isNew: true },
          { id: 'beach', text: 'at the beach', group: 'place', tag: 'beach' },
          { id: 'city', text: 'in the city', group: 'place', tag: 'city' },
          { id: 'trynew', text: 'I tried something new', group: 'chunk', tag: 'tried something new', isNew: true },
          { id: 'camp', text: 'we went camping', group: 'chunk', tag: 'went camping', isNew: true },
          { id: 'boat', text: 'a boat', group: 'detail', tag: 'boat' },
          { id: 'sun', text: 'the sun', group: 'detail', tag: 'sun' },
          { id: 'fire', text: 'a fire', group: 'detail', tag: 'fire' },
        ],
        acceptedChips: ['grateful', 'beach', 'trynew', 'boat', 'sun'] },
    ] } satisfies FinderScene,
  { id: 'take', part: 5, kind: 'speak', plate: TABLE, trains: [4, 5], title: 'Mission: describe a postcard', who: 'Ava', turns: [
    { step: 'guided', prompt: 'Take 1. Describe a postcard so I can find it: where it is, what you did and how you felt. About a minute.', model: 'My postcard is from the countryside. It was our destination. We went camping and I felt relaxed because it was quiet.' },
    { step: 'free', prompt: 'Take 2, a new listener: Theo is listening now. Say it again with the fixes, then answer his question: “When did you go?” (the past simple, with a time).', model: 'I went last summer.' },
  ] } satisfies SpeakScene,

  { id: 'my-words', part: 6, kind: 'write', plate: 'locker-hall', trains: [5], title: 'My words', prompt: 'Write the two sentences you will keep: an experience and a follow-up.', rows: [
    { label: 'An experience (up to now, no time).', frame: 'I have (never) …', accept: ['\\bi(’|\')?(ve| have)\\b'], hint: 'I have + a past participle: I have been … / I have never tried …', sample: 'I have never been camping in the rain.' },
    { label: 'A follow-up story (finished time).', frame: 'It was … / I went … last …', accept: ['\\b(was|were|went|did|last|ago|yesterday|in \\d{4})\\b'], hint: 'A finished time: last summer, two years ago.', sample: 'I went last August, and I felt really proud.' },
  ] } satisfies WriteScene,
  { id: 'release', part: 6, kind: 'speak', plate: 'locker-hall', trains: [4, 5], title: 'Release: my words', who: 'Vee', turns: [
    { step: 'free', prompt: 'Record a voice note, “my words”, privately first. About 40 seconds: at least five of the new words, one “I have” sentence about an experience and one follow-up in the past simple with a time.', model: 'I have been to the countryside, and I felt so relaxed. Our destination was a small village. I went last August, and I was proud because I tried something new.' },
  ] } satisfies SpeakScene,

  { id: 'wrap', part: 7, kind: 'wrap', plate: WALL, heading: 'Your postcard is on the wall!', teachBack: 'What do words like amazed and proud say, and what is a chunk like go camping?' } satisfies WrapScene,
];

export const B1_S01_E2: LessonScript = {
  blueprintId: 'B1-S01-E2',
  title: 'Have You Ever...? · Word Lab',
  criteria: CRITERIA,
  cast: ['Vee', 'Ava', 'Theo', 'Mia'],
  partMinutes: [3, 4, 16, 13, 5, 11, 4, 4],
  scenes,
};
export default B1_S01_E2;
