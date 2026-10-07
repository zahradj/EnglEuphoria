import { ACADEMY_BANK } from './academyBank';

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



// ---------------------------------------------------------------- PROFESSIONAL
const PROFESSIONAL_POOL: BankQuestion[] = [
  // A2
  { question: "Email opener: 'I ___ writing to enquire about your services.'", options: ['am', 'is', 'be', 'was'], correctIndex: 0, difficulty: 0.25, targetLevel: 'A2', feedback: { correct: '"I am writing" — standard professional opener.', incorrect: 'Use "am" with "I".' } },
  { question: "Polite request: 'Could you ___ send me the report?'", options: ['please', 'must', 'ought', 'have'], correctIndex: 0, difficulty: 0.3, targetLevel: 'A2', feedback: { correct: 'Polite + clear ✅', incorrect: '"Please" softens the request.' } },
  { question: "Best schedule verb: 'Let\'s ___ a meeting on Monday.'", options: ['do', 'make', 'schedule', 'put'], correctIndex: 2, difficulty: 0.35, targetLevel: 'A2', feedback: { correct: '"Schedule a meeting" — collocation!', incorrect: 'We "schedule" meetings.' } },
  { question: 'Which is more formal?', options: ['Hey, what\'s up?', 'Hi there!', 'Dear Mr. Patel,', 'Yo team!'], correctIndex: 2, difficulty: 0.3, targetLevel: 'A2', feedback: { correct: 'Yes — formal salutation.', incorrect: '"Dear Mr/Ms" is the formal opener.' }, skill: 'business_writing' },
  // B1
  { question: "Workplace: 'We need to ___ a deadline by Friday.'", options: ['catch', 'meet', 'reach', 'arrive'], correctIndex: 1, difficulty: 0.5, targetLevel: 'B1', feedback: { correct: '"Meet a deadline" — perfect collocation.', incorrect: 'Collocation: "meet a deadline".' } },
  { question: "Email: 'Please find ___ the document you requested.'", options: ['attach', 'attaching', 'attached', 'attachment'], correctIndex: 2, difficulty: 0.55, targetLevel: 'B1', feedback: { correct: 'Standard email phrase ✉️', incorrect: '"Please find attached…"' } },
  { question: "Negotiation: 'I'm afraid that price is a little ___ our budget.'", options: ['over', 'beyond', 'after', 'on'], correctIndex: 1, difficulty: 0.6, targetLevel: 'B1', feedback: { correct: '"Beyond our budget" — diplomatic ✅', incorrect: '"Beyond" softens the rejection.' } },
  { question: '🎧 What is the speaker proposing?', options: ['Cancelling the project', 'Postponing the deadline by one week', 'Hiring two more people', 'Switching the supplier'], correctIndex: 1, difficulty: 0.65, targetLevel: 'B1', type: 'listening_match', audio_script: "Given the current workload, I would suggest pushing the delivery date back by about a week so the team can fully test everything before launch. I know the client won't be thrilled, but I'd rather deliver a polished product a week late than a buggy one on time.", feedback: { correct: 'Yes — postpone the deadline.', incorrect: 'They want to push delivery back a week.' } },
  // B2
  { question: "Diplomatic disagreement: 'I see your point, ___ I have a different perspective.'", options: ['so', 'because', 'however', 'therefore'], correctIndex: 2, difficulty: 0.7, targetLevel: 'B2', feedback: { correct: '"However" — professional contrast.', incorrect: 'Use "however" for polite disagreement.' }, skill: 'fluency' },
  { question: "Conditional: 'If we ___ earlier, we wouldn\'t be in this situation.'", options: ['act', 'acted', 'had acted', 'will act'], correctIndex: 2, difficulty: 0.8, targetLevel: 'B2', feedback: { correct: 'Third conditional ✅', incorrect: 'Past unreal → "had acted".' } },
  { question: "Reporting: 'She said the launch ___ delayed.'", options: ['is', 'has', 'had been', 'will'], correctIndex: 2, difficulty: 0.75, targetLevel: 'B2', feedback: { correct: 'Reported speech back-shift ✅', incorrect: 'Backshift: was/had been.' } },
  { question: 'Most professional close:', options: ['Bye!', 'See ya!', 'Kind regards,', 'Cheers mate,'], correctIndex: 2, difficulty: 0.6, targetLevel: 'B2', feedback: { correct: '"Kind regards" — neutral professional.', incorrect: '"Kind regards" suits most business contexts.' }, skill: 'business_writing' },
  { question: "Phrasal: 'We need to ___ this issue at the next board meeting.'", options: ['bring up', 'bring on', 'bring out', 'bring in'], correctIndex: 0, difficulty: 0.75, targetLevel: 'B2', feedback: { correct: '"Bring up" = raise a topic.', incorrect: '"Bring up" = introduce a topic.' } },
  // C1
  { question: 'Most precise: "Sales ___ a sharp downturn in Q3."', options: ['saw', 'experienced', 'underwent', 'felt'], correctIndex: 1, difficulty: 0.85, targetLevel: 'C1', feedback: { correct: '"Experienced a downturn" — finance register.', incorrect: 'Best business collocation = "experienced".' } },
  { question: "Idiom 'to think outside the box' means…", options: ['To break a rule', 'To use creativity to solve a problem', 'To work outdoors', 'To leave a meeting early'], correctIndex: 1, difficulty: 0.85, targetLevel: 'C1', feedback: { correct: 'Creative problem-solving 💡', incorrect: '"Think outside the box" = be creative.' } },
  { question: '🎧 What is the speaker\'s recommendation?', options: ['Increase the marketing budget', 'Pause the campaign and reassess', 'Hire an external agency', 'Launch in a new market'], correctIndex: 1, difficulty: 0.9, targetLevel: 'C1', type: 'listening_match', audio_script: "Looking at the conversion data, my honest recommendation would be to put the campaign on hold for a fortnight while we revisit the targeting and the messaging. The click-through rate has been respectable, but the actual conversion to sign-ups has been underwhelming, which tells me the issue lies further down the funnel, not with initial visibility.", feedback: { correct: 'Yes — pause and reassess.', incorrect: 'They recommend pausing the campaign.' } },
  { question: 'Hedging: "It ___ that revenue will dip slightly next quarter."', options: ['appears', 'is', 'will be', 'did'], correctIndex: 0, difficulty: 0.85, targetLevel: 'C1', feedback: { correct: '"It appears" — professional hedge.', incorrect: '"Appears" softens the prediction.' } },
  { question: 'Best register for stakeholder update:', options: ['Stuff went sideways.', 'There were some hiccups.', 'We encountered several challenges that we are actively addressing.', 'It was a mess tbh.'], correctIndex: 2, difficulty: 0.9, targetLevel: 'C1', feedback: { correct: 'Polished and accountable ✅', incorrect: 'Stakeholder updates require formal register.' }, skill: 'business_writing' },
  // Professional Vocabulary items — this hub had ZERO items resolving to
  // 'professional_vocabulary' (resolveScoreSkill only maps to it via
  // imagePrompt, which this hub's items never set), so despite the radar
  // showing that category, it always fell back to a copied overall score.
  { question: "Which word means 'a plan for spending money'?", options: ['budget', 'invoice', 'salary', 'discount'], correctIndex: 0, difficulty: 0.3, targetLevel: 'A2', feedback: { correct: '"Budget" = spending plan. 💰', incorrect: 'A "budget" is a spending plan.' }, skill: 'professional_vocabulary' },
  { question: "Choose the best synonym for 'increase' in a business context.", options: ['grow', 'shrink', 'pause', 'cancel'], correctIndex: 0, difficulty: 0.5, targetLevel: 'B1', feedback: { correct: '"Grow" = increase.', incorrect: '"Grow" is the closest business synonym.' }, skill: 'professional_vocabulary' },
  { question: "Which term refers to money owed to a business by its customers?", options: ['revenue', 'receivables', 'expenses', 'liabilities'], correctIndex: 1, difficulty: 0.75, targetLevel: 'B2', feedback: { correct: '"Receivables" — money owed to you. 📊', incorrect: '"Receivables" is the standard finance term.' }, skill: 'professional_vocabulary' },
  { question: "Which word best fits: 'The merger created significant ___ between the two departments.'", options: ['synergy', 'animosity', 'isolation', 'stagnation'], correctIndex: 0, difficulty: 0.88, targetLevel: 'C1', feedback: { correct: '"Synergy" — combined effectiveness. 🤝', incorrect: '"Synergy" fits the business-merger context.' }, skill: 'professional_vocabulary' },
  // Additional business_writing / fluency items — this hub previously had no
  // dedicated coverage for these two radar categories at all (see
  // useStudentSkills.ts HUB_SKILL_PROFILE.professional), so the Skills Radar
  // was showing a fabricated score for both.
  { question: "Which revision reads best in a business report?", options: ["The results was pretty much what we kinda expected.", "The results were largely in line with our expectations.", "The result was what we expected pretty much.", "The results was largely expected."], correctIndex: 1, difficulty: 0.65, targetLevel: 'B1', feedback: { correct: 'Clear, formal, and grammatically sound.', incorrect: 'Formal reports need "were" and precise phrasing.' }, skill: 'business_writing' },
  { question: 'Which sentence sounds most natural when politely declining?', options: ["I don't want to do that.", "I'm afraid that won't be possible on our end.", "No, we cannot.", "That is not something we want."], correctIndex: 1, difficulty: 0.4, targetLevel: 'A2', feedback: { correct: 'Softened, natural professional tone.', incorrect: '"I\'m afraid…" softens a refusal naturally.' }, skill: 'fluency' },
  { question: 'Which sentence sounds most natural and idiomatic?', options: ['We need to think outside of the box for this problem, literally speaking.', 'We need to think outside the box on this one.', 'We need to think out of box for this.', 'We need thinking outside the box about this.'], correctIndex: 1, difficulty: 0.85, targetLevel: 'C1', feedback: { correct: 'Idiomatic and natural.', incorrect: '"Think outside the box" is the fixed idiom.' }, skill: 'fluency' },
  // Additional listening items — longer scripts (multi-sentence workplace
  // dialogues/voicemails via ElevenLabs TTS) for better spread across levels.
  { question: '🎧 What should callers do outside office hours?', options: ['Call back tomorrow', 'Leave a message and someone will return the call', 'Email the sales team', 'Nothing can be done'], correctIndex: 1, difficulty: 0.35, targetLevel: 'A2', type: 'listening_match', audio_script: "Thank you for calling. Our office hours are Monday to Friday, nine to five. If you are calling outside these hours, please leave your name, number, and a short message after the tone, and one of our team will get back to you as soon as possible.", feedback: { correct: 'Yes — leave a message.', incorrect: 'The message asks callers to leave a message.' } },
  { question: '🎧 What does the speaker say about customer retention?', options: ['It improved significantly this quarter', 'It stayed roughly flat despite higher spending', 'It is no longer being tracked', 'It only affects new customers'], correctIndex: 1, difficulty: 0.8, targetLevel: 'B2', type: 'listening_match', audio_script: "The headline numbers look encouraging at first glance, with new sign-ups up twelve percent quarter over quarter. However, once you factor in churn, customer retention has stayed roughly flat, even though we increased spend on loyalty programs. That's the part I think we need to dig into before the board meeting.", feedback: { correct: 'Yes — retention stayed flat.', incorrect: 'Retention was flat despite higher loyalty spend.' } },
  // Reading comprehension — genuine workplace passages, shown as static text
  // (not typewriter-animated).
  { question: 'Why is the office closing early on Friday?', options: ['A public holiday', 'A building maintenance issue', 'A company-wide team event', 'A power outage'], correctIndex: 2, difficulty: 0.35, targetLevel: 'A2', skill: 'reading', readingPassage: 'Dear team, please note that the office will close at 1pm this Friday so that everyone can attend our quarterly team-building event at the riverside park. Lunch will be provided. Please make sure any urgent tasks are completed before midday.', feedback: { correct: 'Yes — a team event. 🎉', incorrect: 'The email says it is for the team-building event.' } },
  { question: 'What does the writer ask the recipient to do?', options: ['Cancel the meeting entirely', 'Confirm a new time for the meeting', 'Attend the meeting in person only', 'Send the report by email'], correctIndex: 1, difficulty: 0.55, targetLevel: 'B1', skill: 'reading', readingPassage: "Hi Sam, unfortunately I have a scheduling conflict and won't be able to make our 2pm meeting on Thursday. Would it be possible to move it to either Wednesday afternoon or Friday morning instead? Let me know what suits you best and I'll send an updated invite.", feedback: { correct: 'Yes — confirm a new time. 📅', incorrect: 'The writer asks to reschedule, not cancel.' } },
  { question: "What is the main reason given for the strategy shift?", options: ['A drop in overall budget', 'Changing customer behavior online', 'A new competitor entering the market', 'Staff shortages in the marketing team'], correctIndex: 1, difficulty: 0.78, targetLevel: 'B2', skill: 'reading', readingPassage: 'Over the past year, we have observed a marked shift in how our customers discover and evaluate our products, with a growing majority beginning their research on social media rather than through traditional search. In light of this, the marketing team is proposing a reallocation of budget away from print advertising and toward short-form video content, which better matches where our audience now spends its attention.', feedback: { correct: 'Yes — changing customer behavior. 📱', incorrect: 'The memo cites a shift in how customers discover products online.' } },
  { question: "What is the analyst's main concern about the merger?", options: ['The combined company will be too large', 'The projected cost savings may be overstated', 'Regulators will block the deal', 'Employees will demand higher salaries'], correctIndex: 1, difficulty: 0.92, targetLevel: 'C1', skill: 'reading', readingPassage: "While the merger has been billed as an unambiguous win for shareholders, a closer reading of the projected synergies suggests a degree of optimism that may not withstand scrutiny. The anticipated cost savings rest heavily on assumptions about workforce consolidation that have historically proven difficult to realize in practice, and management has yet to address how integration costs, often underestimated in deals of this scale, will be absorbed in the first two years.", feedback: { correct: 'Yes — the cost savings may be overstated. 📊', incorrect: 'The analyst doubts the projected synergies/cost savings.' } },
];

const POOLS: Record<Hub, BankQuestion[]> = {
  playground: PLAYGROUND_POOL,
  academy: ACADEMY_BANK,
  professional: PROFESSIONAL_POOL,
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
