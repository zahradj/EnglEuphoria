import { useStudentXP } from '@/hooks/useStudentXP';
import { useStudentStreak } from '@/hooks/useStudentStreak';
import { Coins, Flame } from 'lucide-react';

export function XPStreakWidget() {
  const { totalXp, todayXp } = useStudentXP();
  const { data: streak } = useStudentStreak();

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-3 rounded-2xl bg-background/60 px-4 py-2 backdrop-blur-sm border">
        <Coins className="h-5 w-5 text-amber-500" />
        <div className="text-right">
          <div className="text-lg font-bold leading-tight">{totalXp.toLocaleString()}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">XP</div>
        </div>
        {todayXp > 0 && (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            +{todayXp}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-background/60 px-4 py-2 backdrop-blur-sm border">
        <Flame className="h-5 w-5 text-orange-500" />
        <div className="text-right">
          <div className="text-lg font-bold leading-tight">{streak?.current_streak ?? 0}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Day Streak</div>
        </div>
      </div>
    </div>
  );
}
