import { useEffect, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak, cueSpeakOnce } from '../audio';
import * as sfx from '../sfx';
import { STICKER_FILTER, STICKER_TILTS, scatterPositions } from './shared';

/* ---------- Plural sort (drag each picture into "It is" or "They are") ----------
 * Non-reader version: the bins are pictures (one finger = ONE, two hands =
 * MANY) with a small caption; tapping a bin says its words, and every correct
 * drop says the whole sentence ("It's a train!" / "They are blocks!"). An
 * item with `group: true` already shows many in its own picture. */
export function pluralLine(word: string, plural: boolean) {
  return plural ? `They are ${word}!` : `It's ${/^[aeiou]/i.test(word) ? 'an' : 'a'} ${word}!`;
}

export function PluralSortScene({ scene, onWin, onLose, onNext }: { scene: Extract<Scene, { kind: 'plural-sort' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void }) {
  type Slot = { idx: number; it: typeof scene.items[number]; collected: boolean; dragging: boolean; dx: number; dy: number; flash: 'none' | 'good' | 'bad' };
  const [slots, setSlots] = useState<Slot[]>(() => scene.items.map((it, idx) => ({ idx, it, collected: false, dragging: false, dx: 0, dy: 0, flash: 'none' })));
  const [hotBin, setHotBin] = useState<'one' | 'many' | null>(null);
  const [gemAwarded, setGemAwarded] = useState(false);
  const targetRefs = useRef<Record<string, HTMLElement | null>>({});
  const dragIdx = useRef<number | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const done = slots.every((s) => s.collected);

  useEffect(() => { if (done && !gemAwarded) { setGemAwarded(true); onWin(true); cueSpeak('Amazing! One or many, you know them all!', scene.who); } }, [done, gemAwarded]);

  function hitTest(x: number, y: number, itemEl?: Element | null): 'one' | 'many' | null {
    let cx = x, cy = y;
    if (itemEl) { const r = (itemEl as HTMLElement).getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
    const PAD = 48;
    for (const bin of ['one', 'many'] as const) {
      const el = targetRefs.current[bin];
      if (!el) continue;
      const b = el.getBoundingClientRect();
      const inside = (cx >= b.left - PAD && cx <= b.right + PAD && cy >= b.top - PAD && cy <= b.bottom + PAD) || (x >= b.left - PAD && x <= b.right + PAD && y >= b.top - PAD && y <= b.bottom + PAD);
      if (inside) return bin;
    }
    return null;
  }

  const onDown = (idx: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = slots.find((x) => x.idx === idx);
    if (!s || s.collected) return;
    sfx.pop();
    cueSpeakOnce(s.it.word, scene.who);
    dragIdx.current = idx;
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, dragging: true, dx: 0, dy: 0, flash: 'none' } : x)));
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const idx = dragIdx.current;
    if (idx === null) return;
    const dx = e.clientX - start.current.x, dy = e.clientY - start.current.y;
    setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, dx, dy } : x)));
    setHotBin(hitTest(e.clientX, e.clientY, e.currentTarget));
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const idx = dragIdx.current;
    dragIdx.current = null;
    const dropBin = hitTest(e.clientX, e.clientY, e.currentTarget);
    setHotBin(null);
    if (idx === null) return;
    setSlots((p) => p.map((x) => {
      if (x.idx !== idx) return x;
      if (!dropBin) return { ...x, dragging: false, dx: 0, dy: 0 };
      const correctBin = x.it.plural ? 'many' : 'one';
      if (dropBin === correctBin) { sfx.match(); cueSpeak(pluralLine(x.it.word, x.it.plural), scene.who); return { ...x, collected: true, dragging: false, dx: 0, dy: 0, flash: 'good' }; }
      sfx.wrong(); onLose();
      return { ...x, dragging: false, dx: 0, dy: 0, flash: 'bad' };
    }));
  };

  // Rows kept clear of the bins and of the Back/Next bar at the bottom.
  const scattered = scatterPositions(slots.length, [15, 68]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: `url(${scene.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex justify-center px-4">
        <div className="max-w-lg rounded-2xl bg-white/95 px-5 py-3 text-center text-base font-bold text-orange-800 shadow-xl backdrop-blur sm:text-lg">{scene.teacher}</div>
      </div>
      <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center gap-6 px-4 sm:gap-10">
        {(['one', 'many'] as const).map((bin) => {
          const label = bin === 'one' ? 'It is…' : 'They are…';
          const icon = bin === 'one' ? '☝️' : '🙌';
          const isHot = hotBin === bin;
          const collectedHere = slots.filter((s) => s.collected && (s.it.plural ? 'many' : 'one') === bin);
          return (
            <div key={bin} ref={(el) => { targetRefs.current[bin] = el; }} onClick={() => cueSpeak(bin === 'one' ? 'It is' : 'They are', scene.who)} className={`flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-[32px] border-4 shadow-[inset_0_5px_0_rgba(255,255,255,0.35),inset_0_-8px_0_rgba(0,0,0,0.15),0_16px_30px_rgba(0,0,0,0.3)] transition-transform sm:h-52 sm:w-52 ${isHot ? 'scale-110 border-yellow-300 ring-8 ring-yellow-200/70' : 'border-white'}`} style={{ background: bin === 'one' ? 'linear-gradient(#FF8A50,#FE6A2F)' : 'linear-gradient(#A78BFA,#7C3AED)' }}>
              <span className="text-5xl leading-none drop-shadow sm:text-6xl">{icon}</span>
              <span className="mt-1 text-base font-black text-white drop-shadow sm:text-xl">{label}</span>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1 px-2">
                {collectedHere.map((s) => (
                  <span key={s.idx} className="grid h-7 w-7 place-items-center rounded-full bg-white text-sm shadow ring-2 ring-green-400 animate-[lep1-pop_0.4s_ease-out]">✅</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {slots.filter((s) => !s.collected).map((s) => {
        const pos = scattered[s.idx];
        return (
          <button
            key={s.idx}
            onPointerDown={onDown(s.idx)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            className={`absolute z-20 flex items-center justify-center transition ${s.dragging ? 'scale-110' : ''} ${s.flash === 'bad' ? 'animate-[lep1-shake_0.4s_ease-out]' : ''}`}
            style={{ left: pos.left, top: pos.top, width: 'clamp(96px, calc(19*var(--svh,1vh)), 220px)', height: 'clamp(96px, calc(19*var(--svh,1vh)), 220px)', transform: s.dragging ? `translate(${s.dx}px, ${s.dy}px) scale(1.1)` : `rotate(${STICKER_TILTS[s.idx % STICKER_TILTS.length]}deg)`, touchAction: 'none', filter: STICKER_FILTER }}
            aria-label={s.it.word}
          >
            {s.it.plural && s.it.group && s.it.img ? (
              <img src={s.it.img} alt={s.it.word} className="h-[85%] w-[85%] object-contain" draggable={false} />
            ) : s.it.plural ? (
              <div className="flex flex-wrap items-center justify-center gap-0.5 p-1">
                {[0, 1, 2].map((i) => s.it.img ? <img key={i} src={s.it.img} alt="" className="h-1/3 w-1/3 object-contain" draggable={false} /> : <span key={i} className="text-2xl">{s.it.emoji}</span>)}
              </div>
            ) : s.it.img ? (
              <img src={s.it.img} alt={s.it.word} className="h-3/4 w-3/4 object-contain" draggable={false} />
            ) : (
              <span className="text-5xl">{s.it.emoji}</span>
            )}
          </button>
        );
      })}
      {done && <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center"><button onClick={onNext} className="rounded-full bg-orange-500 px-8 py-4 text-base font-black uppercase tracking-widest text-white shadow-2xl active:scale-95">✨ Next</button></div>}
    </div>
  );
}
