import { useEffect } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CLAY_CARD } from './shared';

/* ---------- Home Mission ----------
 * The blueprint's real-world "Home Mission" (Novakid / Oxford home-link
 * style): one tiny task to do with the family, shown as 2-3 picture steps a
 * non-reader can follow (find → show → say), read aloud by the character,
 * with a short note for the parent. The child accepts it and gets a stamp. */

type Mission = Extract<Scene, { kind: 'home-mission' }>;

export function HomeMissionScene({ scene, onWin, onNext, sync }: { scene: Mission; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { accepted: false });
  const { accepted } = state;

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(scene.line, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const accept = () => {
    if (accepted) return;
    sfx.gem(); onWin(true);
    setState({ accepted: true });
    cueSpeak('Mission accepted!', scene.who);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900/10 to-black/30" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        🏠 Home Mission
      </div>
      <button onClick={() => cueSpeak(scene.line, scene.who)} className="absolute right-3 top-3 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>

      <div className="absolute inset-x-0 top-[13%] bottom-[16%] z-20 flex items-center justify-center px-4">
        <div className={`${CLAY_CARD} relative flex max-w-[92%] flex-col items-center gap-4 px-6 py-5`} style={{ animation: 'lep1-pop 0.45s ease-out' }}>
          {/* Picture steps: find → show → say */}
          <div className="flex items-center gap-2 sm:gap-4">
            {scene.steps.map((st, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="relative grid h-[min(22vh,18vw)] w-[min(22vh,18vw)] place-items-center rounded-3xl bg-white shadow-lg ring-4 ring-orange-100">
                    <span className="absolute -left-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-base font-black text-white shadow">{i + 1}</span>
                    {st.img ? <img src={st.img} alt="" className="h-[78%] w-[78%] object-contain" /> : <span className="text-[min(12vh,10vw)] leading-none">{st.emoji}</span>}
                    {st.img && st.emoji && <span className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-full bg-white text-2xl shadow">{st.emoji}</span>}
                  </div>
                  {st.say && <div className="rounded-full bg-orange-50 px-3 py-0.5 text-sm font-black text-orange-700">{st.say}</div>}
                </div>
                {i < scene.steps.length - 1 && <span className="text-3xl text-orange-400">➜</span>}
              </div>
            ))}
          </div>
          <div className="max-w-md text-center text-xs font-semibold text-neutral-500">👪 {scene.parentNote}</div>
          {accepted && <div className="pointer-events-none absolute -right-4 -top-6 rounded-2xl border-4 border-emerald-500 bg-white/90 px-3 py-1 text-xl font-black uppercase text-emerald-600" style={{ animation: 'lep1-stamp 0.5s ease-out forwards' }}>✔ Accepted!</div>}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[4%] z-30 flex justify-center">
        {accepted
          ? <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
          : <button onClick={accept} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>👍 I'll do it!</button>}
      </div>
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function homeMissionLines(scene: Mission) {
  return [[scene.who, scene.line], [scene.who, 'Mission accepted!']] as [string, string][];
}
