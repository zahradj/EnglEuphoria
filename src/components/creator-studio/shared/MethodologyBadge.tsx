import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { methodologyForLevel, type Methodology, type MethodologyKey } from '@/lib/methodologyForLevel';
import { cn } from '@/lib/utils';

interface MethodologyBadgeProps {
  /** Provide either a CEFR level (e.g. "A2") or an explicit methodology key. */
  level?: string | null;
  methodology?: MethodologyKey | Methodology | null;
  className?: string;
  /** Compact = chip only; default also shows the framework label. */
  compact?: boolean;
}

const TONE: Record<MethodologyKey, string> = {
  TPR: 'bg-amber-50 text-amber-800 border-amber-200',
  CLT: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  TBLT: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

/**
 * Small elegant chip showing which pedagogical framework the AI used to
 * author a lesson. Hover for a one-line explanation.
 */
export const MethodologyBadge: React.FC<MethodologyBadgeProps> = ({
  level,
  methodology,
  className,
  compact = false,
}) => {
  const resolved: Methodology =
    typeof methodology === 'object' && methodology
      ? methodology
      : typeof methodology === 'string'
      ? methodologyForLevel(methodology === 'TPR' ? 'A1' : methodology === 'CLT' ? 'A2' : 'B2')
      : methodologyForLevel(level);

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm transition',
              TONE[resolved.key],
              className,
            )}
          >
            <span aria-hidden>{resolved.emoji}</span>
            {compact ? (
              <span>{resolved.key}</span>
            ) : (
              <span className="whitespace-nowrap">
                Built using <strong className="font-bold">{resolved.label}</strong> principles
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed">
          {resolved.blurb}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
