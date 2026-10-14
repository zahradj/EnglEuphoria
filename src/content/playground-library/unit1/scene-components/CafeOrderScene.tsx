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

/* ---------- Café Order (Pre-A1 Unit 8 Lesson 2 signature game) ----------
 * The child is the waiter in a little bakery café. A friend sits at the table and orders — one thing
 * ("Juice, please!") and then two ("Bread and water, please!"). The child taps the food and drinks on
 * the counter to put them on the tray, then rings the bell to serve. Right tray: the friend says
 * "Thank you! Yum!"; a wrong tray comes back with the order said again, so the child listens again.
 * Sources (mechanic only): Lingokids / Toca-style café and shop role play, Cambridge Pre A1 Starters
 * "listen and colour/tick two things", the classroom "restaurant" role play.
 * Better: orders grow from one to two things (listening memory), the child builds the order themself
 * (choose + check + serve) instead of tapping one picture, and every friend asks politely in a whole
 * sentence the child will say back; calm, no clock. */

type Cafe = Extract<Scene, { kind: 'cafe-order' }>;
export const cafeWrongLine = (line: string) => `Oh no! ${line}`;

export function CafeOrderScene({ scene, onWin, onNext, sync }: { scene: Cafe; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, tray: [] as number[], gemDone: false });
  const { round, tray, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [happy, setHappy] = useState(false);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const customer = r ? CAST[r.customer] : CAST[scene.who];

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, r.customer), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const toggle = (i: number) => {
    if (!r || busy.current) return;
    sfx.pop();
    setState((s) => ({ ...s, tray: s.tray.includes(i) ? s.tray.filter((x) => x !== i) : s.tray.length >= 3 ? s.tray : [...s.tray, i] }));
    const m = scene.menu[i];
    if (m && !tray.includes(i)) cueSpeak(m.word, scene.who);
  };

  const serve = async () => {
    if (!r || busy.current || tray.length === 0) return;
    busy.current = true;
    const ok = tray.length === r.order.length && r.order.every((i) => tray.includes(i));
    if (!ok) {
      sfx.wrong(); shake();
      setMisses((m) => m + 1);
      await sayWithin(cafeWrongLine(r.line), r.customer, 3200);
      setState((s) => ({ ...s, tray: [] }));
      busy.current = false;
      return;
    }
    sfx.match(); setHappy(true); fire(scene.seat.x, scene.seat.y, 'stars');
    await sayWithin(r.reply, r.customer, 3200);
    setHappy(false);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, tray: [], gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3.4*var(--svw,1vw)), 5.6vh), 2.8rem)' }}>
          {r ? `☕ ${customer.name}: “${r.line}”` : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>⭐</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, r.customer)} aria-label="Hear the order again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The customer at the table */}
      {r && (
        <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${scene.seat.x}%`, top: `${scene.seat.y}%` }}>
          <motion.img key={round} src={customer.img} alt={customer.name} draggable={false}
            className="block object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]" style={{ height: 'min(38vh, 28vw)', maxWidth: 'none' }}
            initial={{ x: 120, opacity: 0 }}
            animate={happy ? { x: 0, opacity: 1, y: [0, -18, 0, -10, 0] } : { x: 0, opacity: 1, y: [0, -5, 0] }}
            transition={happy ? { duration: 0.9 } : { x: { duration: 0.5 }, opacity: { duration: 0.5 }, y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } }} />
        </div>
      )}

      {/* The counter: tap to put on the tray */}
      <div className="absolute bottom-[26%] left-[3%] z-20 flex w-[50%] flex-wrap justify-center gap-[2%]">
        {scene.menu.map((m, i) => {
          const glow = r && misses >= 2 && r.order.includes(i) && !tray.includes(i);
          const on = tray.includes(i);
          return (
            <motion.button key={i} onClick={() => toggle(i)} aria-label={m.word} whileTap={{ scale: 0.9 }}
              className={`relative rounded-3xl bg-white/80 p-2 shadow-xl ring-4 ${on ? 'ring-green-400 opacity-50' : 'ring-white'}`}>
              {glow && <span className="absolute -inset-2 animate-pulse rounded-3xl bg-yellow-300/80 blur-md" />}
              <img src={m.img} alt="" draggable={false} className="relative z-10 h-[min(15vh,11vw)] w-[min(15vh,11vw)] object-contain" style={{ filter: STICKER_FILTER }} />
            </motion.button>
          );
        })}
      </div>

      {/* The tray + the bell */}
      {r && (
        <div className="absolute bottom-[6%] left-1/2 z-30 flex -translate-x-1/2 items-center gap-4">
          <div className="flex h-[min(16vh,12vw)] min-w-[min(46vh,34vw)] items-center justify-center gap-2 rounded-[999px] border-[6px] border-amber-700 bg-gradient-to-b from-amber-200 to-amber-400 px-6 shadow-2xl">
            <AnimatePresence>
              {tray.map((i) => scene.menu[i] && (
                <motion.button key={i} onClick={() => toggle(i)} aria-label={`Take off ${scene.menu[i].word}`}
                  initial={{ scale: 0, y: -40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0 }}>
                  <img src={scene.menu[i].img} alt="" className="h-[min(12vh,9vw)] w-[min(12vh,9vw)] object-contain" style={{ filter: STICKER_FILTER }} />
                </motion.button>
              ))}
            </AnimatePresence>
            {tray.length === 0 && <span className="text-lg font-black text-amber-900/60">Tray</span>}
          </div>
          <button onClick={() => { void serve(); }} disabled={tray.length === 0} className={`${CLAY_BUTTON} px-6 py-3 text-xl disabled:opacity-50`}>🛎️ Serve!</button>
        </div>
      )}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function cafeOrderLines(scene: Cafe) {
  return [
    ...scene.rounds.flatMap((r) => [[r.customer, r.line], [r.customer, r.reply], [r.customer, cafeWrongLine(r.line)]]),
    ...scene.menu.map((m) => [scene.who, m.word]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
