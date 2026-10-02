import { useEffect, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST, getEmotionSprite } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';

/* ---------- Feed the mood monsters ---------- */

/**
 * bg-mood-monsters.jpg already has three fully-painted monster characters
 * (yellow/happy far left, blue/sad center, red/angry far right) merged into
 * the illustration. These are their approximate on-image positions, used to
 * place invisible tap zones directly over the real art instead of drawing a
 * second, flatter set of "monster" buttons on top of it.
 */
const MONSTER_META: Record<'happy' | 'sad' | 'angry', { label: string; color: string; xPct: number }> = {
  happy: { label: 'Happy Monster', color: '#FFC93C', xPct: 19 },
  sad: { label: 'Sad Monster', color: '#4FA9E0', xPct: 51 },
  angry: { label: 'Angry Monster', color: '#E5561A', xPct: 81 },
};

export function FeedMonstersScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'feed-monsters' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feeding, setFeeding] = useState<'happy' | 'sad' | 'angry' | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [hotMonster, setHotMonster] = useState<'happy' | 'sad' | 'angry' | null>(null);
  const [wrongShake, setWrongShake] = useState(false);
  const [gemDone, setGemDone] = useState(false);
  const monsterRefs = useRef<Record<'happy' | 'sad' | 'angry', HTMLDivElement | null>>({ happy: null, sad: null, angry: null });
  const dragStart = useRef({ x: 0, y: 0 });
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;

  useEffect(() => {
    if (!r) return;
    setFeeding(null); setWrongShake(false); setDragOffset({ dx: 0, dy: 0 });
    const t = window.setTimeout(() => void safeSpeak(r.sentence, r.who), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const hitTest = (x: number, y: number): 'happy' | 'sad' | 'angry' | null => {
    for (const m of ['happy', 'sad', 'angry'] as const) {
      const el = monsterRefs.current[m];
      if (!el) continue;
      const b = el.getBoundingClientRect();
      const PAD = 30;
      if (x >= b.left - PAD && x <= b.right + PAD && y >= b.top - PAD && y <= b.bottom + PAD) return m;
    }
    return null;
  };

  const feed = async (monster: 'happy' | 'sad' | 'angry') => {
    if (!r || feeding) return;
    if (monster === r.emotion) {
      sfx.match(); setFeeding(monster); setScore((s) => s + 1);
      await new Promise((res) => setTimeout(res, 700));
      const next = round + 1;
      if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
      setRound(next);
    } else {
      sfx.wrong(); onLose(); setWrongShake(true); setDragOffset({ dx: 0, dy: 0 });
      window.setTimeout(() => setWrongShake(false), 500);
    }
  };

  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!r || feeding) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragOffset({ dx: e.clientX - dragStart.current.x, dy: e.clientY - dragStart.current.y });
    setHotMonster(hitTest(e.clientX, e.clientY));
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragging(false);
    const target = hitTest(e.clientX, e.clientY);
    setHotMonster(null);
    if (!target) { setDragOffset({ dx: 0, dy: 0 }); return; }
    void feed(target);
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/25" />
        <Confetti />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-center shadow-2xl">
            <div className="text-2xl font-black text-orange-700">🎉 Yum yum!</div>
            <div className="text-lg font-bold text-neutral-700">You fed the monsters {score}/{total}!</div>
          </div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  const c = CAST[r!.who];
  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />

      {/* Drop zones over the monsters already painted into scene.bg — no separate monster art drawn on top. */}
      {(['happy', 'sad', 'angry'] as const).map((m) => {
        const meta = MONSTER_META[m];
        const isHot = hotMonster === m;
        const isFed = feeding === m;
        return (
          <div
            key={m}
            ref={(el) => { monsterRefs.current[m] = el; }}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 top-[10%] z-10"
            style={{ left: `${meta.xPct - 16}%`, width: '32%' }}
          >
            <span
              className="pointer-events-none absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform"
              style={{
                background: `radial-gradient(circle, ${meta.color}${isHot ? '66' : '33'} 0%, transparent 68%)`,
                animation: !feeding ? 'lep1-ping 2.4s ease-out infinite' : undefined,
                transform: isHot ? 'scale(1.15)' : 'scale(1)',
              }}
            />
            {isFed && (
              <span className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border-8 border-emerald-400/90" style={{ animation: 'lep1-pop-fade 0.7s ease-out forwards' }} />
            )}
          </div>
        );
      })}

      <button onClick={() => void safeSpeak(r!.sentence, r!.who)} className="absolute inset-x-0 top-2 z-20 mx-auto max-w-[92%] rounded-full bg-white/95 px-5 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur active:scale-95 sm:text-lg">
        🔊 {r!.sentence} <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{round + 1}/{total}</span>
      </button>

      {/* Friend stands grounded on the grass in front of the monsters — grab and drag onto the matching monster. */}
      <button
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        disabled={!!feeding}
        aria-label={`Drag ${c.name} to the matching monster`}
        className="absolute z-20 flex touch-none select-none flex-col items-center border-0 bg-transparent p-0 disabled:cursor-default"
        style={{
          left: feeding ? `${MONSTER_META[feeding].xPct}%` : '50%',
          top: feeding ? '58%' : '82%',
          transform: dragging
            ? `translate(calc(-50% + ${dragOffset.dx}px), calc(-50% + ${dragOffset.dy}px)) scale(1.15)`
            : `translate(-50%, -50%) scale(${feeding ? 0.3 : 1})`,
          opacity: feeding ? 0 : 1,
          transition: dragging ? 'none' : 'all 0.7s cubic-bezier(0.3,0,0.2,1)',
          animation: wrongShake ? 'lep1-shake 0.4s ease-in-out' : undefined,
        }}
      >
        {!feeding && (
          <span
            className="absolute left-1/2 top-[86%] -translate-x-1/2 rounded-full"
            style={{ width: '70%', height: '18%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.32) 0%, transparent 72%)' }}
          />
        )}
        <img src={getEmotionSprite(r!.who, r!.emotion)} alt={c.name} draggable={false} className="pointer-events-none relative h-32 w-32 object-contain drop-shadow-2xl sm:h-40 sm:w-40" style={{ animation: feeding || dragging ? undefined : 'lep1-float 2.6s ease-in-out infinite' }} />
        <span className="pointer-events-none relative mt-0.5 rounded-full bg-white/90 px-3 py-1 text-sm font-black shadow" style={{ color: c.color }}>{c.name}</span>
      </button>

      {feeding && (
        <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 text-4xl" style={{ left: `${MONSTER_META[feeding].xPct}%`, top: '58%', animation: 'lep1-pop 0.5s ease-out 0.35s both' }}>
          😋
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 z-30 rounded-full bg-white/90 px-4 py-1 text-sm font-black text-orange-700 shadow">⭐ {score}/{total}</div>
    </div>
  );
}
