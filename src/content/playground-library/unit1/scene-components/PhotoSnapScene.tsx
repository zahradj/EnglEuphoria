import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin, useArtBox } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Pet Photo (Pre-A1 Unit 7 Lesson 1 signature game) ----------
 * The pet shop is open and the child is the photographer. The animals sit
 * around the shop (dog bed, cat basket, bird cage …) and swap places every
 * round. Pip asks "Take a photo of the cat!"; the child taps the cat — click,
 * flash — and the photo drops into the album strip with the word under it
 * while Pip says "It's a cat! Meow!". A wrong animal is named back ("Oops!
 * That's the dog.") and makes its sound; after two tries the right one glows.
 * Researched: photo-safari / "snap the animal" apps (Pokémon Snap-style
 * listening hunts), Khan Academy Kids calm listen-and-find, Cambridge Pre A1
 * Starters "listen and point".
 * Better: the child must understand the WORD (the animals move, so position
 * never gives the answer); every tap teaches (the wrong animal says its name
 * and sound); no clock; the album the child fills stays on screen as a thing
 * they made, and every photo can be tapped to hear the word again. */

type Snap = Extract<Scene, { kind: 'photo-snap' }>;
export const SNAP_READY = 'Get your camera ready!';
export const snapOops = (label: string) => `Oops! That's the ${label}.`;

export function PhotoSnapScene({ scene, onWin, onLose, onNext, sync }: { scene: Snap; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, misses: 0, shot: -1, photos: [-1], gemDone: false });
  const { round, misses, shot, gemDone } = state;
  const photos = useMemo(() => state.photos.filter((p) => p >= 0), [state.photos]);
  const total = scene.rounds.length;
  const done = round >= total;
  const r = scene.rounds[round];
  const place = r?.place ?? scene.rounds[total - 1]?.place ?? scene.animals.map((_, i) => i);
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useArtBox(rootRef, scene.aspect ?? 16 / 9);
  const busy = useRef(false);
  const [bursts, fire] = useBursts();

  useEffect(() => {
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), round === 0 ? 2200 : 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(SNAP_READY, scene.who), 150);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const tap = async (i: number) => {
    if (!r || busy.current || shot >= 0) return;
    const a = scene.animals[i];
    const spot = scene.spots[place[i]];
    if (!a || !spot) return;
    busy.current = true;
    if (i !== r.target) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, misses: s.misses + 1 }));
      await sayWithin(snapOops(a.label), scene.who, 2500);
      busy.current = false;
      return;
    }
    sfx.pop();
    fire(spot.x, spot.y, 'sparkle');
    setState((s) => ({ ...s, shot: i, photos: [...s.photos.filter((p) => p >= 0), i] }));
    await sayWithin(a.say, scene.who, 3500);
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, shot: -1, misses: 0, round: next, gemDone: s.gemDone || next >= total }));
    if (next >= total) await sayWithin(scene.doneLine, scene.who, 4000);
    busy.current = false;
  };

  return (
    <div ref={rootRef} className="absolute inset-0 select-none overflow-hidden bg-gradient-to-b from-amber-100 to-orange-200">
      <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute" style={box} />
      {done && <Confetti count={70} />}

      {/* The animals sit on the picture's spots and hop to new ones each round. */}
      <div className="absolute z-20" style={box}>
        {!done && scene.animals.map((a, i) => {
          const spot = scene.spots[place[i]];
          if (!spot) return null;
          const glow = r && i === r.target && misses >= 2;
          return (
            <motion.button key={a.label} aria-label={a.label} onClick={() => { void tap(i); }}
              className="absolute -translate-x-1/2 -translate-y-full"
              initial={false}
              animate={{ left: `${spot.x}%`, top: `${spot.y}%`, width: `${spot.size * (a.scale ?? 1)}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 16 }}>
              <motion.img src={a.img} alt={a.label} draggable={false} className={`w-full ${glow ? 'animate-pulse' : ''}`}
                style={{ filter: glow ? `${STICKER_FILTER} drop-shadow(0 0 14px #fde047)` : STICKER_FILTER }}
                animate={{ y: [0, -6, 0], rotate: [0, i % 2 ? 2 : -2, 0] }}
                transition={{ duration: 2.2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }} />
            </motion.button>
          );
        })}
        <Bursts items={bursts} />
      </div>

      {/* Camera flash. */}
      <AnimatePresence>
        {shot >= 0 && <motion.div key={`flash-${round}`} className="pointer-events-none absolute inset-0 z-30 bg-white" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex justify-center px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.05rem, min(calc(3.2*var(--svw,1vw)), 5vh), 2.6rem)' }}>
          {done ? scene.doneLine : `\u{1F4F8} ${r?.line ?? ''}`}
        </span>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute left-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">{'\u{1F50A}'}</button>}

      {/* The album: every photo taken, with its word — a column on the right edge (wide screens), a row under the picture (upright phones). */}
      <div className="absolute right-2 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl bg-white/85 px-1.5 py-2 shadow-xl portrait:bottom-[3%] portrait:left-1/2 portrait:right-auto portrait:top-auto portrait:-translate-x-1/2 portrait:translate-y-0 portrait:flex-row portrait:px-3">
        {Array.from({ length: total }, (_, k) => {
          const i = photos[k];
          const a = i !== undefined ? scene.animals[i] : undefined;
          return (
            <motion.button key={k} disabled={!a} onClick={() => a && cueSpeak(a.say, scene.who)} aria-label={a ? a.label : 'empty photo'}
              className="flex w-[min(10.5vh,9vw)] flex-col items-center portrait:w-[min(13vh,15vw)] rounded-md border-2 border-slate-200 bg-white p-1 shadow"
              initial={false} animate={a ? { rotate: k % 2 ? 3 : -3, scale: 1 } : { rotate: 0, scale: 0.95 }}>
              <div className="flex aspect-square w-full items-center justify-center rounded-sm bg-sky-100">
                {a ? <img src={a.img} alt="" draggable={false} className="h-[88%] w-[88%] object-contain" /> : <span className="text-[min(4vh,3vw)] opacity-40">{'\u{1F4F7}'}</span>}
              </div>
              <span className="mt-0.5 h-[1.2em] text-[min(2.4vh,1.8vw)] font-black leading-none text-slate-700 portrait:text-[min(2.4vh,3vw)]">{a?.label ?? ''}</span>
            </motion.button>
          );
        })}
      </div>

      {done && (
        <motion.div className="absolute inset-x-0 bottom-[6%] z-50 flex justify-center portrait:bottom-[22%]" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-8 py-3 text-xl`}>Next {'⭐'}</button>
        </motion.div>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function photoSnapLines(scene: Snap) {
  return [
    [scene.who, SNAP_READY],
    ...scene.rounds.map((r) => [scene.who, r.line]),
    ...scene.animals.flatMap((a) => [[scene.who, a.say], [scene.who, snapOops(a.label)]]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
