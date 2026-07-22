
import { ClayCard, ClayIcon, ClayProgress, ClayBadge, type ClaySubject } from "@/components/ui/clay";

export interface AchievementBadgeProps {
  id: string;
  name: string;
  description: string;
  icon: string | React.ReactNode;
  level?: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlocked: boolean;
  progress?: {current: number, total: number};
  pointsAwarded: number;
  className?: string;
}

const levelToSubject: Record<string, ClaySubject> = {
  bronze: 'neutral',
  silver: 'grammar',
  gold: 'gold',
  platinum: 'vocab',
};

export function AchievementBadge({
  name,
  description,
  icon,
  level = 'bronze',
  unlocked,
  progress,
  pointsAwarded,
  className = "",
}: AchievementBadgeProps) {
  const subject = unlocked ? levelToSubject[level] : 'neutral';

  return (
    <ClayCard
      subject={subject}
      className={`flex items-center gap-4 ${!unlocked ? 'opacity-60 grayscale' : ''} ${className}`}
    >
      <ClayIcon subject={subject} size="lg">
        {typeof icon === 'string' ? (
          <img src={icon} alt={name} className={`w-8 h-8 ${!unlocked ? 'grayscale' : ''}`} />
        ) : (
          icon
        )}
      </ClayIcon>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className={`font-bold text-sm ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
            {name}
          </h4>
          <ClayBadge subject="gold" label={`+${pointsAwarded}`} unlocked={unlocked} />
        </div>

        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>

        {progress && (
          <div className="mt-2">
            <ClayProgress
              value={(progress.current / progress.total) * 100}
              subject={subject}
              height={6}
            />
            <div className="text-[10px] text-muted-foreground mt-1">
              {progress.current}/{progress.total}
            </div>
          </div>
        )}
      </div>
    </ClayCard>
  );
}
