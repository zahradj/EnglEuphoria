import { useLayoutEffect, useState, type RefObject } from 'react';

/**
 * Measures `containerRef` and returns the largest `ratio`-shaped box (in
 * pixels) that fits inside it without exceeding either dimension --
 * "letterboxing" a fixed-aspect-ratio frame into whatever space is
 * actually available, the same way a video player sizes its player box.
 *
 * A pure-CSS `aspect-[16/9]` + `max-w-full max-h-full` on a flex item was
 * tried first and didn't hold up: the frame's only child is a
 * `position: absolute` wrapper (out of normal flow so it can be scaled
 * without affecting layout), which left the frame with no in-flow content
 * to size against and it collapsed toward zero in some browsers/layouts
 * instead of reliably resolving via the aspect-ratio + max-* algorithm.
 * Measuring explicitly and setting real pixel width/height sidesteps that
 * entirely.
 */
export function useLetterboxSize(containerRef: RefObject<HTMLElement>, ratio: number) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;
    let retryHandle: number | null = null;

    const recompute = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        retryHandle = window.requestAnimationFrame(recompute);
        return;
      }
      let w = rect.width;
      let h = w / ratio;
      if (h > rect.height) {
        h = rect.height;
        w = h * ratio;
      }
      if (!cancelled) setSize({ width: Math.floor(w), height: Math.floor(h) });
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
  }, [containerRef, ratio]);
  return size;
}
