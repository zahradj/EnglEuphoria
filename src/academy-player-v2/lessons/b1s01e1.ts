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
import type { TeachScene } from '../scenes/teach/Teach';
import type { MemoryScene } from '../scenes/memory/Memory';
import type { WriteScene } from '../scenes/write/Write';
import type { ForgeScene } from '../scenes/forge/Forge';
import type { BossScene } from '../scenes/boss/Boss';
import type { RapportScene } from '../scenes/rapport/Rapport';
import type { WrapScene } from '../scenes/wrap/Wrap';
import type { LobbyScene } from '../scenes/lobby/Lobby';
import type { HuntScene } from '../scenes/hunt/Hunt';
import type { InspectScene } from '../scenes/inspect/Inspect';
import type { InterviewScene } from '../scenes/interview/Interview';
import type { CipherScene } from '../scenes/cipher/Cipher';
import type { SwitchboardScene } from '../scenes/switchboard/Switchboard';

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
// the scenes carry the fields of their kind (heading, title, beats...), checked by `satisfies` and the registry validator
type Scene = SceneBase & Record<string, unknown>;
const scenes: Scene[] = [
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
  { id: 'words-teach', part: 2, kind: 'teach', plate: 'bucket-list-wall', trains: [2], title: 'Five of the words, with pictures', who: 'Vee', pages: [
    { word: 'bucket list', art: 'b-bucketlist', meaning: 'a list of things you want to do in your life', example: 'My bucket list has ten things on it.', clue: 'Say it as one word group: bucket list.' },
    { word: 'dare', art: 'b-dare', meaning: 'to ask someone to do something difficult or scary', example: 'My cousin dared me to write a list.', clue: 'It rhymes with care.' },
    { word: 'give it a go', art: 'b-giveitago', meaning: 'to try something', example: 'I want to give surfing a go.', clue: 'The same as: try it.' },
    { word: 'once in a lifetime', art: 'b-lifetime', meaning: 'something that happens only one time in your life', example: 'A trip to Japan is once in a lifetime.', clue: 'Four words, one idea.' },
    { word: 'tick it off', art: 'b-tick', meaning: 'to mark a thing on a list as done', example: 'I tick it off when I do it.', clue: 'You can also say: cross it off.' },
  ] } satisfies TeachScene,
  { id: 'words-match', part: 2, kind: 'match', plate: 'bucket-list-wall', trains: [2], title: 'Read and match', pairs: [
    { left: 'bucket list', right: 'things you want to do in your life' },
    { left: 'dare', right: 'to ask someone to do something scary' },
    { left: 'give it a go', right: 'to try something' },
    { left: 'tick it off', right: 'to mark it as done' },
    { left: 'brave', right: 'not afraid when it is hard' },
  ] } satisfies MatchScene,
  { id: 'words-memory', part: 2, kind: 'memory', plate: 'bucket-list-wall', trains: [2], title: 'Memory: the words', pairs: [
    { art: 'b-bucketlist', text: 'bucket list' }, { art: 'b-dare', text: 'dare' }, { art: 'b-giveitago', text: 'give it a go' }, { art: 'b-lifetime', text: 'once in a lifetime' }, { art: 'b-tick', text: 'tick it off' },
  ] } satisfies MemoryScene,
  { id: 'words-hunt', part: 2, kind: 'hunt', plate: 'bucket-list-wall', trains: [2], title: 'Hunt: find the words in the room', who: 'Vee', intro: 'Vee has hidden the new words around the room. Read each clue, then tap the place it describes.', targets: [
    { id: 'board', label: 'the cork board', word: 'bucket list', clue: 'Vee pinned her bucket list up for the whole class. Find the board.', reveal: 'bucket list: a list of things you want to do in your life.', x: 31.2, y: 17.5, w: 38.4, h: 33.5 },
    { id: 'whiteboard', label: 'the whiteboard', word: 'dare', clue: 'Vee writes the dare here, where everyone can read it. Find the whiteboard.', reveal: 'dare: when someone asks you to do something scary.', x: 71.5, y: 19.5, w: 26, h: 31 },
    { id: 'window', label: 'the window', word: 'give it a go', clue: 'Ava looks outside and wants to give surfing a go. Find the big sunny window.', reveal: 'give it a go: to try something.', x: 0, y: 0, w: 22, h: 52 },
    { id: 'flags', label: 'the party flags', word: 'once in a lifetime', clue: 'The room is ready for a party, because this day is once in a lifetime. Find the flags.', reveal: 'once in a lifetime: it happens only one time.', x: 55, y: 3, w: 40, h: 13 },
    { id: 'shelf', label: 'the low shelf', word: 'tick it off', clue: 'A finished list goes into a box on this shelf. Tick it off: find the low shelf with the purple boxes.', reveal: 'tick it off: to mark a thing on a list as done.', x: 54, y: 63.5, w: 17.5, h: 14 },
  ], decoys: [
    { label: 'the plant', x: 24, y: 30, w: 9, h: 42 }, { label: 'the desks', x: 77, y: 56, w: 23, h: 40 }, { label: 'the cupboard', x: 10, y: 56, w: 10, h: 22 },
  ] } satisfies HuntScene,
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
    { rule: 'Have and the past participle: an experience up to now, no time.', example: 'I have been to Spain.' },
  ] } satisfies RuleScene,
  // Wave 2 (owner "go" 2026-10-17, plan amendment 2): after the rule, before the production games and the Mission. Trains criterion 4 (past simple or present perfect).
  { id: 'switchboard', part: 3, kind: 'switchboard', plate: 'bucket-list-wall', trains: [4], title: 'Timeline Switchboard', who: 'Vee',
    intro: 'Welcome to the Timeline Switchboard. The yellow line is now. A time word decides where an event lives. A finished time goes in the past band, and sometime up to now goes in the cloud. Move the time word, and the sentence rewrites itself.',
    levels: [
      { mode: 'forward', goalSentence: 'Goal: say that you saw a whale last summer.', event: { verbBase: 'see', object: 'a whale', tone: 'sea' }, marker: { text: 'last summer', zone: 'point' }, forms: { past: 'saw', participle: 'seen' }, choices: ['last summer', 'never', 'yesterday'], hint: 'Last summer is a finished time, so the event sits in the past band and the verb is past simple.' },
      { mode: 'forward', goalSentence: 'Goal: say that you have never flown across the world, at any time up to now.', event: { verbBase: 'fly', object: 'across the world', tone: 'city' }, marker: { text: 'never', zone: 'cloud' }, forms: { past: 'flew', participle: 'flown' }, choices: ['in 2019', 'never', 'two years ago'], hint: 'Never, with no date, is sometime up to now: the cloud, and have plus the participle.' },
      { mode: 'reverse', goalSentence: 'I have eaten spicy noodles.', event: { verbBase: 'eat', object: 'spicy noodles', tone: 'field' }, marker: { text: 'just', zone: 'cloud' }, alsoOk: ['so far'], forms: { past: 'ate', participle: 'eaten' }, choices: ['just', 'so far', 'last summer', 'two years ago'], hint: 'Have plus eaten and no date: it happened sometime up to now.' },
      { mode: 'reverse', goalSentence: 'I took a photo in a cave.', event: { verbBase: 'take', object: 'a photo in a cave', tone: 'hill' }, marker: { text: 'two years ago', zone: 'point' }, alsoOk: ['in 2019', 'last summer', 'yesterday'], forms: { past: 'took', participle: 'taken' }, choices: ['two years ago', 'in 2019', 'just', 'so far'], hint: 'Took is the past simple: a finished moment, so it sits in the past band.' },
      { mode: 'free', count: 2, hint: 'Pick an event and a time word. Build two sentences about your own life, then say them aloud.',
        events: [
          { event: { verbBase: 'see', object: 'a whale', tone: 'sea' }, forms: { past: 'saw', participle: 'seen' } },
          { event: { verbBase: 'eat', object: 'spicy noodles', tone: 'field' }, forms: { past: 'ate', participle: 'eaten' } },
          { event: { verbBase: 'fly', object: 'across the world', tone: 'city' }, forms: { past: 'flew', participle: 'flown' } },
          { event: { verbBase: 'take', object: 'a photo in a cave', tone: 'hill' }, forms: { past: 'took', participle: 'taken' } },
        ] },
    ] } satisfies SwitchboardScene,
  { id: 'build', part: 3, kind: 'build', plate: L, trains: [4], title: 'Build it', items: [
    { words: ['Have', 'you', 'ever', 'been', 'to', 'Japan'], hint: 'Question: Have + you + ever + participle.' },
    { words: ['I', 'have', 'never', 'eaten', 'octopus'], hint: 'I have never + participle.' },
    { words: ['We', 'ate', 'pizza', 'last', 'summer'], hint: 'Last summer is finished: past simple.' },
  ] } satisfies BuildScene,
  { id: 'write-forms', part: 3, kind: 'write', plate: L, trains: [4], title: 'Use the rule', prompt: 'Your turn to use the rule. Write a question with ever, and an answer with never.', rows: [
    { label: 'Ask a friend about travel (ever + be).', frame: 'Have you ever …?', accept: ['^have you ever been (to|in) .+'], hint: 'Have you ever + been to + a place.', sample: 'Have you ever been to Japan?' },
    { label: 'Answer for yourself with never (eat).', frame: 'I have never …', accept: ["^(i have never|i(’|')ve never|i haven(’|')t ever|i have not ever) eaten .+"], hint: 'I have never + eaten + something.', sample: 'I have never eaten octopus.' },
  ] } satisfies WriteScene,
  { id: 'border-desk', part: 3, kind: 'inspect', plate: 'detective-wall', trains: [4], title: 'Border Desk', look: 'post', chief: 'Vee',
    intro: 'Welcome to the Border Desk. Bucket-list posts arrive three at a time. Check each one against the rulebook, approve it or fix it, then file the batch.',
    rules: [
      { id: 'r1', title: 'A finished time', text: 'A finished time, like last summer, last year or two years ago, needs the past simple.', example: 'I visited Lisbon last summer.' },
      { id: 'r2', title: 'Up to now', text: 'An experience up to now, with no finished time, needs have or has and the past participle.', example: 'I have visited Lisbon.' },
      { id: 'r3', fromBatch: 1, title: 'Asking', text: 'To ask about an experience, say Have you ever and the past participle.', example: 'Have you ever eaten spicy noodles?' },
    ],
    batches: [
      { title: 'Morning posts', items: [
        { id: 'p1', from: 'Mina', doc: ['Last summer I have visited my cousins in Lisbon. We ate fish every day.'],
          fault: { word: 'have visited', fixes: ['visited', 'have visit', 'visit'], correct: 'visited', ruleId: 'r1', why: 'Last summer is a finished time, so we use the past simple: I visited my cousins.' },
          retry: { id: 'p1r', from: 'Karim', doc: ['In 2022 I have broken my arm at a skate park. It healed fast.'], fault: { word: 'have broken', fixes: ['broke', 'have break', 'break'], correct: 'broke', ruleId: 'r1', why: 'In 2022 is a finished time, so we use the past simple: I broke my arm.' } } },
        { id: 'p2', from: 'Tom', doc: ['I have never tried surfing, but I want to give it a go.'], okWhy: 'Never, with no time given, is an experience up to now: have and tried are correct.', okFixes: ['try', 'tryed', 'trying'],
          retry: { id: 'p2r', from: 'Aisha', doc: ['I have never ridden a horse, but my sister has.'], okWhy: 'Never, with no time given, is an experience up to now: have and ridden are correct.', okFixes: ['rode', 'ride', 'rided'] } },
        { id: 'p3', from: 'Leo', doc: ['I have flew to Japan twice, and I loved it.'],
          fault: { word: 'flew', fixes: ['flown', 'fly', 'flied'], correct: 'flown', ruleId: 'r2', why: 'After have we need the past participle: flown, not flew.' },
          retry: { id: 'p3r', from: 'Ines', doc: ['We have ate sushi in Tokyo, and it was great.'], fault: { word: 'ate', fixes: ['eaten', 'eat', 'eated'], correct: 'eaten', ruleId: 'r2', why: 'After have we need the past participle: eaten, not ate.' } } },
      ] },
      { title: 'Afternoon posts', items: [
        { id: 'p4', from: 'Dana', doc: ['Have you ever tried paragliding? I did it in Spain last summer.'], okWhy: 'Have you ever and the participle asks about an experience. Then did it with last summer tells the story in the past simple.', okFixes: ['try', 'tryed', 'did try'],
          retry: { id: 'p4r', from: 'Marco', doc: ['Have you ever eaten snails? I ate them in France last year.'], okWhy: 'Have you ever and the participle asks about an experience. Then ate them with last year tells the story in the past simple.', okFixes: ['eat', 'ate', 'eated'] } },
        { id: 'p5', from: 'Sam', doc: ['Did you ever see the northern lights? I have never seen them.'],
          fault: { word: 'Did you ever see', fixes: ['Have you ever seen', 'Do you ever see', 'Have you ever saw'], correct: 'Have you ever seen', ruleId: 'r3', why: 'To ask about an experience, say Have you ever and the past participle: Have you ever seen the northern lights?' },
          retry: { id: 'p5r', from: 'Yara', doc: ['Did you ever eat durian? I have never tasted it.'], fault: { word: 'Did you ever eat', fixes: ['Have you ever eaten', 'Do you ever eat', 'Have you ever ate'], correct: 'Have you ever eaten', ruleId: 'r3', why: 'To ask about an experience, say Have you ever and the past participle: Have you ever eaten durian?' } } },
        { id: 'p6', from: 'Noor', doc: ['I joined a climbing club two years ago, and I have never regretted it.'], okWhy: 'Two years ago is a finished time, so joined. Never regretted is up to now, so have regretted.', okFixes: ['join', 'have joined', 'regret'],
          retry: { id: 'p6r', from: 'Theo', doc: ['I took a dance class in March, and I have loved it since.'], okWhy: 'In March is a finished time, so took. Loved it since is up to now, so have loved.', okFixes: ['take', 'have took', 'taked'] } },
      ] },
      { title: 'Late posts', items: [
        { id: 'p7', from: 'Eli', doc: ['Yesterday I have tried a new sport. I have loved it ever since.'],
          fault: { word: 'have tried', fixes: ['tried', 'have try', 'try'], correct: 'tried', ruleId: 'r1', why: 'Yesterday is a finished time, so we use the past simple: I tried a new sport.' },
          retry: { id: 'p7r', from: 'Rosa', doc: ['Last Friday I have gone to a concert. It was loud!'], fault: { word: 'have gone', fixes: ['went', 'have go', 'go'], correct: 'went', ruleId: 'r1', why: 'Last Friday is a finished time, so we use the past simple: I went to a concert.' } } },
        { id: 'p8', from: 'Iris', doc: ['I have been to Rome three times. I went first in 2019.'], okWhy: 'Three times, with no date, is an experience up to now: have been. In 2019 is finished: went.', okFixes: ['was', 'have went', 'gone'],
          retry: { id: 'p8r', from: 'Karl', doc: ['I have eaten sushi often. I tried it first in 2020.'], okWhy: 'Often, with no date, is up to now: have eaten. In 2020 is finished: tried.', okFixes: ['ate', 'have tried', 'eated'] } },
        { id: 'p9', from: 'Jon', doc: ['I have never ate insects, and I do not want to.'],
          fault: { word: 'ate', fixes: ['eaten', 'eat', 'eated'], correct: 'eaten', ruleId: 'r2', why: 'After have we need the past participle: eaten, not ate.' },
          retry: { id: 'p9r', from: 'Mira', doc: ['She has never saw a real mountain, but she wants to.'], fault: { word: 'saw', fixes: ['seen', 'see', 'seed'], correct: 'seen', ruleId: 'r2', why: 'After has we need the past participle: seen, not saw.' } } },
      ] },
    ] } satisfies InspectScene,
  { id: 'forge', part: 3, kind: 'forge', plate: 'trophy-case', trains: [3], title: 'Trophy Forge', prompt: 'Forge the three forms of each verb, in order: base, past simple, past participle.', rounds: [
    { forms: ['go', 'went', 'gone'] }, { forms: ['fly', 'flew', 'flown'] }, { forms: ['take', 'took', 'taken'] },
  ] } satisfies ForgeScene,
  { id: 'boss', part: 3, kind: 'boss', plate: 'detective-wall', trains: [4], title: 'Break the Clock!', boss: 'The Clock', prompt: 'Break the Clock! Choose the right tense to strike. Three shields: a wrong tense costs one.', rounds: [
    { frame: 'I ___ to Italy three times in my life.', options: ['have been', 'went', 'was', 'have went'], answer: 0, why: 'In my life: no finished time, an experience up to now.' },
    { frame: 'We ___ pizza in Naples last summer.', options: ['ate', 'have eaten', 'eaten', 'have ate'], answer: 0, why: 'Last summer is a finished time: past simple.' },
    { frame: 'Have you ever ___ spicy noodles?', options: ['eaten', 'ate', 'eat', 'eated'], answer: 0, why: 'After have you ever we need the past participle: eaten.' },
  ] } satisfies BossScene,

  { id: 'trios', part: 4, kind: 'match', plate: 'trophy-case', trains: [3], title: 'Energiser: the three forms', pairs: [
    { left: 'go · went', right: 'gone' }, { left: 'be · was', right: 'been' }, { left: 'see · saw', right: 'seen' },
    { left: 'eat · ate', right: 'eaten' }, { left: 'take · took', right: 'taken' }, { left: 'fly · flew', right: 'flown' },
  ] } satisfies MatchScene,
  { id: 'cipher', part: 4, kind: 'cipher', plate: 'trophy-case', trains: [3], title: 'Participle Cipher', who: 'Vee',
    intro: 'Crack the cipher. Type the missing participle. Green means right, yellow means the letter is in the word, grey means it is not.',
    cards: [
      { sentence: 'I have never ___ a rainbow like this.', base: 'see', past: 'saw', participle: 'seen', clue: 'It rhymes with green.' },
      { sentence: 'Have you ever ___ spicy noodles?', base: 'eat', past: 'ate', participle: 'eaten', clue: 'It ends in en.' },
      { sentence: 'She has already ___ her homework.', base: 'do', past: 'did', participle: 'done', clue: 'It rhymes with one.' },
      { sentence: 'I have just ___ a long message to my cousin.', base: 'write', past: 'wrote', participle: 'written', clue: 'It has a double t.' },
      { sentence: 'We have ___ a bucket list together.', base: 'make', past: 'made', participle: 'made', clue: 'Here the participle is the same as the past simple.' },
    ] } satisfies CipherScene,

  { id: 'mission-model', part: 5, kind: 'model', plate: L, trains: [5], title: 'Watch Vee argue it', who: 'Vee', steps: [
    { phase: 'iDo', text: 'I would say Ava has done the most. She has flown across the world twice, and she has even eaten spicy noodles. On the other hand, Theo has visited more countries, so it is a close call.' },
    { phase: 'weDo', text: 'Let us build it together: my answer, two reasons, one point against.' },
    { phase: 'youDo', text: 'Now you decide: who has done the most?' },
  ] } satisfies ModelScene,
  { id: 'rapport', part: 5, kind: 'rapport', plate: L, trains: [4, 5], title: 'Rapport: talk to Theo', npc: 'Theo', exchanges: [
    { say: 'So, have you ever been abroad?', options: [
      { text: 'Yes, I have. I have been to Italy.', score: 2, reply: 'Nice! When did you go?', note: 'Present perfect for the experience, no time.' },
      { text: 'Yes, I went.', score: 1, reply: 'Cool. When was that?', note: 'Correct, but “I have been to …” sounds more natural for an experience.' },
      { text: 'Yes, I have been to Italy last year.', score: 0, reply: 'Wait, last year? Hmm.', note: 'Last year is a finished time: say “I went to Italy last year.”' },
    ] },
    { say: 'I love Italy. When did you go there?', options: [
      { text: 'I went last August with my family.', score: 2, reply: 'Lucky you! What did you eat?', note: 'Finished time, so the past simple. Perfect.' },
      { text: 'Last August.', score: 1, reply: 'Nice. What did you eat?', note: 'Short answers are fine, but try a full sentence: “I went last August.”' },
      { text: 'I have gone last August.', score: 0, reply: 'Hmm, last August? Okay… what did you eat?', note: 'With a finished time use went, not have gone.' },
    ] },
    { say: 'Have you ever flown in a plane?', options: [
      { text: 'Yes, I have. I flew to Spain last year.', score: 2, reply: 'Lucky you! Was it your first time?', note: 'The follow-up chain: have and the participle for the experience, then the past simple with a time.' },
      { text: 'Yes, I have flown.', score: 1, reply: 'Cool! Where did you fly?', note: 'Correct. Add the story with a time: “I flew to Spain last year.”' },
      { text: 'Yes, I have flown last year.', score: 0, reply: 'Last year? Hmm.', note: 'Last year is a finished time: use flew.' },
    ] },
  ] } satisfies RapportScene,
  { id: 'who-most', part: 5, kind: 'interview', plate: L, trains: [5], title: 'Who has done the most?', look: 'friends', chief: 'Vee', winnerId: 'ava',
    intro: 'Three friends have bucket-list stories. Ask each one four questions with Have you ever, write down the answers, and then tell me who has done the most.',
    tiles: [
      { id: 'fly', object: 'across the world', verb: { base: 'fly', past: 'flew', participle: 'flown', distractors: ['flew', 'flied'] } },
      { id: 'eat', object: 'spicy noodles', verb: { base: 'eat', past: 'ate', participle: 'eaten', distractors: ['ate', 'eated'] } },
      { id: 'see', object: 'a shark', verb: { base: 'see', past: 'saw', participle: 'seen', distractors: ['saw', 'seed'] } },
      { id: 'take', object: 'a photo in a cave', verb: { base: 'take', past: 'took', participle: 'taken', distractors: ['took', 'taked'] } },
    ],
    personas: [
      { id: 'theo', name: 'Theo', cast: 'Theo', facts: { fly: { done: false }, eat: { done: false, no: 'No, I haven’t. They are too hot for me.' }, see: { done: true, yes: 'Yes, I have. I saw a small shark in Portugal last July.' }, take: { done: true, yes: 'Yes, I have. I took one in Spain, last winter.' } } },
      { id: 'mia', name: 'Mia', cast: 'Mia', facts: { fly: { done: true, yes: 'Yes, I have. I flew to Mexico last winter.' }, eat: { done: false, no: 'No, I haven’t, but I would like to.' }, see: { done: false }, take: { done: false } } },
      { id: 'ava', name: 'Ava', cast: 'Ava', facts: { fly: { done: true, yes: 'Yes, I have. I flew to Japan two years ago.' }, eat: { done: true, yes: 'Yes, I have. I ate spicy noodles in Seoul last spring.' }, see: { done: false, no: 'No, I haven’t. Not yet.' }, take: { done: true, yes: 'Yes, I have. I took one last summer.' } } },
    ],
    summaryFrame: '{name} has done the most because {name} has {facts}.' } satisfies InterviewScene,
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
  partMinutes: [3, 3, 20, 13, 3, 9, 5, 4],
  scenes,
  quest: {
    name: 'The Dare',
    stages: [
      { title: 'Roll call', goal: 'Tell Vee about the last year of your life.' },
      { title: 'Remember?', goal: 'Wake up the past simple before it gets tricky.' },
      { title: 'The Dare', goal: 'Hear the dare, hunt the six words, read Ava’s blog post.' },
      { title: 'Tense Detective', goal: 'Tell a finished time from an experience, then forge the verb forms.' },
      { title: 'Power-up', goal: 'Three forms, six verbs, one fast round.' },
      { title: 'The Mission', goal: 'Decide who has done the most and defend your answer.' },
      { title: 'Release', goal: 'Tell Vee about your own bucket list.' },
      { title: 'Wrap', goal: 'Say the rule back to unlock your clue.' },
    ],
    clue: 'The class has a dare: everyone makes a bucket list this term and ticks it off before the break.',
  },
};
export default B1_S01_E1;
