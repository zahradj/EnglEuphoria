// B1-S01-E1 "Have You Ever...? · Cold Open", rebuilt for the player v2 (proof lesson). Chapter 1 of the Season "Bucket list": the dare.
// Plan (approved by the owner 2026-10-16): docs/academy-b1-s01-e1-plan-v3.md; research: docs/research/academy-b1-s01-research.md; blueprint: ACADEMY_LESSON_BLUEPRINTS 'B1-S01-E1'.
// Order = the run of show: check-in, Remember?, the Drop (story, words, reading), notice and rule, energiser, mission, release, wrap.
// Voice lines are spoken by the recorded clips (silent if a clip is missing). Pictures: public/academy-art/bg.
import type { LessonScript, SceneBase } from '../types';
import type { ComicScene } from '../scenes/comic/Comic';
import type { RuleScene } from '../scenes/rule/Rule';
import type { ModelScene } from '../scenes/model/Model';
import type { SortScene } from '../scenes/sort/Sort';
import type { ChoiceScene } from '../scenes/choice/Choice';
import type { MatchScene } from '../scenes/match/Match';
import type { BuildScene } from '../scenes/build/Build';
import type { SpeakScene } from '../scenes/speak/Speak';
import type { WrapScene } from '../scenes/wrap/Wrap';
import type { LobbyScene } from '../scenes/lobby/Lobby';

export const CRITERIA = [
  'I can follow a short blog post and answer questions about its main idea, its detail and what is not said.',
  'I understood the six new words: bucket list, dare, give it a go, once in a lifetime, tick it off, brave.',
  'I can say the three forms of nine verbs: base, past simple, past participle.',
  'I can choose between the past simple (a finished time) and the present perfect (an experience up to now), and write a question, an answer and a follow-up.',
  'I can speak for about a minute: say who has done the most and why, and write three sentences about my own list.',
];

export const BLOG: string[] = [
  'Last month my cousin dared me to write a bucket list, and I laughed. Honestly, I thought bucket lists were only for grown-ups.',
  'Then I counted what I have already done. I have flown across the world twice, I have slept in a tent in the rain, and I have eaten insects in Thailand. Last summer I went to Spain, and I even gave paragliding a go.',
  'The strange thing is that I have never felt brave. Brave people are not afraid, I used to think, but I was terrified before every one of those things. Now I believe it is the opposite: you are brave when you do it anyway.',
  'So this term I am going to tick off three more things, and one of them is a once in a lifetime trip. I have never tried surfing, and I have never performed on a stage.',
  'If you have a dare for yourself, write it down. You will probably regret the things you did not try more than the things you did.',
];

