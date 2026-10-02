import { useMemo } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { RAINBOW_10, numberSpeech } from './shared';

/** Hand-drawn balloon — real body/string/highlight shape instead of the 🎈 emoji glyph, colored per RAINBOW_10. */
function Balloon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 180" className="h-full w-full">
      <path d="M50 108 Q 44 124, 54 138 Q 44 152, 54 166 Q 48 174, 50 178" stroke="rgba(255,255,255,0.9)" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="52" rx="38" ry="46" fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
      <ellipse cx="36" cy="36" rx="10" ry="16" fill="rgba(255,255,255,0.55)" />
      <circle cx="60" cy="30" r="4" fill="rgba(255,255,255,0.75)" />
      <polygon points="45,98 55,98 50,108" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
    </svg>
  );
}

export function CountBalloonsScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'count-balloons' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  // `popped` is a plain number[] (not a Set) so it survives the JSON
  // broadcast round-trip.
  const [state, setState] = useSyncedState(sync, { popped: [] as number[], gemDone: false });
  const { popped, gemDone } = state;
  const poppedSet = useMemo(() => new Set(popped), [popped]);
  const count = popped.length;
  const finished = count >= scene.total;

  const popNext = async (i: number) => {
    if (finished || poppedSet.has(i) || i !== count) return;
    sfx.pop();
    const nextPopped = [...popped, i];
    setState((s) => ({ ...s, popped: nextPopped }));
    await safeSpeak(numberSpeech(nextPopped.length), scene.who);
    if (nextPopped.length >= scene.total && !gemDone) { sfx.gem(); onWin(true); setState((s) => ({ ...s, gemDone: true })); }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 px-4 text-center">
        <span className="w-fit rounded-full bg-white/90 px-4 py-1 text-xs font-black uppercase tracking-widest text-orange-700 shadow">Pop & Count · 1 → {scene.total}</span>
        <span className="max-w-lg rounded-full bg-white/95 px-5 py-2 text-sm font-bold text-orange-800 shadow-xl backdrop-blur sm:text-base">{scene.teacher}</span>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center font-black text-white/90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
        <span className="text-7xl sm:text-8xl">{count}</span>
        <span className="text-3xl sm:text-4xl">/{scene.total}</span>
      </div>
      {Array.from({ length: scene.total }).map((_, i) => {
        const perRow = Math.min(5, scene.total);
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const rowCount = Math.min(perRow, scene.total - row * perRow);
        const x = ((col + 0.5) / rowCount) * 100;
        const y = 40 + row * 20;
        const rot = (col % 2 === 0 ? -1 : 1) * (4 + col * 2);
        const isPopped = poppedSet.has(i);
        const color = RAINBOW_10[i % RAINBOW_10.length];
        return (
          <button
            key={i}
            onClick={() => void popNext(i)}
            disabled={isPopped || i !== count}
            aria-label={`Balloon ${i + 1}`}
            className="absolute select-none"
            style={{
              left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) rotate(${rot}deg)`,
              width: 'min(calc(18*var(--svw,1vw)), 130px)', height: 'min(calc(30*var(--svw,1vw)), 228px)',
              opacity: isPopped ? 0 : 1, pointerEvents: isPopped ? 'none' : 'auto',
              transition: 'opacity 220ms',
              animation: `lep1-balloonFloat 3.6s ease-in-out ${(i % perRow) * 0.35}s infinite`,
              filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.3))',
            }}
          >
            <Balloon color={color} />
          </button>
        );
      })}
      <button onClick={finished ? onNext : undefined} disabled={!finished}
        className="absolute inset-x-0 bottom-6 z-20 mx-auto w-fit rounded-full bg-orange-500 px-8 py-3 text-lg font-black text-white shadow-xl transition hover:bg-orange-600 active:scale-95 disabled:opacity-50"
      >
        {finished ? 'Next →' : `Pop them all… (${scene.total - count} left)`}
      </button>
    </div>
  );
}
