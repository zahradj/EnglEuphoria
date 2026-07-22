import { useMemo, useState } from 'react';
import { ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HomeworkActivityProps } from './types';
import { HUB_THEME } from './types';

/** Build a target sentence from scrambled word tokens. */
export function SentenceBuild({ hub, task, onComplete }: HomeworkActivityProps) {
  const theme = HUB_THEME[hub];
  const target = useMemo(() => {
    const s = task.prompt.replace(/[.?!]/g, '').trim();
    return s.split(/\s+/).slice(0, 9).join(' ') || 'I like to learn English';
  }, [task.prompt]);

  const targetTokens = useMemo(() => target.split(' '), [target]);
  const scrambled = useMemo(
    () => targetTokens.map((w, i) => ({ w, i })).sort((a, b) => ((a.w + a.i).localeCompare(b.w + b.i))),
    [targetTokens]
  );

  const [pool, setPool] = useState(scrambled);
  const [built, setBuilt] = useState<{ w: string; i: number }[]>([]);
  const [done, setDone] = useState(false);
  const [wrong, setWrong] = useState(false);

  const check = () => {
    const sentence = built.map((t) => t.w).join(' ');
    if (sentence === target) {
      setDone(true);
      onComplete?.();
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 500);
    }
  };

  return (
    <div className={cn('mx-auto w-full max-w-xl rounded-3xl border-2 p-6 shadow-xl', theme.frame)}>
      <p className={cn('text-xs font-extrabold uppercase tracking-wider mb-3', theme.accent)}>Build the Sentence</p>
      <p className="text-sm font-bold text-slate-700 mb-3">Tap the words in the right order.</p>

      <div className={cn(
        'min-h-[72px] rounded-2xl border-2 border-dashed bg-white p-3 flex flex-wrap gap-2 justify-center items-center',
        done && 'border-emerald-500 bg-emerald-50',
        wrong && 'border-rose-400 bg-rose-50 animate-[shake_0.4s]',
        !done && !wrong && 'border-slate-300',
      )}>
        {built.length === 0 && <span className="text-xs text-slate-400 italic">Tap a word below…</span>}
        {built.map((t) => (
          <button
            key={`${t.w}-${t.i}`}
            onClick={() => { setBuilt(built.filter((x) => x !== t)); setPool([...pool, t]); }}
            className="px-3 py-1.5 bg-white border-2 border-slate-300 rounded-lg font-semibold text-slate-800 hover:bg-slate-50 text-sm"
          >
            {t.w}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        {pool.map((t) => (
          <button
            key={`p-${t.w}-${t.i}`}
            onClick={() => { setPool(pool.filter((x) => x !== t)); setBuilt([...built, t]); }}
            className={cn('px-3 py-1.5 rounded-lg font-bold text-sm shadow active:scale-95', theme.button)}
          >
            {t.w}
          </button>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => { setPool(scrambled); setBuilt([]); }}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 text-slate-700"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
        <button
          onClick={check}
          disabled={built.length === 0 || done}
          className={cn('inline-flex items-center gap-1 rounded-lg px-4 py-1.5 text-xs font-extrabold shadow active:scale-95', theme.button, (built.length === 0 || done) && 'opacity-40')}
        >
          Check <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      {done && (
        <p className="mt-3 text-center text-emerald-600 font-extrabold inline-flex items-center gap-1 justify-center w-full">
          <CheckCircle2 className="w-4 h-4" /> Perfect sentence!
        </p>
      )}
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`}</style>
    </div>
  );
}