const L = 'library-case-room';
const scenes: SceneBase[] = [
  { id: 'lobby', part: 0, kind: 'lobby', plate: 'bucket-list-wall', heading: 'Have you ever…?', sub: 'Experiences and bucket lists · lesson 1' } satisfies LobbyScene,
  { id: 'lead-in', part: 0, kind: 'speak', plate: 'bucket-list-wall', trains: [5], title: 'Warm-up talk', who: 'Vee', turns: [
    { step: 'guided', prompt: 'Tell me one exciting thing you did in the last year, and one thing you have never done but would love to try. About 30 seconds.', model: 'Last year I went camping with my cousins and we swam in a lake. I have never been to a concert, but I would love to go to one.' },
  ] } satisfies SpeakScene,

  { id: 'remember', part: 1, kind: 'choice', plate: 'classroom-morning', trains: [4], title: 'Remember?', questions: [
    { q: 'Yesterday I ___ to the cinema with my cousin.', options: ['went', 'gone', 'go', 'have been'], answer: 0, why: 'Yesterday is a finished time, so we use the past simple.' },
    { q: 'What is the past simple of “eat”?', options: ['ate', 'eaten', 'eated', 'eats'], answer: 0, why: 'Eat, ate, eaten: ate is the past simple.' },
  ] } satisfies ChoiceScene,

  { id: 'predict', part: 2, kind: 'speak', plate: 'bucket-list-wall', trains: [1], title: 'Before you listen', who: 'Vee', turns: [
    { step: 'free', prompt: 'Vee has a dare for the class. What do you think the dare is? Guess in one sentence.' },
  ] } satisfies SpeakScene,
  { id: 'story-dare', part: 2, kind: 'comic', plate: 'bucket-list-wall', trains: [1], title: 'The Dare', beats: [
    { plate: 'story-b1s1-1', caption: 'Vee has a dare for the whole class.', spots: { Vee: { x: 45, y: 12, w: 26 } }, heads: { Vee: { x: 40, y: 21 } }, lines: [
      { who: 'Vee', text: 'Okay, listen. I have a dare for everyone. We all make a bucket list this term, and we tick it off before the break.' },
      { who: 'Vee', text: 'A bucket list is a list of things you want to do once in a lifetime.' },
      { who: 'Vee', text: 'Mine is ready. Number one: give surfing a go. I have never been in the ocean, but I have seen a hundred videos.' },
    ] },
    { plate: 'story-b1s1-2', spots: { Ava: { x: 3, y: 66, w: 45 }, Theo: { x: 52, y: 66, w: 45 } }, heads: { Ava: { x: 34, y: 22 }, Theo: { x: 63, y: 22 } }, lines: [
      { who: 'Ava', text: 'That is brave, Vee. I have been to the beach, but I have never tried surfing.' },
      { who: 'Ava', text: 'Last summer I went to Spain with my cousin. We ate pizza every day, and we took hundreds of photos.' },
      { who: 'Theo', text: 'Ava, you have flown across the world twice, and you say you are not brave?' },
      { who: 'Ava', text: 'Flying is easy, Theo. Falling off a surfboard is the scary part.' },
      { who: 'Theo', text: 'I have taken a photo in every country I have visited. That is my record.' },
    ] },
    { plate: 'story-b1s1-3', spots: { Ava: { x: 2, y: 4, w: 28 }, Vee: { x: 2, y: 38, w: 28 } }, heads: { Ava: { x: 63, y: 26 }, Vee: { x: 42, y: 15 } }, lines: [
      { who: 'Vee', text: 'So here is the dare: three things you have done, and three things you want to do. Who has gone the furthest? Who has eaten the strangest thing?' },
      { who: 'Ava', text: 'Wait. Have you ever eaten spicy noodles?' },
      { who: 'Vee', text: 'Ha! That is number two on my list.' },
    ] },
  ] } satisfies ComicScene,
  { id: 'listen-q', part: 2, kind: 'choice', plate: 'bucket-list-wall', trains: [1], title: 'What did you hear?', questions: [
    { q: 'What is the dare?', options: ['Make a bucket list and tick it off before the break.', 'Learn to surf before the break.', 'Take a photo in every country.'], answer: 0 },
    { q: 'Why does Ava say that flying is easy?', options: ['She has flown many times, so it feels normal to her.', 'She is afraid of planes.', 'She has never been on a plane.'], answer: 0 },
    { q: 'What can you guess about Theo?', options: ['He loves travelling and taking photos.', 'He is afraid to fly.', 'He has never left his country.'], answer: 0 },
  ] } satisfies ChoiceScene,
  { id: 'words-model', part: 2, kind: 'model', plate: 'bucket-list-wall', trains: [2], title: 'Six words from the dare', who: 'Vee', steps: [
    { phase: 'iDo', text: 'A bucket list is a list of things you want to do in your life. A dare is when someone asks you to do something scary. To give it a go means to try. Once in a lifetime happens only one time. To tick it off is to mark it as done. Brave means not afraid when something is hard.' },
    { phase: 'weDo', text: 'Say them with me: bucket list, dare, give it a go, once in a lifetime, tick it off, brave.' },
    { phase: 'youDo', text: 'Now you: say the six words and one example, like “I want to give surfing a go.”' },
  ] } satisfies ModelScene,
  { id: 'words-match', part: 2, kind: 'match', plate: 'bucket-list-wall', trains: [2], title: 'Read and match', pairs: [
    { left: 'bucket list', right: 'things you want to do in your life' },
    { left: 'dare', right: 'to ask someone to do something scary' },
    { left: 'give it a go', right: 'to try something' },
    { left: 'tick it off', right: 'to mark it as done' },
    { left: 'brave', right: 'not afraid when it is hard' },
  ] } satisfies MatchScene,
  { id: 'words-use', part: 2, kind: 'choice', plate: 'bucket-list-wall', trains: [2], title: 'Which word fits?', questions: [
    { q: 'My cousin gave me a ___: write ten things I want to do.', options: ['dare', 'tick', 'list off'], answer: 0 },
    { q: 'A trip to Japan is ___.', options: ['once in a lifetime', 'brave', 'a dare'], answer: 0 },
    { q: 'I am scared, but I want to ___ surfing ___.', options: ['give / a go', 'tick / off', 'dare / brave'], answer: 0 },
  ] } satisfies ChoiceScene,
  { id: 'blog', part: 2, kind: 'choice', plate: 'library-case-room', trains: [1], title: 'Ava’s blog post', passage: BLOG, questions: [
    { q: 'What is the main idea of Ava’s post?', options: ['You are brave when you do something even though you are afraid.', 'Everyone should learn to surf this term.', 'Ava has never been afraid of anything.', 'Bucket lists are only for grown-ups.'], answer: 0, why: 'Paragraph 3 says it: you are brave when you do it anyway.' },
    { q: 'What has Ava already done?', options: ['Flown across the world twice and eaten insects in Thailand.', 'Tried surfing and performed on a stage.', 'Written a bucket list with ten things.', 'Never left her country.'], answer: 0, why: 'Paragraph 2 lists them.' },
    { q: 'How did Ava probably feel when her cousin first dared her?', options: ['Unsure: she did not think a bucket list was for her.', 'Excited: she wrote the list at once.', 'Angry with her cousin.', 'Scared of flying.'], answer: 0, why: 'She laughed, and thought bucket lists were for grown-ups.' },
  ] } satisfies ChoiceScene,

  { id: 'detective', part: 3, kind: 'sort', plate: 'detective-wall', trains: [4], title: 'Grammar Detective', prompt: 'Is the time finished and stated, or is it an experience up to now?', bins: [
    { id: 'when', label: 'PAST SIMPLE', note: 'a finished time' }, { id: 'now', label: 'HAVE + PARTICIPLE', note: 'up to now, no time' },
  ], items: [
    { id: 's1', text: 'Last summer I went to Spain.', bin: 'when' },
    { id: 's2', text: 'I have flown across the world twice.', bin: 'now' },
    { id: 's3', text: 'Last month my cousin dared me.', bin: 'when' },
    { id: 's4', text: 'I have never tried surfing.', bin: 'now' },
    { id: 's5', text: 'I have eaten insects in Thailand.', bin: 'now' },
  ] } satisfies SortScene,
  { id: 'rule', part: 3, kind: 'rule', plate: L, trains: [3, 4], title: 'Three forms, two tenses', who: 'Vee', lines: [
    { rule: 'Every verb has three forms: base, past simple, past participle.', example: 'go, went, gone' },
    { rule: 'Past simple: a finished time, so we say when.', example: 'I went to Spain last summer.' },
    { rule: 'Have + past participle: an experience up to now, no time.', example: 'I have been to Spain.' },
  ] } satisfies RuleScene,
  { id: 'build', part: 3, kind: 'build', plate: L, trains: [4], title: 'Build it', items: [
    { words: ['Have', 'you', 'ever', 'been', 'to', 'Japan'], hint: 'Question: Have + you + ever + participle.' },
    { words: ['I', 'have', 'never', 'eaten', 'octopus'], hint: 'I have never + participle.' },
    { words: ['We', 'ate', 'pizza', 'last', 'summer'], hint: 'Last summer is finished: past simple.' },
  ] } satisfies BuildScene,
  { id: 'tense-check', part: 3, kind: 'choice', plate: L, trains: [4], title: 'Choose the tense', questions: [
    { q: 'I ___ to Italy three times in my life.', options: ['have been', 'went', 'was', 'have went'], answer: 0, why: 'In my life: no finished time, an experience up to now.' },
    { q: 'We ___ pizza in Naples last summer.', options: ['ate', 'have eaten', 'eaten', 'have ate'], answer: 0, why: 'Last summer is a finished time: past simple.' },
    { q: 'Have you ever ___ spicy noodles?', options: ['eaten', 'ate', 'eat', 'eated'], answer: 0, why: 'After have you ever we need the past participle.' },
  ] } satisfies ChoiceScene,

  { id: 'trios', part: 4, kind: 'match', plate: 'trophy-case', trains: [3], title: 'Energiser: the three forms', pairs: [
    { left: 'go · went', right: 'gone' }, { left: 'be · was', right: 'been' }, { left: 'see · saw', right: 'seen' },
    { left: 'eat · ate', right: 'eaten' }, { left: 'take · took', right: 'taken' }, { left: 'fly · flew', right: 'flown' },
  ] } satisfies MatchScene,

  { id: 'mission-model', part: 5, kind: 'model', plate: L, trains: [5], title: 'Watch Vee argue it', who: 'Vee', steps: [
    { phase: 'iDo', text: 'I would say Ava has done the most. She has flown across the world twice, and she has even eaten spicy noodles. On the other hand, Theo has visited more countries, so it is a close call.' },
    { phase: 'weDo', text: 'Let us build it together: my answer, two reasons, one point against.' },
    { phase: 'youDo', text: 'Now you decide: who has done the most?' },
  ] } satisfies ModelScene,
  { id: 'mission', part: 5, kind: 'speak', plate: L, trains: [4, 5], title: 'Mission: who has done the most?', who: 'Theo', turns: [
    { step: 'controlled', prompt: 'Ask me a “Have you ever…?” question. If I say yes, ask “When did you…?”', model: 'Have you ever been abroad? … When did you go?' },
    { step: 'guided', prompt: 'Take 1. Who has done the most? Give your answer and two reasons.' },
    { step: 'free', prompt: 'Take 2, with a new listener: say it again, and add one point against.' },
  ] } satisfies SpeakScene,

  { id: 'release', part: 6, kind: 'speak', plate: 'bucket-list-wall', trains: [5], title: 'Release: your own list', who: 'Vee', turns: [
    { step: 'free', prompt: 'Tell me three things you have done and three things you want to do. About one minute.', model: 'I have been to… I have never… I want to give … a go.' },
  ] } satisfies SpeakScene,

  { id: 'wrap', part: 7, kind: 'wrap', plate: 'trophy-reveal', heading: 'Cold open complete!', teachBack: 'When do we use the past simple, and when do we use have and the past participle?' } satisfies WrapScene,
];

export const B1_S01_E1: LessonScript = {
  blueprintId: 'B1-S01-E1',
  title: 'Have You Ever...? · Cold Open',
  criteria: CRITERIA,
  cast: ['Vee', 'Ava', 'Theo', 'Mia'],
  partMinutes: [3, 3, 21, 11, 3, 10, 5, 4],
  scenes,
};
export default B1_S01_E1;
