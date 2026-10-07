import { ACADEMY_BANK } from './academyBank';
import { SUCCESS_BANK } from './successBank';

// Expert-authored placement-test question banks per hub.
// Each bank has 24+ items so a 15-question test is freshly shuffled per attempt.
// The placement test shows NO generated pictures and speaks NO live speech: everything it needs is in the app bundle or
// in public/ (see placementStatic.test.ts, the deploy gate that enforces this).
// `audio_script` triggers ElevenLabs TTS in TestPhase.

export type Hub = 'playground' | 'academy' | 'professional';
export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface BankQuestion {
  /** Stable id, so answers can be analysed per item later. */
  id?: string;
  /** Show the options in the order given (times, numbers); otherwise they are shuffled. */
  fixedOrder?: boolean;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: number;
  targetLevel: Cefr;
  feedback: { correct: string; incorrect: string };
  audio_script?: string;  // when set, render an ElevenLabs play button
  voice_id?: string;
  type?: 'standard' | 'listening_match' | 'visual';
  /** Reading items only: a short passage shown as static text (not typewriter-
   *  animated — a paragraph "typed" letter by letter is a bad reading UX).
   *  `question` remains the comprehension question, typed normally. */
  readingPassage?: string;
  /** Skill drives smart media: vocabulary→image, listening→audio, grammar/reading→text-only.
   *  Hub-specific values ('professional_vocabulary', 'grammar_accuracy', 'writing',
   *  'business_writing', 'speaking', 'fluency') exist so each hub's questions map
   *  directly onto its own 5-category skill radar (see HUB_SKILL_PROFILE in
   *  useStudentSkills.ts) without a separate remapping table. */
  skill?: 'vocabulary' | 'listening' | 'grammar' | 'reading'
    | 'professional_vocabulary' | 'grammar_accuracy' | 'writing' | 'business_writing' | 'speaking' | 'fluency';
  /** i18n key for the localized meta-instruction shown above the question.
   *  Only this small instruction is translated; question/options/audio stay English. */
  taskInstructionKey?: string;
}

/** Derive the skill bucket for UI/media purposes (image vs audio vs plain text).
 *  Kept hub-agnostic and stable — only used for rendering, not scoring. */
export function resolveSkill(q: BankQuestion): 'vocabulary' | 'listening' | 'grammar' | 'reading' {
  if (q.skill === 'vocabulary' || q.skill === 'professional_vocabulary') return 'vocabulary';
  if (q.skill === 'listening') return 'listening';
  if (q.skill === 'reading') return 'reading';
  if (q.type === 'listening_match' || q.audio_script) return 'listening';
  return 'grammar';
}

/**
 * Derive the EXACT student_skills.skill_name this question should score
 * toward, per hub (see HUB_SKILL_PROFILE in useStudentSkills.ts). Used when
 * building TestResult so the placement test can persist a real per-skill
 * breakdown instead of one overall score copied onto all 5 radar categories.
 */
export function resolveScoreSkill(q: BankQuestion, hub: Hub): string {
  if (q.skill) return q.skill;
  if (q.type === 'listening_match' || q.audio_script) return 'listening';
  return hub === 'professional' ? 'grammar_accuracy' : 'grammar';
}

/** What the student has to DO with this item, so every question can say it: finish a gap, listen, read, or
 *  (otherwise) simply pick the best answer. */
export type TaskKind = 'listening' | 'reading' | 'gap' | 'choose';

export function taskKind(q: BankQuestion): TaskKind {
  if (q.type === 'listening_match' || q.audio_script) return 'listening';
  if (q.readingPassage) return 'reading';
  if (q.question.includes('___')) return 'gap';
  return 'choose';
}

/** i18n key of the localized instruction shown with every question (placement.task.<kind>). */
export function taskInstructionKeyFor(q: BankQuestion): string {
  return q.taskInstructionKey ?? `placement.task.${taskKind(q)}`;
}

