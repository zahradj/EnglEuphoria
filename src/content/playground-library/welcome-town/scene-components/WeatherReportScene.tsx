import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Planet Weather Report ★ (docs/a1-unit-3-space.md §5.4) ----------
 * 1 MAP: the planets sit on the weather map. The forecast is read ("On Planet Ice it's cold and snowy."); the child
 *   taps a weather sticker, then the planet — it sticks on. Every planet gets its weather.
 * 2 ON AIR: the child is the TV weather reporter: each planet's report comes up on the autocue and the child reads it
 *   aloud (🔊 helps), then taps "Next".
 * 3 PACK THE BAG: "We're going to Planet Sun! What do we need?" — the weather word decides: sunglasses for sunny, a
 *   scarf for snowy, an umbrella for rainy. The thing flies into the astronaut's bag.
 * Mechanics: ESL weather-map information gaps, weather-report role plays, weather mime / Four Corners (teach-this,
 * games4esl, ESL Kid Stuff, British Council). Better: the child hears, places, then SAYS the report, and the weather word
 * has a real consequence (what goes in the bag). */

type Weather = Extract<Scene, { kind: 'weather-report' }>;

export function WeatherReportScene({ scene, onNext, onWin, onLose, sync }: { scene: Weather; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { phase: 'map', placed: [''] as string[], sel: '', read: 0, bag: 0, packed: [-1], wrong: '', done: false });
  const phase = String(state.phase) as 'map' | 'air' | 'bag';
  const placed = useMemo(() => new Set(Array.isArray(state.placed) ? state.placed.filter(Boolean) : []), [state.placed]);
  const needed = useMemo(() => scene.planets.flatMap((p, i) => p.weather.map((w) => `${i}:${w}`)), [scene.planets]);
  // the forecast line being asked now: the first planet that still misses a sticker
  const ask = scene.planets.findIndex((p, i) => p.weather.some((w) => !placed.has(`${i}:${w}`)));
  const sel = String(state.sel);
  const read = Math.max(0, Math.min(scene.planets.length - 1, Number(state.read) || 0));
  const bagI = Math.max(0, Math.min(scene.bag.length - 1, Number(state.bag) || 0));
  const bagQ = scene.bag[bagI];
  const packed = Array.isArray(state.packed) ? state.packed.filter((n) => n >= 0) : [];
  const done = !!state.done;
  const gemDone = useRef(false);
  const icon = (k: string) => scene.icons.find((x) => x.key === k);

  useEffect(() => {
    if (done) return undefined;
    let line = '';
    if (phase === 'map' && ask >= 0) line = scene.planets[ask].forecast;
    if (phase === 'air') line = read === 0 ? 'You are the weather reporter! Read the report.' : '';
    if (phase === 'bag' && bagQ) line = bagQ.line;
    if (!line) return undefined;
    const t = window.setTimeout(() => cueSpeak(line, voiceOf(scene.who)), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, ask, read, bagI, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const wrongFlash = (w: string) => { sfx.wrong(); onLose(); setState((s) => ({ ...s, wrong: w })); window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600); };
  const pickIcon = (k: string) => { if (phase !== 'map' || done) return; sfx.click(); cueSpeak(icon(k)?.label ?? k, 'teacher'); setState((s) => ({ ...s, sel: k })); };
  const tapPlanet = (i: number) => {
    if (phase !== 'map' || !sel || done) return;
    const key = `${i}:${sel}`;
    if (!scene.planets[i].weather.includes(sel) || i !== ask) { wrongFlash(`p${i}`); cueSpeak('Listen again!', voiceOf(scene.who)); return; }
    sfx.pop(); window.setTimeout(() => sfx.match(), 150);
    const list = [...placed, key];
    const all = needed.every((k) => list.includes(k));
    setState((s) => ({ ...s, placed: list, sel: '' }));
    if (all) window.setTimeout(() => setState((s) => ({ ...s, phase: 'air', read: 0 })), 1400);
  };
  const nextRead = () => {
    sfx.click();
    setState((s) => {
      const n = (Number(s.read) || 0) + 1;
      return n >= scene.planets.length ? { ...s, phase: 'bag', bag: 0 } : { ...s, read: n };
    });
  };
  const pack = (c: number) => {
    if (phase !== 'bag' || !bagQ || done) return;
    if (c !== bagQ.answer) { wrongFlash(`b${c}`); cueSpeak('Hmm, not for this weather!', voiceOf(scene.who)); return; }
    sfx.whoop(); window.setTimeout(() => sfx.gem(), 300);
    cueSpeak(bagQ.say, 'teacher');
    setState((s) => ({ ...s, packed: [...(Array.isArray(s.packed) ? s.packed.filter((n) => n >= 0) : []), bagI] }));
    window.setTimeout(() => setState((s) => {
      const n = (Number(s.bag) || 0) + 1;
      return n >= scene.bag.length ? { ...s, done: true } : { ...s, bag: n };
    }), 1700);
  };

  // planets spread over the map
  const spots = scene.planets.map((_, i) => ({ x: 14 + (i % 2) * 40 + (i >= 2 ? 6 : 0), y: i < 2 ? 22 : 62 }));
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-indigo-950/30" />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `📺 ${scene.title}`}
        </span>
      </div>
      {!done && (
        <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-indigo-700 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>
          {phase === 'map' ? '🗺️ 1 · Map' : phase === 'air' ? '🎤 2 · On air' : '🎒 3 · Pack the bag'}
        </span>
      )}
      {/* the TV / weather map */}
      {!done && phase !== 'bag' && (
        <div className="absolute bottom-[4%] left-[3%] top-[19%] z-20 w-[66%] rounded-[2.4vh] border-[0.9vh] border-slate-700 bg-gradient-to-b from-sky-700 to-indigo-900 shadow-2xl">
          {phase === 'air' && (
            <span className="absolute left-[3%] top-[3%] z-10 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 font-black text-white shadow" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>
              <motion.span className="inline-block h-[1.4vh] w-[1.4vh] rounded-full bg-white" animate={reduce ? {} : { opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }} /> ON AIR
            </span>
          )}
          {scene.planets.map((p, i) => {
            const isAsk = phase === 'map' && i === ask;
            const isRead = phase === 'air' && i === read;
            return (
              <motion.button key={i} type="button" onClick={() => tapPlanet(i)} aria-label={p.name}
                className={`absolute flex flex-col items-center rounded-[2vh] p-[0.6vh] ${isAsk && sel ? 'ring-[0.6vh] ring-yellow-300' : ''} ${isRead ? 'bg-white/15 ring-[0.6vh] ring-red-400' : ''}`}
                style={{ left: `${spots[i].x}%`, top: `${spots[i].y}%`, width: '28%' }}
                animate={state.wrong === `p${i}` ? { x: [0, -8, 8, -5, 0] } : {}}>
                <span className="relative">
                  <img src={p.img} alt="" draggable={false} className="h-[min(18vh,12vw)] w-auto object-contain drop-shadow-xl" />
                  {/* the weather stickers stick ON the planet (top-right), so they never look like the planet below's */}
                  <span className="absolute -right-[45%] top-0 flex flex-col gap-[0.4vh] rounded-[1.4vh] bg-white/85 p-[0.4vh] shadow-lg empty:hidden">
                  <AnimatePresence>
                    {p.weather.filter((w) => placed.has(`${i}:${w}`)).map((w) => (
                      <motion.img key={w} src={icon(w)?.img} alt={w} draggable={false} className="h-[min(6vh,4vw)] w-auto object-contain"
                        initial={reduce ? false : { scale: 0, y: -40 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} />
                    ))}
                  </AnimatePresence>
                  </span>
                </span>
                <span className="rounded-full bg-white/90 px-3 font-black text-indigo-900" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>{p.name}</span>
              </motion.button>
            );
          })}
        </div>
      )}
      {/* right panel */}
      {!done && phase === 'map' && ask >= 0 && (
        <div className="absolute bottom-[4%] right-[3%] top-[22%] z-30 flex w-[27%] flex-col gap-[1.2vh]">
          <button type="button" onClick={() => { sfx.click(); cueSpeak(scene.planets[ask].forecast, voiceOf(scene.who)); }}
            className="rounded-[2vh] bg-white/95 px-4 py-2 text-start font-black text-indigo-800 shadow-xl" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>
            🔊 Listen to the forecast!
          </button>
          <span className="text-center font-black text-white" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>Tap the weather, then the planet.</span>
          <div className="grid grid-cols-2 gap-[1vh]">
            {scene.icons.map((ic) => (
              <motion.button key={ic.key} type="button" onClick={() => pickIcon(ic.key)} whileTap={{ scale: 0.92 }}
                className={`flex flex-col items-center rounded-[1.8vh] border-[0.5vh] bg-white p-[0.6vh] shadow-lg ${sel === ic.key ? 'border-yellow-300 ring-[0.5vh] ring-yellow-300' : 'border-white'}`}>
                <img src={ic.img} alt="" draggable={false} className="h-[min(8vh,5.4vw)] w-auto object-contain" />
                <span className="font-black text-indigo-900" style={{ fontSize: 'min(2.2vh, 1.5vw)' }}>{ic.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}
      {!done && phase === 'air' && (
        <div className="absolute bottom-[4%] right-[3%] top-[22%] z-30 flex w-[27%] flex-col justify-center gap-[1.4vh]">
          <span className="text-center font-black text-white" style={{ fontSize: 'min(2.6vh, 1.8vw)' }}>🎤 Read it to the camera!</span>
          <div className="rounded-[2vh] border-[0.5vh] border-slate-700 bg-slate-900 p-[1.6vh] text-center font-black text-yellow-200 shadow-xl" style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>
            {scene.planets[read].report}
          </div>
          <button type="button" onClick={() => { sfx.click(); cueSpeak(scene.planets[read].report, 'teacher'); }} className="rounded-full bg-white/95 px-4 py-1 font-black text-indigo-700 shadow" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>🔊 Help me read</button>
          <button type="button" onClick={nextRead} className={`${CLAY_BUTTON} py-2`} style={{ fontSize: 'min(3vh, 2vw)' }}>{read + 1 >= scene.planets.length ? 'Now pack the bag! 🎒' : 'Next planet ▶'}</button>
        </div>
      )}
      {!done && phase === 'bag' && bagQ && (
        <div className="absolute inset-x-[5%] bottom-[5%] top-[20%] z-30 flex items-center justify-around">
          <div className="flex w-[30%] flex-col items-center gap-[1vh]">
            <img src={scene.planets[bagQ.planet]?.img} alt="" draggable={false} className="h-[min(22vh,15vw)] w-auto object-contain drop-shadow-xl" />
            <button type="button" onClick={() => { sfx.click(); cueSpeak(bagQ.line, voiceOf(scene.who)); }} className="rounded-[2vh] bg-white/95 px-4 py-2 text-center font-black text-indigo-800 shadow-xl" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>🔊 {bagQ.line}</button>
          </div>
          <div className="flex flex-col items-center gap-[1.4vh]">
            <div className="flex gap-[1.2vw]">
              {bagQ.choices.map((c, i) => (
                <motion.button key={`${bagI}-${i}`} type="button" onClick={() => pack(i)} whileTap={{ scale: 0.92 }} aria-label={c.label}
                  animate={state.wrong === `b${i}` ? { x: [0, -8, 8, -5, 0] } : packed.includes(bagI) && i === bagQ.answer && !reduce ? { y: 120, scale: 0.3, opacity: 0 } : {}}
                  transition={{ duration: 0.6 }}
                  className="flex h-[min(20vh,13vw)] w-[min(18vh,12vw)] flex-col items-center justify-center rounded-[2vh] border-[0.5vh] border-white bg-white/95 shadow-xl">
                  <img src={c.img} alt="" draggable={false} className="h-[70%] w-[80%] object-contain" />
                  <span className="font-black text-indigo-900" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>{c.label}</span>
                </motion.button>
              ))}
            </div>
            <span className="text-[min(12vh,8vw)] leading-none">🎒</span>
          </div>
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
