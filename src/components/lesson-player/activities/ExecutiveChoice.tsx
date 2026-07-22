import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';

interface ExecutiveChoiceProps {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

export default function ExecutiveChoice({ slide, onCorrect, onIncorrect }: ExecutiveChoiceProps) {
  const scenario = slide.content?.caseStudy || slide.content?.prompt || slide.interaction?.data?.question || 'A key client emails requesting a deadline extension. How do you respond?';
  const options = slide.content?.options || slide.interaction?.data?.options || [
    'Sure, no problem!',
    'I understand. Let\'s discuss a revised timeline that works for both parties.',
    'That is unacceptable.',
  ];
  const correctAnswer = slide.content?.correctAnswer || slide.interaction?.data?.correct_answer || options[1];

  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleChoice = useCallback((opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);

    if (opt === correctAnswer) {
      onCorrect();
    } else {
      onIncorrect?.();
    }
  }, [answered, correctAnswer, onCorrect, onIncorrect]);

  return (
    <div className="flex flex-col gap-6 p-8 w-full">
      <h3 className="text-sm font-bold uppercase tracking-widest opacity-50">Executive Decision</h3>

      {/* Scenario card */}
      <div
        className="p-5 rounded-xl text-base leading-relaxed"
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}
      >
        {scenario}
      </div>

      {/* Client reaction */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl text-sm"
          style={{
            background: selected === correctAnswer ? '#f0fdf4' : '#fef2f2',
            border: selected === correctAnswer ? '1px solid #86efac' : '1px solid #fca5a5',
          }}
        >
          <span className="text-2xl">{selected === correctAnswer ? '😊' : '😒'}</span>
          <span>
            {selected === correctAnswer
              ? 'The client appreciates your professional and collaborative approach.'
              : 'The client appears uncomfortable with your response. A more measured tone would be more effective.'}
          </span>
        </motion.div>
      )}

      {/* Options */}
      <div className="flex flex-col gap-3">
        {options.map((opt, i) => {
          const isSelected = selected === opt;
          const isCorrectOpt = opt === correctAnswer;

          return (
            <motion.button
              key={i}
              onClick={() => handleChoice(opt)}
              disabled={answered}
              whileTap={{ scale: 0.98 }}
              className="text-left px-5 py-4 rounded-xl text-sm font-medium transition-all border-2"
              style={{
                borderColor: answered
                  ? isSelected
                    ? isCorrectOpt ? '#58CC02' : '#FF4B4B'
                    : isCorrectOpt ? '#58CC02' : '#e2e8f0'
                  : '#e2e8f0',
                background: answered && isSelected
                  ? isCorrectOpt ? '#f0fdf4' : '#fef2f2'
                  : '#fff',
                opacity: answered && !isSelected && !isCorrectOpt ? 0.4 : 1,
                color: '#1e293b',
              }}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
