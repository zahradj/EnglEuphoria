import { useMemo } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { RAINBOW_10, NUMBER_WORDS, numberSpeech } from './shared';

/* ---------- Numbers / age (Lesson 4 birthday block) ---------- */

export function NumbersLearnScene({ scene, onNext, sync }: { scene: Extract<Scene, { kind: 'numbers-learn' }>; onNext: () => void; sync?: ActivitySync }) {
  const numbers = useMemo(() => Array.from({ length: scene.to - scene.from + 1 }, (_, i) => scene.from + i), [scene.from, scene.to]);
  // `heard` is a plain number[] (not a Set) so it survives the JSON
  // broadcast round-trip.
  const [state, setState] = useSyncedState(sync, { heard: [] as number[], popN: null as number | null });
  const { heard, popN } = state;
  const heardSet = useMemo(() => new Set(heard), [heard]);

  const tapNumber = async (n: number) => {
    setState((s) => ({ ...s, heard: s.heard.includes(n) ? s.heard : [...s.heard, n], popN: n }));
    sfx.pop();
    await safeSpeak(numberSpeech(n), scene.who);
    setState((s) => (s.popN === n ? { ...s, popN: null } : s));
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 px-4 text-center">
        <span className="w-fit rounded-full bg-white/90 px-4 py-1 text-xs font-black uppercase tracking-widest text-orange-700 shadow">Numbers 1 → {scene.to}</span>
        <span className="max-w-lg rounded-full bg-white/95 px-5 py-2 text-sm font-bold text-orange-800 shadow-xl backdrop-blur sm:text-base">{scene.teacher}</span>
      </div>
      {popN !== null && (
        <div key={popN} className="pointer-events-none absolute inset-x-0 top-1/3 z-20 flex flex-col items-center" style={{ animation: 'lep1-pop 0.4s ease-out' }}>
          <span className="text-7xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">{popN}</span>
          <span className="mt-1 rounded-full bg-white/90 px-4 py-1 text-lg font-black text-orange-700 shadow">{NUMBER_WORDS[popN - 1]}</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-24 flex flex-wrap items-center justify-center gap-2 px-4 sm:gap-3">
        {numbers.map((n) => {
          const color = RAINBOW_10[(n - 1) % RAINBOW_10.length];
          return (
            <button key={n} onClick={() => void tapNumber(n)}
              className="rounded-2xl border-4 font-black text-white shadow-lg transition-transform active:scale-95"
              style={{ width: 'min(calc(11*var(--svw,1vw)), 74px)', height: 'min(calc(11*var(--svw,1vw)), 74px)', fontSize: 'min(calc(6*var(--svw,1vw)), 32px)', background: color, borderColor: 'rgba(255,255,255,0.85)', opacity: heardSet.has(n) ? 0.6 : 1 }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <button onClick={onNext} className="absolute inset-x-0 bottom-6 z-20 mx-auto w-fit rounded-full bg-orange-500 px-8 py-3 text-lg font-black text-white shadow-xl transition hover:bg-orange-600 active:scale-95">Next →</button>
    </div>
  );
}
