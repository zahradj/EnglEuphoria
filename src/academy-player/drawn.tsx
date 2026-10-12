// Pictures drawn in code (not generated art): national flags (so the stripes are always right) and number cards (digit + that many dots).
// Used by PictureTile for ids `flag-<code>` and `num-<n>`. Plain SVG, no animation, no text except the digit.
import type { ReactNode } from 'react';

const FLAGS: Record<string, ReactNode> = {
  es: (
    <>
      <rect width="300" height="200" fill="#aa151b" />
      <rect y="50" width="300" height="100" fill="#f1bf00" />
      {/* simplified coat of arms on the hoist side: crown, shield (castle, lion, bars, pomegranate point) and the two Pillars of Hercules */}
      <g transform="translate(66 62)">
        <rect x="-2" y="18" width="9" height="60" rx="2" fill="#f5f5f0" stroke="#7a1d1d" strokeWidth="1.5" /><rect x="-4" y="14" width="13" height="6" rx="2" fill="#aa151b" />
        <rect x="53" y="18" width="9" height="60" rx="2" fill="#f5f5f0" stroke="#7a1d1d" strokeWidth="1.5" /><rect x="51" y="14" width="13" height="6" rx="2" fill="#aa151b" />
        <path d="M14 14 L18 2 L24 9 L30 0 L36 9 L42 2 L46 14Z" fill="#f1bf00" stroke="#7a1d1d" strokeWidth="1.5" />
        <path d="M14 16 H46 V48 Q46 68 30 76 Q14 68 14 48Z" fill="#fff" stroke="#7a1d1d" strokeWidth="2" />
        <path d="M14 16 H30 V46 H14Z" fill="#aa151b" /><path d="M30 46 H46 V16 H30Z" fill="#f5f5f0" />
        <rect x="19" y="24" width="6" height="12" fill="#f1bf00" /><rect x="17" y="22" width="10" height="3" fill="#f1bf00" />
        <path d="M34 40 Q36 24 42 22 Q41 30 44 34 Q40 40 34 40Z" fill="#8c3b8c" />
        <path d="M14 46 H30 V62 Q30 70 30 74 Q16 66 14 56Z" fill="#f1bf00" /><path d="M16 50 H28 M16 56 H28 M16 62 H28" stroke="#aa151b" strokeWidth="2.2" />
        <path d="M30 46 H46 V56 Q44 66 30 74Z" fill="#f5f5f0" />
        <circle cx="30" cy="46" r="3.5" fill="#1b5e9b" />
        <rect x="-8" y="82" width="76" height="6" rx="3" fill="#aa151b" opacity="0.85" />
      </g>
    </>
  ),
  it: (
    <>
      <rect width="100" height="200" fill="#009246" />
      <rect x="100" width="100" height="200" fill="#ffffff" />
      <rect x="200" width="100" height="200" fill="#ce2b37" />
    </>
  ),
  fr: (
    <>
      <rect width="100" height="200" fill="#0055a4" />
      <rect x="100" width="100" height="200" fill="#ffffff" />
      <rect x="200" width="100" height="200" fill="#ef4135" />
    </>
  ),
  de: (
    <>
      <rect width="300" height="67" fill="#000000" />
      <rect y="66" width="300" height="68" fill="#dd0000" />
      <rect y="133" width="300" height="67" fill="#ffce00" />
    </>
  ),
  jp: (
    <>
      <rect width="300" height="200" fill="#ffffff" />
      <circle cx="150" cy="100" r="58" fill="#bc002d" />
    </>
  ),
  pl: (
    <>
      <rect width="300" height="100" fill="#ffffff" />
      <rect y="100" width="300" height="100" fill="#dc143c" />
    </>
  ),
  ie: (
    <>
      <rect width="100" height="200" fill="#169b62" />
      <rect x="100" width="100" height="200" fill="#ffffff" />
      <rect x="200" width="100" height="200" fill="#ff883e" />
    </>
  ),
  tr: (
    <>
      <rect width="300" height="200" fill="#e30a17" />
      <circle cx="108" cy="100" r="50" fill="#ffffff" />
      <circle cx="124" cy="100" r="40" fill="#e30a17" />
      <polygon points="184.0,100 168,111.7 174.1,92.9 158,81.3 177.9,81.3 184,62.4 190.1,81.3 210,81.3 193.9,92.9 200,111.7" fill="#ffffff" transform="translate(-1 0) rotate(0)" />
    </>
  ),
  cn: (
    <>
      <rect width="300" height="200" fill="#de2910" />
      <polygon points="60,30 70.6,62.6 104.9,62.6 77.1,82.7 87.8,115.3 60,95.2 32.2,115.3 42.9,82.7 15.1,62.6 49.4,62.6" fill="#ffde00" transform="scale(1.0) translate(0 -2)" />
      <polygon points="120,22 124,34 136,34 126,41 130,53 120,46 110,53 114,41 104,34 116,34" fill="#ffde00" transform="translate(6 -4) scale(0.95)" />
      <polygon points="120,22 124,34 136,34 126,41 130,53 120,46 110,53 114,41 104,34 116,34" fill="#ffde00" transform="translate(30 20) scale(0.95)" />
      <polygon points="120,22 124,34 136,34 126,41 130,53 120,46 110,53 114,41 104,34 116,34" fill="#ffde00" transform="translate(30 56) scale(0.95)" />
      <polygon points="120,22 124,34 136,34 126,41 130,53 120,46 110,53 114,41 104,34 116,34" fill="#ffde00" transform="translate(6 82) scale(0.95)" />
    </>
  ),
  us: (
    <>
      <rect width="300" height="200" fill="#ffffff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => <rect key={i} y={(i * 200) / 13} width="300" height={200 / 13} fill="#b22234" />)}
      <rect width="120" height={(7 * 200) / 13} fill="#3c3b6e" />
      {[0, 1, 2, 3, 4].flatMap((r) => [0, 1, 2, 3, 4, 5].map((c) => <circle key={`${r}${c}`} cx={12 + c * 19 + (r % 2 ? 9 : 0)} cy={11 + r * 15} r="3.2" fill="#fff" />))}
    </>
  ),
  gb: (
    <>
      <clipPath id="gb-clip"><path d="M150,100 h150 v100 z v100 h-150 z h-150 v-100 z v-100 h150 z" /></clipPath>
      <rect width="300" height="200" fill="#012169" />
      <path d="M0,0 L300,200 M300,0 L0,200" stroke="#ffffff" strokeWidth="36" />
      <path d="M0,0 L300,200 M300,0 L0,200" clipPath="url(#gb-clip)" stroke="#c8102e" strokeWidth="14" />
      <path d="M150,0 V200 M0,100 H300" stroke="#ffffff" strokeWidth="56" />
      <path d="M150,0 V200 M0,100 H300" stroke="#c8102e" strokeWidth="34" />
    </>
  ),
  br: (
    <>
      <rect width="300" height="200" fill="#009b3a" />
      <polygon points="150,22 275,100 150,178 25,100" fill="#ffdf00" />
      <circle cx="150" cy="100" r="42" fill="#002776" />
      <path d="M110 92 Q150 78 190 108" stroke="#fff" strokeWidth="7" fill="none" />
    </>
  ),
};

