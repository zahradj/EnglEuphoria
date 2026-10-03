import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CLAY_CARD, STICKER_TILTS, ThingArt, sayWithin } from './shared';
import { Bursts, LivingBg, idleFloat, useBursts, useShake } from './gameFx';

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
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {solved ? `🎉 ${r.line}` : `👀 ${QUESTION}`}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(solved ? r.line : QUESTION, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>

      <div className="absolute inset-x-0 bottom-[6%] top-[13%] z-20 flex items-center justify-center gap-[4vw] px-4">
        {/* The hidden picture under its flipping tiles */}
        <motion.div
          key={round}
          className="relative aspect-[4/3] h-[min(62vh,44vw)] [perspective:900px]"
          initial={{ scale: 0.4, rotate: -8, opacity: 0 }} animate={{ scale: solved ? 1.06 : 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 15 }}
        >
          {solved && (
            <motion.div className="absolute inset-[-30%] -z-10 rounded-full" style={{ background: 'repeating-conic-gradient(from 0deg, rgba(253,224,71,0.55) 0deg 12deg, transparent 12deg 30deg)' }}
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1, rotate: 360 }} transition={{ rotate: { duration: 8, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.3 } }} />
          )}
          <div className={`${CLAY_CARD} relative h-full w-full overflow-hidden p-3`}>
            <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-white">
              <motion.img src={r.img} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain p-2" animate={solved ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : { scale: 1 }} transition={{ duration: 0.8 }} />
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
                {Array.from({ length: TILES }, (_, i) => (
                  <div key={i} className="relative [transform-style:preserve-3d]">
                    <AnimatePresence>
                      {!goneSet.has(i) && (
                        <motion.div
                          key={`${round}-${i}`}
                          className="absolute inset-0 grid place-items-center border border-white/60 text-2xl font-black text-white/80"
                          style={{ background: `linear-gradient(135deg, ${i % 2 ? '#FDBA74' : '#FB923C'}, ${i % 3 ? '#F472B6' : '#FB7185'})`, boxShadow: 'inset 0 3px 0 rgba(255,255,255,0.45), inset 0 -4px 0 rgba(0,0,0,0.12)' }}
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
