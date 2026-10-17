// B1-S01-E1 "Have You Ever...? · Cold Open", REBUILT FROM SCRATCH (owner 2026-10-17: "fresh from the beginning... be more creative with the activities and games").
// Plan (approved by the owner 2026-10-17 "Okay, let's start"): docs/academy-b1-s01-e1-plan-v4.md; research: docs/research/academy-b1-s01-e1-v4-research.md; blueprint: 'B1-S01-E1'.
// Shape `ttt` (test-teach-test): the lesson is seven acts of its own, no fixed skeleton. The Dare Deck frame: every win earns something, and the student keeps three Dare cards as their own bucket list.
// Acts: 1 Cold Bluff (cold test) · 2 The Desk (read) · 3 Word Vault · 4 Forge · 5 The Bouncer (discover the rule) · 6 Dare Run (talk) · 7 Re-Bluff (retake + release).
// Voice lines are spoken by the recorded clips (silent if a clip is missing). Pictures: public/academy-art/bg and /cards.
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

import type { Clipping } from '../scenes/archive/archiveLogic';
import type { OnAirScene } from '../scenes/onair/OnAir';
import type { FactScene } from '../scenes/factcheck/factLogic';
import type { DeckScene } from '../scenes/deck/Deck';

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



/** the blog as clippings, so the Desk can ask for the proving line (c<paragraph>.<sentence>) */
export const BLOG_CLIPS: Clipping[] = [
  { id: 'c1', lines: ['Last month my cousin dared me to write a bucket list, and I laughed.', 'Honestly, I thought bucket lists were only for grown-ups.'], keywords: [] },
  { id: 'c2', lines: ['Then I counted what I have already done.', 'I have flown across the world twice, I have slept in a tent in the rain, and I have eaten insects in Thailand.', 'Last summer I went to Spain, and I even gave paragliding a go.'], keywords: [] },
  { id: 'c3', lines: ['The strange thing is that I have never felt brave.', 'Brave people are not afraid, I used to think, but I was terrified before every one of those things.', 'Now I believe it is the opposite: you are brave when you do it anyway.'], keywords: [] },
  { id: 'c4', lines: ['So this term I am going to tick off three more things, and one of them is a once in a lifetime trip.', 'I have never tried surfing, and I have never performed on a stage.'], keywords: [] },
  { id: 'c5', lines: ['If you have a dare for yourself, write it down.', 'You will probably regret the things you did not try more than the things you did.'], keywords: [] },
];

