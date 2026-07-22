import React, { useState, KeyboardEvent } from 'react';
import { X, Plus, BookOpen, Tag } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slide } from './types';

interface TeacherGuideProps {
  slide: Slide | null;
  onUpdateSlide: (updates: Partial<Slide>) => void;
}

export const TeacherGuide: React.FC<TeacherGuideProps> = ({ slide, onUpdateSlide }) => {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim() && slide) {
      const updatedKeywords = [...(slide.keywords || []), newKeyword.trim()];
      onUpdateSlide({ keywords: updatedKeywords });
      setNewKeyword('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    if (slide) {
      const updatedKeywords = slide.keywords.filter((k) => k !== keywordToRemove);
      onUpdateSlide({ keywords: updatedKeywords });
    }
  };

  if (!slide) {
    return (
      <div className="h-full flex items-center justify-center bg-card border-l border-border">
        <div className="text-center text-muted-foreground p-6">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a slide to add teacher notes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Teacher's Guide
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Notes visible only to the teacher
        </p>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-auto">
        {/* PPP Stage Badge */}
        {slide.pppStage && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">PPP Stage:</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
              {slide.pppStage}
            </span>
          </div>
        )}

        {/* Structured Teacher Notes (Magic Deck) */}
        {slide.teacherNotesStructured ? (
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <span>📋 Presenter Notes (Live Class)</span>
            </Label>

            {slide.teacherNotesStructured.script && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-primary mb-1">🎤 Script</h4>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {slide.teacherNotesStructured.script}
                </p>
              </div>
            )}

            {slide.teacherNotesStructured.ccq && slide.teacherNotesStructured.ccq.length > 0 && (
              <div className="rounded-lg border border-border bg-blue-500/5 p-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">❓ CCQs</h4>
                <ul className="text-sm text-foreground space-y-1 list-disc pl-5">
                  {slide.teacherNotesStructured.ccq.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            {slide.teacherNotesStructured.step_down && (
              <div className="rounded-lg border border-border bg-amber-500/5 p-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">⬇️ Step-Down (Struggling)</h4>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {slide.teacherNotesStructured.step_down}
                </p>
              </div>
            )}

            {slide.teacherNotesStructured.step_up && (
              <div className="rounded-lg border border-border bg-emerald-500/5 p-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">⬆️ Step-Up (Fast Finisher)</h4>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {slide.teacherNotesStructured.step_up}
                </p>
              </div>
            )}

            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">Edit raw notes</summary>
              <Textarea
                value={slide.teacherNotes || ''}
                onChange={(e) => onUpdateSlide({ teacherNotes: e.target.value })}
                className="min-h-[120px] resize-none mt-2"
              />
            </details>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="teacher-notes" className="flex items-center gap-2">
              <span>Instructions & Notes</span>
            </Label>
            <Textarea
              id="teacher-notes"
              value={slide.teacherNotes || ''}
              onChange={(e) => onUpdateSlide({ teacherNotes: e.target.value })}
              placeholder="Example: Ask the student to point to the red apple. Wait for response, then praise and move on..."
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Write prompts, questions, or reminders for teaching this slide
            </p>
          </div>
        )}

        {/* Keywords */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>Vocabulary Keywords</span>
          </Label>
          
          <div className="flex gap-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add keyword..."
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddKeyword}
              disabled={!newKeyword.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {slide.keywords?.map((keyword) => (
              <Badge
                key={keyword}
                variant="secondary"
                className="pl-3 pr-1 py-1 flex items-center gap-1"
              >
                <span>{keyword}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveKeyword(keyword)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {(!slide.keywords || slide.keywords.length === 0) && (
              <p className="text-xs text-muted-foreground italic">
                No keywords added yet
              </p>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <h4 className="text-sm font-medium text-foreground mb-2">
            💡 Teaching Tips
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use clear, simple language for instructions</li>
            <li>• Include timing cues (e.g., "Wait 5 seconds")</li>
            <li>• Add praise phrases to use on success</li>
            <li>• Note common mistakes to watch for</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
