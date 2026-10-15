import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { CalmBg, Bursts, FloatText, useBursts } from '../../unit1/scene-components/gameFx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { MonsterFigure } from './monsterParts';
import { GW_ASK, GW_GOT_IT, GW_HIDE, GW_LOOK, GW_NOT, GW_WHO, fitsMonster, gwGuess, gwRight } from './guessWhoRules';

/* ---------- Guess Who ★ (A1 U5L6, docs/a1-unit-5-monster-town.md §5.6) ----------
 * Eight monsters stand behind little doors. Part 1 — the child ASKS: tap a question, say it aloud ("Has your monster got
 * long horns?"), the friend answers with a full sentence and every monster that does not fit closes its door by itself;
 * when one is left the child taps it and says "It's Zog!". Part 2 — the child HIDES: they pick a monster, the friend asks
 * the questions and the child answers Yes / No (a wrong answer gets "Look at your monster again!"); the friend's doors
 * close until it guesses the child's monster.
 * Research (docs/research/playground-a1u5-research.md, Lesson 6): Hasbro "Guess Who?" (yes/no questions to eliminate
 * faces), ESL "Guess Who" for has got / is wearing (Games4ESL, ESL Kids Games), British Council LearnEnglish Kids
 * describing people. Better: the doors close by themselves so the child's attention stays on the language, every answer
 * is a full model sentence, and the roles swap so the child both asks and answers. */

