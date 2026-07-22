import type { LessonState, GovernanceIssue, Slide } from '../types';
import { extractSlideText, splitSentences, countWords, countClauses, syllables } from '../util/extractText';
import { effectiveCaps, HUB_BANNED_REGISTERS } from '../data/cefrCaps';
import { GRAMMAR_FINGERPRINTS } from '../data/blockedGrammarPatterns';
import { detectForbiddenCategories } from '../data/forbiddenCategoryLexicon';

/**
 * Enforces sentence length, clause depth, syllable cap, banned-construct list per CEFR,
 * and hub-banned register checks.
 */
export function validateCEFR(slide: Slide, state: LessonState, slideIndex?: number): GovernanceIssue[] {
  const text = extractSlideText(slide);
  if (!text) return [];

  const caps = effectiveCaps(state.cefr, state.hub);
  const issues: GovernanceIssue[] = [];

  for (const sentence of splitSentences(text)) {
    const wc = countWords(sentence);
    if (wc > caps.maxSentenceWords) {
      issues.push({
        engine: 'cefr',
        severity: 'warning',
        code: 'SENTENCE_TOO_LONG',
        message: `Sentence has ${wc} words (cap ${caps.maxSentenceWords} for ${state.cefr} ${state.hub}).`,
        slideIndex,
        detail: { sentence: sentence.slice(0, 120) },
      });
    }
    const cc = countClauses(sentence);
    if (cc > caps.maxClausesPerSentence) {
      issues.push({
        engine: 'cefr',
        severity: 'warning',
        code: 'TOO_MANY_CLAUSES',
        message: `Sentence has ~${cc} clauses (cap ${caps.maxClausesPerSentence}).`,
        slideIndex,
      });
    }
    for (const w of sentence.split(/\s+/)) {
      if (syllables(w) > caps.maxSyllablesPerWord) {
        issues.push({
          engine: 'cefr',
          severity: 'warning',
          code: 'WORD_TOO_COMPLEX',
          message: `Word "${w}" exceeds ${caps.maxSyllablesPerWord} syllables.`,
          slideIndex,
        });
        break; // one per sentence is enough
      }
    }
  }

  // Banned constructs above level — hard error.
  for (const fpId of caps.bannedConstructs) {
    const fp = GRAMMAR_FINGERPRINTS.find((g) => g.id === fpId);
    if (!fp) continue;
    if (fp.pattern.test(text)) {
      issues.push({
        engine: 'cefr',
        severity: 'error',
        code: 'GRAMMAR_ABOVE_LEVEL',
        message: `${fp.id} is above ${state.cefr} (hub: ${state.hub}).`,
        slideIndex,
      });
    }
  }

  // Hub-banned register check.
  const regHits = detectForbiddenCategories(text, HUB_BANNED_REGISTERS[state.hub]);
  for (const h of regHits) {
    issues.push({
      engine: 'cefr',
      severity: 'error',
      code: 'HUB_REGISTER_VIOLATION',
      message: `Register "${h.category}" is forbidden in ${state.hub} hub (e.g. ${h.hits.slice(0, 3).join(', ')}).`,
      slideIndex,
      detail: h,
    });
  }

  return issues;
}
