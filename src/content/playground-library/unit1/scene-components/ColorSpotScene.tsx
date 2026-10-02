import { useRef } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Color spot (tap the colored thing in the real scene) ---------- */

/**
 * New for the Unit 2 Lesson 1 rebuild — every other color activity in this
 * lesson teaches the word on an abstract card/icon; this one is the only
 * place a learner finds the color word by tapping the real illustrated
 * object inside a full scene, the same "arrow points at it, tap to reveal
 * a flashcard" pattern Welcome Town's vocab-spot uses, ported here for
 * colors instead of vocabulary items.
 */
export function ColorSpotScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'color-spot' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { step: 0, revealed: false });
  const { step, revealed } = state;
  const gemDone = useRef(false);
  const total = scene.items.length;
  const done = step >= total;
  const current = !done ? scene.items[step] : null;

  const tap = async () => {
    if (!current || revealed) return;
    sfx.pop();
    setState((s) => ({ ...s, revealed: true }));
    await safeSpeak(current.colorWord, current.who);
  };
  const hearSentence = async () => {
    if (!current) return;
    sfx.click();
    await safeSpeak(current.sentence, current.who);
  };
  const dismiss = () => {
    const next = step + 1;
    if (next >= total && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, revealed: false, step: next }));
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        {scene.teacher} <span className="ml-1 opacity-60">({Math.min(step, total)}/{total})</span>
      </div>
      {current && (() => {
        const dir = current.dir ?? 'down';
        const GAP = 62;
        const pos = dir === 'down'
          ? { left: current.left, top: `calc(${current.top} - ${GAP}px)` }
          : dir === 'right'
          ? { left: `calc(${current.left} - ${GAP}px)`, top: current.top }
          : { left: `calc(${current.left} + ${GAP}px)`, top: current.top };
        const angle = dir === 'down' ? 0 : dir === 'right' ? -90 : 90;
        return (
          <button
            onClick={tap}
            disabled={revealed}
            aria-label={`Find the color ${current.colorWord}`}
            className="absolute z-20 transition active:scale-90 disabled:pointer-events-none"
            style={{ ...pos, transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
          >
            <span className="relative block" style={{ animation: revealed ? undefined : 'lep1-hop 0.9s ease-in-out infinite' }}>
              {!revealed && (
                <span className="pointer-events-none absolute bottom-0 left-1/2 h-12 w-12 -translate-x-1/2 translate-y-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${current.colorHex}88, transparent 65%)`, animation: 'lep1-ping 1.4s ease-out infinite' }} />
              )}
              <svg width="52" height="76" viewBox="0 0 40 58" className="relative drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
                <path
                  d="M13 3 C13 1.9 13.9 1 15 1 L25 1 C26.1 1 27 1.9 27 3 L27 21 L36 21 C37.9 21 38.8 23.3 37.4 24.6 L21.4 43.6 C20.6 44.5 19.4 44.5 18.6 43.6 L2.6 24.6 C1.2 23.3 2.1 21 4 21 L13 21 Z"
                  fill={current.colorHex}
                  stroke="white"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        );
      })()}
      {current && revealed && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 px-6" onClick={dismiss} style={{ animation: 'lep1-pop 0.25s ease-out' }}>
          <div className="flex w-full max-w-sm flex-col items-center gap-2 rounded-[2rem] border-4 border-white bg-white px-6 py-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <span className="grid h-16 w-16 place-items-center rounded-full text-4xl" style={{ background: `${current.colorHex}22` }}>
              {current.splashImg ? <img src={current.splashImg} alt="" className="h-12 w-12 object-contain" /> : '🎨'}
            </span>
            <span className="text-3xl font-black uppercase" style={{ color: current.colorHex }}>{current.colorWord}</span>
            <span className="text-lg font-bold text-slate-700">{current.label}</span>
            <button onClick={hearSentence} className="text-sm font-semibold text-neutral-500 underline decoration-dotted active:scale-95">🔊 Hear it in a sentence: “{current.sentence}”</button>
            <button onClick={dismiss} className="mt-2 rounded-full px-6 py-2 text-sm font-black uppercase tracking-widest text-white shadow active:scale-95" style={{ background: current.colorHex }}>Got it!</button>
          </div>
        </div>
      )}
      {done && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">All found! ⭐ Next</button>
        </div>
      )}
    </div>
  );
}
