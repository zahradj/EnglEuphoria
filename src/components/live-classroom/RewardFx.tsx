import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface Props {
  registerRewardHandler: (h: () => void) => () => void;
}

export function RewardFx({ registerRewardHandler }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const off = registerRewardHandler(() => {
      // Confetti burst
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
        scalar: 1.1,
      });
      // Ta-da sound
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio('/sounds/tada.mp3');
          audioRef.current.volume = 0.7;
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => { /* autoplay gated */ });
      } catch { /* noop */ }
    });
    return off;
  }, [registerRewardHandler]);

  return null;
}
