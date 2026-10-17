import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CLAY_CARD, STICKER_TILTS, ThingArt, sayWithin } from './shared';
import { Bursts, LivingBg, idleFloat, useBursts, useShake } from './gameFx';
import { SKIN, PILL_FONT } from '../../gameSkin';

/* ---------- Image Reveal ----------
 * Wordwall's "Image quiz" template: a hidden picture uncovers one tile at a
 * time, and the sooner you guess, the more you score. Pre-A1 version: the
 * voice asks "What is it?", tiles pop off every second, the child taps one
 * of three answer pictures (no reading) and says it. Guessing from a part
 * of the picture = noticing colour and shape before the whole object. */

type Reveal = Extract<Scene, { kind: 'tile-reveal' }>;
const COLS = 4, ROWS = 3, TILES = COLS * ROWS;
const TICK_MS = 1100;
const QUESTION = 'What is it?';

/** Bubbles design: 12 bubbles on a loose, jittered 4 × 3 grid (x/y = centre in % of the box, d = diameter in % of its
 *  width). Neighbours overlap so the picture is fully hidden; the same index pops as the tile it replaces. */
const BUBBLES = Array.from({ length: TILES }, (_, i) => {
  const c = i % COLS, rw = Math.floor(i / COLS);
  const jx = [-3, 2, -1, 3, 1, -2][i % 6], jy = [2, -3, 1, -1, 3, -2][(i + 2) % 6];
  return { x: 12.5 + c * 25 + jx, y: 16.7 + rw * 33.3 + jy, d: [36, 32, 38, 34][(i + rw) % 4] };
});
const BUBBLE_FILL = 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0 7%, rgba(255,255,255,0.45) 9%, rgba(125,211,252,0.88) 30%, rgba(14,165,233,0.92) 62%, rgba(3,105,161,0.96) 100%)';

