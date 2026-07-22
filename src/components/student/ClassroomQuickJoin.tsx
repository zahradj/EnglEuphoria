import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Video, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Lesson {
  id: string;
  title: string;
  scheduled_at: string;
  room_link?: string;
  teacher_id: string;
}

interface ClassroomQuickJoinProps {
  upcomingLessons: Lesson[];
}

export function ClassroomQuickJoin({ upcomingLessons }: ClassroomQuickJoinProps) {
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [minutesUntil, setMinutesUntil] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUpcomingLessons = () => {
      if (!upcomingLessons || upcomingLessons.length === 0) {
        setNextLesson(null);
        return;
      }

      const now = new Date();
      
      // Show the next upcoming lesson (no time restriction)
      const soonLesson = upcomingLessons
        .filter(lesson => {
          const lessonTime = new Date(lesson.scheduled_at);
          const minutesDiff = (lessonTime.getTime() - now.getTime()) / 60000;
          return minutesDiff >= -60; // Hide only if lesson ended over an hour ago
        })
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0] || null;

      if (soonLesson) {
        const lessonTime = new Date(soonLesson.scheduled_at);
        const minutesDiff = Math.ceil((lessonTime.getTime() - now.getTime()) / 60000);
        setNextLesson(soonLesson);
        setMinutesUntil(minutesDiff);
      } else {
        setNextLesson(null);
      }
    };

    // Check immediately
    checkUpcomingLessons();

    // Check every 30 seconds
    const interval = setInterval(checkUpcomingLessons, 30000);

    return () => clearInterval(interval);
  }, [upcomingLessons]);

  const handleJoinClass = () => {
    if (!nextLesson) return;

    // Always use unified classroom route with booking id
    navigate(`/classroom/${nextLesson.id}`);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Auto-show again after 5 minutes
    setTimeout(() => setIsDismissed(false), 300000);
  };

  // Don't show if dismissed or no upcoming lesson
  if (isDismissed || !nextLesson) return null;

  const isStartingSoon = minutesUntil <= 5 && minutesUntil >= 0;
  const hasStarted = minutesUntil < 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Card className="relative overflow-hidden shadow-xl border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-4 pr-10 space-y-3">
            <div className="flex items-center gap-2">
              {isStartingSoon && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Video className="h-5 w-5 text-primary" />
                </motion.div>
              )}
              <h3 className="font-semibold text-foreground">
                {hasStarted ? '🔴 Class In Progress' : isStartingSoon ? '⏰ Class Starting Soon!' : 'Upcoming Class'}
              </h3>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">{nextLesson.title}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                {hasStarted ? (
                  <span>Started {Math.abs(minutesUntil)} min ago</span>
                ) : minutesUntil === 0 ? (
                  <span>Starting now!</span>
                ) : (
                  <span>Starts in {minutesUntil} min</span>
                )}
              </div>
            </div>

            <Button
              onClick={handleJoinClass}
              className={`w-full ${isStartingSoon ? 'animate-pulse' : ''}`}
              variant={isStartingSoon ? 'default' : 'outline'}
            >
              {hasStarted ? 'Join Class Now' : 'Join Classroom'}
            </Button>
          </div>

          {isStartingSoon && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(var(--primary-rgb), 0.4)',
                  '0 0 0 20px rgba(var(--primary-rgb), 0)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
