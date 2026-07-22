import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GrammarFormulaBarProps {
  pattern: string;
  activeSlotLabel?: string;
  vocabWord?: string;
  visible?: boolean;
}

export const GrammarFormulaBar: React.FC<GrammarFormulaBarProps> = ({
  pattern,
  activeSlotLabel,
  vocabWord,
  visible = true,
}) => {
  const parts = pattern.split('+').map(p => p.trim());

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4"
        >
          <div className="max-w-lg mx-auto bg-card border border-border rounded-2xl shadow-lg px-6 py-3">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 text-center">
              Grammar Pattern
            </p>
            <div className="flex items-center justify-center gap-2">
              {parts.map((part, i) => {
                const isActive = part === activeSlotLabel;
                const isVocab = vocabWord && part === 'Noun';

                return (
                  <React.Fragment key={part}>
                    <motion.div
                      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-sm font-bold transition-all',
                        isActive
                          ? 'border-[#6B21A8] bg-[#6B21A8]/10 text-[#6B21A8] ring-1 ring-[#6B21A8]/20'
                          : 'border-border bg-muted/30 text-muted-foreground'
                      )}
                    >
                      {part}
                      {isVocab && vocabWord && (
                        <span className="text-[10px] block text-muted-foreground font-normal">
                          ({vocabWord})
                        </span>
                      )}
                    </motion.div>
                    {i < parts.length - 1 && (
                      <span className="text-muted-foreground font-bold text-lg">+</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
