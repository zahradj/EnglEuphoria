import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Obstacle Run (Pre-A1 Unit 10 Lesson 1 "Run, Jump, Walk!" signature game) ----------
 * Sports day. The runner jogs on the track (code-drawn lane stripes stream past; the picture itself never
 * pans — CLAUDE.md). Something comes up ahead and the coach calls what to do: "Jump over the log!",
 * "Shh! A little duck! Walk!", "Run! A bee!". The child taps the action picture: the runner really
 * does it — a squash-and-stretch JUMP arc over the log, a slow tiptoe WALK past the duck, a speed-line RUN
 * away from the bee — and gets a star. Sources (mechanic only): endless runners (Subway Surfers / Temple
 * Run: one tap = one move), the PE warm-up "Run! Jump! Walk!", Cambridge Pre A1 Starters "listen and do".
 * Better: the action WORD decides the move (not the picture of the obstacle alone: the same log can be
 * "walk round it" another time), calm pace, no fail state, a wrong move is named back and the right one
 * glows after two tries. Game feel: .claude/skills/game-animation. */

type Run = Extract<Scene, { kind: 'action-run' }>;
export const runWrongLine = (word: string) => `Not ${word}! Listen again.`;
const RUNNER = { x: 34, y: 72 };
const STOP_X = 66;

