import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { ArrowRight, RotateCcw } from 'lucide-react';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

export default function SentenceTransform({ slide, onCorrect, onIncorrect }: Props) {
  const original = slide.content?.originalSentence || 'It is an apple.';
  const targetType = slide.content?.transformType || 'question';
  const correctAnswer: string[] = slide.content?.correctTransform || ['Is', 'it', 'an', 'apple', '?'];
  const scrambledWords = [...correctAnswer].sort(() => Math.random() - 0.5);

  const [availableWords, setAvailableWords] = useState(scrambledWords);
  const [builtSentence, setBuiltSentence] = useState<string[]>([]);
  const [wrongShake, setWrongShake] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleWordTap = useCallback((word: string, index: number) => {
    if (completed) return;

    const nextCorrect = correctAnswer[builtSentence.length];
    if (word === nextCorrect) {
      const newBuilt = [...builtSentence, word];
      setBuiltSentence(newBuilt);
      setAvailableWords(prev => prev.filter((_, i) => i !== index));
      soundEffectsService.playCorrect();

      if (newBuilt.length === correctAnswer.length) {
        setCompleted(true);
        setTimeout(() => onCorrect(), 1200);
      }
    } else {
      setWrongShake(true);
      soundEffectsService.playIncorrect();
      setTimeout(() => setWrongShake(false), 500);
    }
  }, [builtSentence, correctAnswer, completed, onCorrect]);

  const handleReset = useCallback(() => {
    setBuiltSentence([]);
    setAvailableWords([...correctAnswer].sort(() => Math.random() - 0.5));
  }, [correctAnswer]);

  const transformLabel = targetType === 'question' ? '❓ Question' : '🚫 Negative';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center rounded-3xl p-8 bg-gradient-to-b from-background to-muted/30">
      <h2 className="text-2xl font-bold text-foreground mb-2">🔄 Sentence Transform</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Change the statement into a <span className="font-bold">{transformLabel}</span>
      </p>

      {/* Original sentence */}
      <div className="px-6 py-3 rounded-xl bg-[#6B21A8]/5 border border-[#6B21A8]/10 mb-4">
        <p className="text-lg font-bold text-[#6B21A8]">📖 {original}</p>
      </div>

      <div className="flex items-center gap-2 mb-6 text-muted-foreground">
        <ArrowRight className="h-4 w-4" />
        <span className="text-sm">Transform into: {transformLabel}</span>
      </div>

      {/* Built sentence */}
      <motion.div
        animate={wrongShake ? { x: [-4, 4, -4, 4, 0] } : {}}
        transition={{ duration: 0.3 }}
        className="flex gap-1 flex-wrap justify-center min-h-[50px] px-4 py-3 rounded-xl border-2 border-dashed border-[#6B21A8]/20 bg-muted/10 mb-6 max-w-md w-full"
      >
        {builtSentence.length === 0 ? (
          <span className="text-muted-foreground text-sm">Tap words below to build your answer...</span>
        ) : (
          builtSentence.map((word, i) => (
            <span key={i} className="px-3 py-1 rounded-lg bg-[#4CAF50]/10 text-[#2E7D32] font-bold text-lg border border-[#4CAF50]/20">
              {word}
            </span>
          ))
        )}
      </motion.div>

      {/* Available words */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {availableWords.map((word, i) => (
          <motion.button
            key={`${word}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleWordTap(word, i)}
            className="px-4 py-2 rounded-xl border-2 border-[#6B21A8]/20 bg-card text-lg font-bold text-[#6B21A8] hover:bg-[#6B21A8]/5"
          >
            {word}
          </motion.button>
        ))}
      </div>

      {builtSentence.length > 0 && !completed && (
        <button onClick={handleReset} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      )}

      <AnimatePresence>
        {completed && (
          <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 text-xl font-bold text-[#2E7D32]">
            🎉 "{builtSentence.join(' ')}" — Perfect transform! +15 XP
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
