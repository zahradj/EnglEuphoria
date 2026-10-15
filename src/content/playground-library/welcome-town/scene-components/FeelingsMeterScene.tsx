import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { CalmBg, Bursts, FloatText, useBursts } from '../../unit1/scene-components/gameFx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { METER_ASK, METER_WRONG } from './meterRules';
import { SKIN } from '../../gameSkin';

/* ---------- Feelings Meter ★ (A1 U5L5, docs/a1-unit-5-monster-town.md §5.5) ----------
 * The story as an emotion graph: Bibi's day from left to right (story pictures under the graph), her feelings from top
 * (feels best) to bottom (feels worst). For each moment the child looks at the picture, taps Bibi's face on the side, a
 * dot drops into the column and the line joins the dots; then the sentence with because is read and said
 * ("Bibi is scared because it is dark."). At the end the whole day is one line: down, down… and up!
 * Research (docs/research/playground-a1u5-research.md): Scholastic "Emotions graph", Tes "Character feelings line
 * graph", NZCER character ups-and-downs graph, British Library "Emotion timeline". Better: the faces are the story's
 * own stickers, every point is tied to its picture and its reason, and the child says each sentence. */

type Meter = Extract<Scene, { kind: 'feelings-meter' }>;

/** Graph box (% of the stage). */
const G = { left: 16, right: 95, top: 16, bottom: 66 };

