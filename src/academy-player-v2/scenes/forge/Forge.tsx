// Trophy Forge (signature game of B1-S01-E1): forge the three forms of a verb in order (base, past simple, past participle) from a pile of tiles.
// Each right tile lights one slot; the third lights the trophy. A wrong tile costs a try (no countdown). Tiles of other verbs are the distractors.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { comboMultiplier, POINTS_PER_HIT, useGameState } from '../../engine/gameState';
import { useSay } from '../useSay';
import { Badge, Cast, flyClone, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface ForgeScene extends SceneBase { kind: 'forge'; title: string; prompt: string; tries?: number; rounds: { forms: [string, string, string] }[] }
const SLOT = ['base', 'past simple', 'past participle'];

function shuffle<T>(a: T[], seed: number) { const r = [...a]; let s = seed || 1; for (let i = r.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; }

function ForgeView({ scene, onDone, artBase, calm, seed, fx: fxIn }: SceneProps<ForgeScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const g = useGameState(scene.tries ?? 4);
  const actor = useReactor('thinking');
  const [r, setR] = useState(0);
  const [got, setGot] = useState(0);
  const [bad, setBad] = useState<string | null>(null);
  const [lit, setLit] = useState<number[]>([]);
  const mistakes = useRef<string[]>([]);
  const reported = useRef(false);
  const tileEls = useRef<Record<string, HTMLButtonElement | null>>({});
  const slotEls = useRef<(HTMLSpanElement | null)[]>([]);
  const trophyEls = useRef<(HTMLElement | null)[]>([]);
  const round = scene.rounds[r];
  const tiles = useMemo(() => {
    const own = round.forms as string[];
    const others = scene.rounds.flatMap((x, k) => (k === r ? [] : x.forms)).filter((f) => !own.includes(f));
    return shuffle([...own, ...shuffle([...new Set(others)], seed + r).slice(0, 3)], seed + r + 1);
  }, [round, r, scene.rounds, seed]);
  useSay('Vee', r === 0 && got === 0 ? scene.prompt : undefined, artBase);
  const lost = g.state.triesLeft === 0;
  const allDone = lit.length === scene.rounds.length;

  const tap = (f: string) => {
    if (lost || allDone) return;
    const tileEl = tileEls.current[f];
    if (f === round.forms[got]) {
      const mult = comboMultiplier(g.state.combo + 1);
      const slot = slotEls.current[got];
      flyClone(tileEl, slot, calm, 420);
      g.hit(); setBad(null);
      window.setTimeout(() => { fx.burstAt(slot, 'gold'); popEl(slot, calm, 'thud'); }, calm ? 0 : 340);
      fx.floatAt(slot, `+${POINTS_PER_HIT * mult}`, mult > 1 ? 'teal' : 'gold');
      if (got === 2) {
        const trophy = trophyEls.current[r];
        setLit((l) => [...l, r]);
        actor.cheer(1800);
        window.setTimeout(() => { fx.burstAt(trophy, 'gold'); popEl(trophy, calm, 'pop'); }, calm ? 0 : 520);
        if (r === scene.rounds.length - 1) {
          if (!reported.current) { reported.current = true; setGot(3); fx.confetti(); actor.hold('happy', 'cheer'); onDone({ won: true, score: g.state.score + 10, mistakes: mistakes.current }); }
        }
        else { setR(r + 1); setGot(0); }
      } else setGot(got + 1);
    } else {
      g.miss(); setBad(f); popEl(tileEl ?? null, calm, 'wobble'); actor.flinch();
      const label = round.forms.join(' · ');
      if (!mistakes.current.includes(label)) mistakes.current.push(label);
      if (g.state.triesLeft <= 1) { fx.shake('soft'); actor.hold('concerned', 'flinch'); }
    }
  };
  useEffect(() => { if (bad) { const id = window.setTimeout(() => setBad(null), 600); return () => window.clearTimeout(id); } }, [bad]);
  const retry = () => { g.reset(); setR(0); setGot(0); setLit([]); setBad(null); actor.hold('thinking'); };

  return (
    <div className="av-game av-forge" data-testid="av-forge" data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={g.state.combo >= 3} tone="gold" />
      <Cast who="Vee" mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="right" />
      <div className="av-game-body">
        <section className="av-panel av-game-card av-forge-card">
          <header className="av-card-head">
            <h2>{scene.title} · {Math.min(r + 1, scene.rounds.length)}/{scene.rounds.length}</h2>
            <div className="av-hud-row">
              <span className="av-pill" key={`s${g.state.score}`}>⭐ {g.state.score}</span>
              {g.state.combo >= 2 && <span className="av-pill av-combo" data-tone="brand" key={`c${g.state.combo}`}>{t('ap.combo', 'Combo ×{{n}}', { n: g.state.combo })}</span>}
              <span className="av-lives" role="img" aria-label={t('ap.tries', 'Tries')}>{Array.from({ length: g.state.tries }, (_, k) => <i key={k} data-on={k < g.state.triesLeft || undefined} />)}</span>
            </div>
            <Badge who="Vee" mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
          </header>
          <p className="av-q">{scene.prompt}</p>
          <div className="av-forge-slots">
            {SLOT.map((s, k) => {
              const on = k < got || got === 3;
              return <span key={s} ref={(el) => { slotEls.current[k] = el; }} data-on={on} data-next={(!on && k === got) || undefined}><small>{s}</small><b key={on ? 'on' : 'off'}>{on ? round.forms[k] : '?'}</b></span>;
            })}
          </div>
          <div className="av-forge-trophies" aria-hidden="true">{scene.rounds.map((_, k) => <i key={k} ref={(el) => { trophyEls.current[k] = el; }} data-on={lit.includes(k)}>🏆</i>)}</div>
          {!lost && !allDone && <div className="av-tiles av-ingots">{tiles.map((f, n) => <button key={`${r}-${f}`} ref={(el) => { tileEls.current[f] = el; }} type="button" className="av-opt av-ingot" style={{ ['--i' as string]: n }} data-state={bad === f ? 'wrong' : undefined} onClick={() => tap(f)}>{f}</button>)}</div>}
          {allDone && <Reward score={g.state.score + 10} stars={starsFor(scene.rounds.length - mistakes.current.length, scene.rounds.length)} gem={mistakes.current.length === 0} calm={calm} />}
          {lost && <><p className="av-note">{t('ap.tryAgain', 'Almost. Look again.')}</p><button type="button" className="av-btn" data-kind="go" onClick={retry}>{t('ap.restart', 'Start again')}</button></>}
        </section>
      </div>
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
