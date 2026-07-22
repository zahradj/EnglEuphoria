import type { GrammarPolicy, GovernanceIssue, Slide } from '../types';
import { resolveGrammarLabel } from '../data/blockedGrammarPatterns';
import { extractSlideText } from '../util/extractText';

/**
 * Scans the slide text for grammar constructs explicitly blocked by the policy.
 * Hard error. Never flags constructs that are in target/review/exposure lists.
 */
export function validateGrammar(slide: Slide, policy: GrammarPolicy, slideIndex?: number): GovernanceIssue[] {
  const text = extractSlideText(slide);
  if (!text) return [];

  const allowed = new Set([
    ...policy.target_grammar,
    ...policy.review_grammar,
    ...policy.exposure_grammar,
  ].map((s) => s.trim().toLowerCase()));

  const issues: GovernanceIssue[] = [];
  for (const raw of policy.blocked_grammar) {
    if (allowed.has(raw.trim().toLowerCase())) continue; // policy conflict — ignore the block.
    const fp = resolveGrammarLabel(raw);
    if (!fp) continue;
    if (fp.pattern.test(text)) {
      issues.push({
        engine: 'grammar',
        severity: 'error',
        code: 'BLOCKED_GRAMMAR',
        message: `Blocked grammar "${fp.id}" appears in slide text.`,
        slideIndex,
        detail: { construct: fp.id },
      });
    }
  }
  return issues;
}
