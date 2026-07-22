import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Award, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnitAchievement {
  id: string;
  unit_id: string;
  achievement_type: string;
  sticker_name: string;
  earned_at: string;
  unit_title?: string;
}

const stickerEmojis: Record<string, string> = {
  unit_mastery: '🏅',
  phoneme_mastery: '🔤',
  perfect_score: '💎',
  speed_master: '⚡',
};

export const StudentAchievements: React.FC = () => {
  const { user } = useAuth();

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['student-unit-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('student_unit_achievements')
        .select('*')
        .eq('student_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      if (!data?.length) return [];

      const unitIds = [...new Set(data.map((a: any) => a.unit_id))];
      const { data: units } = await supabase
        .from('curriculum_units')
        .select('id, title')
        .in('id', unitIds);
      
      const unitMap = Object.fromEntries((units || []).map((u: any) => [u.id, u.title]));

      return data.map((a: any) => ({
        ...a,
        unit_title: unitMap[a.unit_id] || 'Unknown Unit',
      })) as UnitAchievement[];
    },
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-amber-500" />
          Mastery Stickers
          {achievements.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({achievements.length} earned)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Award className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No stickers earned yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Pass a Mastery Milestone quiz (≥80%) to earn your first sticker!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  'flex flex-col items-center p-4 rounded-xl border-2 border-amber-300',
                  'bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-card',
                  'shadow-sm hover:shadow-md transition-shadow'
                )}
              >
                <span className="text-3xl mb-2">
                  {stickerEmojis[achievement.achievement_type] || '🏅'}
                </span>
                <p className="text-xs font-semibold text-foreground text-center leading-tight">
                  {achievement.sticker_name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 text-center truncate w-full">
                  {achievement.unit_title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(achievement.earned_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
