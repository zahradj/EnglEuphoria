import { CSSProperties, memo, useEffect, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

/**
 * SpriteMascot — "aliveness" wrapper around an intact character sprite
 * (no separate limb/eyelid layers, so nothing can ever clip):
 *   - Continuous breathing (torso scale) + idle head bob
 *   - Talking loop (faster bob) while `isTalking` is true
 *   - Periodic blink — painted only inside a per-character "eye band" using
 *     the sprite itself as a mask, so no separate eyelid PNG is needed
 *   - One-shot wave (whole-sprite sway, anchored low so it reads as a
 *     friendly gesture rather than a detached arm)
 *   - Slight mood tilt per emotion, springing into place on change
 *
 * Animated with framer-motion (already a project dependency, see
 * PipMascot.tsx for the established convention) rather than raw CSS
 * @keyframes: switching between the idle and talk loops interpolates from
 * the sprite's current position instead of snapping to frame 0, and the
 * mood tilt eases in with a spring instead of jumping instantly.
 */

export type MascotEmotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';

type EyeBand = {
  /** Vertical center of the eyes, 0–1 of sprite height. */
  y: number;
  /** Half-height of the eyelid band, 0–1 of sprite height. */
  halfHeight: number;
  /** Horizontal center, 0–1 of sprite width. */
  x?: number;
  /** Half-width, 0–1 of sprite width. */
  halfWidth?: number;
};

export type MascotProfile = {
  src: string;
  eyeBand: EyeBand;
  restTilt?: number;
  eyelidColor?: string;
};

const MOOD_TILT: Record<MascotEmotion, number> = {
  neutral: 0,
  happy: 0,
  sad: -3,
  angry: 2,
  surprised: 0,
};

type Props = {
  profile: MascotProfile;
  emotion?: MascotEmotion;
  isTalking?: boolean;
  waving?: boolean;
  /** px height, or omit to fill the parent (this codebase sizes mascots via a parent container). */
  size?: number;
  flip?: boolean;
  alt?: string;
  className?: string;
  style?: CSSProperties;
};

function useBlink(active: boolean) {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!active) return;
    let timer: number;
    const schedule = () => {
      const wait = 2600 + Math.random() * 2800;
      timer = window.setTimeout(() => {
        setClosed(true);
        window.setTimeout(() => {
          setClosed(false);
          schedule();
        }, 140);
      }, wait);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [active]);
  return closed;
}

export const SpriteMascot = memo(function SpriteMascot({
  profile,
  emotion = 'neutral',
  isTalking = false,
  waving = false,
  size,
  flip = false,
  alt = '',
  className = '',
  style,
}: Props) {
  const closed = useBlink(true);
  const tilt = (profile.restTilt ?? 0) + MOOD_TILT[emotion];
  const eyeX = profile.eyeBand.x ?? 0.5;
  const eyeHW = profile.eyeBand.halfWidth ?? 0.28;
  const eyeY = profile.eyeBand.y;
  const eyeHH = profile.eyeBand.halfHeight;

  const waveControls = useAnimationControls();
  useEffect(() => {
    if (!waving) return;
    void waveControls.start({
      rotate: [0, -8, 8, -5, 3, 0],
      transition: { duration: 1.2, ease: 'easeInOut' },
    });
  }, [waving, waveControls]);

  return (
    <motion.div
      className={`sprite-mascot ${isTalking ? 'is-talking' : ''} ${className}`}
      style={{
        width: size ?? '100%',
        height: size ?? '100%',
        position: 'relative',
        transformOrigin: '50% 90%',
        ...style,
      }}
      animate={{ rotate: tilt, scaleX: flip ? -1 : 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 14 }}
      data-emotion={emotion}
    >
      <motion.img
        src={profile.src}
        alt={alt}
        draggable={false}
        className="sprite-mascot__body"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          userSelect: 'none',
          transformOrigin: '50% 95%',
        }}
        animate={
          isTalking
            ? { scale: [1, 1.025, 0.985, 1], y: [0, -2, -1, 0] }
            : { scale: [1, 1.015, 0.985, 1], y: [0, -6, -2, 0] }
        }
        transition={{ duration: isTalking ? 0.32 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Eyelid overlay — the sprite itself is used as a mask so the paint
          only lands on character pixels, clipped to a per-character eye band. */}
      <motion.div
        aria-hidden
        className="sprite-mascot__lids"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundColor: profile.eyelidColor ?? '#3a2a1e',
          WebkitMaskImage: `url(${profile.src})`,
          maskImage: `url(${profile.src})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
          clipPath: `polygon(
            ${(eyeX - eyeHW) * 100}% ${(eyeY - eyeHH) * 100}%,
            ${(eyeX + eyeHW) * 100}% ${(eyeY - eyeHH) * 100}%,
            ${(eyeX + eyeHW) * 100}% ${(eyeY + eyeHH) * 100}%,
            ${(eyeX - eyeHW) * 100}% ${(eyeY + eyeHH) * 100}%
          )`,
        }}
        animate={{ opacity: closed ? 1 : 0 }}
        transition={{ duration: 0.06, ease: 'linear' }}
      />

      {waving && (
        <motion.div
          aria-hidden
          className="sprite-mascot__wave"
          style={{ position: 'absolute', inset: 0, transformOrigin: '50% 85%' }}
          initial={{ rotate: 0 }}
          animate={waveControls}
        />
      )}
    </motion.div>
  );
});

/** Eye-band presets for the Playground cast, tuned per character's face position. */
export const MASCOT_EYE_BANDS: Record<string, EyeBand> = {
  pip: { y: 0.34, halfHeight: 0.045, x: 0.5, halfWidth: 0.24 },
  mia: { y: 0.30, halfHeight: 0.040, x: 0.5, halfWidth: 0.22 },
  bella: { y: 0.28, halfHeight: 0.045, x: 0.5, halfWidth: 0.24 },
  willow: { y: 0.26, halfHeight: 0.035, x: 0.5, halfWidth: 0.20 },
  leo: { y: 0.32, halfHeight: 0.050, x: 0.5, halfWidth: 0.26 },
};
