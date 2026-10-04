import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_TILTS, ThingArt, sayWithin } from './shared';
import { Bursts, LivingBg, idleFloat, useBursts, useShake } from './gameFx';

/* ---------- Shadow Match ----------
 * The shadow-matching puzzle of Khan Academy Kids and preschool "match the
 * shadow" cards: a row of dark silhouettes, the coloured pictures below.
 * The child drags each picture onto its shadow (or taps it, then the
 * shadow); it snaps in and is named — "It's a clock. It's a circle!".
 * Recognising an outline is recognising the SHAPE, without colour to help. */

type Shadow = Extract<Scene, { kind: 'shadow-match' }>;
const PROMPT = 'Find the shadow!';

export function ShadowMatchScene({ scene, onWin, onLose, onNext, sync }: { scene: Shadow; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    placed: [] as number[],
    selected: -1,
    wrong: -1,
    gemDone: false,
  });
  const { placed, selected, wrong, gemDone } = state;
  const placedSet = useMemo(() => new Set(placed), [placed]);
  const n = scene.items.length;
  // Shadows keep the authored order; the tray is a fixed shuffle (same on both screens).
  const tray = useMemo(() => scene.items.map((_, i) => i).sort((a, b) => ((a * 7 + 3) % n) - ((b * 7 + 3) % n)), [scene.id, n]);
  const [drag, setDrag] = useState<{ i: number; x: number; y: number; sx: number; sy: number } | null>(null);
  const busy = useRef(false);
  const stage = useRef<HTMLDivElement>(null);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  /** Burst on a shadow slot (positions measured, so it lands on the right spot on any screen). */
  const burstAt = (j: number) => {
    const box = stage.current?.getBoundingClientRect();
    const el = stage.current?.querySelector(`[data-shadow="${j}"]`)?.getBoundingClientRect();
    if (box && el) fire(((el.left + el.width / 2 - box.left) / box.width) * 100, ((el.top + el.height / 2 - box.top) / box.height) * 100, 'stars');
  };
  const done = placed.length >= n;

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(PROMPT, scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const tryPlace = async (item: number, shadow: number) => {
    if (busy.current || placedSet.has(item) || !scene.items[item]) return;
    if (item !== shadow) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: item, selected: -1 }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    busy.current = true;
    sfx.match();
    burstAt(shadow);
    const nextPlaced = [...placed, item];
    setState((s) => ({ ...s, placed: [...s.placed.filter((p) => p !== item), item], selected: -1 }));
    await sayWithin(scene.items[item].line, scene.who, 4000);
    busy.current = false;
    if (nextPlaced.length >= n && !gemDone) { sfx.gem(); onWin(true); setState((s) => ({ ...s, gemDone: true })); }
  };

  const tapTray = (i: number) => { if (!placedSet.has(i)) { sfx.pop(); setState((s) => ({ ...s, selected: s.selected === i ? -1 : i })); } };
  const tapShadow = (j: number) => { if (selected >= 0 && !placedSet.has(j)) void tryPlace(selected, j); };

  // Drag: a floating copy follows the finger; dropping on a shadow tries it.
  const start = (i: number, e: React.PointerEvent) => {
    if (placedSet.has(i)) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrag({ i, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY });
  };
  const moveDrag = (e: React.PointerEvent) => { if (drag) setDrag({ ...drag, x: e.clientX, y: e.clientY }); };
  const endDrag = (e: React.PointerEvent) => {
    if (!drag) return;
    const d = drag;
    setDrag(null);
    const moved = Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy);
    const el = document.elementsFromPoint(e.clientX, e.clientY).find((x) => (x as HTMLElement).dataset?.shadow != null) as HTMLElement | undefined;
    if (el) void tryPlace(d.i, Number(el.dataset.shadow));
    else if (moved < 6) tapTray(d.i);
  };

  const size = `min(${n > 5 ? 16 : 19}vh, ${n > 5 ? 12 : 14}vw)`;
  return (
    <motion.div ref={stage} className="absolute inset-0 touch-none select-none overflow-hidden" animate={shakeCtl} onPointerMove={moveDrag} onPointerUp={endDrag}>
      <LivingBg img={scene.bg} video={scene.bgVideo} />
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {done ? '🎉 All the shadows!' : `🌑 ${PROMPT}`}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{placed.length}/{n}</span>
      </div>
      <button onClick={() => cueSpeak(PROMPT, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>

      {/* Shadows on a frosted shelf */}
      <motion.div
        className="absolute inset-x-[4%] top-[15%] z-10 flex justify-center gap-[2vw] rounded-[32px] bg-white/55 px-4 py-4 shadow-[inset_0_4px_0_rgba(255,255,255,0.9),0_14px_30px_rgba(0,0,0,0.18)] backdrop-blur-md"
        initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      >
        {scene.items.map((it, j) => {
          const filled = placedSet.has(j);
          const target = selected >= 0 && !filled;
          return (
            <motion.button
              key={j} data-shadow={j} onClick={() => tapShadow(j)} aria-label={filled ? it.label : 'Shadow'}
              className={`relative grid place-items-center rounded-3xl ${target ? 'bg-yellow-100/70 ring-4 ring-yellow-300' : ''}`}
              style={{ width: size, height: size }}
              animate={filled ? { scale: [0.6, 1.25, 1], rotate: [0, -10, 0] } : target ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={filled ? { duration: 0.5 } : target ? { duration: 0.9, repeat: Infinity } : { duration: 0.2 }}
            >
              <span className="pointer-events-none block h-[86%] w-[86%]"><ThingArt thing={it} shadow={!filled} /></span>
              {filled && <motion.span className="pointer-events-none absolute -right-1 -top-1 text-2xl" animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>✨</motion.span>}
            </motion.button>
          );
        })}
      </motion.div>

      {/* The coloured pictures to place: they float, lift when picked up */}
      <div className="absolute inset-x-[4%] bottom-[7%] z-20 flex justify-center gap-[2.4vw]">
        {tray.map((i, k) => {
          const it = scene.items[i];
          const gone = placedSet.has(i);
          return (
            <motion.button
              key={i}
              onPointerDown={(e) => start(i, e)}
              aria-label={it.label}
              className={`relative grid place-items-center ${gone ? 'pointer-events-none' : ''}`}
              style={{ width: size, height: size, rotate: STICKER_TILTS[k % STICKER_TILTS.length] }}
              initial={{ scale: 0, y: 60 }}
              animate={gone ? { scale: 0, opacity: 0 } : wrong === i ? { x: [0, -12, 12, -8, 8, 0], scale: 1, y: 0 } : { scale: selected === i ? 1.15 : 1, opacity: drag?.i === i ? 0.3 : 1, y: 0 }}
              transition={wrong === i ? { duration: 0.45 } : { type: 'spring', stiffness: 300, damping: 16, delay: gone ? 0 : k * 0.06 }}
            >
              {selected === i && <span className="absolute inset-0 rounded-full bg-yellow-200/70 blur-lg" />}
              <motion.span className="relative block h-[86%] w-[86%]" {...idleFloat(k)}><ThingArt thing={it} /></motion.span>
            </motion.button>
          );
        })}
      </div>

      {drag && scene.items[drag.i] && (
        <motion.div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: drag.x, top: drag.y, width: size, height: size, filter: 'drop-shadow(0 22px 14px rgba(0,0,0,0.35))' }}
          initial={{ scale: 1 }} animate={{ scale: 1.25, rotate: Math.max(-18, Math.min(18, (drag.x - drag.sx) / 12)) }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <ThingArt thing={scene.items[drag.i]} />
        </motion.div>
      )}
      <Bursts items={bursts} />

      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function shadowMatchLines(scene: Shadow) {
  return [[scene.who, PROMPT], ...scene.items.map((it) => [scene.who, it.line])] as [string, string][];
}
