// Generic stage wrapper: timing, error capture, structured report.

import type { PipelineStageName, StageReport, StageStatus } from './types';

export interface StageOutcome<T> {
  value: T;
  report: StageReport;
}

export async function runStage<T>(
  stage: PipelineStageName,
  fn: () => Promise<T> | T,
  opts: { warnIf?: (value: T) => string[] | undefined } = {},
): Promise<StageOutcome<T>> {
  const start = performance.now();
  try {
    const value = await fn();
    const notes = opts.warnIf?.(value);
    const status: StageStatus = notes && notes.length > 0 ? 'warning' : 'ok';
    return {
      value,
      report: {
        stage,
        status,
        durationMs: Math.round(performance.now() - start),
        notes,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const report: StageReport = {
      stage,
      status: 'error',
      durationMs: Math.round(performance.now() - start),
      error: message,
    };
    // Re-throw so the pipeline aborts; attach the report on the error.
    const wrapped = new Error(`[${stage}] ${message}`);
    (wrapped as any).stageReport = report;
    throw wrapped;
  }
}
