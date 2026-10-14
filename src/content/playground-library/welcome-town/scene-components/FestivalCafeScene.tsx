import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { CAFE_WRONG, CAFE_YES, trayMatches } from './foodRules';

/* ---------- Festival Café ★ (docs/a1-unit-4-food.md §5.6; the A1 upgrade of Pre-A1 `cafe-order`) ----------
 * The child is the waiter at the festival café counter. A customer walks up and orders — often with a twist ("Some soup
 * and some bread, please — but no salad!"). The child taps the menu to load the tray (tap again to take a thing off) and
 * taps "Serve!". A right tray: the customer is happy. Then, on rounds with an `offer`, the child is prompted to SAY the
 * offer ("Would you like some juice?") and taps "I said it" — the customer answers "Yes, please!". Mechanics: classroom
 * restaurant role plays (eslactive, games4esl, Boggle's World, Twinkl "What would you like?"). Better: the orders are
 * heard in our characters' voices, the twist makes the child listen to the WHOLE order, and the child speaks the polite
 * offer themselves; no timer, no lost customers. */

type Cafe = Extract<Scene, { kind: 'festival-cafe' }>;

export function FestivalCafeScene({ scene, onNext, onWin, onLose, sync }: { scene: Cafe; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { r: 0, tray: [-1], served: false, offered: false, wrong: false, done: false });
  const r = Math.max(0, Math.min(scene.rounds.length - 1, Number(state.r) || 0));
  const round = scene.rounds[r];
  const tray = useMemo(() => (Array.isArray(state.tray) ? state.tray.filter((n) => n >= 0) : []), [state.tray]);
  const served = !!state.served;
  const offered = !!state.offered;
  const done = !!state.done;
  const gemDone = useRef(false);

  useEffect(() => {
    if (done || !round) return undefined;
    const t = window.setTimeout(() => cueSpeak(round.line, voiceOf(round.customer)), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const next = () => setState((s) => {
    const n = (Number(s.r) || 0) + 1;
    return n >= scene.rounds.length ? { ...s, done: true } : { ...s, r: n, tray: [-1], served: false, offered: false };
  });
  const toggle = (i: number) => {
    if (served || done) return;
    sfx.click();
    cueSpeak(scene.menu[i].label, 'teacher');
    setState((s) => {
      const t = Array.isArray(s.tray) ? s.tray.filter((n) => n >= 0) : [];
      return { ...s, tray: t.includes(i) ? t.filter((n) => n !== i) : [...t, i] };
    });
  };
  const serve = () => {
    if (!round || served || done || tray.length === 0) return;
    if (!trayMatches(tray, round.order)) {
      sfx.wrong(); onLose();
      cueSpeak(CAFE_WRONG, voiceOf(round.customer));
      setState((s) => ({ ...s, wrong: true }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: false })), 700);
      return;
    }
    sfx.whoop(); window.setTimeout(() => sfx.gem(), 300);
    cueSpeak(round.reply, voiceOf(round.customer));
    setState((s) => ({ ...s, served: true }));
    if (!round.offer) window.setTimeout(next, 2400);
  };
  const saidOffer = () => {
    if (!round?.offer || offered) return;
    sfx.pop();
    cueSpeak(CAFE_YES, voiceOf(round.customer));
    setState((s) => ({ ...s, offered: true, tray: [...(Array.isArray(s.tray) ? s.tray.filter((n) => n >= 0) : []), round.offer!.item] }));
    window.setTimeout(next, 2200);
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[4%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `☕ ${scene.title}`}
        </span>
      </div>
      {!done && <span className="absolute right-3 top-[12%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-rose-600 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>🧾 {r + 1}/{scene.rounds.length}</span>}
      {/* the customer at the counter */}
      <AnimatePresence mode="wait">
        {!done && round && (
          <motion.div key={r} className="absolute left-[6%] top-[14%] z-20 flex w-[34%] flex-col items-center"
            initial={reduce ? false : { x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1, y: served ? [0, -14, 0] : 0 }} exit={{ x: 300, opacity: 0 }} transition={{ duration: 0.6 }}>
            <button type="button" onClick={() => { sfx.click(); cueSpeak(round.line, voiceOf(round.customer)); }}
              className="relative mb-[1vh] rounded-[2vh] bg-white/95 px-[1.2vw] py-[1vh] text-center font-black text-amber-900 shadow-xl" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>
              🔊 {round.line}
              <span className="absolute -bottom-[1.2vh] left-1/2 h-[2.4vh] w-[2.4vh] -translate-x-1/2 rotate-45 bg-white/95" />
            </button>
            <img src={round.customerImg} alt="" draggable={false} className="h-[min(30vh,20vw)] w-auto object-contain drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
      {/* the tray on the counter */}
      {!done && (
        <motion.div className="absolute bottom-[30%] left-[44%] z-20 flex h-[16vh] w-[26%] items-center justify-center gap-[0.6vw] rounded-[50%] border-[0.6vh] border-amber-700 bg-gradient-to-b from-amber-200 to-amber-400 shadow-2xl"
          animate={state.wrong ? { x: [0, -10, 10, -6, 0] } : {}} transition={{ duration: 0.5 }}>
          <AnimatePresence>
            {tray.map((i) => (
              <motion.img key={i} src={scene.menu[i]?.img} alt={scene.menu[i]?.label} draggable={false} className="h-[11vh] w-auto object-contain drop-shadow"
                initial={reduce ? false : { y: -120, scale: 0.4, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: -60, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} />
            ))}
          </AnimatePresence>
          {tray.length === 0 && <span className="font-black text-amber-800/70" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>the tray</span>}
        </motion.div>
      )}
      {/* serve / offer */}
      {!done && round && (
        <div className="absolute bottom-[31%] right-[3%] z-30 flex w-[24%] flex-col items-center gap-[1vh]">
          {!served && <button type="button" onClick={serve} disabled={tray.length === 0} className={`${CLAY_BUTTON} px-8 py-3 disabled:opacity-50`} style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>🛎️ Serve!</button>}
          {served && round.offer && !offered && (
            <>
              <span className="rounded-[2vh] bg-white/95 px-[1vw] py-[1vh] text-center font-black text-emerald-700 shadow-xl" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>🗣️ Say it: {round.offer.line}</span>
              <button type="button" onClick={() => { sfx.click(); cueSpeak(round.offer!.line, 'teacher'); }} className="rounded-full bg-white/90 px-4 py-1 font-black text-amber-800 shadow" style={{ fontSize: 'min(2.2vh, 1.5vw)' }}>🔊 Help me</button>
              <button type="button" onClick={saidOffer} className={`${CLAY_BUTTON} px-6 py-2`} style={{ fontSize: 'min(3vh, 2vw)' }}>✓ I said it!</button>
            </>
          )}
        </div>
      )}
      {/* the menu */}
      {!done && (
        <div className="absolute inset-x-[3%] bottom-[4%] z-30 flex justify-center gap-[1vw]">
          {scene.menu.map((m, i) => {
            const on = tray.includes(i);
            return (
              <motion.button key={m.label} type="button" onClick={() => toggle(i)} whileTap={{ scale: 0.9 }} aria-label={m.label}
                className={`flex flex-col items-center rounded-[1.8vh] border-[0.5vh] bg-white/95 p-[0.6vh] shadow-xl ${on ? 'border-emerald-400 opacity-60' : 'border-white'}`}
                style={{ width: `${Math.min(13, 92 / scene.menu.length)}%` }}>
                <img src={m.img} alt="" draggable={false} className="h-[min(12vh,8vw)] w-full object-contain" />
                <span className="font-black text-amber-900" style={{ fontSize: 'min(2.2vh, 1.5vw)' }}>{m.label}</span>
              </motion.button>
            );
          })}
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