const L = 'library-case-room';
// the scenes carry the fields of their kind, checked by `satisfies` and the registry validator
type Scene = SceneBase & Record<string, unknown>;
const scenes: Scene[] = [
  // ---------- ACT 1 · COLD BLUFF: the cold test. Nothing is taught yet; the teacher notes which tense the student chooses. ----------
  { id: 'lobby', part: 0, kind: 'lobby', plate: 'bucket-list-wall', heading: 'Have you ever…?', sub: 'The Dare Deck · lesson 1' } satisfies LobbyScene,
  { id: 'truths', part: 0, kind: 'onair', look: 'twotruths', plate: 'classroom-morning', trains: [4, 5], title: 'Cold Bluff: two truths and a lie', guest: 'Theo', producer: 'Vee',
    intro: 'Cold open! No lesson yet. Theo will tell you three experiences. Two are true and one is a lie. Ask him questions in your own words, then find the lie.',
    minProbes: 3, lieId: 'b',
    claims: [
      { id: 'a', text: 'I have run a marathon.', probes: [
        { q: 'When did you run it?', a: 'Two years ago, in Berlin.' },
        { q: 'How long did it take?', a: 'Four hours and ten minutes. My legs hurt for a week.' },
      ] },
      { id: 'b', text: 'I have never ridden a horse.', probes: [
        { q: 'Have you been to a farm?', a: 'Yes, I went to my uncle’s farm last summer. I rode a horse called Biscuit!', tell: true },
        { q: 'Do you like animals?', a: 'Yes, a lot. We have two dogs.' },
      ] },
      { id: 'c', text: 'I have played the drums in a band.', probes: [
        { q: 'Who was in the band?', a: 'Mia and two friends from school.' },
        { q: 'Where did you play?', a: 'At the school concert, last March.' },
      ] },
    ],
    why: 'he rode a horse on his uncle’s farm last summer.',
    explain: 'Right! “I have never ridden a horse” cannot be true: Theo says he rode one last summer. Never and a finished time do not go together.',
    sayFrame: 'I think number {n} is the lie, because {why}' } satisfies OnAirScene,
  // ---------- ACT 2 · THE DESK: reading as an inspection desk (Papers, Please): stamp True / False / Not given and show the line. ----------
  { id: 'predict', part: 1, kind: 'speak', plate: 'bucket-list-wall', trains: [1], title: 'Before you listen', who: 'Vee', turns: [
    { step: 'free', prompt: 'Vee has a dare for the class. What do you think the dare is? Guess in one sentence.' },
  ] } satisfies SpeakScene,
  { id: 'story-dare', part: 1, kind: 'comic', plate: 'bucket-list-wall', trains: [1], title: 'The Dare', beats: [
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
  { id: 'desk', part: 1, kind: 'factcheck', plate: 'inspection-desk', trains: [1], title: 'The Desk: check Ava’s blog', who: 'Vee',
    intro: 'Welcome to the Desk. Ava’s blog post stays on screen. Three claims at a time: stamp each one true, false or not given, and tap the line that proves it. A set locks only when all three are right.',
    clippings: BLOG_CLIPS,
    cards: [
      { id: 'f1', statement: 'Ava thought bucket lists were only for grown-ups.', verdict: 'true', proof: 'c1.1', why: 'She says it: Honestly, I thought bucket lists were only for grown-ups.' },
      { id: 'f2', statement: 'Ava has never eaten insects.', verdict: 'false', proof: 'c2.1', why: 'She has eaten insects in Thailand.' },
      { id: 'f3', statement: 'Ava’s cousin lives in Spain.', verdict: 'ng', why: 'No line says it: the blog does not say where her cousin lives.' },
      { id: 'f4', statement: 'Ava went to Spain last summer.', verdict: 'true', proof: 'c2.2', why: 'Last summer I went to Spain: a finished time, so the past simple.' },
      { id: 'f5', statement: 'Ava has already tried surfing.', verdict: 'false', proof: 'c4.1', why: 'She says: I have never tried surfing.' },
      { id: 'f6', statement: 'Ava was terrified before every one of those things.', verdict: 'true', proof: 'c3.1', why: 'The blog says: I was terrified before every one of those things.' },
    ] } satisfies FactScene,
  { id: 'tense-cards', part: 1, kind: 'choice', plate: 'inspection-desk', trains: [4], title: 'Which question fits the answer?', questions: [
    { q: 'Answer: “Yes, I have. I flew to Peru in 2022.” Which question was asked?', options: ['Have you ever been to Peru?', 'Did you fly to Peru in 2022?', 'Do you fly to Peru?'], answer: 0, why: 'Have you ever asks about any time up to now. The answer then adds the finished time with the past simple.' },
    { q: 'Question: “When did you tick it off?” Which answer fits?', options: ['Last June, with my cousin.', 'Yes, I have.', 'I have never done it.'], answer: 0, why: 'When asks for a finished time, so the answer gives one.' },
    { q: 'Question: “Have you ever given surfing a go?” Which answer fits?', options: ['Yes, I have. I tried it last July.', 'Yes, I tried.', 'No, I never have tried yesterday.'], answer: 0, why: 'Yes, I have answers the experience question; then last July tells the story in the past simple.' },
  ] } satisfies ChoiceScene,

  // ---------- ACT 3 · WORD VAULT: six words, then two different games (a hunt in the picture, a flip-memory). ----------
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
  { id: 'words-hunt', part: 2, kind: 'hunt', plate: 'bucket-list-wall', trains: [2], title: 'Hunt: find the words in the room', who: 'Vee', intro: 'Vee has hidden the new words around the room. Read each clue, then tap the place it describes.', targets: [
    { id: 'board', label: 'the cork board', word: 'bucket list', clue: 'Vee pinned her bucket list up for the whole class. Find the board.', reveal: 'bucket list: a list of things you want to do in your life.', x: 31.2, y: 17.5, w: 38.4, h: 33.5 },
    { id: 'whiteboard', label: 'the whiteboard', word: 'dare', clue: 'Vee writes the dare here, where everyone can read it. Find the whiteboard.', reveal: 'dare: when someone asks you to do something scary.', x: 71.5, y: 19.5, w: 26, h: 31 },
    { id: 'window', label: 'the window', word: 'give it a go', clue: 'Ava looks outside and wants to give surfing a go. Find the big sunny window.', reveal: 'give it a go: to try something.', x: 0, y: 0, w: 22, h: 52 },
    { id: 'flags', label: 'the party flags', word: 'once in a lifetime', clue: 'The room is ready for a party, because this day is once in a lifetime. Find the flags.', reveal: 'once in a lifetime: it happens only one time.', x: 55, y: 3, w: 40, h: 13 },
    { id: 'shelf', label: 'the low shelf', word: 'tick it off', clue: 'A finished list goes into a box on this shelf. Tick it off: find the low shelf with the purple boxes.', reveal: 'tick it off: to mark a thing on a list as done.', x: 54, y: 63.5, w: 17.5, h: 14 },
  ], decoys: [
    { label: 'the plant', x: 24, y: 30, w: 9, h: 42 }, { label: 'the desks', x: 77, y: 56, w: 23, h: 40 }, { label: 'the cupboard', x: 10, y: 56, w: 10, h: 22 },
  ] } satisfies HuntScene,
  { id: 'words-memory', part: 2, kind: 'memory', plate: 'bucket-list-wall', trains: [2], title: 'Memory: the words', pairs: [
    { art: 'b-bucketlist', text: 'bucket list' }, { art: 'b-dare', text: 'dare' }, { art: 'b-giveitago', text: 'give it a go' }, { art: 'b-lifetime', text: 'once in a lifetime' }, { art: 'b-tick', text: 'tick it off' },
  ] } satisfies MemoryScene,
  { id: 'words-use', part: 2, kind: 'choice', plate: 'bucket-list-wall', trains: [2], title: 'Which word fits?', questions: [
    { q: 'My cousin gave me a ___: write ten things I want to do.', options: ['dare', 'tick', 'list off'], answer: 0 },
    { q: 'A trip to Japan is ___.', options: ['once in a lifetime', 'brave', 'a dare'], answer: 0 },
    { q: 'I am scared, but I want to ___ surfing ___.', options: ['give / a go', 'tick / off', 'dare / brave'], answer: 0 },
  ] } satisfies ChoiceScene,
  // ---------- ACT 4 · FORGE: three forms of nine verbs, with a gem wager (Gimkit idea). ----------
  { id: 'forge', part: 3, kind: 'forge', plate: 'trophy-case', trains: [3], title: 'Trophy Forge', wager: true, prompt: 'Forge the three forms of each verb, in order: base, past simple, past participle. Before each verb, bet one to three gems that you will forge it clean. A clean verb pays double.', rounds: [
    { forms: ['go', 'went', 'gone'] }, { forms: ['fly', 'flew', 'flown'] }, { forms: ['take', 'took', 'taken'] }, { forms: ['be', 'was', 'been'] },
  ] } satisfies ForgeScene,
  { id: 'cipher', part: 3, kind: 'cipher', plate: 'trophy-case', trains: [3], title: 'Participle Cipher', who: 'Vee',
    intro: 'Crack the cipher. Type the missing participle. Green means right, yellow means the letter is in the word, grey means it is not.',
    cards: [
      { sentence: 'I have never ___ a rainbow like this.', base: 'see', past: 'saw', participle: 'seen', clue: 'It rhymes with green.' },
      { sentence: 'Have you ever ___ spicy noodles?', base: 'eat', past: 'ate', participle: 'eaten', clue: 'It ends in en.' },
      { sentence: 'She has already ___ her homework.', base: 'do', past: 'did', participle: 'done', clue: 'It rhymes with one.' },
      { sentence: 'I have just ___ a long message to my cousin.', base: 'write', past: 'wrote', participle: 'written', clue: 'It has a double t.' },
      { sentence: 'We have ___ a bucket list together.', base: 'make', past: 'made', participle: 'made', clue: 'Here the participle is the same as the past simple.' },
    ] } satisfies CipherScene,

  { id: 'trios', part: 3, kind: 'match', plate: 'trophy-case', trains: [3], title: 'Energiser: the three forms', pairs: [
    { left: 'go · went', right: 'gone' }, { left: 'be · was', right: 'been' }, { left: 'see · saw', right: 'seen' },
    { left: 'eat · ate', right: 'eaten' }, { left: 'take · took', right: 'taken' }, { left: 'fly · flew', right: 'flown' },
  ] } satisfies MatchScene,
  // ---------- ACT 5 · THE BOUNCER: sort at two doors, then the student says the rule FIRST (discovery), then the rule is stated, then the switchboard. ----------
  { id: 'detective', part: 4, kind: 'sort', plate: 'school-doors', trains: [4], title: 'The Bouncer: two doors', prompt: 'Two doors, two tenses. Does the sentence say when (a finished time), or is it an experience up to now?', bins: [
    { id: 'when', label: 'DOOR 1 · PAST SIMPLE', note: 'a finished time' }, { id: 'now', label: 'DOOR 2 · HAVE + PARTICIPLE', note: 'up to now, no time' },
  ], items: [
    { id: 's1', text: 'Last summer I went to Spain.', bin: 'when' },
    { id: 's2', text: 'I have flown across the world twice.', bin: 'now' },
    { id: 's3', text: 'Last month my cousin dared me.', bin: 'when' },
    { id: 's4', text: 'I have never tried surfing.', bin: 'now' },
    { id: 's5', text: 'I have eaten insects in Thailand.', bin: 'now' },
    { id: 's6', text: 'We saw a film yesterday.', bin: 'when' },
    { id: 's7', text: 'I have never ridden a horse.', bin: 'now' },
  ] } satisfies SortScene,
  { id: 'notice', part: 4, kind: 'speak', plate: 'school-doors', trains: [4], title: 'You first: what is the rule?', who: 'Vee', turns: [
    { step: 'free', prompt: 'Look at the two doors. What do you notice? Say the rule in your own words, before I say it. One or two sentences.', model: 'Door one has a time word, like last summer. Door two has have and no time.' },
  ] } satisfies SpeakScene,
  { id: 'rule', part: 4, kind: 'rule', plate: 'school-doors', trains: [3, 4], title: 'Three forms, two tenses', who: 'Vee', lines: [
    { rule: 'Every verb has three forms: base, past simple, past participle.', example: 'go, went, gone' },
    { rule: 'Past simple: a finished time, so we say when.', example: 'I went to Spain last summer.' },
    { rule: 'Have and the past participle: an experience up to now, no time.', example: 'I have been to Spain.' },
  ] } satisfies RuleScene,
  // Wave 2 (owner "go" 2026-10-17, plan amendment 2): after the rule, before the production games and the Mission. Trains criterion 4 (past simple or present perfect).
  { id: 'switchboard', part: 4, kind: 'switchboard', plate: 'bucket-list-wall', trains: [4], title: 'Timeline Switchboard', who: 'Vee',
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
  // ---------- ACT 6 · DARE RUN: a branching talk with a narrator twist (Duolingo Roleplay idea), then the interview chains. ----------
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
    { say: 'Breaking news from Vee: my flight to Rome is cancelled! Have you ever missed a flight?', options: [
      { text: 'Yes, I have. I missed one in Madrid last year.', score: 2, reply: 'Oh no! What did you do?', note: 'The experience with have, then the story with a finished time. The follow-up chain.' },
      { text: 'Yes, I have missed.', score: 1, reply: 'Really? When was that?', note: 'Have is right, but it needs the participle: “Yes, I have.” Then add when.' },
      { text: 'Yes, I have missed it yesterday.', score: 0, reply: 'Yesterday? Hmm.', note: 'Yesterday is a finished time: use the past simple, “I missed it yesterday.”' },
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
  // ---------- ACT 7 · RE-BLUFF: retake the cold test with your own experiences, keep three Dare cards, release your list, wrap. ----------
  { id: 'mission', part: 6, kind: 'speak', plate: 'classroom-morning', trains: [4, 5], title: 'Re-Bluff: your turn', who: 'Theo', turns: [
    { step: 'guided', prompt: 'Take 1. Now you bluff me. Tell me three experiences about yourself: two true, one lie. Use have for the experience and the past simple when you say when. I will ask two questions about each.', model: 'I have been to Italy. I have never eaten sushi. I have broken my arm. I went to Italy last August.' },
    { step: 'free', prompt: 'Take 2, with a new listener: say your three again, and add one detail with a time for each.' },
    { step: 'guided', prompt: 'Think back to the first round, when you asked me questions. What did you say differently this time? One sentence.', model: 'This time I used have for the experience and the past simple for the time.' },
  ] } satisfies SpeakScene,
  { id: 'deck', part: 6, kind: 'deck', plate: 'bucket-list-wall', trains: [5], title: 'Your Dare Deck', who: 'Vee', keep: 3,
    intro: 'You earned the whole deck. Now keep three Dare cards for your own bucket list. There is no wrong choice: pick the three you would really give a go.',
    cards: [
      { id: 'dolphins', art: 'dare-dolphins', text: 'swim with dolphins', frame: 'I want to swim with dolphins.' },
      { id: 'guitar', art: 'dare-guitar', text: 'learn the guitar', frame: 'I want to learn the guitar.' },
      { id: 'tent', art: 'dare-tent', text: 'sleep in a tent', frame: 'I want to sleep in a tent by a lake.' },
      { id: 'surf', art: 'dare-surf', text: 'give surfing a go', frame: 'I want to give surfing a go.' },
      { id: 'japan', art: 'dare-japan', text: 'visit Japan', frame: 'I want to visit Japan.' },
      { id: 'race', art: 'dare-race', text: 'run a race', frame: 'I want to run a race.' },
    ] } satisfies DeckScene,
  { id: 'release', part: 6, kind: 'speak', plate: 'bucket-list-wall', trains: [5], title: 'Release: your own list', who: 'Vee', turns: [
    { step: 'free', prompt: 'Tell me about your bucket list for about one minute: three things you have done, and your three Dare cards, the things you want to give a go.', model: 'I have been to… I have never… I want to give … a go.' },
  ] } satisfies SpeakScene,
  { id: 'my-list', part: 6, kind: 'write', plate: 'bucket-list-wall', trains: [5], title: 'Write three sentences', prompt: 'Write three sentences about your own list.', rows: [
    { label: 'Something you have done (have + participle).', frame: 'I have …', accept: ["^(i have|i(’|')ve) \\w+ .+"], hint: 'I have + participle: I have been to Italy.', sample: 'I have been to Italy.' },
    { label: 'When you did it (past simple + a time).', frame: 'I … last / in / ago', accept: ['\\b(yesterday|last|ago|in (19|20)\\d\\d|in (january|february|march|april|may|june|july|august|september|october|november|december))\\b'], hint: 'A finished time needs the past simple: I went last August.', sample: 'I went there last August.' },
    { label: 'Something you want to do (one of your Dare cards).', frame: 'I want to …', accept: ['\\b(want to|would like to|am going to|hope to)\\b'], hint: 'I want to + a verb: I want to give surfing a go.', sample: 'I want to give surfing a go.' },
  ] } satisfies WriteScene,

  { id: 'wrap', part: 6, kind: 'wrap', plate: 'trophy-reveal', heading: 'Cold open complete!', teachBack: 'When do we use the past simple, and when do we use have and the past participle?' } satisfies WrapScene,

];

export const B1_S01_E1: LessonScript = {
  shape: 'ttt',
  blueprintId: 'B1-S01-E1',
  title: 'Have You Ever...? · Cold Open',
  criteria: CRITERIA,
  cast: ['Vee', 'Ava', 'Theo', 'Mia'],
  partMinutes: [6, 12, 8, 8, 9, 10, 7],
  scenes,
  quest: {
    name: 'The Dare Deck',
    stages: [
      { title: 'Cold Bluff', goal: 'Catch Theo’s lie, before anything is taught.' },
      { title: 'The Desk', goal: 'Check Ava’s blog: true, false or not given, and prove it.' },
      { title: 'Word Vault', goal: 'Crack open six words and find them in the room.' },
      { title: 'The Forge', goal: 'Forge three forms of nine verbs, and bet on yourself.' },
      { title: 'The Bouncer', goal: 'Send each sentence through the right door, then say the rule.' },
      { title: 'Dare Run', goal: 'Talk it through, and keep up when the news changes.' },
      { title: 'Re-Bluff', goal: 'Bluff Theo with your own life, keep three Dare cards, and say them aloud.' },
    ],
    clue: 'The class has a dare: everyone makes a bucket list this term and ticks it off before the break.',
  },
};
export default B1_S01_E1;
