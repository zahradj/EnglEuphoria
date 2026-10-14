import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { surveyQuestion, surveyAnswer, surveyReport } from './foodRules';

/* ---------- Food Survey ★ (docs/a1-unit-4-food.md §5.4) ----------
 * The child is the festival reporter with a clipboard. 1 ASK: a chart of friends × foods; the child taps a box, SAYS the
 * question shown on the card ("Do you like soup, Mia?") and taps 🎤 — the friend answers in their own voice ("Yes, I do!"
 * / "No, I don't.") and the box gets a ✓ or ✗ sticker. 2 REPORT: the chart stays; for each report card the child reads
 * the chart and picks "likes" or "doesn't like" — the third-person sentence is said ("Mia likes soup."). Mechanics:
 * likes/dislikes survey grids and find-someone-who (teach-this, ESL Kid Stuff, games4esl). Better: the child ASKS before
 * any answer comes, the friends answer with recorded voices, and the report turns the answers into he/she sentences. */

type Survey = Extract<Scene, { kind: 'food-survey' }>;

export function FoodSurveyScene({ scene, onNext, onWin, onLose, sync }: { scene: Survey; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { asked: [''] as string[], cur: '', phase: 'ask', r: 0, wrong: '', done: false });
  const asked = useMemo(() => new Set(Array.isArray(state.asked) ? state.asked.filter(Boolean) : []), [state.asked]);
  const cur = String(state.cur);
  const phase = String(state.phase) as 'ask' | 'report';
  const r = Math.max(0, Math.min(scene.reports.length - 1, Number(state.r) || 0));
  const rep = scene.reports[r];
  const done = !!state.done;
  const gemDone = useRef(false);
  const total = scene.friends.length * scene.foods.length;

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(phase === 'ask' ? 'Ask your friends! Tap a box.' : 'Now read the chart. Likes or doesn’t like?', voiceOf(scene.who)), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pick = (f: number, c: number) => {
    if (phase !== 'ask' || done || asked.has(`${f}:${c}`)) return;
    sfx.click();
    setState((s) => ({ ...s, cur: `${f}:${c}` }));
  };
  const ask = () => {
    if (!cur || done) return;
    const [f, c] = cur.split(':').map(Number);
    const friend = scene.friends[f]; const food = scene.foods[c];
    if (!friend || !food) return;
    const yes = !!scene.answers[f]?.[c];
    cueSpeak(surveyQuestion(food.label, friend.name), 'teacher');
    window.setTimeout(() => { (yes ? sfx.match : sfx.pop)(); cueSpeak(surveyAnswer(yes), voiceOf(friend.who)); }, 1500);
    const list = [...asked, cur];
    setState((s) => ({ ...s, asked: list, cur: '' }));
    if (list.length >= total) window.setTimeout(() => setState((s) => ({ ...s, phase: 'report', r: 0 })), 2800);
  };
  const report = (likes: boolean) => {
    if (phase !== 'report' || !rep || done) return;
    const yes = !!scene.answers[rep.friend]?.[rep.food];
    if (likes !== yes) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: likes ? 'y' : 'n' }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
      cueSpeak('Look at the chart again!', voiceOf(scene.who));
      return;
    }
    sfx.gem();
    cueSpeak(surveyReport(scene.friends[rep.friend].name, scene.foods[rep.food].label, yes), 'teacher');
    window.setTimeout(() => setState((s) => {
      const n = (Number(s.r) || 0) + 1;
      return n >= scene.reports.length ? { ...s, done: true } : { ...s, r: n };
    }), 1800);
  };

  const [cf, cc] = cur ? cur.split(':').map(Number) : [-1, -1];
  const cell = 'min(12vh, 8.5vw)';
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-amber-950/20" />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `📋 ${scene.title}`}
        </span>
      </div>
      {!done && <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-rose-600 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>{phase === 'ask' ? `🎤 ${asked.size}/${total}` : `✍️ ${r + 1}/${scene.reports.length}`}</span>}
      {/* the clipboard chart */}
      <div className="absolute left-[3%] top-[18%] z-20 rounded-[2.4vh] border-[0.8vh] border-amber-800 bg-amber-50 p-[1.4vh] shadow-2xl">
        <div className="mx-auto -mt-[3vh] mb-[0.6vh] h-[3vh] w-[30%] rounded-b-[1vh] bg-slate-400 shadow" />
        <table className="border-separate" style={{ borderSpacing: '0.6vh' }}>
          <thead>
            <tr>
              <th />
              {scene.foods.map((fd) => (
                <th key={fd.label} className="text-center">
                  <img src={fd.img} alt={fd.label} draggable={false} className="mx-auto object-contain" style={{ height: cell, width: cell }} />
                  <span className="font-black text-amber-900" style={{ fontSize: 'min(2.2vh, 1.5vw)' }}>{fd.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scene.friends.map((fr, f) => (
              <tr key={fr.name}>
                <th className="pe-[0.6vw] text-start">
                  <span className="flex items-center gap-[0.5vw]">
                    <img src={fr.img} alt="" draggable={false} className="object-contain" style={{ height: cell, width: cell }} />
                    <span className="font-black text-amber-900" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>{fr.name}</span>
                  </span>
                </th>
                {scene.foods.map((fd, c) => {
                  const key = `${f}:${c}`; const got = asked.has(key); const yes = !!scene.answers[f]?.[c];
                  const isCur = cur === key;
                  const isRep = phase === 'report' && rep && rep.friend === f && rep.food === c;
                  return (
                    <td key={fd.label}>
                      <motion.button type="button" onClick={() => pick(f, c)} aria-label={`${fr.name} ${fd.label}`} whileTap={{ scale: 0.9 }}
                        className={`flex items-center justify-center rounded-[1.4vh] border-[0.4vh] bg-white font-black shadow ${isCur ? 'border-yellow-400 ring-[0.5vh] ring-yellow-300' : isRep ? 'border-rose-500 ring-[0.5vh] ring-rose-300' : 'border-amber-200'}`}
                        style={{ height: cell, width: cell, fontSize: 'min(6vh, 4vw)' }}>
                        <AnimatePresence>
                          {got && (
                            <motion.span initial={reduce ? false : { scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 1.5 }}
                              className={yes ? 'text-emerald-500' : 'text-rose-500'}>{yes ? '✓' : '✗'}</motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* right panel: ask, or report */}
      {!done && phase === 'ask' && (
        <div className="absolute right-[3%] top-[24%] z-30 flex w-[34%] flex-col items-center gap-[1.6vh]">
          {cf >= 0 ? (
            <>
              <img src={scene.friends[cf]?.img} alt="" draggable={false} className="h-[min(22vh,15vw)] w-auto object-contain drop-shadow-xl" />
              <div className="rounded-[2vh] bg-white/95 px-[1.4vw] py-[1.2vh] text-center font-black text-amber-900 shadow-xl" style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>
                {surveyQuestion(scene.foods[cc]?.label ?? '', scene.friends[cf]?.name ?? '')}
              </div>
              <button type="button" onClick={ask} className={`${CLAY_BUTTON} px-8 py-3`} style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>🎤 I asked!</button>
            </>
          ) : (
            <div className="rounded-[2vh] bg-white/90 px-[1.4vw] py-[1.4vh] text-center font-black text-amber-900 shadow-xl" style={{ fontSize: 'min(3vh, 2vw)' }}>
              Tap a box. Ask the question! 🎤
            </div>
          )}
        </div>
      )}
      {!done && phase === 'report' && rep && (
        <div className="absolute right-[3%] top-[24%] z-30 flex w-[34%] flex-col items-center gap-[1.6vh]">
          <div className="flex items-center gap-[1vw] rounded-[2vh] bg-white/95 px-[1.4vw] py-[1.4vh] font-black text-amber-900 shadow-xl" style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>
            <img src={scene.friends[rep.friend].img} alt="" className="h-[min(9vh,6vw)] w-auto" />
            {scene.friends[rep.friend].name} … {scene.foods[rep.food].label}.
          </div>
          <div className="flex gap-[1vw]">
            {[true, false].map((likes) => (
              <motion.button key={String(likes)} type="button" onClick={() => report(likes)} whileTap={{ scale: 0.92 }}
                animate={state.wrong === (likes ? 'y' : 'n') ? { x: [0, -8, 8, -5, 0] } : {}}
                className={`rounded-[2vh] px-[1.4vw] py-[1.4vh] font-black text-white shadow-xl ${likes ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>
                {likes ? '👍 likes' : '👎 doesn’t like'}
              </motion.button>
            ))}
          </div>
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
