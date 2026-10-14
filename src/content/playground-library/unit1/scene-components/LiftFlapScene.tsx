import { useEffect, useMemo } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, sayWithin } from './shared';

/* ---------- Where's the star? (lift the flap) ----------
 * The lift-the-flap picture-book pattern (Eric Hill's "Where's Spot?"): a
 * predictable question/answer refrain young children join in with —
 * "Is it under the hat? — No! It's a bat!" The child taps a hiding place,
 * hears (and says) the question, the cover flips up and the surprise is
 * named. The thing being searched for only appears once every other place
 * has been checked, so the suspense builds and every question gets said.
 * Positions are % of the scene; covers are stickers (no white cards).
 * GUIDED mode (`guided`, owner 2026-10-13: "the activity must be organized"): the places are visited in order. The
 * banner asks "Where is the star? Is it under the hat?" and only the hat can be tapped; the bat pops out, Leo asks
 * "What is it?" and the child answers ("It's a bat!" — 🔊 helps, then "I said it!"); the model line follows
 * ("No! It's a bat!") and the next place lights up. The star comes last. */

export const LIFT_WHAT = 'What is it?';
/** What the child answers for a place: `say`, or the reveal without its leading "No!" / "Yes!". */
export const liftSay = (s: { say?: string; reveal: string }) => s.say ?? s.reveal.replace(/^(No|Yes)!\s*/i, '');

type Lift = Extract<Scene, { kind: 'lift-flap' }>;

