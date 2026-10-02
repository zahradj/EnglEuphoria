import { useRef, useState } from 'react';
import { DialoguePlate, plateFontSize } from '../../DialoguePlate';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Meet ---------- */

export function MeetScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'meet' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  type Phase = 'idle' | 'talking' | 'repeat' | 'done';
  const [state, setState] = useSyncedState(sync, { phase: 'idle' as Phase, held: false, heardRepeat: 0, xpBurst: false });
  const { phase, held, heardRepeat, xpBurst } = state;
  const holdTimer = useRef<number | null>(null);
  const c = CAST[scene.who];
  const repeatWord = scene.repeat ?? scene.line;
  // Local on purpose (not synced): each screen shows its own equalizer while its own voice plays.
  const [speaking, setSpeaking] = useState(false);
  const sayLine = async () => {
    setSpeaking(true);
    try { await safeSpeak(scene.line, scene.who); } finally { setSpeaking(false); }
  };


  const tapCharacter = async () => {
    if (phase !== 'idle') return;
    sfx.pop();
    setState((s) => ({ ...s, phase: 'talking' }));
    await sayLine();
    setTimeout(() => setState((s) => ({ ...s, phase: 'repeat' })), 500);
  };
  const hearRepeat = async () => { sfx.click(); setState((s) => ({ ...s, heardRepeat: s.heardRepeat + 1 })); await safeSpeak(repeatWord, scene.who); };
  const replayIntro = async () => { sfx.click(); await sayLine(); };
  const startHold = () => {
    if (phase !== 'repeat') return;
    setState((s) => ({ ...s, held: true }));
    holdTimer.current = window.setTimeout(async () => {
      setState((s) => ({ ...s, held: false, phase: 'done', xpBurst: true }));
      sfx.gem();
      setTimeout(() => setState((s) => ({ ...s, xpBurst: false })), 1200);
      onWin(true);
      await safeSpeak('Awesome voice! Great job!', 'pip');
    }, 1300);
  };
  const endHold = () => { setState((s) => ({ ...s, held: false })); if (holdTimer.current) window.clearTimeout(holdTimer.current); };

  return (
    <div className="relative min-h-[calc(78*var(--svh,1vh))]">
      {/* Quest tag and the teacher's instruction share one column, so a wrapped
          instruction can never run underneath the tag. */}
      <div className="relative z-20 mx-auto flex max-w-md flex-col items-center gap-2 pt-1">
        <div className="pointer-events-none">
        <div className="rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-lg ring-2 ring-white/50" style={{ background: `linear-gradient(90deg, ${c.color}, #FEBE4C)` }}>
            ⚔️ Quest · Meet {c.name}
          </div>
        </div>
        <div className="rounded-2xl px-4 py-3 text-center text-lg font-bold text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.35))', backdropFilter: 'blur(8px)', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
          {scene.teacher}
        </div>
      </div>
      {/* scene.bg already paints {c.name} directly into the art — no separate sprite on top, just a tap affordance. */}
      {phase === 'idle' && <button onClick={tapCharacter} aria-label={`Tap ${c.name} to say hello`} className="absolute inset-0 z-10 h-[calc(60*var(--svh,1vh))] w-full cursor-pointer bg-transparent" />}
      {phase === 'idle' && (
        <div className="pointer-events-none absolute inset-x-0 top-[calc(26*var(--svh,1vh))] z-10 grid place-items-center">
          <div className="relative h-40 w-40" style={{ animation: 'lep1-wiggle 3s ease-in-out infinite' }}>
            <span className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${c.color}55, transparent 65%)`, animation: 'lep1-ping 2s ease-out infinite' }} />
            <span className="absolute inset-6 rounded-full border-4" style={{ borderColor: c.color, animation: 'lep1-ping 2s ease-out 0.4s infinite' }} />
          </div>
        </div>
      )}
      {scene.phonics && (
        <span className="absolute right-3 top-16 z-20 grid h-16 w-16 place-items-center rounded-full bg-white text-3xl font-black shadow-2xl ring-4" style={{ color: c.color, borderColor: c.color, animation: 'lep1-wiggle 3s ease-in-out infinite' }}>
          {scene.phonics.toUpperCase()}
        </span>
      )}
      {xpBurst && (
        <div className="pointer-events-none absolute inset-x-0 top-[calc(32*var(--svh,1vh))] z-30 grid place-items-center">
          <div className="animate-[lep1-pop-fade_1.1s_ease-out_forwards] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2 text-2xl font-black text-white shadow-2xl">+10 XP 💎</div>
        </div>
      )}
      {/* The character's line on a dialogue plate (tap = hear it again). It sits above the
          "your turn" bar that runs along the very bottom. */}
      {phase !== 'idle' && (
        <DialoguePlate
          name={c.name}
          color={c.color}
          onTap={replayIntro}
          speaking={speaking}
          fontSize={plateFontSize(scene.line)}
          bottom="calc(12*var(--svh,1vh))"
          ariaLabel={`Hear ${c.name} again`}
        >
          “{scene.line}”
        </DialoguePlate>
      )}
      {phase === 'idle' && (
        <div className="pointer-events-none absolute inset-x-0 top-[calc(44*var(--svh,1vh))] z-20 grid place-items-center">
          <span className="animate-pulse rounded-full bg-white/95 px-5 py-2 text-base font-bold shadow-xl" style={{ color: c.color }}>👆 Tap {c.name} {c.emoji}</span>
        </div>
      )}
      {/* "Your turn" as one slim bar along the bottom instead of a tall
          sheet over the character. */}
      {(phase === 'repeat' || phase === 'done') && (
        <div className="absolute inset-x-0 bottom-[calc(1.5*var(--svh,1vh))] z-30 flex justify-center px-3" style={{ animation: 'lep1-slide-up 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <div className="flex items-center gap-2 rounded-full bg-white/90 p-1.5 pl-3 shadow-2xl ring-2 backdrop-blur" style={{ ['--tw-ring-color' as string]: c.color }}>
            <span className="whitespace-nowrap text-xs font-black uppercase tracking-widest" style={{ color: c.color }}>🎤 “{repeatWord}”</span>
            <button onClick={hearRepeat} aria-label="Hear it" title="Hear it" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-lg shadow ring-2 ring-orange-200 active:scale-95">
              🔊
            </button>
            <button
              onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
              className={`whitespace-nowrap rounded-full px-6 py-3 text-base font-black text-white shadow-lg transition ${held ? 'scale-95' : ''}`}
              style={{ background: phase === 'done' ? 'linear-gradient(90deg, #10B981, #34D399)' : `linear-gradient(90deg, ${c.color}, #FEBE4C)` }}
            >
              {phase === 'done' ? '✅ Nailed it!' : held ? '🎤 Keep talking…' : '🎤 Hold to say it'}
            </button>
            {phase === 'done' && (
              <button onClick={onNext} className="whitespace-nowrap rounded-full bg-orange-500 px-5 py-3 text-base font-black text-white shadow-lg active:scale-95">
                Next →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
