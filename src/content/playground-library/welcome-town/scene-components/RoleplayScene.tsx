import { useEffect, useRef } from 'react';
import type { Scene, CharKey } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../../unit1/audio';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';

/* ---------- Roleplay ---------- */

export function RoleplayScene({ scene, onNext, onWin, sync }: { scene: Extract<Scene, { kind: 'roleplay' }>; onNext: () => void; onWin: (gem: boolean) => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { step: -1, awaitingRepeat: false, gemDone: false });
  const { step, awaitingRepeat, gemDone } = state;
  // Whether THIS side runs the self-driving script at all — the mirror side
  // renders whatever step/awaitingRepeat it receives instead of running its
  // own independent copy, since two independently-timed scripts would
  // immediately drift out of sync with each other.
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
      await safeSpeak(line.line, voiceOf(line.who));
      if (stopRef.current) return;
      if (line.repeat) setState((s) => ({ ...s, awaitingRepeat: true }));
      else { await new Promise((r) => setTimeout(r, 500)); run(i + 1); }
    }
    runRef.current = run;
    run(0);
    return () => { stopRef.current = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id, isRemoteMirror]);

  // Mirror side isn't running the script, so it needs its own cue to speak
  // each line as the synced `step` advances instead of staying silent.
  const lastSpokenStepRef = useRef(-2);
  useEffect(() => {
    if (!isRemoteMirror) return;
    if (step < 0 || step >= scene.script.length || lastSpokenStepRef.current === step) return;
    lastSpokenStepRef.current = step;
    const line = scene.script[step];
    void safeSpeak(line.line, voiceOf(line.who));
  }, [isRemoteMirror, step, scene.script]);

  const confirmRepeat = () => {
    if (!awaitingRepeat || isRemoteMirror) return;
    if (!gemDone) onWin(true);
    setState((s) => ({ ...s, awaitingRepeat: false, gemDone: true }));
    const next = step + 1;
    setTimeout(() => runRef.current?.(next), 250);
  };

  // bg-together.png paints both characters directly into the street (per
  // the art style contract's "never a pasted cut-out" rule for a scene
  // where they talk face to face), so only the bubble's anchor point needs
  // to roughly match where each of them stands in that painting — no
  // character image is rendered here.
  // bg-classroom-circle paints Pip and Miss Marigold facing each other on
  // the rug (left/right), with the other classmates gathered behind them —
  // only the two dialogue leads need a precise bubble anchor.
  // bg-classroom-peers paints Pip and Leo facing each other left/right
  // (added for Lesson 4's peer-to-peer roleplay per lesson-quality-gate's
  // Semantic pass — bg-classroom-circle never actually painted Leo).
  // mia/bella/willow still default to center — no roleplay scene uses them
  // as a speaker on a background that doesn't paint them yet; fix the same
  // way (a dedicated bg + a real anchor here) before ever doing so.
  // Flex justify (not a raw left:% + translateX) so the bubble is clamped by
  // inset-x-4 on every viewport — a long line anchored toward an edge can't
  // get clipped by this scene's overflow-hidden container on narrow phones.
  const bubbleAlign: Record<CharKey, 'start' | 'center' | 'end'> = { pip: 'start', marigold: 'end', mia: 'center', bella: 'center', willow: 'center', leo: 'end', ava: 'start', theo: 'end', vee: 'center', nova: 'center' };
  const current = step >= 0 && step < scene.script.length ? scene.script[step] : null;
  const replayCurrent = () => { if (current) void safeSpeak(current.line, voiceOf(current.who)); };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-6 top-6 flex flex-col gap-2">
        <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-orange-700 shadow">Roleplay · Say Hello</span>
        <span className="w-fit rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow">Listen · Repeat · Play</span>
      </div>
      {current && <button onClick={replayCurrent} className="absolute right-6 top-6 z-30 flex items-center gap-2 rounded-full bg-white/95 px-5 py-3 text-sm font-black uppercase tracking-widest text-orange-700 shadow-2xl ring-2 ring-orange-200 active:scale-95" aria-label="Repeat what the character said">🔁 Play again</button>}
      {current && !awaitingRepeat && (
        <div
          className={`absolute inset-x-4 top-[30%] z-20 flex transition-all duration-300 ${
            bubbleAlign[current.who] === 'start' ? 'justify-start' : bubbleAlign[current.who] === 'end' ? 'justify-end' : 'justify-center'
          }`}
        >
          <div className="relative max-w-[420px] rounded-3xl bg-white px-5 py-3 text-center text-xl font-black text-orange-800 shadow-2xl sm:text-2xl">“{current.line}”</div>
        </div>
      )}
      {awaitingRepeat && current && (
        <>
          <div className="absolute inset-0 z-20 bg-black/35 backdrop-blur-[2px]" />
          <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
            <div className="relative w-full max-w-xl rounded-[36px] bg-white p-7 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-4 ring-orange-300">
              <div className="mb-2 text-[11px] font-black uppercase tracking-[0.25em] text-orange-500">Your turn!</div>
              <div className="relative mx-auto mb-3 flex h-24 w-24 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-orange-400/40 animate-ping" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-4xl shadow-xl">🎤</div>
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-neutral-500">Say it like {CAST[current.who].name}</div>
              <div className="mt-1 text-3xl font-black text-orange-700 sm:text-4xl">“{current.line}”</div>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button onClick={replayCurrent} className="flex items-center gap-2 rounded-full bg-orange-100 px-5 py-3 text-sm font-black uppercase tracking-widest text-orange-700 ring-2 ring-orange-200 active:scale-95">🔁 Hear again</button>
                <button onClick={confirmRepeat} className="flex items-center gap-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-7 py-3 text-base font-black uppercase tracking-widest text-white shadow-xl active:scale-95">✅ I said it</button>
              </div>
            </div>
          </div>
        </>
      )}
      {step >= scene.script.length && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-orange-500 px-8 py-4 text-base font-black uppercase tracking-widest text-white shadow-2xl active:scale-95">✨ Next</button>
        </div>
      )}
    </div>
  );
}
