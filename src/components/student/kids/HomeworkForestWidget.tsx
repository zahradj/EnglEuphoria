/**
 * HomeworkForestWidget — Playground (Kids) dashboard widget that surfaces
 * pending homework assignments inside a forest-themed card. After a student
 * finishes a "Play" lesson, the homework attached to that lesson auto-bubbles
 * to the top and is highlighted as the "Next Quest".
 *
 * Tap a tree → open /homework/:assignmentId.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trees, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  homeworkService,
  type HomeworkAssignmentWithSubmission,
} from '@/services/homeworkService';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface HomeworkForestWidgetProps {
  isDark?: boolean;
  /** Lesson id the student just finished — its homework is highlighted. */
  justCompletedLessonId?: string | null;
}

const TREE_EMOJI = ['🌳', '🌲', '🌴', '🌿', '🍀'];

export const HomeworkForestWidget: React.FC<HomeworkForestWidgetProps> = ({
  isDark = false,
  justCompletedLessonId = null,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<HomeworkAssignmentWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.id) return;
    const list = await homeworkService.getStudentAssignments(user.id);
    setAssignments(list);
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    load();
    // Realtime: refresh when a new assignment is dispatched to this student
    const channel = supabase
      .channel(`homework-forest:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'homework_assignment_students',
          filter: `student_id=eq.${user.id}`,
        },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const sorted = useMemo(() => {
    const pending = assignments.filter(
      (a) => !a.submission || a.submission.status === 'pending'
    );
    if (!justCompletedLessonId) return pending;
    return [...pending].sort((a, b) => {
      const am = a.lesson_id === justCompletedLessonId ? -1 : 0;
      const bm = b.lesson_id === justCompletedLessonId ? -1 : 0;
      return am - bm;
    });
  }, [assignments, justCompletedLessonId]);

  const open = (id: string) => navigate(`/homework/${id}`);

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.25 }}
      className="glass-card-hub glass-playground p-4 backdrop-blur-md"
      aria-label="Homework Forest"
    >

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-xs text-emerald-700/70 dark:text-emerald-300/70">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          Loading the forest...
        </div>
      ) : sorted.length === 0 ? null : (
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
          <AnimatePresence initial={false}>
            {sorted.map((hw, i) => {
              const tree = TREE_EMOJI[i % TREE_EMOJI.length];
              const isHighlighted =
                !!justCompletedLessonId && hw.lesson_id === justCompletedLessonId;
              return (
                <motion.button
                  key={hw.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => open(hw.id)}
                  className={cn(
                    'w-full text-left rounded-2xl border p-3 flex items-center gap-3 transition-colors',
                    isHighlighted
                      ? isDark
                        ? 'bg-gradient-to-r from-amber-900/50 to-emerald-900/40 border-amber-400/60'
                        : 'bg-gradient-to-r from-amber-50 to-emerald-50 border-amber-300'
                      : isDark
                        ? 'bg-emerald-900/30 border-emerald-700/40 hover:bg-emerald-900/50'
                        : 'bg-white/70 border-emerald-200 hover:bg-emerald-50'
                  )}
                >
                  <motion.span
                    className="text-2xl shrink-0"
                    animate={isHighlighted ? { rotate: [0, -8, 8, 0] } : {}}
                    transition={{ duration: 2, repeat: isHighlighted ? Infinity : 0, repeatDelay: 1 }}
                  >
                    {tree}
                  </motion.span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {isHighlighted && (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full',
                            isDark
                              ? 'bg-amber-500/30 text-amber-200'
                              : 'bg-amber-200 text-amber-900'
                          )}
                        >
                          <Sparkles className="w-2.5 h-2.5" /> Next quest
                        </span>
                      )}
                      <p
                        className={cn(
                          'text-sm font-bold truncate',
                          isDark ? 'text-emerald-100' : 'text-emerald-900'
                        )}
                      >
                        {hw.title}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'text-[11px] flex items-center gap-1 mt-0.5',
                        isDark ? 'text-emerald-300/80' : 'text-emerald-700/80'
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {hw.due_date
                        ? `Due ${new Date(hw.due_date).toLocaleDateString()}`
                        : 'No due date'}
                      <span className="mx-1">•</span>
                      <span>⭐ {hw.points ?? 10}</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default HomeworkForestWidget;
