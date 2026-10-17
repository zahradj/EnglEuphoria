// Sort game (video-game loop): tap a card, then the right box. Combo, tries (no countdown), burst on a hit, gentle miss, win/lose + retry.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameState } from '../../engine/gameState';
import { useGamePhases } from '../../engine/gamePhases';
import { useSay } from '../useSay';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface SortScene extends SceneBase {
  kind: 'sort'; title: string; prompt: string; tries?: number;
  bins: { id: string; label: string; note?: string }[];
  items: { id: string; text: string; bin: string; hint?: string }[];
}

function SortView({ scene, onDone, artBase, calm, seed }: SceneProps<SortScene>) {
  const { t } = useTranslation();
  const g = useGameState(scene.tries ?? 3);
  const ph = useGamePhases('intro');
  const order = useMemo(() => {
    const a = [...scene.items]; let s = seed || 1;
    for (let i = a.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }, [scene.items, seed]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [msg, setMsg] = useState<'hit' | 'miss' | null>(null);
  const reported = useRef(false);
  const left = order.filter((i) => !placed.includes(i.id));
  const cur = pick ? scene.items.find((i) => i.id === pick) : left[0];
  useSay('Vee', ph.phase === 'intro' ? scene.prompt : undefined, artBase);

  useEffect(() => {
    if (ph.phase === 'play' && left.length === 0) ph.win();
  }, [left.length, ph]);
  useEffect(() => {
    if (ph.phase === 'win' && !reported.current) { reported.current = true; onDone({ won: true, score: g.state.score, mistakes: wrong }); }
  }, [ph.phase, g.state.score, wrong, onDone]);

  const choose = (bin: string) => {
    if (ph.phase !== 'play' || !cur) return;
    if (cur.bin === bin) { g.hit(); setPlaced((p) => [...p, cur.id]); setPick(null); setMsg('hit'); }
    else {
      g.miss(); setMsg('miss');
      setWrong((w) => (w.includes(cur.text) ? w : [...w, cur.text]));
      if (g.state.triesLeft <= 1) ph.lose();
    }
  };
  const retry = () => { g.reset(); setPlaced([]); setPick(null); setMsg(null); ph.retry(); };

  return (
    <div className="av-sort" data-testid="av-sort" data-phase={ph.phase} data-calm={calm || undefined}>
      <div className="av-sort-hud">
        <span className="av-pill">⭐ {g.state.score}</span>
        {g.state.combo >= 2 && <span className="av-pill" data-tone="brand">{t('ap.combo', 'Combo ×{{n}}', { n: g.state.combo })}</span>}
        <span className="av-pill">{t('ap.tries', 'Tries')} {'●'.repeat(g.state.triesLeft)}{'○'.repeat(g.state.tries - g.state.triesLeft)}</span>
      </div>
      <div className="av-sort-board">
        {scene.bins.map((b) => (
          <button key={b.id} type="button" className="av-bin" onClick={() => choose(b.id)} disabled={ph.phase !== 'play'}>
            <h4>{b.label}</h4>{b.note && <small>{b.note}</small>}
            <span className="av-bin-count">{scene.items.filter((i) => i.bin === b.id && placed.includes(i.id)).map((i) => <i key={i.id}>{i.text}</i>)}</span>
          </button>
        ))}
        <div className="av-card-now" data-fb={msg ?? undefined}>
          {ph.phase === 'intro' && (<><p>{scene.prompt}</p><small>{t('ap.sortTip', 'Tap a card, then tap the right box')}</small><button type="button" className="av-btn" data-kind="go" onClick={ph.start}>{t('ap.start', 'Start the mission')} →</button></>)}
          {ph.phase === 'play' && cur && (<><p>{cur.text}</p>{msg === 'miss' && <small>{cur.hint ?? t('ap.tryAgain', 'Almost. Look again.')}</small>}</>)}
          {ph.phase === 'win' && <p>{t('ap.wellDone', 'Well done!')}</p>}
          {ph.phase === 'lose' && (<><p>{t('ap.tryAgain', 'Almost. Look again.')}</p><button type="button" className="av-btn" data-kind="go" onClick={retry}>{t('ap.restart', 'Start again')}</button></>)}
        </div>
      </div>
    </div>
  );
}

export const sortScene: SceneModule<SortScene> = {
  view: SortView,
  spoken: (s) => [{ who: 'Vee', text: s.prompt }],
  validate: (s) => {
    const p: string[] = [];
    if (s.bins?.length < 2) p.push(`${s.id}: sort needs 2+ boxes`);
    const ids = new Set(s.bins?.map((b) => b.id));
    if ((s.items?.length ?? 0) < 4) p.push(`${s.id}: sort needs 4+ cards`);
    s.items?.forEach((i) => { if (!ids.has(i.bin)) p.push(`${s.id}: card "${i.text}" names a box that does not exist`); });
    return p;
  },
};
