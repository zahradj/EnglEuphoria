import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { CalmBg, Bursts, FloatText, useBursts } from '../../unit1/scene-components/gameFx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { BUILDER_WRONG, builderHint } from './monsterRules';

/* ---------- Monster Builder ★ (docs/a1-unit-5-monster-town.md §5.2, "Face Builder") ----------
 * A blank monster body in Bibi's living room. The child hears "She's got three eyes and long horns." and builds it:
 * tap the eye tray (1, 2, 3), a horns card and a mouth card — each part pops onto the body. Then CHECK: if a part does
 * not match the sentence, that tray wiggles and the sentence part is named again ("Look: three eyes!"). Right → the
 * monster comes alive (a hop, sparkles) and gets its name, then the child says the sentence. Mechanics: Twee "Describe
 * the monster", Twinkl have got / has got monster game, eslactive Create A Monster (listen, draw what you hear).
 * Better: the parts are real pictures that snap on, the check names exactly which detail was missed, and every
 * finished monster joins a line-up that the child describes at the end. */

type Builder = Extract<Scene, { kind: 'monster-builder' }>;

const EYE_SPOTS: Record<1 | 2 | 3, number[]> = { 1: [50], 2: [38, 62], 3: [30, 50, 70] };

export function MonsterBuilderScene({ scene, onNext, onWin, onLose, sync }: { scene: Builder; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { r: 0, eyes: 0, horns: -1, mouth: -1, wrong: '', ok: false, done: false });
  const total = scene.rounds.length;
  const r = Math.max(0, Math.min(total - 1, Number(state.r) || 0));
  const round = scene.rounds[r];
  const eyes = Math.max(0, Math.min(3, Number(state.eyes) || 0)) as 0 | 1 | 2 | 3;
  const horns = Number(state.horns);
  const mouth = Number(state.mouth);
  const wrong = String(state.wrong);
  const ok = !!state.ok;
  const done = !!state.done;
  const [bursts, fire] = useBursts();
  const [star, setStar] = useState(false);
  const gemDone = useRef(false);

  useEffect(() => {
    if (done || !round) return;
    const t = window.setTimeout(() => cueSpeak(round.line, voiceOf(scene.who)), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
  if (!round) return null;

  const set = (patch: Partial<{ eyes: number; horns: number; mouth: number }>) => { if (ok || done) return; sfx.pop(); setState((s) => ({ ...s, ...patch, wrong: '' })); };
  const check = () => {
    if (ok || done) return;
    const miss = eyes !== round.eyes ? 'eyes' : horns !== round.horns ? 'horns' : mouth !== round.mouth ? 'mouth' : '';
    if (miss) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: miss }));
      cueSpeak(`${BUILDER_WRONG} ${builderHint(miss as 'eyes' | 'horns' | 'mouth', round.eyes, scene.horns[round.horns]?.label ?? '', scene.mouths[round.mouth]?.label ?? '')}`, voiceOf(scene.who));
      return;
    }
    sfx.gem(); fire(50, 45, 'stars'); setStar(true); window.setTimeout(() => setStar(false), 900);
    setState((s) => ({ ...s, ok: true, wrong: '' }));
    window.setTimeout(() => cueSpeak(`This is ${round.name}! ${round.line}`, 'teacher'), 500);
  };
  const next = () => setState((s) => {
    const n = (Number(s.r) || 0) + 1;
    return n >= total ? { ...s, done: true } : { ...s, r: n, eyes: 0, horns: -1, mouth: -1, ok: false, wrong: '' };
  });

  const wob = (k: string) => (wrong === k && !reduce ? { x: [0, -10, 10, -6, 0] } : {});
  const big = 'clamp(1rem, min(calc(2.3*var(--svw,1vw)), 3.6vh), 1.9rem)';
  const card = 'flex items-center justify-center rounded-[1.8vh] border-[0.45vh] bg-white/95 shadow-lg';
  return (
    <div className="absolute inset-0 select-none overflow-hidden" style={{ background: '#2E1065' }}>
      <CalmBg img={scene.bg} />
      {done && <Confetti count={100} />}
      <Bursts items={bursts} />
      <FloatText show={star} x={50} y={30}>+⭐</FloatText>

      <div className="pointer-events-none absolute inset-x-0 top-[3%] z-30 flex justify-center px-16">
        <span className="rounded-full bg-violet-900/70 px-6 py-1.5 text-center font-black text-white shadow-xl backdrop-blur-sm" style={{ ...THICK_WORDS, fontSize: big }}>
          {done ? scene.doneLine : `🧩 ${scene.title}`}
        </span>
      </div>
      {!done && (
        <div className="absolute inset-x-0 top-[12%] z-30 flex justify-center">
          <button type="button" onClick={() => cueSpeak(round.line, voiceOf(scene.who))}
            className="rounded-full border-[0.4vh] border-white bg-amber-50 px-5 py-1.5 font-black text-violet-800 shadow-xl" style={{ fontSize: 'min(3.3vh,2.2vw)' }}>
            🔊 {round.line}
          </button>
        </div>
      )}
      <span className="absolute end-3 top-[3%] z-30 rounded-full bg-white/90 px-3 py-1 font-black text-violet-700 shadow" style={{ fontSize: 'min(2.6vh,1.8vw)' }}>{done ? total : r + 1}/{total}</span>

      {/* the monster in the middle: body + snapped parts */}
      {!done && (
        <motion.div className="absolute left-1/2 top-[22%] z-20 -translate-x-1/2" style={{ width: 'min(56vh,36vw)', aspectRatio: '1 / 1' }}
          animate={ok && !reduce ? { y: [0, -30, 0, -14, 0] } : {}} transition={{ duration: 0.9 }}>
          <AnimatePresence>
            {horns >= 0 && scene.horns[horns] && (
              <motion.img key={`h${horns}`} src={scene.horns[horns].img} alt="" draggable={false}
                initial={reduce ? false : { y: -40, scale: 0.6, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute left-[22%] w-[56%] object-contain" style={{ bottom: '74%' }} />
            )}
          </AnimatePresence>
          <img src={scene.body} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_14px_18px_rgba(30,10,60,0.45)]" />
          <AnimatePresence>
            {eyes > 0 && EYE_SPOTS[eyes as 1 | 2 | 3].map((x, i) => (
              <motion.img key={`e${eyes}-${i}`} src={scene.eye} alt="" draggable={false}
                initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 14, delay: i * 0.06 }}
                className="absolute w-[17%] -translate-x-1/2 object-contain" style={{ left: `${x}%`, top: '24%' }} />
            ))}
          </AnimatePresence>
          <AnimatePresence>
            {mouth >= 0 && scene.mouths[mouth] && (
              <motion.img key={`m${mouth}`} src={scene.mouths[mouth].img} alt="" draggable={false}
                initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ opacity: 0 }}
                className="absolute left-[33%] w-[34%] object-contain" style={{ top: '44%' }} />
            )}
          </AnimatePresence>
          {ok && <span className="absolute -bottom-[4%] left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-4 py-1 font-black text-white shadow-lg" style={{ fontSize: 'min(3vh,2vw)' }}>{round.name}</span>}
        </motion.div>
      )}

      {/* trays: eyes (left), horns + mouths (right) */}
      {!done && !ok && (
        <>
          <motion.div animate={wob('eyes')} className="absolute start-[3%] top-[24%] z-30 flex flex-col gap-[1.4vh] rounded-[2.4vh] bg-violet-900/55 p-[1.2vh] backdrop-blur-sm">
            <span className="text-center font-black text-white" style={{ fontSize: 'min(2.6vh,1.8vw)' }}>eyes</span>
            {([1, 2, 3] as const).map((n) => (
              <button key={n} type="button" onClick={() => set({ eyes: n })} aria-label={`${n} eyes`}
                className={`${card} gap-[0.3vw] px-[0.8vw] py-[0.8vh] ${eyes === n ? 'border-yellow-400 ring-[0.5vh] ring-yellow-300' : 'border-violet-200'}`}>
                {Array.from({ length: n }, (_, i) => <img key={i} src={scene.eye} alt="" draggable={false} className="h-[min(5vh,3.4vw)] w-auto" />)}
                <span className="ms-[0.3vw] font-black text-violet-800" style={{ fontSize: 'min(3vh,2vw)' }}>{n}</span>
              </button>
            ))}
          </motion.div>
          <div className="absolute end-[3%] top-[24%] z-30 flex flex-col gap-[1.2vh]">
            <motion.div animate={wob('horns')} className="flex flex-col gap-[1vh] rounded-[2.4vh] bg-teal-900/55 p-[1.1vh] backdrop-blur-sm">
              <span className="text-center font-black text-white" style={{ fontSize: 'min(2.6vh,1.8vw)' }}>horns</span>
              {scene.horns.map((h, i) => (
                <button key={h.label} type="button" onClick={() => set({ horns: i })} aria-label={h.label}
                  className={`${card} flex-col px-[0.8vw] py-[0.5vh] ${horns === i ? 'border-yellow-400 ring-[0.5vh] ring-yellow-300' : 'border-teal-200'}`}>
                  <img src={h.img} alt="" draggable={false} className="h-[min(6vh,4vw)] w-auto" />
                  <span className="font-black text-teal-800" style={{ fontSize: 'min(2.3vh,1.6vw)' }}>{h.label}</span>
                </button>
              ))}
            </motion.div>
            <motion.div animate={wob('mouth')} className="flex flex-col gap-[1vh] rounded-[2.4vh] bg-amber-900/55 p-[1.1vh] backdrop-blur-sm">
              <span className="text-center font-black text-white" style={{ fontSize: 'min(2.6vh,1.8vw)' }}>mouth</span>
              {scene.mouths.map((m, i) => (
                <button key={m.label} type="button" onClick={() => set({ mouth: i })} aria-label={m.label}
                  className={`${card} flex-col px-[0.8vw] py-[0.5vh] ${mouth === i ? 'border-yellow-400 ring-[0.5vh] ring-yellow-300' : 'border-amber-200'}`}>
                  <img src={m.img} alt="" draggable={false} className="h-[min(4.4vh,3vw)] w-auto" />
                  <span className="font-black text-amber-800" style={{ fontSize: 'min(2.3vh,1.6vw)' }}>{m.label}</span>
                </button>
              ))}
            </motion.div>
          </div>
          <button type="button" onClick={check} disabled={!eyes || horns < 0 || mouth < 0}
            className={`${CLAY_BUTTON} absolute bottom-[5%] left-1/2 z-30 -translate-x-1/2 px-10 py-3 disabled:opacity-40`} style={{ fontSize: 'min(3.2vh,2.2vw)' }}>
            ✅ Check!
          </button>
        </>
      )}
      {!done && ok && (
        <button type="button" onClick={next} className={`${CLAY_BUTTON} absolute bottom-[5%] left-1/2 z-30 -translate-x-1/2 px-10 py-3`} style={{ fontSize: 'min(3.2vh,2.2vw)' }}>
          🎤 I said it! Next monster
        </button>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
