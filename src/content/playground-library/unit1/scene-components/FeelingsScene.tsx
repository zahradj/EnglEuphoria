import { useState } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak, type Character } from '../audio';

/* ---------- Feelings ---------- */

export function FeelingsScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'feelings' }>; onNext: () => void }) {
  const [pick, setPick] = useState<number | null>(null);
  const choose = async (idx: number) => {
    setPick(idx);
    const label = scene.options[idx].label.toLowerCase();
    const voice: Character = label.includes('happy') ? 'mia' : label.includes('sad') ? 'bella' : 'pip';
    await safeSpeak(scene.options[idx].reply, voice);
  };
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-cover bg-center px-4 pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="relative z-20 max-w-lg rounded-full bg-white/95 px-5 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">{scene.teacher}</div>
      <div className="relative z-10 grid grid-cols-3 gap-3">
        {scene.options.map((o, idx) => (
          <button key={idx} onClick={() => choose(idx)} className={`grid aspect-square w-24 place-items-center rounded-3xl bg-white/95 shadow-xl transition active:scale-95 sm:w-28 ${pick === idx ? 'ring-4 ring-orange-500 scale-105' : 'hover:scale-105'}`}>
            <span className="text-5xl sm:text-6xl">{o.emoji}</span>
            <span className="mt-1 text-xs font-bold text-neutral-700 sm:text-sm">{o.label}</span>
          </button>
        ))}
      </div>
      {pick !== null && (
        <div className="relative z-20 max-w-md rounded-3xl bg-white/95 px-6 py-4 text-center shadow-2xl">
          <p className="text-lg font-bold text-orange-700">{scene.options[pick].reply}</p>
        </div>
      )}
      <button onClick={onNext} disabled={pick === null} className="relative z-20 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">Finish 🎉</button>
    </div>
  );
}
