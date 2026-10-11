// Animated drawn pictures for classroom words (owner 2026-10-11: instruction words and help phrases need pictures).
// Plain SVG + CSS, silent, calm; one small story per word. No emoji, no 3D, no zoom/pan of any picture.
import { useId } from 'react';
import type { ActionId } from '../types';

const SKIN = '#f0c9a4';
const OUT = '#3b1d8f';

export function ActionArt({ id, label }: { id: ActionId; label: string }) {
  const u = useId().replace(/:/g, '');
  const bg = (
    <>
      <defs>
        <linearGradient id={`${u}-bg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#efe9ff" /><stop offset="1" stopColor="#d6c8ff" /></linearGradient>
      </defs>
      <rect width="260" height="200" rx="22" fill={`url(#${u}-bg)`} />
    </>
  );
  let body: JSX.Element;
  switch (id) {
    case 'listen':
      body = (
        <g>
          <path d="M104 150 Q70 150 70 100 Q70 50 118 50 Q160 50 160 92 Q160 118 140 130 Q132 150 118 156 Q108 160 104 150Z" fill={SKIN} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
          <path d="M100 90 Q100 70 120 70 Q138 70 138 90 Q138 104 124 110" fill="none" stroke={OUT} strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
          {[0, 1, 2].map((i) => <path key={i} className="ad-wave" style={{ ['--i' as string]: i }} d={`M${178 + i * 16} ${78 - i * 6} Q${192 + i * 16} 100 ${178 + i * 16} ${122 + i * 6}`} fill="none" stroke="#6d46e6" strokeWidth="6" strokeLinecap="round" />)}
        </g>
      );
      break;
    case 'look':
      body = (
        <g>
          {[88, 172].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy="100" rx="38" ry="30" fill="#fff" stroke={OUT} strokeWidth="4" />
              <g className="ad-look-pupil"><circle cx={cx} cy="100" r="15" fill="#4f46e5" /><circle cx={cx} cy="100" r="7" fill="#1e1b4b" /><circle cx={cx - 5} cy="94" r="3.5" fill="#fff" /></g>
            </g>
          ))}
          <path d="M44 66 Q88 44 120 62 M140 62 Q172 44 216 66" fill="none" stroke={OUT} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
      break;
    case 'repeat':
      body = (
        <g>
          {[0, 1].map((i) => (
            <g key={i} className="ad-echo" style={{ ['--i' as string]: i }}>
              <path d="M52 52 H150 Q164 52 164 66 V104 Q164 118 150 118 H100 L78 140 V118 H64 Q52 118 52 104Z" fill="#fff" stroke={OUT} strokeWidth="4" strokeLinejoin="round" transform={`translate(${i * 40} ${i * 22})`} />
            </g>
          ))}
          <g className="ad-spin" style={{ transformOrigin: '196px 62px' }}>
            <path d="M178 62 A18 18 0 0 1 212 52" fill="none" stroke="#6d46e6" strokeWidth="6" strokeLinecap="round" /><path d="M208 40 L214 54 L200 56Z" fill="#6d46e6" />
            <path d="M214 72 A18 18 0 0 1 180 82" fill="none" stroke="#6d46e6" strokeWidth="6" strokeLinecap="round" /><path d="M184 94 L178 80 L192 78Z" fill="#6d46e6" />
          </g>
        </g>
      );
      break;
    case 'click':
      body = (
        <g>
          <rect x="52" y="78" width="156" height="52" rx="26" fill="#8b5cf6" stroke={OUT} strokeWidth="4" />
          <rect x="68" y="84" width="124" height="18" rx="9" fill="#fff" opacity="0.35" />
          <circle className="ad-ripple" cx="150" cy="104" r="12" fill="none" stroke="#fbbf24" strokeWidth="5" />
          <g className="ad-cursor"><path d="M140 104 L140 164 L156 150 L168 176 L180 170 L168 144 L190 144Z" fill="#fff" stroke={OUT} strokeWidth="4" strokeLinejoin="round" /></g>
        </g>
      );
      break;
    case 'read':
      body = (
        <g>
          <path d="M130 58 Q96 44 50 52 V150 Q96 142 130 156Z" fill="#fff" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
          <path d="M130 58 Q164 44 210 52 V150 Q164 142 130 156Z" fill="#fff" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
          {[0, 1, 2, 3].map((i) => <rect key={i} className="ad-readline" style={{ ['--i' as string]: i }} x="64" y={74 + i * 17} width={i === 3 ? 38 : 52} height="7" rx="3.5" fill="#8b5cf6" />)}
          {[0, 1, 2, 3].map((i) => <rect key={`r${i}`} x="148" y={74 + i * 17} width={i === 3 ? 34 : 48} height="7" rx="3.5" fill="#c4b5fd" />)}
        </g>
      );
      break;
    case 'point':
      body = (
        <g>
          <circle cx="214" cy="104" r="26" fill="#fbbf24" stroke={OUT} strokeWidth="4" /><circle cx="214" cy="104" r="14" fill="#fff" stroke={OUT} strokeWidth="3" /><circle cx="214" cy="104" r="5" fill="#8b5cf6" />
          <g className="ad-point">
            <rect x="26" y="88" width="30" height="64" rx="8" fill="#8b5cf6" stroke={OUT} strokeWidth="4" />
            <rect x="52" y="92" width="64" height="58" rx="16" fill={SKIN} stroke={OUT} strokeWidth="4" />
            <rect x="104" y="120" width="34" height="13" rx="6.5" fill={SKIN} stroke={OUT} strokeWidth="3.5" />
            <rect x="104" y="133" width="30" height="13" rx="6.5" fill={SKIN} stroke={OUT} strokeWidth="3.5" />
            <rect x="104" y="146" width="26" height="12" rx="6" fill={SKIN} stroke={OUT} strokeWidth="3.5" />
            <path d="M70 94 Q78 72 102 78 Q112 82 106 94Z" fill={SKIN} stroke={OUT} strokeWidth="3.5" strokeLinejoin="round" />
            <rect x="104" y="98" width="70" height="20" rx="10" fill={SKIN} stroke={OUT} strokeWidth="4" />
            <path d="M114 106 H160" stroke="#d8a97f" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>
      );
      break;
    case 'sorry':
      body = (
        <g>
          <path d="M96 150 Q64 150 64 104 Q64 58 110 56 Q150 56 150 96 Q150 120 132 132 Q124 150 110 154 Q100 158 96 150Z" fill={SKIN} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
          <path d="M94 92 Q94 74 112 74 Q128 74 128 92 Q128 104 116 110" fill="none" stroke={OUT} strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
          <g className="ad-qmark"><circle cx="196" cy="74" r="26" fill="#fff" stroke={OUT} strokeWidth="4" /><text x="196" y="86" textAnchor="middle" fontSize="38" fontWeight="900" fill="#6d46e6" fontFamily="system-ui, sans-serif">?</text></g>
        </g>
      );
      break;
    case 'slow':
      body = (
        <g>
          <circle cx="130" cy="100" r="52" fill="#fff" stroke={OUT} strokeWidth="5" />
          {[0, 90, 180, 270].map((a) => <rect key={a} x="127" y="54" width="6" height="10" rx="3" fill="#8b5cf6" transform={`rotate(${a} 130 100)`} />)}
          <g className="ad-hand-slow" style={{ transformOrigin: '130px 100px' }}><rect x="127" y="62" width="6" height="40" rx="3" fill={OUT} /></g>
          <circle cx="130" cy="100" r="7" fill="#fbbf24" stroke={OUT} strokeWidth="3" />
          <path d="M200 70 H232 M200 100 H224 M200 130 H216" stroke="#6d46e6" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
        </g>
      );
      break;
    case 'confused':
      body = (
        <g>
          <circle cx="130" cy="108" r="46" fill={SKIN} stroke={OUT} strokeWidth="4" />
          <path d="M100 96 Q110 88 120 96 M142 96 Q152 88 162 96" fill="none" stroke={OUT} strokeWidth="4" strokeLinecap="round" />
          <path d="M108 128 Q120 120 130 128 Q140 136 152 126" fill="none" stroke={OUT} strokeWidth="4" strokeLinecap="round" />
          {[0, 1, 2].map((i) => <text key={i} className="ad-qfloat" style={{ ['--i' as string]: i }} x={80 + i * 50} y="60" textAnchor="middle" fontSize="30" fontWeight="900" fill="#6d46e6" fontFamily="system-ui, sans-serif">?</text>)}
        </g>
      );
      break;
    case 'meaning':
    default:
      body = (
        <g>
          <path d="M44 44 H156 Q170 44 170 58 V108 Q170 122 156 122 H96 L72 146 V122 H58 Q44 122 44 108Z" fill="#fff" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
          <rect x="62" y="62" width="70" height="9" rx="4.5" fill="#c4b5fd" /><rect x="62" y="80" width="46" height="9" rx="4.5" fill="#c4b5fd" /><rect x="116" y="80" width="38" height="9" rx="4.5" fill="#fbbf24" />
          <g className="ad-magnify"><circle cx="190" cy="120" r="24" fill="#fff" fillOpacity="0.6" stroke={OUT} strokeWidth="5" /><path d="M208 138 L230 162" stroke={OUT} strokeWidth="9" strokeLinecap="round" /></g>
        </g>
      );
  }
  return (
    <svg className="ad-drawn ad-action-art" viewBox="0 0 260 200" role="img" aria-label={label}>
      {bg}
      {body}
    </svg>
  );
}
