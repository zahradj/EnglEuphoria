import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type Hub = 'playground' | 'academy' | 'professional';

const HUB_BTN: Record<Hub, string> = {
  playground: 'bg-orange-500 hover:bg-orange-600 text-white',
  academy: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  professional: 'bg-emerald-600 hover:bg-emerald-700 text-white',
};

/**
 * Single, compact "Jump back in" card surfacing the most recently
 * in-progress curriculum lesson for the student.
 */
export const JumpBackInCard: React.FC<{ hub: Hub }> = ({ hub }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('student_lesson_progress' as any)
        .select('lesson_id, updated_at, curriculum_lessons(title)')
        .eq('user_id', user.id)
        .neq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled || !data) return;
      const d: any = data;
      setLesson({
        id: d.lesson_id,
        title: d.curriculum_lessons?.title || 'Continue your lesson',
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!lesson) return null;

  return (
    <button
      onClick={() => navigate('/dashboard?tab=lessons')}
      className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-card/70 backdrop-blur p-4 text-left transition hover:border-foreground/20"
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
          HUB_BTN[hub],
        )}
      >
        <PlayCircle className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Jump back in
        </div>
        <div className="text-sm font-semibold truncate">{lesson.title}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition" />
    </button>
  );
};

export default JumpBackInCard;
