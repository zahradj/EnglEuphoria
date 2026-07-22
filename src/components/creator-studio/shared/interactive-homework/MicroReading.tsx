import { useMemo, useState } from 'react';
import { BookText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HomeworkActivityProps } from './types';
import { HUB_THEME } from './types';

export function MicroReading({ hub, task, onComplete }: HomeworkActivityProps) {
  const theme = HUB_THEME[hub];
  const words = useMemo(() => task.prompt.split(/\s+/), [task.prompt]);
  const targetIdx = useMemo(() => words.findIndex((w) => w.length >= 5) || 0, [words]);
  const [picked, setPicked] = useState<number | null>(null);

  const tap = (i: number) => {
    setPicked(i);
    if (i === targetIdx) onComplete?.();
  };

  return (
    <div className={cn('mx-auto w-full max-w-xl rounded-3xl border-2 p-6 shadow-xl', theme.frame)}>
      <div className="flex items-center gap-2 mb-3">
        <BookText className={cn('w-5 h-5', theme.accent)} />
        <span className={cn('text-xs font-extrabold uppercase tracking-wider', theme.accent)}>Micro Reading</span>
      </div>
      <div className="rounded-2xl bg-white border-2 border-slate-200 p-5 shadow-sm">
        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Tap the key word</p>
        <p className="text-lg leading-relaxed">
          {words.map((w, i) => (
            <button
              key={`${w}-${i}`}
              onClick={() => tap(i)}
              className={cn('mx-0.5 my-0.5 rounded px-1 font-medium transition',
                picked === null && 'hover:bg-yellow-100',
                picked === i && i === targetIdx && 'bg-emerald-200 text-emerald-900',
                picked === i && i !== targetIdx && 'bg-rose-200 text-rose-900',
              )}
            >
              {w}
            </button>
          ))}
        </p>
      </div>
      {picked === targetIdx && (
        <p className="mt-3 text-center text-emerald-600 font-extrabold inline-flex items-center gap-1 justify-center w-full">
          <CheckCircle2 className="w-4 h-4" /> Nice catch!
        </p>
      )}
    </div>
  );
}
