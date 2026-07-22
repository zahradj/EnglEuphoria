import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { useScaffoldedAttempts } from '../feedback/useScaffoldedAttempts';
import HintLightbulb from '../feedback/HintLightbulb';
import ReteachModal from '../feedback/ReteachModal';
import { evaluateAnswer } from '@/utils/fuzzyAnswerEvaluator';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

export default function AcademyFillBlanks({ slide, onCorrect, onIncorrect }: Props) {
  const sentence = slide.content?.sentence || 'She ___ a student.';
  const correctWord = slide.content?.blankWord || slide.content?.correctAnswer || 'is';
  const hint: string = (slide as any).hint || (slide.content as any)?.hint || '';
  const reteach = (slide as any).reteach || (slide.content as any)?.reteach || null;

  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [shake, setShake] = useState(0);
  const attempts = useScaffoldedAttempts();

  const handleSubmit = () => {
    if (!answer.trim() || result === 'correct' || attempts.paused) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      const alternatives = (slide.content as any)?.acceptable || [correctWord];
      const isCorrect = evaluateAnswer(answer, alternatives, { hub: 'academy' }).isCorrect;
      if (isCorrect) {
        setResult('correct');
        soundEffectsService.playCorrect();
        attempts.reset();
        onCorrect();
      } else {
        setResult('incorrect');
        soundEffectsService.playIncorrect();
        attempts.registerWrong();
        setShake((s) => s + 1);
        onIncorrect?.();
      }
    }, 800);
  };

  const parts = sentence.split('___');
  const borderColor =
    result === 'correct' ? '#22c55e' :
    result === 'incorrect' ? '#ef4444' : '#6366f1';

  return (
    <div className="flex flex-col items-center gap-8 p-8 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>✍️ Fill in the Blank</h2>

      <motion.div
        key={shake}
        animate={result === 'incorrect' ? { x: [0, -10, 10, -8, 8, 0] } : {}}
        transition={{ duration: 0.45 }}
        className="text-xl flex items-center gap-2 flex-wrap justify-center"
        style={{ color: '#cbd5e1' }}
      >
        <span>{parts[0]}</span>
        <input
          value={answer}
          onChange={(e) => { setAnswer(e.target.value); if (result === 'incorrect') setResult(null); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={result === 'correct' || attempts.paused}
          className="px-4 py-2 rounded-lg text-center text-lg font-bold w-36 outline-none"
          style={{ background: '#1e1b4b', color: '#e2e8f0', border: `2px solid ${borderColor}` }}
          placeholder="..."
          autoFocus
        />
        <span>{parts[1] || ''}</span>
        {attempts.strike === 'hint' && hint && <HintLightbulb hint={hint} />}
      </motion.div>

      {result !== 'correct' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={verifying || attempts.paused}
          className="px-8 py-3 rounded-xl font-bold text-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff' }}
        >
          {verifying ? 'Verifying...' : 'Check'}
        </motion.button>
      )}

      {result === 'correct' && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold" style={{ color: '#22c55e' }}>
          ✨ Correct! +10 XP
        </motion.p>
      )}

      <ReteachModal
        open={attempts.paused}
        reteach={reteach}
        fallbackHint={hint || `The answer is "${correctWord}".`}
        onResume={() => { attempts.resume(); setResult(null); setAnswer(''); }}
      />
    </div>
  );
}
