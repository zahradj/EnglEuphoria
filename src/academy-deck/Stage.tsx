import { useState } from 'react';
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

/** A cast member. Falls back expr -> happy -> neutral -> a coloured initial, so a missing picture never breaks a slide. */
export function Character({ actor, artBase, speaking = false, small = false }: { actor: Actor; artBase?: string; speaking?: boolean; small?: boolean }) {
  const chain: Expr[] = actor.expr === 'concerned' ? ['concerned', 'neutral'] : [actor.expr ?? 'neutral', 'happy', 'neutral'];
  const [i, setI] = useState(0);
  const src = artBase && i < chain.length ? `${artBase}/cast/${actor.who.toLowerCase()}/${chain[i]}.webp` : null;
  return (
    <div className="ad-actor" data-pos={actor.pos} data-speaking={speaking} data-small={small} aria-label={actor.who}>
      {src ? (
        <>
          <img key={src} src={src} alt={actor.who} draggable={false} onError={() => setI(i + 1)} />
          {i === 0 && <img className="ad-blink" src={`${artBase}/cast/${actor.who.toLowerCase()}/blink.webp`} alt="" aria-hidden="true" draggable={false} onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />}
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
