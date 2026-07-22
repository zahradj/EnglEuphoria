import React, { useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Trash2, GripVertical, Image, Video, HelpCircle, Pencil, BarChart3, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Slide, SlideType } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SlideOrganizerProps {
  slides: Slide[];
  selectedSlideId: string | null;
  onSelectSlide: (id: string) => void;
  onAddSlide: () => void;
  onDeleteSlide: (id: string) => void;
  onReorderSlides: (startIndex: number, endIndex: number) => void;
  onImageUploaded?: (slideId: string, imageUrl: string) => void;
}

const slideTypeIcons: Record<SlideType, React.ElementType> = {
  image: Image,
  video: Video,
  quiz: HelpCircle,
  poll: BarChart3,
  draw: Pencil,
};

export const SlideOrganizer: React.FC<SlideOrganizerProps> = ({
  slides,
  selectedSlideId,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
  onReorderSlides,
  onImageUploaded,
}) => {
  const { toast } = useToast();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    onReorderSlides(result.source.index, result.destination.index);
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

    const { error } = await supabase.storage
      .from('lesson-slides')
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return;
    }

    const { data: urlData } = supabase.storage
      .from('lesson-slides')
      .getPublicUrl(filePath);

    onImageUploaded?.(slideId, urlData.publicUrl);
    toast({ title: 'Image uploaded', description: 'Slide background updated.' });

    // Reset input
    if (fileInputRefs.current[slideId]) {
      fileInputRefs.current[slideId]!.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm mb-2">Slides</h3>
        <Button onClick={onAddSlide} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="slides">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="p-2 space-y-2"
              >
                {slides.map((slide, index) => {
                  const TypeIcon = slideTypeIcons[slide.type];
                  return (
                    <Draggable key={slide.id} draggableId={slide.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "group relative rounded-lg border-2 transition-all cursor-pointer",
                            selectedSlideId === slide.id
                              ? "border-primary bg-primary/10"
                              : "border-border bg-background hover:border-primary/50",
                            snapshot.isDragging && "shadow-lg"
                          )}
                          onClick={() => onSelectSlide(slide.id)}
                        >
                          <div className="p-2">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                              >
                                <GripVertical className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-[10px] font-medium text-muted-foreground">
                                {index + 1}
                              </span>
                              <TypeIcon className="h-3 w-3 text-muted-foreground ml-auto" />
                            </div>

                            {/* Thumbnail */}
                            <div className="aspect-video bg-muted rounded overflow-hidden mb-1.5 relative group/thumb">
                              {slide.imageUrl ? (
                                <img
                                  src={slide.imageUrl}
                                  alt={`Slide ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <TypeIcon className="h-5 w-5 text-muted-foreground/50" />
                                </div>
                              )}
                              {/* Upload overlay */}
                              <button
                                onClick={(e) => handleUploadClick(slide.id, e)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center"
                              >
                                <Upload className="h-4 w-4 text-white" />
                              </button>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={(el) => { fileInputRefs.current[slide.id] = el; }}
                                onChange={(e) => handleFileChange(slide.id, e)}
                              />
                            </div>

                            {slide.title && (
                              <p className="text-[10px] text-foreground truncate">
                                {slide.title}
                              </p>
                            )}
                          </div>

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSlide(slide.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ScrollArea>
    </div>
  );
};
