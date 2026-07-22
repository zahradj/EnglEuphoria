import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  ArrowLeft, Save, Eye, CheckCircle, XCircle, 
  Loader2, GripVertical, Plus, Trash2
} from 'lucide-react';
import { SlideEditor } from './SlideEditor';
import type { PlaygroundUnit, PlaygroundUnitContent } from '@/playground-blueprint/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PlaygroundLessonPlayer } from '@/components/playground-player/PlaygroundLessonPlayer';
import { buildPlaygroundUnit } from '@/playground-blueprint/lessonBuilder';
import { CreatorShell } from '@/pages/playground-creator/CreatorShell';

interface LessonEditorPageProps {
  lessonId: string;
  onBack: () => void;
}

export interface LessonSlide {
  id: string;
  slide_type: string;
  title?: string;
  content: any;
  slide_number: number;
}

interface CurriculumLesson {
  id: string;
  title: string;
  description: string | null;
  content: any;
  is_published: boolean;
  target_system: string;
  difficulty_level: string;
  slot_cefr_level?: string | null;
}

export const LessonEditorPage: React.FC<LessonEditorPageProps> = ({ lessonId, onBack }) => {
  const queryClient = useQueryClient();
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [localSlides, setLocalSlides] = useState<LessonSlide[]>([]);
  const [localUnit, setLocalUnit] = useState<PlaygroundUnitContent | undefined>(undefined);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch lesson data
  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson-editor', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      return data as CurriculumLesson;
    },
  });

  // Initialize local state from lesson content
  useEffect(() => {
    if (lesson?.content?.slides) {
      const slidesWithIds = lesson.content.slides.map((slide: any, index: number) => ({
        ...slide,
        id: slide.id || `slide-${index}`,
        slide_number: index + 1,
      }));
      setLocalSlides(slidesWithIds);
    }
    if (lesson?.content?.playground_unit) {
      setLocalUnit(lesson.content.playground_unit as PlaygroundUnitContent);
    }
  }, [lesson]);

  const isPlayground = lesson?.target_system === 'kids';

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const updatedContent = {
        ...lesson?.content,
        slides: localSlides,
        ...(isPlayground && localUnit ? { playground_unit: localUnit } : {}),
      };

      const { error } = await supabase
        .from('curriculum_lessons')
        .update({ content: updatedContent })
        .eq('id', lessonId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-editor', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-lessons-library'] });
      setHasChanges(false);
      toast.success('Lesson saved successfully!');
    },
    onError: () => {
      toast.error('Failed to save lesson');
    },
  });

  // Toggle publish mutation
  const togglePublishMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('curriculum_lessons')
        .update({ is_published: !lesson?.is_published })
        .eq('id', lessonId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-editor', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-lessons-library'] });
      toast.success(lesson?.is_published ? 'Lesson unpublished' : 'Lesson published!');
    },
    onError: () => {
      toast.error('Failed to update publish status');
    },
  });

  const handleSlideUpdate = (index: number, updatedSlide: LessonSlide) => {
    const newSlides = [...localSlides];
    newSlides[index] = updatedSlide;
    setLocalSlides(newSlides);
    setHasChanges(true);
  };

  const handleAddSlide = () => {
    const newSlide: LessonSlide = {
      id: `slide-${Date.now()}`,
      slide_type: 'content',
      title: 'New Slide',
      content: {},
      slide_number: localSlides.length + 1,
    };
    setLocalSlides([...localSlides, newSlide]);
    setSelectedSlideIndex(localSlides.length);
    setHasChanges(true);
  };

  const handleDeleteSlide = (index: number) => {
    if (localSlides.length <= 1) {
      toast.error('Cannot delete the last slide');
      return;
    }
    const newSlides = localSlides.filter((_, i) => i !== index);
    // Renumber slides
    const renumberedSlides = newSlides.map((slide, i) => ({
      ...slide,
      slide_number: i + 1,
    }));
    setLocalSlides(renumberedSlides);
    if (selectedSlideIndex >= newSlides.length) {
      setSelectedSlideIndex(Math.max(0, newSlides.length - 1));
    }
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const getSlideTypeColor = (type: string) => {
    switch (type) {
      case 'title': return 'bg-blue-100 text-blue-700';
      case 'vocabulary': return 'bg-green-100 text-green-700';
      case 'grammar': return 'bg-purple-100 text-purple-700';
      case 'practice': return 'bg-orange-100 text-orange-700';
      case 'quiz': return 'bg-red-100 text-red-700';
      case 'dialogue': return 'bg-cyan-100 text-cyan-700';
      case 'speaking': return 'bg-pink-100 text-pink-700';
      case 'game': return 'bg-yellow-100 text-yellow-700';
      case 'production': return 'bg-indigo-100 text-indigo-700';
      case 'summary': return 'bg-slate-100 text-slate-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lesson not found</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
          <div>
            <h1 className="text-xl font-bold">{lesson.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{lesson.target_system}</Badge>
              <Badge variant="outline">{lesson.difficulty_level}</Badge>
              {lesson.is_published ? (
                <Badge className="bg-green-100 text-green-700">Published</Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Unsaved changes
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview pages
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => togglePublishMutation.mutate()}
            disabled={togglePublishMutation.isPending}
          >
            {lesson.is_published ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Unpublish
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Publish
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {isPlayground ? (
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 h-full overflow-hidden">
              <CreatorShell
                initialUnit={(() => {
                  if (!localUnit) return null;
                  try {
                    return buildPlaygroundUnit(localUnit);
                  } catch {
                    return localUnit as PlaygroundUnit;
                  }
                })()}
                onUnitChange={(next) => {
                  setLocalUnit(next as PlaygroundUnitContent);
                  setHasChanges(true);
                }}
                prefill={{
                  lessonId,
                  topic: lesson.title,
                  cefr: lesson.slot_cefr_level || lesson.difficulty_level || 'Pre-A1',
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Slide Thumbnails Panel */}
            <Card className="w-64 flex-shrink-0">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Slides ({localSlides.length})</CardTitle>
                  <Button variant="ghost" size="icon" onClick={handleAddSlide}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="p-2 space-y-2">
                  {localSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      onClick={() => setSelectedSlideIndex(index)}
                      className={`
                        group relative p-3 rounded-lg border cursor-pointer transition-all
                        ${selectedSlideIndex === index
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">#{slide.slide_number}</span>
                            <Badge className={`text-[10px] ${getSlideTypeColor(slide.slide_type)}`}>
                              {slide.slide_type}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium truncate mt-1">
                            {slide.title || `Slide ${slide.slide_number}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlide(index);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Slide Editor Panel */}
            <Card className="flex-1 overflow-hidden">
              <CardContent className="p-6 h-full overflow-y-auto space-y-6">
                {localSlides.length > 0 && selectedSlideIndex < localSlides.length ? (
                  <SlideEditor
                    slide={localSlides[selectedSlideIndex]}
                    onUpdate={(updated) => handleSlideUpdate(selectedSlideIndex, updated)}
                    system={lesson.target_system}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No slides to edit. Click + to add a slide.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>


      {/* Preview dialog — renders the lesson exactly as a student sees it. */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-none w-screen h-screen p-0 m-0 border-0 rounded-none translate-x-0 translate-y-0 left-0 top-0 bg-[#FEFBDD] overflow-auto">
          {isPlayground ? (
            (() => {
              let unit = null;
              try { if (localUnit) unit = buildPlaygroundUnit(localUnit); } catch { /* invalid unit — fall back */ }
              // Honor the actual lesson_number being edited so preview matches.
              const activeLessonNumber =
                (localUnit?.lessons?.[0]?.lesson_number as 1|2|3|4|5|6|7|undefined) ?? 1;
              return (
                <PlaygroundLessonPlayer
                  unit={unit}
                  lessonNumber={activeLessonNumber}
                  title={lesson.title}
                  onExit={() => setPreviewOpen(false)}
                />
              );
            })()

          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-lg font-semibold">Preview for this hub is rendered in the live classroom.</p>
              <p className="text-sm mt-2">Save and open the lesson from the student trail to see the slides.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
