import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

export type ReteachPayload =
  | { kind: 'grammar_matrix'; payload: any }
  | { kind: 'vocab_flashcard'; payload: any }
  | { kind: 'text'; payload: { title?: string; body: string } };

interface Props {
  open: boolean;
  reteach?: ReteachPayload | null;
  /** Optional fallbacks pulled from the lesson context. */
  fallbackHint?: string;
  onResume: () => void;
}

/**
 * Strike-3 modal — pauses the activity and re-teaches the underlying concept
 * (grammar matrix or vocab flashcard) before letting the learner resume.
 */
export default function ReteachModal({ open, reteach, fallbackHint, onResume }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="w-full max-w-lg rounded-3xl bg-card text-card-foreground border-2 border-primary/30 shadow-2xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Let's quickly review this together</h3>
                <p className="text-sm text-muted-foreground">No worries — small reset, then we keep going.</p>
              </div>
            </div>

            <ReteachBody reteach={reteach} fallbackHint={fallbackHint} />

            <button
              type="button"
              onClick={onResume}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition"
            >
              <Sparkles className="w-4 h-4" />
              I understand — let's try again
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ReteachBody({
  reteach,
  fallbackHint,
}: { reteach?: ReteachPayload | null; fallbackHint?: string }) {
  if (!reteach) {
    return (
      <p className="text-base text-muted-foreground">
        {fallbackHint || 'Take a breath, read the prompt once more, and give it another go.'}
      </p>
    );
  }

  if (reteach.kind === 'grammar_matrix') {
    const m = reteach.payload || {};
    const rows: Array<{ form?: string; example?: string }> = Array.isArray(m.rows) ? m.rows : [];
    return (
      <div className="space-y-3">
        {m.rule && <p className="text-base font-semibold">{m.rule}</p>}
        {rows.length > 0 && (
          <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-[120px_1fr] text-sm">
                <div className="px-3 py-2 bg-muted font-semibold">{r.form || '—'}</div>
                <div className="px-3 py-2">{r.example || '—'}</div>
              </div>
            ))}
          </div>
        )}
        {fallbackHint && <p className="text-sm text-muted-foreground italic">💡 {fallbackHint}</p>}
      </div>
    );
  }

  if (reteach.kind === 'vocab_flashcard') {
    const v = reteach.payload || {};
    return (
      <div className="rounded-xl border border-border p-4 bg-muted/40">
        <div className="text-2xl font-bold mb-1">{v.word || v.term || '—'}</div>
        {v.definition && <div className="text-sm text-muted-foreground mb-2">{v.definition}</div>}
        {v.example && (
          <div className="text-sm italic border-l-2 border-primary/40 pl-3 mt-2">{v.example}</div>
        )}
        {fallbackHint && <p className="text-sm text-muted-foreground italic mt-3">💡 {fallbackHint}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {reteach.payload.title && <p className="text-base font-semibold">{reteach.payload.title}</p>}
      <p className="text-base">{reteach.payload.body}</p>
    </div>
  );
}
