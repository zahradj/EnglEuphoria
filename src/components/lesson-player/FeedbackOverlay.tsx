import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import PipMascot from './PipMascot';
import { Check, X } from 'lucide-react';

interface FeedbackOverlayProps {
  visible: boolean;
  correct: boolean;
  solution?: string;
  hub: HubType;
  onContinue: () => void;
}

const FEEDBACK_THEMES = {
  playground: {
    correctBg: '#d7ffb8', correctText: '#1a7a00', correctBtn: '#58CC02', correctBtnShadow: '0 4px 0 #46a302',
    wrongBg: '#ffdfe0', wrongText: '#c0392b', wrongBtn: '#FF4B4B', wrongBtnShadow: '0 4px 0 #cc3333',
  },
  academy: {
    correctBg: 'linear-gradient(135deg, #1a1040 0%, #2d1b69 100%)', correctText: '#a78bfa', correctBtn: '#7c3aed', correctBtnShadow: '0 4px 0 #5b21b6, 0 0 20px rgba(139,92,246,0.4)',
    wrongBg: 'linear-gradient(135deg, #2d1525 0%, #4a1942 100%)', wrongText: '#f472b6', wrongBtn: '#ec4899', wrongBtnShadow: '0 4px 0 #be185d',
  },
  professional: {
    correctBg: '#f0fdf4', correctText: '#166534', correctBtn: '#1e293b', correctBtnShadow: '0 4px 0 #0f172a',
    wrongBg: '#fef2f2', wrongText: '#991b1b', wrongBtn: '#1e293b', wrongBtnShadow: '0 4px 0 #0f172a',
  },
};

const MESSAGES = {
  playground: {
    correct: ['Superstar! 🌟', 'Amazing! 🎉', "You're brilliant! ✨", 'Woohoo! 🎊'],
    wrong: ['Almost there! 💪', "Don't give up!", 'Try again next time! 🌈'],
  },
  academy: {
    correct: ['Nailed it! ⚡', 'Perfect execution!', 'XP gained! 🔥', 'Flawless! 💎'],
    wrong: ['Not quite — review this one.', 'Incorrect — study the answer.', 'Close — keep grinding!'],
  },
  professional: {
    correct: ['Correct.', 'Well done.', 'Accurate response.'],
    wrong: ['Incorrect.', 'Review the correct answer below.', 'Not quite right.'],
  },
};

export default function FeedbackOverlay({ visible, correct, solution, hub, onContinue }: FeedbackOverlayProps) {
  const theme = FEEDBACK_THEMES[hub];
  const msgs = MESSAGES[hub];

  const message = useMemo(() => {
    const pool = correct ? msgs.correct : msgs.wrong;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [correct, hub]);

  const bg = correct ? theme.correctBg : theme.wrongBg;
  const textColor = correct ? theme.correctText : theme.wrongText;
  const btnBg = correct ? theme.correctBtn : theme.wrongBtn;
  const btnShadow = correct ? theme.correctBtnShadow : theme.wrongBtnShadow;
  const isGradientBg = bg.includes('gradient');

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 160 }}
          animate={{ y: 0 }}
          exit={{ y: 160 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div
            className="w-full px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            style={{
              background: isGradientBg ? bg : undefined,
              backgroundColor: !isGradientBg ? bg : undefined,
            }}
          >
            <div className="max-w-[720px] mx-auto flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {hub === 'professional' ? (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: correct ? '#dcfce7' : '#fee2e2' }}>
                    {correct ? <Check size={16} style={{ color: textColor }} /> : <X size={16} style={{ color: textColor }} />}
                  </div>
                ) : hub === 'playground' ? (
                  <PipMascot size={40} animation={correct ? 'celebrate' : 'idle'} />
                ) : (
                  <motion.span className="text-2xl" animate={correct ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                    {correct ? '⚡' : '💀'}
                  </motion.span>
                )}
                <span className="font-bold text-lg" style={{ color: textColor }}>{message}</span>
              </div>

              {!correct && solution && (
                <p className="text-sm ml-11" style={{ color: textColor, opacity: 0.8 }}>
                  Correct answer: <strong>{solution}</strong>
                </p>
              )}

              <button
                onClick={onContinue}
                className="mt-2 w-full py-3 rounded-2xl font-bold text-base uppercase tracking-wide text-white transition-all"
                style={{ background: btnBg, boxShadow: btnShadow }}
              >
                Continue
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
