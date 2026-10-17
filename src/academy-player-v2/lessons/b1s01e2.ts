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
  P('embarrassed', 'embarrassed', 'shy and uncomfortable because of something that happened', 'I was embarrassed when I dropped my tray.', 'A false friend for Spanish, French and Italian speakers: it does not mean pregnant.'),
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
  { id: 'mem-a', part: 2, kind: 'memory', plate: WALL, trains: [1], title: 'Memory: set A', pairs: mem(SET_A, 5).slice(0, 5) } satisfies MemoryScene,
  { id: 'teach-b', part: 2, kind: 'teach', plate: WALL, trains: [1, 2], title: 'Three feelings and two places, set B', who: 'Vee', pages: SET_B } satisfies TeachScene,
  { id: 'match-b', part: 2, kind: 'match', plate: WALL, trains: [1, 2], title: 'Read and match: set B', pairs: SET_B.map((p) => ({ left: p.word, right: gloss[p.word] })) } satisfies MatchScene,
  { id: 'mem-b', part: 2, kind: 'memory', plate: WALL, trains: [1, 2], title: 'Memory: set B', pairs: mem(SET_B, 5) } satisfies MemoryScene,

  { id: 'cause-sort', part: 3, kind: 'sort', plate: WALL, trains: [1], title: 'Cause or Feeling?', prompt: 'Is it a person who feels it, or a thing that makes you feel it?', bins: [
    { id: 'feel', label: 'FEELING', note: 'how a person feels' }, { id: 'cause', label: 'CAUSE', note: 'what makes the feeling' },
  ], items: [
    { id: 'c1', text: 'I was amazed.', bin: 'feel', hint: 'A person feels it: amazed.' },
    { id: 'c2', text: 'The view was amazing.', bin: 'cause', hint: 'The view makes you feel it: amazing.' },
    { id: 'c3', text: 'We were disappointed.', bin: 'feel', hint: 'People feel it: disappointed.' },
    { id: 'c4', text: 'The ending was disappointing.', bin: 'cause', hint: 'The ending is the thing that causes it: disappointing.' },
  ] } satisfies SortScene,
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
  partMinutes: [3, 5, 20, 12, 3, 8, 5, 4],
  scenes,
};
export default B1_S01_E2;
