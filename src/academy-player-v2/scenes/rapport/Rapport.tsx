// Rapport (dialogue RPG): an NPC (a cast member) asks; the student picks the reply that sounds most natural. Best reply +2, fine +1, off -> 0.
// Every choice is explained, there is no fail state (comfort): the bar shows how well the conversation went; weak replies go to the Mistake Bank.
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSay } from '../useSay';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export interface RapportScene extends SceneBase {
  kind: 'rapport'; title: string; npc: CastName;
  exchanges: { say: string; options: { text: string; score: 0 | 1 | 2; reply: string; note: string }[] }[];
}

function RapportView({ scene, onDone, artBase }: SceneProps<RapportScene>) {
  const { t } = useTranslation();
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [pts, setPts] = useState(0);
  const mistakes = useRef<string[]>([]);
  const ex = scene.exchanges[i];
  const max = scene.exchanges.length * 2;
  useSay(scene.npc, pick === null ? ex.say : ex.options[pick].reply, artBase);
  const choose = (n: number) => {
    if (pick !== null) return;
    setPick(n);
    setPts((p) => p + ex.options[n].score);
    if (ex.options[n].score === 0) mistakes.current.push(ex.options[n].text);
  };
  const next = () => {
    if (i === scene.exchanges.length - 1) { onDone({ won: true, score: pts * 5, mistakes: mistakes.current }); return; }
    setI(i + 1); setPick(null);
  };
  return (
    <div className="av-rapport" data-testid="av-rapport">
      <section className="av-panel av-rapport-card">
        <h2>{scene.title}</h2>
        <div className="av-boss-hp av-rapport-bar" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={pts}><span>{scene.npc} ♥</span><i style={{ width: `${(pts / max) * 100}%` }} /></div>
        <div className="av-rapport-line">
          <img src={`${artBase}/cast/${scene.npc.toLowerCase()}/happy.webp`} alt="" draggable={false} onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />
          <p className="av-q"><b className="av-npc">{scene.npc}</b> {pick === null ? ex.say : ex.options[pick].reply}</p>
        </div>
        <div className="av-opts" role="group" aria-label={t('ap.chooseOne', 'Choose one')}>
          {ex.options.map((o, n) => <button key={n} type="button" className="av-opt" data-state={pick === null ? undefined : n === pick ? (o.score === 0 ? 'wrong' : 'right') : undefined} disabled={pick !== null} onClick={() => choose(n)}>{o.text}</button>)}
        </div>
        {pick !== null && <><p className="av-note" data-ok={ex.options[pick].score > 0 || undefined}>{ex.options[pick].note}</p><button type="button" className="av-btn" data-kind="go" onClick={next}>{i === scene.exchanges.length - 1 ? t('ap.finish', 'Finish the lesson') : `${t('ap.next', 'Next')} ›`}</button></>}
      </section>
    </div>
  );
}

export const rapportScene: SceneModule<RapportScene> = {
  view: RapportView,
  spoken: (s) => s.exchanges.flatMap((e) => [{ who: s.npc, text: e.say }, ...e.options.map((o) => ({ who: s.npc, text: o.reply }))]),
  validate: (s) => {
    const p: string[] = [];
    if ((s.exchanges?.length ?? 0) < 2) p.push(`${s.id}: rapport needs 2+ exchanges`);
    s.exchanges?.forEach((e, i) => {
      if (e.options.length < 2 || e.options.length > 4) p.push(`${s.id}: exchange ${i + 1} needs 2-4 replies`);
      if (!e.options.some((o) => o.score === 2)) p.push(`${s.id}: exchange ${i + 1} needs a best reply (score 2)`);
      if (e.options.some((o) => !o.note.trim())) p.push(`${s.id}: exchange ${i + 1}: every reply needs a note (why)`);
    });
    return p;
  },
};
