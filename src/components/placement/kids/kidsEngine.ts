/**
 * Placement engine for the Playground (ages 4-9). Two separate abilities, each measured with its own short adaptive ladder:
 *   LISTENING  - understands spoken English (tap the picture): decides Pre-A1 / A1 / A2 for understanding.
 *   LITERACY   - letters, then words, then sentences: decides whether the child can read yet.
 * The level is then decided from both (a child who understands a lot but cannot read yet is Pre-A1 for the programme, with a
 * "strong listener" flag so the teacher can move them up quickly). Each ladder uses the same Bayesian ability estimate as the
 * Academy and Success tests, with a guessing allowance that fits THREE options (a third of pure guesses are right), stops on
 * precision or on a run of misses (the child has reached their ceiling), and never asks more than a child can sit through.
 */
import { estimateAbility, type AnswerRecord } from '../adaptiveEngine';
import type { KidsItem, KidsStage } from './kidsBank';

/** Item difficulty (0-1) on the shared ability scale (0.5 -> 0). */
export const toTheta = (difficulty: number): number => Math.max(-3, Math.min(3, (difficulty - 0.5) * 6));

export const PRIOR_SD_KIDS = 4;

export interface StageConfig {
  minItems: number;
  maxItems: number;
  /** Stop when the estimate's standard error is this small (after the minimum). */
  seTarget: number;
  /** Stop after this many wrong answers in a row (the ceiling), once at least `ceilingAfter` items were answered. */
  ceilingRun: number;
  ceilingAfter: number;
  startTheta: number;
  priorMean: number;
}

export const STAGE_CONFIG: Record<KidsStage, StageConfig> = {
  listen: { minItems: 10, maxItems: 20, seTarget: 0.5, ceilingRun: 6, ceilingAfter: 6, startTheta: -2.4, priorMean: -1.8 },
  literacy: { minItems: 6, maxItems: 14, seTarget: 0.55, ceilingRun: 5, ceilingAfter: 5, startTheta: -2.2, priorMean: -1.8 },
};

export interface StageState {
  stage: KidsStage;
  theta: number;
  se: number;
  responses: AnswerRecord[];
  answeredIds: string[];
  missRun: number;
  /** Correct answers in a row (two in a row make the next item a step harder, so a strong child is not held back). */
  streak: number;
  correctCount: number;
}

/** `listenTheta` (for the literacy ladder): a child who clearly understands English starts a little higher up the reading ladder. */
export function initStage(stage: KidsStage, listenTheta?: number): StageState {
  const c = STAGE_CONFIG[stage];
  let start = c.startTheta;
  if (stage === 'literacy' && listenTheta !== undefined) start = Math.max(c.startTheta, Math.min(-0.6, c.startTheta + Math.max(0, listenTheta + 1.2) * 0.8));
  return { stage, theta: start, se: 2.5, responses: [], answeredIds: [], missRun: 0, streak: 0, correctCount: 0 };
}

/** Chance of a lucky correct tap: 3 options -> about a third, 2 (tick/cross) -> a half. */
export const guessFloor = (item: KidsItem): number => (item.options.length <= 2 ? 0.5 : 0.3);

export function nextItem(bank: KidsItem[], state: StageState): KidsItem | null {
  const left = bank.filter((q) => q.stage === state.stage && !q.practice && !state.answeredIds.includes(q.id));
  if (left.length === 0) return null;
  let best = left[0];
  let bestDist = Infinity;
  // aim at the current estimate; two correct in a row aim a half-step higher
  const target = state.theta + (state.streak >= 2 ? 0.5 : 0);
  for (const q of left) {
    // closest to the target; on a tie prefer the easier item so a child is never thrown in too high
    const d = Math.abs(toTheta(q.difficulty) - target) + q.difficulty * 1e-3;
    if (d < bestDist) { bestDist = d; best = q; }
  }
  return best;
}

export interface KidsAnswerOptions {
  /** The child tapped "I don't know": counts as wrong with no guessing allowance. */
  unsure?: boolean;
  /** Tapped before Pip finished speaking, or implausibly fast: a correct tap earns reduced credit. */
  fast?: boolean;
}

