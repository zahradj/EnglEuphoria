import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Shoe Painter (Pre-A1 Unit 9 Lesson 5 "Pip's White Shoes", after the story film) ----------
 * Pip stands by a row of paint pots; a big round magnifier shows his shoes close up. Pip asks "Paint my
 * shoes red, please!"; the child taps the red pot: the pot tips (anticipation), a blob of paint flies in an
 * arc to the magnifier, hit-stop, SPLAT, and the shoes turn red — Pip hops and says the lesson sentence
 * "My shoes are red! I like my red shoes!". At the end a rain cloud washes them white again (like the story).
 * The colour is a multiply layer cut to the shape of the shoes (dressup/pip/shoes-white.png), so the outlines
 * stay. Sources (mechanic only): Toca Boca / Lingokids colouring play, Cambridge Pre A1 Starters "listen and
 * colour", the classroom "colour the shoes" worksheet. Better: the child hears the request and then the full
 * sentence about the result in Pip's voice; a wrong pot is named back, the right one glows after two tries.
 * Game feel: .claude/skills/game-animation. */

type Painter = Extract<Scene, { kind: 'shoe-painter' }>;
const D = '/lep1/dressup/pip';
const SHOES = `${D}/shoes-white.png`;
export const painterWrongLine = (word: string) => `No, not ${word}! Listen again.`;
const potX = (i: number, n: number) => 50 + (n === 1 ? 20 : (i * 40) / (n - 1));
const POT_Y = 84;
const LENS = { x: 70, y: 38 };

