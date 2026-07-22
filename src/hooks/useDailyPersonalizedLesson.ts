import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DailyWord {
  word: string;
  definition: string;
  example: string;
  pronunciation?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface DailyLesson {
  title: string;
  theme: string;
  vocabularySpotlight: DailyWord[];
  quiz: QuizQuestion[];
  aiGenerated?: boolean;
}

// ─── Fallback lesson (no AI / not logged in) ─────────────────────────────────
const FALLBACK_LESSONS: Record<string, DailyLesson> = {
  academy: {
    title: 'Mastering Future Tense through Social Media',
    theme: 'social media',
    aiGenerated: false,
    vocabularySpotlight: [
      { word: 'hustle', pronunciation: '/ˈhʌs.əl/', definition: 'Work hard with energy and urgency', example: 'You have to hustle to reach your goals.' },
      { word: 'vibe', pronunciation: '/vaɪb/', definition: 'The general feeling of a place or situation', example: 'This playlist has a great vibe.' },
      { word: 'iconic', pronunciation: '/aɪˈkɒn.ɪk/', definition: 'Widely admired and recognized', example: 'That post went iconic overnight.' },
      { word: 'negotiate', pronunciation: '/nɪˈɡoʊ.ʃi.eɪt/', definition: 'To discuss to reach an agreement', example: 'They negotiated a better deal.' },
      { word: 'momentum', pronunciation: '/məˈmen.təm/', definition: 'Energy that keeps things moving forward', example: 'Build momentum with small daily wins.' },
    ],
    quiz: [
      { id: 1, question: '"She ___ (hustle) every day to hit her goals." (Past tense)', options: ['hustle', 'hustles', 'hustled', 'hustling'], correctIndex: 2 },
      { id: 2, question: 'Which is the most professional way to say "I like this idea"?', options: ['It slaps fr.', 'I believe this approach has merit.', 'This vibes.', 'Kinda works I guess.'], correctIndex: 1 },
      { id: 3, question: '"Build ___ with small wins." (Correct word)', options: ['noise', 'momentum', 'chaos', 'stress'], correctIndex: 1 },
    ],
  },
  professional: {
    title: 'Business Negotiation & Professional Tone',
    theme: 'business',
    aiGenerated: false,
    vocabularySpotlight: [
      { word: 'leverage', pronunciation: '/ˈlev.ər.ɪdʒ/', definition: 'Use something to maximum advantage', example: 'We can leverage this partnership.' },
      { word: 'articulate', pronunciation: '/ɑːˈtɪk.jʊ.lət/', definition: 'Express clearly and effectively', example: 'She articulated the strategy well.' },
      { word: 'synergy', pronunciation: '/ˈsɪn.ər.dʒi/', definition: 'Combined effort greater than sum of parts', example: 'There is great synergy between departments.' },
      { word: 'pivot', pronunciation: '/ˈpɪv.ət/', definition: 'Change direction strategically', example: 'The company decided to pivot its model.' },
      { word: 'stakeholder', pronunciation: '/ˈsteɪk.hoʊl.dər/', definition: 'A person with an interest in a project', example: 'All stakeholders must be informed.' },
    ],
    quiz: [
      { id: 1, question: '"To ___ our resources effectively" — choose the correct word', options: ['waste', 'leverage', 'ignore', 'delay'], correctIndex: 1 },
      { id: 2, question: '"All ___ must approve the budget."', options: ['bystanders', 'strangers', 'stakeholders', 'employees'], correctIndex: 2 },
      { id: 3, question: 'Which sentence is most formally articulate?', options: ['We need to change stuff up.', 'The company will pivot its core strategy to address market shifts.', 'Things are not working so we pivot.', 'Let us pivot because of issues.'], correctIndex: 1 },
    ],
  },
  playground: {
    title: "Let's Learn Colors & Action Words!",
    theme: 'everyday life',
    aiGenerated: false,
    vocabularySpotlight: [
      { word: 'bright', pronunciation: '/braɪt/', definition: 'Full of light or colour', example: 'The sun is bright today!' },
      { word: 'leap', pronunciation: '/liːp/', definition: 'To jump high', example: 'The frog can leap very far.' },
      { word: 'giggle', pronunciation: '/ˈɡɪɡ.əl/', definition: 'A small happy laugh', example: 'She gave a little giggle.' },
      { word: 'cozy', pronunciation: '/ˈkoʊ.zi/', definition: 'Warm and comfortable', example: 'The blanket is so cozy!' },
      { word: 'whisper', pronunciation: '/ˈwɪs.pər/', definition: 'To speak very softly', example: 'Please whisper in the library.' },
    ],
    quiz: [
      { id: 1, question: 'What is the opposite of "bright"?', options: ['Dark', 'Happy', 'Fast', 'Big'], correctIndex: 0 },
      { id: 2, question: 'Which word means "to jump high"?', options: ['Swim', 'Leap', 'Crawl', 'Roll'], correctIndex: 1 },
      { id: 3, question: 'Fill in the blank: "The blanket is very ___.\"', options: ['Loud', 'Cozy', 'Angry', 'Heavy'], correctIndex: 1 },
    ],
  },
};

// Cache key: daily-lesson-v2-{userId}-{date}
const getCacheKey = (userId: string) =>
  `daily-lesson-v2-${userId}-${new Date().toISOString().split('T')[0]}`;

export function useDailyPersonalizedLesson() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<DailyLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [fluencyScore, setFluencyScore] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      // Show fallback for non-logged-in preview
      setLesson(FALLBACK_LESSONS.academy);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);

      // 1. Check daily cache first
      const cacheKey = getCacheKey(user.id);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setLesson(parsed.lesson);
          setCompleted(parsed.completed || false);
          setFluencyScore(parsed.fluencyScore || 0);
          setLoading(false);
          return;
        } catch { /* ignore corrupted cache */ }
      }

      // 2. Fetch student profile
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('student_level, cefr_level, interests, mistake_history, fluency_score, learning_style, weekly_goal')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentScore = profile?.fluency_score ?? 0;
      setFluencyScore(currentScore);

      const studentLevel = profile?.student_level || 'academy';
      // Map DB level to edge function mode
      const mode = studentLevel === 'professional' ? 'academy' : 'academy'; // academy mode for teens/adults daily lesson
      
      const mistakeHistory = (profile?.mistake_history as any[]) || [];
      const lastMistake = mistakeHistory.length > 0
        ? (mistakeHistory[mistakeHistory.length - 1]?.error || 'verb tenses')
        : 'verb tenses';

      const interests = (profile?.interests as string[]) || ['everyday life'];

      // 3. Call AI edge function
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('generate-daily-lesson', {
          body: {
            mode: 'academy',
            cefrLevel: profile?.cefr_level || 'A2',
            interests,
            lastMistake,
            learningStyle: (profile as any)?.learning_style || 'mixed',
            weeklyGoal: (profile as any)?.weekly_goal || null,
          },
        });

        if (fnError || !fnData?.success) {
          const errMsg = fnData?.error || fnError?.message || 'Unknown error';
          console.warn('AI lesson generation failed, using fallback:', errMsg);

          // Show toast for rate limit / credits
          if (errMsg.includes('Rate limit')) {
            toast({ title: 'AI Lesson', description: 'Rate limit reached — showing your practice lesson.', variant: 'default' });
          } else if (errMsg.includes('credits')) {
            toast({ title: 'AI Lesson', description: 'AI credits depleted — showing your practice lesson.', variant: 'destructive' });
          }

          const fallback = FALLBACK_LESSONS[studentLevel] || FALLBACK_LESSONS.academy;
          setLesson(fallback);
          localStorage.setItem(cacheKey, JSON.stringify({ lesson: fallback, completed: false, fluencyScore: currentScore }));
        } else {
          const aiLesson: DailyLesson = { ...fnData.lesson, aiGenerated: true };
          setLesson(aiLesson);
          localStorage.setItem(cacheKey, JSON.stringify({ lesson: aiLesson, completed: false, fluencyScore: currentScore }));

          // ── Email notification: save lesson to DB and send "Lesson Ready" email ──
          if (user?.email) {
            try {
              // Upsert today's lesson record (unique per student per day)
              const { data: lessonRow } = await supabase
                .from('daily_lessons')
                .upsert(
                  {
                    student_id: user.id,
                    student_level: studentLevel as 'playground' | 'academy' | 'professional',
                    title: aiLesson.title,
                    content: aiLesson as any,
                    lesson_date: new Date().toISOString().split('T')[0],
                    email_sent: false,
                  },
                  { onConflict: 'student_id,lesson_date', ignoreDuplicates: false }
                )
                .select('id, email_sent')
                .maybeSingle();

              // Only send email if not already sent today
              if (lessonRow && !lessonRow.email_sent) {
                const { data: profileData } = await supabase
                  .from('users')
                  .select('full_name')
                  .eq('id', user.id)
                  .maybeSingle();

                await supabase.functions.invoke('notify-student-lesson', {
                  body: {
                    student_email: user.email,
                    student_name: profileData?.full_name || user.email,
                    student_level: studentLevel,
                    lesson_title: aiLesson.title,
                  },
                });

                // Mark email as sent
                await supabase
                  .from('daily_lessons')
                  .update({ email_sent: true, email_sent_at: new Date().toISOString() })
                  .eq('id', lessonRow.id);
              }
            } catch (emailErr) {
              // Non-fatal: log but don't disrupt lesson loading
              console.warn('Lesson email notification failed:', emailErr);
            }
          }
        }
      } catch (err) {
        console.warn('Edge function call failed, using fallback:', err);
        const fallback = FALLBACK_LESSONS[studentLevel] || FALLBACK_LESSONS.academy;
        setLesson(fallback);
        localStorage.setItem(cacheKey, JSON.stringify({ lesson: fallback, completed: false, fluencyScore: currentScore }));
      }

      setLoading(false);
    };

    load();
  }, [user?.id]);

  const markComplete = useCallback(async () => {
    if (!user?.id || completed) return;

    setCompleted(true);

    // Increment fluency_score by 1
    const { data: current } = await supabase
      .from('student_profiles')
      .select('fluency_score')
      .eq('user_id', user.id)
      .maybeSingle();

    const newScore = (current?.fluency_score ?? 0) + 1;

    await supabase
      .from('student_profiles')
      .update({ fluency_score: newScore })
      .eq('user_id', user.id);

    setFluencyScore(newScore);

    // Update cache
    const cacheKey = getCacheKey(user.id);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        localStorage.setItem(cacheKey, JSON.stringify({ ...parsed, completed: true, fluencyScore: newScore }));
      } catch { /* ignore */ }
    }
  }, [user?.id, completed]);

  return { lesson, loading, completed, fluencyScore, markComplete };
}
