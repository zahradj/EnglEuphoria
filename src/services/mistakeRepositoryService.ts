import { supabase } from '@/integrations/supabase/client';

export interface MistakeAsset {
  word: string;
  phoneme?: string;
  errorType: string;
  context: string;
  timestamp: string;
  teacherNote?: string;
}

/**
 * Fetches the most recent mistakes from a student's profile
 * and selects the best candidate for a "Warm-Up Mystery" challenge.
 */
export const getWarmUpMystery = async (
  studentId: string
): Promise<MistakeAsset | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('mistake_history')
      .eq('user_id', studentId)
      .single();

    if (error || !profile?.mistake_history) return null;

    const mistakes = profile.mistake_history as MistakeAsset[];
    if (mistakes.length === 0) return null;

    // Prioritize pronunciation mistakes, then most frequent words
    const pronunciationMistakes = mistakes.filter(
      (m: any) => m.error_type === 'pronunciation' || m.error_type === 'homophone'
    );

    // Count frequency of each word
    const wordCounts: Record<string, { count: number; latest: MistakeAsset }> = {};
    const targetList = pronunciationMistakes.length > 0 ? pronunciationMistakes : mistakes;

    targetList.forEach((m: any) => {
      const key = m.word?.toLowerCase() || '';
      if (!wordCounts[key]) {
        wordCounts[key] = { count: 0, latest: m };
      }
      wordCounts[key].count++;
      if (new Date(m.timestamp) > new Date(wordCounts[key].latest.timestamp)) {
        wordCounts[key].latest = m;
      }
    });

    // Get the most frequent mistake that isn't too old (within 14 days)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const candidates = Object.entries(wordCounts)
      .filter(([_, v]) => new Date(v.latest.timestamp) > twoWeeksAgo)
      .sort((a, b) => b[1].count - a[1].count);

    if (candidates.length === 0) {
      // Fallback: just use the most recent mistake
      return targetList[0] as MistakeAsset;
    }

    return candidates[0][1].latest;
  } catch (err) {
    console.error('Error fetching warm-up mystery:', err);
    return null;
  }
};

/**
 * Records a teacher observation as a mistake entry
 * for the diagnostic feedback loop.
 */
export const recordTeacherObservation = async (
  studentId: string,
  observation: {
    word: string;
    context: string;
    errorType: string;
    teacherNote: string;
  }
): Promise<boolean> => {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('mistake_history')
      .eq('user_id', studentId)
      .single();

    if (fetchError) return false;

    const currentHistory = (profile?.mistake_history as any[]) || [];

    const newEntry = {
      word: observation.word,
      context: observation.context,
      timestamp: new Date().toISOString(),
      error_type: observation.errorType,
      correct_answer: '',
      student_answer: '',
      teacher_note: observation.teacherNote,
    };

    const updatedHistory = [newEntry, ...currentHistory].slice(0, 50);

    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ mistake_history: updatedHistory })
      .eq('user_id', studentId);

    return !updateError;
  } catch {
    return false;
  }
};

/**
 * Gets phonemes that need recovery based on mistake frequency.
 * Returns phonemes with >30% error rate.
 */
export const getRecoveryPhonemes = async (
  studentId: string
): Promise<{ phoneme: string; errorRate: number }[]> => {
  try {
    const [phonicsRes, profileRes] = await Promise.all([
      supabase
        .from('student_phonics_progress')
        .select('phoneme, mastery_level')
        .eq('student_id', studentId),
      supabase
        .from('student_profiles')
        .select('mistake_history')
        .eq('user_id', studentId)
        .single(),
    ]);

    const phonics = phonicsRes.data || [];
    const mistakes = (profileRes.data?.mistake_history as any[]) || [];

    // Count pronunciation mistakes per word/phoneme
    const mistakeCounts: Record<string, number> = {};
    mistakes
      .filter((m: any) => m.error_type === 'pronunciation')
      .forEach((m: any) => {
        const key = m.word?.toLowerCase() || '';
        mistakeCounts[key] = (mistakeCounts[key] || 0) + 1;
      });

    // Map phonics to error rates
    return phonics
      .map(p => {
        const errorCount = mistakeCounts[p.phoneme] || 0;
        const baseAccuracy = p.mastery_level === 'mastered' ? 90 : p.mastery_level === 'practiced' ? 70 : 40;
        const errorRate = Math.min(100, 100 - baseAccuracy + errorCount * 10);
        return { phoneme: p.phoneme, errorRate };
      })
      .filter(p => p.errorRate > 30)
      .sort((a, b) => b.errorRate - a.errorRate);
  } catch {
    return [];
  }
};
