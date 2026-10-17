// Scene Hunt (video-game mechanic: hidden-object / point-and-click investigation). The plate IS the game board: read a clue, find what it describes in the picture.
// Hotspots are % of the plate. A wrong tap is only a gentle shimmer + a plain explanation (never a penalty, no counter); hints grow with misses; "Show me" is free.
// Found things pop, stamp the board and fly to the bag. Keyboard: Tab to a spot, Enter to try it. Targets are at least 44 px.
import { useRef, useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useSay } from '../useSay';
import { Badge, Cast, Reward, useReactor, useSceneFx } from '../kit';
import type { CastName, SceneBase, SceneModule, SceneProps } from '../../types';

export interface HuntTarget {
  id: string;
  /** what it is, in plain English ("the cork board"): named when a wrong tap lands on it */
  label: string;
  /** the name of the clue piece it drops in the bag (default: label) */
  word?: string;
  /** the reading clue for this target */
  clue: string;
  /** hotspot in % of the plate */
  x: number; y: number; w: number; h: number;
  /** the line that is revealed when it is found (what the clue piece says) */
  reveal?: string;
  /** a Word Card sticker under public/academy-art/cards (art check) */
  art?: string;
}
export interface HuntDecoy { label: string; x: number; y: number; w: number; h: number }
export interface HuntScene extends SceneBase {
  kind: 'hunt'; title: string; who: CastName; intro: string;
  /** width / height of the plate file (default 16 / 9) so the hotspots line up exactly */
  aspect?: number;
  targets: HuntTarget[];
  /** other things in the picture that can be tapped (a wrong tap names them) */
  decoys?: HuntDecoy[];
}

interface Spot { key: string; label: string; x: number; y: number; w: number; h: number; target?: HuntTarget }
interface Ripple { id: number; x: number; y: number }

