export interface GrammarQuestion {
  id: string;
  level: 'A2' | 'B1' | 'B2' | 'C1';
  category: string;
  question: string;
  options: string[];
  /** index into options */
  correct: number;
}

/**
 * Recruitment grammar test bank (60 items, A2 → C1).
 * Each attempt randomly draws 40 questions; pass threshold is 85%.
 */
export const RECRUITMENT_GRAMMAR_QUESTIONS: GrammarQuestion[] = [
  // ---------- A2 (10) ----------
  { id: 'a2-01', level: 'A2', category: 'Tenses', question: 'She ___ to the gym every morning.', options: ['go', 'goes', 'going', 'is go'], correct: 1 },
  { id: 'a2-02', level: 'A2', category: 'Tenses', question: 'I ___ a film last night.', options: ['watch', 'watched', 'have watched', 'watching'], correct: 1 },
  { id: 'a2-03', level: 'A2', category: 'Articles', question: 'He is ___ engineer.', options: ['a', 'an', 'the', '—'], correct: 1 },
  { id: 'a2-04', level: 'A2', category: 'Prepositions', question: 'The meeting is ___ Monday.', options: ['in', 'at', 'on', 'by'], correct: 2 },
  { id: 'a2-05', level: 'A2', category: 'Plurals', question: 'There are three ___ on the table.', options: ['child', 'childs', 'children', 'childes'], correct: 2 },
  { id: 'a2-06', level: 'A2', category: 'Comparatives', question: 'This box is ___ than that one.', options: ['heavy', 'heavyer', 'heavier', 'more heavy'], correct: 2 },
  { id: 'a2-07', level: 'A2', category: 'Possessive', question: '___ pen is this?', options: ['Who', 'Who is', 'Whose', "Who's"], correct: 2 },
  { id: 'a2-08', level: 'A2', category: 'Quantifiers', question: 'How ___ sugar do you take?', options: ['many', 'much', 'few', 'lot'], correct: 1 },
  { id: 'a2-09', level: 'A2', category: 'Modals', question: 'You ___ smoke here. It is forbidden.', options: ['must', 'mustn’t', 'should', 'don’t have to'], correct: 1 },
  { id: 'a2-10', level: 'A2', category: 'Tenses', question: 'Listen! Someone ___ at the door.', options: ['knocks', 'knock', 'is knocking', 'knocked'], correct: 2 },

  // ---------- B1 (18) ----------
  { id: 'b1-01', level: 'B1', category: 'Present Perfect', question: 'I ___ him since 2019.', options: ['know', 'knew', 'have known', 'am knowing'], correct: 2 },
  { id: 'b1-02', level: 'B1', category: 'Conditionals', question: 'If it rains tomorrow, we ___ at home.', options: ['stay', 'will stay', 'would stay', 'stayed'], correct: 1 },
  { id: 'b1-03', level: 'B1', category: 'Passive', question: 'The Mona Lisa ___ by Leonardo da Vinci.', options: ['painted', 'was painted', 'has painted', 'is painting'], correct: 1 },
  { id: 'b1-04', level: 'B1', category: 'Reported speech', question: 'She said she ___ tired.', options: ['is', 'was', 'has been', 'be'], correct: 1 },
  { id: 'b1-05', level: 'B1', category: 'Relative clauses', question: "That's the woman ___ son won the prize.", options: ['who', 'which', 'whose', 'whom'], correct: 2 },
  { id: 'b1-06', level: 'B1', category: 'Phrasal verbs', question: 'Could you ___ the music? It is too loud.', options: ['turn off', 'turn over', 'turn into', 'turn around'], correct: 0 },
  { id: 'b1-07', level: 'B1', category: 'Gerunds', question: 'I enjoy ___ in the rain.', options: ['walk', 'to walk', 'walking', 'walked'], correct: 2 },
  { id: 'b1-08', level: 'B1', category: 'Past Continuous', question: 'While I ___ dinner, the phone rang.', options: ['cooked', 'was cooking', 'have cooked', 'am cooking'], correct: 1 },
  { id: 'b1-09', level: 'B1', category: 'Modals', question: 'You ___ have told me earlier — I had no idea.', options: ['should', 'must', 'can', 'would'], correct: 0 },
  { id: 'b1-10', level: 'B1', category: 'Articles', question: 'She plays ___ violin beautifully.', options: ['a', 'an', 'the', '—'], correct: 2 },
  { id: 'b1-11', level: 'B1', category: 'Quantifiers', question: 'There were ___ people at the concert.', options: ['a few', 'a little', 'much', 'less'], correct: 0 },
  { id: 'b1-12', level: 'B1', category: 'Prepositions', question: 'He is good ___ solving puzzles.', options: ['in', 'at', 'on', 'for'], correct: 1 },
  { id: 'b1-13', level: 'B1', category: 'Comparatives', question: 'This is by far ___ film I have ever seen.', options: ['good', 'better', 'the best', 'best'], correct: 2 },
  { id: 'b1-14', level: 'B1', category: 'Future', question: 'Look at those clouds — it ___ rain.', options: ['will', 'is going to', 'goes to', 'shall'], correct: 1 },
  { id: 'b1-15', level: 'B1', category: 'Used to', question: 'I ___ live in Madrid when I was a child.', options: ['use to', 'used to', 'am used to', 'was using'], correct: 1 },
  { id: 'b1-16', level: 'B1', category: 'Question tags', question: "You're coming with us, ___?", options: ['are you', 'do you', "aren't you", "don't you"], correct: 2 },
  { id: 'b1-17', level: 'B1', category: 'Conjunctions', question: '___ the rain, we went for a walk.', options: ['Although', 'Despite', 'Because', 'However'], correct: 1 },
  { id: 'b1-18', level: 'B1', category: 'Pronouns', question: 'There is no one here but ___.', options: ['I', 'me', 'my', 'mine'], correct: 1 },

  // ---------- B2 (18) ----------
  { id: 'b2-01', level: 'B2', category: 'Conditionals', question: 'If I ___ you, I would accept the offer.', options: ['am', 'was', 'were', 'be'], correct: 2 },
  { id: 'b2-02', level: 'B2', category: 'Mixed conditionals', question: 'If she had studied medicine, she ___ a doctor today.', options: ['will be', 'would be', 'would have been', 'is'], correct: 1 },
  { id: 'b2-03', level: 'B2', category: 'Reported speech', question: 'He asked me ___.', options: ['where did I live', 'where do I live', 'where I lived', 'where I did live'], correct: 2 },
  { id: 'b2-04', level: 'B2', category: 'Passive', question: 'The report ___ by Friday.', options: ['must finish', 'must be finished', 'must to finish', 'must been finished'], correct: 1 },
  { id: 'b2-05', level: 'B2', category: 'Causative', question: 'I need to ___ my car serviced.', options: ['have', 'do', 'make', 'get'], correct: 0 },
  { id: 'b2-06', level: 'B2', category: 'Inversion', question: 'Never ___ such kindness.', options: ['I have seen', 'have I seen', 'I saw', 'did I have seen'], correct: 1 },
  { id: 'b2-07', level: 'B2', category: 'Relative clauses', question: 'The hotel ___ we stayed was lovely.', options: ['that', 'which', 'in which', 'where'], correct: 3 },
  { id: 'b2-08', level: 'B2', category: 'Phrasal verbs', question: "Don't ___ on me — I'm counting on you.", options: ['put down', 'let down', 'turn down', 'break down'], correct: 1 },
  { id: 'b2-09', level: 'B2', category: 'Modals — past', question: 'She isn’t answering. She ___ left already.', options: ['must have', 'should have', 'could be', 'might had'], correct: 0 },
  { id: 'b2-10', level: 'B2', category: 'Gerund vs infinitive', question: 'I regret ___ him the truth.', options: ['tell', 'to tell', 'telling', 'told'], correct: 2 },
  { id: 'b2-11', level: 'B2', category: 'Wish', question: 'I wish I ___ more time to read.', options: ['have', 'had', 'would have', 'have had'], correct: 1 },
  { id: 'b2-12', level: 'B2', category: 'Articles', question: '___ Andes run through several countries.', options: ['A', 'An', 'The', '—'], correct: 2 },
  { id: 'b2-13', level: 'B2', category: 'Quantifiers', question: 'Neither of the answers ___ correct.', options: ['is', 'are', 'were', 'have'], correct: 0 },
  { id: 'b2-14', level: 'B2', category: 'Future Perfect', question: 'By next June, I ___ here for ten years.', options: ['will work', 'will have worked', 'have worked', 'work'], correct: 1 },
  { id: 'b2-15', level: 'B2', category: 'Linking', question: 'He didn’t apply for the job, ___ being well qualified.', options: ['although', 'despite', 'in spite', 'however'], correct: 1 },
  { id: 'b2-16', level: 'B2', category: 'Adverbs', question: 'She speaks English ___.', options: ['fluent', 'fluently', 'fluentlier', 'more fluent'], correct: 1 },
  { id: 'b2-17', level: 'B2', category: 'Subject-verb', question: 'The news ___ shocking.', options: ['are', 'is', 'were', 'have been'], correct: 1 },
  { id: 'b2-18', level: 'B2', category: 'Conjunctions', question: '___ as he runs, he will never catch the bus.', options: ['So fast', 'As fast', 'However fast', 'Whatever fast'], correct: 2 },

  // ---------- C1 (14) ----------
  { id: 'c1-01', level: 'C1', category: 'Inversion', question: 'Hardly ___ when the lights went out.', options: ['we had sat down', 'had we sat down', 'we sat down', 'did we sit down'], correct: 1 },
  { id: 'c1-02', level: 'C1', category: 'Cleft sentence', question: '___ I admire most about her is her resilience.', options: ['That', 'Which', 'What', 'It'], correct: 2 },
  { id: 'c1-03', level: 'C1', category: 'Subjunctive', question: 'It is essential that he ___ on time.', options: ['arrives', 'arrive', 'arrived', 'will arrive'], correct: 1 },
  { id: 'c1-04', level: 'C1', category: 'Mixed conditional', question: 'If I had taken that job, I ___ in Berlin now.', options: ['would live', 'would have lived', 'will live', 'lived'], correct: 0 },
  { id: 'c1-05', level: 'C1', category: 'Participle clause', question: '___ the report, she went home.', options: ['Having finished', 'Finishing', 'Finished', 'Being finished'], correct: 0 },
  { id: 'c1-06', level: 'C1', category: 'Modals — deduction', question: 'He ___ have known; the email was clear.', options: ['could not', 'must not', 'cannot', 'should not'], correct: 2 },
  { id: 'c1-07', level: 'C1', category: 'Collocations', question: 'They reached a ___ decision after long talks.', options: ['heavy', 'strong', 'unanimous', 'wide'], correct: 2 },
  { id: 'c1-08', level: 'C1', category: 'Phrasal verbs', question: 'The talks ___ to nothing in the end.', options: ['came off', 'came up', 'came to', 'came down'], correct: 2 },
  { id: 'c1-09', level: 'C1', category: 'Hedging', question: 'The results ___ suggest a positive trend.', options: ['absolutely', 'tentatively', 'definitely', 'never'], correct: 1 },
  { id: 'c1-10', level: 'C1', category: 'Discourse', question: '___, the policy has not delivered the promised gains.', options: ['Even so', 'So that', 'As though', 'Provided that'], correct: 0 },
  { id: 'c1-11', level: 'C1', category: 'Nominalisation', question: 'There has been a sharp ___ in applications this year.', options: ['rise', 'risen', 'rising', 'arose'], correct: 0 },
  { id: 'c1-12', level: 'C1', category: 'Reported speech', question: 'She denied ___ the document.', options: ['to sign', 'signing', 'have signed', 'sign'], correct: 1 },
  { id: 'c1-13', level: 'C1', category: 'Articles', question: 'He has ___ knowledge of three Slavic languages.', options: ['a working', 'the working', 'working', 'an working'], correct: 0 },
  { id: 'c1-14', level: 'C1', category: 'Register', question: 'Should you require further assistance, please ___ hesitate to contact us.', options: ['don’t', 'do not', 'not', 'never'], correct: 1 },
];

export function drawGrammarQuestions(count = 40, seed?: string): GrammarQuestion[] {
  const pool = [...RECRUITMENT_GRAMMAR_QUESTIONS];
  // Fisher-Yates with optional deterministic seed
  let s = 0;
  if (seed) for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    if (!seed) return Math.random();
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

export const GRAMMAR_PASS_THRESHOLD = 85;
