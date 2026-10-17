// B1-S01-E4 "Have You Ever...? · On Air" (speaking: react, ask a follow-up, keep the talk going), built on the player v2 story state and the On Air game. Chapter 4 of the Season "Bucket list".
// Plan: docs/academy-b1-s01-e4-plan.md (decisions taken by the owner's delegation 2026-10-17). Research and game search: docs/research/academy-b1-s01-e4-research.md. Scenario: docs/scenarios/academy-b1s01e4-club-fm.md.
// Blueprint: ACADEMY_LESSON_BLUEPRINTS 'B1-S01-E4' ('on-air': speaking, chunks, role-play, Release = record the dialogue). Story: the student hosts the school radio show, the guests answer in one word ("dead air"), and the host
// opens them up by reacting, asking about the detail in the past simple and sharing. Task first (the rejoinder sort), rule after; model before the rule.
import type { LessonScript, SceneBase } from '../types';
import type { ComicScene } from '../scenes/comic/Comic';
import type { RuleScene } from '../scenes/rule/Rule';
import type { ModelScene } from '../scenes/model/Model';
import type { SortScene } from '../scenes/sort/Sort';
import type { ChoiceScene } from '../scenes/choice/Choice';
import type { BuildScene } from '../scenes/build/Build';
import type { SpeakScene } from '../scenes/speak/Speak';
import type { WriteScene } from '../scenes/write/Write';
import type { MatchScene } from '../scenes/match/Match';
import type { MemoryScene } from '../scenes/memory/Memory';
import type { TeachScene } from '../scenes/teach/Teach';
import type { BossScene } from '../scenes/boss/Boss';
import type { WrapScene } from '../scenes/wrap/Wrap';
import type { LobbyScene } from '../scenes/lobby/Lobby';
import type { OnAirScene } from '../scenes/onair/OnAir';

export const CRITERIA = [
  'I can react to news with a fitting reaction (Really? No way! That sounds amazing!).',
  'I can ask a follow-up question about the detail (When did you go? What was it like?) in the past simple.',
  'I can answer “Have you ever …?” with Yes, I have and a detail, or No, I haven’t, but I would like to.',
  'I can say a reaction with the stress on the right part and with feeling (a-MA-zing, in-CRED-i-ble).',
  'I can run a short interview, find the one experience that is not true, and say why.',
];

