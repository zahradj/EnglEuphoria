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
/**
 * Pure orientation check, independent of device width — a portrait TABLET
 * (short side well over the 500px compact threshold, e.g. iPad Mini at
 * 744px, iPad Pro at 834-1024px) still reports true here even though
 * `useCompactVideoLayout` never fires for it. Use this whenever the
 * decision is "should the layout stack for portrait", as opposed to
 * "is this a narrow phone" (that's what `useCompactVideoLayout` answers).
 */
export function useIsPortrait(): boolean {
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

  return !!isPortrait;
}

export function useIsPortraitCompact(): boolean {
  const isCompact = useCompactVideoLayout();
  const isPortrait = useIsPortrait();
  return isCompact && isPortrait;
}
