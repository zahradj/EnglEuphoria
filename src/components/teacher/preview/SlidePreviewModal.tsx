import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { BookOpen, MessageSquare, Mic, Target, Image as ImageIcon, PlayCircle } from 'lucide-react';

interface SlidePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slides: any[];
  lessonTitle: string;
}

export const SlidePreviewModal: React.FC<SlidePreviewModalProps> = ({
  open,
  onOpenChange,
  slides,
  lessonTitle,
}) => {
  const getSlideIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      introduction: BookOpen,
      conversation: MessageSquare,
      speaking: Mic,
      listening: PlayCircle,
      vocabulary: Target,
      image: ImageIcon,
    };
    const Icon = iconMap[type] || BookOpen;
    return <Icon className="h-4 w-4" />;
  };

  const getSlideTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      introduction: 'bg-blue-100 text-blue-800 border-blue-200',
      conversation: 'bg-purple-100 text-purple-800 border-purple-200',
      speaking: 'bg-green-100 text-green-800 border-green-200',
      listening: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      vocabulary: 'bg-orange-100 text-orange-800 border-orange-200',
      image: 'bg-pink-100 text-pink-800 border-pink-200',
      mcq: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      drag_drop: 'bg-teal-100 text-teal-800 border-teal-200',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSlidePreview = (slide: any, index: number) => {
    const type = slide.type || 'content';
    const prompt = slide.prompt || slide.question || slide.instruction || 'Slide Content';
    
    return (
      <Card key={index} className="p-2 sm:p-3 hover:border-primary/50 transition-colors">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-mono font-semibold text-primary">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Badge variant="outline" className={`text-[10px] sm:text-xs ${getSlideTypeColor(type)}`}>
                <span className="mr-0.5 sm:mr-1">{getSlideIcon(type)}</span>
                <span className="truncate">{type}</span>
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-foreground line-clamp-2">
              {prompt}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Slide Preview: {lessonTitle}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Preview all {slides.length} slides in this lesson
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] sm:h-[500px] pr-2 sm:pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {slides.map((slide, index) => getSlidePreview(slide, index))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