const BOOTH = 'club-fm-booth';
const COURTYARD = 'club-fm-courtyard';
type Scene = SceneBase & Record<string, unknown>;
const scenes: Scene[] = [
  { id: 'lobby', part: 0, kind: 'lobby', plate: BOOTH, heading: 'Ask and React', sub: 'Club FM · lesson 4' } satisfies LobbyScene,
  { id: 'lead-in', part: 0, kind: 'speak', plate: BOOTH, trains: [3], title: 'Warm-up: one-word answers', who: 'Vee', turns: [
    { step: 'guided', prompt: 'Tell me one thing you have done that most people have not. I will answer with one word only. Notice how it feels when I do that.', model: 'I have swum with a dolphin.' },
  ] } satisfies SpeakScene,

  { id: 'rem-choice', part: 1, kind: 'choice', plate: 'classroom-morning', trains: [3], title: 'Remember?', questions: [
    { q: 'The past participle of “go” is…', options: ['gone', 'went', 'goed'], answer: 0, why: 'Go, went, gone.' },
    { q: 'Theo is back at his desk. He has ___ to the library.', options: ['been', 'gone'], answer: 0, why: 'He came back, so we say been.' },
    { q: 'Which sentence is about your whole life, with no finished time?', options: ['I have flown in a plane.', 'I flew in a plane last year.', 'I was flying in a plane.'], answer: 0, why: 'Have and a participle: an experience up to now.' },
    { q: 'Which question asks about the time of one trip?', options: ['When did you go?', 'When have you gone?', 'When do you went?'], answer: 0, why: 'A finished time uses the past simple: When did you go?' },
  ] } satisfies ChoiceScene,
  { id: 'rem-build', part: 1, kind: 'build', plate: 'classroom-morning', trains: [3, 2], title: 'Never Have I Ever, with a follow-up', items: [
    { words: ['I', 'have', 'never', 'flown', 'in', 'a', 'plane'], hint: 'I have never + the past participle: flown.' },
    { words: ['Have', 'you', 'ever', 'been', 'to', 'Japan'], hint: 'Have you ever + been.' },
    { words: ['When', 'did', 'you', 'go'], hint: 'The details are a finished time: past simple, When did you go?' },
  ] } satisfies BuildScene,

  { id: 'predict', part: 2, kind: 'speak', plate: BOOTH, trains: [1], title: 'Before you listen', who: 'Vee', turns: [
    { step: 'free', prompt: 'Imagine a live radio show where the guest only says Yes and No. What happens to the show? Say one sentence.' },
  ] } satisfies SpeakScene,
  { id: 'story-fm', part: 2, kind: 'comic', plate: BOOTH, trains: [1, 2], title: 'Dead Air', beats: [
    { plate: 'story-b1s4-1', caption: 'Friday, lunchtime. Vee hands the host chair to a new host: you.', spots: { Vee: { x: 50, y: 6, w: 28 } }, heads: { Vee: { x: 24, y: 14 } }, lines: [
      { who: 'Vee', text: 'Welcome to Club FM, live on Friday! Today you are the host.', shout: true, sfx: 'LIVE!' },
      { who: 'Vee', text: 'Our guest is shy, so ask good questions. A good host makes a quiet guest talk.' },
    ] },
    { plate: 'story-b1s4-2', caption: 'Mia is the guest. She answers every question with one word.', spots: { Mia: { x: 2, y: 8, w: 30 } }, heads: { Mia: { x: 66, y: 24 } }, lines: [
      { who: 'Vee', text: 'Mia, have you ever been to Japan?' },
      { who: 'Mia', text: 'Yes.' },
      { who: 'Vee', text: 'Hmm. And what did you do there?' },
      { who: 'Mia', text: 'Nothing.', sfx: 'Hmm…' },
    ] },
    { plate: 'story-b1s4-3', caption: 'Silence on the radio is called dead air. Vee needs the host to save the show.', spots: { Vee: { x: 50, y: 6, w: 28 } }, heads: { Vee: { x: 24, y: 14 } }, lines: [
      { who: 'Vee', text: 'Dead air! Quick, say something. React, and ask about the detail!', shout: true, sfx: 'DEAD AIR!' },
    ] },
  ] } satisfies ComicScene,
  { id: 'listen-q', part: 2, kind: 'choice', plate: BOOTH, trains: [1, 2], title: 'What did you hear?', questions: [
    { q: 'What is the problem on the show?', options: ['The guest answers with one word.', 'The microphone is broken.', 'The host is late.'], answer: 0 },
    { q: 'What does dead air mean?', options: ['Nobody is talking on the radio.', 'The window is open.', 'The show is very loud.'], answer: 0 },
    { q: 'What does Vee want the host to do?', options: ['React and ask about the detail.', 'Say goodbye.', 'Change the guest.'], answer: 0 },
  ] } satisfies ChoiceScene,
  { id: 'notice-sort', part: 2, kind: 'sort', plate: COURTYARD, trains: [1, 2], title: 'Rejoinder Sort', prompt: 'A guest says: “I have been to Japan.” Which replies keep the guest talking, and which are a dead end?', bins: [
    { id: 'dead', label: 'DEAD END', note: 'the guest has nothing to answer' }, { id: 'goes', label: 'KEEPS IT GOING', note: 'the guest wants to say more' },
  ], items: [
    { id: 'r1', text: 'Oh.', bin: 'dead', hint: 'One word, no question: the guest has nothing to answer.' },
    { id: 'r2', text: 'Really? When did you go?', bin: 'goes', hint: 'A reaction and a question about the time.' },
    { id: 'r3', text: 'OK.', bin: 'dead', hint: 'A dead end: it shows no interest.' },
    { id: 'r4', text: 'Wow! What was it like?', bin: 'goes', hint: 'A reaction and a question about the experience.' },
    { id: 'r5', text: 'I see.', bin: 'dead', hint: 'It is polite but it closes the door.' },
    { id: 'r6', text: 'No way! Who did you go with?', bin: 'goes', hint: 'A strong reaction and a question about the people.' },
    { id: 'r7', text: 'Good.', bin: 'dead', hint: 'One word again: a dead end.' },
    { id: 'r8', text: 'Me too! I went to Italy.', bin: 'goes', hint: 'Sharing your own experience keeps the talk going.' },
  ] } satisfies SortScene,

  { id: 'model', part: 3, kind: 'model', plate: BOOTH, trains: [1, 2, 3], title: 'Watch Vee host the show', who: 'Vee', steps: [
    { phase: 'iDo', text: 'Watch me host. The guest says: I have been to Iceland. I react: Really? That sounds amazing! Then I ask about the detail: When did you go? Who did you go with? What was it like? Listen: the guest says more and more.' },
    { phase: 'weDo', text: 'Let us try it together. I say: I have climbed a volcano. You react and ask one question. Say it with me: Really? When did you climb it?' },
    { phase: 'youDo', text: 'Now you are the host. First the three chunks, then the show.' },
  ] } satisfies ModelScene,
  { id: 'rule', part: 3, kind: 'rule', plate: BOOTH, trains: [1, 2, 3, 4], title: 'How to keep a guest talking', who: 'Vee', lines: [
    { rule: 'First react. A short reaction shows interest, and the guest wants to say more.', example: 'Really? No way! That sounds amazing!' },
    { rule: 'Then ask about the detail. The trip is finished, so the question uses the past simple.', example: 'When did you go? Who did you go with? What was it like?' },
    { rule: 'Keep it going. Share your own experience, or say you have not, but you would like to.', example: 'Me too! I have been to Italy. No, I haven’t, but I would like to.' },
  ] } satisfies RuleScene,
  { id: 'teach-a', part: 3, kind: 'teach', plate: BOOTH, trains: [1, 3], title: 'Four reactions', who: 'Vee', pages: [
    { word: 'Really?', art: 'b4-really', meaning: 'a short word to show you are surprised and interested', example: 'I climbed a volcano. Really?', clue: 'Your voice goes up at the end.' },
    { word: 'No way!', art: 'b4-noway', meaning: 'a strong reaction: it is hard to believe', example: 'I met a famous singer. No way!', clue: 'The strong part is WAY.' },
    { word: 'That sounds amazing.', art: 'b4-sounds', meaning: 'a reaction to good or exciting news', example: 'We slept in a tree house. That sounds amazing!', clue: 'The strong part of amazing is MA.' },
    { word: 'Me too.', art: 'b4-metoo', meaning: 'says that it is the same for you', example: 'I have been to Italy. Me too!', clue: 'For a no sentence we say: Me neither.' },
  ] } satisfies TeachScene,
  { id: 'match-a', part: 3, kind: 'match', plate: COURTYARD, trains: [1, 3], title: 'Read and match: the reactions', pairs: [
    { left: 'Really?', right: 'shows surprise' }, { left: 'No way!', right: 'a strong surprise' },
    { left: 'That sounds amazing.', right: 'reacts to good news' }, { left: 'Me too.', right: 'it is the same for me' },
  ] } satisfies MatchScene,
  { id: 'teach-b', part: 3, kind: 'teach', plate: BOOTH, trains: [2], title: 'Four follow-up questions', who: 'Vee', pages: [
    { word: 'What was it like?', art: 'b4-like', meaning: 'asks the guest to describe the experience', example: 'You went to Japan? What was it like?', clue: 'The trip is finished, so we say was.' },
    { word: 'When did you go?', art: 'b4-when', meaning: 'asks for the time of one finished trip', example: 'I have been to Rome. When did you go?', clue: 'After did we use the base verb: go.' },
    { word: 'Who did you go with?', art: 'b4-who', meaning: 'asks about the people on the trip', example: 'I have been to Spain. Who did you go with?', clue: 'The word with stays at the end.' },
    { word: 'How did you feel?', art: 'b4-felt', meaning: 'asks for the guest’s feeling', example: 'You won the prize? How did you feel?', clue: 'Did and feel: the verb stays in the base form.' },
  ] } satisfies TeachScene,
  { id: 'match-b', part: 3, kind: 'match', plate: COURTYARD, trains: [2], title: 'Read and match: the questions', pairs: [
    { left: 'What was it like?', right: 'asks for a description' }, { left: 'When did you go?', right: 'asks for the time' },
    { left: 'Who did you go with?', right: 'asks about the people' }, { left: 'How did you feel?', right: 'asks for a feeling' },
  ] } satisfies MatchScene,
  { id: 'chunk-memory', part: 3, kind: 'memory', plate: BOOTH, trains: [1, 2], title: 'Memory: the host chunks', pairs: [
    { art: 'b4-really', text: 'Really?' }, { art: 'b4-sounds', text: 'That sounds amazing.' }, { art: 'b4-like', text: 'What was it like?' },
    { art: 'b4-when', text: 'When did you go?' }, { art: 'b4-who', text: 'Who did you go with?' }, { art: 'b4-felt', text: 'How did you feel?' },
  ] } satisfies MemoryScene,
  { id: 'radar', part: 3, kind: 'choice', plate: COURTYARD, trains: [1, 2, 3], title: 'Reaction Radar', questions: [
    { q: 'Mia says: “I have never eaten pizza.” Which reaction shows surprise?', options: ['No way! Never?', 'Oh. OK.', 'I have a dog.'], answer: 0, why: 'A strong reaction and a question show interest.' },
    { q: 'Theo says: “I met a famous actor.” What do you say?', options: ['Really? Who was it?', 'Yes.', 'I like films.'], answer: 0, why: 'React first, then ask about the detail.' },
    { q: 'Ava says: “I have flown over the Alps.” The best follow-up is…', options: ['What was it like?', 'What is it like?', 'What did it like?'], answer: 0, why: 'The flight is finished: What was it like?' },
    { q: 'Vee says: “I have been to Rome twice.” Ask about the time of one trip:', options: ['When did you go?', 'When have you gone?', 'When you went?'], answer: 0, why: 'A finished time uses the past simple: When did you go?' },
    { q: 'Mia says: “I have never been camping.” You have not either:', options: ['Me neither.', 'Me too.', 'So do I.'], answer: 0, why: 'After a no sentence we say: Me neither.' },
    { q: 'Theo says: “I won a prize!” Ask about the feeling:', options: ['How did you feel?', 'How do you felt?', 'How you feel?'], answer: 0, why: 'Did and the base verb: How did you feel?' },
  ] } satisfies ChoiceScene,
  { id: 'forge-ask', part: 3, kind: 'build', plate: BOOTH, trains: [2, 3], title: 'Question Forge', items: [
    { words: ['When', 'did', 'you', 'go'], hint: 'When did you + the base verb.' },
    { words: ['What', 'was', 'it', 'like'], hint: 'What was it like? The trip is finished.' },
    { words: ['Who', 'did', 'you', 'go', 'with'], hint: 'Who did you go with? With stays at the end.' },
    { words: ['Have', 'you', 'ever', 'been', 'to', 'Peru'], hint: 'Have you ever + been.' },
    { words: ['No', 'I', 'haven’t', 'but', 'I', 'would', 'like', 'to'], hint: 'No, I haven’t, but I would like to.' },
  ] } satisfies BuildScene,
  { id: 'surprise-lane', part: 3, kind: 'speak', plate: COURTYARD, trains: [4], title: 'Say it with feeling', who: 'Vee', turns: [
    { step: 'shadow', prompt: 'Say after me, and let your voice go up and show the feeling. Really? No way! That sounds amazing! That is incredible!', model: 'Really? No way! That sounds amazing! That is incredible!' },
    { step: 'repeat', prompt: 'Again, and make the strong part of the word louder: a-MA-zing, in-CRED-i-ble, fan-TAS-tic.', model: 'Amazing. Incredible. Fantastic.' },
  ] } satisfies SpeakScene,

  { id: 'dead-air-boss', part: 4, kind: 'boss', plate: BOOTH, trains: [1, 2, 3], title: 'Beat the Dead Air', boss: 'Dead Air', shields: 3, prompt: 'The silence is growing. Choose the line that keeps the guest talking. Three shields: a dead-end line costs one.', rounds: [
    { frame: 'Guest: “I went skiing in March.”  You: ___', options: ['Wow! Where did you go?', 'Oh.', 'I have skis.', 'Good.'], answer: 0, why: 'A reaction and a question about the detail keep the guest talking.' },
    { frame: 'Guest: “I have never ridden a horse.”  You: ___', options: ['Really? Would you like to?', 'OK.', 'Horses are big.', 'I see.'], answer: 0, why: 'Really? shows interest, and a question invites more.' },
    { frame: 'Guest: “I have been to Brazil twice.”  You: ___', options: ['That sounds amazing! When did you go?', 'When have you gone?', 'Brazil.', 'Nice.'], answer: 0, why: 'React, then ask about the time with the past simple.' },
    { frame: 'Guest: “I won the school quiz.”  You: ___', options: ['No way! How did you feel?', 'How do you felt?', 'Quiz.', 'Yes.'], answer: 0, why: 'No way! and How did you feel? with did and the base verb.' },
    { frame: 'Guest: “I have never been camping.”  You: ___', options: ['Me neither, but I would like to.', 'Me too.', 'So am I.', 'Yes.'], answer: 0, why: 'After a no sentence we say Me neither.' },
    { frame: 'Guest: “I met a famous singer!”  You: ___', options: ['Really? What was she like?', 'What is she like?', 'Who singer?', 'OK.'], answer: 0, why: 'The meeting is finished, so we use was: What was she like?' },
  ] } satisfies BossScene,

  { id: 'mission-model', part: 5, kind: 'model', plate: BOOTH, trains: [1, 2, 3, 5], title: 'Watch a live interview', who: 'Vee', steps: [
    { phase: 'iDo', text: 'Listen to the host and the guest. Guest: I have never eaten sushi. Host: No way! Never? Guest: Never. Host: Have you ever been to Japan? Guest: Yes, I have. Host: When did you go? Guest: Last summer. Host: Did you eat sushi there? Guest: Oh. Yes, in Tokyo. Host: Aha! You said never, but you ate it in Tokyo last summer!' },
    { phase: 'weDo', text: 'The host found the lie with questions about the detail. Say the three questions with me: Have you ever been to Japan? When did you go? What did you eat?' },
    { phase: 'youDo', text: 'Now you are the host, live on air.' },
  ] } satisfies ModelScene,
  { id: 'show', part: 5, kind: 'onair', look: 'show', plate: BOOTH, trains: [1, 2, 3], title: 'Club FM · Friday live', guest: 'Mia', producer: 'Vee',
    intro: 'You are the host today. Mia is shy, so react, ask about the detail, and keep her talking. There is no timer, and you can hear Vee say any card first.',
    flag: 'miaOpenedUp', flagAt: 5,
    exchanges: [
      { guest: 'I went to Japan last summer.', options: [
        { kind: 'react', fit: 2, text: 'Really? That sounds amazing!', reply: 'Thanks! It was the best trip of my life. The food and the trains were so different from home.', note: 'A reaction shows interest, so Mia wants to say more.' },
        { kind: 'ask', fit: 2, text: 'When did you go, and who did you go with?', reply: 'I went in July with my cousin. We stayed for two weeks and we visited three cities.', note: 'A question about the detail in the past simple keeps the talk going.' },
        { kind: 'flat', fit: 0, text: 'Oh. OK.', reply: 'Yeah.', note: 'A dead end: “Oh. OK.” gives Mia nothing to answer. React or ask.' },
      ] },
      { guest: 'I have been to Japan twice.', options: [
        { kind: 'share', fit: 1, text: 'Me too! I have been to Italy twice.', reply: 'Nice! Which city did you like best?', note: 'Sharing is friendly. Next, ask about her trip too.' },
        { kind: 'ask', fit: 2, text: 'What was it like the second time?', reply: 'Quieter. We visited a small town and the people there were so kind to us.', note: 'What was it like? asks for a feeling, not a yes or no.' },
        { kind: 'flat', fit: 0, text: 'Good.', reply: 'Mm.', note: 'One word closes the door. Ask a question about the detail.' },
      ] },
      { guest: 'I have never tried fugu, but my cousin has.', options: [
        { kind: 'react', fit: 2, text: 'No way! Why not?', reply: 'It is the scary fish! He said it was fine, but I said no, thank you very much.', note: 'No way! shows surprise, and Why not? asks for the reason.' },
        { kind: 'flat', fit: 0, text: 'I see.', reply: 'Yes.', note: '“I see.” does not show interest. Try a reaction with a question.' },
        { kind: 'share', fit: 1, text: 'I have never tried it either.', reply: 'Ha! Then we are both safe.', note: 'Good sharing. A question would help her say more.' },
      ] },
      { guest: 'Next summer I want to go to Peru.', options: [
        { kind: 'ask', fit: 2, text: 'Have you ever been to South America?', reply: 'No, I haven’t, but I have always wanted to see the old city of Machu Picchu.', note: 'Have you ever…? links her plan to her past.' },
        { kind: 'react', fit: 1, text: 'Wow, lucky you!', reply: 'Thank you!', note: 'Nice reaction. A follow-up question makes the answer longer.' },
        { kind: 'flat', fit: 0, text: 'OK.', reply: 'Mm-hm.', note: 'A dead end. Ask something about Peru.' },
      ] },
    ] } satisfies OnAirScene,
  { id: 'truths', part: 5, kind: 'onair', look: 'twotruths', plate: BOOTH, trains: [2, 3, 5], title: 'Two Truths and a Lie · live', guest: 'Mia', producer: 'Vee',
    intro: 'Mia will tell you three experiences. Two are true and one is a lie. Ask follow-up questions, read your notepad, and find the lie.',
    flag: 'caughtLie', minProbes: 3, lieId: 'b',
    claims: [
      { id: 'a', text: 'I have been to Japan twice.', probes: [
        { q: 'When did you go the first time?', a: 'In two thousand twenty two, with my family.' },
        { q: 'Who did you go with the second time?', a: 'With my cousin, last July.' },
      ] },
      { id: 'b', text: 'I have never eaten sushi.', probes: [
        { q: 'Where did you eat in Japan?', a: 'In Tokyo. The sushi bar near the station was great!', tell: true },
        { q: 'What is your favourite food?', a: 'Ramen, I think.' },
      ] },
      { id: 'c', text: 'I have climbed Mount Fuji.', probes: [
        { q: 'When did you climb it?', a: 'Last summer, early in the morning.' },
        { q: 'What was it like?', a: 'Cold at the top, but the sunrise was beautiful.' },
      ] },
    ],
    why: 'she ate sushi in Tokyo last summer.',
    explain: 'Right! “I have never eaten sushi” cannot be true: Mia says she ate it in Tokyo. Never and a finished time do not go together.',
    sayFrame: 'I think number {n} is the lie, because {why}' } satisfies OnAirScene,
  { id: 'take', part: 5, kind: 'speak', plate: BOOTH, trains: [1, 2, 3, 5], title: 'Mission: host Theo', who: 'Theo', turns: [
    { step: 'guided', prompt: 'Take 1. I am your guest, and I am shy. Host me for one minute: react to what I say, ask two questions about the detail, and share one thing of your own.', model: 'I have been to Iceland. Really? That sounds amazing! When did you go? What was it like?' },
    { step: 'free', prompt: 'Take 2. A new guest: Mia has one true story she is proud of. Interview her without frames: find out what, when and how she felt.', model: 'Have you ever won a prize? Yes, I have. Really? When did you win it? How did you feel?' },
  ] } satisfies SpeakScene,

  { id: 'my-lines', part: 6, kind: 'write', plate: 'locker-hall', trains: [1, 2, 3], title: 'Write your host lines', prompt: 'Write three lines for your own radio show: a reaction, a follow-up question in the past simple, and a share.', rows: [
    { label: 'A reaction to “I have been to Iceland.”', frame: 'Really? / No way! / That sounds …', accept: ['\\b(really|no way|wow|that sounds|amazing|incredible|fantastic)\\b'], hint: 'A short reaction: Really? No way! That sounds amazing!', sample: 'No way! That sounds amazing!' },
    { label: 'A follow-up question about the detail.', frame: 'When did you …? / What was it like? / Who did you …?', accept: ['\\b(when|where|who|what|how)\\b.*\\b(did|was)\\b.*\\?'], hint: 'When / Where / Who did you + base verb? What was it like?', sample: 'When did you go, and who did you go with?' },
    { label: 'Share your own experience.', frame: 'Me too! I have … / No, I haven’t, but …', accept: ['\\b(me too|me neither|i have|i’ve|i\'ve|i haven’t|i haven\'t)\\b'], hint: 'Me too! I have been to … or No, I haven’t, but I would like to.', sample: 'Me too! I have been to Italy.' },
  ] } satisfies WriteScene,
  { id: 'release', part: 6, kind: 'speak', plate: 'locker-hall', trains: [1, 2, 3, 4], title: 'Release: record the dialogue', who: 'Vee', turns: [
    { step: 'free', prompt: 'Record your dialogue with me, privately first: react, ask a follow-up, share, ask again, react, close the show. Six lines. About forty seconds.', model: 'Really? That sounds amazing! When did you go? Me too! I have been to Italy. Who did you go with? Thank you for being on Club FM!' },
  ] } satisfies SpeakScene,

  { id: 'wrap', part: 7, kind: 'wrap', plate: BOOTH, heading: 'Show over! The guest talked, and the dead air is gone.', story: { showFinished: true }, teachBack: 'How do you keep a guest talking? Say the three jobs of a good host.' } satisfies WrapScene,
];

