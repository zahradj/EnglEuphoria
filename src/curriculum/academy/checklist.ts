// Teacher checklists (owner 2026-10-14): (1) after every lesson the teacher marks what the student did against the lesson's success criteria, and
// (2) at the end of a unit (Season) the final assessment is marked on six strands and the Release, with a clear verdict: "nailed it" or "needs more practice".
// Pure rules; saving is in src/services/academyChecklistService.ts. Marks follow the blueprint's can-do ticks (yes / almost / not yet). Thresholds are starting values [target].
import { SPEAKING_LADDER, SPEAKING_TARGETS } from './speaking';

export type Mark = 'nailed' | 'almost' | 'not-yet';
export const MARK_LABEL: Record<Mark, string> = { nailed: 'Nailed it', almost: 'Almost', 'not-yet': 'Needs more practice' };

/** A suggested mark from what the player saw: wrong tries and hints on the slides that train the criterion. The teacher confirms or changes it. */
export function suggestMark(wrong: number, hints = 0): Mark {
  if (wrong <= 1 && hints <= 1) return 'nailed';
  if (wrong <= 4) return 'almost';
  return 'not-yet';
}

export const ERROR_CATEGORIES = ['pronunciation', 'vocabulary', 'grammar', 'word order', 'listening', 'spelling', 'fluency', 'confidence'] as const;
export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];
export type LadderStepId = (typeof SPEAKING_LADDER)[number]['step'];

export interface CriterionMark { text: string; mark: Mark; suggested?: Mark }
export interface LessonChecklist {
  lessonId: string;
  studentId: string;
  /** ISO date */
  on: string;
  level: keyof typeof SPEAKING_TARGETS;
  criteria: CriterionMark[];
  /** highest speaking ladder step the student reached in the lesson */
  speakingStep: LadderStepId | null;
  /** up to 3 recurring errors; they start the next Remember? */
  errors: ErrorCategory[];
  comfort: 'ok' | 'tense';
  notes: string;
  /** "Say it" taps counted by the player */
  sayIt?: number;
}

export type LessonVerdict = 'nailed' | 'practise' | 'replay';
export const LESSON_VERDICT_LABEL: Record<LessonVerdict, string> = { nailed: 'Nailed the lesson', practise: 'Needs more practice', replay: 'Replay this lesson' };
export interface LessonResult { verdict: LessonVerdict; counts: Record<Mark, number>; reasons: string[]; actions: string[] }

export function lessonResult(c: LessonChecklist): LessonResult {
  const counts: Record<Mark, number> = { nailed: 0, almost: 0, 'not-yet': 0 };
  c.criteria.forEach((x) => { counts[x.mark] += 1; });
  const n = c.criteria.length || 1;
  const order = SPEAKING_LADDER.map((s) => s.step);
  const target = SPEAKING_TARGETS[c.level].reachesStep;
  const speakingLow = c.speakingStep === null || order.indexOf(c.speakingStep) < order.indexOf(target);
  const reasons: string[] = [];
  const actions: string[] = [];
  let verdict: LessonVerdict = 'nailed';
  if (counts['not-yet'] * 2 >= n && counts['not-yet'] > 0) { verdict = 'replay'; reasons.push(`${counts['not-yet']} of ${n} goals need more practice`); }
  else if (counts['not-yet'] > 0 || counts.almost >= 2) { verdict = 'practise'; reasons.push(`${counts['not-yet']} need more practice and ${counts.almost} are almost there`); }
  if (c.comfort === 'tense' && verdict === 'nailed') { verdict = 'practise'; reasons.push('the student seemed tense'); }
  c.criteria.filter((x) => x.mark !== 'nailed').forEach((x) => actions.push(`${x.mark === 'not-yet' ? 'Practise' : 'Recheck'} next lesson: ${x.text}`));
  if (c.errors.length) actions.push(`Start the next Remember? with: ${c.errors.slice(0, 3).join(', ')}.`);
  if (speakingLow) { actions.push(`Speaking: the lesson should reach "${target}" (reached: ${c.speakingStep ?? 'none'}). Add shadowing and a voice note.`); if (verdict === 'nailed') { verdict = 'practise'; reasons.push('speaking did not reach its step'); } }
  if (verdict === 'replay') actions.push('Replay this lesson before moving on; keep the new items at most 8.');
  if (verdict === 'nailed') actions.push('Move on to the next lesson.');
  return { verdict, counts, reasons, actions };
}

// ---------------------------------------------------------------- unit (Season) final assessment
export const STRANDS = ['listening', 'speaking', 'reading', 'writing', 'vocabulary', 'grammar'] as const;
export type Strand = (typeof STRANDS)[number];
/** Release rubric: each 1 (not yet) to 4 (strong). */
export const RELEASE_CRITERIA = ['accuracy', 'range', 'fluency', 'interaction', 'independence'] as const;
export type ReleaseCriterion = (typeof RELEASE_CRITERIA)[number];

