// B1-S01-E3 "Have You Ever...? · Pattern Lab" (present perfect: experience, ever / never / been), rebuilt for the player v2. Chapter 3 of the Season "Bucket list": the pattern.
// Plan (approved by the owner 2026-10-16): docs/academy-b1-s01-e3-plan.md. Research and game search: docs/research/academy-b1-s01-e3-research.md. Scenario: docs/scenarios/academy-b1s01e3-missing-postcard.md.
// Blueprint: ACADEMY_LESSON_BLUEPRINTS 'B1-S01-E3' (8 chunks, ONE structure; cast Vee and Theo). Task first, rule after (guided discovery): the Case Board sort comes BEFORE the rule.
// Art note: story plate b1s3-3 shows a different Theo than the cast reference (artReview.ts: redo), so the story uses b1s3-1, the regenerated b1s3-2 and the consistent club plate b1s1-3.
import type { LessonScript, SceneBase } from '../types';
import type { ComicScene } from '../scenes/comic/Comic';
import type { RuleScene } from '../scenes/rule/Rule';
import type { ModelScene } from '../scenes/model/Model';
import type { SortScene } from '../scenes/sort/Sort';
import type { ChoiceScene } from '../scenes/choice/Choice';
import type { BuildScene } from '../scenes/build/Build';
import type { SpeakScene } from '../scenes/speak/Speak';
import type { RapportScene } from '../scenes/rapport/Rapport';
import type { WriteScene } from '../scenes/write/Write';
import type { MatchScene } from '../scenes/match/Match';
import type { MemoryScene } from '../scenes/memory/Memory';
import type { ForgeScene } from '../scenes/forge/Forge';
import type { WrapScene } from '../scenes/wrap/Wrap';
import type { LobbyScene } from '../scenes/lobby/Lobby';
import type { HuntScene } from '../scenes/hunt/Hunt';

export const CRITERIA = [
  'I can build a correct “I have / I have never + participle” sentence from the parts.',
  'I can ask “Have you ever + participle …?” and answer “Yes, I have.” or “No, I haven’t.”',
  'I can choose been or gone for a short scene and say why.',
  'I can tell an “up to now” sentence from a “finished time” sentence and follow an experience with a past simple question (When did you …?).',
  'I can write and say five sentences of my own about my experiences with the pattern.',
];