export const B1_S01_E4: LessonScript = {
  blueprintId: 'B1-S01-E4',
  title: 'Have You Ever...? · On Air',
  criteria: CRITERIA,
  cast: ['Vee', 'Mia', 'Theo'],
  partMinutes: [3, 5, 12, 17, 4, 10, 5, 4],
  scenes,
  previously: {
    from: 'B1-S01-E3',
    beats: [
      { when: 'caseClosed', text: 'The Missing Postcard turned up: Theo had taken it to copy the stamp.' },
      { text: 'You caught a contradiction with one follow-up question.' },
    ],
  },
  quest: {
    name: 'Live on Club FM',
    stages: [
      { title: 'On the air soon', goal: 'Warm up and meet the show.' },
      { title: 'Remember?', goal: 'Bring back the pattern and the past simple follow-up.' },
      { title: 'Dead Air', goal: 'Hear the story and sort the replies.' },
      { title: 'Host school', goal: 'Learn the three jobs of a host and eight chunks.' },
      { title: 'Beat the Dead Air', goal: 'Choose the lines that keep the guest talking.' },
      { title: 'Live on air', goal: 'Host the show and catch the lie.' },
      { title: 'Release', goal: 'Write and record your own host lines.' },
      { title: 'Show over', goal: 'Say the three jobs back to unlock your clue.' },
    ],
    clue: 'Mia’s answers showed more than she said: she keeps her own bucket list of places. Whose list is the longest?',
  },
};
export default B1_S01_E4;
