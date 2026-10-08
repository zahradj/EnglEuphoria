// Placeholder art: simple drawn busts for the four Academy characters and gradient scenes.
// Used only while the real Canva pictures are missing. When a real image exists at `${artBase}/cast/<name>/<expression>.webp`
// (or `${artBase}/bg/<id>.webp`) the player shows it instead and falls back to this placeholder if it fails to load.
// Stills hold still: nothing here zooms, pans, or loops.
import { useState } from 'react';
import { CAST_LOOK, bgLook } from './castVisual';
import type { CastName, Expression } from './scriptTypes';

const MOUTH: Record<Expression, string> = {
  neutral: 'M 38 74 Q 50 76 62 74',
  happy: 'M 36 72 Q 50 86 64 72',
  curious: 'M 40 76 Q 50 74 60 77',
  surprised: 'M 46 72 Q 50 82 54 72 Q 50 66 46 72',
  thinking: 'M 40 76 L 60 74',
  concerned: 'M 38 78 Q 50 70 62 78',
};
const BROW: Record<Expression, [string, string]> = {
  neutral: ['M 30 44 L 44 44', 'M 56 44 L 70 44'],
  happy: ['M 30 43 Q 37 39 44 43', 'M 56 43 Q 63 39 70 43'],
  curious: ['M 30 44 L 44 40', 'M 56 44 L 70 44'],
  surprised: ['M 30 38 Q 37 33 44 38', 'M 56 38 Q 63 33 70 38'],
  thinking: ['M 30 43 L 44 45', 'M 56 41 L 70 39'],
  concerned: ['M 30 41 L 44 45', 'M 56 45 L 70 41'],
};

export function CastBust({ who, expr = 'neutral', label = true }: { who: CastName; expr?: Expression; label?: boolean }) {
  const l = CAST_LOOK[who];
  const [b1, b2] = BROW[expr];
  return (
    <svg viewBox="0 0 100 130" role="img" aria-label={`${who}, ${expr} (placeholder drawing)`} className="ap-bust">
      {/* shoulders and top */}
      <path d="M 8 130 Q 10 96 34 92 L 66 92 Q 90 96 92 130 Z" fill={l.top} stroke="#111" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 40 92 Q 50 104 60 92" fill="none" stroke={l.accent} strokeWidth="3" strokeLinecap="round" />
      {/* neck and head */}
      <rect x="44" y="82" width="12" height="14" fill={l.skin} stroke="#111" strokeWidth="2" />
      {l.hairStyle === 'ponytail' && <path d="M 74 34 Q 98 40 90 70 Q 84 58 74 52 Z" fill={l.hair} stroke="#111" strokeWidth="2" />}
      <ellipse cx="50" cy="52" rx="26" ry="31" fill={l.skin} stroke="#111" strokeWidth="2.2" />
      {/* hair */}
      {l.hairStyle === 'wavy' && <path d="M 22 54 Q 18 20 50 18 Q 82 20 78 54 Q 74 38 50 36 Q 28 38 22 54 Z M 22 54 Q 16 72 24 84 Q 28 70 28 60 Z M 78 54 Q 84 72 76 84 Q 72 70 72 60 Z" fill={l.hair} stroke="#111" strokeWidth="2" />}
      {l.hairStyle === 'curly' && <path d="M 24 50 Q 16 24 36 18 Q 50 10 64 18 Q 84 24 76 50 Q 70 34 50 34 Q 30 34 24 50 Z" fill={l.hair} stroke="#111" strokeWidth="2" />}
      {l.hairStyle === 'ponytail' && <path d="M 24 50 Q 22 22 50 20 Q 78 22 76 50 Q 66 36 50 36 Q 34 36 24 50 Z" fill={l.hair} stroke="#111" strokeWidth="2" />}
      {l.hairStyle === 'short' && <path d="M 24 48 Q 24 22 50 20 Q 76 22 76 48 Q 64 36 50 38 Q 36 36 24 48 Z" fill={l.hair} stroke="#111" strokeWidth="2" />}
      {/* face */}
      <path d={b1} stroke="#111" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d={b2} stroke="#111" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="38" cy="54" r="3" fill="#111" />
      <circle cx="62" cy="54" r="3" fill="#111" />
      {l.glasses && (
        <g fill="none" stroke="#111" strokeWidth="2">
          <circle cx="38" cy="54" r="8" />
          <circle cx="62" cy="54" r="8" />
          <path d="M 46 54 L 54 54" />
        </g>
      )}
      <path d={MOUTH[expr]} stroke="#111" strokeWidth="2.4" fill={expr === 'surprised' ? '#7a2e2e' : 'none'} strokeLinecap="round" />
      {label && (
        <text x="50" y="124" textAnchor="middle" fontSize="9" fontWeight="700" fill="#111" fontFamily="system-ui, sans-serif">
          {who}
        </text>
      )}
    </svg>
  );
}

/** Character sprite: the real picture if `artBase` is set and loads, otherwise the drawn placeholder. */
export function Sprite({ who, expr, artBase }: { who: CastName; expr: Expression; artBase?: string }) {
  const [failed, setFailed] = useState(false);
  if (artBase && !failed) {
    return <img className="ap-sprite-img" src={`${artBase}/cast/${who.toLowerCase()}/${expr}.webp`} alt={`${who}, ${expr}`} onError={() => setFailed(true)} draggable={false} />;
  }
  return <CastBust who={who} expr={expr} />;
}

/** Full-bleed background: real picture if available, else a calm gradient labelled as a placeholder. */
export function Backdrop({ id, alt, artBase }: { id: string; alt: string; artBase?: string }) {
  const [failed, setFailed] = useState(false);
  const look = bgLook(id);
  return (
    <div className="ap-bg" role="img" aria-label={alt}>
      {artBase && !failed ? (
        <img src={`${artBase}/bg/${id}.webp`} alt="" onError={() => setFailed(true)} draggable={false} />
      ) : (
        <div className="ap-bg-ph" style={{ background: `linear-gradient(160deg, ${look.from}, ${look.to})` }}>
          <span className="ap-ph-tag">placeholder: {look.label}</span>
        </div>
      )}
    </div>
  );
}

/** Picture for a flash card / panel: real picture if available, else a labelled tile. */
export function PictureTile({ id, alt, word, artBase }: { id: string; alt: string; word?: string; artBase?: string }) {
  const [failed, setFailed] = useState(false);
  if (artBase && !failed) return <img className="ap-tile-img" src={`${artBase}/cards/${id}.webp`} alt={alt} onError={() => setFailed(true)} draggable={false} />;
  return (
    <div className="ap-tile-ph" role="img" aria-label={alt}>
      <span aria-hidden="true">{word?.slice(0, 1).toUpperCase() ?? '?'}</span>
    </div>
  );
}
