import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemKey } from '@/data/masterCurriculum';
import { FlatLesson } from '@/hooks/useCurriculumProgress';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { validateLesson } from '@/lib/lessonValidator';

export interface QueuedLesson {
  lesson: FlatLesson;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'skipped';
  error?: string;
  unitKey: string;
}

export interface UnitQueueStatus {
  systemKey: SystemKey;
  levelName: string;
  unitNumber: number;
  unitName: string;
  totalLessons: number;
  completedLessons: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

interface MultiUnitGeneratorState {
  queue: QueuedLesson[];
  unitStatuses: UnitQueueStatus[];
  isProcessing: boolean;
  isPaused: boolean;
  isCancelled: boolean;
  currentLesson: FlatLesson | null;
  completedCount: number;
  failedCount: number;
  currentUnitKey: string | null;
}

const RATE_LIMIT_DELAY_MS = 5000;
const RATE_LIMIT_BACKOFF_MS = 30000;
const MAX_RETRIES = 2;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useMultiUnitBulkGenerator() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<MultiUnitGeneratorState>({
    queue: [],
    unitStatuses: [],
    isProcessing: false,
    isPaused: false,
    isCancelled: false,
    currentLesson: null,
    completedCount: 0,
    failedCount: 0,
    currentUnitKey: null,
  });

  const isPausedRef = useRef(false);
  const isCancelledRef = useRef(false);

  const getUnitKey = (systemKey: SystemKey, levelName: string, unitNumber: number) =>
    `${systemKey}:${levelName}:${unitNumber}`;

  const initializeQueue = useCallback(
    (
      lessons: FlatLesson[],
      units: Array<{
        systemKey: SystemKey;
        levelName: string;
        unitNumber: number;
        unitName: string;
      }>
    ) => {
      const unitStatuses: UnitQueueStatus[] = units.map((unit) => {
        const unitLessons = lessons.filter(
          (l) =>
            l.systemKey === unit.systemKey &&
            l.levelName === unit.levelName &&
            l.unitNumber === unit.unitNumber
        );
        return {
          ...unit,
          totalLessons: unitLessons.length,
          completedLessons: 0,
          status: 'pending' as const,
        };
      });

      const queue: QueuedLesson[] = lessons.map((lesson) => ({
        lesson,
        status: 'pending' as const,
        unitKey: getUnitKey(lesson.systemKey, lesson.levelName, lesson.unitNumber),
      }));

      setState((prev) => ({
        ...prev,
        queue,
        unitStatuses,
        completedCount: 0,
        failedCount: 0,
        isProcessing: false,
        isPaused: false,
        isCancelled: false,
      }));

      isPausedRef.current = false;
      isCancelledRef.current = false;
    },
    []
  );

  const updateQueueItemStatus = useCallback(
    (
      uniqueKey: string,
      status: QueuedLesson['status'],
      error?: string
    ) => {
      setState((prev) => ({
        ...prev,
        queue: prev.queue.map((item) =>
          item.lesson.uniqueKey === uniqueKey
            ? { ...item, status, error }
            : item
        ),
      }));
    },
    []
  );

  const updateUnitStatus = useCallback(
    (unitKey: string, updates: Partial<UnitQueueStatus>) => {
      setState((prev) => ({
        ...prev,
        unitStatuses: prev.unitStatuses.map((unit) =>
          getUnitKey(unit.systemKey, unit.levelName, unit.unitNumber) === unitKey
            ? { ...unit, ...updates }
            : unit
        ),
      }));
    },
    []
  );

  const generateLesson = async (lesson: FlatLesson) => {
    const { data, error } = await supabase.functions.invoke('n8n-bridge', {
      body: {
        action: 'generate-lesson',
        topic: lesson.lessonTitle,
        system: lesson.systemKey,
        level: lesson.levelName,
        cefr_level: lesson.cefrLevel,
        lesson_type: lesson.lessonType,
        unit_name: lesson.unitName,
        level_name: lesson.levelName,
        unitNumber: lesson.unitNumber,
        lessonNumber: lesson.lessonNumber,
        duration_minutes: 60, // Default to 1-hour lessons
      },
    });

    if (error) throw error;
    
    // Extract the lesson data from the response
    const lessonData = data?.data || data?.lesson || data;
    if (!lessonData?.presentation && !lessonData?.title && !lessonData?.slides) {
      throw new Error("Invalid lesson format returned from AI");
    }
    
    // Validate the generated lesson
    const validation = validateLesson(lessonData, 60);
    
    if (!validation.isValid) {
      console.warn(`Lesson "${lesson.lessonTitle}" has validation issues:`, validation.errors.slice(0, 5));
    }
    
    return { ...lessonData, _validation: validation };
  };

  const saveLessonToDatabase = async (
    lesson: FlatLesson,
    generatedContent: any
  ) => {
    const { error } = await supabase.from('curriculum_lessons').insert({
      title: lesson.lessonTitle,
      description: `${lesson.lessonType} lesson for ${lesson.levelName}`,
      target_system: lesson.systemKey,
      difficulty_level: lesson.cefrLevel,
      duration_minutes: 30,
      content: generatedContent,
      is_published: true,
      xp_reward: 50,
    });

    if (error) throw error;
  };

