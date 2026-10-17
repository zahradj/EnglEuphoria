// Break the Clock (boss fight): each right answer strikes the boss; a wrong one costs a shield. No countdown, no ranking; shields gone = try again.
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { comboMultiplier, POINTS_PER_HIT, useGameState } from '../../engine/gameState';
import { useSay } from '../useSay';
import { Badge, Cast, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface BossScene extends SceneBase {
  kind: 'boss'; title: string; prompt: string; boss: string; shields?: number;
  rounds: { frame: string; options: string[]; answer: number; why: string }[];
}

const CRACKS = [
  'M60 60 L52 40 L57 26 L50 12', 'M60 60 L78 48 L90 50 L102 38', 'M60 60 L70 80 L66 94 L76 108',
  'M60 60 L40 72 L30 70 L18 82', 'M60 60 L44 52 L26 44', 'M60 60 L84 70 L98 66',
];

function Clock({ dmg, total, broken }: { dmg: number; total: number; broken: boolean }) {
  const shown = broken ? CRACKS.length : Math.ceil((dmg / Math.max(1, total)) * CRACKS.length);
  return (
    <svg className="av-clock-svg" viewBox="0 0 120 120" data-broken={broken || undefined} aria-hidden="true">
      <circle cx="60" cy="60" r="57" className="av-clock-bezel" />
      <circle cx="60" cy="60" r="48" className="av-clock-face" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1="60" y1="16" x2="60" y2={i % 3 === 0 ? 24 : 20} className="av-clock-tick" transform={`rotate(${i * 30} 60 60)`} />)}
      <g className="av-clock-hand-h"><line x1="60" y1="60" x2="60" y2="36" /></g>
      <g className="av-clock-hand-m"><line x1="60" y1="60" x2="60" y2="24" /></g>
      <circle cx="60" cy="60" r="3.5" className="av-clock-pin" />
      <g className="av-clock-cracks">{CRACKS.slice(0, shown).map((d, i) => <path key={i} d={d} pathLength={100} />)}</g>
    </svg>
  );
}

function BossView({ scene, onDone, artBase, calm, fx: fxIn }: SceneProps<BossScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const g = useGameState(scene.shields ?? 3);
  const actor = useReactor('thinking');
  const [r, setR] = useState(0);
  const [bad, setBad] = useState<number[]>([]);
  const [struck, setStruck] = useState(false);
  const mistakes = useRef<string[]>([]);
  const clockEl = useRef<HTMLDivElement>(null);
  const optEls = useRef<(HTMLButtonElement | null)[]>([]);
  const shieldEls = useRef<(HTMLElement | null)[]>([]);
  const round = scene.rounds[r];
  const dmg = struck ? r + 1 : r;
  const hp = scene.rounds.length - dmg;
  const lost = g.state.triesLeft === 0;
  const last = r === scene.rounds.length - 1;
  const broken = struck && last;
  useSay('Theo', r === 0 ? scene.prompt : undefined, artBase);

  const tap = (n: number) => {
    if (struck || lost || bad.includes(n)) return;
    if (n === round.answer) {
      const mult = comboMultiplier(g.state.combo + 1);
      g.hit(); setStruck(true);
      fx.burstAt(clockEl.current, 'gold'); fx.floatAt(clockEl.current, `+${POINTS_PER_HIT * mult}`, mult > 1 ? 'teal' : 'gold');
      popEl(clockEl.current, calm, 'thud'); fx.shake(last ? 'hard' : 'soft');
      if (last) { window.setTimeout(() => fx.confetti(), calm ? 0 : 250); actor.hold('happy', 'cheer'); } else actor.cheer();
    } else {
      g.miss(); setBad((b) => [...b, n]);
      popEl(optEls.current[n], calm, 'wobble'); popEl(clockEl.current, calm, 'wobble');
      if (!mistakes.current.includes(round.frame)) mistakes.current.push(round.frame);
      if (g.state.triesLeft <= 1) actor.hold('concerned', 'flinch'); else actor.flinch();
    }
  };
  const next = () => {
    if (last) { onDone({ won: true, score: g.state.score, mistakes: mistakes.current }); return; }
    setR(r + 1); setBad([]); setStruck(false);
  };
  const retry = () => { g.reset(); setR(0); setBad([]); setStruck(false); actor.hold('thinking'); };
  return (
    <div className="av-game av-boss" data-testid="av-boss" data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={g.state.combo >= 3} tone="gold" />
      <Cast who="Theo" mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body">
        <section className="av-panel av-game-card av-boss-card">
          <header className="av-card-head">
            <h2>{scene.title}</h2>
            <div className="av-hud-row">
              <span className="av-pill" key={`s${g.state.score}`}>⭐ {g.state.score}</span>
              <span className="av-shields" role="img" aria-label={t('ap.shields', 'Shields')}>{Array.from({ length: g.state.tries }, (_, k) => <i key={k} ref={(el) => { shieldEls.current[k] = el; }} data-on={k < g.state.triesLeft || undefined} />)}</span>
            </div>
            <Badge who="Theo" mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
          </header>
          <div className="av-boss-arena">
            <div className="av-clock" ref={clockEl} data-hit={struck || undefined} data-broken={broken || undefined}>
              <Clock dmg={dmg} total={scene.rounds.length} broken={broken} />
              {broken && !calm && <span className="av-shards">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ ['--a' as string]: `${i * 45 + 20}deg` }} />)}</span>}
            </div>
            <div className="av-boss-hp" role="progressbar" aria-label={scene.boss} aria-valuemin={0} aria-valuemax={scene.rounds.length} aria-valuenow={hp}>
              <span>{scene.boss}</span>
              <div className="av-hp-segs">{scene.rounds.map((_, k) => <i key={k} data-on={k >= dmg || undefined} data-last={k === dmg - 1 || undefined} />)}</div>
            </div>
          </div>
          {!lost && <>
            <p className="av-q" key={r}>{round.frame}</p>
            <div className="av-opts av-attacks">{round.options.map((o, n) => <button key={n} ref={(el) => { optEls.current[n] = el; }} type="button" className="av-opt" style={{ ['--i' as string]: n }} data-state={struck && n === round.answer ? 'right' : bad.includes(n) ? 'wrong' : undefined} onClick={() => tap(n)}>{o}</button>)}</div>
            {bad.length > 0 && !struck && <p className="av-note">{t('ap.tryAgain', 'Almost. Look again.')}</p>}
            {struck && <>
              <p className="av-note" data-ok="true">{t('ap.wellDone', 'Well done!')} {round.why}</p>
              {broken && <Reward score={g.state.score} stars={starsFor(scene.rounds.length - mistakes.current.length, scene.rounds.length)} gem={mistakes.current.length === 0} calm={calm} />}
              <button type="button" className="av-btn" data-kind="go" onClick={next}>{last ? t('ap.finish', 'Finish the lesson') : `${t('ap.next', 'Next')} ›`}</button>
            </>}
          </>}
          {lost && <><p className="av-note">{t('ap.tryAgain', 'Almost. Look again.')}</p><button type="button" className="av-btn" data-kind="go" onClick={retry}>{t('ap.restart', 'Start again')}</button></>}
        </section>
      </div>
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
