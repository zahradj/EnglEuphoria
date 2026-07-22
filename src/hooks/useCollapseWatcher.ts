import { useEffect, useRef } from 'react';

/**
 * Watches an element with ResizeObserver and warns (once per collapse) if its
 * rendered width or height drops to 0 — a common symptom of a broken flex /
 * absolute parent chain (e.g. Hyperbeam mounting into a 0-height div).
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null);
 *   useCollapseWatcher(ref, 'hyperbeam-container');
 */
export function useCollapseWatcher(
  ref: React.RefObject<HTMLElement>,
  label: string,
  enabled: boolean = true,
): void {
  const collapsedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const check = (w: number, h: number) => {
      const collapsed = w === 0 || h === 0;
      if (collapsed && !collapsedRef.current) {
        collapsedRef.current = true;
        // eslint-disable-next-line no-console
        console.warn(
          `[layout] ${label} collapsed to ${w}×${h}px. ` +
            `Check that every ancestor provides a non-zero height/width ` +
            `(flex parents need h-full / flex-1, absolute children need a relative parent with size).`,
          el,
        );
      } else if (!collapsed && collapsedRef.current) {
        collapsedRef.current = false;
        // eslint-disable-next-line no-console
        console.info(`[layout] ${label} recovered to ${Math.round(w)}×${Math.round(h)}px.`);
      }
    };

    // Initial measurement (RO won't fire if size doesn't change)
    const rect = el.getBoundingClientRect();
    check(rect.width, rect.height);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        check(width, height);
      }
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [ref, label, enabled]);
}
