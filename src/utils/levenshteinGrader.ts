/**
 * Normalise a string for comparison: lowercase, strip punctuation, collapse whitespace.
 */
function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compute Levenshtein distance between two strings.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export interface WordResult {
  word: string;
  correct: boolean;
}

export interface GradeResult {
  accuracy: number; // 0-100
  wordResults: WordResult[];
  label: string;
  emoji: string;
}

/**
 * Grade a student's spoken transcript against a target phrase.
 * Returns per-word correct/incorrect plus an overall accuracy %.
 */
export function gradeShadowing(target: string, spoken: string): GradeResult {
  const targetWords = normalise(target).split(' ').filter(Boolean);
  const spokenWords = normalise(spoken).split(' ').filter(Boolean);

  if (targetWords.length === 0) {
    return { accuracy: 0, wordResults: [], label: 'No target phrase', emoji: '❓' };
  }

  if (spokenWords.length === 0) {
    return {
      accuracy: 0,
      wordResults: targetWords.map((w) => ({ word: w, correct: false })),
      label: 'No speech detected',
      emoji: '🔇',
    };
  }

  // Match each target word to the closest spoken word (greedy left-to-right)
  let spokenIdx = 0;
  const wordResults: WordResult[] = targetWords.map((tw) => {
    // Look ahead up to 3 spoken words for a fuzzy match
    let bestDist = Infinity;
    let bestOffset = 0;
    for (let look = 0; look < 3 && spokenIdx + look < spokenWords.length; look++) {
      const d = levenshtein(tw, spokenWords[spokenIdx + look]);
      if (d < bestDist) {
        bestDist = d;
        bestOffset = look;
      }
    }
    const threshold = Math.max(1, Math.floor(tw.length * 0.35));
    const correct = bestDist <= threshold;
    if (bestDist <= threshold + 1) {
      spokenIdx += bestOffset + 1;
    }
    return { word: tw, correct };
  });

  const correctCount = wordResults.filter((w) => w.correct).length;
  const accuracy = Math.round((correctCount / targetWords.length) * 100);

  let label: string;
  let emoji: string;
  if (accuracy >= 90) { label = 'Native Accuracy!'; emoji = '🎯'; }
  else if (accuracy >= 70) { label = 'Great Effort!'; emoji = '👏'; }
  else if (accuracy >= 50) { label = 'Keep Practicing!'; emoji = '💪'; }
  else { label = 'Try Again'; emoji = '🔄'; }

  return { accuracy, wordResults, label, emoji };
}