export function ActionRunScene({ scene, onWin, onNext, sync }: { scene: Run; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { round: 0, gemDone: false });
  const { round, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [move, setMove] = useState<'idle' | 'run' | 'jump' | 'walk'>('idle');
  const [obstacleX, setObstacleX] = useState(115);
  const [misses, setMisses] = useState(0);
  const [nope, setNope] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  // a new round: the obstacle rolls in and stops ahead of the runner, then the coach calls the move
  useEffect(() => {
    busy.current = false; setMisses(0); setMove('idle'); setObstacleX(115);
    if (!r) return;
    const t1 = window.setTimeout(() => setObstacleX(STOP_X), 150);
    const t2 = window.setTimeout(() => cueSpeak(r.line, scene.who), 1300);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  useEffect(() => { if (done) void sayWithin(scene.doneLine, scene.who, 4000); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [done]);

  const pick = async (i: number) => {
    if (!r || busy.current) return;
    busy.current = true;
    const a = scene.actions[i];
    if (i !== r.action) {
      sfx.wrong(); shake(); setNope(i); setMisses((m) => m + 1);
      await sayWithin(runWrongLine(a.word), scene.who, 2200);
      setNope(-1); busy.current = false; return;
    }
    const id = a.id;
    sfx.whoop(); setMove(id);
    // the obstacle passes the runner at the speed of the move
    const pass = id === 'run' ? 700 : id === 'walk' ? 2200 : 1100;
    window.setTimeout(() => setObstacleX(-20), reduce ? 0 : id === 'jump' ? 150 : 50);
    await new Promise((res) => window.setTimeout(res, reduce ? 300 : pass));
    sfx.match(); fire(RUNNER.x, RUNNER.y - 15, 'stars'); fire(RUNNER.x, RUNNER.y + 5, 'sparkle');
    await sayWithin(r.reply, scene.who, 3000);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
  };

  const pose = move === 'jump' ? scene.poses.jump : move === 'walk' ? scene.poses.walk : scene.poses.run;
  const streaming = !reduce && (move === 'run' || move === 'idle' || move === 'jump');
  const speed = move === 'run' ? 0.35 : move === 'walk' ? 2.2 : 0.8;
  const glowAction = r && misses >= 2 ? r.action : -1;
  const passMs = move === 'run' ? 0.7 : move === 'walk' ? 2.2 : 1.1;

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={70} />}
      {/* lane stripes streaming past (code-drawn, the picture stays still) */}
      <div className="pointer-events-none absolute inset-x-0 z-10 overflow-hidden" style={{ top: `${RUNNER.y + 8}%`, height: '3%' }}>
        <motion.div className="absolute inset-y-0 flex gap-[6vw]" style={{ width: '300%' }}
          animate={streaming || move === 'walk' ? { x: ['0%', '-33.33%'] } : { x: '0%' }} transition={{ duration: speed * 6, repeat: Infinity, ease: 'linear' }}>
          {Array.from({ length: 40 }, (_, k) => <span key={k} className="h-full w-[5vw] shrink-0 rounded-full bg-white/80" />)}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3.1*var(--svw,1vw)), 5.2vh), 2.6rem)' }}>
          {r ? `“${r.line}”` : scene.doneLine}
        </span>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-14 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* the obstacle */}
      {r && (
        <motion.div className="absolute z-20" style={{ top: `${RUNNER.y + 4}%`, translate: '-50% -100%', width: r.obstacle.w ?? 'min(16vh, 11vw)' }}
          animate={{ left: `${obstacleX}%` }} transition={{ duration: obstacleX === STOP_X ? 1.0 : passMs, ease: obstacleX === STOP_X ? 'easeOut' : 'linear' }}>
          <motion.img src={r.obstacle.img} alt={r.obstacle.label} draggable={false} className="w-full object-contain drop-shadow-[0_8px_6px_rgba(0,0,0,0.3)]"
            animate={reduce ? {} : r.obstacle.buzz ? { y: [0, -12, 0, -6, 0], rotate: [0, 8, -8, 0] } : { scaleY: [1, 0.97, 1] }}
            transition={{ duration: r.obstacle.buzz ? 0.5 : 2, repeat: Infinity }} />
        </motion.div>
      )}

      {/* the runner */}
      <div className="absolute z-20" style={{ left: `${RUNNER.x}%`, top: `${RUNNER.y}%`, height: 'min(46vh, 30vw)', aspectRatio: '1 / 1', translate: '-50% -82%' }}>
        <span className="absolute bottom-[4%] left-1/2 h-[6%] w-[44%] rounded-[50%] bg-black/25 blur-sm" style={{ translate: '-50% 0' }} />
        <motion.img key={move} src={pose} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_8px_rgba(0,0,0,0.25)]" style={{ transformOrigin: '50% 95%' }}
          animate={reduce ? {} : move === 'jump'
            ? { y: ['0%', '4%', '-55%', '-55%', '0%', '3%', '0%'], scaleY: [1, 0.85, 1.1, 1, 1, 0.85, 1], scaleX: [1, 1.12, 0.92, 1, 1, 1.12, 1] }
            : move === 'run' ? { y: ['0%', '-6%', '0%'], x: ['0%', '6%', '0%'] }
            : move === 'walk' ? { y: ['0%', '-2%', '0%'] }
            : { y: ['0%', '-3%', '0%'] }}
          transition={move === 'jump' ? { duration: 1.0, times: [0, 0.12, 0.45, 0.55, 0.85, 0.92, 1] } : { duration: move === 'run' ? 0.28 : move === 'walk' ? 0.7 : 0.45, repeat: Infinity }} />
        {move === 'run' && !reduce && [0, 1, 2].map((k) => (
          <motion.span key={k} className="absolute h-1.5 rounded-full bg-white/80" style={{ left: '-10%', top: `${40 + k * 12}%`, width: '30%' }}
            animate={{ x: ['0%', '-120%'], opacity: [0.9, 0] }} transition={{ duration: 0.35, delay: k * 0.1, repeat: Infinity }} />
        ))}
      </div>

      {/* the action buttons */}
      {!done && (
        <div className="absolute bottom-3 right-4 z-30 flex gap-3">
          {scene.actions.map((a, i) => (
            <motion.button key={a.id} onClick={() => { void pick(i); }} aria-label={a.word}
              className="flex flex-col items-center rounded-3xl bg-white/90 px-2 pt-2 shadow-xl"
              whileTap={reduce ? undefined : { scale: 0.9 }}
              animate={reduce ? {} : nope === i ? { rotate: [0, -10, 10, -6, 6, 0] } : glowAction === i ? { y: [0, -12, 0], boxShadow: ['0 0 0 0 rgba(250,204,21,0)', '0 0 0 10px rgba(250,204,21,0.8)', '0 0 0 0 rgba(250,204,21,0)'] } : { y: 0 }}
              transition={nope === i ? { duration: 0.5 } : { duration: 0.8, repeat: glowAction === i ? Infinity : 0 }}>
              <img src={a.img} alt="" draggable={false} style={{ width: 'min(13vh, 9vw)', height: 'min(13vh, 9vw)' }} className="object-contain" />
              <span className="pb-1 text-base font-black text-slate-700">{a.word}</span>
            </motion.button>
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute left-3 top-14 z-30 flex gap-1 rounded-full bg-white/85 px-3 py-1 shadow-lg">
        {scene.rounds.map((_, i) => <span key={i} className={`text-2xl ${i < round ? '' : 'opacity-25 grayscale'}`}>⭐</span>)}
      </div>
      <Bursts items={bursts} />
      <AnimatePresence>
        {done && (
          <motion.div className="absolute inset-x-0 bottom-[16%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, type: 'spring' }}>
            <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function actionRunLines(scene: Run) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.actions.map((a) => [scene.who, runWrongLine(a.word)]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
