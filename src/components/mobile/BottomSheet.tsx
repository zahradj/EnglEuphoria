import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  /**
   * Snap points as fractions of viewport height (0..1), sorted ascending.
   * Example: [0.4, 0.75, 0.95] = peek / mid / full.
   * Drag below the smallest snap point closes the sheet.
   */
  snapPoints?: number[];
  /** Initial snap index when opening. Defaults to middle snap. */
  initialSnap?: number;
  /** Distance (px) past the lowest snap that triggers close on release. */
  closeThreshold?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Mobile-first bottom sheet with snap points and drag-to-close.
 *
 * - Drag the handle (or header) to resize between snap points.
 * - Release between snaps → animates to the nearest one.
 * - Release below the lowest snap (more than `closeThreshold` px) → closes.
 * - Backdrop tap closes. Esc closes. Body scroll locked while open.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onOpenChange,
  title,
  snapPoints = [0.45, 0.8],
  initialSnap,
  closeThreshold = 60,
  children,
  className,
}) => {
  const sortedSnaps = useMemo(
    () => [...snapPoints].sort((a, b) => a - b),
    [snapPoints]
  );
  const defaultIdx =
    initialSnap ?? Math.min(sortedSnaps.length - 1, Math.floor(sortedSnaps.length / 2));

  const [vh, setVh] = useState(() =>
    typeof window === "undefined" ? 800 : window.innerHeight
  );
  const [snapIdx, setSnapIdx] = useState(defaultIdx);
  // Live height in px during drag. null = use snap.
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  // Track viewport height
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset to initial snap each time it opens
  useEffect(() => {
    if (open) {
      setSnapIdx(defaultIdx);
      setDragHeight(null);
    }
  }, [open, defaultIdx]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const snapHeights = useMemo(() => sortedSnaps.map((p) => p * vh), [sortedSnaps, vh]);
  const targetHeight = dragHeight ?? snapHeights[snapIdx];
  const minSnapHeight = snapHeights[0];

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as Element).setPointerCapture?.(e.pointerId);
      startYRef.current = e.clientY;
      startHeightRef.current = snapHeights[snapIdx];
      setDragHeight(snapHeights[snapIdx]);
      setDragging(true);
    },
    [snapHeights, snapIdx]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const delta = e.clientY - startYRef.current;
      // Drag down → height shrinks, drag up → height grows
      const next = Math.max(40, Math.min(vh, startHeightRef.current - delta));
      setDragHeight(next);
    },
    [dragging, vh]
  );

  const onPointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    const current = dragHeight ?? snapHeights[snapIdx];

    // Close if dragged below the lowest snap by more than threshold
    if (current < minSnapHeight - closeThreshold) {
      setDragHeight(null);
      onOpenChange(false);
      return;
    }

    // Snap to nearest
    let nearest = 0;
    let bestDelta = Infinity;
    snapHeights.forEach((h, i) => {
      const d = Math.abs(h - current);
      if (d < bestDelta) {
        bestDelta = d;
        nearest = i;
      }
    });
    setSnapIdx(nearest);
    setDragHeight(null);
  }, [dragging, dragHeight, snapHeights, snapIdx, minSnapHeight, closeThreshold, onOpenChange]);

  if (typeof document === "undefined") return null;
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60]" aria-modal="true" role="dialog" aria-label={title}>
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity",
          dragging ? "opacity-80" : "opacity-100 animate-in fade-in-0 duration-200"
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-background rounded-t-2xl shadow-2xl border-t border-border",
          "flex flex-col will-change-[height] touch-none",
          !dragging && "transition-[height] duration-300 ease-out",
          !dragging && "animate-in slide-in-from-bottom duration-300",
          className
        )}
        style={{
          height: `${targetHeight}px`,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Drag handle area — captures pointer for resize/close */}
        <div
          className="pt-2 pb-1 px-4 cursor-grab active:cursor-grabbing select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/40" />
          {title && (
            <div className="mt-2 text-center text-sm font-semibold text-foreground">
              {title}
            </div>
          )}
        </div>

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-auto overscroll-contain">{children}</div>
      </div>
    </div>,
    document.body
  );
};
