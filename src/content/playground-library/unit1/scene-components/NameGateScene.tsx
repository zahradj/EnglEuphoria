import { useMemo } from 'react';
import type { Scene } from '../scenes';
import { CAST, comicPointForward } from '../scenes';
import { safeSpeak, cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Name gate ---------- */

export function NameGateScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'name-gate' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  // `opened` is a plain number[] (not a Set) so it survives the JSON
  // broadcast round-trip.
  const [state, setState] = useSyncedState(sync, { opened: [] as number[], active: null as number | null, gemDone: false, gateOpening: false });
  const { opened, active, gemDone, gateOpening } = state;
  const openedSet = useMemo(() => new Set(opened), [opened]);

  const handleOpenGate = () => {
    if (gateOpening) return;
    setState((s) => ({ ...s, gateOpening: true }));
    sfx.reveal();
    setTimeout(() => onNext(), 1400);
  };


  const boothSpots: Record<string, { left: string; top: string; size: number }> = {
    pip: { left: '16%', top: '55%', size: 170 },
    mia: { left: '83%', top: '40%', size: 140 },
    bella: { left: '72%', top: '66%', size: 170 },
  };

  const openBooth = async (idx: number) => {
    const round = scene.rounds[idx];
    if (!round) return;
    setState((s) => ({ ...s, active: idx }));
    sfx.reveal();
    await safeSpeak(round.question, 'teacher');
    await safeSpeak(round.answer, round.who);
    setState((s) => {
      const nextOpened = s.opened.includes(idx) ? s.opened : [...s.opened, idx];
      const justDone = nextOpened.length >= scene.rounds.length && !s.gemDone;
      if (justDone) { sfx.gem(); onWin(true); cueSpeak('What is your name?', 'pip'); }
      return { ...s, opened: nextOpened, gemDone: s.gemDone || justDone };
    });
  };

  const done = opened.length >= scene.rounds.length;

  return (
    <div className="absolute inset-0 z-10 overflow-hidden bg-black">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ aspectRatio: '1600 / 1008', width: 'min(calc(100*var(--svw,1vw)), calc(calc(100*var(--svh,1vh)) * 1600 / 1008))', height: 'min(calc(100*var(--svh,1vh)), calc(calc(100*var(--svw,1vw)) * 1008 / 1600))' }}>
        <img src={scene.bg} alt="" className="absolute inset-0 h-full w-full object-fill" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-orange-950/35" />
        {scene.rounds.map((round, idx) => {
          const c = CAST[round.who];
          const spot = boothSpots[round.who] ?? { left: '50%', top: '50%', size: 160 };
          const isOpen = openedSet.has(idx);
          const isActive = active === idx;
          return (
            <button key={round.who} onClick={() => openBooth(idx)} className="absolute z-20 touch-manipulation rounded-full transition active:scale-95"
              style={{ left: spot.left, top: spot.top, width: spot.size, height: spot.size, transform: 'translate(-50%, -50%)', background: 'transparent' }}
              aria-label={`Tap ${c.name} to hear the question and answer`}
            >
              {!isOpen && <span className="pointer-events-none absolute inset-0 rounded-full animate-ping" style={{ background: `radial-gradient(circle, ${c.color}66 0%, transparent 65%)` }} />}
              <span className="pointer-events-none absolute inset-0 rounded-full ring-4" style={{ boxShadow: isActive ? `0 0 40px ${c.color}` : 'none', borderColor: 'transparent' }} />
              {!isOpen ? (
                <span className="pointer-events-none absolute left-1/2 -top-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-black shadow-lg animate-bounce" style={{ color: c.color }}>👆 Tap {c.name}!</span>
              ) : (
                <span className="pointer-events-none absolute left-1/2 -bottom-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1 text-xs font-black text-white shadow-lg">{c.emoji} {c.name} ✓</span>
              )}
            </button>
          );
        })}
        {active !== null && (() => {
          const round = scene.rounds[active];
          const spot = boothSpots[round?.who ?? 'pip'] ?? { left: '50%', top: '50%', size: 160 };
          if (!round) return null;
          return (
            <div key={`bubble-${active}-${openedSet.has(active) ? 'a' : 'q'}`} className="pointer-events-none absolute z-30" style={{ left: spot.left, top: `calc(${spot.top} - 18%)`, transform: 'translate(-50%, -50%)' }}>
              <div className="relative max-w-[280px] rounded-3xl bg-white/95 px-5 py-3 text-center text-lg font-black text-orange-800 shadow-2xl">
                “{openedSet.has(active) ? round.answer : round.question}”
              </div>
            </div>
          );
        })()}
      </div>
      <div className="absolute inset-x-0 bottom-7 z-30 flex justify-center px-4">
        {!done && <div className="rounded-full bg-white/90 px-5 py-2 text-sm font-black text-orange-700 shadow-xl">Name tickets {opened.length}/{scene.rounds.length}</div>}
      </div>
      {done && (
        <div onClick={handleOpenGate} className={`absolute inset-0 z-40 flex items-center justify-center ${gateOpening ? 'pointer-events-none' : 'cursor-pointer'}`}>
          <div className="pointer-events-none absolute inset-0 bg-black/25" />
          <div className="relative flex flex-col items-center gap-4">
            <img src={comicPointForward} alt="Your turn" draggable={false} className="h-[calc(62*var(--svh,1vh))] w-auto object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.55)] animate-bounce" />
            <div className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-3xl font-black uppercase tracking-widest text-white shadow-2xl ring-4 ring-white/70 animate-pulse">Your turn!</div>
            <div className="rounded-full bg-white/95 px-5 py-2 text-sm font-black uppercase tracking-widest text-orange-700 shadow">Tap to continue</div>
          </div>
        </div>
      )}
    </div>
  );
}
