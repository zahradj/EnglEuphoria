import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Actor, CastName, Expr } from './types';
import { Hear } from './Hear';

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

/** Characters with Canva-made parts (public/academy-art/cast-parts/<who>/): head, torso, two arms, mouth/eye/face crops. Pivots in 900x1200 px. */
// Vee's arm parts were rejected by the owner (2026-10-11: arms look pasted on, sticking out of the body). Rig switched off until a
// hands-out full picture replaces the parts; Vee falls back to the two-layer puppet below.
const RIGS: Partial<Record<CastName, { armR: [number, number]; armL: [number, number]; neck: [number, number] }>> = {};
const OPEN: Partial<Record<CastName, true>> = { Vee: true, Ava: true, Theo: true, Mia: true };
const pct = ([x, y]: [number, number]) => `${(x / 9).toFixed(2)}% ${(y / 12).toFixed(2)}%`;

function Rig({ who, base, state, speaking, onFail }: { who: CastName; base: string; state: string; speaking: boolean; onFail: () => void }) {
  const rig = RIGS[who]!;
  const [mouth, setMouth] = useState(false);
  useEffect(() => {
    if (!speaking) {
      setMouth(false);
      return;
    }
    const t = window.setInterval(() => setMouth((m) => !m), 170);
    return () => window.clearInterval(t);
  }, [speaking]);
  const img = (name: string, cls: string, style?: CSSProperties, fail = false) => (
    <img className={cls} src={`${base}/${name}.webp`} alt="" aria-hidden="true" draggable={false} style={style} onError={fail ? onFail : (e) => ((e.target as HTMLImageElement).style.display = 'none')} />
  );
  return (
    <div className="ad-rig" data-state={state} role="img" aria-label={who}>
      {img('torso', 'ad-rig-torso', undefined, true)}
      {img('arm-left', 'ad-rig-arm ad-rig-armL', { transformOrigin: pct(rig.armL) })}
      {img('arm-right', 'ad-rig-arm ad-rig-armR', { transformOrigin: pct(rig.armR) })}
      <div className="ad-rig-head" style={{ transformOrigin: pct(rig.neck) }}>
        {img('head', 'ad-rig-part', undefined, true)}
        {state === 'happy' && img('face-happy', 'ad-rig-part')}
        {state === 'concerned' && img('face-concerned', 'ad-rig-part')}
        {state !== 'happy' && state !== 'concerned' && img('eyes-blink', 'ad-rig-part ad-rig-blink')}
        {mouth && img('mouth-open', 'ad-rig-part')}
      </div>
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
  // characters with a 'hands-out' full picture (cast/<who>/neutral-open.webp) use it for neutral/happy/concerned, with face crops from cast-parts/
  const [openOk, setOpenOk] = useState(true);
  const parts = base ? `${base.replace('/cast/', '/cast-parts/')}` : '';
  const hasOpen = !!OPEN[actor.who] && (actor.expr === undefined || ['neutral', 'happy', 'concerned'].includes(actor.expr));
  const talkable = speaking && (i === 0 || hasOpen) && (actor.expr === undefined || actor.expr === 'neutral' || actor.expr === 'happy');
  useEffect(() => {
    if (!talkable) {
      setMouth(false);
      return;
    }
    const t = window.setInterval(() => setMouth((m) => !m), 170);
    return () => window.clearInterval(t);
  }, [talkable]);
  const [rigOk, setRigOk] = useState(true);
  const bodySrc = hasOpen && openOk && base ? `${base}/neutral-open.webp` : src;
  const state = actor.expr === 'happy' ? 'happy' : actor.expr === 'concerned' ? 'concerned' : speaking ? 'speaking' : 'idle';
  return (
    <div className="ad-actor" data-pos={actor.pos} data-speaking={speaking} data-state={state} data-small={small} aria-label={actor.who}>
      {RIGS[actor.who] && base && rigOk && (actor.expr === undefined || ['neutral', 'happy', 'concerned', 'talk'].includes(actor.expr)) ? (
        <>
          <i className="ad-spot" aria-hidden="true" />
          <Rig who={actor.who} base={`${artBase}/cast-parts/${actor.who.toLowerCase()}`} state={state} speaking={speaking} onFail={() => setRigOk(false)} />
        </>
      ) : src && base ? (
        <>
          <i className="ad-spot" aria-hidden="true" />
          <div className="ad-pup">
            <img className="ad-pup-body" key={bodySrc} src={bodySrc!} alt={actor.who} draggable={false} onError={() => (hasOpen && openOk ? setOpenOk(false) : setI(i + 1))} />
            <div className="ad-pup-head">
              {hasOpen && openOk ? (
                <>
                  <img className="ad-pup-face" src={bodySrc!} alt="" aria-hidden="true" draggable={false} />
                  {state === 'happy' && <img className="ad-pup-face" src={`${parts}/face-happy.webp`} alt="" aria-hidden="true" draggable={false} />}
                  {state === 'concerned' && <img className="ad-pup-face" src={`${parts}/face-concerned.webp`} alt="" aria-hidden="true" draggable={false} />}
                  {state !== 'happy' && state !== 'concerned' && <img className="ad-pup-face ad-blink" src={`${parts}/eyes-blink.webp`} alt="" aria-hidden="true" draggable={false} />}
                  {mouth && <img className="ad-pup-face" src={`${parts}/mouth-open.webp`} alt="" aria-hidden="true" draggable={false} />}
                </>
              ) : (
                <>
                  <img className="ad-pup-face" src={mouth ? `${base}/talk.webp` : src} alt="" aria-hidden="true" draggable={false} />
                  {i === 0 && <img className="ad-pup-face ad-blink" src={`${base}/blink.webp`} alt="" aria-hidden="true" draggable={false} onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />}
                </>
              )}
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
      <div className="ad-bubble-text">{children}{typeof children === 'string' && <Hear who={who} text={children} />}</div>
    </div>
  );
}
