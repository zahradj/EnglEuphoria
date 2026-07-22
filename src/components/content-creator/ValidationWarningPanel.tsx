// Pre-flight validation panel for the Unified Lesson Generator.
// Surfaces blueprint integrity issues + manual-mode field checks BEFORE
// generation so failures never happen silently.

import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type ValidationSeverity = 'block' | 'warn';

export interface ValidationIssue {
  code: string;
  severity: ValidationSeverity;
  message: string;
}

interface Props {
  mode: 'curriculum' | 'manual';
  issues: ValidationIssue[];
}

export function ValidationWarningPanel({ mode, issues }: Props) {
  const blocks = issues.filter((i) => i.severity === 'block');
  const warns = issues.filter((i) => i.severity === 'warn');
  const ok = issues.length === 0;

  if (ok) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <CardContent className="flex items-center gap-2 py-3 text-sm text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            {mode === 'curriculum'
              ? 'Curriculum blueprint validated — ready to generate.'
              : 'Manual blueprint validated — ready to generate.'}
          </span>
          <Badge variant="outline" className="ml-auto capitalize">
            {mode} mode
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={
        blocks.length
          ? 'border-rose-300 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/20'
          : 'border-amber-300 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20'
      }
    >
      <CardContent className="space-y-2 py-3 text-sm">
        <div className="flex items-center gap-2">
          {blocks.length ? (
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          )}
          <strong>
            {blocks.length
              ? 'Generation blocked — fix these before continuing:'
              : 'Heads up — the blueprint has warnings:'}
          </strong>
          <Badge variant="outline" className="ml-auto capitalize">
            {mode} mode
          </Badge>
        </div>
        <ul className="ml-6 list-disc space-y-1">
          {blocks.map((i) => (
            <li key={i.code} className="text-rose-900 dark:text-rose-200">
              <span className="font-mono text-[10px] uppercase opacity-70">{i.code}</span>{' '}
              · {i.message}
            </li>
          ))}
          {warns.map((i) => (
            <li key={i.code} className="text-amber-900 dark:text-amber-200">
              <span className="font-mono text-[10px] uppercase opacity-70">{i.code}</span>{' '}
              · {i.message}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
