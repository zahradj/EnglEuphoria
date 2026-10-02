import { useEffect, useRef } from 'react';
import type { Scene, CharKey } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';

/* ---------- Hello doors ---------- */

export function HelloDoorsScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'hello-doors' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    order: scene.cast as CharKey[],
    openIdx: null as number | null,
    wrongIdx: null as number | null,
    phase: 'reveal' as 'reveal' | 'shuffle' | 'prompt' | 'greet' | 'echo' | 'done',
    score: 0,
    gemDone: false,
  });
  const { round, order, openIdx, wrongIdx, phase, score, gemDone } = state;
  // The reveal/shuffle/prompt sequence below uses Math.random() — running it
  // independently on both screens would shuffle the doors differently on
  // each, so only the authority side runs it; the mirror just renders
  // whatever order/phase it receives.
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const answeredRef = useRef(false);
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;
  // Door count follows the cast size (this world has only 2 characters, not
  // the 3-4 of the Little Explorers roster), so each round has exactly one
  // correct door.
  const doorPositions = scene.cast.length === 2 ? [30, 70] : scene.cast.length === 3 ? [17, 50, 83] : scene.cast.map((_, i) => 12 + (76 * i) / Math.max(1, scene.cast.length - 1));

  const shuffle = (arr: CharKey[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  useEffect(() => {
    if (isRemoteMirror) return;
    if (!r) return;
    let cancelled = false;
    answeredRef.current = false;
    setState((s) => ({ ...s, openIdx: null, wrongIdx: null }));
    (async () => {
      if (round === 0) {
        setState((s) => ({ ...s, order: scene.cast, phase: 'reveal' }));
        for (const who of scene.cast) { await safeSpeak(CAST[who].name, voiceOf(who)); if (cancelled) return; }
        await new Promise((res) => setTimeout(res, 400));
        if (cancelled) return;
      }
      setState((s) => ({ ...s, phase: 'shuffle' }));
      if (cancelled) return;
      for (let k = 0; k < 3; k++) {
        setState((s) => ({ ...s, order: shuffle(s.order) }));
        await new Promise((res) => setTimeout(res, 420));
        if (cancelled) return;
      }
      await new Promise((res) => setTimeout(res, 200));
      if (cancelled) return;
      setState((s) => ({ ...s, phase: 'prompt' }));
      await new Promise((res) => setTimeout(res, 200));
      await safeSpeak(r.prompt, voiceOf(r.target));
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, isRemoteMirror]);

  // Mirror side isn't running the reveal/shuffle sequence, so it needs its
  // own cue to speak the round's prompt once the synced phase reaches it.
  const lastPromptRoundRef = useRef(-1);
  useEffect(() => {
    if (!isRemoteMirror || !r || phase !== 'prompt' || lastPromptRoundRef.current === round) return;
    lastPromptRoundRef.current = round;
    void safeSpeak(r.prompt, voiceOf(r.target));
  }, [isRemoteMirror, phase, round, r]);

  const tap = async (idx: number) => {
    if (!r || answeredRef.current || isRemoteMirror) return;
    const who = order[idx];
    if (who !== r.target) {
      setState((s) => ({ ...s, wrongIdx: idx }));
      sfx.wrong(); onLose();
      window.setTimeout(() => setState((s) => ({ ...s, wrongIdx: null })), 500);
      return;
    }
    answeredRef.current = true;
    setState((s) => ({ ...s, openIdx: idx, phase: 'greet' }));
    sfx.match();
    await new Promise((res) => setTimeout(res, 500));
    await safeSpeak(r.helloLine, voiceOf(who));
    setState((s) => ({ ...s, phase: 'echo' }));
    await new Promise((res) => setTimeout(res, 250));
    await safeSpeak(r.echoLine, voiceOf(r.target));
    setState((s) => ({ ...s, score: s.score + 1 }));
    await new Promise((res) => setTimeout(res, 1400));
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) sfx.gem();
    if (awardGem) onWin(true);
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="rounded-3xl bg-white px-8 py-4 text-center shadow-2xl">
            <div className="text-2xl font-black text-orange-700">🎉 Wonderful hellos!</div>
            <div className="text-lg font-bold text-neutral-700">You greeted every friend! {score}/{total}</div>
          </div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/50" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-6 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur sm:text-xl">
        {r!.prompt}<span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(r!.prompt, voiceOf(r!.target))} className="absolute right-4 top-4 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>
      {phase === 'echo' && <div className="pointer-events-none absolute left-1/2 top-24 z-40 -translate-x-1/2 rounded-3xl bg-white px-6 py-4 text-2xl font-black text-orange-600 shadow-2xl ring-4 ring-orange-200">🎤 {r!.echoLine}</div>}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
      {/* scene.bg already paints the cubby doors themselves — this world has
          no per-character illustration, so a name+emoji badge stands in for
          the door-opening reveal instead of a floating character image. */}
      <div className={`absolute inset-0 z-10 ${phase === 'shuffle' ? 'animate-[lep1-shuffleShake_0.42s_ease-in-out_infinite]' : ''}`}>
        {doorPositions.map((left, i) => {
          const who = order[i];
          const c = CAST[who];
          const isOpen = openIdx === i || phase === 'reveal';
          const isWrong = wrongIdx === i;
          const showBadge = openIdx === i || phase === 'reveal';
          return (
            <div key={i} className="absolute bottom-[8%] top-[8%]" style={{ left: `${left}%`, transform: 'translateX(-50%)', width: '28%', maxWidth: 320 }}>
              <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 transition-all duration-300" style={{ opacity: showBadge ? 1 : 0, transform: `translateY(${showBadge ? '0' : '10px'})` }}>
                <span className="grid h-20 w-20 place-items-center rounded-full text-4xl shadow-2xl ring-4 ring-white" style={{ background: `${c.color}33` }}>{c.emoji}</span>
                <span className="whitespace-nowrap rounded-2xl bg-white px-4 py-2 text-lg font-black shadow-xl ring-2 ring-white" style={{ color: c.color }}>{c.name}</span>
                {(phase === 'greet' || phase === 'echo') && openIdx === i && <span className="max-w-[220px] whitespace-normal rounded-2xl bg-white px-4 py-2 text-center text-sm font-black text-neutral-800 shadow-xl ring-2 ring-white">{r!.helloLine}</span>}
              </div>
              <button onClick={() => tap(i)} disabled={answeredRef.current || phase !== 'prompt'} aria-label={`Cubby ${i + 1}`} className={`absolute inset-0 rounded-3xl transition-transform active:scale-95 ${isWrong ? 'animate-[lep1-shake_0.5s]' : ''} ${isOpen ? 'ring-4' : ''}`} style={{ ['--tw-ring-color' as string]: c.color }}>
                {isWrong && <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center text-7xl font-black text-red-500 drop-shadow-lg">✗</div>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
