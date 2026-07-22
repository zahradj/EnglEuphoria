import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CanvasLessonPlayer } from './CanvasLessonPlayer';
import type { Slide } from '@/components/admin/lesson-builder/types';

interface CanvasLessonPlayerModalProps {
  isOpen: boolean;
  slides: Slide[];
  lessonTitle?: string;
  onClose: () => void;
  onComplete?: (score: number) => void;
}

export const CanvasLessonPlayerModal: React.FC<CanvasLessonPlayerModalProps> = ({
  isOpen,
  slides,
  lessonTitle,
  onClose,
  onComplete,
}) => {
  if (!isOpen || slides.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <CanvasLessonPlayer
          slides={slides}
          lessonTitle={lessonTitle}
          onClose={onClose}
          onComplete={(score) => {
            onComplete?.(score);
            onClose();
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};
