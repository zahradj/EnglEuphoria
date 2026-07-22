// validateSpeaking — stage 10.5 publish gate.
// Hard gates: density floor missed, spontaneous absent when hub allows it.

import type { Hub } from '@/governance/types';
import type {
  SpeakingDecision,
  SpeakingValidationReport,
  SpeakingValidationIssue,
} from './types';
import { profileFor } from './hubProfiles';

export interface ValidateSpeakingInput {
  hub: Hub;
  decision: SpeakingDecision;
  observedSpeakingActivityCount: number;
  observedTotalActivityCount: number;
  observedRungs: string[];
  /** Optional: scaffold objects discovered on generated speaking tasks. */
  observedScaffolds?: Array<{
    guided?: string;
    expansion?: string;
    ladder_rung?: string;
    fluency_extension?: string;
    role?: string;
    objective?: string;
    emotion?: string;
    grammar_target?: string;
    vocab_target?: string[] | string;
    prompt?: string;
  }>;
}

// Generic, vague prompts that must NEVER ship as a speaking task.
const GENERIC_PROMPT_PATTERNS = [
  /^\s*talk about\s*\.{0,3}\s*$/i,
  /^\s*talk about (it|this|that|something)\s*\.?\s*$/i,
  /^\s*discuss\s*\.{0,3}\s*$/i,
  /^\s*say something\s*\.?\s*$/i,
  /^\s*describe (it|this|that)\s*\.?\s*$/i,
  /^\s*(speak|share)\s*\.?\s*$/i,
];

function isGenericPrompt(p?: string): boolean {
  if (!p || !p.trim()) return true;
  return GENERIC_PROMPT_PATTERNS.some((re) => re.test(p.trim()));
}

export function validateSpeaking(input: ValidateSpeakingInput): SpeakingValidationReport {
  const issues: SpeakingValidationIssue[] = [];
  const profile = profileFor(input.hub);
  const density = input.observedTotalActivityCount > 0
    ? input.observedSpeakingActivityCount / input.observedTotalActivityCount
    : 0;
  const spontaneousCount = input.observedRungs.filter(
    (r) => r === 'free' || r === 'spontaneous',
  ).length;

  if (input.observedSpeakingActivityCount < profile.min_speaking_tasks) {
    issues.push({
      code: 'speaking_count_below_floor',
      severity: 'hard',
      message: `Only ${input.observedSpeakingActivityCount} speaking tasks; min is ${profile.min_speaking_tasks}.`,
    });
  }
  if (density < profile.min_density) {
    issues.push({
      code: 'speaking_density_below_floor',
      severity: 'hard',
      message: `Speaking density ${(density * 100).toFixed(0)}% < min ${(profile.min_density * 100).toFixed(0)}%.`,
    });
  }
  if (
    (profile.max_rung === 'spontaneous' || profile.max_rung === 'free') &&
    input.decision.next_rung === 'spontaneous' &&
    spontaneousCount === 0
  ) {
    issues.push({
      code: 'no_spontaneous_opportunity',
      severity: 'hard',
      message: 'Decision targeted spontaneous rung but lesson contains no free/spontaneous task.',
    });
  }

  // Scaffold ladder coverage — every speaking task should carry guided + ladder_rung.
  for (const [i, s] of (input.observedScaffolds ?? []).entries()) {
    const missing: string[] = [];
    if (!s.guided?.trim()) missing.push('guided');
    if (!s.ladder_rung?.trim()) missing.push('ladder_rung');
    if (missing.length > 0) {
      issues.push({
        code: 'SPEAKING_SCAFFOLD_MISSING',
        severity: 'hard',
        message: `Speaking task #${i + 1} is missing scaffold fields: ${missing.join(', ')}.`,
      });
    }
    const softMissing: string[] = [];
    if (!s.expansion?.trim()) softMissing.push('expansion');
    if (!s.fluency_extension?.trim()) softMissing.push('fluency_extension');
    if (softMissing.length > 0) {
      issues.push({
        code: 'SPEAKING_SCAFFOLD_SOFT_MISSING',
        severity: 'soft',
        message: `Speaking task #${i + 1} missing optional scaffold fields: ${softMissing.join(', ')}.`,
      });
    }

    // Phase 4: role / objective / emotion / grammar / vocab requirements (hard).
    const contextMissing: string[] = [];
    if (!s.role?.trim()) contextMissing.push('role');
    if (!s.objective?.trim()) contextMissing.push('objective');
    if (!s.emotion?.trim()) contextMissing.push('emotion');
    if (!s.grammar_target?.trim()) contextMissing.push('grammar_target');
    const vocabArr = Array.isArray(s.vocab_target)
      ? s.vocab_target
      : (s.vocab_target ? [s.vocab_target] : []);
    if (vocabArr.filter((v) => !!v && v.trim().length > 0).length === 0) {
      contextMissing.push('vocab_target');
    }
    if (contextMissing.length > 0) {
      issues.push({
        code: 'SPEAKING_TASK_CONTEXT_MISSING',
        severity: 'hard',
        message: `Speaking task #${i + 1} missing required context: ${contextMissing.join(', ')}.`,
      });
    }

    // Phase 4: ban generic "Talk about…" / "Discuss." prompts (hard).
    if (isGenericPrompt(s.prompt)) {
      issues.push({
        code: 'SPEAKING_GENERIC_PROMPT',
        severity: 'hard',
        message: `Speaking task #${i + 1} uses a generic prompt ("${(s.prompt ?? '').trim()}"). Provide a concrete, scenario-bound prompt with a clear goal.`,
      });
    }
  }


  const hard = issues.some((i) => i.severity === 'hard');
  const soft = issues.some((i) => i.severity === 'soft');
  const verdict: SpeakingValidationReport['verdict'] = hard ? 'block' : soft ? 'repair' : 'pass';

  return {
    verdict,
    issues,
    speaking_density_observed: density,
    spontaneous_count_observed: spontaneousCount,
  };
}
