// Break the Clock (boss fight): each right answer strikes the boss; a wrong one costs a shield. No countdown, no ranking; shields gone = try again.
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameState } from '../../engine/gameState';
import { useSay } from '../useSay';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface BossScene extends SceneBase {
  kind: 'boss'; title: string; prompt: string; boss: string; shields?: number;
  rounds: { frame: string; options: string[]; answer: number; why: string }[];
}

function BossView({ scene, onDone, artBase, calm }: SceneProps<BossScene>) {
  const { t } = useTranslation();
  const g = useGameState(scene.shields ?? 3);
  const [r, setR] = useState(0);
  const [bad, setBad] = useState<number[]>([]);
  const [struck, setStruck] = useState(false);
  const mistakes = useRef<string[]>([]);
  const round = scene.rounds[r];
  const hp = scene.rounds.length - (struck ? r + 1 : r);
  const lost = g.state.triesLeft === 0;
  useSay('Theo', r === 0 ? scene.prompt : undefined, artBase);

  const tap = (n: number) => {
    if (struck || lost || bad.includes(n)) return;
    if (n === round.answer) { g.hit(); setStruck(true); }
    else { g.miss(); setBad((b) => [...b, n]); if (!mistakes.current.includes(round.frame)) mistakes.current.push(round.frame); }
  };
  const next = () => {
    if (r === scene.rounds.length - 1) { onDone({ won: true, score: g.state.score, mistakes: mistakes.current }); return; }
    setR(r + 1); setBad([]); setStruck(false);
  };
  const retry = () => { g.reset(); setR(0); setBad([]); setStruck(false); };
  return (
    <div className="av-boss" data-testid="av-boss" data-calm={calm || undefined}>
      <div className="av-sort-hud">
        <span className="av-pill">⭐ {g.state.score}</span>
        <span className="av-pill">🛡 {'●'.repeat(g.state.triesLeft)}{'○'.repeat(g.state.tries - g.state.triesLeft)}</span>
      </div>
      <section className="av-panel av-boss-card">
        <h2>{scene.title}</h2>
        <div className="av-boss-hp" role="progressbar" aria-label={scene.boss} aria-valuemin={0} aria-valuemax={scene.rounds.length} aria-valuenow={hp}>
          <span>{scene.boss}</span><i style={{ width: `${(hp / scene.rounds.length) * 100}%` }} />
        </div>
        {!lost && <>
          <p className="av-q">{round.frame}</p>
          <div className="av-opts">{round.options.map((o, n) => <button key={n} type="button" className="av-opt" data-state={struck && n === round.answer ? 'right' : bad.includes(n) ? 'wrong' : undefined} onClick={() => tap(n)}>{o}</button>)}</div>
          {bad.length > 0 && !struck && <p className="av-note">{t('ap.tryAgain', 'Almost. Look again.')}</p>}
          {struck && <><p className="av-note" data-ok="true">{t('ap.wellDone', 'Well done!')} {round.why}</p><button type="button" className="av-btn" data-kind="go" onClick={next}>{r === scene.rounds.length - 1 ? t('ap.finish', 'Finish the lesson') : `${t('ap.next', 'Next')} ›`}</button></>}
        </>}
        {lost && <><p className="av-note">{t('ap.tryAgain', 'Almost. Look again.')}</p><button type="button" className="av-btn" data-kind="go" onClick={retry}>{t('ap.restart', 'Start again')}</button></>}
      </section>
    </div>
  );
}

export const bossScene: SceneModule<BossScene> = {
  view: BossView,
  spoken: (s) => [{ who: 'Theo', text: s.prompt }],
  validate: (s) => {
    const p: string[] = [];
    if (!s.rounds?.length) return [`${s.id}: boss has no rounds`];
    s.rounds.forEach((q, i) => {
      if (q.options.length < 2 || q.options.length > 4) p.push(`${s.id}: round ${i + 1} needs 2-4 options`);
      if (q.answer < 0 || q.answer >= q.options.length) p.push(`${s.id}: round ${i + 1} answer is not an option`);
      if (!q.why?.trim()) p.push(`${s.id}: round ${i + 1} needs a reason (feedback)`);
    });
    return p;
  },
};
