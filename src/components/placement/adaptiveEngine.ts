// Computerized-adaptive-testing (CAT) logic for the live placement test.
// Replaces a fixed 15-question array with question-by-question selection
// driven by a running ability estimate (theta), so:
//   - a weak student who is clearly struggling can stop once their level is
//     confidently pinned down, instead of being forced through 15 items;
//   - a capable student keeps climbing to harder items (up to MAX_ITEMS) as
//     long as their true ceiling hasn't been found yet.
// MIN_ITEMS is a floor: nobody stops before it, regardless of how one-sided
// their answers look, so a lucky/unlucky early streak can't end the test on
// too little evidence.
import type { BankQuestion, Hub } from './questionBanks';
import { resolveScoreSkill } from './questionBanks';

export const MAX_ITEMS = 15;
export const MIN_ITEMS = 8;
const SE_TARGET = 0.45;
const STABLE_RUN = 3;
const STABLE_BAND = 0.15;
const START_SE = 1.5;
const MIN_SE = 0.3;
const SE_DECAY = 0.85;

// Every skill a hub's radar tracks must get at least one answered item
// before the test is allowed to stop early — otherwise a skill would fall
// back to a copied overall score instead of a real measurement.
const REQUIRED_SKILLS_BY_HUB: Record<Hub, string[]> = {
  playground: ['vocabulary', 'listening', 'grammar'],
  academy: ['vocabulary', 'listening', 'grammar', 'writing', 'speaking', 'reading'],
  professional: ['professional_vocabulary', 'listening', 'grammar_accuracy', 'business_writing', 'fluency', 'reading'],
};

/** Items are already curated so `difficulty` (0-1) tracks CEFR level; map it
 *  onto a -3..3 theta scale so item difficulty and student ability share one
 *  axis without needing a second per-item calibration pass. */
function itemTheta(q: BankQuestion): number {
  return Math.max(-3, Math.min(3, (q.difficulty - 0.5) * 6));
}

export interface AdaptiveState {
  theta: number;
  se: number;
  answeredIdx: Set<number>;
  thetaHistory: number[];
  skillCounts: Record<string, number>;
  /** Becomes true on the first wrong answer. Gates every early-stop path: a
   *  student on an unbroken correct streak hasn't had their ceiling found
   *  yet, so they must keep climbing toward harder items (up to MAX_ITEMS)
   *  instead of being cut off at the floor just because item count and se
   *  happened to cross a threshold. A struggling student naturally answers
   *  something wrong almost immediately, so this never delays their
   *  early-stop in practice. */
  hasIncorrect: boolean;
}

export function initAdaptiveState(): AdaptiveState {
  return { theta: 0, se: START_SE, answeredIdx: new Set(), thetaHistory: [], skillCounts: {}, hasIncorrect: false };
}

/** Picks the next item: while any required skill is still uncovered, choose
 *  only from those skills (coverage-first); otherwise pick whichever
 *  remaining item's difficulty is closest to the current ability estimate,
 *  lightly penalizing skills already over-sampled. */
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
  const itemsLeftInBudget = MAX_ITEMS - state.answeredIdx.size;
  if (uncoveredRequired.length > 0 && uncoveredRequired.length >= itemsLeftInBudget - 1) {
    // Running out of budget to cover every required skill — force coverage.
    const restricted = candidates.filter(({ q }) => uncoveredRequired.includes(resolveScoreSkill(q, hub)));
    if (restricted.length > 0) scoped = restricted;
  } else if (uncoveredRequired.length > 0) {
    const restricted = candidates.filter(({ q }) => uncoveredRequired.includes(resolveScoreSkill(q, hub)));
    if (restricted.length > 0) scoped = restricted;
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

/** Updates the ability estimate after an answer using a simple 1-parameter
 *  logistic update: move theta toward the item's difficulty by an amount
 *  proportional to the surprise (actual vs. expected correctness) and the
 *  current uncertainty, then shrink the uncertainty (se) a notch. */
export function applyAdaptiveAnswer(
  state: AdaptiveState,
  item: BankQuestion,
  index: number,
  hub: Hub,
  isCorrect: boolean,
): AdaptiveState {
  const d = itemTheta(item);
  const p = 1 / (1 + Math.exp(-(state.theta - d)));
  const error = (isCorrect ? 1 : 0) - p;
  const k = Math.max(0.3, state.se);
  const theta = Math.max(-3, Math.min(3, state.theta + k * error));
  const se = Math.max(MIN_SE, state.se * SE_DECAY);
  const skill = resolveScoreSkill(item, hub);

  const answeredIdx = new Set(state.answeredIdx);
  answeredIdx.add(index);
  const thetaHistory = [...state.thetaHistory, theta].slice(-STABLE_RUN);
  const skillCounts = { ...state.skillCounts, [skill]: (state.skillCounts[skill] ?? 0) + 1 };
  const hasIncorrect = state.hasIncorrect || !isCorrect;

  return { theta, se, answeredIdx, thetaHistory, skillCounts, hasIncorrect };
}

/** Stop once the floor is met, every required skill has been sampled, and
 *  either the estimate is precise enough (se below target) or the last few
 *  theta updates have settled into a narrow band — whichever comes first —
 *  or once MAX_ITEMS is reached regardless.
 *
 *  Early-stop additionally requires at least one wrong answer. Without that,
 *  a student on an unbroken correct streak would still get cut off right at
 *  the floor purely because item count and se cross their thresholds on a
 *  fixed schedule — se decays the same way regardless of correctness, so it
 *  can't by itself tell "confidently placed" apart from "still climbing
 *  toward an undiscovered ceiling." Requiring a miss first means capable
 *  students keep receiving harder items up to MAX_ITEMS until we actually
 *  find where they falter, while a struggling student (who misses almost
 *  immediately) is barely affected. */
export function shouldStopAdaptive(state: AdaptiveState, hub: Hub): boolean {
  const answeredCount = state.answeredIdx.size;
  if (answeredCount >= MAX_ITEMS) return true;
  if (answeredCount < MIN_ITEMS) return false;
  if (!state.hasIncorrect) return false;

  const requiredSkills = REQUIRED_SKILLS_BY_HUB[hub] ?? [];
  const allSkillsCovered = requiredSkills.every((s) => (state.skillCounts[s] ?? 0) > 0);
  if (!allSkillsCovered) return false;

  if (state.se <= SE_TARGET) return true;

  if (state.thetaHistory.length >= STABLE_RUN) {
    const recent = state.thetaHistory.slice(-STABLE_RUN);
    const spread = Math.max(...recent) - Math.min(...recent);
    if (spread <= STABLE_BAND) return true;
  }
  return false;
}

export function thetaToCefr(theta: number): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' {
  if (theta < -1.8) return 'A1';
  if (theta < -0.6) return 'A2';
  if (theta < 0.6) return 'B1';
  if (theta < 1.8) return 'B2';
  return 'C1';
}
