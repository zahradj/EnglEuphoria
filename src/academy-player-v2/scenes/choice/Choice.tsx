// Multiple-choice check: one question at a time, a wrong tap is gentle and logged for the Mistake Bank, a right one pops.
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSay } from '../useSay';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface ChoiceScene extends SceneBase {
  kind: 'choice'; title: string;
  /** a text to read first (it stays on screen while the questions are answered) */
  passage?: string[];
  questions: { q: string; options: string[]; answer: number; why?: string }[];
}

function ChoiceView({ scene, onDone, artBase }: SceneProps<ChoiceScene>) {
  const { t } = useTranslation();
  const [i, setI] = useState(0);
  const [bad, setBad] = useState<number[]>([]);
  const [ok, setOk] = useState(false);
  const [score, setScore] = useState(0);
  const mistakes = useRef<string[]>([]);
  const q = scene.questions[i];
  useSay('Vee', q.q, artBase);
  const tap = (n: number) => {
    if (ok || bad.includes(n)) return;
    if (n === q.answer) { setOk(true); if (!bad.length) setScore((s) => s + 10); }
    else { setBad((b) => [...b, n]); if (!mistakes.current.includes(q.q)) mistakes.current.push(q.q); }
  };
  const next = () => {
    if (i === scene.questions.length - 1) { onDone({ won: true, score: score, mistakes: mistakes.current }); return; }
    setI(i + 1); setBad([]); setOk(false);
  };
  return (
    <div className="av-choice" data-testid="av-choice">
      <section className="av-panel av-choice-card">
        <h2>{scene.title} · {i + 1}/{scene.questions.length}</h2>
        {scene.passage && <div className="av-passage">{scene.passage.map((l, k) => <p key={k}>{l}</p>)}</div>}
        <p className="av-q">{q.q}</p>
        <div className="av-opts" role="group" aria-label={t('ap.chooseOne', 'Choose one')}>
          {q.options.map((o, n) => (
            <button key={n} type="button" className="av-opt" data-state={ok && n === q.answer ? 'right' : bad.includes(n) ? 'wrong' : undefined} onClick={() => tap(n)}>{o}</button>
          ))}
        </div>
        {bad.length > 0 && !ok && <p className="av-note">{t('ap.tryAgain', 'Almost. Look again.')}</p>}
        {ok && <p className="av-note" data-ok="true">{t('ap.wellDone', 'Well done!')} {q.why}</p>}
        {ok && <button type="button" className="av-btn" data-kind="go" onClick={next}>{i === scene.questions.length - 1 ? t('ap.finish', 'Finish the lesson') : `${t('ap.next', 'Next')} ›`}</button>}
      </section>
    </div>
  );
}

export const choiceScene: SceneModule<ChoiceScene> = {
  view: ChoiceView,
  spoken: (s) => s.questions.map((q) => ({ who: 'Vee', text: q.q })),
  validate: (s) => {
    const p: string[] = [];
    if (!s.questions?.length) return [`${s.id}: choice has no questions`];
    s.questions.forEach((q, i) => {
      if (q.options.length < 2 || q.options.length > 4) p.push(`${s.id}: question ${i + 1} needs 2-4 options`);
      if (q.answer < 0 || q.answer >= q.options.length) p.push(`${s.id}: question ${i + 1} answer is not an option`);
    });
    return p;
  },
};
