import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

interface GrammarSlot {
  label: string;
  correctAnswer: string;
  filled: string | null;
}

const SLOT_COLORS: Record<string, string> = {
  'Article': 'border-amber-400 bg-amber-50 dark:bg-amber-900/20',
  'Subject': 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
  'Noun': 'border-purple-400 bg-purple-50 dark:bg-purple-900/20',
  'Verb': 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  'Object': 'border-rose-400 bg-rose-50 dark:bg-rose-900/20',
};

export default function GrammarBlocks({ slide, onCorrect, onIncorrect }: Props) {
  const pattern = slide.content?.grammarPattern || 'Article + Noun + Verb';
  const imageUrl = slide.content?.imageUrl || slide.imageUrl;

  const initialSlots: GrammarSlot[] = slide.content?.grammarSlots || [
    { label: 'Subject', correctAnswer: 'It', filled: null },
    { label: 'Verb', correctAnswer: 'is', filled: null },
    { label: 'Article', correctAnswer: 'an', filled: null },
    { label: 'Noun', correctAnswer: 'apple', filled: null },
  ];

  const blockOptions = slide.content?.grammarBlocks || ['It', 'is', 'an', 'a', 'apple', 'the'];

  const [slots, setSlots] = useState(initialSlots);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [usedBlocks, setUsedBlocks] = useState<Set<string>>(new Set());
  const [wrongBlock, setWrongBlock] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [hintBlock, setHintBlock] = useState<string | null>(null);

  // Auto-select the first empty slot
  const nextEmptySlot = slots.findIndex(s => !s.filled);

  const handleBlockTap = useCallback((block: string) => {
    if (completed || usedBlocks.has(block)) return;

    const targetSlotIndex = activeSlotIndex ?? nextEmptySlot;
    if (targetSlotIndex < 0) return;

    const slot = slots[targetSlotIndex];
    if (block === slot.correctAnswer) {
      soundEffectsService.playCorrect();
      const updated = slots.map((s, i) => i === targetSlotIndex ? { ...s, filled: block } : s);
      setSlots(updated);
      setUsedBlocks(new Set([...usedBlocks, block]));
      setActiveSlotIndex(null);

      if (updated.every(s => s.filled)) {
        setCompleted(true);
        setTimeout(() => onCorrect(), 1200);
      }
    } else {
      setWrongBlock(block);
      soundEffectsService.playIncorrect();
      setTimeout(() => setWrongBlock(null), 600);
    }
  }, [completed, usedBlocks, activeSlotIndex, nextEmptySlot, slots, onCorrect]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center rounded-3xl p-6 bg-gradient-to-b from-background to-muted/30">
      <h2 className="text-2xl font-bold text-foreground mb-1">🧱 Grammar Blocks</h2>
      <p className="text-muted-foreground text-sm mb-2">Build the sentence by snapping blocks into slots</p>
      <p className="text-xs font-mono text-[#6B21A8]/60 mb-6">Pattern: {pattern}</p>

      {imageUrl && (
        <img src={imageUrl} alt="" className="h-20 w-20 object-contain rounded-xl mb-4" />
      )}

      {/* Sentence Slots */}
      <div className="flex gap-2 flex-wrap justify-center mb-8">
        {slots.map((slot, i) => {
          const colorClass = SLOT_COLORS[slot.label] || 'border-border bg-muted/20';
          const isActive = (activeSlotIndex ?? nextEmptySlot) === i && !slot.filled;

          return (
            <motion.button
              key={i}
              onClick={() => !slot.filled && setActiveSlotIndex(i)}
              className={`min-w-[80px] h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                slot.filled
                  ? 'border-[#4CAF50] bg-[#4CAF50]/10'
                  : isActive
                  ? `${colorClass} ring-2 ring-[#6B21A8]/30 scale-105`
                  : `${colorClass} border-dashed`
              }`}
            >
              <span className="text-[10px] font-medium text-muted-foreground">{slot.label}</span>
              <span className="text-lg font-bold text-foreground">{slot.filled || '?'}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Block Options */}
      <div className="flex flex-wrap gap-2 justify-center">
        {blockOptions.map((block, i) => {
          const used = usedBlocks.has(block);
          const isWrong = wrongBlock === block;
          const isHint = hintBlock === block;

          return (
            <motion.button
              key={`${block}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: used ? 0.3 : 1,
                y: 0,
                scale: isHint ? [1, 1.1, 1] : 1,
                x: isWrong ? [-3, 3, -3, 3, 0] : 0,
              }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleBlockTap(block)}
              disabled={used || completed}
              className={`px-5 py-3 rounded-xl border-2 text-lg font-bold transition-colors ${
                isWrong ? 'border-[#EF5350] bg-[#EF5350]/10 text-[#C62828]'
                : isHint ? 'border-[#4CAF50] bg-[#4CAF50]/10 text-[#2E7D32] animate-pulse'
                : used ? 'border-muted bg-muted/10 text-muted-foreground'
                : 'border-[#6B21A8]/20 bg-card text-[#6B21A8] hover:bg-[#6B21A8]/5'
              }`}
            >
              {block}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-xl font-bold text-[#2E7D32]">🎉 "{slots.map(s => s.filled).join(' ')}"</p>
            <p className="text-sm text-[#2E7D32]/80">Perfect sentence! +15 XP</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
