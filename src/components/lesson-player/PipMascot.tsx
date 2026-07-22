import React from 'react';
import { motion } from 'framer-motion';
import pipMascotImg from '@/assets/pip-mascot.png';
import { useActiveCompanion } from '@/hooks/useActiveCompanion';
import { useIsAcademy } from '@/components/academy/HubGuard';

interface PipMascotProps {
  size?: number;
  animation?: 'idle' | 'bounce' | 'wave' | 'jump' | 'celebrate';
  className?: string;
  /** Override the image source (e.g. when rendering for a specific companion). */
  src?: string;
  /** Override the alt text. */
  alt?: string;
  /**
   * When true (default), the mascot reads the student's chosen companion
   * from `useActiveCompanion` and renders its avatar. Set to false to
   * always render the static Pip illustration.
   */
  dynamic?: boolean;
}

const ANIMATIONS = {
  idle: {
    animate: { y: [0, -4, 0] },
    transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' as const },
  },
  bounce: {
    animate: { y: [0, -12, 0], scale: [1, 1.05, 1] },
    transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' as const },
  },
  wave: {
    animate: { rotate: [0, 8, -8, 6, -6, 0] },
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' as const },
  },
  jump: {
    animate: { y: [0, -20, 0], scale: [1, 1.1, 0.95, 1] },
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' as const },
  },
  celebrate: {
    animate: { y: [0, -16, 0], rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] },
    transition: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' as const },
  },
};

export default function PipMascot({
  size = 80,
  animation = 'idle',
  className = '',
  src,
  alt,
  dynamic = true,
}: PipMascotProps) {
  // Mascot Exclusion Protocol: Pip must never render inside the Academy hub.
  const isAcademy = useIsAcademy();
  if (isAcademy) return null;
  const anim = ANIMATIONS[animation];
  const { companion } = useActiveCompanion();

  // Resolve image: explicit src > dynamic companion avatar > default Pip.
  const resolvedSrc = src ?? (dynamic && companion?.avatar_url ? companion.avatar_url : pipMascotImg);
  const resolvedAlt = alt ?? (dynamic && companion?.name ? companion.name : 'Pip the Penguin');

  return (
    <motion.img
      src={resolvedSrc}
      alt={resolvedAlt}
      width={size}
      height={size}
      loading="lazy"
      className={`select-none pointer-events-none ${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
      animate={anim.animate}
      transition={anim.transition}
    />
  );
}

