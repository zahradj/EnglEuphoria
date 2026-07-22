// ConfidenceRater — 5-button 1–5 confidence selector for FSRS review.
// Semantic tokens only; no raw colors. Used by Daily Warm-Up and Practice Room.

import { useState } from 'react';
import { cn } from '@/lib/utils';

export type Confidence = 1 | 2 | 3 | 4 | 5;

const OPTIONS: { value: Confidence; emoji: string; label: string; tone: string }[] = [
  { value: 1, emoji: '😵', label: 'Forgot', tone: 'bg-destructive/15 text-destructive border-destructive/40' },
  { value: 2, emoji: '😕', label: 'Hard', tone: 'bg-warning/15 text-warning-foreground border-warning/40' },
  { value: 3, emoji: '🙂', label: 'Good', tone: 'bg-secondary/40 text-secondary-foreground border-border' },
  { value: 4, emoji: '😄', label: 'Easy', tone: 'bg-primary/15 text-primary border-primary/40' },
  { value: 5, emoji: '🤩', label: 'Perfect', tone: 'bg-success/15 text-success-foreground border-success/40' },
];

interface Props {
  onRate: (rating: Confidence) => void;
  disabled?: boolean;
  showLabels?: boolean;
}

export function ConfidenceRater({ onRate, disabled, showLabels = true }: Props) {
  const [picked, setPicked] = useState<Confidence | null>(null);

  return (
    <div className="grid grid-cols-5 gap-2 w-full max-w-md">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={disabled || picked !== null}
          onClick={() => {
            setPicked(o.value);
            onRate(o.value);
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-3',
            'transition-transform hover:scale-105 active:scale-95',
            'disabled:opacity-40 disabled:hover:scale-100',
            o.tone,
            picked === o.value && 'ring-2 ring-offset-2 ring-primary',
          )}
          aria-label={`Confidence ${o.value}: ${o.label}`}
        >
          <span className="text-2xl leading-none">{o.emoji}</span>
          {showLabels && <span className="text-[10px] font-medium uppercase tracking-wide">{o.label}</span>}
        </button>
      ))}
    </div>
  );
}
