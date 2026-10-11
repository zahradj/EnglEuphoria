import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Shop Till (Pre-A1 Unit 9 Lesson 3 signature game) ----------
 * Bella's clothes shop. A customer hops in through the door and asks for one piece with its colour — "A red
 * coat, please!" — in their own voice. The child taps it on the rack: it lifts (anticipation), flies in an arc
 * into the shopping bag on the counter, the bag squashes as it lands, a beat of hit-stop, then the till rings,
 * coins burst and the customer hops for joy, says thank you and hops out with the bag. A wrong piece wobbles
 * on its hook and the customer tilts their head: "No, not the blue coat! Listen again." (the right one glows
 * after two tries). When the shop is empty, Bella cheers.
 * Sources (mechanic only): pretend-play shop games (Toca Boca Store, Lingokids "shopping"), Cambridge Pre A1
 * Starters listen-and-colour/point (colour + clothes word), the classroom "shop" role-play.
 * Better: every order is colour + word (two things to listen for), the right piece really goes into the bag
 * (a visible result), and each customer is a friend with their own voice; no clock, no fail state.
 * Game feel: .claude/skills/game-animation + the game-designer / game-development skills (12 principles). */

type Till = Extract<Scene, { kind: 'shop-till' }>;
export const tillWrongLine = (label: string) => `No, not the ${label}! Listen again.`;
const DOOR = { x: 6, y: 56 };
const SPOT = { x: 44, y: 56 };
const rackPos = (i: number) => ({ x: 9 + (i % 2) * 13, y: 30 + Math.floor(i / 2) * 22 });

