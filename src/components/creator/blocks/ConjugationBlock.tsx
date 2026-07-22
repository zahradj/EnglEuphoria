import { useMemo, useState } from 'react';
import { Check, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { playDing, playBuzz, playClick } from '@/lib/gameAudio';

export interface ConjugationPair {
  left: string;
  right: string;
}

export interface ConjugationConfig {
  prompt?: string;
  pairs: ConjugationPair[];
}

interface Props {
  config: ConjugationConfig;
  onChange?: (next: ConjugationConfig) => void;
  mode?: 'edit' | 'play';
}

const COLORS = ['border-indigo-400', 'border-amber-400', 'border-emerald-400', 'border-rose-400', 'border-fuchsia-400', 'border-sky-400'];

export default function ConjugationBlock({ config, onChange, mode = 'play' }: Props) {
  if (mode === 'edit' && onChange) {
    return (
      <div className="space-y-2">
        {config.prompt !== undefined && (
          <input
            value={config.prompt || ''}
            onChange={(e) => onChange({ ...config, prompt: e.target.value })}
            placeholder="Prompt (optional)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        )}
        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Pairs to match</div>
        {config.pairs.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={p.left}
              onChange={(e) => { const next = [...config.pairs]; next[i] = { ...p, left: e.target.value }; onChange({ ...config, pairs: next }); }}
              className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="Left"
            />
            <span className="text-slate-400">↔</span>
            <input
              value={p.right}
              onChange={(e) => { const next = [...config.pairs]; next[i] = { ...p, right: e.target.value }; onChange({ ...config, pairs: next }); }}
              className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              placeholder="Right"
            />
            <button
              onClick={() => onChange({ ...config, pairs: config.pairs.filter((_, idx) => idx !== i) })}
              className="p-1.5 text-slate-400 hover:text-rose-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange({ ...config, pairs: [...config.pairs, { left: '', right: '' }] })}
          className="w-full inline-flex items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-400 px-3 py-2 text-sm text-slate-600"
        >
          <Plus className="w-4 h-4" /> Add pair
        </button>
      </div>
    );
  }

  return <ConjugationPlayer config={config} />;
}

function ConjugationPlayer({ config }: { config: ConjugationConfig }) {
  const left = config.pairs.map((p, i) => ({ id: `L-${i}`, label: p.left, pair: i }));
  const right = useMemo(
    () => [...config.pairs.map((p, i) => ({ id: `R-${i}`, label: p.right, pair: i }))].sort(() => Math.random() - 0.5),
    [config.pairs]
  );

  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); // left id → right id
  const [solved, setSolved] = useState(false);

  function pickLeft(id: string) {
    if (solved || matches[id]) return;
    setActiveLeft(id);
    playClick();
  }
  function pickRight(rightId: string, pair: number) {
    if (solved || !activeLeft) return;
    const leftCell = left.find((l) => l.id === activeLeft);
    if (!leftCell) return;
    if (leftCell.pair === pair) {
      const next = { ...matches, [activeLeft]: rightId };
      setMatches(next);
      setActiveLeft(null);
      playDing();
      if (Object.keys(next).length === left.length) setSolved(true);
    } else {
      playBuzz();
      setActiveLeft(null);
    }
  }

  function reset() {
    setMatches({});
    setActiveLeft(null);
    setSolved(false);
  }

  const rightById = Object.fromEntries(right.map((r) => [r.id, r]));
  const usedRight = new Set(Object.values(matches));

  return (
    <div className="space-y-4">
      {config.prompt && <p className="text-slate-700">{config.prompt}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {left.map((l, i) => {
            const matched = !!matches[l.id];
            return (
              <button
                key={l.id}
                onClick={() => pickLeft(l.id)}
                disabled={matched}
                className={`w-full rounded-xl border-2 px-3 py-2 font-semibold text-slate-800 transition ${matched ? `bg-emerald-50 ${COLORS[l.pair % COLORS.length]}` : activeLeft === l.id ? 'border-indigo-500 ring-2 ring-indigo-300 bg-white' : 'border-slate-300 bg-white hover:border-indigo-400'}`}
              >
                {l.label}
                {matched && <span className="ml-2 text-xs text-emerald-600">→ {rightById[matches[l.id]]?.label}</span>}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {right.map((r) => {
            const used = usedRight.has(r.id);
            return (
              <button
                key={r.id}
                onClick={() => pickRight(r.id, r.pair)}
                disabled={used}
                className={`w-full rounded-xl border-2 px-3 py-2 font-semibold text-slate-800 transition ${used ? `bg-emerald-50 ${COLORS[r.pair % COLORS.length]} opacity-60` : 'border-slate-300 bg-white hover:border-indigo-400'}`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={reset} className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-sm">
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        {solved && <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold"><Check className="w-4 h-4" /> All matched!</span>}
      </div>
    </div>
  );
}
