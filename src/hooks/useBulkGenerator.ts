import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateLesson, ValidationResult } from "@/lib/lessonValidator";

export interface BulkLessonItem {
  id: string;
  topic: string;
  system: string;
  level: string;
  levelId?: string;
  cefrLevel: string;
  unitId?: string;
  unitName?: string;
  levelName?: string;
  lessonNumber: number;
  durationMinutes: number;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'saved';
  generatedLesson?: any;
  validation?: ValidationResult;
  error?: string;
  retryCount: number;
}

interface UseBulkGeneratorOptions {
  delayBetweenLessons?: number; // ms
  maxRetries?: number;
  retryBackoffMs?: number;
}

const DEFAULT_OPTIONS: UseBulkGeneratorOptions = {
  delayBetweenLessons: 5000, // 5 seconds between lessons
  maxRetries: 2,
  retryBackoffMs: 30000, // 30 second backoff on 429 errors
};

export const useBulkGenerator = (options: UseBulkGeneratorOptions = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const [queue, setQueue] = useState<BulkLessonItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);
  const isCancelledRef = useRef(false);

  // Initialize queue from unit lessons
  const initializeQueue = useCallback((lessons: Omit<BulkLessonItem, 'id' | 'status' | 'retryCount'>[]) => {
    const items: BulkLessonItem[] = lessons.map((lesson, index) => ({
      ...lesson,
      id: `bulk-${index}-${Date.now()}`,
      status: 'pending',
      retryCount: 0,
    }));
    setQueue(items);
    setCurrentIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    isCancelledRef.current = false;
    return items;
  }, []);

  // Generate a single lesson
  const generateSingleLesson = async (item: BulkLessonItem): Promise<BulkLessonItem> => {
    try {
      const { data, error } = await supabase.functions.invoke("n8n-bridge", {
        body: {
          action: "generate-lesson",
          topic: item.topic,
          system: item.system,
          level: item.level,
          level_id: item.levelId,
          cefr_level: item.cefrLevel,
          unit_name: item.unitName,
          level_name: item.levelName,
          duration_minutes: item.durationMinutes,
        },
      });

      if (error) {
        // Check for rate limit
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          return { 
            ...item, 
            status: 'failed', 
            error: 'Rate limit - will retry',
            retryCount: item.retryCount + 1
          };
        }
        throw error;
      }

      const lessonData = data?.data || data?.lesson || data;
      
      if (data?.status === "success" && lessonData) {
        const validation = validateLesson(lessonData, item.durationMinutes);
        return {
          ...item,
          status: 'completed',
          generatedLesson: lessonData,
          validation,
          error: undefined,
        };
      } else if (lessonData?.presentation || lessonData?.title || lessonData?.slides) {
        const validation = validateLesson(lessonData, item.durationMinutes);
        return {
          ...item,
          status: 'completed',
          generatedLesson: lessonData,
          validation,
          error: undefined,
        };
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error: any) {
      console.error(`Error generating lesson "${item.topic}":`, error);
      return {
        ...item,
        status: 'failed',
        error: error.message || 'Unknown error',
        retryCount: item.retryCount + 1,
      };
    }
  };

  // Delay helper
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Run the queue
  const startGeneration = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setIsPaused(false);
    isPausedRef.current = false;
    isCancelledRef.current = false;
    abortControllerRef.current = new AbortController();

    const pendingItems = queue.filter(item => 
      item.status === 'pending' || 
      (item.status === 'failed' && item.retryCount < config.maxRetries!)
    );

    if (pendingItems.length === 0) {
      toast.info("No pending lessons to generate");
      setIsRunning(false);
      return;
    }

    toast.info(`Starting bulk generation of ${pendingItems.length} lessons...`);

    for (let i = 0; i < queue.length; i++) {
      // Check if cancelled
      if (isCancelledRef.current) {
        break;
      }

      // Wait while paused
      while (isPausedRef.current && !isCancelledRef.current) {
        await delay(500);
      }

      if (isCancelledRef.current) break;

      const item = queue[i];
      
      // Skip already completed or saved items
      if (item.status === 'completed' || item.status === 'saved') {
        continue;
      }

      // Skip failed items that exceeded retries
      if (item.status === 'failed' && item.retryCount >= config.maxRetries!) {
        continue;
      }

      setCurrentIndex(i);
      
      // Update status to generating
      setQueue(prev => prev.map((q, idx) => 
        idx === i ? { ...q, status: 'generating' } : q
      ));

      // Handle retry backoff
      if (item.status === 'failed' && item.retryCount > 0) {
        toast.info(`Waiting ${config.retryBackoffMs! / 1000}s before retry...`);
        await delay(config.retryBackoffMs!);
      }

      // Generate the lesson
      const result = await generateSingleLesson(item);

      // Update queue with result
      setQueue(prev => prev.map((q, idx) => 
        idx === i ? result : q
      ));

      // Auto-select first completed lesson for preview
      if (result.status === 'completed' && !selectedLessonId) {
        setSelectedLessonId(result.id);
      }

      // Delay between lessons (unless it's the last one or cancelled)
      if (i < queue.length - 1 && !isCancelledRef.current && !isPausedRef.current) {
        await delay(config.delayBetweenLessons!);
      }
    }

    setIsRunning(false);
    
    const completed = queue.filter(q => q.status === 'completed' || q.status === 'saved').length;
    const failed = queue.filter(q => q.status === 'failed').length;
    
    if (!isCancelledRef.current) {
      toast.success(`Bulk generation complete: ${completed} succeeded, ${failed} failed`);
    }
  }, [queue, isRunning, config, selectedLessonId]);

  // Pause generation
  const pauseGeneration = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
    toast.info("Generation paused");
  }, []);

  // Resume generation
  const resumeGeneration = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    toast.info("Generation resumed");
  }, []);

  // Cancel generation
  const cancelGeneration = useCallback(() => {
    isCancelledRef.current = true;
    isPausedRef.current = false;
    setIsPaused(false);
    setIsRunning(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    toast.info("Generation cancelled");
  }, []);

  // Save a single lesson
  const saveSingleLesson = useCallback(async (lessonId: string): Promise<boolean> => {
    const item = queue.find(q => q.id === lessonId);
    if (!item || !item.generatedLesson) {
      toast.error("No lesson to save");
      return false;
    }

    try {
      const { error } = await supabase
        .from("curriculum_lessons")
        .insert({
          title: item.generatedLesson.title,
          description: `AI-generated ${item.system} lesson on ${item.topic}`,
          target_system: item.system,
          difficulty_level: item.level,
          content: item.generatedLesson,
          level_id: item.levelId || null,
          unit_id: item.unitId || null,
          sequence_order: item.lessonNumber || 1,
          xp_reward: 100,
          is_published: false,
        });

      if (error) throw error;

      setQueue(prev => prev.map(q => 
        q.id === lessonId ? { ...q, status: 'saved' } : q
      ));

      toast.success(`Saved: ${item.generatedLesson.title}`);
      return true;
    } catch (error: any) {
      console.error("Error saving lesson:", error);
      toast.error(`Failed to save: ${error.message}`);
      return false;
    }
  }, [queue]);

  // Save all completed lessons
  const saveAllLessons = useCallback(async (): Promise<number> => {
    const completedItems = queue.filter(q => q.status === 'completed' && q.generatedLesson);
    
    if (completedItems.length === 0) {
      toast.info("No completed lessons to save");
      return 0;
    }

    toast.info(`Saving ${completedItems.length} lessons...`);
    
    let savedCount = 0;
    
    for (const item of completedItems) {
      const success = await saveSingleLesson(item.id);
      if (success) savedCount++;
    }

    toast.success(`Saved ${savedCount} of ${completedItems.length} lessons`);
    return savedCount;
  }, [queue, saveSingleLesson]);

  // Get stats
  const getStats = useCallback(() => {
    return {
      total: queue.length,
      pending: queue.filter(q => q.status === 'pending').length,
      generating: queue.filter(q => q.status === 'generating').length,
      completed: queue.filter(q => q.status === 'completed').length,
      failed: queue.filter(q => q.status === 'failed').length,
      saved: queue.filter(q => q.status === 'saved').length,
    };
  }, [queue]);

  // Get selected lesson for preview
  const getSelectedLesson = useCallback(() => {
    return queue.find(q => q.id === selectedLessonId);
  }, [queue, selectedLessonId]);

  return {
    queue,
    isRunning,
    isPaused,
    currentIndex,
    selectedLessonId,
    initializeQueue,
    startGeneration,
    pauseGeneration,
    resumeGeneration,
    cancelGeneration,
    saveSingleLesson,
    saveAllLessons,
    getStats,
    getSelectedLesson,
    setSelectedLessonId,
  };
};
