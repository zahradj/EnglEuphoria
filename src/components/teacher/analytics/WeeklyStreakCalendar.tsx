import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarDays } from 'lucide-react';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WeeklyStreakCalendarProps {
  studentId: string;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const WeeklyStreakCalendar: React.FC<WeeklyStreakCalendarProps> = ({ studentId }) => {
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const { data: completions = [] } = useQuery({
    queryKey: ['student-weekly-completions', studentId, weekStart.toISOString()],
    queryFn: async () => {
      const weekEnd = addDays(weekStart, 7);
      const { data } = await supabase
        .from('interactive_lesson_progress')
        .select('updated_at, lesson:curriculum_lessons(duration_minutes)')
        .eq('student_id', studentId)
        .eq('completed', true)
        .gte('updated_at', weekStart.toISOString())
        .lt('updated_at', weekEnd.toISOString());
      return data || [];
    },
    enabled: !!studentId,
  });

  // Group completions by day
  const dayData = useMemo(() => {
    return weekDays.map((day) => {
      const dayCompletions = completions.filter((c: any) =>
        isSameDay(new Date(c.updated_at), day)
      );
      const totalMinutes = dayCompletions.reduce((sum: number, c: any) =>
        sum + ((c.lesson as any)?.duration_minutes || 30), 0
      );
      return { date: day, completions: dayCompletions.length, totalMinutes };
    });
  }, [weekDays, completions]);

  const totalWeekMinutes = dayData.reduce((s, d) => s + d.totalMinutes, 0);
  const totalSessions = dayData.reduce((s, d) => s + d.completions, 0);
  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Weekly Streak
          </span>
          <span className="text-xs font-normal">
            {totalSessions} session{totalSessions !== 1 ? 's' : ''} · {totalWeekMinutes}m total
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          {dayData.map((day, i) => {
            const active = day.completions > 0;
            const today = isToday(day.date);

            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                        active
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-400/30'
                          : today
                            ? 'bg-primary/10 border-2 border-dashed border-primary/40 text-primary'
                            : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {active ? '✓' : today ? '◎' : '–'}
                    </motion.div>
                    <span className={cn(
                      'text-[10px] font-medium',
                      today ? 'text-primary' : 'text-muted-foreground',
                    )}>
                      {DAY_LABELS[i]}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {format(day.date, 'EEE, MMM d')}
                    {active
                      ? ` — ${day.completions} lesson${day.completions > 1 ? 's' : ''} (${day.totalMinutes}m)`
                      : ' — No lessons'}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
