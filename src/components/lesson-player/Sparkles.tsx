import { AnimatePresence, motion } from 'framer-motion';

// Two-ring sparkle burst, ported from Animal Adventure Playtime.
// Use for celebration emphasis on top of <SlideStage>.

const EASE_BACK = [0.175, 0.885, 0.32, 1.275] as const;

function StarGlyph({ color = '#FDE047' }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} aria-hidden>
      <path d="M12 2 L14 9 L21 10 L15.5 14 L17.5 21 L12 17 L6.5 21 L8.5 14 L3 10 L10 9 Z"
        fill={color} stroke="#F59E0B" strokeWidth={1.2} strokeLinejoin="round" />
    </svg>
  );
}

export default function Sparkles({ show }: { show: boolean }) {
  const inner = 6;
  const outer = 10;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <motion.div className="absolute h-40 w-40 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(253,224,71,0.55), rgba(253,224,71,0) 70%)' }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.4, 1.8], opacity: [0, 0.9, 0] }}
            transition={{ duration: 0.9, ease: 'easeOut' }} />
          {Array.from({ length: inner }).map((_, i) => {
            const a = (i / inner) * Math.PI * 2;
            return (
              <motion.span key={`i${i}`} className="absolute"
                initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
                animate={{ x: Math.cos(a) * 55, y: Math.sin(a) * 55,
                  scale: [0, 1.1, 0.8, 0], opacity: [0, 1, 1, 0], rotate: 180 }}
                transition={{ duration: 0.75, delay: i * 0.03, ease: EASE_BACK }}>
                <StarGlyph color="#FEF3C7" />
              </motion.span>
            );
          })}
          {Array.from({ length: outer }).map((_, i) => {
            const a = (i / outer) * Math.PI * 2 + Math.PI / outer;
            return (
              <motion.span key={`o${i}`} className="absolute"
                initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
                animate={{ x: Math.cos(a) * 110, y: Math.sin(a) * 110,
                  scale: [0, 1.3, 1, 0], opacity: [0, 1, 1, 0], rotate: 360 }}
                transition={{ duration: 1.05, delay: 0.08 + i * 0.025, ease: EASE_BACK }}>
                <StarGlyph />
              </motion.span>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
