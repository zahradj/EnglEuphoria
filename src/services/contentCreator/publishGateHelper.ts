// Publish Gate Helper
// -------------------
// Thin adapter that takes an OrchestrationResult and produces a UI-friendly
// PublishDecision plus a compact validator summary the creator banner can
// render. Centralizes the rule: "Publish only when QA.publish AND every
// external engine (stabilization, grammar, speaking, coherence, arcade,
// memory) passed." See mem://qa/generation-governance.

import type { OrchestrationResult } from '@/orchestrator/types';
import {
  decidePublish,
  type ExternalEngineVerdict,
  type PublishDecision,
} from '@/qa/publishGate';

export interface CreatorPublishVerdict {
  decision: PublishDecision;
  externals: ExternalEngineVerdict[];
  qaIssueCount: { block: number; warn: number };
  summary: string;
  scorecard?: Record<string, { score: number; passing: boolean }>;
  overall?: number;
}

export function evaluatePublishReadiness(
  result: OrchestrationResult,
): CreatorPublishVerdict {
  const qa = result.context.qa;
  if (!qa) {
    return {
      decision: {
        allowed: false,
        reason: 'QA report missing — orchestrator did not run quality stage.',
        next_action: 'block',
        repair_codes: [],
        blocking_engines: ['qa'],
      },
      externals: [],
      qaIssueCount: { block: 0, warn: 0 },
      summary: 'QA report missing.',
    };
  }

  const externals: ExternalEngineVerdict[] = [];
  const pushIf = (
    engine: string,
    decision: { verdict?: string; passed?: boolean; blockers?: string[] } | null | undefined,
  ) => {
    if (!decision) return;
    const passed =
      typeof decision.passed === 'boolean'
        ? decision.passed
        : decision.verdict === 'publish' || decision.verdict === 'pass';
    externals.push({
      engine,
      passed,
      blockers: decision.blockers ?? [],
    });
  };

  pushIf('grammar', result.grammarPackage as any);
  pushIf('memory', result.memoryDecision as any);
  pushIf('speaking', result.speakingDecision as any);
  pushIf('coherence', result.coherenceDecision as any);
  pushIf('arcade', result.arcadeDecision as any);

  const decision = decidePublish(qa, externals);

  const block = qa.issues?.filter((i: any) => i.severity === 'block').length ?? 0;
  const warn = qa.issues?.filter((i: any) => i.severity === 'warn').length ?? 0;

  const summary = decision.allowed
    ? 'All quality gates passed. Ready to publish.'
    : `${decision.next_action.toUpperCase()} — ${decision.repair_codes.length} repair code(s), ${decision.blocking_engines.length} engine(s) blocking.`;

  return { decision, externals, qaIssueCount: { block, warn }, summary };
}
