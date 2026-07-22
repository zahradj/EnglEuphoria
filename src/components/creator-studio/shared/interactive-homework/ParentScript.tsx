import { useState } from 'react';
import { Home, Volume2, CheckCircle2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HomeworkActivityProps } from './types';
import { HUB_THEME } from './types';

export function ParentScript({ hub, task, onComplete }: HomeworkActivityProps) {
  const theme = HUB_THEME[hub];
  const [stars, setStars] = useState(0);
  const [done, setDone] = useState(false);

  return (
    <div className={cn('mx-auto w-full max-w-md rounded-3xl border-4 p-5 shadow-xl', theme.frame)}>
      <div className="flex items-center gap-2 mb-3">
        <Home className={cn('w-5 h-5', theme.accent)} />
        <span className={cn('text-xs font-extrabold uppercase tracking-wider', theme.accent)}>Home Mission</span>
      </div>

      <div className="rounded-2xl bg-white border-2 border-slate-200 p-5 shadow-sm">
        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Say this to a grown-up</p>
        <p className="text-xl font-extrabold text-slate-900 leading-snug">"{task.prompt}"</p>
        <button
          type="button"
          className={cn('mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow active:scale-95', theme.button)}
        >
          <Volume2 className="w-4 h-4" /> Hear it
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-white border-2 border-dashed border-slate-300 p-4">
        <p className="text-xs font-bold text-slate-600 mb-2">Did you say it loud and clear?</p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => { setStars(n); if (n >= 2) { setDone(true); onComplete?.(); } }}
              className="transition active:scale-90"
            >
              <Star className={cn('w-10 h-10', n <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300')} />
            </button>
          ))}
        </div>
        {done && (
          <p className="mt-3 text-center text-emerald-600 font-extrabold inline-flex items-center gap-1 justify-center w-full">
            <CheckCircle2 className="w-4 h-4" /> Mission complete!
          </p>
        )}
      </div>
    </div>
  );
}
