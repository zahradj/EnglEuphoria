import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MistakeEntry {
  word: string;
  context: string;
  timestamp: string;
  error_type: 'spelling' | 'grammar' | 'vocabulary' | 'pronunciation' | 'homophone';
  correct_answer: string;
  student_answer: string;
}

const MAX_MISTAKES = 50;

export const useMistakeTracker = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);

  const recordMistake = useCallback(async (
    mistake: Omit<MistakeEntry, 'timestamp'>
  ): Promise<boolean> => {
    if (!user?.id) return false;

    setIsRecording(true);
    try {
      // Fetch current mistake history
      const { data: profile, error: fetchError } = await supabase
        .from('student_profiles')
        .select('mistake_history')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching mistake history:', fetchError);
        return false;
      }

      const currentHistory = (profile?.mistake_history as MistakeEntry[] | null) || [];
      
      const newMistake: MistakeEntry = {
        ...mistake,
        timestamp: new Date().toISOString(),
      };

      // Add new mistake and keep only the last MAX_MISTAKES
      const updatedHistory = [newMistake, ...currentHistory].slice(0, MAX_MISTAKES);

      // Update the database
      const { error: updateError } = await supabase
        .from('student_profiles')
        .update({ mistake_history: updatedHistory })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error recording mistake:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in recordMistake:', error);
      return false;
    } finally {
      setIsRecording(false);
    }
  }, [user?.id]);

  const getMistakes = useCallback(async (): Promise<MistakeEntry[]> => {
    if (!user?.id) return [];

    try {
      const { data: profile, error } = await supabase
        .from('student_profiles')
        .select('mistake_history')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching mistakes:', error);
        return [];
      }

      return (profile?.mistake_history as MistakeEntry[] | null) || [];
    } catch (error) {
      console.error('Error in getMistakes:', error);
      return [];
    }
  }, [user?.id]);

  const getWeakAreas = useCallback(async (): Promise<string[]> => {
    const mistakes = await getMistakes();
    
    if (mistakes.length === 0) return [];

    // Count occurrences of each word/pattern
    const wordCounts = mistakes.reduce((acc, mistake) => {
      acc[mistake.word] = (acc[mistake.word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort by frequency and return top 5 weak areas
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }, [getMistakes]);

  const getRecentMistakeWords = useCallback(async (limit: number = 10): Promise<string[]> => {
    const mistakes = await getMistakes();
    return mistakes.slice(0, limit).map(m => m.word);
  }, [getMistakes]);

  const clearMistakes = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('student_profiles')
        .update({ mistake_history: [] })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing mistakes:', error);
        toast.error('Failed to clear mistake history');
        return false;
      }

      toast.success('Mistake history cleared');
      return true;
    } catch (error) {
      console.error('Error in clearMistakes:', error);
      return false;
    }
  }, [user?.id]);

  return {
    recordMistake,
    getMistakes,
    getWeakAreas,
    getRecentMistakeWords,
    clearMistakes,
    isRecording,
  };
};
