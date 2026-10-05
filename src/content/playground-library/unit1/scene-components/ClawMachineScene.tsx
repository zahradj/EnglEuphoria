import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, ThingArt, sayWithin } from './shared';
import { Bursts, LivingBg, useBursts, useShake } from './gameFx';

/* ---------- Toy Grabber (claw machine) ----------
 * The fairground claw machine (Yateland's "Claw Machine Games for kids",
 * toy-grabber apps), made fair and made about language: the voice says
 * "Get the big red ball!"; the child taps a toy to steer the claw over it
 * (or uses ◀ ▶), then presses the big red button. The claw drops, closes
 * and lifts. Unlike real (and app) claw machines it NEVER slips — luck
 * never decides; only choosing the toy the words describe wins. The right
 * toy rides to the prize chute and pops out with confetti; a wrong toy is
 * lifted, the claw shows it ("That's the robot!") and drops it back softly. */

type Claw = Extract<Scene, { kind: 'claw-machine' }>;
type Phase = 'aim' | 'drop' | 'lift' | 'carry' | 'back';

export function ClawMachineScene({ scene, onWin, onLose, onNext, sync }: { scene: Claw; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    aim: 50, // claw position, % of the glass width
    phase: 'aim' as Phase,
    grabbed: -1, // toy in the claw
    won: [] as number[],
    gemDone: false,
  });
  const { round, aim, phase, grabbed, won, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const g = scene.glass;
  const busy = useRef(false);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const wonSet = new Set(won);

  useEffect(() => {
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  // Scene % of a glass point.
  const sx = (gx: number) => g.x - g.w / 2 + (gx / 100) * g.w;
  const floorY = g.y + g.h / 2 - 2; // where the toys rest
  const topY = g.y - g.h / 2 + 4; // where the claw parks

  const steer = (to: number) => { if (phase === 'aim' && r) { sfx.pop(); setState((s) => ({ ...s, aim: Math.max(6, Math.min(94, to)) })); } };

  const drop = async () => {
    if (!r || busy.current || phase !== 'aim') return;
    busy.current = true;
    sfx.pop();
    // Which toy is under the claw? (the nearest one within reach)
    let hit = -1, best = 99;
    scene.toys.forEach((t, i) => { if (!wonSet.has(i) && Math.abs(t.x - aim) < best && Math.abs(t.x - aim) <= 9) { best = Math.abs(t.x - aim); hit = i; } });
    setState((s) => ({ ...s, phase: 'drop' }));
    await wait(900);
    setState((s) => ({ ...s, phase: 'lift', grabbed: hit }));
    await wait(900);
    if (hit === r.target) {
      setState((s) => ({ ...s, phase: 'carry' }));
      await wait(1000);
      sfx.match(); fire(sx(92), floorY + 8, 'confetti');
      setState((s) => ({ ...s, won: [...s.won, hit], grabbed: -1, phase: 'aim' }));
      await sayWithin(r.reply, scene.who, 4000);
      const next = round + 1;
      if (next >= total && !gemDone) { sfx.gem(); onWin(true); }
      setState((s) => ({ ...s, round: next, aim: 50, gemDone: s.gemDone || next >= total }));
    } else {
      if (hit >= 0) { sfx.wrong(); onLose(); shake(); }
      await sayWithin(hit >= 0 ? `That's the ${scene.toys[hit].label}! Try again!` : 'Oops! Nothing! Try again!', scene.who, 3000);
      setState((s) => ({ ...s, phase: 'back', grabbed: -1 }));
      await wait(500);
      setState((s) => ({ ...s, phase: 'aim' }));
    }
    busy.current = false;
  };

  const clawX = phase === 'carry' ? 92 : aim;
  const clawDown = phase === 'drop';
  const cableTop = g.y - g.h / 2;
  const clawY = clawDown ? floorY - 9 : topY;

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden" animate={shakeCtl}>
      <LivingBg img={scene.bg} video={scene.bgVideo} />
      {!r && <Confetti count={80} />}

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {r ? `🕹️ ${r.line}` : '🎉 You won all the prizes!'}
        {r && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>}
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>}

      {/* Toys inside the glass: tap one to steer the claw over it. */}
      {scene.toys.map((t, i) => {
        if (wonSet.has(i)) return null;
        const inClaw = grabbed === i && (phase === 'lift' || phase === 'carry');
        const x = inClaw ? sx(clawX) : sx(t.x);
        const y = inClaw ? topY + 9 : floorY - t.size * 0.6;
        return (
          <motion.button
            key={i}
            onClick={() => steer(t.x)}
            aria-label={t.label}
            className="absolute z-10 grid place-items-center"
            style={{ width: `${t.size}%`, aspectRatio: '1', translateX: '-50%', translateY: '-50%' }}
            initial={{ left: `${x}%`, top: `${y}%`, scale: 0 }}
            animate={{ left: `${x}%`, top: `${y}%`, scale: 1, rotate: inClaw ? [-6, 6, -6] : 0 }}
            transition={{ left: { duration: phase === 'carry' ? 1 : 0.6, ease: 'easeInOut' }, top: { duration: 0.8, ease: inClaw ? 'easeOut' : 'easeIn' }, scale: { type: 'spring', stiffness: 260, damping: 14, delay: i * 0.05 }, rotate: { duration: 0.8, repeat: inClaw ? Infinity : 0 } }}
            whileTap={{ scale: 0.9 }}
          >
            <ThingArt thing={t} />
          </motion.button>
        );
      })}

      {/* The claw on its cable (all in scene %, so it fits any screen). */}
      <motion.div
        className="pointer-events-none absolute z-20 w-[4px] -translate-x-1/2 rounded bg-slate-500"
        style={{ top: `${cableTop}%` }}
        animate={{ left: `${sx(clawX)}%`, height: `${clawY - cableTop + 1}%` }}
        transition={{ left: { type: 'spring', stiffness: 120, damping: 16 }, height: { duration: 0.85, ease: 'easeInOut' } }}
      />
      <motion.img
        src={scene.clawImg}
        alt=""
        draggable={false}
        className="pointer-events-none absolute z-20"
        style={{ width: 'min(15vh, 10vw)', translateX: '-50%', filter: STICKER_FILTER, transformOrigin: '50% 0%' }}
        animate={{ left: `${sx(clawX)}%`, top: `${clawY}%`, scaleX: phase === 'lift' || phase === 'carry' ? 0.82 : 1, rotate: phase === 'aim' ? [-3, 3, -3] : 0 }}
        transition={{ left: { type: 'spring', stiffness: 120, damping: 16 }, top: { duration: 0.85, ease: 'easeInOut' }, scaleX: { duration: 0.2 }, rotate: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
      />

      {/* Controls: steer + the big red drop button. */}
      {r && phase === 'aim' && (
        <div className="absolute bottom-[9%] left-1/2 z-30 flex -translate-x-1/2 items-center gap-4">
          <button onClick={() => steer(aim - 12)} aria-label="Move left" className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-2xl font-black text-orange-600 shadow-xl active:scale-90">◀</button>
          <motion.button onClick={drop} aria-label="Drop the claw" className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-b from-red-400 to-red-600 text-3xl text-white shadow-[inset_0_4px_0_rgba(255,255,255,0.5),0_8px_0_#991b1b,0_14px_24px_rgba(0,0,0,0.3)] active:translate-y-1"
            animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.4, repeat: Infinity }} whileTap={{ scale: 0.88 }}>⬇</motion.button>
          <button onClick={() => steer(aim + 12)} aria-label="Move right" className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-2xl font-black text-orange-600 shadow-xl active:scale-90">▶</button>
        </div>
      )}

      {/* Prizes won, on a shelf at the bottom left. */}
      <div className="absolute bottom-[9%] left-3 z-30 flex gap-1 rounded-2xl bg-white/85 px-2 py-1 shadow-lg">
        <span className="self-center text-lg">🏆</span>
        <AnimatePresence>
          {won.map((i) => (
            <motion.span key={i} className="block h-10 w-10" initial={{ scale: 0, y: -40 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 12 }}>
              <ThingArt thing={scene.toys[i]} />
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <Bursts items={bursts} />
      {!r && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function clawMachineLines(scene: Claw) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.toys.map((t) => [scene.who, `That's the ${t.label}! Try again!`]),
    [scene.who, 'Oops! Nothing! Try again!'],
  ] as [string, string][];
}
