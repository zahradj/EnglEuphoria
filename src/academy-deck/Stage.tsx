import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Actor, CastName, Expr } from './types';

const hue = (id: string) => Array.from(id).reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);
export const COLOR: Record<CastName, string> = { Vee: '#38bdf8', Ava: '#a78bfa', Theo: '#34d399', Mia: '#fb923c' };

/** The full-bleed scene plate behind a slide. A calm gradient shows if the picture is missing. */
export function Plate({ id, artBase }: { id: string; artBase?: string }) {
  const [failed, setFailed] = useState(false);
  const h = 250 + (hue(id) % 50);
  return (
    <div className="ad-plate" aria-hidden="true" data-plate={id}>
      {artBase && !failed ? <img src={`${artBase}/bg/${id}.webp`} alt="" draggable={false} onError={() => setFailed(true)} /> : <div className="ad-plate-ph" style={{ background: `linear-gradient(160deg, hsl(${h} 80% 94%), hsl(${h + 20} 70% 85%))` }} />}
      {/* living scene: a soft light shaft drifts across and dust motes float (a light layer over the picture; the picture itself never moves) */}
      <span className="ad-ray" />
      <span className="ad-motes">{Array.from({ length: 16 }, (_, i) => <i key={i} />)}</span>
    </div>
  );
}

/**
 * A cast member as a small puppet driven by one state machine (idle | speaking | happy | concerned; happy/concerned come in through
 * `actor.expr`). Two layers cut from the same expression picture: the body breathes, the head (with the shoulders' top) nods and
 * tilts on its own beat, blinks, and swaps to the "talk" mouth picture while speaking. Falls back expr -> happy -> neutral -> initial,
 * so a missing picture never breaks a slide. (Real lip-sync/arms need layered art or an approved video loop; see academy-game-ui §7.)
 */
export function Character({ actor, artBase, speaking = false, small = false }: { actor: Actor; artBase?: string; speaking?: boolean; small?: boolean }) {
  const chain: Expr[] = actor.expr === 'concerned' ? ['concerned', 'neutral'] : [actor.expr ?? 'neutral', 'happy', 'neutral'];
  const [i, setI] = useState(0);
  const [mouth, setMouth] = useState(false);
  const base = artBase ? `${artBase}/cast/${actor.who.toLowerCase()}` : null;
  const src = base && i < chain.length ? `${base}/${chain[i]}.webp` : null;
  const talkable = speaking && i === 0 && (actor.expr === undefined || actor.expr === 'neutral' || actor.expr === 'happy');
  useEffect(() => {
    if (!talkable) {
      setMouth(false);
      return;
    }
    const t = window.setInterval(() => setMouth((m) => !m), 170);
    return () => window.clearInterval(t);
  }, [talkable]);
  const state = actor.expr === 'happy' ? 'happy' : actor.expr === 'concerned' ? 'concerned' : speaking ? 'speaking' : 'idle';
  return (
    <div className="ad-actor" data-pos={actor.pos} data-speaking={speaking} data-state={state} data-small={small} aria-label={actor.who}>
      {src && base ? (
        <>
          <i className="ad-spot" aria-hidden="true" />
          <div className="ad-pup">
            <img className="ad-pup-body" key={src} src={src} alt={actor.who} draggable={false} onError={() => setI(i + 1)} />
            <div className="ad-pup-head">
              <img className="ad-pup-face" src={mouth ? `${base}/talk.webp` : src} alt="" aria-hidden="true" draggable={false} />
              {i === 0 && <img className="ad-pup-face ad-blink" src={`${base}/blink.webp`} alt="" aria-hidden="true" draggable={false} onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />}
            </div>
          </div>
        </>
      ) : (
        <span className="ad-actor-ph" style={{ background: COLOR[actor.who] }}>{actor.who[0]}</span>
      )}
    </div>
  );
}

/** A speech bubble with the speaker's name tag; the tail points down to the speaker's side. */
export function Bubble({ who, children, side = 'left' }: { who: CastName; children: ReactNode; side?: 'left' | 'right' | 'center' }) {
  return (
    <div className="ad-bubble" data-side={side} style={{ ['--who' as string]: COLOR[who] }}>
      <span className="ad-bubble-who">{who}</span>
      <div className="ad-bubble-text">{children}</div>
    </div>
  );
}
