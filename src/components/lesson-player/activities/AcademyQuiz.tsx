import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { useScaffoldedAttempts } from '../feedback/useScaffoldedAttempts';
import HintLightbulb from '../feedback/HintLightbulb';
import ReteachModal from '../feedback/ReteachModal';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

export default function AcademyQuiz({ slide, onCorrect, onIncorrect }: Props) {
  const question = slide.content?.quizQuestion || slide.content?.prompt || slide.title;
  const options = slide.content?.quizOptions || slide.content?.options?.map((o, i) => ({
    text: o,
    isCorrect: o === slide.content?.correctAnswer || i === 0,
  })) || [];
  const hint: string = (slide as any).hint || (slide.content as any)?.hint || '';
  const reteach = (slide as any).reteach || (slide.content as any)?.reteach || null;

  const [selected, setSelected] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [tried, setTried] = useState<Set<number>>(new Set());
  const attempts = useScaffoldedAttempts();

  if (!options || options.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4 text-foreground">{slide.title || 'Quiz'}</h2>
        {(slide as any).description && <p className="text-muted-foreground text-lg max-w-xl">{(slide as any).description}</p>}
        <p className="mt-8 text-sm text-amber-600 italic">Interactive data missing for this activity.</p>
      </div>
    );
  }

  const handleSelect = (idx: number) => {
    if (result === 'correct' || verifying || attempts.paused) return;
    setSelected(idx);
    setVerifying(true);

    setTimeout(() => {
      setVerifying(false);
      const isCorrect = options[idx]?.isCorrect;
      if (isCorrect) {
        setResult('correct');
        soundEffectsService.playCorrect();
        attempts.reset();
        onCorrect();
      } else {
        setResult('incorrect');
        setTried((s) => new Set(s).add(idx));
        soundEffectsService.playIncorrect();
        attempts.registerWrong();
        onIncorrect?.();
        // Let learner retry: clear selection after a beat unless reteach pauses.
        setTimeout(() => { setSelected(null); setResult(null); }, 1100);
      }
    }, 900);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-center" style={{ color: '#e2e8f0' }}>
          ⚡ {question}
        </h2>
        {attempts.strike === 'hint' && hint && <HintLightbulb hint={hint} />}
      </div>

      <div className="w-full flex flex-col gap-3">
        {options.map((opt: any, idx: number) => {
          const optText = typeof opt === 'string' ? opt : opt.text;
          let borderColor = '#6366f1';
          const isSelected = idx === selected;
          if (result && isSelected) {
            borderColor = result === 'correct' ? '#22c55e' : '#ef4444';
          } else if (tried.has(idx)) {
            borderColor = '#ef444466';
          }

          return (
            <motion.button
              key={idx}
              whileHover={selected === null && !attempts.paused ? { scale: 1.02, boxShadow: '0 0 20px rgba(99,102,241,0.5)' } : {}}
              whileTap={selected === null ? { scale: 0.98 } : {}}
              animate={result === 'incorrect' && isSelected ? { x: [0, -8, 8, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              onClick={() => handleSelect(idx)}
              disabled={attempts.paused || (verifying && !isSelected)}
              className="py-4 px-6 rounded-xl text-left text-lg font-medium transition-all relative overflow-hidden disabled:opacity-60"
              style={{
                background: isSelected ? (result === 'correct' ? '#064e3b' : result === 'incorrect' ? '#450a0a' : '#1e1b4b') : '#1e1b4b',
                color: '#e2e8f0',
                border: `2px solid ${isSelected ? borderColor : '#4338ca'}`,
              }}
            >
              <span className="relative z-10">{optText}</span>
              {isSelected && verifying && (
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.9, ease: 'linear' }}
                  className="absolute bottom-0 left-0 h-1"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {result === 'correct' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-3xl font-bold"
            style={{ color: '#22c55e' }}
          >
            ✨ Correct! +10 XP
          </motion.div>
        )}
      </AnimatePresence>

      <ReteachModal
        open={attempts.paused}
        reteach={reteach}
        fallbackHint={hint || 'Read each option carefully and look for the one that matches the rule.'}
        onResume={() => { attempts.resume(); setSelected(null); setResult(null); setTried(new Set()); }}
      />
    </div>
  );
}
