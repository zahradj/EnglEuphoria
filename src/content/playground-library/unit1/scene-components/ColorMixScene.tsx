import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Magic Paint Pots (Pre-A1 Unit 2 Lesson 2 signature game) ----------
 * The child does what the friend just did in the Magic Mix film, step by step
 * and with the film's own words (docs/scenarios/u2l2-magic-mix.md):
 *   1. Pip: "Mix blue and yellow!" — the child taps the BLUE jar: it tips and
 *      pours into the glass bowl ("Blue!"), then the YELLOW jar ("And yellow!").
 *      The second paint lies on top of the first, as in the film.
 *   2. "Stir, stir, stir!" — three stirs (tap the spoon button, or draw circles
 *      in the bowl): the two layers swirl and blend into the new colour.
 *   3. "What color is it?" — the child names it; the friend answers with the
 *      film's line ("It's green! Blue and yellow make green!") and the round's
 *      grey object comes to life in that colour.
 * Owner 2026-10-04: page 8 "is not working" — the old version drew a pie-chart
 * bowl that ran off phone screens; this one is a flex layout that fits any
 * screen, with real jars, layers and a spoon. Lingokids "Mixing Colors" /
 * preschool paint mixing: the mixing itself is the child's action. */

export function mixLine(a: string, b: string) {
  return `Mix ${a.toLowerCase()} and ${b.toLowerCase()}!`;
}
export const MIX_QUESTION = 'What color is it?';
export const STIR_LINE = 'Stir, stir, stir!';
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
/** What the friend says as each jar pours (the film's lines). */
export function pourLine(color: string, second: boolean) {
  return second ? `And ${color.toLowerCase()}!` : `${cap(color)}!`;
}
/** The answer, word for word as in the film. */
export function resultLine(result: string, a: string, b: string) {
  return `It's ${result.toLowerCase()}! ${cap(a)} and ${b.toLowerCase()} make ${result.toLowerCase()}!`;
}

type Phase = 'pick' | 'stir' | 'name' | 'reveal';
const STIRS = 3; // "Stir, stir, stir!"
const DRAW_PER_STIR = 2 * Math.PI; // one circle drawn in the bowl = one stir

