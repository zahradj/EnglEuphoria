import { useEffect, useRef, useState } from 'react';
import type { Scene, CharKey } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, cueSpeak } from '../audio';
import * as sfx from '../sfx';

/* ---------- Hello doors ---------- */

export function HelloDoorsScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'hello-doors' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [order, setOrder] = useState<CharKey[]>(scene.cast);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<'reveal' | 'shuffle' | 'prompt' | 'greet' | 'echo' | 'done'>('reveal');
  const [score, setScore] = useState(0);
  const [gemDone, setGemDone] = useState(false);
  const answeredRef = useRef(false);
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;

  const shuffle = (arr: CharKey[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  useEffect(() => {
    if (!r) return;
    let cancelled = false;
    answeredRef.current = false; setOpenIdx(null); setWrongIdx(null);
    (async () => {
      if (round === 0) {
        setOrder(scene.cast); setPhase('reveal');
        for (const who of scene.cast) { await safeSpeak(CAST[who].name, who); if (cancelled) return; }
        await new Promise((res) => setTimeout(res, 400));
        if (cancelled) return;
      }
      setPhase('shuffle');
      if (cancelled) return;
      for (let k = 0; k < 3; k++) { setOrder((o) => shuffle(o)); await new Promise((res) => setTimeout(res, 420)); if (cancelled) return; }
      await new Promise((res) => setTimeout(res, 200));
      if (cancelled) return;
      setPhase('prompt');
      await new Promise((res) => setTimeout(res, 200));
      await safeSpeak(r.prompt, r.target);
    })();
    return () => { cancelled = true; };
  }, [round]);

  const tap = async (idx: number) => {
    if (!r || answeredRef.current) return;
    const who = order[idx];
    if (who !== r.target) { setWrongIdx(idx); sfx.wrong(); onLose(); window.setTimeout(() => setWrongIdx(null), 500); return; }
    answeredRef.current = true; setOpenIdx(idx); setPhase('greet'); sfx.match();
    await new Promise((res) => setTimeout(res, 500));
    await safeSpeak(r.helloLine, who);
    setPhase('echo');
    await new Promise((res) => setTimeout(res, 250));
    await safeSpeak(r.echoLine, r.target);
    setScore((s) => s + 1);
    await new Promise((res) => setTimeout(res, 1400));
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
    setRound(next);
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="rounded-3xl bg-white px-8 py-4 text-center shadow-2xl">
            <div className="text-2xl font-black text-orange-700">🎉 Wonderful hellos!</div>
            <div className="text-lg font-bold text-neutral-700">You greeted every friend! {score}/{total}</div>
          </div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  const doorPositions = [17, 50, 83];
  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/50" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-6 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur sm:text-xl">
        {r!.prompt}<span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <button onClick={() => cueSpeak(r!.prompt, r!.target)} className="absolute right-4 top-4 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>
      {phase === 'echo' && <div className="pointer-events-none absolute left-1/2 top-24 z-40 -translate-x-1/2 rounded-3xl bg-white px-6 py-4 text-2xl font-black text-orange-600 shadow-2xl ring-4 ring-orange-200">🎤 {r!.echoLine}</div>}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
      <div className={`absolute bottom-0 left-0 right-0 z-10 h-[82%] ${phase === 'shuffle' ? 'animate-[lep1-shuffleShake_0.42s_ease-in-out_infinite]' : ''}`}>
        {doorPositions.map((left, i) => {
          const who = order[i];
          const c = CAST[who];
          const isOpen = openIdx === i || phase === 'reveal';
          const isWrong = wrongIdx === i;
          const isIdle = openIdx === null && !answeredRef.current && phase === 'prompt';
          const stepOutside = i === doorPositions.length - 1 ? '28%' : '72%';
          const showChar = openIdx === i || phase === 'reveal';
          return (
            <div key={i} className="absolute bottom-0" style={{ left: `${left}%`, transform: 'translateX(-50%)', width: '28%', maxWidth: 320, height: 'clamp(260px, calc(52*var(--svh,1vh)), 480px)' }}>
              {/* Sized off vh, not vw, and inset from the door's bottom edge instead of
                  stepping below it — the old calc(42*var(--svw,1vw)) sizing + -14% bottom offset looked fine
                  on tall phone aspect ratios, but on a squarer/shorter viewport it pushed
                  the character's lower third under the fixed Back/Next nav bar (which
                  overlays the bottom ~60-90px of every full-bleed scene), so the reveal
                  read as a character cut off at the door instead of standing in front of
                  it. Sizing off vh and pulling the bottom inset positive keeps the whole
                  sprite clear of that overlay at any aspect ratio. */}
              <div className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2" style={{ left: phase === 'reveal' ? '50%' : openIdx === i ? stepOutside : '50%', bottom: '14%', width: 'clamp(200px, calc(40*var(--svh,1vh)), 380px)', height: 'clamp(200px, calc(40*var(--svh,1vh)), 380px)', transform: showChar ? 'translateY(0) scale(1)' : 'translateY(10%) scale(0.96)', opacity: showChar ? 1 : 0, transition: 'left 0.45s ease-out, transform 0.45s ease-out, opacity 0.25s ease-out', transitionDelay: openIdx === i ? '0.35s' : '0s' }}>
                <img src={c.img} alt={c.name} draggable={false} className="h-full w-full max-w-none object-contain" style={{ filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.45))' }} />
                {phase === 'reveal' && <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-white px-4 py-2 text-lg font-black text-neutral-800 shadow-xl ring-2 ring-white" style={{ color: c.color }}>{c.name}</div>}
                {(phase === 'greet' || phase === 'echo') && openIdx === i && <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-white px-4 py-2 text-base font-black text-neutral-800 shadow-xl ring-2 ring-white">{r!.helloLine}</div>}
              </div>
              <button onClick={() => tap(i)} disabled={answeredRef.current || phase !== 'prompt'} aria-label={`Door ${i + 1}`} className={`absolute inset-0 ${isWrong ? 'animate-[lep1-shake_0.5s]' : ''} ${isIdle ? 'hover:-translate-y-1' : ''} transition-transform active:scale-95`}>
                <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-t-full" style={{ width: '112%', height: '20%', background: `linear-gradient(180deg, ${c.color} 0%, ${c.color}dd 100%)`, boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }} />
                <div className="absolute left-1/2 top-[16%] h-[84%] w-[94%] -translate-x-1/2 overflow-hidden rounded-t-[46%] border-[7px] border-amber-950 shadow-2xl" style={{ background: 'radial-gradient(ellipse at 50% 70%, #4a2c14 0%, #1a0d05 100%)' }}>
                  <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: isOpen ? 1 : 0, background: `radial-gradient(circle at 50% 65%, ${c.color}ee 0%, ${c.color}88 35%, rgba(0,0,0,0.4) 90%)` }} />
                  <div className="absolute inset-y-0 left-0 w-1/2 origin-left transition-transform duration-[700ms]" style={{ transform: isOpen ? 'perspective(800px) rotateY(-110deg)' : 'rotateY(0deg)', background: 'linear-gradient(90deg, #8A5028 0%, #A76A3D 60%, #C68B58 100%)' }} />
                  <div className="absolute inset-y-0 right-0 w-1/2 origin-right transition-transform duration-[700ms]" style={{ transform: isOpen ? 'perspective(800px) rotateY(110deg)' : 'rotateY(0deg)', background: 'linear-gradient(270deg, #8A5028 0%, #A76A3D 60%, #C68B58 100%)' }} />
                </div>
                {isWrong && <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center text-8xl font-black text-red-500 drop-shadow-lg">✗</div>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
