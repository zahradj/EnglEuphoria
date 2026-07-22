
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Gamepad2,
  BookOpen,
  Brain,
  Library,
  LucideIcon
} from "lucide-react";

interface ContentType {
  value: 'worksheet' | 'activity' | 'lesson_plan' | 'quiz' | 'flashcards';
  label: string;
  icon: LucideIcon;
  description: string;
  time: string;
}

interface ContentTypeSelectorProps {
  contentType: string;
  onContentTypeChange: (type: 'worksheet' | 'activity' | 'lesson_plan' | 'quiz' | 'flashcards') => void;
}

export function ContentTypeSelector({ contentType, onContentTypeChange }: ContentTypeSelectorProps) {
  const contentTypes: ContentType[] = [
    { value: 'flashcards', label: 'Flashcards', icon: Library, description: 'Quick vocabulary cards', time: '3s' },
    { value: 'quiz', label: 'Quiz', icon: Brain, description: 'Assessment questions', time: '5s' },
    { value: 'worksheet', label: 'Worksheet', icon: FileText, description: 'Practice exercises', time: '8s' },
    { value: 'activity', label: 'Activity', icon: Gamepad2, description: 'Interactive tasks', time: '12s' },
    { value: 'lesson_plan', label: 'Lesson Plan', icon: BookOpen, description: 'Complete structure', time: '15s' }
  ];

  return (
    <div>
      <Label className="text-sm font-medium">Content Type</Label>
      <div className="grid grid-cols-1 gap-2 mt-2">
        {contentTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <Button
              key={type.value}
              variant={contentType === type.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onContentTypeChange(type.value)}
              className="h-auto p-3 flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <IconComponent size={16} />
                <div className="text-left">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs opacity-70">{type.description}</div>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                ~{type.time}
              </Badge>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
