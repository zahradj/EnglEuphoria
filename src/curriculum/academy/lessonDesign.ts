// Lesson design (owner, 2026-10-17): NO fixed skeleton. Each lesson is analysed first (objective, the student's needs, the skills it needs),
// the approach is chosen from that analysis, and the lesson authors its own acts and activities, like the Playground's free scene lists.
// Adapted (re-implemented, Academy only) from how the Playground builds lessons: orient -> activity purposes -> pattern library -> variety -> gate.
// The old fixed eight-part RUN_OF_SHOW in lessonBlueprint.ts is legacy (the old deck player only); the v2 player reads none of it.

export type LessonSkill = 'listening' | 'speaking' | 'reading' | 'writing' | 'vocabulary' | 'grammar' | 'pronunciation' | 'interaction';

/** What every lesson must contain somewhere. Order, length and form are the lesson's own. */
export const REQUIRED_INGREDIENTS = [
  { id: 'objective', rule: 'a lesson objective with 1-5 observable "I can ..." success criteria the teacher can mark' },
  { id: 'need', rule: 'the student\'s need written down first (what they know, L1 difficulties, comfort) and the skills the objective really needs' },
  { id: 'research', rule: 'internet research BEFORE the plan: compatible activities, interactive games and video-game mechanics for each criterion (docs/research/, "Game search")' },
  { id: 'approach', rule: 'the teaching approach(es) chosen from the analysis and the reason, in the plan (see TEACHING_APPROACHES)' },
  { id: 'recall', rule: 'earlier learning comes back (Remember? from recallPlan), in whatever form fits the lesson' },
  { id: 'model-rule', rule: 'new language is modelled before it is demanded, and any rule is stated plainly (<= 3 lines) before the production games; the student restates it' },
  { id: 'speaking', rule: 'speaking is the largest share of the hour (targets in speaking.ts), with a spoken ending' },
  { id: 'interactive', rule: 'several different interactive games, each tied to a named criterion; no game twice in a row' },
  { id: 'comfort', rule: 'comfort controls, no timers or public ranking, recorded voices only, art checked' },
  { id: 'traceability', rule: 'every activity names the objective or need it serves; one that serves neither is cut' },
] as const;

export interface TeachingApproach {
  id: string;
  name: string;
  /** the loop, in words */
  loop: string;
  /** when the analysis points to it */
  useWhen: string;
  /** when to avoid it */
  avoidWhen: string;
  /** skills it fits best */
  fits: LessonSkill[];
}

export const TEACHING_APPROACHES: TeachingApproach[] = [
  { id: 'ppp', name: 'PPP: present, practise, produce', loop: 'meet the language in use -> controlled practice -> freer production', useWhen: 'new, rule-governed language with a clear form (a tense, a pattern); lower levels; the student needs support first', avoidWhen: 'the language is already half-known, or the lesson is about fluency or a skill', fits: ['grammar', 'vocabulary'] },
  { id: 'ttt', name: 'Test-teach-test', loop: 'a cold task shows what the student can do -> teach only the gap -> retry and compare', useWhen: 'the student has met the language at school and only part is missing (most Academy B1+ revision)', avoidWhen: 'the language is truly new', fits: ['grammar', 'speaking', 'writing'] },
  { id: 'cl-tbl', name: 'Communicative / task-based', loop: 'a real task with an outcome -> do it -> focus on the language that was needed -> do it again better', useWhen: 'the goal is to DO something in English (a call, an interview, a plan) and fluency matters most', avoidWhen: 'the student has too little language to attempt the task', fits: ['speaking', 'interaction', 'listening'] },
  { id: 'discovery', name: 'Guided discovery', loop: 'evidence (examples, a text) -> the student notices and states the rule -> check -> use', useWhen: 'a pattern that can be seen from examples; teens who like puzzles', avoidWhen: 'the rule is arbitrary or the examples are too hard to read', fits: ['grammar', 'vocabulary', 'reading'] },
  { id: 'lexical', name: 'Lexical approach (chunks)', loop: 'meet whole phrases in context -> notice collocations -> reuse them in talk', useWhen: 'fluency chunks, collocations, functional language, reactions', avoidWhen: 'a single new rule is the target', fits: ['vocabulary', 'speaking', 'interaction'] },
  { id: 'skills', name: 'Skills lesson (pre / while / post)', loop: 'prepare and predict -> read or listen for gist, then detail -> respond and talk about it', useWhen: 'the criteria are reading or listening (or both); the need is comprehension strategies', avoidWhen: 'the criteria are about producing a pattern', fits: ['reading', 'listening'] },
  { id: 'genre', name: 'Genre / text-based', loop: 'model text -> analyse its parts and language -> joint writing -> own text', useWhen: 'a writing outcome (message, article, review, email)', avoidWhen: 'the lesson is speaking only', fits: ['writing', 'reading'] },
  { id: 'phonics', name: 'Sounds-first / decoding', loop: 'hear -> blend -> spell -> read it in a real message', useWhen: 'Pre-A1 and pronunciation work', avoidWhen: 'above A2 unless a sound is the target', fits: ['pronunciation', 'reading'] },
  { id: 'project', name: 'Project / product', loop: 'plan -> make something for an audience -> present -> reflect', useWhen: 'ownership and a showcase (radio show, newspaper page, trailer); end-of-unit lessons', avoidWhen: 'little time for rehearsal', fits: ['speaking', 'writing', 'interaction'] },
  { id: 'game', name: 'Game-based / narrative', loop: 'the lesson IS a game or story with state, choices and consequences', useWhen: 'motivation is the bottleneck; many short practice rounds are needed', avoidWhen: 'the game would not make the student use the target English', fits: ['vocabulary', 'speaking', 'interaction', 'grammar'] },
];

export interface LessonAnalysis {
  objective: string;
  criteria: string[];
  /** the student's starting point: what they already know, in one line */
  knows: string;
  /** what is truly new or missing */
  gap: string;
  skills: LessonSkill[];
  /** is the target language new to the student, or revision of something met at school? */
  newness: 'new' | 'partly-known';
  level: 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
}

/** Suggest approaches from the analysis (a start for the author's judgement, not a rule). Best match first. */
export function suggestApproaches(a: LessonAnalysis): TeachingApproach[] {
  const score = (t: TeachingApproach): number => {
    let s = t.fits.filter((k) => a.skills.includes(k)).length * 2;
    if (a.newness === 'partly-known' && t.id === 'ttt') s += 3;
    if (a.newness === 'new' && t.id === 'ppp') s += 3;
    if (a.level === 'Pre-A1' && t.id === 'phonics') s += 5;
    if (a.level !== 'Pre-A1' && a.level !== 'A1' && t.id === 'phonics') s -= 5;
    if ((a.level === 'B1' || a.level === 'B2' || a.level === 'C1') && (t.id === 'cl-tbl' || t.id === 'project')) s += 1;
    return s;
  };
  return [...TEACHING_APPROACHES].sort((x, y) => score(y) - score(x));
}

/** Problems with a written lesson analysis (empty = fine). Used by the lesson plan check and tests. */
export function analysisProblems(a: LessonAnalysis): string[] {
  const p: string[] = [];
  if (!a.objective.trim()) p.push('objective is empty');
  if (a.criteria.length < 1 || a.criteria.length > 5) p.push('1-5 success criteria are needed');
  if (!a.knows.trim() || !a.gap.trim()) p.push('say what the student already knows and what the gap is');
  if (!a.skills.length) p.push('name the skills the objective needs');
  return p;
}
