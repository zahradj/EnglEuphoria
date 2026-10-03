import { useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CLAY_CARD, CountdownRing } from './shared';

/* ---------- Move & Say (TPR) / Brain Break ----------
 * Total Physical Response, the movement-first routine of Oxford's Toy Team /
 * Everybody Up and Novakid's beginner classes: the character says an action
 * with the new word ("Hug the teddy bear!"), the child DOES it while a ring
 * counts down, then gets a star. `mode: 'break'` is the extra-time brain
 * break (stretch, dance, "Freeze!") — same flow, livelier look, no new words.
 * Movement first lowers anxiety and ties each word to an action. */

type Tpr = Extract<Scene, { kind: 'tpr-actions' }>;
const MOVE_SECONDS = 5;

export function TprActionsScene({ scene, onWin, onNext, sync }: { scene: Tpr; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    phase: 'ready', // ready → move → star
    stars: 0,
    gemDone: false,
  });
  const { round, phase, stars, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const isBreak = scene.mode === 'break';
  const timer = useRef<number[]>([]);

  const clear = () => { timer.current.forEach((t) => window.clearTimeout(t)); timer.current = []; };
  useEffect(() => clear, []);

  // Each round: say the action, then "Go!" and the move timer, then a star.
  useEffect(() => {
    if (!r || phase !== 'ready') return;
    clear();
    timer.current.push(window.setTimeout(() => cueSpeak(r.line, scene.who), 400));
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, phase, scene.id]);

  const go = () => {
    if (!r) return;
    sfx.pop();
    clear();
    setState((s) => ({ ...s, phase: 'move' }));
    timer.current.push(window.setTimeout(() => {
      sfx.match();
      setState((s) => ({ ...s, phase: 'star', stars: s.stars + 1 }));
    }, (r.seconds ?? MOVE_SECONDS) * 1000));
  };

  const next = () => {
    clear();
    const n = round + 1;
    const awardGem = n >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: n, phase: 'ready', gemDone: s.gemDone || awardGem }));
  };

  const bgStyle = { backgroundImage: `url(${scene.bg})` };

  if (!r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={bgStyle}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center gap-4 px-4">
          <div className={`${CLAY_CARD} px-8 py-4 text-center text-2xl font-black text-orange-600`}>
            {isBreak ? '🎉 Great moving! Ready to learn again?' : '🌟 Super moves!'}
            <div className="mt-1 text-3xl">{'⭐'.repeat(Math.min(stars, 8))}</div>
          </div>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-4 text-xl`}>Next ⭐</button>
        </div>
      </div>
    );
  }

  const moving = phase === 'move';
  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={bgStyle}>
      <div className={`absolute inset-0 ${isBreak ? 'bg-gradient-to-br from-fuchsia-500/35 via-orange-400/20 to-sky-400/35' : 'bg-black/10'}`} />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {isBreak ? '🕺 Brain Break!' : '🙌 Move and say!'}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(r.line, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>

      {/* Star trail: one star per finished move */}
      <div className="absolute left-3 top-16 z-30 flex gap-1 rounded-full bg-white/85 px-3 py-1 shadow">
        {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < stars ? 'scale-110' : 'opacity-25 grayscale'}`}>⭐</span>)}
      </div>

      <div className="absolute inset-x-0 top-[14%] bottom-[18%] z-20 flex items-center justify-center gap-[4vw] px-4">
        {/* The action card */}
        <div key={round} className={`${CLAY_CARD} relative grid aspect-square h-[min(52vh,40vw)] place-items-center p-6`} style={{ animation: 'lep1-pop 0.45s ease-out' }}>
          {moving && <CountdownRing seconds={r.seconds ?? MOVE_SECONDS} runKey={round} color={isBreak ? '#D946EF' : '#F97316'} />}
          {r.img
            ? <img src={r.img} alt="" draggable={false} className="h-[70%] w-[70%] object-contain" style={{ animation: moving ? 'lep1-wobble 0.6s ease-in-out infinite' : undefined }} />
            : <span className="text-[min(22vh,16vw)] leading-none" style={{ animation: moving ? 'lep1-wobble 0.6s ease-in-out infinite' : undefined }}>{r.emoji}</span>}
          {r.img && <span className="absolute -bottom-4 -right-4 grid h-[34%] w-[34%] place-items-center rounded-full bg-white text-[min(9vh,7vw)] shadow-xl" style={{ animation: 'lep1-wobble 1.2s ease-in-out infinite' }}>{r.emoji}</span>}
          {phase === 'star' && <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-6xl" style={{ animation: 'lep1-pop 0.5s ease-out' }}>⭐</span>}
        </div>
      </div>

      {/* Caption for the adult + the one big control */}
      <div className="absolute inset-x-0 bottom-[5%] z-30 flex flex-col items-center gap-2 px-4">
        <div className="rounded-2xl bg-white/90 px-4 py-1 text-center text-lg font-black text-neutral-800 shadow">{r.line}</div>
        {phase === 'ready' && <button onClick={go} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>▶ Go!</button>}
        {moving && <div className="rounded-full bg-white/90 px-6 py-2 text-xl font-black text-fuchsia-600 shadow">{isBreak ? 'Move, move, move!' : 'Do it and say it!'}</div>}
        {phase === 'star' && <button onClick={next} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>{round + 1 < total ? 'Next move ▶' : 'Done ⭐'}</button>}
      </div>
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function tprActionsLines(scene: Tpr) {
  return scene.rounds.map((r) => [scene.who, r.line] as [string, string]);
}
