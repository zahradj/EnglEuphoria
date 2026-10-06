import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CropPic, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Grandma's Cookies (Pre-A1 Unit 5 Lesson 3 signature game) ----------
 * Baking day at Grandma's. Pip asks "Let's make a Grandpa cookie!" — the child
 * picks the right face icing from the tray, it lands on the cookie, the cookie
 * goes into the oven (glow, "Ding!") and comes out as a Grandpa cookie on the
 * family plate: "A Grandpa cookie! This is my grandpa!". Researched: Lingokids
 * and Toca Kitchen style cook-and-serve play, Khan Academy Kids' calm build
 * activities, and Cambridge Pre A1 "listen and point". Better: the family word
 * alone picks the face (no word on screen first), every cookie the child bakes
 * stays on the plate as a family they built, and a wrong face is named back
 * ("No, that's Grandma!"). No clock, no lives lost for trying. */

type Cookies = Extract<Scene, { kind: 'cookie-faces' }>;
export const cookieWrongLine = (name: string) => `No, that's ${name}! Try again!`;
export const COOKIE_DING = 'Ding! The cookie is ready!';

export function CookieFacesScene({ scene, onWin, onNext, sync }: { scene: Cookies; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, plate: [] as number[], gemDone: false });
  const { round, plate, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  /** Local only: the face on the cookie, whether it is in the oven, misses. */
  const [onCookie, setOnCookie] = useState(-1);
  const [baking, setBaking] = useState(false);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    setOnCookie(-1);
    setBaking(false);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pick = async (i: number) => {
    const f = scene.faces[i];
    if (!r || !f || busy.current) return;
    busy.current = true;
    if (i !== r.face) {
      sfx.wrong(); shake(); setWrong(i);
      setMisses((m) => m + 1);
      await sayWithin(cookieWrongLine(f.name), scene.who, 2600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.pop();
    setOnCookie(i);
    await new Promise((res) => window.setTimeout(res, 900));
    setBaking(true);
    await new Promise((res) => window.setTimeout(res, 1600));
    sfx.match(); fire(50, 45, 'stars');
    await sayWithin(COOKIE_DING, scene.who, 2200);
    setBaking(false);
    const next = round + 1;
    setState((s) => ({ ...s, plate: [...s.plate, i] }));
    await sayWithin(r.reply, scene.who, 3800);
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  const face = onCookie >= 0 ? scene.faces[onCookie] : undefined;
  const glow = r && misses >= 2 ? r.face : -1;

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.4rem, calc(3.6*var(--svw,1vw)), 3rem)' }}>
          {r ? (plate.length > round ? r.reply : `🍪 ${r.line}`) : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>🍪</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The cookie on its tray, and the oven behind it. */}
      {!done && (
        <div className="absolute left-1/2 top-[30%] z-10 flex h-[34vh] w-[min(80vw,90vh)] -translate-x-1/2 items-center justify-center gap-[4vw] [@media(max-height:500px)]:top-[29%] [@media(max-height:500px)]:h-[32vh]">
          <motion.div className="relative grid h-[30vh] w-[30vh] place-items-center rounded-full [@media(max-height:500px)]:h-[28vh] [@media(max-height:500px)]:w-[28vh]"
            style={{ background: 'radial-gradient(circle at 35% 30%, #F8C77A, #D9913B 70%, #B86F24)', boxShadow: '0 12px 26px rgba(0,0,0,0.35), inset 0 -8px 0 rgba(0,0,0,0.12)' }}
            animate={baking ? { x: '60%', scale: 0.7, opacity: 0.2 } : { x: 0, scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
            {[[22, 30], [70, 24], [80, 62], [26, 74], [56, 84]].map(([x, y], k) => <span key={k} className="absolute h-[6%] w-[6%] rounded-full bg-amber-900/70" style={{ left: `${x}%`, top: `${y}%` }} />)}
            <AnimatePresence>
              {face && (
                <motion.div key={onCookie} initial={{ y: 240, scale: 0.4, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 170, damping: 14 }}>
                  <CropPic img={face.img} at={face.at} w={face.w} aspect={face.aspect} alt={face.label} className="h-[22vh] w-[22vh] border-[6px] border-pink-200 [@media(max-height:500px)]:h-[20vh] [@media(max-height:500px)]:w-[20vh]" />
                </motion.div>
              )}
            </AnimatePresence>
            {!face && <span className="text-center font-black text-amber-950/50" style={{ fontSize: 'clamp(1rem, 2.4vw, 1.8rem)' }}>?</span>}
          </motion.div>
          <div className="relative h-[26vh] w-[24vh] rounded-[18px] border-[6px] border-slate-500 bg-slate-300 shadow-[0_10px_22px_rgba(0,0,0,0.3)] [@media(max-height:500px)]:h-[24vh] [@media(max-height:500px)]:w-[22vh]">
            <div className="absolute inset-x-[12%] top-[8%] flex gap-2">{[0, 1, 2].map((k) => <span key={k} className="h-3 w-3 rounded-full bg-slate-600" />)}</div>
            <motion.div className="absolute inset-x-[12%] bottom-[10%] top-[30%] rounded-xl border-4 border-slate-600"
              animate={{ backgroundColor: baking ? ['#FDBA74', '#F97316', '#FDBA74'] : '#1E293B' }} transition={baking ? { duration: 0.8, repeat: Infinity } : { duration: 0.3 }} />
          </div>
        </div>
      )}

      {/* The face icing tray. */}
      {r && onCookie < 0 && (
        <div className="absolute inset-x-0 bottom-[11%] z-20 flex items-end justify-center gap-[3vw] px-4 [@media(max-height:500px)]:bottom-[12%]">
          {scene.faces.map((f, i) => (
            <motion.button key={f.label} onClick={() => { void pick(i); }} aria-label={f.label}
              className="relative"
              animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0] } : { y: [0, -5, 0] }}
              transition={wrong === i ? { duration: 0.4 } : { duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
              whileTap={{ scale: 0.9 }}>
              {glow === i && <span className="absolute -inset-2 animate-pulse rounded-full bg-yellow-300/80 blur-md" />}
              <CropPic img={f.img} at={f.at} w={f.w} aspect={f.aspect} alt={f.label} className="relative h-[min(17vh,14vw)] w-[min(17vh,14vw)] border-[5px] border-pink-200 shadow-[0_8px_18px_rgba(0,0,0,0.3)]" />
            </motion.button>
          ))}
        </div>
      )}

      {/* The family plate: every cookie baked so far. */}
      {plate.length > 0 && (
        <div className="pointer-events-none absolute bottom-[3%] right-[3%] z-20 flex items-center gap-1 rounded-full bg-white/85 px-3 py-2 shadow-lg [@media(max-height:500px)]:bottom-[2%]">
          {plate.map((fi, k) => {
            const f = scene.faces[fi];
            return (
              <motion.div key={k} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                className="rounded-full p-[3px]" style={{ background: '#D9913B' }}>
                <CropPic img={f.img} at={f.at} w={f.w} aspect={f.aspect} alt={f.label} className="h-[7vh] w-[7vh]" />
              </motion.div>
            );
          })}
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
export function cookieFacesLines(scene: Cookies) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.faces.map((f) => [scene.who, cookieWrongLine(f.name)]),
    [scene.who, COOKIE_DING],
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
