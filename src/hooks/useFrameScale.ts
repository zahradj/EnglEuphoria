import { useEffect, useState, type RefObject } from 'react';

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
 */
export function useFrameScale(frameRef: RefObject<HTMLElement>) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const recompute = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0 || window.innerWidth <= 0 || window.innerHeight <= 0) return;
      const s = Math.min(rect.width / window.innerWidth, rect.height / window.innerHeight, 1);
      if (Number.isFinite(s) && s > 0) setScale(s);
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    window.addEventListener('resize', recompute);
    return () => { ro.disconnect(); window.removeEventListener('resize', recompute); };
  }, [frameRef]);
  return scale;
}
