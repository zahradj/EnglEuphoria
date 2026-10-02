import { useEffect, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';

/* ---------- Catch & Sort ---------- */

export function CatchSortScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'catch-sort' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  type Falling = { id: number; word: string; img?: string; emoji: string; target: 'left' | 'right'; xPct: number; topPct: number };
  const [status, setStatus] = useState<'ready' | 'play' | 'win' | 'lose'>('ready');
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [time, setTime] = useState(scene.seconds);
  const [current, setCurrent] = useState<Falling | null>(null);
  const [resolved, setResolved] = useState<'good' | 'bad' | null>(null);
  const [flashSide, setFlashSide] = useState<'left' | 'right' | null>(null);
  const nextIdRef = useRef(1);
  const gemDoneRef = useRef(false);

  const spawn = () => {
    const pick = scene.items[Math.floor(Math.random() * scene.items.length)];
    setCurrent({ id: nextIdRef.current++, word: pick.word, img: pick.img, emoji: pick.emoji, target: pick.target, xPct: 38 + Math.random() * 24, topPct: 0 });
    setResolved(null);
  };

  const start = () => { setScore(0); setHearts(3); setTime(scene.seconds); gemDoneRef.current = false; setStatus('play'); spawn(); };

  // The fall-tick effect below needs the freshest status inside its interval
  // closure without re-subscribing (and resetting the fall timer) every time
  // status changes, so it reads a ref mirror instead.
  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  useEffect(() => {
    if (status !== 'play' || !current || resolved) return;
    const t = window.setInterval(() => {
      setCurrent((c) => {
        if (!c) return c;
        const next = c.topPct + 1.1;
        if (next >= 90) {
          // Reached the bottom uncaught — counts as a miss.
          sfx.wrong(); setHearts((h) => h - 1); setResolved('bad');
          window.setTimeout(() => { setCurrent(null); if (statusRef.current === 'play') spawn(); }, 500);
          return { ...c, topPct: 90 };
        }
        return { ...c, topPct: next };
      });
    }, 90);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, current?.id, resolved]);

  useEffect(() => {
    if (status !== 'play') return;
    const t = window.setInterval(() => setTime((s) => (s > 0 ? s - 0.1 : 0)), 100);
    return () => window.clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (status !== 'play') return;
    if (score >= scene.goal) { setStatus('win'); sfx.gem(); if (!gemDoneRef.current) { gemDoneRef.current = true; onWin(true); } }
    else if (hearts <= 0 || time <= 0) { setStatus('lose'); onLose(); }
  }, [score, hearts, time, status, scene.goal, onWin, onLose]);

  const catchSide = (side: 'left' | 'right') => {
    if (status !== 'play' || !current || resolved) return;
    setFlashSide(side);
    window.setTimeout(() => setFlashSide(null), 250);
    if (current.target === side) {
      sfx.ring(); setScore((s) => s + 1); setResolved('good'); void safeSpeak(current.word, 'pip');
    } else {
      sfx.wrong(); setHearts((h) => h - 1); setResolved('bad');
    }
    window.setTimeout(() => { setCurrent(null); if (statusRef.current === 'play') spawn(); }, 500);
  };

  const Basket = ({ side }: { side: 'left' | 'right' }) => {
    const b = scene[side];
    return (
      <button
        onClick={() => catchSide(side)}
        disabled={status !== 'play'}
        className={`absolute bottom-4 z-20 flex flex-col items-center gap-1 rounded-3xl border-4 border-white bg-white/90 px-5 py-4 shadow-2xl transition active:scale-95 ${side === 'left' ? 'left-4' : 'right-4'} ${flashSide === side ? (resolved === 'good' ? 'ring-8 ring-green-400' : 'ring-8 ring-rose-400') : ''}`}
      >
        <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-orange-50 sm:h-20 sm:w-20">
          {b.img ? <img src={b.img} alt={b.label} className="h-full w-full object-cover" draggable={false} /> : <span className="text-4xl">{b.emoji}</span>}
        </div>
        <span className="text-sm font-black text-orange-700 sm:text-base">{b.label}</span>
      </button>
    );
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex items-center justify-between px-4">
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-orange-700 shadow-xl backdrop-blur">🧺 {score} / {scene.goal}</div>
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-pink-600 shadow-xl backdrop-blur">{'❤️'.repeat(Math.max(0, hearts))}</div>
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-slate-700 shadow-xl backdrop-blur">⏱ {Math.ceil(time)}s</div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-16 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-orange-500 px-5 py-2 text-center text-sm font-black text-white shadow-2xl sm:text-base">{scene.teacher}</div>
      {current && (
        <div className="absolute z-10 -translate-x-1/2" style={{ left: `${current.xPct}%`, top: `${current.topPct}%`, transition: 'top 90ms linear' }}>
          <div className={`grid h-20 w-20 place-items-center rounded-full bg-white shadow-2xl ring-4 ring-white/70 sm:h-24 sm:w-24 ${resolved === 'good' ? 'scale-125 opacity-0 transition-all duration-500' : resolved === 'bad' ? 'animate-[lep1-shake_0.4s_ease-out]' : ''}`} style={{ animation: resolved ? undefined : 'lep1-itemBob 0.8s ease-in-out infinite' }}>
            {current.img ? <img src={current.img} alt={current.word} className="h-14 w-14 object-contain sm:h-16 sm:w-16" draggable={false} /> : <span className="text-4xl">{current.emoji}</span>}
          </div>
        </div>
      )}
      <Basket side="left" />
      <Basket side="right" />
      {status === 'ready' && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/40 backdrop-blur-sm">
          <button onClick={start} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">▶ Start Catching!</button>
        </div>
      )}
      {(status === 'win' || status === 'lose') && (
        <div className="absolute inset-x-0 bottom-28 z-40 flex flex-col items-center gap-3 px-6">
          <div className={`rounded-2xl px-5 py-2 text-lg font-black text-white shadow-xl ${status === 'win' ? 'bg-emerald-500' : 'bg-rose-500'}`}>{status === 'win' ? `⭐ Great catching! ${score} sorted!` : `Nice try! ${score} sorted.`}</div>
          <div className="flex gap-3">
            <button onClick={start} className="rounded-full bg-white/95 px-6 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔁 Again</button>
            <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-base font-black text-white shadow-2xl active:scale-95">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
