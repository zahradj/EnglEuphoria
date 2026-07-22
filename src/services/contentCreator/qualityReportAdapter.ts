// Adapter: convert a LessonQualityReport (from runLessonQualityCheck) into a
// CreatorPublishVerdict so the PublishGateBanner can render verdicts coming
// from the local pre-save quality gate (not just the full orchestrator).

import type { LessonQualityReport } from '@/lib/lessonQualityCheck';
import type { CreatorPublishVerdict } from './publishGateHelper';

/** Map issue code → logical engine for per-engine banner status. */
function engineForCode(code: string): string {
  const c = code.toUpperCase();
  if (c.startsWith('STRUCT') || c.startsWith('SLIDE_COUNT') || c.startsWith('MISSING_REQUIRED')) return 'structure';
  if (c.startsWith('READING') || c.startsWith('CEFR')) return 'reading_level';
  if (c.startsWith('GRAMMAR')) return 'grammar';
  if (c.startsWith('VOCAB') || c.startsWith('COVERAGE')) return 'coverage';
  if (c.startsWith('SPEAKING')) return 'speaking';
  if (c.startsWith('NARRATIVE') || c.startsWith('COHERENCE') || c.startsWith('STORY')) return 'coherence';
  if (c.startsWith('MEMORY') || c.startsWith('REVIEW')) return 'memory';
  if (c.startsWith('PHONICS')) return 'phonics';
  return 'rubric';
}

export function verdictFromQualityReport(report: LessonQualityReport): CreatorPublishVerdict {
  const blockIssues = report.issues.filter((i) => i.severity === 'block');
  const warnIssues = report.issues.filter((i) => i.severity === 'warn');
  const allowed = report.verdict === 'pass';
  const next_action: 'publish' | 'repair' | 'block' =
    report.verdict === 'pass' ? 'publish' : report.verdict === 'block' ? 'block' : 'repair';

  // Group issues by logical engine so the banner can show per-engine status.
  const engineMap = new Map<string, { passed: boolean; blockers: string[] }>();
  const seed = (engine: string) => {
    if (!engineMap.has(engine)) engineMap.set(engine, { passed: true, blockers: [] });
    return engineMap.get(engine)!;
  };
  // Seed core engines so they appear as "passed" when no issues.
  ['structure', 'reading_level', 'coverage', 'rubric'].forEach(seed);
  for (const issue of report.issues) {
    const engine = engineForCode(issue.code);
    const entry = seed(engine);
    if (issue.severity === 'block') {
      entry.passed = false;
      entry.blockers.push(issue.code);
    }
  }
  const externals = [...engineMap.entries()].map(([engine, v]) => ({
    engine,
    passed: v.passed,
    blockers: v.blockers,
  }));
  const failing = externals.filter((e) => !e.passed);

  return {
    decision: {
      allowed,
      reason: allowed
        ? 'All local quality checks passed.'
        : blockIssues.map((i) => i.code).join(', ') || 'Quality warnings present.',
      next_action,
      repair_codes: blockIssues.map((i) => i.code),
      blocking_engines: failing.map((e) => e.engine),
    },
    externals,
    qaIssueCount: { block: blockIssues.length, warn: warnIssues.length },
    scorecard: Object.fromEntries(
      Object.entries(report.scorecard).map(([k, v]) => [k, { score: v, passing: v >= 70 }]),
    ),
    overall: report.overall,
    summary: allowed
      ? `Ready to publish — overall ${report.overall}/100.`
      : `${next_action.toUpperCase()} — ${blockIssues.length} blocker(s), ${warnIssues.length} warning(s)${
          failing.length ? `, engines: ${failing.map((e) => e.engine).join(', ')}` : ''
        }.`,
  };
}
