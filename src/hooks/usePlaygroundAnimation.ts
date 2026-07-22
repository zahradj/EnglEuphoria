import { useCallback, useState } from 'react';
import confetti from 'canvas-confetti';
import { useAnimationControls } from 'framer-motion';
import { usePlaygroundAudio } from '@/hooks/usePlaygroundAudio';

/**
 * Unified feedback animations for Playground games.
 * - celebrate(): confetti burst + bounce/spin scale on target + voice praise.
 * - shake(): rapid shake on target + "Try again!" voice.
 *
 * Wire `controls` to the element you want animated:
 *   const { controls, celebrate, shake, state } = usePlaygroundAnimation();
 *   <motion.div animate={controls}>...</motion.div>
 */
export function usePlaygroundAnimation() {
  const controls = useAnimationControls();
  const { playCorrect, playWrong } = usePlaygroundAudio();
  const [state, setState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const celebrate = useCallback(
    async (praise?: string) => {
      setState('correct');
      confetti({
        particleCount: 140,
        spread: 90,
        startVelocity: 45,
        origin: { y: 0.55 },
        colors: ['#FE6A2F', '#FFB703', '#FEFBDD', '#FFD166', '#06D6A0'],
      });
      playCorrect(praise ?? 'Great job!');
      await controls.start({
        scale: [1, 1.2, 1],
        rotate: [0, 360, 0],
        transition: { duration: 0.9, ease: 'easeInOut' },
      });
      setState('idle');
    },
    [controls, playCorrect],
  );

  const shake = useCallback(
    async (msg?: string) => {
      setState('wrong');
      playWrong(msg ?? 'Try again!');
      await controls.start({
        x: [-10, 10, -10, 10, -10, 10, 0],
        transition: { duration: 0.55 },
      });
      setState('idle');
    },
    [controls, playWrong],
  );

  return { controls, celebrate, shake, state };
}
