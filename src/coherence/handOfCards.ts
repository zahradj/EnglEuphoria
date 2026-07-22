// Hand-of-Cards drill engine — distilled from RoadWords (telytec/roadwords).
//
// Why: SM-2 is great for long-term retention but too slow for a single homework
// or in-lesson drill round. Hand-of-Cards is a circular-flow engine that picks
// the next item from a small "hand" of 6 cards using:
//   1. recognition (receptive) BEFORE production (expressive)
//   2. weighted urgency (remaining work × time since last seen)
//   3. failure cooldown (don't immediately re-ask a missed word)
//   4. graduation thresholds (3 recognition + 2 production = mastered)
//
// Use this for: homework drill rounds, in-lesson vocab mini-drills, and the
// retry loop inside cast-chat-quest / arcade rounds. NOT a replacement for
// the SM-2+ memory scheduler in src/memory/.

export type Direction = 'receptive' | 'expressive';

export interface CardProgress {
  key: string;                  // vocab key / skill_key
  receptiveLevel: number;       // 0..RECEPTIVE_THRESHOLD
  expressiveLevel: number;      // 0..EXPRESSIVE_THRESHOLD
  streak: number;
  totalReviews: number;
  lastSeenTurn: number;
  lastFailedTurn: number;       // -∞ initially
}

export const RECEPTIVE_THRESHOLD = 3;
export const EXPRESSIVE_THRESHOLD = 2;
export const ROUND_SIZE = 6;
export const FAILURE_COOLDOWN_TURNS = 2;
export const MIN_TURNS_BETWEEN_REPEATS = 2;
export const REVIEW_CHANCE = 0.1;

// Hub-aware tuning. Playground stays gentle; Academy / Success demand more.
export type HubKey = 'playground' | 'academy' | 'success';

export interface HandConfig {
  roundSize: number;
  receptiveThreshold: number;
  expressiveThreshold: number;
  failureCooldownTurns: number;
  minTurnsBetweenRepeats: number;
  reviewChance: number;
  /** Fraction of receptive mastery required before production is even sampled. */
  productionUnlockFloor: number;
}

export const HUB_HAND_CONFIG: Record<HubKey, HandConfig> = {
  playground: {
    roundSize: 6,
    receptiveThreshold: 3,
    expressiveThreshold: 2,
    failureCooldownTurns: 2,
    minTurnsBetweenRepeats: 2,
    reviewChance: 0.1,
    productionUnlockFloor: 0.34,
  },
  academy: {
    roundSize: 8,
    receptiveThreshold: 3,
    expressiveThreshold: 3,
    failureCooldownTurns: 2,
    minTurnsBetweenRepeats: 2,
    reviewChance: 0.15,
    productionUnlockFloor: 0.5,
  },
  success: {
    roundSize: 10,
    receptiveThreshold: 2,        // adults absorb form faster
    expressiveThreshold: 4,        // but must demonstrate production more
    failureCooldownTurns: 1,
    minTurnsBetweenRepeats: 3,
    reviewChance: 0.2,
    productionUnlockFloor: 0.6,
  },
};

export function getHandConfig(hub: HubKey | string | undefined): HandConfig {
  return HUB_HAND_CONFIG[(hub as HubKey) ?? 'playground'] ?? HUB_HAND_CONFIG.playground;
}

export function newCard(key: string): CardProgress {
  return {
    key,
    receptiveLevel: 0,
    expressiveLevel: 0,
    streak: 0,
    totalReviews: 0,
    lastSeenTurn: -100,
    lastFailedTurn: -100,
  };
}

export function isLearned(c: CardProgress): boolean {
  return c.receptiveLevel >= RECEPTIVE_THRESHOLD && c.expressiveLevel >= EXPRESSIVE_THRESHOLD;
}

/** Pick which testing direction to use for a card. */
export function getDirection(c: CardProgress): Direction {
  const rRem = Math.max(0, RECEPTIVE_THRESHOLD - c.receptiveLevel);
  const eRem = Math.max(0, EXPRESSIVE_THRESHOLD - c.expressiveLevel);

  if (rRem === 0 && eRem === 0) return Math.random() < 0.5 ? 'receptive' : 'expressive';
  if (c.totalReviews === 0 || c.receptiveLevel === 0) return 'receptive';
  if (rRem > 0 && eRem === 0) return 'receptive';
  if (rRem === 0 && eRem > 0) return 'expressive';

  // production unlocks proportionally to recognition mastery
  const productionUnlock = c.receptiveLevel / RECEPTIVE_THRESHOLD;
  const rW = rRem;
  const eW = eRem * productionUnlock;
  return Math.random() * (rW + eW) < rW ? 'receptive' : 'expressive';
}

/** Pick the next card from the active hand. Higher weight = more urgent. */
export function pickNextCard(hand: CardProgress[], turn: number): CardProgress | null {
  const eligible = hand.filter(
    (c) =>
      turn - c.lastSeenTurn >= MIN_TURNS_BETWEEN_REPEATS &&
      turn - c.lastFailedTurn >= FAILURE_COOLDOWN_TURNS,
  );
  const pool = eligible.length > 0 ? eligible : hand;

  const weights = pool.map((c) => {
    const remaining =
      Math.max(0, RECEPTIVE_THRESHOLD - c.receptiveLevel) +
      Math.max(0, EXPRESSIVE_THRESHOLD - c.expressiveLevel);
    const staleness = turn - c.lastSeenTurn;
    const base = isLearned(c) ? REVIEW_CHANCE : 1;
    return base * (remaining + 1) * Math.min(staleness, 6);
  });

  const total = weights.reduce((s, w) => s + w, 0);
  if (total <= 0) return pool[0] ?? null;
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export function applyCorrect(c: CardProgress, dir: Direction, turn: number): CardProgress {
  return {
    ...c,
    receptiveLevel:
      dir === 'receptive' ? Math.min(RECEPTIVE_THRESHOLD, c.receptiveLevel + 1) : c.receptiveLevel,
    expressiveLevel:
      dir === 'expressive'
        ? Math.min(EXPRESSIVE_THRESHOLD, c.expressiveLevel + 1)
        : c.expressiveLevel,
    streak: c.streak + 1,
    totalReviews: c.totalReviews + 1,
    lastSeenTurn: turn,
    lastFailedTurn: -100,
  };
}

export function applyFail(c: CardProgress, dir: Direction, turn: number): CardProgress {
  return {
    ...c,
    receptiveLevel: dir === 'receptive' ? Math.max(0, c.receptiveLevel - 1) : c.receptiveLevel,
    expressiveLevel: dir === 'expressive' ? Math.max(0, c.expressiveLevel - 1) : c.expressiveLevel,
    streak: 0,
    totalReviews: c.totalReviews + 1,
    lastSeenTurn: turn,
    lastFailedTurn: turn,
  };
}

/** Build an opening hand of up to ROUND_SIZE cards from candidate keys. */
export function buildHand(keys: string[]): CardProgress[] {
  return keys.slice(0, ROUND_SIZE).map(newCard);
}

/** Hub-aware variant — preferred for new code. */
export function buildHandForHub(keys: string[], hub: HubKey | string | undefined): CardProgress[] {
  const cfg = getHandConfig(hub);
  return keys.slice(0, cfg.roundSize).map(newCard);
}

/** Hub-aware mastery check. */
export function isLearnedForHub(c: CardProgress, hub: HubKey | string | undefined): boolean {
  const cfg = getHandConfig(hub);
  return c.receptiveLevel >= cfg.receptiveThreshold && c.expressiveLevel >= cfg.expressiveThreshold;
}
