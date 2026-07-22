import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

const VOWEL_SOUNDS = ['a', 'e', 'i', 'o', 'u'];

export default function ArticlePicker({ slide, onCorrect, onIncorrect }: Props) {
  const noun = slide.content?.title || 'Apple';
  const imageUrl = slide.content?.imageUrl || slide.imageUrl;
  const phoneme = slide.content?.phonemeTarget || '/æ/';

  const startsWithVowelSound = VOWEL_SOUNDS.includes(noun[0].toLowerCase());
  const correctArticle = startsWithVowelSound ? 'an' : 'a';

  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handlePick = useCallback((article: string) => {
    if (completed) return;
    setSelected(article);

    if (article === correctArticle) {
      setIsCorrect(true);
      setCompleted(true);
      soundEffectsService.playCorrect();
      setTimeout(() => onCorrect(), 1200);
    } else {
      setIsCorrect(false);
      soundEffectsService.playIncorrect();
      setShowHint(true);
      setTimeout(() => { setSelected(null); setIsCorrect(null); }, 1000);
    }
  }, [completed, correctArticle, onCorrect]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center rounded-3xl p-8 bg-gradient-to-b from-background to-muted/30">
      <h2 className="text-2xl font-bold text-foreground mb-2">📝 Article Picker</h2>
      <p className="text-muted-foreground text-sm mb-6">Choose the correct article for the noun</p>

      {imageUrl && (
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={imageUrl}
          alt={noun}
          className="h-32 w-32 object-contain rounded-2xl mb-4"
        />
      )}

      {/* Sentence preview */}
      <div className="flex items-center gap-2 mb-8 text-2xl font-bold text-foreground">
        <span>It is</span>
        <span className={`px-4 py-2 rounded-xl border-2 border-dashed min-w-[60px] text-center ${
          completed ? 'border-[#4CAF50] bg-[#4CAF50]/10 text-[#2E7D32]' : 'border-[#6B21A8]/30 text-[#6B21A8]'
        }`}>
          {completed ? correctArticle : '?'}
        </span>
        <span>{noun.toLowerCase()}.</span>
      </div>

      {/* Article Choices */}
      <div className="flex gap-4">
        {['a', 'an'].map(article => {
          const isThis = selected === article;
          const bgClass = isThis
            ? isCorrect ? 'bg-[#4CAF50] text-white border-[#2E7D32] scale-110'
              : 'bg-[#EF5350] text-white border-[#C62828]'
            : 'bg-card border-[#6B21A8]/20 text-[#6B21A8] hover:bg-[#6B21A8]/5';

          return (
            <motion.button
              key={article}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePick(article)}
              disabled={completed}
              className={`h-20 w-28 rounded-2xl border-3 text-3xl font-bold transition-all ${bgClass}`}
            >
              {article}
            </motion.button>
          );
        })}
      </div>

      {/* Hint */}
      <AnimatePresence>
        {showHint && !completed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 max-w-sm text-center"
          >
            <p className="text-sm text-amber-700 dark:text-amber-300">
              💡 "{noun}" starts with the vowel sound <span className="font-mono font-bold">{phoneme}</span>.
              Vowel sounds love "<strong>an</strong>"!
            </p>
          </motion.div>
        )}
        {completed && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-lg font-bold text-[#2E7D32]">
            🎉 "It is {correctArticle} {noun.toLowerCase()}." — Perfect! +10 XP
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
