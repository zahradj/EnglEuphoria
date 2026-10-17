// Wrap: teach-back (the student restates the rule), what was earned, and what comes back to practise.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSay } from '../useSay';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface WrapScene extends SceneBase { kind: 'wrap'; heading: string; teachBack: string }

function WrapView({ scene, script, onDone, artBase, summary }: SceneProps<WrapScene>) {
  const { t } = useTranslation();
  const [said, setSaid] = useState(false);
  useSay('Vee', scene.teachBack, artBase);
  return (
    <div className="av-wrap" data-testid="av-wrap">
      <section className="av-panel av-wrap-card">
        <h2>{scene.heading}</h2>
        <div className="av-stats">
          <span><b>{summary.xp}</b>{t('ap.xpEarned', 'XP earned')}</span>
          <span><b>{summary.gems}</b>{t('ap.gems', 'Gems')}</span>
        </div>
        <h3>{t('ap.teachBack', 'Say the rule in your own words')}</h3>
        <p className="av-q">{scene.teachBack}</p>
        {!said && <button type="button" className="av-btn" data-kind="go" onClick={() => { setSaid(true); onDone(); }}>{t('ap.sayIt', 'Say it out loud, then tap ✓')}</button>}
        {said && <p className="av-note" data-ok="true">{t('ap.wellDone', 'Well done!')}</p>}
        {summary.mistakes.length > 0 && (
          <>
            <h3>{t('ap.practiceAgain', 'To practise again next time')}</h3>
            <ul className="av-again">{summary.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
          </>
        )}
        <ul className="av-mission">{script.criteria.map((c, i) => <li key={i}>{c}</li>)}</ul>
      </section>
    </div>
  );
}

export const wrapScene: SceneModule<WrapScene> = {
  view: WrapView,
  spoken: () => [],
  validate: (s) => (s.teachBack?.trim() ? [] : [`${s.id}: the Wrap needs a teach-back prompt`]),
};
