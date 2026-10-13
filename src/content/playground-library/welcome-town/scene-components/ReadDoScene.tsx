import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Read & Do (A1 U1L6, plan docs/a1-unit-1-welcome-town.md §5.6) ----------
 * An instruction card the child must READ ("Give Leo the red cap.", "Wave goodbye to Mia.") — it is not spoken; 🔊 is
 * help only. The child taps the thing on the tray, then the friend; the thing flies over and STAYS with that friend
 * (permanence), and the friend answers. A wrong thing or friend wobbles: "Read it again!" — no hearts, no timer.
 * Mechanics: Cambridge Pre A1/A1 "read and do" instructions (Starters R&W, Movers colour-and-draw), Khan Academy Kids
 * drag-the-object tasks, the TPR "read and act" classroom game. Better: only reading tells you WHICH thing and WHO
 * (two friends and several things on screen), and the result stays in the picture. */

type ReadDo = Extract<Scene, { kind: 'read-do' }>;
const SPR = (who: string) => `/welcome-town/sprites/${who}-wave.png`;

export function ReadDoScene({ scene, onNext, onWin, onLose, sync }: { scene: ReadDo; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, held: -1, given: [-1] as number[], waved: -1, wrong: '', done: false });
  const roundIdx = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[roundIdx];
  const done = !!state.done;
  const held = Number.isInteger(state.held) ? state.held : -1;
  // given[thing] = friend index holding it (-1 = still on the tray)
  const given = scene.things.map((_, i) => (Array.isArray(state.given) && Number.isInteger(state.given[i]) ? state.given[i] : -1));
  const gemDone = useRef(false);

  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, 'pip'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const oops = (key: string) => {
    sfx.wrong(); onLose();
    setState((s) => ({ ...s, wrong: key }));
    window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 650);
  };
  const advance = () => window.setTimeout(() => setState((s) => {
    const next = (Number(s.round) || 0) + 1;
    return next >= total ? { ...s, done: true, held: -1, waved: -1 } : { ...s, round: next, held: -1, waved: -1 };
  }), 1700);

  const tapThing = (i: number) => {
    if (done || !r || given[i] >= 0) return;
    if (r.thing === undefined || r.thing !== i) { oops(`t${i}`); return; }
    sfx.pop(); setState((s) => ({ ...s, held: i }));
  };
  const tapFriend = (f: number) => {
    if (done || !r) return;
    if (f !== r.to || (r.thing !== undefined && held !== r.thing)) { oops(`f${f}`); return; }
    sfx.match();
    const who = scene.cast[f];
    cueSpeak(r.reply, voiceOf(who));
    if (r.thing !== undefined) {
      const thing = r.thing;
      setState((s) => {
        const g = scene.things.map((_, i) => (Array.isArray(s.given) && Number.isInteger(s.given[i]) ? s.given[i] : -1));
        g[thing] = f;
        return { ...s, given: g, held: -1, waved: f };
      });
    } else setState((s) => ({ ...s, waved: f }));
    advance();
  };

  const n = scene.cast.length;
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-white/25" />
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-[8%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `📖 ${scene.title}`}
        </span>
      </div>

      {/* the card to read */}
      {!done && r && (
        <AnimatePresence mode="wait">
          <motion.div key={roundIdx} className="absolute left-1/2 top-[17%] z-30 flex -translate-x-1/2 items-center gap-3 rounded-[2.5vh] border-[0.5vh] border-amber-300 bg-amber-50 px-6 py-3 shadow-2xl"
            initial={reduce ? false : { y: -30, opacity: 0, rotate: -3 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ opacity: 0 }}>
            <span className="font-black text-[#3b2410]" style={{ fontSize: 'min(5.4vh, 3.4vw)' }}>{r.text}</span>
            <button type="button" onClick={() => cueSpeak(r.text, 'teacher')} aria-label="Help: hear it" className="grid h-[6vh] w-[6vh] place-items-center rounded-full bg-white text-[2.8vh] shadow ring-2 ring-amber-200 active:scale-95">🔊</button>
            <span className="text-neutral-400" style={{ fontSize: 'min(2.2vh, 1.4vw)' }}>{roundIdx + 1}/{total}</span>
          </motion.div>
        </AnimatePresence>
      )}

      {/* the friends */}
      <div className="absolute inset-x-[4%] top-[33%] z-20 flex h-[44%] items-end justify-around">
        {scene.cast.map((who, f) => {
          const holding = scene.things.map((t, i) => ({ t, i })).filter(({ i }) => given[i] === f);
          return (
            <motion.button key={who} type="button" onClick={() => tapFriend(f)} aria-label={CAST[who].name}
              className="relative flex h-full flex-col items-center justify-end" style={{ width: `${Math.min(24, 88 / n)}%` }}
              animate={state.wrong === `f${f}` ? { x: [0, -10, 10, -6, 0] } : state.waved === f && !reduce ? { rotate: [0, -6, 6, -4, 0], y: [0, -14, 0] } : {}}
              transition={{ duration: 0.6 }} whileTap={{ scale: 0.95 }}>
              <img src={SPR(who)} alt="" draggable={false} className="max-h-[85%] w-auto object-contain drop-shadow-[0_1vh_0.8vh_rgba(0,0,0,0.3)]" />
              {holding.map(({ t, i }, k) => (
                <motion.img key={i} src={t.img} alt={t.label} draggable={false} className="absolute object-contain"
                  style={{ width: '42%', bottom: `${18 + k * 18}%`, right: '-6%' }}
                  initial={reduce ? false : { y: 200, scale: 0.4, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }} />
              ))}
              <span className="mt-1 rounded-full bg-white/90 px-3 py-0.5 font-black shadow" style={{ color: CAST[who].color, fontSize: 'min(2.6vh, 1.6vw)' }}>{CAST[who].name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* the tray */}
      <div className="absolute inset-x-0 bottom-[3%] z-30 flex justify-center">
        <div className="flex items-end gap-[2vw] rounded-[3vh] border-[0.5vh] border-white bg-white/80 px-5 py-2 shadow-xl">
          {scene.things.map((t, i) => {
            const away = given[i] >= 0;
            return (
              <motion.button key={t.label} type="button" onClick={() => tapThing(i)} disabled={away} aria-label={t.label}
                className={`relative grid place-items-center rounded-[2vh] p-1 ${held === i ? 'bg-yellow-200 ring-4 ring-yellow-400' : ''} ${away ? 'opacity-25' : ''}`}
                style={{ width: 'min(13vh, 9vw)', height: 'min(13vh, 9vw)' }}
                animate={state.wrong === `t${i}` ? { x: [0, -8, 8, -5, 0] } : held === i && !reduce ? { y: [0, -10, 0] } : {}}
                transition={held === i ? { duration: 0.8, repeat: Infinity } : { duration: 0.5 }} whileTap={{ scale: 0.92 }}>
                <img src={t.img} alt="" draggable={false} className="h-full w-full object-contain" />
              </motion.button>
            );
          })}
        </div>
      </div>
      {state.wrong && <div className="pointer-events-none absolute inset-x-0 top-[27%] z-40 text-center font-black text-rose-600" style={{ fontSize: 'min(3.4vh, 2.2vw)' }}>Read it again! 📖</div>}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[22%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
