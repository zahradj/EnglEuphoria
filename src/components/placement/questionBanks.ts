// Expert-authored placement-test question banks per hub.
// Each bank has 24+ items so a 15-question test is freshly shuffled per attempt.
// `imagePrompt` triggers a Gemini-generated illustration in TestPhase.
// `audio_script` triggers ElevenLabs TTS in TestPhase.

export type Hub = 'playground' | 'academy' | 'professional';
export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface BankQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: number;
  targetLevel: Cefr;
  feedback: { correct: string; incorrect: string };
  imagePrompt?: string;   // when set, render an AI image above the question
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
  if (q.imagePrompt) return 'vocabulary';
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
  if (q.imagePrompt) return hub === 'professional' ? 'professional_vocabulary' : 'vocabulary';
  return hub === 'professional' ? 'grammar_accuracy' : 'grammar';
}

/** Default localized meta-instruction key for a question, keyed by skill. */
export function taskInstructionKeyFor(q: BankQuestion): string {
  if (q.taskInstructionKey) return q.taskInstructionKey;
  const skill = resolveSkill(q);
  return `placement.task.${skill}`;
}

// ---------------------------------------------------------------- PLAYGROUND
const PLAYGROUND_POOL: BankQuestion[] = [
  { question: "Which animal says 'Meow'?", options: ['🐱 Cat', '🐶 Dog', '🐸 Frog', '🐦 Bird'], correctIndex: 0, difficulty: 0.2, targetLevel: 'A1', feedback: { correct: 'Yes! Cats say Meow! 🐱', incorrect: 'Cats say Meow! 🐱' }, imagePrompt: 'A friendly cartoon cat sitting and saying meow' },
  { question: 'What color is a banana? 🍌', options: ['Red', 'Blue', 'Yellow', 'Green'], correctIndex: 2, difficulty: 0.2, targetLevel: 'A1', feedback: { correct: 'Yes! Bananas are yellow!', incorrect: 'Bananas are yellow!' }, imagePrompt: 'A bright yellow banana on a white background' },
  { question: 'Choose the number "five".', options: ['3', '5', '7', '9'], correctIndex: 1, difficulty: 0.2, targetLevel: 'A1', feedback: { correct: 'Great counting! 🖐️', incorrect: '"Five" is 5 — like one hand!' } },
  { question: 'Which one is a fruit?', options: ['🍎 Apple', '🚗 Car', '👟 Shoe', '📚 Book'], correctIndex: 0, difficulty: 0.2, targetLevel: 'A1', feedback: { correct: 'Yes! An apple is a fruit!', incorrect: 'Apples are fruit! 🍎' }, imagePrompt: 'A shiny red apple, simple flat illustration' },
  { question: 'How do we say hello in the morning?', options: ['Good night', 'Good morning', 'Goodbye', 'See you'], correctIndex: 1, difficulty: 0.25, targetLevel: 'A1', feedback: { correct: '"Good morning!" ☀️', incorrect: 'In the morning we say "Good morning!"' } },
  { question: '🎧 Listen — which animal is it?', options: ['🐶 Dog', '🐱 Cat', '🐮 Cow', '🐔 Chicken'], correctIndex: 2, difficulty: 0.3, targetLevel: 'A1', type: 'listening_match', audio_script: 'Moo! Moo! I am a big animal on the farm and I give milk.', feedback: { correct: 'Yes! Cows say moo!', incorrect: 'Cows say moo! 🐮' } },
  { question: 'Which one do you wear on your feet?', options: ['🎩 Hat', '👟 Shoes', '🧤 Gloves', '👓 Glasses'], correctIndex: 1, difficulty: 0.3, targetLevel: 'A1', feedback: { correct: 'Yes! Shoes go on our feet!', incorrect: 'We wear shoes on our feet! 👟' } },
  { question: 'Pick the correct word: "I ___ a boy."', options: ['am', 'is', 'are', 'be'], correctIndex: 0, difficulty: 0.35, targetLevel: 'A1', feedback: { correct: '"I am" — perfect!', incorrect: 'With "I" we use "am".' } },
  { question: 'What do you do with a book? 📖', options: ['Eat it', 'Read it', 'Throw it', 'Wear it'], correctIndex: 1, difficulty: 0.35, targetLevel: 'A1', feedback: { correct: 'Yes! We read books!', incorrect: 'We read books!' } },
  { question: 'How many legs does a spider have?', options: ['Four', 'Six', 'Eight', 'Ten'], correctIndex: 2, difficulty: 0.4, targetLevel: 'A2', feedback: { correct: 'Yes! Spiders have 8 legs! 🕷️', incorrect: 'Spiders have 8 legs! 🕷️' }, imagePrompt: 'A friendly cartoon spider with 8 legs, kid-friendly' },
  { question: 'Choose the right one: "She ___ a red dress."', options: ['have', 'has', 'are', 'is have'], correctIndex: 1, difficulty: 0.4, targetLevel: 'A2', feedback: { correct: 'Yes! "She has".', incorrect: 'With she/he/it we use "has".' } },
  { question: 'Which season is hot? ☀️', options: ['Winter', 'Summer', 'Autumn', 'Spring'], correctIndex: 1, difficulty: 0.4, targetLevel: 'A2', feedback: { correct: 'Summer is hot! 🏖️', incorrect: 'Summer is the hot season.' } },
  { question: 'Find the opposite of "big".', options: ['Tall', 'Small', 'Fast', 'New'], correctIndex: 1, difficulty: 0.4, targetLevel: 'A2', feedback: { correct: 'Yes! Big ↔ small.', incorrect: 'The opposite of big is small.' } },
  { question: '🎧 Listen — what is the boy doing?', options: ['Eating', 'Sleeping', 'Running', 'Singing'], correctIndex: 0, difficulty: 0.45, targetLevel: 'A2', type: 'listening_match', audio_script: 'Yum yum! I love my breakfast. I am eating pancakes with honey.', feedback: { correct: 'Yes! He is eating.', incorrect: 'He is eating breakfast.' } },
  { question: 'Which is a vegetable?', options: ['🥕 Carrot', '🍫 Chocolate', '🍩 Donut', '🍪 Cookie'], correctIndex: 0, difficulty: 0.45, targetLevel: 'A2', feedback: { correct: 'Yes! Carrots are vegetables. 🥕', incorrect: 'Carrots are vegetables.' }, imagePrompt: 'A bright orange carrot with green leaves, flat illustration' },
  { question: 'Pick the correct: "There ___ five apples."', options: ['is', 'am', 'are', 'be'], correctIndex: 2, difficulty: 0.5, targetLevel: 'A2', feedback: { correct: 'Yes! With many things we use "there are".', incorrect: 'For more than one we say "there are".' } },
  { question: 'Which one is the smallest?', options: ['Elephant', 'Mouse', 'Dog', 'Cat'], correctIndex: 1, difficulty: 0.5, targetLevel: 'A2', feedback: { correct: 'Yes! A mouse is smallest!', incorrect: 'A mouse is the smallest. 🐭' } },
  { question: 'Choose the past form: "Yesterday I ___ to school."', options: ['go', 'going', 'went', 'goed'], correctIndex: 2, difficulty: 0.55, targetLevel: 'A2', feedback: { correct: 'Yes! "Went" is the past of "go".', incorrect: 'The past of "go" is "went".' } },
];

