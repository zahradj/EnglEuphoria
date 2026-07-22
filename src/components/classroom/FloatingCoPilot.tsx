import React, { useState, useMemo, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Target, GripVertical, AlertTriangle, Lightbulb, MessageCircle, BookOpen } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { SharedNotesPanel } from './SharedNotesPanel';
import { classroomSyncService } from '@/services/classroomSyncService';
import { useHubClassroomTheme, type HubType } from '@/components/classroom/shared/useHubClassroomTheme';
import { useIsMobile } from '@/hooks/use-mobile';

interface MissionItem {
  id: string;
  label: string;
  category: 'vocabulary' | 'grammar' | 'goal';
  checked: boolean;
}

interface FloatingCoPilotProps {
  lessonTitle: string;
  isTeacher: boolean;
  sharedNotes: string;
  sessionContext: Record<string, any>;
  onNotesChange: (notes: string) => void | Promise<void>;
  roomId?: string;
  userId?: string;
  userName?: string;
  hubType?: HubType;
}

const getDefaultMission = (title: string, ctx: Record<string, any>): MissionItem[] => {
  const level = ctx?.level || 'unknown';
  return [
    { id: 'vocab', label: level === 'playground' ? 'Learn 5 new animal words' : level === 'academy' ? 'Master 6 topic-related words' : 'Acquire 6 business vocabulary terms', category: 'vocabulary', checked: false },
    { id: 'grammar', label: level === 'playground' ? 'Practice simple present tense' : level === 'academy' ? 'Use present perfect correctly' : 'Master conditional structures', category: 'grammar', checked: false },
    { id: 'goal', label: level === 'playground' ? 'Describe your favorite animal' : level === 'academy' ? 'Hold a 2-minute conversation' : 'Deliver a mini-presentation', category: 'goal', checked: false },
  ];
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

export const FloatingCoPilot: React.FC<FloatingCoPilotProps> = ({
  lessonTitle,
  isTeacher,
  sharedNotes,
  sessionContext,
  onNotesChange,
  roomId,
  userId,
  userName = 'Teacher',
  hubType = 'academy',
}) => {
  const theme = useHubClassroomTheme(hubType);
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [missionItems, setMissionItems] = useState<MissionItem[]>(() =>
    getDefaultMission(lessonTitle, sessionContext)
  );
  const [quickHistory, setQuickHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; userName: string }>>([]);

  const fireQuickAction = useCallback(
    (label: string) => {
      const stamped = `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] ${label}`;
      setQuickHistory((prev) => [stamped, ...prev].slice(0, 5));
      try {
        window.dispatchEvent(new CustomEvent('classroom:copilot-quick-action', { detail: { label, lessonTitle } }));
      } catch {}
    },
    [lessonTitle],
  );

  // Set up presence tracking for typing indicators
  React.useEffect(() => {
    if (!roomId || !userId) return;
    const cleanup = classroomSyncService.trackPresence(
      roomId,
      userId,
      userName,
      (state) => {
        // Collect all users who are currently typing (excluding self)
        const typing: Array<{ userId: string; userName: string }> = [];
        for (const [, presences] of Object.entries(state)) {
          for (const p of presences as any[]) {
            if (p.isTyping && p.userId !== userId) {
              typing.push({ userId: p.userId, userName: p.userName });
            }
          }
        }
        setTypingUsers(typing);
      }
    );
    return cleanup;
  }, [roomId, userId, userName]);

  const handleTypingStart = useCallback(() => {
    if (!roomId || !userId) return;
    classroomSyncService.updatePresence(roomId, userId, userName, true);
  }, [roomId, userId, userName]);

  const handleTypingEnd = useCallback(() => {
    if (!roomId || !userId) return;
    classroomSyncService.updatePresence(roomId, userId, userName, false);
  }, [roomId, userId, userName]);

  // Extract weak points from mistake_history in session context
  const weakPointsTips = useMemo(() => {
    const mistakes: Array<{ error_type: string }> = sessionContext?.mistakeHistory || [];
    if (mistakes.length === 0) return [];
    // Count frequency
    const freq: Record<string, number> = {};
    for (const m of mistakes) {
      freq[m.error_type] = (freq[m.error_type] || 0) + 1;
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([area, count]) => `${area} (${count} occurrence${count > 1 ? 's' : ''})`);
  }, [sessionContext?.mistakeHistory]);

  const handleToggle = (id: string) => {
    if (!isTeacher) return;
    setMissionItems(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const renderCopilotBody = () => (
    <>
      {/* Context Banner */}
      {sessionContext?.summary && (
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-300">{sessionContext.summary}</p>
        </div>
      )}

      {/* Quick Action Chips */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Quick Co-Pilot</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { icon: AlertTriangle, label: 'Explain mistake' },
            { icon: BookOpen, label: 'Give example' },
            { icon: MessageCircle, label: 'Simpler phrasing' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => fireQuickAction(label)}
              className="flex items-center gap-1 px-2.5 py-1.5 min-h-9 rounded-full text-[11px] font-medium text-white hover:opacity-90 transition-opacity"
              style={theme.buttonGradient}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
        {quickHistory.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory((s) => !s)}
              className="text-[10px] uppercase tracking-wider text-gray-400 hover:text-gray-200 flex items-center gap-1"
            >
              <Lightbulb className="w-3 h-3" />
              {showHistory ? 'Hide' : 'Show'} recent suggestions ({quickHistory.length})
            </button>
            {showHistory && (
              <ul className="mt-1 space-y-0.5 pl-3 border-l border-gray-700">
                {quickHistory.map((item, i) => (
                  <li key={i} className="text-[11px] text-gray-300">{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Mission Checklist */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Today's Mission</p>
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

      <div className="h-px bg-gray-800" />

      {/* AI Weak Points Tips */}
      {isTeacher && weakPointsTips.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Student Weak Areas
          </p>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
            {weakPointsTips.map((tip, i) => (
              <p key={i} className="text-xs text-amber-300">• Focus on: {tip}</p>
            ))}
          </div>
        </div>
      )}

      <div className="h-px bg-gray-800" />

      {/* Shared Notes */}
      <SharedNotesPanel
        notes={sharedNotes}
        onNotesChange={onNotesChange}
        sessionContext={sessionContext}
        readOnly={false}
        typingUsers={typingUsers}
        onTypingStart={handleTypingStart}
        onTypingEnd={handleTypingEnd}
      />
    </>
  );



  if (!isExpanded) {
    return (
      <div
        className="fixed right-4 z-40"
        style={{ bottom: `max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))` }}
      >
        <motion.button
          onClick={() => setIsExpanded(true)}
          aria-label="Open AI Co-Pilot"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          style={{ ...theme.buttonGradient, ...theme.glowShadow }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>
      </div>
    );
  }

  // Phone: fixed bottom sheet instead of draggable Rnd window (Rnd default x/y is off-screen on phones)
  if (isMobile) {
    return (
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="fixed inset-x-0 bottom-0 z-40 glass-panel rounded-t-2xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col max-h-[80dvh] pb-[env(safe-area-inset-bottom)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 select-none">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-white">AI Co-Pilot</span>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            aria-label="Close"
            className="min-w-11 min-h-11 -mr-2 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {renderCopilotBody()}
        </div>
      </motion.div>
    );
  }

  return (
    <Rnd
      default={{ x: window.innerWidth - 390, y: window.innerHeight - 520, width: 360, height: 'auto' as any }}
      minWidth={320}
      maxWidth={420}
      enableResizing={{ right: true, left: true }}
      dragHandleClassName="copilot-drag-handle"
      bounds="window"
      className="z-40"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-2xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col max-h-[70vh]"
      >
        {/* Header */}
        <div className="copilot-drag-handle flex items-center justify-between px-4 py-3 border-b border-gray-800 cursor-grab active:cursor-grabbing select-none">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-500" />
            <Target className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-white">AI Co-Pilot</span>
          </div>
          <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {renderCopilotBody()}
        </div>
      </motion.div>
    </Rnd>
  );
};
