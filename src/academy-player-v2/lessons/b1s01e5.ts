// B1-S01-E5 "Have You Ever...? · Deep Dive" (reading: skim, scan, judge with a line, relay the key points, edit your own writing), built on the player v2 story state and the Gazette games.
// Plan: docs/academy-b1-s01-e5-plan.md (decisions taken under the owner's delegation 2026-10-17). Research and game search: docs/research/academy-b1-s01-e5-research.md. Scenario: docs/scenarios/academy-b1s01e5-gazette.md.
// Blueprint: ACADEMY_LESSON_BLUEPRINTS 'B1-S01-E5' ('deep-dive': reading, writing and vocabulary secondary; cast Vee (introduces the text) and Ava (asks follow-up questions)).
// Story: the school paper is about to print "Four bucket lists, one winner?" and nobody has checked it. The student is the fact-checker. Numbers are written as words (the recorded voices read them).
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
import type { WrapScene } from '../scenes/wrap/Wrap';
import type { LobbyScene } from '../scenes/lobby/Lobby';
import type { ArchiveScene, Clipping } from '../scenes/archive/Archive';
import type { FactScene } from '../scenes/factcheck/FactCheck';
import type { RedPenScene } from '../scenes/redpen/RedPen';

export const CRITERIA = [
  'I can skim a longer text and say what it is mainly about.',
  'I can find a key detail (who, how many, when) by scanning with a keyword.',
  'I can decide if a statement is true, false or not given, and show the line.',
  'I can tell the key points to someone else with have / has and the past simple (According to the article, Theo has done six things).',
  'I can write a short note and rewrite sentences to fix mistakes.',
];

const NEWS = 'gazette-newsroom';
const ARCH = 'gazette-archive';

/** the article "Four bucket lists, one winner?", filed as nine clippings (one per paragraph; each sentence is a line that can be proved) */
export const ARTICLE: Clipping[] = [
  { id: 'c1', lines: ['Four bucket lists, one winner?', 'At the start of term, Vee dared the Club to write a bucket list and tick things off.', 'Ten weeks later, we asked four members what they have done so far and what they still want to do.'], keywords: ['bucket list', 'dared', 'term', 'four', 'so far', 'Club', 'weeks'], leads: ['Vee', 'Ava', 'Theo', 'Mia'] },
  { id: 'c2', lines: ['Vee has done four things.', 'He has flown over the Alps once, he has been to Rome twice, and he has eaten snails in Paris.', 'He has also written a song for a friend.'], keywords: ['Vee', 'Alps', 'Rome', 'snails', 'Paris', 'song', 'twice', 'four'] },
  { id: 'c3', lines: ['Vee still wants to sleep in a tent by a lake.', '“I have never been camping,” he says.', '“I hope to tick it off in June.”'], keywords: ['Vee', 'tent', 'lake', 'camping', 'June'] },
  { id: 'c4', lines: ['Ava has done three things.', 'She has swum with dolphins, she has been to Greece once, and she has learned to surf last summer.'], keywords: ['Ava', 'dolphins', 'Greece', 'surf', 'last', 'summer', 'three'] },
  { id: 'c5', lines: ['Ava still wants to see the northern lights.', '“It is the thing I want to do most,” she says.'], keywords: ['Ava', 'northern lights', 'lights'] },
  { id: 'c6', lines: ['Mia has done two things so far.', 'She has been to London three times, and she has learned to play the guitar.', '“I am slow,” she laughs, “but I am still going!”'], keywords: ['Mia', 'London', 'guitar', 'three', 'two', 'so far', 'times'] },
  { id: 'c7', lines: ['Mia still wants to run a ten-kilometre race.', '“My legs say no, but my head says yes,” she says.'], keywords: ['Mia', 'race', 'run'] },
  { id: 'c8', lines: ['Theo has done six things.', 'He has been to Japan twice and to Brazil twice, he has climbed Mount Fuji, and he has met a famous singer.', 'He also went skiing last March, and he won the school quiz in January.'], keywords: ['Theo', 'Japan', 'Brazil', 'Fuji', 'singer', 'skiing', 'last', 'March', 'quiz', 'January', 'six', 'twice'], leads: ['altogether'] },
  { id: 'c9', lines: ['Theo still wants to visit Peru.', 'But he has already ticked off more things than anyone else.', 'Altogether, the Club has done fifteen things, and every list has at least two on it.'], keywords: ['Theo', 'Peru', 'altogether', 'fifteen', 'more', 'at least', 'Club'] },
];

