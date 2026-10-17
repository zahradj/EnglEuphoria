// The rule, stated plainly: at most 3 lines, an example each, read aloud; the student says each line and ticks it (owner rule: modelling and the rule).
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSay } from '../useSay';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export interface RuleScene extends SceneBase { kind: 'rule'; title: string; who: CastName; lines: { rule: string; example: string }[] }

function RuleView({ scene, onDone, artBase }: SceneProps<RuleScene>) {
  const { t } = useTranslation();
  const [said, setSaid] = useState<boolean[]>(() => scene.lines.map(() => false));
  const [now, setNow] = useState(0);
  const cur = scene.lines[Math.min(now, scene.lines.length - 1)];
  useSay(scene.who, `${cur.rule} ${cur.example}`, artBase);
  const tick = (i: number) => {
    const next = said.map((v, k) => (k === i ? true : v));
    setSaid(next);
    if (next.every(Boolean)) onDone(); else setNow(next.findIndex((v) => !v));
  };
  return (
    <div className="av-rule" data-testid="av-rule">
      <section className="av-panel av-rule-card">
        <h2>{t('ap.rule', 'The rule')} · {scene.title}</h2>
        <ol>
          {scene.lines.map((l, i) => (
            <li key={i} data-state={said[i] ? 'done' : i === now ? 'now' : 'todo'}>
              <strong>{l.rule}</strong>
              <em>{l.example}</em>
              {i === now && !said[i] && <button type="button" className="av-btn" data-kind="go" onClick={() => tick(i)}>{t('ap.sayIt', 'Say it out loud, then tap ✓')}</button>}
              {said[i] && <span className="av-ok" aria-hidden="true">✓</span>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export const ruleScene: SceneModule<RuleScene> = {
  view: RuleView,
  spoken: (s) => s.lines.map((l) => ({ who: s.who, text: `${l.rule} ${l.example}` })),
  validate: (s) => {
    const p: string[] = [];
    if (!s.lines?.length) p.push(`${s.id}: rule has no lines`);
    else if (s.lines.length > 3) p.push(`${s.id}: a rule is at most 3 lines (has ${s.lines.length})`);
    s.lines?.forEach((l, i) => { if (!l.example?.trim()) p.push(`${s.id}: rule line ${i + 1} needs an example`); });
    return p;
  },
};
