import { useMemo, useState } from 'react';
import { Sparkles, RotateCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HomeworkActivityProps } from './types';
import { HUB_THEME } from './types';

/** 4-card flip-and-tap. Cards are derived from the task prompt + filler distractors. */
export function VocabRecall({ hub, task, onComplete }: HomeworkActivityProps) {
  const theme = HUB_THEME[hub];
  const cards = useMemo(() => {
    const base = task.prompt.split(/[,;:.\s]+/).filter((w) => w.length > 3).slice(0, 3);
    const filler = ['always', 'maybe', 'never'];
    const seed = [...base, ...filler].slice(0, 4);
    return seed.map((w, i) => ({ id: i, word: w, isTarget: i < base.length }));
  }, [task.prompt]);

  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [picked, setPicked] = useState<Set<number>>(new Set());

  const flip = (id: number) => setFlipped((s) => new Set(s).add(id));
  const pick = (id: number) => {
    if (picked.has(id)) return;
    const next = new Set(picked).add(id);
    setPicked(next);
    const target = cards.filter((c) => c.isTarget).map((c) => c.id);
    if (target.every((t) => next.has(t))) onComplete?.();
  };

  const complete = cards.every((c) => !c.isTarget || picked.has(c.id));

  return (
    <div className={cn('mx-auto w-full max-w-xl rounded-3xl border-2 p-6 shadow-xl', theme.frame)}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className={cn('w-5 h-5', theme.accent)} />
        <span className={cn('text-xs font-extrabold uppercase tracking-wider', theme.accent)}>Vocab Recall</span>
      </div>
      <p className="text-sm font-bold text-slate-700 mb-4">Tap each card to flip, then pick the words from the lesson.</p>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => {
          const isFlipped = flipped.has(c.id);
          const isPicked = picked.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => (isFlipped ? pick(c.id) : flip(c.id))}
              className={cn(
                'aspect-[5/3] rounded-2xl border-2 font-extrabold text-lg shadow-md transition transform active:scale-95',
                !isFlipped && 'bg-white border-slate-200 text-slate-400',
                isFlipped && !isPicked && cn('bg-white border-slate-300 text-slate-800'),
                isPicked && c.isTarget && 'bg-emerald-100 border-emerald-500 text-emerald-800',
                isPicked && !c.isTarget && 'bg-rose-100 border-rose-400 text-rose-700',
              )}
            >
              {isFlipped ? c.word : <RotateCw className="w-6 h-6 mx-auto opacity-60" />}
            </button>
          );
        })}
      </div>
      {complete && (
        <p className="mt-4 text-center text-emerald-600 font-extrabold inline-flex items-center gap-1 justify-center w-full">
          <CheckCircle2 className="w-4 h-4" /> Great recall!
        </p>
      )}
    </div>
  );
}
