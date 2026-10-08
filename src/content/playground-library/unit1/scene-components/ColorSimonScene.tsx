import { useCallback, useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Color Simon ("Simon Says" growing color-sequence memory game) ---------- */

export function ColorSimonScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'color-simon' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  // The growing sequence is built with Math.random() -- only the authority
  // generates it (in startRound) and it travels as synced state, same fix
  // as hello-doors/train-recall. litIdx (which light is currently on) is
  // synced too so the mirror sees the actual "watch closely" playback
  // instead of a blank board; only the per-step spoken color name stays
  // authority-only audio, matching the trade-off used elsewhere in this
  // pass for secondary audio cues.
  const [state, setState] = useSyncedState(sync, {
    round: 1,
    sequence: [] as number[],
    phase: 'idle' as 'idle' | 'showing' | 'waiting' | 'done',
    litIdx: null as number | null,
    userIdx: 0,
    flashBad: null as number | null,
  });
  const { round, sequence, phase, litIdx, userIdx, flashBad } = state;
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const gemDone = useRef(false);
  const playingRef = useRef(false);
  // The sequence plays over several seconds; stop touching state once the page has left
  // (otherwise a pending step fires after unmount — e.g. when the teacher skips ahead).
  const aliveRef = useRef(true);
  useEffect(() => { aliveRef.current = true; return () => { aliveRef.current = false; }; }, []);
  const later = (fn: () => void, ms: number) => window.setTimeout(() => { if (aliveRef.current) fn(); }, ms);

  const playSequence = useCallback(async (seq: number[]) => {
    if (playingRef.current) return;
    playingRef.current = true;
    setState((s) => ({ ...s, phase: 'showing', userIdx: 0 }));
    await new Promise((r) => window.setTimeout(r, 500));
    for (const idx of seq) {
      if (!aliveRef.current) return;
      setState((s) => ({ ...s, litIdx: idx }));
      await safeSpeak(scene.colors[idx].colorWord, scene.colors[idx].who);
      await new Promise((r) => window.setTimeout(r, 250));
      if (!aliveRef.current) return;
      setState((s) => ({ ...s, litIdx: null }));
      await new Promise((r) => window.setTimeout(r, 200));
    }
    playingRef.current = false;
    if (!aliveRef.current) return;
    setState((s) => ({ ...s, phase: 'waiting' }));
  }, [scene.colors]);

  const startRound = useCallback((r: number) => {
    const seq = Array.from({ length: r }, () => Math.floor(Math.random() * scene.colors.length));
    setState((s) => ({ ...s, sequence: seq }));
    void playSequence(seq);
  }, [playSequence]);

  useEffect(() => { if (!isRemoteMirror) startRound(1); }, [isRemoteMirror]);

  const tapColor = (idx: number) => {
    if (isRemoteMirror || phase !== 'waiting') return;
    if (idx === sequence[userIdx]) {
      sfx.pop();
      setState((s) => ({ ...s, litIdx: idx }));
      later(() => setState((s) => ({ ...s, litIdx: null })), 200);
      const next = userIdx + 1;
      if (next >= sequence.length) {
        if (round >= scene.maxRounds) {
          sfx.gem();
          if (!gemDone.current) { gemDone.current = true; onWin(true); }
          setState((s) => ({ ...s, phase: 'done' }));
        } else {
          sfx.match();
          setState((s) => ({ ...s, phase: 'idle' }));
          later(() => { setState((s) => ({ ...s, round: s.round + 1 })); startRound(round + 1); }, 700);
        }
      } else {
        setState((s) => ({ ...s, userIdx: next }));
      }
    } else {
      sfx.wrong();
      onLose();
      setState((s) => ({ ...s, flashBad: idx }));
      later(() => setState((s) => ({ ...s, flashBad: null })), 400);
      later(() => void playSequence(sequence), 700);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-white/25 backdrop-blur-md" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        {phase === 'done' ? 'You remembered them all! ⭐' : phase === 'showing' ? '👀 Watch closely!' : `🎵 ${scene.teacher}`} <span className="ml-1 opacity-60">(Round {Math.min(round, scene.maxRounds)}/{scene.maxRounds})</span>
      </div>
      <div className="absolute inset-x-0 top-1/2 z-10 flex flex-wrap -translate-y-1/2 items-center justify-center gap-4 px-4 sm:gap-8">
        {scene.colors.map((c, i) => {
          const isLit = litIdx === i;
          const isBad = flashBad === i;
          return (
            <button
              key={c.colorWord}
              onClick={() => tapColor(i)}
              disabled={phase !== 'waiting'}
              aria-label={`Tap ${c.colorWord}`}
              className={`grid h-32 w-32 place-items-center rounded-full border-8 border-white shadow-2xl transition-all sm:h-40 sm:w-40 ${isLit ? 'scale-110 brightness-125' : isBad ? 'animate-[lep1-shake_0.4s_ease-in-out]' : phase === 'waiting' ? 'active:scale-90' : 'opacity-90'}`}
              style={{ background: c.colorHex, boxShadow: isLit ? `0 0 40px 10px ${c.colorHex}` : undefined }}
            >
              <span className="text-lg font-black uppercase text-white drop-shadow" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>{c.colorWord}</span>
            </button>
          );
        })}
      </div>
      {phase === 'done' && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next →</button>
        </div>
      )}
    </div>
  );
}
