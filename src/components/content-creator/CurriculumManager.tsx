import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { generatePPPLesson } from '@/components/admin/lesson-builder/ai-wizard/generatePPPLesson';
import { resolveHub, HUB_CONFIGS } from '@/components/admin/lesson-builder/ai-wizard/hubConfig';
import { saveToLibrary } from '@/services/lessonLibraryService';
import { WizardFormData, GeneratedSlide, HubType } from '@/components/admin/lesson-builder/ai-wizard/types';
import { generateSlideSkeletons, LessonSkeletonPlan, SlideSkeleton } from '@/services/slideSkeletonEngine';
import { massGenerateImages, SlideImageProgress, MassGenerationResult } from '@/services/massImageGenerationService';
import { generateLessonMedia, MediaManifest, MediaGenerationResult } from '@/services/lessonMediaService';
import { CurriculumContext } from './CurriculumStep';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen, ChevronRight, Loader2, Sparkles, CheckCircle2,
  AlertCircle, Play, ArrowLeft, ArrowRight, Zap, FileSliders,
  ImageIcon, Clock, Wand2, Layers, Trophy, Eye, Rocket,
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { CurriculumExplorerTree, HubKey, ExplorerLesson } from './CurriculumExplorerTree';
import { cn } from '@/lib/utils';

interface CurriculumUnit {
  id: string;
  title: string;
  unit_number: number;
  age_group: string;
  cefr_level: string;
  learning_objectives: string[];
}

interface CurriculumLesson {
  id: string;
  title: string;
  unit_id: string | null;
  target_system: string;
  difficulty_level: string;
  sequence_order: number | null;
  content: any;
  is_published: boolean | null;
  duration_minutes: number | null;
}

type SlideStatus = 'needs_slides' | 'ready';

interface CurriculumManagerProps {
  curriculumContext: CurriculumContext | null;
  onBack: () => void;
  onNext: () => void;
}

// ─── Phase Colors ──────────────────────────────────────────────
const PHASE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  hook: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
  discovery: { bg: 'bg-sky-500/10', text: 'text-sky-600', border: 'border-sky-500/20' },
  active_play: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/20' },
  recap: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
};

