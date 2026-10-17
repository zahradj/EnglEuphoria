// Trophy Forge (signature game of B1-S01-E1): forge the three forms of a verb in order (base, past simple, past participle) from a pile of tiles.
// Each right tile lights one slot; the third lights the trophy. A wrong tile costs a try (no countdown). Tiles of other verbs are the distractors.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameState } from '../../engine/gameState';
import { useSay } from '../useSay';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface ForgeScene extends SceneBase { kind: 'forge'; title: string; prompt: string; tries?: number; rounds: { forms: [string, string, string] }[] }
const SLOT = ['base', 'past simple', 'past participle'];

function shuffle<T>(a: T[], seed: number) { const r = [...a]; let s = seed || 1; for (let i = r.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; }

function ForgeView({ scene, onDone, artBase, calm, seed }: SceneProps<ForgeScene>) {
  const { t } = useTranslation();
  const g = useGameState(scene.tries ?? 4);
  const [r, setR] = useState(0);
  const [got, setGot] = useState(0);
  const [bad, setBad] = useState<string | null>(null);
  const [lit, setLit] = useState<number[]>([]);
  const mistakes = useRef<string[]>([]);
  const reported = useRef(false);
  const round = scene.rounds[r];
  const tiles = useMemo(() => {
    const own = round.forms as string[];
    const others = scene.rounds.flatMap((x, k) => (k === r ? [] : x.forms)).filter((f) => !own.includes(f));
    return shuffle([...own, ...shuffle([...new Set(others)], seed + r).slice(0, 3)], seed + r + 1);
  }, [round, r, scene.rounds, seed]);
  useSay('Vee', r === 0 && got === 0 ? scene.prompt : undefined, artBase);
  const lost = g.state.triesLeft === 0;

  const tap = (f: string) => {
    if (lost) return;
    if (f === round.forms[got]) {
      g.hit(); setBad(null);
      if (got === 2) {
        setLit((l) => [...l, r]);
        if (r === scene.rounds.length - 1) { if (!reported.current) { reported.current = true; setGot(3); onDone({ won: true, score: g.state.score + 10, mistakes: mistakes.current }); } }
        else { setR(r + 1); setGot(0); }
      } else setGot(got + 1);
    } else {
      g.miss(); setBad(f);
      const label = round.forms.join(' · ');
      if (!mistakes.current.includes(label)) mistakes.current.push(label);
    }
  };
  useEffect(() => { if (bad) { const id = window.setTimeout(() => setBad(null), 600); return () => window.clearTimeout(id); } }, [bad]);
  const retry = () => { g.reset(); setR(0); setGot(0); setLit([]); setBad(null); };

  return (
    <div className="av-forge" data-testid="av-forge" data-calm={calm || undefined}>
      <div className="av-sort-hud">
        <span className="av-pill">⭐ {g.state.score}</span>
        <span className="av-pill">{t('ap.tries', 'Tries')} {'●'.repeat(g.state.triesLeft)}{'○'.repeat(g.state.tries - g.state.triesLeft)}</span>
        {g.state.combo >= 2 && <span className="av-pill" data-tone="brand">{t('ap.combo', 'Combo ×{{n}}', { n: g.state.combo })}</span>}
      </div>
      <section className="av-panel av-forge-card">
        <h2>{scene.title} · {Math.min(r + 1, scene.rounds.length)}/{scene.rounds.length}</h2>
        <p className="av-q">{scene.prompt}</p>
        <div className="av-forge-slots">
          {SLOT.map((s, k) => <span key={s} data-on={k < got || got === 3}><small>{s}</small><b>{k < got || got === 3 ? round.forms[k] : '?'}</b></span>)}
        </div>
        <div className="av-forge-trophies" aria-hidden="true">{scene.rounds.map((_, k) => <i key={k} data-on={lit.includes(k)}>🏆</i>)}</div>
        {!lost && <div className="av-tiles">{tiles.map((f) => <button key={f} type="button" className="av-opt" data-state={bad === f ? 'wrong' : undefined} onClick={() => tap(f)}>{f}</button>)}</div>}
        {lost && <><p className="av-note">{t('ap.tryAgain', 'Almost. Look again.')}</p><button type="button" className="av-btn" data-kind="go" onClick={retry}>{t('ap.restart', 'Start again')}</button></>}
      </section>
    </div>
  );
}

export const forgeScene: SceneModule<ForgeScene> = {
  view: ForgeView,
  spoken: (s) => [{ who: 'Vee', text: s.prompt }],
  validate: (s) => {
    const p: string[] = [];
    if ((s.rounds?.length ?? 0) < 2) p.push(`${s.id}: forge needs 2+ verbs`);
    s.rounds?.forEach((x, i) => { if (new Set(x.forms).size < 2) p.push(`${s.id}: verb ${i + 1} needs different forms`); });
    return p;
  },
};
