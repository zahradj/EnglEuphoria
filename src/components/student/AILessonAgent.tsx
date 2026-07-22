import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DailyLessonCard, GeneratedLesson } from './DailyLessonCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AILessonAgentProps {
  studentLevel: 'playground' | 'academy' | 'professional';
  studentInterests?: string[];
  cefrLevel?: string;
  onLessonGenerated?: (lesson: GeneratedLesson) => void;
  autoGenerate?: boolean;
}

const thinkingMessages = [
  "Analyzing your interests...",
  "Reviewing your learning style...",
  "Checking your previous mistakes...",
  "Crafting the perfect vocabulary...",
  "Building your personalized quest...",
  "Almost ready...",
];

const levelStyles = {
  playground: {
    buttonClass: 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600',
    accentColor: 'text-pink-500',
    bgAccent: 'bg-pink-50',
  },
  academy: {
    buttonClass: 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600',
    accentColor: 'text-purple-500',
    bgAccent: 'bg-purple-900/20',
  },
  professional: {
    buttonClass: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
    accentColor: 'text-emerald-500',
    bgAccent: 'bg-emerald-50',
  },
};

const normalizeGeneratedLesson = (lesson: Partial<GeneratedLesson> | null | undefined, studentLevel: AILessonAgentProps['studentLevel']): GeneratedLesson => ({
  topic: lesson?.topic || `${studentLevel === 'professional' ? 'Business English: Presentations' : 'Daily Conversations'}`,
  tagline: lesson?.tagline || 'Practice makes perfect!',
  vocabulary: Array.isArray(lesson?.vocabulary) ? lesson.vocabulary : [],
  quest: {
    title: lesson?.quest?.title || 'Conversation Challenge',
    description: lesson?.quest?.description || 'Use your new vocabulary in a short speaking task.',
    type: lesson?.quest?.type || 'dialogue',
  },
  estimatedMinutes: typeof lesson?.estimatedMinutes === 'number' ? lesson.estimatedMinutes : 15,
});

