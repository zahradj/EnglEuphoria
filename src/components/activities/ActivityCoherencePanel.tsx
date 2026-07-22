import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { ActivityGenerationResult } from '@/activities';

interface Props {
  result: ActivityGenerationResult;
  onRegenerate?: (activityId: string) => void;
}

export function ActivityCoherencePanel({ result, onRegenerate }: Props) {
  const { activities, perActivity, coherence, passed } = result;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Activity Coherence</h3>
        {passed ? (
          <span className="flex items-center gap-1 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Passed
          </span>
        ) : (
          <span className="flex items-center gap-1 text-sm text-destructive">
            <XCircle className="h-4 w-4" /> Issues
          </span>
        )}
      </header>

      {coherence.errors.length + coherence.warnings.length > 0 && (
        <section className="space-y-1 text-sm">
          <h4 className="font-medium text-foreground">Whole-lesson checks</h4>
          {coherence.errors.map((e, i) => (
            <div key={`ce${i}`} className="flex items-start gap-2 text-destructive">
              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{e.message}</span>
            </div>
          ))}
          {coherence.warnings.map((w, i) => (
            <div key={`cw${i}`} className="flex items-start gap-2 text-amber-600">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{w.message}</span>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Per-activity</h4>
        <ul className="space-y-2">
          {activities.map((a, i) => {
            const r = perActivity[i];
            const ok = r?.passed ?? false;
            return (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/50 p-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    {ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <span className="font-medium text-foreground">
                      {i + 1}. {a.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {a.stage} · {a.purpose}
                    </span>
                  </div>
                  {r && (r.errors.length > 0 || r.warnings.length > 0) && (
                    <ul className="mt-1 space-y-0.5 text-xs">
                      {r.errors.map((e, k) => (
                        <li key={`e${k}`} className="text-destructive">
                          • {e.message}
                        </li>
                      ))}
                      {r.warnings.map((w, k) => (
                        <li key={`w${k}`} className="text-amber-600">
                          • {w.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {!ok && onRegenerate && (
                  <button
                    type="button"
                    onClick={() => onRegenerate(a.id)}
                    className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-muted"
                  >
                    Regenerate
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
