import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { evaluateAnswer } from '@/utils/fuzzyAnswerEvaluator';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

export default function ProAdvancedFill({ slide, onCorrect, onIncorrect }: Props) {
  const sentence = slide.content?.sentence || 'The quarterly report ___ submitted by Friday.';
  const correctWord = slide.content?.blankWord || slide.content?.correctAnswer || 'must be';

  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const handleSubmit = () => {
    if (!answer.trim() || result) return;
    const alternatives = (slide.content as any)?.acceptable || [correctWord];
    const isCorrect = evaluateAnswer(answer, alternatives, { hub: 'success' }).isCorrect;
    setResult(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) onCorrect();
    else onIncorrect?.();
  };

  const parts = sentence.split('___');

  return (
    <div className="flex flex-col gap-6 p-10 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full" style={{ background: '#059669' }} />
        <h2 className="text-lg font-semibold tracking-tight" style={{ color: '#1e293b' }}>
          Complete the Sentence
        </h2>
      </div>

      <div className="text-lg flex items-center gap-2 flex-wrap" style={{ color: '#334155' }}>
        <span>{parts[0]}</span>
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={result !== null}
          className="px-4 py-2 rounded-lg text-center font-medium w-40 outline-none"
          style={{
            background: '#fff',
            color: '#1e293b',
            border: `1px solid ${result === 'correct' ? '#059669' : result === 'incorrect' ? '#dc2626' : '#cbd5e1'}`,
          }}
          placeholder="..."
          autoFocus
        />
        <span>{parts[1] || ''}</span>
      </div>

      {!result && (
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="self-start px-6 py-2 rounded-lg font-medium text-sm disabled:opacity-40"
          style={{ background: '#059669', color: '#fff' }}
        >
          Verify
        </button>
      )}

      {result === 'correct' && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium" style={{ color: '#059669' }}>
          Correct. Well executed.
        </motion.p>
      )}
      {result === 'incorrect' && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm" style={{ color: '#dc2626' }}>
          The correct answer is: <strong>{correctWord}</strong>
        </motion.p>
      )}
    </div>
  );
}
