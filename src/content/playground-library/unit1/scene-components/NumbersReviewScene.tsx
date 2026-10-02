import { useEffect, useMemo, useRef } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { RAINBOW_10, NUMBER_WORDS, numberSpeech } from './shared';

export function NumbersReviewScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'numbers-review' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const numbers = useMemo(() => Array.from({ length: scene.to - scene.from + 1 }, (_, i) => scene.from + i), [scene.from, scene.to]);
  // `target` is Math.random()-picked -- only the authority picks it (both
  // the initial one and each subsequent one after a correct tap) and it
  // travels as synced state, same fix as the other Math.random() cases in
  // this pass.
  const [state, setState] = useSyncedState(sync, { target: numbers[0], correct: 0, wrongTap: null as number | null, gemDone: false });
  const { target, correct, wrongTap, gemDone } = state;
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const ready = correct >= 8;

  const startedRef = useRef(false);
  useEffect(() => {
    if (isRemoteMirror || startedRef.current) return;
    startedRef.current = true;
    setState((s) => ({ ...s, target: numbers[Math.floor(Math.random() * numbers.length)] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRemoteMirror]);

  useEffect(() => {
    if (ready) return;
    const t = window.setTimeout(() => void safeSpeak(numberSpeech(target), scene.who), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const tapNumber = (n: number) => {
    if (isRemoteMirror || ready) return;
    if (n === target) {
      sfx.match();
      const next = correct + 1;
      const awardGem = next >= 8 && !gemDone;
      if (awardGem) { sfx.gem(); onWin(true); }
      setState((s) => ({ ...s, correct: next, gemDone: s.gemDone || awardGem, target: numbers[Math.floor(Math.random() * numbers.length)] }));
    } else {
      sfx.wrong();
      setState((s) => ({ ...s, wrongTap: n }));
      window.setTimeout(() => setState((s) => ({ ...s, wrongTap: null })), 400);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 px-4 text-center">
        <span className="w-fit rounded-full bg-white/90 px-4 py-1 text-xs font-black uppercase tracking-widest text-orange-700 shadow">Tap the number</span>
        <span className="max-w-lg rounded-full bg-white/95 px-5 py-2 text-sm font-bold text-orange-800 shadow-xl backdrop-blur sm:text-base">{ready ? '🎉 Great counting!' : scene.teacher}</span>
        {!ready && (
          <button onClick={() => void safeSpeak(numberSpeech(target), scene.who)} className="mt-0.5 rounded-full bg-orange-500 px-4 py-1 text-sm font-black text-white shadow active:scale-95">
            🔊 {NUMBER_WORDS[target - 1]}
          </button>
        )}
      </div>
      <div className="pointer-events-none absolute bottom-40 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1 text-sm font-black text-orange-700 shadow">{correct}/8</div>
      <div className="absolute inset-x-0 bottom-24 flex flex-wrap items-center justify-center gap-2 px-4 sm:gap-3">
        {numbers.map((n) => {
          const color = RAINBOW_10[(n - 1) % RAINBOW_10.length];
          return (
            <button key={n} onClick={() => tapNumber(n)} disabled={ready}
              className={`rounded-2xl border-4 font-black text-white shadow-lg transition-transform active:scale-95 disabled:opacity-70 ${wrongTap === n ? 'animate-[lep1-shake_0.4s_ease-out]' : ''}`}
              style={{ width: 'min(calc(13*var(--svw,1vw)), 92px)', height: 'min(calc(13*var(--svw,1vw)), 92px)', fontSize: 'min(calc(7*var(--svw,1vw)), 42px)', background: color, borderColor: wrongTap === n ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.55)' }}
            >
              {n}
            </button>
          );
        })}
      </div>
      {ready && <button onClick={onNext} className="absolute inset-x-0 bottom-6 z-20 mx-auto w-fit rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">I'm ready! →</button>}
    </div>
  );
}
