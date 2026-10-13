import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { placeSentence, roomSentences, ROOM_AGAIN, ROOM_DESCRIBE, ROOM_FREE_START } from './roomRules';

/* ---------- ★ Design My Room (`design-room`, docs/a1-unit-9-lesson-4.md) ----------
 * An empty castle tower room and a shelf of stickers (bed, lamps, rug, plant…). Tap a thing, then tap a glowing spot.
 * LISTEN mode (controlled practice): Wim says where each thing goes ("Put the rug in front of the door."); only the right
 *   thing on the right spot sticks — the PLACE word decides, because there are always several spots.
 * FREE mode (production): the child places any `pick` things anywhere; every placement is said back as a sentence
 *   ("There is a plant between the windows."), then the child describes the whole room ("There are two lamps.").
 * Mechanics: Teach-This "Inside my bedroom" / "Is there a…?", BrainPOP "describe and draw", Altopedia floor plans,
 * Toca Boca Home Designer (free decorating). Better: the room is the child's own design, so the sentences are true about
 * something they made; things stay where they were put; tap-tap (no drag needed), no timer; the teacher can drive it. */

type Room = Extract<Scene, { kind: 'design-room' }>;

export function DesignRoomScene({ scene, onNext, onWin, onLose, sync }: { scene: Room; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const free = scene.mode === 'free';
  const rounds = scene.rounds ?? [];
  const pick = Math.min(scene.pick ?? 5, scene.things.length, scene.spots.length);
  const [state, setState] = useSyncedState(sync, { placed: [''], r: 0, sel: -1, wrong: -1, describe: false, done: false });
  // placed = "thing:spot" pairs, in the order they were placed
  const placed = useMemo(() => (Array.isArray(state.placed) ? state.placed.filter((x) => /^\d+:\d+$/.test(x)).map((x) => x.split(':').map(Number) as [number, number]) : []), [state.placed]);
  const usedThings = useMemo(() => new Set(placed.map(([t]) => t)), [placed]);
  const usedSpots = useMemo(() => new Set(placed.map(([, sp]) => sp)), [placed]);
  const r = Math.max(0, Math.min(rounds.length - 1, Number(state.r) || 0));
  const round = free ? undefined : rounds[r];
  const sel = Number(state.sel);
  const describe = !!state.describe;
  const done = !!state.done;
  const gemDone = useRef(false);

  useEffect(() => {
    if (done) return undefined;
    const line = free ? ROOM_FREE_START : round?.line;
    if (!line) return undefined;
    const t = window.setTimeout(() => cueSpeak(line, voiceOf(scene.who)), 800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, done]);
  useEffect(() => {
    if (describe && !done) cueSpeak(ROOM_DESCRIBE, voiceOf(scene.who));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [describe]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const choose = (t: number) => {
    if (done || describe || usedThings.has(t)) return;
    sfx.click();
    cueSpeak(scene.things[t].label, 'teacher');
    setState((s) => ({ ...s, sel: Number(s.sel) === t ? -1 : t }));
  };
  const drop = (sp: number) => {
    if (done || describe || usedSpots.has(sp)) return;
    if (sel < 0 || !scene.things[sel]) { sfx.click(); return; }
    if (round && (sel !== round.thing || sp !== round.spot)) {
      sfx.wrong(); onLose();
      cueSpeak(ROOM_AGAIN, voiceOf(scene.who));
      window.setTimeout(() => cueSpeak(round.line, voiceOf(scene.who)), 1200);
      setState((s) => ({ ...s, wrong: sp, sel: -1 }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 650);
      return;
    }
    sfx.pop(); window.setTimeout(() => sfx.match(), 180);
    cueSpeak(placeSentence(scene.things[sel].label, scene.spots[sp].where), 'teacher');
    const list = [...placed.map(([t, s2]) => `${t}:${s2}`), `${sel}:${sp}`];
    setState((s) => ({ ...s, placed: list, sel: -1 }));
    if (free) {
      if (list.length >= pick) window.setTimeout(() => setState((s) => ({ ...s, describe: true })), 2200);
    } else if (r + 1 >= rounds.length) {
      window.setTimeout(() => setState((s) => ({ ...s, done: true })), 2400);
    } else {
      window.setTimeout(() => setState((s) => ({ ...s, r: (Number(s.r) || 0) + 1 })), 2000);
    }
  };
  /** Free mode: tap a placed thing to put it back on the shelf. */
  const takeBack = (t: number) => {
    if (!free || describe || done) return;
    sfx.click();
    setState((s) => ({ ...s, placed: placed.filter(([x]) => x !== t).map(([x, y]) => `${x}:${y}`) }));
  };

  const summary = roomSentences(placed.map(([t]) => scene.things[t]?.label).filter(Boolean) as string[]);
  const spotLines = placed.map(([t, sp]) => placeSentence(scene.things[t]?.label ?? '', scene.spots[sp]?.where ?? ''));

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-indigo-950">
      <div className="absolute inset-0 scale-110 bg-cover bg-center opacity-60 blur-md" style={{ backgroundImage: `url(${scene.bg})` }} />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[4%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `\u{1F3F0} ${scene.title}`}
        </span>
      </div>
      {/* the instruction (listen) or the counter (free) */}
      {!done && !describe && (
        <div className="absolute inset-x-0 top-[13%] z-30 flex justify-center px-4">
          {round ? (
            <button type="button" onClick={() => { sfx.click(); cueSpeak(round.line, voiceOf(scene.who)); }}
              className="rounded-[2vh] bg-white/95 px-[1.4vw] py-[0.8vh] font-black text-indigo-900 shadow-xl" style={{ fontSize: 'min(3vh, 2vw)' }}>
              🔊 {round.line} <span className="ms-2 text-indigo-400">{r + 1}/{rounds.length}</span>
            </button>
          ) : (
            <span className="rounded-full bg-white/95 px-4 py-1 font-black text-indigo-900 shadow-lg" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>
              {placed.length}/{pick} · {sel >= 0 ? 'Now tap a place!' : 'Tap a thing on the shelf.'}
            </span>
          )}
        </div>
      )}
      {/* the room: a framed picture above the shelf, so no spot is ever under the shelf; spots and things are % of it */}
      <div className="absolute left-[12%] top-[2%] z-10 h-[76%] w-[76%] overflow-hidden rounded-[2vh] border-[0.6vh] border-amber-800 bg-cover bg-center shadow-2xl" style={{ backgroundImage: `url(${scene.bg})` }}>
      {/* the spots */}
      {!done && !describe && scene.spots.map((sp, i) => usedSpots.has(i) ? null : (
        // wrapper holds the centring translate; framer animates only the button (its x would override it)
        <div key={`spot-${i}`} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${sp.left}%`, top: `${sp.top}%` }}>
        <motion.button type="button" onClick={() => drop(i)} aria-label={sp.where}
          className={`relative block rounded-full border-[0.5vh] border-dashed ${sel >= 0 ? 'border-yellow-300 bg-yellow-200/35' : 'border-white/80 bg-white/20'}`}
          style={{ width: 'min(9vh, 6.5vw)', height: 'min(9vh, 6.5vw)' }}
          animate={state.wrong === i ? { x: [0, -8, 8, -5, 0] } : reduce || sel < 0 ? {} : { scale: [1, 1.12, 1] }}
          transition={state.wrong === i ? { duration: 0.4 } : { duration: 1.1, repeat: Infinity }}>
          {free && <span className="pointer-events-none absolute bottom-full left-1/2 mb-[0.3vh] -translate-x-1/2 whitespace-nowrap rounded-full bg-indigo-900/80 px-2 font-bold text-white" style={{ fontSize: 'min(1.7vh, 1.15vw)' }}>{sp.where}</span>}
        </motion.button>
        </div>
      ))}
      {/* the placed things (they stay) */}
      <AnimatePresence>
        {placed.map(([t, sp]) => {
          const th = scene.things[t]; const at = scene.spots[sp];
          if (!th || !at) return null;
          return (
            // wrapper holds the bottom-centre anchor; framer animates only the inner picture (its y would override it)
            <div key={`p-${t}`} className="absolute z-10 -translate-x-1/2 -translate-y-[85%]" style={{ left: `${at.left}%`, top: `${at.top}%`, width: `${th.w}%` }}>
              <motion.img src={th.img} alt={th.label} draggable={false} onClick={() => takeBack(t)}
                className={`w-full object-contain drop-shadow-xl ${free && !describe ? 'cursor-pointer' : ''}`}
                initial={reduce ? false : { y: -160, scale: 0.4, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ opacity: 0, scale: 0.4 }}
                transition={{ type: 'spring', stiffness: 230, damping: 15 }} />
            </div>
          );
        })}
      </AnimatePresence>
      </div>
      {/* the shelf */}
      {!done && !describe && (
        <div className="absolute inset-x-[2%] bottom-[1.5%] z-30 flex h-[19%] items-center justify-center gap-[0.8vw] rounded-[2vh] border-[0.5vh] border-amber-700 bg-amber-100/95 p-[0.6vh] shadow-2xl">
          {scene.things.map((th, i) => {
            const used = usedThings.has(i);
            return (
              <motion.button key={`${th.label}-${i}`} type="button" onClick={() => choose(i)} disabled={used} whileTap={{ scale: 0.9 }} aria-label={th.label}
                className={`flex flex-col items-center rounded-[1.6vh] border-[0.5vh] bg-white p-[0.5vh] shadow ${sel === i ? 'border-yellow-400 ring-4 ring-yellow-300' : 'border-white'} ${used ? 'opacity-30' : ''}`}
                style={{ width: `${Math.min(12, 94 / scene.things.length)}%` }}
                animate={sel === i && !reduce ? { y: [0, -8, 0] } : {}} transition={{ duration: 0.8, repeat: sel === i ? Infinity : 0 }}>
                <img src={th.img} alt="" draggable={false} className="h-[min(10vh,7vw)] w-full object-contain" />
                <span className="font-black text-amber-900" style={{ fontSize: 'min(2vh, 1.4vw)' }}>{th.label}</span>
              </motion.button>
            );
          })}
        </div>
      )}
      {/* free mode: describe the room */}
      {describe && !done && (
        <motion.div className="absolute right-[3%] top-[12%] z-40 w-[40%] rounded-[2.4vh] border-[0.6vh] border-indigo-700 bg-white/95 p-[1.6vh] shadow-2xl"
          initial={reduce ? false : { x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <p className="mb-[0.8vh] font-black text-indigo-800" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>🗣️ {ROOM_DESCRIBE}</p>
          <ul className="space-y-[0.6vh]">
            {[...summary, ...spotLines.filter((_, i) => i < 3)].map((line, i) => (
              <li key={i}>
                <button type="button" onClick={() => { sfx.click(); cueSpeak(line, 'teacher'); }} className="w-full rounded-[1.2vh] bg-indigo-50 px-[0.8vw] py-[0.5vh] text-start font-bold text-indigo-950" style={{ fontSize: 'min(2.4vh, 1.65vw)' }}>
                  🔊 {line}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => { sfx.whoop(); setState((s) => ({ ...s, done: true })); }} className={`${CLAY_BUTTON} mt-[1.2vh] w-full py-2`} style={{ fontSize: 'min(3vh, 2vw)' }}>🎤 I said it!</button>
        </motion.div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[6%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
