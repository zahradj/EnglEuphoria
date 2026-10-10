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

/* ---------- Put It On! (Pre-A1 Unit 9 Lesson 2 signature game) ----------
 * A snowy morning: Pip, Mia and Leo want to go out and play, but they need their clothes. One friend at a
 * time asks for one thing — "Put on my red socks, please!" — in their own voice, and the child taps it on
 * the bench: it flies onto that friend (a hat on the head, socks and shoes on the feet). A wrong piece is
 * named back by the friend ("No, not the shoes! Listen again."). When everyone is dressed they jump: "Let's
 * play in the snow!".
 * Sources (mechanic only): dress-up play in Toca Boca / Lingokids / Khan Academy Kids ("dress the
 * character for the weather"), Cambridge Pre A1 Starters "listen and point", TPR "put on your hat".
 * Better: the clothes land where they are worn (head / feet) on the friend who asked, so the child listens
 * for WHO and WHAT; socks go on before shoes; every request is a whole sentence; no clock, no fail state. */

type PutOn = Extract<Scene, { kind: 'put-on' }>;
export const putOnWrongLine = (word: string) => `No, not the ${word}! Listen again.`;

export function PutOnScene({ scene, onWin, onNext, sync }: { scene: PutOn; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, placed: 0, gemDone: false });
  const { round, placed, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const speaker = r ? scene.dolls[r.doll]?.who ?? scene.who : scene.who;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, speaker), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  useEffect(() => { if (done) void sayWithin(scene.doneLine, scene.who, 4000); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [done]);

  const pick = async (i: number) => {
    const c = scene.clothes[i];
    if (!r || !c || busy.current) return;
    busy.current = true;
    if (i !== r.item) {
      sfx.wrong(); shake(); setWrong(i);
      setMisses((m) => m + 1);
      await sayWithin(putOnWrongLine(c.word), speaker, 2600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.match();
    const d = scene.dolls[r.doll];
    if (d) fire(d.x, d.y, 'stars');
    setState((s) => ({ ...s, placed: Math.max(s.placed, round + 1) }));
    await sayWithin(r.reply, speaker, 3000);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
  };

  // pieces already on each friend: every round picked right so far
  const wornBy = (di: number) => scene.rounds
    .map((rr, ri) => ({ rr, ri }))
    .filter(({ rr, ri }) => rr.doll === di && ri < Math.max(placed, round))
    .sort((a, b) => (scene.clothes[a.rr.item]?.layer ?? 0) - (scene.clothes[b.rr.item]?.layer ?? 0));

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3.2*var(--svw,1vw)), 5.4vh), 2.7rem)' }}>
          {r ? `${CAST[speaker].name}: “${r.line}”` : scene.doneLine}
        </span>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, speaker)} aria-label="Hear it again" className="absolute right-3 top-14 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The friends, each with the clothes they have on (placed where they are worn) */}
      {scene.dolls.map((d, di) => {
        const talking = !!r && r.doll === di;
        return (
          <motion.div key={di} className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${d.x}%`, top: `${d.y}%`, height: `${d.h}vh`, aspectRatio: '1 / 1' }}
            animate={done ? { y: [0, -26, 0, -14, 0], scale: 1 } : talking ? { y: [0, -8, 0], scale: 1.06 } : { y: 0, scale: 0.94 }}
            transition={done ? { duration: 1, repeat: Infinity, repeatDelay: 0.5, delay: di * 0.15 } : talking ? { y: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 0.3 } } : { duration: 0.3 }}>
            {talking && <span className="absolute inset-x-[18%] bottom-[2%] h-[8%] rounded-[50%] bg-yellow-300/70 blur-md" />}
            <img src={d.img} alt={CAST[d.who].name} draggable={false} className={`absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)] transition ${!talking && !done ? 'opacity-80' : ''}`} />
            <AnimatePresence>
              {wornBy(di).map(({ rr, ri }) => {
                const c = scene.clothes[rr.item];
                if (!c) return null;
                const at = c.on === 'head' ? d.head : d.feet;
                return (
                  <motion.img key={ri} src={c.img} alt={c.word} draggable={false} className="absolute object-contain"
                    style={{ left: `${at.x}%`, top: `${at.y}%`, width: `${at.w}%`, x: '-50%', y: '-50%', filter: STICKER_FILTER }}
                    initial={{ opacity: 0, scale: 2.2 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 15 }} />
                );
              })}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* The bench with the clothes */}
      {!done && (
        <div className="absolute bottom-[3%] left-1/2 z-30 flex -translate-x-1/2 items-end justify-center gap-4 rounded-[2rem] border-[5px] border-[#8B5A2B] bg-[#D9A066]/90 px-5 pb-2 pt-2 shadow-2xl">
          {scene.clothes.map((c, i) => {
            const glow = r && misses >= 2 && i === r.item;
            return (
              <motion.button key={i} onClick={() => { void pick(i); }} aria-label={c.word} className="relative block" whileTap={{ scale: 0.9 }}
                animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0] } : { y: [0, -4, 0] }}
                transition={wrong === i ? { duration: 0.4 } : { duration: 2 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' }}>
                {glow && <span className="absolute -inset-2 animate-pulse rounded-full bg-yellow-300/80 blur-md" />}
                <img src={c.img} alt="" draggable={false} className="relative z-10 h-[min(13vh,9.5vw)] w-[min(13vh,9.5vw)] object-contain" style={{ filter: STICKER_FILTER }} />
              </motion.button>
            );
          })}
        </div>
      )}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function putOnLines(scene: PutOn) {
  const who = (r: PutOn['rounds'][number]) => scene.dolls[r.doll]?.who ?? scene.who;
  const askers = [...new Set(scene.rounds.map(who))];
  return [
    ...scene.rounds.flatMap((r) => [[who(r), r.line], [who(r), r.reply]]),
    ...askers.flatMap((w) => scene.clothes.map((c) => [w, putOnWrongLine(c.word)])),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
