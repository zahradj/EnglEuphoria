import { useRef } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, cueSpeak } from '../audio';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { GlassCard, PrimaryButton } from './shared';

/* ---------- Echo ---------- */

export function EchoScene({ scene, onWin, onNext, sync }: { scene: Extract<Scene, { kind: 'echo' }>; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { heard: 0, held: false, done: false });
  const { heard, held, done } = state;
  const holdTimer = useRef<number | null>(null);
  const c = CAST[scene.who];


  const hear = async () => { setState((s) => ({ ...s, heard: s.heard + 1 })); await safeSpeak(scene.hearWord ?? scene.word, scene.who); };
  const startHold = () => {
    setState((s) => ({ ...s, held: true }));
    holdTimer.current = window.setTimeout(() => {
      setState((s) => ({ ...s, done: true, held: false }));
      onWin(true);
      cueSpeak('Amazing! Great voice!', 'pip');
    }, 1200);
  };
  const endHold = () => { setState((s) => ({ ...s, held: false })); if (holdTimer.current) window.clearTimeout(holdTimer.current); };

  return (
    // GlassCard has no built-in width limit — every other GlassCard-free scene
    // kind constrains itself via its own absolute layout, but this is the one
    // place GlassCard is used bare, so without this wrapper it stretches to
    // the full viewport width instead of reading as a compact centered card.
    <div className="mx-auto flex h-full w-full max-w-sm items-center justify-center px-4">
      <GlassCard className="w-full">
        <p className="text-center text-lg font-bold text-orange-700">{scene.teacher}</p>
        <div className="mt-3 grid place-items-center rounded-3xl bg-white/60 p-3">
          <img src={c.img} alt={c.name} width={96} height={96} className="h-24 w-24 object-contain animate-[lep1-hop_1.4s_ease-in-out_infinite]" />
          <p className="mt-2 text-2xl font-black" style={{ color: c.color }}>"{scene.word}"</p>
        </div>
        <button onClick={hear} className="mt-4 w-full rounded-full bg-white py-3 text-lg font-bold text-orange-700 shadow-md ring-2 ring-orange-200 active:scale-95">
          🔊 Listen {heard > 0 && <span className="text-sm opacity-60">({heard})</span>}
        </button>
        <button
          onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold} disabled={heard === 0}
          className={`mt-3 w-full rounded-full py-6 text-2xl font-black text-white shadow-xl transition ${held ? 'scale-95' : ''} disabled:opacity-40`}
          style={{ background: done ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #FE6A2F, #FF8A4C)' }}
        >
          {done ? '✅ Great job!' : held ? '🎤 Keep talking…' : '🎤 Hold & say it'}
        </button>
        <PrimaryButton onClick={onNext} disabled={!done}>Next →</PrimaryButton>
      </GlassCard>
    </div>
  );
}
