import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Clock, Zap, Rocket, CalendarPlus, CalendarX, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { HubId, HUB_THEMES } from '@/utils/hubTheme';
import { cn } from '@/lib/utils';
import { LessonManagementModal } from '@/components/student/LessonManagementModal';

interface JoinLessonHeroProps {
  hubId: HubId;
  isDark?: boolean;
}

interface UpcomingLesson {
  id: string;
  title: string;
  scheduled_at: string;
  meeting_link?: string;
  session_id?: string;
  teacher_name?: string;
  lesson_price?: number;
  hub_type?: string;
}

const GLOW_CLASS_MAP: Record<HubId, string> = {
  playground: 'glow-pulse-playground',
  academy: 'glow-pulse-academy',
  professional: 'glow-pulse-professional',
};

const GLASS_CLASS_MAP: Record<HubId, string> = {
  playground: 'glass-playground',
  academy: 'glass-academy',
  professional: 'glass-professional',
};

/**
 * Safely extract a relative path from a URL that may be absolute or relative.
 * Handles cases where room_link is stored as a full URL like
 * "https://engleuphoria.com/oneonone-classroom-new?roomId=..."
 */
function toRelativePath(link: string): string {
  if (!link) return '';
  // Already relative
  if (link.startsWith('/')) return link;
  // Absolute URL — extract pathname + search
  try {
    const url = new URL(link);
    return url.pathname + url.search;
  } catch {
    return '/' + link;
  }
}

