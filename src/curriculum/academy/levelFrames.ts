// Academy level frames: the per-level curriculum "chapeau" (who, how, how much, how we know, how to move up).
// Read by scripts/academy-curriculum-docs.ts, which joins it to the Season data and writes docs/academy-curriculum/<level>.md.
// Status 2026-10-14: design decisions by the Academy team; CEFR wording is paraphrased (Companion Volume pages could not be opened,
// see docs/research/academy-curriculum-primary-source-check.md) and every number marked [target] is a design goal, not a measured result.
// Imports nothing outside src/curriculum/academy/.
import type { AcademyLevel } from './types';

export type FrameLevel = 'Pre-A1' | AcademyLevel;

export interface LevelFrame {
  level: FrameLevel;
  cefrNote: string;
  student: string;
  method: string;
  supports: string;
  inputText: string;
  /** design targets for the share of live practice time by skill, summing to ~100 */
  skills: Record<string, number>;
  assessment: string[];
  moveUp: string[];
  l1Priorities: string[];
  lanes: string;
  gamesMix: string;
  videoGameMechanics: string[];
  teenTopics: string[];
  daily10: string;
}

export const LEVEL_FRAMES: LevelFrame[] = [
  {
    level: 'Pre-A1',
    cefrNote: 'Pre-A1 is a level of the CEFR Companion Volume (2020) below A1 (confirmed by search; descriptor wording not opened).',
    student: 'A 13-18 student with no or almost no English; may read Arabic script or a Latin script with different sound rules. Needs letters, sounds and first words before A1 lesson 1 ("Sign Me Up").',
    method: 'Blending is the spine: every lesson has a 3-5 minute blend routine and a decodable reading text. Chunks first ("My name is ___"), analysed later. 8 new items per session at most. Teen scenes (phone, lockers, bus stop), never childish.',
    supports: 'Home-language hint on, audio 0.8x, pictures on every word, no timers, "Not yet" wording, private rehearsal, type-instead-of-speak.',
    inputText: 'Decodable lines of 3-6 words, texts of 5 lines.',
    skills: { 'Letters and sounds / blending': 30, 'Reading (decodable)': 25, 'Vocabulary': 20, 'Listening': 10, 'Speaking (chunks)': 15 },
    assessment: ['Remember? at the start of every lesson', 'Season checkpoint in E8 (hear-and-pick letters, sound-to-letter, read-and-match, build own name, say a chunk)', 'Pre-A1 exit task: read a 5-sentence profile and answer 5 questions; say 5 sentences about yourself'],
    moveUp: ['Reads 5-sentence decodable profile with at most 2 hints', 'Says and writes own name, age and 5 chunks intelligibly', 'Knows all 26 letter names and the sounds taught so far'],
    l1Priorities: ['Short /i/ vs /iː/ (Arabic, Spanish, Italian)', 'Final /n/ (French nasalisation)', 'Left-to-right letter-by-letter reading (Arabic readers)', 'Aspirated /p/ /t/'],
    lanes: 'School lane only (classroom words and instructions); no exam lane.',
    gamesMix: 'Sound and picture games first: Memory Pairs, Whack-a-Word, Sound Bingo, Simon Says Sounds, Spot the Sound, Tile Stacker (slow), listen-and-match, read-and-match (catalogue 149-168).',
    videoGameMechanics: ['Loot and crafting (sound tiles to words)', 'Rhythm lane', 'Escape-room locker code', 'Speedrun against your own best (no leaderboards)'],
    teenTopics: ['phone and messages', 'school and lockers', 'friends and ages', 'bus and city', 'music and sport (skins)'],
    daily10: '10 minutes: hear-and-pick, blend slider, one decodable text with tap-to-hear, one voice note; spaced at 1, 3, 7 days.',
  },
  {
    level: 'A1',
    cefrNote: 'A1 (paraphrase): understands and uses familiar everyday expressions and very basic phrases; introduces self and others; asks and answers simple questions about personal details.',
    student: 'A teen who has met hello, numbers and countries at school: A1 revises these fast and spends the time on what school did not teach. Never childish.',
    method: 'Model first (I do / we do / you do), rule stated plainly before practice, student teach-back. Mission with Take 1 / Take 2. Eight-episode Season: Cold Open, Word Lab, Pattern Lab, On Air, Deep Dive, Side Quest, Remix, Finale.',
    supports: 'Maximum: full sentence frames, home-language hint, audio 0.8x.',
    inputText: '~30-60 words [target].',
    skills: { 'Speaking': 25, 'Listening': 20, 'Vocabulary': 20, 'Reading': 15, 'Grammar in use': 10, 'Writing': 5, 'Pronunciation': 5 },
    assessment: ['Remember? every lesson (spaced)', 'E8 checkpoint each Season', 'Level check in Season 10 (E8)', 'Release (a thing the student makes) every Season'],
    moveUp: ['Level check passed (about 70 % with production weighted)', 'Release for Seasons 1-10 in the portfolio', 'Can ask and answer 10 personal-detail questions without frames'],
    l1Priorities: ['Plural endings /s/ /z/ /iz/', '/θ/ vs /s/ (listen first)', 'be-verb omission (Arabic, Turkish)', 'Subject pronoun dropping (Spanish, Italian, Turkish)', 'False friends'],
    lanes: 'School lane in E6 (class instructions, tests); exam lane not yet.',
    gamesMix: 'Vocabulary and speaking games from the catalogue sections 1, 5, 7 and 13; no game three times in a row; at least five different games per lesson.',
    videoGameMechanics: ['Quest log and clue unlock', 'Shop sim', 'Detective board', 'Loot and crafting', 'Dialogue tree'],
    teenTopics: ['online profiles', 'rooms and gadgets', 'hobbies and clubs', 'food and cafes', 'daily routine', 'family and friends', 'town and directions', 'abilities', 'shopping', 'live streaming'],
    daily10: '10 minutes of spaced retrieval and one speaking task (voice note).',
  },
  {
    level: 'A2',
    cefrNote: 'A2 (paraphrase): understands frequently used expressions on immediate topics; handles simple routine exchanges; describes in simple terms background, immediate environment and past events.',
    student: 'A student who can manage the basics and now needs past, future, comparison and obligation to talk about real life.',
    method: 'Still model-and-rule, with half frames; one structure per Season (two at most); present perfect held to B1; going to and will in separate Seasons.',
    supports: 'Half frames, tiered hints, audio 0.9x on request.',
    inputText: '~80-150 words [target].',
    skills: { 'Speaking': 25, 'Listening': 20, 'Reading': 15, 'Vocabulary': 15, 'Grammar in use': 10, 'Writing': 10, 'Pronunciation': 5 },
    assessment: ['Remember? every lesson', 'E8 checkpoint each Season', 'Big Remix every 2nd Season', 'Level check at Season 12'],
    moveUp: ['Level check passed', 'Narrates a past event and a plan in 6+ sentences', 'Handles a routine exchange (shop, travel, appointment) without frames'],
    l1Priorities: ['Past -ed endings /t/ /d/ /id/', 'Irregular verb forms', 'Article use', 'Question word order (Turkish, Arabic)', 'Stress in compound nouns'],
    lanes: 'School lane (A1-B1) and an optional mediation task in E6.',
    gamesMix: 'Story and mystery games, grammar sorts, role-play; classic games (Battleship Grid, Guess Who, Pictionary) for questions and past forms.',
    videoGameMechanics: ['Boss fight (retrieval)', 'Escape room', 'Stepping stones (forms)', 'Board quest', 'Skill tree'],
    teenTopics: ['weekend stories', 'travel', 'gadgets', 'plans and dreams', 'health', 'house rules', 'food cultures', 'getting around', 'future tech', 'weather', 'jobs', 'events'],
    daily10: '10 minutes of retrieval plus a short text; one voice note per week.',
  },
  {
    level: 'B1',
    cefrNote: 'B1 (paraphrase): copes with most situations while travelling; produces simple connected text on familiar topics; describes experiences, events, hopes and ambitions; gives reasons and opinions.',
    student: 'An intermediate teen who wants to express opinions, tell experiences and handle school-like tasks in English.',
    method: 'Task-first (Mission before the rule); mediation starts: every Season has one task; present perfect split by sub-use.',
    supports: 'First words of a frame; hints on request.',
    inputText: '~150-300 words [target].',
    skills: { 'Speaking': 25, 'Reading': 20, 'Listening': 15, 'Writing': 15, 'Vocabulary': 10, 'Grammar in use': 5, 'Mediation': 5, 'Pronunciation': 5 },
    assessment: ['Remember? every lesson', 'E8 checkpoint each Season', 'Big Remix every 2nd Season', 'Level check at Season 16', 'Rubrics for speaking and writing (CEFR-style, own wording)'],
    moveUp: ['Level check passed', 'Speaks 90 seconds on a familiar topic with reasons', 'Writes a 120-word text with linking', 'Completes a mediation task (relay/summarise)'],
    l1Priorities: ['Weak forms and connected speech', 'Present perfect vs past simple (Spanish, French, Italian transfer)', 'Prepositions', 'Spelling of common words'],
    lanes: 'Exam lane (Cambridge-style task types as practice) and school lane in E6.',
    gamesMix: 'Debate and opinion games, escape rooms, detective boards, role-play; arcade games for grammar speed in accuracy mode.',
    videoGameMechanics: ['Detective board', 'Boss fight', 'Dialogue tree', 'Tower defence (accuracy)', 'Skill tree'],
    teenTopics: ['experiences and bucket lists', 'then and now', 'news and rumours', 'rules and games', 'money and first jobs [gap]', 'online safety [gap]', 'friendship [gap]'],
    daily10: '10 minutes plus an extensive-reading target of a short text.',
  },
  {
    level: 'B2',
    cefrNote: 'B2 (paraphrase): understands the main ideas of complex text; interacts with fluency and spontaneity; produces clear, detailed text and explains a viewpoint with advantages and disadvantages.',
    student: 'An upper-intermediate student who defends opinions, summarises and mediates, and prepares for study in English.',
    method: 'Student-led tasks, opinion defence, summarising and mediation every Season; supports off by default (optional).',
    supports: 'None by default; optional on request.',
    inputText: '~300-500 words [target].',
    skills: { 'Speaking': 25, 'Reading': 20, 'Writing': 15, 'Listening': 15, 'Mediation': 10, 'Vocabulary': 5, 'Grammar in use': 5, 'Pronunciation': 5 },
    assessment: ['Remember? every lesson', 'E8 checkpoint each Season', 'Big Remix', 'Level check at Season 16', 'Speaking and writing rubrics with annotated samples'],
    moveUp: ['Level check passed', 'Holds a 3-minute structured talk with counter-arguments', 'Writes a 200-word argument with cohesion', 'Mediates a text of 300+ words'],
    l1Priorities: ['Stress and rhythm in longer utterances', 'Collocations and false friends', 'Register control', 'Article nuance'],
    lanes: 'Exam lane (A2-C1 task types as practice) and academic/study lane.',
    gamesMix: 'Debate, escape rooms, audio mysteries, creative production; classic strategy games adapted to argument.',
    videoGameMechanics: ['Dialogue tree (register)', 'Detective board', 'Boss fight', 'Stealth (indirect phrases)', 'Skill tree'],
    teenTopics: ['experience', 'regret', 'media', 'reporting', 'identity', 'climate [gap]', 'mental health [gap]', 'study plans [gap]'],
    daily10: '10 minutes plus an extensive-reading and listening target.',
  },
  {
    level: 'C1',
    cefrNote: 'C1 (paraphrase): understands demanding, longer texts and implicit meaning; expresses ideas fluently and spontaneously; uses language flexibly for social, academic and professional purposes; produces clear, well-structured, detailed text on complex subjects.',
    student: 'An advanced teen (15-18 realistic) preparing for study or work in English; school-safe topics only.',
    method: 'Language Lab (E3) notices register, collocation and stance in authentic text; E4 is a seminar, pitch or interview; mediation every Season.',
    supports: 'Off.',
    inputText: '~500-800 words [target].',
    skills: { 'Speaking': 25, 'Reading': 20, 'Writing': 20, 'Listening': 15, 'Mediation': 10, 'Vocabulary': 5, 'Pronunciation': 5 },
    assessment: ['Remember? every lesson', 'E8 checkpoint each Season', 'Big Remix', 'Level check at Season 16', 'Rubrics (accuracy, range, fluency, coherence)'],
    moveUp: ['Level check passed', 'Delivers a 5-minute seminar or pitch', 'Writes a 300-word structured text', 'Mediates a technical or abstract text'],
    l1Priorities: ['Prosody and focus', 'Collocation precision', 'Register shifts', 'Cohesion in long texts'],
    lanes: 'Exam lane and academic/professional lane.',
    gamesMix: 'Seminar, pitch and negotiation games, escape rooms with long texts, creative production.',
    videoGameMechanics: ['Dialogue tree (negotiation)', 'Detective board', 'Boss fight (seminar defence)', 'Strategy sim', 'Skill tree'],
    teenTopics: ['culture and arts', 'science and ethics', 'work and entrepreneurship', 'global issues', 'media literacy'],
    daily10: '10 minutes plus an extensive reading/listening target.',
  },
];
