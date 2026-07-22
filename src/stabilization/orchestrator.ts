// Stabilization orchestrator.
// runStabilization() = run all validators, repair up to N passes, return report.

import type { LessonContext } from '@/orchestrator/types';
import { coherenceValidator } from './validators/coherenceValidator';
import { flowValidator } from './validators/flowValidator';
import { cognitiveLoadValidator } from './validators/cognitiveLoadValidator';
import { activityBalanceValidator } from './validators/activityBalanceValidator';
import { speakingIntegrationValidator } from './validators/speakingIntegrationValidator';
import { retentionValidator } from './validators/retentionValidator';
import { applyRepairs } from './stabilizationRepair';
import type {
  RepairOp,
  StabilizationReport,
  StabilizationRunInput,
  StabilizationRunOutput,
  StabilizationVerdict,
  ValidatorResult,
} from './types';

function runAll(ctx: LessonContext): ValidatorResult[] {
  return [
    coherenceValidator(ctx),
    flowValidator(ctx),
    cognitiveLoadValidator(ctx),
    activityBalanceValidator(ctx),
    speakingIntegrationValidator(ctx),
    retentionValidator(ctx),
  ];
}

function rollUp(results: ValidatorResult[]): StabilizationVerdict {
  if (results.some((r) => r.verdict === 'block')) return 'block';
  if (results.some((r) => r.verdict === 'repair')) return 'repair';
  return 'pass';
}

export function runStabilization(input: StabilizationRunInput): StabilizationRunOutput {
  const maxPasses = input.maxRepairPasses ?? 2;
  const startedAt = new Date().toISOString();

  let ctx = input.ctx;
  let results = runAll(ctx);
  const repairsApplied: RepairOp[] = [];
  let passes = 0;

  while (rollUp(results) === 'repair' && passes < maxPasses) {
    const { ctx: nextCtx, ops } = applyRepairs(ctx, results);
    if (ops.length === 0) break;
    ctx = nextCtx;
    repairsApplied.push(...ops);
    passes++;
    results = runAll(ctx);
  }

  const finalVerdict = rollUp(results);
  const report: StabilizationReport = {
    finalVerdict,
    validators: results,
    repairsApplied,
    passes,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  return { ctx, report };
}
