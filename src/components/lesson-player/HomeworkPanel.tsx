import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpenCheck, Mic, PenLine, Headphones, BookText, Sparkles, Clock, Play } from 'lucide-react';
import { HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import type { HomeworkPack, HomeworkTask } from '@/coherence/types';
import HomeworkRunner from './HomeworkRunner';

interface HomeworkPanelProps {
  hub: HubType;
  pack: HomeworkPack | null | undefined;
  open: boolean;
  onClose: () => void;
}

const MODALITY_ICON: Record<HomeworkTask['modality'], React.ReactNode> = {
  speaking: <Mic size={16} />,
  listening: <Headphones size={16} />,
  reading: <BookText size={16} />,
  writing: <PenLine size={16} />,
  mixed: <Sparkles size={16} />,
};

const HUB_STYLES: Record<HubType, { bg: string; chip: string; accent: string; title: string }> = {
  playground: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200',
    chip: 'bg-amber-100 text-amber-800',
    accent: '#FF9F1C',
    title: '🎒 Homework — Do it together!',
  },
  academy: {
    bg: 'bg-indigo-950/95 border border-indigo-500/30 text-indigo-50',
    chip: 'bg-indigo-800/60 text-indigo-100',
    accent: '#A855F7',
    title: '🎯 Mission Homework',
  },
  professional: {
    bg: 'bg-white border border-slate-200',
    chip: 'bg-emerald-50 text-emerald-700',
    accent: '#059669',
    title: 'Homework Brief',
  },
};

export default function HomeworkPanel({ hub, pack, open, onClose }: HomeworkPanelProps) {
  const style = HUB_STYLES[hub];
  const tasks = pack?.tasks ?? [];
  const totalMin = pack?.total_minutes ?? 0;
  const [runnerOpen, setRunnerOpen] = useState(false);
  const canRun = !!pack && (tasks.length > 0 || (pack.drill_plan?.cards?.length ?? 0) > 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl ${style.bg}`}
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 backdrop-blur-md bg-inherit px-6 py-4 flex items-center justify-between border-b border-current/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: style.accent }}>
                  {style.title}
                </h2>
                <p className="text-xs opacity-70 mt-1 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1"><Clock size={12} /> ~{totalMin} min</span>
                  <span>·</span>
                  <span>{tasks.length} task{tasks.length === 1 ? '' : 's'}</span>
                  <span>·</span>
                  <span>Bound to today's lesson</span>
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close homework"
                className="min-w-10 min-h-10 rounded-full flex items-center justify-center hover:bg-black/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-3">
              {tasks.length === 0 && (
                <div className="text-center py-10 opacity-60">
                  <BookOpenCheck size={36} className="mx-auto mb-2" />
                  <p className="text-sm">No homework generated for this lesson.</p>
                </div>
              )}

              {tasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="rounded-2xl p-4 bg-white/70 dark:bg-white/5 border border-current/10 flex gap-3 items-start"
                >
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ background: style.accent }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${style.chip}`}>
                        {MODALITY_ICON[task.modality]} {task.modality}
                      </span>
                      <span className="text-[11px] opacity-60">~{task.estimated_minutes} min</span>
                      <span className="text-[11px] opacity-50 uppercase tracking-wide">{task.type.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-sm leading-snug">{task.prompt}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 backdrop-blur-md bg-inherit px-6 py-4 border-t border-current/10 flex justify-between items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl font-semibold opacity-70 hover:opacity-100"
              >
                Close
              </button>
              {canRun && (
                <button
                  onClick={() => setRunnerOpen(true)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-white inline-flex items-center gap-2"
                  style={{ background: style.accent }}
                >
                  <Play size={16} /> Start
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      {runnerOpen && pack && (
        <HomeworkRunner
          hub={hub}
          pack={pack}
          onClose={() => setRunnerOpen(false)}
        />
      )}
    </AnimatePresence>
  );
}

