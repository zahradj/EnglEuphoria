// Inline publish-readiness banner for every hub creator.
// Reads CreatorPublishVerdict from evaluatePublishReadiness() and renders
// status + a list of repair codes / blocking engines. Pure presentational.

import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { CreatorPublishVerdict } from '@/services/contentCreator/publishGateHelper';
import { cn } from '@/lib/utils';

interface Props {
  verdict: CreatorPublishVerdict | null;
  onPublish?: () => void;
  onRepair?: () => void;
  onSaveDraft?: () => void;
  busy?: boolean;
}

export function PublishGateBanner({
  verdict,
  onPublish,
  onRepair,
  onSaveDraft,
  busy,
}: Props) {
  if (!verdict) return null;
  const { decision, qaIssueCount, externals, summary, scorecard, overall } = verdict;

  const tone =
    decision.next_action === 'publish'
      ? 'border-emerald-300/60 bg-emerald-50/80 text-emerald-900'
      : decision.next_action === 'repair'
      ? 'border-amber-300/60 bg-amber-50/80 text-amber-900'
      : 'border-rose-300/60 bg-rose-50/80 text-rose-900';

  const Icon =
    decision.next_action === 'publish'
      ? CheckCircle2
      : decision.next_action === 'repair'
      ? AlertTriangle
      : ShieldAlert;

  return (
    <div
      className={cn(
        'rounded-2xl border backdrop-blur-md p-4 flex flex-col gap-3',
        tone,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-sm">{summary}</div>
          <div className="text-xs opacity-80 mt-0.5">{decision.reason}</div>
          {(qaIssueCount.block > 0 || qaIssueCount.warn > 0) && (
            <div className="text-xs mt-1">
              QA: {qaIssueCount.block} blocker(s), {qaIssueCount.warn} warning(s)
            </div>
          )}
          {externals.some((e) => !e.passed) && (
            <div className="text-xs mt-1">
              Engines blocking:{' '}
              {externals
                .filter((e) => !e.passed)
                .map((e) => e.engine)
                .join(', ')}
            </div>
          )}
          {scorecard && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {typeof overall === 'number' && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/60 border border-current/20">
                  overall {overall}
                </span>
              )}
              {Object.entries(scorecard).map(([k, v]) => (
                <span
                  key={k}
                  className={cn(
                    'text-[10px] font-mono px-1.5 py-0.5 rounded border',
                    v.passing
                      ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                      : 'bg-rose-100/70 border-rose-300 text-rose-900',
                  )}
                  title={`${k}: ${v.score}/100`}
                >
                  {k} {v.score}
                </span>
              ))}
            </div>
          )}
          {decision.repair_codes.length > 0 && (
            <details className="text-xs mt-2">
              <summary className="cursor-pointer opacity-80">
                {decision.repair_codes.length} repair code(s)
              </summary>
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                {decision.repair_codes.slice(0, 12).map((c) => (
                  <li key={c} className="font-mono">
                    {c}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPublish}
          disabled={!decision.allowed || busy}
          className="rounded-xl bg-emerald-600 text-white text-sm font-medium px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Publish
        </button>
        {decision.next_action === 'repair' && (
          <button
            type="button"
            onClick={onRepair}
            disabled={busy}
            className="rounded-xl bg-amber-600 text-white text-sm font-medium px-4 py-2 disabled:opacity-50"
          >
            Auto-repair & retry
          </button>
        )}
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={busy}
          className="rounded-xl bg-slate-800/80 text-white text-sm font-medium px-4 py-2 disabled:opacity-50"
        >
          Save draft
        </button>
      </div>
    </div>
  );
}
