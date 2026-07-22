import type { ErrorPattern } from '../types';

export interface RawMistake {
  pattern_key: string;
  raw_text: string;
  expected?: string;
  domain?: 'grammar' | 'vocabulary' | 'pronunciation';
  occurred_at: string;
}

export function classifyMistake(raw: RawMistake): ErrorPattern['category'] {
  const t = raw.raw_text.toLowerCase();
  if (raw.domain === 'pronunciation') {
    if (/stress|syllab/i.test(raw.pattern_key)) return 'word_stress';
    return 'pronunciation_substitution';
  }
  if (raw.expected && raw.raw_text.length < raw.expected.length - 2) return 'omission';
  if (/\b(goed|comed|buyed|teached)\b/.test(t)) return 'overgeneralization';
  if (raw.expected && raw.raw_text.length > 0) return 'substitution';
  return 'l1_interference';
}
