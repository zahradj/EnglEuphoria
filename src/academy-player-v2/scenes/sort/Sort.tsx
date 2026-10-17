// Sort game (video-game loop): tap a card, then the right box. Combo, tries (no countdown), burst on a hit, gentle miss, win/lose + retry.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { comboMultiplier, POINTS_PER_HIT, useGameState } from '../../engine/gameState';
import { useGamePhases } from '../../engine/gamePhases';
import { useSay } from '../useSay';
import { Badge, Cast, flyClone, GameBackdrop, Glow, popEl, Reward, starsFor, useReactor, useSceneFx } from '../kit';
import type { SceneBase, SceneModule, SceneProps } from '../../types';

export interface SortScene extends SceneBase {
  kind: 'sort'; title: string; prompt: string; tries?: number;
  bins: { id: string; label: string; note?: string }[];
  items: { id: string; text: string; bin: string; hint?: string; art?: string }[];
}

function SortView({ scene, onDone, artBase, calm, seed, fx: fxIn }: SceneProps<SortScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const g = useGameState(scene.tries ?? 3);
  const ph = useGamePhases('intro');
  const actor = useReactor('thinking');
  const order = useMemo(() => {
    const a = [...scene.items]; let s = seed || 1;
    for (let i = a.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }, [scene.items, seed]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [msg, setMsg] = useState<'hit' | 'miss' | null>(null);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [binPulse, setBinPulse] = useState<{ id: string; kind: 'hit' | 'miss'; n: number } | null>(null);
  const [wob, setWob] = useState(0);
  const reported = useRef(false);
  const startPt = useRef<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const binEls = useRef<Record<string, HTMLButtonElement | null>>({});
  const left = order.filter((i) => !placed.includes(i.id));
  const cur = left[0];
  useSay('Vee', ph.phase === 'intro' ? scene.prompt : undefined, artBase);

  useEffect(() => {
    if (ph.phase === 'play' && left.length === 0) ph.win();
  }, [left.length, ph]);
  useEffect(() => {
    if (ph.phase === 'win' && !reported.current) { reported.current = true; fx.confetti(); actor.hold('happy', 'cheer'); onDone({ won: true, score: g.state.score, mistakes: wrong }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ph.phase, g.state.score, wrong, onDone]);

  const choose = (bin: string) => {
    if (ph.phase !== 'play' || !cur) return;
    const el = binEls.current[bin];
    if (cur.bin === bin) {
      const mult = comboMultiplier(g.state.combo + 1);
      flyClone(cardRef.current, el, calm);
      g.hit(); setPlaced((p) => [...p, cur.id]); setMsg('hit');
      fx.burstAt(el, mult > 1 ? 'teal' : 'gold'); fx.floatAt(el, `+${POINTS_PER_HIT * mult}`, mult > 1 ? 'teal' : 'gold');
      popEl(el, calm, 'thud');
      setBinPulse({ id: bin, kind: 'hit', n: Date.now() }); actor.cheer();
    } else {
      g.miss(); setMsg('miss'); setWob((n) => n + 1); popEl(cardRef.current, calm, 'wobble');
      setWrong((w) => (w.includes(cur.text) ? w : [...w, cur.text]));
      setBinPulse({ id: bin, kind: 'miss', n: Date.now() }); actor.flinch();
      if (g.state.triesLeft <= 1) { ph.lose(); fx.shake('soft'); actor.hold('concerned', 'flinch'); }
    }
  };
  const retry = () => { g.reset(); setPlaced([]); setMsg(null); setWrong([]); reported.current = false; actor.hold('thinking'); ph.retry(); };

  const binAt = (x: number, y: number) => {
    for (const b of scene.bins) {
      const r = binEls.current[b.id]?.getBoundingClientRect();
      if (r && x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8) return b.id;
    }
    return null;
  };
  const down = (e: React.PointerEvent) => {
    if (ph.phase !== 'play') return;
    try { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); } catch { /* not supported */ }
    startPt.current = { x: e.clientX, y: e.clientY }; setDrag({ dx: 0, dy: 0 });
  };
  const move = (e: React.PointerEvent) => {
    if (!startPt.current) return;
    setDrag({ dx: e.clientX - startPt.current.x, dy: e.clientY - startPt.current.y });
    setHover(binAt(e.clientX, e.clientY));
  };
  const up = (e: React.PointerEvent) => {
    if (!startPt.current) return;
    const moved = drag ? Math.hypot(drag.dx, drag.dy) > 14 : false;
    const bin = binAt(e.clientX, e.clientY);
    startPt.current = null; setDrag(null); setHover(null);
    if (moved && bin) choose(bin);
  };
  const dealt = placed.length;
  const pile = Math.min(3, Math.max(0, left.length - 1));

  return (
    <div className="av-game av-sort" data-testid="av-sort" data-phase={ph.phase} data-calm={calm || undefined}>
      <GameBackdrop /><Glow on={g.state.combo >= 3} tone="gold" />
      <Cast who="Vee" mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-game-body" data-top="hud">
        <div className="av-sort-hud">
          <span className="av-pill av-title-pill">{scene.title} · {dealt}/{scene.items.length}</span>
          <span className="av-pill" key={`s${g.state.score}`} data-pop={g.state.score > 0 || undefined}>⭐ {g.state.score}</span>
          {g.state.combo >= 2 && <span className="av-pill av-combo" data-tone="brand" key={`c${g.state.combo}`}>{t('ap.combo', 'Combo ×{{n}}', { n: g.state.combo })}</span>}
          <span className="av-lives" role="img" aria-label={t('ap.tries', 'Tries')}>{Array.from({ length: g.state.tries }, (_, k) => <i key={k} data-on={k < g.state.triesLeft || undefined} />)}</span>
          <Badge who="Vee" mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
        </div>
        <div className="av-sort-board">
          {scene.bins.map((b, k) => {
            const inside = scene.items.filter((i) => i.bin === b.id && placed.includes(i.id));
            return (
              <button key={b.id} ref={(el) => { binEls.current[b.id] = el; }} type="button" className="av-bin" data-k={k % 2} data-hover={hover === b.id || undefined} onClick={() => choose(b.id)} disabled={ph.phase !== 'play'}>
                {binPulse?.id === b.id && <i key={binPulse.n} className="av-bin-flash" data-kind={binPulse.kind} />}
                <h4>{b.label}</h4>{b.note && <small>{b.note}</small>}
                <span className="av-bin-count">{inside.map((i, n) => <i key={i.id} style={{ ['--tilt' as string]: `${((n * 5) % 7) - 3}deg` }}>{i.text}</i>)}</span>
              </button>
            );
          })}
          <div className="av-card-slot">
            {ph.phase === 'play' && Array.from({ length: pile }, (_, k) => <i key={k} className="av-pile" style={{ ['--k' as string]: pile - k }} />)}
            <div className="av-card-now" ref={cardRef} key={ph.phase === 'play' && cur ? cur.id : ph.phase} data-fb={msg ?? undefined} data-phase={ph.phase} data-drag={drag ? 'true' : undefined} data-wob={wob}
              style={drag ? { transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(${Math.max(-8, Math.min(8, drag.dx / 14))}deg) scale(1.06)` } : undefined}
              onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
              {ph.phase === 'intro' && (<><p>{scene.prompt}</p><small>{t('ap.dragTip', 'Drag the card to a box, or tap a box')}</small><button type="button" className="av-btn" data-kind="go" onClick={ph.start}>{t('ap.start', 'Start the mission')} →</button></>)}
              {ph.phase === 'play' && cur && (<>{cur.art && <img className="av-card-art" src={`${artBase}/cards/${cur.art}.webp`} alt="" draggable={false} />}<p>{cur.text}</p>{msg === 'miss' && <small className="av-hintline">{cur.hint ?? t('ap.tryAgain', 'Almost. Look again.')}</small>}</>)}
              {ph.phase === 'win' && (<><p>{t('ap.wellDone', 'Well done!')}</p><Reward score={g.state.score} stars={starsFor(scene.items.length - wrong.length, scene.items.length)} gem={wrong.length === 0} calm={calm} /></>)}
              {ph.phase === 'lose' && (<><p>{t('ap.tryAgain', 'Almost. Look again.')}</p><button type="button" className="av-btn" data-kind="go" onClick={retry}>{t('ap.restart', 'Start again')}</button></>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const sortScene: SceneModule<SortScene> = {
  view: SortView,
  art: (s) => s.items.flatMap((i) => (i.art ? [`cards/${i.art}`] : [])),
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
