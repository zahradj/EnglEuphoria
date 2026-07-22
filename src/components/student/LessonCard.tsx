// ============================================================================
// L1/L2 PEDAGOGICAL RULE — DO NOT TRANSLATE LESSON CONTENT
// ----------------------------------------------------------------------------
// `lesson.title` and `lesson.description` are sourced from `curriculum_lessons`
// and MUST render in English. Only translate surrounding chrome (e.g. a
// "Start" button label) via `useTranslation`, never the lesson data itself.
// ============================================================================
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Rocket, Gamepad2, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonCardProps {
  id: string;
  title: string;
  level: string;
  track: 'kids' | 'teens' | 'adults';
  coverImageUrl?: string | null;
  durationMinutes?: number | null;
  progress?: number;
}

const TRACK_CONFIG: Record<string, {
  icon: React.ReactNode;
  gradient: string;
  progressColor: string;
  label: string;
}> = {
  kids: {
    icon: <Rocket className="w-4 h-4" />,
    gradient: 'from-amber-400/80 via-orange-400/80 to-yellow-500/80',
    progressColor: 'bg-amber-400',
    label: 'Playground',
  },
  teens: {
    icon: <Gamepad2 className="w-4 h-4" />,
    gradient: 'from-indigo-500/80 via-purple-500/80 to-violet-500/80',
    progressColor: 'bg-indigo-500',
    label: 'Academy',
  },
  adults: {
    icon: <Briefcase className="w-4 h-4" />,
    gradient: 'from-amber-700/80 via-yellow-700/80 to-amber-800/80',
    progressColor: 'bg-amber-600',
    label: 'Professional',
  },
};

export const LessonCard: React.FC<LessonCardProps> = ({
  id,
  title,
  level,
  track,
  coverImageUrl,
  durationMinutes,
  progress = 0,
}) => {
  const navigate = useNavigate();
  const config = TRACK_CONFIG[track] || TRACK_CONFIG.teens;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => navigate(`/lesson/${id}`)}
      className={cn(
        'group relative overflow-hidden rounded-2xl cursor-pointer',
        'border border-border/30 backdrop-blur-sm bg-card/50',
        'shadow-lg hover:shadow-xl transition-shadow duration-300',
        'h-[280px] flex flex-col'
      )}
    >
      {/* Cover image or gradient fallback */}
      <div className="relative h-36 overflow-hidden">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br', config.gradient)} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />

        {/* Track icon badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-md text-xs font-medium text-foreground">
          {config.icon}
          <span>{config.label}</span>
        </div>

        {/* Level badge */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-bold">
          {level}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {title}
        </h4>

        <div className="flex items-center justify-between mt-3">
          {durationMinutes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {durationMinutes} min
            </span>
          )}
          {progress > 0 && (
            <span className="text-xs text-primary font-medium">{progress}%</span>
          )}
        </div>
      </div>

      {/* Neon progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-muted/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={cn('h-full rounded-full', config.progressColor, 'shadow-[0_0_8px_currentColor]')}
        />
      </div>
    </motion.div>
  );
};
