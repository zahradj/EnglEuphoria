import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ExplainMistakeParams {
  lessonContext?: string;
  questionText?: string;
  correctAnswer: string;
  userAnswer: string;
}

export function useExplainMistake() {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const explain = useCallback(async (params: ExplainMistakeParams) => {
    setLoading(true);
    setExplanation(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-core', {
        body: {
          action: 'explain_mistake',
          lesson_context: params.lessonContext,
          question_text: params.questionText,
          correct_answer: params.correctAnswer,
          user_answer: params.userAnswer,
        },
      });
      if (error) throw error;
      setExplanation(data?.explanation || 'Keep trying — you\'re getting closer!');
    } catch (e) {
      console.error('explain-mistake error:', e);
      setExplanation('AI is heavily loaded. Please wait 10 seconds and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setExplanation(null);
    setLoading(false);
  }, []);

  return { loading, explanation, explain, reset };
}