const LIB = 'library-case-room';
const BOARD = 'case-board';
const WALL = 'detective-wall';
// the scenes carry the fields of their kind (heading, title, beats...), checked by `satisfies` and the registry validator
type Scene = SceneBase & Record<string, unknown>;
const scenes: Scene[] = [
  { id: 'lobby', part: 0, kind: 'lobby', plate: LIB, heading: 'Pattern Lab', sub: 'The Missing Postcard · lesson 3' } satisfies LobbyScene,
  { id: 'lead-in', part: 0, kind: 'speak', plate: LIB, trains: [2], title: 'Warm-up talk', who: 'Vee', turns: [
    { step: 'guided', prompt: 'Tell me one thing you have done that most people have not. One or two sentences, any words you have.', model: 'I have swum with a dolphin. I think most people have not!' },
  ] } satisfies SpeakScene,

  { id: 'rem-never', part: 1, kind: 'build', plate: 'classroom-morning', trains: [1], title: 'Never Have I Ever', items: [
    { words: ['I', 'have', 'never', 'flown', 'in', 'a', 'plane'], hint: 'I have never + the past participle: flown.' },
    { words: ['I', 'have', 'never', 'eaten', 'octopus'], hint: 'I have never + eaten.' },
  ] } satisfies BuildScene,
  { id: 'remember', part: 1, kind: 'choice', plate: 'classroom-morning', trains: [1], title: 'Remember?', questions: [
    { q: 'The past participle of “fly” is…', options: ['flown', 'flew', 'flied'], answer: 0, why: 'Fly, flew, flown.' },
    { q: 'The past participle of “eat” is…', options: ['ate', 'eaten', 'eated'], answer: 1, why: 'Eat, ate, eaten.' },
    { q: 'Which means “once in your whole life, never”?', options: ['I have never tried it.', 'I did never try it.', 'I never have tried it.'], answer: 0, why: 'I have never + participle.' },
  ] } satisfies ChoiceScene,

  { id: 'predict', part: 2, kind: 'speak', plate: LIB, trains: [4], title: 'Before you listen', who: 'Vee', turns: [
    { step: 'free', prompt: 'A postcard has disappeared from the club wall. Who do you think took it, and why? Guess in one sentence.' },
  ] } satisfies SpeakScene,
  { id: 'story-case', part: 2, kind: 'comic', plate: LIB, trains: [2, 4], title: 'The Missing Postcard', beats: [
    { plate: 'story-b1s3-1', caption: 'Vee’s Lisbon postcard is missing from the club’s case board.', spots: { Vee: { x: 50, y: 6, w: 28 } }, heads: { Vee: { x: 24, y: 14 } }, lines: [
      { who: 'Vee', text: 'Stop! My Lisbon postcard is gone from the wall. It was pinned right here this morning.', shout: true, sfx: 'GONE!' },
      { who: 'Vee', text: 'Detective, I need your help. I have a board of evidence. Please read it carefully.' },
    ] },
    { plate: 'story-b1s3-2', caption: 'Theo says where he has been. Listen for the pattern.', spots: { Theo: { x: 2, y: 10, w: 34 } }, heads: { Theo: { x: 72, y: 22 } }, lines: [
      { who: 'Theo', text: 'I have never been to Lisbon. I have been to Rome twice, but never to Portugal.' },
    ] },
    { plate: 'story-b1s1-3', spots: { Theo: { x: 2, y: 4, w: 28 }, Vee: { x: 2, y: 38, w: 28 } }, heads: { Theo: { x: 73, y: 18 }, Vee: { x: 42, y: 15 } }, lines: [
      { who: 'Vee', text: 'Hmm. Some sentences say when something happened. Others say what you have done in your life.', sfx: 'Hmm…' },
      { who: 'Theo', text: 'I am sure I have never taken a postcard!' },
    ] },
    { plate: 'story-b1s3-1', spots: { Vee: { x: 50, y: 6, w: 28 } }, heads: { Vee: { x: 24, y: 14 } }, lines: [
      { who: 'Vee', text: 'Let us see. Which cards say when, and which say something about your life up to now?' },
    ] },
  ] } satisfies ComicScene,
  { id: 'listen-q', part: 2, kind: 'choice', plate: LIB, trains: [2, 4], title: 'What did you hear?', questions: [
    { q: 'What is missing from the wall?', options: ['The Lisbon postcard.', 'The world map.', 'Theo’s notebook.'], answer: 0 },
    { q: 'Has Theo been to Rome?', options: ['Yes, twice.', 'No, never.', 'Yes, last summer.'], answer: 0 },
    { q: 'Has Theo been to Lisbon, he says?', options: ['No, never.', 'Yes, once.', 'Yes, twice.'], answer: 0 },
  ] } satisfies ChoiceScene,
  { id: 'evidence-hunt', part: 2, kind: 'hunt', plate: BOARD, trains: [3, 4], title: 'Evidence hunt: find the cards', who: 'Vee', aspect: 1376 / 768, intro: 'Detective, the evidence is on the case board. Read each clue, then find the card or the object it describes.', targets: [
    { id: 'globe', label: 'the globe', word: 'Evidence: the globe', clue: 'Theo says he has been to Rome twice. Find the object on the shelf that shows trips around the world.', reveal: 'Theo has been to Rome twice. He is back.', x: 0.9, y: 51, w: 13, h: 32 },
    { id: 'yellow', label: 'the yellow card', word: 'Evidence: yellow card', clue: 'Find the yellow card on the left side of the board.', reveal: 'The postcard has gone from the wall. It is not here now.', x: 16.6, y: 29, w: 8.3, h: 9.9 },
    { id: 'purple', label: 'the purple card', word: 'Evidence: purple card', clue: 'Find the purple card above the little plant, near the bottom of the board.', reveal: 'Ava has been to the library. She is back at her desk.', x: 27.8, y: 45.7, w: 7.6, h: 9.8 },
    { id: 'green-top', label: 'the green card at the top', word: 'Evidence: green card', clue: 'Find the green card at the top right of the board.', reveal: 'Vee has gone to the canteen. Her coat is still on the hook.', x: 56.7, y: 15.5, w: 7.7, h: 9 },
    { id: 'green-low', label: 'the green card at the bottom', word: 'Evidence: last card', clue: 'Find the green card at the bottom right, under the yellow card.', reveal: 'Nobody has seen the postcard since Friday.', x: 59.2, y: 53.4, w: 6.4, h: 8.6 },
  ], decoys: [
    { label: 'a white card', x: 40.5, y: 19.7, w: 6.8, h: 9.4 }, { label: 'a white card', x: 40.5, y: 39.5, w: 6.8, h: 9.7 }, { label: 'a white card', x: 29, y: 26.3, w: 8, h: 9.6 },
    { label: 'the plant', x: 20.3, y: 59.9, w: 8, h: 20 }, { label: 'the purple books', x: 68, y: 55, w: 14, h: 22 }, { label: 'the window cushion', x: 86, y: 63, w: 14, h: 22 },
  ] } satisfies HuntScene,
  { id: 'board-when', part: 2, kind: 'sort', plate: BOARD, trains: [4, 1], title: 'Detective Board', prompt: 'Pin each evidence card: does it say WHEN something happened, or what someone has done UP TO NOW?', bins: [
    { id: 'when', label: 'A FINISHED TIME', note: 'last summer, in July, yesterday' }, { id: 'now', label: 'UP TO NOW', note: 'have / has, ever, never' },
  ], items: [
    { id: 'e1', text: 'I have been to Rome twice.', bin: 'now', hint: 'have + been, and no time is said: an experience up to now.' },
    { id: 'e2', text: 'I went to Lisbon last summer.', bin: 'when', hint: '“Last summer” is a finished time, so it is the past simple.' },
    { id: 'e3', text: 'Have you ever flown in a plane?', bin: 'now', hint: '“Ever” asks about your whole life up to now.' },
    { id: 'e4', text: 'Ava flew home in July.', bin: 'when', hint: '“In July” is a finished time.' },
    { id: 'e5', text: 'She has never eaten sushi.', bin: 'now', hint: '“Never” means not once, up to now.' },
    { id: 'e6', text: 'They took the bus yesterday.', bin: 'when', hint: '“Yesterday” is a finished time.' },
    { id: 'e7', text: 'We have seen the sea.', bin: 'now', hint: 'have + seen, no time: an experience.' },
    { id: 'e8', text: 'He ate sushi two years ago.', bin: 'when', hint: '“Two years ago” is a finished time.' },
  ] } satisfies SortScene,

  { id: 'model', part: 3, kind: 'model', plate: BOARD, trains: [1, 2], title: 'Watch Vee build the pattern', who: 'Vee', steps: [
    { phase: 'iDo', text: 'Watch me. I have the parts: have, never, been, to, Lisbon. I have never been to Lisbon. Now a question: Have you ever been to Rome? Yes, I have. I went last summer, with my family.' },
    { phase: 'weDo', text: 'First the experience with have. Then the details, when and where, in the past simple. Say it with me: Have you ever been to Rome? Yes, I have.' },
    { phase: 'youDo', text: 'Now you: build the evidence.' },
  ] } satisfies ModelScene,
  { id: 'rule', part: 3, kind: 'rule', plate: BOARD, trains: [1, 2, 3, 4], title: 'The pattern', who: 'Vee', lines: [
    { rule: 'Have or has and a past participle tell an experience up to now, with no finished time.', example: 'I have flown. She has never eaten sushi.' },
    { rule: 'Never means not once. Ever, in a question, means at any time in your life.', example: 'Have you ever flown in a plane? Yes, I have. No, I haven’t.' },
    { rule: 'Been means went and came back. Gone means went and is still there. For the details, when and where, use the past simple.', example: 'I have been to Lisbon. I went last summer.' },
  ] } satisfies RuleScene,
  { id: 'build-evidence', part: 3, kind: 'build', plate: BOARD, trains: [1], title: 'Evidence Builder', items: [
    { words: ['I', 'have', 'been', 'to', 'Rome', 'twice'], hint: 'I have + been, and twice at the end.' },
    { words: ['She', 'has', 'never', 'eaten', 'sushi'], hint: 'She has (not have) + never + eaten.' },
    { words: ['Have', 'you', 'ever', 'flown', 'in', 'a', 'plane'], hint: 'Have you ever + flown.' },
    { words: ['We', 'have', 'seen', 'the', 'sea'], hint: 'have + seen.' },
    { words: ['He', 'has', 'gone', 'to', 'the', 'library'], hint: 'Still there: has gone.' },
  ] } satisfies BuildScene,
  { id: 'board-been', part: 3, kind: 'sort', plate: BOARD, trains: [3], title: 'Been or Gone?', prompt: 'Read the scene: did the person come back (been) or are they still away (gone)?', bins: [
    { id: 'been', label: 'BEEN', note: 'went and came back' }, { id: 'gone', label: 'GONE', note: 'went and is still there' },
  ], items: [
    { id: 'b1', text: 'He has ___ to the library. (He is back at his desk.)', bin: 'been', hint: 'He came back, so: been.', art: 'sc-bg-1' },
    { id: 'b2', text: 'He has ___ to the library. (His desk is empty.)', bin: 'gone', hint: 'He is still there, so: gone.', art: 'sc-bg-2' },
    { id: 'b3', text: 'Have you ever ___ to Paris?', bin: 'been', hint: 'With ever we say been.', art: 'sc-bg-3' },
    { id: 'b4', text: 'Vee has ___ to the canteen. (Her coat is on the hook.)', bin: 'gone', hint: 'She is not here now, so: gone.', art: 'sc-bg-4' },
    { id: 'b5', text: 'I have ___ to the sea twice.', bin: 'been', hint: 'A past experience that is over: been.', art: 'sc-bg-5' },
    { id: 'b6', text: 'The librarian has ___ home. (The door is closed.)', bin: 'gone', hint: 'She is not here now, so: gone.', art: 'sc-bg-6' },
  ] } satisfies SortScene,
  { id: 'match-qa', part: 3, kind: 'match', plate: BOARD, trains: [2], title: 'Read and match: question and answer', pairs: [
    { left: 'Have you ever flown in a plane?', right: 'Yes, I have.' }, { left: 'Has Theo ever eaten sushi?', right: 'No, he hasn’t.' },
    { left: 'Have they seen the sea?', right: 'Yes, they have.' }, { left: 'When did you go?', right: 'I went last summer.' },
  ] } satisfies MatchScene,
  { id: 'mem-scenes', part: 3, kind: 'memory', plate: BOARD, trains: [3], title: 'Memory: the been-or-gone pictures', pairs: [
    { art: 'sc-bg-1', text: 'back at his desk' }, { art: 'sc-bg-2', text: 'an empty desk' }, { art: 'sc-bg-3', text: 'pointing at the globe' },
    { art: 'sc-bg-4', text: 'coat on the hook' }, { art: 'sc-bg-5', text: 'class at the sea' }, { art: 'sc-bg-6', text: 'closed library door' },
  ] } satisfies MemoryScene,
  { id: 'build-ask', part: 3, kind: 'build', plate: BOARD, trains: [2, 4], title: 'Question Forge', items: [
    { words: ['Have', 'you', 'ever', 'been', 'to', 'Lisbon'], hint: 'Have you ever + been.' },
    { words: ['Yes', 'I', 'have'], hint: 'Yes, I have. Short and complete.' },
    { words: ['When', 'did', 'you', 'go'], hint: 'The details use the past simple: When did you go?' },
  ] } satisfies BuildScene,
  { id: 'report', part: 3, kind: 'choice', plate: BOARD, trains: [3, 4], title: 'The detective report', questions: [
    { q: 'Theo says he has ___ visited Lisbon.', options: ['never', 'ever', 'gone'], answer: 0, why: 'Never means not once.' },
    { q: 'I asked him whether he has ___ been to Portugal.', options: ['never', 'ever', 'did'], answer: 1, why: 'Ever, in a question, means at any time in your life.' },
    { q: 'Then I asked, “When ___ you go?”', options: ['have', 'did', 'has'], answer: 1, why: 'The details use the past simple with did.' },
  ] } satisfies ChoiceScene,

  { id: 'forge', part: 4, kind: 'forge', plate: 'trophy-case', trains: [1], title: 'Participle Forge', prompt: 'Forge the three forms of each verb, in order: base, past simple, past participle.', rounds: [
    { forms: ['eat', 'ate', 'eaten'] }, { forms: ['see', 'saw', 'seen'] }, { forms: ['be', 'was', 'been'] },
  ] } satisfies ForgeScene,
  { id: 'quickfire', part: 4, kind: 'choice', plate: 'classroom-morning', trains: [2], title: 'Quick-fire!', questions: [
    { q: 'Have you ever flown in a plane?', options: ['Yes, I have.', 'Yes, I fly.', 'Yes, I did flew.'], answer: 0 },
    { q: 'Have you ever been to Rome?', options: ['No, I haven’t.', 'No, I don’t.', 'No, I wasn’t.'], answer: 0 },
    { q: 'Has Theo ever eaten sushi?', options: ['Yes, he has.', 'Yes, he have.', 'Yes, he is.'], answer: 0 },
    { q: 'Have they ever seen the sea?', options: ['Yes, they have.', 'Yes, they has.', 'Yes, they did seen.'], answer: 0 },
  ] } satisfies ChoiceScene,

  { id: 'mission-model', part: 5, kind: 'model', plate: LIB, trains: [2, 4], title: 'Watch the detective question a suspect', who: 'Vee', steps: [
    { phase: 'iDo', text: 'Theo, have you ever been to Lisbon? … No, never. I have been to Rome twice. … Have you ever been to Portugal? … Hmm. Once. … When did you go? … I went last summer. … Aha! You said never, but you went last summer!' },
    { phase: 'weDo', text: 'You found the contradiction with a question and a follow-up. Say the two questions with me: Have you ever been to Portugal? When did you go?' },
    { phase: 'youDo', text: 'Now you are the detective.' },
  ] } satisfies ModelScene,
  { id: 'alibi', part: 5, kind: 'rapport', plate: WALL, trains: [2, 4], title: 'Alibi: question the suspect', npc: 'Theo', exchanges: [
    { say: 'I have never been to Lisbon. I have been to Rome twice.', options: [
      { text: 'Have you ever been to Portugal?', score: 2, reply: 'Hmm. Once. A long time ago.', note: 'A natural question with have you ever + been.' },
      { text: 'Did you ever go to Portugal?', score: 0, reply: 'Um, what do you mean?', note: 'For life experience use have you ever, not did you ever.' },
      { text: 'You have been to Lisbon last year?', score: 0, reply: 'That is a strange question.', note: 'Do not mix have with a finished time.' },
    ] },
    { say: 'Once. A long time ago. It was nothing special.', options: [
      { text: 'When did you go?', score: 2, reply: 'I went last summer. With my family.', note: 'The details use the past simple: When did you go?' },
      { text: 'When have you been?', score: 0, reply: 'Eh? Say that again.', note: 'Ask about a finished time with the past simple.' },
      { text: 'Where do you go?', score: 1, reply: 'Different places.', note: 'This asks about habit, not about the one trip.' },
    ] },
    { say: 'I went last summer. With my family. But I have never taken a postcard!', options: [
      { text: 'You said you had never been, but you went last summer!', score: 2, reply: 'Okay, okay. I took the postcard to copy the stamp. I am sorry, Vee!', note: 'You caught the contradiction.' },
      { text: 'Have you ever taken a postcard?', score: 1, reply: 'No, never! Well… only today.', note: 'Good question, but the contradiction is about the trip.' },
      { text: 'Where have you gone?', score: 0, reply: 'Many places.', note: 'Gone means still there. Use been, or the past simple for details.' },
    ] },
  ] } satisfies RapportScene,
  { id: 'take', part: 5, kind: 'speak', plate: LIB, trains: [2, 4, 5], title: 'Mission: question me', who: 'Theo', turns: [
    { step: 'guided', prompt: 'Take 1. Question me like a detective: three “Have you ever …?” questions, and a “When did you …?” follow-up to each yes. About a minute.', model: 'Have you ever flown in a plane? Yes, I have. When did you fly? I flew last year.' },
    { step: 'free', prompt: 'Take 2, a new suspect: Vee is the suspect now. Question her and find out one true thing she has done, and when.', model: 'Have you ever eaten snails? Yes, I have. When did you eat them? I ate them in France, two years ago.' },
  ] } satisfies SpeakScene,

  { id: 'my-sentences', part: 6, kind: 'write', plate: 'locker-hall', trains: [1, 5], title: 'My five sentences', prompt: 'Write three sentences about YOUR life: an experience with never, an experience with been, and a story with a finished time.', rows: [
    { label: 'Something you have never done.', frame: 'I have never …', accept: ['\\bnever\\b.*\\b(been|seen|eaten|flown|gone|taken|tried|done|had|met|won|written|read|swum|driven)\\b'], hint: 'I have never + a past participle.', sample: 'I have never flown in a plane.' },
    { label: 'A place you have been to.', frame: 'I have been to …', accept: ['\\b(i(’|\')?ve|i have) been\\b'], hint: 'I have been to + a place.', sample: 'I have been to the mountains twice.' },
    { label: 'A story with a finished time.', frame: 'I went … last … / I … in …', accept: ['\\b(last|ago|yesterday|in \\d{4}|in (january|february|march|april|may|june|july|august|september|october|november|december))\\b'], hint: 'A finished time: last summer, two years ago, in July.', sample: 'I went last winter.' },
  ] } satisfies WriteScene,
  { id: 'release', part: 6, kind: 'speak', plate: 'locker-hall', trains: [2, 5], title: 'Release: say your sentences', who: 'Vee', turns: [
    { step: 'free', prompt: 'Say your sentences out loud, privately first, then ask me one “Have you ever …?” question about something I might have done. About 40 seconds.', model: 'I have never flown in a plane. I have been to the mountains twice. I went last winter. Have you ever been to the mountains?' },
  ] } satisfies SpeakScene,

  { id: 'wrap', part: 7, kind: 'wrap', plate: LIB, heading: 'Case closed! The postcard is back on the wall.', teachBack: 'Have and a participle tell an experience up to now. When do we use the past simple instead?' } satisfies WrapScene,
];

