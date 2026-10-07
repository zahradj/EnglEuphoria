import { useEffect, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../../unit1/audio';
import { voiceOf, CARD_STYLE, CARD_FONT } from './shared';
import { StoryCaption } from '../../StoryCaption';

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
        const lineStart = Date.now();
        await safeSpeak(scene.script[i].line, voiceOf(scene.script[i].who));
        if (cancelled) return;
        // Advancing the instant TTS finishes let short lines flash by
        // before a young reader could actually read them — floor each
        // line at a minimum on-screen time (scaled to length, so long
        // lines aren't held back once their audio already covers it).
        const minMs = Math.min(5500, Math.max(2200, scene.script[i].line.length * 60));
        const elapsed = Date.now() - lineStart;
        if (elapsed < minMs) await new Promise((r) => setTimeout(r, minMs - elapsed));
      }
      if (!cancelled) setStep(scene.script.length);
    }
    run();
    return () => { cancelled = true; };
  }, [scene.id]);

  const currentLine = step < 0 ? '…' : step < scene.script.length ? scene.script[step].line : 'Ready?';

  if (scene.look === 'card') {
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute left-1/2 top-[6%] w-[min(90%,620px)] -translate-x-1/2 rounded-[2rem] px-7 py-5 text-center" style={CARD_STYLE}>
          <h1 className="font-black leading-tight" style={{ fontFamily: CARD_FONT, fontSize: 'clamp(1.8rem, 1rem + 2 * var(--svw, 1vw), 2.8rem)' }}>{scene.title}</h1>
          <p className="mt-1 text-base font-bold sm:text-lg" style={{ fontFamily: CARD_FONT }}>{scene.subtitle}</p>
          {step >= 0 && step < scene.script.length && (
            <p className="mt-3 rounded-2xl bg-white px-4 py-2 text-xl font-black" style={{ fontFamily: CARD_FONT, color: CAST[scene.script[step].who]?.color ?? '#2A1459' }}>
              {CAST[scene.script[step].who]?.name}: “{currentLine}”
            </p>
          )}
          <button onClick={onNext} className="mt-4 rounded-full bg-[#FE6A2F] px-7 py-3 text-lg font-black text-white shadow-lg transition hover:scale-105 active:scale-95" style={{ fontFamily: CARD_FONT }}>{scene.cta}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(254,106,47,0.35) 100%)' }} />
      <div className="absolute left-1/2 top-8 -translate-x-1/2 text-center">
        <h1 className="text-4xl font-black text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)] sm:text-5xl">{scene.title}</h1>
        <p className="mt-1 text-sm font-semibold text-white/95 drop-shadow sm:text-base">{scene.subtitle}</p>
      </div>
      {step >= 0 && step < scene.script.length && (
        <StoryCaption
          img={scene.bg}
          avoid={['top']}
          bottomOffset="clamp(64px,9cqw,120px)"
          name={CAST[scene.script[step].who]?.name}
          color={CAST[scene.script[step].who]?.color}
          text={currentLine}
          onReplay={() => { void safeSpeak(scene.script[step].line, voiceOf(scene.script[step].who)); }}
        />
      )}
      <div className="absolute inset-x-0 bottom-8 z-50 flex justify-center">
        <button onClick={onNext} className="rounded-full bg-white px-8 py-4 text-base font-black uppercase tracking-widest text-orange-700 shadow-2xl transition hover:scale-[1.04]">
          🎮 {scene.cta}
        </button>
      </div>
    </div>
  );
}
