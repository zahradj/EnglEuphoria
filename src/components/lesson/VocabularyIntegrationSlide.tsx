import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VocabularyIntegrationSlideProps {
  targetWord: string;
  phonemeTarget: string;
  targetLetterIndex: number;
  imageUrl?: string;
  onComplete?: (correct: boolean) => void;
}

export const VocabularyIntegrationSlide: React.FC<VocabularyIntegrationSlideProps> = ({
  targetWord,
  phonemeTarget,
  targetLetterIndex,
  imageUrl,
  onComplete,
}) => {
  const letters = targetWord.split('');
  const [tapped, setTapped] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleLetterTap = useCallback((index: number) => {
    if (completed) return;
    setTapped(index);
    setAttempts(prev => prev + 1);

    if (index === targetLetterIndex) {
      setCorrect(true);
      setCompleted(true);
      setTimeout(() => onComplete?.(true), 1200);
    } else {
      setCorrect(false);
      setTimeout(() => { setTapped(null); setCorrect(null); }, 700);
    }
  }, [completed, targetLetterIndex, onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      {/* Phase Label */}
      <div className="mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          Layer 2 — Vocabulary Integration
        </span>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-1">Sound-to-Letter Match</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Tap the letter that makes the <span className="font-mono font-bold text-[#6B21A8]">/{phonemeTarget}/</span> sound
      </p>

      {/* Flat 2.0 Asset */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="h-36 w-36 rounded-2xl border-4 border-[#6B21A8]/10 bg-white flex items-center justify-center mb-6 overflow-hidden shadow-sm"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={targetWord} className="h-full w-full object-contain p-3" />
        ) : (
          <span className="text-7xl">🍎</span>
        )}
      </motion.div>

      {/* Word with Tappable Letter Segments */}
      <div className="flex gap-1 mb-6">
        {letters.map((letter, i) => {
          const isSelected = tapped === i;
          const bgClass = isSelected
            ? correct
              ? 'border-[#4CAF50] bg-[#4CAF50]/10 text-[#2E7D32] scale-110 ring-2 ring-[#4CAF50]/30'
              : 'border-[#EF5350] bg-[#EF5350]/10 text-[#C62828]'
            : 'border-border bg-card text-foreground hover:border-[#6B21A8]/40';

          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLetterTap(i)}
              disabled={completed}
              className={cn(
                'h-16 w-14 rounded-xl border-2 text-3xl font-bold transition-all',
                bgClass
              )}
            >
              {letter}
            </motion.button>
          );
        })}
      </div>

      {/* TTS Pronunciation Button */}
      {completed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6B21A8]/10 text-[#6B21A8] font-medium mb-4"
        >
          <Volume2 className="h-4 w-4" />
          Listen: "{targetWord}"
        </motion.button>
      )}

      {/* Success Feedback */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-lg font-bold text-[#2E7D32] flex items-center gap-1 justify-center">
              <CheckCircle2 className="h-5 w-5" />
              The letter "{letters[targetLetterIndex]}" makes the /{phonemeTarget}/ sound!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Memory encoding: sound → letter → word
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attempt counter */}
      {attempts > 1 && !completed && (
        <p className="text-xs text-muted-foreground mt-4">
          Attempt {attempts} — listen to the sound and try again
        </p>
      )}
    </div>
  );
};
