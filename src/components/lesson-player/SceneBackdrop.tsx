import { motion } from 'framer-motion';

// Kawaii ambient backdrop, inspired by Animal Adventure Playtime:
// - painted-style gradient sky/ground
// - slow parallax cloud puffs
// - environment-specific accents (butterflies, balloons, stars, books…)
// All pure SVG/CSS — no image assets.

export type Environment =
  | 'classroom' | 'park' | 'kitchen' | 'space'
  | 'beach' | 'library' | 'forest' | 'bedroom';

const PALETTE: Record<Environment, { sky: string; ground: string; accent: string }> = {
  classroom: { sky: 'from-amber-100 to-orange-50',  ground: 'from-orange-100 to-transparent', accent: '#FE6A2F' },
  park:      { sky: 'from-sky-200 to-emerald-50',   ground: 'from-emerald-200 to-transparent', accent: '#059669' },
  kitchen:   { sky: 'from-yellow-100 to-orange-50', ground: 'from-orange-200 to-transparent',  accent: '#F59E0B' },
  space:     { sky: 'from-indigo-900 to-purple-800',ground: 'from-purple-900 to-transparent',  accent: '#A855F7' },
  beach:     { sky: 'from-sky-200 to-cyan-100',     ground: 'from-yellow-100 to-transparent',  accent: '#38BDF8' },
  library:   { sky: 'from-amber-50 to-orange-100',  ground: 'from-amber-200 to-transparent',   accent: '#B45309' },
  forest:    { sky: 'from-emerald-100 to-lime-50',  ground: 'from-emerald-300 to-transparent', accent: '#059669' },
  bedroom:   { sky: 'from-purple-100 to-pink-50',   ground: 'from-pink-200 to-transparent',    accent: '#EC4899' },
};

function CloudPuff({ scale = 1, opacity = 0.85 }: { scale?: number; opacity?: number }) {
  return (
    <svg viewBox="0 0 120 60" width={110 * scale} height={55 * scale} aria-hidden style={{ opacity }}>
      <g fill="white" stroke="rgba(30,41,59,0.08)" strokeWidth={1.5}>
        <ellipse cx={30} cy={38} rx={22} ry={16} />
        <ellipse cx={55} cy={30} rx={26} ry={20} />
        <ellipse cx={85} cy={36} rx={22} ry={17} />
        <ellipse cx={70} cy={44} rx={30} ry={12} />
      </g>
    </svg>
  );
}

export default function SceneBackdrop({ environment = 'classroom' }: { environment?: Environment }) {
  const p = PALETTE[environment] ?? PALETTE.classroom;
  const isSpace = environment === 'space';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden>
      {/* Painted sky */}
      <div className={`absolute inset-0 bg-gradient-to-b ${p.sky}`} />
      {/* Ground */}
      <div className={`absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t ${p.ground}`} />

      {/* Slow parallax clouds (skip for space) */}
      {!isSpace &&
        [
          { top: '6%',  scale: 0.9, dur: 60, delay: 0,  opacity: 0.85 },
          { top: '16%', scale: 0.7, dur: 48, delay: 12, opacity: 0.65 },
          { top: '26%', scale: 1.0, dur: 75, delay: 25, opacity: 0.7 },
        ].map((c, i) => (
          <motion.div key={i} className="absolute" style={{ top: c.top, left: 0 }}
            initial={{ x: '-15%' }} animate={{ x: '115%' }}
            transition={{ duration: c.dur, repeat: Infinity, ease: 'linear', delay: c.delay }}>
            <CloudPuff scale={c.scale} opacity={c.opacity} />
          </motion.div>
        ))}

      {/* Twinkling stars for space */}
      {isSpace &&
        Array.from({ length: 24 }).map((_, i) => (
          <motion.div key={`s${i}`}
            className="absolute h-1.5 w-1.5 rounded-full bg-white"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 80}%` }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5 + (i % 5) * 0.4, repeat: Infinity, delay: i * 0.1 }} />
        ))}

      {/* Butterflies (park/forest) */}
      {(environment === 'park' || environment === 'forest') &&
        [0, 1].map((i) => (
          <motion.div key={`bf${i}`} className="absolute text-2xl drop-shadow"
            initial={{ x: '10%', y: '45%' }}
            animate={{
              x: ['10%', '40%', '70%', '50%', '20%', '10%'],
              y: ['45%', '28%', '50%', '32%', '55%', '45%'],
              rotate: [0, 15, -10, 12, -8, 0],
            }}
            transition={{ duration: 22 + i * 5, repeat: Infinity, ease: 'easeInOut', delay: i * 3 }}>
            🦋
          </motion.div>
        ))}

      {/* Balloons for bedroom/kitchen (joyful indoor) */}
      {(environment === 'bedroom' || environment === 'kitchen') &&
        ['#F87171', '#FBBF24', '#60A5FA'].map((c, i) => (
          <motion.div key={`ba${i}`} className="absolute"
            style={{ left: `${15 + i * 28}%`, top: '18%' }}
            animate={{ y: [0, -12, 0], rotate: [-4, 4, -4] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}>
            <svg width={36} height={52} viewBox="0 0 44 64" aria-hidden>
              <ellipse cx={22} cy={22} rx={18} ry={22} fill={c} stroke="rgba(0,0,0,0.15)" strokeWidth={2} />
              <ellipse cx={16} cy={14} rx={5} ry={7} fill="white" opacity={0.5} />
              <path d="M 22 44 L 20 48 L 24 48 Z" fill={c} />
              <path d="M 22 48 Q 20 56 22 64" stroke="rgba(0,0,0,0.4)" strokeWidth={1.5} fill="none" />
            </svg>
          </motion.div>
        ))}

      {/* Waves for beach */}
      {environment === 'beach' && (
        <svg className="absolute inset-x-0 bottom-1/3 w-full" viewBox="0 0 400 40" preserveAspectRatio="none" height={40}>
          <motion.path d="M0 20 Q100 0 200 20 T400 20 V40 H0 Z" fill="#38BDF8" opacity={0.4}
            animate={{ d: ['M0 20 Q100 0 200 20 T400 20 V40 H0 Z', 'M0 20 Q100 30 200 20 T400 20 V40 H0 Z', 'M0 20 Q100 0 200 20 T400 20 V40 H0 Z'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
        </svg>
      )}

      {/* Books for library */}
      {environment === 'library' && (
        <div className="absolute bottom-0 left-0 flex gap-1 p-4 text-3xl opacity-70">📚📖📕</div>
      )}

      {/* Warmth vignette */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.06) 100%)' }} />
    </div>
  );
}
