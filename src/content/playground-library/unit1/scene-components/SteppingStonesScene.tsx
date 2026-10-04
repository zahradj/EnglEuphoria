import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, ThingArt, sayWithin } from './shared';
import { Bursts, FloatText, Hopper, LivingBg, useBursts, useShake } from './gameFx';

/* ---------- Stepping Stones ----------
 * The classic classroom floor game ("Jump on the red circle!") and the
 * river-crossing levels of kids' apps: the character must cross a river.
 * Each round three stones float ahead, each carrying a picture or a
 * coloured shape; the voice names one. Tap it and the character hops on
 * (arc + squash & stretch, splash); the wrong stone dips under with a
 * splash and the screen wobbles (no lives lost for good). On the far bank
 * waits the goal. Listening = moving forward. The river is a painted,
 * looping living background when the scene has one. */

type Stones = Extract<Scene, { kind: 'stepping-stones' }>;
const LANES = [44, 63, 82]; // y % of the three stones in a column

export function SteppingStonesScene({ scene, onWin, onLose, onNext, sync }: { scene: Stones; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    step: 0, // rounds crossed
    path: [] as number[], // lane picked in each crossed round
    wrong: -1,
    hopping: false,
    arrived: false,
    gemDone: false,
  });
  const { step, path, wrong, hopping, arrived, gemDone } = state;
  const total = scene.rounds.length;
  const r = step < total ? scene.rounds[step] : undefined;
  const colX = (k: number) => 14 + ((k + 1) * 72) / (total + 1); // column k centre (%)
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, scene.id]);

  const tap = async (lane: number) => {
    if (!r || hopping || !r.options[lane]) return;
    if (lane !== r.answer) {
      sfx.wrong(); onLose(); shake();
      fire(colX(step), LANES[lane], 'splash');
      setState((s) => ({ ...s, wrong: lane }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 900);
      return;
    }
    sfx.pop();
    setState((s) => ({ ...s, hopping: true, path: [...s.path.slice(0, step), lane] }));
    window.setTimeout(() => { fire(colX(step), LANES[lane] + 2, 'splash'); fire(colX(step), LANES[lane] - 8, 'stars'); sfx.match(); }, 700);
    await sayWithin(r.reply, scene.who, 3500);
    const next = step + 1;
    if (next >= total) {
      setState((s) => ({ ...s, step: next, hopping: false, arrived: true }));
      window.setTimeout(() => { fire(92, 52, 'confetti'); sfx.gem(); }, 700);
      await sayWithin(scene.goal.line, scene.who, 4500);
      if (!gemDone) { onWin(true); setState((s) => ({ ...s, gemDone: true })); }
      return;
    }
    setState((s) => ({ ...s, step: next, hopping: false }));
  };

  // Where the character stands: the bank, or the last stone it hopped on.
  const at = arrived
    ? { x: 92, y: 56 }
    : step === 0 && !hopping
      ? { x: 6, y: 57 }
      : (() => { const k = hopping ? step : step - 1; const lane = path[k] ?? 1; return { x: colX(k), y: LANES[lane] - 1 }; })();
  const walker = CAST[scene.walker];

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden" animate={shakeCtl}>
      <LivingBg img={scene.bg} video={scene.bgVideo} />
      {arrived && <Confetti count={70} />}
      {!scene.riverPainted && (
        <>
          <div className="absolute inset-x-[12%] bottom-[4%] top-[30%] overflow-hidden rounded-[48px] shadow-inner" style={{ background: 'linear-gradient(180deg,#7DD3FC 0%,#38BDF8 45%,#0EA5E9 100%)' }} />
          <div className="absolute bottom-[4%] left-0 top-[30%] w-[13%] rounded-r-[40px] bg-gradient-to-b from-lime-300 to-green-500 shadow-lg" />
          <div className="absolute bottom-[4%] right-0 top-[30%] w-[13%] rounded-l-[40px] bg-gradient-to-b from-lime-300 to-green-500 shadow-lg" />
        </>
      )}

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {r ? `🐸 ${r.line}` : `🎉 ${scene.goal.line}`}
        {r && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{step + 1}/{total}</span>}
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>}

      {/* Stones: crossed ones stay, the current column floats in and bobs on the water. */}
      <AnimatePresence>
        {scene.rounds.flatMap((round, k) => {
          if (k > step) return [];
          return round.options.map((o, lane) => {
            const crossed = k < step || (k === step && hopping);
            const chosen = path[k] === lane;
            if (crossed && !chosen) return null;
            const isNow = k === step && !hopping;
            const sinking = wrong === lane && isNow;
            return (
              <motion.button
                key={`${k}-${lane}`}
                onClick={() => isNow && tap(lane)}
                disabled={!isNow}
                aria-label={o.label}
                className="absolute z-10 grid place-items-center"
                style={{ left: `${colX(k)}%`, top: `${LANES[lane]}%`, width: 'min(17vh,12.5vw)', aspectRatio: '1.25', translateX: '-50%', translateY: '-50%' }}
                initial={{ scale: 0, y: 40, opacity: 0 }}
                animate={sinking
                  ? { scale: 0.92, y: [0, 22, 0], opacity: [1, 0.55, 1] }
                  : { scale: 1, opacity: 1, y: isNow ? [0, -6, 0] : 0 }}
                exit={{ scale: 0.4, y: 40, opacity: 0, transition: { duration: 0.35 } }}
                transition={sinking ? { duration: 0.8 } : isNow ? { y: { duration: 1.6 + lane * 0.25, repeat: Infinity, ease: 'easeInOut' }, scale: { type: 'spring', stiffness: 260, damping: 14, delay: lane * 0.12 }, opacity: { duration: 0.2 } } : { duration: 0.3 }}
                whileHover={isNow ? { scale: 1.08 } : undefined}
                whileTap={isNow ? { scale: 0.92 } : undefined}
              >
                {/* water ripples around the stone */}
                <motion.span
                  className="absolute left-1/2 top-[62%] block h-[46%] w-[120%] -translate-x-1/2 rounded-[50%] border-[3px] border-white/70"
                  animate={{ scale: [0.85, 1.15], opacity: [0.8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: lane * 0.3 }}
                />
                {scene.stoneImg
                  ? <img src={scene.stoneImg} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" style={{ filter: 'drop-shadow(0 10px 6px rgba(8,47,73,0.45))' }} />
                  : <span className="absolute inset-[8%] rounded-[50%]" style={{ background: 'radial-gradient(circle at 35% 30%, #F5F5F4 0, #A8A29E 60%, #78716C 100%)', boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.18), 0 8px 0 rgba(12,74,110,0.35)' }} />}
                <span className="relative -mt-[12%] block h-[52%] w-[52%]"><ThingArt thing={o} /></span>
              </motion.button>
            );
          });
        })}
      </AnimatePresence>

      {/* The goal on the far bank */}
      <motion.div
        className="pointer-events-none absolute z-10"
        style={{ left: '93%', top: '46%', width: '10%', translateX: '-50%', translateY: '-50%' }}
        animate={arrived ? { scale: [1, 1.25, 1.1], rotate: [0, -8, 8, 0] } : { y: [0, -6, 0] }}
        transition={arrived ? { duration: 0.9 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="absolute inset-[-25%] rounded-full bg-yellow-200/60 blur-xl" />
        <img src={scene.goal.img} alt={scene.goal.label} draggable={false} className="relative w-full" style={{ filter: STICKER_FILTER }} />
      </motion.div>

      <Hopper img={walker.img} alt={walker.name} x={at.x} y={at.y} width={11} hopHeight={18} />
      <Bursts items={bursts} />
      <FloatText show={hopping} x={at.x} y={at.y - 30}>⭐ {r?.options[r.answer]?.label}</FloatText>

      {arrived && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-30 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function steppingStonesLines(scene: Stones) {
  return [...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]), [scene.who, scene.goal.line]] as [string, string][];
}
