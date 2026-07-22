import { useState } from 'react';
import { Headphones, Play, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HomeworkActivityProps } from './types';
import { HUB_THEME } from './types';

export function ListeningRecap({ hub, task, onComplete }: HomeworkActivityProps) {
  const theme = HUB_THEME[hub];
  const [playing, setPlaying] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const choices = ['Main idea matches', 'Off topic', 'Partly correct'];
  const correctIdx = 0;

  const pick = (i: number) => {
    setAnswer(i);
    if (i === correctIdx) onComplete?.();
  };

  return (
    <div className={cn('mx-auto w-full max-w-md rounded-3xl border-2 p-6 shadow-xl', theme.frame)}>
      <div className="flex items-center gap-2 mb-3">
        <Headphones className={cn('w-5 h-5', theme.accent)} />
        <span className={cn('text-xs font-extrabold uppercase tracking-wider', theme.accent)}>Listening Recap</span>
      </div>
      <div className="rounded-2xl bg-white border-2 border-slate-200 p-4 shadow-sm">
        <p className="text-sm font-bold text-slate-700">"{task.prompt}"</p>
        <button
          onClick={() => setPlaying(true)}
          className={cn('mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2 font-extrabold shadow active:scale-95', theme.button)}
        >
          <Play className="w-4 h-4" /> {playing ? 'Replay' : 'Play clip'}
        </button>
      </div>
      <p className="mt-4 text-xs font-bold text-slate-600 mb-2">What was the main idea?</p>
      <div className="space-y-2">
        {choices.map((c, i) => (
          <button
            key={c}
            onClick={() => pick(i)}
            className={cn('w-full text-left rounded-xl border-2 px-4 py-3 font-semibold text-sm transition',
              answer === null && 'bg-white border-slate-200 hover:border-slate-300',
              answer === i && i === correctIdx && 'bg-emerald-100 border-emerald-500 text-emerald-800',
              answer === i && i !== correctIdx && 'bg-rose-100 border-rose-400 text-rose-700',
              answer !== null && answer !== i && 'bg-white border-slate-200 opacity-60',
            )}
          >
            {c}
          </button>
        ))}
      </div>
      {answer === correctIdx && (
        <p className="mt-3 text-center text-emerald-600 font-extrabold inline-flex items-center gap-1 justify-center w-full">
          <CheckCircle2 className="w-4 h-4" /> Spot on!
        </p>
      )}
    </div>
  );
}
