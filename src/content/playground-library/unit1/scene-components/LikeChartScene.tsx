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

/* ---------- Like Chart (Pre-A1 Unit 8 Lesson 6 signature game, unit review) ----------
 * The class makes a food chart on the dining-hall board. Three food columns stand on the board. One by
 * one a friend says what they like — "I like pizza!" — and the child taps that food's column: the
 * friend's face flies up and stacks in the column. A wrong column is answered by the friend ("No! I
 * like pizza!"), so the child listens again. When every friend is on the chart, Pip reads it ("Look!
 * Pizza! Three friends like pizza!"), and the child adds a star for THEMSELF: "What do you like?".
 * Sources (mechanic only): the classroom "favourite food" pictograph / tally chart (Cambridge Pre A1
 * Starters "listen and tick", early-years maths "people graphs"), Khan Academy Kids sorting, Wordwall
 * "group sort". Better: each sort is a heard sentence from a friend, the chart grows into a real
 * picture graph the child can read (most / one), and the last entry is the child's own choice. */

type Chart = Extract<Scene, { kind: 'like-chart' }>;
export const chartWrongLine = (word: string) => `No! I like ${word}!`;
export const chartYouLine = (word: string) => `You like ${word}! Yummy!`;
export const CHART_ASK = 'What do you like? Tap it!';

export function LikeChartScene({ scene, onWin, onNext, sync }: { scene: Chart; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, placed: [] as number[], mine: -1, gemDone: false });
  const { round, placed, mine, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const asking = round >= total && mine < 0;
  const done = round >= total && mine >= 0;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const friend = r ? CAST[r.friend] : CAST[scene.who];
  const n = scene.columns.length;
  const colX = (i: number) => 22 + (i * 56) / Math.max(1, n - 1);

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (r) {
      const t = window.setTimeout(() => cueSpeak(r.line, r.friend), 700);
      return () => window.clearTimeout(t);
    }
    if (asking) {
      let live = true;
      void (async () => {
        busy.current = true;
        await sayWithin(scene.summaryLine, scene.who, 4200);
        if (!live) return;
        busy.current = false;
        cueSpeak(CHART_ASK, scene.who);
      })();
      return () => { live = false; };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pick = async (col: number) => {
    const c = scene.columns[col];
    if (!c || busy.current) return;
    if (asking) {
      busy.current = true;
      sfx.match(); fire(colX(col), 30, 'stars');
      setState((s) => ({ ...s, mine: col }));
      await sayWithin(chartYouLine(c.word), scene.who, 3000);
      if (!gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); setState((s) => ({ ...s, gemDone: true })); }
      return;
    }
    if (!r) return;
    busy.current = true;
    if (col !== r.column) {
      sfx.wrong(); shake(); setWrong(col);
      setMisses((m) => m + 1);
      const right = scene.columns[r.column];
      await sayWithin(chartWrongLine(right?.word ?? ''), r.friend, 2600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.match(); fire(colX(col), 45, 'stars');
    setState((s) => ({ ...s, placed: [...s.placed, col] }));
    await sayWithin(r.reply, r.friend, 2800);
    setState((s) => ({ ...s, round: s.round + 1 }));
  };

  // faces already on the chart, per column
  const stacks = scene.columns.map((_, ci) => scene.rounds.map((rr, ri) => ({ rr, ri })).filter(({ ri }) => ri < placed.length && placed[ri] === ci));

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(3.2*var(--svw,1vw)), 5.2vh), 2.6rem)' }}>
          {r ? `📊 ${friend.name}: “${r.line}”` : asking ? `⭐ ${CHART_ASK}` : chartYouLine(scene.columns[mine]?.word ?? '')}
        </span>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, r.friend)} aria-label="Hear it again" className="absolute right-3 top-14 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The friend who is talking */}
      <AnimatePresence>
        {r && (
          <motion.img key={round} src={friend.img} alt={friend.name} draggable={false}
            className="pointer-events-none absolute bottom-[4%] left-[2%] z-20 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]" style={{ height: 'min(34vh, 24vw)', maxWidth: 'none' }}
            initial={{ x: -120, opacity: 0 }} animate={{ x: 0, opacity: 1, y: [0, -6, 0] }} exit={{ x: -120, opacity: 0 }}
            transition={{ x: { duration: 0.5 }, opacity: { duration: 0.5 }, y: { duration: 2.4, repeat: Infinity } }} />
        )}
      </AnimatePresence>

      {/* The chart: one column per food, the food picture as the button at the foot */}
      {scene.columns.map((c, ci) => {
        const glow = r && misses >= 2 && ci === r.column;
        return (
          <div key={ci} className="absolute bottom-[8%] z-20 flex -translate-x-1/2 flex-col-reverse items-center" style={{ left: `${colX(ci)}%`, width: 'min(18vh, 13vw)' }}>
            <motion.button onClick={() => { void pick(ci); }} aria-label={c.word} whileTap={{ scale: 0.92 }}
              animate={wrong === ci ? { x: [0, -10, 10, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}
              className={`relative grid w-full place-items-center rounded-3xl border-4 bg-white/90 p-1 shadow-xl ${asking ? 'border-yellow-300 animate-pulse' : 'border-white'}`}>
              {glow && <span className="absolute -inset-2 animate-pulse rounded-3xl bg-yellow-300/80 blur-md" />}
              <img src={c.img} alt="" draggable={false} className="relative z-10 h-[min(12vh,9vw)] w-[min(12vh,9vw)] object-contain" style={{ filter: STICKER_FILTER }} />
            </motion.button>
            <div className="mb-1 flex w-[80%] flex-col-reverse items-center gap-1 rounded-t-2xl border-x-4 border-t-4 border-dashed border-white/70 px-1 pt-1" style={{ minHeight: 'min(40vh, 28vw)' }}>
              <AnimatePresence>
                {stacks[ci].map(({ rr, ri }) => (
                  <motion.img key={ri} src={CAST[rr.friend].img} alt={CAST[rr.friend].name}
                    className="h-[min(11vh,7.6vw)] w-[min(11vh,7.6vw)] rounded-full border-4 border-white bg-sky-100 object-cover object-top shadow-md"
                    initial={{ y: -200, scale: 0.4, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }} />
                ))}
                {mine === ci && (
                  <motion.span key="me" className="grid h-[min(11vh,7.6vw)] w-[min(11vh,7.6vw)] place-items-center rounded-full border-4 border-white bg-yellow-300 text-3xl shadow-md"
                    initial={{ y: -200, scale: 0.4 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}>⭐</motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 top-[26%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.6, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function likeChartLines(scene: Chart) {
  return [
    ...scene.rounds.flatMap((r) => [[r.friend, r.line], [r.friend, r.reply], [r.friend, chartWrongLine(scene.columns[r.column]?.word ?? '')]]),
    [scene.who, scene.summaryLine], [scene.who, CHART_ASK],
    ...scene.columns.map((c) => [scene.who, chartYouLine(c.word)]),
  ] as [string, string][];
}