// ---------------------------------------------------------------- PLAYGROUND
const PLAYGROUND_POOL: BankQuestion[] = [
  { question: "Which animal says 'Meow'?", options: ['🐱 Cat', '🐶 Dog', '🐸 Frog', '🐦 Bird'], correctIndex: 0, difficulty: 0.2, targetLevel: 'A1', feedback: { correct: 'Yes! Cats say Meow! 🐱', incorrect: 'Cats say Meow! 🐱' }, skill: 'vocabulary' },
  { question: 'What color is a banana? 🍌', options: ['Red', 'Blue', 'Yellow', 'Green'], correctIndex: 2, difficulty: 0.2, targetLevel: 'A1', feedback: { correct: 'Yes! Bananas are yellow!', incorrect: 'Bananas are yellow!' }, skill: 'vocabulary' },
  { question: 'Choose the number "five".', options: ['3', '5', '7', '9'], correctIndex: 1, difficulty: 0.2, targetLevel: 'A1', feedback: { correct: 'Great counting! 🖐️', incorrect: '"Five" is 5 — like one hand!' } },
  { question: 'Which one is a fruit?', options: ['🍎 Apple', '🚗 Car', '👟 Shoe', '📚 Book'], correctIndex: 0, difficulty: 0.2, targetLevel: 'A1', feedback: { correct: 'Yes! An apple is a fruit!', incorrect: 'Apples are fruit! 🍎' }, skill: 'vocabulary' },
  { question: 'How do we say hello in the morning?', options: ['Good night', 'Good morning', 'Goodbye', 'See you'], correctIndex: 1, difficulty: 0.25, targetLevel: 'A1', feedback: { correct: '"Good morning!" ☀️', incorrect: 'In the morning we say "Good morning!"' } },
  { question: '🎧 Listen — which animal is it?', options: ['🐶 Dog', '🐱 Cat', '🐮 Cow', '🐔 Chicken'], correctIndex: 2, difficulty: 0.3, targetLevel: 'A1', type: 'listening_match', audio_script: 'Moo! Moo! I am a big animal on the farm and I give milk.', feedback: { correct: 'Yes! Cows say moo!', incorrect: 'Cows say moo! 🐮' } },
  { question: 'Which one do you wear on your feet?', options: ['🎩 Hat', '👟 Shoes', '🧤 Gloves', '👓 Glasses'], correctIndex: 1, difficulty: 0.3, targetLevel: 'A1', feedback: { correct: 'Yes! Shoes go on our feet!', incorrect: 'We wear shoes on our feet! 👟' } },
  { question: 'Pick the correct word: "I ___ a boy."', options: ['am', 'is', 'are', 'be'], correctIndex: 0, difficulty: 0.35, targetLevel: 'A1', feedback: { correct: '"I am" — perfect!', incorrect: 'With "I" we use "am".' } },
  { question: 'What do you do with a book? 📖', options: ['Eat it', 'Read it', 'Throw it', 'Wear it'], correctIndex: 1, difficulty: 0.35, targetLevel: 'A1', feedback: { correct: 'Yes! We read books!', incorrect: 'We read books!' } },
  { question: 'How many legs does a dog have?', options: ['Two', 'Four', 'Six', 'Eight'], correctIndex: 1, difficulty: 0.3, targetLevel: 'A1', skill: 'vocabulary', feedback: { correct: 'Yes! Dogs have 4 legs! 🐶', incorrect: 'Dogs have 4 legs! 🐶' } },
  { question: 'Choose the right one: "She ___ a red dress."', options: ['have', 'has', 'are', 'is have'], correctIndex: 1, difficulty: 0.4, targetLevel: 'A2', feedback: { correct: 'Yes! "She has".', incorrect: 'With she/he/it we use "has".' } },
  { question: 'Which season is hot? ☀️', options: ['Winter', 'Summer', 'Fall', 'Spring'], correctIndex: 1, difficulty: 0.4, targetLevel: 'A2', feedback: { correct: 'Summer is hot! 🏖️', incorrect: 'Summer is the hot season.' } },
  { question: 'Find the opposite of "big".', options: ['Tall', 'Small', 'Fast', 'New'], correctIndex: 1, difficulty: 0.4, targetLevel: 'A2', feedback: { correct: 'Yes! Big ↔ small.', incorrect: 'The opposite of big is small.' } },
  { question: '🎧 Listen — what is the boy doing?', options: ['Eating', 'Sleeping', 'Running', 'Singing'], correctIndex: 0, difficulty: 0.45, targetLevel: 'A2', type: 'listening_match', audio_script: 'Yum yum! I love my breakfast. I am eating pancakes with honey.', feedback: { correct: 'Yes! He is eating.', incorrect: 'He is eating breakfast.' } },
  { question: 'Which is a vegetable?', options: ['🥕 Carrot', '🍫 Chocolate', '🍩 Donut', '🍪 Cookie'], correctIndex: 0, difficulty: 0.45, targetLevel: 'A2', feedback: { correct: 'Yes! Carrots are vegetables. 🥕', incorrect: 'Carrots are vegetables.' }, skill: 'vocabulary' },
  { question: 'Pick the correct: "There ___ five apples."', options: ['is', 'am', 'are', 'be'], correctIndex: 2, difficulty: 0.5, targetLevel: 'A2', feedback: { correct: 'Yes! With many things we use "there are".', incorrect: 'For more than one we say "there are".' } },
  { question: 'Which one is the smallest?', options: ['Elephant', 'Mouse', 'Dog', 'Cat'], correctIndex: 1, difficulty: 0.5, targetLevel: 'A2', feedback: { correct: 'Yes! A mouse is smallest!', incorrect: 'A mouse is the smallest. 🐭' } },
  { question: 'Choose the past form: "Yesterday I ___ to school."', options: ['go', 'going', 'went', 'goed'], correctIndex: 2, difficulty: 0.55, targetLevel: 'A2', feedback: { correct: 'Yes! "Went" is the past of "go".', incorrect: 'The past of "go" is "went".' } },
];





