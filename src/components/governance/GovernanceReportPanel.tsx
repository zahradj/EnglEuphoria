import React from 'react';
import { AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GovernanceReport, GovernanceIssue } from '@/governance';
import { groupIssuesBySlide } from '@/governance';

interface Props {
  report: GovernanceReport | null | undefined;
  onRegenerateSlide?: (slideIndex: number) => void;
}

const ENGINE_LABEL: Record<string, string> = {
  grammar: 'Grammar',
  vocab: 'Vocabulary',
  theme: 'Theme',
  cefr: 'CEFR',
  sequence: 'Sequencing',
  quality: 'Quality',
};

const IssueRow: React.FC<{ issue: GovernanceIssue }> = ({ issue }) => {
  const Icon = issue.severity === 'error' ? XCircle : AlertTriangle;
  const color = issue.severity === 'error' ? 'text-rose-600' : 'text-amber-600';
  return (
    <li className="flex items-start gap-2 text-sm">
      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${color}`} />
      <div className="flex-1">
        <div className="font-medium text-slate-800 dark:text-slate-100">{issue.message}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          <Badge variant="outline" className="mr-1 px-1.5 py-0 text-[10px]">{ENGINE_LABEL[issue.engine] || issue.engine}</Badge>
          <span className="font-mono">{issue.code}</span>
        </div>
      </div>
    </li>
  );
};

export const GovernanceReportPanel: React.FC<Props> = ({ report, onRegenerateSlide }) => {
  if (!report) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
        No governance report yet. Generate a lesson to see validation results.
      </div>
    );
  }

  if (report.passed && report.warnings.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-2 text-emerald-800">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-semibold">All governance checks passed.</span>
        <span className="text-xs ml-auto text-emerald-700/70">{new Date(report.ranAt).toLocaleString()}</span>
      </div>
    );
  }

  const grouped = groupIssuesBySlide(report);
  const keys = Array.from(grouped.keys()).sort((a, b) => {
    if (a === 'lesson') return -1;
    if (b === 'lesson') return 1;
    return (a as number) - (b as number);
  });

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
      <div className="flex items-center gap-2">
        {report.passed ? (
          <Badge className="bg-amber-100 text-amber-800 border-0">Passed with warnings</Badge>
        ) : (
          <Badge className="bg-rose-100 text-rose-800 border-0">Failed — publish blocked</Badge>
        )}
        <span className="text-xs text-slate-500 ml-auto">
          {report.errors.length} errors · {report.warnings.length} warnings · {new Date(report.ranAt).toLocaleString()}
        </span>
      </div>

      {keys.map((k) => {
        const items = grouped.get(k)!;
        return (
          <div key={String(k)} className="rounded-lg border border-slate-100 dark:border-slate-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {k === 'lesson' ? 'Lesson-level' : `Slide ${(k as number) + 1}`}
              </div>
              {typeof k === 'number' && onRegenerateSlide && items.some((i) => i.severity === 'error') ? (
                <Button size="sm" variant="outline" onClick={() => onRegenerateSlide(k)}>
                  Regenerate slide
                </Button>
              ) : null}
            </div>
            <ul className="space-y-2">
              {items.map((i, idx) => <IssueRow key={idx} issue={i} />)}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default GovernanceReportPanel;
