import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CropPic, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Family Photo (Pre-A1 Unit 5 Lesson 2 signature game) ----------
 * Pip hands the child his camera: "Take a photo of my sister!" The child taps
 * that family member in the big family picture — flash! click! — and a
 * polaroid of them slides out with the sentence "This is my sister!", then
 * pins itself to the photo string. Researched: Khan Academy Kids / Lingokids
 * camera and sticker-album rewards, Cambridge Pre A1 "listen and point", and
 * the "This is my…" family-photo routine of classroom show-and-tell. Better:
 * the child must understand the family word to find the person (no word on
 * screen), every photo is a keepsake that stays on the string, and a wrong
 * tap names who was photographed instead ("That's my brother!"). No clock. */

type Photo = Extract<Scene, { kind: 'family-photo' }>;
export const photoWrongLine = (label: string) => `That's my ${label}! Try again!`;

export function FamilyPhotoScene({ scene, onWin, onNext, sync }: { scene: Photo; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, taken: [] as number[], gemDone: false });
  const { round, taken, gemDone } = state;
  const takenSet = useMemo(() => new Set(taken), [taken]);
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [flash, setFlash] = useState(0);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const snap = async (i: number) => {
    const m = scene.members[i];
    if (!r || !m || busy.current) return;
    busy.current = true;
    if (i !== r.member) {
      sfx.wrong(); shake();
      setMisses((x) => x + 1);
      await sayWithin(photoWrongLine(m.label), scene.who, 2600);
      busy.current = false;
      return;
    }
    setFlash((f) => f + 1);
    sfx.pop();
    window.setTimeout(() => { sfx.match(); fire(50, 30, 'stars'); }, 350);
    setState((s) => ({ ...s, taken: [...s.taken, round] }));
    await sayWithin(r.reply, scene.who, 3800);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  const hint = r && misses >= 2 ? scene.members[r.member] : undefined;
  const last = taken.length ? scene.rounds[taken[taken.length - 1]] : undefined;

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}

      {/* Camera viewfinder corners. */}
      {!done && (
        <div className="pointer-events-none absolute inset-[6%] z-10">
          {['left-0 top-0 border-l-[6px] border-t-[6px]', 'right-0 top-0 border-r-[6px] border-t-[6px]', 'bottom-0 left-0 border-b-[6px] border-l-[6px]', 'bottom-0 right-0 border-b-[6px] border-r-[6px]'].map((c) => (
            <span key={c} className={`absolute h-[9vh] w-[9vh] rounded-sm border-white/90 ${c}`} />
          ))}
          <span className="absolute right-3 top-3 h-4 w-4 animate-pulse rounded-full bg-red-500" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.4rem, calc(3.6*var(--svw,1vw)), 3rem)' }}>
          {r ? `📷 ${r.line}` : scene.doneLine}
        </span>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The family members are tappable spots on the picture. */}
      {!done && scene.members.map((m, i) => (
        <button
          key={m.label}
          aria-label={m.label}
          onClick={() => { void snap(i); }}
          className="absolute z-20 rounded-[40%]"
          style={{ left: `${m.x}%`, top: `${m.y}%`, width: `${m.w}%`, height: `${m.h}%` }}
        >
          {hint === m && <span className="absolute inset-0 animate-pulse rounded-[40%] ring-8 ring-yellow-300/90" />}
        </button>
      ))}

      {/* Flash. */}
      <AnimatePresence>
        {flash > 0 && (
          <motion.div key={flash} className="pointer-events-none absolute inset-0 z-40 bg-white" initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }} />
        )}
      </AnimatePresence>

      {/* The newest polaroid, big, with its sentence. */}
      <AnimatePresence>
        {last && taken.length > 0 && !done && (
          <motion.div key={taken.length} className="pointer-events-none absolute left-1/2 top-[30%] z-40 -translate-x-1/2"
            initial={{ y: 80, scale: 0.4, rotate: -12, opacity: 0 }} animate={{ y: 0, scale: 1, rotate: -4, opacity: 1 }} exit={{ y: -200, scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 170, damping: 15 }}>
            <Polaroid img={scene.bg} m={scene.members[last.member]} big />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The photo string with every photo taken so far. */}
      <div className="absolute inset-x-0 bottom-[11%] z-30 flex items-end justify-center gap-3 px-4">
        {taken.map((ri, k) => {
          const m = scene.members[scene.rounds[ri].member];
          return (
            <motion.div key={ri} initial={{ y: -120, opacity: 0 }} animate={{ y: 0, opacity: 1, rotate: k % 2 ? 4 : -4 }} transition={{ delay: 2.6, type: 'spring' }}>
              <Polaroid img={scene.bg} m={m} />
            </motion.div>
          );
        })}
      </div>

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[2%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

function Polaroid({ img, m, big }: { img: string; m: Photo['members'][number]; big?: boolean }) {
  return (
    <div className={`flex flex-col items-center rounded-md bg-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] ${big ? 'gap-2 p-3 pb-4' : 'gap-1 p-1.5 pb-2'}`}>
      <CropPic img={img} at={m.face} w={m.faceW} alt={m.label} className={`!rounded-sm ${big ? 'h-[30vh] w-[30vh]' : 'h-[10vh] w-[10vh]'}`} />
      <span className={`font-black text-slate-700 ${big ? 'text-2xl' : 'text-sm'}`}>{m.label}</span>
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function familyPhotoLines(scene: Photo) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.members.map((m) => [scene.who, photoWrongLine(m.label)]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