export function FeelingsMeterScene({ scene, onNext, onWin, onLose, sync }: { scene: Meter; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { i: 0, miss: -1, done: false });
  const total = scene.points.length;
  const rows = scene.feelings.length;
  const i = Math.max(0, Math.min(total, Number(state.i) || 0));
  const miss = Number(state.miss);
  const done = !!state.done;
  const point = i < total ? scene.points[i] : undefined;
  const [bursts, fire] = useBursts();
  const [star, setStar] = useState(false);
  const gemDone = useRef(false);

  useEffect(() => {
    if (done || !point) return;
    const t = window.setTimeout(() => cueSpeak(METER_ASK, voiceOf(scene.who)), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const colX = (k: number) => G.left + ((k + 0.5) * (G.right - G.left)) / Math.max(1, total);
  const rowY = (r: number) => G.top + ((r + 0.5) * (G.bottom - G.top)) / Math.max(1, rows);

  const tapFace = (r: number) => {
    if (!point || done) return;
    if (r !== point.feeling) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, miss: r }));
      cueSpeak(METER_WRONG, voiceOf(scene.who));
      return;
    }
    sfx.gem(); fire(colX(i), rowY(r), 'stars'); setStar(true); window.setTimeout(() => setStar(false), 900);
    cueSpeak(point.line, 'teacher');
    setState((s) => ({ ...s, i: (Number(s.i) || 0) + 1, miss: -1 }));
  };

  const placed = scene.points.slice(0, i);
  const big = 'clamp(1rem, min(calc(2.3*var(--svw,1vw)), 3.6vh), 1.9rem)';
  const last = i > 0 ? scene.points[i - 1] : undefined;
  return (
    <div className="absolute inset-0 select-none overflow-hidden" style={{ background: '#2E1065' }}>
      <CalmBg img={scene.bg} />
      {done && <Confetti count={90} />}
      <Bursts items={bursts} />
      <FloatText show={star} x={50} y={30}>+⭐</FloatText>

      <div className="pointer-events-none absolute inset-x-0 top-[2.5%] z-30 flex justify-center px-16">
        <span className={`px-6 py-1.5 text-center ${SKIN.pill}`} style={{ fontSize: big }}>
          {done ? scene.doneLine : `📈 ${scene.title}`}
        </span>
      </div>

      {/* the graph card */}
      <div className={`absolute z-10 ${SKIN.panel}`} style={{ left: '3%', right: '3%', top: `${G.top - 4}%`, bottom: `${100 - G.bottom - 4}%` }} />
      {/* row guide lines */}
      {scene.feelings.map((_, r) => (
        <div key={`g${r}`} className="absolute z-10 border-t-2 border-dashed border-sky-200" style={{ left: `${G.left}%`, right: `${100 - G.right}%`, top: `${rowY(r)}%` }} />
      ))}
      {/* the faces on the side: tap one */}
      {scene.feelings.map((f, r) => (
        <motion.button key={f.label} type="button" onClick={() => tapFace(r)} aria-label={f.label} disabled={done}
          animate={miss === r && !reduce ? { x: [0, -8, 8, -5, 0] } : { x: 0 }}
          className="absolute z-30 flex items-center gap-[0.4vw] rounded-full border-[0.35vh] border-[#FDE3B0] bg-gradient-to-b from-[#FFFFFF] to-[#FEF6DA] px-[0.6vw] py-[0.2vh] shadow-[0_0.5vh_0_#F3C474,0_1vh_1.6vh_rgba(60,30,10,0.25)] hover:ring-[0.4vh] hover:ring-[#FDE68A]"
          style={{ left: '3.6%', top: `${rowY(r)}%`, y: '-50%', width: '11.5%', minHeight: 40 }}>
          <img src={f.img} alt="" draggable={false} className="h-[min(5.4vh,3.6vw)] w-auto object-contain" />
          <span className="truncate font-black text-[#2A1A05]" style={{ fontSize: 'min(2.1vh,1.4vw)' }}>{f.label}</span>
        </motion.button>
      ))}
      {/* the line and the dots */}
      <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {placed.length > 1 && (
          <motion.polyline points={placed.map((p, k) => `${colX(k)},${rowY(p.feeling)}`).join(' ')} fill="none" stroke="#0EA5E9" strokeWidth={0.7} strokeLinejoin="round" strokeLinecap="round"
            vectorEffect="non-scaling-stroke" style={{ strokeWidth: 6 }} initial={false} />
        )}
      </svg>
      {placed.map((p, k) => (
        <div key={`d${k}`} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${colX(k)}%`, top: `${rowY(p.feeling)}%`, width: 'min(6.4vh,4.2vw)', height: 'min(6.4vh,4.2vw)' }}>
          <motion.img src={scene.feelings[p.feeling]?.img} alt="" draggable={false}
            initial={reduce ? false : { scale: 0, y: -30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 14 }}
            className="h-full w-full rounded-full border-[0.4vh] border-white bg-sky-100 object-contain shadow-lg" />
        </div>
      ))}
      {/* the current column glows */}
      {point && <div className="pointer-events-none absolute z-10 rounded-[1.4vh] bg-yellow-300/30 ring-[0.4vh] ring-yellow-300" style={{ left: `${colX(i) - (G.right - G.left) / total / 2 + 0.4}%`, width: `${(G.right - G.left) / total - 0.8}%`, top: `${G.top - 2}%`, bottom: `${100 - G.bottom - 2}%` }} />}

      {/* the story moments under the graph */}
      {scene.points.map((p, k) => (
        <div key={`p${k}`} className={`absolute z-20 -translate-x-1/2 overflow-hidden rounded-[1.2vh] border-[0.4vh] shadow-lg ${k === i ? 'border-yellow-300 ring-[0.5vh] ring-yellow-300' : k < i ? 'border-white' : 'border-white/60 opacity-70'}`}
          style={{ left: `${colX(k)}%`, top: `${G.bottom + 6}%`, width: `${Math.min(13, (G.right - G.left) / total - 1)}%`, aspectRatio: '16 / 9' }}>
          <img src={p.img} alt="" draggable={false} className="h-full w-full object-cover" />
        </div>
      ))}

      {/* the sentence of the last point */}
      {!done && last && (
        <div className="absolute inset-x-0 bottom-[3%] z-30 flex justify-center">
          <button type="button" onClick={() => cueSpeak(last.line, 'teacher')} className="rounded-full border-[0.35vh] border-[#BAE6FD] bg-gradient-to-b from-[#38BDF8] to-[#0EA5E9] px-5 py-1.5 font-black text-white shadow-[0_0.6vh_0_#0369A1,0_1.2vh_2vh_rgba(60,30,10,0.35)]" style={{ fontSize: 'min(2.8vh,1.9vw)' }}>
            🎤 Say it: {last.line}
          </button>
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[3%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
      {!done && i >= total && (
        <button type="button" onClick={() => setState((s) => ({ ...s, done: true }))} className={`${CLAY_BUTTON} absolute bottom-[12%] left-1/2 z-40 -translate-x-1/2 px-10 py-3`} style={{ fontSize: 'min(3vh,2vw)' }}>
          ✅ Bibi’s whole day!
        </button>
      )}
    </div>
  );
}
