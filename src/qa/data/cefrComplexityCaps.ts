import type { CEFR } from '../types';

export interface CEFRComplexityCap {
  max_sentence_words: number;
  max_clauses_per_sentence: number;
  max_avg_word_length: number;
  flesch_kincaid_max: number;
  forbidden_tense_keywords: string[]; // surface markers, not exhaustive
}

export const CEFR_COMPLEXITY_CAPS: Record<CEFR, CEFRComplexityCap> = {
  'Pre-A1': {
    max_sentence_words: 6,
    max_clauses_per_sentence: 1,
    max_avg_word_length: 4.5,
    flesch_kincaid_max: 2,
    forbidden_tense_keywords: ['had been', 'would have', 'could have', 'might have'],
  },
  A1: {
    max_sentence_words: 10,
    max_clauses_per_sentence: 1,
    max_avg_word_length: 5,
    flesch_kincaid_max: 3,
    forbidden_tense_keywords: ['had been', 'would have', 'could have', 'might have'],
  },
  A2: {
    max_sentence_words: 14,
    max_clauses_per_sentence: 2,
    max_avg_word_length: 5.5,
    flesch_kincaid_max: 5,
    forbidden_tense_keywords: ['had been', 'would have been'],
  },
  B1: {
    max_sentence_words: 20,
    max_clauses_per_sentence: 3,
    max_avg_word_length: 6,
    flesch_kincaid_max: 7,
    forbidden_tense_keywords: [],
  },
  B2: {
    max_sentence_words: 26,
    max_clauses_per_sentence: 4,
    max_avg_word_length: 6.5,
    flesch_kincaid_max: 10,
    forbidden_tense_keywords: [],
  },
  C1: {
    max_sentence_words: 34,
    max_clauses_per_sentence: 5,
    max_avg_word_length: 7,
    flesch_kincaid_max: 13,
    forbidden_tense_keywords: [],
  },
};
