// Read and match: tap a left card, then its partner on the right. Pairs that match lock in; wrong pairs are gentle and logged.
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface MatchScene extends SceneBase { kind: 'match'; title: string; pairs: { left: string; right: string }[] }

const shuffle = <T,>(a: T[], seed: number) => { const r = [...a]; let s = seed || 1; for (let i = r.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };

function MatchView({ scene, onDone, seed }: SceneProps<MatchScene>) {
  const { t } = useTranslation();
  const lefts = useMemo(() => shuffle(scene.pairs.map((p, k) => ({ k, text: p.left })), seed), [scene, seed]);
  const rights = useMemo(() => shuffle(scene.pairs.map((p, k) => ({ k, text: p.right })), seed + 1), [scene, seed]);
  const [pick, setPick] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [bad, setBad] = useState<number | null>(null);
  const mistakes = useRef<string[]>([]);
  const score = useRef(0);
  const dirtyPair = useRef<Set<number>>(new Set());
  const tapRight = (k: number) => {
    if (pick === null || done.includes(k)) return;
    if (pick === k) {
      score.current += dirtyPair.current.has(k) ? 5 : 10;
      const next = [...done, k]; setDone(next); setPick(null); setBad(null);
      if (next.length === scene.pairs.length) onDone({ won: true, score: score.current, mistakes: mistakes.current });
    } else {
      setBad(k); dirtyPair.current.add(pick);
      const label = `${scene.pairs[pick].left} = ${scene.pairs[pick].right}`;
      if (!mistakes.current.includes(label)) mistakes.current.push(label);
    }
  };
  return (
    <div className="av-match" data-testid="av-match">
      <section className="av-panel av-match-card">
        <h2>{scene.title}</h2>
        <div className="av-match-cols">
          <div>{lefts.map((l) => <button key={l.k} type="button" className="av-opt" data-state={done.includes(l.k) ? 'right' : pick === l.k ? 'pick' : undefined} disabled={done.includes(l.k)} onClick={() => { setPick(l.k); setBad(null); }}>{l.text}</button>)}</div>
          <div>{rights.map((r) => <button key={r.k} type="button" className="av-opt" data-state={done.includes(r.k) ? 'right' : bad === r.k ? 'wrong' : undefined} disabled={done.includes(r.k)} onClick={() => tapRight(r.k)}>{r.text}</button>)}</div>
        </div>
        {bad !== null && <p className="av-note">{t('ap.tryAgain', 'Almost. Look again.')}</p>}
      </section>
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