export const hasFlag = (code: string) => code in FLAGS;
/** The flag's artwork (300x200 viewBox) for other drawn pictures. */
export const flagBody = (code: string) => FLAGS[code];

export function Flag({ code, label }: { code: string; label: string }) {
  return (
    <svg className="ap-drawn ap-flag" viewBox="0 0 300 200" role="img" aria-label={label}>
      <g>{FLAGS[code]}</g>
      <rect width="300" height="200" fill="none" stroke="#3b1d8f" strokeOpacity="0.35" strokeWidth="4" />
    </svg>
  );
}

/** A number card: the big number and, up to 20, that many dots (so it is understood without translation). Bigger numbers show their parts: 503 = 500 + 3. */
export function NumberCard({ n, label }: { n: number; label: string }) {
  if (n > 20) {
    const hundreds = Math.floor(n / 100) * 100;
    const rest = n % 100;
    const parts = [hundreds, rest].filter((v) => v > 0);
    const tens = rest >= 20 ? Math.floor(rest / 10) * 10 : 0;
    const split = hundreds > 0 && tens > 0 && rest % 10 > 0 ? [hundreds, tens, rest % 10] : tens > 0 && rest % 10 > 0 && hundreds === 0 ? [tens, rest % 10] : parts;
    return (
      <svg className="ap-drawn ap-numcard" viewBox="0 0 300 225" role="img" aria-label={label}>
        <rect width="300" height="225" rx="22" fill="#f3edff" />
        <text x="150" y="120" textAnchor="middle" fontSize={n >= 100 ? 92 : 108} fontWeight="900" fill="#4c1d95" fontFamily="system-ui, sans-serif">{n}</text>
        {split.length > 1 && (
          <g>
            {split.map((v, i) => {
              const w = 76;
              const x = 150 + (i - (split.length - 1) / 2) * (w + 10) - w / 2;
              return (
                <g key={i}>
                  <rect x={x} y="150" width={w} height="40" rx="12" fill={['#8b5cf6', '#6366f1', '#a78bfa'][i % 3]} stroke="#fff" strokeWidth="3" />
                  <text x={x + w / 2} y="178" textAnchor="middle" fontSize="24" fontWeight="800" fill="#fff" fontFamily="system-ui, sans-serif">{v}</text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    );
  }
  const dots = Array.from({ length: n }, (_, i) => i);
  const perRow = n <= 5 ? n : Math.ceil(n / 2);
  return (
    <svg className="ap-drawn ap-numcard" viewBox="0 0 300 225" role="img" aria-label={label}>
      <rect width="300" height="225" rx="22" fill="#f3edff" />
      <text x="150" y="112" textAnchor="middle" fontSize="104" fontWeight="900" fill="#4c1d95" fontFamily="system-ui, sans-serif">{n}</text>
      {dots.map((i) => {
        const row = Math.floor(i / perRow);
        const inRow = n <= 5 ? n : row === 0 ? perRow : n - perRow;
        const col = i % perRow;
        const x = 150 + (col - (inRow - 1) / 2) * (n > 10 ? 26 : 34);
        const y = n <= 5 ? 172 : 150 + row * (n > 10 ? 30 : 34);
        return <circle key={i} cx={x} cy={y} r={n > 10 ? 10 : 13} fill={['#8b5cf6', '#6366f1', '#a78bfa'][i % 3]} stroke="#fff" strokeWidth="3" />;
      })}
    </svg>
  );
}

/** A person (a simple bust) holding the flag: the picture for a nationality ("Spanish"). */
export function FlagPerson({ code, label }: { code: string; label: string }) {
  return (
    <svg className="ap-drawn ap-person" viewBox="0 0 300 225" role="img" aria-label={label}>
      <rect width="300" height="225" rx="22" fill="#f3edff" />
      <circle cx="120" cy="78" r="38" fill="#f1c9a5" stroke="#3b1d8f" strokeOpacity="0.5" strokeWidth="3" />
      <path d="M76 68 Q120 20 164 68 Q150 52 120 52 Q90 52 76 68Z" fill="#4c2a1a" />
      <circle cx="107" cy="82" r="4" fill="#3b1d8f" />
      <circle cx="133" cy="82" r="4" fill="#3b1d8f" />
      <path d="M108 98 Q120 108 132 98" stroke="#3b1d8f" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M44 225 Q48 138 120 130 Q192 138 196 225Z" fill="#8b5cf6" stroke="#3b1d8f" strokeOpacity="0.5" strokeWidth="3" />
      <rect x="196" y="40" width="5" height="150" rx="2" fill="#6b4a2a" />
      <g transform="translate(201 44) scale(0.36)">{FLAGS[code]}</g>
      <rect x="201" y="44" width="108" height="72" fill="none" stroke="#3b1d8f" strokeOpacity="0.35" strokeWidth="2" />
    </svg>
  );
}
