import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onStart: () => void;
}

/**
 * Pip-led intro popup that frames the in-lesson Confidence Builder as a
 * supportive bonus round rather than a punishment. Sits in front of the
 * dynamically injected simplified activity (e.g. matching_pairs).
 */
export default function ConfidenceBuilderIntro({ open, onStart }: Props) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-md w-full rounded-2xl border-2 border-primary/30 bg-card p-8 text-center shadow-2xl"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Bonus practice round!</h2>
        <p className="mt-3 text-muted-foreground">
          Pip noticed this one is tricky. Let's try one more practice game together to make sure we've got it.
        </p>
        <Button
          onClick={onStart}
          className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90"
          size="lg"
        >
          Let's go!
        </Button>
      </motion.div>
    </motion.div>
  );
}
