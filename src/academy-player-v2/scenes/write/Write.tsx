// Writing rows: the student types a sentence for each prompt; it is accepted when every pattern matches (so many right answers are fine).
// A wrong try is gentle (a hint, then the sample after two tries); typed text is the student's own and is never sent anywhere from here.
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface WriteScene extends SceneBase {
  kind: 'write'; title: string; prompt: string;
  /** every pattern (a regex source, case-insensitive) must match the typed text */
  rows: { label: string; frame: string; accept: string[]; hint: string; sample: string }[];
}
export const accepts = (accept: string[], text: string) => text.trim().length > 2 && accept.every((a) => new RegExp(a, 'i').test(text));

function WriteView({ scene, onDone }: SceneProps<WriteScene>) {
  const { t } = useTranslation();
  const [text, setText] = useState<string[]>(() => scene.rows.map(() => ''));
  const [ok, setOk] = useState<boolean[]>(() => scene.rows.map(() => false));
  const [tries, setTries] = useState<number[]>(() => scene.rows.map(() => 0));
  const mistakes = useRef<string[]>([]);
  const reported = useRef(false);
  const check = (i: number) => {
    const good = accepts(scene.rows[i].accept, text[i]);
    if (good) {
      const next = ok.map((v, k) => (k === i ? true : v));
      setOk(next);
      if (next.every(Boolean) && !reported.current) { reported.current = true; onDone({ won: true, score: scene.rows.length * 10 - mistakes.current.length * 5, mistakes: mistakes.current }); }
    } else {
      setTries((a) => a.map((n, k) => (k === i ? n + 1 : n)));
      if (!mistakes.current.includes(scene.rows[i].label)) mistakes.current.push(scene.rows[i].label);
    }
  };
  return (
    <div className="av-write" data-testid="av-write">
      <section className="av-panel av-write-card">
        <h2>{scene.title}</h2>
        <p className="av-q">{scene.prompt}</p>
        {scene.rows.map((r, i) => (
          <div key={i} className="av-write-row" data-ok={ok[i] || undefined}>
            <label>{r.label}<small>{r.frame}</small>
              <input type="text" value={text[i]} disabled={ok[i]} placeholder={r.frame} onChange={(e) => setText((a) => a.map((v, k) => (k === i ? e.target.value : v)))} onKeyDown={(e) => { if (e.key === 'Enter') check(i); }} />
            </label>
            {!ok[i] && <button type="button" className="av-btn" data-kind="go" onClick={() => check(i)}>{t('ap.check', 'Check')}</button>}
            {ok[i] && <span className="av-ok" aria-hidden="true">✓</span>}
            {!ok[i] && tries[i] > 0 && <p className="av-note">{r.hint}{tries[i] > 1 ? ` · ${r.sample}` : ''}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}

export const writeScene: SceneModule<WriteScene> = {
  view: WriteView,
  spoken: () => [],
  validate: (s) => {
    const p: string[] = [];
    if (!s.rows?.length) return [`${s.id}: write has no rows`];
    s.rows.forEach((r, i) => {
      try { if (!accepts(r.accept, r.sample)) p.push(`${s.id}: row ${i + 1}: the sample answer is not accepted by its own patterns`); }
      catch { p.push(`${s.id}: row ${i + 1}: a pattern is not a valid regex`); }
      if (!r.hint?.trim()) p.push(`${s.id}: row ${i + 1} needs a hint`);
    });
    return p;
  },
};
