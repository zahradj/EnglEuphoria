import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin, useArtBox } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- My Farm Song (Pre-A1 Unit 7 Lesson 5 signature game) ----------
 * The child is the farmer. They choose an animal for the farm; it hops
 * onto the grass in front of the barn and Pip sings its verse — "And on his
 * farm he had a pig, E-I-E-I-O! With an oink, oink here and an oink, oink
 * there!" — then the child sings it too and taps "I sang it!". Every animal
 * they choose stays, so the farm (and the song) grows; the last tap sings the
 * whole chorus. Researched: the traditional cumulative song "Old MacDonald Had
 * a Farm" (one animal + sound per verse), Super Simple / Lingokids song-choice
 * play (the child picks the next verse), Sesame "model → copy" singing.
 * Better: the child CHOOSES (agency) and then produces the verse — the animal
 * word and its sound — instead of only watching a song video; the farm they
 * built is on screen at the end, and every animal can be tapped to sing its
 * verse again; no clock, no wrong answers. */

type Verse = Extract<Scene, { kind: 'farm-verse' }>;
export const VERSE_INTRO = 'You are the farmer! Choose an animal for your farm!';
const art = (w: string) => (/^[aeiou]/i.test(w) ? 'an' : 'a');
export const verseHad = (label: string) => `And on his farm he had ${art(label)} ${label}, E-I-E-I-O!`;
export const verseSound = (sound: string) => `With ${art(sound)} ${sound}, ${sound} here, and ${art(sound)} ${sound}, ${sound} there!`;

export function FarmVerseScene({ scene, onWin, onNext, sync }: { scene: Verse; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { picked: [-1], singing: -1, gemDone: false });
  const { singing, gemDone } = state;
  const picked = useMemo(() => state.picked.filter((p) => p >= 0), [state.picked]);
  const total = scene.animals.length;
  const done = picked.length >= total && singing < 0;
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useArtBox(rootRef, scene.aspect ?? 16 / 9);
  const busy = useRef(false);
  const [bursts, fire] = useBursts();

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(VERSE_INTRO, scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const sing = async (i: number) => {
    const a = scene.animals[i];
    if (!a) return;
    await sayWithin(verseHad(a.label), scene.who, 4500);
    await sayWithin(verseSound(a.sound), scene.who, 5000);
  };

  const choose = async (i: number) => {
    if (busy.current || singing >= 0 || picked.includes(i)) return;
    const a = scene.animals[i];
    if (!a) return;
    busy.current = true;
    sfx.pop();
    fire(a.x, a.y - a.size * 0.6, 'sparkle');
    setState((s) => ({ ...s, singing: i, picked: [...s.picked.filter((p) => p >= 0), i] }));
    await sing(i);
    busy.current = false;
  };

  const sang = async () => {
    if (busy.current || singing < 0) return;
    busy.current = true;
    sfx.match();
    const a = scene.animals[singing];
    if (a) fire(a.x, a.y - a.size * 0.6, 'stars');
    const last = picked.length >= total;
    setState((s) => ({ ...s, singing: -1, gemDone: s.gemDone || last }));
    if (last && !gemDone) { sfx.gem(); onWin(true); await sayWithin(scene.doneLine, scene.who, 5000); }
    busy.current = false;
  };

  return (
    <div ref={rootRef} className="absolute inset-0 select-none overflow-hidden bg-gradient-to-b from-amber-200 to-lime-200">
      <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute" style={box} />
      {done && <Confetti count={80} />}

      {/* The animals on the farm. */}
      <div className="absolute z-20" style={box}>
        <AnimatePresence>
          {picked.map((i) => {
            const a = scene.animals[i];
            if (!a) return null;
            return (
              <button key={a.label} aria-label={a.label} onClick={() => { if (!busy.current && singing < 0) void sing(i); }}
                className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${a.x}%`, top: `${a.y}%`, width: `${a.size}%` }}>
                <motion.img src={a.img} alt={a.label} draggable={false} className="w-full" style={{ filter: STICKER_FILTER }}
                  initial={{ y: -80, scale: 0.4, opacity: 0 }}
                  animate={singing === i || done ? { y: [0, -12, 0], scale: 1, opacity: 1 } : { y: 0, scale: 1, opacity: 1 }}
                  transition={{ ...(singing === i || done ? { duration: 0.5, repeat: Infinity } : { type: 'spring' as const, stiffness: 220, damping: 14 }), scale: { type: 'spring', stiffness: 220, damping: 14 }, opacity: { duration: 0.3 } }} />
              </button>
            );
          })}
        </AnimatePresence>
        <Bursts items={bursts} />
      </div>

      {/* The song line, then the controls under it — the grass stays free for the animals. */}
      <div className="absolute inset-x-0 top-16 z-40 flex flex-col items-center gap-2 px-14 [@media(max-height:500px)]:top-14 [@media(max-height:500px)]:gap-1">
        <span className="pointer-events-none text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1rem, min(calc(3vw), 4.6vh), 2.4rem)' }}>
          {done ? `\u{1F3B6} ${scene.doneLine}` : singing >= 0 && scene.animals[singing]
            ? `\u{1F3B5} ${verseHad(scene.animals[singing].label)}`
            : `\u{1F468}\u{200D}\u{1F33E} ${VERSE_INTRO}`}
        </span>
        {done ? (
          <motion.button initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}
            onClick={onNext} className={`${CLAY_BUTTON} px-8 py-3 text-xl`}>Next {'⭐'}</motion.button>
        ) : singing >= 0 ? (
          <motion.button key={`sang-${singing}`} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={() => { void sang(); }} className={`${CLAY_BUTTON} px-6 py-3 text-lg sm:text-xl`}>
            {'\u{1F3A4}'} I sang it!
          </motion.button>
        ) : (
          <div className="flex items-end gap-2 rounded-3xl border-4 border-amber-700/70 bg-amber-100/90 px-3 py-2 shadow-xl">
            {scene.animals.map((a, i) => {
              const used = picked.includes(i);
              return (
                <motion.button key={a.label} aria-label={`choose ${a.label}`} onClick={() => { void choose(i); }} disabled={used}
                  className={`flex w-[min(12vh,12vw)] flex-col items-center rounded-2xl bg-white/80 p-1 shadow ${used ? 'opacity-30' : ''}`} whileTap={{ scale: 0.92 }}>
                  <img src={a.img} alt="" draggable={false} className="aspect-square w-full object-contain" />
                  <span className="text-[min(2.4vh,2.6vw)] font-black text-amber-800">{a.label}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function farmVerseLines(scene: Verse) {
  return [
    [scene.who, VERSE_INTRO],
    ...scene.animals.flatMap((a) => [[scene.who, verseHad(a.label)], [scene.who, verseSound(a.sound)]]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