export const JoinLessonHero: React.FC<JoinLessonHeroProps> = ({ hubId, isDark = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<UpcomingLesson | null>(null);
  const [minutesUntil, setMinutesUntil] = useState(999);
  const [manageMode, setManageMode] = useState<'cancel' | 'reschedule' | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const theme = HUB_THEMES[hubId];

  useEffect(() => {
    if (!user?.id) return;

    const fetchNext = async () => {
      const now = new Date();
      const fiveMinAgo = new Date(now.getTime() - 5 * 60000).toISOString();

      // Primary: check class_bookings (has correct session_id & meeting_link)
      const { data: booking } = await supabase
        .from('class_bookings')
        .select('id, session_id, meeting_link, scheduled_at')
        .eq('student_id', user.id)
        .in('status', ['scheduled', 'confirmed'])
        .gte('scheduled_at', fiveMinAgo)
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (booking) {
        setLesson({
          id: booking.id,
          title: 'Upcoming Lesson',
          scheduled_at: booking.scheduled_at,
          meeting_link: booking.meeting_link,
          session_id: booking.session_id,
        });
        const diff = Math.ceil((new Date(booking.scheduled_at).getTime() - now.getTime()) / 60000);
        setMinutesUntil(diff);
        return;
      }

      // Fallback: check lessons table
      const { data } = await supabase
        .from('lessons')
        .select('id, title, scheduled_at, room_link, room_id')
        .eq('student_id', user.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', fiveMinAgo)
        .order('scheduled_at', { ascending: true })
        .limit(1);

      if (data && data.length > 0) {
        const l = data[0];
        setLesson({
          id: l.id,
          title: l.title,
          scheduled_at: l.scheduled_at,
          meeting_link: l.room_link ?? undefined,
        });
        const diff = Math.ceil((new Date(l.scheduled_at).getTime() - now.getTime()) / 60000);
        setMinutesUntil(diff);
      } else {
        setLesson(null);
      }
    };

    fetchNext();
    const interval = setInterval(fetchNext, 30000);
    return () => clearInterval(interval);
  }, [user?.id, refreshKey]);

  useEffect(() => {
    if (!lesson) return;
    const timer = setInterval(() => {
      const diff = Math.ceil((new Date(lesson.scheduled_at).getTime() - Date.now()) / 60000);
      setMinutesUntil(diff);
    }, 15000);
    return () => clearInterval(timer);
  }, [lesson]);

  const handleJoin = () => {
    if (!lesson) return;
    // Always use the booking's primary key (id) as the universal room key
    navigate(`/classroom/${lesson.id}`);
  };

  const isStartingSoon = minutesUntil <= 5 && minutesUntil >= -5;
  const isLive = minutesUntil < 0;
  const showHero = !!lesson;

  if (!showHero) {
    return (
      <div className={cn(
        'glass-card-hub backdrop-blur-md p-6',
        GLASS_CLASS_MAP[hubId],
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center',
            isDark ? 'bg-white/10' : 'bg-white/60'
          )}>
            <Rocket className="w-7 h-7" style={{ color: isDark ? theme.darkPrimary : theme.primary }} />
          </div>
          <div className="flex-1">
            <p className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-800')}>
              No upcoming lessons
            </p>
            <p className={cn('text-sm mt-0.5', isDark ? 'text-white/60' : 'text-gray-500')}>
              Book your next {theme.label} session to start learning!
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate(`/find-teacher?hub=${hubId}`)}
            className={cn(
              'text-white font-bold px-6 rounded-xl',
              GLOW_CLASS_MAP[hubId],
              `bg-gradient-to-r ${isDark ? theme.darkButtonGradient : theme.buttonGradient}`
            )}
          >
            Book a Lesson
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'relative rounded-[1.25rem] overflow-hidden',
          isStartingSoon && 'ring-2 ring-offset-2',
        )}
        style={{
          ['--tw-ring-color' as any]: isDark ? theme.darkPrimary : theme.primary,
        }}
      >
        <div className={cn(
          'bg-gradient-to-r p-5',
          isDark ? theme.darkHeaderGradient : theme.headerGradient
        )}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 min-w-0">
              <motion.div
                animate={isStartingSoon ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0"
              >
                <Video className="w-6 h-6 text-white" />
              </motion.div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-lg">
                    {isLive ? '🔴 Class In Progress' : isStartingSoon ? '⏰ Starting Soon!' : 'Next Lesson'}
                  </h3>
                  {isStartingSoon && (
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-white text-xs font-medium animate-pulse">
                      LIVE SOON
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-sm mt-0.5 truncate">{lesson.title}</p>
                <div className="flex items-center gap-1.5 text-white/70 text-xs mt-1">
                  <Clock className="w-3 h-3" />
                  {isLive
                    ? `Started ${Math.abs(minutesUntil)} min ago`
                    : minutesUntil === 0
                      ? 'Starting now!'
                      : `Starts in ${minutesUntil} min`
                  }
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={handleJoin}
                size="lg"
                className={cn(
                  'text-white font-bold px-6 shadow-lg rounded-xl',
                  isStartingSoon && 'animate-pulse',
                  GLOW_CLASS_MAP[hubId],
                  `bg-gradient-to-r ${isDark ? theme.darkButtonGradient : theme.buttonGradient}`
                )}
              >
                <Zap className="w-4 h-4 mr-2" />
                {isLive ? 'Join Now' : 'Join Classroom'}
              </Button>
              <Button
                onClick={() => navigate(`/find-teacher?hub=${hubId}`)}
                size="lg"
                variant="secondary"
                className="font-semibold px-5 rounded-xl bg-white/95 hover:bg-white text-gray-800 shadow"
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Book a Lesson
              </Button>
            </div>
          </div>

          {/* Manage lesson actions */}
          {!isLive && (
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setManageMode('reschedule')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition"
              >
                <CalendarClock className="w-3.5 h-3.5" />
                Reschedule
              </button>
              <button
                type="button"
                onClick={() => setManageMode('cancel')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/90 hover:text-white bg-white/10 hover:bg-red-500/40 backdrop-blur-sm transition"
              >
                <CalendarX className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {isStartingSoon && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-[1.25rem]"
            animate={{
              boxShadow: [
                `0 0 0 0 ${isDark ? theme.darkPrimary : theme.primary}66`,
                `0 0 0 12px ${isDark ? theme.darkPrimary : theme.primary}00`,
              ],
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.div>

      {manageMode && (
        <LessonManagementModal
          open={!!manageMode}
          mode={manageMode}
          onClose={() => setManageMode(null)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
          lesson={{
            id: lesson.id,
            title: lesson.title,
            scheduled_at: lesson.scheduled_at,
            teacher_name: lesson.teacher_name ?? 'your teacher',
            lesson_price: lesson.lesson_price ?? 0,
            hub_type: hubId === 'professional' ? 'success' : hubId,
          }}
        />
      )}
    </>
  );
};
