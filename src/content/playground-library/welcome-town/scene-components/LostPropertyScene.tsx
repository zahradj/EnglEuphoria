import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { OWNER_NO, OWNER_YES, ownerSentence, whoseQuestion } from './roomRules';

/* ---------- Lost Property Box (`lost-property`, docs/a1-unit-9-lesson-4.md) ----------
 * Cat-cat's box is full of things that belong to the friends. One thing pops out at a time and Wim asks "Whose crown is
 * it?"; the child taps the owner. The right owner hugs it ("It's mine! Thank you!") and keeps it beside them, and the
 * sentence "It's Wim's crown." appears for the child to say; a wrong friend shakes their head ("No, it's not mine!").
 * Mechanic: coursebook "Whose…? / possessive 's" practice (Cambridge Power Up 1). Better: the answer is heard as a real
 * question from a character, every owner reacts in their own voice, and what the child gave back stays with its owner
 * (a visible, growing result); no timer, no lost points. */

type Lost = Extract<Scene, { kind: 'lost-property' }>;

export function LostPropertyScene({ scene, onNext, onWin, onLose, sync }: { scene: Lost; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { i: 0, given: [-1], wrong: -1, saying: false, done: false });
  const i = Math.max(0, Math.min(scene.items.length - 1, Number(state.i) || 0));
  const item = scene.items[i];
  const given = useMemo(() => (Array.isArray(state.given) ? state.given.filter((n) => n >= 0) : []), [state.given]);
  const saying = !!state.saying;
  const done = !!state.done;
  const gemDone = useRef(false);

  useEffect(() => {
    if (done || !item) return undefined;
    const t = window.setTimeout(() => { sfx.pop(); cueSpeak(whoseQuestion(item.label), voiceOf(scene.who)); }, 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const give = (o: number) => {
    if (done || saying || !item) return;
    const owner = scene.owners[o];
    if (!owner) return;
    if (o !== item.owner) {
      sfx.wrong(); onLose();
      cueSpeak(OWNER_NO, voiceOf(owner.who));
      setState((s) => ({ ...s, wrong: o }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 650);
      return;
    }
    sfx.match(); window.setTimeout(() => sfx.whoop(), 250);
    cueSpeak(OWNER_YES, voiceOf(owner.who));
    window.setTimeout(() => cueSpeak(ownerSentence(owner.name, item.label), 'teacher'), 1500);
    setState((s) => ({ ...s, given: [...given, i], saying: true }));
  };
  const said = () => {
    if (!saying) return;
    sfx.click();
    setState((s) => {
      const n = (Number(s.i) || 0) + 1;
      return n >= scene.items.length ? { ...s, saying: false, done: true } : { ...s, saying: false, i: n };
    });
  };

  const owner = item ? scene.owners[item.owner] : undefined;
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-indigo-950/15" />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[3%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `\u{1F4E6} ${scene.title}`}
        </span>
      </div>
      {/* the box and the thing that popped out */}
      {!done && item && (
        <div className="absolute left-1/2 top-[13%] z-20 flex -translate-x-1/2 flex-col items-center">
          <button type="button" onClick={() => { sfx.click(); cueSpeak(whoseQuestion(item.label), voiceOf(scene.who)); }}
            className="mb-[1vh] rounded-[2vh] bg-white/95 px-[1.4vw] py-[0.8vh] font-black text-indigo-900 shadow-xl" style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>
            🔊 {whoseQuestion(item.label)} <span className="ms-2 text-indigo-400">{i + 1}/{scene.items.length}</span>
          </button>
          <AnimatePresence mode="wait">
            {!saying && (
              <motion.img key={`item-${i}`} src={item.img} alt={item.label} draggable={false} className="h-[min(18vh,13vw)] w-auto object-contain drop-shadow-2xl"
                initial={reduce ? false : { y: 120, scale: 0.2, opacity: 0, rotate: -20 }} animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.3, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 13 }} />
            )}
          </AnimatePresence>
          {scene.boxImg
            ? <img src={scene.boxImg} alt="" draggable={false} className="-mt-[2vh] h-[min(14vh,10vw)] w-auto object-contain drop-shadow-xl" />
            : <span className="-mt-[1vh]" style={{ fontSize: 'min(12vh, 8vw)' }}>📦</span>}
        </div>
      )}
      {/* say the sentence */}
      {saying && item && owner && (
        <motion.div className="absolute left-1/2 top-[30%] z-40 flex -translate-x-1/2 flex-col items-center gap-[1vh]" initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <button type="button" onClick={() => { sfx.click(); cueSpeak(ownerSentence(owner.name, item.label), 'teacher'); }}
            className="rounded-[2vh] border-[0.5vh] border-emerald-500 bg-white px-[1.6vw] py-[1vh] font-black text-emerald-800 shadow-2xl" style={{ fontSize: 'min(4vh, 2.8vw)' }}>
            🗣️ {ownerSentence(owner.name, item.label)}
          </button>
          <button type="button" onClick={said} className={`${CLAY_BUTTON} px-8 py-2`} style={{ fontSize: 'min(3vh, 2vw)' }}>✓ I said it!</button>
        </motion.div>
      )}
      {/* the owners, each keeping what they got back */}
      <div className="absolute inset-x-[3%] bottom-[3%] z-30 flex items-end justify-around">
        {scene.owners.map((o, k) => {
          const mine = given.filter((g) => scene.items[g]?.owner === k);
          return (
            <motion.button key={o.name} type="button" onClick={() => give(k)} disabled={done || saying} aria-label={o.name}
              className="relative flex w-[22%] flex-col items-center"
              animate={state.wrong === k ? { x: [0, -10, 10, -6, 0] } : saying && owner?.name === o.name && !reduce ? { y: [0, -18, 0] } : {}}
              transition={{ duration: 0.5 }}>
              <div className="mb-[0.5vh] flex h-[min(8vh,5.5vw)] items-end gap-[0.3vw]">
                {mine.map((g) => <img key={g} src={scene.items[g].img} alt={scene.items[g].label} draggable={false} className="h-full w-auto object-contain drop-shadow" />)}
              </div>
              <img src={o.img} alt="" draggable={false} className="h-[min(26vh,17vw)] w-auto object-contain drop-shadow-2xl" />
              <span className="mt-[0.4vh] rounded-full bg-white/95 px-3 font-black text-indigo-900 shadow" style={{ fontSize: 'min(2.6vh, 1.8vw)' }}>{o.name}</span>
            </motion.button>
          );
        })}
      </div>
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute left-1/2 top-[45%] z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