// ---------------------------------------------------------------- ACADEMY
const ACADEMY_POOL: BankQuestion[] = [
  // A1
  { question: "Choose the correct sentence:", options: ['She are my sister.', 'She is my sister.', 'She am my sister.', 'She be my sister.'], correctIndex: 1, difficulty: 0.1, targetLevel: 'A1', feedback: { correct: '"She is my sister." ✅', incorrect: 'With she/he/it we use "is".' } },
  { question: "Complete: 'I ___ pizza for lunch every Friday.'", options: ['eats', 'eating', 'eat', 'ate'], correctIndex: 2, difficulty: 0.15, targetLevel: 'A1', feedback: { correct: 'Right! Simple present with "I".', incorrect: 'With "I" use "eat".' } },
  { question: "Which pronoun replaces 'my friends and I'?", options: ['They', 'Us', 'We', 'Them'], correctIndex: 2, difficulty: 0.2, targetLevel: 'A1', feedback: { correct: 'Yes! → "We".', incorrect: 'Subject pronoun → "We".' } },
  { question: 'Pick the question: "___ you a student?"', options: ['Do', 'Are', 'Is', 'Have'], correctIndex: 1, difficulty: 0.2, targetLevel: 'A1', feedback: { correct: 'Yes! "Are you a student?"', incorrect: 'Use "Are" with "you".' } },
  // A2
  { question: "Complete: 'Last weekend I ___ a great movie.'", options: ['watch', 'watched', 'watching', 'have watch'], correctIndex: 1, difficulty: 0.3, targetLevel: 'A2', feedback: { correct: 'Past simple → "watched". 🎬', incorrect: '"Last weekend" needs past simple.' } },
  { question: "What's happening now? 'Look! It ___.'", options: ['rains', 'is raining', 'rained', 'rain'], correctIndex: 1, difficulty: 0.35, targetLevel: 'A2', feedback: { correct: 'Present continuous! 🌧️', incorrect: 'Right-now action = present continuous.' } },
  { question: "Choose the preposition: 'The phone is ___ the desk.'", options: ['in', 'on', 'at', 'between'], correctIndex: 1, difficulty: 0.4, targetLevel: 'A2', feedback: { correct: 'Yes! On a surface = on.', incorrect: 'Surfaces use "on".' } },
  { question: 'Which sentence is correct?', options: ["I'm liking this song.", 'I like this song.', 'I am like this song.', 'I likes this song.'], correctIndex: 1, difficulty: 0.4, targetLevel: 'A2', feedback: { correct: '"Like" is a stative verb.', incorrect: '"Like" is stative — use simple present.' } },
  // B1
  { question: "Complete: 'I ___ in this city since 2020.'", options: ['live', 'lived', 'have lived', 'am living'], correctIndex: 2, difficulty: 0.55, targetLevel: 'B1', feedback: { correct: 'Excellent! Present perfect with "since".', incorrect: '"Since 2020" → present perfect.' } },
  { question: "Best modal: 'You ___ wear a seatbelt — it's the law.'", options: ['might', 'could', 'must', 'may'], correctIndex: 2, difficulty: 0.6, targetLevel: 'B1', feedback: { correct: 'Yes! "Must" = obligation.', incorrect: 'Legal obligation → "must".' } },
  { question: "Comparative: 'My new laptop is ___ than my old one.'", options: ['more fast', 'faster', 'fastest', 'most fast'], correctIndex: 1, difficulty: 0.65, targetLevel: 'B1', feedback: { correct: 'Right! Short adjective → -er.', incorrect: 'Short adjective: "faster".' } },
  { question: '🎧 What is the speaker about to do?', options: ['Go shopping for food', 'Cook dinner at home', 'Clean the kitchen', 'Watch a film'], correctIndex: 0, difficulty: 0.7, targetLevel: 'B1', type: 'listening_match', audio_script: "I'm just heading to the supermarket to pick up some bread and milk for breakfast tomorrow. I might also grab a few vegetables if they still have that fresh produce sale going on. Should only take me about twenty minutes.", feedback: { correct: 'Excellent listening! 🛒', incorrect: 'Supermarket = food shopping.' } },
  { question: 'Choose the synonym for "begin".', options: ['end', 'finish', 'start', 'stop'], correctIndex: 2, difficulty: 0.6, targetLevel: 'B1', feedback: { correct: 'Yes! Begin = start.', incorrect: '"Begin" and "start" are synonyms.' } },
  // B2
  { question: "'If I ___ more time, I would learn another language.'", options: ['have', 'had', 'would have', 'will have'], correctIndex: 1, difficulty: 0.75, targetLevel: 'B2', feedback: { correct: 'Second conditional ✅', incorrect: 'Second conditional → "If + past simple".' } },
  { question: "Passive: 'The chef prepared the meal.'", options: ['The meal prepared by the chef.', 'The meal was prepared by the chef.', 'The meal is preparing by the chef.', 'The meal has prepare by the chef.'], correctIndex: 1, difficulty: 0.8, targetLevel: 'B2', feedback: { correct: 'Perfect passive!', incorrect: 'was/were + past participle.' } },
  { question: "Phrasal verb: 'I need to ___ this word — I don't know what it means.'", options: ['look after', 'look up', 'look for', 'look into'], correctIndex: 1, difficulty: 0.85, targetLevel: 'B2', feedback: { correct: '"Look up" = search info!', incorrect: '"Look up" = find information.' } },
  { question: '🎧 What is the speaker\'s main point?', options: ['She enjoyed the film overall', 'She thought the film was disappointing despite good acting', 'She refused to watch the film', 'She wants to watch it a second time'], correctIndex: 1, difficulty: 0.88, targetLevel: 'B2', type: 'listening_match', audio_script: 'Honestly, the performances were excellent and the cinematography was stunning, but the story dragged on for far too long and the ending left me feeling rather let down. If they had trimmed at least twenty minutes from the middle, it would have been a much stronger film overall.', feedback: { correct: 'Brilliant inference! 🎬', incorrect: 'Praised acting, but disappointed by story.' } },
  { question: 'Best linker: "She studied hard, ___ she passed every exam."', options: ['but', 'so', 'although', 'because'], correctIndex: 1, difficulty: 0.7, targetLevel: 'B2', feedback: { correct: 'Cause → result = "so".', incorrect: 'Result clause uses "so".' } },
  // C1
  { question: 'Most precise: "Her arguments were so ___ that no one could refute them."', options: ['nice', 'compelling', 'okay', 'different'], correctIndex: 1, difficulty: 0.9, targetLevel: 'C1', feedback: { correct: '"Compelling" = persuasive! 🎯', incorrect: '"Compelling" is the C1 choice.' } },
  { question: "Inversion: 'Not only ___ the deadline, but he also exceeded expectations.'", options: ['he met', 'did he meet', 'he did meet', 'met he'], correctIndex: 1, difficulty: 0.95, targetLevel: 'C1', feedback: { correct: 'Subject-aux inversion! 🏆', incorrect: 'After "Not only" → invert.' } },
  { question: "Idiom 'to bite the bullet' means…", options: ['To eat very quickly', 'To face a difficult situation with courage', 'To make a serious mistake', 'To speak without thinking'], correctIndex: 1, difficulty: 1.0, targetLevel: 'C1', feedback: { correct: 'Endure with courage! 💪', incorrect: '"Bite the bullet" = face it bravely.' } },
  // Vocabulary items — this hub had ZERO items resolving to the 'vocabulary'
  // skill (resolveScoreSkill only maps to it via imagePrompt, which Academy
  // items never set), so despite the radar showing a "Vocabulary" category,
  // it always fell back to a copied overall score. These are real word-
  // knowledge items (synonym/antonym), text-only, no image needed.
  { question: "Choose the word that means 'happy'.", options: ['glad', 'sad', 'angry', 'tired'], correctIndex: 0, difficulty: 0.15, targetLevel: 'A1', feedback: { correct: '"Glad" = happy! 😊', incorrect: '"Glad" means happy.' }, skill: 'vocabulary' },
  { question: "Which word means the opposite of 'expensive'?", options: ['cheap', 'costly', 'rich', 'priceless'], correctIndex: 0, difficulty: 0.35, targetLevel: 'A2', feedback: { correct: 'Yes! Cheap ↔ expensive.', incorrect: 'The opposite of expensive is cheap.' }, skill: 'vocabulary' },
  { question: "Choose the best synonym for 'huge'.", options: ['enormous', 'tiny', 'quick', 'quiet'], correctIndex: 0, difficulty: 0.55, targetLevel: 'B1', feedback: { correct: '"Enormous" = huge!', incorrect: '"Enormous" is the closest synonym.' }, skill: 'vocabulary' },
  { question: "Choose the word closest in meaning to 'meticulous'.", options: ['careless', 'thorough', 'quick', 'lazy'], correctIndex: 1, difficulty: 0.75, targetLevel: 'B2', feedback: { correct: '"Thorough" = meticulous! 🔍', incorrect: '"Meticulous" means very thorough and careful.' }, skill: 'vocabulary' },
  { question: "Which word best fits: 'Her explanation was so ___ that everyone understood immediately.'", options: ['lucid', 'vague', 'confusing', 'messy'], correctIndex: 0, difficulty: 0.9, targetLevel: 'C1', feedback: { correct: '"Lucid" = exceptionally clear! 💡', incorrect: '"Lucid" fits — it means very clear.' }, skill: 'vocabulary' },
  // Writing + Speaking/Fluency items — this hub previously had no dedicated
  // coverage for these two radar categories at all (see useStudentSkills.ts
  // HUB_SKILL_PROFILE.academy), so the Skills Radar was showing a fabricated
  // score for both instead of real measurement.
  { question: 'Which sentence is written correctly?', options: ['I have went to the cinema yesterday.', 'I went to the cinema yesterday.', 'I have go to the cinema yesterday.', 'I going to the cinema yesterday.'], correctIndex: 1, difficulty: 0.35, targetLevel: 'A2', feedback: { correct: 'Simple past — no "have" needed. ✍️', incorrect: '"Yesterday" takes simple past: "went".' }, skill: 'writing' },
  { question: "Which is the best way to start an email to a teacher you don't know well?", options: ['Hey, what\'s up?', 'Dear Ms. Carter,', 'Yo!', 'Hiya,'], correctIndex: 1, difficulty: 0.55, targetLevel: 'B1', feedback: { correct: 'Polite and appropriate. ✍️', incorrect: '"Dear + name" is the polite opener.' }, skill: 'writing' },
  { question: 'Which sentence uses punctuation correctly?', options: ["Its important to check your work, before you hand it in.", "It's important to check your work before you hand it in.", "Its important, to check your work before you hand it in.", "It's important to check your work, before, you hand it in."], correctIndex: 1, difficulty: 0.75, targetLevel: 'B2', feedback: { correct: 'Correct apostrophe and no stray commas. ✍️', incorrect: '"It\'s" (it is) + no comma before "before".' }, skill: 'writing' },
  { question: 'Which sentence sounds most natural?', options: ['I am liking pizza very much.', 'I like pizza very much.', 'I am like pizza very much.', 'Pizza I like very much.'], correctIndex: 1, difficulty: 0.2, targetLevel: 'A1', feedback: { correct: 'Natural word order and stative verb. 🗣️', incorrect: '"Like" is stative — no "-ing" form.' }, skill: 'speaking' },
  { question: 'Which sentence sounds most natural in conversation?', options: ['I am afraid that I cannot to attend.', "I'm afraid I can't make it.", 'I fear I am not able for attending.', 'Unfortunately is not possible I come.'], correctIndex: 1, difficulty: 0.6, targetLevel: 'B1', feedback: { correct: 'Natural, contracted, conversational. 🗣️', incorrect: '"I\'m afraid I can\'t make it" is how this is naturally said.' }, skill: 'speaking' },
  { question: 'Which sentence sounds most natural?', options: ['I would appreciate if you could revert back to me at your earliest convenience possible.', "I'd appreciate it if you could get back to me soon.", 'I am appreciating your reverting to me soonly.', 'Please to revert back at convenience.'], correctIndex: 1, difficulty: 0.75, targetLevel: 'B2', feedback: { correct: 'Natural and concise. 🗣️', incorrect: 'Native speakers say "get back to me soon".' }, skill: 'speaking' },
  // Additional listening items — longer scripts (multi-sentence dialogues/
  // monologues via ElevenLabs TTS) so listening genuinely tests comprehension
  // of connected speech, not just a single isolated fact.
  { question: '🎧 What color is Rex?', options: ['Black', 'Brown', 'White', 'Grey'], correctIndex: 1, difficulty: 0.2, targetLevel: 'A1', type: 'listening_match', audio_script: 'Hi! My name is Alex. I have a small dog. His name is Rex. Rex is brown and very friendly. Every day, I take Rex for a walk in the park near my house.', feedback: { correct: 'Yes! Rex is brown. 🐶', incorrect: 'Rex is brown.' } },
  { question: '🎧 What is expected in the early afternoon?', options: ['Sunny skies all day', 'Clouds moving in', 'Heavy snow', 'A thunderstorm'], correctIndex: 1, difficulty: 0.4, targetLevel: 'A2', type: 'listening_match', audio_script: "Good morning, everyone! Today's forecast shows sunny skies in the morning, but clouds are expected to roll in by early afternoon. There's a small chance of light rain after four, so you might want to bring an umbrella just in case.", feedback: { correct: 'Yes — clouds moving in. ☁️', incorrect: 'Clouds arrive by early afternoon.' } },
  { question: '🎧 According to the speaker, what is often overlooked?', options: ['The cost of solar panels', 'The complexity of transitioning the whole grid', 'The popularity of renewable energy', 'The efficiency of wind turbines'], correctIndex: 1, difficulty: 0.92, targetLevel: 'C1', type: 'listening_match', audio_script: "What's often overlooked in discussions about renewable energy is the sheer complexity of transitioning an entire national grid, not merely the cost of the panels or turbines themselves. Storage capacity, transmission infrastructure, and regulatory reform all have to advance in tandem, or the whole endeavor risks stalling.", feedback: { correct: 'Precisely — the systemic complexity. 🔌', incorrect: 'The speaker means grid-transition complexity, not just cost.' } },
  // Reading comprehension — genuine passages, shown as static text (not
  // typewriter-animated), with a question that requires actually reading it.
  { question: 'Who does Maria walk to school with?', options: ['Leo', 'Sam', 'Her mom', 'Her dad'], correctIndex: 1, difficulty: 0.2, targetLevel: 'A1', skill: 'reading', readingPassage: 'My name is Maria. I am twelve years old. I live with my mom, dad, and my little brother Leo. Every morning I walk to school with my friend Sam. We love drawing pictures together.', feedback: { correct: 'Yes — Maria walks with Sam. 📖', incorrect: 'The passage says she walks with Sam.' } },
  { question: "What did Tom's sister do at the beach?", options: ['Built a sandcastle', 'Collected shells', 'Watched TV', 'Cooked lunch'], correctIndex: 1, difficulty: 0.4, targetLevel: 'A2', skill: 'reading', readingPassage: "Last Saturday, Tom and his family went to the beach. They arrived early in the morning before it got too hot. Tom built a sandcastle while his sister collected shells. In the afternoon, they had a picnic and watched the sunset before driving home.", feedback: { correct: 'Yes — she collected shells. 🐚', incorrect: 'Tom built the sandcastle; his sister collected shells.' } },
  { question: 'According to the passage, why have some schools limited phone use?', options: ['To save electricity', 'To help students focus', 'Phones are too expensive', 'Parents complained'], correctIndex: 1, difficulty: 0.6, targetLevel: 'B1', skill: 'reading', readingPassage: 'Many teenagers today spend several hours a day on their phones, often without realizing how much time has passed. While social media can help people stay connected with friends, experts warn that too much screen time may affect sleep and concentration at school. Some schools have started limiting phone use during class to help students focus.', feedback: { correct: 'Yes — to help students focus. 📱', incorrect: 'The passage says it helps students focus in class.' } },
  { question: "What is the writer's attitude toward brands promoting recycled materials?", options: ["Fully convinced they've solved the problem", 'Skeptical the efforts are meaningful enough', 'Unaware such efforts exist', 'Certain fast fashion will disappear'], correctIndex: 1, difficulty: 0.78, targetLevel: 'B2', skill: 'reading', readingPassage: 'Despite growing awareness of its environmental impact, fast fashion continues to dominate the clothing industry. Consumers are drawn to its low prices and constant stream of new styles, even though the rapid production cycle generates enormous textile waste. A handful of brands have begun promoting recycled materials, but critics argue these efforts remain largely symbolic compared to the scale of the problem.', feedback: { correct: 'Yes — skeptical, per "largely symbolic". 👗', incorrect: 'The passage calls the efforts "largely symbolic".' } },
  { question: "What does the passage suggest about the committee's proposal?", options: ["It fixed the department's core problems", 'It was a superficial response that avoided deeper issues', 'It was praised by all staff members', "It increased the department's budget significantly"], correctIndex: 1, difficulty: 0.92, targetLevel: 'C1', skill: 'reading', readingPassage: "The committee's recommendation, though ostensibly grounded in fiscal prudence, belied a deeper reluctance to confront the structural inefficiencies that had long plagued the department. Rather than addressing root causes, the proposed measures amounted to little more than a reshuffling of existing resources — a fact not lost on the more discerning members of staff.", feedback: { correct: 'Yes — a superficial reshuffling. 🗂️', incorrect: 'The proposal avoided the real structural problems.' } },
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
  academy: ACADEMY_POOL,
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
