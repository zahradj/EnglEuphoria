import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Remember? (warm-up recall, every lesson after the first) ----------
 * Owner's rule (2026-10-07): each lesson opens with a short reminder of the
 * lesson before, "just to memorise". Pip says a word from last time and the
 * child finds it — no reading. Two looks so it never feels the same:
 *  - 'click'  — listen and click: three pictures, tap the one you hear;
 *  - 'shadow' — listen and match: every sticker is a shadow; tap the shadow you
 *               hear and it fills with colour (stickers only).
 * Researched: spaced retrieval warm-ups (Cambridge young-learner lesson
 * openers, Khan Academy Kids / Lingokids review loops, Duolingo's
 * "practice what you learned" start). Calm: no clock, no lost hearts; a wrong
 * tap is just "Try again!" and the right one glows after two tries. */

type Recall = Extract<Scene, { kind: 'recall-warmup' }>;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const RECALL_INTRO = 'Do you remember? Listen and find it!';
export const RECALL_TRY = 'Try again!';
export const RECALL_DONE = 'You remember! Great job!';
export const recallYes = (word: string) => `Yes! ${cap(word)}!`;
const isScene = (img: string) => img.includes('/scenes/');

/** Click mode: the target plus two others, in a fixed order both screens agree on. */
function optionsFor(n: number, target: number) {
  if (n <= 3) return Array.from({ length: n }, (_, i) => i);
  const a = (target + 1) % n;
  const b = (target + 2) % n;
  const set = [target, a, b];
  const rot = target % 3;
  return [...set.slice(rot), ...set.slice(0, rot)];
}

export function RecallWarmupScene({ scene, onNext, sync }: { scene: Recall; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { idx: 0, found: [] as number[] });
  const { idx, found } = state;
  const foundSet = useMemo(() => new Set(found), [found]);
  const total = scene.items.length;
  const item = idx < total ? scene.items[idx] : undefined;
  const done = idx >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!item) return;
    const first = idx === 0;
    const t = window.setTimeout(async () => {
      if (first) await sayWithin(RECALL_INTRO, scene.who, 3000);
      cueSpeak(item.say, scene.who);
    }, first ? 600 : 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, scene.id]);

  const pick = async (i: number) => {
    if (!item || busy.current || foundSet.has(i)) return;
    busy.current = true;
    if (i !== idx) {
      sfx.wrong(); shake(); setWrong(i);
      setMisses((m) => m + 1);
      await sayWithin(RECALL_TRY, scene.who, 1600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.match(); fire(50, 50, 'stars');
    setState((s) => ({ ...s, found: [...s.found, i] }));
    await sayWithin(recallYes(item.word), scene.who, 2200);
    const next = idx + 1;
    setState((s) => ({ ...s, idx: next }));
    if (next >= total) { fire(50, 40, 'confetti'); sfx.gem(); void sayWithin(RECALL_DONE, scene.who, 3000); }
  };

  const shownIdx = scene.mode === 'shadow' ? scene.items.map((_, i) => i) : item ? optionsFor(total, idx) : [];

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {/* Soften the picture so the pictures and shadows stand out. */}
      <div className="absolute inset-0 bg-white/35 backdrop-blur-[4px]" />
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="rounded-full bg-white/90 px-4 py-1 text-sm font-black text-violet-700 shadow">🧠 Remember? · {scene.fromLabel}</span>
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.4rem, calc(3.4*var(--svw,1vw)), 2.8rem)' }}>
          {item ? item.say : RECALL_DONE}
        </span>
      </div>
      {item && <button onClick={() => cueSpeak(item.say, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {!done && (
        <div key={scene.mode === 'shadow' ? 'board' : idx} className="absolute inset-x-0 bottom-[12%] top-[34%] z-10 flex flex-wrap items-center justify-center gap-[3vw] px-6 [@media(max-height:500px)]:top-[36%]">
          {shownIdx.map((i, k) => {
            const it = scene.items[i];
            const got = foundSet.has(i);
            const glow = misses >= 2 && i === idx;
            const wide = isScene(it.img);
            return (
              <motion.button key={i} onClick={() => { void pick(i); }} aria-label={it.word}
                className="relative"
                initial={{ y: 60, opacity: 0 }}
                animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0], y: 0, opacity: 1 } : { y: [0, -5, 0], opacity: 1 }}
                transition={wrong === i ? { duration: 0.4 } : { y: { duration: 2 + k * 0.3, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.3, delay: k * 0.08 } }}
                whileTap={{ scale: 0.92 }}>
                {glow && <span className="absolute -inset-3 animate-pulse rounded-[28px] bg-yellow-300/80 blur-md" />}
                {wide ? (
                  <img src={it.img} alt="" draggable={false} className="relative h-[min(30vh,20vw)] w-[min(53vh,36vw)] rounded-[22px] object-cover shadow-[0_10px_22px_rgba(0,0,0,0.35)] [@media(max-height:500px)]:h-[26vh] [@media(max-height:500px)]:w-[46vh]" />
                ) : (
                  <img src={it.img} alt="" draggable={false} className="relative h-[min(30vh,22vw)] w-[min(30vh,22vw)] object-contain transition-[filter] duration-500 [@media(max-height:500px)]:h-[27vh] [@media(max-height:500px)]:w-[27vh]"
                    style={{ filter: scene.mode === 'shadow' && !got ? 'brightness(0) opacity(0.6) drop-shadow(0 0 3px #fff) drop-shadow(0 0 2px #fff)' : STICKER_FILTER }} />
                )}
                {got && scene.mode === 'shadow' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 text-base font-black text-emerald-700 shadow">{it.word}</span>}
              </motion.button>
            );
          })}
        </div>
      )}

      {done && (
        <div className="absolute inset-x-0 top-[34%] z-10 flex flex-wrap justify-center gap-3 px-6">
          {scene.items.map((it, i) => (
            <motion.img key={i} src={it.img} alt={it.word} draggable={false} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, type: 'spring' }}
              className={isScene(it.img) ? 'h-[16vh] w-[28vh] rounded-2xl object-cover shadow-lg' : 'h-[18vh] w-[18vh] object-contain'} style={isScene(it.img) ? undefined : { filter: STICKER_FILTER }} />
          ))}
        </div>
      )}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[10%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function recallWarmupLines(scene: Recall) {
  return [
    [scene.who, RECALL_INTRO], [scene.who, RECALL_TRY], [scene.who, RECALL_DONE],
    ...scene.items.flatMap((it) => [[scene.who, it.say], [scene.who, recallYes(it.word)]]),
  ] as [string, string][];
}
