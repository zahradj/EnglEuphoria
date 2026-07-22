import React, { useRef, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Trash2, GripVertical, Upload, ChevronDown, ChevronUp, Type, ImageIcon, Square, HelpCircle, Link2, FileText, Mic, Puzzle, Video, ArrowDownUp, BookOpen, Bird, Trophy, Backpack, Headphones, PenLine, Sparkles, BookText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Slide, CanvasElementType } from './types';
import { SlidePhase, PHASE_COLORS } from '@/services/slideSkeletonEngine';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InsertAISlideButton } from './InsertAISlideButton';
import type { HomeworkPack, HomeworkTask } from '@/coherence/types';

interface SlideFilmstripProps {
  slides: Slide[];
  selectedSlideId: string | null;
  onSelectSlide: (id: string) => void;
  onAddSlide?: () => void;
  onDeleteSlide?: (id: string) => void;
  onReorderSlides?: (startIndex: number, endIndex: number) => void;
  onImageUploaded?: (slideId: string, imageUrl: string) => void;
  onAddElement?: (type: CanvasElementType) => void;
  onInsertSlide?: (index: number, slide: Slide) => void;
  hub?: string;
  topic?: string;
  canEdit?: boolean;
  /** Homework pack from the coherence engine — rendered as virtual slides under the auto-summary. */
  homeworkPack?: HomeworkPack | null;
}

const MODALITY_ICON: Record<HomeworkTask['modality'], React.ElementType> = {
  speaking: Mic,
  listening: Headphones,
  reading: BookText,
  writing: PenLine,
  mixed: Sparkles,
};

const ELEMENTS: { type: CanvasElementType; icon: React.ElementType; label: string }[] = [
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'image', icon: ImageIcon, label: 'Image' },
  { type: 'shape', icon: Square, label: 'Shape' },
  { type: 'video', icon: Video, label: 'Video' },
  { type: 'audio', icon: Mic, label: 'Audio' },
  { type: 'quiz', icon: HelpCircle, label: 'Quiz' },
  { type: 'matching', icon: Link2, label: 'Match' },
  { type: 'fill-blank', icon: FileText, label: 'Fill' },
  { type: 'drag-drop', icon: Puzzle, label: 'Drag' },
  { type: 'sorting', icon: ArrowDownUp, label: 'Sort' },
  { type: 'sentence-builder', icon: BookOpen, label: 'Sentence' },
  { type: 'character', icon: Bird, label: 'Mascot' },
];

