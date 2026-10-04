import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_TILTS, ThingArt, sayWithin } from './shared';
import { Bursts, FloatText, LivingBg, useBursts, useShake } from './gameFx';

/* ---------- Tidy Up ----------
 * Lingokids × Toy Story (2026) "pack the box with toys" and the Lingokids
 * clean-up activities, with Cambridge Pre A1 Starters Listening Part 4's
 * prepositions (in / on / under). The room is messy; the voice says "Put the
 * ball in the box!". The child drags that toy to that place (or taps the
 * toy, then the place). Right: the toy flies over in an arc, lands with a
 * squash and a sparkle, and stays there — the room gets tidier. Wrong: the
 * toy wobbles back, no penalty beyond a soft "boop". The place word is the
 * whole point: several places are always open. */

type Tidy = Extract<Scene, { kind: 'tidy-up' }>;

export function TidyUpScene({ scene, onWin, onLose, onNext, sync }: { scene: Tidy; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    selected: -1,
    wrong: -1,
    flying: false,
    gemDone: false,
  });
  const { round, selected, wrong, flying, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  // Where each toy is now: tidied toys sit where their round put them.
  const homes = useMemo(() => {
    const m = new Map<number, { x: number; y: number }>();
    scene.rounds.forEach((rr, k) => { if (k < round || (k === round && flying)) m.set(rr.toy, rr.at); });
    return m;
  }, [scene.rounds, round, flying]);
  const [drag, setDrag] = useState<{ i: number; x: number; y: number; sx: number; sy: number } | null>(null);
  const busy = useRef(false);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const [hint, setHint] = useState(-1); // the place that glows after a wrong drop

  useEffect(() => {
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const tryPut = async (toy: number, place: number) => {
    if (!r || busy.current || flying || homes.has(toy) || !scene.toys[toy]) return;
    if (toy !== r.toy || place !== r.place) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: toy, selected: -1 }));
      setHint(r.place);
      window.setTimeout(() => { setState((s) => ({ ...s, wrong: -1 })); setHint(-1); }, 900);
      return;
    }
    busy.current = true;
    sfx.pop();
    setState((s) => ({ ...s, flying: true, selected: -1 }));
    window.setTimeout(() => { sfx.match(); fire(r.at.x, r.at.y, 'stars'); }, 650);
    await sayWithin(r.reply, scene.who, 4000);
    const next = round + 1;
    busy.current = false;
    if (next >= total) {
      setState((s) => ({ ...s, round: next, flying: false }));
      window.setTimeout(() => { fire(50, 45, 'confetti'); sfx.gem(); }, 300);
      if (!gemDone) { onWin(true); setState((s) => ({ ...s, gemDone: true })); }
      return;
    }
    setState((s) => ({ ...s, round: next, flying: false }));
  };

  const tapToy = (i: number) => { if (!homes.has(i) && !flying) { sfx.pop(); setState((s) => ({ ...s, selected: s.selected === i ? -1 : i })); } };
  const tapPlace = (j: number) => { if (selected >= 0) void tryPut(selected, j); };

  const start = (i: number, e: React.PointerEvent) => {
    if (homes.has(i) || flying) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrag({ i, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY });
  };
  const moveDrag = (e: React.PointerEvent) => { if (drag) setDrag({ ...drag, x: e.clientX, y: e.clientY }); };
  const endDrag = (e: React.PointerEvent) => {
    if (!drag) return;
    const d = drag;
    setDrag(null);
    const moved = Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy);
    const el = document.elementsFromPoint(e.clientX, e.clientY).find((x) => (x as HTMLElement).dataset?.place != null) as HTMLElement | undefined;
    if (el && moved >= 6) void tryPut(d.i, Number(el.dataset.place));
    else if (moved < 6) tapToy(d.i);
  };

  return (
    <motion.div className="absolute inset-0 touch-none select-none overflow-hidden" animate={shakeCtl} onPointerMove={moveDrag} onPointerUp={endDrag}>
      <LivingBg img={scene.bg} video={scene.bgVideo} />
      {done && <Confetti count={70} />}

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {r ? `🧺 ${r.line}` : '🎉 The room is tidy!'}
        {r && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>}
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>}

      {/* Drop places, painted in the picture: invisible until a toy is picked up. */}
      {scene.places.map((p, j) => {
        const lit = (selected >= 0 || drag) && !done;
        return (
          <motion.button
            key={j} data-place={j} onClick={() => tapPlace(j)} aria-label={p.label}
            className="absolute z-10 rounded-[28px]"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, height: `${p.h}%`, translateX: '-50%', translateY: '-50%' }}
            animate={hint === j
              ? { boxShadow: ['0 0 0 0px rgba(250,204,21,0)', '0 0 0 8px rgba(250,204,21,0.9)', '0 0 0 0px rgba(250,204,21,0)'], backgroundColor: 'rgba(254,249,195,0.35)' }
              : lit ? { boxShadow: '0 0 0 4px rgba(255,255,255,0.85)', backgroundColor: 'rgba(255,255,255,0.18)' } : { boxShadow: '0 0 0 0px rgba(255,255,255,0)', backgroundColor: 'rgba(255,255,255,0)' }}
            transition={hint === j ? { duration: 0.9, repeat: 1 } : { duration: 0.25 }}
          />
        );
      })}

      {/* The toys: on the floor (idle wobble), or flown to where they belong. */}
      {scene.toys.map((t, i) => {
        const home = homes.get(i);
        const isFlying = flying && r?.toy === i;
        const pos = home ?? { x: t.x, y: t.y };
        const isTarget = !!r && r.toy === i && !home;
        return (
          <motion.button
            key={i}
            onPointerDown={(e) => start(i, e)}
            aria-label={t.label}
            className={`absolute z-20 grid place-items-center ${home ? 'pointer-events-none' : ''}`}
            style={{ width: `${home ? t.size * 0.8 : t.size}%`, aspectRatio: '1', translateX: '-50%', translateY: '-50%', rotate: home ? 0 : STICKER_TILTS[i % STICKER_TILTS.length] }}
            initial={{ left: `${t.x}%`, top: `${t.y}%`, scale: 0 }}
            animate={isFlying
              ? { left: [`${t.x}%`, `${(t.x + pos.x) / 2}%`, `${pos.x}%`], top: [`${t.y}%`, `${Math.min(t.y, pos.y) - 22}%`, `${pos.y}%`], scale: [1, 1.15, 0.8], scaleY: [1, 1, 0.8] }
              : wrong === i
                ? { left: `${pos.x}%`, top: `${pos.y}%`, x: [0, -14, 14, -9, 9, 0], scale: 1 }
                : { left: `${pos.x}%`, top: `${pos.y}%`, scale: selected === i ? 1.18 : 1, scaleY: 1, opacity: drag?.i === i ? 0.3 : 1 }}
            transition={isFlying
              ? { duration: 0.7, times: [0, 0.5, 1], ease: ['easeOut', 'easeIn'] }
              : wrong === i ? { duration: 0.45 } : { type: 'spring', stiffness: 260, damping: 15, delay: home ? 0 : i * 0.06 }}
            whileHover={home ? undefined : { scale: 1.1 }}
            whileTap={home ? undefined : { scale: 0.9 }}
          >
            {selected === i && <span className="absolute inset-0 rounded-full bg-yellow-200/70 blur-lg" />}
            {/* ground shadow on the floor */}
            {!home && <span className="absolute bottom-[2%] left-1/2 h-[12%] w-[70%] -translate-x-1/2 rounded-[50%] bg-black/20 blur-[3px]" />}
            <motion.span
              className="relative block h-full w-full"
              animate={home ? { scaleY: [0.78, 1.12, 0.94, 1], scaleX: [1.18, 0.9, 1.04, 1] } : isTarget && round === 0 ? { y: [0, -10, 0] } : { rotate: [-3, 3, -3] }}
              transition={home ? { duration: 0.5 } : { duration: isTarget && round === 0 ? 1.2 : 2.6 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '50% 100%' }}
            >
              <ThingArt thing={t} />
            </motion.span>
          </motion.button>
        );
      })}

      {drag && scene.toys[drag.i] && (
        <motion.div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: drag.x, top: drag.y, width: `${scene.toys[drag.i].size}vw`, aspectRatio: '1', filter: 'drop-shadow(0 22px 14px rgba(0,0,0,0.35))' }}
          initial={{ scale: 1 }} animate={{ scale: 1.2, rotate: Math.max(-18, Math.min(18, (drag.x - drag.sx) / 12)) }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <ThingArt thing={scene.toys[drag.i]} />
        </motion.div>
      )}

      <Bursts items={bursts} />
      <FloatText show={flying} x={r?.at.x ?? 50} y={(r?.at.y ?? 50) - 18}>⭐ {r ? scene.places[r.place]?.label : ''}</FloatText>

      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function tidyUpLines(scene: Tidy) {
  return scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]) as [string, string][];
}
