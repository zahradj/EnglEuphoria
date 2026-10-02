import { useEffect } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import { Confetti } from '../../unit1/fx';
import { voiceOf, CARD_STYLE, CARD_FONT } from './shared';

/* ---------- Finale ---------- */

export function FinaleScene({ scene, hearts, gems, onRestart }: { scene: Extract<Scene, { kind: 'finale' }>; hearts: number; gems: number; onRestart: () => void }) {
  useEffect(() => { cueSpeak(scene.line, voiceOf(scene.who)); }, [scene.id]);
  const stars = 1 + Math.min(2, Math.floor(hearts / 2)) + (gems >= 3 ? 1 : 0);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center px-4" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
      <Confetti />
      <div className={`relative z-10 w-full max-w-sm rounded-3xl p-5 text-center shadow-2xl ${scene.look === 'card' ? '' : 'border border-white/40 bg-white/95 text-neutral-900 backdrop-blur-2xl ring-1 ring-white/30'}`} style={scene.look === 'card' ? { ...CARD_STYLE, fontFamily: CARD_FONT } : undefined}>
        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: scene.look === 'card' ? '#7C3AED' : '#F97316' }}>Lesson Complete!</p>
        <h2 className={`mt-1 text-4xl font-black ${scene.look === 'card' ? '' : 'text-orange-800'}`}>🎉 You did it!</h2>
        <div className="my-4 flex justify-center gap-2 text-5xl">
          {[0, 1, 2, 3].map((i) => <span key={i} className={i < stars ? '' : 'opacity-20'}>⭐</span>)}
        </div>
        <div className="mx-auto grid grid-cols-3 gap-2 rounded-3xl bg-white/70 p-3">
          {(scene.cast ?? (['marigold', 'pip', 'mia', 'bella', 'willow', 'leo'] as const)).map((k, i) => {
            const c = CAST[k];
            return (
              <div key={k} className="grid place-items-center">
                <span className="text-3xl" style={{ animation: `lep1-hop 1.6s ease-in-out ${i * 0.1}s infinite` }}>{c.emoji}</span>
                <span className="text-[10px] font-black" style={{ color: c.color }}>{c.name}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-lg font-bold text-orange-700">"{scene.line}"</p>
        <button onClick={onRestart} className="mt-5 w-full rounded-full bg-white py-3 font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔁 Play again</button>
      </div>
    </div>
  );
}
