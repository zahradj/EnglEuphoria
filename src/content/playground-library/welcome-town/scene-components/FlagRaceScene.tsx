import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { QuestionCard, voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Team Flags (Gimkit "Capture the Flag", made safe — docs/a1-activity-library.md §12) ----------
 * Two hills, two flags: the child's 🟨 and the teacher's 🟦. Turns alternate. On the child's turn the child answers
 * and their flag climbs one step. On the teacher's turn the CHILD reads the question to the teacher and the teacher
 * answers (on one screen the friend answers for the teacher). A wrong answer just tries again — nobody slides back.
 * The child always moves first, so a child who keeps answering reaches the top first. Mechanics: Gimkit Capture
 * the Flag, Kahoot team mode, tug-of-war review games. Better: the child also ASKS the questions (speaking turn), no
 * stealing or losing ground, and the race is shared on both screens. */

type Flags = Extract<Scene, { kind: 'flag-race' }>;

export function FlagRaceScene({ scene, onNext, onWin, onLose, sync }: { scene: Flags; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const goal = Math.ceil(total / 2);
  const [state, setState] = useSyncedState(sync, { turn: 0, kid: 0, teach: 0, wrong: -1, done: false });
  const turn = Math.max(0, Math.min(total - 1, Number(state.turn) || 0));
  const r = scene.rounds[turn];
  const kidTurn = turn % 2 === 0;
  const kid = Number(state.kid) || 0;
  const teach = Number(state.teach) || 0;
  const done = !!state.done;
  const gemDone = useRef(false);
  const busy = useRef(false);

  useEffect(() => {
    busy.current = false;
    if (done || !r) return undefined;
    const t = window.setTimeout(() => cueSpeak(kidTurn ? `Your turn! ${r.ask}` : 'Now ask your teacher!', voiceOf(scene.who)), 600);
    // one screen, no teacher: the friend answers the teacher's question after a little think
    const auto = !kidTurn && !sync?.isSynced ? window.setTimeout(() => answer(r.answer), 4200) : undefined;
    return () => { window.clearTimeout(t); if (auto) window.clearTimeout(auto); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function answer(c: number) {
    if (!r || done || busy.current) return;
    if (c !== r.answer) {
      sfx.wrong(); if (kidTurn) onLose();
      setState((s) => ({ ...s, wrong: c }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    busy.current = true;
    sfx.match(); window.setTimeout(() => sfx.pop(), 300);
    cueSpeak(r.choices[c], 'teacher');
    setState((s) => {
      const k = (Number(s.kid) || 0) + (kidTurn ? 1 : 0);
      const t = (Number(s.teach) || 0) + (kidTurn ? 0 : 1);
      const n = (Number(s.turn) || 0) + 1;
      return { ...s, kid: k, teach: t, wrong: -1, turn: Math.min(total - 1, n), done: k >= goal || n >= total };
    });
  }

  const hill = (side: 'left' | 'right', steps: number, color: string, label: string) => {
    const p = Math.min(1, steps / goal);
    return (
      <div key={side} className={`absolute bottom-[4%] ${side === 'left' ? 'left-[3%]' : 'right-[3%]'} z-10 h-[56%] w-[24%]`}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d="M0 100 Q 20 30 50 8 Q 80 30 100 100 Z" fill={side === 'left' ? '#86efac' : '#93c5fd'} stroke="#ffffff" strokeWidth="1.5" />
          <path d="M18 92 Q 30 60 42 40 Q 48 24 50 12" fill="none" stroke="#fff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.9" />
        </svg>
        {Array.from({ length: goal }, (_, i) => {
          const q = (i + 1) / goal;
          return <span key={i} className="absolute h-[2vh] w-[2vh] -translate-x-1/2 rounded-full border-[0.3vh] border-white bg-white/50" style={{ left: `${18 + q * 32}%`, bottom: `${8 + q * 80}%` }} />;
        })}
        <motion.div className="absolute" style={{ marginLeft: '-0.3vh' }} animate={{ left: `${18 + p * 32}%`, bottom: `${8 + p * 80}%` }} transition={{ type: 'spring', stiffness: 120, damping: 14 }}>
          <div className="relative h-[min(9vh,6vw)] w-[min(6vh,4vw)]">
            <span className="absolute bottom-0 left-0 h-full w-[0.6vh] rounded bg-amber-900" />
            <motion.span className="absolute left-[0.6vh] top-0 block h-[55%] w-[90%] origin-left" style={{ background: color, clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
              animate={reduce ? {} : { scaleX: [1, 0.85, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
          </div>
        </motion.div>
        <span className="absolute -top-[9%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1 font-black shadow" style={{ color, fontSize: 'min(2.6vh, 1.8vw)' }}>{label} · {steps}/{goal}</span>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/15" />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🚩 ${scene.title}`}
        </span>
      </div>
      {hill('left', kid, '#eab308', '⭐ You')}
      {hill('right', teach, '#2563eb', '👩‍🏫 Teacher')}
      {!done && r && (
        <div className="absolute inset-x-[29%] top-[18%] z-30 flex flex-col items-center gap-[1vh]">
          <span className={`rounded-full px-4 py-1 font-black text-white shadow ${kidTurn ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ fontSize: 'min(3vh, 2vw)' }}>
            {kidTurn ? '⭐ Your turn — answer!' : '🗣️ Ask your teacher! Read the question.'}
          </span>
          <QuestionCard className="w-full" ask={r.ask} choices={r.choices} wrong={Number(state.wrong)} onPick={answer}
            onHear={() => cueSpeak(r.ask, voiceOf(scene.who))} tone={kidTurn ? 'amber' : 'sky'} disabled={!kidTurn && !sync?.isSynced} />
          {!kidTurn && !sync?.isSynced && <span className="rounded-full bg-white/90 px-3 py-1 font-black text-blue-700" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>🤔 Your teacher is thinking…</span>}
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
