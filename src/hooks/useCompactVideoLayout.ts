import * as React from "react";

// Phones (any orientation) have a short side around 375-430px; even the
// smallest real tablets (e.g. iPad Mini, 744x1133) have a short side well
// above 600px. Keying off the SHORTER dimension instead of raw viewport
// width (like the generic `md` breakpoint) is what correctly separates a
// portrait tablet — whose width alone can dip under 768px — from a phone,
// in either orientation.
const COMPACT_LAYOUT_MAX_SHORT_SIDE = 500;

export function useCompactVideoLayout() {
  const [isCompact, setIsCompact] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const compute = () => {
      const shortSide = Math.min(window.innerWidth, window.innerHeight);
      setIsCompact(shortSide < COMPACT_LAYOUT_MAX_SHORT_SIDE);
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, []);

  return !!isCompact;
}

/**
 * Compact AND taller than wide — a phone or portrait tablet specifically,
 * not a landscape phone (which is also "compact" by short-side but wide
 * enough that floating the video strip over a corner of the lesson still
 * leaves the lesson usable). Used to switch the compact video strip from
 * floating-over-the-lesson to docked-above-the-lesson: per direct report,
 * the floating strip plus the classroom stage's own letterboxing left the
 * lesson content looking wrong on portrait phones/tablets specifically —
 * landscape is left on the existing floating behavior.
 */
export function useIsPortraitCompact(): boolean {
  const isCompact = useCompactVideoLayout();
  const [isPortrait, setIsPortrait] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const compute = () => setIsPortrait(window.innerHeight > window.innerWidth);
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, []);

  return isCompact && !!isPortrait;
}
