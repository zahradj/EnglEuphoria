import type { VocabPolicy, GovernanceIssue, Slide } from '../types';
import { extractSlideText } from '../util/extractText';
import { tokenizeContentWords } from '../data/stopwords';
import { detectForbiddenCategories } from '../data/forbiddenCategoryLexicon';

/**
 * Two checks:
 *   1. Hard error if any forbidden-category lexicon hits the slide text.
 *   2. Warning if content-word coverage by target/support/recycled vocab is < 40%.
 */
export function validateVocab(slide: Slide, policy: VocabPolicy, slideIndex?: number): GovernanceIssue[] {
  const text = extractSlideText(slide);
  if (!text) return [];

  const issues: GovernanceIssue[] = [];

  // 1. Forbidden category drift — hard error.
  const hits = detectForbiddenCategories(text, policy.forbidden_vocab_categories || []);
  for (const h of hits) {
    issues.push({
      engine: 'vocab',
      severity: 'error',
      code: 'FORBIDDEN_VOCAB_CATEGORY',
      message: `Forbidden category "${h.category}" detected (e.g. ${h.hits.slice(0, 3).join(', ')}).`,
      slideIndex,
      detail: h,
    });
  }

  // 2. Coverage warning.
  const allowed = new Set(
    [...policy.target_vocab, ...policy.support_vocab, ...policy.recycled_vocab]
      .map((w) => w.toLowerCase().trim())
      .filter(Boolean),
  );
  if (allowed.size > 0) {
    const tokens = tokenizeContentWords(text);
    if (tokens.length >= 8) {
      const hits2 = tokens.filter((t) => allowed.has(t)).length;
      const coverage = hits2 / tokens.length;
      if (coverage < 0.25) {
        issues.push({
          engine: 'vocab',
          severity: 'warning',
          code: 'LOW_VOCAB_COVERAGE',
          message: `Only ${(coverage * 100).toFixed(0)}% of content words match the lesson vocabulary.`,
          slideIndex,
          detail: { coverage, sampleTokens: tokens.slice(0, 12) },
        });
      }
    }
  }

  return issues;
}
