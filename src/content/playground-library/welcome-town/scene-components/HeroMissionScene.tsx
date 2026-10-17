import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { CalmBg, Bursts, FloatText, useBursts } from '../../unit1/scene-components/gameFx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON } from '../../unit1/scene-components/shared';
import { SKIN, PILL_FONT, jewel } from '../../gameSkin';
import { HERO_ASK, HERO_NEXT, HERO_START, HERO_WRONG } from './heroMissionRules';

/* ---------- Hero Mission ★ (docs/a1-unit-7-hero-city.md §5.4) ----------
 * The golden city is a little sleepy (a soft warm veil). People around it wear a "!" bubble — quest givers. The child
 * taps one and 1 ASKS "What's the matter?" (🎤), the person says what's wrong ("I've got a cold."), 2 PICKS the right
 * help from the hero bag (tissue, water, plaster…), 3 SAYS the offer ("Can I help you? Here's a tissue.") — the person
 * smiles and thanks the hero, the "!" turns into a gold star and the city gets a little brighter. A wrong help: the
 * person says kindly "No, thank you" and the problem again. Done when everyone is helped.
 * Mechanics (docs/research/playground-a1u7-research.md): Community Helpers Play & Learn (help a helper finish a task),
 * Khan Academy Kids community-helper books (everyday helping), video-game quest givers ("!" over an NPC, a quest log).
 * Better: the child can only finish a quest with the English — ask, understand the problem, offer the help — and every
 * helped person stays happy in the city; no timer, no lives. */

type Mission = Extract<Scene, { kind: 'hero-mission' }>;
type Phase = 'choose' | 'ask' | 'help' | 'offer';
const PHASES: Phase[] = ['choose', 'ask', 'help', 'offer'];

