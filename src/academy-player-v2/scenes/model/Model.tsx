// Modelling: I do -> we do -> you do. The teacher character models the new language first; the student only speaks at "you do".
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSay } from '../useSay';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export type ModelPhase = 'iDo' | 'weDo' | 'youDo';
export interface ModelScene extends SceneBase { kind: 'model'; title: string; who: CastName; steps: { phase: ModelPhase; text: string }[] }
const ORDER: ModelPhase[] = ['iDo', 'weDo', 'youDo'];

function ModelView({ scene, onDone, artBase }: SceneProps<ModelScene>) {
  const { t } = useTranslation();
  const [i, setI] = useState(0);
  const step = scene.steps[i];
  const last = i === scene.steps.length - 1;
  useSay(scene.who, step.phase === 'youDo' ? undefined : step.text, artBase);
  const labels: Record<ModelPhase, string> = { iDo: t('ap.iDo', 'I do'), weDo: t('ap.weDo', 'We do'), youDo: t('ap.youDo', 'You do') };
  const advance = () => { if (last) onDone(); else setI(i + 1); };
  return (
    <div className="av-model" data-testid="av-model">
      <section className="av-panel av-model-card" data-phase={step.phase}>
        <h2>{t('ap.model', 'Watch and listen')} · {scene.title}</h2>
        <div className="av-model-tabs">{ORDER.map((p) => <em key={p} data-on={p === step.phase}>{labels[p]}</em>)}</div>
        <p className="av-model-line"><b>{scene.who}</b> {step.text}</p>
        <button type="button" className="av-btn" data-kind="go" onClick={advance}>{step.phase === 'youDo' ? t('ap.sayIt', 'Say it out loud, then tap ✓') : `${t('ap.next', 'Next')} ›`}</button>
      </section>
    </div>
  );
}

export const modelScene: SceneModule<ModelScene> = {
  view: ModelView,
  // the teacher models; the student's own turn (you do) is not spoken by a voice
  spoken: (s) => s.steps.filter((x) => x.phase !== 'youDo').map((x) => ({ who: s.who, text: x.text })),
  validate: (s) => {
    const p: string[] = [];
    if (!s.steps?.length) return [`${s.id}: model has no steps`];
    const seq = s.steps.map((x) => ORDER.indexOf(x.phase));
    if (seq.some((n) => n < 0)) p.push(`${s.id}: unknown phase`);
    if (seq.some((n, k) => k && n < seq[k - 1])) p.push(`${s.id}: phases must go I do, we do, you do`);
    if (s.steps[0].phase !== 'iDo') p.push(`${s.id}: the teacher models first (I do)`);
    if (!s.steps.some((x) => x.phase === 'youDo')) p.push(`${s.id}: needs a "you do" step`);
    return p;
  },
};