type Scene = SceneBase & Record<string, unknown>;
const scenes: Scene[] = [
  { id: 'lobby', part: 0, kind: 'lobby', plate: NEWS, heading: 'Deep Dive', sub: 'The Bucket List Gazette · lesson 5' } satisfies LobbyScene,
  { id: 'lead-in', part: 0, kind: 'speak', plate: NEWS, trains: [4], title: 'Warm-up: your own list', who: 'Vee', turns: [
    { step: 'guided', prompt: 'Tell me one thing on your own bucket list that you have already done, and one thing you still want to do. One sentence each.', model: 'I have been to the sea twice. I still want to see the northern lights.' },
  ] } satisfies SpeakScene,

  { id: 'rem-choice', part: 1, kind: 'choice', plate: 'classroom-morning', trains: [4, 5], title: 'Remember?', questions: [
    { q: 'Which sentence is correct?', options: ['I went to Rome last summer.', 'I have been to Rome last summer.', 'I have went to Rome last summer.'], answer: 0, why: 'Last summer is a finished time: the past simple.' },
    { q: 'Which sentence is correct?', options: ['She has eaten snails.', 'She has ate snails.', 'She eaten snails.'], answer: 0, why: 'Have or has and the past participle: eaten.' },
    { q: 'Theo says: “I have been to Japan twice.” A good follow-up is…', options: ['When did you go?', 'When have you gone?', 'When you went?'], answer: 0, why: 'The details use the past simple.' },
    { q: 'Which means “up to now, in your life”?', options: ['I have climbed a mountain.', 'I climbed a mountain yesterday.', 'I was climbing a mountain.'], answer: 0, why: 'Have and a participle, with no finished time.' },
  ] } satisfies ChoiceScene,
  { id: 'rem-build', part: 1, kind: 'build', plate: 'classroom-morning', trains: [4], title: 'Build it', items: [
    { words: ['She', 'has', 'been', 'to', 'London', 'three', 'times'], hint: 'She has + been, and the number of times at the end.' },
    { words: ['He', 'has', 'never', 'been', 'camping'], hint: 'He has never + been.' },
    { words: ['When', 'did', 'you', 'go'], hint: 'The details use the past simple: When did you go?' },
  ] } satisfies BuildScene,

  { id: 'predict', part: 2, kind: 'speak', plate: NEWS, trains: [1], title: 'Before you read', who: 'Vee', turns: [
    { step: 'free', prompt: 'The Gazette will print an article called Four bucket lists, one winner. Who do you think has done the most? Say one sentence.' },
  ] } satisfies SpeakScene,
  { id: 'story-gazette', part: 2, kind: 'comic', plate: NEWS, trains: [1], title: 'Before we print', beats: [
    { plate: 'story-b1s5-1', caption: 'The Gazette newsroom, the day before the paper is printed.', spots: { Vee: { x: 6, y: 12, w: 34 } }, heads: { Vee: { x: 64, y: 22 } }, lines: [
      { who: 'Vee', text: 'Welcome to the Gazette. Tomorrow we print Four bucket lists, one winner.', shout: true, sfx: 'PRINT!' },
      { who: 'Vee', text: 'Nobody has checked it yet. Today you are the fact-checker.' },
    ] },
    { plate: 'story-b1s5-2', caption: 'Ava wrote the article. She is proud, and a little nervous.', spots: { Ava: { x: 56, y: 8, w: 38 }, Vee: { x: 56, y: 46, w: 38 } }, heads: { Ava: { x: 30, y: 24 } }, lines: [
      { who: 'Ava', text: 'I wrote it last night. I think I counted everything right.' },
      { who: 'Vee', text: 'Let us check every detail before we print.' },
      { who: 'Ava', text: 'Skim it first, then search for the details.', sfx: 'Hmm…' },
    ] },
    { plate: 'story-b1s5-3', caption: 'The archive keeps every clipping. You search it with keywords.', spots: { Vee: { x: 6, y: 12, w: 34 } }, heads: { Vee: { x: 64, y: 24 } }, lines: [
      { who: 'Vee', text: 'Everything is in the archive. Search with a keyword, and pin the clipping that answers the question.' },
    ] },
  ] } satisfies ComicScene,
  { id: 'listen-q', part: 2, kind: 'choice', plate: NEWS, trains: [1], title: 'What did you hear?', questions: [
    { q: 'What is the job of the fact-checker?', options: ['To check every detail before the paper is printed.', 'To write the article.', 'To print the paper.'], answer: 0 },
    { q: 'Who wrote the article?', options: ['Ava.', 'Vee.', 'Theo.'], answer: 0 },
    { q: 'How do you search the archive?', options: ['With a keyword.', 'With the date only.', 'You cannot search it.'], answer: 0 },
  ] } satisfies ChoiceScene,
  { id: 'skim', part: 2, kind: 'choice', plate: ARCH, trains: [1], title: 'Skim first', passage: [
    'Four bucket lists, one winner?',
    'At the start of term, Vee dared the Club to write a bucket list and tick things off. Ten weeks later, we asked four members what they have done so far and what they still want to do.',
    'Theo still wants to visit Peru. But he has already ticked off more things than anyone else. Altogether, the Club has done fifteen things, and every list has at least two on it.',
  ], questions: [
    { q: 'What is the article mainly about?', options: ['What four members have done and still want to do.', 'A school trip to Peru.', 'How to write an article.'], answer: 0, why: 'The title and the first sentences tell you: four bucket lists.' },
    { q: 'How long ago did the Club start the bucket lists?', options: ['Ten weeks ago.', 'Last summer.', 'Four years ago.'], answer: 0, why: 'The first paragraph says: ten weeks later.' },
    { q: 'Who has probably done the most?', options: ['Theo.', 'Mia.', 'Nobody.'], answer: 0, why: 'The last paragraph says he has ticked off more things than anyone else.' },
  ] } satisfies ChoiceScene,
  { id: 'words-match', part: 2, kind: 'match', plate: ARCH, trains: [2, 4], title: 'Read and match: words from the article', pairs: [
    { left: 'so far', right: 'until now' }, { left: 'altogether', right: 'in total, counting everyone' },
    { left: 'at least', right: 'not fewer than' }, { left: 'more than anyone else', right: 'the most' },
    { left: 'tick it off', right: 'mark it as done' }, { left: 'according to', right: 'says the text' },
  ] } satisfies MatchScene,
  { id: 'words-gap', part: 2, kind: 'choice', plate: ARCH, trains: [2, 4], title: 'Use the words', questions: [
    { q: 'Mia has done two things ___.', options: ['so far', 'altogether', 'according to'], answer: 0, why: 'So far means until now.' },
    { q: '___, the Club has done fifteen things.', options: ['Altogether', 'So far', 'At least'], answer: 0, why: 'Altogether means counting everyone.' },
    { q: 'Every list has ___ two things on it.', options: ['at least', 'according to', 'altogether'], answer: 0, why: 'At least means not fewer than.' },
    { q: '___ the article, Theo has done six things.', options: ['According to', 'Altogether', 'At least'], answer: 0, why: 'According to introduces what the text says.' },
  ] } satisfies ChoiceScene,
  { id: 'archive', part: 2, kind: 'archive', plate: ARCH, trains: [1, 2], title: 'Archive Search', who: 'Vee', story: 'foundLongest',
    intro: 'Welcome to the archive. The whole article is filed here as clippings. Each desk task asks a question: tap a keyword, read what the desk finds, and pin the clipping that answers it. New keywords appear as you read. There is no timer.',
    clippings: ARTICLE, chips: ['bucket list', 'Japan', 'tent', 'surf', 'twice'],
    tasks: [
      { q: 'What is the article about?', needs: ['c1'], options: ['Four members’ bucket lists.', 'A school trip to Japan.', 'A quiz at the Club.'], answer: 0, why: 'The first clipping says: four members, what they have done and still want to do.' },
      { q: 'Who has been to Japan?', needs: ['c8'], options: ['Theo.', 'Mia.', 'Ava.'], answer: 0, why: 'Theo has been to Japan twice.' },
      { q: 'How many things has Vee done so far?', needs: ['c2'], options: ['Three.', 'Four.', 'Five.'], answer: 1, why: 'Vee has done four things.' },
      { q: 'Who still wants to sleep in a tent?', needs: ['c3'], options: ['Ava.', 'Vee.', 'Mia.'], answer: 1, why: 'Vee still wants to sleep in a tent by a lake.' },
      { q: 'When did Ava learn to surf?', needs: ['c4'], options: ['Last summer.', 'Last March.', 'In January.'], answer: 0, why: 'She has learned to surf last summer, says the article.' },
      { q: 'Who has the longest list, according to the Gazette?', needs: ['c9'], options: ['Vee.', 'Theo.', 'Ava.'], answer: 1, why: 'Theo has ticked off more things than anyone else.' },
    ] } satisfies ArchiveScene,

  { id: 'model', part: 3, kind: 'model', plate: ARCH, trains: [1, 2, 3], title: 'Watch Vee check a fact', who: 'Vee', steps: [
    { phase: 'iDo', text: 'Watch me. The question: how many things has Theo done? I do not read every word. I search the keyword Theo and I look for the number. Here: Theo has done six things. That line answers the question. Now a statement: Theo has done seven things. Seven? The line says six. So it is false, and I can show the line.' },
    { phase: 'weDo', text: 'Now together. The statement: Mia has a brother. I search Mia and I read every clipping. No line says it. So it is not given. Say it with me: not given, because no line says it.' },
    { phase: 'youDo', text: 'Now you are the fact-checker.' },
  ] } satisfies ModelScene,
  { id: 'rule', part: 3, kind: 'rule', plate: ARCH, trains: [1, 2, 3, 4], title: 'How to read a longer text', who: 'Vee', lines: [
    { rule: 'Skim first. Read the title and the first sentences to find what the text is mainly about.', example: 'Four bucket lists, one winner?' },
    { rule: 'Then scan for the detail. Choose a keyword and look only for who, how many or when.', example: 'Japan. Six things. Last March.' },
    { rule: 'An answer needs a line. Say true or false only when you can show the line, and say not given when no line says it.', example: 'According to the article, Theo has done six things.' },
  ] } satisfies RuleScene,
  { id: 'factcheck', part: 3, kind: 'factcheck', plate: ARCH, trains: [3], title: 'Fact-Check Wall', who: 'Ava', story: 'factsChecked',
    intro: 'Welcome to the fact-check wall. The article stays on screen. Three statements at a time: choose true, false or not given, and tap the line that shows it. A set locks only when all three are right.',
    clippings: ARTICLE,
    cards: [
      { id: 'f1', statement: 'Vee has been to Rome twice.', verdict: 'true', proof: 'c2.1', why: 'He has been to Rome twice: it is in the second sentence about Vee.' },
      { id: 'f2', statement: 'Ava has been to Egypt.', verdict: 'false', proof: 'c4.1', why: 'The article says Greece, not Egypt.' },
      { id: 'f3', statement: 'Mia has been to London.', verdict: 'true', proof: 'c6.1', why: 'She has been to London three times.' },
      { id: 'f4', statement: 'Theo has done seven things.', verdict: 'false', proof: 'c8.0', why: 'The article says six, not seven.' },
      { id: 'f5', statement: 'Vee has never been camping, but he wants to.', verdict: 'true', proof: 'c3.1', why: 'He says: I have never been camping. And he still wants to sleep in a tent.' },
      { id: 'f6', statement: 'Ava has seen the northern lights.', verdict: 'false', proof: 'c5.0', why: 'She still wants to see them.' },
      { id: 'f7', statement: 'Mia has a brother.', verdict: 'ng', why: 'No line says it: the article does not talk about her family.' },
      { id: 'f8', statement: 'Theo won the school quiz in January.', verdict: 'true', proof: 'c8.2', why: 'He won the school quiz in January.' },
      { id: 'f9', statement: 'The Club has done fifteen things altogether.', verdict: 'true', proof: 'c9.2', why: 'Altogether, the Club has done fifteen things.' },
    ] } satisfies FactScene,
  { id: 'tense-sort', part: 3, kind: 'sort', plate: ARCH, trains: [4, 5], title: 'Which tense?', prompt: 'A line from the article: does it say WHEN something happened (a finished time) or what someone has done UP TO NOW?', bins: [
    { id: 'when', label: 'A FINISHED TIME', note: 'the past simple' }, { id: 'now', label: 'UP TO NOW', note: 'have / has + participle' },
  ], items: [
    { id: 't1', text: 'He has been to Rome twice.', bin: 'now', hint: 'No finished time: have and a participle.' },
    { id: 't2', text: 'He went skiing last March.', bin: 'when', hint: 'Last March is a finished time: the past simple.' },
    { id: 't3', text: 'She has swum with dolphins.', bin: 'now', hint: 'An experience in her life: up to now.' },
    { id: 't4', text: 'He won the school quiz in January.', bin: 'when', hint: 'In January is a finished time.' },
    { id: 't5', text: 'She has been to Greece once.', bin: 'now', hint: 'Once: how many times in her life.' },
    { id: 't6', text: 'Vee dared the Club at the start of term.', bin: 'when', hint: 'At the start of term is a finished time.' },
    { id: 't7', text: 'They have done fifteen things so far.', bin: 'now', hint: 'So far means up to now.' },
    { id: 't8', text: 'We asked four members ten weeks later.', bin: 'when', hint: 'Ten weeks later is a finished time.' },
  ] } satisfies SortScene,
  { id: 'slip', part: 3, kind: 'choice', plate: ARCH, trains: [3, 5], title: 'Spot the slip', questions: [
    { q: 'One sentence in the article has a tense mistake. Which one?', options: ['Ava … has learned to surf last summer.', 'Vee has flown over the Alps once.', 'Mia has been to London three times.'], answer: 0, why: 'Last summer is a finished time, so: she learned to surf last summer.' },
    { q: 'How should the sentence be corrected?', options: ['She learned to surf last summer.', 'She has learn to surf last summer.', 'She learning to surf last summer.'], answer: 0, why: 'A finished time uses the past simple.' },
    { q: 'Which sentence in the article is correct?', options: ['He also went skiing last March.', 'He also has gone skiing last March.', 'He also has went skiing last March.'], answer: 0, why: 'Went and last March: a finished time with the past simple.' },
  ] } satisfies ChoiceScene,

  { id: 'sprint', part: 4, kind: 'archive', plate: NEWS, trains: [2], title: 'Archive sprint', who: 'Vee', story: 'sprintDone',
    intro: 'Sprint round: three quick questions. Search, pin, answer. You are racing only your own best, and there is no timer.',
    clippings: ARTICLE, chips: ['London', 'quiz', 'race', 'Peru'],
    tasks: [
      { q: 'How many times has Mia been to London?', needs: ['c6'], options: ['Twice.', 'Three times.', 'Once.'], answer: 1, why: 'Mia has been to London three times.' },
      { q: 'What did Theo win?', needs: ['c8'], options: ['A race.', 'The school quiz.', 'A trip to Peru.'], answer: 1, why: 'He won the school quiz in January.' },
      { q: 'What does Mia still want to do?', needs: ['c7'], options: ['Run a race.', 'Visit Peru.', 'Learn to surf.'], answer: 0, why: 'Mia still wants to run a ten-kilometre race.' },
    ] } satisfies ArchiveScene,

  { id: 'mission-model', part: 5, kind: 'model', plate: NEWS, trains: [4], title: 'Watch Vee relay the key points', who: 'Vee', steps: [
    { phase: 'iDo', text: 'Listen. Ava asks: what does the article say? I answer: According to the article, Theo has done six things. He has been to Japan twice, and he went skiing last March. Ava asks: who has done the fewest? I answer: Mia. She has done two things so far. Notice: have and has for what they have done, and the past simple for when.' },
    { phase: 'weDo', text: 'Say the frames with me: According to the article. In total. So far.' },
    { phase: 'youDo', text: 'Now you tell Ava the key points.' },
  ] } satisfies ModelScene,
  { id: 'relay-build', part: 5, kind: 'build', plate: NEWS, trains: [4], title: 'Build the relay', items: [
    { words: ['According', 'to', 'the', 'article', 'Theo', 'has', 'done', 'six', 'things'], hint: 'According to the article, then the fact.' },
    { words: ['He', 'went', 'skiing', 'last', 'March'], hint: 'A finished time: the past simple.' },
    { words: ['Mia', 'has', 'done', 'two', 'things', 'so', 'far'], hint: 'So far goes at the end.' },
  ] } satisfies BuildScene,
  { id: 'relay', part: 5, kind: 'speak', plate: NEWS, trains: [3, 4], title: 'Mission: tell Ava the key points', who: 'Ava', turns: [
    { step: 'guided', prompt: 'Take 1. I did not read the article. Tell me the key points with the frames: According to the article… In total… So far… About one minute.', model: 'According to the article, Theo has done six things. In total, the Club has done fifteen things. Vee has done four so far.' },
    { step: 'free', prompt: 'Take 2, no frames. I have two follow-up questions. Who has the longest list? And when did Ava learn to surf?', model: 'Theo has the longest list. Ava learned to surf last summer.' },
  ] } satisfies SpeakScene,

  { id: 'my-note', part: 6, kind: 'write', plate: 'locker-hall', trains: [4, 5], title: 'Your note for the Gazette', prompt: 'Write three sentences about YOU for the Gazette: something you have done (with once, twice or a number), something you did at a finished time, and something you still want to do.', rows: [
    { label: 'Something you have done, and how many times.', frame: 'I have … once / twice / three times', accept: ['\\b(i have|i’ve|i\'ve)\\b.*\\b(once|twice|three times|four times|\\w+ times)\\b'], hint: 'I have + a participle, and once, twice or a number of times.', sample: 'I have been to the sea twice.' },
    { label: 'Something you did at a finished time.', frame: 'I … last … / … ago / in …', accept: ['\\b(last|ago|yesterday|in \\d{4}|in (january|february|march|april|may|june|july|august|september|october|november|december))\\b'], hint: 'A finished time: last summer, two years ago, in July.', sample: 'I learned to swim two years ago.' },
    { label: 'Something you still want to do.', frame: 'I still want to … / I would like to …', accept: ['\\b(want|would like|hope|still)\\b'], hint: 'I still want to + a verb, or I would like to + a verb.', sample: 'I still want to see the northern lights.' },
  ] } satisfies WriteScene,
  { id: 'redpen', part: 6, kind: 'redpen', plate: NEWS, trains: [5], title: 'Red Pen', who: 'Vee', story: 'penUsed',
    intro: 'Last job before the paper is printed. A junior reporter wrote this draft, and the red pen has marked three sentences. Tap a marked sentence, rewrite it, and fix the mistake. The pen tells you what kind of mistake it is.',
    drafts: [
      { text: 'Our Club has been busy this term.' },
      { text: 'Mia has been to Madrid last June.', marked: true, kind: 'tense', accept: ['\\bMia\\b', '\\bMadrid\\b', '(\\bwent\\b.*\\blast June\\b)|(^(?!.*\\blast June\\b).*\\bhas been\\b)'], hint: 'Last June is a finished time: use the past simple (went), or take the time away and keep has been.', sample: 'Mia went to Madrid last June.' },
      { text: 'Ava has swum with dolphins.' },
      { text: 'Theo has ate sushi in Tokyo.', marked: true, kind: 'participle', accept: ['\\bTheo\\b', '\\b(has eaten|(?<!has )ate)\\b', '\\bsushi\\b'], hint: 'After has we need the past participle of eat: eaten.', sample: 'Theo has eaten sushi in Tokyo.' },
      { text: 'Vee never been camping.', marked: true, kind: 'have', accept: ['\\bVee\\b', '\\b(has never been|’s never been|\'s never been)\\b', '\\bcamping\\b'], hint: 'We need has before never been.', sample: 'Vee has never been camping.' },
      { text: 'We have counted fifteen things in total.' },
    ] } satisfies RedPenScene,

  { id: 'wrap', part: 7, kind: 'wrap', plate: NEWS, heading: 'Checked! The Gazette goes to print.', story: { gazetteChecked: true }, teachBack: 'How do you read a longer text for the details? Say the three jobs: skim, scan, and show the line.' } satisfies WrapScene,
];

