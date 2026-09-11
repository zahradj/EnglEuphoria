import type { DomainCompetencyResult, TaggedQuizAnswer } from './types';
import { DOMAIN_ANY_FAIL_TRIGGERS, DOMAIN_FAIL_FRACTION_THRESHOLD } from './constants';

/**
 * Splits a domain-prefixed competency tag (`grammar:present_perfect`) into
 * its domain (`grammar`) and specific competency (`present_perfect`).
 * Returns null for a tag with no `:` — those can't be grouped by domain, so
 * `evaluateDomainCompetencies` skips them entirely rather than guessing.
 */
export function parseDomainTag(tag: string): { domain: string; competency: string } | null {
  const idx = tag.indexOf(':');
  if (idx <= 0 || idx === tag.length - 1) return null;
  return { domain: tag.slice(0, idx).trim().toLowerCase(), competency: tag.slice(idx + 1).trim() };
}

/**
 * Evaluates one lesson's tagged quiz answers against Novakid's per-domain
 * automatic Extra Practice rule:
 *   - Speaking (and any other domain in DOMAIN_ANY_FAIL_TRIGGERS): assign if
 *     ANY distinct competency in that domain was failed this lesson.
 *   - Every other domain (Grammar, Reading, ...): assign once at least
 *     DOMAIN_FAIL_FRACTION_THRESHOLD (50%) of that domain's distinct
 *     competencies were failed this lesson.
 *
 * A competency counts as "failed" if the student got it wrong at least
 * once; getting it right on a later question doesn't undo an earlier miss
 * (same conservative semantics as the existing extractWeakTags.ts).
 *
 * Untagged answers (skillTag null/undefined, or a tag with no domain
 * prefix) are ignored — they simply don't contribute a competency signal.
 */
export function evaluateDomainCompetencies(answers: TaggedQuizAnswer[]): DomainCompetencyResult[] {
  const byDomain = new Map<string, { passed: Set<string>; failed: Set<string> }>();

  for (const answer of answers) {
    if (!answer.skillTag) continue;
    const parsed = parseDomainTag(answer.skillTag);
    if (!parsed) continue;
    const { domain, competency } = parsed;
    const bucket = byDomain.get(domain) ?? { passed: new Set<string>(), failed: new Set<string>() };
    if (answer.isCorrect) bucket.passed.add(competency);
    else bucket.failed.add(competency);
    byDomain.set(domain, bucket);
  }

  const results: DomainCompetencyResult[] = [];
  for (const [domain, { passed, failed }] of byDomain) {
    // A competency that was ever failed should not also count as passed —
    // mirrors extractWeakTags.ts's conservative "any wrong = failed" rule.
    for (const c of failed) passed.delete(c);
    const totalTags = [...passed, ...failed].sort();
    const failedTags = [...failed].sort();

    const shouldAssign = DOMAIN_ANY_FAIL_TRIGGERS.has(domain)
      ? failedTags.length > 0
      : totalTags.length > 0 && failedTags.length / totalTags.length >= DOMAIN_FAIL_FRACTION_THRESHOLD;

    results.push({ domain, totalTags, failedTags, shouldAssign });
  }

  return results.sort((a, b) => a.domain.localeCompare(b.domain));
}
