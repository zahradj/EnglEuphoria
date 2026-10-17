// Multiple-choice check: one question at a time, a wrong tap is gentle and logged for the Mistake Bank, a right one pops.
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSay } from '../useSay';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface ChoiceScene extends SceneBase {
  kind: 'choice'; title: string;
  /** a text to read first (it stays on screen while the questions are answered) */
  passage?: string[];
  questions: { q: string; options: string[]; answer: number; why?: string }[];
}

function ChoiceView({ scene, onDone, artBase, calm, fx: fxIn }: SceneProps<ChoiceScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('thinking');
  const [i, setI] = useState(0);
  const [bad, setBad] = useState<number[]>([]);
  const [ok, setOk] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [clean, setClean] = useState<boolean[]>([]);
  const mistakes = useRef<string[]>([]);
  const optEls = useRef<(HTMLButtonElement | null)[]>([]);
  const q = scene.questions[i];
  const last = i === scene.questions.length - 1;
  useSay('Vee', q.q, artBase);
  const tap = (n: number) => {
    if (ok || bad.includes(n)) return;
    const el = optEls.current[n];
    if (n === q.answer) {
      const first = !bad.length;
      setOk(true); setClean((c) => [...c, first]);
      if (first) { setScore((s) => s + 10); setStreak((k) => k + 1); }
      else setStreak(0);
      popEl(el, calm, 'pop'); fx.burstAt(el, first ? 'gold' : 'teal'); fx.floatAt(el, first ? '+10' : '✓', first ? 'gold' : 'teal');
      if (last) { fx.confetti(); actor.hold('happy', 'cheer'); } else actor.cheer();
    } else {
      setBad((b) => [...b, n]); setStreak(0); popEl(el, calm, 'wobble'); actor.flinch();
      if (!mistakes.current.includes(q.q)) mistakes.current.push(q.q);
    }
  };
  const next = () => {
    if (last) { onDone({ won: true, score: score, mistakes: mistakes.current }); return; }
    setI(i + 1); setBad([]); setOk(false); actor.hold('thinking');
  };
  return (
    <div className="av-game av-choice" data-testid="av-choice">
      <GameBackdrop /><Glow on={streak >= 3} tone="gold" />
      <Cast who="Vee" mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body">
        <section className="av-panel av-game-card av-choice-card">
          <header className="av-card-head">
            <h2>{scene.title} · {i + 1}/{scene.questions.length}</h2>
            <div className="av-hud-row">
              <span className="av-pips" aria-hidden="true">{scene.questions.map((_, k) => <i key={k} data-state={k < i ? (clean[k] ? 'gold' : 'done') : k === i ? 'now' : 'todo'} />)}</span>
              {streak >= 2 && <span className="av-pill av-combo" data-tone="brand" key={`k${streak}`}>{t('ap.combo', 'Combo ×{{n}}', { n: streak })}</span>}
            </div>
            <Badge who="Vee" mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
          </header>
          {scene.passage && <div className="av-passage">{scene.passage.map((l, k) => <p key={k}>{l}</p>)}</div>}
          <p className="av-q" key={i}>{q.q}</p>
          <div className="av-opts av-lettered" role="group" aria-label={t('ap.chooseOne', 'Choose one')} key={`o${i}`}>
            {q.options.map((o, n) => (
              <button key={n} ref={(el) => { optEls.current[n] = el; }} type="button" className="av-opt" style={{ ['--i' as string]: n }} data-state={ok && n === q.answer ? 'right' : bad.includes(n) ? 'wrong' : undefined} onClick={() => tap(n)}>{o}</button>
            ))}
          </div>
          {bad.length > 0 && !ok && <p className="av-note">{t('ap.tryAgain', 'Almost. Look again.')}</p>}
          {ok && <p className="av-note av-why" data-ok="true">{t('ap.wellDone', 'Well done!')} {q.why}</p>}
          {ok && last && <Reward score={score} stars={starsFor(clean.filter(Boolean).length, scene.questions.length)} gem={mistakes.current.length === 0} calm={calm} />}
          {ok && <button type="button" className="av-btn" data-kind="go" onClick={next}>{last ? t('ap.finish', 'Finish the lesson') : `${t('ap.next', 'Next')} ›`}</button>}
        </section>
      </div>
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