export const CurriculumManager: React.FC<CurriculumManagerProps> = ({
  curriculumContext,
  onBack,
  onNext,
}) => {
  const [units, setUnits] = useState<CurriculumUnit[]>([]);
  const [lessons, setLessons] = useState<CurriculumLesson[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingLessonId, setGeneratingLessonId] = useState<string | null>(null);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, lessonTitle: '' });

  // ─── Skeleton State ─────────────────────────────────────────
  const [skeletonPlan, setSkeletonPlan] = useState<LessonSkeletonPlan | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [activeHub, setActiveHub] = useState<HubKey>('playground');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let unitQuery = supabase.from('curriculum_units').select('*').order('unit_number');
      if (curriculumContext?.ageGroup) {
        unitQuery = unitQuery.eq('age_group', curriculumContext.ageGroup);
      }
      const { data: unitData, error: unitErr } = await unitQuery;
      if (unitErr) {
        toast.error(`Failed to load units: ${unitErr.message}`, {
          description: unitErr.message.toLowerCase().includes('row-level')
            ? 'Your account lacks the content_creator role. Published units are still visible to everyone.'
            : undefined,
        });
        throw unitErr;
      }
      const fetchedUnits = (unitData || []) as CurriculumUnit[];
      setUnits(fetchedUnits);

      if (fetchedUnits.length > 0 && !selectedUnitId) {
        setSelectedUnitId(fetchedUnits[0].id);
      }

      if (fetchedUnits.length > 0) {
        const unitIds = fetchedUnits.map(u => u.id);
        const { data: lessonData, error: lessonErr } = await supabase
          .from('curriculum_lessons')
          .select('*')
          .in('unit_id', unitIds)
          .order('sequence_order');
        if (lessonErr) {
          toast.error(`Failed to load lessons: ${lessonErr.message}`);
          throw lessonErr;
        }
        setLessons((lessonData || []) as CurriculumLesson[]);
      } else {
        setLessons([]);
      }
    } catch (err) {
      console.error('Failed to fetch curriculum data:', err);
    } finally {
      setLoading(false);
    }
  }, [curriculumContext, selectedUnitId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getLessonStatus = (lesson: CurriculumLesson): SlideStatus => {
    const hasSlides = lesson.content?.slides && Array.isArray(lesson.content.slides) && lesson.content.slides.length > 0;
    return hasSlides ? 'ready' : 'needs_slides';
  };

  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const unitLessons = lessons.filter(l => l.unit_id === selectedUnitId);
  const needsSlides = unitLessons.filter(l => getLessonStatus(l) === 'needs_slides');
  const readyCount = unitLessons.filter(l => getLessonStatus(l) === 'ready').length;

  const resolveHubFromContext = (): HubType => {
    if (curriculumContext?.ageGroup === 'kids') return 'playground';
    if (curriculumContext?.ageGroup === 'teens') return 'academy';
    return 'professional';
  };

  // ─── Hydrate Skeletons on Lesson Click ──────────────────────
  const handleLessonSelect = async (lesson: ExplorerLesson) => {
    setSelectedLessonId(lesson.id);

    // Find unit for this lesson
    const unit = units.find(u => lessons.some(l => l.unit_id === u.id && l.id === lesson.id));
    if (unit) setSelectedUnitId(unit.id);

    // Determine hub
    const hub = (lesson.target_system as HubType) || resolveHubFromContext();

    // Fetch the level name and accessory for this lesson
    let levelName = 'Level 1';
    let accessoryName: string | null = null;

    if (lesson.level_id) {
      const [levelRes, accessoryRes] = await Promise.all([
        supabase.from('curriculum_levels').select('name').eq('id', lesson.level_id).single(),
        supabase.from('accessories').select('name').eq('level_id', lesson.level_id).eq('hub_requirement', hub).maybeSingle(),
      ]);
      if (levelRes.data) levelName = levelRes.data.name;
      if (accessoryRes.data) accessoryName = accessoryRes.data.name;
    }

    // Extract topic and manifest from lesson content
    const lessonRecord = lessons.find(l => l.id === lesson.id);
    const content = lessonRecord?.content || {};
    const manifest = content?.ai_wizard_manifest;
    const topic = lesson.title.replace(/^\d+(\.\d+)?\s*[-:.]?\s*/, '');

    // Generate the skeleton plan with manifest data
    const plan = generateSlideSkeletons({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      hub,
      levelName,
      accessoryName,
      topic,
      // Pass manifest-driven fields
      cycleType: content?.cycle_type || manifest?.cycleType,
      phonicsTarget: content?.anchorPhoneme || manifest?.anchorPhoneme,
      grammarTarget: content?.grammarGoal || manifest?.grammarGoal,
      skillsFocus: content?.skillTags || manifest?.skillsRequired,
      hintsDisabled: content?.hintsDisabled || manifest?.hintsDisabled || false,
      highSupport: content?.highSupport || manifest?.highSupport || false,
      lessonFocus: manifest?.cycleType === 'discovery' ? 'introduction' :
                   manifest?.cycleType === 'bridge' || manifest?.cycleType === 'quiz' ? 'mastery' : 'expansion',
      practiceVariant: (content?.sequence_order || 0) % 4,
    });

    setSkeletonPlan(plan);
    toast.success(`${plan.totalSlides} slide skeletons ready — ${plan.totalMinutes} min lesson`, {
      icon: '🎬',
    });
  };

  const generateSlidesForLesson = async (lesson: CurriculumLesson): Promise<GeneratedSlide[] | null> => {
    try {
      const hub = resolveHubFromContext();
      const cefrLevel = lesson.difficulty_level || curriculumContext?.level || 'beginner';
      const content = lesson.content || {};
      const manifest = content?.ai_wizard_manifest;

      // ─── Manifest-First Topic Resolution ─────────────────────
      // Build a rich topic from manifest data, not just the lesson title
      const vocabTheme = content?.vocabularyTheme || lesson.title.replace(/^\d+\.\d+\s*/, '');
      const phoneme = manifest?.anchorPhoneme || content?.anchorPhoneme || '';
      const grammar = manifest?.grammarGoal || content?.grammarGoal || '';
      const cycleType = manifest?.cycleType || content?.cycle_type || '';

      let topic = vocabTheme;
      if (phoneme) topic += ` (Phonics: ${phoneme})`;
      if (grammar) topic += ` — Grammar: ${grammar}`;

      // ─── Build Lesson Prompt from Manifest ───────────────────
      let lessonPrompt = '';
      if (manifest) {
        const parts = [
          `Unit ${manifest.unitNumber}, Lesson ${manifest.lessonNumber} [${cycleType}].`,
          manifest.wizardScript || '',
          `Skills: ${(manifest.skillsRequired || []).join(', ')}.`,
        ];
        if (manifest.hintsDisabled) parts.push('QUIZ MODE: No hints, no scaffolding. Clinical assessment only.');
        if (manifest.highSupport) parts.push('REVIEW MODE: High teacher support. Wizard hints active. Review all vocabulary from Lessons 1-4.');
        if (manifest.masteryCriteria) parts.push(`Mastery: ${manifest.masteryCriteria}`);
        lessonPrompt = parts.filter(Boolean).join(' ');
      }

      const levelMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
        beginner: 'beginner', elementary: 'beginner',
        'pre-intermediate': 'intermediate', intermediate: 'intermediate',
        advanced: 'advanced', A1: 'beginner', A2: 'beginner', B1: 'intermediate', B2: 'advanced',
      };
      const ageMap: Record<string, 'kids' | 'teens' | 'adults'> = {
        kids: 'kids', teens: 'teens', adults: 'adults',
      };

      const formData: WizardFormData = {
        topic,
        level: levelMap[cefrLevel] || 'beginner',
        ageGroup: ageMap[curriculumContext?.ageGroup || 'kids'] || 'kids',
        lessonPrompt: lessonPrompt || undefined,
      };

      const plan = generatePPPLesson(formData);

      // ─── Media Generation (ElevenLabs Audio & Song) ──────────
      const mediaManifest: MediaManifest = {
        unitNumber: manifest?.unitNumber || 1,
        lessonNumber: manifest?.lessonNumber || (lesson.sequence_order || 1),
        phonicsTarget: phoneme || undefined,
        vocabularyList: manifest?.vocabularyList || content?.vocabulary_list?.map((v: any) => v.word || v) || [],
        grammarTarget: grammar || undefined,
        unitTheme: vocabTheme,
        cycleType: cycleType || undefined,
      };

      let mediaResult: MediaGenerationResult | null = null;
      try {
        mediaResult = await generateLessonMedia(mediaManifest, (p) => {
        });
        if (mediaResult.errors.length > 0) {
          console.warn('Media generation warnings:', mediaResult.errors);
        }
      } catch (mediaErr) {
        console.warn('Media generation failed (non-blocking):', mediaErr);
      }

      const updatedContent = {
        ...content,
        slides: plan.slides,
        hub,
        generatedAt: new Date().toISOString(),
        // Persist media URLs for the renderer
        mediaAssets: mediaResult ? {
          phonicsAudioUrl: mediaResult.phonicsAudioUrl,
          vocabAudioUrls: mediaResult.vocabAudioUrls,
          songUrl: mediaResult.songUrl,
        } : content?.mediaAssets,
      };

      const { error } = await supabase
        .from('curriculum_lessons')
        .update({ content: updatedContent, is_published: true } as any)
        .eq('id', lesson.id);

      if (error) throw error;

      return plan.slides;
    } catch (err) {
      console.error('Failed to generate slides for lesson:', lesson.title, err);
      return null;
    }
  };

  const handleGenerateSingle = async (lesson: CurriculumLesson) => {
    setGeneratingLessonId(lesson.id);
    const slides = await generateSlidesForLesson(lesson);
    if (slides) {
      toast.success(`Slides generated for "${lesson.title}"`);
      await fetchData();
    } else {
      toast.error(`Failed to generate slides for "${lesson.title}"`);
    }
    setGeneratingLessonId(null);
  };

  const handleGenerateAll = async () => {
    if (needsSlides.length === 0) return;
    setBatchGenerating(true);
    setBatchProgress({ current: 0, total: needsSlides.length, lessonTitle: '' });

    let successCount = 0;
    for (let i = 0; i < needsSlides.length; i++) {
      const lesson = needsSlides[i];
      setBatchProgress({ current: i + 1, total: needsSlides.length, lessonTitle: lesson.title });
      const slides = await generateSlidesForLesson(lesson);
      if (slides) successCount++;
      await new Promise(r => setTimeout(r, 300));
    }

    setBatchGenerating(false);
    await fetchData();
    toast.success(`Generated slides for ${successCount}/${needsSlides.length} lessons!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Step 2: Curriculum Manager</h1>
          <p className="text-muted-foreground mt-1">No curriculum found. Go back to Step 1 to generate one.</p>
        </div>
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Blueprint
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileSliders className="h-6 w-6 text-primary" />
            Curriculum Manager
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Click a lesson to hydrate slide skeletons, then generate all images.
          </p>
        </div>
        {curriculumContext && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{curriculumContext.ageGroup}</Badge>
            <Badge variant="outline">{curriculumContext.level}</Badge>
          </div>
        )}
      </div>

      {/* Batch Generate bar */}
      {batchGenerating && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium text-foreground">
                Generating: {batchProgress.lessonTitle} ({batchProgress.current}/{batchProgress.total})
              </span>
            </div>
            <Progress value={(batchProgress.current / batchProgress.total) * 100} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Main Layout: Sidebar + Content */}
      <div className="grid grid-cols-12 gap-4" style={{ minHeight: 520 }}>
        {/* Sidebar: Curriculum Explorer Tree */}
        <div className="col-span-4 lg:col-span-3">
          <Card className="h-full overflow-hidden">
            <CurriculumExplorerTree
              onLessonSelect={handleLessonSelect}
              onGenerateLesson={(lesson) => {
                const matched = lessons.find(l => l.id === lesson.id);
                if (matched) handleGenerateSingle(matched);
              }}
              selectedLessonId={selectedLessonId}
              generatingLessonIds={new Set(generatingLessonId ? [generatingLessonId] : [])}
              onHubChange={(hub) => setActiveHub(hub)}
            />
          </Card>
        </div>

        {/* Main Content: Skeleton Panel or Lesson List */}
        <div className="col-span-8 lg:col-span-9">
          {skeletonPlan ? (
            <SkeletonPanel
              plan={skeletonPlan}
              onClear={() => { setSkeletonPlan(null); setSelectedLessonId(null); }}
              hub={activeHub}
            />
          ) : (
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg">{selectedUnit?.title || 'Select a Lesson'}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Click a lesson in the sidebar to preview its slide blueprint.
                  </p>
                </div>
                {needsSlides.length > 0 && (
                  <Button onClick={handleGenerateAll} disabled={batchGenerating} className="gap-2" size="sm">
                    {batchGenerating ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <><Zap className="h-4 w-4" /> Generate All Slides ({needsSlides.length})</>
                    )}
                  </Button>
                )}
              </CardHeader>
              <ScrollArea className="h-[400px]">
                <div className="px-4 pb-4 space-y-2">
                  <AnimatePresence>
                    {unitLessons.map((lesson, i) => {
                      const status = getLessonStatus(lesson);
                      const isGenerating = generatingLessonId === lesson.id;
                      const slideCount = lesson.content?.slides?.length || 0;

                      return (
                        <motion.div
                          key={lesson.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            status === 'ready' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-destructive/10 text-destructive'
                          }`}>
                            {status === 'ready' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {lesson.sequence_order ? `${lesson.sequence_order}. ` : ''}{lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {status === 'ready' ? (
                                <span className="text-[11px] text-emerald-600 font-medium">Ready · {slideCount} slides</span>
                              ) : (
                                <span className="text-[11px] text-destructive font-medium">Needs Slides</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {status === 'needs_slides' ? (
                              <Button
                                size="sm" variant="outline"
                                onClick={() => handleGenerateSingle(lesson)}
                                disabled={isGenerating || batchGenerating}
                                className="gap-1.5 text-xs h-8"
                              >
                                {isGenerating ? (
                                  <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
                                ) : (
                                  <><Sparkles className="h-3 w-3" /> Generate</>
                                )}
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" className="gap-1.5 text-xs h-8 text-emerald-600"
                                onClick={() => window.open(`/lesson/${lesson.id}`, '_blank')}
                              >
                                <Play className="h-3 w-3" /> Preview
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {unitLessons.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p>No lessons in this unit yet.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back: Blueprint
        </Button>
        <Button onClick={onNext} className="gap-2">
          Next: Content Library <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// ─── Skeleton Panel: 4x3 Visual Grid with Glassmorphic Shimmer ──
interface SkeletonPanelProps {
  plan: LessonSkeletonPlan;
  onClear: () => void;
  hub: HubKey;
}

const SkeletonPanel: React.FC<SkeletonPanelProps> = ({ plan, onClear, hub }) => {
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);
  const [imageProgress, setImageProgress] = useState<SlideImageProgress[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [generationResult, setGenerationResult] = useState<MassGenerationResult | null>(null);
  const [slideTimers, setSlideTimers] = useState<Record<number, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Simulate per-slide percentage while generating
  useEffect(() => {
    if (!isGeneratingImages) return;
    const interval = setInterval(() => {
      setSlideTimers(prev => {
        const next = { ...prev };
        imageProgress.forEach(p => {
          if (p.status === 'generating') {
            next[p.slideNumber] = Math.min((next[p.slideNumber] || 0) + Math.random() * 15, 92);
          } else if (p.status === 'done') {
            next[p.slideNumber] = 100;
          }
        });
        return next;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [isGeneratingImages, imageProgress]);

  const handleMassGenerate = async () => {
    setIsGeneratingImages(true);
    setGenerationResult(null);
    setSlideTimers({});
    try {
      const result = await massGenerateImages(plan, (progress) => {
        setImageProgress([...progress]);
      });
      setGenerationResult(result);
      // Mark all done at 100%
      const finalTimers: Record<number, number> = {};
      result.images.forEach(p => { finalTimers[p.slideNumber] = p.status === 'done' ? 100 : 0; });
      setSlideTimers(finalTimers);

      const seconds = Math.round(result.durationMs / 1000);
      if (result.successCount > 0) {
        toast.success(`🎨 ${result.successCount}/${result.totalSlides} cinematic assets rendered in ${seconds}s`);
      }
      if (result.failedCount > 0) {
        toast.error(`${result.failedCount} images failed — click to retry`);
      }
    } catch {
      toast.error('Mass generation failed');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!generationResult) return;
    setIsSaving(true);
    try {
      const slides = plan.skeletons.map((skeleton) => {
        const imgStatus = getSlideStatus(skeleton.slideNumber);
        return {
          id: `slide-${skeleton.slideNumber}`,
          slideNumber: skeleton.slideNumber,
          phase: skeleton.phase,
          phaseLabel: skeleton.phaseLabel,
          objective: skeleton.objective,
          activityType: skeleton.activityType,
          imageUrl: imgStatus?.imageUrl || null,
          imagePrompt: skeleton.imagePrompt,
          durationSeconds: skeleton.durationSeconds,
          contentPosition: skeleton.contentPosition,
          mascotPosition: skeleton.mascotPosition,
        };
      }) as any[];

      await saveToLibrary(
        plan.lessonTitle,
        plan.hub as HubType,
        'beginner',
        slides,
        imageProgress.find(p => p.slideNumber === 1)?.imageUrl || undefined
      );
      toast.success('Lesson saved to Library! 📚');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const getSlideStatus = (num: number): SlideImageProgress | undefined =>
    imageProgress.find((p) => p.slideNumber === num);

  const completedCount = imageProgress.filter((p) => p.status === 'done').length;
  const allDone = generationResult && generationResult.successCount === plan.totalSlides;
  const selectedSkeleton = selectedSlide ? plan.skeletons.find(s => s.slideNumber === selectedSlide) : null;
  const selectedImgStatus = selectedSlide ? getSlideStatus(selectedSlide) : undefined;

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Wand2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base truncate">{plan.lessonTitle}</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] h-5">{plan.hub}</Badge>
              <Badge variant="secondary" className="text-[10px] h-5">
                <Layers className="h-3 w-3 mr-1" />{plan.totalSlides} slides
              </Badge>
              <Badge variant="secondary" className="text-[10px] h-5">
                <Clock className="h-3 w-3 mr-1" />{plan.totalMinutes} min
              </Badge>
              {plan.accessoryName && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  <Trophy className="h-3 w-3 mr-1" />{plan.accessoryName}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {allDone ? (
              <Button
                size="sm"
                className="gap-1.5 text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                onClick={handleSaveToLibrary}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                {isSaving ? 'Saving…' : 'Save to Library'}
              </Button>
            ) : (
              <Button
                size="sm"
                className={cn(
                  'gap-1.5 text-xs h-9 shadow-lg transition-all',
                  !isGeneratingImages && 'animate-pulse hover:animate-none'
                )}
                onClick={handleMassGenerate}
                disabled={isGeneratingImages}
              >
                {isGeneratingImages ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Rendering {completedCount}/{plan.totalSlides}…</>
                ) : (
                  <><Rocket className="h-3.5 w-3.5" /> 🚀 Generate 12-Slide Lesson</>
                )}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onClear} className="text-xs h-8">✕</Button>
          </div>
        </div>

        {isGeneratingImages && (
          <div className="mt-3">
            <Progress value={(completedCount / plan.totalSlides) * 100} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Rendering Midjourney assets… {completedCount}/{plan.totalSlides} complete
            </p>
          </div>
        )}
      </CardHeader>

      {/* 4x3 Grid + Detail Panel */}
      <div className="flex-1 flex min-h-0">
        {/* Grid */}
        <div className="flex-1 p-3 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            {plan.skeletons.map((skeleton, i) => {
              const phaseStyle = PHASE_STYLES[skeleton.phase] || PHASE_STYLES.hook;
              const imgStatus = getSlideStatus(skeleton.slideNumber);
              const isSelected = selectedSlide === skeleton.slideNumber;
              const isDone = imgStatus?.status === 'done';
              const isRendering = imgStatus?.status === 'generating';
              const isError = imgStatus?.status === 'error';
              const pct = Math.round(slideTimers[skeleton.slideNumber] || 0);

              return (
                <motion.button
                  key={skeleton.slideNumber}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedSlide(isSelected ? null : skeleton.slideNumber)}
                  className={cn(
                    'relative rounded-xl border overflow-hidden transition-all duration-200 text-left group aspect-video',
                    isSelected
                      ? 'ring-2 ring-primary border-primary shadow-lg scale-[1.02]'
                      : 'border-border hover:border-primary/40 hover:shadow-md'
                  )}
                >
                  {/* Background */}
                  {isDone && imgStatus?.imageUrl ? (
                    <motion.img
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      src={imgStatus.imageUrl}
                      alt={`Slide ${skeleton.slideNumber}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : isRendering ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-muted/80 via-muted/40 to-muted/80">
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      />
                      <div className="absolute inset-0 backdrop-blur-sm" />
                    </div>
                  ) : (
                    <div className={cn('absolute inset-0', phaseStyle.bg)} />
                  )}

                  {/* Overlay */}
                  <div className={cn(
                    'relative h-full flex flex-col justify-between p-1.5',
                    isDone && 'bg-gradient-to-t from-black/60 via-transparent to-transparent'
                  )}>
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        'w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold',
                        isDone ? 'bg-emerald-500 text-white' :
                        isRendering ? 'bg-amber-500/80 text-white' :
                        isError ? 'bg-destructive text-white' :
                        'bg-background/80 backdrop-blur-sm text-foreground'
                      )}>
                        {isRendering ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> :
                         isDone ? <CheckCircle2 className="h-2.5 w-2.5" /> :
                         isError ? <AlertCircle className="h-2.5 w-2.5" /> :
                         skeleton.slideNumber}
                      </div>
                      {skeleton.accessoryReveal && (
                        <span className="text-[8px] bg-amber-500/90 text-white px-1 py-0.5 rounded font-bold">🏆</span>
                      )}
                    </div>

                    <div>
                      {isRendering && (
                        <div className="mb-0.5">
                          <p className="text-[7px] text-foreground/70 font-medium animate-pulse">
                            Midjourney Rendering… {pct}%
                          </p>
                          <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden mt-0.5">
                            <motion.div
                              className="h-full bg-amber-400 rounded-full"
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}
                      <p className={cn('text-[8px] font-semibold leading-tight truncate', isDone ? 'text-white' : 'text-foreground')}>
                        {skeleton.objective}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={cn('text-[7px] font-bold uppercase tracking-wider', isDone ? 'text-white/70' : phaseStyle.text)}>
                          {skeleton.phaseLabel}
                        </span>
                        {skeleton.mascotPosition !== 'hidden' && (
                          <span className={cn('text-[7px]', isDone ? 'text-white/50' : 'text-muted-foreground')}>
                            🐧{skeleton.mascotPosition === 'left' ? 'L' : 'R'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isDone && (
                    <div className="absolute top-1 right-1">
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 8 }}
                        className="text-[7px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold shadow-sm inline-block"
                      >
                        ✅ Ready
                      </motion.span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedSkeleton && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-border bg-muted/30 overflow-hidden shrink-0"
            >
              <ScrollArea className="h-full">
                <div className="p-3 space-y-3">
                  {selectedImgStatus?.status === 'done' && selectedImgStatus.imageUrl && (
                    <div className="rounded-lg overflow-hidden border border-border shadow-sm">
                      <img src={selectedImgStatus.imageUrl} alt={`Slide ${selectedSkeleton.slideNumber}`} className="w-full aspect-video object-cover" />
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold text-foreground mb-1">
                      Slide {selectedSkeleton.slideNumber}: {selectedSkeleton.objective}
                    </h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline" className="text-[8px] h-4">{selectedSkeleton.phaseLabel}</Badge>
                      {selectedSkeleton.activityType && (
                        <Badge variant="outline" className="text-[8px] h-4">{selectedSkeleton.activityType.replace(/_/g, ' ')}</Badge>
                      )}
                      <Badge variant="outline" className="text-[8px] h-4">{Math.round(selectedSkeleton.durationSeconds / 60)}m</Badge>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Cinematic Prompt</span>
                    <p className="text-[10px] text-foreground mt-1 leading-relaxed bg-background p-2 rounded-lg font-mono border border-border">
                      {selectedSkeleton.imagePrompt}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">📐 Content: <strong className="text-foreground">{selectedSkeleton.contentPosition}</strong></div>
                    <div className="flex items-center gap-1.5">🎯 Safe Zone: <strong className="text-foreground">{selectedSkeleton.safeZoneInstruction.slice(0, 60)}…</strong></div>
                    {selectedSkeleton.mascotPosition !== 'hidden' && (
                      <div className="flex items-center gap-1.5">🐧 Pip: <strong className="text-foreground">{selectedSkeleton.mascotPosition} side</strong></div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1 w-full justify-start">
                      <ImageIcon className="h-3 w-3" /> Regenerate Image
                    </Button>
                    <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1 w-full justify-start">
                      <Eye className="h-3 w-3" /> Edit Prompt
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};