export function ShopTillScene({ scene, onWin, onNext, sync }: { scene: Till; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { round: 0, sold: [] as number[], gemDone: false });
  const { round, sold, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [mood, setMood] = useState<'idle' | 'happy' | 'hmm'>('idle');
  const [fly, setFly] = useState<{ item: number; from: { x: number; y: number } } | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const bag = useAnimationControls();
  const wait = (ms: number) => new Promise((res) => window.setTimeout(res, ms));

  useEffect(() => {
    busy.current = false; setMisses(0); setMood('idle'); setLeaving(false); setArrived(false);
    if (!r) return;
    const a = window.setTimeout(() => setArrived(true), 950);
    const t = window.setTimeout(() => cueSpeak(r.line, r.customer), 1100); // after the hop-in
    return () => { window.clearTimeout(a); window.clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  useEffect(() => { if (done) void sayWithin(scene.doneLine, scene.who, 4000); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [done]);

  const pick = async (i: number) => {
    const c = scene.stock[i];
    if (!r || !c || busy.current || sold.includes(i)) return;
    busy.current = true;
    if (i !== r.item) {
      sfx.wrong(); shake(); setWrong(i); setMood('hmm');
      setMisses((m) => m + 1);
      await sayWithin(tillWrongLine(c.label), r.customer, 2600);
      setWrong(-1); setMood('idle');
      busy.current = false;
      return;
    }
    sfx.pop();
    if (!reduce) { setFly({ item: i, from: rackPos(i) }); await wait(600); setFly(null); }
    void bag.start({ scaleY: [1, 0.78, 1.12, 0.94, 1], scaleX: [1, 1.18, 0.92, 1.04, 1], transition: { duration: 0.55 } });
    setState((s) => ({ ...s, sold: [...s.sold, i] }));
    await wait(reduce ? 0 : 90); // hit-stop: the piece lands, the shop holds still for a beat
    sfx.ring(); sfx.match(); fire(scene.bag.x, scene.bag.y, 'stars'); fire(scene.bag.x, scene.bag.y - 8, 'sparkle');
    setMood('happy');
    await sayWithin(r.reply, r.customer, 3000);
    setLeaving(true); await wait(reduce ? 0 : 700);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
  };

  const customer = r ? CAST[r.customer] : null;
  // every state names left/top/opacity: a value missing from `animate` would spring back to `initial` (the door)
  const at = { left: `${SPOT.x}%`, top: `${SPOT.y}%`, opacity: 1 };
  const custAnim = reduce ? at : leaving
    ? { left: [`${SPOT.x}%`, `${(SPOT.x + DOOR.x) / 2}%`, `${DOOR.x}%`], top: [`${SPOT.y}%`, `${SPOT.y - 12}%`, `${DOOR.y}%`], opacity: [1, 1, 0], scaleX: -1, rotate: 0 }
    : mood === 'happy' ? { ...at, top: [`${SPOT.y}%`, `${SPOT.y - 8}%`, `${SPOT.y}%`, `${SPOT.y - 3}%`, `${SPOT.y}%`], scaleY: [1, 0.86, 1.1, 0.96, 1], rotate: 0 }
    : mood === 'hmm' ? { ...at, rotate: [0, -8, 6, -3, 0], scaleY: 1 }
    : arrived ? { ...at, rotate: 0, scaleY: [1, 1.035, 1] }
    : { left: [`${DOOR.x}%`, `${(DOOR.x + SPOT.x) / 2}%`, `${SPOT.x}%`], top: [`${DOOR.y}%`, `${DOOR.y - 14}%`, `${SPOT.y}%`], opacity: [0, 1, 1], scaleY: [1, 1.06, 0.82, 1.08, 1] };
  const custTr = leaving ? { duration: 0.7, ease: 'easeIn' as const } : mood !== 'idle' ? { duration: 0.7 }
    : arrived ? { scaleY: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' as const }, default: { duration: 0.3 } } : { duration: 0.9, ease: 'easeOut' as const };

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3.2*var(--svw,1vw)), 5.4vh), 2.7rem)' }}>
          {r && customer ? `${customer.name}: “${r.line}”` : scene.doneLine}
        </span>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, r.customer)} aria-label="Hear it again" className="absolute right-3 top-14 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* the rack: pieces hang and sway; sold ones are gone */}
      <div className="pointer-events-none absolute z-10 rounded-[2rem] border-[5px] border-[#8B5A2B] bg-[#F3DDB3]/90 shadow-2xl" style={{ left: '2%', top: '19%', width: '27%', height: '72%' }}>
        <span className="absolute left-[6%] right-[6%] top-[3%] h-[1.4vh] rounded-full bg-[#8B5A2B]" />
      </div>
      {scene.stock.map((c, i) => {
        if (sold.includes(i) || fly?.item === i) return null;
        const p = rackPos(i);
        const glow = r && misses >= 2 && i === r.item;
        return (
          <div key={i} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <motion.button onClick={() => { void pick(i); }} aria-label={c.label} className="relative block" style={{ transformOrigin: '50% 0%' }}
              initial={reduce ? false : { scale: 0, y: -30 }} whileTap={reduce ? undefined : { scale: 0.88 }}
              animate={wrong === i ? { scale: 1, y: 0, rotate: [0, -16, 13, -8, 5, 0] } : reduce ? { scale: 1, y: 0 } : { scale: 1, y: 0, rotate: [0, 3, 0, -3, 0] }}
              transition={wrong === i ? { duration: 0.6 } : { scale: { type: 'spring', stiffness: 280, damping: 15, delay: i * 0.08 }, y: { type: 'spring', stiffness: 280, damping: 15, delay: i * 0.08 }, rotate: { duration: 2.6 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' } }}>
              {glow && <span className="absolute -inset-2 animate-pulse rounded-full bg-yellow-300/80 blur-md" />}
              <span className="absolute left-1/2 top-[-1.2vh] z-0 block h-[1.6vh] w-[3vh] -translate-x-1/2 rounded-t-full border-[3px] border-b-0 border-[#7A4B21]" />
              <img src={c.img} alt="" draggable={false} className="relative z-10 h-[min(15vh,10.5vw)] w-[min(15vh,10.5vw)] object-contain" style={{ filter: STICKER_FILTER }} />
            </motion.button>
          </div>
        );
      })}

      {/* the shopping bag on the counter */}
      <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full" style={{ left: `${scene.bag.x}%`, top: `${scene.bag.y}%` }}>
        <motion.img src={scene.bag.img} alt="shopping bag" animate={bag} style={{ transformOrigin: '50% 100%', filter: STICKER_FILTER }} className="h-[min(18vh,12vw)] w-[min(18vh,12vw)] object-contain" />
      </div>

      {/* the customer: hops in from the door, waits, hops out with the bag */}
      <AnimatePresence>
        {r && customer && (
          <motion.div key={round} className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ height: '46vh', aspectRatio: '1 / 1', transformOrigin: '50% 95%' }}
            initial={reduce ? { left: `${SPOT.x}%`, top: `${SPOT.y}%`, opacity: 0 } : { left: `${DOOR.x}%`, top: `${DOOR.y}%`, opacity: 0 }}
            animate={custAnim} transition={custTr}>
            <img src={customer.img} alt={customer.name} draggable={false} className="h-full w-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]" />
            {leaving && <img src={scene.bag.img} alt="" className="absolute bottom-[18%] left-[62%] h-[28%] w-[28%] object-contain" style={{ filter: STICKER_FILTER }} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* the piece in flight: lift → arc → into the bag */}
      {fly && (() => {
        const c = scene.stock[fly.item];
        return (
          <motion.img src={c.img} alt="" className="pointer-events-none absolute z-30 h-[min(15vh,10.5vw)] w-[min(15vh,10.5vw)] -translate-x-1/2 -translate-y-1/2 object-contain" style={{ filter: STICKER_FILTER }}
            initial={{ left: `${fly.from.x}%`, top: `${fly.from.y}%`, scale: 1, rotate: 0 }}
            animate={{ left: [`${fly.from.x}%`, `${fly.from.x}%`, `${(fly.from.x + scene.bag.x) / 2}%`, `${scene.bag.x}%`],
              top: [`${fly.from.y}%`, `${fly.from.y + 3}%`, `${Math.max(22, Math.min(fly.from.y, scene.bag.y) - 18)}%`, `${scene.bag.y - 8}%`],
              scale: [1, 0.92, 1.15, 0.55], rotate: [0, 8, -14, 0] }}
            transition={{ duration: 0.6, times: [0, 0.16, 0.58, 1], ease: ['easeOut', 'easeOut', 'easeIn'] }} />
        );
      })()}

      {/* coins earned so far */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full bg-white/85 px-3 py-1 shadow-lg">
        {scene.rounds.map((_, i) => (
          <motion.span key={i} className={`text-2xl ${i < sold.length ? '' : 'opacity-25 grayscale'}`} animate={i === sold.length - 1 && !reduce ? { scale: [1, 1.6, 1], rotate: [0, 20, 0] } : {}} transition={{ duration: 0.5 }}>🪙</motion.span>
        ))}
      </div>

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[14%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function shopTillLines(scene: Till) {
  const out: [string, string][] = [];
  for (const r of scene.rounds) { out.push([r.customer, r.line], [r.customer, r.reply]); }
  const buyers = [...new Set(scene.rounds.map((r) => r.customer))];
  for (const b of buyers) for (const c of scene.stock) out.push([b, tillWrongLine(c.label)]);
  out.push([scene.who, scene.doneLine]);
  return out;
}
