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
// The scene art itself is drawn/exported at ~16:9 (MainStage's own
// STAGE_CONTENT_RATIO). Tracking the real device ratio fixed portrait
// phones/tablets, but on a landscape desktop it means the frame's shape
// is only as wide as whatever THAT monitor happens to be — a wider-than-
// 16:9 external/ultrawide monitor stretches the frame beyond what the art
// was ever drawn for, and bg-cover crops proportionally more to fill it
// (reported live as "the lesson looks more zoomed in on my big monitor
// than my laptop"). Capping the tracked ratio at 16:9 keeps every
// landscape desktop consistent regardless of that monitor's own native
// shape, while ratios at or below it (portrait devices, and any
// close-to-16:9 desktop) still pass through real and untouched.
const MAX_LANDSCAPE_RATIO = 16 / 9;

export function useViewportRatio(fallback = 16 / 9): number {
  const [ratio, setRatio] = useState(fallback);

  useEffect(() => {
    const compute = () => {
      const w = window.visualViewport?.width || window.innerWidth;
      const h = window.visualViewport?.height || window.innerHeight;
      if (w > 0 && h > 0) setRatio(Math.min(w / h, MAX_LANDSCAPE_RATIO));
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
