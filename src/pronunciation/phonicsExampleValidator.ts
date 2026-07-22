// Phonics example validator — enforces a per-pattern allowlist so invalid
// instructional examples (e.g. "clue" tagged as Silent E) cannot ship.

export type PhonicsPatternKey =
  | 'silent_e'         // VCe: cake, kite, bone
  | 'short_vowel'      // CVC: cat, hen
  | 'long_vowel_team'  // ai, ee, oa
  | 'digraph_ch'
  | 'digraph_sh'
  | 'digraph_th'
  | 'r_controlled';

export interface PhonicsValidationIssue {
  code: 'PHONICS_EXAMPLE_INVALID' | 'PHONICS_PATTERN_UNKNOWN';
  severity: 'block' | 'warn';
  message: string;
  pattern?: string;
  word?: string;
}

const PATTERN_RX: Record<PhonicsPatternKey, RegExp> = {
  // VCe: consonant(s) + single vowel + single consonant (not r/w/x) + final e
  silent_e: /^[bcdfghjklmnpqrstvwz]+[aeiou][bcdfghjklmnpqstvz]e$/i,
  short_vowel: /^[bcdfghjklmnpqrstvwxyz]?[aeiou][bcdfghjklmnpqrstvwxyz]$/i,
  long_vowel_team: /(ai|ee|oa|ea|ie|ue|oo)/i,
  digraph_ch: /ch/i,
  digraph_sh: /sh/i,
  digraph_th: /th/i,
  r_controlled: /(ar|er|ir|or|ur)/i,
};

const HARD_NEGATIVES: Partial<Record<PhonicsPatternKey, RegExp>> = {
  // "clue" is a u-e team, NOT VCe Silent-E
  silent_e: /(ue|ie|oe|ae)$/i,
};

export function validatePhonicsExample(opts: {
  pattern: string;
  word: string;
}): PhonicsValidationIssue[] {
  const issues: PhonicsValidationIssue[] = [];
  const key = normalize(opts.pattern);
  const word = opts.word.trim().toLowerCase();

  const rx = PATTERN_RX[key as PhonicsPatternKey];
  if (!rx) {
    issues.push({
      code: 'PHONICS_PATTERN_UNKNOWN',
      severity: 'warn',
      message: `Unknown phonics pattern key "${opts.pattern}".`,
      pattern: opts.pattern,
      word,
    });
    return issues;
  }

  const neg = HARD_NEGATIVES[key as PhonicsPatternKey];
  if (neg && neg.test(word)) {
    issues.push({
      code: 'PHONICS_EXAMPLE_INVALID',
      severity: 'block',
      message: `"${word}" is not a valid example for ${key} (matches an exclusion pattern).`,
      pattern: opts.pattern,
      word,
    });
    return issues;
  }

  if (!rx.test(word)) {
    issues.push({
      code: 'PHONICS_EXAMPLE_INVALID',
      severity: 'block',
      message: `"${word}" does not match the ${key} pattern.`,
      pattern: opts.pattern,
      word,
    });
  }
  return issues;
}

function normalize(p: string): string {
  return p.toLowerCase().replace(/[\s-]+/g, '_');
}

/** Convenience: validate an array of {pattern, word} pairs. */
export function validatePhonicsExampleSet(
  items: Array<{ pattern: string; word: string }>,
): PhonicsValidationIssue[] {
  return items.flatMap((i) => validatePhonicsExample(i));
}
