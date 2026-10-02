import { useCallback, useEffect, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak, playLetterPhonic } from '../audio';
import * as sfx from '../sfx';

/* ---------- Brick crush ---------- */

type Brick = { id: number; letter: string; color: string; crashed: boolean; wobble: boolean };

export function BrickCrushScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'brick-crush' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const LETTER_COLORS: Record<string, string> = { H: '#FF6B6B', M: '#4DABF7', N: '#FFD43B', W: '#9775FA', A: '#51CF66', S: '#FF922B' };
  const phonemeFor = (L: string) => {
    const map: Record<string, string> = { H: 'h, h', M: 'mmm', N: 'nnn', W: 'wuh', A: 'ah', S: 'sss' };
    return map[L] ?? L.toLowerCase();
  };

  const buildGrid = useCallback(() => {
    const out: Brick[] = [];
    let id = 1;
    for (let r = 0; r < scene.rows; r++) for (let c = 0; c < scene.cols; c++) {
      const L = scene.letters[Math.floor(Math.random() * scene.letters.length)];
      out.push({ id: id++, letter: L, color: LETTER_COLORS[L] ?? '#FE6A2F', crashed: false, wobble: false });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.rows, scene.cols]);

  const [bricks, setBricks] = useState<Brick[]>(() => buildGrid());
  const [targetLetter, setTargetLetter] = useState<string>(scene.letters[0]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(scene.seconds);
  const [phase, setPhase] = useState<'intro' | 'play' | 'win' | 'lose'>('intro');
  const [gemDone, setGemDone] = useState(false);
  const [flash, setFlash] = useState<null | 'hit' | 'miss'>(null);
  const [combo, setCombo] = useState(0);
  const c = CAST[scene.who];

  const callNewSound = useCallback(async () => {
    const remaining = bricks.filter((b) => !b.crashed);
    if (remaining.length === 0) return;
    const available = Array.from(new Set(remaining.map((b) => b.letter)));
    const next = available[Math.floor(Math.random() * available.length)];
    setTargetLetter(next);
    await playLetterPhonic(next);
  }, [bricks, scene.who]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPhase('intro');
      const first = scene.letters[Math.floor(Math.random() * scene.letters.length)];
      setTargetLetter(first);
      await playLetterPhonic(first);
      if (!cancelled) setPhase('play');
    })();
    return () => { cancelled = true; };
  }, [scene.id]);

  useEffect(() => {
    if (phase !== 'play') return;
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'play') return;
    if (score >= scene.goal) {
      setPhase('win');
      if (!gemDone) { setGemDone(true); onWin(true); sfx.gem(); cueSpeak('Amazing! Brick crush champion!', 'teacher'); }
    } else if (timeLeft <= 0) { setPhase('lose'); cueSpeak('Great try!', 'teacher'); }
  }, [score, timeLeft, phase, scene.goal, gemDone, onWin]);

  const tapBrick = (b: Brick) => {
    if (phase !== 'play' || b.crashed) return;
    if (b.letter === targetLetter) {
      sfx.pop();
      setBricks((prev) => prev.map((x) => (x.id === b.id ? { ...x, crashed: true } : x)));
      setScore((s) => s + 1); setCombo((k) => k + 1); setFlash('hit');
      window.setTimeout(() => setFlash(null), 220);
      const remainingOfTarget = bricks.filter((x) => !x.crashed && x.letter === targetLetter && x.id !== b.id).length;
      const nextScore = score + 1;
      if (remainingOfTarget === 0 || nextScore % 4 === 0) window.setTimeout(() => { void callNewSound(); }, 400);
    } else {
      sfx.wrong(); onLose(); setMisses((m) => m + 1); setCombo(0);
      setBricks((prev) => prev.map((x) => (x.id === b.id ? { ...x, wobble: true } : x)));
      setFlash('miss');
      window.setTimeout(() => { setBricks((prev) => prev.map((x) => (x.id === b.id ? { ...x, wobble: false } : x))); setFlash(null); }, 400);
    }
  };

  const replaySound = () => { void playLetterPhonic(targetLetter); };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex items-start justify-between px-4">
        <div className="pointer-events-auto rounded-2xl bg-white/95 px-4 py-2 text-sm font-black text-orange-700 shadow-xl backdrop-blur">⭐ {score}/{scene.goal} · ⏱ {timeLeft}s{combo >= 3 ? ` · 🔥 x${combo}` : ''}</div>
        <button onClick={replaySound} className="pointer-events-auto flex items-center gap-2 rounded-full px-5 py-3 text-lg font-black text-white shadow-2xl ring-4 ring-white/60 active:scale-95" style={{ background: `linear-gradient(135deg, ${c.color}, #FEBE4C)` }}>🔊 Sound: <span className="text-2xl">{phonemeFor(targetLetter)}</span></button>
      </div>
      <div className="absolute inset-x-0 top-20 bottom-6 z-10 grid place-items-center px-4">
        <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${scene.cols}, minmax(0, 1fr))`, width: 'min(calc(96*var(--svw,1vw)), 900px)' }}>
          {bricks.map((b) => {
            if (b.crashed) return <div key={b.id} className="aspect-square rounded-2xl bg-transparent" aria-hidden />;
            const isTarget = b.letter === targetLetter;
            return (
              <button key={b.id} onClick={() => tapBrick(b)} className={`relative aspect-square rounded-2xl border-b-[6px] border-black/25 shadow-xl transition-all active:translate-y-1 active:border-b-2 ${isTarget ? 'ring-4 ring-white/80 animate-pulse' : ''} ${b.wobble ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`} style={{ background: `linear-gradient(160deg, ${b.color}, ${b.color}dd 60%, ${b.color}99)` }} aria-label={`Brick ${b.letter}`}>
                <span className="grid h-full w-full place-items-center text-3xl font-black text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.35)] sm:text-4xl md:text-5xl">{b.letter}</span>
                <span className="pointer-events-none absolute inset-x-2 top-2 h-1/3 rounded-xl bg-white/25 blur-sm" />
              </button>
            );
          })}
        </div>
      </div>
      {flash && <div className="pointer-events-none absolute inset-0 z-20" style={{ background: flash === 'hit' ? 'radial-gradient(circle at center, rgba(34,197,94,0.35), transparent 60%)' : 'radial-gradient(circle at center, rgba(239,68,68,0.35), transparent 60%)' }} />}
      {phase === 'intro' && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-3xl bg-white/95 px-8 py-6 text-center shadow-2xl">
            <div className="text-xs font-black uppercase tracking-widest text-orange-500">Get ready</div>
            <div className="mt-1 text-3xl font-black text-orange-800">🧱 Brick Crush</div>
            <div className="mt-2 text-sm font-bold text-orange-700">Listen to {c.name}. Tap the matching letter bricks!</div>
          </div>
        </div>
      )}
      {(phase === 'win' || phase === 'lose') && (
        <div className="absolute inset-x-0 bottom-6 z-40 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl ring-4 ring-white/50 active:scale-95">{phase === 'win' ? '✨ Champion! Next →' : `Nice try (${score}/${scene.goal}) — Next →`}</button>
        </div>
      )}
      {misses > 0 && <div className="pointer-events-none absolute right-4 bottom-4 z-30 rounded-full bg-black/60 px-3 py-1 text-xs font-black text-white">Misses: {misses}</div>}
    </div>
  );
}
