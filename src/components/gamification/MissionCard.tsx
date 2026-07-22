import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Compass, Sparkles } from 'lucide-react';
import type { Mission } from '@/gamification/types';

interface MissionCardProps {
  mission: Mission;
  onStart?: () => void;
}

/**
 * Active mission framing — frames a lesson as a story, not a worksheet.
 * Uses semantic design tokens; hub theming applied by parent container.
 */
export function MissionCard({ mission, onStart }: MissionCardProps) {
  const { narrative } = mission;
  return (
    <Card className="p-6 bg-card border-border rounded-2xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-xl bg-primary/10 text-primary p-2">
          <Compass className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] uppercase">
              {narrative.archetype.replace('_', ' ')}
            </Badge>
            {narrative.character && (
              <span className="text-xs text-muted-foreground">with {narrative.character}</span>
            )}
          </div>
          <h3 className="font-bold text-base mt-1 truncate">{narrative.title}</h3>
        </div>
      </div>

      <p className="text-sm text-foreground/80 leading-relaxed mb-3">{narrative.hook}</p>

      <div className="rounded-xl bg-muted/40 p-3 mb-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
          Your objective
        </div>
        <div className="text-sm text-foreground">{narrative.objectiveCopy}</div>
      </div>

      <ol className="space-y-1 mb-4">
        {narrative.steps.map((s, i) => (
          <li key={s.stageId} className="text-sm text-foreground/80 flex gap-2">
            <span className="text-primary font-semibold">{i + 1}.</span>
            <span>{s.label}</span>
          </li>
        ))}
      </ol>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          {narrative.encouragementCopy}
        </div>
        {onStart && (
          <button
            onClick={onStart}
            className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
          >
            Start
          </button>
        )}
      </div>
    </Card>
  );
}
