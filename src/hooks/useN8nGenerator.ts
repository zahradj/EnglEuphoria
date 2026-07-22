import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateLesson, ValidationResult } from "@/lib/lessonValidator";
import { GenerationStage } from "@/components/admin/generator/GenerationProgress";

interface GenerateParams {
  topic: string;
  system: string;
  level: string;
  levelId?: string;
  cefrLevel: string;
  unitId?: string;
  lessonNumber?: number;
  lessonType?: string;
  unitName?: string;
  levelName?: string;
  durationMinutes?: number;
}

interface GeneratedLesson {
  system: string;
  title: string;
  slides?: any[];
  presentation: any;
  practice: any;
  production: any;
  _validation?: ValidationResult;
}

export const useN8nGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [generationStage, setGenerationStage] = useState<GenerationStage>('connecting');
  const [generationStartTime, setGenerationStartTime] = useState<number>(Date.now());
  const [isCancelled, setIsCancelled] = useState(false);
  
  // AbortController ref for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsCancelled(true);
    setIsGenerating(false);
    setGenerationStage('connecting');
    toast.info("Generation cancelled");
  }, []);

  const generateLesson = async (params: GenerateParams) => {
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    setIsGenerating(true);
    setIsCancelled(false);
    setGeneratedLesson(null);
    setValidationResult(null);
    setGenerationStage('connecting');
    setGenerationStartTime(Date.now());

    try {
      const durationMinutes = params.durationMinutes || 60;
      
      // Move to generating stage after a brief delay
      setTimeout(() => setGenerationStage('generating'), 500);
      
      const { data, error } = await supabase.functions.invoke("n8n-bridge", {
        body: {
          action: "generate-lesson",
          topic: params.topic,
          system: params.system,
          level: params.level,
          level_id: params.levelId,
          cefr_level: params.cefrLevel,
          lesson_type: params.lessonType,
          unit_name: params.unitName,
          level_name: params.levelName,
          duration_minutes: durationMinutes,
        },
      });

      if (error) throw error;

      // Move to validating stage
      setGenerationStage('validating');

      // Handle various response formats
      const lessonData = data?.data || data?.lesson || data;
      
      if (data?.status === "success" && lessonData) {
        // Check for server-side validation
        const serverValidation = lessonData._validation;
        
        // Also run client-side validation as double-check
        const clientValidation = validateLesson(lessonData, durationMinutes);
        const finalValidation = serverValidation || clientValidation;
        
        setValidationResult(finalValidation);
        setGeneratedLesson(lessonData);
        setGenerationStage('complete');
        
        if (!finalValidation.isValid) {
          toast.warning(`Lesson generated with issues (${finalValidation.score}% complete). Review validation report.`);
        } else if (finalValidation.warnings.length > 0) {
          toast.success(`Lesson generated (${finalValidation.score}% complete) with ${finalValidation.warnings.length} warnings.`);
        } else {
          toast.success(data?.message || `Lesson generated successfully! (${finalValidation.score}%)`);
        }
        
        return lessonData;
      } else if (lessonData?.presentation || lessonData?.title || lessonData?.slides) {
        // Run client-side validation
        const clientValidation = validateLesson(lessonData, durationMinutes);
        setValidationResult(clientValidation);
        setGeneratedLesson(lessonData);
        setGenerationStage('complete');
        
        if (!clientValidation.isValid) {
          toast.warning(`Lesson generated with issues (${clientValidation.score}% complete).`);
        } else {
          toast.success(`Lesson generated successfully! (${clientValidation.score}%)`);
        }
        
        return lessonData;
      } else {
        console.error("Unexpected response format:", data);
        throw new Error(data?.error || "Failed to generate lesson - unexpected response format");
      }
    } catch (error: any) {
      // Don't show error if it was cancelled
      if (error.name === 'AbortError' || isCancelled) {
        return null;
      }
      console.error("Error generating lesson:", error);
      toast.error(error.message || "Failed to generate lesson");
      return null;
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const saveLesson = async (params: GenerateParams) => {
    if (!generatedLesson) {
      toast.error("No lesson to save");
      return null;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from("curriculum_lessons")
        .insert({
          title: generatedLesson.title,
          description: `AI-generated ${params.system} lesson on ${params.topic}`,
          target_system: params.system,
          difficulty_level: params.level,
          content: generatedLesson as any,
          level_id: params.levelId || null,
          unit_id: params.unitId || null,
          sequence_order: params.lessonNumber || 1,
          xp_reward: 100,
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Toast handled by caller for navigation purposes
      setGeneratedLesson(null);
      setEditingLessonId(null);
      return data;
    } catch (error: any) {
      console.error("Error saving lesson:", error);
      toast.error(error.message || "Failed to save lesson");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const regenerateLesson = async (lessonId: string, params: GenerateParams) => {
    if (!generatedLesson) {
      toast.error("No lesson to save");
      return null;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from("curriculum_lessons")
        .update({
          title: generatedLesson.title,
          description: `AI-generated ${params.system} lesson on ${params.topic}`,
          target_system: params.system,
          difficulty_level: params.level,
          content: generatedLesson as any,
          level_id: params.levelId || null,
          unit_id: params.unitId || null,
          sequence_order: params.lessonNumber || 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", lessonId)
        .select()
        .single();

      if (error) throw error;

      // Toast handled by caller for navigation purposes
      setGeneratedLesson(null);
      setEditingLessonId(null);
      return data;
    } catch (error: any) {
      console.error("Error updating lesson:", error);
      toast.error(error.message || "Failed to update lesson");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const discardLesson = () => {
    setGeneratedLesson(null);
    setEditingLessonId(null);
    setValidationResult(null);
    toast.info("Lesson discarded");
  };

  const setEditing = (lessonId: string | null) => {
    setEditingLessonId(lessonId);
  };

  const clearValidation = () => {
    setValidationResult(null);
  };

  return {
    isGenerating,
    generatedLesson,
    isSaving,
    editingLessonId,
    validationResult,
    generationStage,
    generationStartTime,
    isCancelled,
    generateLesson,
    saveLesson,
    regenerateLesson,
    discardLesson,
    setEditing,
    clearValidation,
    cancelGeneration,
  };
};
