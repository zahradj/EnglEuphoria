import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * StepDeck — reveals a list of children one at a time with a horizontal
 * slide-in animation. Advances via internal Next / Back buttons. When the
 * learner reaches the last step and clicks Next, `onDone` fires so the
 * outer LessonShell can move to the next lesson page.
 *
 * Used inside the Playground player to walk students through story scenes
 * and stacked activities instead of scrolling through them all at once.
 */
export function StepDeck({
  items,
  onDone,
  label = "step",
  ariaLabel,
}: {
  items: ReactNode[];
  onDone?: () => void;
  label?: string;
  ariaLabel?: string;
}) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const total = items.length;
  if (total === 0) return null;
  if (total === 1) return <div className="w-full">{items[0]}</div>;

  const go = (delta: 1 | -1) => {
    const next = i + delta;
    if (next < 0) return;
    if (next >= total) {
      onDone?.();
      return;
    }
    setDir(delta);
    setI(next);
  };

  const atLast = i === total - 1;

  return (
    <section
      aria-label={ariaLabel ?? "Step-through content"}
      className="relative w-full"
    >
      {/* Progress pips */}
      <div className="mb-3 flex items-center justify-center gap-1.5">
        {items.map((_, idx) => (
          <span
            key={idx}
            aria-hidden
            className="h-1.5 rounded-full transition-all"
            style={{
              width: idx === i ? 24 : 8,
              background:
                idx <= i
                  ? "var(--playground-primary, #FE6A2F)"
                  : "color-mix(in oklab, var(--playground-primary, #FE6A2F) 20%, white)",
            }}
          />
        ))}
      </div>

      {/* Slide-in stage */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={i}
            custom={dir}
            variants={{
              enter: (d: 1 | -1) => ({ x: d * 60, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: 1 | -1) => ({ x: d * -60, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {items[i]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Local navigation */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={i === 0}
          className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-900 shadow-sm transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Previous ${label}`}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <span className="text-xs font-semibold uppercase tracking-widest text-orange-700">
          {label} {i + 1} of {total}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          className="inline-flex items-center gap-1 rounded-full px-5 py-2 text-sm font-bold text-white shadow-sm transition active:scale-95"
          style={{ background: "var(--playground-primary, #FE6A2F)" }}
          aria-label={atLast ? "Finish and continue" : `Next ${label}`}
        >
          {atLast ? "Continue" : "Next"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
