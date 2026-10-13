import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { QuestionCard, voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS, useArtBox } from '../../unit1/scene-components/shared';

/* ---------- Build the Town (Blooket Factory / Crazy Kingdom, redesigned — docs/a1-activity-library.md §12) ----------
 * An empty place waits to be built. Every right answer drops the next piece — a house, a tree, a slide, a flag —
 * onto its glowing spot with a bounce and a puff of sparkles, and the friend names it ("A house!"). A wrong answer
 * only says "Try again!". At the end the whole place is built and the child shows it off. Mechanics: Blooket Factory /
 * Crazy Kingdom (answers build something that stays), city-builder games. Better: each piece is earned with English,
 * the place visibly grows, no resources to lose. */

type Builder = Extract<Scene, { kind: 'world-builder' }>;

export function WorldBuilderScene({ scene, onNext, onWin, onLose, sync }: { scene: Builder; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = Math.min(scene.rounds.length, scene.pieces.length);
  const [state, setState] = useSyncedState(sync, { built: 0, wrong: -1, done: false });
  const built = Math.max(0, Math.min(total, Number(state.built) || 0));
  const r = built < total ? scene.rounds[built] : undefined;
  const done = !!state.done;
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useArtBox(rootRef, 16 / 9);
  const gemDone = useRef(false);
  const busy = useRef(false);

  useEffect(() => {
    if (done || !r) return undefined;
    busy.current = false;
    const t = window.setTimeout(() => cueSpeak(r.ask, voiceOf(scene.who)), built === 0 ? 900 : 1500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [built, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const answer = (c: number) => {
    if (!r || busy.current || done) return;
    if (c !== r.answer) {
      sfx.wrong(); onLose();
      cueSpeak('Try again!', voiceOf(scene.who));
      setState((s) => ({ ...s, wrong: c }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    busy.current = true;
    sfx.match(); window.setTimeout(() => sfx.pop(), 350);
    const piece = scene.pieces[built];
    cueSpeak(`${r.choices[c]} ${piece ? `${/^[aeiou]/i.test(piece.label) ? 'An' : 'A'} ${piece.label}!` : ''}`, 'teacher');
    setState((s) => {
      const n = (Number(s.built) || 0) + 1;
      return { ...s, built: n, wrong: -1, done: n >= total };
    });
  };

  const next = built < total ? scene.pieces[built] : undefined;
  return (
    <div ref={rootRef} className="absolute inset-0 select-none overflow-hidden bg-[#7cb342]">
      <div className="absolute" style={{ width: box.width, height: box.height, left: box.left, top: box.top }}>
        <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
        {/* the next spot glows */}
        {next && !done && (
          <motion.div className="pointer-events-none absolute rounded-[50%] border-[0.5vh] border-dashed border-yellow-200 bg-yellow-200/25"
            style={{ left: `${next.x - next.size / 2}%`, top: `${next.y - next.size * 0.35}%`, width: `${next.size}%`, height: `${next.size * 0.7}%` }}
            animate={reduce ? {} : { opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }} />
        )}
        {/* built pieces */}
        {scene.pieces.slice(0, built).map((p, i) => (
          <div key={i} className="pointer-events-none absolute" style={{ left: `${p.x - p.size / 2}%`, top: 0, width: `${p.size}%`, height: `${p.y}%` }}>
            <motion.img src={p.img} alt={p.label} draggable={false} className="absolute bottom-0 left-0 w-full object-contain drop-shadow-[0_1vh_0.8vh_rgba(0,0,0,0.3)]"
              initial={reduce || i < built - 1 ? false : { y: -400, scaleY: 1 }} animate={{ y: 0, scaleY: [1, 0.85, 1.05, 1] }} transition={{ type: 'spring', stiffness: 220, damping: 14 }} />
          </div>
        ))}
      </div>
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🏗️ ${scene.title}`}
        </span>
      </div>
      {!done && <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-emerald-700 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>🧱 {built}/{total}</span>}
      {!done && r && (
        <QuestionCard className="absolute inset-x-[12%] bottom-[3%] z-40" ask={r.ask} choices={r.choices} img={r.img} wrong={Number(state.wrong)} onPick={answer} onHear={() => cueSpeak(r.ask, voiceOf(scene.who))} tone="emerald" />
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
