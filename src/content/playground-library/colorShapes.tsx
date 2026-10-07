/**
 * Colours and drawable shapes for the colour game (ColorPlayScene). Shapes are inline SVG (viewBox 0 0 100 100)
 * so the fill can be ANY colour, always crisp, and always exactly the colour the lesson says (no photo can be "the wrong red").
 */
export type ColorId = 'red' | 'blue' | 'yellow' | 'green' | 'orange' | 'purple' | 'pink' | 'brown' | 'black';

export const COLORS: Record<ColorId, { name: string; hex: string; ink: string }> = {
  red: { name: 'red', hex: '#e53935', ink: '#ffffff' },
  blue: { name: 'blue', hex: '#1e88e5', ink: '#ffffff' },
  yellow: { name: 'yellow', hex: '#fdd835', ink: '#3e2723' },
  green: { name: 'green', hex: '#43a047', ink: '#ffffff' },
  orange: { name: 'orange', hex: '#fb8c00', ink: '#3e2723' },
  purple: { name: 'purple', hex: '#8e24aa', ink: '#ffffff' },
  pink: { name: 'pink', hex: '#ec407a', ink: '#ffffff' },
  brown: { name: 'brown', hex: '#6d4c41', ink: '#ffffff' },
  black: { name: 'black', hex: '#263238', ink: '#ffffff' },
};

export const isColorId = (v: unknown): v is ColorId => typeof v === 'string' && v in COLORS;

export type ShapeId = 'balloon' | 'apple' | 'fish' | 'star' | 'house' | 'flower' | 'car';
export const SHAPE_IDS: ShapeId[] = ['balloon', 'apple', 'fish', 'star', 'house', 'flower', 'car'];
export const isShapeId = (v: unknown): v is ShapeId => typeof v === 'string' && (SHAPE_IDS as string[]).includes(v);

const STROKE = '#37474f';
const sw = 3.2;

/** One shape, filled with `fill` (a hex colour, or "none"/white for an unpainted outline). */
export function ColorShape({ shape, fill, className, style }: { shape: ShapeId; fill: string; className?: string; style?: React.CSSProperties }) {
  const common = { stroke: STROKE, strokeWidth: sw, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      {shape === 'balloon' && (
        <>
          <path d="M50 8C27 8 17 27 17 42c0 19 17 33 33 36 16-3 33-17 33-36C83 27 73 8 50 8Z" fill={fill} {...common} />
          <path d="M44 78l6 7 6-7Z" fill={fill} {...common} />
          <path d="M50 85c-6 4 6 7 0 12" fill="none" {...common} />
          <path d="M30 28c3-8 10-12 17-12" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {shape === 'apple' && (
        <>
          <path d="M50 28C38 18 14 24 14 50c0 22 16 42 36 36 20 6 36-14 36-36 0-26-24-32-36-22Z" fill={fill} {...common} />
          <path d="M50 28c0-9 3-16 9-20" fill="none" {...common} />
          <path d="M54 16c8-8 20-6 22 0-8 6-18 6-22 0Z" fill="#43a047" {...common} />
          <path d="M26 44c1-8 6-13 12-14" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {shape === 'fish' && (
        <>
          <path d="M10 50c14-24 40-30 58-12 8 6 14 12 22 12-8 0-14 6-22 12-18 18-44 12-58-12Z" fill={fill} {...common} />
          <path d="M78 50l16-18v36Z" fill={fill} {...common} />
          <circle cx="30" cy="44" r="4.5" fill="#fff" {...common} />
          <circle cx="29" cy="44" r="1.8" fill={STROKE} />
          <path d="M44 38c4 8 4 16 0 24" fill="none" {...common} />
        </>
      )}
      {shape === 'star' && (
        <path d="M50 8l11 27 29 2-22 19 7 28-25-15-25 15 7-28L10 37l29-2Z" fill={fill} {...common} />
      )}
      {shape === 'house' && (
        <>
          <path d="M16 46V86h68V46" fill={fill} {...common} />
          <path d="M8 48L50 12l42 36Z" fill={fill} {...common} />
          <rect x="40" y="58" width="20" height="28" rx="2" fill="#fff" fillOpacity="0.85" {...common} />
          <rect x="22" y="54" width="14" height="14" rx="2" fill="#fff" fillOpacity="0.85" {...common} />
          <rect x="66" y="54" width="12" height="14" rx="2" fill="#fff" fillOpacity="0.85" {...common} />
        </>
      )}
      {shape === 'flower' && (
        <>
          <path d="M50 52v38" fill="none" {...common} />
          <path d="M50 74c10-10 20-6 24-2-8 8-18 8-24 2Z" fill="#43a047" {...common} />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="50" cy="26" rx="11" ry="16" fill={fill} {...common} transform={`rotate(${a} 50 40)`} />
          ))}
          <circle cx="50" cy="40" r="9" fill="#fdd835" {...common} />
        </>
      )}
      {shape === 'car' && (
        <>
          <path d="M8 62c0-8 4-12 10-13l12-18c2-3 5-5 9-5h26c4 0 7 2 9 5l12 18c6 1 12 5 12 13v10H8Z" fill={fill} {...common} />
          <path d="M34 34h14v15H27Zm20 0h12l10 15H54Z" fill="#e3f2fd" {...common} />
          <circle cx="28" cy="72" r="10" fill="#37474f" {...common} />
          <circle cx="74" cy="72" r="10" fill="#37474f" {...common} />
          <circle cx="28" cy="72" r="4" fill="#cfd8dc" />
          <circle cx="74" cy="72" r="4" fill="#cfd8dc" />
        </>
      )}
    </svg>
  );
}

/** A paint pot: a tin with a coloured top. `label` is shown only when the game wants the word visible. */
export function PaintPot({ color, label, className, style }: { color: ColorId; label?: string; className?: string; style?: React.CSSProperties }) {
  const c = COLORS[color];
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <path d="M18 34h64l-4 52c0 4-4 7-8 7H30c-4 0-8-3-8-7Z" fill="#cfd8dc" stroke={STROKE} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M22 62h56" stroke="#90a4ae" strokeWidth="2" />
      <ellipse cx="50" cy="34" rx="32" ry="9" fill={c.hex} stroke={STROKE} strokeWidth={sw} />
      <path d="M32 30c6-3 12-3 18-1" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
      <path d="M26 20c8-12 40-12 48 0" fill="none" stroke={STROKE} strokeWidth="2.4" strokeLinecap="round" />
      {label && (
        <>
          <rect x="30" y="60" width="40" height="18" rx="9" fill="#fff" stroke={STROKE} strokeWidth="2" />
          <text x="50" y="73" textAnchor="middle" fontSize="12" fontWeight="800" fill={STROKE} fontFamily="Fredoka, system-ui, sans-serif">{label}</text>
        </>
      )}
    </svg>
  );
}
