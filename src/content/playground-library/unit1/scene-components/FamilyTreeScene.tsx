import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CropPic, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- My Family Tree (Pre-A1 Unit 5 Lesson 4 signature game) ----------
 * A real tree with empty photo frames on three branches: grandparents at the
 * top, Mom and Dad in the middle, the children at the bottom. A family photo
 * pops out — "This is my grandma! Where does Grandma go?" — the child hangs it
 * on the right branch, then says the sentence themselves ("This is my
 * grandma!") and taps the microphone. Researched: Lingokids / Khan Academy Kids
 * family-tree sticker books, the classroom "my family tree" craft and
 * Cambridge Pre A1 "This is my…" introductions. Better: the tree is BUILT by
 * the child one generation at a time (who goes where is the lesson's idea of a
 * family tree), every photo is named twice — by Pip, then by the child — and
 * a wrong branch is named back ("Not there! Grandma goes at the top!"). No
 * clock; the right branch glows after two tries. */

type Tree = Extract<Scene, { kind: 'family-tree' }>;
const ROW_WORDS = ['at the top', 'in the middle', 'at the bottom'] as const;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const treeWrongLine = (name: string, row: number) => `Not there! ${cap(name)} goes ${ROW_WORDS[row] ?? 'there'}!`;

export function FamilyTreeScene({ scene, onWin, onNext, sync }: { scene: Tree; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  /** placed[k] = slot index used by round k; said = the child has said this round's sentence. */
  const [state, setState] = useSyncedState(sync, { round: 0, placed: [] as number[], hung: false, gemDone: false });
  const { round, placed, hung, gemDone } = state;
  const usedSlots = useMemo(() => new Set(placed), [placed]);
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const face = r ? scene.faces[r.face] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [wrongSlot, setWrongSlot] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r || hung) return;
    const t = window.setTimeout(async () => {
      if (round === 0) await sayWithin(scene.intro, scene.who, 6000);
      cueSpeak(r.line, scene.who);
    }, round === 0 ? 600 : 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const hang = async (slot: number) => {
    const s = scene.slots[slot];
    if (!r || !face || !s || hung || busy.current || usedSlots.has(slot)) return;
    busy.current = true;
    if (s.row !== r.row) {
      sfx.wrong(); shake(); setWrongSlot(slot);
      setMisses((m) => m + 1);
      await sayWithin(treeWrongLine(face.name, r.row), scene.who, 2800);
      setWrongSlot(-1);
      busy.current = false;
      return;
    }
    sfx.pop();
    window.setTimeout(() => { sfx.match(); fire(s.x, s.y, 'stars'); }, 350);
    setState((st) => ({ ...st, placed: [...st.placed, slot], hung: true }));
    await sayWithin(r.reply, scene.who, 3600);
    busy.current = false;
  };

  /** The child said "This is my grandma!" — next photo. */
  const said = () => {
    if (!r || !hung || busy.current) return;
    sfx.pop(); fire(50, 75, 'confetti');
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); onWin(true); }
    setState((st) => ({ ...st, round: next, hung: false, gemDone: st.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4500);
  };

  const glowRow = r && !hung && misses >= 2 ? r.row : -1;
  const sentence = r?.say ?? '';

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.05rem, min(calc(3.3*var(--svw,1vw)), 5.4vh), 2.8rem)' }}>
          {r ? (hung ? r.reply : r.line) : scene.doneLine}
        </span>
      </div>
      {r && <button onClick={() => cueSpeak(hung ? r.reply : r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The photo frames on the branches. */}
      {scene.slots.map((s, i) => {
        const k = placed.indexOf(i);
        const f = k >= 0 ? scene.faces[scene.rounds[k]?.face] : undefined;
        const glow = glowRow === s.row && k < 0;
        return (
          <motion.button key={i} onClick={() => { void hang(i); }} aria-label={f ? f.label : `frame ${i + 1}`}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            animate={wrongSlot === i ? { x: [0, -8, 8, -5, 5, 0] } : { rotate: [0, i % 2 ? 2 : -2, 0] }}
            transition={wrongSlot === i ? { duration: 0.4 } : { duration: 3 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            whileTap={{ scale: 0.92 }}>
            <span className="absolute left-1/2 -top-[1.6vh] h-[2.2vh] w-[3px] -translate-x-1/2 bg-amber-900/70" />
            <div className={`relative rounded-full p-[0.8vh] shadow-[0_8px_18px_rgba(0,0,0,0.35)] ${f ? 'bg-amber-700' : glow ? 'animate-pulse bg-yellow-300' : 'bg-amber-100/80'}`}>
              {f ? (
                <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 170, damping: 14 }}>
                  <CropPic img={f.img} at={f.at} w={f.w} aspect={f.aspect} alt={f.label} className="h-[min(15vh,10vw)] w-[min(15vh,10vw)] [@media(max-height:500px)]:h-[14vh] [@media(max-height:500px)]:w-[14vh]" />
                </motion.div>
              ) : (
                <span className="grid h-[min(15vh,10vw)] w-[min(15vh,10vw)] place-items-center rounded-full border-4 border-dashed border-amber-800/60 text-2xl font-black text-amber-800/60 [@media(max-height:500px)]:h-[14vh] [@media(max-height:500px)]:w-[14vh]">?</span>
              )}
            </div>
          </motion.button>
        );
      })}

      {/* The photo to hang, and then the child's turn to say it. */}
      {r && face && !hung && (
        <motion.div key={`photo-${round}`} className="pointer-events-none absolute bottom-[9%] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1 rounded-xl bg-white p-2 pb-1 shadow-[0_12px_26px_rgba(0,0,0,0.35)] [@media(max-height:500px)]:bottom-[11%]"
          initial={{ y: 160, rotate: -14, opacity: 0 }} animate={{ y: 0, rotate: -5, opacity: 1 }} transition={{ type: 'spring', stiffness: 150, damping: 14 }}>
          <CropPic img={face.img} at={face.at} w={face.w} aspect={face.aspect} alt={face.label} className="!rounded-md h-[min(22vh,16vw)] w-[min(22vh,16vw)] [@media(max-height:500px)]:h-[20vh] [@media(max-height:500px)]:w-[20vh]" />
          <span className="text-sm font-black text-slate-600">📸</span>
        </motion.div>
      )}
      {r && hung && (
        <motion.div className="absolute inset-x-0 bottom-[9%] z-40 flex flex-col items-center gap-2" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }}>
          <span className="rounded-full bg-white/90 px-4 py-1 text-base font-black text-sky-700 shadow">🙋 Your turn! Say it:</span>
          <button onClick={said} className={`${CLAY_BUTTON} px-8 py-3 text-2xl`}>🎤 {sentence}</button>
        </motion.div>
      )}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function familyTreeLines(scene: Tree) {
  return [
    [scene.who, scene.intro],
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply], [scene.who, treeWrongLine(scene.faces[r.face]?.name ?? '', r.row)]]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