export interface UnitAssessment {
  seasonId: string;
  studentId: string;
  on: string;
  levelCheck: boolean;
  /** 0-100 per strand: checkpoint items for listening, reading, vocabulary and grammar; rubric converted to a percentage for speaking and writing */
  strands: Record<Strand, number>;
  release: Record<ReleaseCriterion, 1 | 2 | 3 | 4>;
  notes: string;
}
export const markOfScore = (score: number, levelCheck = false): Mark => (score >= 80 ? 'nailed' : score >= (levelCheck ? 65 : 60) ? 'almost' : 'not-yet');
/** Rubric 1-4 as a percentage (1 = 25, 4 = 100). */
export const rubricToScore = (r: number) => Math.round((r / 4) * 100);

export type UnitVerdict = 'nailed' | 'ready' | 'practise' | 'repeat';
export const UNIT_VERDICT_LABEL: Record<UnitVerdict, string> = { nailed: 'Nailed the unit', ready: 'Ready for the next unit', practise: 'Needs more practice, then move on', repeat: 'Repeat the unit first' };
/** Which lessons of the Season rebuild each strand (episode numbers). */
export const STRAND_LESSONS: Record<Strand, number[]> = { listening: [1, 4], speaking: [4, 6], reading: [5], writing: [5, 6], vocabulary: [2], grammar: [3] };
export interface UnitResult {
  verdict: UnitVerdict;
  marks: Record<Strand, Mark>;
  releaseAverage: number;
  weakStrands: Strand[];
  almostStrands: Strand[];
  plan: string[];
}

export function unitResult(a: UnitAssessment): UnitResult {
  const marks = Object.fromEntries(STRANDS.map((s) => [s, markOfScore(a.strands[s], a.levelCheck)])) as Record<Strand, Mark>;
  const weak = STRANDS.filter((s) => marks[s] === 'not-yet');
  const almost = STRANDS.filter((s) => marks[s] === 'almost');
  const nailed = STRANDS.filter((s) => marks[s] === 'nailed').length;
  const releaseAverage = RELEASE_CRITERIA.reduce((t, c) => t + a.release[c], 0) / RELEASE_CRITERIA.length;
  let verdict: UnitVerdict;
  if (weak.length >= 3 || releaseAverage < 2) verdict = 'repeat';
  else if (weak.length > 0) verdict = 'practise';
  else if (nailed >= 5 && releaseAverage >= 3) verdict = a.levelCheck && nailed < 6 ? 'ready' : 'nailed';
  else verdict = a.levelCheck && nailed < 4 ? 'practise' : 'ready';
  const plan: string[] = [];
  if (verdict === 'repeat') plan.push('Replay the Season (start with the lessons below) before the next unit; keep new items at most 8.');
  weak.forEach((s) => plan.push(`${s}: needs more practice. Replay lesson ${STRAND_LESSONS[s].map((e) => `E${e}`).join(' / ')}, give it extra Daily 10 time, retest in 2 weeks.`));
  almost.forEach((s) => plan.push(`${s}: almost there. Extra Daily 10 rounds and a quick recheck in the next Remix.`));
  if (releaseAverage < 3) plan.push('Release: record Take 3 with the rubric, one criterion at a time.');
  if (verdict === 'nailed') plan.push('Move on. Celebrate the Release: add it to the portfolio.');
  return { verdict, marks, releaseAverage, weakStrands: weak, almostStrands: almost, plan };
}

/** Plain, kind sentences for the family message and the report viewers: what went well and what to practise (no scores). */
export function familyLines(c: LessonChecklist | null, unit?: UnitAssessment | null): string[] {
  const out: string[] = [];
  if (c && c.criteria.length) {
    const nailed = c.criteria.filter((x) => x.mark === 'nailed');
    const rest = c.criteria.filter((x) => x.mark !== 'nailed');
    out.push(`Lesson goals: ${nailed.length} of ${c.criteria.length} nailed.`);
    if (nailed.length) out.push(`Nailed it: ${nailed.map((x) => x.text).join(' ')}`);
    if (rest.length) out.push(`To practise: ${rest.map((x) => x.text).join(' ')}`);
  }
  if (unit) {
    const r = unitResult(unit);
    out.push(`Unit result: ${UNIT_VERDICT_LABEL[r.verdict === 'repeat' ? 'practise' : r.verdict]}.`); // families read kind wording; the teacher keeps the full verdict
    if (r.weakStrands.length) out.push(`Needs more practice: ${r.weakStrands.join(', ')}.`);
    else if (r.almostStrands.length) out.push(`Almost there: ${r.almostStrands.join(', ')}.`);
  }
  return out;
}
