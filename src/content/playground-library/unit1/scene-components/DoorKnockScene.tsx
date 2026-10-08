import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CharKey, Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin, useArtBox } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Is This My House? (Pre-A1 Unit 6 Lesson 5 signature game) ----------
 * The story's own question becomes the game. A friend says what their house
 * looks like — "My house has a red door!" — and a big arrow hops from door to
 * door on the street: "Is this my house?" The child answers on the buttons —
 * "No, it isn't!" or "Yes, it is!" — by looking at the door colour. A right
 * "No" sends the arrow to the next door; a right "Yes" knocks, the door opens
 * and the friend waves from inside, then the child says it back. Researched:
 * the "Is this my house?" lost-and-found picture-book pattern, Cambridge Pre A1
 * Starters Reading & Writing Part 1 / Listening (look and say yes or no),
 * Lingokids / Khan Academy Kids yes-no listening checks.
 * Better: the child PRODUCES the story's two answers (Yes, it is! / No, it
 * isn't!) instead of only tapping a picture, the answer depends on the clue
 * sentence (the same door is right for one friend and wrong for another), a
 * wrong answer is explained with the colour ("Look! The door is blue. No, it
 * isn't!"), there is no clock, and every friend found stays at their door. */

type Knock = Extract<Scene, { kind: 'door-knock' }>;
export const KNOCK_ASK = 'Is this my house?';
export const KNOCK_YES = 'Yes, it is!';
export const KNOCK_NO = "No, it isn't!";
export const knockHintLine = (color: string, yes: boolean) => `Look! The door is ${color}. ${yes ? KNOCK_YES : KNOCK_NO}`;
export const KNOCK_KNOCK = 'Knock, knock!';

export function DoorKnockScene({ scene, onWin, onNext, sync }: { scene: Knock; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, step: 0, open: false, gemDone: false });
  const { round, step, open, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const at = r ? r.tries[Math.min(step, r.tries.length - 1)] : -1;
  const house = at >= 0 ? scene.houses[at] : undefined;
  const isRight = !!r && at === r.house;
  const speaker: CharKey = r?.owner ?? scene.who;
  const busy = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useArtBox(rootRef, scene.aspect ?? 1376 / 768);
  const [wrong, setWrong] = useState<'yes' | 'no' | null>(null);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  // A new round: the friend gives the clue, then asks at the first door.
  useEffect(() => {
    busy.current = false;
    if (!r || open) return;
    let alive = true;
    const t = window.setTimeout(async () => {
      if (step === 0) await sayWithin(r.line, speaker, 4200);
      if (alive) cueSpeak(KNOCK_ASK, speaker);
    }, step === 0 ? 600 : 350);
    return () => { alive = false; window.clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, step, scene.id]);

  const answer = async (yes: boolean) => {
    if (!r || !house || open || busy.current) return;
    busy.current = true;
    if (yes !== isRight) {
      sfx.wrong(); shake(); setWrong(yes ? 'yes' : 'no');
      await sayWithin(knockHintLine(house.color, isRight), speaker, 3600);
      setWrong(null);
      busy.current = false;
      return;
    }
    sfx.pop();
    if (!yes) {
      await sayWithin(KNOCK_NO, speaker, 1600);
      setState((s) => ({ ...s, step: s.step + 1 }));
      busy.current = false;
      return;
    }
    sfx.match();
    await sayWithin(KNOCK_KNOCK, speaker, 1500);
    setState((s) => ({ ...s, open: true }));
    fire(house.x + house.w / 2, house.y + house.h / 2, 'stars');
    await sayWithin(r.reply, speaker, 3200);
    busy.current = false;
  };

  /** The child said it back — next friend. */
  const said = () => {
    if (!r || !open || busy.current) return;
    sfx.pop();
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 45, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, step: 0, open: false, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4500);
  };

  // Friends already found stay at their doors.
  const found = scene.rounds.slice(0, round).map((q) => ({ owner: q.owner, house: q.house }));
  if (r && open) found.push({ owner: r.owner, house: r.house });

  return (
    <motion.div ref={rootRef} className="absolute inset-0 select-none overflow-hidden bg-gradient-to-b from-orange-300 via-amber-200 to-orange-100" animate={shakeCtl}>
      {done && <Confetti count={70} />}
      <div className="absolute" style={box}>
        <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
        {/* Open doors with the friend inside. */}
        {found.map((f) => {
          const h = scene.houses[f.house];
          if (!h) return null;
          return (
            <div key={`${f.owner}-${f.house}`} className="pointer-events-none absolute" style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}>
              <motion.div className="absolute inset-0 rounded-t-[45%] bg-amber-200 shadow-[inset_0_0_14px_rgba(160,90,0,0.5)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
              <motion.img src={CAST[f.owner].img} alt={CAST[f.owner].name} draggable={false}
                className="absolute bottom-0 left-1/2 w-[150%] max-w-none -translate-x-1/2" style={{ filter: STICKER_FILTER }}
                initial={{ y: '30%', scale: 0.4, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 13 }} />
            </div>
          );
        })}
        {/* The arrow over the door being asked about. */}
        <AnimatePresence>
          {r && house && !open && (
            <motion.div key={`arrow-${round}-${step}`} className="pointer-events-none absolute z-20 -translate-x-1/2"
              style={{ left: `${house.x + house.w / 2}%`, top: `${house.y - 16}%` }}
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: [0, 10, 0] }} exit={{ opacity: 0 }}
              transition={{ y: { duration: 1, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.3 } }}>
              <span className="block text-[min(9vh,6vw)] drop-shadow-[0_4px_4px_rgba(0,0,0,0.35)]">{'\u{2B07}\u{FE0F}'}</span>
            </motion.div>
          )}
        </AnimatePresence>
        {r && house && !open && (
          <div className="pointer-events-none absolute z-10 animate-pulse rounded-t-[45%] ring-[5px] ring-white/90" style={{ left: `${house.x}%`, top: `${house.y}%`, width: `${house.w}%`, height: `${house.h}%` }} />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        {r && (
          <span className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-sm font-black text-orange-700 shadow">
            <img src={CAST[r.owner].img} alt="" className="h-7 w-7 object-contain" />{CAST[r.owner].name}
          </span>
        )}
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.05rem, min(calc(3.2*var(--svw,1vw)), 5vh), 2.6rem)' }}>
          {r ? (open ? r.reply : `${r.line} ${KNOCK_ASK}`) : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>{'\u{1F3E0}'}</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(open ? r.reply : `${r.line} ${KNOCK_ASK}`, speaker)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">{'\u{1F50A}'}</button>}

      {/* The two answers. */}
      {r && !open && (
        <div className="absolute inset-x-0 bottom-[5%] z-40 flex justify-center gap-3 px-3">
          <motion.button onClick={() => { void answer(false); }} aria-label={KNOCK_NO}
            className={`rounded-full border-b-[6px] border-rose-800 bg-gradient-to-b from-rose-400 to-rose-600 px-5 py-3 text-lg font-black text-white shadow-xl sm:text-2xl ${wrong === 'no' ? 'ring-4 ring-red-300' : ''}`}
            animate={wrong === 'no' ? { x: [0, -10, 10, -6, 6, 0] } : {}} whileTap={{ scale: 0.92 }}>
            {'\u{274C}'} {KNOCK_NO}
          </motion.button>
          <motion.button onClick={() => { void answer(true); }} aria-label={KNOCK_YES}
            className={`rounded-full border-b-[6px] border-emerald-800 bg-gradient-to-b from-emerald-400 to-emerald-600 px-5 py-3 text-lg font-black text-white shadow-xl sm:text-2xl ${wrong === 'yes' ? 'ring-4 ring-red-300' : ''}`}
            animate={wrong === 'yes' ? { x: [0, -10, 10, -6, 6, 0] } : {}} whileTap={{ scale: 0.92 }}>
            {'\u{2705}'} {KNOCK_YES}
          </motion.button>
        </div>
      )}

      {r && open && (
        <motion.div className="absolute inset-x-0 bottom-[5%] z-40 flex flex-col items-center gap-2" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: 'spring' }}>
          <span className="rounded-full bg-white/90 px-4 py-1 text-base font-black text-sky-700 shadow">{'\u{1F64B}'} Your turn! Say it:</span>
          <button onClick={said} className={`${CLAY_BUTTON} px-6 py-3 text-xl sm:text-2xl`}>{'\u{1F3A4}'} {r.say}</button>
        </motion.div>
      )}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next {'⭐'}</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function doorKnockLines(scene: Knock) {
  const lines: [string, string][] = [];
  for (const r of scene.rounds) {
    lines.push([r.owner, r.line], [r.owner, KNOCK_ASK], [r.owner, KNOCK_NO], [r.owner, KNOCK_KNOCK], [r.owner, r.reply]);
    for (const i of r.tries) {
      const h = scene.houses[i];
      if (h) lines.push([r.owner, knockHintLine(h.color, i === r.house)]);
    }
  }
  lines.push([scene.who, scene.doneLine]);
  return lines;
}
