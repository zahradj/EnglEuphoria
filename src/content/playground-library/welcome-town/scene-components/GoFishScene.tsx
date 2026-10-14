import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { type FishState, childAsks, friendAsks, friendWants, isOver, startState } from './goFishRules';

/* ---------- Go Fish! (the classic card game, modern design — docs/a1-activity-library.md §11) ----------
 * The child holds picture cards and plays a friend. Child's turn: tap a card to ASK "Have you got a frog?" — the
 * friend answers "Yes! Here you are." (the pair flies to your table) or "No! Go fish!" (a card swims out of the pond
 * into your hand; a match makes a pair at once). Friend's turn: the friend asks, the child answers truthfully "Yes, I
 * have." / "No, I haven't. Go fish!" — a wrong answer only says "Look at your cards!". The game ends when the child's
 * hand is empty. Mechanics: Go Fish (classroom ESL card game; esl-kids.com, eslactive.com). Better: both turns are
 * real questions and answers, a painted pond to fish from, pairs pile up visibly, no losing — the friend's pairs are
 * just "friend's pairs". */

type Fish = Extract<Scene, { kind: 'go-fish' }>;
const S0 = (lists: string[]) => (Array.isArray(lists) ? lists.filter((x) => typeof x === 'string' && x) : []);

export function GoFishScene({ scene, onNext, onWin, onLose, sync }: { scene: Fish; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const friendName = CAST[scene.who]?.name ?? 'Pip';
  const start = useMemo(() => startState(scene.childHand, scene.friendHand, scene.pond), [scene.childHand, scene.friendHand, scene.pond]);
  const [state, setState] = useSyncedState(sync, {
    child: start.child.length ? start.child : [''], friend: start.friend.length ? start.friend : [''], pond: start.pond.length ? start.pond : [''],
    childPairs: [''], friendPairs: [''], turn: 'child', said: '', reply: '', wrongAnswer: false, done: false,
  });
  const fs: FishState = { child: S0(state.child), friend: S0(state.friend), pond: S0(state.pond), childPairs: S0(state.childPairs), friendPairs: S0(state.friendPairs) };
  const card = (label: string) => scene.cards.find((c) => c.label === label);
  const a = (label: string) => card(label)?.article ?? (/^[aeiou]/i.test(label) ? 'an' : 'a');
  const done = !!state.done;
  const busy = useRef(false);
  const gemDone = useRef(false);
  const wants = friendWants(fs);

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak('Let’s play Go Fish! Tap a card and ask me!', voiceOf(scene.who)), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (state.turn === 'friend' && wants && !done) {
      const t = window.setTimeout(() => cueSpeak(`Have you got ${a(wants)} ${wants}?`, voiceOf(scene.who)), 500);
      return () => window.clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.turn, wants, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const save = (n: FishState, extra: Partial<typeof state>) =>
    setState((s) => ({ ...s, child: n.child.length ? n.child : [''], friend: n.friend.length ? n.friend : [''], pond: n.pond.length ? n.pond : [''], childPairs: n.childPairs.length ? n.childPairs : [''], friendPairs: n.friendPairs.length ? n.friendPairs : [''], ...extra }));

  const ask = (label: string) => {
    if (done || busy.current || state.turn !== 'child') return;
    busy.current = true;
    sfx.click();
    const q = `Have you got ${a(label)} ${label}?`;
    cueSpeak(q, 'teacher');
    setState((s) => ({ ...s, said: q, reply: '' }));
    const res = childAsks(fs, label);
    window.setTimeout(() => {
      const reply = res.result === 'yes' ? 'Yes! Here you are.' : 'No! Go fish!';
      cueSpeak(reply, voiceOf(scene.who));
      if (res.result === 'yes') sfx.match(); else sfx.pop();
      const over = isOver(res.state);
      save(res.state, { reply, done: over, turn: over ? 'child' : 'child' });
      window.setTimeout(() => {
        if (over) { busy.current = false; return; }
        const nobody = !friendWants(res.state);
        save(res.state, { turn: nobody ? 'child' : 'friend', said: '', reply: res.result === 'fish' && res.drawn ? `You got ${a(res.drawn)} ${res.drawn}!` : '' });
        busy.current = false;
      }, 1900);
    }, 1300);
  };

  const answer = (yes: boolean) => {
    if (done || busy.current || state.turn !== 'friend' || !wants) return;
    const truth = fs.child.includes(wants);
    if (yes !== truth) {
      sfx.wrong(); onLose();
      cueSpeak('Look at your cards!', voiceOf(scene.who));
      setState((s) => ({ ...s, wrongAnswer: true }));
      window.setTimeout(() => setState((s) => ({ ...s, wrongAnswer: false })), 700);
      return;
    }
    busy.current = true;
    cueSpeak(yes ? 'Yes, I have. Here you are.' : 'No, I haven’t. Go fish!', 'teacher');
    const res = friendAsks(fs);
    if (yes) sfx.match(); else sfx.pop();
    window.setTimeout(() => {
      const over = isOver(res.state);
      save(res.state, { turn: 'child', said: '', reply: '', done: over });
      busy.current = false;
    }, 1400);
  };

  const cardW = 'min(17vh, 11vw)';
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/15" />
      {done && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-[6%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🎣 ${scene.title}`}
        </span>
      </div>
      {/* the friend with their cards (face down) */}
      <div className="absolute left-[3%] top-[15%] z-20 flex items-end gap-[1vw]">
        <motion.img src={scene.friendImg} alt={friendName} draggable={false} className="w-[min(20vh,13vw)] drop-shadow-xl" animate={reduce ? {} : { y: [0, -5, 0] }} transition={{ duration: 2.2, repeat: Infinity }} />
        <div className="mb-[2vh] flex">
          {fs.friend.map((_, i) => (
            <div key={i} className="-ml-[1.6vh] h-[min(11vh,7vw)] w-[min(8vh,5.2vw)] rounded-[1vh] border-[0.4vh] border-white bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md first:ml-0" style={{ rotate: `${(i - fs.friend.length / 2) * 5}deg` }}>
              <span className="grid h-full place-items-center text-[min(3vh,2vw)]">🐟</span>
            </div>
          ))}
        </div>
        <AnimatePresence>
          {(state.reply || (state.turn === 'friend' && wants)) && !done && (
            <motion.div key={`${state.turn}-${state.reply}-${wants}`} className="mb-[10vh] max-w-[min(42vh,28vw)] rounded-[2.2vh] border-[0.5vh] border-white bg-white/95 px-4 py-2 font-black text-[#3b2410] shadow-2xl"
              style={{ fontSize: 'min(3.4vh, 2.3vw)' }} initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              {state.turn === 'friend' && wants ? `Have you got ${a(wants)} ${wants}?` : state.reply}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* pond + pair piles */}
      <div className="absolute right-[3%] top-[16%] z-10 flex flex-col items-end gap-[1.2vh]">
        <div className="grid h-[min(16vh,11vw)] w-[min(30vh,20vw)] place-items-center rounded-[50%] border-[0.6vh] border-sky-200 bg-gradient-to-b from-sky-400 to-sky-700 shadow-inner">
          <span className="font-black text-white" style={{ fontSize: 'min(2.6vh, 1.8vw)' }}>🐟 pond: {fs.pond.length}</span>
        </div>
        <span className="rounded-full bg-white/95 px-3 py-1 font-black text-emerald-700 shadow" style={{ fontSize: 'min(2.6vh, 1.8vw)' }}>Your pairs: {fs.childPairs.length} · {friendName}: {fs.friendPairs.length}</span>
        <div className="flex flex-wrap justify-end gap-[0.6vw]">
          {fs.childPairs.map((l, i) => (
            <motion.img key={`${l}-${i}`} src={card(l)?.img} alt={l} draggable={false} className="h-[min(7vh,4.6vw)] rounded-[0.8vh] bg-white p-[0.3vh] shadow" initial={reduce ? false : { scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} />
          ))}
        </div>
      </div>
      {/* the child's question bubble */}
      <AnimatePresence>
        {state.said && !done && (
          <motion.div className="absolute bottom-[34%] left-1/2 z-30 -translate-x-1/2 rounded-[2.2vh] border-[0.5vh] border-orange-300 bg-orange-50 px-5 py-2 font-black text-orange-800 shadow-xl" style={{ fontSize: 'min(3.6vh, 2.4vw)' }}
            initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            You: {state.said}
          </motion.div>
        )}
      </AnimatePresence>
      {/* the child's hand */}
      {!done && (
        <div className="absolute inset-x-0 bottom-[4%] z-20 flex flex-col items-center gap-[1.2vh]">
          {state.turn === 'friend' && wants ? (
            <div className="flex gap-[1.2vw]">
              {[true, false].map((yes) => (
                <motion.button key={String(yes)} type="button" onClick={() => answer(yes)} whileTap={{ scale: 0.93 }} animate={state.wrongAnswer ? { x: [0, -8, 8, 0] } : {}}
                  className={`rounded-[2vh] border-[0.4vh] border-white px-[2.2vw] py-[1.2vh] font-black text-white shadow-[0_0.7vh_0_rgba(0,0,0,0.25)] ${yes ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gradient-to-b from-rose-400 to-rose-600'}`}
                  style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>{yes ? '👍 Yes, I have.' : '🎣 No, I haven’t. Go fish!'}</motion.button>
              ))}
            </div>
          ) : (
            <span className="rounded-full bg-white/95 px-4 py-1 font-black text-orange-700 shadow" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>Your turn: tap a card and ask!</span>
          )}
          <div className="flex justify-center gap-[1vw]">
            <AnimatePresence>
              {fs.child.map((l, i) => (
                <motion.button key={`${l}-${i}`} type="button" onClick={() => ask(l)} disabled={state.turn !== 'child'} layout
                  whileHover={reduce || state.turn !== 'child' ? {} : { y: -10 }} whileTap={{ scale: 0.94 }}
                  initial={reduce ? false : { y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
                  className={`flex flex-col items-center rounded-[1.6vh] border-[0.5vh] bg-[#fffaf0] p-[0.8vh] shadow-[0_0.7vh_0_rgba(0,0,0,0.25)] ${state.turn === 'friend' && l === wants ? 'border-yellow-300' : 'border-white'}`}
                  style={{ width: cardW }}>
                  <img src={card(l)?.img} alt="" draggable={false} className="aspect-square w-full object-contain" />
                  <span className="font-black text-[#3b2410]" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>{l}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
