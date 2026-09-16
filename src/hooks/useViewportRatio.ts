import { useEffect, useState } from 'react';

/**
 * Live width/height ratio of the real device viewport (visualViewport when
 * available, for the same iOS Safari dynamic-toolbar reason useFrameScale
 * prefers it — window.innerHeight can lag the real usable viewport there).
 *
 * Used to letterbox the Playground classroom scene-lesson frame to the
 * SAME shape as the real device screen, instead of a fixed landscape ratio
 * — that content is built with vh/vw units meant to fill a full-viewport-
 * shaped space (the solo player, which is whatever shape the student's own
 * device happens to be), so the frame needs to track the real device shape
 * to avoid squeezing portrait-shaped content into a landscape box (or vice
 * versa) and having useFrameScale shrink it far more than necessary to
 * compensate. Reactive to resize/orientationchange so rotating the device
 * (or the manifest orientation-lock fix landing) updates it live.
 */
export function useViewportRatio(fallback = 16 / 9): number {
  const [ratio, setRatio] = useState(fallback);

  useEffect(() => {
    const compute = () => {
      const w = window.visualViewport?.width || window.innerWidth;
      const h = window.visualViewport?.height || window.innerHeight;
      if (w > 0 && h > 0) setRatio(w / h);
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('orientationchange', compute);
    window.visualViewport?.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('orientationchange', compute);
      window.visualViewport?.removeEventListener('resize', compute);
    };
  }, []);

  return ratio;
}
