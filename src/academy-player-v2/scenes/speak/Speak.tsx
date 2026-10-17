// Speaking ladder: shadow -> repeat -> controlled -> guided -> free. Speaking is the biggest share of the lesson, so every step asks for the student's voice.
// Private by design: nothing is recorded here; the student confirms "I said it" (a voice note between lessons is a separate feature).
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSay } from '../useSay';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export type SpeakStep = 'shadow' | 'repeat' | 'controlled' | 'guided' | 'free';
export const LADDER: SpeakStep[] = ['shadow', 'repeat', 'controlled', 'guided', 'free'];
export interface SpeakScene extends SceneBase { kind: 'speak'; title: string; who: CastName; turns: { step: SpeakStep; prompt: string; model?: string }[] }

function SpeakView({ scene, onDone, artBase }: SceneProps<SpeakScene>) {
  const { t } = useTranslation();
  const [i, setI] = useState(0);
  const turn = scene.turns[i];
  useSay(scene.who, turn.model, artBase);
  const done = () => { if (i === scene.turns.length - 1) onDone(); else setI(i + 1); };
  return (
    <div className="av-speak" data-testid="av-speak">
      <section className="av-panel av-speak-card" data-step={turn.step}>
        <h2>{scene.title}</h2>
        <div className="av-model-tabs">{LADDER.map((s) => <em key={s} data-on={s === turn.step}>{s}</em>)}</div>
        <p className="av-model-line"><b>{scene.who}</b> {turn.prompt}</p>
        {turn.model && <p className="av-q">“{turn.model}”</p>}
        <button type="button" className="av-btn" data-kind="go" onClick={done}>{t('ap.sayIt', 'Say it out loud, then tap ✓')}</button>
      </section>
    </div>
  );
}

export const speakScene: SceneModule<SpeakScene> = {
  view: SpeakView,
  spoken: () => [],
  validate: (s) => {
    const p: string[] = [];
    if (!s.turns?.length) return [`${s.id}: speak has no turns`];
    const seq = s.turns.map((x) => LADDER.indexOf(x.step));
    if (seq.some((n) => n < 0)) p.push(`${s.id}: unknown speaking step`);
    if (seq.some((n, k) => k && n < seq[k - 1])) p.push(`${s.id}: steps must climb the ladder (shadow, repeat, controlled, guided, free)`);
    s.turns.forEach((x, k) => { if ((x.step === 'shadow' || x.step === 'repeat') && !x.model) p.push(`${s.id}: turn ${k + 1} (${x.step}) needs a model line`); });
    return p;
  },
};
