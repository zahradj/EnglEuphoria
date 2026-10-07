// Computerized-adaptive-testing (CAT) logic for the live placement test.
//
// What this does (and why it changed - see docs/placement-test-research.md):
//  - The ability estimate is a proper Bayesian one (EAP over a grid) built from EVERY answer so far, with a
//    guessing floor, instead of a running nudge. Its posterior spread is the real standard error (SE).
//  - The test stops on PRECISION (SE at or below the hub's target, after a minimum length), not just a count,
//    and has a hard maximum. The Academy runs 20-36 questions; one lucky guess can no longer decide a level.
//  - It starts low and climbs: the prior is centred between A1 and A2 (theta 0 = difficulty 0.5 = B1, so a
//    prior centred on 0 started students at B1 and skipped A1/A2).
//  - "I'm not sure" answers count as wrong WITHOUT a guessing allowance; implausibly fast answers get less credit.
import type { BankQuestion, Hub } from './questionBanks';
import { resolveScoreSkill } from './questionBanks';

export interface HubConfig {
  minItems: number;
  maxItems: number;
  /** Stop once the standard error (in theta units) is at or below this. */
  seTarget: number;
}

const HUB_CONFIG: Record<Hub, HubConfig> = {
  playground: { minItems: 8, maxItems: 15, seTarget: 0.55 },
  academy: { minItems: 20, maxItems: 36, seTarget: 0.45 },
  // The Success Hub gets its own redesign (longer, with listening, writing and speaking); until then it keeps the old length.
  professional: { minItems: 8, maxItems: 15, seTarget: 0.55 },
};

export const configFor = (hub: Hub): HubConfig => HUB_CONFIG[hub];
export const maxItemsFor = (hub: Hub): number => HUB_CONFIG[hub].maxItems;

/** Kept for callers that only need the old fixed numbers. */
export const MAX_ITEMS = 15;
export const MIN_ITEMS = 8;

/** Where selection starts (before any answer). theta = (difficulty - 0.5) * 6, so -2.1 is difficulty 0.15 = A1. */
export const START_THETA = -2.1;
/** Prior for the estimate: centred between A1 and A2, wide enough that a few answers move it anywhere. */
const PRIOR_MEAN = -1.2;
const PRIOR_SD = 2.5;
export const START_SE = PRIOR_SD;

/** Chance of a correct answer from guessing alone on a 4-option question. */
const GUESS_FLOOR = 0.2;
/** A correct answer that came implausibly fast earns only partial credit (it is likely a guess). */
const FAST_GUESS_FLOOR = 0.5;

const GRID_MIN = -4;
const GRID_MAX = 4;
const GRID_STEP = 0.05;
const GRID: number[] = Array.from({ length: Math.round((GRID_MAX - GRID_MIN) / GRID_STEP) + 1 }, (_, i) => GRID_MIN + i * GRID_STEP);

// Every skill a hub's radar tracks must get at least one answered item
// before the test is allowed to stop early.
const REQUIRED_SKILLS_BY_HUB: Record<Hub, string[]> = {
  playground: ['vocabulary', 'listening', 'grammar'],
  academy: ['vocabulary', 'listening', 'grammar', 'writing', 'speaking', 'reading'],
  professional: ['professional_vocabulary', 'listening', 'grammar_accuracy', 'business_writing', 'fluency', 'reading'],
};

/** Items are authored so `difficulty` (0-1) tracks CEFR level; map it onto a -3..3 scale. */
export function itemTheta(q: BankQuestion): number {
  return Math.max(-3, Math.min(3, (q.difficulty - 0.5) * 6));
}

export interface AnswerRecord {
  /** Item difficulty on the theta scale. */
  d: number;
  correct: boolean;
  /** Guessing floor that applies to this answer (0 for "I'm not sure"). */
  floor: number;
}

