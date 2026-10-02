import { useEffect } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, playLetterPhonic, playLetterName } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';

/* ---------- Letter game (end-of-lesson review: name mode = "alphabet
   game", sound mode = "sound game" — same tap-the-right-letter mechanic as
   WordBuildScene's round progression, just matching a letter NAME or a
   PHONEME rather than filling a word's blank) ---------- */

export function LetterGameScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'letter-game' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, correctPick: false, wrong: null as string | null, gemDone: false });
  const { round, correctPick, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const complete = round >= total;
  const r = scene.rounds[round];
  const c = CAST[scene.who];

  const playPrompt = async () => {
    if (scene.mode === 'sound') await playLetterPhonic(r.letter);
    else await safeSpeak(`Find the letter ${r.letter}!`, voiceOf(scene.who));
  };

  useEffect(() => {
    if (complete) return;
    setState((s) => ({ ...s, correctPick: false, wrong: null }));
    const t = window.setTimeout(() => void playPrompt(), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, complete]);

  const tap = async (letter: string) => {
    if (correctPick || complete) return;
    if (letter === r.letter) {
      sfx.match();
      setState((s) => ({ ...s, correctPick: true }));
      // The letter is the recorded letter-name clip; a voice reading "S!"
      // alone came out as "Yes!" / "N!" as "Then" (2026-10-02 audit).
      await playLetterName(r.letter);
      await safeSpeak('Great job!', voiceOf(scene.who));
      window.setTimeout(() => {
        const next = round + 1;
        const awardGem = next >= total && !gemDone;
        if (awardGem) { sfx.gem(); onWin(true); }
        setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
      }, 900);
    } else {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: letter }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: null })), 500);
    }
  };

  if (complete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <Confetti count={50} />
        <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">
          {scene.mode === 'sound' ? 'Great listening!' : 'Great letter hunting!'} ⭐ Next
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/15" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        {scene.mode === 'sound' ? '\u{1F50A}' : '\u{1F524}'} {scene.teacher} <span className="ml-1 opacity-70">({round + 1}/{total})</span>
      </div>
      <div className="relative z-10 flex w-full max-w-[560px] flex-col items-center gap-6 px-4">
        <button
          onClick={playPrompt}
          aria-label={scene.mode === 'sound' ? 'Hear the sound again' : 'Hear the letter name again'}
          className="grid h-32 w-32 place-items-center rounded-[2rem] border-8 bg-white/95 shadow-2xl transition active:scale-95"
          style={{ borderColor: c.color }}
        >
          <span className="text-5xl">{scene.mode === 'sound' ? '\u{1F50A}' : '\u{1F5E3}\u{FE0F}'}</span>
        </button>
        {scene.mode === 'sound' && r.phoneme && (
          <div className="rounded-2xl border-4 bg-white px-5 py-2 text-center text-xl font-black shadow-xl" style={{ color: c.color, borderColor: c.color }}>{r.phoneme} {r.phoneme}</div>
        )}
        <div className="flex flex-wrap justify-center gap-4">
          {r.choices.map((L, i) => (
            <button
              key={L}
              onClick={() => tap(L)}
              disabled={correctPick}
              className={`grid h-24 w-24 place-items-center rounded-3xl border-4 border-white text-5xl font-black text-white shadow-2xl transition active:scale-95 disabled:opacity-40 sm:h-28 sm:w-28 ${wrong === L ? 'animate-[lep1-shake_0.4s_ease-out]' : ''} ${correctPick && L === r.letter ? 'ring-4 ring-green-300' : ''}`}
              style={{ background: i % 2 === 0 ? 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' : 'linear-gradient(135deg,#B85CD1,#D57BE6)' }}
            >
              {L}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
