import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReinforcementLessonResult {
  title: string;
  targetSkill: string;
  durationMinutes: number;
  objectives: string[];
  warmUp: { durationMinutes: number; activity: string };
  activities: {
    activityNumber: number;
    title: string;
    skill: string;
    durationMinutes: number;
    instructions: string;
    materials: string;
    scaffolding: string;
  }[];
  miniAssessment: {
    type: string;
    questions: { question: string; expectedAnswer: string }[];
    passingCriteria: string;
  };
  teacherNotes: string;
}

export const useReinforcementLesson = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lesson, setLesson] = useState<ReinforcementLessonResult | null>(null);
  const { toast } = useToast();

  const generate = async ({
    unitId,
    weakestSkill,
    studentId,
  }: {
    unitId: string;
    weakestSkill: string;
    studentId: string;
  }) => {
    setIsGenerating(true);
    try {
      // Fetch unit data
      const { data: unit } = await supabase
        .from('curriculum_units')
        .select('title, cefr_level, age_group')
        .eq('id', unitId)
        .single();

      if (!unit) throw new Error('Unit not found');

      // Fetch vocabulary progress for this unit
      const { data: vocabData } = await supabase
        .from('student_vocabulary_progress')
        .select('word')
        .eq('student_id', studentId)
        .eq('unit_id', unitId);

      const vocabularyWords = vocabData?.map((v: any) => v.word) || [];

      // Fetch lessons for grammar patterns
      const { data: lessons } = await supabase
        .from('curriculum_lessons')
        .select('grammar_pattern, phonics_focus')
        .eq('unit_id', unitId);

      const grammarPatterns = lessons
        ?.map((l: any) => l.grammar_pattern)
        .filter(Boolean) || [];
      const phonemeFocus = lessons?.find((l: any) => l.phonics_focus)?.phonics_focus || '';

      const { data, error } = await supabase.functions.invoke('curriculum-expert-agent', {
        body: {
          mode: 'reinforcement_lesson',
          ageGroup: unit.age_group || '5-7',
          cefrLevel: unit.cefr_level || 'A1',
          weakestSkill,
          unitTitle: unit.title,
          vocabularyWords: vocabularyWords.length > 0 ? vocabularyWords : ['cat', 'dog', 'bird'],
          grammarPatterns,
          phonemeFocus,
          prompt: `Generate a reinforcement lesson targeting "${weakestSkill}" for unit "${unit.title}".`,
        },
      });

      if (error) throw error;
      setLesson(data);
      toast({
        title: '✨ Reinforcement Lesson Ready',
        description: `A personalized ${weakestSkill} practice lesson has been created.`,
      });
      return data;
    } catch (err: any) {
      console.error('Reinforcement lesson error:', err);
      toast({
        title: 'Generation Failed',
        description: err.message || 'Could not generate reinforcement lesson.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generate, isGenerating, lesson };
};
