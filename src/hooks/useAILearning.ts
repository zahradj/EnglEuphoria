import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AILearningModel {
  id: string;
  student_id: string;
  model_type: 'adaptive_path' | 'learning_style' | 'difficulty_preference';
  model_data: any;
  confidence_score: number;
  last_updated_at: string;
  created_at: string;
}

export interface PersonalizedLearningPath {
  id: string;
  student_id: string;
  path_name: string;
  current_step: number;
  total_steps: number;
  path_data: any;
  learning_style: string;
  difficulty_preference: string;
  estimated_completion_days: number;
  completion_percentage: number;
  ai_generated: boolean;
  last_activity_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface AdaptiveContent {
  id: string;
  title: string;
  content_type: 'lesson' | 'exercise' | 'quiz' | 'worksheet';
  difficulty_level: number;
  cefr_level: string;
  learning_objectives: string[];
  content_data: any;
  ai_generated: boolean;
  tags: string[];
  estimated_duration: number;
  success_rate: number;
  is_active: boolean;
  created_at: string;
}

export const useAILearning = () => {
  const [learningModels, setLearningModels] = useState<AILearningModel[]>([]);
  const [learningPaths, setLearningPaths] = useState<PersonalizedLearningPath[]>([]);
  const [adaptiveContent, setAdaptiveContent] = useState<AdaptiveContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch user's learning models
  const fetchLearningModels = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_learning_models')
        .select('*')
        .eq('student_id', studentId);

      if (error) throw error;
      setLearningModels(data || []);
    } catch (error) {
      console.error('Error fetching learning models:', error);
      toast({
        title: "Error",
        description: "Failed to load learning models",
        variant: "destructive"
      });
    }
  };

  // Fetch user's learning paths
  const fetchLearningPaths = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('personalized_learning_paths')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLearningPaths(data || []);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      toast({
        title: "Error",
        description: "Failed to load learning paths",
        variant: "destructive"
      });
    }
  };

  // Fetch adaptive content
  const fetchAdaptiveContent = async (cefrLevel?: string, contentType?: string) => {
    try {
      let query = supabase
        .from('adaptive_content')
        .select('*')
        .eq('is_active', true)
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (cefrLevel) {
        query = query.eq('cefr_level', cefrLevel);
      }

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAdaptiveContent(data || []);
    } catch (error) {
      console.error('Error fetching adaptive content:', error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive"
      });
    }
  };

  // Generate personalized learning path
  const generateLearningPath = async (
    studentId: string,
    cefrLevel: string,
    learningStyle = 'mixed',
    difficultyPreference = 'adaptive'
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('generate_adaptive_learning_path', {
        student_uuid: studentId,
        target_cefr_level: cefrLevel,
        learning_style_param: learningStyle,
        difficulty_pref: difficultyPreference
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Personalized learning path generated!",
      });

      // Refresh learning paths
      await fetchLearningPaths(studentId);
      return data;
    } catch (error) {
      console.error('Error generating learning path:', error);
      toast({
        title: "Error",
        description: "Failed to generate learning path",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate adaptive content using AI
  const generateContent = async (params: {
    contentType: string;
    cefrLevel: string;
    topic: string;
    difficultyLevel: number;
    learningObjectives?: string[];
    duration?: number;
    studentId?: string;
  }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: params
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "AI content generated successfully!",
      });

      // Refresh adaptive content
      await fetchAdaptiveContent();
      return data;
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update learning model
  const updateLearningModel = async (
    studentId: string,
    modelType: string,
    modelData: any,
    confidence = 0.8
  ) => {
    try {
      const { data, error } = await supabase.rpc('update_learning_model', {
        student_uuid: studentId,
        model_type_param: modelType,
        new_model_data: modelData,
        confidence
      });

      if (error) throw error;

      // Refresh learning models
      await fetchLearningModels(studentId);
      return data;
    } catch (error) {
      console.error('Error updating learning model:', error);
      toast({
        title: "Error",
        description: "Failed to update learning model",
        variant: "destructive"
      });
    }
  };

  // Record learning event
  const recordLearningEvent = async (
    studentId: string,
    eventType: string,
    eventData: any,
    contentId?: string,
    sessionId?: string
  ) => {
    try {
      const { error } = await supabase
        .from('ai_learning_events')
        .insert({
          student_id: studentId,
          event_type: eventType,
          content_id: contentId,
          session_id: sessionId,
          event_data: eventData,
          performance_score: eventData.performance_score,
          time_spent_seconds: eventData.time_spent_seconds,
          help_requested: eventData.help_requested,
          difficulty_rating: eventData.difficulty_rating
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording learning event:', error);
    }
  };

  // Update learning path progress
  const updateLearningProgress = async (pathId: string, step: number) => {
    try {
      const { error } = await supabase
        .from('personalized_learning_paths')
        .update({
          current_step: step,
          completion_percentage: Math.min(100, (step / learningPaths.find(p => p.id === pathId)?.total_steps || 1) * 100),
          last_activity_at: new Date().toISOString()
        })
        .eq('id', pathId);

      if (error) throw error;

      // Refresh learning paths
      const pathOwner = learningPaths.find(p => p.id === pathId)?.student_id;
      if (pathOwner) {
        await fetchLearningPaths(pathOwner);
      }
    } catch (error) {
      console.error('Error updating learning progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
    }
  };

  return {
    learningModels,
    learningPaths,
    adaptiveContent,
    isLoading,
    fetchLearningModels,
    fetchLearningPaths,
    fetchAdaptiveContent,
    generateLearningPath,
    generateContent,
    updateLearningModel,
    recordLearningEvent,
    updateLearningProgress
  };
};