  const startGeneration = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isProcessing: true,
      isPaused: false,
      isCancelled: false,
    }));

    isPausedRef.current = false;
    isCancelledRef.current = false;

    const { queue, unitStatuses } = state;
    let completedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < queue.length; i++) {
      if (isCancelledRef.current) {
        // Mark remaining as skipped
        queue.slice(i).forEach((item) => {
          updateQueueItemStatus(item.lesson.uniqueKey, 'skipped');
        });
        break;
      }

      while (isPausedRef.current && !isCancelledRef.current) {
        await delay(500);
      }

      if (isCancelledRef.current) break;

      const item = queue[i];
      const unitKey = item.unitKey;

      setState((prev) => ({
        ...prev,
        currentLesson: item.lesson,
        currentUnitKey: unitKey,
      }));

      updateQueueItemStatus(item.lesson.uniqueKey, 'generating');
      updateUnitStatus(unitKey, { status: 'generating' });

      let retryCount = 0;
      let success = false;

      while (retryCount <= MAX_RETRIES && !success) {
        try {
          const result = await generateLesson(item.lesson);
          await saveLessonToDatabase(item.lesson, result);

          updateQueueItemStatus(item.lesson.uniqueKey, 'completed');
          completedCount++;
          success = true;

          // Update unit completed count
          const unitStatus = unitStatuses.find(
            (u) => getUnitKey(u.systemKey, u.levelName, u.unitNumber) === unitKey
          );
          if (unitStatus) {
            const newCompletedCount = queue
              .filter((q) => q.unitKey === unitKey && q.status === 'completed')
              .length + 1;
            
            updateUnitStatus(unitKey, {
              completedLessons: newCompletedCount,
              status: newCompletedCount >= unitStatus.totalLessons ? 'completed' : 'generating',
            });
          }

          setState((prev) => ({
            ...prev,
            completedCount,
          }));
        } catch (error: any) {
          console.error('[MultiUnitGenerator] Error:', error);

          if (error.message?.includes('429') || error.status === 429) {
            retryCount++;
            if (retryCount <= MAX_RETRIES) {
              toast.warning(`Rate limited. Waiting 30 seconds... (Retry ${retryCount}/${MAX_RETRIES})`);
              await delay(RATE_LIMIT_BACKOFF_MS);
              continue;
            }
          }

          if (error.message?.includes('402') || error.status === 402) {
            toast.error('Payment required. Please check your subscription.');
            isCancelledRef.current = true;
            break;
          }

          updateQueueItemStatus(item.lesson.uniqueKey, 'failed', error.message);
          failedCount++;
          updateUnitStatus(unitKey, { status: 'failed' });

          setState((prev) => ({
            ...prev,
            failedCount,
          }));
          break;
        }
      }

      // Rate limit delay between lessons
      if (i < queue.length - 1 && success && !isCancelledRef.current) {
        await delay(RATE_LIMIT_DELAY_MS);
      }
    }

    // Invalidate queries to refresh progress
    await queryClient.invalidateQueries({ queryKey: ['curriculum-progress'] });

    setState((prev) => ({
      ...prev,
      isProcessing: false,
      currentLesson: null,
      currentUnitKey: null,
    }));

    if (completedCount > 0) {
      toast.success(`Generated ${completedCount} lessons successfully!`);
    }
    if (failedCount > 0) {
      toast.error(`${failedCount} lessons failed to generate.`);
    }
  }, [state, updateQueueItemStatus, updateUnitStatus, queryClient]);

  const pauseGeneration = useCallback(() => {
    isPausedRef.current = true;
    setState((prev) => ({ ...prev, isPaused: true }));
    toast.info('Generation paused');
  }, []);

  const resumeGeneration = useCallback(() => {
    isPausedRef.current = false;
    setState((prev) => ({ ...prev, isPaused: false }));
    toast.info('Generation resumed');
  }, []);

  const cancelGeneration = useCallback(() => {
    isCancelledRef.current = true;
    setState((prev) => ({ ...prev, isCancelled: true, isPaused: false }));
    toast.warning('Generation cancelled');
  }, []);

  const resetQueue = useCallback(() => {
    setState({
      queue: [],
      unitStatuses: [],
      isProcessing: false,
      isPaused: false,
      isCancelled: false,
      currentLesson: null,
      completedCount: 0,
      failedCount: 0,
      currentUnitKey: null,
    });
    isPausedRef.current = false;
    isCancelledRef.current = false;
  }, []);

  const totalInQueue = state.queue.length;
  const estimatedTimeMinutes = Math.ceil((totalInQueue * (RATE_LIMIT_DELAY_MS / 1000 + 15)) / 60);

  return {
    ...state,
    totalInQueue,
    estimatedTimeMinutes,
    initializeQueue,
    startGeneration,
    pauseGeneration,
    resumeGeneration,
    cancelGeneration,
    resetQueue,
  };
}
