import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, Circle, ShieldCheck } from 'lucide-react';
import type { LessonStatus } from './useBlueprintLessonStatuses';

const VERDICT_STYLES: Record<string, { label: string; cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
  publish: { label: 'Publish', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900', Icon: CheckCircle2 },
  repair:  { label: 'Repair',  cls: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900', Icon: AlertTriangle },
  block:   { label: 'Block',   cls: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900', Icon: ShieldAlert },
  pending: { label: 'Not generated', cls: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700', Icon: Circle },
};

interface Props {
  status?: LessonStatus | null;
}

export const LessonStatusBadge: React.FC<Props> = ({ status }) => {
  const key = status?.verdict ?? 'pending';
  const v = VERDICT_STYLES[key];
  const Icon = v.Icon;
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${v.cls}`}
        title={status?.stateHash ? `state_hash: ${status.stateHash}` : undefined}
      >
        <Icon className="h-2.5 w-2.5" />
        {v.label}
      </span>

      {status?.stabVerdict && (
        <span
          className="inline-flex items-center gap-1 rounded-full border border-sky-300 bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          title="Stabilization verdict (stage 9.5)"
        >
          <ShieldCheck className="h-2.5 w-2.5" />
          stab: {status.stabVerdict}
          {status.repairsApplied ? ` (${status.repairsApplied})` : ''}
        </span>
      )}

      {status && status.slideCount > 0 && (
        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
          {status.slideCount} slides
        </span>
      )}

      {status?.generatedAt && (
        <span className="text-[10px] text-slate-400" title={status.generatedAt}>
          · {new Date(status.generatedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};
