import confetti from 'canvas-confetti';

export type CelebrationHub = 'playground' | 'academy' | 'professional';

export const triggerCelebration = (hub: CelebrationHub) => {
  // Haptic feedback on mobile
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }

  const duration = 3 * 1000;
  const end = Date.now() + duration;

  // PLAYGROUND: Massive, colorful "Side Cannons"
  if (hub === 'playground') {
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }

  // ACADEMY: Neon "Fireworks"
  if (hub === 'academy') {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F2FF', '#7000FF', '#FF00D6'],
      shapes: ['circle', 'square'],
    });
    // Second burst delayed
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#00F2FF', '#7000FF', '#FF00D6', '#A855F7'],
        shapes: ['circle'],
      });
    }, 600);
  }

  // PROFESSIONAL: Minimalist "Golden Shimmer"
  if (hub === 'professional') {
    confetti({
      particleCount: 80,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#D4AF37', '#F5F5F5', '#A9A9A9'],
      scalar: 0.7,
      ticks: 200,
    });
  }
};
