// Pictures drawn in code (not generated art): national flags (so the stripes are always right) and number cards (digit + that many dots).
// Used by PictureTile for ids `flag-<code>` and `num-<n>`. Plain SVG, no animation, no text except the digit.
import type { ReactNode } from 'react';

const FLAGS: Record<string, ReactNode> = {
  es: (
    <>
      <rect width="300" height="200" fill="#c60b1e" />
      <rect y="50" width="300" height="100" fill="#ffc400" />
    </>
  ),
  it: (
    <>
      <rect width="100" height="200" fill="#009246" />
      <rect x="100" width="100" height="200" fill="#ffffff" />
      <rect x="200" width="100" height="200" fill="#ce2b37" />
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

export function Flag({ code, label }: { code: string; label: string }) {
  return (
    <svg className="ap-drawn ap-flag" viewBox="0 0 300 200" role="img" aria-label={label}>
      <g>{FLAGS[code]}</g>
      <rect width="300" height="200" fill="none" stroke="#3b1d8f" strokeOpacity="0.35" strokeWidth="4" />
    </svg>
  );
}

/** A number card: the big digit and that many dots, so the number is understood without translation. */
export function NumberCard({ n, label }: { n: number; label: string }) {
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
        const x = 150 + (col - (inRow - 1) / 2) * 34;
        const y = n <= 5 ? 172 : 150 + row * 34;
        return <circle key={i} cx={x} cy={y} r="13" fill={['#8b5cf6', '#6366f1', '#a78bfa'][i % 3]} stroke="#fff" strokeWidth="3" />;
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
