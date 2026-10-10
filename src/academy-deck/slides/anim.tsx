// Animated drawn pictures for the deck (owner 2026-10-10: "Don't use flat images ever again"). SVG + SMIL/CSS, silent, calm:
// a flag that ripples like cloth, and a traveller who breathes, blinks and sways the flag. No zoom/pan of any picture.
import { useId } from 'react';
import { flagBody, hasFlag } from '../../academy-player/drawn';
import { useDeck } from '../ctx';

function RippleDefs({ id, calm, scale = 9 }: { id: string; calm: boolean; scale?: number }) {
  return (
    <defs>
      <filter id={id} x="-5%" y="-10%" width="110%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="1" seed="3" result="n">
          {!calm && <animate attributeName="baseFrequency" dur="3.2s" values="0.012 0.04;0.02 0.055;0.012 0.04" repeatCount="indefinite" />}
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <linearGradient id={`${id}-sh`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity="0.18" />
        <stop offset="0.35" stopColor="#fff" stopOpacity="0.18" />
        <stop offset="0.7" stopColor="#000" stopOpacity="0.14" />
        <stop offset="1" stopColor="#fff" stopOpacity="0.1" />
        {!calm && <animate attributeName="x1" dur="3.2s" values="0;0.25;0" repeatCount="indefinite" />}
      </linearGradient>
    </defs>
  );
}

/** A flag that ripples in the wind (cloth shading + a gentle displacement). */
export function WavingFlag({ code, label }: { code: string; label: string }) {
  const id = useId().replace(/:/g, '');
  const { reduced } = useDeck();
  if (!hasFlag(code)) return null;
  return (
    <svg className="ad-drawn ad-wflag" viewBox="0 0 300 200" role="img" aria-label={label}>
      <RippleDefs id={id} calm={reduced} />
      <g filter={`url(#${id})`}>
        {flagBody(code)}
        <rect width="300" height="200" fill={`url(#${id}-sh)`} />
      </g>
    </svg>
  );
}

const LOOK: Record<string, { skin: string; hair: string; shirt: string; style: 'short' | 'wavy' | 'curly' }> = {
  es: { skin: '#f3cfae', hair: '#3b2416', shirt: '#7c5cf0', style: 'short' },
  it: { skin: '#e9b98f', hair: '#6b3a1c', shirt: '#2f9e8f', style: 'wavy' },
  br: { skin: '#c88b5e', hair: '#1c1410', shirt: '#f59e0b', style: 'curly' },
};

/** A traveller: breathes, blinks and waves the flag of their country. */
export function Traveller({ code, label }: { code: string; label: string }) {
  const id = useId().replace(/:/g, '');
  const { reduced } = useDeck();
  const look = LOOK[code] ?? LOOK.es;
  return (
    <svg className="ad-drawn ad-traveller-art" viewBox="0 0 260 260" role="img" aria-label={label}>
      <RippleDefs id={id} calm={reduced} scale={7} />
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#efe9ff" /><stop offset="1" stopColor="#d9ccff" /></linearGradient>
        <radialGradient id={`${id}-skin`} cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor={look.skin} /><stop offset="1" stopColor={look.skin} stopOpacity="0.82" /></radialGradient>
      </defs>
      <rect width="260" height="260" rx="22" fill={`url(#${id}-bg)`} />
      <ellipse cx="116" cy="248" rx="70" ry="9" fill="#5b3fd0" opacity="0.18" />
      {/* suitcase */}
      <g className="ad-trav-case"><rect x="24" y="196" width="46" height="38" rx="6" fill="#6d46e6" stroke="#3b1d8f" strokeWidth="3" /><rect x="38" y="188" width="18" height="10" rx="4" fill="none" stroke="#3b1d8f" strokeWidth="3" /><path d="M24 214h46" stroke="#fde68a" strokeWidth="3" /></g>
      <g className="ad-trav-body">
        {/* body */}
        <path d="M58 250 Q60 168 118 160 Q176 168 178 250Z" fill={look.shirt} stroke="#3b1d8f" strokeOpacity="0.55" strokeWidth="3" />
        <path d="M96 164 Q118 186 140 164" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
        <rect x="106" y="138" width="24" height="26" rx="10" fill={`url(#${id}-skin)`} />
        {/* head */}
        <circle cx="118" cy="104" r="42" fill={`url(#${id}-skin)`} stroke="#3b1d8f" strokeOpacity="0.45" strokeWidth="3" />
        {look.style === 'short' && <path d="M76 98 Q80 58 118 56 Q158 58 160 98 Q146 76 118 76 Q92 76 76 98Z" fill={look.hair} />}
        {look.style === 'wavy' && <path d="M74 106 Q70 52 118 52 Q168 52 162 106 Q152 72 118 74 Q88 74 74 106Z M74 100 Q66 124 80 134 Q74 112 80 100Z" fill={look.hair} />}
        {look.style === 'curly' && <g fill={look.hair}>{[[84, 70], [102, 58], [124, 56], [146, 64], [156, 84], [80, 92]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="15" />)}</g>}
        {/* face */}
        <g className="ad-eyes"><ellipse className="ad-eye" cx="104" cy="106" rx="4.5" ry="5.5" fill="#2a1a4a" /><ellipse className="ad-eye" cx="132" cy="106" rx="4.5" ry="5.5" fill="#2a1a4a" /></g>
        <circle cx="94" cy="120" r="6" fill="#f87171" opacity="0.35" /><circle cx="142" cy="120" r="6" fill="#f87171" opacity="0.35" />
        <path d="M104 124 Q118 138 132 124" fill="none" stroke="#2a1a4a" strokeWidth="3.5" strokeLinecap="round" />
        {/* flag arm + pole + waving flag */}
        <g className="ad-trav-flag">
          <path d="M170 200 Q196 188 204 140" fill="none" stroke={look.skin} strokeWidth="14" strokeLinecap="round" />
          <rect x="201" y="34" width="5" height="116" rx="2.5" fill="#7c4a1d" />
          <g transform="translate(206 38) scale(0.34)"><g filter={`url(#${id})`}>{flagBody(code)}<rect width="300" height="200" fill={`url(#${id}-sh)`} /></g></g>
        </g>
      </g>
    </svg>
  );
}
