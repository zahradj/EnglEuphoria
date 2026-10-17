// Shared building blocks for the game scenes (Academy only): effects hook, backdrop, glow, cast actors, reward count-up.
// Everything here is live DOM + CSS (shell/games.css). Calm mode: same art, no motion (CSS switches animations off; state changes are instant).
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NOOP_FX } from '../fx/useFx';
import type { CastName, FxTone, SceneFx } from '../types';

/** a scene's effects, or a harmless no-op when it renders alone (tests, previews) */
export const useSceneFx = (fx?: SceneFx): SceneFx => fx ?? NOOP_FX;

/** CalmBg-style light veil + soft blur over the plate so the pieces are the clearest thing on screen */
export function GameBackdrop() { return <div className="av-gamebg" aria-hidden="true" />; }

/** a teal / gold edge glow while a combo runs (calm mode: the same glow, just without fading) */
export function Glow({ on, tone = 'teal' }: { on: boolean; tone?: 'teal' | 'gold' | 'lilac' }) {
  return <div className="av-glow" data-on={on || undefined} data-tone={tone} aria-hidden="true" />;
}

export type Mood = 'neutral' | 'happy' | 'thinking' | 'concerned' | 'surprised' | 'curious' | 'talk';
type Reaction = 'cheer' | 'flinch' | 'nod' | undefined;

export function CastImg({ who, mood, artBase }: { who: CastName; mood: Mood; artBase: string }) {
  const [broken, setBroken] = useState(false);
  const base = `${artBase}/cast/${who.toLowerCase()}`;
  return <img src={`${base}/${broken ? 'neutral' : mood}.webp`} alt="" draggable={false} onError={(e) => { if (!broken) setBroken(true); else (e.target as HTMLImageElement).style.visibility = 'hidden'; }} />;
}

/**
 * A cast member standing at the side of the game (wide screens). Idle breathing; `pulse` (a counter) replays the reaction,
 * `mood` swaps the expression picture (happy, thinking, concerned...). Never zoomed: it is a sticker with a contact shadow.
 */
export function Cast({ who, mood, pulse = 0, react, side = 'left', artBase, name = true }: { who: CastName; mood: Mood; pulse?: number; react?: Reaction; side?: 'left' | 'right'; artBase: string; name?: boolean }) {
  return (
    <div className="av-cast" data-side={side} data-mood={mood} aria-hidden="true">
      <div className="av-cast-in" key={pulse} data-react={react}><CastImg who={who} mood={mood} artBase={artBase} /></div>
      <i className="av-cast-shadow" />
      {name && <b className="av-cast-name">{who}</b>}
    </div>
  );
}

/** the same cast member as a round portrait in the card header (narrow screens; hidden when the big figure shows) */
export function Badge({ who, mood, pulse = 0, react, artBase }: { who: CastName; mood: Mood; pulse?: number; react?: Reaction; artBase: string }) {
  return (
    <span className="av-badge" data-mood={mood} aria-hidden="true">
      <span className="av-badge-in" key={pulse} data-react={react}><CastImg who={who} mood={mood} artBase={artBase} /></span>
    </span>
  );
}

/** counts up to `to` (instantly in calm mode / without requestAnimationFrame) */
export function CountUp({ to, calm, ms = 900 }: { to: number; calm: boolean; ms?: number }) {
  const [v, setV] = useState(calm ? to : 0);
  useEffect(() => {
    if (calm || typeof requestAnimationFrame !== 'function') { setV(to); return; }
    let raf = 0; const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms); const e = 1 - Math.pow(1 - k, 3);
      setV(Math.round(to * e));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, calm, ms]);
  return <>{v}</>;
}

/** the reward moment at the end of a game: stars light one by one, XP counts up, a gem for a clean run */
export function Reward({ score, stars = 3, gem, calm, tone = 'gold', unit }: { score: number; stars?: 1 | 2 | 3; gem?: boolean; calm: boolean; tone?: FxTone; unit?: string }) {
  const { t } = useTranslation();
  return (
    <div className="av-reward" data-tone={tone} role="status" data-testid="av-reward">
      <span className="av-reward-stars" aria-hidden="true">{[1, 2, 3].map((n) => <i key={n} data-on={n <= stars || undefined} style={{ animationDelay: `${n * 160}ms` }}>★</i>)}</span>
      <span className="av-reward-num"><b><CountUp to={score} calm={calm} /></b> {unit ?? t('ap.xpUnit', 'XP')}</span>
      {gem && <span className="av-reward-gem" aria-hidden="true">◆</span>}
    </div>
  );
}

/** star rating from the share of first-try answers */
export const starsFor = (clean: number, total: number): 1 | 2 | 3 => (total <= 0 ? 3 : clean / total >= 0.85 ? 3 : clean / total >= 0.5 ? 2 : 1);

