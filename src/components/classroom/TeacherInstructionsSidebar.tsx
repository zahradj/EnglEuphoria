import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Target, MessageSquare, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TeacherInstructionsSidebarProps {
  lessonTitle?: string;
  objectives?: string[];
  vocabulary?: string[];
  activityNotes?: string[];
  timingSuggestions?: string[];
  isOpen: boolean;
  onToggle: () => void;
}

export const TeacherInstructionsSidebar: React.FC<TeacherInstructionsSidebarProps> = ({
  lessonTitle = 'Lesson Instructions',
  objectives = ['Introduce target vocabulary in context', 'Practice pronunciation with repetition drills', 'Build confidence through guided speaking'],
  vocabulary = ['Hello / Goodbye', 'Please / Thank you', 'How are you?'],
  activityNotes = ['Start with a warm-up song or chant', 'Use TPR (Total Physical Response) for vocabulary', 'Pair practice: Student repeats after teacher'],
  timingSuggestions = ['Warm-up: 5 min', 'Presentation: 10 min', 'Practice: 10 min', 'Wrap-up: 5 min'],
  isOpen,
  onToggle,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('objectives');

  const sections = [
    {
      id: 'objectives',
      title: 'Lesson Objectives',
      icon: Target,
      items: objectives,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
    },
    {
      id: 'vocabulary',
      title: 'Key Vocabulary',
      icon: BookOpen,
      items: vocabulary,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50/80',
    },
    {
      id: 'activities',
      title: 'Activity Notes',
      icon: MessageSquare,
      items: activityNotes,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50/80',
    },
    {
      id: 'timing',
      title: 'Timing Suggestions',
      icon: Clock,
      items: timingSuggestions,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50/80',
    },
  ];

  return (
    <>
      {/* Toggle button always visible */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={cn(
          'fixed top-20 z-50 rounded-full shadow-lg backdrop-blur-md',
          'bg-white/80 border border-gray-200/50 hover:bg-white/90',
          isOpen ? 'right-[290px]' : 'right-2'
        )}
        title="Teacher Instructions"
      >
        {isOpen ? <ChevronRight className="h-4 w-4" /> : <BookOpen className="h-4 w-4 text-indigo-600" />}
      </Button>

      {/* Sidebar panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed top-14 right-0 bottom-0 w-[280px] z-40',
              'bg-white/70 backdrop-blur-xl border-l border-gray-200/50',
              'shadow-[-4px_0_24px_rgba(0,0,0,0.08)]',
              'flex flex-col overflow-hidden'
            )}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100/80 bg-gradient-to-r from-indigo-50/60 to-purple-50/60">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                {lessonTitle}
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Teacher-only instructions</p>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="rounded-xl border border-gray-100/80 bg-white/60 backdrop-blur-sm overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors',
                      'hover:bg-gray-50/80'
                    )}
                  >
                    <div className={cn('p-1 rounded-lg', section.bgColor)}>
                      <section.icon className={cn('h-3.5 w-3.5', section.color)} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 flex-1">{section.title}</span>
                    <ChevronRight
                      className={cn(
                        'h-3 w-3 text-gray-400 transition-transform',
                        expandedSection === section.id && 'rotate-90'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <ul className="px-3 pb-3 space-y-1.5">
                          {section.items.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-[11px] text-gray-600 leading-relaxed"
                            >
                              <span className={cn('mt-1 h-1.5 w-1.5 rounded-full shrink-0', section.bgColor.replace('/80', ''))} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
