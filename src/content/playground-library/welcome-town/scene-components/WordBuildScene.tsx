import { useEffect } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { MAGIC_GRADIENT, MagicLayer } from './shared';
import { CalmBg } from '../../unit1/scene-components/gameFx';
import { SKIN, PILL_FONT, jewel } from '../../gameSkin';

/* ---------- Word build (blend taught sounds into a real word) ---------- */

export function WordBuildScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'word-build' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, filled: null as string | null, wrong: null as string | null, gemDone: false });
  const { round, filled, wrong, gemDone } = state;
  const r = scene.rounds[round];
  const total = scene.rounds.length;
  const complete = round >= total;

  useEffect(() => {
    if (complete) return;
    setState((s) => ({ ...s, filled: null, wrong: null }));
    const t = window.setTimeout(() => void safeSpeak(r.word, 'pip'), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, complete]);

  const tap = async (letter: string) => {
    if (filled || complete) return;
    if (letter.toLowerCase() === r.answer.toLowerCase()) {
      sfx.match();
      setState((s) => ({ ...s, filled: letter }));
      await safeSpeak(r.word, 'pip');
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
        {scene.magic ? <MagicLayer /> : <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />}
        <Confetti count={50} />
        <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You read {total} words! ⭐ Next</button>
      </div>
    );
  }

  const letters = r.tiles ?? r.word.split('');
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-cover bg-center pb-24" style={scene.magic ? { backgroundImage: `url(${scene.bg})` } : undefined}>
      {scene.magic ? <MagicLayer /> : <CalmBg img={scene.bg} />}
      <div className={`pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 px-5 py-2 text-center ${scene.magic ? 'rounded-full font-black text-white shadow-xl' : SKIN.pill}`} style={scene.magic ? { background: MAGIC_GRADIENT } : { fontSize: PILL_FONT }}>{scene.magic ? '🪄' : '🧩'} {scene.teacher} <span className="ml-1 opacity-70">({round + 1}/{total})</span></div>
      <div className={`relative z-10 flex w-full max-w-[600px] flex-col items-center gap-5 px-6 py-5 ${scene.magic ? '' : SKIN.frame}`}>
        <button onClick={() => void safeSpeak(r.word, 'pip')} className="grid h-40 w-40 place-items-center rounded-full bg-[radial-gradient(circle,#FFFBF3_55%,#F7E8CF_100%)] p-4 shadow-[0_0_0_0.5vh_#F2C46D,0_1.6vh_3vh_rgba(20,6,45,0.45)] transition active:scale-95 sm:h-48 sm:w-48" aria-label={`Hear ${r.word}`}>
          {r.img ? <img src={r.img} alt={r.word} className="h-full w-full object-contain drop-shadow-2xl" draggable={false} /> : <span className="text-7xl drop-shadow-2xl">{r.emoji}</span>}
        </button>
        <div className="flex items-end gap-2">
          {letters.map((ch, i) => {
            const isBlank = i === r.blankIndex;
            const display = isBlank ? (filled ?? '_') : ch;
            return <div key={i} className={`grid place-items-center font-black uppercase ${isBlank ? (filled ? `rounded-[2vh] border-[0.35vh] ${SKIN.right}` : 'rounded-[2vh] border-[0.4vh] border-dashed border-[#F2C46D] bg-white/10 text-[#FDE68A]') : `${SKIN.card} ${SKIN.ink}`}`} style={{ minWidth: 62, padding: '0 8px', height: 78, fontSize: 42 }}>{display}</div>;
          })}
        </div>
        <button onClick={() => void safeSpeak(r.word, 'pip')} className="rounded-full bg-[#EDE4FF] px-6 py-2 text-sm font-black text-[#3B1E66] shadow active:scale-95">🔊 Listen</button>
        <div className="flex flex-wrap justify-center gap-3">
          {r.choices.map((L, i) => (
            <button key={L} onClick={() => tap(L)} disabled={!!filled} className={`grid h-20 w-20 place-items-center rounded-[2vh] text-4xl font-black transition active:scale-95 disabled:opacity-40 sm:h-24 sm:w-24 sm:text-5xl ${scene.magic ? 'border-4 border-white text-white shadow-2xl' : jewel(i)} ${wrong === L ? 'animate-[lep1-shake_0.4s_ease-out]' : ''}`} style={scene.magic ? { background: i % 2 === 0 ? 'linear-gradient(135deg,#6D28D9,#A855F7)' : 'linear-gradient(135deg,#B45309,#F59E0B)' } : undefined}>{L}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
