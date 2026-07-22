import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface SpinningWheelConfig {
  segments: string[];
}

interface Props {
  config: SpinningWheelConfig;
  onChange?: (next: SpinningWheelConfig) => void;
  mode?: 'edit' | 'play';
}

const PALETTE = ['#fbbf24', '#fb7185', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#f97316', '#22d3ee'];

export default function SpinningWheelBlock({ config, onChange, mode = 'play' }: Props) {
  const segs = config.segments.length >= 2 ? config.segments.slice(0, 8) : ['Yes', 'No'];
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  function spin() {
    if (spinning) return;
    const turns = 4 + Math.random() * 4;
    const stop = Math.random() * 360;
    const next = angle + turns * 360 + stop;
    setSpinning(true);
    setWinner(null);
    setAngle(next);
    setTimeout(() => {
      const normalized = ((next % 360) + 360) % 360;
      // pointer at top → invert
      const idx = Math.floor(((360 - normalized) % 360) / (360 / segs.length)) % segs.length;
      setWinner(segs[idx]);
      setSpinning(false);
    }, 3200);
  }

  function updateSeg(i: number, v: string) {
    if (!onChange) return;
    const next = [...config.segments];
    next[i] = v;
    onChange({ segments: next });
  }
  function addSeg() {
    if (!onChange || config.segments.length >= 8) return;
    onChange({ segments: [...config.segments, `Item ${config.segments.length + 1}`] });
  }
  function removeSeg(i: number) {
    if (!onChange || config.segments.length <= 2) return;
    onChange({ segments: config.segments.filter((_, idx) => idx !== i) });
  }

  const size = 240;
  const r = size / 2;
  const sliceAngle = 360 / segs.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <div className="relative flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          {/* pointer */}
          <div className="absolute left-1/2 -top-2 -translate-x-1/2 z-10 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-[16px] border-t-slate-800" />
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="rounded-full border-4 border-slate-800 shadow-lg"
            style={{ transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 3.1s cubic-bezier(0.17, 0.67, 0.21, 0.99)' : 'none' }}
          >
            {segs.map((label, i) => {
              const start = i * sliceAngle - 90;
              const end = start + sliceAngle;
              const x1 = r + r * Math.cos((start * Math.PI) / 180);
              const y1 = r + r * Math.sin((start * Math.PI) / 180);
              const x2 = r + r * Math.cos((end * Math.PI) / 180);
              const y2 = r + r * Math.sin((end * Math.PI) / 180);
              const large = sliceAngle > 180 ? 1 : 0;
              const path = `M ${r} ${r} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
              const mid = start + sliceAngle / 2;
              const tx = r + r * 0.6 * Math.cos((mid * Math.PI) / 180);
              const ty = r + r * 0.6 * Math.sin((mid * Math.PI) / 180);
              return (
                <g key={i}>
                  <path d={path} fill={PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth={2} />
                  <text
                    x={tx}
                    y={ty}
                    fill="#0f172a"
                    fontSize={12}
                    fontWeight={700}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${mid + 90} ${tx} ${ty})`}
                  >
                    {label.length > 10 ? label.slice(0, 10) + '…' : label}
                  </text>
                </g>
              );
            })}
            <circle cx={r} cy={r} r={14} fill="#0f172a" />
          </svg>
        </div>
        <button
          onClick={spin}
          disabled={spinning}
          className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow disabled:opacity-50"
        >
          {spinning ? 'Spinning…' : 'Spin'}
        </button>
        {winner && !spinning && (
          <div className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold">{winner}</div>
        )}
      </div>

      {mode === 'edit' && onChange && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Segments (2–8)</div>
          {config.segments.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
              <input
                value={s}
                onChange={(e) => updateSeg(i, e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
              <button
                onClick={() => removeSeg(i)}
                disabled={config.segments.length <= 2}
                className="p-1.5 text-slate-500 hover:text-rose-600 disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addSeg}
            disabled={config.segments.length >= 8}
            className="w-full inline-flex items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-400 px-3 py-2 text-sm text-slate-600 disabled:opacity-40"
          >
            <Plus className="w-4 h-4" /> Add segment
          </button>
        </div>
      )}
    </div>
  );
}
