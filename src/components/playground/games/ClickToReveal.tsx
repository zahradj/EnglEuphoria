// ClickToReveal — Pre-A1 tap-to-reveal game.
// Pure visual; no text instructions. A continuous scale pulse signals
// interactivity; tap triggers a spring swap between initial → reveal image.
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaygroundAnimation } from '@/hooks/usePlaygroundAnimation';

export interface ClickToRevealProps {
  initialImage: string;
  revealImage: string;
  initialAlt?: string;
  revealAlt?: string;
  onReveal?: () => void;
  size?: number;
  className?: string;
}

export function ClickToReveal({
  initialImage,
  revealImage,
  initialAlt = '',
  revealAlt = '',
  onReveal,
  size = 220,
  className = '',
}: ClickToRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const { controls, celebrate } = usePlaygroundAnimation();

  const handleTap = async () => {
    if (revealed) return;
    setRevealed(true);
    onReveal?.();
    await celebrate('Yay!');
  };

  return (
    <motion.button
      type="button"
      onClick={handleTap}
      animate={revealed ? controls : { scale: [1, 1.06, 1] }}
      transition={
        revealed
          ? undefined
          : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
      }
      whileTap={{ scale: 0.92 }}
      style={{ width: size, height: size }}
      className={`relative rounded-[28%] overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200 shadow-xl ring-4 ring-white/70 focus:outline-none focus:ring-orange-400 ${className}`}
      aria-label={revealed ? revealAlt : initialAlt}
    >
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.img
            key="initial"
            src={initialImage}
            alt=""
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6, rotate: -15 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute inset-0 w-full h-full object-contain p-4"
            draggable={false}
          />
        ) : (
          <motion.img
            key="reveal"
            src={revealImage}
            alt=""
            initial={{ opacity: 0, scale: 0.4, rotate: 20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className="absolute inset-0 w-full h-full object-contain p-4"
            draggable={false}
          />
        )}
      </AnimatePresence>

      {/* Pulsing glow halo while idle */}
      {!revealed && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-[28%] ring-4 ring-orange-400/60"
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.08, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.button>
  );
}

export default ClickToReveal;
