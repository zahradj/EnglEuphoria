import { useMemo } from 'react';
import type { Scene, CharKey } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Who said it ---------- */

export function WhoSaidItScene({ scene, onWin, onNext, sync }: { scene: Extract<Scene, { kind: 'who-said-it' }>; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, phase: 'prompt' as 'prompt' | 'playing' | 'repeat' | 'done', tapped: null as CharKey | null, gemDone: false });
  const { round, phase, tapped, gemDone } = state;
  const total = scene.rounds.length;
  const finished = round >= total;

  const roster = useMemo(() => {
    const seen = new Set<string>();
    const list: CharKey[] = [];
    for (const r of scene.rounds) if (!seen.has(r.who)) { seen.add(r.who); list.push(r.who); }
    return list;
  }, [scene.rounds]);

  const spots = useMemo(() => {
    const n = roster.length;
    const leftPad = n <= 3 ? 18 : 10;
    const usable = 100 - leftPad * 2;
    const step = n > 1 ? usable / (n - 1) : 0;
    const sizeVh = n <= 3 ? 62 : 54;
    const widthVw = n <= 3 ? 30 : 24;
    return roster.map((who, i) => ({ who, leftPct: leftPad + step * i, bottomPct: 12, sizeVh, widthVw }));
  }, [roster]);

  const target = scene.rounds[round]?.who ?? null;
  const targetLine = scene.rounds[round]?.line ?? '';

  const pick = async (choice: CharKey) => {
    if (phase !== 'prompt' || !target) return;
    if (choice !== target) { sfx.wrong(); setState((s) => ({ ...s, tapped: null })); return; }
    sfx.match();
    setState((s) => ({ ...s, tapped: choice, phase: 'playing' }));
    await safeSpeak(targetLine, target);
    setState((s) => ({ ...s, phase: 'repeat' }));
    await new Promise((r) => window.setTimeout(r, 1600));
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, tapped: null, round: next, phase: next >= total ? 'done' : 'prompt', gemDone: s.gemDone || awardGem }));
  };

  const replayModel = async () => { if (target) await safeSpeak(targetLine, target); };

  return (
    <div className="absolute inset-0 z-10 overflow-hidden">
      {spots.map((s) => {
        const c = CAST[s.who];
        const isTarget = !finished && s.who === target;
        const isTapped = tapped === s.who;
        const speaking = (phase === 'playing' || phase === 'repeat') && s.who === target;
        const scale = isTapped ? 1.12 : speaking ? 1.08 : 1;
        return (
          <button key={s.who} onClick={() => pick(s.who)} disabled={phase !== 'prompt'} aria-label={`Tap ${c.name}`}
            className="absolute z-20 -translate-x-1/2 grid place-items-end cursor-pointer disabled:cursor-default"
            style={{ left: `${s.leftPct}%`, bottom: `${s.bottomPct}%`, height: `calc(${s.sizeVh}*var(--svh,1vh))`, width: `min(calc(${s.widthVw}*var(--svw,1vw)), calc(${s.sizeVh * 0.68}*var(--svh,1vh)))`, transform: `translateX(-50%) scale(${scale})`, transition: 'transform 0.3s ease-out', transformOrigin: '50% 100%' }}
          >
            <img src={c.img} alt={c.name} className="pointer-events-none block h-full w-full select-none object-contain" style={{ filter: speaking ? 'drop-shadow(0 12px 18px rgba(254,106,47,0.85))' : 'drop-shadow(0 10px 14px rgba(0,0,0,0.4))' }} />
            <span className={`pointer-events-none absolute left-1/2 -bottom-6 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-black shadow-lg whitespace-nowrap ${isTarget && phase === 'prompt' ? 'bg-orange-500 text-white animate-pulse' : 'bg-white/90 text-neutral-800'}`}>{c.name}</span>
          </button>
        );
      })}
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
        <div className="pointer-events-auto rounded-full bg-white/90 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-lg backdrop-blur">🎧 Listen & repeat — Round {Math.min(round + 1, total)} / {total}</div>
      </div>
      <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-6">
        {!finished && phase === 'prompt' && target && (
          <div className="w-full max-w-md rounded-3xl bg-white/85 p-3 text-center shadow-2xl backdrop-blur-md">
            <p className="text-base font-bold text-neutral-800">👉 Tap <span className="text-orange-600">{CAST[target].name}</span> to hear them.</p>
          </div>
        )}
        {!finished && (phase === 'playing' || phase === 'repeat') && (
          <button onClick={replayModel} className="rounded-full bg-white/90 px-5 py-2 text-sm font-black text-orange-700 shadow-md backdrop-blur active:scale-95">🔊 Hear again</button>
        )}
        {finished && <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Great job! Next →</button>}
      </div>
    </div>
  );
}
