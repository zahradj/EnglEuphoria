import React, { useState, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { useScaffoldedAttempts } from '../feedback/useScaffoldedAttempts';
import HintLightbulb from '../feedback/HintLightbulb';
import ReteachModal from '../feedback/ReteachModal';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

export default function AcademySentenceUnscramble({ slide, onCorrect, onIncorrect }: Props) {
  const correctSentence = slide.content?.correctAnswer
    || slide.interaction?.data?.correct_answer
    || 'I have studied this topic before.';

  const initialWords = slide.interaction?.data?.scrambled_words
    || slide.content?.options
    || correctSentence.split(' ').sort(() => Math.random() - 0.5);

  const hint: string = (slide as any).hint || (slide.content as any)?.hint || '';
  const reteach = (slide as any).reteach || (slide.content as any)?.reteach || null;

  const [words, setWords] = useState<string[]>(initialWords);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [shake, setShake] = useState(0);
  const attempts = useScaffoldedAttempts();

  const handleSubmit = useCallback(() => {
    if (attempts.paused) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      const attempt = words.join(' ');
      const correct = attempt.toLowerCase().trim() === correctSentence.toLowerCase().trim();
      setIsCorrect(correct);
      setSubmitted(true);
      if (correct) {
        attempts.reset();
        onCorrect();
      } else {
        attempts.registerWrong();
        setShake((s) => s + 1);
        onIncorrect?.();
        // Allow another try unless the modal pauses.
        setTimeout(() => setSubmitted(false), 1100);
      }
    }, 900);
  }, [words, correctSentence, onCorrect, onIncorrect, attempts]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>
          🧩 Unscramble the Sentence
        </h2>
        {attempts.strike === 'hint' && hint && <HintLightbulb hint={hint} />}
      </div>
      <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>
        Drag the words into the correct order
      </p>

      <motion.div
        key={shake}
        animate={submitted && !isCorrect ? { x: [0, -10, 10, -8, 8, 0] } : {}}
        transition={{ duration: 0.45 }}
        className="w-full"
      >
        <Reorder.Group
          axis="x"
          values={words}
          onReorder={setWords}
          className="flex flex-wrap gap-3 justify-center mb-8 min-h-[60px]"
        >
          {words.map(word => (
            <Reorder.Item
              key={word}
              value={word}
              className="cursor-grab active:cursor-grabbing px-5 py-3 rounded-xl text-lg font-semibold select-none"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #A855F7)',
                color: '#fff',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
              }}
              whileDrag={{ scale: 1.15, boxShadow: '0 0 25px rgba(99, 102, 241, 0.7)' }}
              whileHover={{ scale: 1.05 }}
            >
              {word}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </motion.div>

      {/* Preview */}
      <div className="mb-6 px-6 py-3 rounded-xl min-w-[300px] text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.3)' }}>
        <p className="text-lg" style={{ color: '#e2e8f0' }}>{words.join(' ')}</p>
      </div>

      {(!submitted || (submitted && !isCorrect)) && !verifying && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={attempts.paused}
          className="px-8 py-3 rounded-xl text-lg font-bold disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
            color: '#fff',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
          }}
        >
          Check Answer ⚡
        </motion.button>
      )}

      {verifying && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-48 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.9 }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #06b6d4, #6366f1)' }}
            />
          </div>
          <p className="text-sm" style={{ color: '#94a3b8' }}>Verifying...</p>
        </div>
      )}

      {submitted && isCorrect && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mt-2"
        >
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-xl font-bold" style={{ color: '#10b981' }}>Correct! +10 XP</p>
        </motion.div>
      )}

      <ReteachModal
        open={attempts.paused}
        reteach={reteach}
        fallbackHint={hint || `Target sentence: "${correctSentence}"`}
        onResume={() => { attempts.resume(); setSubmitted(false); setIsCorrect(false); }}
      />
    </div>
  );
}