export function ColorMixScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'color-mix' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    picked: [] as string[],
    phase: 'pick' as Phase,
    stirs: 0, // 0..STIRS
    wrong: '',
    gemDone: false,
  });
  const { round, picked, phase, stirs, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const pickedSet = useMemo(() => new Set(picked), [picked]);
  const paintHex = (w: string) => scene.paints.find((p) => p.colorWord === w)?.colorHex ?? '#ccc';
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const bowlRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ angle: number; acc: number } | null>(null);
  const busy = useRef(false);

  // Each round opens with Pip naming the two paints to mix.
  useEffect(() => {
    if (!r) return;
    busy.current = false;
    setState((s) => ({ ...s, picked: [], phase: 'pick', stirs: 0, wrong: '' }));
    const t = window.setTimeout(() => cueSpeak(mixLine(r.a, r.b), scene.who), 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const tapJar = async (w: string) => {
    if (!r || phase !== 'pick' || pickedSet.has(w) || busy.current) return;
    if (w !== r.a && w !== r.b) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: w }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
      cueSpeak(mixLine(r.a, r.b), scene.who);
      return;
    }
    busy.current = true;
    sfx.pop();
    const second = picked.length === 1;
    setState((s) => ({ ...s, picked: [...s.picked, w] }));
    await sayWithin(pourLine(w, second), r.who, 2500);
    if (second) {
      setState((s) => ({ ...s, phase: 'stir' }));
      await sayWithin(STIR_LINE, r.who, 2500);
    }
    busy.current = false;
  };

  // One stir: the layers turn and blend a third of the way. The third stir finishes the colour.
  const stirOnce = () => {
    if (!r || phase !== 'stir' || stirs >= STIRS) return;
    sfx.pop();
    const next = stirs + 1;
    setState((s) => ({ ...s, stirs: next }));
    if (next >= STIRS) {
      sfx.reveal(); fire(50, 50, 'sparkle');
      window.setTimeout(() => {
        setState((s) => (s.phase === 'stir' ? { ...s, phase: 'name' } : s));
        void sayWithin(MIX_QUESTION, r.who);
      }, 900);
    }
  };

  // Drawing a circle in the bowl is a stir too.
  const angleAt = (e: React.PointerEvent) => {
    const b = bowlRef.current?.getBoundingClientRect();
    if (!b) return 0;
    return Math.atan2(e.clientY - (b.top + b.height / 2), e.clientX - (b.left + b.width / 2));
  };
  const onDown = (e: React.PointerEvent) => {
    if (phase !== 'stir') return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current = { angle: angleAt(e), acc: 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || phase !== 'stir') return;
    const a = angleAt(e);
    let d = a - drag.current.angle;
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    drag.current.angle = a;
    drag.current.acc += Math.abs(d);
    if (drag.current.acc >= DRAW_PER_STIR) { drag.current.acc = 0; stirOnce(); }
  };
  const onUp = () => { drag.current = null; };

  const tapName = async (w: string) => {
    if (!r || phase !== 'name' || busy.current) return;
    if (w !== r.result) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: w }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
      return;
    }
    busy.current = true;
    sfx.match(); fire(78, 40, 'stars');
    setState((s) => ({ ...s, phase: 'reveal' }));
    await sayWithin(resultLine(r.result, picked[0] ?? r.a, picked[1] ?? r.b), r.who);
    await sayWithin(r.line, r.who);
    await new Promise((res) => setTimeout(res, 700));
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
  };

  if (!r) {
    const made = scene.rounds.map((x) => x.result.toLowerCase());
    const list = made.length > 1 ? `${made.slice(0, -1).join(', ')} and ${made[made.length - 1]}` : made[0];
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center px-4 pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            {scene.rounds.map((x) => (
              <img key={x.result} src={x.img} alt={x.label} className="h-[20vh] w-auto drop-shadow-xl" draggable={false} />
            ))}
          </div>
          <div className="rounded-3xl bg-white px-6 py-3 text-xl font-black text-orange-600 shadow-2xl sm:text-2xl">{'\u{1F3A8}'} You made {list}!</div>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-4 text-xl`}>Next {'\u{2B50}'}</button>
        </div>
      </div>
    );
  }

  const c = CAST[r.who];
  const first = picked[0] ? paintHex(picked[0]) : undefined;
  const second = picked[1] ? paintHex(picked[1]) : undefined;
  const mixed = phase === 'name' || phase === 'reveal' ? 1 : phase === 'stir' ? stirs / STIRS : 0;
  const banner = phase === 'pick'
    ? `\u{1F3A8} ${mixLine(r.a, r.b)}`
    : phase === 'stir' ? `\u{1F944} ${STIR_LINE}` : phase === 'name' ? `\u{1F5E3}️ ${MIX_QUESTION}` : `\u{2728} It's ${r.result.toLowerCase()}!`;
  const again = () => cueSpeak(phase === 'name' ? MIX_QUESTION : phase === 'stir' ? STIR_LINE : mixLine(r.a, r.b), phase === 'pick' ? scene.who : r.who);

  return (
    <motion.div className="absolute inset-0 flex select-none flex-col overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-black/25" />

      {/* Prompt */}
      <div className="relative z-30 mt-3 flex items-start justify-center gap-2 px-3">
        <div className="max-w-[80%] rounded-full bg-white/95 px-5 py-2 text-center text-lg font-black text-orange-700 shadow-xl sm:text-2xl">
          {banner}
          <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
        </div>
        <button onClick={again} aria-label="Hear it again" className="shrink-0 rounded-full bg-white/95 px-3 py-2 text-base font-black text-orange-700 shadow-lg active:scale-95">{'\u{1F50A}'}</button>
      </div>

      {/* Bowl + the grey object that comes to life (row on wide screens, column on phones) */}
      <div className="relative z-20 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-3 sm:flex-row sm:gap-[6vw]">
        <div className="relative flex flex-col items-center">
          {/* Pour streams fall from above the bowl */}
          <div className="pointer-events-none relative h-[9vh] w-full">
            {phase === 'pick' && picked.map((w, k) => (
              <motion.span key={w} className="absolute bottom-0 left-1/2 w-[4vh] -translate-x-1/2 rounded-full shadow-md" style={{ backgroundColor: paintHex(w), marginLeft: k ? '2vh' : '-2vh' }}
                initial={{ height: 0, opacity: 1 }} animate={{ height: '9vh', opacity: [1, 1, 0] }} transition={{ duration: 1.1, times: [0, 0.7, 1] }} />
            ))}
          </div>
          <Bowl
            bowlRef={bowlRef}
            first={first} second={second} result={r.resultHex} mixed={mixed} stirs={stirs}
            stirring={phase === 'stir'}
            onDown={onDown} onMove={onMove} onUp={onUp}
          />
          {phase === 'stir' && (
            <div className="mt-2 flex gap-2" aria-label={`${stirs} of ${STIRS} stirs`}>
              {Array.from({ length: STIRS }, (_, k) => (
                <span key={k} className={`h-4 w-4 rounded-full border-2 border-white shadow ${k < stirs ? 'bg-orange-500' : 'bg-white/60'}`} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          <motion.img
            key={`${round}-${phase === 'reveal'}`}
            src={r.img}
            alt={r.label}
            className="h-[16vh] w-auto drop-shadow-2xl sm:h-[30vh]"
            style={{ filter: phase === 'reveal' ? 'none' : 'grayscale(1) brightness(1.1) opacity(0.85)' }}
            initial={phase === 'reveal' ? { scale: 0.6 } : false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 12 }}
            draggable={false}
          />
          {phase === 'reveal' && (
            <div className="mt-2 rounded-2xl bg-white px-4 py-2 text-lg font-black shadow-xl sm:text-xl" style={{ color: c.color }}>{r.line}</div>
          )}
        </div>
      </div>

      {/* Jars, the stir button, or the colour names */}
      <div className="relative z-30 mb-[11vh] flex flex-wrap items-end justify-center gap-3 px-3 sm:mb-[12vh] sm:gap-5">
        {phase === 'pick' && scene.paints.map((p) => (
          <Jar key={p.colorWord} word={p.colorWord} hex={p.colorHex} used={pickedSet.has(p.colorWord)} wrong={wrong === p.colorWord} onTap={() => tapJar(p.colorWord)} />
        ))}
        {phase === 'stir' && (
          <motion.button onClick={stirOnce} className={`${CLAY_BUTTON} px-10 py-4 text-2xl`} animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.1, repeat: Infinity }}>
            {'\u{1F944}'} Stir!
          </motion.button>
        )}
        {phase === 'name' && scene.answers.map((ans) => (
          <button
            key={ans.colorWord}
            onClick={() => tapName(ans.colorWord)}
            className={`min-h-[60px] rounded-3xl border-4 px-6 py-3 text-xl font-black text-white shadow-2xl transition active:scale-95 sm:text-2xl ${wrong === ans.colorWord ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : 'border-white'}`}
            style={{ backgroundColor: ans.colorHex, textShadow: '0 2px 3px rgba(0,0,0,0.35)' }}
          >
            {ans.colorWord.toLowerCase()}
          </button>
        ))}
      </div>
      <Bursts items={bursts} />
    </motion.div>
  );
}

/** A paint jar: tap it to pour. Tips over when used. */
function Jar({ word, hex, used, wrong, onTap }: { word: string; hex: string; used: boolean; wrong: boolean; onTap: () => void }) {
  return (
    <motion.button
      onClick={onTap}
      disabled={used}
      aria-label={`${word.toLowerCase()} paint`}
      className={`flex flex-col items-center rounded-3xl border-4 bg-white/95 px-3 pb-2 pt-3 shadow-2xl ${wrong ? 'border-red-400' : 'border-white'}`}
      animate={used ? { rotate: -35, y: -8, opacity: 0.55 } : wrong ? { x: [0, -10, 10, -6, 6, 0] } : { rotate: 0, y: 0, opacity: 1, x: 0 }}
      transition={{ duration: 0.45 }}
      whileTap={used ? undefined : { scale: 0.92 }}
    >
      <span className="relative block h-[9vh] max-h-20 min-h-12 w-[7vh] min-w-10 max-w-16">
        <span className="absolute inset-x-[8%] top-0 h-[18%] rounded-md bg-neutral-700" />
        <span className="absolute inset-x-0 bottom-0 top-[14%] rounded-xl border-2 border-white/70 shadow-inner" style={{ backgroundColor: hex }} />
        <span className="absolute left-[18%] top-[30%] h-[40%] w-[14%] rounded-full bg-white/40" />
      </span>
      <span className="mt-1 text-lg font-black text-neutral-800">{word.toLowerCase()}</span>
    </motion.button>
  );
}

/** The glass bowl: first paint at the bottom, second on top; stirring swirls them into the new colour. */
function Bowl({ bowlRef, first, second, result, mixed, stirs, stirring, onDown, onMove, onUp }: {
  bowlRef: React.RefObject<HTMLDivElement>; first?: string; second?: string; result: string; mixed: number; stirs: number; stirring: boolean;
  onDown: (e: React.PointerEvent) => void; onMove: (e: React.PointerEvent) => void; onUp: () => void;
}) {
  const level = second ? 62 : first ? 34 : 0; // % of the bowl filled
  return (
    <div
      ref={bowlRef}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp}
      className="relative touch-none"
      style={{ width: 'min(62vw, 46vh)', height: 'min(36vw, 27vh)', cursor: stirring ? 'grab' : 'default' }}
    >
      {/* Glass: a wide half-round bowl with a rim */}
      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '6% 6% 50% 50% / 8% 8% 100% 100%', background: 'linear-gradient(180deg, rgba(235,245,255,0.55), rgba(205,225,245,0.75))', boxShadow: 'inset 0 0 0 5px rgba(255,255,255,0.85), inset 0 -10px 24px rgba(0,0,0,0.12), 0 14px 30px rgba(40,30,20,0.35)' }}>
        {/* Paint: two layers that swirl as you stir */}
        <motion.div className="absolute inset-x-0 bottom-0 overflow-hidden" animate={{ height: `${level}%` }} transition={{ duration: 0.8 }}>
          {first && <div className="absolute inset-0" style={{ backgroundColor: first }} />}
          {second && (
            <motion.div className="absolute inset-x-0 top-0" style={{ backgroundColor: second, borderRadius: '0 0 40% 40% / 0 0 30% 30%' }}
              initial={{ height: '0%' }} animate={{ height: `${48 + stirs * 6}%`, skewX: stirring ? [0, 8, -8, 0] : 0 }} transition={{ duration: 0.9 }} />
          )}
          {/* Swirl streaks while stirring */}
          {stirring && first && second && (
            <motion.div className="absolute inset-[-50%]" style={{ background: `repeating-conic-gradient(from 0deg at 50% 50%, ${first} 0 30deg, ${second} 30deg 60deg)`, opacity: Math.min(0.7, stirs * 0.35) }}
              animate={{ rotate: stirs * 120 }} transition={{ type: 'spring', stiffness: 40, damping: 12 }} />
          )}
          {/* The new colour */}
          <div className="absolute inset-0 transition-opacity duration-700" style={{ backgroundColor: result, opacity: mixed }} />
        </motion.div>
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 28% 18%, rgba(255,255,255,0.6), transparent 45%)' }} />
      </div>
      {/* The wooden spoon stands in the bowl and circles with every stir */}
      {stirring && (
        <motion.div className="pointer-events-none absolute left-1/2 top-[-38%] h-[110%] w-[7%] origin-bottom"
          animate={{ rotate: [-14, 14, -14], x: ['-30%', '30%', '-30%'] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="mx-auto h-[78%] w-[45%] rounded-full bg-amber-700 shadow" />
          <div className="mx-auto -mt-[6%] h-[24%] w-full rounded-[50%] bg-amber-600 shadow-md" />
        </motion.div>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function colorMixLines(scene: Extract<Scene, { kind: 'color-mix' }>) {
  return scene.rounds.flatMap((r) => [
    [scene.who, mixLine(r.a, r.b)],
    [r.who, pourLine(r.a, false)], [r.who, pourLine(r.b, false)],
    [r.who, pourLine(r.a, true)], [r.who, pourLine(r.b, true)],
    [r.who, STIR_LINE],
    [r.who, MIX_QUESTION],
    [r.who, resultLine(r.result, r.a, r.b)],
    [r.who, resultLine(r.result, r.b, r.a)],
    [r.who, r.line],
  ]);
}
