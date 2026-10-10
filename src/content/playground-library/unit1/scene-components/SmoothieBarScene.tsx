import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Smoothie Bar (Pre-A1 Unit 8 Lesson 4 signature game) ----------
 * Pip's smoothie cart in the orchard. A friend says what they like — "I like bananas and milk!" — and
 * the child drops those things into the big blender (tap a fruit: it hops into the jar), then presses
 * BLEND: the jar whirls and fills with the smoothie's colour, and the friend drinks it: "Yummy! I like
 * it!". A wrong mix is poured out with the friend's line said again, so the child listens again.
 * Sources (mechanic only): Toca Kitchen / Lingokids cooking play (put things in, see what you made),
 * Cambridge Pre A1 Starters "listen and tick two things", Sesame Workshop modelling of "I like …".
 * Better: the request IS the lesson's sentence ("I like …"), the child builds the mix themself
 * (choose, check, blend), and the result is a visible, colourful thing the child made; no clock. */

type Smoothie = Extract<Scene, { kind: 'smoothie-bar' }>;
export const smoothieWrongLine = (line: string) => `Oops! ${line}`;

/** The colour of a mix: the average of the fruits' colours. */
function mixHex(hexes: string[]) {
  if (!hexes.length) return '#ffffff';
  const rgb = hexes.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
  const avg = [0, 1, 2].map((k) => Math.round(rgb.reduce((s, c) => s + c[k], 0) / rgb.length));
  return `#${avg.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function SmoothieBarScene({ scene, onWin, onNext, sync }: { scene: Smoothie; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, jar: [] as number[], gemDone: false });
  const { round, jar, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [phase, setPhase] = useState<'fill' | 'blend' | 'serve'>('fill');
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const friend = r ? CAST[r.friend] : CAST[scene.who];
  const color = mixHex(jar.map((i) => scene.fruits[i]?.hex).filter((h): h is string => !!h));

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    setPhase('fill');
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, r.friend), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const toggle = (i: number) => {
    if (!r || busy.current) return;
    sfx.pop();
    setState((s) => ({ ...s, jar: s.jar.includes(i) ? s.jar.filter((x) => x !== i) : s.jar.length >= 3 ? s.jar : [...s.jar, i] }));
    const f = scene.fruits[i];
    if (f && !jar.includes(i)) cueSpeak(f.word, scene.who);
  };

  const blend = async () => {
    if (!r || busy.current || jar.length === 0) return;
    busy.current = true;
    const ok = jar.length === r.mix.length && r.mix.every((i) => jar.includes(i));
    if (!ok) {
      sfx.wrong(); shake();
      setMisses((m) => m + 1);
      await sayWithin(smoothieWrongLine(r.line), r.friend, 3400);
      setState((s) => ({ ...s, jar: [] }));
      busy.current = false;
      return;
    }
    setPhase('blend'); sfx.pop();
    await new Promise((res) => window.setTimeout(res, 1300));
    setPhase('serve'); sfx.match(); fire(scene.seat.x, scene.seat.y, 'stars');
    await sayWithin(r.reply, r.friend, 3200);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, jar: [], gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3.4*var(--svw,1vw)), 5.6vh), 2.8rem)' }}>
          {r ? `🥤 ${friend.name}: “${r.line}”` : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>🥤</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, r.friend)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The friend who ordered */}
      {r && (
        <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${scene.seat.x}%`, top: `${scene.seat.y}%` }}>
          <motion.img key={round} src={friend.img} alt={friend.name} draggable={false}
            className="block object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]" style={{ height: 'min(38vh, 28vw)', maxWidth: 'none' }}
            initial={{ x: 120, opacity: 0 }}
            animate={phase === 'serve' ? { x: 0, opacity: 1, y: [0, -18, 0, -10, 0] } : { x: 0, opacity: 1, y: [0, -5, 0] }}
            transition={phase === 'serve' ? { duration: 0.9 } : { x: { duration: 0.5 }, opacity: { duration: 0.5 }, y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } }} />
        </div>
      )}

      {/* The blender (drawn) */}
      {r && (
        <div className="absolute bottom-[8%] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center">
          <motion.div className="relative h-[min(34vh,24vw)] w-[min(22vh,16vw)] overflow-hidden rounded-b-[2.2rem] rounded-t-xl border-[6px] border-white/90 bg-white/40 shadow-2xl backdrop-blur-sm"
            animate={phase === 'blend' ? { rotate: [0, -3, 3, -3, 3, 0], x: [0, -4, 4, -4, 4, 0] } : {}} transition={{ duration: 0.5, repeat: phase === 'blend' ? 2 : 0 }}>
            {phase === 'fill' ? (
              <div className="absolute inset-x-0 bottom-1 flex flex-wrap-reverse items-end justify-center gap-1 p-1">
                <AnimatePresence>
                  {jar.map((i) => scene.fruits[i] && (
                    <motion.button key={i} onClick={() => toggle(i)} aria-label={`Take out ${scene.fruits[i].word}`} initial={{ y: -120, scale: 0.4 }} animate={{ y: 0, scale: 1 }} exit={{ scale: 0 }}>
                      <img src={scene.fruits[i].img} alt="" className="h-[min(10vh,7vw)] w-[min(10vh,7vw)] object-contain" style={{ filter: STICKER_FILTER }} />
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div className="absolute inset-x-0 bottom-0" style={{ background: color }} initial={{ height: '10%' }} animate={{ height: '88%' }} transition={{ duration: 1.1 }}>
                <div className="absolute inset-x-0 top-0 h-3 bg-white/40" />
              </motion.div>
            )}
          </motion.div>
          <div className="-mt-1 h-[min(7vh,5vw)] w-[min(26vh,19vw)] rounded-b-2xl rounded-t-md bg-gradient-to-b from-slate-500 to-slate-700 shadow-xl" />
          <button onClick={() => { void blend(); }} disabled={jar.length === 0 || phase !== 'fill'} className={`${CLAY_BUTTON} mt-2 px-6 py-2 text-xl disabled:opacity-50`}>🌀 Blend!</button>
        </div>
      )}

      {/* The fruit on the counter */}
      <div className="absolute bottom-[10%] right-[3%] z-20 grid w-[30%] grid-cols-3 gap-2">
        {scene.fruits.map((f, i) => {
          const glow = r && misses >= 2 && r.mix.includes(i) && !jar.includes(i);
          const on = jar.includes(i);
          return (
            <motion.button key={i} onClick={() => toggle(i)} aria-label={f.word} whileTap={{ scale: 0.9 }}
              className={`relative grid place-items-center rounded-3xl bg-white/85 p-1 shadow-xl ring-4 ${on ? 'opacity-40 ring-green-400' : 'ring-white'}`}>
              {glow && <span className="absolute -inset-2 animate-pulse rounded-3xl bg-yellow-300/80 blur-md" />}
              <img src={f.img} alt="" draggable={false} className="relative z-10 h-[min(13vh,9vw)] w-[min(13vh,9vw)] object-contain" style={{ filter: STICKER_FILTER }} />
            </motion.button>
          );
        })}
      </div>

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[12%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function smoothieBarLines(scene: Smoothie) {
  return [
    ...scene.rounds.flatMap((r) => [[r.friend, r.line], [r.friend, r.reply], [r.friend, smoothieWrongLine(r.line)]]),
    ...scene.fruits.map((f) => [scene.who, f.word]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
