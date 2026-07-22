import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { playDing, playBuzz, playClick } from '@/lib/gameAudio';

export interface VerbTrio {
  present: string;
  past: string;
  participle: string;
}

export interface VerbTrioContent {
  prompt?: string;
  trios: VerbTrio[];
}

interface Props {
  content: VerbTrioContent;
  onComplete?: () => void;
}

type Col = 'present' | 'past' | 'participle';

export default function VerbMatchingGame({ content, onComplete }: Props) {
  // Shuffle each column independently for the puzzle
  const [columns] = useState(() => {
    const present = content.trios.map((t, i) => ({ id: `p-${i}`, word: t.present, trio: i }));
    const past = [...content.trios.map((t, i) => ({ id: `pa-${i}`, word: t.past, trio: i }))]
      .sort(() => Math.random() - 0.5);
    const participle = [...content.trios.map((t, i) => ({ id: `pp-${i}`, word: t.participle, trio: i }))]
      .sort(() => Math.random() - 0.5);
    return { present, past, participle };
  });

  // user selections per row (present row index → chosen past id, participle id)
  const [picks, setPicks] = useState<Record<number, { past?: string; participle?: string }>>({});
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  function selectWord(col: Col, id: string, trioIndex: number) {
    if (solved) return;
    if (col === 'present') {
      setActiveRow(trioIndex);
      playClick();
      return;
    }
    if (activeRow === null) return;
    setPicks((prev) => ({ ...prev, [activeRow]: { ...prev[activeRow], [col]: id } }));
    playClick();
  }

  function check() {
    let correct = 0;
    for (let i = 0; i < columns.present.length; i++) {
      const sel = picks[i];
      if (!sel) continue;
      const past = columns.past.find((c) => c.id === sel.past);
      const part = columns.participle.find((c) => c.id === sel.participle);
      if (past?.trio === i && part?.trio === i) correct++;
    }
    if (correct === columns.present.length) {
      setSolved(true);
      playDing();
      onComplete?.();
    } else {
      playBuzz();
    }
  }

  function reset() {
    setPicks({});
    setActiveRow(null);
    setSolved(false);
  }

  function isPicked(col: Col, id: string): number | null {
    for (const [row, sel] of Object.entries(picks)) {
      if ((col === 'past' && sel.past === id) || (col === 'participle' && sel.participle === id)) {
        return Number(row);
      }
    }
    return null;
  }

  const rowColors = ['bg-rose-100', 'bg-amber-100', 'bg-emerald-100', 'bg-sky-100', 'bg-violet-100', 'bg-orange-100'];

  return (
    <div className="space-y-5">
      {content.prompt && <p className="text-slate-700">{content.prompt}</p>}
      <p className="text-xs text-slate-500">
        Click a verb in <strong>Present</strong> to activate its row, then pick its matching <strong>Past</strong> and <strong>Past Participle</strong>.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {(['present', 'past', 'participle'] as const).map((col) => (
          <div key={col} className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500 text-center">
              {col === 'participle' ? 'Past Participle' : col === 'past' ? 'Past' : 'Present'}
            </div>
            {columns[col].map((cell) => {
              const isActive = col === 'present' && activeRow === cell.trio;
              const pickedRow = col === 'present' ? cell.trio : isPicked(col, cell.id);
              const colorClass = pickedRow !== null ? rowColors[pickedRow % rowColors.length] : 'bg-white';
              return (
                <button
                  key={cell.id}
                  onClick={() => selectWord(col, cell.id, cell.trio)}
                  className={`w-full px-3 py-2 rounded-xl border-2 font-semibold text-slate-800 transition ${colorClass} ${isActive ? 'border-indigo-500 ring-2 ring-indigo-300' : 'border-slate-300 hover:border-indigo-400'}`}
                >
                  {cell.word}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={check}
          disabled={solved}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg px-4 py-2 text-sm disabled:opacity-50"
        >
          <Check className="w-4 h-4" /> Check
        </button>
        <button onClick={reset} className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-sm">
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        {solved && <span className="text-emerald-600 font-semibold">All matched! 🎉</span>}
      </div>
    </div>
  );
}
