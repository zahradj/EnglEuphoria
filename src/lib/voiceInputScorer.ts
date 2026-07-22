/**
 * Lightweight scorer for engine voice-input transcripts. Provides:
 *  - normalized text (lowercase, punctuation stripped)
 *  - word count
 *  - matchRatio vs expected string (0..1, token-overlap; Levenshtein-free for perf)
 *  - fluencyScore heuristic: 0..1 combining word count + coverage
 * All computations are pure — engines can consume via `engine:voice-scored`.
 */

export interface VoiceScore {
  raw: string;
  normalized: string;
  words: number;
  matchRatio: number;      // 0..1 vs expected (0 when no expected)
  fluencyScore: number;    // 0..1 heuristic
  correct: boolean;        // matchRatio >= 0.7 when expected present
  expected?: string;
}

export function normalizeText(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, " ").replace(/\s+/g, " ").trim();
}

export function scoreVoiceInput(raw: string, expected?: string): VoiceScore {
  const normalized = normalizeText(raw);
  const spoken = normalized ? normalized.split(" ") : [];
  const words = spoken.length;

  let matchRatio = 0;
  if (expected && expected.trim()) {
    const target = normalizeText(expected).split(" ").filter(Boolean);
    if (target.length) {
      const spokenSet = new Set(spoken);
      const hit = target.filter((t) => spokenSet.has(t)).length;
      matchRatio = hit / target.length;
    }
  }
  // Fluency: reward reasonable word counts (3–20), penalize noise.
  const wordScore = words === 0 ? 0 : Math.min(1, Math.max(0, (words - 1) / 8));
  const fluencyScore = expected
    ? 0.5 * matchRatio + 0.5 * wordScore
    : wordScore;

  return {
    raw,
    normalized,
    words,
    matchRatio: Number(matchRatio.toFixed(3)),
    fluencyScore: Number(fluencyScore.toFixed(3)),
    correct: Boolean(expected) && matchRatio >= 0.7,
    expected,
  };
}
