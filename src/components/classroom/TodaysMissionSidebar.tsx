import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { SharedNotesPanel } from './SharedNotesPanel';

interface MissionItem {
  id: string;
  label: string;
  category: 'vocabulary' | 'grammar' | 'goal';
  checked: boolean;
}

interface TodaysMissionSidebarProps {
  lessonTitle: string;
  isTeacher: boolean;
  sharedNotes: string;
  sessionContext: Record<string, any>;
  onNotesChange: (notes: string) => void;
  onMissionUpdate?: (items: MissionItem[]) => void;
}

const getDefaultMission = (title: string, ctx: Record<string, any>): MissionItem[] => {
  const level = ctx?.level || 'unknown';
  return [
    { id: 'vocab', label: level === 'playground' ? 'Learn 5 new animal words' : level === 'academy' ? 'Master 6 topic-related words' : 'Acquire 6 business vocabulary terms', category: 'vocabulary', checked: false },
    { id: 'grammar', label: level === 'playground' ? 'Practice simple present tense' : level === 'academy' ? 'Use present perfect correctly' : 'Master conditional structures', category: 'grammar', checked: false },
    { id: 'goal', label: level === 'playground' ? 'Describe your favorite animal' : level === 'academy' ? 'Hold a 2-minute conversation' : 'Deliver a mini-presentation', category: 'goal', checked: false },
  ];
};

export const TodaysMissionSidebar: React.FC<TodaysMissionSidebarProps> = ({
  lessonTitle,
  isTeacher,
  sharedNotes,
  sessionContext,
  onNotesChange,
  onMissionUpdate
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [missionItems, setMissionItems] = useState<MissionItem[]>(() =>
    getDefaultMission(lessonTitle, sessionContext)
  );

  const handleToggle = (id: string) => {
    if (!isTeacher) return;
    const updated = missionItems.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setMissionItems(updated);
    onMissionUpdate?.(updated);
  };

  const categoryIcons: Record<string, string> = {
    vocabulary: '📚',
    grammar: '✏️',
    goal: '🎯'
  };

  const categoryLabels: Record<string, string> = {
    vocabulary: 'Target Vocabulary',
    grammar: 'Grammar Point',
    goal: 'Practical Goal'
  };

  return (
    <div className={`relative flex flex-col transition-all duration-300 ${isCollapsed ? 'w-10' : 'w-72'} bg-gray-900/95 backdrop-blur border-l border-gray-800 shrink-0`}>
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-4 z-10 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700"
      >
        {isCollapsed ? <ChevronLeft className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
      </button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Today's Mission</h3>
            </div>

            {/* Context Banner */}
            {sessionContext?.summary && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-300">{sessionContext.summary}</p>
              </div>
            )}

            {/* Mission Checklist */}
            <div className="space-y-3">
              {missionItems.map(item => (
                <div key={item.id} className="flex items-start gap-2">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => handleToggle(item.id)}
                    disabled={!isTeacher}
                    className="mt-0.5 border-gray-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <div className="flex-1">
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      {categoryIcons[item.category]} {categoryLabels[item.category]}
                    </p>
                    <p className={`text-xs ${item.checked ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-800" />

            {/* Shared Notes */}
            <SharedNotesPanel
              notes={sharedNotes}
              onNotesChange={onNotesChange}
              sessionContext={sessionContext}
              readOnly={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
