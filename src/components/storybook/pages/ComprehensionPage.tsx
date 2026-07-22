import { useState } from 'react';
import type { PageRendererProps } from '../PageRenderer';
import type { ComprehensionContent } from '@/storybook/types';
import { Check, X } from 'lucide-react';

export function ComprehensionPage({ page, onComprehension }: PageRendererProps) {
  const data = (page.content as { type: 'comprehension'; data: ComprehensionContent }).data;
  const [picked, setPicked] = useState<number | null>(null);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    onComprehension?.(i === data.correct_index);
  };

  return (
    <div className="flex flex-col h-full justify-center gap-6 px-2">
      <span className="text-xs uppercase tracking-widest text-primary font-semibold">Check your understanding</span>
      <h3 className="text-2xl md:text-3xl font-semibold text-foreground">{data.question}</h3>
      <div className="grid gap-3">
        {data.options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === data.correct_index;
          const state = picked === null ? 'idle' : isCorrect ? 'correct' : isPicked ? 'wrong' : 'dim';
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={picked !== null}
              className={`text-left rounded-2xl px-4 py-3 border-2 transition-colors flex items-center justify-between gap-3
                ${state === 'idle' ? 'border-border hover:border-primary hover:bg-primary/5' : ''}
                ${state === 'correct' ? 'border-success bg-success/10' : ''}
                ${state === 'wrong' ? 'border-destructive bg-destructive/10' : ''}
                ${state === 'dim' ? 'border-border opacity-60' : ''}
              `}
            >
              <span>{opt}</span>
              {state === 'correct' && <Check className="h-5 w-5 text-success" />}
              {state === 'wrong' && <X className="h-5 w-5 text-destructive" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
