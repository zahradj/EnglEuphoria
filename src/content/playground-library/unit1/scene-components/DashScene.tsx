import { useEffect, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';

/* ---------- Dash ---------- */

type DashItem = { id: number; word: string; letter: string; img?: string; emoji: string; lane: number; x: number; correct: boolean; taken: boolean };

const DASH_BALLOON_COLORS = ['#FE6A2F', '#4FA9E0', '#E76FA5', '#34D399', '#FEBE4C', '#A78BFA'];

export function DashScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'dash' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [rings, setRings] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [time, setTime] = useState(scene.seconds);
  const [status, setStatus] = useState<'ready' | 'play' | 'win' | 'lose'>('ready');
  const [items, setItems] = useState<DashItem[]>([]);
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null);
  const nextIdRef = useRef(1);
  const gemDoneRef = useRef(false);
  const heroSrc = CAST[scene.who].img;


  const start = () => { setRings(0); setHearts(3); setTime(scene.seconds); setItems([]); gemDoneRef.current = false; setStatus('play'); };

  useEffect(() => {
    if (status !== 'play') return;
    const spawn = window.setInterval(() => {
      const pick = scene.items[Math.floor(Math.random() * scene.items.length)];
      setItems((prev) => [...prev, { id: nextIdRef.current++, word: pick.word, letter: pick.letter, img: pick.img, emoji: pick.emoji, lane: Math.floor(Math.random() * 3), x: -8, correct: pick.letter === scene.targetLetter, taken: false }]);
    }, 1100);
    return () => window.clearInterval(spawn);
  }, [status]);

  useEffect(() => {
    if (status !== 'play') return;
    const t = window.setInterval(() => {
      setItems((prev) => prev.map((it) => (it.taken ? it : { ...it, x: it.x + 1.6 })).filter((it) => it.x < 108));
      setTime((s) => (s > 0 ? s - 0.1 : 0));
    }, 100);
    return () => window.clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (status !== 'play') return;
    if (rings >= scene.goal) { setStatus('win'); sfx.gem(); if (!gemDoneRef.current) { gemDoneRef.current = true; onWin(true); } }
    else if (hearts <= 0 || time <= 0) { setStatus('lose'); sfx.wrong(); onLose(); }
  }, [rings, hearts, time, status]);

  const tap = (id: number) => {
    if (status !== 'play') return;
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (!it || it.taken) return prev;
      if (it.correct) { sfx.ring(); setRings((r) => r + 1); setFlash('good'); void safeSpeak(it.word, scene.who); }
      else { sfx.wrong(); setHearts((h) => h - 1); setFlash('bad'); }
      window.setTimeout(() => setFlash(null), 200);
      return prev.map((x) => (x.id === id ? { ...x, taken: true } : x));
    });
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 40px, rgba(255,255,255,0.35) 40px 42px)', animation: 'lep1-dashScroll 0.6s linear infinite' }} />
      <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex items-center justify-between px-4">
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-orange-700 shadow-xl backdrop-blur">💍 {rings} / {scene.goal}</div>
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-pink-600 shadow-xl backdrop-blur">{'❤️'.repeat(Math.max(0, hearts))}</div>
        <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-black text-slate-700 shadow-xl backdrop-blur">⏱ {Math.ceil(time)}s</div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-full bg-orange-500 px-5 py-2 text-base font-black text-white shadow-2xl">
        {/* Phonics rounds (targetPhoneme set) show only the sound, not the letter name AND
            the sound together — vocabulary rounds (color/shape/toy dash games, where
            targetPhoneme is '') have no separate "sound" to show, so they keep the word. */}
        Tap only <span className="mx-1 rounded-lg bg-white px-2 py-0.5 text-orange-600">{scene.targetPhoneme || scene.targetLetter}</span>
      </div>
      {flash && <div className={`pointer-events-none absolute inset-0 z-20 ${flash === 'good' ? 'bg-yellow-200/30' : 'bg-rose-500/25'}`} />}
      <div className="pointer-events-none absolute left-4 bottom-16 z-20 sm:left-8" style={{ animation: 'lep1-heroBounce 0.45s ease-in-out infinite' }}>
        <img src={heroSrc} alt={scene.who} className="h-40 w-40 object-contain drop-shadow-2xl sm:h-52 sm:w-52" draggable={false} />
      </div>
      {[0, 1, 2].map((lane) => (
        <div key={lane} className="absolute left-0 right-0" style={{ top: `${30 + lane * 20}%`, height: 0 }}>
          {items.filter((it) => it.lane === lane && !it.taken).map((it) => {
            const color = DASH_BALLOON_COLORS[it.id % DASH_BALLOON_COLORS.length];
            return (
              <button key={it.id} onClick={() => tap(it.id)} className="absolute -translate-y-1/2" style={{ right: `${it.x}%`, animation: 'lep1-itemBob 0.8s ease-in-out infinite' }} aria-label={it.word}>
                <div className="relative flex flex-col items-center">
                  <div className="grid h-24 w-24 place-items-center rounded-[50%] shadow-2xl ring-2 ring-white/70 active:scale-90 sm:h-28 sm:w-28" style={{ background: `radial-gradient(circle at 32% 28%, ${color}ee 0%, ${color} 65%, ${color}cc 100%)` }}>
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-white/95 sm:h-[4.5rem] sm:w-[4.5rem]">
                      {it.img ? <img src={it.img} alt={it.word} className="h-11 w-11 object-contain sm:h-12 sm:w-12" draggable={false} /> : <span className="text-3xl">{it.emoji}</span>}
                    </div>
                  </div>
                  <div className="h-4 w-[7px]" style={{ background: color }} />
                  <div className="-mt-0.5 text-xl leading-none">🎀</div>
                  <span className="pointer-events-none absolute -bottom-6 whitespace-nowrap rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow">{it.word}</span>
                </div>
              </button>
            );
          })}
        </div>
      ))}
      {status === 'ready' && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/40 backdrop-blur-sm">
          <button onClick={start} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">▶ Start Dash!</button>
        </div>
      )}
      {(status === 'win' || status === 'lose') && (
        <div className="absolute inset-x-0 bottom-6 z-40 flex flex-col items-center gap-3 px-6">
          <div className={`rounded-2xl px-5 py-2 text-lg font-black text-white shadow-xl ${status === 'win' ? 'bg-emerald-500' : 'bg-rose-500'}`}>{status === 'win' ? `⭐ Great dash! ${rings} rings!` : `Nice try! ${rings} rings.`}</div>
          <div className="flex gap-3">
            <button onClick={start} className="rounded-full bg-white/95 px-6 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔁 Again</button>
            <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-base font-black text-white shadow-2xl active:scale-95">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
