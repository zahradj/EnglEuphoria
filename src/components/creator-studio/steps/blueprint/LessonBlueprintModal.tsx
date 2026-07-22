// LessonBlueprintModal — read-only view of the master blueprint JSON.
// Splits LOCKED vs EDITABLE fields visually so curriculum integrity is clear.

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock } from 'lucide-react';
import {
  LOCKED_FIELDS,
  EDITABLE_FIELDS,
  type LessonBlueprint,
} from '@/services/contentCreator/lessonBlueprint';

interface Props {
  blueprint: LessonBlueprint | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const LessonBlueprintModal: React.FC<Props> = ({ blueprint, open, onOpenChange }) => {
  if (!blueprint) return null;
  const bp = blueprint as unknown as Record<string, unknown>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Lesson Blueprint
            <Badge variant="outline" className="text-[10px]">
              {blueprint.hub} · {blueprint.cefr_level}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-rose-700 dark:text-rose-300 flex items-center gap-1 mb-2">
              <Lock className="h-3 w-3" /> Locked by curriculum
            </h4>
            <dl className="grid grid-cols-3 gap-2 text-xs">
              {LOCKED_FIELDS.map((k) => (
                <React.Fragment key={k}>
                  <dt className="text-slate-500 col-span-1">{k}</dt>
                  <dd className="col-span-2 font-mono text-slate-800 dark:text-slate-200 break-all">
                    {JSON.stringify(bp[k] ?? null)}
                  </dd>
                </React.Fragment>
              ))}
            </dl>
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mb-2">
              <Unlock className="h-3 w-3" /> Editable knobs
            </h4>
            <dl className="grid grid-cols-3 gap-2 text-xs">
              {EDITABLE_FIELDS.map((k) => (
                <React.Fragment key={k}>
                  <dt className="text-slate-500 col-span-1">{k}</dt>
                  <dd className="col-span-2 font-mono text-slate-800 dark:text-slate-200 break-all">
                    {JSON.stringify(bp[k] ?? null)}
                  </dd>
                </React.Fragment>
              ))}
            </dl>
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              Relationships
            </h4>
            <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
              <li>← previous: {blueprint.previous_lesson_title ?? '—'}</li>
              <li>→ next: {blueprint.next_lesson_title ?? '—'}</li>
              <li>review_targets: {blueprint.review_targets.join(', ') || '—'}</li>
              <li>prerequisite_skills: {blueprint.prerequisite_skills.join(', ') || '—'}</li>
            </ul>
          </section>

          <details>
            <summary className="cursor-pointer text-xs text-slate-500">Raw JSON</summary>
            <pre className="mt-2 max-h-72 overflow-auto rounded bg-muted p-2 text-[10px]">
              {JSON.stringify(blueprint, null, 2)}
            </pre>
          </details>
        </div>
      </DialogContent>
    </Dialog>
  );
};