export function applyAnswer(state: StageState, item: KidsItem, correct: boolean, opts: KidsAnswerOptions = {}): StageState {
  const ok = opts.unsure ? false : correct;
  const floor = opts.unsure ? 0 : opts.fast && ok ? 0.55 : guessFloor(item);
  const responses = [...state.responses, { d: toTheta(item.difficulty), correct: ok, floor }];
  // a wide prior: a child's few answers, not our starting guess, should decide the level
  const { theta: t, se } = estimateAbility(responses, STAGE_CONFIG[state.stage].priorMean, PRIOR_SD_KIDS);
  return {
    ...state,
    theta: t,
    se,
    responses,
    answeredIds: [...state.answeredIds, item.id],
    missRun: ok ? 0 : state.missRun + 1,
    streak: ok ? state.streak + 1 : 0,
    correctCount: state.correctCount + (ok ? 1 : 0),
  };
}

export function shouldStopStage(state: StageState, bank: KidsItem[]): boolean {
  const c = STAGE_CONFIG[state.stage];
  const n = state.answeredIds.length;
  const anyLeft = bank.some((q) => q.stage === state.stage && !q.practice && !state.answeredIds.includes(q.id));
  if (!anyLeft || n >= c.maxItems) return true;
  if (n >= c.ceilingAfter && state.missRun >= c.ceilingRun) return true;
  if (n >= c.minItems && state.se <= c.seTarget) return true;
  return false;
}

// ---------------------------------------------------------------- result
export type ListenBand = 'Pre-A1' | 'A1' | 'A2';
export type LiteracyStage = 'none' | 'letters' | 'words' | 'sentences';
export type KidsLevelName = 'Pre-A1' | 'A1' | 'A2';

/** Band edges on the theta scale (difficulty 0.30 and 0.55 for listening). */
export const LISTEN_CUTS = [toTheta(0.3), toTheta(0.55)];
/** Literacy edges: below ~0.25 no letters yet, below ~0.40 letters, below ~0.58 words, above that sentences. */
export const LITERACY_CUTS = [toTheta(0.25), toTheta(0.4), toTheta(0.58)];

export const listenBandOf = (t: number): ListenBand => (t < LISTEN_CUTS[0] ? 'Pre-A1' : t < LISTEN_CUTS[1] ? 'A1' : 'A2');
export const literacyStageOf = (t: number): LiteracyStage => (t < LITERACY_CUTS[0] ? 'none' : t < LITERACY_CUTS[1] ? 'letters' : t < LITERACY_CUTS[2] ? 'words' : 'sentences');

/** Final level from both abilities. A1 needs real understanding AND the first reading; A2 needs sentences too. */
export function placeChild(band: ListenBand, literacy: LiteracyStage): KidsLevelName {
  if (band === 'A2' && literacy === 'sentences') return 'A2';
  if (band !== 'Pre-A1' && (literacy === 'words' || literacy === 'sentences')) return 'A1';
  return 'Pre-A1';
}

export interface KidsSummary {
  cefr: KidsLevelName;
  /** Listening ability (theta) and its band. */
  theta: number;
  se: number;
  listenBand: ListenBand;
  literacyStage: LiteracyStage;
  literacyTheta: number;
  literacySe: number;
  itemsAnswered: number;
  /** Understands more than they can read yet: a quick move up once reading starts. */
  strongListener: boolean;
  /** Close to a boundary or too little evidence: the teacher confirms in lesson 1. */
  borderline: boolean;
  lowPrecision: boolean;
  unsureCount: number;
  fastCount: number;
}

const nearCut = (t: number, cuts: number[], width: number) => cuts.some((c) => Math.abs(t - c) <= width);

export function summarizeKids(listen: StageState, literacy: StageState, extra: { unsureCount?: number; fastCount?: number } = {}): KidsSummary {
  const band = listenBandOf(listen.theta);
  const lit = literacyStageOf(literacy.theta);
  const cefr = placeChild(band, lit);
  const strongListener = cefr === 'Pre-A1' && band !== 'Pre-A1';
  const borderline =
    nearCut(listen.theta, LISTEN_CUTS, Math.max(0.25, listen.se * 0.5)) ||
    (literacy.answeredIds.length > 0 && nearCut(literacy.theta, LITERACY_CUTS, Math.max(0.25, literacy.se * 0.5)));
  return {
    cefr,
    theta: Math.round(listen.theta * 100) / 100,
    se: Math.round(listen.se * 100) / 100,
    listenBand: band,
    literacyStage: lit,
    literacyTheta: Math.round(literacy.theta * 100) / 100,
    literacySe: Math.round(literacy.se * 100) / 100,
    itemsAnswered: listen.answeredIds.length + literacy.answeredIds.length,
    strongListener,
    borderline,
    lowPrecision: listen.se > STAGE_CONFIG.listen.seTarget,
    unsureCount: extra.unsureCount ?? 0,
    fastCount: extra.fastCount ?? 0,
  };
}