export const B1_S01_E3: LessonScript = {
  blueprintId: 'B1-S01-E3',
  title: 'Have You Ever...? · Pattern Lab',
  criteria: CRITERIA,
  cast: ['Vee', 'Theo'],
  partMinutes: [3, 5, 12, 19, 3, 9, 5, 4],
  scenes,
  quest: {
    name: 'The Missing Postcard',
    stages: [
      { title: 'Case file opens', goal: 'Warm up and meet the case.' },
      { title: 'Remember?', goal: 'Never Have I Ever: bring back the pattern from last time.' },
      { title: 'The Missing Postcard', goal: 'Hear the story, hunt the evidence, sort the cards.' },
      { title: 'Pattern Lab', goal: 'Crack the pattern: have + participle, been or gone.' },
      { title: 'Power-up', goal: 'Forge participles and answer quick-fire questions.' },
      { title: 'The Alibi', goal: 'Question the suspect, then take your turn as the detective.' },
      { title: 'Release', goal: 'Write and say five sentences of your own.' },
      { title: 'Case closed', goal: 'Say the rule back to unlock your clue.' },
    ],
    clue: 'Theo says he has never been to Lisbon, but Vee’s Lisbon postcard has gone from the wall. Who took it?',
  },
};
export default B1_S01_E3;
