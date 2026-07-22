import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MistakeEntry {
  word?: string;
  error_type?: string;
  timestamp?: string;
  context?: string;
}

interface DailyQuestData {
  lastMistake: MistakeEntry | null;
  weakAreas: string[];
  questContext: string;
  loading: boolean;
}

export const useDailyQuest = (): DailyQuestData => {
  const { user } = useAuth();
  const [data, setData] = useState<DailyQuestData>({
    lastMistake: null,
    weakAreas: [],
    questContext: '',
    loading: true,
  });

  useEffect(() => {
    const fetchMistakes = async () => {
      if (!user?.id) {
        setData(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('student_profiles')
          .select('mistake_history, interests')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        const history = (profile?.mistake_history as MistakeEntry[]) || [];
        const interests = profile?.interests || [];
        const lastMistake = history.length > 0 ? history[history.length - 1] : null;

        // Extract weak areas from recent mistakes
        const recentMistakes = history.slice(-10);
        const errorTypes = recentMistakes
          .map(m => m.error_type)
          .filter(Boolean) as string[];
        const weakAreas = [...new Set(errorTypes)];

        // Build human-readable quest context
        let questContext = '';
        if (lastMistake?.word && lastMistake?.error_type) {
          questContext = `You struggled with **'${lastMistake.word}'** (${lastMistake.error_type}). Let's practice!`;
        } else if (interests.length > 0) {
          const randomInterest = interests[Math.floor(Math.random() * interests.length)];
          questContext = `Daily vocab boost: learn 5 new words about **${randomInterest}**!`;
        } else {
          questContext = 'Ready for today\'s challenge? Let\'s expand your vocabulary!';
        }

        setData({
          lastMistake,
          weakAreas,
          questContext,
          loading: false,
        });
      } catch (err) {
        console.error('Error fetching daily quest data:', err);
        setData(prev => ({
          ...prev,
          questContext: 'Ready for today\'s challenge? Let\'s go!',
          loading: false,
        }));
      }
    };

    fetchMistakes();
  }, [user?.id]);

  return data;
};