export const B1_S01_E5: LessonScript = {
  blueprintId: 'B1-S01-E5',
  title: 'Have You Ever...? · Deep Dive',
  criteria: CRITERIA,
  cast: ['Vee', 'Ava'],
  partMinutes: [3, 4, 14, 15, 4, 10, 6, 4],
  scenes,
  previously: {
    from: 'B1-S01-E4',
    beats: [
      { when: 'showFinished', text: 'Club FM went live, and Theo opened up on the air.' },
      { text: 'You saved the dead air by reacting and asking about the detail.' },
    ],
  },
  quest: {
    name: 'The Bucket List Gazette',
    stages: [
      { title: 'Stop the press', goal: 'Warm up and meet the article.' },
      { title: 'Remember?', goal: 'Bring back the pattern and the follow-up questions.' },
      { title: 'The archive', goal: 'Hear the story, skim the article and search the archive.' },
      { title: 'Fact-check desk', goal: 'Learn to read for the details and judge every statement.' },
      { title: 'Sprint', goal: 'Three quick searches against your own best.' },
      { title: 'Tell Ava', goal: 'Relay the key points in your own words.' },
      { title: 'Red pen', goal: 'Write your note and fix the marked sentences.' },
      { title: 'Print', goal: 'Say the three reading jobs to unlock your clue.' },
    ],
    clue: 'The article counts what each member has done, but the dare was bigger: Vee wants a bucket list of the whole Club. What will the Club do together?',
  },
};
export default B1_S01_E5;
