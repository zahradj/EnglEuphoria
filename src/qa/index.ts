import type { QAIssue, QALesson, QAReport } from './types';
import { mergeJudgeIssues, runDeterministicQA } from './orchestrator';
import {
  buildHallucinationPrompt,
  hallucinationCacheKey,
  mapHallucinationResultToIssues,
  shouldRunHallucinationJudge,
  type HallucinationJudgeResult,
} from './judges/hallucinationJudge';
import { memGet, memSet } from './judges/judgeCache';
import { decidePublish, type PublishDecision } from './publishGate';
import { dispatchRepairs, type RepairDispatch } from './repairDispatcher';
import { repairEngineSlots, type EngineRepairResult } from './repairs/repairEngineSlots';

export * from './types';
export { runDeterministicQA, mergeJudgeIssues } from './orchestrator';
export { decidePublish } from './publishGate';
export { dispatchRepairs } from './repairDispatcher';
export { repairEngineSlots } from './repairs/repairEngineSlots';
export {
  buildHallucinationPrompt,
  hallucinationCacheKey,
  shouldRunHallucinationJudge,
  mapHallucinationResultToIssues,
} from './judges/hallucinationJudge';

/**
 * The AI-judge invoker is injected so this module never reaches out
 * to the network directly. Callers pass a function that calls Gemini
 * direct via the project's runtime `aiFetch` and returns the parsed
 * HallucinationJudgeResult.
 */
export type JudgeInvoker = (prompt: string) => Promise<HallucinationJudgeResult>;

export interface RunQualityControlInput {
  lesson: QALesson;
  judge?: JudgeInvoker;             // optional AI judge (Gemini direct)
  dbCache?: {
    get(judgeName: string, contentHash: string): Promise<HallucinationJudgeResult | null>;
    set(judgeName: string, contentHash: string, result: HallucinationJudgeResult): Promise<void>;
  };
}

export interface RunQualityControlResult {
  report: QAReport;
  decision: PublishDecision;
  repairs: RepairDispatch[];
  engineRepair?: EngineRepairResult;
}

/**
 * Top-level QA entry. Runs deterministic validators, then (optionally)
 * the hallucination judge with cache, then maps to a publish decision
 * and repair dispatches.
 */
export async function runQualityControl(input: RunQualityControlInput): Promise<RunQualityControlResult> {
  const { lesson, judge, dbCache } = input;

  let report = runDeterministicQA(lesson);

  if (judge && shouldRunHallucinationJudge(lesson)) {
    const { key, contentHash } = hallucinationCacheKey(lesson);
    let result: HallucinationJudgeResult | undefined | null = memGet(key);
    if (!result && dbCache) {
      result = await dbCache.get('hallucination', contentHash);
      if (result) memSet(key, result);
    }
    if (!result) {
      try {
        result = await judge(buildHallucinationPrompt(lesson));
        memSet(key, result);
        if (dbCache) await dbCache.set('hallucination', contentHash, result);
      } catch (e) {
        report = mergeJudgeIssues(
          report,
          [
            {
              code: 'HALLUC_JUDGE_ERROR',
              domain: 'hallucination',
              severity: 'warn',
              message: `Hallucination judge failed: ${(e as Error).message}`,
              auto_repairable: false,
            } satisfies QAIssue,
          ],
          lesson,
        );
        result = undefined;
      }
    }
    if (result) {
      report = mergeJudgeIssues(report, mapHallucinationResultToIssues(result), lesson);
    }
  }

  // Auto-repair pass: engine slot CEFR breaches swap in place, then re-validate.
  const engineRepair = repairEngineSlots(lesson, report.issues);
  if (engineRepair.swapped > 0) {
    report = runDeterministicQA(lesson);
  }

  const decision = decidePublish(report);
  const repairs = dispatchRepairs(report.issues);

  return { report, decision, repairs, engineRepair };
}
