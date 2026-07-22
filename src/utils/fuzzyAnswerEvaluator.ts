// Fuzzy answer evaluator — distilled from RoadWords StringEvaluator.
//
// Used by typed/spoken answer checking in drills, homework, and games.
// Tolerates light typos and ASR noise:
//   - exact match (case/punctuation-insensitive) → correct
//   - ≤1 edit on short words (≤4 chars), ≤2 edits on longer words → correct
//   - checks against a list of acceptable alternatives
//
// Returns the best match + edit distance so the UI can show "did you mean …?".

export interface FuzzyResult {
  isCorrect: boolean;
  closestMatch: string;
  distance: number;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s']/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export type HubKey = 'playground' | 'academy' | 'success';

interface EvaluateOpts {
  /** Hub register — controls how forgiving the matcher is.
   *  playground = generous (default behavior), academy = strict-ish, success = exact. */
  hub?: HubKey | string;
  /** Manual override; takes precedence over hub. */
  maxEdits?: number;
}

function thresholdFor(shortest: number, opts: EvaluateOpts): number {
  if (typeof opts.maxEdits === 'number') return Math.max(0, opts.maxEdits);
  switch (opts.hub) {
    case 'success':
      return 0; // adults: exact match required
    case 'academy':
      return shortest <= 4 ? 0 : 1; // teens: one typo tolerated on longer words
    case 'playground':
    default:
      return shortest <= 4 ? 1 : 2; // kids: forgiving
  }
}

export function evaluateAnswer(
  input: string,
  alternatives: string[],
  opts: EvaluateOpts = {},
): FuzzyResult {
  if (alternatives.length === 0) {
    return { isCorrect: false, closestMatch: '', distance: Infinity };
  }
  const normInput = norm(input);
  if (!normInput) {
    return { isCorrect: false, closestMatch: alternatives[0], distance: Infinity };
  }
  let best = alternatives[0];
  let bestDist = Infinity;
  for (const alt of alternatives) {
    const e = norm(alt);
    if (e === normInput) return { isCorrect: true, closestMatch: alt, distance: 0 };
    const d = levenshtein(normInput, e);
    if (d < bestDist) {
      bestDist = d;
      best = alt;
    }
  }
  const shortest = Math.min(...alternatives.map((a) => norm(a).length));
  const threshold = thresholdFor(shortest, opts);
  return { isCorrect: bestDist <= threshold, closestMatch: best, distance: bestDist };
}

export const isCloseAnswer = (
  input: string,
  expected: string,
  opts: EvaluateOpts = {},
) => evaluateAnswer(input, [expected], opts).isCorrect;
