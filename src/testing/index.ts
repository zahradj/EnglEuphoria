// Main testing entry — runLessonTestSuite()
import { supabase } from '@/integrations/supabase/client';
import { buildTestMatrix, type MatrixFilter } from './testMatrix';
import { generateSyntheticLesson } from './syntheticLessons';
import { aggregateVerdict } from './aggregator';
import { detectRepetitivePattern } from './detectors/repetitivePattern';
import { detectDuplicateVocab } from './detectors/duplicateVocab';
import { detectDisconnectedContext } from './detectors/disconnectedContext';
import { detectGrammarOverload } from './detectors/grammarOverload';
import { detectWeakSpeaking } from './detectors/weakSpeakingTask';
import { detectPoorScaffolding } from './detectors/poorScaffolding';
import { detectRoboticFlow } from './detectors/roboticFlow';
import { detectUnrealisticDialogue } from './detectors/unrealisticDialogue';
import type {
  DetectorFailure,
  TestCase,
  TestRunResult,
  TestSuiteOptions,
  TestSuiteResult,
} from './types';

export * from './types';
export { buildTestMatrix } from './testMatrix';

const DETECTORS: Array<(lesson: any) => DetectorFailure[]> = [
  detectRepetitivePattern,
  detectDuplicateVocab,
  detectDisconnectedContext,
  detectGrammarOverload,
  detectWeakSpeaking,
  detectPoorScaffolding,
  detectRoboticFlow,
  detectUnrealisticDialogue,
];

export async function runLessonTestCase(tc: TestCase): Promise<TestRunResult> {
  const startedAt = Date.now();
  const { orchestration, error } = await generateSyntheticLesson(tc);

  if (error || !orchestration) {
    return {
      testCase: tc,
      detectorFailures: [
        {
          detector: 'pipeline',
          category: 'json_integrity',
          severity: 'error',
          message: error ?? 'orchestrator returned no result',
        },
      ],
      overallVerdict: 'fail',
      durationMs: Date.now() - startedAt,
      error,
    };
  }

  const lesson: any = {
    ...orchestration.context,
    slides: orchestration.context.activities,
    theme: (orchestration.context.plan as any)?.theme,
  };

  const failures: DetectorFailure[] = [];
  for (const det of DETECTORS) {
    try {
      failures.push(...det(lesson));
    } catch (e: any) {
      failures.push({
        detector: det.name,
        category: 'json_integrity',
        severity: 'warn',
        message: `Detector crashed: ${e?.message ?? e}`,
      });
    }
  }

  const qaVerdict = orchestration.verdict ?? null;
  const overallVerdict = aggregateVerdict({ qaVerdict, stabVerdict: null, failures });

  return {
    testCase: tc,
    qaVerdict,
    stabVerdict: null,
    detectorFailures: failures,
    overallVerdict,
    durationMs: Date.now() - startedAt,
    generatedLesson: lesson,
  };
}

export async function runLessonTestSuite(opts: TestSuiteOptions = {}): Promise<TestSuiteResult> {
  const runLabel = opts.runLabel ?? `manual-${new Date().toISOString()}`;
  const cases = opts.cases ?? buildTestMatrix();
  const startedAt = new Date().toISOString();
  const results: TestRunResult[] = [];
  let passCount = 0, warnCount = 0, failCount = 0;

  for (const tc of cases) {
    const r = await runLessonTestCase(tc);
    results.push(r);
    if (r.overallVerdict === 'pass') passCount++;
    else if (r.overallVerdict === 'warn') warnCount++;
    else failCount++;

    if (opts.persist) await persistResult(runLabel, r);
    if (opts.failFastAfter && failCount >= opts.failFastAfter) break;
  }

  return {
    runLabel,
    totalCases: results.length,
    passCount,
    warnCount,
    failCount,
    results,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
}

async function persistResult(runLabel: string, r: TestRunResult): Promise<void> {
  const { data, error } = await supabase
    .from('lesson_test_runs' as any)
    .insert({
      run_label: runLabel,
      hub: r.testCase.hub,
      cefr_level: r.testCase.cefr,
      lesson_kind: r.testCase.kind,
      qa_verdict: r.qaVerdict,
      stab_verdict: r.stabVerdict,
      detector_failures: r.detectorFailures as any,
      overall_verdict: r.overallVerdict,
      duration_ms: r.durationMs,
    })
    .select('id')
    .single();
  if (error || !data) return;
  const runId = (data as any).id as string;
  if (r.detectorFailures.length) {
    await supabase.from('lesson_test_failures' as any).insert(
      r.detectorFailures.map((f) => ({
        run_id: runId,
        category: f.category,
        severity: f.severity,
        detector: f.detector,
        evidence: (f.evidence ?? null) as any,
        slide_index: f.slideIndex ?? null,
      })),
    );
  }
}

// Convenience: filter-driven matrix runs.
export async function runFilteredSuite(filter: MatrixFilter, opts: Omit<TestSuiteOptions, 'cases'> = {}) {
  return runLessonTestSuite({ ...opts, cases: buildTestMatrix(filter) });
}
