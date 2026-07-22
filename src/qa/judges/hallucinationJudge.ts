import type { QAIssue, QALesson } from '../types';
import { hashContent } from '../util/text';
import { judgeKey, memGet, memSet } from './judgeCache';

export interface HallucinationJudgeResult {
  verdict: 'pass' | 'fail' | 'inconclusive';
  claims_checked: { claim: string; accurate: boolean; evidence?: string }[];
  confidence: number;
  raw?: any;
}

/**
 * AI-judge invoker. The actual Gemini call MUST be performed by the caller
 * via the project's runtime `aiFetch` helper (Gemini direct, never Lovable Gateway).
 *
 * This module owns:
 * - prompt construction
 * - input/output schema
 * - cache key derivation
 * - issue mapping
 */
export function buildHallucinationPrompt(lesson: QALesson): string {
  const grammarSlides = lesson.slides
    .filter((s) => s.grammar_explanation || (s.examples && s.examples.length > 0))
    .map((s) => ({
      id: s.id,
      explanation: s.grammar_explanation,
      examples: s.examples,
    }));

  return [
    'You are an expert English-language QA reviewer.',
    `CEFR target: ${lesson.cefr}. Hub: ${lesson.hub}.`,
    'For each grammar explanation and example below, judge whether the linguistic claim is accurate, idiomatic, and CEFR-appropriate.',
    'Return STRICT JSON matching:',
    '{ "verdict":"pass"|"fail"|"inconclusive", "confidence":0-1, "claims_checked":[{"claim":string,"accurate":boolean,"evidence":string}] }',
    'Slides:',
    JSON.stringify(grammarSlides, null, 2),
  ].join('\n');
}

export function shouldRunHallucinationJudge(lesson: QALesson): boolean {
  return lesson.slides.some((s) => s.grammar_explanation || (s.examples && s.examples.length > 0));
}

export function hallucinationCacheKey(lesson: QALesson): { key: string; contentHash: string } {
  const seed = lesson.slides
    .map((s) => `${s.id}|${s.grammar_explanation ?? ''}|${(s.examples ?? []).join('|')}`)
    .join('||');
  const contentHash = hashContent(seed);
  return { key: judgeKey('hallucination', contentHash), contentHash };
}

export function mapHallucinationResultToIssues(result: HallucinationJudgeResult): QAIssue[] {
  const issues: QAIssue[] = [];
  if (result.verdict === 'fail') {
    issues.push({
      code: 'HALLUC_FAIL',
      domain: 'hallucination',
      severity: 'block',
      message: `AI judge detected inaccurate language claims (confidence ${(result.confidence * 100).toFixed(0)}%).`,
      suggestion: 'Regenerate flagged grammar explanations and examples.',
      auto_repairable: true,
    });
  } else if (result.verdict === 'inconclusive') {
    issues.push({
      code: 'HALLUC_INCONCLUSIVE',
      domain: 'hallucination',
      severity: 'warn',
      message: 'AI judge could not confirm linguistic accuracy.',
      auto_repairable: false,
    });
  }
  for (const c of result.claims_checked) {
    if (!c.accurate) {
      issues.push({
        code: 'HALLUC_CLAIM_INACCURATE',
        domain: 'hallucination',
        severity: 'warn',
        message: `Inaccurate claim: "${c.claim}"${c.evidence ? ` — ${c.evidence}` : ''}.`,
        auto_repairable: true,
      });
    }
  }
  return issues;
}

export const judgeMemCache = { get: memGet, set: memSet };
