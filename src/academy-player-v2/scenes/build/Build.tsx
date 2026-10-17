// Build the sentence: tap word tiles in order. Several sentences; a wrong tile is gentle and logged; a clean sentence pops.
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSay } from '../useSay';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface BuildScene extends SceneBase { kind: 'build'; title: string; items: { words: string[]; hint?: string }[] }

const shuffle = <T,>(a: T[], seed: number) => { const r = [...a]; let s = seed || 1; for (let i = r.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };

function BuildView({ scene, onDone, artBase, seed }: SceneProps<BuildScene>) {
  const { t } = useTranslation();
  const [i, setI] = useState(0);
  const [got, setGot] = useState<number[]>([]);
  const [bad, setBad] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const dirty = useRef(false);
  const mistakes = useRef<string[]>([]);
  const item = scene.items[i];
  const sentence = item.words.join(' ');
  const tiles = useMemo(() => shuffle(item.words.map((w, k) => ({ w, k })), seed + i), [item, seed, i]);
  const finished = got.length === item.words.length;
  useSay('Vee', finished ? sentence : undefined, artBase);
  const tap = (k: number) => {
    if (finished || got.includes(k)) return;
    // the next word is the first not-yet-used index whose word matches (duplicates are interchangeable)
    if (item.words[got.length] === item.words[k]) { setGot([...got, k]); setBad(null); }
    else { setBad(k); dirty.current = true; if (!mistakes.current.includes(sentence)) mistakes.current.push(sentence); }
  };
  const next = () => {
    if (!dirty.current) setScore((s) => s + 10);
    if (i === scene.items.length - 1) { onDone({ won: true, score: score + (dirty.current ? 0 : 10), mistakes: mistakes.current }); return; }
    dirty.current = false; setI(i + 1); setGot([]); setBad(null);
  };
  return (
    <div className="av-build" data-testid="av-build">
      <section className="av-panel av-build-card">
        <h2>{scene.title} · {i + 1}/{scene.items.length}</h2>
        <p className="av-slots" aria-live="polite">{item.words.map((w, k) => <span key={k} data-on={k < got.length}>{k < got.length ? w : ''}</span>)}</p>
        <div className="av-tiles">{tiles.map(({ w, k }) => <button key={k} type="button" className="av-opt" data-state={got.includes(k) ? 'right' : bad === k ? 'wrong' : undefined} disabled={got.includes(k)} onClick={() => tap(k)}>{w}</button>)}</div>
        {bad !== null && !finished && <p className="av-note">{item.hint ?? t('ap.tryAgain', 'Almost. Look again.')}</p>}
        {finished && <><p className="av-note" data-ok="true">{t('ap.wellDone', 'Well done!')}</p><button type="button" className="av-btn" data-kind="go" onClick={next}>{i === scene.items.length - 1 ? t('ap.finish', 'Finish the lesson') : `${t('ap.next', 'Next')} ›`}</button></>}
      </section>
    </div>
  );
}

export const buildScene: SceneModule<BuildScene> = {
  view: BuildView,
  spoken: () => [],
  validate: (s) => {
    if (!s.items?.length) return [`${s.id}: build has no sentences`];
    return s.items.flatMap((it, i) => (it.words.length < 3 || it.words.length > 9 ? [`${s.id}: sentence ${i + 1} needs 3-9 words`] : []));
  },
};
