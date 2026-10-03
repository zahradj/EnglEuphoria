import { useEffect, useMemo } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { sayWithin } from './shared';

/* ---------- Magic Paint Pots (Pre-A1 Unit 2 Lesson 2 signature game) ----------
 * Lesson 1's colours make Lesson 2's: Pip names two paints ("Mix blue and
 * yellow!"), the child taps those two pots into the magic pot (listening
 * review of red/blue/yellow), the pot bubbles into the new colour, and the
 * child names it — "It's green!" — which brings that round's object to life
 * in its colour (the grey frog turns green). The new word is what wins the
 * round, so the language IS the game. */

export function mixLine(a: string, b: string) {
  return `Mix ${a.toLowerCase()} and ${b.toLowerCase()}!`;
}
export const MIX_QUESTION = 'What color is it?';
export function resultLine(color: string) {
  return `It's ${color.toLowerCase()}!`;
}

type Phase = 'pick' | 'bubble' | 'name' | 'reveal';

export function ColorMixScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'color-mix' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    picked: [] as string[],
    phase: 'pick' as Phase,
    wrong: '',
    gemDone: false,
  });
  const { round, picked, phase, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const pickedSet = useMemo(() => new Set(picked), [picked]);
  const paintHex = (w: string) => scene.paints.find((p) => p.colorWord === w)?.colorHex ?? '#ccc';

  // Each round opens with Pip naming the two paints to mix.
  useEffect(() => {
    if (!r) return;
    setState((s) => ({ ...s, picked: [], phase: 'pick', wrong: '' }));
    const t = window.setTimeout(() => cueSpeak(mixLine(r.a, r.b), scene.who), 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const tapPaint = async (w: string) => {
    if (!r || phase !== 'pick' || pickedSet.has(w)) return;
    if (w !== r.a && w !== r.b) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: w }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
      return;
    }
    sfx.pop();
    const next = [...picked, w];
    setState((s) => ({ ...s, picked: next }));
    if (next.length === 2) {
      setState((s) => ({ ...s, phase: 'bubble' }));
      sfx.reveal();
      await new Promise((res) => setTimeout(res, 1400));
      setState((s) => ({ ...s, phase: 'name' }));
      await sayWithin(MIX_QUESTION, scene.who);
    }
  };

  const tapName = async (w: string) => {
    if (!r || phase !== 'name') return;
    if (w !== r.result) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: w }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, phase: 'reveal' }));
    await sayWithin(resultLine(r.result), scene.who);
    await sayWithin(r.line, r.who);
    await new Promise((res) => setTimeout(res, 700));
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
  };

  if (!r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex gap-4">
            {scene.rounds.map((x) => (
              <img key={x.result} src={x.img} alt={x.label} className="h-[20vh] w-auto drop-shadow-xl" draggable={false} />
            ))}
          </div>
          <div className="rounded-3xl bg-white px-8 py-3 text-2xl font-black text-orange-600 shadow-2xl">🎨 You made green, orange and purple!</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  const mixed = phase === 'bubble' || phase === 'name' || phase === 'reveal';
  const fill = mixed ? r.resultHex : picked.length === 1 ? paintHex(picked[0]) : '#ffffff';
  const c = CAST[r.who];

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/25" />

      {/* Prompt */}
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {phase === 'pick' ? `🎨 ${mixLine(r.a, r.b)}` : phase === 'name' ? `🗣️ ${MIX_QUESTION} Say it, then tap it!` : phase === 'reveal' ? `✨ ${resultLine(r.result)}` : '🫧 Bubble, bubble…'}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(phase === 'name' ? MIX_QUESTION : mixLine(r.a, r.b), scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>

      {/* The object for this round: grey until its colour is named. */}
      <div className="absolute right-[6%] top-[18%] z-20 flex flex-col items-center">
        <img
          src={r.img}
          alt={r.label}
          className={`h-[30vh] w-auto drop-shadow-2xl transition-all duration-700 ${phase === 'reveal' ? 'animate-[lep1-pop_0.5s_ease-out]' : ''}`}
          style={{ filter: phase === 'reveal' ? 'none' : 'grayscale(1) brightness(1.1) opacity(0.85)' }}
          draggable={false}
        />
        {phase === 'reveal' && (
          <div className="mt-2 rounded-2xl bg-white px-4 py-2 text-xl font-black shadow-xl" style={{ color: c.color }}>{r.line}</div>
        )}
      </div>

      {/* Magic pot */}
      <div className="absolute left-1/2 top-[22%] z-20 -translate-x-1/2">
        <div className="relative h-[34vh] w-[34vh]">
          <div className="absolute inset-x-[12%] top-[18%] h-[22%] rounded-[50%] transition-colors duration-700" style={{ backgroundColor: fill, boxShadow: mixed ? `0 0 40px ${r.resultHex}` : 'none' }} />
          {phase === 'bubble' && (
            <div className="absolute inset-x-[20%] top-[2%] flex justify-around">
              {[0, 1, 2].map((i) => (
                <span key={i} className="block h-6 w-6 animate-bounce rounded-full opacity-80" style={{ backgroundColor: r.resultHex, animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          )}
          <img src={scene.potImg} alt="" className="relative h-full w-full object-contain drop-shadow-2xl" draggable={false} />
        </div>
      </div>

      {/* Paints (Lesson 1 colours) or the colour-name answers */}
      <div className="absolute inset-x-0 bottom-[6%] z-30 flex flex-wrap justify-center gap-4 px-4">
        {phase === 'pick' || phase === 'bubble'
          ? scene.paints.map((p) => (
              <button
                key={p.colorWord}
                onClick={() => tapPaint(p.colorWord)}
                disabled={phase !== 'pick'}
                className={`flex min-h-[64px] flex-col items-center rounded-3xl border-4 bg-white px-5 py-2 shadow-2xl transition active:scale-95 ${pickedSet.has(p.colorWord) ? 'opacity-40' : ''} ${wrong === p.colorWord ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : 'border-white'}`}
              >
                <span className="block h-12 w-12 rounded-full border-4 border-white shadow-inner" style={{ backgroundColor: p.colorHex }} />
                <span className="mt-1 text-lg font-black text-neutral-800">{p.colorWord.toLowerCase()}</span>
              </button>
            ))
          : phase === 'name'
            ? scene.answers.map((a) => (
                <button
                  key={a.colorWord}
                  onClick={() => tapName(a.colorWord)}
                  className={`min-h-[64px] rounded-3xl border-4 px-7 py-3 text-2xl font-black text-white shadow-2xl transition active:scale-95 ${wrong === a.colorWord ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : 'border-white'}`}
                  style={{ backgroundColor: a.colorHex }}
                >
                  {a.colorWord.toLowerCase()}
                </button>
              ))
            : null}
      </div>
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function colorMixLines(scene: Extract<Scene, { kind: 'color-mix' }>) {
  return scene.rounds.flatMap((r) => [
    [scene.who, mixLine(r.a, r.b)],
    [scene.who, resultLine(r.result)],
    [r.who, r.line],
  ]).concat([[scene.who, MIX_QUESTION]]);
}
