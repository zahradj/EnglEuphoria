// Deno-side copy of src/lib/remediation/evaluateDomainCompetencies.ts's pure
// evaluation logic. Duplicated rather than imported because edge functions
// in this project don't share code with the Vite/browser src/ tree (see the
// other functions under supabase/functions/, which all re-declare their own
// small local types like `Hub`/`Struggle` rather than importing from src/).
// Keep this in lockstep with the src/ version if the rule ever changes —
// the src/ version carries the unit tests pinning the exact thresholds.

export interface TaggedQuizAnswer {
  skillTag: string | null | undefined;
  isCorrect: boolean;
}

export interface DomainCompetencyResult {
  domain: string;
  totalTags: string[];
  failedTags: string[];
  shouldAssign: boolean;
}

const DOMAIN_ANY_FAIL_TRIGGERS = new Set(["speaking"]);
const DOMAIN_FAIL_FRACTION_THRESHOLD = 0.5;

export function parseDomainTag(tag: string): { domain: string; competency: string } | null {
  const idx = tag.indexOf(":");
  if (idx <= 0 || idx === tag.length - 1) return null;
  return { domain: tag.slice(0, idx).trim().toLowerCase(), competency: tag.slice(idx + 1).trim() };
}

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