function HuntView({ scene, onDone, onFound, artBase, calm, fx: fxIn }: SceneProps<HuntScene>) {
  const { t } = useTranslation();
  const fx = useSceneFx(fxIn);
  const actor = useReactor('curious');
  const [found, setFound] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const [shown, setShown] = useState(false);
  const [usedShow, setUsedShow] = useState(false);
  const [note, setNote] = useState<{ tone: 'info' | 'ok'; text: string } | null>(null);
  const [reveal, setReveal] = useState<{ id: string; text: string; x: number; y: number; below: boolean } | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const board = useRef<HTMLDivElement>(null);
  const n = useRef(0);
  const cur = found.length;
  const done = cur >= scene.targets.length;
  const target = scene.targets[Math.min(cur, scene.targets.length - 1)];
  useSay(scene.who, done ? undefined : cur === 0 ? `${scene.intro} ${target.clue}` : target.clue, artBase);

  const spots: Spot[] = [
    ...scene.targets.map((tg) => ({ key: tg.id, label: tg.label, x: tg.x, y: tg.y, w: tg.w, h: tg.h, target: tg })),
    ...(scene.decoys ?? []).map((d, i) => ({ key: `decoy-${i}`, label: d.label, x: d.x, y: d.y, w: d.w, h: d.h })),
  ].sort((a, b) => a.x - b.x || a.y - b.y);

  const ripple = (x: number, y: number) => {
    const id = ++n.current;
    setRipples((l) => [...l.slice(-3), { id, x, y }]);
    window.setTimeout(() => setRipples((l) => l.filter((r) => r.id !== id)), 900);
  };
  const pointOf = (e: MouseEvent, el: HTMLElement | null) => {
    const b = board.current?.getBoundingClientRect();
    if (!b || !b.width) return { x: 50, y: 50 };
    if (e.detail === 0 && el) { const r = el.getBoundingClientRect(); return { x: ((r.left + r.width / 2 - b.left) / b.width) * 100, y: ((r.top + r.height / 2 - b.top) / b.height) * 100 }; }
    return { x: ((e.clientX - b.left) / b.width) * 100, y: ((e.clientY - b.top) / b.height) * 100 };
  };

  const miss = (e: MouseEvent, el: HTMLElement | null, name?: string) => {
    if (done) return;
    const p = pointOf(e, el);
    ripple(p.x, p.y);
    setMisses((m) => m + 1);
    actor.flinch(1100);
    setNote({ tone: 'info', text: name ? t('ap.huntNotThis', 'That is {{what}}. Read the clue again.', { what: name }) : t('ap.huntNotHere', 'Nothing here. Look again.') });
  };

  const hit = (sp: Spot, el: HTMLElement) => {
    const tg = sp.target;
    if (!tg) return;
    const next = [...found, tg.id];
    setFound(next); setMisses(0); setShown(false);
    setReveal({ id: tg.id, text: tg.reveal ?? tg.label, x: tg.x + tg.w / 2, y: tg.y < 34 ? tg.y + tg.h : tg.y, below: tg.y < 34 });
    window.setTimeout(() => setReveal((r) => (r?.id === tg.id ? null : r)), 3200);
    setNote({ tone: 'ok', text: tg.reveal ?? tg.label });
    fx.burstAt(el, 'gold'); fx.floatAt(el, tg.art ? '+ ✦' : '+ ◆', 'gold');
    onFound?.(tg.id, el);
    if (next.length === scene.targets.length) {
      fx.confetti(); actor.hold('happy', 'cheer');
      onDone({ won: true, score: scene.targets.length * 10, gem: !usedShow, mistakes: [], found: next });
    } else actor.cheer(1200);
  };

  const press = (sp: Spot) => (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (done || found.includes(sp.key)) return;
    if (sp.target && sp.target.id === target.id) hit(sp, e.currentTarget);
    else miss(e, e.currentTarget, sp.target ? t('ap.huntAnother', 'another thing: {{what}}', { what: sp.label }) : sp.label);
  };

  const level = shown ? 2 : misses >= 4 ? 2 : misses >= 2 ? 1 : 0;
  const style = { ['--ar' as string]: String(scene.aspect ?? 16 / 9) };
  return (
    <div className="av-game av-hunt" data-testid="av-hunt">
      <Cast who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} side="left" />
      <div className="av-hunt-wrap">
        <header className="av-hunt-head">
          <h2>{scene.title}</h2>
          <span className="av-hunt-count" role="status" aria-label={t('ap.huntFound', 'Found {{n}} of {{m}}', { n: found.length, m: scene.targets.length })}>
            {scene.targets.map((tg, i) => <i key={tg.id} data-on={i < found.length || undefined} />)}
          </span>
          <Badge who={scene.who} mood={actor.mood} pulse={actor.pulse} react={actor.react} artBase={artBase} />
        </header>
        <div className="av-hunt-board" ref={board} style={style} onClick={(e) => miss(e, null)} data-testid="av-hunt-board">
          <img src={`${artBase}/bg/${scene.plate}.webp`} alt="" draggable={false} />
          {spots.map((sp) => {
            const isFound = !!sp.target && found.includes(sp.target.id);
            const isGoal = !!sp.target && !done && sp.target.id === target.id;
            return (
              <button
                key={sp.key}
                type="button"
                className="av-hunt-spot"
                data-found={isFound || undefined}
                data-hint={isGoal && level > 0 ? String(level) : undefined}
                style={{ left: `${sp.x + sp.w / 2}%`, top: `${sp.y + sp.h / 2}%`, width: `max(${sp.w}%, 44px)`, height: `max(${sp.h}%, 44px)` }}
                aria-label={isFound ? sp.label : t('ap.huntSpot', 'Look here')}
                onClick={press(sp)}
              >
                {isFound && <span className="av-hunt-stamp" aria-hidden="true">✓</span>}
              </button>
            );
          })}
          {ripples.map((r) => <i key={r.id} className="av-hunt-ripple" style={{ left: `${r.x}%`, top: `${r.y}%` }} aria-hidden="true" />)}
          {reveal && <p className="av-hunt-reveal" data-below={reveal.below || undefined} style={{ left: `${Math.min(78, Math.max(22, reveal.x))}%`, top: `${reveal.y}%` }} aria-hidden="true">{reveal.text}</p>}
        </div>
        <section className="av-panel av-game-card av-hunt-clue" aria-live="polite">
          {!done ? (
            <>
              <p className="av-hunt-q"><b>{t('ap.huntClue', 'Clue {{n}} of {{m}}', { n: cur + 1, m: scene.targets.length })}</b> {target.clue}</p>
              <ul className="av-hunt-tray" aria-hidden="true">{scene.targets.map((tg) => <li key={tg.id} data-on={found.includes(tg.id) || undefined}>{found.includes(tg.id) ? (tg.word ?? tg.label) : '?'}</li>)}</ul>
              <div className="av-hunt-actions">
                <p className="av-note" data-ok={note?.tone === 'ok' || undefined}>{note?.text ?? t('ap.huntStart', 'Tap the picture where you think it is.')}</p>
                <button type="button" className="av-btn" onClick={() => { setShown(true); setUsedShow(true); }} disabled={shown}>🔍 {t('ap.huntShow', 'Show me')}</button>
              </div>
            </>
          ) : (
            <Reward score={scene.targets.length} unit={t('ap.huntUnit', 'finds')} calm={calm} tone="gold" gem={!usedShow} />
          )}
        </section>
      </div>
    </div>
  );
}

export const huntScene: SceneModule<HuntScene> = {
  view: HuntView,
  spoken: (s) => [{ who: s.who, text: `${s.intro} ${s.targets[0]?.clue ?? ''}`.trim() }, ...s.targets.slice(1).map((tg) => ({ who: s.who, text: tg.clue }))],
  art: (s) => s.targets.filter((tg) => tg.art).map((tg) => `cards/${tg.art}`),
  validate: (s) => {
    const p: string[] = [];
    if (!s.plate) p.push(`${s.id}: a hunt needs a plate (it is the board)`);
    if (!s.targets?.length || s.targets.length < 3 || s.targets.length > 7) p.push(`${s.id}: a hunt has 3-7 targets`);
    const ids = new Set<string>();
    for (const tg of s.targets ?? []) {
      if (ids.has(tg.id)) p.push(`${s.id}: duplicate target ${tg.id}`);
      ids.add(tg.id);
      if (!tg.clue?.trim() || !tg.label?.trim()) p.push(`${s.id}/${tg.id}: needs a label and a clue`);
      if ([tg.x, tg.y, tg.w, tg.h].some((v) => typeof v !== 'number' || v < 0 || v > 100) || tg.x + tg.w > 100.01 || tg.y + tg.h > 100.01) p.push(`${s.id}/${tg.id}: hotspot is outside the plate`);
    }
    return p;
  },
};
