import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { slideLabel } from '@/lib/academy/playerSafety';
import type { QuestLevel } from '@/lib/academy/questLevels';

/**
 * Slide list drawer. Students can jump back to anything they have already reached (to review a word or a rule);
 * teachers / previewers can jump anywhere. Opened from the "3 / 35" counter in the bottom bar.
 */
export interface SlideNavigatorProps {
  open: boolean;
  onClose: () => void;
  slides: any[];
  current: number;
  /** Highest slide index the student has reached. */
  maxReached: number;
  /** Teachers / previewers may jump to any slide. */
  unlockAll: boolean;
  levelFor: (block: string) => { index: number; level: QuestLevel };
  onJump: (index: number) => void;
}

export function SlideNavigator({ open, onClose, slides, current, maxReached, unlockAll, levelFor, onJump }: SlideNavigatorProps) {
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', key);
    // Bring the current slide into view when the drawer opens.
    window.setTimeout(() => listRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'center' }), 60);
    return () => window.removeEventListener('keydown', key);
  }, [open, onClose]);

  let lastBlock = '';
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[96] flex justify-end bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true" aria-label="Lesson slides">
          <motion.aside
            initial={{ x: 380 }} animate={{ x: 0 }} exit={{ x: 380 }} transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="flex h-full w-full max-w-sm flex-col bg-white text-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <div className="text-lg font-black">Lesson map</div>
                <div className="text-xs text-slate-500">{unlockAll ? 'Teacher view — jump anywhere' : 'Jump back to anything you have reached'}</div>
              </div>
              <button onClick={onClose} aria-label="Close lesson map" className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-xl hover:bg-slate-200">✕</button>
            </div>
            <ol ref={listRef} className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
              {slides.map((s, idx) => {
                const lv = levelFor(String(s.block));
                const header = lv.index !== -1 && String(s.block) !== lastBlock;
                lastBlock = String(s.block);
                const reachable = unlockAll || idx <= maxReached;
                const isCur = idx === current;
                return (
                  <React.Fragment key={idx}>
                    {header && (
                      <li className="sticky top-0 z-10 -mx-1 bg-emerald-800 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white" aria-hidden>
                        {lv.level.emoji} Level {lv.index + 1} · {lv.level.title}
                      </li>
                    )}
                    <li>
                      <button
                        disabled={!reachable}
                        aria-current={isCur ? 'true' : undefined}
                        onClick={() => { onJump(idx); onClose(); }}
                        className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl border-2 px-3 py-2 text-left text-sm font-semibold transition ${
                          isCur ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : reachable ? 'border-slate-200 bg-white hover:border-emerald-400' : 'border-transparent bg-slate-50 text-slate-400'
                        }`}
                      >
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${idx < current ? 'bg-emerald-500 text-white' : isCur ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {idx < current ? '✓' : idx + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{slideLabel(s)}</span>
                        {!reachable && <span aria-label="locked">🔒</span>}
                      </button>
                    </li>
                  </React.Fragment>
                );
              })}
            </ol>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