/** A fixed shuffled order per round, identical on both screens. */
function order(seed: number) {
  const a = Array.from({ length: TILES }, (_, i) => i);
  let x = seed * 9301 + 49297;
  for (let i = a.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = x % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TileRevealScene({ scene, onWin, onLose, onNext, sync }: { scene: Reveal; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    gone: 0, // tiles removed so far
    solved: false,
    wrong: -1,
    stars: 0,
    gemDone: false,
  });
  const { round, gone, solved, wrong, stars, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const seq = useMemo(() => order(round + 3), [round]);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const goneSet = useMemo(() => new Set(seq.slice(0, solved ? TILES : gone)), [seq, gone, solved]);

  useEffect(() => {
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(QUESTION, scene.who), 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  // One tile pops off every tick until it is solved (stops two short of the
  // whole picture, so there is always something left to guess).
  useEffect(() => {
    if (!r || solved || gone >= TILES - 2) return;
    const t = window.setTimeout(() => { sfx.pop(); setState((s) => (s.solved ? s : { ...s, gone: Math.min(TILES - 2, s.gone + 1) })); }, TICK_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, gone, solved]);

  const pick = async (i: number) => {
    const o = r?.options[i];
    if (!r || !o || solved) return;
    if (o.label !== r.word) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match();
    fire(38, 52, 'stars');
    const earned = gone <= 4 ? 3 : gone <= 7 ? 2 : 1;
    setState((s) => ({ ...s, solved: true, stars: s.stars + earned }));
    await sayWithin(r.line, scene.who, 4000);
    await new Promise((res) => setTimeout(res, 800));
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gone: 0, solved: false, wrong: -1, gemDone: s.gemDone || awardGem }));
  };

  if (!r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pb-24">
        <LivingBg img={scene.bg} video={scene.bgVideo} />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center gap-4 px-4">
          <div className={`${CLAY_CARD} px-8 py-4 text-center text-2xl font-black text-orange-600`}>
            👀 Super guessing!
            <div className="mt-1 text-3xl">{'⭐'.repeat(Math.min(stars, 12))}</div>
          </div>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-4 text-xl`}>Next ⭐</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="absolute inset-0 overflow-hidden" animate={shakeCtl}>
      <LivingBg img={scene.bg} video={scene.bgVideo} />
      <div className={`pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 px-5 py-2 text-center ${SKIN.pill}`} style={{ fontSize: PILL_FONT }}>
        {solved ? `🎉 ${r.line}` : `👀 ${QUESTION}`}
        <span className="ml-2 rounded-full bg-[#FEAF15] px-2 py-0.5 text-sm text-[#2A1A05]">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(solved ? r.line : QUESTION, scene.who)} className={`absolute end-3 top-3 z-30 px-3 py-2 text-sm active:scale-95 ${SKIN.pill}`}>🔊 Again</button>

      <div className="absolute inset-x-0 bottom-[6%] top-[13%] z-20 flex items-center justify-center gap-[4vw] px-4">
        {/* Bubbles design: the picture floats in the sea; bubbles wobble in place and pop one by one. */}
        {scene.look === 'bubbles' && (
        <motion.div
          key={`b${round}`}
          className="relative aspect-[4/3] h-[min(62vh,44vw)]"
          initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: solved ? 1.06 : 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 15 }}
        >
          {solved && (
            <motion.div className="absolute inset-[-30%] -z-10 rounded-full" style={{ background: 'repeating-conic-gradient(from 0deg, rgba(253,224,71,0.5) 0deg 12deg, transparent 12deg 30deg)' }}
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1, rotate: 360 }} transition={{ rotate: { duration: 8, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.3 } }} />
          )}
          {/* a soft cream glow so the sticker reads clearly on the busy reef (no white box) */}
          <div className="absolute inset-[4%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(254,251,221,0.95) 0%, rgba(254,251,221,0.7) 42%, rgba(254,251,221,0) 72%)' }} />
          <motion.img src={r.img} alt="" draggable={false} className="absolute inset-[8%] h-[84%] w-[84%] object-contain drop-shadow-[0_8px_12px_rgba(3,105,161,0.35)]" animate={solved ? { scale: [1, 1.14, 1], rotate: [0, -4, 4, 0] } : { scale: 1 }} transition={{ duration: 0.8 }} />
          {BUBBLES.map((b, i) => (
            <AnimatePresence key={i}>
              {!goneSet.has(i) && (
                <motion.div
                  key={`${round}-${i}`}
                  className="absolute rounded-full"
                  style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.d}%`, aspectRatio: '1', marginLeft: `-${b.d / 2}%`, marginTop: `-${b.d / 2}%`, background: BUBBLE_FILL, border: '2px solid rgba(255,255,255,0.75)', boxShadow: 'inset -6px -8px 14px rgba(3,105,161,0.45), inset 4px 5px 10px rgba(255,255,255,0.35), 0 6px 14px rgba(3,105,161,0.25)' }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.04, 0.97, 1], opacity: 1, y: [0, -4, 0, 3, 0] }}
                  transition={{ scale: { duration: 2.6 + (i % 4) * 0.3, repeat: Infinity, delay: i * 0.05 }, y: { duration: 3 + (i % 3) * 0.4, repeat: Infinity }, opacity: { duration: 0.3, delay: i * 0.04 } }}
                  exit={{ scale: 1.45, opacity: 0, transition: { duration: 0.28, ease: 'easeOut' } }}
                >
                  <span className="absolute left-[22%] top-[16%] h-[18%] w-[26%] -rotate-[30deg] rounded-full bg-white/80" />
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </motion.div>
        )}
        {/* The hidden picture under its flipping tiles */}
        {scene.look !== 'bubbles' && (
        <motion.div
          key={round}
          className="relative aspect-[4/3] h-[min(62vh,44vw)] [perspective:900px]"
          initial={{ scale: 0.4, rotate: -8, opacity: 0 }} animate={{ scale: solved ? 1.06 : 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 15 }}
        >
          {solved && (
            <motion.div className="absolute inset-[-30%] -z-10 rounded-full" style={{ background: 'repeating-conic-gradient(from 0deg, rgba(253,224,71,0.55) 0deg 12deg, transparent 12deg 30deg)' }}
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1, rotate: 360 }} transition={{ rotate: { duration: 8, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.3 } }} />
          )}
          <div className={`relative h-full w-full overflow-hidden p-3 ${SKIN.frame}`}>
            <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-gradient-to-b from-[#FFFFFF] to-[#FEF6DA]">
              <motion.img src={r.img} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain p-2" animate={solved ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : { scale: 1 }} transition={{ duration: 0.8 }} />
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
                {Array.from({ length: TILES }, (_, i) => (
                  <div key={i} className="relative [transform-style:preserve-3d]">
                    <AnimatePresence>
                      {!goneSet.has(i) && (
                        <motion.div
                          key={`${round}-${i}`}
                          className="absolute inset-0 grid place-items-center border border-[#FEAF15]/45 text-2xl font-black text-[#FDE68A]/85"
                          style={{ background: `linear-gradient(135deg, ${['#38BDF8', '#0EA5E9', '#14B8A6', '#0EA5E9'][(i + Math.floor(i / COLS)) % 4]}, ${i % 3 ? '#0369A1' : '#0F766E'})`, boxShadow: 'inset 0 3px 0 rgba(255,255,255,0.3), inset 0 -4px 0 rgba(0,0,0,0.18)' }}
                          initial={{ rotateY: 0 }}
                          exit={{ rotateY: 100, scale: 0.5, opacity: 0, y: -20, transition: { duration: 0.5, ease: 'easeIn' } }}
                        >
                          <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.6, repeat: Infinity, delay: (i % 5) * 0.2 }}>?</motion.span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* Answer pictures — floating stickers, no words */}
        <div className="flex flex-col gap-4">
          {r.options.map((o, i) => {
            const right = solved && o.label === r.word;
            return (
              <motion.button
                key={`${round}-${i}`}
                onClick={() => pick(i)}
                aria-label={o.label}
                className="relative grid h-[min(18vh,13vw)] w-[min(18vh,13vw)] place-items-center"
                style={{ rotate: STICKER_TILTS[i % STICKER_TILTS.length] }}
                initial={{ x: 120, opacity: 0 }}
                animate={wrong === i ? { x: [0, -12, 12, -8, 8, 0], opacity: 1 } : { x: 0, opacity: solved && !right ? 0.3 : 1, scale: right ? 1.2 : 1 }}
                transition={wrong === i ? { duration: 0.45 } : { type: 'spring', stiffness: 260, damping: 16, delay: i * 0.08 }}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              >
                <motion.span className="block h-full w-full" {...idleFloat(i)}><ThingArt thing={o} /></motion.span>
                {right && <motion.span className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-lg text-white shadow-lg" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span>}
              </motion.button>
            );
          })}
        </div>
      </div>
      <Bursts items={bursts} />
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function tileRevealLines(scene: Reveal) {
  return [[scene.who, QUESTION], ...scene.rounds.map((r) => [scene.who, r.line])] as [string, string][];
}
