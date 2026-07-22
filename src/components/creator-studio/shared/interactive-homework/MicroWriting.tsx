import { useState } from 'react';
import { PenLine, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HomeworkActivityProps } from './types';
import { HUB_THEME } from './types';

export function MicroWriting({ hub, task, onComplete }: HomeworkActivityProps) {
  const theme = HUB_THEME[hub];
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const wc = text.trim().split(/\s+/).filter(Boolean).length;
  const ready = wc >= 12;

  const submit = () => { if (!ready) return; setDone(true); onComplete?.(); };

  return (
    <div className={cn('mx-auto w-full max-w-xl rounded-3xl border-2 p-6 shadow-xl', theme.frame)}>
      <div className="flex items-center gap-2 mb-3">
        <PenLine className={cn('w-5 h-5', theme.accent)} />
        <span className={cn('text-xs font-extrabold uppercase tracking-wider', theme.accent)}>Micro Writing</span>
      </div>
      <p className="text-sm font-bold text-slate-700 mb-3">"{task.prompt}"</p>
      <div className="rounded-2xl bg-[repeating-linear-gradient(0deg,white,white_31px,#e2e8f0_32px)] border-2 border-slate-200 p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full bg-transparent outline-none text-base leading-8 resize-none"
          placeholder="Write your answer here…"
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={cn('text-xs font-bold', ready ? 'text-emerald-600' : 'text-slate-500')}>
          {wc} / 12 words {ready && '✓'}
        </span>
        <button
          onClick={submit}
          disabled={!ready || done}
          className={cn('rounded-lg px-4 py-2 text-xs font-extrabold shadow', theme.button, (!ready || done) && 'opacity-40')}
        >
          Submit
        </button>
      </div>
      {done && (
        <p className="mt-3 text-center text-emerald-600 font-extrabold inline-flex items-center gap-1 justify-center w-full">
          <CheckCircle2 className="w-4 h-4" /> Submitted!
        </p>
      )}
    </div>
  );
}
