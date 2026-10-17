// Read and match: tap a left card, then its partner on the right. Pairs that match lock in; wrong pairs are gentle and logged.
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface MatchScene extends SceneBase { kind: 'match'; title: string; pairs: { left: string; right: string }[] }

const shuffle = <T,>(a: T[], seed: number) => { const r = [...a]; let s = seed || 1; for (let i = r.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };

interface Line { k: number; x1: number; y1: number; x2: number; y2: number }

function MatchView({ scene, onDone, seed, artBase, calm, fx: fxIn }: SceneProps<MatchScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('thinking');
  const lefts = useMemo(() => shuffle(scene.pairs.map((p, k) => ({ k, text: p.left })), seed), [scene, seed]);
  const rights = useMemo(() => shuffle(scene.pairs.map((p, k) => ({ k, text: p.right })), seed + 1), [scene, seed]);
  const [pick, setPick] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [bad, setBad] = useState<number | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const mistakes = useRef<string[]>([]);
  const score = useRef(0);
  const dirtyPair = useRef<Set<number>>(new Set());
  const colsEl = useRef<HTMLDivElement>(null);
  const leftEls = useRef<Record<number, HTMLButtonElement | null>>({});
  const rightEls = useRef<Record<number, HTMLButtonElement | null>>({});
  const finished = done.length === scene.pairs.length;

  // where the lines go: from the right edge of the left card to the left edge of its partner (re-measured on resize)
  const measure = useCallback(() => {
    const box = colsEl.current?.getBoundingClientRect();
    if (!box) return;
    setLines(done.flatMap((k) => {
      const a = leftEls.current[k]?.getBoundingClientRect(); const b = rightEls.current[k]?.getBoundingClientRect();
      return a && b ? [{ k, x1: a.right - box.left, y1: a.top + a.height / 2 - box.top, x2: b.left - box.left, y2: b.top + b.height / 2 - box.top }] : [];
    }));
  }, [done]);
  useLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver === 'undefined' || !colsEl.current) return;
    const ro = new ResizeObserver(measure); ro.observe(colsEl.current);
    return () => ro.disconnect();
  }, [measure]);

  const tapRight = (k: number) => {
    if (pick === null || done.includes(k)) return;
    const el = rightEls.current[k];
    if (pick === k) {
      score.current += dirtyPair.current.has(k) ? 5 : 10;
      popEl(leftEls.current[k] ?? null, calm, 'pop'); popEl(el ?? null, calm, 'pop');
      fx.burstAt(el, 'gold'); fx.floatAt(el, dirtyPair.current.has(k) ? '+5' : '+10', 'gold');
      const next = [...done, k]; setDone(next); setPick(null); setBad(null);
      if (next.length === scene.pairs.length) { fx.confetti(); actor.hold('happy', 'cheer'); onDone({ won: true, score: score.current, mistakes: mistakes.current }); }
      else actor.cheer();
    } else {
      setBad(k); dirtyPair.current.add(pick); popEl(el ?? null, calm, 'wobble'); actor.flinch();
      const label = `${scene.pairs[pick].left} = ${scene.pairs[pick].right}`;
      if (!mistakes.current.includes(label)) mistakes.current.push(label);
    }
  };
  const hue = (k: number) => done.indexOf(k) % 5;
  return (
    <div className="av-game av-match" data-testid="av-match">
      <GameBackdrop /><Glow on={finished} tone="gold" />
      <Cast who="Ava" mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="right" />
      <div className="av-game-body">
        <section className="av-panel av-game-card av-match-card">
          <header className="av-card-head">
            <h2>{scene.title} · {done.length}/{scene.pairs.length}</h2>
            <Badge who="Ava" mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
          </header>
          <div className="av-match-cols" ref={colsEl}>
            <svg className="av-match-lines" aria-hidden="true">
              {lines.map((l) => {
                const mx = (l.x1 + l.x2) / 2;
                return <path key={l.k} d={`M${l.x1} ${l.y1} C ${mx} ${l.y1}, ${mx} ${l.y2}, ${l.x2} ${l.y2}`} pathLength={100} data-h={hue(l.k)} />;
              })}
            </svg>
            <div>{lefts.map((l, n) => <button key={l.k} ref={(el) => { leftEls.current[l.k] = el; }} type="button" className="av-opt av-pairchip" style={{ ['--i' as string]: n }} data-h={done.includes(l.k) ? hue(l.k) : undefined} data-state={done.includes(l.k) ? 'right' : pick === l.k ? 'pick' : undefined} disabled={done.includes(l.k)} onClick={() => { setPick(l.k); setBad(null); }}>{l.text}</button>)}</div>
            <div>{rights.map((r, n) => <button key={r.k} ref={(el) => { rightEls.current[r.k] = el; }} type="button" className="av-opt av-pairchip" style={{ ['--i' as string]: n + 2 }} data-h={done.includes(r.k) ? hue(r.k) : undefined} data-state={done.includes(r.k) ? 'right' : bad === r.k ? 'wrong' : undefined} disabled={done.includes(r.k)} onClick={() => tapRight(r.k)}>{r.text}</button>)}</div>
          </div>
          {bad !== null && <p className="av-note">{t('ap.tryAgain', 'Almost. Look again.')}</p>}
          {finished && <Reward score={score.current} stars={starsFor(scene.pairs.length - mistakes.current.length, scene.pairs.length)} gem={mistakes.current.length === 0} calm={calm} />}
        </section>
      </div>
    </div>
  );
}

export const matchScene: SceneModule<MatchScene> = {
  view: MatchView,
  spoken: () => [],
  validate: (s) => {
    const p: string[] = [];
    if ((s.pairs?.length ?? 0) < 3 || s.pairs.length > 6) p.push(`${s.id}: match needs 3-6 pairs`);
    const r = s.pairs?.map((x) => x.right) ?? [];
    if (new Set(r).size !== r.length) p.push(`${s.id}: two pairs share the same right card`);
    return p;
  },
};