const POOLS: Record<Hub, BankQuestion[]> = {
  playground: PLAYGROUND_POOL,
  academy: ACADEMY_BANK,
  professional: SUCCESS_BANK,
};

/** Raw item pool for a hub, for the adaptive engine (adaptiveEngine.ts) to
 *  select from question-by-question, rather than the fixed 15-item array
 *  buildPlacementBank below produces. */
export function getHubPool(hub: Hub): BankQuestion[] {
  return POOLS[hub] ?? POOLS.academy;
}

// Pull `count` questions, ordered by difficulty asc, with shuffle inside each CEFR band
// so each test attempt is fresh but still scaffolded easy → hard.
export function buildPlacementBank(hub: Hub, count = 15): BankQuestion[] {
  const pool = POOLS[hub] ?? POOLS.academy;
  const byLevel: Record<Cefr, BankQuestion[]> = { A1: [], A2: [], B1: [], B2: [], C1: [] };
  for (const q of pool) byLevel[q.targetLevel].push(q);
  const order: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const shuffled: BankQuestion[] = [];
  for (const lv of order) {
    const arr = [...byLevel[lv]];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    shuffled.push(...arr);
  }
  if (shuffled.length <= count) return shuffled;

  // Guarantee at least one question from every skill category present in
  // this hub's pool, so the per-skill radar always gets real data for all 5
  // categories instead of only whichever skills happened to survive even
  // index-sampling (which could — and did — skip a whole category).
  const skillsInPool = Array.from(new Set(pool.map((q) => resolveScoreSkill(q, hub))));
  const pickedSet = new Set<BankQuestion>();
  const picked: BankQuestion[] = [];
  for (const skill of skillsInPool) {
    const candidate = shuffled.find((q) => !pickedSet.has(q) && resolveScoreSkill(q, hub) === skill);
    if (candidate) {
      picked.push(candidate);
      pickedSet.add(candidate);
    }
  }

  // Fill remaining slots via even index-sampling over what's left, to keep
  // the easy→hard CEFR scaffold.
  const remaining = shuffled.filter((q) => !pickedSet.has(q));
  const remainingCount = Math.max(0, count - picked.length);
  const step = remaining.length / Math.max(remainingCount, 1);
  for (let i = 0; i < remainingCount && remaining.length > 0; i++) {
    picked.push(remaining[Math.min(remaining.length - 1, Math.floor(i * step))]);
  }

  // Re-sort by difficulty so the guaranteed-coverage items don't break the
  // easy→hard pacing the student experiences.
  return picked.sort((a, b) => a.difficulty - b.difficulty).slice(0, count);
}