export interface AdaptiveState {
  /** Current ability estimate (posterior mean). */
  theta: number;
  /** Real standard error (posterior spread). */
  se: number;
  answeredIdx: Set<number>;
  thetaHistory: number[];
  skillCounts: Record<string, number>;
  /** Becomes true on the first wrong answer: nobody stops on an unbroken streak before their ceiling is found. */
  hasIncorrect: boolean;
  responses: AnswerRecord[];
}

export function initAdaptiveState(): AdaptiveState {
  return {
    theta: START_THETA,
    se: START_SE,
    answeredIdx: new Set(),
    thetaHistory: [],
    skillCounts: {},
    hasIncorrect: false,
    responses: [],
  };
}

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

/** Posterior mean and spread of ability given the answers so far. */
export function estimateAbility(responses: AnswerRecord[]): { theta: number; se: number } {
  const logPost = GRID.map((t) => {
    let lp = -0.5 * ((t - PRIOR_MEAN) / PRIOR_SD) ** 2;
    for (const r of responses) {
      const p = r.floor + (1 - r.floor) * sigmoid(t - r.d);
      lp += Math.log(Math.max(1e-9, r.correct ? p : 1 - p));
    }
    return lp;
  });
  const max = Math.max(...logPost);
  const w = logPost.map((lp) => Math.exp(lp - max));
  let wSum = 0;
  let mSum = 0;
  for (let i = 0; i < GRID.length; i++) {
    wSum += w[i];
    mSum += w[i] * GRID[i];
  }
  const mean = mSum / wSum;
  let vSum = 0;
  for (let i = 0; i < GRID.length; i++) vSum += w[i] * (GRID[i] - mean) ** 2;
  return { theta: mean, se: Math.sqrt(vSum / wSum) };
}

/** Picks the next item: while any required skill is still uncovered, choose only from those skills
 *  (coverage-first); otherwise the remaining item whose difficulty is closest to the current estimate
 *  (the most informative one), lightly penalising skills already over-sampled. */
