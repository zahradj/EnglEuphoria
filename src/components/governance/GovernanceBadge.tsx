import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import type { GovernanceReport } from '@/governance';

type Status = 'pending' | 'passed' | 'failed' | 'published';

interface Props {
  status?: Status | null;
  report?: GovernanceReport | null;
  compact?: boolean;
}

const COLORS: Record<Status, string> = {
  pending:   'bg-slate-100 text-slate-700 border-slate-200',
  passed:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed:    'bg-rose-50 text-rose-700 border-rose-200',
  published: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export const GovernanceBadge: React.FC<Props> = ({ status, report, compact }) => {
  const s: Status = status || (report ? (report.passed ? 'passed' : 'failed') : 'pending');
  const Icon =
    s === 'passed' ? CheckCircle2 :
    s === 'failed' ? XCircle :
    s === 'published' ? CheckCircle2 :
    Clock;
  const errCount = report?.errors.length ?? 0;
  const warnCount = report?.warnings.length ?? 0;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${COLORS[s]}`}
      title={report ? `${errCount} errors · ${warnCount} warnings` : `Governance: ${s}`}
    >
      <Icon className="h-3 w-3" />
      {compact ? s : `Governance: ${s}`}
      {!compact && (errCount > 0 || warnCount > 0) && (
        <span className="ml-1 inline-flex items-center gap-1 text-[10px] opacity-80">
          {errCount > 0 && <><XCircle className="h-3 w-3" />{errCount}</>}
          {warnCount > 0 && <><AlertTriangle className="h-3 w-3" />{warnCount}</>}
        </span>
      )}
    </span>
  );
};

export default GovernanceBadge;
