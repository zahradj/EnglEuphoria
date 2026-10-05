import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CountdownRing, sayWithin } from './shared';
import { Bursts, FloatText, LivingBg, useBursts, useShake } from './gameFx';

/* ---------- Simon Says Touch ----------
 * The classroom favourite "Simon says, touch your knees!" (games4esl,
 * tefl.net body-vocab ideas) crossed with the apps' "tap the right part"
 * (Lingokids body-parts activities). A friend stands painted in the picture;
 * the voice gives a command. With "Simon says" the child taps that part —
 * it glows, sparkles and the word pops up. WITHOUT "Simon says" the child
 * must NOT tap: if the ring runs out, "Good listening!" and a star. The
 * listening twist apps don't have: hearing the whole sentence decides, not
 * just the noun. `parts` = spots on the painted body (x/y centre %, r = radius %). */

type Simon = Extract<Scene, { kind: 'simon-touch' }>;
const WAIT_S = 4;

export function SimonTouchScene({ scene, onWin, onLose, onNext, sync }: { scene: Simon; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    lit: -1, // part glowing after a right tap
    oops: -1, // part tapped when Simon didn't say
    stars: 0,
    gemDone: false,
  });
  const { round, lit, oops, stars, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const busy = useRef(false);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const [ringKey, setRingKey] = useState(0);

  const next = async (gotStar: boolean) => {
    const n = round + 1;
    setState((s) => ({ ...s, round: n, lit: -1, oops: -1, stars: s.stars + (gotStar ? 1 : 0) }));
    if (n >= total && !gemDone) { sfx.gem(); onWin(true); setState((s) => ({ ...s, gemDone: true })); }
  };

  useEffect(() => {
    if (!r) return;
    busy.current = false;
    setRingKey((k) => k + 1);
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 500);
    // No "Simon says": waiting is the right answer.
    const w = r.simon ? 0 : window.setTimeout(async () => {
      if (busy.current) return;
      busy.current = true;
      sfx.match(); fire(50, 40, 'stars');
      await sayWithin("Good listening! Simon didn't say!", scene.who, 3000);
      await next(true);
    }, 500 + WAIT_S * 1000);
    return () => { window.clearTimeout(t); if (w) window.clearTimeout(w); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const tap = async (j: number) => {
    if (!r || busy.current) return;
    const p = scene.parts[j];
    if (!r.simon) {
      busy.current = true;
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, oops: j }));
      await sayWithin("Oops! Simon didn't say!", scene.who, 3000);
      await next(false);
      return;
    }
    if (j !== r.part) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, oops: j }));
      window.setTimeout(() => setState((s) => ({ ...s, oops: -1 })), 700);
      return;
    }
    busy.current = true;
    sfx.match(); fire(p.x, p.y, 'sparkle'); fire(p.x, p.y - 4, 'stars');
    setState((s) => ({ ...s, lit: j }));
    await sayWithin(`Yes! ${cap(p.label)}!`, scene.who, 3000);
    await next(true);
  };

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden" animate={shakeCtl}>
      <LivingBg img={scene.bg} video={scene.bgVideo} />
      {!r && <Confetti count={70} />}

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {r ? `${r.simon ? '🙋' : '🤫'} ${r.line}` : `🎉 Great listening! ${'⭐'.repeat(Math.min(stars, 10))}`}
        {r && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>}
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>}

      {/* Ring timer: runs only when Simon didn't say (waiting wins). */}
      {r && !r.simon && (
        <div className="pointer-events-none absolute left-4 top-16 z-30 h-16 w-16"><CountdownRing seconds={WAIT_S} runKey={ringKey} color="#8B5CF6" /></div>
      )}

      {/* Touch spots on the painted body. */}
      {scene.parts.map((p, j) => (
        <motion.button
          key={j}
          onClick={() => tap(j)}
          aria-label={p.label}
          className="absolute z-20 rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.r * 2}vh`, height: `${p.r * 2}vh`, translateX: '-50%', translateY: '-50%' }}
          animate={lit === j
            ? { boxShadow: ['0 0 0 0 rgba(250,204,21,0.9)', '0 0 0 22px rgba(250,204,21,0)'], backgroundColor: 'rgba(253,224,71,0.45)', scale: [1, 1.25, 1] }
            : oops === j ? { x: [0, -10, 10, -6, 6, 0], backgroundColor: 'rgba(255,255,255,0.25)' }
              : { backgroundColor: 'rgba(255,255,255,0)', scale: 1 }}
          transition={{ duration: 0.6 }}
          whileTap={{ scale: 0.88 }}
        />
      ))}
      <AnimatePresence>
        {lit >= 0 && scene.parts[lit] && (
          <FloatText show x={scene.parts[lit].x} y={scene.parts[lit].y - 10}>✨ {scene.parts[lit].label}</FloatText>
        )}
      </AnimatePresence>

      <Bursts items={bursts} />
      {!r && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function simonTouchLines(scene: Simon) {
  return [
    ...scene.rounds.map((r) => [scene.who, r.line]),
    ...scene.parts.map((p) => [scene.who, `Yes! ${cap(p.label)}!`]),
    [scene.who, "Good listening! Simon didn't say!"],
    [scene.who, "Oops! Simon didn't say!"],
  ] as [string, string][];
}
