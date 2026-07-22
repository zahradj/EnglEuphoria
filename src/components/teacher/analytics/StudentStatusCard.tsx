import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DynamicAvatar } from '@/components/student/DynamicAvatar';
import { Shield, Clock, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StudentStatusCardProps {
  studentId: string;
  studentName: string;
  cefrLevel: string;
}

const HUB_THEMES = {
  playground: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    shield: 'from-amber-400 to-orange-500',
    label: 'Playground',
  },
  academy: {
    bg: 'bg-gradient-to-br from-slate-900 to-violet-950 dark:from-slate-950 dark:to-violet-950',
    border: 'border-violet-500/30',
    badge: 'bg-violet-500/20 text-violet-300',
    shield: 'from-violet-400 to-cyan-400',
    label: 'Academy',
  },
  professional: {
    bg: 'bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-950/50 dark:to-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    shield: 'from-emerald-400 to-teal-500',
    label: 'Professional',
  },
};

function detectHub(cefrLevel: string): 'playground' | 'academy' | 'professional' {
  const level = cefrLevel?.toUpperCase() || 'A1';
  if (['PRE-A1', 'A1'].includes(level)) return 'playground';
  if (['A2', 'B1'].includes(level)) return 'academy';
  return 'professional';
}

function extractLevelNumber(cefrLevel: string): number {
  const map: Record<string, number> = { 'PRE-A1': 1, 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 5 };
  return map[cefrLevel?.toUpperCase()] || 1;
}

export const StudentStatusCard: React.FC<StudentStatusCardProps> = ({
  studentId,
  studentName,
  cefrLevel,
}) => {
  const hub = detectHub(cefrLevel);
  const theme = HUB_THEMES[hub];
  const levelNum = extractLevelNumber(cefrLevel);
  const isAcademy = hub === 'academy';

  // Fetch last completed lesson
  const { data: lastActivity } = useQuery({
    queryKey: ['student-last-activity', studentId],
    queryFn: async () => {
      const { data } = await supabase
        .from('interactive_lesson_progress')
        .select('updated_at, lesson:curriculum_lessons(title)')
        .eq('student_id', studentId)
        .eq('completed', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!studentId,
  });

  const lastTitle = (lastActivity?.lesson as any)?.title || null;
  const lastTime = lastActivity?.updated_at
    ? formatDistanceToNow(new Date(lastActivity.updated_at), { addSuffix: true })
    : null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={cn('overflow-hidden border', theme.bg, theme.border)}>
        <CardContent className="p-5">
          <div className="flex items-center gap-5">
            {/* Avatar with accessories */}
            <DynamicAvatar studentId={studentId} hub={hub} size="md" showSparkle />

            {/* Info column */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={cn('text-lg font-bold truncate', isAcademy ? 'text-white' : 'text-foreground')}>
                  {studentName}
                </h3>
                <Badge className={theme.badge}>{theme.label}</Badge>
              </div>

              {/* Level Shield */}
              <div className="flex items-center gap-3">
                <div className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r text-white text-sm font-bold shadow-md', theme.shield)}>
                  <Shield className="h-4 w-4" />
                  Level {levelNum}
                </div>
                <Badge variant="outline" className={cn('text-xs', isAcademy ? 'border-violet-500/40 text-violet-300' : '')}>
                  CEFR {cefrLevel || 'Pre-A1'}
                </Badge>
              </div>

              {/* Last Active */}
              {lastTitle && lastTime ? (
                <div className={cn('flex items-center gap-1.5 text-xs', isAcademy ? 'text-slate-400' : 'text-muted-foreground')}>
                  <Clock className="h-3 w-3" />
                  <span>Completed: <strong>{lastTitle}</strong> — {lastTime}</span>
                </div>
              ) : (
                <div className={cn('flex items-center gap-1.5 text-xs', isAcademy ? 'text-slate-500' : 'text-muted-foreground')}>
                  <Zap className="h-3 w-3" />
                  <span>No completed lessons yet</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
