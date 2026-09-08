import { useLayoutEffect, useState, type RefObject } from 'react';

/**
 * Playground scene content is built with `vh`/`vw` units sized for the
 * full-screen solo player — those units always resolve against the real
 * browser viewport, never a containing element, no matter how deeply
 * nested. Any place that embeds that content in a smaller frame (a
 * classroom stage card, a modal, a trial-flow panel) needs to shrink the
 * whole subtree to match, or the content renders far too large for its
 * frame and can clip. Measuring the actual frame size and scaling down
 * keeps every scene's existing vh/vw sizing correct relative to its real
 * container instead of the browser window.
 *
 * Tablet classrooms were reported showing only part of the lesson (the
 * rest cut off) — the classroom chrome (sidebar, header, dock) eats a far
 * bigger share of a tablet's smaller screen than a desktop monitor's, so
 * the frame's own aspect ratio diverges much more sharply from the
 * device's, and this hook's very first paint used the default `scale=1`
 * (i.e. unscaled) until its effect could measure the real frame — a
 * window where full-viewport-sized (100vh/100vw) content already
 * overflowed the frame's `overflow-hidden` bounds, clipping it. Fixed by
 * measuring synchronously before paint (useLayoutEffect, not useEffect)
 * and retrying on the next animation frame if the very first read comes
 * back zero-sized (layout not settled yet), instead of silently giving up
 * until some later resize/observer event happened to fire.
 */
export function useFrameScale(frameRef: RefObject<HTMLElement>) {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    let cancelled = false;
    let retryHandle: number | null = null;

    const recompute = () => {
      const rect = el.getBoundingClientRect();
      // iOS/iPadOS Safari's dynamic toolbar means window.innerHeight can lag
      // the real usable viewport — visualViewport tracks it accurately when
      // available.
      const vw = window.visualViewport?.width || window.innerWidth;
      const vh = window.visualViewport?.height || window.innerHeight;
      if (rect.width <= 0 || rect.height <= 0 || vw <= 0 || vh <= 0) {
        // Layout hasn't settled yet (common right after mount inside a
        // freshly-scaled/absolutely-positioned classroom stage) — try again
        // next frame instead of leaving scale stuck at its unscaled default.
        retryHandle = window.requestAnimationFrame(recompute);
        return;
      }
      const s = Math.min(rect.width / vw, rect.height / vh, 1);
      if (!cancelled && Number.isFinite(s) && s > 0) setScale(s);
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    window.addEventListener('resize', recompute);
    window.visualViewport?.addEventListener('resize', recompute);
    return () => {
      cancelled = true;
      if (retryHandle !== null) window.cancelAnimationFrame(retryHandle);
      ro.disconnect();
      window.removeEventListener('resize', recompute);
      window.visualViewport?.removeEventListener('resize', recompute);
    };
  }, [frameRef]);
  return scale;
}
