import { useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { CAST, getEmotionSprite } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { PrimaryButton } from './shared';

/* ---------- Feelings wheel ---------- */

export function FeelingsWheelScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'feelings-wheel' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const n = scene.slots.length;
  const slice = 360 / n;
  const colors = ['#FE6A2F', '#4FA9E0', '#B85CD1', '#FFC93C', '#7BE0FF', '#E76FA5'];
  const gradient = scene.slots.map((_, i) => `${colors[i % colors.length]} ${i * slice}deg ${(i + 1) * slice}deg`).join(', ');
  // The landing slot is picked with Math.random() -- only the authority
  // spins, and the resulting rotation/landed travel as synced state so the
  // mirror's wheel plays the same 2.2s spin animation to the same result
  // instead of staying static.
  const [state, setState] = useSyncedState(sync, { rotation: 0, spinning: false, landed: null as number | null, said: false });
  const { rotation, spinning, landed, said } = state;
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;

  const spin = () => {
    if (isRemoteMirror || spinning || landed !== null) return;
    const target = Math.floor(Math.random() * n);
    const finalAngle = 360 * 5 - (target * slice + slice / 2);
    sfx.pop();
    setState((s) => ({ ...s, spinning: true, rotation: finalAngle }));
    window.setTimeout(async () => {
      sfx.match();
      setState((s) => ({ ...s, spinning: false, landed: target }));
      await safeSpeak(scene.slots[target].label, scene.slots[target].who);
    }, 2200);
  };

  // Mirror side isn't running spin(), so it needs its own cue to speak the
  // landed slot once it arrives via sync.
  const lastSpokenLandedRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isRemoteMirror || landed === null || lastSpokenLandedRef.current === landed) return;
    lastSpokenLandedRef.current = landed;
    void safeSpeak(scene.slots[landed].label, scene.slots[landed].who);
  }, [isRemoteMirror, landed, scene.slots]);

  const replay = () => { if (landed !== null) void safeSpeak(scene.slots[landed].label, scene.slots[landed].who); };
  const confirm = () => {
    if (isRemoteMirror || landed === null || said) return;
    sfx.gem();
    onWin(true);
    setState((s) => ({ ...s, said: true }));
  };
  const slot = landed !== null ? scene.slots[landed] : null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-cover bg-center px-4 pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="relative z-10 max-w-lg rounded-full bg-white/95 px-5 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">{scene.teacher}</div>

      <div className="relative z-10 mx-auto my-2" style={{ width: 'clamp(260px, calc(40*var(--svh,1vh)), 340px)', height: 'clamp(260px, calc(40*var(--svh,1vh)), 340px)' }}>
        {/* Pointer — a small carnival-style teardrop instead of a bare emoji glyph. */}
        <div
          className="pointer-events-none absolute -top-2 left-1/2 z-20 h-8 w-8 -translate-x-1/2 rounded-full shadow-lg"
          style={{ background: 'linear-gradient(135deg, #FF8A4C, #E5561A)', clipPath: 'polygon(50% 100%, 0% 15%, 100% 15%)', border: '3px solid white' }}
        />
        <div
          className="absolute inset-0 rounded-full shadow-2xl"
          style={{
            background: `conic-gradient(${gradient})`,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 2.2s cubic-bezier(0.15,0.65,0.25,1)' : 'none',
            border: '10px solid white',
            boxShadow: '0 20px 45px -12px rgba(0,0,0,0.5), inset 0 0 0 3px rgba(0,0,0,0.08)',
          }}
        >
          {scene.slots.map((s, i) => {
            const angleDeg = i * slice + slice / 2 - 90;
            const rad = (angleDeg * Math.PI) / 180;
            const radius = 34; // % of wheel radius
            return (
              <div
                key={i}
                className="absolute grid place-items-center rounded-2xl border-2 border-white bg-white/90 shadow-lg"
                style={{
                  left: `${50 + radius * Math.cos(rad)}%`,
                  top: `${50 + radius * Math.sin(rad)}%`,
                  width: '26%',
                  height: '26%',
                  transform: 'translate(-50%,-50%)',
                }}
              >
                <img src={getEmotionSprite(s.who, s.emotion)} alt={`${CAST[s.who].name} ${s.emotion}`} className="h-full w-full object-contain p-0.5" draggable={false} />
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-12 w-12 rounded-full border-4 border-orange-400 bg-white shadow-lg" style={{ background: 'radial-gradient(circle at 35% 30%, #fff 0%, #FFE8B0 55%, #FEBE4C 100%)' }} />
        </div>
      </div>

      {landed === null ? (
        <button onClick={spin} disabled={spinning} className="relative z-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95 disabled:opacity-60">
          {spinning ? '🌀 Spinning…' : '🎡 Spin the wheel!'}
        </button>
      ) : (
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white/95 px-5 py-3 shadow-xl">
            <img src={getEmotionSprite(slot!.who, slot!.emotion)} alt={CAST[slot!.who].name} className="h-14 w-14 object-contain" draggable={false} />
            <p className="text-2xl font-black" style={{ color: CAST[slot!.who].color }}>{slot!.label}!</p>
          </div>
          {!said ? (
            <div className="flex gap-3">
              <button onClick={replay} className="rounded-full bg-white/95 px-5 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔊 Hear again</button>
              <button onClick={confirm} className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-base font-black text-white shadow-xl active:scale-95">✅ I said it!</button>
            </div>
          ) : (
            <PrimaryButton onClick={onNext}>Next →</PrimaryButton>
          )}
        </div>
      )}
    </div>
  );
}
