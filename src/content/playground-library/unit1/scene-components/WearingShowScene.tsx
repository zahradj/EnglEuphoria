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

/* ---------- Who Am I? Fashion Show (Pre-A1 Unit 9 Lesson 4 signature game) ----------
 * A fashion show on a garden stage. Three friends stand in the spotlights, each really wearing an outfit (the
 * fitted dress-up layers drawn for their bodies). One of them says what they are wearing — "I'm wearing a
 * green hat and blue shoes! Who am I?" — and the child taps that friend: a camera flash, the friend struts
 * forward into the spotlight with a twirl, sparkles, and says "Yes! It's me!". A wrong friend shakes their
 * head ("Not me! Listen again."); the right one glows after two tries. Between rounds everyone twirls and
 * the outfits change. Every clue needs two pieces (or a colour) to tell the friends apart.
 * Sources (mechanic only): "Guess Who?" (attributes → who), the classroom "I'm wearing…" description game,
 * Cambridge Pre A1 Starters listening ("Look at the picture, listen and point"), Toca Boca / Lingokids
 * dress-up shows. Better: the children hear the full sentence "I'm wearing …" in the friend's own voice,
 * must combine two clues, and the friends really wear the clothes; no clock, no fail state.
 * Game feel: .claude/skills/game-animation + the game-designer / game-development skills. */

type Show = Extract<Scene, { kind: 'wearing-show' }>;
export const showWrongLine = 'Not me! Listen again.';
const Z: Record<string, number> = { socks: 1, pants: 2, shoes: 3, shirt: 4, dress: 4, skirt: 3, hat: 5 };
const layer = (who: string, piece: string) => `/lep1/dressup/${who}/${piece}.png`;
const SPOTS = [22, 50, 78];

export function WearingShowScene({ scene, onWin, onNext, sync }: { scene: Show; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { round: 0, gemDone: false });
  const { round, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const shown = r ?? scene.rounds[total - 1];
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [nope, setNope] = useState(-1);
  const [star, setStar] = useState(-1);
  const [flash, setFlash] = useState(0);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false; setMisses(0); setStar(-1);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.cast[r.answer]), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  useEffect(() => { if (done) void sayWithin(scene.doneLine, scene.who, 4000); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [done]);

  const pick = async (i: number) => {
    if (!r || busy.current) return;
    busy.current = true;
    const who = scene.cast[i];
    if (i !== r.answer) {
      sfx.wrong(); shake(); setNope(i); setMisses((m) => m + 1);
      await sayWithin(showWrongLine, who, 2200);
      setNope(-1); busy.current = false;
      return;
    }
    sfx.whoop(); setFlash((f) => f + 1); setStar(i);
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 90)); // hit-stop on the flash
    sfx.match(); fire(SPOTS[i], 40, 'sparkle'); fire(SPOTS[i], 30, 'stars');
    await sayWithin(r.reply, who, 3000);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
  };

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={70} />}
      {/* sweeping spotlights (calm, behind everyone) */}
      {!reduce && [0, 1].map((k) => (
        <motion.div key={k} className="pointer-events-none absolute top-[-10%] z-10 h-[110%] w-[26%] origin-top" style={{ left: `${30 + k * 26}%`, background: 'linear-gradient(180deg, rgba(255,250,210,0.45), rgba(255,250,210,0))', clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)' }}
          animate={{ rotate: k ? [14, -10, 14] : [-14, 10, -14] }} transition={{ duration: 6 + k, repeat: Infinity, ease: 'easeInOut' }} />
      ))}

      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3.1*var(--svw,1vw)), 5.2vh), 2.6rem)' }}>
          {r ? `“${r.line}”` : scene.doneLine}
        </span>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.cast[r.answer])} aria-label="Hear it again" className="absolute right-3 top-14 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* the friends, each wearing this round's outfit */}
      {scene.cast.map((who, i) => {
        const c = CAST[who];
        const outfit = [...(shown?.outfits[i] ?? [])].sort((a, b) => (Z[a] ?? 2) - (Z[b] ?? 2));
        const isStar = star === i || (done && i === shown?.answer);
        const glow = r && misses >= 2 && i === r.answer;
        return (
          <div key={who} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${SPOTS[i]}%`, top: '60%', height: '50vh', aspectRatio: '1 / 1' }}>
            {/* ground shadow */}
            <motion.span className="absolute bottom-[3%] left-1/2 h-[6%] w-[46%] -translate-x-1/2 rounded-[50%] bg-black/25 blur-sm" animate={isStar && !reduce ? { scaleX: [1, 0.7, 1.1, 1] } : { scaleX: 1 }} transition={{ duration: 0.8 }} />
            <motion.button onClick={() => { void pick(i); }} aria-label={c.name} className="absolute inset-0" style={{ transformOrigin: '50% 95%' }}
              whileTap={reduce ? undefined : { scale: 0.95 }}
              animate={reduce ? {} : nope === i ? { rotate: [0, -10, 10, -6, 6, 0], scale: 1 }
                : isStar ? { scale: [1, 1.18, 1.12], y: ['0%', '-8%', '-4%'], scaleX: [1, -1, 1] }
                : { scale: star >= 0 ? 0.92 : 1, y: ['0%', '-1.5%', '0%'], scaleX: 1 }}
              transition={nope === i ? { duration: 0.6 } : isStar ? { duration: 0.8, ease: 'easeOut' } : { y: { duration: 2.4 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 0.3 } }}>
              {glow && <span className="absolute inset-[12%] animate-pulse rounded-full bg-yellow-300/60 blur-xl" />}
              <img src={c.img} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]" />
              <AnimatePresence>
                {outfit.map((p) => (
                  <motion.img key={`${round}-${p}`} src={layer(who, p)} alt={p} draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08, filter: 'brightness(1.7)' }} animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 + (Z[p] ?? 2) * 0.06 }} />
                ))}
              </AnimatePresence>
            </motion.button>
          </div>
        );
      })}

      {/* camera flash */}
      <AnimatePresence>
        {flash > 0 && !reduce && (
          <motion.div key={flash} className="pointer-events-none absolute inset-0 z-40 bg-white" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} />
        )}
      </AnimatePresence>

      {/* stars: one per friend found */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full bg-white/85 px-3 py-1 shadow-lg">
        {scene.rounds.map((_, i) => <span key={i} className={`text-2xl ${i < round ? '' : 'opacity-25 grayscale'}`}>⭐</span>)}
      </div>

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[12%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function wearingShowLines(scene: Show) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.cast[r.answer], r.line], [scene.cast[r.answer], r.reply]]),
    ...scene.cast.map((w) => [w, showWrongLine]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
