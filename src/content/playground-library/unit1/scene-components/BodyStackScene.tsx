import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_TILTS, sayWithin } from './shared';
import { Bursts, LivingBg, idleFloat, useBursts, useShake } from './gameFx';

/* ---------- Stack the Friend ----------
 * Body-parts apps' "assemble the body" (place each part in its spot), made
 * a listening game: the friend has been cut into slices — head, shoulders,
 * knees, toes — mixed up in a tray. The voice names a part ("Where are the
 * knees?"); the child taps that slice and it flies into its place in the
 * frame. Built from head to toe, the friend comes alive and bounces.
 * The slices are cut from one painted picture (`source` region of `img`,
 * in % of the picture), so no extra art is needed. */

type Stack = Extract<Scene, { kind: 'body-stack' }>;

/** CSS that shows the band [y0,y1] (fractions of the source box) of the picture. */
function sliceStyle(img: string, src: Stack['source'], y0: number, y1: number): React.CSSProperties {
  const rx = src.x, rw = src.w, ry = src.y + src.h * y0, rh = src.h * (y1 - y0);
  return {
    backgroundImage: `url(${img})`,
    backgroundSize: `${(100 / rw) * 100}% ${(100 / rh) * 100}%`,
    backgroundPosition: `${rw >= 100 ? 0 : (rx / (100 - rw)) * 100}% ${rh >= 100 ? 0 : (ry / (100 - rh)) * 100}%`,
    backgroundRepeat: 'no-repeat',
  };
}

export function BodyStackScene({ scene, onWin, onLose, onNext, sync }: { scene: Stack; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    placed: [] as number[], // slices in the frame
    wrong: -1,
    gemDone: false,
  });
  const { round, placed, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const placedSet = useMemo(() => new Set(placed), [placed]);
  const n = scene.slices.length;
  // A fixed shuffle for the tray (same on both screens).
  const tray = useMemo(() => scene.slices.map((_, i) => i).sort((a, b) => ((a * 5 + 2) % n) - ((b * 5 + 2) % n)), [scene.id, n]);
  const busy = useRef(false);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pick = async (i: number) => {
    if (!r || busy.current || placedSet.has(i)) return;
    if (i !== r.slice) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    busy.current = true;
    sfx.match();
    const sl = scene.slices[i];
    fire(FRAME.x, FRAME.top + FRAME.h * ((sl.y0 + sl.y1) / 2), 'stars');
    setState((s) => ({ ...s, placed: [...s.placed, i] }));
    await sayWithin(r.reply, scene.who, 3500);
    const next = round + 1;
    if (next >= total) { fire(FRAME.x, FRAME.top + FRAME.h / 2, 'confetti'); if (!gemDone) { sfx.gem(); onWin(true); } }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
    busy.current = false;
  };

  // The frame where the friend is rebuilt (left), sized to the source box's shape.
  const aspect = (scene.source.w * 1376) / (scene.source.h * 768);

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden" animate={shakeCtl}>
      <LivingBg img={scene.bg} video={scene.bgVideo} />
      {done && <Confetti count={70} />}

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {r ? `🧩 ${r.line}` : `🎉 ${scene.doneLine}`}
        {r && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>}
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>}

      {/* The frame: a dashed outline, slices drop into their bands. */}
      <motion.div
        className="absolute z-10 rounded-[28px] border-4 border-dashed border-white/80 bg-white/35 shadow-xl backdrop-blur-sm"
        style={{ left: `${FRAME.x}%`, top: `${FRAME.top}%`, height: `${FRAME.h}%`, aspectRatio: `${aspect}`, translateX: '-50%' }}
        animate={done ? { y: [0, -30, 0, -14, 0], scaleY: [1, 1.04, 0.96, 1.02, 1] } : { y: 0 }}
        transition={done ? { duration: 1.1, delay: 0.3 } : { duration: 0.3 }}
      >
        {scene.slices.map((sl, i) => (
          <motion.div
            key={i}
            className="absolute inset-x-0"
            style={{ top: `${sl.y0 * 100}%`, height: `${(sl.y1 - sl.y0) * 100}%`, ...sliceStyle(scene.img, scene.source, sl.y0, sl.y1) }}
            initial={false}
            animate={placedSet.has(i) ? { opacity: 1, scale: [1.25, 0.92, 1], y: [-40, 0] } : { opacity: 0, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        ))}
      </motion.div>

      {/* The tray of mixed-up slices (right). */}
      <div className="absolute right-[5%] top-[16%] z-20 flex h-[74%] w-[40%] flex-col items-center justify-center gap-[2vh]">
        {tray.map((i, k) => {
          const sl = scene.slices[i];
          const gone = placedSet.has(i);
          const hPct = (sl.y1 - sl.y0) * 100;
          return (
            <motion.button
              key={i}
              onClick={() => pick(i)}
              aria-label={sl.label}
              className={`relative overflow-hidden rounded-2xl border-4 border-white bg-white/60 shadow-xl ${gone ? 'pointer-events-none' : ''}`}
              style={{ height: `${Math.max(12, Math.min(24, hPct * 0.42))}vh`, aspectRatio: `${aspect / (sl.y1 - sl.y0)}`, rotate: STICKER_TILTS[k % STICKER_TILTS.length], ...sliceStyle(scene.img, scene.source, sl.y0, sl.y1) }}
              initial={{ scale: 0, x: 80 }}
              animate={gone ? { scale: 0, opacity: 0 } : wrong === i ? { x: [0, -12, 12, -8, 8, 0], scale: 1 } : { scale: 1, x: 0, opacity: 1 }}
              transition={wrong === i ? { duration: 0.45 } : { type: 'spring', stiffness: 260, damping: 15, delay: gone ? 0 : k * 0.07 }}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
            >
              <motion.span className="absolute inset-0" {...idleFloat(k)} />
            </motion.button>
          );
        })}
      </div>

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute bottom-[8%] right-[12%] z-40" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Where the friend is rebuilt (scene %). */
const FRAME = { x: 30, top: 14, h: 78 };

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function bodyStackLines(scene: Stack) {
  return [...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]), [scene.who, scene.doneLine]] as [string, string][];
}
