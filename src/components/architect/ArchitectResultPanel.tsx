// Visualizes the 8-Brain Expert Architect result — pipeline trace,
// hall-of-fame verdict, emotional beats and reviewer checks. Pure
// presentational; safe to drop into any generator UI.

import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { ArchitectResult } from '@/architect/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  result: ArchitectResult | null | undefined;
  className?: string;
}

export function ArchitectResultPanel({ result, className }: Props) {
  if (!result) return null;

  const hof = result.hall_of_fame;
  const review = result.review;
  const beats = result.emotional_beats ?? {};
  const trace = result.pipeline_trace ?? [];

  const hofPass = hof?.verdict === 'hall_of_fame';
  const reviewPass = review?.pass !== false;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>Expert Architect</span>
          <Badge variant={result.status === 'ok' ? 'default' : 'secondary'}>
            {result.status} · {result.passes} pass{result.passes === 1 ? '' : 'es'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Hall of Fame */}
        <div className="flex items-center gap-2">
          {hofPass ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
          <span className="font-medium">Hall of Fame:</span>
          <span>
            {hof
              ? `${hof.verdict} (${hof.total}/25)`
              : 'not scored'}
          </span>
          {hof?.improve_target && !hofPass && (
            <span className="text-muted-foreground">→ {hof.improve_target}</span>
          )}
        </div>

        {/* Reviewer */}
        <div className="flex items-center gap-2">
          {reviewPass ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
          <span className="font-medium">Reviewer:</span>
          <span>{review ? (review.pass ? 'pass' : review.blocker ?? 'blocked') : 'n/a'}</span>
        </div>

        {/* Emotional beats */}
        <div>
          <div className="mb-1 font-medium">Emotional beats</div>
          <div className="flex flex-wrap gap-1">
            {['surprise', 'funny', 'challenge', 'celebration', 'reward', 'emotional', 'memorable'].map((b) => {
              const present = Boolean((beats as any)[b]);
              return (
                <Badge key={b} variant={present ? 'default' : 'outline'}>
                  {present ? '✓' : '·'} {b}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Pipeline trace */}
        {trace.length > 0 && (
          <div>
            <div className="mb-1 font-medium">Pipeline trace</div>
            <ol className="space-y-1">
              {trace.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  {s.signed_by ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber-500" />
                  )}
                  <div>
                    <span className="font-medium">{s.stage}</span>
                    <span className="text-muted-foreground"> — {s.decision}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Critic findings */}
        {result.critic_findings?.length > 0 && (
          <div>
            <div className="mb-1 font-medium">Critic findings</div>
            <ul className="space-y-1">
              {result.critic_findings.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  {f.severity === 'block' ? (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 text-destructive" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber-500" />
                  )}
                  <div>
                    <span className="font-medium">[{f.lens}]</span> {f.message}
                    {f.suggestion && (
                      <span className="text-muted-foreground"> → {f.suggestion}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ArchitectResultPanel;
