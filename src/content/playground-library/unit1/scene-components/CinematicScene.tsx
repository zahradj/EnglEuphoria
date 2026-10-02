import { useEffect, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, stopSpeaking } from '../audio';

/* ---------- Cinematic ---------- */

export function CinematicScene({ scene, onNext }: { scene: Extract<Scene, { kind: 'cinematic' }>; onNext: () => void }) {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;
      setStep(0);
      for (let i = 0; i < scene.script.length; i++) {
        if (cancelled) return;
        setStep(i);
        await safeSpeak(scene.script[i].line, scene.script[i].who);
      }
      if (!cancelled) setStep(scene.script.length);
    }
    run();
    return () => { cancelled = true; stopSpeaking(); };
  }, [scene.id]);

  const currentLine = step < 0 ? '…' : step < scene.script.length ? scene.script[step].line : 'Ready?';

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-1/2 top-8 -translate-x-1/2 text-center">
        <h1 className="text-4xl font-black text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)] sm:text-5xl">{scene.title}</h1>
        <p className="mt-1 text-sm font-semibold text-white/95 drop-shadow sm:text-base">{scene.subtitle}</p>
      </div>
      {scene.id !== 'intro' && !scene.hidePipOverlay && (
        <img src={CAST.pip.img} alt="Pip" className="absolute bottom-[calc(18*var(--svh,1vh))] left-1/2 -translate-x-1/2 object-contain drop-shadow-2xl" style={{ height: 'clamp(220px, calc(34*var(--svh,1vh)), 420px)', animation: 'lep1-walk 3.2s ease-in-out infinite' }} />
      )}
      {step >= 0 && step < scene.script.length && (
        <div className="absolute bottom-[calc(52*var(--svh,1vh))] left-1/2 max-w-[520px] -translate-x-1/2 px-4">
          <div className="relative rounded-3xl bg-white px-6 py-4 text-center text-2xl font-black text-orange-800 shadow-2xl">
            “{currentLine}”
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 border-x-[14px] border-t-[16px] border-x-transparent border-t-white" />
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-8 z-50 flex justify-center">
        <button onClick={onNext} className="rounded-full bg-white px-8 py-4 text-base font-black uppercase tracking-widest text-orange-700 shadow-2xl transition hover:scale-[1.04]">
          🎮 {scene.cta}
        </button>
      </div>
    </div>
  );
}
