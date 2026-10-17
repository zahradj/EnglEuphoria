// Memory: flip two cards, match a sticker picture with its word. No timer, no move limit (comfort); a flip-back after a miss, a glow on a match.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface MemoryScene extends SceneBase { kind: 'memory'; title: string; pairs: { art: string; text: string }[] }
type Card = { id: number; pair: number; art?: string; text?: string };

function MemoryView({ scene, onDone, artBase, calm, seed, fx: fxIn }: SceneProps<MemoryScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('curious');
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
  const els = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open.map((id) => cards.find((c) => c.id === id)!);
    if (a.pair === b.pair) {
      const t0 = window.setTimeout(() => {
        setDone((d) => [...d, a.pair]); setOpen([]);
        fx.burstAt(els.current[b.id], 'gold'); fx.burstAt(els.current[a.id], 'teal'); fx.floatAt(els.current[b.id], '+10', 'gold');
        popEl(els.current[a.id], calm, 'pop'); popEl(els.current[b.id], calm, 'pop'); actor.cheer();
      }, calm ? 0 : 380);
      return () => window.clearTimeout(t0);
    }
    setMisses((m) => m + 1);
    const label = scene.pairs[a.pair].text;
    if (!mistakes.current.includes(label)) mistakes.current.push(label);
    const w = window.setTimeout(() => { popEl(els.current[a.id], calm, 'wobble'); popEl(els.current[b.id], calm, 'wobble'); actor.flinch(1100); }, calm ? 0 : 420);
    const id = window.setTimeout(() => setOpen([]), calm ? 700 : 1100);
    return () => { window.clearTimeout(id); window.clearTimeout(w); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cards, scene.pairs, calm]);
  const finished = done.length === scene.pairs.length;
  useEffect(() => {
    if (finished && !reported.current) { reported.current = true; fx.confetti(); actor.hold('happy', 'cheer'); onDone({ won: true, score: Math.max(10, scene.pairs.length * 10 - misses * 2), mistakes: [] }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, scene.pairs.length, misses, onDone]);

  const flip = (c: Card) => { if (open.length < 2 && !open.includes(c.id) && !done.includes(c.pair)) setOpen((o) => [...o, c.id]); };
  return (
    <div className="av-game av-memory" data-testid="av-memory">
      <GameBackdrop /><Glow on={finished} tone="gold" />
      <Cast who="Mia" mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body">
        <section className="av-panel av-game-card av-memory-card">
          <header className="av-card-head">
            <h2>{scene.title}</h2>
            <span className="av-pips" aria-hidden="true">{scene.pairs.map((_, k) => <i key={k} data-state={done.includes(k) ? 'gold' : 'todo'} />)}</span>
            <Badge who="Mia" mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
          </header>
          <div className="av-memory-grid">
            {cards.map((c, n) => {
              const up = open.includes(c.id) || done.includes(c.pair);
              return (
                <button key={c.id} ref={(el) => { els.current[c.id] = el; }} type="button" className="av-mem" style={{ ['--i' as string]: n }} data-up={up || undefined} data-done={done.includes(c.pair) || undefined} onClick={() => flip(c)} aria-label={up ? (c.text ?? scene.pairs[c.pair].text) : t('ap.chooseOne', 'Choose one')}>
                  <span className="av-mem-in">
                    <span className="av-mem-back" aria-hidden="true" />
                    <span className="av-mem-front">{c.art ? <img src={`${artBase}/cards/${c.art}.webp`} alt="" draggable={false} /> : <b>{c.text}</b>}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {finished && <Reward score={Math.max(10, scene.pairs.length * 10 - misses * 2)} stars={starsFor(Math.max(0, scene.pairs.length - misses), scene.pairs.length)} gem={misses === 0} calm={calm} />}
        </section>
      </div>
    </div>
  );
}

export const memoryScene: SceneModule<MemoryScene> = {
  view: MemoryView,
  spoken: () => [],
  art: (s) => s.pairs.map((p) => `cards/${p.art}`),
  validate: (s) => ((s.pairs?.length ?? 0) < 3 || s.pairs.length > 6 ? [`${s.id}: memory needs 3-6 pairs`] : []),
};
