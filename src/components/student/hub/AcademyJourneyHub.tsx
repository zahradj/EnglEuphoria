/**
 * AcademyJourneyHub — centerpiece widget for the Academy (teens) dashboard.
 *
 * Two game-style views, toggleable:
 *   • Quest Map — animated winding path, walking hero, weather, parallax
 *   • Academy City — top-down living city, day/night, NPCs, traffic
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Building2, Sparkles } from 'lucide-react';
import { AcademyQuestMap } from './AcademyQuestMap';
import { AcademyCityMap } from './AcademyCityMap';
import { cn } from '@/lib/utils';

interface Props { isDarkMode?: boolean; }
type View = 'quest' | 'city';

const TABS: { id: View; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'quest', label: 'Quest Map',    Icon: Map },
  { id: 'city',  label: 'Academy City', Icon: Building2 },
];

export const AcademyJourneyHub: React.FC<Props> = ({ isDarkMode = false }) => {
  const [view, setView] = useState<View>('quest');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 16 }}
      className={cn(
        'rounded-2xl p-5',
        isDarkMode
          ? 'bg-[hsl(244,40%,8%)/80] border border-violet-800/40'
          : 'bg-card border border-violet-200/60 shadow-sm',
      )}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <h3 className="font-semibold tracking-tight text-foreground">Your Academy Journey</h3>
        </div>
        <div role="tablist" className={cn(
          'inline-flex items-center rounded-full border p-0.5 text-xs font-medium',
          isDarkMode ? 'bg-violet-950/40 border-violet-800/40' : 'bg-violet-50 border-violet-200',
        )}>
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={view === t.id}
              onClick={() => setView(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition',
                view === t.id
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow'
                  : 'text-violet-700 dark:text-violet-300 hover:bg-violet-100/60 dark:hover:bg-violet-900/40',
              )}
            >
              <t.Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={view}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {view === 'quest' ? <AcademyQuestMap isDarkMode={isDarkMode} /> : <AcademyCityMap isDarkMode={isDarkMode} />}
      </motion.div>
    </motion.div>
  );
};

export default AcademyJourneyHub;
