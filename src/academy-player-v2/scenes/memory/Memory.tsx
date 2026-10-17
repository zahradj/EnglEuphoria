// Memory: flip two cards, match a sticker picture with its word. No timer, no move limit (comfort); a flip-back after a miss, a glow on a match.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface MemoryScene extends SceneBase { kind: 'memory'; title: string; pairs: { art: string; text: string }[] }
type Card = { id: number; pair: number; art?: string; text?: string };

function MemoryView({ scene, onDone, artBase, calm, seed }: SceneProps<MemoryScene>) {
  const { t } = useTranslation();
  const cards = useMemo<Card[]>(() => {
    const all: Card[] = scene.pairs.flatMap((p, k) => [{ id: k * 2, pair: k, art: p.art }, { id: k * 2 + 1, pair: k, text: p.text }]);
    let s = seed || 1;
    for (let i = all.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [all[i], all[j]] = [all[j], all[i]]; }
    return all;
  }, [scene, seed]);
  const [open, setOpen] = useState<number[]>([]);
  const [done, setDone] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);
  const mistakes = useRef<string[]>([]);
  const reported = useRef(false);

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open.map((id) => cards.find((c) => c.id === id)!);
    if (a.pair === b.pair) { setDone((d) => [...d, a.pair]); setOpen([]); return; }
    setMisses((m) => m + 1);
    const label = scene.pairs[a.pair].text;
    if (!mistakes.current.includes(label)) mistakes.current.push(label);
    const id = window.setTimeout(() => setOpen([]), calm ? 700 : 900);
    return () => window.clearTimeout(id);
  }, [open, cards, scene.pairs, calm]);
  useEffect(() => {
    if (done.length === scene.pairs.length && !reported.current) { reported.current = true; onDone({ won: true, score: Math.max(10, scene.pairs.length * 10 - misses * 2), mistakes: [] }); }
  }, [done, scene.pairs.length, misses, onDone]);

  const flip = (c: Card) => { if (open.length < 2 && !open.includes(c.id) && !done.includes(c.pair)) setOpen((o) => [...o, c.id]); };
  return (
    <div className="av-memory" data-testid="av-memory">
      <section className="av-panel av-memory-card">
        <h2>{scene.title} · {done.length}/{scene.pairs.length}</h2>
        <div className="av-memory-grid">
          {cards.map((c) => {
            const up = open.includes(c.id) || done.includes(c.pair);
            return (
              <button key={c.id} type="button" className="av-mem" data-up={up || undefined} data-done={done.includes(c.pair) || undefined} onClick={() => flip(c)} aria-label={up ? (c.text ?? scene.pairs[c.pair].text) : t('ap.chooseOne', 'Choose one')}>
                {up ? (c.art ? <img src={`${artBase}/cards/${c.art}.webp`} alt="" draggable={false} /> : <b>{c.text}</b>) : <span aria-hidden="true">?</span>}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export const memoryScene: SceneModule<MemoryScene> = {
  view: MemoryView,
  spoken: () => [],
  art: (s) => s.pairs.map((p) => `cards/${p.art}`),
  validate: (s) => ((s.pairs?.length ?? 0) < 3 || s.pairs.length > 6 ? [`${s.id}: memory needs 3-6 pairs`] : []),
};
