import React from 'react';
import { Type, ImageIcon, Square, HelpCircle, Link2, FileText, Mic, Puzzle, Video, ArrowDownUp, BookOpen, Bird } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CanvasElementType } from '../types';

interface ElementToolbarProps {
  onAddElement: (type: CanvasElementType) => void;
}

const ELEMENTS: { type: CanvasElementType; label: string; icon: React.ElementType; group: string }[] = [
  { type: 'text', label: 'Text', icon: Type, group: 'basic' },
  { type: 'image', label: 'Image', icon: ImageIcon, group: 'basic' },
  { type: 'shape', label: 'Shape', icon: Square, group: 'basic' },
  { type: 'video', label: 'Video', icon: Video, group: 'basic' },
  { type: 'audio', label: 'Audio', icon: Mic, group: 'basic' },
  { type: 'quiz', label: 'Quiz', icon: HelpCircle, group: 'activity' },
  { type: 'matching', label: 'Match', icon: Link2, group: 'activity' },
  { type: 'fill-blank', label: 'Fill', icon: FileText, group: 'activity' },
  { type: 'drag-drop', label: 'Drag', icon: Puzzle, group: 'activity' },
  { type: 'sorting', label: 'Sort', icon: ArrowDownUp, group: 'activity' },
  { type: 'sentence-builder', label: 'Sentence', icon: BookOpen, group: 'activity' },
  { type: 'character', label: 'Mascot', icon: Bird, group: 'media' },
];

export const ElementToolbar: React.FC<ElementToolbarProps> = ({ onAddElement }) => {
  const basicElements = ELEMENTS.filter(e => e.group === 'basic');
  const activityElements = ELEMENTS.filter(e => e.group === 'activity');
  const mediaElements = ELEMENTS.filter(e => e.group === 'media');

  return (
    <div className="space-y-2 p-1.5">
      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Elements</p>
      <div className="grid grid-cols-2 gap-1">
        {basicElements.map(({ type, label, icon: Icon }) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className="h-9 w-full flex flex-col gap-0 px-1 hover:bg-primary/10"
            onClick={() => onAddElement(type)}
            title={label}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="text-[8px] leading-none">{label}</span>
          </Button>
        ))}
      </div>

      <div className="border-t border-border pt-1">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider text-center mb-1">Games</p>
        <div className="grid grid-cols-2 gap-1">
          {activityElements.map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className="h-9 w-full flex flex-col gap-0 px-1 hover:bg-accent/30"
              onClick={() => onAddElement(type)}
              title={label}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="text-[8px] leading-none">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {mediaElements.length > 0 && (
        <div className="border-t border-border pt-1">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider text-center mb-1">Characters</p>
          <div className="grid grid-cols-2 gap-1">
            {mediaElements.map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                className="h-9 w-full flex flex-col gap-0 px-1 hover:bg-accent/30"
                onClick={() => onAddElement(type)}
                title={label}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[8px] leading-none">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
