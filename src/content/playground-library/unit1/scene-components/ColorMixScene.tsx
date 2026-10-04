import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Magic Paint Pots (Pre-A1 Unit 2 Lesson 2 signature game) ----------
 * Lesson 1's colours make Lesson 2's: Pip names two paints ("Mix blue and
 * yellow!"), the child taps those two paints — they pour into a big glass
 * bowl as two separate blobs — then the child STIRS (draws circles in the
 * bowl, or taps the big spoon button): the two colours swirl together and
 * slowly turn into the new one (owner 2026-10-04: "the mixing is not
 * working… add a stir"). Then "What color is it?" — the child names it, which
 * brings that round's grey object to life in its colour. The new word is what
 * wins the round, so the language IS the game. Lingokids "Mixing Colors" /
 * preschool playdough & paint mixing: the mixing itself is the child's action. */

export function mixLine(a: string, b: string) {
  return `Mix ${a.toLowerCase()} and ${b.toLowerCase()}!`;
}
export const MIX_QUESTION = 'What color is it?';
export const STIR_LINE = 'Stir, stir, stir!';
export function resultLine(color: string) {
  return `It's ${color.toLowerCase()}!`;
}

type Phase = 'pick' | 'stir' | 'name' | 'reveal';
const STIR_TAP = 20; // % per tap on the spoon button
const STIR_TURN = 40; // % per full circle drawn in the bowl

export function ColorMixScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'color-mix' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    picked: [] as string[],
    phase: 'pick' as Phase,
    stir: 0, // 0..100
    wrong: '',
    gemDone: false,
  });
  const { round, picked, phase, stir, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const pickedSet = useMemo(() => new Set(picked), [picked]);
  const paintHex = (w: string) => scene.paints.find((p) => p.colorWord === w)?.colorHex ?? '#ccc';
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const bowlRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ angle: number; acc: number } | null>(null);
  const [spoon, setSpoon] = useState<{ x: number; y: number } | null>(null);
  const finishing = useRef(false);

  // Each round opens with Pip naming the two paints to mix.
  useEffect(() => {
    if (!r) return;
    finishing.current = false;
    setState((s) => ({ ...s, picked: [], phase: 'pick', stir: 0, wrong: '' }));
    const t = window.setTimeout(() => cueSpeak(mixLine(r.a, r.b), scene.who), 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const tapPaint = async (w: string) => {
    if (!r || phase !== 'pick' || pickedSet.has(w)) return;
    if (w !== r.a && w !== r.b) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: w }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
      return;
    }
    sfx.pop();
    const next = [...picked, w];
    setState((s) => ({ ...s, picked: next }));
    if (next.length === 2) {
      window.setTimeout(() => {
        setState((s) => ({ ...s, phase: 'stir' }));
        void sayWithin(STIR_LINE, scene.who, 2500);
      }, 700);
    }
  };

  const addStir = (amount: number) => {
    if (!r || phase !== 'stir' || finishing.current) return;
    setState((s) => ({ ...s, stir: Math.min(100, s.stir + amount) }));
  };
  // Fully stirred → the new colour is ready → "What color is it?"
  useEffect(() => {
    if (!r || phase !== 'stir' || stir < 100 || finishing.current) return;
    finishing.current = true;
    sfx.reveal(); fire(40, 45, 'sparkle');
    const t = window.setTimeout(() => {
      setState((s) => ({ ...s, phase: 'name' }));
      void sayWithin(MIX_QUESTION, scene.who);
    }, 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stir, phase]);

  // Drawing circles in the bowl stirs: the angle travelled around the bowl's centre counts.
  const angleAt = (e: React.PointerEvent) => {
    const b = bowlRef.current?.getBoundingClientRect();
    if (!b) return 0;
    return Math.atan2(e.clientY - (b.top + b.height / 2), e.clientX - (b.left + b.width / 2));
  };
  const onDown = (e: React.PointerEvent) => {
    if (phase !== 'stir') return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { angle: angleAt(e), acc: 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    const b = bowlRef.current?.getBoundingClientRect();
    if (b && phase === 'stir') setSpoon({ x: e.clientX - b.left, y: e.clientY - b.top });
    if (!drag.current || phase !== 'stir') return;
    const a = angleAt(e);
    let d = a - drag.current.angle;
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    drag.current.angle = a;
    drag.current.acc += Math.abs(d);
    // Push to the shared state in steps of ~5 % (keeps the live-class sync light).
    const step = (drag.current.acc / (2 * Math.PI)) * STIR_TURN;
    if (step >= 5) { drag.current.acc = 0; sfx.pop(); addStir(step); }
  };
  const onUp = () => { drag.current = null; };

  const tapName = async (w: string) => {
    if (!r || phase !== 'name') return;
    if (w !== r.result) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: w }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
      return;
    }
    sfx.match(); fire(80, 40, 'stars');
    setState((s) => ({ ...s, phase: 'reveal' }));
    await sayWithin(resultLine(r.result), scene.who);
    await sayWithin(r.line, r.who);
    await new Promise((res) => setTimeout(res, 700));
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
  };

  if (!r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex gap-4">
            {scene.rounds.map((x) => (
              <img key={x.result} src={x.img} alt={x.label} className="h-[20vh] w-auto drop-shadow-xl" draggable={false} />
            ))}
          </div>
          <div className="rounded-3xl bg-white px-8 py-3 text-2xl font-black text-orange-600 shadow-2xl">{'\u{1F3A8}'} You made green, orange and purple!</div>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-4 text-xl`}>Next {'\u{2B50}'}</button>
        </div>
      </div>
    );
  }

  const c = CAST[r.who];
  const a = picked[0] ? paintHex(picked[0]) : undefined;
  const b = picked[1] ? paintHex(picked[1]) : undefined;
  const mixedOpacity = phase === 'name' || phase === 'reveal' ? 1 : phase === 'stir' ? Math.min(1, stir / 100) : 0;
  const swirl = phase === 'stir' ? stir * 9 : 0; // degrees: the two colours turn as you stir

  return (
    <motion.div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/25" />

      {/* Prompt */}
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {phase === 'pick' ? `\u{1F3A8} ${mixLine(r.a, r.b)}` : phase === 'stir' ? `\u{1F944} ${STIR_LINE} Draw circles in the bowl!` : phase === 'name' ? `\u{1F5E3}️ ${MIX_QUESTION} Say it, then tap it!` : `\u{2728} ${resultLine(r.result)}`}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(phase === 'name' ? MIX_QUESTION : phase === 'stir' ? STIR_LINE : mixLine(r.a, r.b), scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">{'\u{1F50A}'} Again</button>

      {/* The object for this round: grey until its colour is named. */}
      <div className="absolute right-[5%] top-[18%] z-20 flex flex-col items-center">
        <img
          src={r.img}
          alt={r.label}
          className={`h-[28vh] w-auto drop-shadow-2xl transition-all duration-700 ${phase === 'reveal' ? 'animate-[lep1-pop_0.5s_ease-out]' : ''}`}
          style={{ filter: phase === 'reveal' ? 'none' : 'grayscale(1) brightness(1.1) opacity(0.85)' }}
          draggable={false}
        />
        {phase === 'reveal' && (
          <div className="mt-2 rounded-2xl bg-white px-4 py-2 text-xl font-black shadow-xl" style={{ color: c.color }}>{r.line}</div>
        )}
      </div>

      {/* The big glass bowl: paint pours in as two blobs, stirring swirls them into the new colour. */}
      <div
        ref={bowlRef}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={() => { onUp(); setSpoon(null); }}
        className="absolute left-[40%] top-[18%] z-20 -translate-x-1/2 touch-none rounded-full"
        style={{ width: '46vh', height: '46vh', cursor: phase === 'stir' ? 'grab' : 'default',
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(225,240,255,0.85) 55%, rgba(190,215,240,0.9))',
          boxShadow: 'inset 0 0 0 10px rgba(255,255,255,0.9), inset 0 -14px 30px rgba(0,0,0,0.12), 0 18px 40px rgba(40,30,20,0.35)' }}
      >
        <div className="absolute inset-[12%] overflow-hidden rounded-full">
          {/* Two colours, side by side, turning as you stir. */}
          <motion.div className="absolute inset-0" animate={{ rotate: swirl }} transition={{ type: 'spring', stiffness: 60, damping: 14 }}
            style={{ background: a && b ? `conic-gradient(${a} 0 25%, ${b} 0 50%, ${a} 0 75%, ${b} 0 100%)` : a ? `linear-gradient(90deg, ${a} 50%, transparent 50%)` : 'transparent' }} />
          {/* The new colour fades in as the stirring goes on. */}
          <div className="absolute inset-0 transition-opacity duration-300" style={{ backgroundColor: r.resultHex, opacity: mixedOpacity }} />
          <div className="pointer-events-none absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55), transparent 40%)' }} />
        </div>
        {/* Pour drops: the paint just picked falls into the bowl. */}
        {phase === 'pick' && picked.map((w, k) => (
          <motion.span key={w} className="absolute left-1/2 top-0 block h-[6vh] w-[6vh] rounded-full" style={{ backgroundColor: paintHex(w), translateX: k ? '20%' : '-120%' }}
            initial={{ y: -80, opacity: 1 }} animate={{ y: 120, opacity: 0 }} transition={{ duration: 0.6 }} />
        ))}
        {/* Stir progress ring + the spoon following the finger. */}
        {phase === 'stir' && (
          <svg className="pointer-events-none absolute inset-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="3" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="#FE6A2F" strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={`${(stir / 100) * 301.6} 301.6`} transform="rotate(-90 50 50)" />
          </svg>
        )}
        {phase === 'stir' && (
          <motion.span className="pointer-events-none absolute text-[9vh]" style={{ left: spoon ? spoon.x - 20 : '58%', top: spoon ? spoon.y - 70 : '18%' }}
            animate={spoon ? { rotate: 0 } : { rotate: [0, 25, -10, 0], x: [0, 30, 0, -30, 0], y: [0, 20, 40, 20, 0] }}
            transition={spoon ? { duration: 0.1 } : { duration: 2, repeat: Infinity }}>
            {'\u{1F944}'}
          </motion.span>
        )}
      </div>

      {/* Paints (Lesson 1 colours), the stir button, or the colour-name answers */}
      <div className="absolute inset-x-0 bottom-[5%] z-30 flex flex-wrap justify-center gap-4 px-4">
        {phase === 'pick'
          ? scene.paints.map((p) => (
              <button
                key={p.colorWord}
                onClick={() => tapPaint(p.colorWord)}
                className={`flex min-h-[64px] flex-col items-center rounded-3xl border-4 bg-white px-5 py-2 shadow-2xl transition active:scale-95 ${pickedSet.has(p.colorWord) ? 'opacity-40' : ''} ${wrong === p.colorWord ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : 'border-white'}`}
              >
                <span className="block h-12 w-12 rounded-full border-4 border-white shadow-inner" style={{ backgroundColor: p.colorHex }} />
                <span className="mt-1 text-lg font-black text-neutral-800">{p.colorWord.toLowerCase()}</span>
              </button>
            ))
          : phase === 'stir'
            ? (
              <motion.button onClick={() => { sfx.pop(); addStir(STIR_TAP); }} className={`${CLAY_BUTTON} px-10 py-4 text-2xl`} animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.1, repeat: Infinity }}>
                {'\u{1F944}'} Stir!
              </motion.button>
            )
            : phase === 'name'
              ? scene.answers.map((ans) => (
                  <button
                    key={ans.colorWord}
                    onClick={() => tapName(ans.colorWord)}
                    className={`min-h-[64px] rounded-3xl border-4 px-7 py-3 text-2xl font-black text-white shadow-2xl transition active:scale-95 ${wrong === ans.colorWord ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : 'border-white'}`}
                    style={{ backgroundColor: ans.colorHex }}
                  >
                    {ans.colorWord.toLowerCase()}
                  </button>
                ))
              : null}
      </div>
      <Bursts items={bursts} />
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function colorMixLines(scene: Extract<Scene, { kind: 'color-mix' }>) {
  return scene.rounds.flatMap((r) => [
    [scene.who, mixLine(r.a, r.b)],
    [scene.who, resultLine(r.result)],
    [r.who, r.line],
  ]).concat([[scene.who, MIX_QUESTION], [scene.who, STIR_LINE]]);
}
