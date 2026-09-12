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
