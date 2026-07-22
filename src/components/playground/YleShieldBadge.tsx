// Cambridge-style 1–5 shield reward badge. Used on the Playground student
// dashboard and in the parent report to show YLE-aligned progress per skill.

import { Shield, ShieldCheck } from 'lucide-react';
import type { YleExam, YleSkill } from '@/curriculum-standards/cambridgeYLE';

interface YleShieldBadgeProps {
  exam: YleExam;
  skill: YleSkill;
  shields: 0 | 1 | 2 | 3 | 4 | 5;
  target?: 1 | 2 | 3 | 4 | 5;
  canDo?: string;
}

const SKILL_LABEL: Record<YleSkill, string> = {
  Listening: 'Listening',
  Speaking: 'Speaking',
  ReadingWriting: 'Reading & Writing',
};

export function YleShieldBadge({ exam, skill, shields, target = 5, canDo }: YleShieldBadgeProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cambridge {exam}
          </div>
          <div className="text-sm font-semibold">{SKILL_LABEL[skill]}</div>
        </div>
        <div className="text-xs text-muted-foreground">
          {shields}/{target} shields
        </div>
      </div>
      <div className="mt-3 flex gap-1" aria-label={`${shields} of ${target} shields earned`}>
        {Array.from({ length: target }).map((_, i) =>
          i < shields ? (
            <ShieldCheck key={i} className="h-5 w-5 text-primary" aria-hidden />
          ) : (
            <Shield key={i} className="h-5 w-5 text-muted-foreground/40" aria-hidden />
          ),
        )}
      </div>
      {canDo && <p className="mt-2 text-xs text-muted-foreground">{canDo}</p>}
    </div>
  );
}

export default YleShieldBadge;
