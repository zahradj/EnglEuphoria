import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WeeklyBriefingData {
  improvementArea: string;
  improvementPct: number;
  focusArea: string;
  weeklyInsight: string;
  actionTip: string;
  sessionsThisWeek: number;
  avgScore: number;
  streak: number;
  aiGenerated: boolean;
}

const FALLBACK_BRIEFING: WeeklyBriefingData = {
  improvementArea: 'professional tone',
  improvementPct: 15,
  focusArea: 'Negotiation Vocabulary',
  weeklyInsight: 'Your formal writing clarity improved significantly this week.',
  actionTip: 'Practice one negotiation dialogue per day this week.',
  sessionsThisWeek: 4,
  avgScore: 87,
  streak: 12,
  aiGenerated: false,
};

// Cache key: weekly-briefing-v1-{userId}-{ISO week}
function getWeekKey(userId: string): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `weekly-briefing-v1-${userId}-${now.getFullYear()}-W${weekNum}`;
}

export function useWeeklyBriefingAI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [briefing, setBriefing] = useState<WeeklyBriefingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setBriefing(FALLBACK_BRIEFING);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);

      // 1. Check weekly cache
      const cacheKey = getWeekKey(user.id);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setBriefing(JSON.parse(cached));
          setLoading(false);
          return;
        } catch { /* ignore */ }
      }

      // 2. Fetch student profile
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('cefr_level, interests, streak_count')
        .eq('user_id', user.id)
        .maybeSingle();

      // 3. Fetch recent AI tutoring sessions for this week (real data)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: sessions } = await supabase
        .from('ai_tutoring_sessions')
        .select('topic, session_rating, duration_seconds')
        .eq('student_id', user.id)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      const sessionsThisWeek = sessions?.length ?? 0;
      const ratings = sessions?.map(s => s.session_rating).filter(Boolean) as number[];
      const avgScore = ratings.length > 0
        ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 20) // 1-5 → 20-100
        : 80;
      const recentTopics = [...new Set(sessions?.map(s => s.topic).filter(Boolean))].slice(0, 3) as string[];
      const streak = profile?.streak_count ?? 0;

      // 4. Call AI edge function
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('generate-daily-lesson', {
          body: {
            mode: 'hub',
            cefrLevel: profile?.cefr_level || 'B1',
            interests: (profile?.interests as string[]) || ['business', 'leadership'],
            recentTopics,
            sessionsThisWeek,
            avgScore,
            streak,
          },
        });

        if (fnError || !fnData?.success) {
          const errMsg = fnData?.error || fnError?.message || 'Unknown error';
          console.warn('Weekly briefing AI failed, using fallback:', errMsg);

          if (errMsg.includes('Rate limit')) {
            toast({ title: 'Weekly Briefing', description: 'Rate limit reached — showing estimated briefing.' });
          }

          const fallback: WeeklyBriefingData = {
            ...FALLBACK_BRIEFING,
            sessionsThisWeek,
            avgScore,
            streak,
          };
          setBriefing(fallback);
          localStorage.setItem(cacheKey, JSON.stringify(fallback));
        } else {
          const result: WeeklyBriefingData = {
            ...fnData.briefing,
            sessionsThisWeek,
            avgScore,
            streak,
            aiGenerated: true,
          };
          setBriefing(result);
          localStorage.setItem(cacheKey, JSON.stringify(result));
        }
      } catch (err) {
        console.warn('Weekly briefing edge function failed:', err);
        const fallback: WeeklyBriefingData = {
          ...FALLBACK_BRIEFING,
          sessionsThisWeek,
          avgScore,
          streak,
        };
        setBriefing(fallback);
        localStorage.setItem(cacheKey, JSON.stringify(fallback));
      }

      setLoading(false);
    };

    load();
  }, [user?.id]);

  return { briefing, loading };
}