export const AILessonAgent: React.FC<AILessonAgentProps> = ({
  studentLevel,
  studentInterests = ['technology', 'travel'],
  cefrLevel = 'B1',
  onLessonGenerated,
  autoGenerate = true,
}) => {
  const { user } = useAuth();
  const [state, setState] = useState<'ready' | 'thinking' | 'complete'>('ready');
  const [messageIndex, setMessageIndex] = useState(0);
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<{
    learningStyle: string | null;
    weeklyGoal: string | null;
    mistakeHistory: any[];
    interests: string[];
  }>({
    learningStyle: null,
    weeklyGoal: null,
    mistakeHistory: [],
    interests: studentInterests,
  });
  
  const style = levelStyles[studentLevel];
  const isDarkMode = studentLevel === 'academy';

  // Fetch student profile data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('student_profiles')
          .select('learning_style, weekly_goal, mistake_history, interests')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setStudentData({
            learningStyle: data.learning_style,
            weeklyGoal: data.weekly_goal,
            mistakeHistory: (data.mistake_history as any[]) || [],
            interests: data.interests || studentInterests,
          });
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
      }
    };

    fetchStudentData();
  }, [user?.id, studentInterests]);

  // Auto-generate on mount with localStorage caching
  useEffect(() => {
    if (!autoGenerate || !user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `dailyLesson_${user.id}_${today}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Partial<GeneratedLesson>;
        setGeneratedLesson(normalizeGeneratedLesson(parsed, studentLevel));
        setState('complete');
        return;
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    // Auto-trigger generation after student data is loaded
    if (studentData.interests.length > 0 || studentData.learningStyle) {
      generateLesson();
    }
  }, [autoGenerate, user?.id, studentData.interests, studentData.learningStyle]);

  useEffect(() => {
    if (state === 'thinking') {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % thinkingMessages.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [state]);

  const generateLesson = async () => {
    setState('thinking');
    setError(null);
    setMessageIndex(0);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-daily-lesson', {
        body: {
          level: studentLevel,
          cefrLevel,
          interests: studentData.interests,
          learningStyle: studentData.learningStyle,
          weeklyGoal: studentData.weeklyGoal,
          mistakeHistory: studentData.mistakeHistory.slice(0, 10),
        },
      });

      if (fnError) throw new Error(fnError.message);
      
      if (data?.success && data?.lesson) {
        const normalizedLesson = normalizeGeneratedLesson(data.lesson, studentLevel);
        setGeneratedLesson(normalizedLesson);
        onLessonGenerated?.(normalizedLesson);
        setState('complete');
        // Cache lesson for today
        if (user?.id) {
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem(`dailyLesson_${user.id}_${today}`, JSON.stringify(normalizedLesson));
        }
      } else {
        throw new Error(data?.error || 'Failed to generate lesson');
      }
    } catch (err) {
      console.error('Error generating lesson:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate lesson');
      toast.error('Failed to generate lesson. Please try again.');
      
      // Fallback lesson
      const fallbackLesson: GeneratedLesson = {
        topic: `${studentLevel === 'professional' ? 'Business English: Presentations' : 'Daily Conversations'}`,
        tagline: 'Practice makes perfect!',
        vocabulary: [
          { word: 'accomplish', ipa: '/əˈkɒmplɪʃ/', definition: 'to succeed in doing', example: 'We accomplished our goal.' },
          { word: 'collaborate', ipa: '/kəˈlæbəreɪt/', definition: 'to work together', example: "Let's collaborate on this project." },
          { word: 'initiative', ipa: '/ɪˈnɪʃətɪv/', definition: 'the ability to act independently', example: 'She took the initiative.' },
          { word: 'perspective', ipa: '/pəˈspektɪv/', definition: 'a point of view', example: 'From my perspective, it looks good.' },
          { word: 'strategy', ipa: '/ˈstrætədʒi/', definition: 'a plan of action', example: 'We need a new strategy.' },
        ],
        quest: {
          title: 'Conversation Challenge',
          description: 'Use 3 new vocabulary words in a short dialogue about your day.',
          type: 'dialogue',
        },
        estimatedMinutes: 15,
      };
      setGeneratedLesson(normalizeGeneratedLesson(fallbackLesson, studentLevel));
      setState('complete');
    }
  };

  const handleRegenerate = () => {
    // Clear today's cache
    if (user?.id) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.removeItem(`dailyLesson_${user.id}_${today}`);
    }
    setGeneratedLesson(null);
    generateLesson();
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {state === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Button
              onClick={generateLesson}
              className={`w-full py-6 text-lg font-bold text-white shadow-lg hover:shadow-xl transition-all ${style.buttonClass}`}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Today's Lesson
            </Button>
          </motion.div>
        )}

        {state === 'thinking' && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`rounded-2xl p-8 text-center ${
              isDarkMode ? 'bg-purple-900/30 border border-purple-500/30' : `${style.bgAccent} border border-gray-200`
            }`}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-4"
            >
              <Brain className={`w-12 h-12 ${style.accentColor}`} />
            </motion.div>
            
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Agent Working...
            </h3>
            
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`${isDarkMode ? 'text-purple-300' : 'text-gray-600'}`}
            >
              {thinkingMessages[messageIndex]}
            </motion.p>
            
            <div className="flex justify-center gap-1 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                  className={`w-2 h-2 rounded-full ${
                    isDarkMode ? 'bg-purple-400' : 'bg-purple-500'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {state === 'complete' && generatedLesson && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <DailyLessonCard
              lesson={generatedLesson}
              studentLevel={studentLevel}
              onStartQuest={() => toast.success('Starting quest!')}
            />
            
            <Button
              variant="outline"
              onClick={handleRegenerate}
              className={`w-full ${isDarkMode ? 'border-purple-500/30 text-purple-300' : ''}`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Lesson
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && state === 'complete' && (
        <p className={`text-sm text-center ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
          ⚠️ Using fallback lesson. AI will be back soon!
        </p>
      )}
    </div>
  );
};
