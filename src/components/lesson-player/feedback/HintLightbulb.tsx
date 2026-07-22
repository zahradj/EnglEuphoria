import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface Props {
  hint: string;
  /** Auto-open on mount (strike 2). Defaults to true so the learner sees it immediately. */
  autoOpen?: boolean;
  className?: string;
}

/**
 * Strike-2 affordance — a pulsing lightbulb that surfaces the slide's `hint`
 * string in a small tooltip-style bubble. Uses semantic tokens only.
 */
export default function HintLightbulb({ hint, autoOpen = true, className = '' }: Props) {
  const [open, setOpen] = useState(autoOpen);

  if (!hint) return null;

  return (
    <div className={`relative inline-flex ${className}`}>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-warning/15 text-warning border-2 border-warning/40 hover:bg-warning/25 transition"
        aria-label="Show hint"
      >
        <Lightbulb className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 w-64 px-4 py-3 rounded-xl bg-popover text-popover-foreground border border-border shadow-lg text-sm leading-snug"
            role="tooltip"
          >
            <div className="font-semibold mb-1 text-warning">💡 Hint</div>
            {hint}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
