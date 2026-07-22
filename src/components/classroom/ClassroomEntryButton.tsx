import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DoorOpen, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClassroomEntryButtonProps {
  scheduledAt: string;
  roomId: string;
  lessonTitle?: string;
  role: 'teacher' | 'student';
  className?: string;
}

export const ClassroomEntryButton: React.FC<ClassroomEntryButtonProps> = ({
  scheduledAt,
  roomId,
  lessonTitle,
  role,
  className,
}) => {
  const navigate = useNavigate();
  const [timeUntil, setTimeUntil] = useState<number>(Infinity);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = new Date(scheduledAt).getTime() - Date.now();
      setTimeUntil(diff);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  // Always-open mode: Enter Classroom is permanently available (per product directive)
  const isReady = true;
  const minutesUntil = Math.max(0, Math.ceil(timeUntil / 60000));

  const handleEnter = () => {
    setEntering(true);
    navigate(`/classroom/${roomId}`);
  };

  return (
    <AnimatePresence>
      {isReady ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={cn("relative", className)}
        >
          {/* Pulsing ring behind the button */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30"
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <Button
            onClick={handleEnter}
            disabled={entering}
            size="lg"
            className={cn(
              "relative w-full h-16 text-lg font-bold gap-3 rounded-xl",
              "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]",
              "hover:bg-[length:300%_100%] text-primary-foreground",
              "shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40",
              "animate-[gradient-shift_3s_ease_infinite]",
              "transition-all duration-300"
            )}
          >
            {entering ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <DoorOpen className="h-6 w-6" />
            )}
            {entering ? 'Entering...' : 'ENTER CLASSROOM'}
          </Button>
          {lessonTitle && (
            <p className="text-xs text-muted-foreground text-center mt-2 truncate">
              {lessonTitle}
            </p>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}
        >
          <Clock className="h-4 w-4" />
          <span>Classroom opens in <strong className="text-foreground">{minutesUntil}min</strong></span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