export function nextAdaptiveItem(
  pool: BankQuestion[],
  hub: Hub,
  state: AdaptiveState,
): { item: BankQuestion; index: number } | null {
  const requiredSkills = REQUIRED_SKILLS_BY_HUB[hub] ?? [];
  const uncoveredRequired = requiredSkills.filter((s) => !state.skillCounts[s]);

  const candidates = pool
    .map((q, index) => ({ q, index }))
    .filter(({ index }) => !state.answeredIdx.has(index));
  if (candidates.length === 0) return null;

  let scoped = candidates;
  if (uncoveredRequired.length > 0) {
    // Only force coverage once the estimate has had a few answers to settle, so the first questions stay on level.
    const forceNow = state.answeredIdx.size >= 3;
    const restricted = candidates.filter(({ q }) => uncoveredRequired.includes(resolveScoreSkill(q, hub)));
    if (forceNow && restricted.length > 0) scoped = restricted;
  }

  let best = scoped[0];
  let bestScore = Infinity;
  for (const c of scoped) {
    const dist = Math.abs(itemTheta(c.q) - state.theta);
    const skill = resolveScoreSkill(c.q, hub);
    const skillPenalty = (state.skillCounts[skill] ?? 0) * 0.05;
    const score = dist + skillPenalty;
    if (score < bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return { item: best.q, index: best.index };
}

export interface AnswerOptions {
  /** The student pressed "I'm not sure": counted as wrong, with no guessing allowance. */
  unsure?: boolean;
  /** The answer came implausibly fast for the item: a correct answer earns reduced credit. */
  fast?: boolean;
}

/** Updates the estimate after an answer. */
export function applyAdaptiveAnswer(
  state: AdaptiveState,
  item: BankQuestion,
  index: number,
  hub: Hub,
  isCorrect: boolean,
  options: AnswerOptions = {},
): AdaptiveState {
  const correct = options.unsure ? false : isCorrect;
  const floor = options.unsure ? 0 : options.fast && correct ? FAST_GUESS_FLOOR : GUESS_FLOOR;
  const responses = [...state.responses, { d: itemTheta(item), correct, floor }];
  const { theta, se } = estimateAbility(responses);
  const skill = resolveScoreSkill(item, hub);

  const answeredIdx = new Set(state.answeredIdx);
  answeredIdx.add(index);
  return {
    theta,
    se,
    answeredIdx,
    thetaHistory: [...state.thetaHistory, theta].slice(-3),
    skillCounts: { ...state.skillCounts, [skill]: (state.skillCounts[skill] ?? 0) + 1 },
    hasIncorrect: state.hasIncorrect || !correct,
    responses,
  };
}

/** Stop once the minimum length is met, every required skill has been sampled, the student has missed
 *  something (so a ceiling was found) and the estimate is precise enough - or at the hard maximum. */
export function shouldStopAdaptive(state: AdaptiveState, hub: Hub): boolean {
  const cfg = HUB_CONFIG[hub];
  const answered = state.answeredIdx.size;
  if (answered >= cfg.maxItems) return true;
  if (answered < cfg.minItems) return false;
  if (!state.hasIncorrect) return false;

  const requiredSkills = REQUIRED_SKILLS_BY_HUB[hub] ?? [];
  if (!requiredSkills.every((s) => (state.skillCounts[s] ?? 0) > 0)) return false;

  return state.se <= cfg.seTarget;
}

export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
const LEVELS: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
/** Boundaries between A1|A2, A2|B1, B1|B2, B2|C1 on the theta scale: the band edges of the item difficulty scale
 *  (A1 up to 0.25, A2 to 0.50, B1 to 0.68, B2 to 0.85), so a student is placed at the level whose items they
 *  get right about half the time. */
const CUT_POINTS = [-1.5, 0, 1.08, 2.1];

export function thetaToCefr(theta: number): Cefr {
  let i = 0;
  while (i < CUT_POINTS.length && theta >= CUT_POINTS[i]) i++;
  return LEVELS[i];
}

export interface PlacementSummary {
  theta: number;
  se: number;
  cefr: Cefr;
  itemsAnswered: number;
  /** The test ended at its maximum length without reaching the precision target. */
  lowPrecision: boolean;
  /** The estimate sits close to a level boundary: confirm in lesson 1. */
  borderline: boolean;
  /** The neighbouring level it could equally be, when borderline. */
  alternative?: Cefr;
  notSureCount: number;
  fastCount: number;
}

export function summarizeAdaptive(
  state: AdaptiveState,
  hub: Hub,
  extra: { notSureCount?: number; fastCount?: number } = {},
): PlacementSummary {
  const cfg = HUB_CONFIG[hub];
  const cefr = thetaToCefr(state.theta);
  let nearest = 0;
  for (let i = 1; i < CUT_POINTS.length; i++) {
    if (Math.abs(state.theta - CUT_POINTS[i]) < Math.abs(state.theta - CUT_POINTS[nearest])) nearest = i;
  }
  const distance = Math.abs(state.theta - CUT_POINTS[nearest]);
  const borderline = distance <= Math.max(0.2, state.se * 0.5);
  // Levels LEVELS[nearest] (below the cut) and LEVELS[nearest + 1] (above it).
  const alternative = borderline ? (cefr === LEVELS[nearest] ? LEVELS[nearest + 1] : LEVELS[nearest]) : undefined;
  return {
    theta: Math.round(state.theta * 100) / 100,
    se: Math.round(state.se * 100) / 100,
    cefr,
    itemsAnswered: state.answeredIdx.size,
    lowPrecision: state.se > cfg.seTarget,
    borderline,
    alternative,
    notSureCount: extra.notSureCount ?? 0,
    fastCount: extra.fastCount ?? 0,
  };
}

/** A random order for showing an item's options (Fisher-Yates). The bank's correct answers are not evenly spread
 *  across positions, so showing options in bank order would let a test-wise student pick by position. */
export function shuffledOrder(n: number, rand: () => number = Math.random): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
