import { useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak, cueSpeakOnce } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CalmBg } from '../../unit1/scene-components/gameFx';
import { SKIN, PILL_FONT } from '../../gameSkin';

/* ---------- True / False (a spoken statement, judged True or False — a
   fast binary listening check, no scene-hotspot dependency, so it can
   freely mix content across topics/backgrounds in one scene). ---------- */

export function TrueFalseScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'true-false' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, picked: null as 'true' | 'false' | null, correct: false });
  const { round, picked, correct } = state;
  const gemDone = useRef(false);
  const total = scene.rounds.length;
  const complete = round >= total;
  const r = !complete ? scene.rounds[round] : null;

  useEffect(() => {
    if (complete) return;
    setState((s) => ({ ...s, picked: null, correct: false }));
    if (!scene.read) cueSpeakOnce(r!.statement, voiceOf(r!.who));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, complete]);

  const answer = (guess: boolean) => {
    if (!r || correct) return;
    if (guess !== r.isTrue) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, picked: guess ? 'true' : 'false' }));
      window.setTimeout(() => setState((s) => ({ ...s, picked: null })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, picked: guess ? 'true' : 'false', correct: true }));
    if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    window.setTimeout(() => setState((s) => ({ ...s, round: s.round + 1 })), 900);
  };

  if (complete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <Confetti count={50} />
        <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">{scene.read ? 'Great reading!' : 'Great listening!'} ⭐ Next</button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <CalmBg img={scene.bg} />
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center px-4">
        <div className={`px-5 py-2 text-center ${SKIN.pill}`} style={{ fontSize: PILL_FONT }}>
          {scene.teacher} <span className="ml-1 opacity-60">({round + 1}/{total})</span>
        </div>
      </div>
      {scene.img && (
        // Reading version: the picture to check the sentences against (Cambridge Starters R&W Part 2).
        <div className="absolute left-1/2 top-[17%] z-10 h-[34%] -translate-x-1/2 overflow-hidden rounded-[2.4vh] border-[0.6vh] border-[#F2C46D] shadow-[0_1.6vh_3vh_rgba(20,6,45,0.5)]" style={{ aspectRatio: '16 / 9' }}>
          <img src={scene.img} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className={`absolute inset-x-0 z-10 flex justify-center px-6 ${scene.img ? 'top-[54%]' : 'top-1/3'}`}>
        <div className={`max-w-xl px-6 py-4 text-center ${SKIN.panel}`}>
          <p className={`text-2xl font-black ${SKIN.ink}`}>{scene.read ? '📖 ' : ''}“{r!.statement}”</p>
          <button onClick={() => cueSpeak(r!.statement, voiceOf(r!.who))} className="mt-2 rounded-full bg-[#EDE4FF] px-3 py-0.5 text-sm font-bold text-[#6B4E8C] active:scale-95">🔊 {scene.read ? 'Help: hear it' : 'Hear it again'}</button>
        </div>
      </div>
      <div className={`absolute inset-x-0 z-20 flex justify-center gap-6 px-4 ${scene.img ? 'bottom-4' : 'bottom-10'}`}>
        <button
          onClick={() => answer(true)} disabled={correct}
          className={`grid h-24 w-32 place-items-center rounded-[2.4vh] border-[0.4vh] text-2xl font-black transition active:scale-95 sm:h-28 sm:w-40 ${picked === 'true' && !correct ? `animate-[lep1-shake_0.4s_ease-in-out] ${SKIN.wrong}` : picked === 'true' && correct ? SKIN.right : 'border-[#99F6E4] bg-gradient-to-b from-[#2DD4BF] to-[#0D9488] text-white shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.35),0_0.7vh_0_#115E59,0_1.4vh_2.2vh_rgba(17,94,89,0.35)]'}`}
        >✓ True</button>
        <button
          onClick={() => answer(false)} disabled={correct}
          className={`grid h-24 w-32 place-items-center rounded-[2.4vh] border-[0.4vh] text-2xl font-black transition active:scale-95 sm:h-28 sm:w-40 ${picked === 'false' && !correct ? `animate-[lep1-shake_0.4s_ease-in-out] ${SKIN.wrong}` : picked === 'false' && correct ? SKIN.right : 'border-[#FBCFE8] bg-gradient-to-b from-[#F472B6] to-[#DB2777] text-white shadow-[inset_0_0.35vh_0_rgba(255,255,255,0.35),0_0.7vh_0_#9D174D,0_1.4vh_2.2vh_rgba(157,23,77,0.35)]'}`}
        >✗ False</button>
      </div>
    </div>
  );
}