function PipLayers({ color, className = '' }: { color: string; className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <img src={CAST.pip.img} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" />
      <img src={`${D}/pants.png`} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" />
      <img src={`${D}/shirt.png`} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" />
      <img src={SHOES} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain" />
      {color !== '#ffffff' && (
        <motion.div key={color} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
          style={{ background: color, mixBlendMode: 'multiply', WebkitMaskImage: `url(${SHOES})`, maskImage: `url(${SHOES})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }} />
      )}
    </div>
  );
}

export function ShoePainterScene({ scene, onWin, onNext, sync }: { scene: Painter; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { round: 0, gemDone: false });
  const { round, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [nope, setNope] = useState(-1);
  const [tip, setTip] = useState(-1);
  const [blob, setBlob] = useState<{ i: number; key: number } | null>(null);
  const [splat, setSplat] = useState<string | null>(null);
  const [hop, setHop] = useState(0);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  // shoe colour: the colour of the last finished round (white at the start and after the rain)
  const doneColor = round > 0 && !done ? scene.paints[scene.rounds[round - 1].paint].hex : '#ffffff';
  const color = splat ?? doneColor;

  useEffect(() => {
    busy.current = false; setMisses(0); setSplat(null);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  useEffect(() => {
    if (!done) return;
    sfx.reveal(); fire(LENS.x, LENS.y, 'splash');
    void sayWithin(scene.doneLine, scene.who, 4000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pick = async (i: number) => {
    if (!r || busy.current) return;
    busy.current = true;
    const p = scene.paints[i];
    if (i !== r.paint) {
      sfx.wrong(); shake(); setNope(i); setMisses((m) => m + 1);
      await sayWithin(painterWrongLine(p.word), scene.who, 2400);
      setNope(-1); busy.current = false;
      return;
    }
    // anticipation: the pot tips back, then the paint flies
    setTip(i); sfx.whoop();
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 180));
    setBlob({ i, key: Date.now() });
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 560));
    setBlob(null); setTip(-1);
    // impact: hit-stop, splat, colour on
    setSplat(p.hex); sfx.pop();
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 90));
    sfx.match(); fire(LENS.x, LENS.y, 'sparkle'); fire(LENS.x, LENS.y, 'stars'); setHop((h) => h + 1);
    await sayWithin(r.reply, scene.who, 3600);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
  };

  const lensSize = 'min(36vh, 26vw)';
  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3.1*var(--svw,1vw)), 5.2vh), 2.6rem)' }}>
          {r ? `“${r.line}”` : scene.doneLine}
        </span>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-14 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* Pip, big, wearing the shoes */}
      <div className="absolute z-20" style={{ left: '27%', top: '58%', height: 'min(70vh, 46vw)', aspectRatio: '1 / 1', translate: '-50% -50%' }}>
        <motion.div className="absolute inset-0" style={{ transformOrigin: '50% 92%' }}
          animate={reduce ? {} : hop ? { y: ['0%', '-7%', '0%'], scaleY: [1, 1.06, 0.94, 1], scaleX: [1, 0.95, 1.05, 1] } : { y: ['0%', '-1.2%', '0%'] }}
          transition={hop ? { duration: 0.55 } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} key={hop}>
          <PipLayers color={color} className="drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]" />
        </motion.div>
      </div>

      {/* the magnifier: Pip's shoes close up */}
      <motion.div className="absolute z-20 overflow-hidden rounded-full border-[6px] border-white bg-sky-50 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        style={{ left: `${LENS.x}%`, top: `${LENS.y}%`, width: lensSize, height: lensSize, translate: '-50% -50%' }}
        animate={reduce ? {} : splat ? { scale: [1, 1.12, 0.96, 1] } : { scale: 1 }} transition={{ duration: 0.45 }} key={`lens-${color}`}>
        <div className="absolute" style={{ width: '280%', height: '280%', left: '-81.6%', top: '-191.4%' }}>
          <PipLayers color={color} />
        </div>
      </motion.div>
      <span className="pointer-events-none absolute z-20 text-4xl" style={{ left: `calc(${LENS.x}% + min(13vh, 9.5vw))`, top: `calc(${LENS.y}% + min(13vh, 9.5vw))` }}>🔍</span>

      {/* paint pots */}
      {scene.paints.map((p, i) => {
        const glow = r && misses >= 2 && i === r.paint;
        return (
          <motion.button key={p.word} onClick={() => { void pick(i); }} aria-label={`${p.word} paint`}
            className="absolute z-20 flex flex-col items-center" style={{ left: `${potX(i, scene.paints.length)}%`, top: `${POT_Y}%`, translate: '-50% -50%', transformOrigin: '50% 100%' }}
            whileTap={reduce ? undefined : { scale: 0.9 }}
            animate={reduce ? {} : nope === i ? { rotate: [0, -12, 12, -8, 8, 0] } : tip === i ? { rotate: -18, scaleY: 0.85 } : glow ? { y: [0, -10, 0], rotate: 0, scaleY: 1 } : { y: [0, -3, 0], rotate: 0, scaleY: 1 }}
            transition={nope === i ? { duration: 0.5 } : tip === i ? { duration: 0.18 } : { duration: glow ? 0.7 : 2 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}>
            <span className="relative block" style={{ width: 'min(11vh, 7.5vw)', height: 'min(11vh, 7.5vw)' }}>
              {glow && <span className="absolute -inset-3 animate-pulse rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(254,240,138,0.95), rgba(250,204,21,0))' }} />}
              {/* a code-drawn paint pot: tin, the colour inside, a drip */}
              <svg viewBox="0 0 100 100" className="relative h-full w-full drop-shadow-[0_6px_6px_rgba(0,0,0,0.3)]">
                <path d="M14 30 L22 92 Q50 100 78 92 L86 30 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="4" />
                <ellipse cx="50" cy="30" rx="36" ry="12" fill={p.hex} stroke="#334155" strokeWidth="4" />
                <path d="M24 34 Q24 52 30 52 Q35 52 34 38" fill={p.hex} stroke="#334155" strokeWidth="3" />
              </svg>
            </span>
            <span className="mt-1 rounded-full bg-white/90 px-3 py-0.5 text-sm font-black text-slate-700 shadow">{p.word}</span>
          </motion.button>
        );
      })}

      {/* the flying paint blob (arc from the pot to the magnifier) */}
      <AnimatePresence>
        {blob && (
          <motion.span key={blob.key} className="pointer-events-none absolute z-40 h-10 w-10 rounded-full border-4 border-slate-700/40"
            style={{ background: scene.paints[blob.i].hex, translate: '-50% -50%' }}
            initial={{ left: `${potX(blob.i, scene.paints.length)}%`, top: `${POT_Y - 6}%`, scale: 0.6, opacity: 1 }}
            animate={{ left: [`${potX(blob.i, scene.paints.length)}%`, `${(potX(blob.i, scene.paints.length) + LENS.x) / 2}%`, `${LENS.x}%`], top: [`${POT_Y - 6}%`, '14%', `${LENS.y}%`], scale: [0.6, 1.2, 1.5], opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.55, ease: 'easeIn' }} />
        )}
      </AnimatePresence>

      {/* the rain at the end washes the shoes white again */}
      {done && !reduce && (
        <div className="pointer-events-none absolute inset-0 z-30">
          <motion.span className="absolute text-[5rem]" style={{ left: '20%', top: '6%' }} initial={{ x: -200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>🌧️</motion.span>
          {Array.from({ length: 14 }, (_, k) => (
            <motion.span key={k} className="absolute h-4 w-1.5 rounded-full bg-sky-400/80" style={{ left: `${16 + (k % 7) * 3}%` }}
              initial={{ top: '18%', opacity: 0 }} animate={{ top: ['18%', '86%'], opacity: [0, 1, 0] }} transition={{ duration: 0.9, delay: 0.8 + k * 0.08, repeat: 2 }} />
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-[27%] z-30 flex -translate-x-1/2 gap-1 rounded-full bg-white/85 px-3 py-1 shadow-lg">
        {scene.rounds.map((_, i) => <span key={i} className={`text-2xl ${i < round ? '' : 'opacity-25 grayscale'}`}>👟</span>)}
      </div>
      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[30%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2.6, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function shoePainterLines(scene: Painter) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.paints.map((p) => [scene.who, painterWrongLine(p.word)]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