export function LiftFlapScene({ scene, onWin, onNext, sync }: { scene: Lift; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { lifted: [] as number[], busy: false, nudge: -1, found: false, step: 0, saying: false });
  const { lifted, busy, nudge, found } = state;
  const guided = !!scene.guided;
  const step = Math.max(0, Math.min(scene.spots.length - 1, Number(state.step) || 0));
  const saying = guided && !!state.saying;
  const cur = scene.spots[step];
  const liftedSet = useMemo(() => new Set(lifted), [lifted]);
  const targetIdx = scene.spots.findIndex((s) => s.target);
  const othersLeft = scene.spots.filter((s, i) => !s.target && !liftedSet.has(i)).length;

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(guided && cur ? `${scene.question} ${cur.ask}` : scene.question, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id, step]);

  /** Guided: the child said the answer — the model line, then the next place. */
  const said = async () => {
    if (!guided || !saying || !cur || busy) return;
    setState((st) => ({ ...st, busy: true }));
    sfx.click();
    await sayWithin(cur.reveal, scene.who);
    setState((st) => ({ ...st, busy: false, saying: false, step: Math.min(scene.spots.length - 1, (Number(st.step) || 0) + 1) }));
  };

  const tap = async (i: number) => {
    const s = scene.spots[i];
    if (!s || busy || found || liftedSet.has(i) || saying) return;
    if (guided && i !== step) {
      setState((st) => ({ ...st, nudge: i }));
      cueSpeak(cur?.ask ?? scene.question, scene.who);
      window.setTimeout(() => setState((st) => ({ ...st, nudge: -1 })), 900);
      return;
    }
    setState((st) => ({ ...st, busy: true }));
    if (guided) {
      sfx.pop(); sfx.match();
      setState((st) => ({ ...st, lifted: [...st.lifted, i], found: !!s.target || st.found }));
      if (s.target) { await sayWithin(s.reveal, scene.who); sfx.gem(); onWin(true); setState((st) => ({ ...st, busy: false })); return; }
      await sayWithin(LIFT_WHAT, scene.who);
      setState((st) => ({ ...st, busy: false, saying: true }));
      return;
    }
    sfx.pop();
    await sayWithin(s.ask, scene.who);
    if (s.target && othersLeft > 0) {
      setState((st) => ({ ...st, busy: false, nudge: i }));
      cueSpeak(scene.notYet, scene.who);
      window.setTimeout(() => setState((st) => ({ ...st, nudge: -1 })), 900);
      return;
    }
    sfx.match();
    setState((st) => ({ ...st, lifted: [...st.lifted, i], found: !!s.target || st.found }));
    await sayWithin(s.reveal, scene.who);
    if (s.target) { sfx.gem(); onWin(true); }
    setState((st) => ({ ...st, busy: false }));
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      {found && <Confetti count={60} />}
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {found ? `🎉 ${scene.spots[targetIdx]?.reveal ?? ''}` : guided && cur ? (saying ? `🗣️ ${LIFT_WHAT} Say it!` : `🔍 ${scene.question} ${cur.ask}`) : `🔍 ${scene.question}`}
      </div>
      <button onClick={() => cueSpeak(guided && cur ? (saying ? LIFT_WHAT : `${scene.question} ${cur.ask}`) : scene.question, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>

      {scene.spots.map((s, i) => {
        const up = liftedSet.has(i);
        return (
          <button
            key={i}
            onClick={() => tap(i)}
            aria-label={s.ask}
            className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity ${nudge === i ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''} ${guided && !found && !up && i !== step ? 'opacity-45' : ''}`}
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}%`, aspectRatio: '1' }}
          >
            {/* What was hidden: pops up once the cover is lifted */}
            {up && (
              <span className="absolute inset-[8%] block" style={{ filter: STICKER_FILTER, animation: 'lep1-pop 0.55s ease-out' }}>
                {s.target && <span className="absolute -inset-4 rounded-full bg-yellow-200/80 blur-2xl" />}
                <img src={s.under.img} alt={s.under.label} draggable={false} className="relative h-full w-full object-contain" style={{ animation: 'lep1-wobble 1.4s ease-in-out infinite' }} />
              </span>
            )}
            {/* The cover: a sticker that flips up and away */}
            {s.cover ? (
              <span
                className="absolute inset-0 block transition-all duration-700"
                style={{
                  filter: STICKER_FILTER,
                  transform: up ? 'translate(18%, -78%) rotate(28deg) scale(0.7)' : 'none',
                  opacity: up ? 0.55 : 1,
                  transitionTimingFunction: 'cubic-bezier(.3,1.4,.5,1)',
                }}
              >
                <img src={s.cover.img} alt={s.cover.label} draggable={false} className="h-full w-full object-contain" />
              </span>
            ) : (
              // A place painted in the picture (the tree): a soft glow invites a tap.
              !up && <span className="absolute inset-[20%] rounded-full bg-yellow-200/40 blur-xl" style={{ animation: 'lep1-ping 1.8s ease-in-out infinite' }} />
            )}
            {!up && !found && (!guided || (i === step && !saying)) && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-2xl" style={{ animation: 'lep1-bob 1.6s ease-in-out infinite' }}>👆</span>}
          </button>
        );
      })}

      {/* Guided: the child answers what popped out */}
      {saying && cur && (
        <div className="absolute inset-x-0 bottom-[5%] z-30 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 rounded-3xl bg-white/95 px-5 py-2 shadow-2xl">
            <img src={cur.under.img} alt="" draggable={false} className="h-16 w-16 object-contain" />
            <span className="text-2xl font-black text-orange-700">🗣️ {LIFT_WHAT}</span>
            <button onClick={() => { sfx.click(); cueSpeak(liftSay(cur), scene.who); }} className="rounded-full bg-orange-100 px-3 py-1 text-lg font-black text-orange-700 active:scale-95">🔊 Help</button>
          </div>
          <button onClick={() => void said()} className={`${CLAY_BUTTON} px-8 py-2 text-xl`}>✓ I said it!</button>
        </div>
      )}

      {found && (
        <div className="absolute inset-x-0 bottom-[6%] z-30 flex justify-center">
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </div>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function liftFlapLines(scene: Lift) {
  return [
    [scene.who, scene.question], [scene.who, scene.notYet], [scene.who, LIFT_WHAT],
    ...scene.spots.flatMap((s) => [[scene.who, s.ask], [scene.who, s.reveal], [scene.who, `${scene.question} ${s.ask}`], [scene.who, liftSay(s)]]),
  ] as [string, string][];
}
