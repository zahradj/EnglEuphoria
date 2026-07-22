import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartSummaryTipProps {
  sessionContext: Record<string, any>;
}

const getTip = (ctx: Record<string, any>): string => {
  const level = ctx?.level || 'playground';
  const mistake = ctx?.lastMistake;

  if (mistake) {
    return `Correction tip: "${mistake}" — try rephrasing for accuracy.`;
  }

  if (level === 'playground') return "Try saying 'I have a cat' instead of 'I have cat'!";
  if (level === 'academy') return "Pro Tip: Use transition words like 'Furthermore' or 'However'.";
  return "Try structuring answers with 'Firstly… Secondly… In conclusion'.";
};

export const SmartSummaryTip: React.FC<SmartSummaryTipProps> = ({ sessionContext }) => {
  const [showTip, setShowTip] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    setShowTip(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowTip(false), 6000);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="absolute bottom-6 left-6 z-20">
      <button
        onClick={handleClick}
        className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-amber-400 hover:text-amber-300 hover:scale-110 transition-transform shadow-lg"
        title="Smart Summary"
      >
        <Sparkles className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute bottom-12 left-0 w-64 glass-panel rounded-xl p-3 shadow-2xl"
            onClick={() => setShowTip(false)}
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-200 leading-relaxed">
                {getTip(sessionContext)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
