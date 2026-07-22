import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MasterLessonFlat } from "@/components/admin/generator/LessonPicker";
import { validateLesson } from "@/lib/lessonValidator";

export type QueueItemStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'skipped';

export interface QueuedLesson {
  lesson: MasterLessonFlat;
  status: QueueItemStatus;
  error?: string;
  retryCount: number;
}

interface BulkGeneratorState {
  queue: QueuedLesson[];
  isProcessing: boolean;
  isPaused: boolean;
  completedCount: number;
  failedCount: number;
  skippedCount: number;
  currentLesson: MasterLessonFlat | null;
}

const RATE_LIMIT_DELAY_MS = 5000; // 5 seconds between requests
const RATE_LIMIT_BACKOFF_MS = 30000; // 30 seconds on 429 error
const MAX_RETRIES = 2;

export const useBulkLessonGenerator = () => {
  const [state, setState] = useState<BulkGeneratorState>({
    queue: [],
    isProcessing: false,
    isPaused: false,
    completedCount: 0,
    failedCount: 0,
    skippedCount: 0,
    currentLesson: null,
  });

  const isPausedRef = useRef(false);
  const isCancelledRef = useRef(false);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const updateQueueItem = useCallback((uniqueKey: string, updates: Partial<QueuedLesson>) => {
    setState(prev => ({
      ...prev,
      queue: prev.queue.map(item =>
        item.lesson.uniqueKey === uniqueKey
          ? { ...item, ...updates }
          : item
      ),
    }));
  }, []);

  const generateSingleLesson = async (lesson: MasterLessonFlat): Promise<any> => {
    const { data, error } = await supabase.functions.invoke("n8n-bridge", {
      body: {
        action: "generate-lesson",
        topic: lesson.lessonTitle,
        system: lesson.system,
        level: lesson.levelName.toLowerCase().includes("beginner") ? "beginner" :
               lesson.levelName.toLowerCase().includes("intermediate") ? "intermediate" : "advanced",
        cefr_level: lesson.cefrLevel,
        lesson_type: lesson.lessonType,
        unit_name: lesson.unitName,
        level_name: lesson.levelName,
        duration_minutes: 60, // Default to 1-hour lessons
      },
    });

    if (error) throw error;

    const lessonData = data?.data || data?.lesson || data;
    if (!lessonData?.presentation && !lessonData?.title && !lessonData?.slides) {
      throw new Error("Invalid lesson format returned - missing required fields");
    }

    // Validate the generated lesson
    const validation = validateLesson(lessonData, 60);
    
    if (!validation.isValid) {
      console.warn(`Lesson "${lesson.lessonTitle}" failed validation:`, validation.errors.slice(0, 5));
      // Still allow saving with warnings, but log the issues
    }

    return { ...lessonData, _validation: validation };
  };

  const saveLessonToDatabase = async (lesson: MasterLessonFlat, generatedData: any) => {
    const { error } = await supabase
      .from("curriculum_lessons")
      .insert({
        title: generatedData.title || lesson.lessonTitle,
        description: `AI-generated ${lesson.system} lesson: ${lesson.lessonTitle}`,
        target_system: lesson.system,
        difficulty_level: lesson.levelName.toLowerCase().includes("beginner") ? "beginner" :
                          lesson.levelName.toLowerCase().includes("intermediate") ? "intermediate" : "advanced",
        content: generatedData as any,
        sequence_order: lesson.lessonNumber,
        xp_reward: 100,
        is_published: false,
      });

    if (error) throw error;
  };

  const processQueue = useCallback(async () => {
    const queue = [...state.queue];
    
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      
      // Check for pause or cancel
      if (isPausedRef.current) {
        toast.info("Generation paused");
        setState(prev => ({ ...prev, isProcessing: false }));
        return;
      }
      
      if (isCancelledRef.current) {
        toast.info("Generation cancelled");
        setState(prev => ({
          ...prev,
          isProcessing: false,
          queue: prev.queue.map((q, idx) =>
            idx >= i && q.status === 'pending'
              ? { ...q, status: 'skipped' as QueueItemStatus }
              : q
          ),
        }));
        return;
      }

      // Skip already completed or skipped items
      if (item.status === 'completed' || item.status === 'skipped') {
        continue;
      }

      // Update current lesson
      setState(prev => ({
        ...prev,
        currentLesson: item.lesson,
      }));
      updateQueueItem(item.lesson.uniqueKey, { status: 'generating' });

      let success = false;
      let retryCount = 0;

      while (!success && retryCount <= MAX_RETRIES) {
        try {
          // Generate lesson
          const generatedData = await generateSingleLesson(item.lesson);
          
          // Save to database
          await saveLessonToDatabase(item.lesson, generatedData);

          // Mark as completed
          updateQueueItem(item.lesson.uniqueKey, { status: 'completed' });
          setState(prev => ({
            ...prev,
            completedCount: prev.completedCount + 1,
          }));
          success = true;

        } catch (error: any) {
          console.error(`Error generating lesson ${item.lesson.uniqueKey}:`, error);
          
          // Handle rate limit
          if (error.message?.includes('429') || error.status === 429) {
            retryCount++;
            if (retryCount <= MAX_RETRIES) {
              toast.warning(`Rate limited. Waiting 30 seconds before retry... (${retryCount}/${MAX_RETRIES})`);
              await delay(RATE_LIMIT_BACKOFF_MS);
              continue;
            }
          }
          
          // Handle payment required
          if (error.message?.includes('402') || error.status === 402) {
            toast.error("Payment required. Please check your API quota.");
            updateQueueItem(item.lesson.uniqueKey, {
              status: 'failed',
              error: "Payment required - API quota exceeded",
            });
            setState(prev => ({
              ...prev,
              isProcessing: false,
              failedCount: prev.failedCount + 1,
            }));
            return; // Stop entire queue
          }

          // Mark as failed after retries exhausted
          updateQueueItem(item.lesson.uniqueKey, {
            status: 'failed',
            error: error.message || "Generation failed",
            retryCount,
          });
          setState(prev => ({
            ...prev,
            failedCount: prev.failedCount + 1,
          }));
          break;
        }
      }

      // Rate limit delay before next lesson (skip for last item)
      if (i < queue.length - 1 && success) {
        await delay(RATE_LIMIT_DELAY_MS);
      }
    }

    // All done
    setState(prev => ({
      ...prev,
      isProcessing: false,
      currentLesson: null,
    }));

    const finalState = state;
    toast.success(`Bulk generation complete! ${finalState.completedCount} lessons generated.`);
  }, [state.queue, updateQueueItem]);

  const startGeneration = useCallback((lessons: MasterLessonFlat[]) => {
    if (lessons.length === 0) {
      toast.error("No lessons to generate");
      return;
    }

    // Reset refs
    isPausedRef.current = false;
    isCancelledRef.current = false;

    // Initialize queue
    const queue: QueuedLesson[] = lessons.map(lesson => ({
      lesson,
      status: 'pending' as QueueItemStatus,
      retryCount: 0,
    }));

    setState({
      queue,
      isProcessing: true,
      isPaused: false,
      completedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      currentLesson: null,
    });

    // Start processing after state update
    setTimeout(() => {
      processQueue();
    }, 100);
  }, [processQueue]);

  const pauseGeneration = useCallback(() => {
    isPausedRef.current = true;
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeGeneration = useCallback(() => {
    isPausedRef.current = false;
    setState(prev => ({ ...prev, isPaused: false, isProcessing: true }));
    processQueue();
  }, [processQueue]);

  const cancelGeneration = useCallback(() => {
    isCancelledRef.current = true;
    setState(prev => ({
      ...prev,
      isProcessing: false,
      isPaused: false,
    }));
  }, []);

  const resetQueue = useCallback(() => {
    isPausedRef.current = false;
    isCancelledRef.current = false;
    setState({
      queue: [],
      isProcessing: false,
      isPaused: false,
      completedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      currentLesson: null,
    });
  }, []);

  const retryFailed = useCallback(() => {
    const failedItems = state.queue.filter(item => item.status === 'failed');
    if (failedItems.length === 0) {
      toast.info("No failed lessons to retry");
      return;
    }

    // Reset failed items to pending
    setState(prev => ({
      ...prev,
      queue: prev.queue.map(item =>
        item.status === 'failed'
          ? { ...item, status: 'pending' as QueueItemStatus, error: undefined, retryCount: 0 }
          : item
      ),
      failedCount: 0,
      isProcessing: true,
      isPaused: false,
    }));

    isPausedRef.current = false;
    isCancelledRef.current = false;
    
    setTimeout(() => {
      processQueue();
    }, 100);
  }, [state.queue, processQueue]);

  return {
    ...state,
    startGeneration,
    pauseGeneration,
    resumeGeneration,
    cancelGeneration,
    resetQueue,
    retryFailed,
    totalCount: state.queue.length,
    progressPercent: state.queue.length > 0
      ? Math.round(((state.completedCount + state.failedCount + state.skippedCount) / state.queue.length) * 100)
      : 0,
  };
};