export function HeroMissionScene({ scene, onNext, onWin, onLose, sync }: { scene: Mission; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { cur: -1, phase: 'choose', helped: [] as number[], wrong: '', done: false });
  const total = scene.citizens.length;
  const helpedList = Array.isArray(state.helped) ? state.helped.map(Number) : [];
  const helped = useMemo(() => new Set(helpedList), [helpedList.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  const phase = (PHASES.includes(state.phase as Phase) ? state.phase : 'choose') as Phase;
  const cur = Number(state.cur);
  const citizen = cur >= 0 ? scene.citizens[cur] : undefined;
  const done = !!state.done;
  const wrong = String(state.wrong || '');
  const [bursts, fire] = useBursts();
  const [star, setStar] = useState(false);
  const gemDone = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); }, []);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    if (done) return undefined;
    const t = window.setTimeout(() => cueSpeak(helped.size === 0 ? HERO_START : HERO_NEXT, voiceOf(scene.who)), 800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [helped.size, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const choose = (i: number) => {
    if (done || helped.has(i) || phase !== 'choose') return;
    sfx.pop();
    setState((s) => ({ ...s, cur: i, phase: 'ask', wrong: '' }));
    later(() => cueSpeak(HERO_ASK, voiceOf(scene.who)), 300);
  };
  const asked = () => {
    if (!citizen || phase !== 'ask') return;
    sfx.reveal();
    setState((s) => ({ ...s, phase: 'help' }));
    later(() => cueSpeak(citizen.problem, 'teacher'), 300);
  };
  const give = (label: string) => {
    if (!citizen || phase !== 'help') return;
    if (label !== citizen.help) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: label }));
      later(() => setState((s) => ({ ...s, wrong: '' })), 700);
      cueSpeak(HERO_WRONG, 'teacher');
      later(() => cueSpeak(citizen.problem, 'teacher'), 1800);
      return;
    }
    sfx.match();
    fire(citizen.left, citizen.top, 'sparkle');
    setState((s) => ({ ...s, phase: 'offer', wrong: '' }));
    later(() => cueSpeak(citizen.offer, 'teacher'), 400);
  };
  const offered = () => {
    if (!citizen || phase !== 'offer') return;
    sfx.gem();
    fire(citizen.left, citizen.top, 'stars');
    setStar(true);
    later(() => setStar(false), 900);
    cueSpeak(citizen.thanks, 'teacher');
    const i = cur;
    later(() => setState((s) => {
      const list = Array.isArray(s.helped) ? s.helped.map(Number) : [];
      const next = list.includes(i) ? list : [...list, i];
      return { ...s, helped: next, cur: -1, phase: 'choose', done: next.length >= total };
    }), 1400);
  };

  // the city wakes up: the warm veil fades as people are helped
  const veil = done ? 0 : 0.42 * (1 - helped.size / Math.max(1, total));
  return (
    <div className="absolute inset-0 select-none overflow-hidden" style={{ background: '#FDE7C2' }}>
      <CalmBg img={scene.bg} strength="soft" />
      <div className="pointer-events-none absolute inset-0 z-[5]" style={{ background: 'linear-gradient(180deg, rgba(120,72,30,0.55), rgba(120,72,30,0.35))', opacity: veil / 0.42 * 0.8, transition: 'opacity 1.2s' }} />

      {/* the people */}
      {scene.citizens.map((c, i) => {
        const isHelped = helped.has(i);
        const isCur = i === cur;
        return (
          <motion.button key={i} type="button" onClick={() => choose(i)} disabled={isHelped || phase !== 'choose' || done}
            className="absolute z-[8] -translate-x-1/2 -translate-y-1/2 disabled:cursor-default"
            style={{ left: `${c.left}%`, top: `${c.top}%`, width: `${c.size}%` }}
            animate={isCur ? { scale: 1.12 } : { scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
            <motion.img src={c.img} alt={c.name} draggable={false} className="w-full drop-shadow-[0_1.2vh_1.2vh_rgba(120,53,15,0.4)]"
              animate={isHelped && !reduce ? { y: [0, -6, 0] } : {}} transition={{ duration: 2.4 + (i % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' }} />
            {/* the quest bubble: "!" until helped, then a gold star */}
            <motion.span className="absolute -top-[2vh] start-1/2 grid h-[5.4vh] w-[5.4vh] -translate-x-1/2 place-items-center rounded-full border-[0.35vh] border-white font-black shadow-[0_0.6vh_1vh_rgba(120,53,15,0.35)] rtl:translate-x-1/2"
              style={{ background: isHelped ? 'radial-gradient(circle at 35% 30%, #FFE08A, #F59E0B)' : 'radial-gradient(circle at 35% 30%, #FFB27A, #FE6A2F)', color: '#fff', fontSize: '3vh' }}
              animate={!isHelped && !isCur && !reduce ? { y: [0, -6, 0] } : { y: 0 }} transition={{ duration: 1.2, repeat: Infinity }}>
              {isHelped ? '⭐' : '!'}
            </motion.span>
          </motion.button>
        );
      })}

      {done && <Confetti count={110} />}
      <Bursts items={bursts} />
      {citizen && <FloatText show={star} x={citizen.left} y={citizen.top}>+⭐</FloatText>}

      {/* title + quest log */}
      <div className="pointer-events-none absolute inset-x-0 top-[3%] z-30 flex justify-center px-16">
        <span className={`px-6 py-1.5 text-center ${SKIN.pill}`} style={{ fontSize: PILL_FONT }}>{done ? scene.doneLine : `🦸 ${scene.title}`}</span>
      </div>
      <span className={`absolute end-3 top-[12%] z-30 px-4 py-2 ${SKIN.pill}`} style={{ fontSize: 'min(3vh, 2vw)' }}>⭐ {helped.size}/{total}</span>

      {/* the speech bubble of the person being helped */}
      <AnimatePresence>
        {citizen && phase !== 'ask' && (
          <motion.div key={`say-${cur}`} className={`absolute z-20 max-w-[34vw] -translate-x-1/2 px-[1.4vw] py-[1vh] text-center font-black ${SKIN.panel}`}
            style={{ left: `${Math.min(80, Math.max(20, citizen.left))}%`, top: `${Math.max(14, citizen.top - citizen.size * 1.15)}%`, fontSize: 'min(3.2vh, 2.1vw)' }}
            initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" onClick={() => cueSpeak(citizen.problem, 'teacher')} className={SKIN.ink}>💬 {citizen.problem} <span className="text-[0.7em]">🔊</span></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* the hero panel: ask → help → offer */}
      {citizen && !done && (
        <div className="absolute inset-x-0 bottom-[3%] z-30 flex justify-center px-4">
          <motion.div key={`${cur}-${phase}`} className={`flex w-[min(66vw,110vh)] flex-col items-center gap-[1.2vh] px-[1.6vw] py-[1.4vh] ${SKIN.panel}`}
            initial={reduce ? false : { y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            {phase === 'ask' && (
              <>
                <span className={`font-black ${SKIN.ink}`} style={{ fontSize: 'min(3vh, 2vw)' }}>Ask {citizen.name}:</span>
                <span className={`text-center font-black ${SKIN.ink}`} style={{ fontSize: 'min(4.4vh, 3vw)' }}>{HERO_ASK}</span>
                <div className="flex gap-[1vw]">
                  <button type="button" onClick={() => cueSpeak(HERO_ASK, voiceOf(scene.who))} className={`rounded-full px-5 py-2 font-black ${jewel(1)}`} style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>🔊 Listen</button>
                  <button type="button" onClick={asked} className={`rounded-full px-7 py-2 font-black ${jewel(0)}`} style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>🎤 I asked!</button>
                </div>
              </>
            )}
            {phase === 'help' && (
              <>
                <span className={`font-black ${SKIN.ink}`} style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>🎒 How can you help?</span>
                <div className="flex flex-wrap justify-center gap-[1.2vw]">
                  {scene.helps.map((h, hi) => (
                    <motion.button key={h.label} type="button" onClick={() => give(h.label)} whileTap={{ scale: 0.92 }}
                      animate={wrong === h.label ? { x: [0, -10, 10, -6, 0] } : {}}
                      className={`flex flex-col items-center rounded-[2vh] px-[1vw] py-[0.6vh] font-black ${jewel(hi)}`} style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>
                      <img src={h.img} alt="" draggable={false} className="h-[9vh] w-[9vh] object-contain" />
                      {h.label}
                    </motion.button>
                  ))}
                </div>
              </>
            )}
            {phase === 'offer' && (
              <>
                <span className={`text-center font-black ${SKIN.ink}`} style={{ fontSize: 'min(4.2vh, 2.8vw)' }}>{citizen.offer}</span>
                <div className="flex gap-[1vw]">
                  <button type="button" onClick={() => cueSpeak(citizen.offer, 'teacher')} className={`rounded-full px-5 py-2 font-black ${jewel(1)}`} style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>🔊 Listen</button>
                  <button type="button" onClick={offered} className={`rounded-full px-7 py-2 font-black ${jewel(0)}`} style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>🎤 I said it!</button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[6%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