type GuessWho = Extract<Scene, { kind: 'guess-who' }>;
export function GuessWhoScene({ scene, onNext, onWin, onLose, sync }: { scene: GuessWho; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, {
    phase: 'ask', asked: [-1], down: [-1], said: -1, yes: false,
    picked: -1, hAsked: [-1], hDown: [-1], hq: -1, guess: -1, miss: -1, done: false,
  });
  const phase = String(state.phase) === 'hide' ? 'hide' : 'ask';
  const asked = useMemo(() => (Array.isArray(state.asked) ? state.asked : []).filter((n) => n >= 0), [state.asked]);
  const down = useMemo(() => new Set((Array.isArray(state.down) ? state.down : []).filter((n) => n >= 0)), [state.down]);
  const hAsked = useMemo(() => (Array.isArray(state.hAsked) ? state.hAsked : []).filter((n) => n >= 0), [state.hAsked]);
  const hDown = useMemo(() => new Set((Array.isArray(state.hDown) ? state.hDown : []).filter((n) => n >= 0)), [state.hDown]);
  const said = Number(state.said);
  const picked = Number(state.picked);
  const hq = Number(state.hq);
  const guess = Number(state.guess);
  const miss = Number(state.miss);
  const done = !!state.done;
  const secret = Math.max(0, Math.min(scene.monsters.length - 1, scene.secret));
  const [bursts, fire] = useBursts();
  const [star, setStar] = useState(false);
  const gemDone = useRef(false);
  const kit = scene;

  const solved = phase === 'ask' && said === -2;

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(phase === 'ask' ? GW_ASK : GW_HIDE, voiceOf(scene.who)), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
  const cheer = (x: number, y: number) => { sfx.gem(); fire(x, y, 'stars'); setStar(true); window.setTimeout(() => setStar(false), 900); };

  /* ---- part 1: the child asks ---- */
  const askQ = (q: number) => {
    if (phase !== 'ask' || asked.includes(q) || solved) return;
    const qq = scene.questions[q];
    const yes = fitsMonster(scene.monsters[secret], qq.test);
    sfx.pop();
    cueSpeak(yes ? qq.yes : qq.no, voiceOf(scene.who));
    const close = scene.monsters.map((m, k) => k).filter((k) => fitsMonster(scene.monsters[k], qq.test) !== yes);
    setState((s) => ({ ...s, asked: [...(Array.isArray(s.asked) ? s.asked : []), q], said: q, yes }));
    window.setTimeout(() => {
      setState((s) => {
        const prev = Array.isArray(s.down) ? s.down : [];
        const next = Array.from(new Set([...prev, ...close]));
        const left = scene.monsters.map((_, k) => k).filter((k) => !next.includes(k));
        if (left.length === 1) window.setTimeout(() => cueSpeak(GW_WHO, voiceOf(scene.who)), 600);
        return { ...s, down: next };
      });
    }, 900);
  };
  const tapCardAsk = (k: number) => {
    if (down.has(k) || solved) return;
    if (k === secret) {
      cheer(cardX(k), cardY(k));
      cueSpeak(gwRight(scene.monsters[k].name), voiceOf(scene.who));
      setState((s) => ({ ...s, down: scene.monsters.map((_, j) => j).filter((j) => j !== k), said: -2 }));
    } else {
      sfx.wrong(); onLose();
      cueSpeak(GW_NOT, voiceOf(scene.who));
      setState((s) => ({ ...s, down: [...(Array.isArray(s.down) ? s.down : []), k], miss: k }));
    }
  };

  /* ---- part 2: the child hides, the friend asks ---- */
  const hUp = scene.monsters.map((_, k) => k).filter((k) => !hDown.has(k));
  const nextQuestion = (asked2: number[], up: number[]) =>
    scene.hideAsks.findIndex((q, i) => !asked2.includes(i) && up.some((k) => fitsMonster(scene.monsters[k], q.test)) && up.some((k) => !fitsMonster(scene.monsters[k], q.test)));
  const friendTurn = (asked2: number[], up: number[]) => {
    const nq = nextQuestion(asked2, up);
    if (nq >= 0 && up.length > 1) {
      setState((s) => ({ ...s, hq: nq, guess: -1 }));
      window.setTimeout(() => cueSpeak(scene.hideAsks[nq].ask, voiceOf(scene.who)), 500);
    } else {
      const g = up[0] ?? 0;
      setState((s) => ({ ...s, hq: -1, guess: g }));
      window.setTimeout(() => cueSpeak(gwGuess(scene.monsters[g].name), voiceOf(scene.who)), 500);
    }
  };
  const pick = (k: number) => {
    if (phase !== 'hide' || picked >= 0) return;
    sfx.pop();
    setState((s) => ({ ...s, picked: k }));
    friendTurn([], scene.monsters.map((_, j) => j));
  };
  const answer = (yes: boolean) => {
    if (picked < 0 || done) return;
    if (hq >= 0) {
      const q = scene.hideAsks[hq];
      const truth = fitsMonster(scene.monsters[picked], q.test);
      if (yes !== truth) { sfx.wrong(); onLose(); cueSpeak(GW_LOOK, voiceOf(scene.who)); setState((s) => ({ ...s, miss: 100 + hq })); return; }
      sfx.gem();
      const close = hUp.filter((k) => fitsMonster(scene.monsters[k], q.test) !== truth);
      const nextDown = [...Array.from(hDown), ...close];
      const up = scene.monsters.map((_, k) => k).filter((k) => !nextDown.includes(k));
      const a2 = [...hAsked, hq];
      setState((s) => ({ ...s, hDown: nextDown, hAsked: a2, hq: -1, miss: -1 }));
      window.setTimeout(() => friendTurn(a2, up), 900);
    } else if (guess >= 0) {
      const truth = guess === picked;
      if (yes !== truth) { sfx.wrong(); onLose(); cueSpeak(GW_LOOK, voiceOf(scene.who)); setState((s) => ({ ...s, miss: 200 })); return; }
      if (truth) {
        cheer(cardX(guess), cardY(guess));
        cueSpeak(GW_GOT_IT, voiceOf(scene.who));
        setState((s) => ({ ...s, guess: -1, done: true }));
      } else {
        const nextDown = [...Array.from(hDown), guess];
        const up = scene.monsters.map((_, k) => k).filter((k) => !nextDown.includes(k));
        setState((s) => ({ ...s, hDown: nextDown, guess: -1, miss: -1 }));
        window.setTimeout(() => friendTurn(hAsked, up), 700);
      }
    }
  };

  /* ---- layout: 4 × 2 doors on the left ---- */
  const cols = 4;
  const cardX = (k: number) => 6 + (k % cols) * 15 + 7;
  const cardY = (k: number) => 18 + Math.floor(k / cols) * 38 + 17;
  const isDown = (k: number) => (phase === 'ask' ? down.has(k) : hDown.has(k));
  const big = 'clamp(1rem, min(calc(2.3*var(--svw,1vw)), 3.6vh), 1.9rem)';
  const bubble = phase === 'ask'
    ? (said >= 0 ? (state.yes ? scene.questions[said]?.yes : scene.questions[said]?.no) : said === -2 ? gwRight(scene.monsters[secret].name) : GW_ASK)
    : (picked < 0 ? GW_HIDE : hq >= 0 ? scene.hideAsks[hq]?.ask : guess >= 0 ? gwGuess(scene.monsters[guess]?.name ?? '') : done ? GW_GOT_IT : '…');

  return (
    <div className="absolute inset-0 select-none overflow-hidden" style={{ background: '#2E1065' }}>
      <CalmBg img={scene.bg} />
      {done && <Confetti count={90} />}
      <Bursts items={bursts} />
      <FloatText show={star} x={35} y={30}>+⭐</FloatText>

      <div className="pointer-events-none absolute inset-x-0 top-[2.5%] z-30 flex justify-center px-16">
        <span className="rounded-full bg-violet-900/70 px-6 py-1.5 text-center font-black text-white shadow-xl backdrop-blur-sm" style={{ ...THICK_WORDS, fontSize: big }}>
          {done ? scene.doneLine : phase === 'ask' ? `🕵️ ${scene.title} · You ask!` : `🤫 ${scene.title} · You hide!`}
        </span>
      </div>

      {/* the line-up board */}
      <div className="absolute z-10 rounded-[2.4vh] bg-amber-900/45 shadow-2xl ring-[0.5vh] ring-amber-200/60" style={{ left: '3.5%', width: '63%', top: '15%', height: '80%' }} />
      {scene.monsters.map((m, k) => {
        const closed = isDown(k);
        const mine = phase === 'hide' && picked === k;
        return (
          <motion.button key={k} type="button" aria-label={m.name}
            onClick={() => (phase === 'ask' ? tapCardAsk(k) : pick(k))}
            className={`absolute z-20 overflow-hidden rounded-[1.6vh] border-[0.45vh] shadow-xl ${mine ? 'border-yellow-300 ring-[0.6vh] ring-yellow-300' : 'border-amber-100'}`}
            style={{ left: `${cardX(k) - 7}%`, top: `${cardY(k) - 17}%`, width: '14%', height: '34%', background: 'linear-gradient(#EDE9FE, #C4B5FD)', perspective: 600 }}
            animate={miss === k && !reduce ? { x: [0, -8, 8, -5, 0] } : { x: 0 }}>
            <div className="absolute left-[14%] top-[7%] w-[72%]" style={{ aspectRatio: '1 / 1' }}>
              <MonsterFigure kit={kit} eyes={m.eyes} horns={m.horns} mouth={m.mouth} wears={m.wears} hue={m.hue} />
            </div>
            <span className="absolute bottom-[3%] left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/90 px-[0.6vw] text-center font-black text-violet-900 shadow" style={{ fontSize: 'min(2.3vh,1.5vw)' }}>{m.name}</span>
            {/* the door that closes */}
            <motion.div className="absolute inset-0 origin-bottom rounded-[1.2vh]" initial={false}
              animate={{ rotateX: closed ? 0 : -92, opacity: closed ? 1 : 0 }} transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              style={{ background: 'repeating-linear-gradient(90deg,#92400E 0 12%,#A16207 12% 24%)', boxShadow: 'inset 0 0 0 0.5vh #78350F' }}>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[min(5vh,3.2vw)]">🚪</span>
            </motion.div>
            {mine && <span className="absolute start-[4%] top-[3%] rounded-full bg-yellow-300 px-2 font-black text-violet-900" style={{ fontSize: 'min(1.8vh,1.2vw)' }}>🤫 mine</span>}
          </motion.button>
        );
      })}

      {/* the friend's speech bubble, then the question chips under it */}
      <div className="absolute z-30 flex flex-col gap-[1vh]" style={{ left: '69%', right: '2.5%', top: '15%', bottom: '4%' }}>
        <div className="shrink-0 rounded-[2vh] border-[0.4vh] border-violet-300 bg-white/95 px-[1.2vw] py-[1vh] text-center shadow-2xl">
          <p className="font-black leading-snug text-violet-950" style={{ fontSize: 'min(2.8vh,1.8vw)' }}>{bubble}</p>
          {bubble && <button type="button" onClick={() => cueSpeak(bubble, voiceOf(scene.who))} className="mt-[0.6vh] rounded-full bg-violet-600 px-3 py-0.5 font-black text-white shadow" style={{ fontSize: 'min(2vh,1.3vw)' }}>🔊</button>}
        </div>
        {phase === 'ask' && !solved && (
          <div className="flex min-h-0 flex-col gap-[0.9vh] overflow-y-auto pe-1">
            {scene.questions.map((q, i) => {
              const used = asked.includes(i);
              return (
                <button key={i} type="button" disabled={used} onClick={() => askQ(i)}
                  className={`shrink-0 rounded-full border-[0.35vh] px-[0.9vw] py-[0.7vh] text-start font-black shadow-md ${used ? 'border-violet-200 bg-violet-200/70 text-violet-400 line-through' : 'border-white bg-violet-600 text-white hover:bg-violet-500'}`}
                  style={{ fontSize: 'min(2.2vh,1.45vw)', minHeight: 40 }}>
                  🗣️ {q.ask}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {phase === 'ask' && solved && (
        <button type="button" onClick={() => setState((s) => ({ ...s, phase: 'hide', said: -1, miss: -1 }))}
          className={`${CLAY_BUTTON} absolute z-40 px-6 py-3`} style={{ left: '70%', right: '3%', top: '45%', fontSize: 'min(2.8vh,1.8vw)' }}>
          🤫 Now you hide one!
        </button>
      )}

      {/* part 2: Yes / No */}
      {phase === 'hide' && picked >= 0 && !done && (hq >= 0 || guess >= 0) && (
        <div className="absolute z-40 flex gap-[1vw]" style={{ left: '70%', right: '3%', top: '45%' }}>
          {[true, false].map((y) => (
            <motion.button key={String(y)} type="button" onClick={() => answer(y)}
              animate={miss >= 100 && !reduce ? { x: [0, -6, 6, 0] } : { x: 0 }}
              className={`flex-1 rounded-[2vh] border-[0.45vh] border-white py-[2vh] font-black text-white shadow-xl ${y ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ fontSize: 'min(3.4vh,2.2vw)' }}>
              {y ? '✅ Yes!' : '❌ No!'}
            </motion.button>
          ))}
        </div>
      )}
      {phase === 'hide' && picked >= 0 && !done && (
        <p className="absolute z-30 text-center font-bold text-white drop-shadow" style={{ left: '69%', right: '2.5%', top: '62%', fontSize: 'min(2.1vh,1.4vw)' }}>
          Say Yes or No — then the whole sentence: “Yes! My monster has got…”
        </p>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[4%] z-40 px-10 py-3 text-xl`} style={{ left: '74%' }}>Next ⭐</button>}
    </div>
  );
}