/** deterministic small number 0..n-1 from an index (stable "random" for decoration) */
export const pick = (i: number, n: number) => (i * 7 + 3) % n;

/**
 * The character's reaction state: an expression (mood) and a pulse counter that replays the reaction animation.
 * cheer() = happy + jump for a moment, flinch() = concerned + wobble for a moment, then back to the base mood.
 */
export function useReactor(base: Mood = 'thinking') {
  const [s, setS] = useState<{ mood: Mood; pulse: number; react?: Reaction }>({ mood: base, pulse: 0 });
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const back = useCallback((ms: number) => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setS((p) => ({ mood: base, pulse: p.pulse, react: undefined })), ms); }, [base]);
  const cheer = useCallback((ms = 1500) => { setS((p) => ({ mood: 'happy', pulse: p.pulse + 1, react: 'cheer' })); back(ms); }, [back]);
  const flinch = useCallback((ms = 1500) => { setS((p) => ({ mood: 'curious', pulse: p.pulse + 1, react: 'flinch' })); back(ms); }, [back]);
  const surprise = useCallback((ms = 1500) => { setS((p) => ({ mood: 'surprised', pulse: p.pulse + 1, react: 'nod' })); back(ms); }, [back]);
  /** stay in a mood until changed (win / lose) */
  const hold = useCallback((mood: Mood, react?: Reaction) => { window.clearTimeout(timer.current); setS((p) => ({ mood, pulse: p.pulse + 1, react })); }, []);
  return { ...s, cheer, flinch, surprise, hold };
}

/**
 * Fly a copy of `from` to the middle of `to` (pick-up, arc, drop with a squash). Pure DOM + Web Animations, removed when done.
 * Does nothing in calm mode or where Web Animations are missing (jsdom): the state change alone is then the feedback.
 */
export function flyClone(from: HTMLElement | null, to: HTMLElement | null, calm: boolean, ms = 460) {
  if (calm || !from || !to || typeof from.animate !== 'function') return;
  const host = from.closest('.av-game') as HTMLElement | null;
  if (!host) return;
  const h = host.getBoundingClientRect(); const a = from.getBoundingClientRect(); const b = to.getBoundingClientRect();
  const clone = from.cloneNode(true) as HTMLElement;
  clone.removeAttribute('data-testid'); clone.removeAttribute('id'); clone.setAttribute('aria-hidden', 'true');
  clone.classList.add('av-flyer');
  Object.assign(clone.style, { position: 'absolute', left: `${a.left - h.left}px`, top: `${a.top - h.top}px`, width: `${a.width}px`, height: `${a.height}px`, margin: '0', transform: 'none', animation: 'none', transition: 'none', pointerEvents: 'none', zIndex: '9' });
  host.appendChild(clone);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2); const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const anim = clone.animate([
    { transform: 'translate(0,0) scale(1.08) rotate(-3deg)', opacity: 1 },
    { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 36}px) scale(1.14) rotate(5deg)`, opacity: 1, offset: 0.5 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.32, 0.26) rotate(0deg)`, opacity: 0.1 },
  ], { duration: ms, easing: 'cubic-bezier(0.34, 0.1, 0.3, 1)' });
  anim.onfinish = () => clone.remove();
  anim.oncancel = () => clone.remove();
}

/** a short Web-Animations pop on one element ("squash and stretch", overshoot): no-op in calm mode */
export function popEl(el: HTMLElement | null, calm: boolean, kind: 'pop' | 'wobble' | 'thud' = 'pop') {
  if (calm || !el || typeof el.animate !== 'function') return;
  const frames: Record<string, Keyframe[]> = {
    pop: [{ transform: 'scale(1)' }, { transform: 'scale(1.16, 0.86)', offset: 0.22 }, { transform: 'scale(0.94, 1.1)', offset: 0.5 }, { transform: 'scale(1.03, 0.98)', offset: 0.75 }, { transform: 'scale(1)' }],
    wobble: [{ transform: 'translateX(0) rotate(0)' }, { transform: 'translateX(-7px) rotate(-1.6deg)', offset: 0.2 }, { transform: 'translateX(6px) rotate(1.3deg)', offset: 0.45 }, { transform: 'translateX(-3px) rotate(-0.6deg)', offset: 0.7 }, { transform: 'translateX(0) rotate(0)' }],
    thud: [{ transform: 'scale(1)' }, { transform: 'scale(0.93, 1.06)', offset: 0.18 }, { transform: 'scale(1.05, 0.95)', offset: 0.42 }, { transform: 'scale(1)' }],
  };
  el.animate(frames[kind], { duration: kind === 'wobble' ? 420 : 460, easing: 'cubic-bezier(0.3, 1.4, 0.5, 1)' });
}
