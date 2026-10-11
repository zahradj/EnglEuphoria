import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Caterpillar Crawl (Pre-A1 Unit 8 Lesson 5 signature game) ----------
 * The hungry caterpillar from the story sits in the garden; the food of the unit lies around it. The
 * caterpillar says what it likes — "I like bananas!" — and the child taps that food: the caterpillar
 * crawls over to it, munches it, and grows one segment longer. A wrong food is named back ("No, that's
 * bread!"), so a mistake is more listening, never a buzzer. When it is full it curls up and becomes a
 * butterfly — the story's ending, made by the child.
 * Sources (mechanic only): the classic "snake / grow longer" arcade game, Khan Academy Kids and
 * Lingokids "feed the character", Cambridge Pre A1 Starters "listen and find".
 * Better: every bite is one heard sentence ("I like …"), the growing body is a visible count of the
 * child's right answers, and the payoff is the story's own ending (the butterfly); no clock, no fail. */

type Crawl = Extract<Scene, { kind: 'caterpillar-crawl' }>;
export const crawlWrongLine = (word: string) => `No, that's ${word}!`;
export const crawlDoneLine = 'I am full! Now I am a butterfly!';

const SEGMENT_COLORS = ['#8BC34A', '#7CB342'];

export function CaterpillarCrawlScene({ scene, onWin, onNext, sync }: { scene: Crawl; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, eaten: [] as number[], gemDone: false });
  const { round, eaten, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [at, setAt] = useState(scene.start);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  useEffect(() => { if (done) void sayWithin(crawlDoneLine, scene.who, 4000); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [done]);

  const pick = async (i: number) => {
    const f = scene.foods[i];
    if (!r || !f || busy.current || eaten.includes(i)) return;
    busy.current = true;
    if (i !== r.target) {
      sfx.wrong(); shake(); setWrong(i);
      setMisses((m) => m + 1);
      await sayWithin(crawlWrongLine(f.word), scene.who, 2600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.pop();
    setAt({ x: f.x, y: f.y });
    await new Promise((res) => window.setTimeout(res, 1100));
    sfx.match(); fire(f.x, f.y, 'stars');
    setState((s) => ({ ...s, eaten: [...s.eaten, i] }));
    await sayWithin(r.reply, scene.who, 3000);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
  };

  const segments = eaten.length;
  const size = 'min(5.2vh, 3.7vw)';

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3.4*var(--svw,1vw)), 5.6vh), 2.8rem)' }}>
          {r ? `🐛 “${r.line}”` : `🦋 ${crawlDoneLine}`}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>🍃</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The food in the garden */}
      {scene.foods.map((f, i) => {
        if (eaten.includes(i)) return null;
        const glow = r && misses >= 2 && i === r.target;
        return (
          <div key={i} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
            <motion.button onClick={() => { void pick(i); }} aria-label={f.word} className="relative block" whileTap={{ scale: 0.9 }}
              animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0] } : { y: [0, -5, 0] }}
              transition={wrong === i ? { duration: 0.4 } : { duration: 2.2 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' }}>
              {glow && <span className="absolute -inset-3 animate-pulse rounded-full bg-yellow-300/80 blur-md" />}
              <img src={f.img} alt="" draggable={false} className="relative z-10 h-[min(15vh,11vw)] w-[min(15vh,11vw)] object-contain" style={{ filter: STICKER_FILTER }} />
            </motion.button>
          </div>
        );
      })}

      {/* The caterpillar (drawn): a head and one body segment per food eaten; the butterfly at the end */}
      <motion.div className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2" animate={{ left: `${at.x}%`, top: `${at.y}%` }} initial={false} transition={{ duration: 1, ease: 'easeInOut' }}>
        {done ? (
          <motion.img src={scene.butterflyImg} alt="butterfly" className="h-[min(26vh,18vw)] w-[min(26vh,18vw)] object-contain" style={{ filter: STICKER_FILTER }}
            initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0, y: [0, -14, 0] }} transition={{ scale: { type: 'spring', stiffness: 200, damping: 12 }, y: { duration: 1.6, repeat: Infinity } }} />
        ) : (
          <div className="flex flex-row-reverse items-center">
            <motion.img src={scene.headImg} alt="caterpillar" className="relative z-10 object-contain" style={{ height: `calc(${size} * 3.6)`, width: `calc(${size} * 3.6)`, filter: STICKER_FILTER }}
              animate={{ y: [0, -4, 0] }} transition={{ duration: 0.9, repeat: Infinity }} />
            {Array.from({ length: segments }, (_, k) => (
              <motion.span key={k} className={`mt-[min(2.2vh,1.6vw)] block rounded-full border-[3px] border-[#33691E] ${k === 0 ? '-me-[min(2.4vh,1.7vw)]' : '-me-[min(1.2vh,0.9vw)]'}`}
                style={{ height: size, width: size, background: SEGMENT_COLORS[k % SEGMENT_COLORS.length] }}
                initial={{ scale: 0 }} animate={{ scale: 1, y: [0, -3, 0] }}
                transition={{ scale: { type: 'spring', stiffness: 300, damping: 14 }, y: { duration: 0.9, repeat: Infinity, delay: k * 0.12 } }} />
            ))}
          </div>
        )}
      </motion.div>

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[10%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function caterpillarCrawlLines(scene: Crawl) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.foods.map((f) => [scene.who, crawlWrongLine(f.word)]),
    [scene.who, crawlDoneLine],
  ] as [string, string][];
}
