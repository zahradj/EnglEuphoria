import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdvancedOptions, GameMode } from '@/components/admin/generator/AdvancedLessonOptions';
import { PipelineStage, PipelineStageStatus } from '@/components/admin/generator/PipelineProgress';
import { toast } from 'sonner';
import { HubType, getHubConfig } from '@/config/hubConfigs';

export interface UnifiedGenerationConfig {
  topic: string;
  system: string;
  level: string;
  cefrLevel: string;
  durationMinutes: number;
  ageGroup: string;
  /** Hub the lesson belongs to — drives age-locked AI persona + UI theme */
  hubType?: HubType;
  advancedOptions: AdvancedOptions;
}

interface GeneratedSlide {
  id: string;
  type: string;
  phase?: string;
  content: Record<string, unknown>;
  [key: string]: unknown;
}

interface GeneratedLesson {
  title: string;
  slides: GeneratedSlide[];
  metadata?: Record<string, unknown>;
}

interface IronLMSGame {
  type: string;
  title: string;
  instructions: string;
  questions: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

const createInitialStages = (): PipelineStage[] => [
  {
    id: 'content',
    name: 'Content Generation',
    description: 'Generating lesson slides and structure',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'games',
    name: 'Game Generation',
    description: 'Creating interactive game slides',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'images',
    name: 'Image Generation',
    description: 'Generating vocabulary images',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'finalizing',
    name: 'Finalizing',
    description: 'Combining and validating lesson',
    status: 'pending',
    progress: 0,
  },
];

// 4-Part Sequential PPP stages
const GENERATION_STAGES = ['foundation', 'mechanics', 'application', 'mastery'] as const;
export type GenerationStageId = typeof GENERATION_STAGES[number];

const STAGE_LABELS: Record<GenerationStageId, string> = {
  foundation: 'Generating Intro & Vocabulary…',
  mechanics: 'Generating Grammar & Phonics…',
  application: 'Generating Interactive Games…',
  mastery: 'Finalizing Roleplay & Review…',
};

export const useUnifiedLessonGenerator = (hubType?: HubType) => {
  const [stages, setStages] = useState<PipelineStage[]>(createInitialStages());
  const [overallProgress, setOverallProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null);
  const [streamingSlides, setStreamingSlides] = useState<GeneratedSlide[]>([]);
  const [currentStage, setCurrentStage] = useState<GenerationStageId | null>(null);

  const hubConfig = getHubConfig(hubType);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const updateStage = useCallback((
    stageId: string,
    updates: Partial<PipelineStage>
  ) => {
    setStages(prev => prev.map(stage =>
      stage.id === stageId ? { ...stage, ...updates } : stage
    ));
  }, []);

  const calculateOverallProgress = useCallback((currentStages: PipelineStage[]) => {
    const activeStages = currentStages.filter(s => s.status !== 'skipped');
    if (activeStages.length === 0) return 0;
    const total = activeStages.reduce((sum, stage) => sum + stage.progress, 0);
    return total / activeStages.length;
  }, []);

  const startTimer = useCallback(() => {
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Stage 1: Generate base lesson content via 4 sequential PPP chunks
  const generateContent = async (
    config: UnifiedGenerationConfig,
    signal: AbortSignal
  ): Promise<GeneratedLesson> => {
    const hubConfig = getHubConfig(config.hubType ?? config.system);
    const allSlides: GeneratedSlide[] = [];
    setStreamingSlides([]);

    // ── Short-Term Memory: fetch the most recent lesson for this CEFR level ──
    let previousLessonData: { vocabulary: unknown; grammar: string; topic: string; title: string } | null = null;
    try {
      const { data: prev } = await supabase
        .from('systematic_lessons')
        .select('title, topic, grammar_focus, vocabulary_set, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (prev) {
        previousLessonData = {
          title: prev.title,
          topic: prev.topic,
          grammar: prev.grammar_focus || '',
          vocabulary: prev.vocabulary_set || [],
        };
      }
    } catch (e) {
      console.warn('Could not fetch previous lesson for spaced repetition:', e);
    }

    for (let i = 0; i < GENERATION_STAGES.length; i++) {
      if (signal.aborted) throw new Error('Generation cancelled');
      const stage = GENERATION_STAGES[i];
      setCurrentStage(stage);
      updateStage('content', {
        status: 'running',
        progress: Math.round((i / GENERATION_STAGES.length) * 100),
        message: STAGE_LABELS[stage],
      });

      const { data, error } = await supabase.functions.invoke('n8n-bridge', {
        body: {
          action: 'generate-lesson-chunk',
          current_stage: stage,
          previous_slide_count: allSlides.length,
          topic: config.topic,
          system: config.system,
          hub_type: config.hubType ?? null,
          ai_persona: hubConfig.ai_persona,
          phonics_rule: hubConfig.phonics_rule,
          previous_lesson_data: previousLessonData,
          level: config.level,
          cefr_level: config.cefrLevel,
          duration_minutes: config.durationMinutes,
          age_group: config.ageGroup,
          blueprint: {
            includeGames: config.advancedOptions.includeGames,
            gameSlideCount: config.advancedOptions.gameSlideCount,
            gameMode: config.advancedOptions.gameMode,
          },
        },
      });

      if (signal.aborted) throw new Error('Generation cancelled');
      if (error) throw new Error(`[${stage}] ${error.message}`);
      if (data?.error) throw new Error(`[${stage}] ${data.error}`);

      // Robust unwrapping: accept array directly OR { slides: [...] } OR { lesson_plan/data: [...] }
      const raw = data?.slides ?? data?.lesson_plan ?? data?.data ?? data;
      const chunkSlides: GeneratedSlide[] = Array.isArray(raw) ? raw : [];
      if (chunkSlides.length === 0) {
        console.error(`[${stage}] AI returned no slides. Raw response keys:`, data ? Object.keys(data) : 'null', data);
        throw new Error(`[${stage}] AI returned no slides — please retry. (response keys: ${data ? Object.keys(data).join(', ') : 'none'})`);
      }

      allSlides.push(...chunkSlides);
      setStreamingSlides([...allSlides]);
      updateStage('content', {
        progress: Math.round(((i + 1) / GENERATION_STAGES.length) * 100),
        message: `${STAGE_LABELS[stage]} ✓ (${allSlides.length} slides)`,
      });
    }

    setCurrentStage(null);
    updateStage('content', {
      status: 'complete',
      progress: 100,
      message: `Generated ${allSlides.length} slides across 4 PPP stages`,
    });

    return {
      title: `${config.topic} Lesson`,
      slides: allSlides,
      metadata: { generatedVia: 'sequential-4-chunk', stages: [...GENERATION_STAGES] },
    };
  };

  // Stage 2: Generate games for game slides
  const generateGames = async (
    lesson: GeneratedLesson,
    config: UnifiedGenerationConfig,
    signal: AbortSignal
  ): Promise<GeneratedLesson> => {
    if (!config.advancedOptions.includeGames) {
      updateStage('games', { status: 'skipped', progress: 100 });
      return lesson;
    }

    updateStage('games', { status: 'running', progress: 10, message: 'Finding game slides...' });

    // Find slides that need games (type === 'game' or have game placeholder)
    const gameSlideIndices: number[] = [];
    lesson.slides.forEach((slide, index) => {
      if (
        slide.type === 'game' ||
        slide.type === 'interactive-game' ||
        (slide.content && (slide.content as Record<string, unknown>).placeholder === true)
      ) {
        gameSlideIndices.push(index);
      }
    });

    // If no game slides found, create them in the practice phase
    if (gameSlideIndices.length === 0 && config.advancedOptions.gameSlideCount > 0) {
      // Find practice phase slides and add game slides
      const practiceEndIndex = lesson.slides.findIndex(
        (s, i) => s.phase === 'produce' || (i > lesson.slides.length / 2 && s.phase !== 'practice')
      );
      const insertIndex = practiceEndIndex > 0 ? practiceEndIndex : Math.floor(lesson.slides.length * 0.7);

      for (let i = 0; i < config.advancedOptions.gameSlideCount; i++) {
        gameSlideIndices.push(insertIndex + i);
        lesson.slides.splice(insertIndex + i, 0, {
          id: `game-${i + 1}`,
          type: 'game',
          phase: 'practice',
          content: { placeholder: true, gameMode: config.advancedOptions.gameMode },
        });
      }
    }

    const totalGames = gameSlideIndices.length;
    if (totalGames === 0) {
      updateStage('games', { status: 'complete', progress: 100, message: 'No game slides needed' });
      return lesson;
    }

    // Generate games for each game slide
    for (let i = 0; i < gameSlideIndices.length; i++) {
      if (signal.aborted) throw new Error('Generation cancelled');

      const slideIndex = gameSlideIndices[i];
      const progress = 20 + ((i / totalGames) * 70);
      updateStage('games', { 
        progress, 
        message: `Generating game ${i + 1} of ${totalGames}...` 
      });

      try {
        const { data: gameData, error: gameError } = await supabase.functions.invoke('generate-iron-game', {
          body: {
            topic: config.topic,
            cefrLevel: config.cefrLevel,
            targetGroup: config.system.toLowerCase().replace('the ', ''),
            gameMode: config.advancedOptions.gameMode,
            questionCount: config.advancedOptions.questionCount,
          },
        });

        if (gameError) {
          console.error('Game generation error:', gameError);
          continue;
        }

        if (gameData?.game) {
          // Inject the game into the slide
          lesson.slides[slideIndex] = {
            ...lesson.slides[slideIndex],
            type: 'ironlms-game',
            content: {
              ironLMSGame: gameData.game as IronLMSGame,
              title: (gameData.game as IronLMSGame).title || `Practice Game ${i + 1}`,
            },
          };
        }
      } catch (err) {
        console.error('Failed to generate game:', err);
      }
    }

    updateStage('games', { 
      status: 'complete', 
      progress: 100, 
      message: `Created ${totalGames} interactive games` 
    });

    return lesson;
  };

  // Stage 3: Generate vocabulary images
  const generateImages = async (
    lesson: GeneratedLesson,
    config: UnifiedGenerationConfig,
    signal: AbortSignal
  ): Promise<GeneratedLesson> => {
    if (!config.advancedOptions.autoGenerateImages) {
      updateStage('images', { status: 'skipped', progress: 100 });
      return lesson;
    }

    updateStage('images', { status: 'running', progress: 10, message: 'Finding vocabulary slides...' });

    // Find vocabulary slides that need images
    const vocabSlides: Array<{ index: number; keyword: string }> = [];
    lesson.slides.forEach((slide, index) => {
      const content = slide.content as Record<string, unknown>;
      if (
        slide.type === 'vocabulary' ||
        slide.type === 'vocab' ||
        content?.imageKeyword ||
        content?.vocabulary
      ) {
        const keyword = (content.imageKeyword as string) || 
                       (content.word as string) || 
                       (content.vocabulary as string) ||
                       config.topic;
        if (keyword && !content.imageUrl) {
          vocabSlides.push({ index, keyword });
        }
      }
    });

    if (vocabSlides.length === 0) {
      updateStage('images', { status: 'complete', progress: 100, message: 'No vocabulary images needed' });
      return lesson;
    }

    // Generate images using batch endpoint
    try {
      // Build imagePrompts object with slide IDs as keys (required format)
      const imagePrompts: Record<string, string> = {};
      vocabSlides.forEach(v => {
        const slideId = lesson.slides[v.index].id;
        const stylePrefix = config.advancedOptions.imageStyle === 'colorful' 
          ? 'Vibrant, colorful illustration of' 
          : config.advancedOptions.imageStyle === 'realistic'
            ? 'Realistic photo-style image of'
            : 'Clean, simple educational illustration of';
        imagePrompts[slideId] = `${stylePrefix} ${v.keyword}`;
      });

      updateStage('images', { progress: 30, message: `Generating ${vocabSlides.length} images...` });

      const { data: imageData, error: imageError } = await supabase.functions.invoke('batch-generate-lesson-images', {
        body: { imagePrompts },
      });

      if (signal.aborted) throw new Error('Generation cancelled');

      if (imageError) {
        console.error('Image generation error:', imageError);
        updateStage('images', { status: 'complete', progress: 100, message: 'Image generation skipped' });
        return lesson;
      }

      // Inject images into slides using the results map
      if (imageData?.results) {
        const results = imageData.results as Record<string, string>;
        let injectedCount = 0;
        
        vocabSlides.forEach((v, i) => {
          const slideId = lesson.slides[v.index].id;
          const imageUrl = results[slideId];
          
          if (imageUrl) {
            const content = lesson.slides[v.index].content as Record<string, unknown>;
            lesson.slides[v.index].content = {
              ...content,
              imageUrl,
            };
            injectedCount++;
          }
          
          const progress = 40 + ((i / vocabSlides.length) * 50);
          updateStage('images', { progress, message: `Processing image ${i + 1} of ${vocabSlides.length}...` });
        });

        updateStage('images', { 
          status: 'complete', 
          progress: 100, 
          message: `Generated ${injectedCount} vocabulary images` 
        });
      } else {
        updateStage('images', { status: 'complete', progress: 100, message: 'No images returned' });
      }
    } catch (err) {
      console.error('Failed to generate images:', err);
      updateStage('images', { status: 'complete', progress: 100, message: 'Image generation failed' });
    }

    return lesson;
  };

  // Stage 4: Finalize and validate
  const finalizeLesson = async (
    lesson: GeneratedLesson,
    config: UnifiedGenerationConfig
  ): Promise<GeneratedLesson> => {
    updateStage('finalizing', { status: 'running', progress: 30, message: 'Validating lesson structure...' });

    // Ensure all slides have IDs
    lesson.slides = lesson.slides.map((slide, index) => ({
      ...slide,
      id: slide.id || `slide-${index + 1}`,
    }));

    updateStage('finalizing', { progress: 60, message: 'Adding metadata...' });

    // Add generation metadata
    lesson.metadata = {
      ...lesson.metadata,
      generatedAt: new Date().toISOString(),
      topic: config.topic,
      system: config.system,
      cefrLevel: config.cefrLevel,
      includesGames: config.advancedOptions.includeGames,
      includesImages: config.advancedOptions.autoGenerateImages,
      slideCount: lesson.slides.length,
    };

    updateStage('finalizing', { 
      status: 'complete', 
      progress: 100, 
      message: 'Lesson ready!' 
    });

    return lesson;
  };

  // Main generation function
  const generateLesson = useCallback(async (config: UnifiedGenerationConfig) => {
    // If caller didn't pass hubType in the config, fall back to the hook-level hubType
    const mergedConfig: UnifiedGenerationConfig = {
      ...config,
      hubType: config.hubType ?? hubType,
    };
    setIsGenerating(true);
    setStages(createInitialStages());
    setOverallProgress(0);
    setGeneratedLesson(null);
    setStreamingSlides([]);
    setCurrentStage(null);
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    startTimer();

    try {
      // Stage 1: Generate content
      let lesson = await generateContent(mergedConfig, signal);
      setOverallProgress(25);

      // Stage 2: Generate games
      lesson = await generateGames(lesson, mergedConfig, signal);
      setOverallProgress(50);

      // Stage 3: Generate images
      lesson = await generateImages(lesson, mergedConfig, signal);
      setOverallProgress(75);

      // Stage 4: Finalize
      lesson = await finalizeLesson(lesson, mergedConfig);
      setOverallProgress(100);

      setGeneratedLesson(lesson);
      toast.success('Lesson generated successfully!');
      
      return lesson;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      
      if (errorMessage !== 'Generation cancelled') {
        toast.error(errorMessage);
        
        // Mark current running stage as error
        setStages(prev => prev.map(stage => 
          stage.status === 'running' 
            ? { ...stage, status: 'error' as PipelineStageStatus, message: errorMessage }
            : stage
        ));
      }
      
      throw error;
    } finally {
      stopTimer();
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [startTimer, stopTimer, updateStage, hubType]);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      toast.info('Generation cancelled');
    }
  }, []);

  const reset = useCallback(() => {
    setStages(createInitialStages());
    setOverallProgress(0);
    setGeneratedLesson(null);
    setElapsedTime(0);
    setStreamingSlides([]);
    setCurrentStage(null);
  }, []);

  return {
    stages,
    overallProgress,
    isGenerating,
    elapsedTime,
    generatedLesson,
    generateLesson,
    cancelGeneration,
    reset,
    /** Slides streamed in as each PPP chunk completes (for live sidebar render) */
    streamingSlides,
    /** Currently active PPP stage id (null when idle/done) */
    currentStage,
    /** Human-readable label for the active stage */
    currentStageLabel: currentStage ? STAGE_LABELS[currentStage] : null,
    /** Tailwind classes for the active hub — apply to wrapper components */
    hubTheme: hubConfig.ui_theme,
    /** Full active hub config (persona, cefr range, etc.) */
    hubConfig,
  };
};
