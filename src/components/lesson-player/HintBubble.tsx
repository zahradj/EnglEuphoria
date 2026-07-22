/**
 * HintBubble — friendly tooltip that appears after the 1st wrong answer.
 * Uses a warm orange tone (warning, not danger) per the platform's gamification spec.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface HintBubbleProps {
  visible: boolean;
  text?: string;
  className?: string;
}

export const HintBubble: React.FC<HintBubbleProps> = ({ visible, text, className = '' }) => {
  return (
    <AnimatePresence>
      {visible && text && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          role="status"
          aria-live="polite"
          className={[
            'inline-flex items-start gap-2 px-4 py-2.5 rounded-xl max-w-md',
            'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/60',
            'text-amber-900 dark:text-amber-100 text-sm font-medium shadow-sm',
            className,
          ].join(' ')}
        >
          <Lightbulb size={18} className="text-amber-500 shrink-0 mt-0.5" aria-hidden />
          <span>{text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HintBubble;
