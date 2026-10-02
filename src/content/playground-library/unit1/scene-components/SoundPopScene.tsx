import { useEffect, useMemo, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, playLetterPhonic } from '../audio';
import * as sfx from '../sfx';
import { UNIT1_PHONICS, getMastered, logMicroCheck } from '../masteryTracker';

/* ---------- Sound pop ---------- */

type PopMode = 'balloon' | 'bubble' | 'butterfly' | 'apple' | 'rocket';

const MODE_FOR_LETTER: Record<string, PopMode> = { B: 'balloon', H: 'balloon', M: 'balloon', S: 'bubble', N: 'bubble', T: 'butterfly', W: 'butterfly', A: 'apple' };

type PopBalloon = { key: number; word: string; letter: string; img?: string; emoji: string; xPct: number; hue: number; duration: number; born: number; popped: null | 'hit' | 'miss'; mode: PopMode };

export function SoundPopScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'sound-pop' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [targetIdx, setTargetIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(scene.seconds);
  const [balloons, setBalloons] = useState<PopBalloon[]>([]);
  const [phase, setPhase] = useState<'intro' | 'play' | 'win' | 'lose'>('intro');
  const [gemDone, setGemDone] = useState(false);
  const [flash, setFlash] = useState<null | 'hit' | 'miss'>(null);
  const nextKey = useRef(1);
  const attemptsByLetter = useRef<Record<string, number>>({});
  const [hitsForTarget, setHitsForTarget] = useState(0);
  const [masteryTick, setMasteryTick] = useState(0);
  useEffect(() => {
    const h = () => setMasteryTick((n) => n + 1);
    window.addEventListener('pg-mastery-changed', h);
    return () => window.removeEventListener('pg-mastery-changed', h);
  }, []);
  const mastered = useMemo(() => getMastered(), [masteryTick]);

  const c = CAST[scene.who];
  const target = scene.targets[targetIdx];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPhase('intro'); setHitsForTarget(0); setBalloons([]);
      if (cancelled) return;
      await playLetterPhonic(target.letter);
      if (!cancelled) setPhase('play');
    })();
    return () => { cancelled = true; };
  }, [scene.id, targetIdx]);

  useEffect(() => {
    if (phase !== 'play') return;
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  const isTargetMastered = mastered.has(target.letter.toUpperCase());
  const tier: 0 | 1 | 2 = isTargetMastered ? 2 : hitsForTarget >= 2 ? 1 : 0;
  const spawnMs = tier === 2 ? 620 : tier === 1 ? 820 : 1100;
  const targetWeight = tier === 2 ? 0.65 : tier === 1 ? 0.5 : 0.35;
  const modeDur = tier === 2 ? 4200 : tier === 1 ? 4800 : 5600;

  useEffect(() => {
    if (phase !== 'play') return;
    const spawn = () => {
      const pool = scene.items;
      const targets = pool.filter((p) => p.letter === target.letter);
      const others = pool.filter((p) => p.letter !== target.letter);
      const useTarget = targets.length > 0 && Math.random() < targetWeight;
      const bucket = useTarget ? targets : (others.length ? others : pool);
      const it = bucket[Math.floor(Math.random() * bucket.length)];
      let xPct = 8 + Math.random() * 84;
      setBalloons((prev) => {
        const recent = prev.filter((p) => !p.popped && performance.now() - p.born < 2200);
        for (let tries = 0; tries < 8; tries++) {
          if (recent.every((p) => Math.abs(p.xPct - xPct) > 18)) break;
          xPct = 8 + Math.random() * 84;
        }
        const mode: PopMode = MODE_FOR_LETTER[target.letter.toUpperCase()] ?? 'balloon';
        const baseDur = mode === 'butterfly' ? modeDur + 1200 : mode === 'apple' ? modeDur - 1000 : mode === 'rocket' ? Math.round(modeDur * 0.55) : modeDur;
        const b: PopBalloon = { key: nextKey.current++, word: it.word, letter: it.letter, img: it.img, emoji: it.emoji, xPct, hue: [12, 40, 200, 280, 330, 150][Math.floor(Math.random() * 6)], duration: baseDur + Math.random() * 1500, born: performance.now(), popped: null, mode };
        return [...prev.filter((p) => performance.now() - p.born < 8000), b];
      });
    };
    spawn();
    const id = window.setInterval(spawn, spawnMs);
    return () => window.clearInterval(id);
  }, [phase, scene.items, target.letter, spawnMs, targetWeight, modeDur]);

  useEffect(() => {
    if (phase !== 'play') return;
    if (score >= scene.goal) {
      setPhase('win');
      if (!gemDone) { setGemDone(true); sfx.gem(); onWin(true); }
      void safeSpeak('Perfect ears! You popped the sounds!', scene.who);
    } else if (timeLeft <= 0) {
      setPhase('lose'); onLose();
      void safeSpeak("Nice try! Let's pop more next time.", 'teacher');
    }
  }, [score, timeLeft, phase, scene.goal, scene.who, onWin, onLose, gemDone]);

  useEffect(() => {
    if (phase !== 'play') return;
    if (score > 0 && score % 4 === 0 && targetIdx < scene.targets.length - 1) setTargetIdx((i) => Math.min(scene.targets.length - 1, i + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const pop = async (b: PopBalloon) => {
    if (phase !== 'play' || b.popped) return;
    const isHit = b.letter === target.letter;
    const rt = Math.max(0, Math.round(performance.now() - b.born));
    const key = target.letter.toUpperCase();
    attemptsByLetter.current[key] = (attemptsByLetter.current[key] ?? 0) + 1;
    logMicroCheck({ ts: Date.now(), sceneId: scene.id, lesson: 2, letter: key, tappedLetter: b.letter.toUpperCase(), correct: isHit, attemptForLetter: attemptsByLetter.current[key], responseTimeMs: rt });
    setBalloons((prev) => prev.map((p) => (p.key === b.key ? { ...p, popped: isHit ? 'hit' : 'miss' } : p)));
    if (isHit) {
      sfx.pop(); sfx.match(); setFlash('hit'); setScore((s) => s + 1); setHitsForTarget((h) => h + 1);
      await playLetterPhonic(target.letter);
    } else { sfx.wrong(); setFlash('miss'); setMisses((m) => m + 1); }
    window.setTimeout(() => setFlash(null), 220);
    window.setTimeout(() => setBalloons((prev) => prev.filter((p) => p.key !== b.key)), 350);
  };

  return (
    <div className="absolute inset-0 z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/50" />
      {flash && <div className="pointer-events-none absolute inset-0 z-40 transition-opacity" style={{ background: flash === 'hit' ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.20)' }} />}
      <div className="absolute inset-x-0 top-4 z-30 flex items-center justify-between px-4">
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-orange-700 shadow-2xl ring-2 ring-orange-200">🎈 {score}/{scene.goal}</div>
        <div className="rounded-full bg-black/60 px-4 py-2 text-sm font-black text-white shadow-2xl">⏱ {timeLeft}s</div>
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-red-500 shadow-2xl ring-2 ring-red-200">✖ {misses}</div>
      </div>
      <div className="absolute inset-x-0 top-16 z-30 flex justify-center px-4">
        <div className="flex items-center gap-3 rounded-full bg-white/95 px-5 py-2 shadow-2xl ring-4" style={{ borderColor: c.color, boxShadow: `0 12px 30px ${c.color}55` }}>
          <img src={c.img} alt={c.name} className="h-10 w-10 rounded-full object-contain" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-600">Pop the sound</span>
          <span className="rounded-2xl px-3 py-1 text-2xl font-black text-white" style={{ backgroundColor: c.color }}>{target.letter} · {target.phoneme}</span>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest" style={{ background: tier === 2 ? '#22c55e' : tier === 1 ? '#f59e0b' : '#e2e8f0', color: tier === 0 ? '#334155' : '#fff' }}>{tier === 2 ? '⚡ fast' : tier === 1 ? '▶ go' : '🐢 easy'}</span>
        </div>
      </div>
      <div className="absolute inset-x-0 top-28 z-30 flex justify-center px-4">
        <div className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 shadow-xl ring-1 ring-white/20 backdrop-blur">
          <span className="mr-1 text-[10px] font-black uppercase tracking-widest text-white/80">Mastered</span>
          {UNIT1_PHONICS.map((L) => {
            const on = mastered.has(L);
            const isCur = L === target.letter.toUpperCase();
            return <span key={L} title={on ? `${L} · mastered` : `${L} · not yet`} className="grid h-7 w-7 place-items-center rounded-full text-[11px] font-black transition" style={{ background: on ? '#22c55e' : 'rgba(255,255,255,0.15)', color: on ? '#fff' : 'rgba(255,255,255,0.75)', outline: isCur ? '2px solid #FFD447' : 'none', outlineOffset: 1 }}>{on ? '✓' : L}</span>;
          })}
        </div>
      </div>
      {phase === 'play' && balloons.map((b) => {
        const isFall = b.mode === 'apple';
        const anim = b.mode === 'balloon' ? `sp-rise ${b.duration}ms linear forwards, sp-sway 2.4s ease-in-out infinite`
          : b.mode === 'bubble' ? `sp-rise ${b.duration}ms linear forwards, sp-wobble 1.6s ease-in-out infinite`
          : b.mode === 'butterfly' ? `sp-rise ${b.duration}ms linear forwards, sp-zig 1.6s ease-in-out infinite`
          : b.mode === 'rocket' ? `sp-shoot ${b.duration}ms cubic-bezier(.55,0,.85,.35) forwards, sp-wiggle 0.35s ease-in-out infinite`
          : `sp-fall ${b.duration}ms linear forwards, sp-spin 2.2s linear infinite`;
        const posStyle: React.CSSProperties = isFall ? { left: `${b.xPct}%`, top: '-180px' } : { left: `${b.xPct}%`, bottom: '-180px' };
        return (
          <button key={b.key} onClick={() => void pop(b)} className="absolute z-20 -translate-x-1/2 select-none focus:outline-none" style={{ ...posStyle, animation: anim, transform: b.popped ? 'scale(1.6)' : undefined, opacity: b.popped ? 0 : 1, transition: 'opacity 260ms ease, transform 260ms ease', touchAction: 'manipulation' }} aria-label={`${b.mode} ${b.word}`}>
            {b.mode === 'balloon' && (
              <div className="relative flex flex-col items-center">
                <div className="grid h-48 w-44 place-items-center rounded-[50%] shadow-2xl ring-2 ring-white/70" style={{ background: `radial-gradient(circle at 32% 28%, hsla(${b.hue},95%,82%,1) 0%, hsla(${b.hue},85%,55%,1) 65%, hsla(${b.hue},75%,42%,1) 100%)` }}>
                  <span className="text-8xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.35)]" style={{ fontFamily: "'Fredoka',sans-serif" }}>{b.letter}</span>
                </div>
                <div className="h-4 w-[7px]" style={{ background: `hsl(${b.hue},70%,40%)` }} />
                <div className="-mt-0.5 text-2xl leading-none">🎀</div>
              </div>
            )}
            {b.mode === 'bubble' && (
              <div className="grid h-44 w-44 place-items-center rounded-full shadow-2xl" style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95) 0%, rgba(186,230,253,0.55) 40%, rgba(56,189,248,0.35) 75%, rgba(2,132,199,0.25) 100%)', border: '2px solid rgba(255,255,255,0.85)' }}>
                <span className="text-7xl font-black text-sky-900/90" style={{ fontFamily: "'Fredoka',sans-serif" }}>{b.letter}</span>
              </div>
            )}
            {b.mode === 'butterfly' && (
              <div className="relative flex flex-col items-center">
                <div className="relative h-40 w-52">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[6.5rem] leading-none" style={{ animation: 'sp-wingL 260ms ease-in-out infinite', color: `hsl(${b.hue},80%,55%)` }}>🦋</span>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 -scale-x-100 text-[6.5rem] leading-none" style={{ animation: 'sp-wingR 260ms ease-in-out infinite', color: `hsl(${b.hue},80%,55%)` }}>🦋</span>
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-4 py-1.5 text-4xl font-black text-white shadow-xl ring-4 ring-white/85" style={{ backgroundColor: `hsl(${b.hue},70%,45%)`, fontFamily: "'Fredoka',sans-serif" }}>{b.letter}</div>
              </div>
            )}
            {b.mode === 'apple' && (
              <div className="grid h-40 w-40 place-items-center rounded-[42%] shadow-2xl ring-2 ring-white/60" style={{ background: 'radial-gradient(circle at 30% 25%, #fecaca 0%, #ef4444 55%, #991b1b 100%)' }}>
                <span className="text-7xl font-black text-white" style={{ fontFamily: "'Fredoka',sans-serif" }}>{b.letter}</span>
                <div className="absolute -top-3 text-2xl">🍃</div>
              </div>
            )}
            {b.mode === 'rocket' && (
              <div className="relative flex flex-col items-center">
                <div className="absolute left-1/2 top-full h-24 w-6 -translate-x-1/2 rounded-b-full" style={{ background: 'linear-gradient(180deg, #fde68a 0%, #f97316 55%, #dc2626 100%)', filter: 'blur(3px)' }} />
                <span className="pointer-events-none absolute top-full mt-1 text-2xl">🔥</span>
                <div className="relative grid h-44 w-28 place-items-center rounded-[46%_46%_38%_38%/60%_60%_40%_40%] shadow-2xl ring-4 ring-white/70" style={{ background: 'linear-gradient(180deg, #f1f5f9 0%, #cbd5e1 45%, #64748b 100%)' }}>
                  <span className="pointer-events-none absolute -top-2 text-3xl">🚀</span>
                  <span className="mt-2 text-6xl font-black text-slate-900" style={{ fontFamily: "'Fredoka',sans-serif" }}>{b.letter}</span>
                </div>
              </div>
            )}
          </button>
        );
      })}
      {phase === 'intro' && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <div className="rounded-3xl bg-white/95 px-6 py-4 text-center text-lg font-black text-orange-800 shadow-2xl ring-4 ring-orange-200">🎈 Listen to {c.name}… get ready to POP!</div>
        </div>
      )}
      {(phase === 'win' || phase === 'lose') && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/55 px-6 text-center">
          <div className="text-5xl font-black text-white drop-shadow-lg">{phase === 'win' ? '⭐ Sound Master! ⭐' : "⏰ Time's up!"}</div>
          <div className="rounded-2xl bg-white/95 px-5 py-3 text-base font-black text-orange-700 shadow-2xl">Score: {score}/{scene.goal}</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-7 py-3 text-base font-black text-white shadow-2xl ring-4 ring-white/50 active:scale-95">{phase === 'win' ? 'Next →' : 'Keep going →'}</button>
        </div>
      )}
      <style>{`
        @keyframes sp-rise { from { transform: translate3d(-50%, 0, 0); } to { transform: translate3d(-50%, calc(calc(-100*var(--svh,1vh)) - 260px), 0); } }
        @keyframes sp-sway { 0%,100% { margin-left: -6px; } 50% { margin-left: 6px; } }
        @keyframes sp-fall { from { transform: translate3d(-50%, 0, 0); } to { transform: translate3d(-50%, calc(calc(100*var(--svh,1vh)) + 260px), 0); } }
        @keyframes sp-wobble { 0%,100% { margin-left: -10px; } 50% { margin-left: 10px; } }
        @keyframes sp-spin { from { margin-left: -4px; } 50% { margin-left: 4px; } to { margin-left: -4px; } }
        @keyframes sp-zig { 0% { margin-left: -34px; } 25% { margin-left: 10px; } 50% { margin-left: 34px; } 75% { margin-left: -12px; } 100% { margin-left: -34px; } }
        @keyframes sp-wingL { 0%,100% { transform: translateY(-50%) rotateY(0deg); } 50% { transform: translateY(-50%) rotateY(70deg); } }
        @keyframes sp-wingR { 0%,100% { transform: translateY(-50%) scaleX(-1) rotateY(0deg); } 50% { transform: translateY(-50%) scaleX(-1) rotateY(70deg); } }
        @keyframes sp-shoot { from { transform: translate3d(-50%, 0, 0); } to { transform: translate3d(-50%, calc(calc(-100*var(--svh,1vh)) - 260px), 0); } }
        @keyframes sp-wiggle { 0%,100% { margin-left: -3px; } 50% { margin-left: 3px; } }
      `}</style>
    </div>
  );
}