export const SlideFilmstrip: React.FC<SlideFilmstripProps> = ({
  slides,
  selectedSlideId,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
  onReorderSlides,
  onImageUploaded,
  onAddElement,
  onInsertSlide,
  hub = 'playground',
  topic = '',
  canEdit = true,
  homeworkPack,
}) => {
  const { toast } = useToast();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [elementsOpen, setElementsOpen] = useState(false);
  const [homeworkOpen, setHomeworkOpen] = useState(true);

  // Hub accent for the homework section
  const homeworkAccent =
    hub === 'academy' ? '#6B21A8' :
    hub === 'professional' || hub === 'success' ? '#059669' :
    '#FE6A2F';

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    onReorderSlides?.(result.source.index, result.destination.index);
  };

  const handleUploadClick = (slideId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRefs.current[slideId]?.click();
  };

  const handleFileChange = async (slideId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop();
    const filePath = `${slideId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('lesson-slides').upload(filePath, file, { upsert: true });
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return;
    }
    const { data: urlData } = supabase.storage.from('lesson-slides').getPublicUrl(filePath);
    onImageUploaded?.(slideId, urlData.publicUrl);
    toast({ title: 'Image uploaded' });
    if (fileInputRefs.current[slideId]) fileInputRefs.current[slideId]!.value = '';
  };

  return (
    <div className="h-full flex flex-col bg-card/50 border-r border-border" style={{ width: 120 }}>
      <ScrollArea className="flex-1">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="filmstrip">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="p-1 space-y-1"
              >
                {slides.map((slide, index) => (
                  <React.Fragment key={slide.id}>
                    {/* Insert AI Slide button between slides */}
                    {canEdit && onInsertSlide && index > 0 && (
                      <InsertAISlideButton
                        index={index}
                        hub={hub}
                        topic={topic}
                        previousSlide={slides[index - 1]}
                        onInsertSlide={onInsertSlide}
                      />
                    )}
                  <Draggable key={slide.id} draggableId={slide.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          'group relative rounded border transition-all cursor-pointer',
                          selectedSlideId === slide.id
                            ? 'border-primary ring-1 ring-primary/40'
                            : 'border-border hover:border-primary/50',
                          snapshot.isDragging && 'shadow-lg'
                        )}
                        onClick={() => onSelectSlide(slide.id)}
                      >
                        <div className="p-0.5">
                          <div className="flex items-center gap-0.5 mb-0.5">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing text-muted-foreground"
                            >
                              <GripVertical className="h-2.5 w-2.5" />
                            </div>
                            <span className="text-[8px] font-medium text-muted-foreground">{index + 1}</span>
                            {/* PPP stage badge (Magic Deck) — takes priority */}
                            {(() => {
                              const ppp = (slide as any).pppStage as string | undefined;
                              if (ppp) {
                                const pppColors: Record<string, string> = {
                                  'Warm-Up': 'bg-amber-500 text-white',
                                  'Presentation': 'bg-blue-500 text-white',
                                  'Practice': 'bg-emerald-500 text-white',
                                  'Production': 'bg-fuchsia-500 text-white',
                                  'Review': 'bg-sky-500 text-white',
                                };
                                return (
                                  <span
                                    title={`PPP: ${ppp}`}
                                    className={cn(
                                      'text-[6px] px-1 py-0 rounded-full font-bold ml-auto leading-tight',
                                      pppColors[ppp] || 'bg-primary text-primary-foreground'
                                    )}
                                  >
                                    {ppp.split('-')[0]}
                                  </span>
                                );
                              }
                              const phaseKey = (slide as any).phase as SlidePhase | undefined;
                              if (phaseKey && PHASE_COLORS[phaseKey]) {
                                const phaseConfig = PHASE_COLORS[phaseKey];
                                return (
                                  <span className={cn('text-[6px] px-1 py-0 rounded-full font-medium ml-auto leading-tight', phaseConfig.bg, phaseConfig.text)}>
                                    {phaseConfig.label.split(' ')[0]}
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          <div className="aspect-video bg-muted rounded-sm overflow-hidden relative group/thumb">
                            {slide.imageUrl ? (
                              <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-[7px] text-muted-foreground/50">Empty</span>
                              </div>
                            )}
                            <button
                              onClick={(e) => handleUploadClick(slide.id, e)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <Upload className="h-3 w-3 text-white" />
                            </button>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={(el) => { fileInputRefs.current[slide.id] = el; }}
                              onChange={(e) => handleFileChange(slide.id, e)}
                            />
                          </div>
                        </div>
                        {onDeleteSlide && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); onDeleteSlide(slide.id); }}
                          >
                            <Trash2 className="h-2 w-2 text-destructive" />
                          </Button>
                        )}
                      </div>
                    )}
                  </Draggable>
                  </React.Fragment>
                ))}
                {/* Trailing Insert AI button */}
                {canEdit && onInsertSlide && slides.length > 0 && (
                  <InsertAISlideButton
                    index={slides.length}
                    hub={hub}
                    topic={topic}
                    previousSlide={slides[slides.length - 1]}
                    onInsertSlide={onInsertSlide}
                  />
                )}
                {provided.placeholder}

                {/* ─── Auto-Summary virtual card (after last slide) ─── */}
                {slides.length > 0 && (
                  <div
                    className="mt-2 rounded border-2 border-dashed p-1"
                    style={{ borderColor: `${homeworkAccent}66`, background: `${homeworkAccent}0d` }}
                    title="Auto-Summary (end of lesson)"
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <Trophy className="h-2.5 w-2.5" style={{ color: homeworkAccent }} />
                      <span className="text-[8px] font-bold uppercase tracking-wide" style={{ color: homeworkAccent }}>
                        Auto-Summary
                      </span>
                    </div>
                    <div
                      className="aspect-video rounded-sm flex flex-col items-center justify-center gap-0.5"
                      style={{ background: `${homeworkAccent}1a` }}
                    >
                      <Trophy className="h-4 w-4" style={{ color: homeworkAccent }} />
                      <span className="text-[7px] font-semibold" style={{ color: homeworkAccent }}>
                        XP · Stats · Claim
                      </span>
                    </div>
                  </div>
                )}

                {/* ─── Homework Section (virtual slides under auto-summary) ─── */}
                {homeworkPack && homeworkPack.tasks.length > 0 && (
                  <Collapsible open={homeworkOpen} onOpenChange={setHomeworkOpen} className="mt-1">
                    <CollapsibleTrigger asChild>
                      <button
                        className="w-full flex items-center justify-between gap-1 px-1 py-1 rounded text-[8px] font-bold uppercase tracking-wide"
                        style={{ background: `${homeworkAccent}1a`, color: homeworkAccent }}
                        title="Homework Pack — appears under the Auto-Summary"
                      >
                        <span className="flex items-center gap-1">
                          <Backpack className="h-2.5 w-2.5" /> Homework · {homeworkPack.total_minutes}m
                        </span>
                        {homeworkOpen ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronUp className="h-2.5 w-2.5" />}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-1 mt-1">
                        {homeworkPack.tasks.map((task, i) => {
                          const Icon = MODALITY_ICON[task.modality] ?? Sparkles;
                          return (
                            <div
                              key={task.id}
                              className="rounded border p-1"
                              style={{ borderColor: `${homeworkAccent}66`, background: `${homeworkAccent}08` }}
                              title={task.prompt}
                            >
                              <div className="flex items-center gap-0.5 mb-0.5">
                                <span
                                  className="text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center text-white"
                                  style={{ background: homeworkAccent }}
                                >
                                  {i + 1}
                                </span>
                                <Icon className="h-2.5 w-2.5" style={{ color: homeworkAccent }} />
                                <span className="text-[7px] opacity-70 ml-auto">~{task.estimated_minutes}m</span>
                              </div>
                              <div
                                className="aspect-video rounded-sm flex items-center justify-center p-1"
                                style={{ background: `${homeworkAccent}14` }}
                              >
                                <span className="text-[7px] leading-tight text-center line-clamp-3" style={{ color: homeworkAccent }}>
                                  {task.type.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <p className="text-[7px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                                {task.prompt}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ScrollArea>

      {/* Add Slide button */}
        {onAddSlide && (
          <div className="px-1 py-1 border-t border-border">
            <Button onClick={onAddSlide} size="sm" variant="outline" className="w-full h-6 text-[9px] gap-0.5">
              <Plus className="h-2.5 w-2.5" /> Slide
            </Button>
          </div>
        )}

      {/* Merged Element Toolbar */}
      {onAddElement && (
        <Collapsible open={elementsOpen} onOpenChange={setElementsOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-2 py-1 border-t border-border text-[9px] font-semibold text-muted-foreground uppercase tracking-wider hover:bg-accent/20 transition-colors">
              Elements
              {elementsOpen ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronUp className="h-2.5 w-2.5" />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-3 gap-0.5 p-1 border-t border-border">
              {ELEMENTS.map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full flex flex-col gap-0 px-0 hover:bg-primary/10"
                  onClick={() => onAddElement(type)}
                  title={label}
                >
                  <Icon className="h-3 w-3" />
                  <span className="text-[7px] leading-none">{label}</span>
                </Button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
