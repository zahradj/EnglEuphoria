import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, CheckCircle, Sparkles } from 'lucide-react';
import { VoiceRecorder, SpeechEvaluation } from '@/components/lesson-player/VoiceRecorder';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMasteryTracker } from '@/hooks/useMasteryTracker';
import { useStreak } from '@/hooks/useStreak';
import { cn } from '@/lib/utils';

const DAILY_GYM_KEY = 'daily_voice_gym_completed';

/** Sentence templates keyed by item_type */
const SENTENCE_TEMPLATES: Record<string, string[]> = {
  vocabulary: [
    'I would like to use the word "{word}" in a sentence.',
    'Can you tell me what "{word}" means?',
    'She learned the word "{word}" yesterday.',
    'The word "{word}" is very important to remember.',
  ],
  grammar: [
    'I have been practicing {word} every day.',
    'Understanding {word} helps me speak better.',
    'My teacher explained {word} clearly.',
  ],
  phonics: [
    'Let me practice saying "{word}" out loud.',
    'I can pronounce "{word}" correctly now.',
  ],
};

const DEFAULT_TEMPLATES = [
  'I enjoy learning English every single day.',
  'Practice makes perfect when you never give up.',
  'Today is a wonderful day to learn something new.',
  'Speaking English with confidence is my goal.',
];

function buildSentence(itemKey: string, itemType: string): string {
  const templates = SENTENCE_TEMPLATES[itemType] || DEFAULT_TEMPLATES;
  const tpl = templates[Math.floor(Math.random() * templates.length)];
  return tpl.replace('{word}', itemKey);
}

function isTodayCompleted(): boolean {
  const stored = localStorage.getItem(DAILY_GYM_KEY);
  if (!stored) return false;
  const today = new Date().toISOString().slice(0, 10);
  return stored === today;
}

function markTodayCompleted() {
  localStorage.setItem(DAILY_GYM_KEY, new Date().toISOString().slice(0, 10));
}

interface DashboardVoiceGymProps {
  hub?: 'playground' | 'academy' | 'success';
}

export const DashboardVoiceGym: React.FC<DashboardVoiceGymProps> = ({
  hub = 'academy',
}) => {
  const { user } = useAuth();
  const [weakItem, setWeakItem] = useState<{ item_key: string; item_type: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(isTodayCompleted());
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id || completed) {
      setLoading(false);
      return;
    }

    const fetchWeakest = async () => {
      // Get the lowest-scoring item from student_mastery
      const { data, error } = await supabase
        .from('student_mastery')
        .select('item_key, item_type, mastery_score')
        .eq('user_id', user.id)
        .order('mastery_score', { ascending: true })
        .limit(5);

      if (!error && data && data.length > 0) {
        // Pick a random one from the bottom 5 for variety
        const pick = data[Math.floor(Math.random() * data.length)];
        setWeakItem({ item_key: pick.item_key, item_type: pick.item_type || 'vocabulary' });
      }
      setLoading(false);
    };

    fetchWeakest();
  }, [user?.id, completed]);

  const targetSentence = useMemo(() => {
    if (weakItem) return buildSentence(weakItem.item_key, weakItem.item_type);
    return DEFAULT_TEMPLATES[Math.floor(Math.random() * DEFAULT_TEMPLATES.length)];
  }, [weakItem]);

  const { trackMastery } = useMasteryTracker();
  const { bumpStreak } = useStreak();

  const handleResult = (result: SpeechEvaluation) => {
    setScore(result.overallScore);
    const passed = result.overallScore >= 80;

    // Track mastery for the practiced item
    if (weakItem) {
      trackMastery(weakItem.item_key, passed, weakItem.item_type, hub);
    }

    if (passed) {
      markTodayCompleted();
      setCompleted(true);
      bumpStreak();
    }
  };

  if (loading) return null;

  const borderColor =
    hub === 'playground'
      ? 'border-l-orange-500'
      : hub === 'success'
        ? 'border-l-emerald-500'
        : 'border-l-indigo-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'rounded-2xl shadow-md p-6 border-l-4 backdrop-blur-xl',
        'bg-card/80 border border-border/40',
        borderColor
      )}
    >
      <AnimatePresence mode="wait">
        {completed ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="text-lg font-semibold">Great job! +10 Daily XP</p>
            <p className="text-sm text-muted-foreground">Come back tomorrow for a new challenge 🎉</p>
          </motion.div>
        ) : (
          <motion.div key="challenge" className="space-y-4">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">🎙️ Daily Speaking Challenge</h3>
            </div>

            {weakItem ? (
              <p className="text-sm text-muted-foreground">
                You recently learned <span className="font-medium text-foreground">"{weakItem.item_key}"</span>. 
                Let's practice your pronunciation! Read this out loud:
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Warm up your speaking skills! Read this out loud:
              </p>
            )}

            <VoiceRecorder
              targetSentence={targetSentence}
              hub={hub}
              context="daily-voice-gym"
              onResult={handleResult}
            />

            {score !== null && score < 80 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
              >
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Almost there! Try again — you can do it! 💪
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DashboardVoiceGym;
