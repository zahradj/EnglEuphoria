import { useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, stopSpeaking } from '../audio';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Roleplay ---------- */

export function RoleplayScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'roleplay' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { step: -1, awaitingRepeat: false, gemDone: false });
  const { step, awaitingRepeat, gemDone } = state;
  // The mirror side renders the synced step/awaitingRepeat instead of
  // running its own independently-timed script — two self-driving copies
  // would immediately drift out of sync with each other.
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const stopRef = useRef(false);
  const runRef = useRef<((i: number) => void) | null>(null);

  useEffect(() => {
    if (isRemoteMirror) return;
    stopRef.current = false;
    async function run(i: number) {
      if (stopRef.current) return;
      if (i >= scene.script.length) { setState((s) => ({ ...s, step: scene.script.length })); return; }
      setState((s) => ({ ...s, step: i }));
      const line = scene.script[i];
      await new Promise((r) => setTimeout(r, 350));
      if (stopRef.current) return;
      await safeSpeak(line.line, line.who);
      if (stopRef.current) return;
      if (line.repeat) setState((s) => ({ ...s, awaitingRepeat: true }));
      else { await new Promise((r) => setTimeout(r, 500)); run(i + 1); }
    }
    runRef.current = run;
    run(0);
    return () => { stopRef.current = true; stopSpeaking(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id, isRemoteMirror]);

  // Mirror side isn't running the script, so it needs its own cue to speak
  // each line as the synced `step` advances.
  const lastSpokenStepRef = useRef(-2);
  useEffect(() => {
    if (!isRemoteMirror) return;
    if (step < 0 || step >= scene.script.length || lastSpokenStepRef.current === step) return;
    lastSpokenStepRef.current = step;
    const line = scene.script[step];
    void safeSpeak(line.line, line.who);
  }, [isRemoteMirror, step, scene.script]);

  const confirmRepeat = () => {
    if (!awaitingRepeat || isRemoteMirror) return;
    if (!gemDone) onWin(true);
    setState((s) => ({ ...s, awaitingRepeat: false, gemDone: true }));
    const next = step + 1;
    setTimeout(() => runRef.current?.(next), 250);
  };

  const positions: Record<string, { left: string; bottom: string; scale: number }> = {
    pip: { left: '12%', bottom: 'calc(10*var(--svh,1vh))', scale: 1.35 },
    mia: { left: '34%', bottom: 'calc(9*var(--svh,1vh))', scale: 1.15 },
    bella: { left: '58%', bottom: 'calc(10*var(--svh,1vh))', scale: 1.3 },
    willow: { left: '82%', bottom: 'calc(11*var(--svh,1vh))', scale: 1.2 },
  };
  const current = step >= 0 && step < scene.script.length ? scene.script[step] : null;
  const replayCurrent = () => { if (current) void safeSpeak(current.line, current.who); };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-6 top-6 flex flex-col gap-2">
        <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">Roleplay · Say Hello</span>
        <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">Listen · Repeat · Play</span>
      </div>
      {current && <button onClick={replayCurrent} className="absolute right-6 top-6 z-30 flex items-center gap-2 rounded-full bg-white/95 px-5 py-3 text-sm font-black uppercase tracking-widest text-orange-700 shadow-2xl ring-2 ring-orange-200 active:scale-95" aria-label="Repeat what the character said">🔁 Play again</button>}
      {current && !awaitingRepeat && (
        <div className="absolute z-20 max-w-[520px] -translate-x-1/2 px-4 transition-all duration-300" style={{ left: positions[current.who]?.left ?? '50%', bottom: `calc(${positions[current.who]?.bottom ?? 'calc(12*var(--svh,1vh))'} + clamp(240px, calc(40*var(--svh,1vh)), 460px) * ${positions[current.who]?.scale ?? 1} + 20px)` }}>
          <div className="relative rounded-3xl bg-white px-5 py-3 text-center text-xl font-black text-orange-800 shadow-2xl sm:text-2xl">“{current.line}”</div>
        </div>
      )}
      {awaitingRepeat && current && (
        // Previously a full-screen dark/blur overlay + dead-center card regardless of
        // speaker — with 3 painted-in characters (bgL1RoleplayFriends), that left Pip
        // (positioned off to the left, outside the centered card's footprint) fully
        // visible on every turn while Mia/Bella got hidden behind the card, making it
        // look like Pip was "in" every turn even when it wasn't his line. Anchoring
        // near the current speaker's own on-screen position (clamped to stay fully
        // on-screen) and dropping the full-screen dim keeps every character visible
        // and makes it visually clear whose turn it actually is.
        <div className="absolute inset-x-0 bottom-10 z-30 flex justify-center px-4">
          <div className="relative w-full max-w-[380px] rounded-[32px] bg-white p-5 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-4 ring-orange-300">
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.25em] text-orange-500">Your turn!</div>
            <div className="relative mx-auto mb-3 flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-orange-400/40 animate-ping" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-3xl shadow-xl">🎤</div>
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-neutral-500">Say it like {CAST[current.who].name}</div>
            <div className="mt-1 text-2xl font-black text-orange-700 sm:text-3xl">“{current.line}”</div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button onClick={replayCurrent} className="flex items-center gap-2 rounded-full bg-orange-100 px-5 py-3 text-sm font-black uppercase tracking-widest text-orange-700 ring-2 ring-orange-200 active:scale-95">🔁 Hear again</button>
              <button onClick={confirmRepeat} className="flex items-center gap-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-7 py-3 text-base font-black uppercase tracking-widest text-white shadow-xl active:scale-95">✅ I said it</button>
            </div>
          </div>
        </div>
      )}
      {step >= scene.script.length && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-orange-500 px-8 py-4 text-base font-black uppercase tracking-widest text-white shadow-2xl active:scale-95">✨ Next</button>
        </div>
      )}
    </div>
  );
}
