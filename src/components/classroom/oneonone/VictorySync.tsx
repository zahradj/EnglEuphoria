import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, PartyPopper } from 'lucide-react';

interface VictorySyncProps {
  show: boolean;
  studentName: string;
  onDismiss?: () => void;
}

const CONFETTI_COLORS = ['#6B21A8', '#2E7D32', '#F59E0B', '#EF5350', '#3B82F6', '#8B5CF6'];

const ConfettiPiece: React.FC<{ delay: number; color: string }> = ({ delay, color }) => (
  <motion.div
    className="absolute w-3 h-3 rounded-sm"
    style={{ backgroundColor: color }}
    initial={{
      x: Math.random() * 400 - 200,
      y: -20,
      rotate: 0,
      opacity: 1,
    }}
    animate={{
      y: 400,
      rotate: Math.random() * 720 - 360,
      opacity: 0,
    }}
    transition={{
      duration: 2 + Math.random(),
      delay,
      ease: 'easeOut',
    }}
  />
);

export const VictorySync: React.FC<VictorySyncProps> = ({
  show,
  studentName,
  onDismiss,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        >
          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center">
            {Array.from({ length: 30 }).map((_, i) => (
              <ConfettiPiece
                key={i}
                delay={i * 0.05}
                color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
              />
            ))}
          </div>

          {/* Victory card */}
          <motion.div
            className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-4 relative z-10"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <PartyPopper className="h-16 w-16 text-[#F59E0B] mx-auto mb-4" />
            </motion.div>

            <h2 className="text-2xl font-bold text-[#6B21A8] font-inter">
              🌟 Perfect Score! 🌟
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {studentName} nailed the Production Phase!
            </p>

            <motion.div
              className="mt-4 flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Sparkles className="h-5 w-5 text-[#2E7D32]" />
              <span className="text-sm font-medium text-[#2E7D32]">
                The II Wizard is doing a backflip! 🤸
              </span>
            </motion.div>

            <p className="text-xs text-muted-foreground mt-4">
              Tap anywhere to continue
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
