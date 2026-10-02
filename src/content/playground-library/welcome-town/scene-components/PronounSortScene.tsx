import { useEffect, useRef, useState } from 'react';
import type { Scene, CharKey } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { voiceOf } from './shared';

/* ---------- Pronoun sort (He / She / They — drag a character, or a pair
   of characters for the "they" rounds, onto the pronoun that describes
   them) ---------- */

const PRONOUN_BINS = ['He', 'She', 'They'] as const;

type Pronoun = (typeof PRONOUN_BINS)[number];

const PRONOUN_COLOR: Record<Pronoun, string> = { He: '#4FA9E0', She: '#E76FA5', They: '#8ECAE6' };

export function PronounSortScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'pronoun-sort' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<Pronoun | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [hotBox, setHotBox] = useState<Pronoun | null>(null);
  const boxRefs = useRef<Record<Pronoun, HTMLDivElement | null>>({ He: null, She: null, They: null });
  const start = useRef({ x: 0, y: 0 });
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;
  const isPair = (v: unknown): v is [CharKey, CharKey] => Array.isArray(v);

  useEffect(() => {
    if (!r) return;
    setPicked(null); setCorrect(null); setDragOffset({ dx: 0, dy: 0 });
    const speaker = isPair(r.who) ? r.who[0] : r.who;
    const line = isPair(r.who) ? `We are ${r.emotion}.` : `I am ${r.emotion}.`;
    const t = window.setTimeout(() => void safeSpeak(line, voiceOf(speaker)), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const hitTest = (x: number, y: number): Pronoun | null => {
    for (const p of PRONOUN_BINS) {
      const el = boxRefs.current[p];
      if (!el) continue;
      const b = el.getBoundingClientRect();
      const PAD = 20;
      if (x >= b.left - PAD && x <= b.right + PAD && y >= b.top - PAD && y <= b.bottom + PAD) return p;
    }
    return null;
  };

  const pick = async (choice: Pronoun) => {
    if (!r || picked) return;
    setPicked(choice);
    const ok = choice === r.answer;
    setCorrect(ok);
    const speaker = isPair(r.who) ? r.who[0] : r.who;
    if (ok) {
      sfx.match(); setScore((s) => s + 1);
      const verb = choice === 'They' ? 'are' : 'is';
      await safeSpeak(`Yes! ${choice} ${verb} ${r.emotion}!`, voiceOf(speaker));
      const next = round + 1;
      if (next >= total && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
      window.setTimeout(() => setRound(next), 400);
    } else {
      sfx.wrong(); onLose();
      window.setTimeout(() => { setPicked(null); setCorrect(null); setDragOffset({ dx: 0, dy: 0 }); }, 700);
    }
  };

  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!r || picked) return;
    setDragging(true);
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragOffset({ dx: e.clientX - start.current.x, dy: e.clientY - start.current.y });
    setHotBox(hitTest(e.clientX, e.clientY));
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragging(false);
    const target = hitTest(e.clientX, e.clientY);
    setHotBox(null);
    if (!target) { setDragOffset({ dx: 0, dy: 0 }); return; }
    void pick(target);
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30" />
        <button onClick={onNext} className="relative z-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Nice sorting! {score}/{total} ⭐ Next</button>
      </div>
    );
  }

  const imgs = isPair(r!.img) ? r!.img : [r!.img];
  const label = isPair(r!.who) ? `${CAST[r!.who[0]].name} and ${CAST[r!.who[1]].name}` : CAST[r!.who].name;
  const sayLine = isPair(r!.who) ? `We are ${r!.emotion}.` : `I am ${r!.emotion}.`;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between bg-cover bg-center px-4 py-4" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="relative z-20 mt-2 max-w-[92%] rounded-full bg-white/95 px-5 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">{scene.teacher} <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{round + 1}/{total}</span></div>
      <button
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        disabled={!!picked}
        aria-label={`Drag ${label} to He, She, or They`}
        className="relative z-10 flex touch-none select-none flex-col items-center border-0 bg-transparent p-0 disabled:cursor-default"
        style={{
          transform: dragging ? `translate(${dragOffset.dx}px, ${dragOffset.dy}px) scale(1.1)` : undefined,
          transition: dragging ? 'none' : 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
          animation: picked && !correct ? 'lep1-shake 0.4s ease-out' : undefined,
        }}
      >
        <div className="flex items-end">
          {imgs.map((src, i) => (
            <img key={i} src={src} alt={label} draggable={false} className={`pointer-events-none h-40 w-40 object-contain drop-shadow-2xl sm:h-52 sm:w-52 ${i > 0 ? '-ml-6' : ''}`} />
          ))}
        </div>
        <div className="pointer-events-none mt-2 rounded-full bg-white/95 px-4 py-1 text-lg font-black text-slate-700">“{sayLine}”</div>
      </button>
      <div className="relative z-10 flex w-full max-w-lg gap-3 pb-2">
        {PRONOUN_BINS.map((p) => (
          <div key={p} ref={(el) => { boxRefs.current[p] = el; }}
            className={`flex-1 rounded-3xl border-4 border-white py-6 text-center text-2xl font-black text-white shadow-2xl transition sm:py-8 sm:text-3xl ${hotBox === p ? 'scale-110 ring-4 ring-white' : ''} ${picked === p ? (correct ? 'ring-4 ring-green-300 scale-105' : '') : ''}`}
            style={{ background: `linear-gradient(135deg, ${PRONOUN_COLOR[p]}, ${PRONOUN_COLOR[p]}cc)` }}
          >{p}</div>
        ))}
      </div>
    </div>
  );
}
