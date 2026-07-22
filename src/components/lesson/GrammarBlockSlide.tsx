import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GrammarFormulaBar } from './GrammarFormulaBar';

interface GrammarSlot {
  label: string;
  correctAnswer: string;
  filled: string | null;
}

interface GrammarBlockSlideProps {
  grammarPattern: string;
  slots: GrammarSlot[];
  blockOptions: string[];
  imageUrl?: string;
  phonemeTarget?: string;
  vocabWord?: string;
  onComplete?: (correct: boolean) => void;
  hintActive?: boolean;
}

const SLOT_COLORS: Record<string, string> = {
  'Article': 'border-amber-400 bg-amber-50 dark:bg-amber-900/20',
  'Subject': 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
  'Noun': 'border-purple-400 bg-purple-50 dark:bg-purple-900/20',
  'Verb': 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  'Object': 'border-rose-400 bg-rose-50 dark:bg-rose-900/20',
  'Adjective': 'border-cyan-400 bg-cyan-50 dark:bg-cyan-900/20',
};

export const GrammarBlockSlide: React.FC<GrammarBlockSlideProps> = ({
  grammarPattern,
  slots: initialSlots,
  blockOptions,
  imageUrl,
  phonemeTarget,
  vocabWord,
  onComplete,
  hintActive = false,
}) => {
  const [slots, setSlots] = useState(initialSlots);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [usedBlocks, setUsedBlocks] = useState<Set<string>>(new Set());
  const [wrongBlock, setWrongBlock] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const nextEmptySlot = slots.findIndex(s => !s.filled);

  const handleBlockTap = useCallback((block: string) => {
    if (completed || usedBlocks.has(block)) return;

    const targetIdx = activeSlotIndex ?? nextEmptySlot;
    if (targetIdx < 0) return;

    const slot = slots[targetIdx];
    if (block === slot.correctAnswer) {
      const updated = slots.map((s, i) => i === targetIdx ? { ...s, filled: block } : s);
      setSlots(updated);
      setUsedBlocks(new Set([...usedBlocks, block]));
      setActiveSlotIndex(null);

      if (updated.every(s => s.filled)) {
        setCompleted(true);
        setTimeout(() => onComplete?.(true), 1200);
      }
    } else {
      setWrongBlock(block);
      // Show phonics-connected hint for article errors
      if (slot.label === 'Article' && phonemeTarget) {
        setShowHint(true);
      }
      setTimeout(() => setWrongBlock(null), 600);
    }
  }, [completed, usedBlocks, activeSlotIndex, nextEmptySlot, slots, onComplete, phonemeTarget]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      {/* Phase Label */}
      <div className="mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          Layer 3 — Grammar Structure
        </span>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-1">Building Block Sentence</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Snap the blocks into the correct slots
      </p>

      {/* Image context */}
      {imageUrl && (
        <img src={imageUrl} alt="" className="h-20 w-20 object-contain rounded-xl mb-4" />
      )}

      {/* Sentence Slots */}
      <div className="flex gap-2 flex-wrap justify-center mb-6">
        {slots.map((slot, i) => {
          const colorClass = SLOT_COLORS[slot.label] || 'border-border bg-muted/20';
          const isActive = (activeSlotIndex ?? nextEmptySlot) === i && !slot.filled;

          return (
            <motion.button
              key={i}
              onClick={() => !slot.filled && setActiveSlotIndex(i)}
              className={cn(
                'min-w-[80px] h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all',
                slot.filled
                  ? 'border-[#4CAF50] bg-[#4CAF50]/10'
                  : isActive
                  ? `${colorClass} ring-2 ring-[#6B21A8]/30 scale-105`
                  : `${colorClass} border-dashed`
              )}
            >
              <span className="text-[10px] font-medium text-muted-foreground">{slot.label}</span>
              <span className="text-lg font-bold text-foreground">{slot.filled || '?'}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Block Options */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {blockOptions.map((block, i) => {
          const used = usedBlocks.has(block);
          const isWrong = wrongBlock === block;
          const isHinted = hintActive && slots[nextEmptySlot]?.correctAnswer === block;

          return (
            <motion.button
              key={`${block}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: used ? 0.3 : 1,
                y: 0,
                scale: isHinted ? [1, 1.08, 1] : 1,
                x: isWrong ? [-3, 3, -3, 3, 0] : 0,
              }}
              transition={{ delay: i * 0.04, scale: { repeat: isHinted ? Infinity : 0, duration: 1.2 } }}
              onClick={() => handleBlockTap(block)}
              disabled={used || completed}
              className={cn(
                'px-5 py-3 rounded-xl border-2 text-lg font-bold transition-colors',
                isWrong ? 'border-[#EF5350] bg-[#EF5350]/10 text-[#C62828]'
                : isHinted ? 'border-[#4CAF50] bg-[#4CAF50]/10 text-[#2E7D32]'
                : used ? 'border-muted bg-muted/10 text-muted-foreground'
                : 'border-[#6B21A8]/20 bg-card text-[#6B21A8] hover:bg-[#6B21A8]/5'
              )}
            >
              {block}
            </motion.button>
          );
        })}
      </div>

      {/* Phonics Hint */}
      <AnimatePresence>
        {showHint && phonemeTarget && !completed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 max-w-sm text-center mb-4"
          >
            <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-1 justify-center">
              <Lightbulb className="h-4 w-4" />
              "{vocabWord}" starts with vowel sound /{phonemeTarget}/ — vowels love "an"!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-xl font-bold text-[#2E7D32] flex items-center gap-1 justify-center">
              <CheckCircle2 className="h-5 w-5" />
              "{slots.map(s => s.filled).join(' ')}"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Triple Encoding complete: Sound → Word → Sentence
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grammar Formula Bar */}
      <GrammarFormulaBar
        pattern={grammarPattern}
        activeSlotLabel={slots[nextEmptySlot]?.label}
        vocabWord={vocabWord}
        visible={!completed}
      />
    </div>
  );
};
