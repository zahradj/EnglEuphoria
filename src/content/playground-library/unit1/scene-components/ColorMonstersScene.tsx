import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, STICKER_TILTS, sayWithin } from './shared';
import { Bursts, FloatText, LivingBg, idleFloat, useBursts, useShake } from './gameFx';

/* ---------- Colour Monsters ----------
 * The classroom "feed the colour monsters" game (Colour Monster book
 * activities, 7ESL "Feed the Monster", TinyTap Colour Monster) made a
 * LISTENING game: a hungry monster asks by voice — "I'm hungry! I want
 * something purple!" — and the child gives it a food of that colour from the
 * tray. Better than the apps: the colour word is only HEARD (no printed word
 * to match), the monsters ask in turn so the child must listen to WHO asks
 * and WHAT colour, and a wrong food is named back ("No, thank you! The
 * carrot is orange!") so every mistake teaches. Eaten food stays on the
 * monster's plate (permanence) and the monster chomps with a squash.
 * Monsters are painted in `bg`; `monsters` are their spots (% of the stage). */

type Monsters = Extract<Scene, { kind: 'color-monsters' }>;

export function ColorMonstersScene({ scene, onWin, onLose, onNext, sync }: { scene: Monsters; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    eaten: [] as number[], // food indices already eaten
    wrong: -1,
    chomp: -1, // monster chomping right now
    gemDone: false,
  });
  const { round, eaten, wrong, chomp, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const eatenSet = useMemo(() => new Set(eaten), [eaten]);
  const busy = useRef(false);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const asking = r ? scene.monsters[r.monster] : undefined;

  useEffect(() => {
    if (!r) return;
    busy.current = false;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const give = async (i: number) => {
    const food = scene.foods[i];
    if (!r || !asking || !food || busy.current || eatenSet.has(i)) return;
    busy.current = true;
    if (food.colorWord !== asking.colorWord) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: i }));
      await sayWithin(`No, thank you! The ${food.word} ${food.plural ? 'are' : 'is'} ${food.colorWord.toLowerCase()}!`, scene.who, 3500);
      setState((s) => ({ ...s, wrong: -1 }));
      busy.current = false;
      return;
    }
    sfx.pop();
    setState((s) => ({ ...s, eaten: [...s.eaten, i], chomp: r.monster }));
    window.setTimeout(() => { sfx.match(); fire(asking.x, asking.y, 'stars'); }, 550);
    await sayWithin(`Yum! ${cap(food.colorWord.toLowerCase())} ${food.word}! Thank you!`, scene.who, 3500);
    const next = round + 1;
    setState((s) => ({ ...s, round: next, chomp: -1 }));
    if (next >= total) {
      window.setTimeout(() => { fire(50, 40, 'confetti'); sfx.gem(); }, 300);
      if (!gemDone) { onWin(true); setState((s) => ({ ...s, gemDone: true })); }
    }
  };

  // Plate contents: what each monster has eaten so far.
  const plates = scene.monsters.map((m) => scene.foods.map((f, i) => ({ f, i })).filter(({ f, i }) => eatenSet.has(i) && f.colorWord === m.colorWord));
  const tray = scene.foods.map((f, i) => ({ f, i })).filter(({ i }) => !eatenSet.has(i));

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden" animate={shakeCtl}>
      <LivingBg img={scene.bg} video={scene.bgVideo} />
      {done && <Confetti count={70} />}

      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {r ? '\u{1F37D}️ Feed the hungry monster!' : '\u{1F389} Yum! Thank you!'}
        {r && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>}
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">{'\u{1F50A}'} Again</button>}

      {/* The asking monster glows and bobs; the others wait. A chomping monster squashes. */}
      {scene.monsters.map((m, k) => {
        const isAsking = r?.monster === k;
        return (
          <motion.div
            key={k}
            className="pointer-events-none absolute z-10 rounded-full"
            style={{ left: `${m.x}%`, top: `${m.y}%`, width: `${m.r * 2}vh`, height: `${m.r * 2}vh`, translateX: '-50%', translateY: '-50%' }}
            animate={chomp === k
              ? { scaleY: [1, 0.82, 1.1, 0.92, 1], scaleX: [1, 1.12, 0.94, 1.05, 1], boxShadow: `0 0 0 0 ${m.colorHex}00` }
              : isAsking ? { y: [0, -10, 0], boxShadow: [`0 0 0 0 ${m.colorHex}88`, `0 0 0 22px ${m.colorHex}00`] } : { y: 0, boxShadow: `0 0 0 0 ${m.colorHex}00` }}
            transition={chomp === k ? { duration: 0.6 } : { duration: 1.2, repeat: isAsking ? Infinity : 0 }}
          />
        );
      })}
      {/* Speech bubble over the asking monster (an icon, not words: the colour is heard). */}
      {asking && (
        <motion.div key={round} className="pointer-events-none absolute z-20 flex h-[9vh] w-[9vh] items-center justify-center rounded-full bg-white text-[5vh] shadow-xl"
          style={{ left: `${asking.x}%`, top: `${asking.y - asking.r - 6}%`, translateX: '-50%' }}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
          {'\u{1F442}'}
        </motion.div>
      )}
      {/* Plates: eaten food stays with its monster. */}
      {scene.monsters.map((m, k) => (
        <div key={`p${k}`} className="pointer-events-none absolute z-20 flex -translate-x-1/2 gap-1" style={{ left: `${m.x}%`, top: `${m.plateY}%` }}>
          {plates[k].map(({ f, i }) => (
            <motion.img key={i} src={f.img} alt={f.word} className="h-[9vh] w-[9vh] object-contain" style={{ filter: STICKER_FILTER }}
              initial={{ scale: 0, y: -60 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} />
          ))}
        </div>
      ))}

      {/* The tray of foods along the bottom. */}
      <div className="absolute inset-x-0 bottom-[1%] z-30 flex items-end justify-center gap-[2vw]">
        {tray.map(({ f, i }, k) => (
          <motion.button
            key={i}
            onClick={() => give(i)}
            aria-label={f.word}
            className="relative flex h-[12vh] w-[12vh] items-center justify-center rounded-[28px] bg-white/90 shadow-xl"
            style={{ rotate: STICKER_TILTS[k % STICKER_TILTS.length] }}
            initial={{ scale: 0, y: 40 }}
            animate={wrong === i ? { x: [0, -12, 12, -8, 8, 0], scale: 1, y: 0 } : { scale: 1, y: 0, x: 0 }}
            transition={wrong === i ? { duration: 0.45 } : { type: 'spring', stiffness: 260, damping: 15, delay: k * 0.05 }}
            whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.9 }}
          >
            <motion.img src={f.img} alt="" className="h-[80%] w-[80%] object-contain" {...idleFloat(k)} />
          </motion.button>
        ))}
      </div>

      {asking && chomp >= 0 && (
        <FloatText show x={asking.x} y={asking.y - asking.r - 4}>{'\u{2728}'} Yum!</FloatText>
      )}
      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[24%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next {'\u{2B50}'}</button>
        </motion.div>
      )}
    </motion.div>
  );
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function colorMonstersLines(scene: Monsters) {
  const lines: [string, string][] = scene.rounds.map((r) => [scene.who, r.line]);
  for (const f of scene.foods) {
    lines.push([scene.who, `Yum! ${cap(f.colorWord.toLowerCase())} ${f.word}! Thank you!`]);
    lines.push([scene.who, `No, thank you! The ${f.word} ${f.plural ? 'are' : 'is'} ${f.colorWord.toLowerCase()}!`]);
  }
  return lines;
}
